# 🔐 Hướng Dẫn Hệ Thống Xác Thực

## Tổng Quan

Hệ thống đã được nâng cấp với tính năng đăng nhập/đăng ký để quản lý người dùng và phân quyền.

## 🚀 Bắt Đầu

### 1. Truy Cập Hệ Thống

Mở trình duyệt và truy cập:
```
http://localhost:3000/login.html
```

### 2. Đăng Ký Tài Khoản Mới

**Bước 1:** Click tab "Đăng Ký"

**Bước 2:** Điền thông tin:
- Họ và tên
- Email
- Tên đăng nhập (username)
- Mật khẩu (tối thiểu 6 ký tự)
- Xác nhận mật khẩu
- Vai trò:
  - 👨‍🎓 **Học sinh**: Có thể nộp bài tập, xem tài liệu
  - 👨‍🏫 **Giáo viên**: Có thể upload tài liệu, chấm bài
  - 👑 **Quản trị viên**: Toàn quyền quản lý

**Bước 3:** Click "Đăng Ký"

### 3. Đăng Nhập

**Bước 1:** Nhập email hoặc username

**Bước 2:** Nhập mật khẩu

**Bước 3:** (Tùy chọn) Check "Ghi nhớ đăng nhập" để tự động đăng nhập lần sau

**Bước 4:** Click "Đăng Nhập"

## 👤 Quản Lý Tài Khoản

### Xem Hồ Sơ

1. Click vào tên người dùng ở góc trên bên phải
2. Chọn "👤 Hồ sơ"
3. Xem thông tin cá nhân

### Đổi Mật Khẩu

1. Vào Hồ sơ
2. Click "🔒 Đổi Mật Khẩu"
3. Nhập mật khẩu cũ
4. Nhập mật khẩu mới (tối thiểu 6 ký tự)
5. Xác nhận

### Đăng Xuất

1. Click vào tên người dùng
2. Chọn "🚪 Đăng xuất"

## 🔒 Bảo Mật

### Mật Khẩu

- Mật khẩu được mã hóa bằng SHA-256
- Không lưu trữ mật khẩu dạng plain text
- Yêu cầu tối thiểu 6 ký tự

### Token

- Mỗi phiên đăng nhập tạo token duy nhất
- Token được lưu trong localStorage
- Token tự động gửi kèm mọi API request
- Token bị xóa khi đăng xuất

### Session

- Tự động kiểm tra token khi load trang
- Redirect về login nếu token không hợp lệ
- Hỗ trợ "Ghi nhớ đăng nhập"

## 📊 Phân Quyền

### Học Sinh (Student)
- ✅ Xem tài liệu
- ✅ Nộp bài tập
- ✅ Xem điểm của mình
- ✅ Tạo ghi chú cá nhân
- ❌ Upload tài liệu
- ❌ Chấm bài
- ❌ Xem thống kê tổng quan

### Giáo Viên (Teacher)
- ✅ Tất cả quyền của Học sinh
- ✅ Upload tài liệu
- ✅ Chấm bài tập
- ✅ Xem thống kê lớp
- ✅ Quản lý deadline
- ❌ Xóa người dùng
- ❌ Thay đổi vai trò

### Quản Trị Viên (Admin)
- ✅ Toàn quyền
- ✅ Quản lý người dùng
- ✅ Xem tất cả hoạt động
- ✅ Backup/Restore dữ liệu
- ✅ Cấu hình hệ thống

## 🔧 API Endpoints

### Authentication

#### Đăng ký
```
POST /api/auth/register
Body: {
  fullName: string,
  email: string,
  username: string,
  password: string,
  role: 'student' | 'teacher' | 'admin'
}
```

#### Đăng nhập
```
POST /api/auth/login
Body: {
  username: string,
  password: string
}
Response: {
  token: string,
  user: {...}
}
```

#### Xác thực token
```
GET /api/auth/verify
Headers: {
  Authorization: Bearer <token>
}
```

#### Đăng xuất
```
POST /api/auth/logout
Headers: {
  Authorization: Bearer <token>
}
```

#### Xem profile
```
GET /api/auth/profile
Headers: {
  Authorization: Bearer <token>
}
```

#### Đổi mật khẩu
```
POST /api/auth/change-password
Headers: {
  Authorization: Bearer <token>
}
Body: {
  oldPassword: string,
  newPassword: string
}
```

## 🛡️ Protected Routes

Các API sau yêu cầu authentication:

- `POST /api/documents` - Upload tài liệu
- `DELETE /api/documents/:id` - Xóa tài liệu
- `POST /api/assignments` - Nộp bài tập
- `PATCH /api/assignments/:id/grade` - Chấm điểm
- `POST /api/images` - Upload hình ảnh
- `POST /api/links` - Thêm link
- `POST /api/notes` - Tạo ghi chú
- `POST /api/todos` - Thêm công việc
- Và nhiều API khác...

## 📝 Tracking User Activity

Mọi hoạt động của người dùng được ghi lại:

- Đăng ký/Đăng nhập/Đăng xuất
- Upload tài liệu
- Nộp bài tập
- Chấm điểm
- Tạo ghi chú
- Và nhiều hơn nữa...

Xem trong tab "📊 Thống Kê" → "Hoạt động gần đây"

## 🔄 Tích Hợp Social Login (Đang phát triển)

- Google OAuth
- Facebook Login
- Microsoft Account

## ⚠️ Lưu Ý

1. **Tài khoản demo**: Hệ thống chưa có email verification, nên có thể đăng ký với email bất kỳ

2. **Quên mật khẩu**: Tính năng đang được phát triển. Hiện tại cần liên hệ admin để reset

3. **Bảo mật**: Đây là phiên bản demo. Trong production cần:
   - HTTPS
   - Email verification
   - 2FA (Two-Factor Authentication)
   - Rate limiting
   - Password strength requirements
   - CAPTCHA

4. **Database**: Mật khẩu được hash nhưng nên sử dụng bcrypt thay vì SHA-256 trong production

## 🚀 Nâng Cấp Tiếp Theo

- [ ] Email verification
- [ ] Forgot password
- [ ] 2FA
- [ ] Social login (Google, Facebook)
- [ ] Role-based access control (RBAC)
- [ ] User management dashboard
- [ ] Activity audit log
- [ ] Session management
- [ ] IP whitelist/blacklist

## 📞 Hỗ Trợ

Nếu gặp vấn đề:

1. Kiểm tra console (F12) để xem lỗi
2. Xóa localStorage và thử lại
3. Restart server
4. Kiểm tra database.db

---

**Chúc bạn sử dụng hệ thống hiệu quả! 🎉**
