const express = require('express');
const multer = require('multer');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Tạo thư mục uploads nếu chưa có
const uploadsDir = path.join(__dirname, 'uploads');
const docsDir = path.join(uploadsDir, 'documents');
const assignmentsDir = path.join(uploadsDir, 'assignments');
const imagesDir = path.join(uploadsDir, 'images');

[uploadsDir, docsDir, assignmentsDir, imagesDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Cấu hình Multer cho upload file
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const type = req.body.type || 'documents';
        let dir = docsDir;
        if (type === 'assignments') dir = assignmentsDir;
        else if (type === 'images') dir = imagesDir;
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

// Khởi tạo Database
const dbPath = process.env.DATABASE_PATH || './database.db';
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Lỗi kết nối database:', err);
    } else {
        console.log('✅ Đã kết nối database');
        initDatabase();
    }
});

function initDatabase() {
    console.log('🔧 Initializing database...');
    
    // Bảng tài liệu
    db.run(`CREATE TABLE IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        category TEXT,
        description TEXT,
        fileName TEXT NOT NULL,
        filePath TEXT NOT NULL,
        fileSize INTEGER,
        uploadedBy TEXT,
        tags TEXT,
        downloadCount INTEGER DEFAULT 0,
        uploadDate DATETIME DEFAULT CURRENT_TIMESTAMP,
        lastModified DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Bảng bài tập
    db.run(`CREATE TABLE IF NOT EXISTS assignments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        student TEXT NOT NULL,
        email TEXT,
        fileName TEXT NOT NULL,
        filePath TEXT NOT NULL,
        fileSize INTEGER,
        note TEXT,
        status TEXT DEFAULT 'pending',
        grade REAL,
        feedback TEXT,
        submitDate DATETIME DEFAULT CURRENT_TIMESTAMP,
        gradedDate DATETIME,
        gradedBy TEXT
    )`);

    // Bảng lịch hẹn/deadline
    db.run(`CREATE TABLE IF NOT EXISTS deadlines (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        deadlineDate DATETIME NOT NULL,
        type TEXT NOT NULL,
        status TEXT DEFAULT 'upcoming',
        priority TEXT DEFAULT 'normal',
        assignedTo TEXT,
        createdBy TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        completedAt DATETIME
    )`);

    // Bảng nhật ký hoạt động
    db.run(`CREATE TABLE IF NOT EXISTS activity_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action TEXT NOT NULL,
        entityType TEXT NOT NULL,
        entityId INTEGER,
        entityTitle TEXT,
        userName TEXT,
        details TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Bảng người dùng
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        fullName TEXT,
        role TEXT DEFAULT 'student',
        avatar TEXT,
        token TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        lastLogin DATETIME
    )`);

    // Bảng comments
    db.run(`CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entityType TEXT NOT NULL,
        entityId INTEGER NOT NULL,
        userName TEXT NOT NULL,
        content TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Bảng hình ảnh
    db.run(`CREATE TABLE IF NOT EXISTS images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        category TEXT,
        description TEXT,
        fileName TEXT NOT NULL,
        filePath TEXT NOT NULL,
        fileSize INTEGER,
        width INTEGER,
        height INTEGER,
        viewCount INTEGER DEFAULT 0,
        uploadedBy TEXT,
        uploadDate DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Bảng liên kết
    db.run(`CREATE TABLE IF NOT EXISTS links (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        url TEXT NOT NULL,
        category TEXT,
        description TEXT,
        favicon TEXT,
        clickCount INTEGER DEFAULT 0,
        createdBy TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        lastClicked DATETIME
    )`);

    // Bảng ghi chú
    db.run(`CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT,
        color TEXT DEFAULT 'yellow',
        isPinned INTEGER DEFAULT 0,
        isArchived INTEGER DEFAULT 0,
        createdBy TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Bảng to-do
    db.run(`CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text TEXT NOT NULL,
        isCompleted INTEGER DEFAULT 0,
        priority TEXT DEFAULT 'normal',
        dueDate DATETIME,
        createdBy TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        completedAt DATETIME
    )`);

    console.log('✅ Database schema initialized');
    
    // Tạo tài khoản admin mặc định
    createDefaultAdmin();
}

function createDefaultAdmin() {
    db.get('SELECT * FROM users WHERE username = ?', ['admin'], (err, user) => {
        if (!user) {
            const hashedPassword = hashPassword('admin123');
            const sql = `INSERT INTO users (username, email, fullName, password, role) 
                         VALUES (?, ?, ?, ?, ?)`;
            
            db.run(sql, ['admin', 'admin@example.com', 'Administrator', hashedPassword, 'admin'], function(err) {
                if (err) {
                    console.error('❌ Error creating admin:', err);
                } else {
                    console.log('✅ Default admin created (username: admin, password: admin123)');
                }
            });
        } else {
            console.log('✅ Admin account already exists');
        }
    });
}

// Helper function: Log activity
function logActivity(action, entityType, entityId, entityTitle, details = '', userName = '') {
    const sql = `INSERT INTO activity_logs (action, entityType, entityId, entityTitle, details, userName) 
                 VALUES (?, ?, ?, ?, ?, ?)`;
    db.run(sql, [action, entityType, entityId, entityTitle, details, userName], (err) => {
        if (err) console.error('Error logging activity:', err);
    });
}

// Helper function: Hash password
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// Helper function: Generate token
function generateToken() {
    return crypto.randomBytes(32).toString('hex');
}

// Middleware: Verify token
function verifyToken(req, res, next) {
    const token = req.headers['authorization']?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({ error: 'Token không hợp lệ' });
    }
    
    db.get('SELECT * FROM users WHERE token = ?', [token], (err, user) => {
        if (err || !user) {
            return res.status(401).json({ error: 'Token không hợp lệ' });
        }
        
        req.user = user;
        next();
    });
}

// API Routes

// ===== AUTHENTICATION API =====

// Register
app.post('/api/auth/register', (req, res) => {
    const { fullName, email, username, password, role } = req.body;
    
    if (!fullName || !email || !username || !password) {
        return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
    }
    
    if (password.length < 6) {
        return res.status(400).json({ error: 'Mật khẩu phải có ít nhất 6 ký tự' });
    }
    
    // Check if username or email exists
    db.get('SELECT * FROM users WHERE username = ? OR email = ?', [username, email], (err, existingUser) => {
        if (existingUser) {
            return res.status(400).json({ error: 'Tên đăng nhập hoặc email đã tồn tại' });
        }
        
        const hashedPassword = hashPassword(password);
        const sql = `INSERT INTO users (username, email, fullName, password, role) 
                     VALUES (?, ?, ?, ?, ?)`;
        
        db.run(sql, [username, email, fullName, hashedPassword, role || 'student'], function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            
            logActivity('register', 'user', this.lastID, fullName, 'Đăng ký tài khoản mới', username);
            res.json({ id: this.lastID, message: 'Đăng ký thành công' });
        });
    });
});

// Login
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ error: 'Thiếu thông tin đăng nhập' });
    }
    
    const hashedPassword = hashPassword(password);
    
    db.get('SELECT * FROM users WHERE (username = ? OR email = ?) AND password = ?', 
        [username, username, hashedPassword], (err, user) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        if (!user) {
            return res.status(401).json({ error: 'Tên đăng nhập hoặc mật khẩu không đúng' });
        }
        
        // Generate token
        const token = generateToken();
        
        db.run('UPDATE users SET token = ?, lastLogin = CURRENT_TIMESTAMP WHERE id = ?', 
            [token, user.id], (err) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            
            logActivity('login', 'user', user.id, user.fullName, 'Đăng nhập', user.username);
            
            res.json({
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    fullName: user.fullName,
                    role: user.role,
                    avatar: user.avatar
                },
                message: 'Đăng nhập thành công'
            });
        });
    });
});

// Verify token
app.get('/api/auth/verify', verifyToken, (req, res) => {
    res.json({
        valid: true,
        user: {
            id: req.user.id,
            username: req.user.username,
            email: req.user.email,
            fullName: req.user.fullName,
            role: req.user.role,
            avatar: req.user.avatar
        }
    });
});

// Logout
app.post('/api/auth/logout', verifyToken, (req, res) => {
    db.run('UPDATE users SET token = NULL WHERE id = ?', [req.user.id], (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        logActivity('logout', 'user', req.user.id, req.user.fullName, 'Đăng xuất', req.user.username);
        res.json({ message: 'Đăng xuất thành công' });
    });
});

// Get user profile
app.get('/api/auth/profile', verifyToken, (req, res) => {
    res.json({
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        fullName: req.user.fullName,
        role: req.user.role,
        avatar: req.user.avatar,
        createdAt: req.user.createdAt,
        lastLogin: req.user.lastLogin
    });
});

// Update profile
app.patch('/api/auth/profile', verifyToken, (req, res) => {
    const { fullName, email, avatar } = req.body;
    
    let updates = [];
    let params = [];
    
    if (fullName) { updates.push('fullName = ?'); params.push(fullName); }
    if (email) { updates.push('email = ?'); params.push(email); }
    if (avatar) { updates.push('avatar = ?'); params.push(avatar); }
    
    if (updates.length === 0) {
        return res.status(400).json({ error: 'Không có thông tin cập nhật' });
    }
    
    params.push(req.user.id);
    const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
    
    db.run(sql, params, (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Cập nhật thông tin thành công' });
    });
});

// Change password
app.post('/api/auth/change-password', verifyToken, (req, res) => {
    const { oldPassword, newPassword } = req.body;
    
    if (!oldPassword || !newPassword) {
        return res.status(400).json({ error: 'Thiếu thông tin' });
    }
    
    if (newPassword.length < 6) {
        return res.status(400).json({ error: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
    }
    
    const hashedOldPassword = hashPassword(oldPassword);
    
    if (hashedOldPassword !== req.user.password) {
        return res.status(401).json({ error: 'Mật khẩu cũ không đúng' });
    }
    
    const hashedNewPassword = hashPassword(newPassword);
    
    db.run('UPDATE users SET password = ? WHERE id = ?', [hashedNewPassword, req.user.id], (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Đổi mật khẩu thành công' });
    });
});

// API Routes

// Lấy danh sách tài liệu
app.get('/api/documents', (req, res) => {
    db.all('SELECT * FROM documents ORDER BY uploadDate DESC', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Upload tài liệu (protected)
app.post('/api/documents', verifyToken, upload.single('file'), (req, res) => {
    const { title, category, description } = req.body;
    const file = req.file;

    if (!title || !file) {
        return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
    }

    const sql = `INSERT INTO documents (title, category, description, fileName, filePath, fileSize, uploadedBy) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
    
    db.run(sql, [title, category, description, file.originalname, file.path, file.size, req.user.username], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        logActivity('upload', 'document', this.lastID, title, `Upload tài liệu ${category || ''}`, req.user.username);
        
        res.json({ 
            id: this.lastID, 
            message: 'Upload tài liệu thành công',
            fileName: file.originalname
        });
    });
});

// Upload từ URL
app.post('/api/documents/from-url', async (req, res) => {
    const { url, title, category } = req.body;
    
    if (!url || !title) {
        return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
    }
    
    try {
        const https = require('https');
        const http = require('http');
        const urlModule = require('url');
        
        const parsedUrl = urlModule.parse(url);
        const protocol = parsedUrl.protocol === 'https:' ? https : http;
        
        const fileName = path.basename(parsedUrl.pathname) || `download-${Date.now()}`;
        const filePath = path.join(docsDir, `${Date.now()}-${fileName}`);
        const fileStream = fs.createWriteStream(filePath);
        
        protocol.get(url, (response) => {
            response.pipe(fileStream);
            
            fileStream.on('finish', () => {
                fileStream.close();
                
                const stats = fs.statSync(filePath);
                const sql = `INSERT INTO documents (title, category, fileName, filePath, fileSize) 
                             VALUES (?, ?, ?, ?, ?)`;
                
                db.run(sql, [title, category, fileName, filePath, stats.size], function(err) {
                    if (err) {
                        fs.unlinkSync(filePath);
                        res.status(500).json({ error: err.message });
                        return;
                    }
                    
                    logActivity('upload', 'document', this.lastID, title, 'Upload từ URL');
                    res.json({ id: this.lastID, message: 'Upload từ URL thành công' });
                });
            });
        }).on('error', (err) => {
            fs.unlinkSync(filePath);
            res.status(500).json({ error: 'Không thể tải file từ URL' });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Preview document
app.get('/api/documents/:id/preview', (req, res) => {
    const id = req.params.id;
    
    db.get('SELECT * FROM documents WHERE id = ?', [id], (err, row) => {
        if (err || !row) {
            res.status(404).json({ error: 'Không tìm thấy tài liệu' });
            return;
        }
        
        const ext = row.fileName.split('.').pop().toLowerCase();
        
        if (['txt', 'md'].includes(ext)) {
            try {
                const content = fs.readFileSync(row.filePath, 'utf8');
                res.json({ ...row, content });
            } catch (error) {
                res.json(row);
            }
        } else {
            res.json(row);
        }
    });
});

// Share document via email
app.post('/api/documents/:id/share', (req, res) => {
    const id = req.params.id;
    const { email } = req.body;
    
    // TODO: Implement email sending
    // For now, just log the activity
    db.get('SELECT title FROM documents WHERE id = ?', [id], (err, row) => {
        if (row) {
            logActivity('share', 'document', id, row.title, `Chia sẻ với ${email}`);
        }
    });
    
    res.json({ message: 'Đã gửi email chia sẻ (demo)' });
});

// Add tags to document
app.post('/api/documents/:id/tags', (req, res) => {
    const id = req.params.id;
    const { tag } = req.body;
    
    db.get('SELECT tags FROM documents WHERE id = ?', [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        let tags = row.tags ? row.tags.split(',') : [];
        if (!tags.includes(tag)) {
            tags.push(tag);
        }
        
        db.run('UPDATE documents SET tags = ? WHERE id = ?', [tags.join(','), id], (err) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ message: 'Đã thêm tag' });
        });
    });
});

// Toggle favorite
app.post('/api/documents/:id/favorite', (req, res) => {
    // TODO: Implement favorites table
    res.json({ message: 'Đã cập nhật yêu thích (demo)' });
});

// Add collaborator
app.post('/api/documents/:id/collaborators', (req, res) => {
    const { email } = req.body;
    // TODO: Implement collaborators table
    res.json({ message: `Đã mời ${email} cộng tác (demo)` });
});

// Xóa tài liệu
app.delete('/api/documents/:id', (req, res) => {
    const id = req.params.id;
    
    db.get('SELECT filePath FROM documents WHERE id = ?', [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        if (row && fs.existsSync(row.filePath)) {
            fs.unlinkSync(row.filePath);
        }
        
        db.run('DELETE FROM documents WHERE id = ?', [id], (err) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            
            logActivity('delete', 'document', id, 'Tài liệu', 'Xóa tài liệu');
            res.json({ message: 'Xóa tài liệu thành công' });
        });
    });
});

// Tải xuống tài liệu
app.get('/api/documents/:id/download', (req, res) => {
    const id = req.params.id;
    
    db.get('SELECT * FROM documents WHERE id = ?', [id], (err, row) => {
        if (err || !row) {
            res.status(404).json({ error: 'Không tìm thấy tài liệu' });
            return;
        }
        
        res.download(row.filePath, row.fileName);
    });
});

// Lấy danh sách bài tập
app.get('/api/assignments', (req, res) => {
    const { search, status } = req.query;
    let sql = 'SELECT * FROM assignments WHERE 1=1';
    const params = [];
    
    if (search) {
        sql += ' AND (student LIKE ? OR title LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
    }
    
    if (status && status !== 'all') {
        sql += ' AND status = ?';
        params.push(status);
    }
    
    sql += ' ORDER BY submitDate DESC';
    
    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Gửi bài tập
app.post('/api/assignments', upload.single('file'), (req, res) => {
    const { title, student, note } = req.body;
    const file = req.file;

    if (!title || !student || !file) {
        return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
    }

    const sql = `INSERT INTO assignments (title, student, fileName, filePath, fileSize, note) 
                 VALUES (?, ?, ?, ?, ?, ?)`;
    
    db.run(sql, [title, student, file.originalname, file.path, file.size, note], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        logActivity('submit', 'assignment', this.lastID, title, `${student} nộp bài tập`);
        
        res.json({ 
            id: this.lastID, 
            message: 'Gửi bài tập thành công',
            fileName: file.originalname
        });
    });
});

// Chấm điểm bài tập
app.patch('/api/assignments/:id/grade', (req, res) => {
    const id = req.params.id;
    const { grade, feedback } = req.body;
    
    if (grade === undefined || grade < 0 || grade > 10) {
        return res.status(400).json({ error: 'Điểm không hợp lệ' });
    }
    
    const sql = 'UPDATE assignments SET grade = ?, status = ?, feedback = ?, gradedDate = CURRENT_TIMESTAMP WHERE id = ?';
    
    db.run(sql, [grade, 'graded', feedback, id], (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        // Log activity
        db.get('SELECT title, student FROM assignments WHERE id = ?', [id], (err, row) => {
            if (row) {
                logActivity('grade', 'assignment', id, row.title, `Chấm điểm ${grade}/10 cho ${row.student}`);
            }
        });
        
        res.json({ message: 'Chấm điểm thành công' });
    });
});

// Xóa bài tập
app.delete('/api/assignments/:id', (req, res) => {
    const id = req.params.id;
    
    db.get('SELECT filePath FROM assignments WHERE id = ?', [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        if (row && fs.existsSync(row.filePath)) {
            fs.unlinkSync(row.filePath);
        }
        
        db.run('DELETE FROM assignments WHERE id = ?', [id], (err) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            
            logActivity('delete', 'assignment', id, 'Bài tập', 'Xóa bài tập');
            res.json({ message: 'Xóa bài tập thành công' });
        });
    });
});

// Tải xuống bài tập
app.get('/api/assignments/:id/download', (req, res) => {
    const id = req.params.id;
    
    db.get('SELECT * FROM assignments WHERE id = ?', [id], (err, row) => {
        if (err || !row) {
            res.status(404).json({ error: 'Không tìm thấy bài tập' });
            return;
        }
        
        res.download(row.filePath, row.fileName);
    });
});

// Thống kê
app.get('/api/stats', (req, res) => {
    const stats = {};
    
    db.get('SELECT COUNT(*) as count FROM documents', [], (err, row) => {
        stats.totalDocuments = row ? row.count : 0;
        
        db.get('SELECT COUNT(*) as count FROM assignments', [], (err, row) => {
            stats.totalAssignments = row ? row.count : 0;
            
            db.get('SELECT COUNT(*) as count FROM assignments WHERE status = "pending"', [], (err, row) => {
                stats.pendingAssignments = row ? row.count : 0;
                
                db.get('SELECT AVG(grade) as avg FROM assignments WHERE grade IS NOT NULL', [], (err, row) => {
                    stats.averageGrade = row && row.avg ? row.avg.toFixed(2) : 0;
                    res.json(stats);
                });
            });
        });
    });
});

// ===== DEADLINES API =====

// Lấy danh sách deadlines
app.get('/api/deadlines', (req, res) => {
    const { type, status } = req.query;
    let sql = 'SELECT * FROM deadlines WHERE 1=1';
    const params = [];
    
    if (type && type !== 'all') {
        sql += ' AND type = ?';
        params.push(type);
    }
    
    if (status && status !== 'all') {
        sql += ' AND status = ?';
        params.push(status);
    }
    
    sql += ' ORDER BY deadlineDate ASC';
    
    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Thêm deadline
app.post('/api/deadlines', (req, res) => {
    const { title, description, deadlineDate, type, priority, assignedTo } = req.body;
    
    if (!title || !deadlineDate || !type) {
        return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
    }
    
    const sql = `INSERT INTO deadlines (title, description, deadlineDate, type, priority, assignedTo) 
                 VALUES (?, ?, ?, ?, ?, ?)`;
    
    db.run(sql, [title, description, deadlineDate, type, priority || 'normal', assignedTo], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        logActivity('create', 'deadline', this.lastID, title, `Tạo ${type} mới`);
        res.json({ id: this.lastID, message: 'Thêm lịch hẹn thành công' });
    });
});

// Cập nhật trạng thái deadline
app.patch('/api/deadlines/:id', (req, res) => {
    const id = req.params.id;
    const { status } = req.body;
    
    const sql = status === 'completed' 
        ? 'UPDATE deadlines SET status = ?, completedAt = CURRENT_TIMESTAMP WHERE id = ?'
        : 'UPDATE deadlines SET status = ? WHERE id = ?';
    
    db.run(sql, [status, id], (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        db.get('SELECT title FROM deadlines WHERE id = ?', [id], (err, row) => {
            if (row) {
                logActivity('update', 'deadline', id, row.title, `Cập nhật trạng thái: ${status}`);
            }
        });
        
        res.json({ message: 'Cập nhật thành công' });
    });
});

// Xóa deadline
app.delete('/api/deadlines/:id', (req, res) => {
    const id = req.params.id;
    
    db.get('SELECT title FROM deadlines WHERE id = ?', [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        db.run('DELETE FROM deadlines WHERE id = ?', [id], (err) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            
            if (row) {
                logActivity('delete', 'deadline', id, row.title, 'Xóa lịch hẹn');
            }
            
            res.json({ message: 'Xóa lịch hẹn thành công' });
        });
    });
});

// ===== ACTIVITY LOGS API =====

// Lấy activity logs
app.get('/api/activities', (req, res) => {
    const limit = req.query.limit || 20;
    
    db.all('SELECT * FROM activity_logs ORDER BY createdAt DESC LIMIT ?', [limit], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// ===== IMAGES API =====

// Lấy danh sách hình ảnh
app.get('/api/images', (req, res) => {
    const { category, search } = req.query;
    let sql = 'SELECT * FROM images WHERE 1=1';
    const params = [];
    
    if (category && category !== 'all') {
        sql += ' AND category = ?';
        params.push(category);
    }
    
    if (search) {
        sql += ' AND (title LIKE ? OR description LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
    }
    
    sql += ' ORDER BY uploadDate DESC';
    
    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Upload hình ảnh
app.post('/api/images', upload.single('file'), (req, res) => {
    const { title, category, description } = req.body;
    const file = req.file;
    
    if (!title || !file) {
        return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
    }
    
    const sql = `INSERT INTO images (title, category, description, fileName, filePath, fileSize) 
                 VALUES (?, ?, ?, ?, ?, ?)`;
    
    db.run(sql, [title, category, description, file.originalname, file.path, file.size], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        logActivity('upload', 'image', this.lastID, title, `Upload hình ảnh ${category || ''}`);
        
        res.json({ 
            id: this.lastID, 
            message: 'Upload hình ảnh thành công',
            fileName: file.originalname
        });
    });
});

// Tăng view count
app.post('/api/images/:id/view', (req, res) => {
    const id = req.params.id;
    
    db.run('UPDATE images SET viewCount = viewCount + 1 WHERE id = ?', [id], (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'OK' });
    });
});

// Xóa hình ảnh
app.delete('/api/images/:id', (req, res) => {
    const id = req.params.id;
    
    db.get('SELECT filePath, title FROM images WHERE id = ?', [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        if (row && fs.existsSync(row.filePath)) {
            fs.unlinkSync(row.filePath);
        }
        
        db.run('DELETE FROM images WHERE id = ?', [id], (err) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            
            logActivity('delete', 'image', id, row?.title || 'Hình ảnh', 'Xóa hình ảnh');
            res.json({ message: 'Xóa hình ảnh thành công' });
        });
    });
});

// Tải xuống hình ảnh
app.get('/api/images/:id/download', (req, res) => {
    const id = req.params.id;
    
    db.get('SELECT * FROM images WHERE id = ?', [id], (err, row) => {
        if (err || !row) {
            res.status(404).json({ error: 'Không tìm thấy hình ảnh' });
            return;
        }
        
        res.download(row.filePath, row.fileName);
    });
});

// ===== LINKS API =====

// Lấy danh sách links
app.get('/api/links', (req, res) => {
    const { category, search } = req.query;
    let sql = 'SELECT * FROM links WHERE 1=1';
    const params = [];
    
    if (category && category !== 'all') {
        sql += ' AND category = ?';
        params.push(category);
    }
    
    if (search) {
        sql += ' AND (title LIKE ? OR url LIKE ? OR description LIKE ?)';
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    sql += ' ORDER BY createdAt DESC';
    
    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Thêm link
app.post('/api/links', (req, res) => {
    const { title, url, category, description } = req.body;
    
    if (!title || !url) {
        return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
    }
    
    const sql = `INSERT INTO links (title, url, category, description) 
                 VALUES (?, ?, ?, ?)`;
    
    db.run(sql, [title, url, category, description], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        logActivity('create', 'link', this.lastID, title, `Thêm liên kết ${category || ''}`);
        
        res.json({ 
            id: this.lastID, 
            message: 'Thêm liên kết thành công'
        });
    });
});

// Tăng click count
app.post('/api/links/:id/click', (req, res) => {
    const id = req.params.id;
    
    db.run('UPDATE links SET clickCount = clickCount + 1, lastClicked = CURRENT_TIMESTAMP WHERE id = ?', [id], (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'OK' });
    });
});

// Xóa link
app.delete('/api/links/:id', (req, res) => {
    const id = req.params.id;
    
    db.get('SELECT title FROM links WHERE id = ?', [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        db.run('DELETE FROM links WHERE id = ?', [id], (err) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            
            logActivity('delete', 'link', id, row?.title || 'Liên kết', 'Xóa liên kết');
            res.json({ message: 'Xóa liên kết thành công' });
        });
    });
});

// ===== NOTES API =====

// Lấy danh sách notes
app.get('/api/notes', (req, res) => {
    const { filter } = req.query;
    let sql = 'SELECT * FROM notes WHERE 1=1';
    const params = [];
    
    if (filter === 'pinned') {
        sql += ' AND isPinned = 1 AND isArchived = 0';
    } else if (filter === 'archived') {
        sql += ' AND isArchived = 1';
    } else {
        sql += ' AND isArchived = 0';
    }
    
    sql += ' ORDER BY isPinned DESC, updatedAt DESC';
    
    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Thêm note
app.post('/api/notes', (req, res) => {
    const { title, content, color } = req.body;
    
    if (!title) {
        return res.status(400).json({ error: 'Thiếu tiêu đề' });
    }
    
    const sql = `INSERT INTO notes (title, content, color) VALUES (?, ?, ?)`;
    
    db.run(sql, [title, content, color || 'yellow'], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        logActivity('create', 'note', this.lastID, title, 'Tạo ghi chú mới');
        res.json({ id: this.lastID, message: 'Thêm ghi chú thành công' });
    });
});

// Cập nhật note
app.patch('/api/notes/:id', (req, res) => {
    const id = req.params.id;
    const { title, content, color, isPinned, isArchived } = req.body;
    
    let updates = [];
    let params = [];
    
    if (title !== undefined) { updates.push('title = ?'); params.push(title); }
    if (content !== undefined) { updates.push('content = ?'); params.push(content); }
    if (color !== undefined) { updates.push('color = ?'); params.push(color); }
    if (isPinned !== undefined) { updates.push('isPinned = ?'); params.push(isPinned ? 1 : 0); }
    if (isArchived !== undefined) { updates.push('isArchived = ?'); params.push(isArchived ? 1 : 0); }
    
    updates.push('updatedAt = CURRENT_TIMESTAMP');
    params.push(id);
    
    const sql = `UPDATE notes SET ${updates.join(', ')} WHERE id = ?`;
    
    db.run(sql, params, (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Cập nhật ghi chú thành công' });
    });
});

// Xóa note
app.delete('/api/notes/:id', (req, res) => {
    const id = req.params.id;
    
    db.get('SELECT title FROM notes WHERE id = ?', [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        db.run('DELETE FROM notes WHERE id = ?', [id], (err) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            
            logActivity('delete', 'note', id, row?.title || 'Ghi chú', 'Xóa ghi chú');
            res.json({ message: 'Xóa ghi chú thành công' });
        });
    });
});

// ===== TODOS API =====

// Lấy danh sách todos
app.get('/api/todos', (req, res) => {
    db.all('SELECT * FROM todos ORDER BY isCompleted ASC, createdAt DESC', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Thêm todo
app.post('/api/todos', (req, res) => {
    const { text, priority, dueDate } = req.body;
    
    if (!text) {
        return res.status(400).json({ error: 'Thiếu nội dung' });
    }
    
    const sql = `INSERT INTO todos (text, priority, dueDate) VALUES (?, ?, ?)`;
    
    db.run(sql, [text, priority || 'normal', dueDate], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        logActivity('create', 'todo', this.lastID, text, 'Thêm công việc mới');
        res.json({ id: this.lastID, message: 'Thêm công việc thành công' });
    });
});

// Cập nhật todo
app.patch('/api/todos/:id', (req, res) => {
    const id = req.params.id;
    const { isCompleted } = req.body;
    
    const sql = isCompleted 
        ? 'UPDATE todos SET isCompleted = ?, completedAt = CURRENT_TIMESTAMP WHERE id = ?'
        : 'UPDATE todos SET isCompleted = ?, completedAt = NULL WHERE id = ?';
    
    db.run(sql, [isCompleted ? 1 : 0, id], (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Cập nhật công việc thành công' });
    });
});

// Xóa todo
app.delete('/api/todos/:id', (req, res) => {
    const id = req.params.id;
    
    db.run('DELETE FROM todos WHERE id = ?', [id], (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Xóa công việc thành công' });
    });
});

// ===== BACKUP & EXPORT API =====

// Export all data
app.get('/api/export/all', async (req, res) => {
    try {
        const data = {};
        
        const tables = ['documents', 'assignments', 'deadlines', 'images', 'links', 'notes', 'todos', 'activity_logs'];
        
        for (const table of tables) {
            await new Promise((resolve, reject) => {
                db.all(`SELECT * FROM ${table}`, [], (err, rows) => {
                    if (err) reject(err);
                    else {
                        data[table] = rows;
                        resolve();
                    }
                });
            });
        }
        
        data.exportDate = new Date().toISOString();
        data.version = '1.0';
        
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=backup-${Date.now()}.json`);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Download database file
app.get('/api/export/database', (req, res) => {
    const dbPath = path.join(__dirname, 'database.db');
    res.download(dbPath, `database-backup-${Date.now()}.db`);
});

// ===== COMMENTS API =====

// Lấy comments
app.get('/api/comments/:entityType/:entityId', (req, res) => {
    const { entityType, entityId } = req.params;
    
    db.all('SELECT * FROM comments WHERE entityType = ? AND entityId = ? ORDER BY createdAt DESC', 
        [entityType, entityId], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Thêm comment
app.post('/api/comments', (req, res) => {
    const { entityType, entityId, userName, content } = req.body;
    
    if (!entityType || !entityId || !userName || !content) {
        return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
    }
    
    const sql = `INSERT INTO comments (entityType, entityId, userName, content) 
                 VALUES (?, ?, ?, ?)`;
    
    db.run(sql, [entityType, entityId, userName, content], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID, message: 'Thêm bình luận thành công' });
    });
});

// Khởi động server
app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
    console.log(`📊 Database: SQLite`);
    console.log(`📁 Uploads: ${uploadsDir}`);
});
