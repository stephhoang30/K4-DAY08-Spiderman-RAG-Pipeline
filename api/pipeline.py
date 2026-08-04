"""
Lớp trung gian giữa FastAPI và các hàm Task 4-10 trong src/.

Mục đích: frontend gọi API được NGAY BÂY GIỜ, kể cả khi Task 5-10 chưa xong.
Mỗi tầng tự dò xem hàm tương ứng đã implement chưa:
    - đã implement  -> gọi hàm thật, đánh dấu wiring="live"
    - còn stub      -> trả dữ liệu mock, đánh dấu wiring="mock"

Nhờ vậy frontend không phải chờ backend xong mới nối, và mỗi khi một task được
implement thì tầng đó tự chuyển sang "live" mà KHÔNG phải sửa dòng nào ở đây.

Cách cắm task của bạn vào (dành cho thành viên nhóm):
    1. Implement hàm trong src/taskN_*.py theo đúng chữ ký sẵn có
    2. Bỏ dòng `raise NotImplementedError`
    3. Xong. Gọi GET /api/health để xác nhận tầng đó đã thành "live"

Hàm của bạn trả về list[dict] với key 'content', 'score', 'metadata' như docstring
mô tả — lớp này lo phần đổi sang schema của API.
"""

import inspect
import time
from typing import Callable, Optional

from .schemas import ChunkHit, FallbackDecision, StageResult, StageWiring

# ---------------------------------------------------------------------------
# Dò xem một task đã được implement chưa
# ---------------------------------------------------------------------------

def _is_implemented(fn: Optional[Callable]) -> bool:
    """
    Đoán nhanh xem hàm đã implement chưa, KHÔNG gọi thử.

    Chỉ đếm `raise NotImplementedError` ở những dòng còn "sống": bỏ qua dòng nằm
    sau `return` trong cùng mức thụt lề, vì nhiều người implement xong nhưng để
    lại dòng raise cũ phía dưới thành code chết — đọc thô sẽ báo nhầm là chưa xong.

    Đây chỉ là gợi ý cho GET /api/health. Quyết định thật nằm ở `_call_or_mock()`:
    nó gọi hàm và bắt NotImplementedError, nên dù đoán sai thì kết quả vẫn đúng.
    """
    if fn is None:
        return False
    try:
        src = inspect.getsource(fn)
    except (OSError, TypeError):
        return False

    seen_return = False
    for raw in src.splitlines():
        line = raw.strip()
        if line.startswith("#") or not line:
            continue
        if line.startswith("return "):
            seen_return = True
        if "raise NotImplementedError" in line and not seen_return:
            return False
    return True


def _call_or_mock(fn: Optional[Callable], *args) -> tuple[Optional[object], float, Optional[str]]:
    """
    Gọi hàm task, trả (kết quả, ms, lỗi).

    Đây mới là chỗ quyết định live/mock: hàm còn stub thì ném NotImplementedError
    và ta bắt được, không phụ thuộc vào việc đọc source đoán đúng hay sai.
    """
    if fn is None:
        return None, 0.0, "không import được module"
    t = time.perf_counter()
    try:
        out = fn(*args)
        return out, round((time.perf_counter() - t) * 1000, 1), None
    except NotImplementedError:
        return None, 0.0, "còn raise NotImplementedError"
    except Exception as e:
        return None, round((time.perf_counter() - t) * 1000, 1), f"{type(e).__name__}: {e}"


def _load(module_path: str, fn_name: str) -> Optional[Callable]:
    """Import một hàm trong src/, trả None nếu import lỗi."""
    try:
        import importlib

        mod = importlib.import_module(module_path)
        return getattr(mod, fn_name, None)
    except Exception:
        return None


# Bảng đăng ký các tầng. Thêm task mới thì thêm một dòng ở đây.
STAGES = [
    ("semantic", "Task 5", "Semantic Search", "src.task5_semantic_search", "semantic_search"),
    ("lexical", "Task 6", "Lexical BM25", "src.task6_lexical_search", "lexical_search"),
    ("merge", "Task 7", "RRF Merge", "src.task7_reranking", "rerank_rrf"),
    ("rerank", "Task 7", "Cross-encoder Rerank", "src.task7_reranking", "rerank_cross_encoder"),
    ("fallback", "Task 8", "PageIndex Vectorless", "src.task8_pageindex_vectorless", "pageindex_search"),
    ("pipeline", "Task 9", "Retrieval Pipeline", "src.task9_retrieval_pipeline", "retrieve"),
    ("generation", "Task 10", "Generation có Citation", "src.task10_generation", "generate_with_citation"),
]


def wiring_report() -> list[StageWiring]:
    """Tình trạng đấu nối của từng tầng, dùng cho GET /api/health."""
    out = []
    for key, task, label, mod, fn_name in STAGES:
        fn = _load(mod, fn_name)
        live = _is_implemented(fn)
        if fn is None:
            detail = f"Không import được {mod}.{fn_name}"
        elif live:
            detail = f"{mod}.{fn_name}() đã implement"
        else:
            detail = f"{mod}.{fn_name}() còn raise NotImplementedError — đang trả mock"
        out.append(
            StageWiring(key=key, task=task, label=label,
                        wiring="live" if live else "mock", detail=detail)
        )
    return out


# ---------------------------------------------------------------------------
# Truy cập ChromaDB — dùng ngay được vì Task 4 đã xong
# ---------------------------------------------------------------------------

_collection = None
_embedder = None


def get_collection():
    """Collection ChromaDB do Task 4 tạo. Cache lại để không mở đi mở lại."""
    global _collection
    if _collection is None:
        from src.task4_chunking_indexing import get_collection as _get
        _collection = _get()
    return _collection


def get_embedder():
    """Model embedding của Task 4. Lần gọi đầu mất ~30s để nạp bge-m3."""
    global _embedder
    if _embedder is None:
        from src.task4_chunking_indexing import get_embedding_model as _get
        _embedder = _get()
    return _embedder


def chroma_ready() -> tuple[bool, int]:
    """(sẵn sàng chưa, số chunk đã index). Chưa chạy Task 4 thì trả (False, 0)."""
    try:
        return True, get_collection().count()
    except Exception:
        return False, 0


def _hit_from_chroma(doc: str, meta: dict, distance: float, rank: int) -> ChunkHit:
    """Đổi một bản ghi ChromaDB sang schema của API."""
    return ChunkHit(
        chunk_id=f"{meta.get('source', 'unknown')}_chunk_{meta.get('chunk_index', 0)}",
        content=doc,
        source=meta.get("source", "unknown"),
        doc_type=meta.get("doc_type", "legal"),
        customer_role=meta.get("customer_role", "both"),
        chunk_index=int(meta.get("chunk_index", 0)),
        title=meta.get("title"),
        url=meta.get("url"),
        cosine=round(max(0.0, 1.0 - distance), 4),
        rank=rank,
    )


def semantic_search_live(query: str, top_k: int = 10) -> list[ChunkHit]:
    """
    Semantic search thật trên ChromaDB.

    Cố tình KHÔNG gọi src.task5_semantic_search để không giẫm chân người đang làm
    Task 5 — chỉ dùng collection và model của Task 4. Khi Task 5 xong, hàm
    run_semantic() bên dưới sẽ tự ưu tiên gọi hàm của Task 5.
    """
    vec = get_embedder().encode(query).tolist()
    res = get_collection().query(
        query_embeddings=[vec], n_results=top_k,
        include=["documents", "metadatas", "distances"],
    )
    return [
        _hit_from_chroma(d, m, dist, i)
        for i, (d, m, dist) in enumerate(
            zip(res["documents"][0], res["metadatas"][0], res["distances"][0]), 1
        )
    ]


# ---------------------------------------------------------------------------
# Chạy từng tầng: ưu tiên hàm thật, không có thì mock
# ---------------------------------------------------------------------------

def _timed(fn, *args, **kwargs) -> tuple[object, float]:
    t = time.perf_counter()
    out = fn(*args, **kwargs)
    return out, round((time.perf_counter() - t) * 1000, 1)


def _hits_from_task(rows: list[dict], score_field: str) -> list[ChunkHit]:
    """Đổi list[dict] mà các task trả về sang list[ChunkHit]."""
    hits = []
    for i, r in enumerate(rows, 1):
        meta = r.get("metadata", {}) or {}
        hit = ChunkHit(
            chunk_id=f"{meta.get('source', 'unknown')}_chunk_{meta.get('chunk_index', 0)}",
            content=r.get("content", ""),
            source=meta.get("source", "unknown"),
            doc_type=meta.get("doc_type", meta.get("type", "legal")),
            customer_role=meta.get("customer_role", "both"),
            chunk_index=int(meta.get("chunk_index", 0)),
            title=meta.get("title"),
            url=meta.get("url"),
            rank=i,
        )
        setattr(hit, score_field, round(float(r.get("score", 0.0)), 4))
        hits.append(hit)
    return hits


def run_semantic(query: str, top_k: int) -> StageResult:
    """Task 5 nếu đã xong, không thì dùng ChromaDB trực tiếp (vẫn là dữ liệu thật)."""
    fn = _load("src.task5_semantic_search", "semantic_search")
    if _is_implemented(fn):
        try:
            rows, ms = _timed(fn, query, top_k)
            return StageResult(key="semantic", label="Semantic Search", wiring="live",
                               duration_ms=ms, hits=_hits_from_task(rows, "cosine"),
                               note="src.task5_semantic_search.semantic_search()")
        except Exception as e:
            return StageResult(key="semantic", label="Semantic Search", wiring="mock",
                               duration_ms=0.0, hits=[], note=f"Task 5 lỗi: {e}")

    hits, ms = _timed(semantic_search_live, query, top_k)
    return StageResult(key="semantic", label="Semantic Search", wiring="live",
                       duration_ms=ms, hits=hits,
                       note="ChromaDB trực tiếp (Task 4) — Task 5 chưa implement")


def run_lexical(query: str, top_k: int) -> StageResult:
    fn = _load("src.task6_lexical_search", "lexical_search")
    rows, ms, err = _call_or_mock(fn, query, top_k)
    if err is not None:
        return StageResult(key="lexical", label="Lexical BM25", wiring="mock",
                           duration_ms=ms, hits=[], note=f"Task 6 {err}")

    hits = _hits_from_task(rows or [], "bm25")
    note = "src.task6_lexical_search.lexical_search()"
    if not hits:
        # BM25 khớp từ khoá nguyên văn: truy vấn tiếng Anh trên kho tiếng Việt
        # sẽ ra 0 kết quả. Không phải lỗi, nhưng phải nói rõ kẻo tưởng hỏng.
        note += " — 0 kết quả (BM25 khớp nguyên văn, kiểm tra ngôn ngữ truy vấn)"
    return StageResult(key="lexical", label="Lexical BM25", wiring="live",
                       duration_ms=ms, hits=hits, note=note)


def run_merge(dense: list[ChunkHit], sparse: list[ChunkHit], top_k: int) -> StageResult:
    """Gộp RRF. Task 7 xong thì dùng, chưa thì tự tính tại chỗ (công thức giống hệt)."""
    fn = _load("src.task7_reranking", "rerank_rrf")
    k = 60

    def _local_rrf():
        scores: dict[str, float] = {}
        keep: dict[str, ChunkHit] = {}
        for lst in (dense, sparse):
            for rank, h in enumerate(lst, 1):
                scores[h.chunk_id] = scores.get(h.chunk_id, 0.0) + 1.0 / (k + rank)
                keep.setdefault(h.chunk_id, h)
        merged = []
        for rank, (cid, s) in enumerate(
            sorted(scores.items(), key=lambda x: -x[1])[:top_k], 1
        ):
            h = keep[cid].model_copy()
            h.rrf, h.rank = round(s, 6), rank
            merged.append(h)
        return merged

    payload = [
        [{"content": h.content, "score": h.cosine or h.bm25 or 0.0,
          "metadata": {"source": h.source, "chunk_index": h.chunk_index,
                       "doc_type": h.doc_type, "customer_role": h.customer_role}}
         for h in lst]
        for lst in (dense, sparse)
    ]
    rows, ms, err = _call_or_mock(fn, payload, top_k)
    if err is None and rows:
        hits = _carry_scores(_hits_from_task(rows, "rrf"), dense + sparse)
        return StageResult(key="merge", label="RRF Merge", wiring="live",
                           duration_ms=ms, hits=hits,
                           note=f"src.task7_reranking.rerank_rrf() · k={k}")

    hits, ms_local = _timed(_local_rrf)
    reason = err or "trả về rỗng"
    return StageResult(key="merge", label="RRF Merge", wiring="mock",
                       duration_ms=ms_local, hits=hits,
                       note=f"RRF tính tại chỗ (k={k}) — Task 7 {reason}")


def _carry_scores(new: list[ChunkHit], known: list[ChunkHit]) -> list[ChunkHit]:
    """
    Giữ lại điểm của các tầng trước khi đi qua một tầng mới.

    Hàm của các task chỉ trả về một trường 'score', nên nếu không gộp lại thì sau
    rerank sẽ mất cosine và rrf — trong khi frontend cần cả ba để vẽ đường đổi hạng
    qua từng tầng và để hiện song song cosine/RRF ở khối ngưỡng fallback.
    """
    by_id = {h.chunk_id: h for h in known}
    for h in new:
        prev = by_id.get(h.chunk_id)
        if prev is None:
            continue
        h.cosine = h.cosine if h.cosine is not None else prev.cosine
        h.bm25 = h.bm25 if h.bm25 is not None else prev.bm25
        h.rrf = h.rrf if h.rrf is not None else prev.rrf
    return new


def run_rerank(query: str, candidates: list[ChunkHit], top_k: int) -> StageResult:
    fn = _load("src.task7_reranking", "rerank_cross_encoder")
    payload = [
        {"content": h.content, "score": h.rrf or 0.0,
         "metadata": {"source": h.source, "chunk_index": h.chunk_index,
                      "doc_type": h.doc_type, "customer_role": h.customer_role}}
        for h in candidates
    ]
    rows, ms, err = _call_or_mock(fn, query, payload, top_k)
    if err is not None:
        return StageResult(key="rerank", label="Cross-encoder Rerank", wiring="mock",
                           duration_ms=ms, hits=candidates[:top_k],
                           note=f"Task 7 rerank {err} — giữ nguyên thứ tự RRF")

    hits = _carry_scores(_hits_from_task(rows or [], "rerank"), candidates)
    return StageResult(key="rerank", label="Cross-encoder Rerank", wiring="live",
                       duration_ms=ms, hits=hits,
                       note="src.task7_reranking.rerank_cross_encoder()")


def decide_fallback(dense: list[ChunkHit], merged: list[ChunkHit],
                    threshold: float) -> FallbackDecision:
    """
    So COSINE GỐC với ngưỡng — không dùng điểm RRF.

    Điểm RRF chỉ phụ thuộc thứ hạng: top-1 luôn ≈ 1/(60+1)=0.0164 (một danh sách)
    hoặc ≈ 0.0328 (có mặt ở cả hai), bất kể nội dung có liên quan hay không.
    Lấy nó so ngưỡng thì fallback hoặc luôn bật, hoặc không bao giờ bật.
    """
    top_cos = dense[0].cosine if dense and dense[0].cosine is not None else 0.0
    top_rrf = merged[0].rrf if merged and merged[0].rrf is not None else None
    triggered = top_cos < threshold
    if triggered:
        reason = (f"Cosine gốc top-1 {top_cos:.4f} < ngưỡng {threshold} "
                  f"→ hybrid không đủ tin cậy, chuyển sang PageIndex.")
    else:
        reason = (f"Cosine gốc top-1 {top_cos:.4f} ≥ ngưỡng {threshold} "
                  f"→ giữ kết quả hybrid, không cần PageIndex.")
    return FallbackDecision(triggered=triggered, threshold=threshold,
                            top_cosine=round(top_cos, 4), top_rrf=top_rrf, reason=reason)


def run_task9(query: str, top_k: int, threshold: float, use_reranking: bool) -> Optional[StageResult]:
    """
    Gọi pipeline hoàn chỉnh của Task 9.

    Task 9 mới là bài nộp được chấm, nên khi nó đã implement thì kết quả CUỐI CÙNG
    phải lấy từ đây, không phải từ chuỗi tầng mà api/ tự ghép. Chuỗi tầng vẫn chạy
    song song vì Task 9 chỉ trả danh sách cuối, không trả chi tiết từng bước —
    mà frontend cần chi tiết đó để vẽ trace.

    Trả None nếu Task 9 chưa implement, để chỗ gọi tự lo phần dự phòng.
    """
    fn = _load("src.task9_retrieval_pipeline", "retrieve")
    rows, ms, err = _call_or_mock(fn, query, top_k, threshold, use_reranking)
    if err is not None:
        return StageResult(key="rerank", label="Pipeline Task 9", wiring="mock",
                           duration_ms=ms, hits=[], note=f"Task 9 {err}")

    hits = _hits_from_task(rows or [], "rerank")
    # retrieve() gắn item["source"] = "hybrid" | "pageindex"
    via = (rows or [{}])[0].get("source", "hybrid") if rows else "none"
    return StageResult(key="rerank", label="Pipeline Task 9", wiring="live",
                       duration_ms=ms, hits=hits,
                       note=f"src.task9_retrieval_pipeline.retrieve() · nguồn: {via}")


def run_fallback(query: str, top_k: int) -> StageResult:
    fn = _load("src.task8_pageindex_vectorless", "pageindex_search")
    if not _is_implemented(fn):
        return StageResult(key="fallback", label="PageIndex Vectorless", wiring="mock",
                           duration_ms=0.0, hits=[],
                           note="Task 8 chưa implement — không có kết quả fallback")
    try:
        rows, ms = _timed(fn, query, top_k)
        return StageResult(key="fallback", label="PageIndex Vectorless", wiring="live",
                           duration_ms=ms, hits=_hits_from_task(rows, "cosine"),
                           note="src.task8_pageindex_vectorless.pageindex_search()")
    except Exception as e:
        return StageResult(key="fallback", label="PageIndex Vectorless", wiring="mock",
                           duration_ms=0.0, hits=[], note=f"Task 8 lỗi: {e}")
