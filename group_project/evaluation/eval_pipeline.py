"""Evaluate a RAG pipeline with RAGAS and export a Markdown report."""

import json
from collections.abc import Mapping
from pathlib import Path

GOLDEN_DATASET_PATH = Path(__file__).parent / "golden_dataset.json"
RESULTS_PATH = Path(__file__).parent / "results.md"
METRICS = (
    "faithfulness",
    "answer_relevancy",
    "context_recall",
    "context_precision",
)


def load_golden_dataset() -> list[dict]:
    """Load the golden dataset from JSON."""
    with GOLDEN_DATASET_PATH.open(encoding="utf-8") as file:
        return json.load(file)


def _generate(rag_pipeline, question: str) -> dict:
    generator = getattr(rag_pipeline, "generate_with_citation", rag_pipeline)
    if not callable(generator):
        raise TypeError("rag_pipeline must be callable or expose generate_with_citation().")

    result = generator(question)
    if not isinstance(result, dict) or "answer" not in result:
        raise ValueError("The pipeline result must contain an 'answer' field.")
    return result


def evaluate_with_ragas(rag_pipeline, golden_dataset: list[dict]) -> dict:
    """Evaluate one configured RAG pipeline using RAGAS 0.1.x metrics."""
    from datasets import Dataset
    from ragas import evaluate
    from ragas.metrics import (
        answer_relevancy,
        context_precision,
        context_recall,
        faithfulness,
    )

    eval_data = {"question": [], "answer": [], "contexts": [], "ground_truth": []}
    for item in golden_dataset:
        result = _generate(rag_pipeline, item["question"])
        eval_data["question"].append(item["question"])
        eval_data["answer"].append(result["answer"])
        eval_data["contexts"].append(
            [source.get("content", "") for source in result.get("sources", [])]
        )
        eval_data["ground_truth"].append(item["expected_answer"])

    frame = evaluate(
        Dataset.from_dict(eval_data),
        metrics=[faithfulness, answer_relevancy, context_recall, context_precision],
    ).to_pandas()
    cases = frame.to_dict(orient="records")
    scores = {
        metric: float(frame[metric].mean()) if metric in frame else 0.0
        for metric in METRICS
    }
    return {"scores": scores, "cases": cases}


def compare_configs(
    configured_pipelines: Mapping[str, object], golden_dataset: list[dict]
) -> dict:
    """Evaluate at least two already-configured pipeline variants."""
    if len(configured_pipelines) < 2:
        raise ValueError("Provide at least two configured pipelines for A/B comparison.")
    return {
        name: evaluate_with_ragas(pipeline, golden_dataset)
        for name, pipeline in configured_pipelines.items()
    }


def _score(value: float | None) -> str:
    return "-" if value is None else f"{value:.3f}"


def _worst_cases(cases: list[dict]) -> list[dict]:
    def average(case: dict) -> float:
        values = [case.get(metric) for metric in METRICS]
        numeric = [value for value in values if isinstance(value, (int, float))]
        return sum(numeric) / len(numeric) if numeric else 0.0

    return sorted(cases, key=average)[:3]


def _recommendations(scores: dict[str, float]) -> list[str]:
    actions = []
    if scores.get("context_recall", 1.0) < 0.7:
        actions.append("Mở rộng hoặc cải thiện retriever để tăng context recall.")
    if scores.get("context_precision", 1.0) < 0.7:
        actions.append("Điều chỉnh top-k hoặc thêm reranking để loại context không liên quan.")
    if scores.get("faithfulness", 1.0) < 0.7:
        actions.append("Siết prompt để câu trả lời chỉ dùng evidence được truy xuất.")
    if scores.get("answer_relevancy", 1.0) < 0.7:
        actions.append("Tinh chỉnh prompt trả lời trực tiếp và đầy đủ câu hỏi của người dùng.")
    return actions or ["Các metric hiện ổn định; mở rộng golden dataset để kiểm thử thêm edge case."]


def export_results(results: dict, comparison: dict) -> None:
    """Write RAGAS scores, A/B comparison, worst cases, and recommendations."""
    baseline_scores = results["scores"]
    config_names = list(comparison)
    comparison_rows = []
    for metric in METRICS:
        values = [comparison[name]["scores"].get(metric) for name in config_names]
        comparison_rows.append(
            f"| {metric} | " + " | ".join(_score(value) for value in values) + " |"
        )

    header = "| Metric | " + " | ".join(config_names) + " |"
    divider = "|---|" + "|".join("---" for _ in config_names) + "|"
    worst_rows = []
    for index, case in enumerate(_worst_cases(results["cases"]), start=1):
        values = [case.get(metric) for metric in METRICS]
        failure_metric = min(
            METRICS,
            key=lambda metric: case.get(metric, 0.0) if case.get(metric) is not None else 0.0,
        )
        question = str(case.get("question", "")).replace("|", "\\|")
        worst_rows.append(
            f"| {index} | {question} | "
            + " | ".join(_score(value) for value in values)
            + f" | {failure_metric} |"
        )

    report = [
        "# RAG Evaluation Results",
        "",
        "## Framework",
        "",
        "RAGAS (faithfulness, answer relevancy, context recall, context precision).",
        "",
        "## Overall Scores",
        "",
        "| Metric | Score |",
        "|---|---|",
        *[f"| {metric} | {_score(baseline_scores.get(metric))} |" for metric in METRICS],
        "",
        "## A/B Comparison",
        "",
        header,
        divider,
        *comparison_rows,
        "",
        "## Worst Performers",
        "",
        "| # | Question | Faithfulness | Relevance | Recall | Precision | Weakest metric |",
        "|---|---|---|---|---|---|---|",
        *(worst_rows or ["| - | No cases | - | - | - | - | - |"]),
        "",
        "## Recommendations",
        "",
        *[f"- {action}" for action in _recommendations(baseline_scores)],
        "",
    ]
    RESULTS_PATH.write_text("\n".join(report), encoding="utf-8")


def main() -> None:
    """Run an A/B evaluation with two retrieval-context sizes."""
    ROOT_DIR = Path(__file__).parent.parent.parent
    import sys

    if str(ROOT_DIR) not in sys.path:
        sys.path.insert(0, str(ROOT_DIR))
    from src.task10_generation import generate_with_citation

    golden_dataset = load_golden_dataset()
    comparison = compare_configs(
        {
            "top_k_5": lambda question: generate_with_citation(question, top_k=5),
            "top_k_3": lambda question: generate_with_citation(question, top_k=3),
        },
        golden_dataset,
    )
    results = comparison["top_k_5"]
    export_results(results, comparison)
    print(f"Evaluated {len(golden_dataset)} test cases and wrote {RESULTS_PATH}")


if __name__ == "__main__":
    main()
