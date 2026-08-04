# Setup Môi Trường — Lab Ngày 8 RAG Pipeline

Tài liệu này dành cho thành viên nhóm. Làm theo từ trên xuống, mỗi lệnh có output kỳ vọng ngay bên dưới để bạn tự biết mình đúng hay sai mà không cần hỏi ai.

## Đọc dòng này trước

**Chạy setup ở nhà, trước buổi lab.** Checkpoint 0 trên lịch chỉ có 10 phút, nhưng lần cài đầu tiên phải tải khoảng **5 GB** (thư viện 1.8 GB + trình duyệt Chromium 1.1 GB + model embedding 2.1 GB). Mạng lớp học không đủ nhanh cho việc đó. Ai cài tại lớp gần như chắc chắn tụt lại từ CP1.

| Bước | Nội dung | Thời gian | Tải về |
|---|---|---|---|
| 1 | Clone repo + tạo venv | 2 phút | — |
| 2 | Cài thư viện Python | 5 phút (uv) / 15+ phút (pip) | 1.8 GB |
| 3 | Cài trình duyệt cho crawler | 1–2 phút | 1.1 GB |
| 4 | Tạo `.env` và điền API key | 2 phút | — |
| 5 | Chạy script kiểm tra | 1 phút | — |
| 6 | Tải sẵn model embedding | 5–20 phút | 2.1 GB |

Xong hết thì bạn có: môi trường chạy được cả 10 task, 4 API key đã kiểm chứng, và `pytest` chạy ra baseline đúng.

## Yêu cầu máy

- **Python 3.11** — các thư viện chính (`torch`, `streamlit`, `crawl4ai`, `sentence-transformers`) đều yêu cầu tối thiểu 3.10. Bản đã verify là 3.11.15.
- **Trống ~6 GB ổ đĩa.**
- Git.

Kiểm tra Python trước khi làm gì:

```bash
python3 --version
```

Kết quả kỳ vọng — số phụ sau `3.11.` là bao nhiêu không quan trọng:

```
Python 3.11.15
```

Nếu ra `3.9.x` hoặc thấp hơn, cài Python 3.11 rồi quay lại. Nếu ra `3.12`/`3.13`, chưa được kiểm chứng ở đây — dùng 3.11 để cả nhóm cùng một nền, gặp lỗi thì còn so được với nhau.

## Bước 1 — Clone và tạo môi trường ảo

*Môi trường ảo (virtual environment)* là một thư mục chứa riêng bộ thư viện của dự án này, để chúng không lẫn với thư viện của dự án khác trên máy bạn.

```bash
git clone <URL-repo-nhóm> && cd K4-DAY08-Spiderman-RAG-Pipeline
```

```bash
python3 -m venv .venv
```

Lệnh này không in ra gì khi thành công. Kiểm tra bằng:

```bash
.venv/bin/python --version
```

Kết quả kỳ vọng:

```
Python 3.11.15
```

Trên **Windows**, đường dẫn là `.venv\Scripts\python.exe` thay vì `.venv/bin/python`. Toàn bộ lệnh phía dưới đổi tương ứng. (Phần Windows chưa được chạy thử — xem mục "Đã verify tới đâu" ở cuối.)

Thư mục `.venv/` đã nằm trong `.gitignore`. **Không commit nó.**

## Bước 2 — Cài thư viện

Có hai đường. Chọn một.

**Cách A — `uv` (nhanh hơn nhiều, đây là cách đã dùng để verify):**

```bash
VIRTUAL_ENV=.venv uv pip install -r requirements.txt
```

Chưa có `uv` thì cài trước bằng `curl -LsSf https://astral.sh/uv/install.sh | sh`.

**Cách B — `pip` thuần (không cần cài thêm gì, nhưng chậm hơn đáng kể):**

```bash
.venv/bin/pip install -r requirements.txt
```

Cả hai đều kết thúc bằng danh sách package đã cài. Không cần đọc hết danh sách — bước 5 sẽ kiểm giúp bạn.

**Hai cách cho ra môi trường giống hệt nhau.** Đã đối chiếu: pip giải phụ thuộc ra đúng cùng bộ phiên bản với uv (`torch-2.13.0`, `transformers-5.14.1`, `ragas-0.1.21`, `chromadb-1.5.9`, `streamlit-1.60.0`). Nên nếu bạn không muốn cài thêm `uv`, cách B hoàn toàn dùng được.

Khác biệt duy nhất là thời gian: `uv` xong trong vài phút, `pip` mất hơn 10 phút chỉ riêng phần giải phụ thuộc. Lý do là `requirements.txt` ghim cứng `ragas==0.1.21` (bản cũ), nên pip phải thử lùi rất nhiều tổ hợp phiên bản mới tìm ra bộ khớp nhau.

Nếu dùng cách B: nó sẽ đứng rất lâu ở các dòng `Collecting ...`. Đó là pip đang thử lùi, không phải máy treo. Đừng nhấn Ctrl+C.

## Bước 3 — Cài trình duyệt cho crawler

Task 2 dùng `crawl4ai` để crawl bài viết. Thư viện này điều khiển một trình duyệt thật, và **`pip install crawl4ai` không tự tải trình duyệt về** — phải cài riêng:

```bash
.venv/bin/python -m playwright install chromium
```

Kết quả kỳ vọng — dòng cuối cùng có chữ `downloaded to`, số phiên bản trên máy bạn có thể khác:

```
Chrome Headless Shell 151.0.7922.34 (playwright chromium-headless-shell v1234) downloaded to <thư-mục-cache-của-bạn>/ms-playwright/chromium_headless_shell-1234
```

Bỏ bước này thì Task 2 báo lỗi `BrowserType.launch: Executable doesn't exist`.

## Bước 4 — Tạo file `.env` và điền API key

```bash
cp .env.example .env
```

Mở `.env` và điền key. Lab cần 4 loại, không phải cái nào cũng bắt buộc:

| Key | Dùng ở | Bắt buộc? |
|---|---|---|
| `OPENROUTER_API_KEY` hoặc `OPENAI_API_KEY` | Task 10 (sinh câu trả lời), RAGAS eval | Có |
| `PAGEINDEX_API_KEY` | Task 8 (vectorless fallback) | Có |
| `JINA_API_KEY` | Task 7 (rerank bằng cross-encoder) | Không — có thể tự viết RRF thay thế |
| `GEMINI_API_KEY` | Dự phòng | Không |

**`.env` KHÔNG COMMIT.** Nó đã nằm trong `.gitignore` và phải giữ nguyên như vậy — file này chứa key tính tiền theo lượt gọi. Chia sẻ key trong nhóm qua tin nhắn riêng, đừng đẩy lên GitHub.

### Bẫy quan trọng: chọn OpenRouter hay OpenAI thì phải chọn cho trọn

Code mẫu trong `src/task10_generation.py` viết thế này:

```python
api_key = os.getenv("OPENROUTER_API_KEY") or os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=api_key, base_url="https://openrouter.ai/api/v1")
```

Nếu bạn chỉ điền `OPENAI_API_KEY` mà bỏ trống `OPENROUTER_API_KEY`, nó lấy key OpenAI nhưng vẫn gửi tới máy chủ OpenRouter. Kết quả là lỗi:

```
AuthenticationError: Error code: 401 - {'error': {'message': 'Missing Authentication header', 'code': 401}}
```

Hai cách sửa, chọn một:

- **Dùng OpenRouter:** điền `OPENROUTER_API_KEY`, giữ nguyên `base_url`, giữ `LLM_MODEL = "openai/gpt-4o-mini"`.
- **Dùng OpenAI:** điền `OPENAI_API_KEY`, **xoá** tham số `base_url`, và đổi `LLM_MODEL` thành `"gpt-4o-mini"` (bỏ tiền tố `openai/`).

Đây là việc của Task 10, chưa cần sửa ngay bây giờ. Biết trước để lúc đó không mất thời gian truy một lỗi 401 trông như key hỏng, trong khi key vẫn tốt.

## Bước 5 — Kiểm tra toàn bộ

File này chưa có trong repo starter — bạn tự tạo. Trước hết tạo thư mục:

```bash
mkdir -p scripts
```

Dán nội dung sau vào `scripts/verify_setup.py`:

```python
import os, sys
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent / ".env")
fail = 0

mods = ["dotenv", "requests", "numpy", "crawl4ai", "markitdown", "fpdf",
        "langchain_text_splitters", "sentence_transformers", "chromadb",
        "rank_bm25", "sklearn", "pageindex", "openai", "streamlit",
        "ragas", "datasets", "langchain_openai", "pytest"]
for m in mods:
    try:
        __import__(m)
    except Exception as e:
        print(f"FAIL import {m}: {e}"); fail += 1
print(f"imports: {len(mods) - fail}/{len(mods)} OK")

for name in ["OPENROUTER_API_KEY", "OPENAI_API_KEY", "PAGEINDEX_API_KEY", "JINA_API_KEY"]:
    print(f"{name:20} {'da dien' if os.getenv(name) else '-- trong --'}")

sys.exit(1 if fail else 0)
```

Chạy nó:

```bash
.venv/bin/python scripts/verify_setup.py
```

Kết quả kỳ vọng — dòng `imports` phải là `18/18`, còn 4 dòng key thì tuỳ bạn điền key nào:

```
imports: 18/18 OK
OPENROUTER_API_KEY   -- trong --
OPENAI_API_KEY       da dien
PAGEINDEX_API_KEY    da dien
JINA_API_KEY         da dien
```

Ít nhất một trong hai dòng `OPENROUTER_API_KEY` / `OPENAI_API_KEY` phải là `da dien`, và `PAGEINDEX_API_KEY` phải `da dien`.

Còn dòng `FAIL import ...` nào thì quay lại Bước 2.

### Kiểm tra Streamlit chạy được

```bash
.venv/bin/streamlit run app.py
```

Trình duyệt tự mở ở `http://localhost:8501`, hiện giao diện chatbot với sidebar câu hỏi gợi ý. Gõ thử một câu — nó sẽ trả lời `Task 10 chưa được implement`. **Đó là kết quả đúng ở giai đoạn này**, không phải lỗi. Nhấn Ctrl+C ở terminal để tắt.

### Kiểm tra baseline test

```bash
.venv/bin/python -m pytest tests/ -q
```

Kết quả kỳ vọng:

```
4 failed, 7 passed, 24 skipped
```

Con số này **đúng và không cần sửa**. 4 test fail vì `data/` chưa có dữ liệu (đó là việc của Task 1–3), 24 test skip vì Task 4–10 chưa viết. Cuối buổi, mục tiêu là 35/35 pass.

## Bước 6 — Tải sẵn model embedding

Task 4 dùng model `BAAI/bge-m3` để chuyển văn bản thành vector. Model này nặng 2.1 GB và **được tải tự động lần đầu gọi tới** — nếu để tới lúc chạy Task 4 mới tải, bạn đứng hình giữa CP2.

Tải trước:

```bash
.venv/bin/python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('BAAI/bge-m3')"
```

Xong rồi kiểm tra nó ra đúng số chiều mà `src/task4_chunking_indexing.py` khai (`EMBEDDING_DIM = 1024`):

```bash
.venv/bin/python -c "
from sentence_transformers import SentenceTransformer
print(SentenceTransformer('BAAI/bge-m3').encode(['thu nghiem']).shape)
"
```

Kết quả kỳ vọng:

```
(1, 1024)
```

Lần load đầu mất khoảng 30 giây kể cả khi model đã nằm trong máy. Đó là bình thường.

## Xử lý lỗi

Dán nguyên văn thông báo lỗi bạn thấy trên màn hình vào ô tìm kiếm của tài liệu này.

| Thông báo lỗi | Nguyên nhân | Cách sửa |
|---|---|---|
| `BrowserType.launch: Executable doesn't exist` | Chưa cài trình duyệt cho crawler | Chạy lại Bước 3 |
| `MissingDependencyException` khi convert PDF | `markitdown` thiếu phần đọc PDF | `.venv/bin/pip install "markitdown[pdf]"` |
| `401 - Missing Authentication header` | Key và `base_url` không cùng một nhà cung cấp | Xem mục bẫy ở Bước 4 |
| `UnicodeEncodeError` (Windows) | Console Windows không hiểu ký tự tiếng Việt | Chạy `$env:PYTHONIOENCODING="utf-8"` trước |
| `ModuleNotFoundError: No module named 'src'` | Chạy sai kiểu | Dùng `python -m src.task3_convert_markdown`, không phải `python src/task3_convert_markdown.py` |
| Retrieval trả về nội dung của tài liệu cũ | `chroma_db/` còn dữ liệu lần chạy trước | Xoá thư mục `chroma_db/` rồi chạy lại Task 4 |

## Đã verify tới đâu

Minh bạch để bạn biết chỗ nào chắc chắn, chỗ nào phải tự dò.

**Đã chạy thật và thành công** trên macOS 26.5.2 (Apple Silicon), Python 3.11.15:

| Hạng mục | Kết quả thật |
|---|---|
| 18/18 import thư viện | OK |
| `pip` vs `uv` giải phụ thuộc | Ra cùng bộ phiên bản |
| `playwright install chromium` | Tải xong `chromium-1234` |
| ChromaDB ghi + truy vấn | OK |
| BM25 tính điểm | OK |
| `bge-m3` load + encode | `(2, 1024)`, load 33.6s |
| `streamlit run app.py` | HTTP 200, không lỗi |
| `pytest tests/ -q` | `4 failed, 7 passed, 24 skipped` |
| Key OpenAI | Gọi `gpt-4o-mini` trả lời được |
| Key Jina | Rerank trả `relevance_score: 0.862` |
| Key PageIndex | Hợp lệ |
| Đường OpenRouter + key OpenAI | Lỗi 401 đúng như mô tả ở Bước 4 |

**Chưa verify:** toàn bộ lệnh phiên bản Windows, và Python 3.12/3.13. Nếu bạn dùng Windows và gặp lệch, báo lại trong nhóm để cập nhật file này.

**Phiên bản đã cài** (nếu cần đối chiếu khi máy hai người hành xử khác nhau): `torch 2.13.0`, `transformers 5.14.1`, `sentence-transformers 5.6.1`, `chromadb 1.5.9`, `streamlit 1.60.0`, `ragas 0.1.21`, `crawl4ai 0.8.5`, `pageindex 0.2.8`.

## Ghi chú cho người gộp code

`src/supervisor.py` được nhắc tới trong `README.md` và `LAB_GUIDE.md` (phần "Supervisor + Workers song song", nhiệm vụ của Role 1) nhưng **không tồn tại trong repo starter**. Ai nhận Role 1 sẽ phải tự tạo file này, hoặc thống nhất với coach là bỏ phần đó.
