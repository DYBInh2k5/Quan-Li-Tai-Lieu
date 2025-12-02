// Vercel Serverless Function
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Tạo thư mục uploads trong /tmp cho Vercel
const uploadsDir = '/tmp/uploads';
const docsDir = path.join(uploadsDir, 'documents');
const assignmentsDir = path.join(uploadsDir, 'assignments');
const imagesDir = path.join(uploadsDir, 'images');

[uploadsDir, docsDir, assignmentsDir, imagesDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Cấu hình Multer
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
    limits: { fileSize: 50 * 1024 * 1024 }
});

// Database trong /tmp cho Vercel
const dbPath = '/tmp/database.db';
let db;

function initDB() {
    return new Promise((resolve, reject) => {
        db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error('Database error:', err);
                reject(err);
            } else {
                console.log('✅ Database connected');
                initDatabase().then(resolve).catch(reject);
            }
        });
    });
}

function initDatabase() {
    return new Promise((resolve) => {
        // Bảng users
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
        )`, () => {
            // Tạo admin mặc định
            createDefaultAdmin();
            resolve();
        });
    });
}

function createDefaultAdmin() {
    db.get('SELECT * FROM users WHERE username = ?', ['admin'], (err, user) => {
        if (!user) {
            const hashedPassword = hashPassword('admin123');
            const sql = `INSERT INTO users (username, email, fullName, password, role) 
                         VALUES (?, ?, ?, ?, ?)`;
            
            db.run(sql, ['admin', 'admin@example.com', 'Administrator', hashedPassword, 'admin'], (err) => {
                if (!err) {
                    console.log('✅ Admin created: admin/admin123');
                }
            });
        }
    });
}

function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

function generateToken() {
    return crypto.randomBytes(32).toString('hex');
}

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

// ===== API ROUTES =====

// Health check
app.get('/api', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'API đang hoạt động',
        timestamp: new Date().toISOString()
    });
});

// Register
app.post('/api/auth/register', (req, res) => {
    const { fullName, email, username, password, role } = req.body;
    
    if (!fullName || !email || !username || !password) {
        return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
    }
    
    if (password.length < 6) {
        return res.status(400).json({ error: 'Mật khẩu phải có ít nhất 6 ký tự' });
    }
    
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
        
        const token = generateToken();
        
        db.run('UPDATE users SET token = ?, lastLogin = CURRENT_TIMESTAMP WHERE id = ?', 
            [token, user.id], (err) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            
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
        res.json({ message: 'Đăng xuất thành công' });
    });
});

// Get profile
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

// Stats endpoint
app.get('/api/stats', (req, res) => {
    res.json({
        totalDocuments: 0,
        totalAssignments: 0,
        pendingAssignments: 0,
        averageGrade: 0
    });
});

// Initialize database before handling requests
let dbInitialized = false;

app.use(async (req, res, next) => {
    if (!dbInitialized) {
        try {
            await initDB();
            dbInitialized = true;
        } catch (err) {
            console.error('DB init error:', err);
        }
    }
    next();
});

// Export for Vercel
module.exports = app;
