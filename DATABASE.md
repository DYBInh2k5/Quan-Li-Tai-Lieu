# 💾 Database Documentation

## Cấu Trúc Database

Hệ thống sử dụng **SQLite** để lưu trữ dữ liệu. File database: `database.db`

### 📊 Tables

#### 1. **documents** - Quản lý tài liệu
```sql
CREATE TABLE documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT,                    -- lecture, exercise, reference, exam, other
    description TEXT,
    fileName TEXT NOT NULL,
    filePath TEXT NOT NULL,
    fileSize INTEGER,
    uploadedBy TEXT,
    tags TEXT,
    downloadCount INTEGER DEFAULT 0,
    uploadDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    lastModified DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Các trường:**
- `id`: ID tự động tăng
- `title`: Tên tài liệu
- `category`: Danh mục (Bài giảng, Bài tập, Tham khảo, Đề thi, Khác)
- `description`: Mô tả chi tiết
- `fileName`: Tên file gốc
- `filePath`: Đường dẫn lưu trữ
- `fileSize`: Kích thước file (bytes)
- `uploadedBy`: Người upload (tương lai)
- `tags`: Tags phân loại (tương lai)
- `downloadCount`: Số lượt tải xuống
- `uploadDate`: Ngày upload
- `lastModified`: Ngày chỉnh sửa cuối

#### 2. **assignments** - Quản lý bài tập
```sql
CREATE TABLE assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    student TEXT NOT NULL,
    email TEXT,
    fileName TEXT NOT NULL,
    filePath TEXT NOT NULL,
    fileSize INTEGER,
    note TEXT,
    status TEXT DEFAULT 'pending',    -- pending, graded
    grade REAL,
    feedback TEXT,
    submitDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    gradedDate DATETIME,
    gradedBy TEXT
);
```

**Các trường:**
- `id`: ID tự động tăng
- `title`: Tên bài tập
- `student`: Tên học sinh
- `email`: Email học sinh
- `fileName`: Tên file
- `filePath`: Đường dẫn file
- `fileSize`: Kích thước file
- `note`: Ghi chú của học sinh
- `status`: Trạng thái (pending/graded)
- `grade`: Điểm số (0-10)
- `feedback`: Nhận xét của giáo viên
- `submitDate`: Ngày nộp
- `gradedDate`: Ngày chấm
- `gradedBy`: Người chấm (tương lai)

#### 3. **deadlines** - Quản lý lịch hẹn
```sql
CREATE TABLE deadlines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    deadlineDate DATETIME NOT NULL,
    type TEXT NOT NULL,               -- deadline, meeting, exam, event
    status TEXT DEFAULT 'upcoming',   -- upcoming, overdue, completed
    priority TEXT DEFAULT 'normal',   -- low, normal, high
    assignedTo TEXT,
    createdBy TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    completedAt DATETIME
);
```

**Các trường:**
- `id`: ID tự động tăng
- `title`: Tiêu đề
- `description`: Mô tả chi tiết
- `deadlineDate`: Ngày giờ deadline
- `type`: Loại (deadline, meeting, exam, event)
- `status`: Trạng thái (upcoming, overdue, completed)
- `priority`: Độ ưu tiên (low, normal, high)
- `assignedTo`: Người được giao (tương lai)
- `createdBy`: Người tạo (tương lai)
- `createdAt`: Ngày tạo
- `completedAt`: Ngày hoàn thành

#### 4. **activity_logs** - Nhật ký hoạt động
```sql
CREATE TABLE activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT NOT NULL,             -- upload, submit, grade, delete, create, update
    entityType TEXT NOT NULL,         -- document, assignment, deadline
    entityId INTEGER,
    entityTitle TEXT,
    userName TEXT,
    details TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Các trường:**
- `id`: ID tự động tăng
- `action`: Hành động (upload, submit, grade, delete, create, update)
- `entityType`: Loại đối tượng (document, assignment, deadline)
- `entityId`: ID của đối tượng
- `entityTitle`: Tiêu đề đối tượng
- `userName`: Người thực hiện
- `details`: Chi tiết
- `createdAt`: Thời gian

#### 5. **users** - Quản lý người dùng (Tương lai)
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    fullName TEXT,
    role TEXT DEFAULT 'student',      -- admin, teacher, student
    avatar TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    lastLogin DATETIME
);
```

#### 6. **comments** - Bình luận (Tương lai)
```sql
CREATE TABLE comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entityType TEXT NOT NULL,
    entityId INTEGER NOT NULL,
    userName TEXT NOT NULL,
    content TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🔄 API Endpoints

### Documents
- `GET /api/documents` - Lấy danh sách tài liệu
- `POST /api/documents` - Upload tài liệu mới
- `GET /api/documents/:id/download` - Tải xuống tài liệu
- `DELETE /api/documents/:id` - Xóa tài liệu

### Assignments
- `GET /api/assignments` - Lấy danh sách bài tập (có filter)
- `POST /api/assignments` - Gửi bài tập mới
- `PATCH /api/assignments/:id/grade` - Chấm điểm bài tập
- `GET /api/assignments/:id/download` - Tải xuống bài tập
- `DELETE /api/assignments/:id` - Xóa bài tập

### Deadlines
- `GET /api/deadlines` - Lấy danh sách deadline (có filter)
- `POST /api/deadlines` - Thêm deadline mới
- `PATCH /api/deadlines/:id` - Cập nhật trạng thái deadline
- `DELETE /api/deadlines/:id` - Xóa deadline

### Activity Logs
- `GET /api/activities` - Lấy nhật ký hoạt động

### Comments (Tương lai)
- `GET /api/comments/:entityType/:entityId` - Lấy comments
- `POST /api/comments` - Thêm comment mới

### Stats
- `GET /api/stats` - Lấy thống kê tổng quan

## 🛠️ Backup & Restore

### Backup Database
```bash
# Copy file database
copy database.db database_backup_YYYYMMDD.db
```

### Restore Database
```bash
# Restore từ backup
copy database_backup_YYYYMMDD.db database.db
```

### Export to SQL
```bash
# Sử dụng sqlite3 command line
sqlite3 database.db .dump > backup.sql
```

### Import from SQL
```bash
sqlite3 database.db < backup.sql
```

## 📈 Indexes (Tương lai)

Để tối ưu hiệu suất, có thể thêm indexes:

```sql
-- Index cho tìm kiếm tài liệu
CREATE INDEX idx_documents_title ON documents(title);
CREATE INDEX idx_documents_category ON documents(category);

-- Index cho tìm kiếm bài tập
CREATE INDEX idx_assignments_student ON assignments(student);
CREATE INDEX idx_assignments_status ON assignments(status);

-- Index cho deadline
CREATE INDEX idx_deadlines_date ON deadlines(deadlineDate);
CREATE INDEX idx_deadlines_status ON deadlines(status);

-- Index cho activity logs
CREATE INDEX idx_activity_entity ON activity_logs(entityType, entityId);
```

## 🔐 Security Notes

1. **File Upload**: Giới hạn 50MB, validate file types
2. **SQL Injection**: Sử dụng prepared statements
3. **Path Traversal**: Validate file paths
4. **Authentication**: Chưa implement (tương lai)

## 📊 Database Size Management

- Tự động log rotation cho activity_logs
- Xóa file khi xóa records
- Vacuum database định kỳ:
  ```sql
  VACUUM;
  ```

## 🔮 Future Enhancements

- [ ] Full-text search
- [ ] Database migrations
- [ ] Soft delete
- [ ] Audit trail
- [ ] Data encryption
- [ ] Multi-tenancy
- [ ] Replication

---

**Last Updated:** December 2024
