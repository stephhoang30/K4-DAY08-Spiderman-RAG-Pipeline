"""
Task 8 — PageIndex Vectorless RAG.

Đăng ký tài khoản tại: https://pageindex.ai/
SDK & sample code: https://github.com/VectifyAI/PageIndex

PageIndex cho phép RAG mà không cần vector store — sử dụng
structural understanding của document thay vì embedding.

Cài đặt:
    pip install pageindex

Hướng dẫn:
    1. Đăng ký account tại pageindex.ai
    2. Lấy API key
    3. Upload documents
    4. Query sử dụng PageIndex API

Lưu ý: API `/retrieval` của PageIndex hiện đã deprecated (vẫn hoạt động, nhưng response
có field "deprecation" cảnh báo) và trả kết quả trong "retrieved_nodes" — mỗi node có
"relevant_contents": list[list[{section_title, relevant_content}]]. In response thật ra
(json.dumps(...)) trước khi viết logic parse, đừng đoán schema từ ví dụ code cũ.

Thiết kế:
    PageIndex chỉ nhận PDF, không nhận .md — nên toàn bộ markdown trong
    data/standardized/ được gộp thành 1 file PDF duy nhất (giữ nguyên "bức tranh
    toàn cảnh" mà Task 8 cần, khác với việc chunk nhỏ ở Task 4). doc_id sau khi
    upload được lưu lại trong DOC_REGISTRY_FILE để các lần chạy sau không phải
    upload lại (PageIndex xử lý tree generation tốn thời gian).
"""

import json
import time
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

PAGEINDEX_API_KEY = os.getenv("PAGEINDEX_API_KEY", "")
STANDARDIZED_DIR = Path(__file__).parent.parent / "data" / "standardized"
PAGEINDEX_DIR = Path(__file__).parent.parent / "data" / "pageindex"
COMBINED_PDF_PATH = PAGEINDEX_DIR / "ecommerce_support_docs.pdf"
DOC_REGISTRY_FILE = PAGEINDEX_DIR / "doc_registry.json"

# Font có bảng Unicode đủ rộng để render dấu tiếng Việt. Font mặc định của fpdf2
# (Helvetica) chỉ hỗ trợ Latin-1 nên sẽ ném FPDFUnicodeEncodingException ngay ký tự
# có dấu đầu tiên. Danh sách này giống src/task1_collect_legal_docs.py — phủ cả ba
# hệ điều hành, vì bản cũ chỉ có đường dẫn Linux nên máy macOS luôn rơi vào Helvetica.
_UNICODE_FONT_CANDIDATES = [
    "/System/Library/Fonts/Supplemental/Arial Unicode.ttf",  # macOS
    "/Library/Fonts/Arial Unicode.ttf",                      # macOS (bản cũ)
    "C:/Windows/Fonts/arial.ttf",                            # Windows
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",       # Linux
    "/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf",   # Linux
]


def _build_combined_pdf() -> Path:
    """
    Gộp toàn bộ markdown trong data/standardized/ (legal + news) thành 1 PDF
    duy nhất — PageIndex cần PDF đầu vào và tận dụng đúng cấu trúc heading/mục
    (#, ##...) để build tree, nên giữ nguyên nội dung .md, không chunk.
    """
    from fpdf import FPDF

    PAGEINDEX_DIR.mkdir(parents=True, exist_ok=True)

    pdf = FPDF()
    # DejaVu Sans có bảng Unicode đủ rộng để render dấu tiếng Việt — font mặc
    # định (Helvetica) của fpdf2 chỉ hỗ trợ Latin-1, sẽ mất dấu.
    font_path = next((p for p in _UNICODE_FONT_CANDIDATES if Path(p).exists()), None)
    if font_path:
        pdf.add_font("Body", "", font_path)
        pdf.set_font("Body", size=11)
    else:
        # Đừng rơi về Helvetica: nó không render được dấu tiếng Việt, fpdf2 sẽ ném
        # FPDFUnicodeEncodingException ở giữa vòng lặp với thông báo khó truy ngược.
        # Báo lỗi ngay tại đây, kèm cách sửa.
        raise FileNotFoundError(
            "Không tìm thấy font Unicode để xuất PDF tiếng Việt cho PageIndex.\n"
            "Đã thử:\n  " + "\n  ".join(_UNICODE_FONT_CANDIDATES) + "\n"
            "Cách sửa: tải DejaVuSans.ttf về máy rồi thêm đường dẫn vào "
            "_UNICODE_FONT_CANDIDATES."
        )

    for md_file in sorted(STANDARDIZED_DIR.rglob("*.md")):
        text = md_file.read_text(encoding="utf-8")
        pdf.add_page()
        pdf.multi_cell(0, 6, f"=== {md_file.parent.name}/{md_file.name} ===\n\n{text}")

    pdf.output(str(COMBINED_PDF_PATH))
    return COMBINED_PDF_PATH


def _load_registry() -> dict:
    if DOC_REGISTRY_FILE.exists():
        return json.loads(DOC_REGISTRY_FILE.read_text(encoding="utf-8"))
    return {}


def _save_registry(registry: dict):
    PAGEINDEX_DIR.mkdir(parents=True, exist_ok=True)
    DOC_REGISTRY_FILE.write_text(json.dumps(registry, indent=2, ensure_ascii=False), encoding="utf-8")


def _get_client():
    from pageindex import PageIndexClient
    if not PAGEINDEX_API_KEY:
        raise RuntimeError("PAGEINDEX_API_KEY chưa được set trong .env")
    return PageIndexClient(api_key=PAGEINDEX_API_KEY)


def upload_documents() -> str:
    """
    Gộp data/standardized/ thành 1 PDF và upload lên PageIndex.
    Nếu đã upload trước đó (doc_id có trong registry) thì bỏ qua, tái sử dụng.

    Returns:
        doc_id của document đã upload trên PageIndex.
    """
    registry = _load_registry()
    if "doc_id" in registry:
        print(f"  ✓ Đã có doc_id trong registry, bỏ qua upload: {registry['doc_id']}")
        return registry["doc_id"]

    client = _get_client()

    pdf_path = _build_combined_pdf()
    print(f"  ✓ Gộp markdown thành PDF: {pdf_path.name}")

    doc_id = client.submit_document(str(pdf_path))["doc_id"]
    print(f"  ✓ Uploaded -> doc_id={doc_id}")

    print("  … Đang chờ PageIndex xử lý tree generation (có thể mất vài phút)")
    elapsed, timeout, poll_interval = 0, 300, 5
    while not client.is_retrieval_ready(doc_id) and elapsed < timeout:
        time.sleep(poll_interval)
        elapsed += poll_interval
    if elapsed >= timeout:
        print("  ⚠ Timeout chờ retrieval_ready — doc_id vẫn được lưu, thử lại pageindex_search() sau.")

    registry["doc_id"] = doc_id
    _save_registry(registry)
    return doc_id


def pageindex_search(query: str, top_k: int = 5) -> list[dict]:
    """
    Vectorless retrieval sử dụng PageIndex.
    Dùng làm fallback khi hybrid search không có kết quả tốt.

    Args:
        query: Câu truy vấn
        top_k: Số lượng kết quả tối đa

    Returns:
        List of {
            'content': str,
            'score': float,
            'metadata': dict,
            'source': 'pageindex'   # Đánh dấu nguồn retrieval
        }
    """
    client = _get_client()

    registry = _load_registry()
    doc_id = registry.get("doc_id") or upload_documents()

    retrieval_id = client.submit_query(doc_id=doc_id, query=query)["retrieval_id"]

    retrieval = client.get_retrieval(retrieval_id)
    elapsed, timeout, poll_interval = 0, 120, 3
    while retrieval.get("status") not in ("completed", "failed") and elapsed < timeout:
        time.sleep(poll_interval)
        elapsed += poll_interval
        retrieval = client.get_retrieval(retrieval_id)

    if retrieval.get("status") != "completed":
        print(f"  ⚠ PageIndex retrieval không hoàn tất (status={retrieval.get('status')})")
        return []

    results = []
    rank = 0
    for node in retrieval.get("retrieved_nodes", []):
        for group in node.get("relevant_contents", []):
            for item in group:
                rank += 1
                results.append({
                    "content": item.get("relevant_content", ""),
                    "score": round(1.0 / rank, 4),  # PageIndex không trả score — gán theo rank
                    "metadata": {"section": item.get("section_title")},
                    "source": "pageindex",
                })

    return results[:top_k]


if __name__ == "__main__":
    if not PAGEINDEX_API_KEY:
        print("⚠ Hãy set PAGEINDEX_API_KEY trong file .env")
        print("  Đăng ký tại: https://pageindex.ai/")
    else:
        print("Uploading documents...")
        upload_documents()

        print("\nTest query:")
        results = pageindex_search("danh sách sản phẩm cấm đăng bán", top_k=3)
        for r in results:
            print(f"[{r['score']:.3f}] {r['content'][:100]}...")
