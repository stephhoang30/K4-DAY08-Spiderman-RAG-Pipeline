"""
FastAPI backend cho RAG Pipeline demo.

Chạy:
    .venv/bin/uvicorn api.main:app --reload --port 8001

Tài liệu tự sinh: http://localhost:8001/docs

Backend này chạy được NGAY cả khi Task 5-10 chưa xong — tầng nào chưa có thì trả
mock và tự khai báo `wiring="mock"`. Gọi GET /api/health để xem tầng nào đã sống.
Xem api/README.md để biết cách cắm task của bạn vào.
"""

import json
import time
from collections import Counter
from functools import lru_cache
from pathlib import Path

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from . import pipeline as pl
from .schemas import (
    ChatRequest,
    ChatResponse,
    DocumentSummary,
    EvalConfigScores,
    EvaluationResponse,
    EvalWorstCase,
    GoldenCase,
    HealthResponse,
    KnowledgeStats,
    RetrieveRequest,
    RetrieveResponse,
    StageResult,
)

PROJECT_ROOT = Path(__file__).parent.parent
STANDARDIZED = PROJECT_ROOT / "data" / "standardized"
EVAL_DIR = PROJECT_ROOT / "group_project" / "evaluation"

app = FastAPI(
    title="RAG Pipeline API — E-commerce Support",
    description="Backend cho bài lab Ngày 8. Tầng nào chưa implement thì trả mock, xem /api/health.",
    version="0.1.0",
)

# Next.js dev chạy ở 3000; thêm cổng khác vào đây nếu cần.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Tình trạng đấu nối
# ---------------------------------------------------------------------------

@app.get("/api/health", response_model=HealthResponse)
def health() -> HealthResponse:
    """Tầng nào đang chạy code thật, tầng nào còn mock."""
    ready, count = pl.chroma_ready()
    stages = pl.wiring_report()
    live = sum(1 for s in stages if s.wiring == "live")
    return HealthResponse(
        ok=True, chroma_ready=ready, chunks_indexed=count,
        stages=stages, live_count=live, total_count=len(stages),
    )


# ---------------------------------------------------------------------------
# Kho tri thức — dữ liệu thật, Task 4 đã xong
# ---------------------------------------------------------------------------

@lru_cache(maxsize=1)
def _corpus_stats() -> dict:
    """Đọc ChromaDB + data/standardized/ một lần rồi cache."""
    col = pl.get_collection()
    data = col.get(include=["documents", "metadatas"])
    metas = data["metadatas"]

    chars_by_source: dict[str, int] = {}
    for md in STANDARDIZED.rglob("*.md"):
        landing = md.stem + (".pdf" if md.parent.name == "legal" else ".json")
        chars_by_source[landing] = len(md.read_text(encoding="utf-8"))

    per_doc: dict[str, dict] = {}
    for m in metas:
        src = m.get("source", "unknown")
        d = per_doc.setdefault(src, {
            "chunks": 0, "title": m.get("title", src), "url": m.get("url"),
            "doc_type": m.get("doc_type", "legal"),
            "customer_role": m.get("customer_role", "both"),
        })
        d["chunks"] += 1

    return {
        "total_chunks": len(metas),
        "per_doc": per_doc,
        "chars_by_source": chars_by_source,
        "by_doc_type": dict(Counter(m.get("doc_type", "legal") for m in metas)),
        "by_customer_role": dict(Counter(m.get("customer_role", "both") for m in metas)),
    }


@lru_cache(maxsize=1)
def _tokens_by_source() -> dict[str, int]:
    """Đếm token thật bằng tokenizer của bge-m3."""
    try:
        from transformers import AutoTokenizer

        tok = AutoTokenizer.from_pretrained("BAAI/bge-m3")
        out = {}
        for md in STANDARDIZED.rglob("*.md"):
            landing = md.stem + (".pdf" if md.parent.name == "legal" else ".json")
            text = md.read_text(encoding="utf-8")
            out[landing] = len(tok(text, add_special_tokens=False)["input_ids"])
        return out
    except Exception:
        return {}


def _require_chroma():
    ready, _ = pl.chroma_ready()
    if not ready:
        raise HTTPException(
            status_code=503,
            detail="Chưa có ChromaDB. Chạy: python -m src.task4_chunking_indexing",
        )


@app.get("/api/knowledge/stats", response_model=KnowledgeStats)
def knowledge_stats() -> KnowledgeStats:
    _require_chroma()
    from src.task4_chunking_indexing import (
        CHUNK_OVERLAP, CHUNK_SIZE, COLLECTION_NAME, EMBEDDING_DIM, EMBEDDING_MODEL,
    )

    s = _corpus_stats()
    tokens = _tokens_by_source()
    return KnowledgeStats(
        documents=len(s["per_doc"]),
        chunks=s["total_chunks"],
        chars=sum(s["chars_by_source"].values()),
        tokens=sum(tokens.values()),
        embedding_model=EMBEDDING_MODEL, embedding_dim=EMBEDDING_DIM,
        chunk_size=CHUNK_SIZE, chunk_overlap=CHUNK_OVERLAP,
        vector_store="chromadb", collection=COLLECTION_NAME, distance="cosine",
        by_doc_type=s["by_doc_type"], by_customer_role=s["by_customer_role"],
    )


@app.get("/api/knowledge/documents", response_model=list[DocumentSummary])
def knowledge_documents() -> list[DocumentSummary]:
    _require_chroma()
    s = _corpus_stats()
    tokens = _tokens_by_source()
    out = []
    for src, d in sorted(s["per_doc"].items(), key=lambda x: -x[1]["chunks"]):
        stem = src.rsplit(".", 1)[0]
        out.append(DocumentSummary(
            doc_id=stem, title=d["title"], file_name=src,
            standardized_file=f"{stem}.md",
            doc_type=d["doc_type"], customer_role=d["customer_role"], url=d["url"],
            chunk_count=d["chunks"],
            char_count=s["chars_by_source"].get(src, 0),
            token_count=tokens.get(src, 0),
        ))
    return out


@app.get("/api/knowledge/chunks")
def knowledge_chunks(
    source: str = Query(..., description="Tên file gốc, ví dụ chinh-sach-bao-mat-shopee.pdf"),
    limit: int = Query(50, ge=1, le=500),
):
    """Các chunk của một tài liệu, sắp theo chunk_index."""
    _require_chroma()
    res = pl.get_collection().get(
        where={"source": source}, include=["documents", "metadatas"], limit=limit
    )
    rows = sorted(
        zip(res["documents"], res["metadatas"]),
        key=lambda x: int(x[1].get("chunk_index", 0)),
    )
    return [
        {
            "chunk_id": f"{source}_chunk_{m.get('chunk_index', 0)}",
            "chunk_index": int(m.get("chunk_index", 0)),
            "content": d,
            "chars": len(d),
            "source": source,
            "doc_type": m.get("doc_type"),
            "customer_role": m.get("customer_role"),
        }
        for d, m in rows
    ]


# ---------------------------------------------------------------------------
# Truy xuất
# ---------------------------------------------------------------------------

@app.post("/api/retrieve", response_model=RetrieveResponse)
def retrieve(req: RetrieveRequest) -> RetrieveResponse:
    """
    Chạy 4 tầng truy xuất và trả về chi tiết từng tầng.

    Tầng nào chưa implement thì `wiring="mock"`, frontend cứ hiển thị bình thường
    nhưng biết mà gắn nhãn cho trung thực.
    """
    _require_chroma()
    t0 = time.perf_counter()
    pool = req.top_k * 2

    dense = pl.run_semantic(req.query, pool)
    sparse = pl.run_lexical(req.query, pool)
    merged = pl.run_merge(dense.hits, sparse.hits, pool)
    reranked = (
        pl.run_rerank(req.query, merged.hits, req.top_k)
        if req.use_reranking
        else StageResult(key="rerank", label="Cross-encoder Rerank", wiring="mock",
                         duration_ms=0.0, hits=merged.hits[: req.top_k],
                         note="use_reranking=false")
    )

    decision = pl.decide_fallback(dense.hits, merged.hits, req.score_threshold)
    stages = [dense, sparse, merged, reranked]

    # Task 9 là bài nộp được chấm — khi nó đã implement thì kết quả cuối lấy từ nó,
    # không phải từ chuỗi tầng mà api/ tự ghép. Chuỗi tầng ở trên vẫn chạy để
    # frontend có chi tiết vẽ trace, thứ mà retrieve() không trả về.
    task9 = pl.run_task9(req.query, req.top_k, req.score_threshold, req.use_reranking)
    if task9 is not None and task9.wiring == "live" and task9.hits:
        stages.append(task9)
        results = task9.hits[: req.top_k]
    else:
        results = reranked.hits[: req.top_k]
        if decision.triggered:
            fb = pl.run_fallback(req.query, req.top_k)
            stages.append(fb)
            if fb.hits:
                results = fb.hits[: req.top_k]

    return RetrieveResponse(
        query=req.query, stages=stages, fallback=decision, results=results,
        total_ms=round((time.perf_counter() - t0) * 1000, 1),
    )


# ---------------------------------------------------------------------------
# Sinh câu trả lời
# ---------------------------------------------------------------------------

@app.post("/api/chat", response_model=ChatResponse)
def chat(req: ChatRequest) -> ChatResponse:
    """
    Hỏi đáp end-to-end.

    Task 10 xong thì gọi generate_with_citation() thật. Chưa xong thì vẫn chạy
    truy xuất thật và trả về câu thông báo, để frontend nối được ngay từ bây giờ.
    """
    _require_chroma()
    t0 = time.perf_counter()

    r = retrieve(RetrieveRequest(query=req.query, top_k=req.top_k))
    fn = pl._load("src.task10_generation", "generate_with_citation")

    if pl._is_implemented(fn):
        try:
            out = fn(req.query, req.top_k)
            return ChatResponse(
                query=req.query, answer=out.get("answer", ""), sources=r.results,
                retrieval_source=out.get("retrieval_source", "hybrid"),
                stages=r.stages, wiring="live",
                total_ms=round((time.perf_counter() - t0) * 1000, 1),
            )
        except Exception as e:
            answer = f"Task 10 lỗi khi sinh câu trả lời: {e}"
    else:
        answer = (
            "**Task 10 chưa được implement** nên chưa sinh được câu trả lời.\n\n"
            f"Phần truy xuất đã chạy thật: lấy được {len(r.results)} đoạn, "
            f"cosine cao nhất {r.fallback.top_cosine:.4f} "
            f"(ngưỡng fallback {r.fallback.threshold}).\n\n"
            "Hoàn thiện `src/task10_generation.py` là câu trả lời tự động xuất hiện ở đây."
        )

    return ChatResponse(
        query=req.query, answer=answer, sources=r.results,
        retrieval_source="pageindex" if r.fallback.triggered else "hybrid",
        stages=r.stages, wiring="mock",
        total_ms=round((time.perf_counter() - t0) * 1000, 1),
    )


# ---------------------------------------------------------------------------
# Evaluation
# ---------------------------------------------------------------------------

_METRIC_KEYS = ("faithfulness", "answer_relevancy", "context_recall", "context_precision")


def _avg(d: dict) -> float | None:
    vals = [d.get(k) for k in _METRIC_KEYS]
    nums = [v for v in vals if isinstance(v, (int, float))]
    return round(sum(nums) / len(nums), 4) if nums else None


def _read_golden() -> list[GoldenCase]:
    path = EVAL_DIR / "golden_dataset.json"
    if not path.exists():
        return []
    try:
        raw = json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return []
    return [
        GoldenCase(
            question=item.get("question", ""),
            expected_answer=item.get("expected_answer", ""),
            expected_context=item.get("expected_context"),
        )
        for item in raw
    ]


@app.get("/api/evaluation", response_model=EvaluationResponse)
def evaluation() -> EvaluationResponse:
    """
    Kết quả evaluation đã chạy trước đó.

    KHÔNG tự chạy RAGAS ở đây: một lượt gọi LLM rất nhiều lần (nhiều lần mỗi
    metric mỗi câu hỏi), mất vài phút và dễ chạm rate limit — không hợp để nằm sau
    một request HTTP. Chạy offline bằng:

        python -m group_project.evaluation.eval_pipeline

    Lệnh đó ghi results.md (cho người đọc) và results.json (cho endpoint này).
    """
    golden = _read_golden()
    md_path = EVAL_DIR / "results.md"
    json_path = EVAL_DIR / "results.json"

    results_md = md_path.read_text(encoding="utf-8") if md_path.exists() else None

    if not json_path.exists():
        # Nói rõ vì sao chưa có, thay vì trả rỗng để frontend tự đoán.
        gen = pl._load("src.task10_generation", "generate_with_citation")
        if not pl._is_implemented(gen):
            reason = (
                "Chưa chạy được: eval_pipeline gọi generate_with_citation() của Task 10, "
                "hàm này còn raise NotImplementedError."
            )
        else:
            reason = (
                "Chưa có results.json. Chạy: "
                "python -m group_project.evaluation.eval_pipeline"
            )
        return EvaluationResponse(
            has_results=False, blocked_reason=reason,
            golden_total=len(golden), golden_cases=golden, results_md=results_md,
        )

    data = json.loads(json_path.read_text(encoding="utf-8"))
    configs = [
        EvalConfigScores(config=name, average=_avg(payload.get("scores", {})),
                         **{k: payload.get("scores", {}).get(k) for k in _METRIC_KEYS})
        for name, payload in data.get("configs", {}).items()
    ]
    worst = []
    for case in data.get("worst_cases", []):
        scores = {k: case.get(k) for k in _METRIC_KEYS}
        nums = {k: v for k, v in scores.items() if isinstance(v, (int, float))}
        worst.append(EvalWorstCase(
            question=str(case.get("question", "")),
            weakest_metric=min(nums, key=nums.get) if nums else None, **scores,
        ))

    return EvaluationResponse(
        has_results=True,
        framework=data.get("framework", "ragas"),
        golden_total=data.get("golden_total", len(golden)),
        golden_cases=golden,
        configs=configs,
        baseline_config=next(iter(data.get("configs", {})), None),
        worst_cases=worst,
        recommendations=data.get("recommendations", []),
        results_md=results_md,
    )
