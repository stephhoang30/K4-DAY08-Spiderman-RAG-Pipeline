"""
Task 5 — Semantic Search Module.

Viết module tìm kiếm ngữ nghĩa (dense retrieval) trên vector store.

Yêu cầu:
    - Input: query string + top_k
    - Output: danh sách chunks có score, sorted descending
    - Phải tương thích với embedding model và vector store ở Task 4
"""


def semantic_search(query: str, top_k: int = 10) -> list[dict]:
    from .task4_chunking_indexing import (
        get_collection,
        get_embedding_model,
    )

    # Kiểm tra đầu vào
    query = query.strip()

    if not query:
        raise ValueError("Query không được để trống")

    if top_k <= 0:
        raise ValueError("top_k phải lớn hơn 0")

    # Bước 1: Lấy embedding model
    model = get_embedding_model()

    # Chuyển câu hỏi thành vector
    query_vector = model.encode(
        query,
        normalize_embeddings=True,
    ).tolist()

    # Bước 2: Lấy collection trong ChromaDB
    collection = get_collection()

    # Kiểm tra collection có dữ liệu hay không
    total_documents = collection.count()

    if total_documents == 0:
        return []

    # Không được yêu cầu nhiều kết quả hơn số document hiện có
    number_of_results = min(top_k, total_documents)

    # Tìm các vector gần nhất
    results = collection.query(
        query_embeddings=[query_vector],
        n_results=number_of_results,
        include=["documents", "metadatas", "distances"],
    )

    documents = results.get("documents", [[]])[0]
    metadatas = results.get("metadatas", [[]])[0]
    distances = results.get("distances", [[]])[0]

    # Bước 3: Chuẩn hóa kết quả
    output: list[dict[str, Any]] = []

    for document, metadata, distance in zip(
        documents,
        metadatas,
        distances,
    ):
        # Với cosine distance:
        # similarity = 1 - distance
        score = 1.0 - float(distance)

        # Giới hạn score trong khoảng 0 đến 1
        score = max(0.0, min(1.0, score))

        output.append(
            {
                "content": document,
                "score": round(score, 4),
                "metadata": metadata or {},
            }
        )

    # Sắp xếp score từ cao xuống thấp
    output.sort(
        key=lambda item: item["score"],
        reverse=True,
    )

    return output[:top_k]


if __name__ == "__main__":
    # Test
    results = semantic_search("quy định trả hàng hoàn tiền shopee", top_k=5)
    for r in results:
        print(f"[{r['score']:.3f}] {r['content'][:100]}...")


if __name__ == "__main__":
    query = "Nhân viên được nghỉ phép bao nhiêu ngày?"

    results = semantic_search(query=query, top_k=5)

    print(f"Tìm thấy {len(results)} kết quả\n")

    for index, result in enumerate(results, start=1):
        print(f"--- Kết quả {index} ---")
        print(f"Score: {result['score']}")
        print(f"Content: {result['content']}")
        print(f"Metadata: {result['metadata']}")
        print()