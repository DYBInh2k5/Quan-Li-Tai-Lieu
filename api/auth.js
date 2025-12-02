// Vercel Serverless API - Auth endpoints
const crypto = require('crypto');

// In-memory user storage (global để persist giữa các requests)
if (!global.users) {
    global.users = [
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
}

function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

function generateToken() {
    return crypto.randomBytes(32).toString('hex');
}

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const users = global.users;
    const { pathname } = new URL(req.url, `http://${req.headers.host}`);
    const path = pathname.replace('/api/auth', '');

    try {
        // Login
        if (path === '/login' && req.method === 'POST') {
            const { username, password } = req.body;
            
            if (!username || !password) {
                return res.status(400).json({ error: 'Thiếu thông tin đăng nhập' });
            }
            
            const hashedPassword = hashPassword(password);
            const user = users.find(u => 
                (u.username === username || u.email === username) && 
                u.password === hashedPassword
            );
            
            if (!user) {
                return res.status(401).json({ error: 'Tên đăng nhập hoặc mật khẩu không đúng' });
            }
            
            const token = generateToken();
            user.token = token;
            user.lastLogin = new Date().toISOString();
            
            return res.json({
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
        }

        // Register
        if (path === '/register' && req.method === 'POST') {
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
            return res.json({ id: newUser.id, message: 'Đăng ký thành công' });
        }

        // Verify
        if (path === '/verify' && req.method === 'GET') {
            const token = req.headers.authorization?.replace('Bearer ', '');
            
            if (!token) {
                return res.status(401).json({ error: 'Token không hợp lệ' });
            }
            
            const user = users.find(u => u.token === token);
            if (!user) {
                return res.status(401).json({ error: 'Token không hợp lệ' });
            }
            
            return res.json({
                valid: true,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    fullName: user.fullName,
                    role: user.role,
                    avatar: user.avatar
                }
            });
        }

        // Logout
        if (path === '/logout' && req.method === 'POST') {
            const token = req.headers.authorization?.replace('Bearer ', '');
            const user = users.find(u => u.token === token);
            
            if (user) {
                user.token = null;
            }
            
            return res.json({ message: 'Đăng xuất thành công' });
        }

        // Profile
        if (path === '/profile' && req.method === 'GET') {
            const token = req.headers.authorization?.replace('Bearer ', '');
            const user = users.find(u => u.token === token);
            
            if (!user) {
                return res.status(401).json({ error: 'Token không hợp lệ' });
            }
            
            return res.json({
                id: user.id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                avatar: user.avatar,
                createdAt: user.createdAt,
                lastLogin: user.lastLogin
            });
        }

        return res.status(404).json({ error: 'Not found' });
        
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
