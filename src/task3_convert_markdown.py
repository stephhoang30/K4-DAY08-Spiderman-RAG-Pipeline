"""
Task 3 — Convert toàn bộ file trong data/landing/ thành Markdown.

Dùng MarkItDown của Microsoft (https://github.com/microsoft/markitdown) cho file PDF,
và đọc trực tiếp JSON cho bài viết đã crawl ở Task 2.

Cài đặt:
    pip install "markitdown[pdf]"
    # Cần extra [pdf]. Chỉ "pip install markitdown" sẽ báo MissingDependencyException
    # khi convert PDF, dù JSON/DOCX vẫn chạy bình thường.

Output giữ nguyên cấu trúc thư mục con:
    data/landing/legal/*.pdf    -> data/standardized/legal/*.md
    data/landing/news/*.json    -> data/standardized/news/*.md

Mỗi file .md có phần header YAML ghi metadata (source, url, doc_type, customer_role).
Task 4 đọc lại header này để gắn metadata cho từng chunk khi index vào ChromaDB.

Chạy:
    python -m src.task3_convert_markdown
"""

import json
import re
from pathlib import Path

from markitdown import MarkItDown

LANDING_DIR = Path(__file__).parent.parent / "data" / "landing"
OUTPUT_DIR = Path(__file__).parent.parent / "data" / "standardized"


def normalize_spacing(text: str) -> str:
    """
    Gộp các khoảng trắng liên tiếp trong cùng một dòng thành một.

    PDF căn đều hai bên (justified) khiến pdfminer trả về chữ cách nhau nhiều
    khoảng trắng, ví dụ "d.  Tuyên  truyền  về  những  thông  tin". Để nguyên thì
    BM25 ở Task 6 tách token sai và embedding ở Task 4 cũng nhiễu.
    Chỉ gộp space/tab, giữ nguyên xuống dòng để không phá cấu trúc đoạn.
    """
    text = re.sub(r"[ \t]{2,}", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text


def build_header(meta: dict) -> str:
    """Tạo header YAML cho file markdown để Task 4 đọc lại metadata."""
    lines = ["---"]
    for key in ("title", "source", "url", "doc_type", "customer_role", "topic", "date"):
        if meta.get(key):
            value = str(meta[key]).replace('"', "'")
            lines.append(f'{key}: "{value}"')
    lines.append("---\n")
    return "\n".join(lines)


def convert_legal_docs() -> int:
    """Convert PDF trong data/landing/legal/ sang markdown."""
    legal_dir = LANDING_DIR / "legal"
    output_dir = OUTPUT_DIR / "legal"
    output_dir.mkdir(parents=True, exist_ok=True)

    # _metadata.json do Task 1 ghi ra, chứa customer_role của từng file
    meta_path = legal_dir / "_metadata.json"
    meta_by_file = {}
    if meta_path.exists():
        meta_by_file = {
            m["filename"]: m for m in json.loads(meta_path.read_text(encoding="utf-8"))
        }

    md = MarkItDown()
    count = 0

    for filepath in sorted(legal_dir.iterdir()):
        if filepath.suffix.lower() not in (".pdf", ".docx", ".doc"):
            continue

        print(f"Converting: {filepath.name}")
        result = md.convert(str(filepath))
        body = normalize_spacing(result.text_content)
        info = meta_by_file.get(filepath.name, {})

        header = build_header({
            "title": info.get("title", filepath.stem),
            "source": filepath.name,
            "url": info.get("url"),
            "doc_type": "legal",
            "customer_role": info.get("customer_role", "both"),
            "date": info.get("date_collected"),
        })

        output_path = output_dir / f"{filepath.stem}.md"
        output_path.write_text(header + body, encoding="utf-8")
        count += 1
        print(f"  ✓ {output_path.name} ({len(body)} ký tự)")

    return count


def convert_news_articles() -> int:
    """Convert JSON đã crawl trong data/landing/news/ sang markdown."""
    news_dir = LANDING_DIR / "news"
    output_dir = OUTPUT_DIR / "news"
    output_dir.mkdir(parents=True, exist_ok=True)

    count = 0
    for filepath in sorted(news_dir.iterdir()):
        if filepath.suffix.lower() != ".json" or filepath.name.startswith("_"):
            continue

        print(f"Converting: {filepath.name}")
        data = json.loads(filepath.read_text(encoding="utf-8"))

        header = build_header({
            "title": data.get("title"),
            "source": filepath.name,
            "url": data.get("url"),
            "doc_type": "news",
            "customer_role": data.get("customer_role", "buyer"),
            "topic": data.get("topic"),
            "date": data.get("date_crawled"),
        })

        body = normalize_spacing(
            f"# {data.get('title', 'Unknown')}\n\n{data.get('content_markdown', '')}"
        )
        output_path = output_dir / f"{filepath.stem}.md"
        output_path.write_text(header + body, encoding="utf-8")
        count += 1
        print(f"  ✓ {output_path.name} ({len(body)} ký tự)")

    return count


def convert_all():
    """Convert toàn bộ files."""
    print("=" * 60)
    print("Task 3: Convert to Markdown (MarkItDown)")
    print("=" * 60)

    print("\n--- Legal Documents ---")
    n_legal = convert_legal_docs()

    print("\n--- News Articles ---")
    n_news = convert_news_articles()

    print(f"\n✓ Xong: {n_legal} legal + {n_news} news = {n_legal + n_news} file .md")
    print(f"✓ Output tại: {OUTPUT_DIR}")


if __name__ == "__main__":
    convert_all()
