# 6. Workflow làm việc với AI hiệu quả nhất

## Một lần chỉ giao một task nhỏ

Không prompt:

> Triển khai toàn bộ Day 1.

Hãy chia nhỏ thành:

```text
Task 1: Scaffold pnpm workspace.
Task 2: Add Docker Compose.
Task 3: Configure API environment validation.
Task 4: Add health endpoint.
Task 5: Scaffold web shell.
Task 6: Add CI.
```

Mỗi task nên mất khoảng **20–60 phút**, không phải cả ngày.

---

## Prompt chuẩn cho mỗi task

```text
Read:
- docs/DOCLENS_BACKEND_OVERVIEW.md
- docs/BACKEND_IMPLEMENTATION_PLAN.md

Current task:
[one specific task]

Before editing:
1. Inspect the existing repository and conventions.
2. Restate the business/technical goal.
3. List the files expected to change.
4. Identify failure cases and required tests.
5. Do not implement later milestones.

Implementation requirements:
[specific constraints]

Acceptance criteria:
[measurable results]

After implementation:
1. Run relevant tests, lint and typecheck.
2. Report changed files.
3. Explain important decisions.
4. List unresolved risks.
5. Do not mark the plan task DONE unless verification passes.
```

---

## Không nhét toàn bộ project vào prompt

Nếu agent có quyền đọc repository, chỉ cần chỉ nó tới:

- Overview.
- Current plan section.
- Các files liên quan.

Cho quá nhiều context không liên quan làm agent dễ:

- Sửa ngoài scope.
- Bắt chước code cũ không liên quan.
- Tạo abstraction quá tổng quát.
- Bỏ sót acceptance criteria chính.

---

# 7. Quy trình review code do AI tạo

Sau mỗi task, em phải kiểm tra **năm tầng**.

## Tầng 1 — Scope

- Có sửa file ngoài task không?
- Có tự thêm package không?
- Có implement milestone sau không?

## Tầng 2 — Correctness

- Happy path chạy chưa?
- Failure cases có xử lý chưa?
- Có race condition không?
- Chạy lại có duplicate không?

## Tầng 3 — Architecture

- Controller có chứa business logic không?
- Domain có phụ thuộc Prisma/NestJS không?
- AI SDK có bị gọi trực tiếp ngoài provider không?
- Worker và API có bị coupling không?

## Tầng 4 — Tests

- Test có thực sự test behavior không?
- Có mock quá nhiều không?
- Test có thể fail khi logic sai không?
- Có gọi external service trong unit test không?

## Tầng 5 — Understanding

Em phải tự trả lời:

- Tại sao code được thiết kế như vậy?
- Có phương án đơn giản hơn không?
- Failure ở giữa flow thì dữ liệu thế nào?
- Nếu interview hỏi, em giải thích được không?

> Nếu không trả lời được, yêu cầu AI giải thích hoặc viết lại đơn giản hơn trước khi commit.

---

# 8. Git workflow đơn giản

Không cần Git Flow phức tạp.

```text
main
└── feature/day-01-foundation
    ├── commit: chore(workspace): initialize pnpm monorepo
    ├── commit: chore(infra): add local docker services
    ├── commit: feat(api): add health endpoint
    └── commit: ci: add validation workflow
```

## Quy tắc cho mỗi commit

Mỗi commit:

- Build được.
- Không chứa secret.
- Có message mô tả outcome.
- Không trộn formatting toàn repo với feature.

> Không để AI tạo một commit chứa 70 file cho năm task khác nhau.

---

# 9. Definition of Ready và Definition of Done

## Một task chỉ Ready khi có

```text
Goal
Inputs
Expected output
Affected area
Acceptance criteria
Failure cases
Required tests
Out-of-scope items
```

## Một task chỉ Done khi

```text
Code implemented
Relevant tests pass
Typecheck passes
Lint passes
Manual verification completed
No unrelated changes
Important decision documented
Plan status updated
```

---

# 10. Những lỗi dễ khiến AI gen lung tung

- Giao cả một ngày trong một prompt.
- Không ghi out-of-scope.
- Không có acceptance criteria đo được.
- Cho phép agent “cải thiện architecture nếu cần”.
- Không yêu cầu inspect code trước khi sửa.
- Không kiểm tra diff.
- Cho agent tự chọn thêm framework/package.
- Tạo quá nhiều interface trước khi có implementation.
- Làm database đầy đủ cho feature chưa triển khai.
- Đánh dấu task done chỉ vì code compile.
- Bắt frontend mock một API contract chưa được định nghĩa.
- Làm UI đẹp trước khi workflow end-to-end chạy.

---

# Kết luận

Cách tiếp cận đúng cho DocLens là:

> **Overview giữ nguyên tắc, plan quản lý tiến độ, learning log ghi lại kiến thức; triển khai theo vertical slice để mỗi ngày đều có một phần backend và frontend tích hợp được với nhau.**

Plan cũ đúng về backend pipeline nhưng thiếu frontend theo từng milestone. Bản cập nhật ở trên giải quyết điểm đó.

Ngày đầu tiên chỉ nên hoàn thành:

```text
workspace
+ Docker infrastructure
+ API / worker / web boot
+ health check
+ migration foundation
+ CI
```

> **Tuyệt đối chưa gọi AI provider trong ngày 1.**

Mục tiêu hôm nay là tạo một nền móng nhỏ, chạy được và kiểm chứng được — **không phải tạo thật nhiều file**.
