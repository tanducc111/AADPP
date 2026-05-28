# Kịch Bản Demo AADPP

Tài liệu này dùng để thuyết trình và demo dự án **AADPP - AI Accounting Document Processing Platform**. Mục tiêu là giúp người nghe hiểu nhanh bài toán, giá trị sản phẩm, luồng nghiệp vụ, kiến trúc kỹ thuật và mức độ hoàn thiện của hệ thống.

## 1. Thông Điệp Chính

AADPP là nền tảng xử lý chứng từ kế toán bằng AI dành cho công ty dịch vụ kế toán quản lý nhiều công ty khách hàng.

Hệ thống giải quyết ba vấn đề chính:

- giảm thời gian nhập liệu thủ công từ hóa đơn/chứng từ.
- chuẩn hóa quy trình upload, OCR, review và phê duyệt.
- đảm bảo phân quyền, lịch sử thao tác và khả năng kiểm soát trong môi trường doanh nghiệp.

Câu giới thiệu ngắn:

> AADPP không chỉ là một demo OCR. Đây là một workflow kế toán hoàn chỉnh, từ đăng nhập, quản lý khách hàng, upload tài liệu, trích xuất dữ liệu bằng Gemini, con người review, phê duyệt, thống kê và audit log.

## 2. Thời Lượng Đề Xuất

| Phần                          | Thời lượng |
| ----------------------------- | ---------: |
| Mở đầu bài toán               |     1 phút |
| Đăng nhập và phân quyền       |     1 phút |
| Dashboard analytics           |   1.5 phút |
| Client company management     |     1 phút |
| Document upload               |   1.5 phút |
| Gemini OCR và review workflow |     2 phút |
| Admin users và audit logs     |     1 phút |
| Chrome Extension OCR region   |     1 phút |
| Tổng kết kỹ thuật             |     1 phút |

Tổng thời lượng phù hợp: **10 đến 12 phút**.

## 3. Chuẩn Bị Trước Demo

Kiểm tra Docker:

```powershell
docker compose up -d
docker compose ps
```

Kiểm tra backend:

```powershell
Invoke-RestMethod http://localhost:8000/api/v1/health
```

Mở sẵn các tab:

- [http://localhost:3000/login](http://localhost:3000/login)
- [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
- [http://localhost:8000/docs](http://localhost:8000/docs)

Chuẩn bị dữ liệu:

- một tài khoản ADMIN.
- một hoặc hai client companies.
- một file hóa đơn ảnh rõ nét.
- một file PDF để demo preview/download.
- một document đã OCR thành công để backup nếu Gemini quota bị giới hạn.

Kiểm tra env:

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_ID=...
GEMINI_API_KEY=...
```

Lưu ý quan trọng:

- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` nằm ở frontend.
- `GOOGLE_CLIENT_ID` nằm ở backend.
- `GEMINI_API_KEY` chỉ nằm ở backend.

## 4. Demo Flow Chính

Luồng demo khuyến nghị:

```text
Login
  -> Dashboard
  -> Client Companies
  -> Upload Document
  -> Document Detail
  -> Run OCR
  -> Review OCR Result
  -> Approve Document
  -> Admin Users
  -> Activity Logs
  -> Chrome Extension Region OCR
```

## 5. Kịch Bản Nói Chi Tiết

### 5.1. Mở đầu

Nói:

> Công ty dịch vụ kế toán thường xử lý chứng từ cho nhiều khách hàng. Nếu nhập liệu thủ công, quy trình dễ chậm, dễ sai và khó audit. AADPP được xây dựng để số hóa quy trình đó bằng AI nhưng vẫn giữ bước con người review và phê duyệt.

Điểm cần nhấn:

- đây là sản phẩm workflow, không phải chỉ là OCR.
- phù hợp môi trường doanh nghiệp.
- có phân quyền, audit log và dashboard.

### 5.2. Google SSO và RBAC

Màn hình: `/login`

Demo:

- bấm đăng nhập Google.
- vào dashboard.
- chỉ role badge `ADMIN` hoặc `ACCOUNTANT`.

Nói:

> Frontend nhận Google ID token, backend verify token với Google, sau đó backend cấp JWT riêng cho hệ thống. Tất cả API protected đều kiểm tra JWT và role ở backend.

Điểm kỹ thuật:

- Google SSO.
- JWT session.
- ADMIN và ACCOUNTANT.
- backend không tin role từ frontend.

### 5.3. Dashboard Analytics

Màn hình: `/dashboard`

Demo:

- summary cards.
- documents by type.
- documents by status.
- uploads over time.
- top client companies.
- recent activities.

Nói:

> Dashboard giúp quản trị nhìn nhanh tình trạng vận hành: bao nhiêu tài liệu đã upload, bao nhiêu tài liệu đang chờ review, tỷ lệ OCR thành công, tài liệu lỗi và khách hàng nào có nhiều chứng từ nhất.

Điểm kỹ thuật:

- ADMIN thấy global metrics.
- ACCOUNTANT chỉ thấy dữ liệu của chính họ.
- dashboard không expose raw OCR JSON hay server file path.

### 5.4. Client Company Management

Màn hình: `/clients`

Demo:

- search client company.
- xem trạng thái active.
- nếu cần, tạo hoặc xem chi tiết một công ty.

Nói:

> Mỗi chứng từ phải thuộc về một công ty khách hàng. Đây là business entity trung tâm của hệ thống vì công ty kế toán xử lý chứng từ cho nhiều khách hàng khác nhau.

Điểm kỹ thuật:

- tax code unique.
- email validation.
- pagination và search.
- ADMIN quản trị, ACCOUNTANT chỉ xem active companies.

### 5.5. Document Upload

Màn hình: `/documents/upload`

Demo:

- chọn client company.
- chọn document type.
- upload file PDF/JPG/PNG.
- mở document detail.
- preview, metadata, download.

Nói:

> Khi upload, backend validate extension, MIME type và kích thước file. File thật được lưu trong backend storage với tên sinh bằng UUID, không dùng trực tiếp tên file người dùng gửi lên.

Điểm kỹ thuật:

- file storage an toàn.
- document metadata nằm ở PostgreSQL.
- document gắn với client company và uploader.
- RBAC kiểm soát quyền view/delete.

### 5.6. Gemini OCR Workflow

Màn hình: document detail -> OCR -> review

Demo:

- bấm `Run OCR`.
- mở OCR review page.
- chỉnh một vài field.
- chỉnh line item nếu có.
- save review.
- approve document.

Nói:

> Gemini OCR trích xuất dữ liệu kế toán có cấu trúc như tên công ty, mã số thuế, số hóa đơn, ngày hóa đơn, subtotal, VAT, total amount và line items. Nhưng hệ thống không tự động tin AI hoàn toàn. Người dùng review và phê duyệt trước khi dữ liệu được xem là final.

Workflow:

```text
UPLOADED -> PROCESSING -> OCR_DONE -> REVIEWED -> APPROVED
```

Điểm kỹ thuật:

- Gemini API chỉ gọi từ backend.
- raw response và structured fields được lưu.
- approved document bị lock.
- lỗi OCR chuyển document sang `FAILED`.

### 5.7. Admin Users và Audit Logs

Màn hình: `/admin/users`, `/admin/logs`

Demo:

- danh sách user.
- block/unblock user.
- delete user nếu cần.
- xem activity logs.

Nói:

> Với vai trò ADMIN, hệ thống có thể quản lý người dùng và xem lịch sử thao tác. Audit logs giúp truy vết ai đã đăng nhập, upload, chạy OCR, review, approve hoặc xóa dữ liệu.

Điểm kỹ thuật:

- admin-only route.
- backend enforce role.
- logs có search/filter/pagination.

### 5.8. Chrome Extension OCR Region

Màn hình: document detail hoặc review page

Demo:

- click extension.
- chọn `Select OCR Region`.
- kéo một vùng trên document preview.
- xem text OCR của vùng chọn.

Nói:

> Extension MVP cho phép người dùng chọn một vùng cụ thể trên tài liệu, ví dụ mã số thuế hoặc tổng tiền. Extension chỉ gửi tọa độ vùng chọn. Backend crop vùng đó từ file gốc rồi gọi Gemini OCR cho vùng crop.

Điểm kỹ thuật:

- Manifest V3.
- content script overlay.
- viewport coordinates.
- backend validate coordinates.
- Pillow xử lý ảnh.
- pdf2image và Poppler xử lý PDF.
- temp crop file được cleanup.

Nếu Gemini quota lỗi, nói:

> Luồng region OCR đã hoàn chỉnh về mặt kỹ thuật. Kết quả runtime phụ thuộc quota Gemini API. Trong trường hợp quota bị giới hạn, em sẽ dùng OCR result đã lưu sẵn để demo workflow review và approve.

## 6. Điểm Nhấn Kỹ Thuật Khi Bị Hỏi

### Vì sao dùng Clean Architecture?

Trả lời:

> Vì hệ thống có nhiều module nghiệp vụ. Router chỉ xử lý HTTP, service xử lý business logic, repository xử lý database query. Cách này giúp mở rộng module OCR, dashboard hoặc user management mà không làm rối codebase.

### Vì sao vẫn cần review sau OCR?

Trả lời:

> Dữ liệu kế toán có tính chính xác cao. AI giúp giảm nhập liệu thủ công, nhưng final result vẫn cần con người kiểm tra trước khi approve.

### Vì sao phải có audit logs?

Trả lời:

> Trong hệ thống kế toán, việc truy vết thao tác là bắt buộc. Audit logs giúp biết ai đã upload, OCR, sửa, phê duyệt hoặc xóa tài liệu.

### Vì sao Gemini key chỉ ở backend?

Trả lời:

> API key là secret. Nếu đưa lên frontend sẽ bị lộ trong browser. Backend là nơi duy nhất gọi Gemini và kiểm soát quyền truy cập tài liệu.

### ACCOUNTANT có xem được tài liệu người khác không?

Trả lời:

> Không. Backend chỉ cho ACCOUNTANT xem tài liệu do chính họ upload. ADMIN mới có quyền xem toàn hệ thống.

## 7. Checklist Trước Khi Trình Bày

- [ ] Docker services đang chạy.
- [ ] Google login hoạt động.
- [ ] Tài khoản demo là ADMIN.
- [ ] Có ít nhất một client company active.
- [ ] Có file hóa đơn để upload.
- [ ] Có document OCR thành công để backup.
- [ ] Swagger mở được.
- [ ] Dashboard không bị empty toàn bộ nếu muốn demo đẹp.
- [ ] Chrome Extension đã load trong Chrome developer mode.
- [ ] Gemini API key còn quota hoặc có backup flow.

## 8. Câu Kết Luận

> AADPP là một nền tảng AI accounting workflow hoàn chỉnh: có xác thực, phân quyền, quản lý khách hàng, upload chứng từ, OCR bằng Gemini, review, approve, dashboard, audit logs và extension chọn vùng OCR. Dự án được tổ chức theo kiến trúc sạch, dễ mở rộng và đủ chuyên nghiệp để phát triển tiếp thành sản phẩm doanh nghiệp.
