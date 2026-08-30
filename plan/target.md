# 9. Cách sử dụng AI Coding mà vẫn học được

AI có thể hỗ trợ làm:

* Scaffold NestJS modules.
* DTO và validation.
* Prisma/TypeORM schema.
* Docker Compose.
* React component cơ bản.
* Repository boilerplate.
* Test setup.
* SDK integration.
* Refactor lặp lại.
* Generate sample fixtures.

## Em phải tự quyết định và hiểu

* Document state machine.
* Database boundaries.
* Chunking algorithm.
* Retry policy.
* Idempotency.
* Prompt design.
* Citation mechanism.
* Concurrency limit.
* Evaluation criteria.
* Cost/performance trade-off.

---

## Quy tắc “không code chay”

Trước mỗi feature, viết ngắn:

```text
Problem:

Input:

Output:

Business rules:

Failure cases:

Test cases:
```

Sau đó mới yêu cầu AI coding.

### Ví dụ

Không prompt kiểu:

> Viết cho tôi document processing service.

Hãy prompt cụ thể:

> Implement a NestJS service that transitions a document from QUEUED to EXTRACTING. The transition must be atomic, processing must be idempotent, and documents already COMPLETED must be skipped. Include tests for duplicate execution and invalid transitions.

Như vậy, AI là **implementation assistant**, còn em vẫn giữ vai trò **engineer**.

---

## Quy tắc review code AI

Không merge nếu em chưa trả lời được:

* Đoạn này giải quyết business rule nào?
* Failure xảy ra ở đâu?
* Chạy hai lần thì sao?
* Có transaction cần thiết không?
* Có giữ connection/file trong memory không?
* Test nào chứng minh nó đúng?
* Có cách đơn giản hơn không?

---

# 10. Learning Log sau mỗi ngày

Tạo cấu trúc:

```text
docs/learning-log/
├── day-01.md
├── day-02.md
└── ...
```

Mỗi ngày chỉ cần trả lời:

```md
# What I built

# What I learned

# One technical decision

# One bug and its root cause

# Trade-off I accepted

# What I still do not understand

# Tomorrow's goal
```

Đừng ghi dạng nhật ký dài.

Mục tiêu là tạo dữ liệu để:

* Viết README.
* Trả lời phỏng vấn.
* Viết CV.
* Nhận ra lỗ hổng kiến thức.

---

# 11. Kiến thức cần tổng hợp cuối mỗi giai đoạn

## Sau tuần 1

Em phải giải thích được:

* HTTP request khác background job thế nào.
* BullMQ đảm bảo delivery ra sao.
* Idempotency cần thiết vì sao.
* PDF được extract và chunk thế nào.
* Token khác character thế nào.
* Hierarchical summarization hoạt động ra sao.
* Làm sao citation không bị AI tự bịa.
* Tại sao structured output tốt hơn parse free-form text.

---

## Sau tuần 2

Em phải giải thích thêm:

* Retryable error được phân loại thế nào.
* Làm sao resume partial processing.
* Cách đo token, cost và latency.
* Cách test code có gọi LLM.
* AI evaluation khác unit test thế nào.
* Hallucination được phát hiện và giảm thiểu ra sao.
* RAG gồm những bước nào.
* Khi nào exact vector search đủ dùng.
* Nếu scale lên 100.000 documents thì thay đổi gì.

---

# 12. Những checkpoint không được bỏ qua

## Cuối ngày 3

Upload và job queue chạy được.

## Cuối ngày 5

Extraction và chunking có test.

## Cuối ngày 7

Demo được end-to-end summary với citation.

## Cuối ngày 10

Có cost, token và latency thật.

## Cuối ngày 12

Có evaluation report.

## Cuối ngày 14

Có:

* Live demo hoặc video.
* README.
* CV bullets.

---

## Nếu trễ checkpoint

Ưu tiên cắt scope theo thứ tự:

1. Bỏ authentication.
2. Bỏ SSE, dùng polling.
3. Bỏ RAG.
4. Bỏ UI đẹp.

### Không được bỏ

* Citation.
* Testing.
* Evaluation.
* Cost tracking.

---

# 13. Definition of Done cuối project

Project chỉ được coi là hoàn thành khi:

* [ ] Clone repository và chạy được bằng README.
* [ ] Upload được PDF/DOCX hợp lệ.
* [ ] Job chạy bất đồng bộ.
* [ ] Worker retry an toàn.
* [ ] Tài liệu dài được chia chunk.
* [ ] Có summary theo chapter.
* [ ] Citation mở đúng source.
* [ ] Không bịa page number.
* [ ] Có structured output validation.
* [ ] Có unit/integration tests.
* [ ] Có evaluation dataset.
* [ ] Có số liệu cost và latency.
* [ ] Có ít nhất một failure scenario được demo.
* [ ] Có Docker setup.
* [ ] Có architecture diagram.
* [ ] Có demo video.
* [ ] Em tự giải thích được toàn bộ pipeline.

---

# 14. CV Bullets dự kiến

Sau khi có số đo thật, viết theo dạng:

> Built DocLens, an AI-powered document intelligence platform using NestJS, React, PostgreSQL, Redis and S3, supporting asynchronous PDF/DOCX ingestion, hierarchical summarization and source-grounded citations.

> Designed an idempotent BullMQ processing pipeline with partial retries, structured LLM outputs, token-cost tracking and automated quality evaluation across X test documents.

> Implemented retrieval-augmented document Q&A using embeddings and pgvector, achieving X% citation validity with an average processing cost of $Y per document.

> **Lưu ý:** Không dùng bullet thứ ba nếu chưa thực sự hoàn thành RAG và đo evaluation.

---

# Kế hoạch ưu tiên

> **Tuần 1 tạo pipeline đúng; tuần 2 chứng minh pipeline đáng tin cậy.**
