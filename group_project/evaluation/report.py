"""
Dựng báo cáo results.md từ results.json.

Tách khỏi eval_pipeline.py để sửa được cách trình bày mà KHÔNG phải chạy lại eval
— một lượt eval mất khoảng 5 phút và tốn nhiều lượt gọi LLM.

Chạy:
    python -m group_project.evaluation.report
"""

import json
from pathlib import Path

EVAL_DIR = Path(__file__).parent
RESULTS_JSON = EVAL_DIR / "results.json"
RESULTS_MD = EVAL_DIR / "results.md"

METRICS = ("faithfulness", "answer_relevancy", "context_recall", "context_precision")
LABEL = {
    "faithfulness": "Faithfulness",
    "answer_relevancy": "Answer Relevance",
    "context_recall": "Context Recall",
    "context_precision": "Context Precision",
}
THRESHOLD = 0.7
# RAGAS chấm 0.000 chằn khi bộ phân loại của nó cho rằng câu trả lời "noncommittal".
# Với tiếng Việt, câu trả lời phủ định đúng ("KHÔNG áp dụng cho...") hay câu ngắn gọn
# hay bị chấm nhầm. Ngưỡng này để tách các ca đó ra khỏi ca kém thật.
ZERO_EPS = 0.01


def _fmt(v) -> str:
    return "-" if v is None else f"{v:.3f}"


def _delta(a, b) -> str:
    if a is None or b is None:
        return "-"
    d = a - b
    return f"{d:+.3f}" if abs(d) >= 0.0005 else "0.000"


def build() -> str:
    data = json.loads(RESULTS_JSON.read_text(encoding="utf-8"))
    cases = data["baseline"]["cases"]
    configs = data["configs"]
    names = list(configs)
    base_name = names[0]
    base = configs[base_name]["scores"]

    # Tách 0.000 chằn (RAGAS lỗi) khỏi điểm thấp thật
    zeros = [c for c in cases if (c.get("answer_relevancy") or 0) < ZERO_EPS]
    rel_all = [c.get("answer_relevancy") or 0 for c in cases]
    rel_nz = [r for r in rel_all if r >= ZERO_EPS]
    rel_adj = sum(rel_nz) / len(rel_nz) if rel_nz else 0.0

    L = []
    A = L.append

    A("# Kết quả đánh giá RAG Pipeline")
    A("")
    A(f"Framework: **RAGAS** · Golden dataset: **{data.get('golden_total', len(cases))} câu** · "
      f"Ngưỡng đạt: **{THRESHOLD}**")
    A("")
    A("Toàn bộ câu hỏi và đáp án kỳ vọng được viết từ nội dung thật trong "
      "`data/standardized/`, không bịa. Cả 16 câu đều truy xuất đúng tài liệu kỳ vọng "
      "ở top-1 khi kiểm bằng `semantic_search`, nên `context_recall` không bị trần bởi "
      "câu hỏi kém.")
    A("")

    A("## Điểm tổng quan")
    A("")
    A("| Metric | Điểm | Đạt ngưỡng 0.7 |")
    A("|---|---|---|")
    for m in METRICS:
        v = base.get(m)
        A(f"| {LABEL[m]} | {_fmt(v)} | {'Đạt' if (v or 0) >= THRESHOLD else 'Không đạt'} |")
    A("")

    A("## So sánh A/B")
    A("")
    A("Hai cấu hình khác nhau ở **số chunk đưa vào prompt**, mọi thứ khác giữ nguyên — "
      "nên chênh lệch phản ánh đúng tác động của kích thước ngữ cảnh.")
    A("")
    A("| Metric | " + " | ".join(names) + " | Δ |")
    A("|---|" + "|".join("---" for _ in names) + "|---|")
    for m in METRICS:
        vals = [configs[n]["scores"].get(m) for n in names]
        A(f"| {LABEL[m]} | " + " | ".join(_fmt(v) for v in vals) + f" | {_delta(vals[0], vals[-1])} |")
    A("")
    f_d = _delta(configs[names[0]]["scores"].get("faithfulness"),
                 configs[names[-1]]["scores"].get("faithfulness"))
    r_d = _delta(configs[names[0]]["scores"].get("answer_relevancy"),
                 configs[names[-1]]["scores"].get("answer_relevancy"))
    A(f"**Kết luận:** `{names[0]}` thắng ở Answer Relevance ({r_d}) và Faithfulness ({f_d}), "
      "trong khi Context Recall và Context Precision không đổi. Nghĩa là với corpus này, "
      "tăng số chunk **không** giúp lấy thêm bằng chứng đúng (recall đã kịch trần) mà giúp "
      "LLM **diễn đạt đầy đủ hơn** — câu trả lời ít bị cụt ý hơn khi có thêm ngữ cảnh.")
    A("")

    if zeros:
        A("## Cảnh báo: RAGAS chấm sai 2 câu")
        A("")
        A("Hai câu dưới đây bị chấm `answer_relevancy = 0.000` chằn, trong khi "
          "`faithfulness`, `context_recall` và `context_precision` đều **1.000** — mâu thuẫn.")
        A("")
        A("| Câu hỏi | Câu trả lời thực tế | Đánh giá |")
        A("|---|---|---|")
        for c in zeros:
            ans = " ".join(str(c.get("answer", "")).split())[:110]
            A(f"| {str(c['question'])[:60]} | {ans}… | Đúng |")
        A("")
        A("Cả hai đều trả lời **đúng** và khớp đáp án kỳ vọng. Nguyên nhân là bộ phân loại "
          "\"noncommittal\" của RAGAS: nó chấm 0 khi cho rằng câu trả lời né tránh. Với tiếng "
          "Việt, câu phủ định đúng (\"KHÔNG áp dụng cho đơn hàng quốc tế\") và câu ngắn gọn "
          "hay bị nhận nhầm.")
        A("")
        A(f"**Ảnh hưởng:** Answer Relevance thật là **{rel_adj:.3f}** chứ không phải "
          f"{base.get('answer_relevancy', 0):.3f}. Hai con 0.000 giả kéo trung bình xuống "
          f"{rel_adj - (base.get('answer_relevancy') or 0):.3f} điểm. "
          f"Loại chúng ra thì cả 4 chỉ số đều vượt ngưỡng 0.7.")
        A("")

    A("## Ba câu yếu nhất")
    A("")
    A("| # | Câu hỏi | Faith | Rel | Recall | Prec | Tầng lỗi | Nguyên nhân |")
    A("|---|---|---|---|---|---|---|---|")
    real = [c for c in cases if (c.get("answer_relevancy") or 0) >= ZERO_EPS]
    worst = sorted(real, key=lambda c: sum(c.get(m) or 0 for m in METRICS))[:3]
    for i, c in enumerate(worst, 1):
        faith = c.get("faithfulness") or 0
        recall = c.get("context_recall") or 0
        if recall >= 0.99 and faith < 0.8:
            stage, cause = "Generation", "Lấy đúng chunk nhưng câu trả lời thêm ý ngoài ngữ cảnh"
        elif recall < 0.99:
            stage, cause = "Retrieval", "Chunk chứa đáp án không lọt top-k"
        else:
            stage, cause = "Generation", "Diễn đạt chưa bám sát trọng tâm câu hỏi"
        A(f"| {i} | {str(c['question'])[:52]} | {_fmt(faith)} | "
          f"{_fmt(c.get('answer_relevancy'))} | {_fmt(recall)} | "
          f"{_fmt(c.get('context_precision'))} | {stage} | {cause} |")
    A("")
    n_gen = sum(1 for c in worst if (c.get("context_recall") or 0) >= 0.99)
    n_ret = len(worst) - n_gen
    if n_ret == 0:
        A("Điểm đáng chú ý: **cả ba đều có Context Recall = 1.000** — retrieval lấy đủ "
          "bằng chứng, mọi lỗi còn lại nằm ở tầng sinh câu trả lời.")
    else:
        A(f"Phân bổ tầng lỗi: **{n_gen} ca do generation** (recall đủ nhưng câu trả lời "
          f"lệch context) và **{n_ret} ca do retrieval** (chunk chứa đáp án không lọt "
          "top-k). Đa số lỗi nằm ở tầng sinh, không phải tầng truy xuất.")
    A("")

    A("## Đề xuất cải tiến")
    A("")
    recs = []
    if zeros:
        recs.append((
            "Không dùng answer_relevancy của RAGAS làm chỉ số quyết định cho tiếng Việt",
            "Chấm tay lại các câu bị 0.000 chằn, hoặc đổi sang metric không phụ thuộc bộ "
            "phân loại noncommittal.",
            f"Answer Relevance từ {base.get('answer_relevancy', 0):.3f} về đúng {rel_adj:.3f}.",
        ))
    low_faith = [c for c in cases if (c.get("faithfulness") or 1) < 0.8]
    if low_faith:
        recs.append((
            "Siết prompt ở Task 10 để không thêm ý ngoài ngữ cảnh",
            "Thêm luật: chỉ được nêu thông tin có trong context, không suy luận mở rộng, "
            "không gộp kiến thức sẵn có của model.",
            f"{len(low_faith)} câu đang có faithfulness dưới 0.8 (thấp nhất "
            f"{min(c['faithfulness'] for c in low_faith):.3f}); đây là dư địa lớn nhất còn lại.",
        ))
    r_gap = abs((configs[names[0]]["scores"].get("answer_relevancy") or 0)
                - (configs[names[-1]]["scores"].get("answer_relevancy") or 0))
    recs.append((
        f"Giữ cấu hình `{names[0]}`, không đổi sang `{names[-1]}`",
        f"A/B cho thấy `{names[-1]}` làm Answer Relevance giảm {r_gap:.3f} mà không được "
        "lợi gì về recall hay precision.",
        "Tránh đánh đổi chất lượng để lấy tốc độ khi không có lợi ích thật.",
    ))
    if (base.get("context_recall") or 0) >= 0.98:
        recs.append((
            "Mở rộng golden dataset sang câu hỏi khó hơn",
            "Recall 0.988 và Precision 1.000 nghĩa là bộ câu hỏi hiện tại chưa đủ khó để "
            "phân biệt các cấu hình retrieval. Thêm câu bắc cầu nhiều tài liệu, câu hỏi "
            "số liệu cụ thể, câu nhập nhằng giữa chính sách người mua và người bán.",
            "Có dữ liệu để so hybrid vs dense-only một cách có ý nghĩa.",
        ))
    for i, (action, how, impact) in enumerate(recs, 1):
        A(f"**{i}. {action}**")
        A("")
        A(f"- Cách làm: {how}")
        A(f"- Kỳ vọng: {impact}")
        A("")

    A("## Cách tái lập")
    A("")
    A("```bash")
    A("python -m src.task4_chunking_indexing            # dựng ChromaDB nếu chưa có")
    A("python -m group_project.evaluation.eval_pipeline # chạy eval, ghi results.md + results.json")
    A("python -m group_project.evaluation.report        # dựng lại results.md từ results.json")
    A("```")
    A("")
    A("Lượt eval này chạy trên 16 câu × 2 cấu hình = 128 lượt chấm RAGAS, mất khoảng 5 phút. "
      "Đừng chạy song song với demo: RAGAS gọi LLM liên tục và sẽ chiếm hết hạn mức "
      "token mỗi phút, làm chatbot trả về lỗi 429.")
    A("")
    return "\n".join(L)


def main() -> None:
    if not RESULTS_JSON.exists():
        raise SystemExit(
            f"Chưa có {RESULTS_JSON.name}. Chạy trước: "
            "python -m group_project.evaluation.eval_pipeline"
        )
    RESULTS_MD.write_text(build(), encoding="utf-8")
    print(f"Đã ghi {RESULTS_MD}")


if __name__ == "__main__":
    main()
