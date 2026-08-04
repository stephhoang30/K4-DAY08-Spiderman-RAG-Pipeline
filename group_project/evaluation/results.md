# Kết quả đánh giá RAG Pipeline

Framework: **RAGAS** · Golden dataset: **16 câu** · Ngưỡng đạt: **0.7**

Toàn bộ câu hỏi và đáp án kỳ vọng được viết từ nội dung thật trong `data/standardized/`, không bịa. Cả 16 câu đều truy xuất đúng tài liệu kỳ vọng ở top-1 khi kiểm bằng `semantic_search`, nên `context_recall` không bị trần bởi câu hỏi kém.

## Điểm tổng quan

| Metric | Điểm | Đạt ngưỡng 0.7 |
|---|---|---|
| Faithfulness | 0.934 | Đạt |
| Answer Relevance | 0.732 | Đạt |
| Context Recall | 0.988 | Đạt |
| Context Precision | 1.000 | Đạt |

## So sánh A/B

Hai cấu hình khác nhau ở **số chunk đưa vào prompt**, mọi thứ khác giữ nguyên — nên chênh lệch phản ánh đúng tác động của kích thước ngữ cảnh.

| Metric | top_k_5 | top_k_3 | Δ |
|---|---|---|---|
| Faithfulness | 0.934 | 0.917 | +0.017 |
| Answer Relevance | 0.732 | 0.627 | +0.104 |
| Context Recall | 0.988 | 0.988 | 0.000 |
| Context Precision | 1.000 | 1.000 | 0.000 |

**Kết luận:** `top_k_5` thắng ở Answer Relevance (+0.104) và Faithfulness (+0.017), trong khi Context Recall và Context Precision không đổi. Nghĩa là với corpus này, tăng số chunk **không** giúp lấy thêm bằng chứng đúng (recall đã kịch trần) mà giúp LLM **diễn đạt đầy đủ hơn** — câu trả lời ít bị cụt ý hơn khi có thêm ngữ cảnh.

## Cảnh báo: RAGAS chấm sai 2 câu

Hai câu dưới đây bị chấm `answer_relevancy = 0.000` chằn, trong khi `faithfulness`, `context_recall` và `context_precision` đều **1.000** — mâu thuẫn.

| Câu hỏi | Câu trả lời thực tế | Đánh giá |
|---|---|---|
| Hình thức trả góp bằng thẻ tín dụng có áp dụng cho đơn hàng  | Hình thức trả góp bằng thẻ tín dụng KHÔNG áp dụng cho đơn hàng quốc tế [Document 1].… | Đúng |
| Thời Gian Shopee Đảm Bảo dùng để làm gì? | Thời Gian Shopee Đảm Bảo được sử dụng để hỗ trợ Người Dùng trong việc giải quyết các xung đột, tranh chấp, khi… | Đúng |

Cả hai đều trả lời **đúng** và khớp đáp án kỳ vọng. Nguyên nhân là bộ phân loại "noncommittal" của RAGAS: nó chấm 0 khi cho rằng câu trả lời né tránh. Với tiếng Việt, câu phủ định đúng ("KHÔNG áp dụng cho đơn hàng quốc tế") và câu ngắn gọn hay bị nhận nhầm.

**Ảnh hưởng:** Answer Relevance thật là **0.836** chứ không phải 0.732. Hai con 0.000 giả kéo trung bình xuống 0.105 điểm. Loại chúng ra thì cả 4 chỉ số đều vượt ngưỡng 0.7.

## Ba câu yếu nhất

| # | Câu hỏi | Faith | Rel | Recall | Prec | Tầng lỗi | Nguyên nhân |
|---|---|---|---|---|---|---|---|
| 1 | Theo dõi hành trình đơn hàng quốc tế đã đặt trên Sho | 0.600 | 0.849 | 1.000 | 1.000 | Generation | Lấy đúng chunk nhưng câu trả lời thêm ý ngoài ngữ cảnh |
| 2 | Khi khiếu nại mất mát hàng hóa thì phải cung cấp bằn | 0.667 | 0.790 | 1.000 | 1.000 | Generation | Lấy đúng chunk nhưng câu trả lời thêm ý ngoài ngữ cảnh |
| 3 | Sản phẩm hạn chế trả hàng là gì và gồm những nhóm nà | 1.000 | 0.801 | 0.800 | 1.000 | Retrieval | Chunk chứa đáp án không lọt top-k |

Phân bổ tầng lỗi: **2 ca do generation** (recall đủ nhưng câu trả lời lệch context) và **1 ca do retrieval** (chunk chứa đáp án không lọt top-k). Đa số lỗi nằm ở tầng sinh, không phải tầng truy xuất.

## Đề xuất cải tiến

**1. Không dùng answer_relevancy của RAGAS làm chỉ số quyết định cho tiếng Việt**

- Cách làm: Chấm tay lại các câu bị 0.000 chằn, hoặc đổi sang metric không phụ thuộc bộ phân loại noncommittal.
- Kỳ vọng: Answer Relevance từ 0.732 về đúng 0.836.

**2. Siết prompt ở Task 10 để không thêm ý ngoài ngữ cảnh**

- Cách làm: Thêm luật: chỉ được nêu thông tin có trong context, không suy luận mở rộng, không gộp kiến thức sẵn có của model.
- Kỳ vọng: 2 câu đang có faithfulness dưới 0.8 (thấp nhất 0.600); đây là dư địa lớn nhất còn lại.

**3. Giữ cấu hình `top_k_5`, không đổi sang `top_k_3`**

- Cách làm: A/B cho thấy `top_k_3` làm Answer Relevance giảm 0.104 mà không được lợi gì về recall hay precision.
- Kỳ vọng: Tránh đánh đổi chất lượng để lấy tốc độ khi không có lợi ích thật.

**4. Mở rộng golden dataset sang câu hỏi khó hơn**

- Cách làm: Recall 0.988 và Precision 1.000 nghĩa là bộ câu hỏi hiện tại chưa đủ khó để phân biệt các cấu hình retrieval. Thêm câu bắc cầu nhiều tài liệu, câu hỏi số liệu cụ thể, câu nhập nhằng giữa chính sách người mua và người bán.
- Kỳ vọng: Có dữ liệu để so hybrid vs dense-only một cách có ý nghĩa.

## Cách tái lập

```bash
python -m src.task4_chunking_indexing            # dựng ChromaDB nếu chưa có
python -m group_project.evaluation.eval_pipeline # chạy eval, ghi results.md + results.json
python -m group_project.evaluation.report        # dựng lại results.md từ results.json
```

Lượt eval này chạy trên 16 câu × 2 cấu hình = 128 lượt chấm RAGAS, mất khoảng 5 phút. Đừng chạy song song với demo: RAGAS gọi LLM liên tục và sẽ chiếm hết hạn mức token mỗi phút, làm chatbot trả về lỗi 429.
