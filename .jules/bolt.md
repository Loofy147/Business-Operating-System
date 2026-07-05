# Bolt's Journal - Critical Learnings

## 2025-05-22 - VectorStore Search Efficiency
**Learning:** The initial VectorStore implementation was calculating norms for both query and stored vectors within the inner comparison loop. In a search with N vectors and D dimensions, this resulted in O(N*D) redundant calculations.
**Action:** Transitioned to a pre-normalized vector storage strategy. By normalizing vectors during addition and the query vector once per search, the similarity calculation is reduced to a simple dot product, significantly improving performance for large knowledge bases.

## 2025-05-22 - PriorityQueue Implementation Efficiency
**Learning:** The initial PriorityQueue used `Array.sort()` on every push, leading to O(N^2 log N) performance for sequence of N pushes. This was a major bottleneck in the orchestration layer when handling large volumes of tasks.
**Action:** Replaced the array-based sort with a Binary Heap structure. This optimized `push` and `pop` operations to O(log N), resulting in a ~200x performance improvement for 10,000 task operations.
