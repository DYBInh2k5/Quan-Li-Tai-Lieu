# 📚 Hệ Thống Quản Lý Tài Liệu & Bài Tập

Ứng dụng web full-stack để quản lý tài liệu và bài tập với backend Node.js + Express và database SQLite.

## ✨ Tính Năng

### 📄 Quản Lý Tài Liệu
- ✅ Upload tài liệu (PDF, DOC, DOCX, TXT, PPT, PPTX, XLS, XLSX)
- ✅ Phân loại theo danh mục (Bài giảng, Bài tập, Tham khảo, Đề thi)
- ✅ Xem dạng lưới (Grid) hoặc danh sách (List)
- ✅ Tìm kiếm và lọc theo danh mục
- ✅ Sắp xếp (Mới nhất, Cũ nhất, Tên A-Z)
- ✅ Preview file trước khi upload
- ✅ Tải xuống và xóa tài liệu

### 📝 Quản Lý Bài Tập
- ✅ Gửi bài tập với thông tin học sinh
- ✅ Upload nhiều file cùng lúc
- ✅ Thêm email học sinh
- ✅ Chấm điểm bài tập (0-10)
- ✅ Theo dõi trạng thái (Chờ chấm / Đã chấm)
- ✅ Tìm kiếm và lọc nâng cao
- ✅ Sắp xếp theo điểm, ngày
- ✅ Xuất báo cáo Excel

### 📊 Thống Kê & Phân Tích
- 📈 Dashboard với số liệu tổng quan
- 🏆 Bảng xếp hạng học sinh
- 📊 Phân bố điểm số
- 🕐 Nhật ký hoạt động gần đây
- 📉 Biểu đồ trực quan

### 📅 Quản Lý Lịch Hẹn
- ⏰ Thêm deadline cho bài tập
- 👥 Lên lịch họp
- 📝 Đặt lịch kiểm tra
- 🎉 Quản lý sự kiện
- 🔔 Thông báo deadline sắp tới
- ✅ Đánh dấu hoàn thành

### 🖼️ Thư Viện Media & Links
- 📸 Upload và quản lý hình ảnh
- 🎨 Phân loại ảnh theo danh mục
- 👁️ Xem ảnh với lightbox modal
- 📊 Theo dõi lượt xem
- 🔗 Lưu trữ liên kết hữu ích
- 🎥 Phân loại links (Video, Bài viết, Khóa học, Công cụ)
- 📈 Theo dõi số lượt click
- 🔍 Tìm kiếm và lọc nhanh

### 📝 Ghi Chú & To-Do
- ✍️ Ghi chú nhanh với nhiều màu sắc
- 📌 Ghim ghi chú quan trọng
- 📦 Lưu trữ ghi chú cũ
- ✅ Danh sách công việc (To-Do List)
- ✔️ Đánh dấu hoàn thành
- 🎨 Tùy chỉnh màu sắc ghi chú

### 🚀 Tính Năng Upload Nâng Cao
- 🖱️ Drag & Drop upload
- 📁 Bulk upload nhiều file cùng lúc
- 🔗 Upload từ URL
- ☁️ Tích hợp Google Drive (đang phát triển)
- 📄 Sử dụng mẫu tài liệu có sẵn
- 🔄 Quản lý phiên bản tài liệu
- 🔗 Chia sẻ tài liệu qua email/link
- 📱 Tạo QR Code cho tài liệu
- 👁️ Preview tài liệu trực tiếp
- 🏷️ Thêm tags cho tài liệu
- ⭐ Đánh dấu yêu thích
- 👥 Mời cộng tác viên

### 💾 Backup & Settings
- 📤 Xuất toàn bộ dữ liệu (JSON)
- 💾 Tải database SQLite
- 📥 Nhập dữ liệu từ backup
- ⚙️ Cài đặt tùy chỉnh
- 🌙 Chế độ tối (Dark Mode)
- 🔔 Quản lý thông báo
- ⌨️ Phím tắt (Keyboard Shortcuts)

### 🎨 Giao Diện & UX
- 💎 Animations mượt mà
- 🌈 Gradient backgrounds đẹp mắt
- 📱 Responsive - hoạt động tốt trên mobile
- 🔔 Toast notifications
- ⚡ Loading states
- 🎯 Intuitive UI/UX

### 🚀 Tính Năng Hiện Đại

#### 🎤 Voice Commands (Điều khiển giọng nói)
- Điều khiển ứng dụng bằng giọng nói
- Hỗ trợ tiếng Việt
- Chuyển tab, tìm kiếm, bật dark mode

#### 🤖 AI Assistant
- Chatbot hỗ trợ 24/7
- Trả lời câu hỏi về hệ thống
- Gợi ý tính năng

#### 🔍 Smart Search
- Tìm kiếm thông minh với suggestions
- Autocomplete
- Preview kết quả ngay lập tức

#### 📱 Progressive Web App (PWA)
- Cài đặt như ứng dụng native
- Hoạt động offline
- Push notifications
- Background sync

#### 🎨 Theme Customization
- 5 themes đẹp: Default, Ocean, Sunset, Forest, Purple
- Tùy chỉnh màu sắc
- Lưu preferences

#### 🌐 Offline Mode
- Làm việc không cần internet
- Tự động sync khi online
- Cache thông minh

#### 🔔 Real-time Notifications
- Thông báo hoạt động mới
- Desktop notifications
- In-app alerts

#### 👥 Collaboration (Đang phát triển)
- Xem users đang online
- Real-time updates
- Collaborative editing

#### ➕ Floating Action Button (FAB)
- Quick actions
- Upload nhanh
- Ghi chú nhanh
- AI chat

### 🎮 Gamification & Fun Features

#### 🏆 Hệ Thống Thành Tích
- Tích điểm XP khi hoạt động
- Level system (lên cấp)
- 10+ achievements để mở khóa
- Bảng xếp hạng cá nhân
- Animations đẹp mắt

#### 🍅 Pomodoro Timer
- Timer tập trung học tập
- Presets: 25, 15, 5 phút
- Nhận XP khi hoàn thành
- Âm thanh thông báo

#### 🎵 Study Music Player
- 4 playlists học tập:
  - Lofi Hip Hop
  - Classical Focus
  - Nature Sounds
  - Jazz Study
- Tích hợp YouTube
- Phát trực tiếp

#### 💡 Motivational Quotes
- Quotes động viên mỗi ngày
- Hiển thị tự động
- Nguồn trích dẫn

#### 🎊 Easter Eggs
- Konami Code (↑↑↓↓←→←→BA)
- Confetti effects
- Rainbow mode
- Hidden achievements

#### 🎯 Achievements List
- 🎯 Người Khởi Đầu - Upload tài liệu đầu tiên
- 📝 Học Sinh Chăm Chỉ - Nộp bài tập đầu tiên
- 📚 Người Đóng Góp - Upload 10 tài liệu
- ⭐ Điểm Tuyệt Đối - Đạt điểm 10
- 🔥 Kiên Trì - Đăng nhập 7 ngày liên tiếp
- 🦉 Cú Đêm - Hoạt động sau 12h đêm
- 🐦 Chim Sớm - Hoạt động trước 6h sáng
- 🦋 Người Kết Nối - Chia sẻ 5 tài liệu
- 📓 Bậc Thầy Ghi Chú - Tạo 20 ghi chú
- ⚡ Tốc Độ - Hoàn thành 5 bài tập trong 1 ngày

## 🚀 Cài Đặt & Chạy

### Yêu Cầu
- Node.js (phiên bản 14 trở lên)
- npm hoặc yarn

### Các Bước

1. **Cài đặt dependencies:**
```bash
npm install
```

2. **Chạy migration database (chỉ lần đầu):**
```bash
node migrate-database.js
```
Script này sẽ:
- Cập nhật cấu trúc database
- Tạo tài khoản admin mặc định

3. **Chạy server:**
```bash
npm start
```

Hoặc chạy ở chế độ development (tự động restart khi có thay đổi):
```bash
npm run dev
```

4. **Mở trình duyệt:**
```
http://localhost:3000/login.html
```

5. **Đăng nhập với tài khoản mặc định:**
- Username: `admin`
- Password: `admin123`
- ⚠️ **Quan trọng:** Đổi mật khẩu ngay sau khi đăng nhập!

## 📁 Cấu Trúc Dự Án

```
├── public/              # Frontend files
│   ├── index.html      # Giao diện chính
│   ├── app.js          # JavaScript frontend
│   └── styles.css      # CSS styling
├── uploads/            # Thư mục lưu file (tự động tạo)
│   ├── documents/      # Tài liệu
│   └── assignments/    # Bài tập
├── server.js           # Backend server
├── database.db         # SQLite database (tự động tạo)
├── package.json        # Dependencies
└── README.md           # Tài liệu này
```

## 🔧 API Endpoints

### Tài Liệu
- `GET /api/documents` - Lấy danh sách tài liệu
- `POST /api/documents` - Upload tài liệu
- `GET /api/documents/:id/download` - Tải xuống tài liệu
- `DELETE /api/documents/:id` - Xóa tài liệu

### Bài Tập
- `GET /api/assignments` - Lấy danh sách bài tập (có filter)
- `POST /api/assignments` - Gửi bài tập
- `PATCH /api/assignments/:id/grade` - Chấm điểm
- `GET /api/assignments/:id/download` - Tải xuống bài tập
- `DELETE /api/assignments/:id` - Xóa bài tập

### Thống Kê
- `GET /api/stats` - Lấy thống kê tổng quan

## 💾 Database Schema

### 📊 6 Tables

1. **documents** - Quản lý tài liệu (với category, tags, download count)
2. **assignments** - Quản lý bài tập (với email, feedback, graded date)
3. **deadlines** - Quản lý lịch hẹn (với priority, status tracking)
4. **activity_logs** - Nhật ký hoạt động hệ thống
5. **users** - Quản lý người dùng (tương lai)
6. **comments** - Bình luận (tương lai)

Chi tiết xem file [DATABASE.md](DATABASE.md)

## 🎨 Giao Diện

- Responsive design - hoạt động tốt trên mọi thiết bị
- Giao diện hiện đại với gradient màu tím
- Thống kê real-time
- Tìm kiếm và lọc nhanh
- Thông báo trực quan

## 📝 Lưu Ý

- File upload tối đa: 50MB
- Database: SQLite (phù hợp cho quy mô nhỏ-trung bình)
- File được lưu trong thư mục `uploads/`
- Dữ liệu được lưu trong file `database.db`

## 🔐 Bảo Mật

Đây là phiên bản demo cơ bản. Để sử dụng trong môi trường production, nên thêm:
- Xác thực người dùng (authentication)
- Phân quyền (authorization)
- Validation dữ liệu đầu vào
- Rate limiting
- HTTPS
- Sanitize file names
- Virus scanning cho uploaded files

## 📈 Nâng Cấp Tiếp Theo

- [ ] Thêm xác thực người dùng
- [ ] Phân quyền giáo viên/học sinh
- [ ] Thông báo real-time
- [ ] Export báo cáo Excel/PDF
- [ ] Gửi email thông báo
- [ ] Preview file trực tiếp
- [ ] Bình luận trên bài tập
- [ ] Lịch sử chỉnh sửa

## 📞 Hỗ Trợ

Nếu gặp vấn đề, hãy kiểm tra:
1. Node.js đã được cài đặt chưa
2. Port 3000 có bị chiếm dụng không
3. Quyền ghi file trong thư mục dự án

---

Made with ❤️ using Node.js + Express + SQLite
