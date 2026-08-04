"""
Helper dùng chung cho Task 1 và Task 2 — tải trang help.shopee.vn và đổi sang Markdown.

Vì sao không dùng thẳng AsyncWebCrawler.arun(url=...) như code mẫu:
    Crawl4AI mở trình duyệt thật để render trang. Với help.shopee.vn, sự kiện
    `domcontentloaded` không bao giờ fire (trang giữ kết nối mở), nên arun() timeout
    ở 60s; đổi sang wait_until="commit" thì lại trả về trước khi DOM có nội dung
    (markdown dài đúng 1 ký tự). Cả hai đều đã thử.

    May mắn là help.shopee.vn render sẵn nội dung ở phía server — HTML thô tải bằng
    requests đã chứa đủ bài viết. Nên ở đây tách làm hai việc:
        1. requests tải HTML (ổn định, không cần trình duyệt)
        2. Crawl4AI đổi HTML sang Markdown qua chế độ "raw://"

    Vẫn dùng đúng thư viện lab khuyến nghị cho phần nó làm tốt, chỉ đổi cách lấy HTML.

robots.txt của help.shopee.vn cho phép (`User-Agent:* / Allow: /`), đã kiểm ngày 04/08/2026.
Có REQUEST_DELAY giữa các request để không dội trang nguồn.
"""

import asyncio
import re
import time

import requests
from crawl4ai import AsyncWebCrawler, CacheMode, CrawlerRunConfig

USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
)
REQUEST_DELAY = 1.5  # giây, nghỉ giữa 2 lần tải để lịch sự với trang nguồn
REQUEST_TIMEOUT = 30

# Những dòng do giao diện help center sinh ra, không phải nội dung bài viết.
BOILERPLATE_LINES = {
    "# Xin chào, Shopee có thể giúp gì cho bạn?",
    "Bạn có hài lòng với bài viết này?",
    "Hài lòng",
    "Không hài lòng",
}


def clean_markdown(md: str) -> str:
    """
    Bỏ phần khung giao diện, chỉ giữ nội dung bài viết.

    Cũng rút gọn link `[chữ](url)` thành `chữ`: URL dài không mang thông tin cho
    retrieval, chỉ làm loãng chunk ở Task 4 và làm vỡ layout khi xuất PDF ở Task 1
    (fpdf2 báo "Not enough horizontal space" vì URL là một token không có khoảng trắng).
    """
    lines = [ln for ln in md.splitlines() if ln.strip() not in BOILERPLATE_LINES]
    text = "\n".join(lines)
    text = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", text)  # [chữ](url) -> chữ
    text = re.sub(r"\n{3,}", "\n\n", text)                # gom nhiều dòng trống thành 1
    return text.strip()


def extract_title(html: str) -> str:
    """Lấy <title>, bỏ hậu tố ' | Shopee Trung tâm trợ giúp'."""
    m = re.search(r"<title>(.*?)</title>", html, re.S | re.I)
    if not m:
        return "Unknown"
    return m.group(1).split("|")[0].strip()


async def fetch_pages(urls: list[str]) -> dict[str, dict]:
    """
    Tải nhiều trang và đổi sang Markdown, dùng chung một phiên Crawl4AI.

    Returns:
        {url: {'title': str, 'markdown': str}} — url nào lỗi thì không có trong dict.
    """
    out: dict[str, dict] = {}
    run_cfg = CrawlerRunConfig(cache_mode=CacheMode.BYPASS, verbose=False)

    async with AsyncWebCrawler() as crawler:
        for i, url in enumerate(urls, 1):
            try:
                resp = requests.get(
                    url, headers={"User-Agent": USER_AGENT}, timeout=REQUEST_TIMEOUT
                )
                resp.raise_for_status()
                html = resp.text

                result = await crawler.arun(url="raw://" + html, config=run_cfg)
                md = clean_markdown(str(result.markdown))

                if len(md) < 200:
                    print(f"  [{i}/{len(urls)}] ⚠ Nội dung quá ngắn, bỏ qua: {url}")
                    continue

                out[url] = {"title": extract_title(html), "markdown": md}
                print(f"  [{i}/{len(urls)}] ✓ {out[url]['title'][:60]} ({len(md)} ký tự)")

            except Exception as e:
                print(f"  [{i}/{len(urls)}] ✗ Lỗi {url}: {type(e).__name__}: {e}")

            if i < len(urls):
                time.sleep(REQUEST_DELAY)

    return out


def fetch_pages_sync(urls: list[str]) -> dict[str, dict]:
    """Bản đồng bộ của fetch_pages() cho tiện gọi từ script thường."""
    return asyncio.run(fetch_pages(urls))
