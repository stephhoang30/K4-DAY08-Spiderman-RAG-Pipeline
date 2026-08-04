"""
Task 1 — Thu thập văn bản chính sách thương mại điện tử / hỗ trợ khách hàng.

Nguồn: trung tâm trợ giúp công khai của Shopee Vietnam (help.shopee.vn).
robots.txt cho phép crawl (`User-Agent:* / Allow: /`).

Các trang chính sách của Shopee là HTML, không có sẵn bản PDF. Theo gợi ý trong đề
bài, ở đây tải nội dung về rồi xuất ra PDF bằng fpdf2 để có file gốc dạng PDF trong
data/landing/legal/ đúng như Task 1 yêu cầu.

Mỗi tài liệu được gắn metadata `customer_role` (buyer/seller/both) — yêu cầu riêng của
K4 Variant kế thừa từ Lab 07, cần cho benchmark query dùng metadata_filter. Vì PDF không
tiện nhúng metadata, thông tin này được ghi kèm ra `_metadata.json` cùng thư mục.

Chạy:
    python -m src.task1_collect_legal_docs
"""

import json
from datetime import datetime, timezone
from pathlib import Path

from fpdf import FPDF

from ._crawl_utils import fetch_pages_sync

DATA_DIR = Path(__file__).parent.parent / "data" / "landing" / "legal"

# Font Unicode để PDF hiển thị được dấu tiếng Việt. Font mặc định của fpdf2 (Helvetica)
# chỉ hỗ trợ latin-1 nên sẽ làm hỏng chữ có dấu.
FONT_CANDIDATES = [
    "/System/Library/Fonts/Supplemental/Arial Unicode.ttf",  # macOS
    "/Library/Fonts/Arial Unicode.ttf",                      # macOS (bản cũ)
    "C:/Windows/Fonts/arial.ttf",                            # Windows
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",       # Linux
]

# 5 văn bản chính sách, phủ đủ 4 mảng đề bài yêu cầu:
# đổi trả/hoàn tiền, vận chuyển, quyền riêng tư, quy định người bán.
LEGAL_DOCS = [
    {
        "url": "https://help.shopee.vn/portal/4/article/77251",
        "filename": "chinh-sach-tra-hang-hoan-tien-shopee.pdf",
        "customer_role": "buyer",
    },
    {
        "url": "https://help.shopee.vn/portal/4/article/77244",
        "filename": "chinh-sach-bao-mat-shopee.pdf",
        "customer_role": "both",
    },
    {
        "url": "https://help.shopee.vn/portal/4/article/77246",
        "filename": "quy-dinh-dang-ban-san-pham-shopee.pdf",
        "customer_role": "seller",
    },
    {
        "url": "https://help.shopee.vn/portal/4/article/77247",
        "filename": "chinh-sach-cam-han-che-san-pham-shopee.pdf",
        "customer_role": "seller",
    },
    {
        "url": "https://help.shopee.vn/portal/4/article/77250",
        "filename": "chinh-sach-van-chuyen-shopee.pdf",
        "customer_role": "both",
    },
]


def setup_directory():
    """Tạo thư mục data/landing/legal/ nếu chưa có."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    print(f"✓ Thư mục đã sẵn sàng: {DATA_DIR}")


def find_unicode_font() -> str:
    """Tìm một font TTF có dấu tiếng Việt trên máy."""
    for path in FONT_CANDIDATES:
        if Path(path).exists():
            return path
    raise FileNotFoundError(
        "Không tìm thấy font Unicode để xuất PDF tiếng Việt.\n"
        "Đã thử:\n  " + "\n  ".join(FONT_CANDIDATES) + "\n"
        "Cách sửa: tải DejaVuSans.ttf về máy rồi thêm đường dẫn vào FONT_CANDIDATES."
    )


def write_pdf(title: str, body_markdown: str, source_url: str, out_path: Path):
    """Xuất nội dung đã tải thành file PDF đọc được."""
    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()
    pdf.add_font("uni", "", find_unicode_font())

    # LƯU Ý: luôn truyền new_x="LMARGIN", new_y="NEXT". Mặc định fpdf2 dời con trỏ x
    # sang PHẢI ô vừa vẽ, nên lần multi_cell kế tiếp chỉ còn bề rộng ~0 và ném
    # FPDFException("Not enough horizontal space to render a single character").
    pdf.set_font("uni", size=15)
    pdf.multi_cell(0, 9, title, new_x="LMARGIN", new_y="NEXT")
    pdf.ln(2)

    pdf.set_font("uni", size=8)
    pdf.multi_cell(
        0, 5,
        f"Nguồn: {source_url}\nTải ngày: {datetime.now(timezone.utc).date().isoformat()}",
        new_x="LMARGIN", new_y="NEXT",
    )
    pdf.ln(4)

    pdf.set_font("uni", size=11)
    for line in body_markdown.splitlines():
        line = line.strip()
        if not line:
            pdf.ln(3)
            continue
        # Bỏ ký hiệu markdown để PDF đọc như văn bản thường
        line = line.lstrip("#").replace("**", "").strip()
        pdf.multi_cell(0, 6, line, new_x="LMARGIN", new_y="NEXT")

    pdf.output(str(out_path))


def collect_all():
    """Tải toàn bộ văn bản chính sách và lưu thành PDF."""
    print("=" * 60)
    print("Task 1: Thu thập văn bản chính sách (Shopee Vietnam)")
    print("=" * 60)

    setup_directory()
    print(f"\nĐang tải {len(LEGAL_DOCS)} tài liệu...")

    pages = fetch_pages_sync([d["url"] for d in LEGAL_DOCS])

    manifest = []
    for doc in LEGAL_DOCS:
        page = pages.get(doc["url"])
        if not page:
            print(f"  ✗ Bỏ qua (tải lỗi): {doc['filename']}")
            continue

        out_path = DATA_DIR / doc["filename"]
        write_pdf(page["title"], page["markdown"], doc["url"], out_path)

        manifest.append({
            "filename": doc["filename"],
            "title": page["title"],
            "url": doc["url"],
            "customer_role": doc["customer_role"],
            "doc_type": "legal",
            "date_collected": datetime.now(timezone.utc).isoformat(),
            "char_count": len(page["markdown"]),
        })
        print(f"  ✓ {doc['filename']} ({out_path.stat().st_size // 1024} KB)")

    (DATA_DIR / "_metadata.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    print(f"\n✓ Xong: {len(manifest)}/{len(LEGAL_DOCS)} tài liệu tại {DATA_DIR}")
    print(f"✓ Metadata (kèm customer_role): {DATA_DIR / '_metadata.json'}")


if __name__ == "__main__":
    collect_all()
