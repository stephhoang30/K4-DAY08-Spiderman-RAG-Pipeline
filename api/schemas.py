"""
Contract giữa backend và frontend.

Đây là nguồn sự thật duy nhất về shape dữ liệu. Frontend (`frontend/lib/types.ts`)
phải khớp với các model ở đây. Đổi gì ở đây thì phải đổi cả hai bên.

Nguyên tắc đặt tên: giữ đúng thuật ngữ của bài lab (cosine, rrf, rerank, fallback)
để đọc code là biết đang ở tầng nào của pipeline.
"""

from typing import Literal, Optional

from pydantic import BaseModel, Field

DocType = Literal["legal", "news"]
CustomerRole = Literal["buyer", "seller", "both"]
StageKey = Literal["semantic", "lexical", "merge", "rerank", "fallback", "generation"]
# "live"  = đang chạy code thật
# "mock"  = task chưa implement, trả dữ liệu giả
Wiring = Literal["live", "mock"]


# ---------------------------------------------------------------------------
# Chunk & tài liệu
# ---------------------------------------------------------------------------

class ChunkHit(BaseModel):
    """Một chunk trả về từ bất kỳ tầng truy xuất nào."""

    chunk_id: str
    content: str
    source: str = Field(description="Tên file gốc, ví dụ chinh-sach-bao-mat-shopee.pdf")
    doc_type: DocType
    customer_role: CustomerRole
    chunk_index: int
    title: Optional[str] = None
    url: Optional[str] = None

    # QUAN TRỌNG: 3 loại điểm dưới đây phải giữ TÁCH RIÊNG, đừng gộp làm một.
    # Task 9 cần cosine gốc để quyết định fallback; nếu chỉ còn điểm RRF thì
    # ngưỡng 0.48 vô nghĩa (điểm RRF top-1 luôn ≈ 0.0164–0.0328 bất kể nội dung).
    cosine: Optional[float] = Field(None, description="Cosine gốc từ semantic search [0,1]")
    bm25: Optional[float] = Field(None, description="Điểm BM25 thô, không chặn trên")
    rrf: Optional[float] = Field(None, description="Điểm sau Reciprocal Rank Fusion")
    rerank: Optional[float] = Field(None, description="Điểm cross-encoder sau rerank")
    rank: Optional[int] = Field(None, description="Thứ hạng trong tầng hiện tại, bắt đầu từ 1")


class DocumentSummary(BaseModel):
    doc_id: str
    title: str
    file_name: str
    standardized_file: str
    doc_type: DocType
    customer_role: CustomerRole
    url: Optional[str] = None
    chunk_count: int
    char_count: int
    token_count: int


class KnowledgeStats(BaseModel):
    documents: int
    chunks: int
    chars: int
    tokens: int
    embedding_model: str
    embedding_dim: int
    chunk_size: int
    chunk_overlap: int
    vector_store: str
    collection: str
    distance: str
    by_doc_type: dict[str, int]
    by_customer_role: dict[str, int]


# ---------------------------------------------------------------------------
# Truy xuất
# ---------------------------------------------------------------------------

class StageResult(BaseModel):
    """Kết quả của một tầng trong pipeline."""

    key: StageKey
    label: str
    wiring: Wiring
    duration_ms: float
    hits: list[ChunkHit] = []
    note: Optional[str] = None


class FallbackDecision(BaseModel):
    """
    Vì sao fallback được (hoặc không được) kích hoạt.

    So `top_cosine` với `threshold` — KHÔNG so bằng `top_rrf`. Trường `top_rrf`
    có mặt ở đây chỉ để frontend hiển thị song song, cho thấy vì sao dùng nó
    làm ngưỡng là sai.
    """

    triggered: bool
    threshold: float
    top_cosine: float
    top_rrf: Optional[float] = None
    reason: str


class RetrieveRequest(BaseModel):
    query: str
    top_k: int = 5
    score_threshold: float = 0.48
    use_reranking: bool = True


class RetrieveResponse(BaseModel):
    query: str
    stages: list[StageResult]
    fallback: FallbackDecision
    results: list[ChunkHit] = Field(description="Kết quả cuối cùng, đã sắp xếp")
    total_ms: float


# ---------------------------------------------------------------------------
# Sinh câu trả lời
# ---------------------------------------------------------------------------

class ChatRequest(BaseModel):
    query: str
    top_k: int = 5


class ChatResponse(BaseModel):
    query: str
    answer: str
    sources: list[ChunkHit]
    retrieval_source: Literal["hybrid", "pageindex", "none"]
    stages: list[StageResult]
    total_ms: float
    wiring: Wiring


# ---------------------------------------------------------------------------
# Tình trạng đấu nối
# ---------------------------------------------------------------------------

class GoldenCase(BaseModel):
    """Một cặp Q&A trong golden dataset."""

    question: str
    expected_answer: str
    expected_context: Optional[str] = None


class EvalConfigScores(BaseModel):
    """Điểm 4 chỉ số RAGAS của một cấu hình."""

    config: str
    faithfulness: Optional[float] = None
    answer_relevancy: Optional[float] = None
    context_recall: Optional[float] = None
    context_precision: Optional[float] = None
    average: Optional[float] = None


class EvalWorstCase(BaseModel):
    question: str
    faithfulness: Optional[float] = None
    answer_relevancy: Optional[float] = None
    context_recall: Optional[float] = None
    context_precision: Optional[float] = None
    weakest_metric: Optional[str] = None


class EvaluationResponse(BaseModel):
    """
    Kết quả evaluation.

    `has_results=False` nghĩa là chưa ai chạy `python -m group_project.evaluation.eval_pipeline`.
    Endpoint này KHÔNG tự chạy RAGAS: một lần chạy gọi LLM rất nhiều lần, mất vài phút
    và dễ chạm rate limit — không hợp để nằm sau một request HTTP.
    """

    has_results: bool
    framework: Optional[str] = None
    blocked_reason: Optional[str] = Field(
        None, description="Vì sao chưa chạy được, nếu has_results=False"
    )
    golden_total: int = 0
    golden_required: int = 15
    golden_cases: list[GoldenCase] = []
    configs: list[EvalConfigScores] = []
    baseline_config: Optional[str] = None
    worst_cases: list[EvalWorstCase] = []
    recommendations: list[str] = []
    results_md: Optional[str] = None


class StageWiring(BaseModel):
    key: str
    task: str
    label: str
    wiring: Wiring
    detail: str


class HealthResponse(BaseModel):
    ok: bool
    chroma_ready: bool
    chunks_indexed: int
    stages: list[StageWiring]
    live_count: int
    total_count: int
