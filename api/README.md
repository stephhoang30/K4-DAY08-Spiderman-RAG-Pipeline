# API Backend — cầu nối giữa `src/` và `frontend/`

Next.js không gọi được hàm Python trực tiếp. Thư mục này là lớp HTTP mỏng bọc các hàm Task 4–10.

**Điểm quan trọng:** backend chạy được ngay cả khi Task 9, 10 chưa xong. Tầng nào chưa có thì trả mock và tự khai `wiring: "mock"`. Bạn implement xong task nào thì tầng đó **tự chuyển sang `live`**, không phải sửa dòng nào trong `api/`.

## Chạy

```bash
.venv/bin/uvicorn api.main:app --reload --port 8001
```

Tài liệu tự sinh: http://localhost:8001/docs

Cần chạy Task 4 trước, nếu không mọi endpoint trả 503:

```bash
.venv/bin/python -m src.task4_chunking_indexing
```

## Cắm task của bạn vào

1. Implement hàm trong `src/taskN_*.py` theo đúng chữ ký sẵn có
2. Xoá dòng `raise NotImplementedError`
3. Xong

Kiểm tra bằng:

```bash
curl -s http://localhost:8001/api/health | python -m json.tool
```

Backend gọi hàm của bạn rồi bắt `NotImplementedError` — không dựa vào việc đoán từ source, nên không sợ nhận nhầm.

| Tầng | Hàm bạn cần implement |
|---|---|
| Semantic | `src.task5_semantic_search.semantic_search(query, top_k)` |
| Lexical | `src.task6_lexical_search.lexical_search(query, top_k)` |
| Merge | `src.task7_reranking.rerank_rrf(ranked_lists, top_k, k)` |
| Rerank | `src.task7_reranking.rerank_cross_encoder(query, candidates, top_k)` |
| Fallback | `src.task8_pageindex_vectorless.pageindex_search(query, top_k)` |
| Pipeline | `src.task9_retrieval_pipeline.retrieve(query, top_k, score_threshold, use_reranking)` |
| Generation | `src.task10_generation.generate_with_citation(query, top_k)` |

Hàm trả `list[dict]` với key `content`, `score`, `metadata` đúng như docstring mô tả. Lớp `api/pipeline.py` lo phần đổi sang schema HTTP.

## Endpoint

| Method | Đường dẫn | Trả về |
|---|---|---|
| GET | `/api/health` | Tầng nào live, tầng nào mock, số chunk đã index |
| GET | `/api/knowledge/stats` | Thống kê kho tri thức |
| GET | `/api/knowledge/documents` | Danh sách tài liệu kèm số chunk/ký tự/token |
| GET | `/api/knowledge/chunks?source=<file>` | Các chunk của một tài liệu |
| POST | `/api/retrieve` | Chi tiết 4 tầng truy xuất + quyết định fallback |
| POST | `/api/chat` | Hỏi đáp end-to-end |
| GET | `/api/evaluation` | Kết quả RAGAS đã chạy trước đó + golden dataset |

## Evaluation

`GET /api/evaluation` **không tự chạy RAGAS**. Một lượt eval gọi LLM rất nhiều lần (nhiều lần cho mỗi metric, mỗi câu hỏi), mất vài phút và dễ chạm rate limit — không hợp để nằm sau một request HTTP.

Chạy offline:

```bash
.venv/bin/python -m group_project.evaluation.eval_pipeline
```

Lệnh đó ghi hai file cạnh nhau:

| File | Cho ai |
|---|---|
| `results.md` | Người đọc, và là bài nộp |
| `results.json` | Endpoint này đọc để trả cho frontend |

Chưa chạy lần nào thì endpoint trả `has_results: false` kèm `blocked_reason` nói rõ vướng ở đâu, thay vì trả rỗng để frontend tự đoán. Hiện tại lý do là `generate_with_citation()` của Task 10 còn stub — `eval_pipeline` gọi hàm đó nên chưa chạy được.

Endpoint luôn trả `golden_cases` kể cả khi chưa có kết quả, kèm `golden_total` và `golden_required` (15 theo rubric) để frontend hiển thị được tiến độ.

## Ba loại điểm phải giữ tách riêng

Đây là chỗ dễ sai nhất và là lý do `ChunkHit` có tới bốn trường điểm.

```
cosine  — cosine similarity gốc từ semantic search, thang [0,1] có ý nghĩa
bm25    — điểm BM25 thô, không chặn trên
rrf     — điểm sau Reciprocal Rank Fusion
rerank  — điểm cross-encoder
```

**Ngưỡng fallback phải so với `cosine`, không phải `rrf`.** Điểm RRF chỉ phụ thuộc thứ hạng: top-1 luôn ≈ `1/(60+1) = 0.0164` (có mặt ở một danh sách) hoặc ≈ `0.0328` (có mặt ở cả hai), bất kể nội dung có liên quan hay không.

Số đo thật trên kho hiện tại chứng minh điều đó:

| Truy vấn | cosine | rrf |
|---|---|---|
| "Thời hạn trả hàng hoàn tiền là bao lâu?" | 0.7805 | 0.0164 |
| "Cách nấu phở bò ngon tại nhà?" | 0.3739 | 0.0164 |

Cosine tách sạch hai nhóm, RRF thì bằng nhau. Lấy RRF so ngưỡng thì fallback hoặc luôn bật, hoặc không bao giờ bật.

Ngưỡng **0.48** trong `LAB_GUIDE.md` đã được kiểm trên kho thật: câu đúng chủ đề rơi vào 0.676–0.781, câu lạc đề 0.375–0.421. Dùng được, không cần hiệu chỉnh.

`api/pipeline.py::decide_fallback()` đã làm đúng — Task 9 chỉ cần theo cùng logic.

## Hai điều đã biết trước, để khỏi mất công truy lại

**BM25 khớp từ khoá nguyên văn.** Truy vấn tiếng Anh trên kho tiếng Việt trả về **0 kết quả** — đúng bản chất thuật toán, không phải hỏng. Đây cũng là lý do 3 test Task 6 trong `tests/test_individual.py` bị skip: chúng dùng truy vấn tiếng Anh (`"seller listing regulations"`) trong khi corpus là tiếng Việt.

**Lần gọi đầu mất ~20–30 giây** vì phải nạp `BAAI/bge-m3`. Các lần sau còn ~60ms. Gọi một truy vấn bất kỳ để làm nóng trước khi demo.

## Độ trễ đo thật

| Tầng | Đã làm nóng |
|---|---|
| Semantic (ChromaDB + bge-m3) | ~62ms |
| Lexical BM25 | ~5ms |
| RRF merge | <1ms |
| Cross-encoder rerank (Jina API) | ~2.2s |

Rerank là tầng tốn kém nhất — chiếm gần như toàn bộ thời gian. Cân nhắc khi đặt `use_reranking`.
