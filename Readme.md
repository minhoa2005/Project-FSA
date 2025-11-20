Hướng Dẫn Thiết Lập và Khởi Chạy Dự Án
- Yêu Cầu Hệ Thống
Phiên bản Node.js được đề xuất: v22.11.0

- Thiết Lập Cơ Sở Dữ Liệu (Database)
Tạo Database: Cài đặt cơ sở dữ liệu bằng cách chạy (hoặc import) file BlockApp.sql vào hệ quản trị cơ sở dữ liệu của bạn.

Cấu Hình Kết Nối: Đảm bảo chuỗi kết nối (connection string) trong file cấu hình của dự án đã được cập nhật chính xác để trỏ tới database vừa tạo.

- Khởi Chạy Ứng Dụng
1. Mở Dự Án
Mở thư mục dự án trong Visual Studio Code (hoặc IDE/Editor khác bạn sử dụng).

2. Mở Terminal
Mở Terminal mới trong Visual Studio Code.

3. Cài Đặt Các Gói Phụ Thuộc
Chạy lệnh sau để cài đặt tất cả các gói Node.js cần thiết (từ file package.json):

Bash

npm install
4. Khởi Chạy Chế Độ Phát Triển
Chạy lệnh sau để khởi động ứng dụng ở chế độ phát triển (dev):

Bash

npm run dev
Ứng dụng sẽ tự động chạy và có thể truy cập qua trình duyệt (thông thường là http://localhost:<PORT>).

- Thông Tin Tài Khoản Mặc Định
Sử dụng tài khoản sau để đăng nhập vào khu vực quản trị (Admin):

Email: admin@local

Mật khẩu: Admin123456

