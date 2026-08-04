"""
Task 4 — Chunking & Indexing vào Vector Store.

Hướng dẫn:
    1. Đọc toàn bộ markdown files từ data/standardized/
    2. Chọn 1 chunking strategy (giải thích lý do)
    3. Chọn 1 embedding model (giải thích lý do)
    4. Index vào vector store (ChromaDB khuyến cáo — đơn giản, local, không cần Docker)

Chunking options (langchain-text-splitters):
    - RecursiveCharacterTextSplitter: an toàn, phổ biến
    - MarkdownHeaderTextSplitter: tốt cho file có heading
    - SemanticChunker: dùng embedding để tách (nâng cao)

Embedding model options:
    - sentence-transformers/all-MiniLM-L6-v2 (384 dim, nhẹ)
    - BAAI/bge-m3 (1024 dim, multilingual, tốt cho cả tiếng Việt lẫn tiếng Anh)
    - OpenAI text-embedding-3-small (1536 dim, API)

Vector store options:
    - ChromaDB (khuyến cáo: đơn giản, local persistent, không cần Docker)
    - Weaviate (hỗ trợ hybrid search built-in, cần Docker/Cloud)
    - FAISS (chỉ dense search)

Cài đặt:
    pip install langchain-text-splitters sentence-transformers chromadb

Lưu ý quan trọng: nếu sau này đổi corpus (đổi chủ đề, thêm/bớt tài liệu), phải XÓA
chroma_db/ cũ trước khi reindex — nếu không, chunk cũ và mới sẽ tồn tại lẫn lộn
trong cùng collection, retrieval sẽ trả về kết quả rác từ dữ liệu cũ.
"""

import re
from pathlib import Path

STANDARDIZED_DIR = Path(__file__).parent.parent / "data" / "standardized"
CHROMA_DIR = Path(__file__).parent.parent / "chroma_db"

FRONTMATTER_RE = re.compile(r"^---\n(.*?)\n---\n?", re.DOTALL)


# =============================================================================
# CONFIGURATION
# =============================================================================

# CHUNK_SIZE=800: đủ dài để giữ nguyên ngữ cảnh 1 điều/khoản chính sách,
# nhưng vẫn nhỏ hơn nhiều so với context window của LLM để tránh loãng thông tin.
CHUNK_SIZE = 800
# CHUNK_OVERLAP=100 (~12.5% của size): tránh câu văn quan trọng bị cắt đôi ngay
# ranh giới giữa 2 chunk liên tiếp, mà không tạo quá nhiều trùng lặp dữ liệu.
CHUNK_OVERLAP = 100
CHUNKING_METHOD = "recursive"  # "recursive" | "markdown_header" | "semantic"

# BAAI/bge-m3: multilingual, tốt cho tiếng Việt (đa số corpus là tiếng Việt),
# hỗ trợ luôn tiếng Anh nếu tài liệu pha trộn ngôn ngữ.
EMBEDDING_MODEL = "BAAI/bge-m3"
EMBEDDING_DIM = 1024

VECTOR_STORE = "chromadb"  # "chromadb" | "weaviate" | "faiss"
COLLECTION_NAME = "ecommerce_support_docs"

_embedding_model = None  # cache — tránh load lại model mỗi lần gọi get_embedding_model()
_collection = None


# =============================================================================
# IMPLEMENTATION
# =============================================================================

def _parse_frontmatter(text: str) -> tuple[dict, str]:
    """Tách YAML header (do Task 3 ghi) khỏi nội dung markdown."""
    match = FRONTMATTER_RE.match(text)
    if not match:
        return {}, text

    header, body = match.group(1), text[match.end():]
    meta = {}
    for line in header.splitlines():
        if ":" not in line:
            continue
        key, _, value = line.partition(":")
        meta[key.strip()] = value.strip().strip('"')
    return meta, body


def load_documents() -> list[dict]:
    """
    Đọc toàn bộ markdown files từ data/standardized/.

    Returns:
        List of {'content': str, 'metadata': {'source': str, 'doc_type': str,
                  'customer_role': str, 'url': str, 'title': str}}
    """
    documents = []
    for md_file in sorted(STANDARDIZED_DIR.rglob("*.md")):
        text = md_file.read_text(encoding="utf-8")
        meta, body = _parse_frontmatter(text)

        doc_type = meta.get("doc_type") or ("legal" if "legal" in str(md_file) else "news")
        documents.append({
            "content": body.strip(),
            "metadata": {
                "source": meta.get("source", md_file.name),
                "doc_type": doc_type,
                "customer_role": meta.get("customer_role", "both"),
                "url": meta.get("url", ""),
                "title": meta.get("title", md_file.stem),
            },
        })
    return documents


def chunk_documents(documents: list[dict]) -> list[dict]:
    """
    Chunk documents theo 2 tầng: cắt theo MỤC thật trước (MarkdownHeaderTextSplitter
    trên "##"/"###" do Task 3 chèn sẵn), rồi mới cắt tiếp bằng
    RecursiveCharacterTextSplitter cho mục nào vẫn dài hơn CHUNK_SIZE.

    Nhờ vậy 1 chunk không còn bị lẫn nội dung của 2 mục khác nhau (trước đây cắt cơ
    học theo ký tự có thể cắt ngay giữa "2. PHẠM VI ÁP DỤNG" và "3. HÀNH VI VI PHẠM"),
    và mỗi chunk có thêm metadata "section_title" để Task 10 cite đúng mục.

    Returns:
        List of {'content': str, 'metadata': dict} — mỗi item là 1 chunk,
        metadata giữ nguyên source/doc_type/customer_role của document gốc,
        thêm chunk_index và section_title (None nếu chunk nằm trước heading đầu tiên).
    """
    from langchain_text_splitters import MarkdownHeaderTextSplitter, RecursiveCharacterTextSplitter

    header_splitter = MarkdownHeaderTextSplitter(headers_to_split_on=[("##", "h2"), ("###", "h3")])
    char_splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
        separators=["\n\n", "\n", ". ", " ", ""],
    )

    chunks = []
    for doc in documents:
        chunk_index = 0
        for section in header_splitter.split_text(doc["content"]):
            section_title = section.metadata.get("h3") or section.metadata.get("h2")
            for chunk_text in char_splitter.split_text(section.page_content):
                chunks.append({
                    "content": chunk_text,
                    "metadata": {
                        **doc["metadata"],
                        "chunk_index": chunk_index,
                        "section_title": section_title,
                    },
                })
                chunk_index += 1
    return chunks


def get_embedding_model():
    """Load (và cache) SentenceTransformer model dùng chung cho Task 4 & 5."""
    global _embedding_model
    if _embedding_model is None:
        from sentence_transformers import SentenceTransformer
        _embedding_model = SentenceTransformer(EMBEDDING_MODEL)
    return _embedding_model


def embed_chunks(chunks: list[dict]) -> list[dict]:
    """
    Embed toàn bộ chunks bằng model đã chọn.

    Returns:
        Mỗi chunk dict được thêm key 'embedding': list[float]
    """
    model = get_embedding_model()
    texts = [c["content"] for c in chunks]
    embeddings = model.encode(texts, show_progress_bar=True, normalize_embeddings=True)
    for chunk, emb in zip(chunks, embeddings):
        chunk["embedding"] = emb.tolist()
    return chunks


def get_collection():
    """Lấy (và cache) collection ChromaDB dùng chung cho Task 4 & 5."""
    global _collection
    if _collection is None:
        import chromadb
        CHROMA_DIR.mkdir(parents=True, exist_ok=True)
        client = chromadb.PersistentClient(path=str(CHROMA_DIR))
        _collection = client.get_or_create_collection(
            name=COLLECTION_NAME,
            metadata={"hnsw:space": "cosine"},
        )
    return _collection


def index_to_vectorstore(chunks: list[dict]):
    """Lưu chunks (đã có embedding) vào ChromaDB."""
    collection = get_collection()

    ids = [f"{c['metadata']['source']}_chunk_{c['metadata']['chunk_index']}" for c in chunks]
    collection.upsert(
        ids=ids,
        documents=[c["content"] for c in chunks],
        embeddings=[c["embedding"] for c in chunks],
        metadatas=[c["metadata"] for c in chunks],
    )


def run_pipeline():
    """Chạy toàn bộ pipeline: load → chunk → embed → index."""
    print("=" * 50)
    print("Task 4: Chunking & Indexing")
    print(f"  Chunking: {CHUNKING_METHOD} (size={CHUNK_SIZE}, overlap={CHUNK_OVERLAP})")
    print(f"  Embedding: {EMBEDDING_MODEL} (dim={EMBEDDING_DIM})")
    print(f"  Vector Store: {VECTOR_STORE}")
    print("=" * 50)

    docs = load_documents()
    print(f"\n✓ Loaded {len(docs)} documents")

    chunks = chunk_documents(docs)
    print(f"✓ Created {len(chunks)} chunks")

    chunks = embed_chunks(chunks)
    print(f"✓ Embedded {len(chunks)} chunks")

    index_to_vectorstore(chunks)
    print("✓ Indexed to vector store")


if __name__ == "__main__":
    run_pipeline()
