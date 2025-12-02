// Vercel Serverless Function - Simplified version
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (tạm thời cho demo)
const users = [
    {
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        password: crypto.createHash('sha256').update('admin123').digest('hex'),
        fullName: 'Administrator',
        role: 'admin',
        token: null
    }
];

const documents = [];
const assignments = [];
const notes = [];
const todos = [];

// Helper functions

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
    
    const user = users.find(u => u.token === token);
    if (!user) {
        return res.status(401).json({ error: 'Token không hợp lệ' });
    }
    
    req.user = user;
    next();
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
    
    const existingUser = users.find(u => u.username === username || u.email === email);
    if (existingUser) {
        return res.status(400).json({ error: 'Tên đăng nhập hoặc email đã tồn tại' });
    }
    
    const newUser = {
        id: users.length + 1,
        username,
        email,
        fullName,
        password: hashPassword(password),
        role: role || 'student',
        token: null,
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    res.json({ id: newUser.id, message: 'Đăng ký thành công' });
});

// Login
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ error: 'Thiếu thông tin đăng nhập' });
    }
    
    const hashedPassword = hashPassword(password);
    const user = users.find(u => (u.username === username || u.email === username) && u.password === hashedPassword);
    
    if (!user) {
        return res.status(401).json({ error: 'Tên đăng nhập hoặc mật khẩu không đúng' });
    }
    
    const token = generateToken();
    user.token = token;
    user.lastLogin = new Date().toISOString();
    
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
    req.user.token = null;
    res.json({ message: 'Đăng xuất thành công' });
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

// Additional endpoints for compatibility
app.get('/api/documents', (req, res) => {
    res.json(documents);
});

app.get('/api/assignments', (req, res) => {
    res.json(assignments);
});

app.get('/api/notes', (req, res) => {
    res.json(notes);
});

app.get('/api/todos', (req, res) => {
    res.json(todos);
});

// Export for Vercel
module.exports = app;
