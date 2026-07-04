# Bolt's Journal - Critical Learnings

## 2025-05-22 - VectorStore Search Efficiency
**Learning:** The initial VectorStore implementation was calculating norms for both query and stored vectors within the inner comparison loop. In a search with N vectors and D dimensions, this resulted in O(N*D) redundant calculations.
**Action:** Transitioned to a pre-normalized vector storage strategy. By normalizing vectors during addition and the query vector once per search, the similarity calculation is reduced to a simple dot product, significantly improving performance for large knowledge bases.
