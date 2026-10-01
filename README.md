# Bản đồ xúc giác (capstone)

Tải lên ảnh mặt bằng tòa nhà và nhận về một **bản đồ xúc giác** có thể in 3D: tường nổi, ký hiệu theo chuẩn và chữ nổi braille để người khiếm thị hoặc thị lực kém có thể đọc bằng ngón tay trước khi đến tòa nhà.

Đây là phiên bản rút gọn của dự án hackathon `bumps`. Nó giữ nguyên quy trình (tải lên, agent AI, chỉnh sửa, xem 3D, xuất STL) nhưng ít mã hơn rất nhiều.

## Chạy dự án

Cần [Bun](https://bun.sh) 1.3 trở lên.

```bash
bun run setup   # cài đặt mọi thứ và tạo các file .env
bun run dev     # khởi động trang web và backend
```

Mở http://localhost:3000 và bấm **Bắt đầu tạo bản đồ** (hoặc vào http://localhost:3000/maps). Bấm **Dùng thử văn phòng mẫu** để xem toàn bộ quy trình mà không cần khóa AI.

Để đọc mặt bằng của riêng bạn, thêm khóa AI vào `apps/api/.env` rồi khởi động lại `bun run dev`:

- **Gemini (mặc định):** tạo khóa tại https://aistudio.google.com và đặt `GEMINI_API_KEY=...`
- **hoặc OpenRouter:** đặt `MODEL_PROVIDER=openrouter` và `OPENROUTER_API_KEY=...`

Khi dùng OpenRouter, form tải lên có thêm danh sách **Mô hình AI** kèm giá ước tính cho mỗi lần chạy. Các mô hình được phép nằm trong `apps/api/src/agents/models.ts`; backend từ chối mọi mô hình khác, nên không ai có thể chọn một mô hình đắt tiền bằng cách sửa trang web. Biến `MODEL=` trong `.env` quy định mô hình được chọn sẵn. Các lần sửa bằng AI dùng lại mô hình đã đọc mặt bằng đó.

Backend chỉ đọc `.env` khi khởi động, nên **hãy khởi động lại `bun run dev` sau mỗi lần sửa `.env`**. Để xem backend đang chạy dùng mô hình nào, mở http://localhost:3003/.

## Cách hoạt động

```
 ảnh ──► 1. AGENT ĐỌC ──► FloorModel (JSON) ──► 2. BẠN SỬA ──► 3. CHUYỂN ĐỔI ──► file STL ──► máy in 3D
         (AI, một lần gọi)  tường, cửa,           (+ agent sửa)   (mã thuần,
                            phòng, ký hiệu                         không dùng AI)
```

1. **Tải lên.** Trang web gửi ảnh đến backend. Backend lưu ảnh và chạy **agent đọc** ở chế độ nền. Trang web cứ 2 giây hỏi lại một lần cho đến khi xong.
2. **Agent đọc.** Một lần gọi đến mô hình AI đa phương thức với một prompt chi tiết. Mô hình trả về JSON liệt kê các bức tường, cửa, phòng và ký hiệu mà nó thấy, mỗi thứ kèm một *độ tin cậy*. Backend làm sạch JSON đó thành một **FloorModel**.
3. **Kiểm tra và chỉnh sửa.** Trình chỉnh sửa vẽ FloorModel đè lên ảnh của bạn. Những phần có độ tin cậy dưới 70% được tô màu hổ phách, nghĩa là *cần kiểm tra*. Bạn có thể kéo các điểm, thêm tường, cửa và ký hiệu, đổi tên phòng và xóa chỗ sai. Bạn cũng có thể gõ một lệnh cho **agent sửa** (ví dụ *"thêm một cửa giữa sảnh và hành lang"*).
4. **Chuyển đổi.** Mã thuần, không dùng AI, biến FloorModel thành một tấm 200 × 200 mm theo các chuẩn xúc giác cố định: tường cao +1,0 mm, ký hiệu +1,5 mm, chấm braille +0,7 mm, cửa là khoảng hở rộng ít nhất 5 mm, và mỗi phòng có một mã braille ngắn. Bước này cũng liệt kê cảnh báo khi một quy tắc bị vi phạm.
5. **Xem 3D và xuất file.** Trang web hiển thị chính file STL đó ở dạng 3D. Bạn tải về hai file: tấm **bản đồ** và tấm **chú giải** giải thích từng mã braille.

Ý tưởng thiết kế chính: **AI chỉ đọc bản vẽ; các quy tắc giúp bản đồ đọc được là mã cố định.** Mô hình không thể âm thầm tạo ra một bản đồ không đọc được, và mỗi phần đều có thể kiểm thử riêng.

## Các thành phần nằm ở đâu

```
packages/shared/src/
  floor-model.ts        FloorModel: định dạng dữ liệu duy nhất mà mọi phần dùng chung
  project.ts            kiểu Project (một lần tải lên đã lưu) và phần tóm tắt xúc giác

apps/api/src/                     BACKEND (Bun + Hono, cổng 3003)
  index.ts                        khởi động server
  routes/projects.ts              mọi endpoint của API (bảng bên dưới)
  agents/llm.ts                   gọi Gemini hoặc OpenRouter
  agents/models.ts                các mô hình mà form tải lên được phép hiển thị, kèm giá
  agents/parser.ts                agent đọc: ảnh -> FloorModel (prompt nằm ở đây)
  agents/editor.ts                agent sửa: lệnh + FloorModel -> FloorModel
  agents/normalize.ts             làm sạch JSON mà AI trả về
  tactile/convert.ts              FloorModel -> tấm in (các chuẩn nằm ở đây)
  tactile/braille.ts              chữ cái -> vị trí chấm braille
  tactile/geometry.ts             khối hộp, vòm, vòng -> tam giác -> file STL
  sample.ts                       văn phòng mẫu làm thủ công
  db/                             cơ sở dữ liệu SQLite (một bảng "projects")

apps/web/src/                     TRANG WEB (Next.js, cổng 3000)
  app/page.tsx                    trang chủ
  app/maps/page.tsx               tải lên + danh sách bản đồ
  app/projects/[id]/page.tsx      một bản đồ: trình chỉnh sửa và xem 3D
  app/the-need-for-this, what-it-does, how-it-works, input-guide, gallery
                                  các trang thông tin (nội dung trong data/site-pages.ts)
  components/layout/              thanh điều hướng và chân trang
  components/landing/             phần đầu trang chủ, trang thông tin, hướng dẫn đầu vào, thư viện
  components/editor/              khung vẽ chỉnh sửa, thanh công cụ, các bảng bên
  components/preview/             trình xem 3D (three.js) và bảng xuất file
  lib/api.ts                      mọi lời gọi từ trang web đến backend
  lib/floor-edit.ts               các hàm nhỏ để thay đổi FloorModel
  data/content.ts                 nội dung chữ cho công cụ bản đồ (tiếng Việt)
  data/site-pages.ts              nội dung chữ cho các trang thông tin (tiếng Việt)
public/gallery/                   mặt bằng mẫu và tấm STL do bumps tạo ra
```

## API

| Phương thức | Đường dẫn | Chức năng |
|---|---|---|
| GET | `/models` | Các mô hình mà form tải lên được phép hiển thị |
| GET | `/projects` | Liệt kê tất cả bản đồ |
| POST | `/projects` | Tải lên ảnh (trường form `file`, tùy chọn `name` và `model`) và chạy agent đọc |
| POST | `/projects/sample` | Tạo bản đồ từ mẫu có sẵn |
| GET | `/projects/:id` | Một bản đồ, gồm FloorModel và trạng thái |
| DELETE | `/projects/:id` | Xóa một bản đồ |
| GET | `/projects/:id/image` | Ảnh đã tải lên |
| POST | `/projects/:id/parse` | Chạy lại agent đọc |
| PUT | `/projects/:id/model` | Lưu FloorModel đã chỉnh sửa |
| POST | `/projects/:id/edit` | Agent sửa: `{ "instruction": "..." }` |
| GET | `/projects/:id/tactile` | Chú giải braille và cảnh báo |
| GET | `/projects/:id/map.stl` | Tấm bản đồ (thêm `?download=1` để tải về) |
| GET | `/projects/:id/legend.stl` | Tấm chú giải |

## In

In nằm phẳng, đầu phun 0,4 mm, không cần giá đỡ. Bàn in của các máy in phổ thông đều vừa khổ 200 × 200 mm.

## Kiểm tra

```bash
bun run typecheck
bun run lint
```

## Những gì đã lược bỏ so với bumps

Cố ý giữ đơn giản. Một số ý tưởng để mở rộng capstone:

- Một **agent phản biện** so sánh FloorModel với ảnh gốc và yêu cầu agent đọc sửa lỗi (bumps chạy tối đa 5 vòng).
- Tải lên file PDF, đồ nội thất, lối đi và đường sá.
- Tòa nhà lớn được chia thành nhiều tấm in.
- Tự động sửa các vi phạm quy tắc (ví dụ di chuyển một mã braille không vừa chỗ).
- Đăng nhập Google đã được nối sẵn trong `apps/web/src/auth.ts` nhưng chưa trang nào dùng.

## Triển khai

Cả hai ứng dụng đều có Dockerfile, build từ thư mục gốc của repo. SQLite và các file tải lên được lưu trên đĩa, nên máy chủ chạy API cần một ổ đĩa lưu trữ lâu dài (`DATABASE_PATH`, `UPLOADS_DIR`).
