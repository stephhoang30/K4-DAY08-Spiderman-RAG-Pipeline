"""
Task 2 — Crawl bài viết/hướng dẫn hỗ trợ khách hàng về thương mại điện tử.

Nguồn: trung tâm trợ giúp công khai của Shopee Vietnam (help.shopee.vn).
Danh sách bài lấy từ https://help.shopee.vn/sitemap.xml (801 URL), lọc theo 4 chủ đề
đề bài gợi ý: theo dõi đơn hàng, đổi phương thức thanh toán, bằng chứng hoàn tiền,
mua hàng xuyên biên giới.

Mỗi bài lưu thành 1 file JSON trong data/landing/news/ với đủ metadata:
url, title, date_crawled, content_markdown, customer_role, topic.

Về cách crawl: xem giải thích trong src/_crawl_utils.py — Crawl4AI ở chế độ trình duyệt
không render được help.shopee.vn, nên HTML lấy bằng requests còn phần đổi sang Markdown
vẫn do Crawl4AI đảm nhiệm.

Chạy:
    python -m src.task2_crawl_news
"""

import json
from datetime import datetime, timezone
from pathlib import Path

from ._crawl_utils import fetch_pages_sync

DATA_DIR = Path(__file__).parent.parent / "data" / "landing" / "news"

# 8 bài hướng dẫn (đề bài yêu cầu tối thiểu 5), phủ đủ các chủ đề trong golden_dataset.
ARTICLES = [
    {
        "url": "https://help.shopee.vn/portal/4/article/79198",
        "filename": "article_01_phuong-thuc-thanh-toan.json",
        "topic": "payment",
        "customer_role": "buyer",
    },
    {
        "url": "https://help.shopee.vn/portal/4/article/79537",
        "filename": "article_02_thanh-toan-qr.json",
        "topic": "payment",
        "customer_role": "buyer",
    },
    {
        "url": "https://help.shopee.vn/portal/4/article/79215",
        "filename": "article_03_theo-doi-van-chuyen-don-hang.json",
        "topic": "order_tracking",
        "customer_role": "buyer",
    },
    {
        "url": "https://help.shopee.vn/portal/4/article/79467",
        "filename": "article_04_bang-chung-tra-hang-hoan-tien.json",
        "topic": "refund_evidence",
        "customer_role": "buyer",
    },
    {
        "url": "https://help.shopee.vn/portal/4/article/79233",
        "filename": "article_05_gui-yeu-cau-tra-hang-hoan-tien.json",
        "topic": "refund_request",
        "customer_role": "buyer",
    },
    {
        "url": "https://help.shopee.vn/portal/4/article/79298",
        "filename": "article_06_theo-doi-tra-hang-hoan-tien.json",
        "topic": "refund_tracking",
        "customer_role": "buyer",
    },
    {
        "url": "https://help.shopee.vn/portal/4/article/79465",
        "filename": "article_07_san-pham-han-che-tra-hang.json",
        "topic": "refund_restrictions",
        "customer_role": "both",
    },
    {
        "url": "https://help.shopee.vn/portal/4/article/79470",
        "filename": "article_08_theo-doi-don-hang-quoc-te.json",
        "topic": "cross_border",
        "customer_role": "buyer",
    },
]


def setup_directory():
    """Tạo thư mục data/landing/news/ nếu chưa có."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    print(f"✓ Thư mục đã sẵn sàng: {DATA_DIR}")


def crawl_all():
    """Crawl toàn bộ bài viết trong ARTICLES và lưu thành JSON."""
    print("=" * 60)
    print("Task 2: Crawl bài hướng dẫn hỗ trợ khách hàng (Shopee Vietnam)")
    print("=" * 60)

    setup_directory()
    print(f"\nĐang crawl {len(ARTICLES)} bài...")

    pages = fetch_pages_sync([a["url"] for a in ARTICLES])

    saved = 0
    for art in ARTICLES:
        page = pages.get(art["url"])
        if not page:
            print(f"  ✗ Bỏ qua (crawl lỗi): {art['filename']}")
            continue

        record = {
            "url": art["url"],
            "title": page["title"],
            "date_crawled": datetime.now(timezone.utc).isoformat(),
            "content_markdown": page["markdown"],
            "topic": art["topic"],
            "customer_role": art["customer_role"],
            "doc_type": "news",
            "source": "help.shopee.vn",
        }

        filepath = DATA_DIR / art["filename"]
        filepath.write_text(
            json.dumps(record, ensure_ascii=False, indent=2), encoding="utf-8"
        )
        saved += 1
        print(f"  ✓ {art['filename']} ({filepath.stat().st_size // 1024} KB)")

    print(f"\n✓ Xong: {saved}/{len(ARTICLES)} bài tại {DATA_DIR}")


if __name__ == "__main__":
    crawl_all()
