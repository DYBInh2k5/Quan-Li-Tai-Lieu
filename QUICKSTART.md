# 🚀 Hướng Dẫn Nhanh

## Khởi Động Lần Đầu

### 1. Cài Đặt
```bash
npm install
```

### 2. Migration Database
```bash
node migrate-database.js
```

Kết quả:
```
✅ Đã thêm cột password
✅ Đã thêm cột token
✅ Đã tạo tài khoản admin
📧 Username: admin
🔒 Password: admin123
```

### 3. Khởi Động Server
```bash
npm start
```

### 4. Truy Cập
Mở trình duyệt:
```
http://localhost:3000/login.html
```

### 5. Đăng Nhập
- **Username:** `admin`
- **Password:** `admin123`

⚠️ **Đổi mật khẩu ngay:**
1. Click vào tên "Administrator"
2. Chọn "👤 Hồ sơ"
3. Click "🔒 Đổi Mật Khẩu"

## 📝 Tạo Tài Khoản Mới

### Đăng Ký
1. Click tab "Đăng Ký"
2. Điền thông tin:
   - Họ tên
   - Email
   - Username
   - Password (tối thiểu 6 ký tự)
   - Chọn vai trò:
     - 👨‍🎓 Học sinh
     - 👨‍🏫 Giáo viên
     - 👑 Quản trị viên
3. Click "Đăng Ký"

## 🎯 Các Tính Năng Chính

### 📄 Tài Liệu
- Upload file (drag & drop)
- Phân loại theo danh mục
- Tìm kiếm & lọc
- Preview trực tiếp
- Chia sẻ qua link/QR code

### 📝 Bài Tập
- Nộp bài tập
- Chấm điểm
- Theo dõi trạng thái
- Xuất báo cáo Excel

### 🖼️ Thư Viện
- Upload hình ảnh
- Lưu links hữu ích
- Xem với lightbox

### 📝 Ghi Chú
- Ghi chú nhanh
- 5 màu sắc
- Ghim/Lưu trữ
- To-Do list

### 📊 Thống Kê
- Dashboard tổng quan
- Bảng xếp hạng
- Phân bố điểm
- Hoạt động gần đây

### 📅 Lịch Hẹn
- Thêm deadline
- Lên lịch họp
- Thông báo tự động

## ⌨️ Phím Tắt

- `Ctrl + U` - Upload file
- `Ctrl + F` - Tìm kiếm
- `?` - Xem phím tắt
- `ESC` - Đóng modal

## 🌙 Dark Mode

Click icon 🌙 ở góc trên để bật/tắt chế độ tối

## 💾 Backup

1. Click icon 💾
2. Chọn:
   - 📤 Xuất dữ liệu JSON
   - 💾 Tải database SQLite

## 🔧 Xử Lý Sự Cố

### Lỗi đăng nhập
```bash
# Xóa database và tạo lại
rm database.db
node migrate-database.js
npm start
```

### Lỗi port đã sử dụng
```bash
# Tìm process đang dùng port 3000
netstat -ano | findstr :3000

# Tắt process (thay PID)
taskkill /F /PID <PID>
```

### Reset mật khẩu admin
```bash
node migrate-database.js
# Sẽ tạo lại admin/admin123 nếu chưa có
```

## 📚 Tài Liệu Chi Tiết

- [README.md](README.md) - Tổng quan hệ thống
- [AUTH_GUIDE.md](AUTH_GUIDE.md) - Hướng dẫn xác thực
- [FEATURES.md](FEATURES.md) - Chi tiết tính năng
- [DATABASE.md](DATABASE.md) - Cấu trúc database

## 🆘 Hỗ Trợ

Nếu gặp vấn đề:
1. Kiểm tra console (F12)
2. Xem log server
3. Restart server
4. Xóa localStorage và thử lại

---

**Chúc bạn sử dụng hiệu quả! 🎉**
