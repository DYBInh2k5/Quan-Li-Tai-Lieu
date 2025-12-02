// Database Migration Script
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

console.log('🔄 Bắt đầu migration database...');

db.serialize(() => {
    // Check if password column exists
    db.all("PRAGMA table_info(users)", [], (err, columns) => {
        if (err) {
            console.error('❌ Lỗi:', err);
            return;
        }
        
        const hasPassword = columns.some(col => col.name === 'password');
        const hasToken = columns.some(col => col.name === 'token');
        
        if (!hasPassword) {
            console.log('➕ Thêm cột password...');
            db.run('ALTER TABLE users ADD COLUMN password TEXT', (err) => {
                if (err) {
                    console.error('❌ Lỗi thêm password:', err);
                } else {
                    console.log('✅ Đã thêm cột password');
                }
            });
        } else {
            console.log('✅ Cột password đã tồn tại');
        }
        
        if (!hasToken) {
            console.log('➕ Thêm cột token...');
            db.run('ALTER TABLE users ADD COLUMN token TEXT', (err) => {
                if (err) {
                    console.error('❌ Lỗi thêm token:', err);
                } else {
                    console.log('✅ Đã thêm cột token');
                }
            });
        } else {
            console.log('✅ Cột token đã tồn tại');
        }
        
        // Create default admin account if no users exist
        db.get('SELECT COUNT(*) as count FROM users', [], (err, row) => {
            if (err) {
                console.error('❌ Lỗi:', err);
                return;
            }
            
            if (row.count === 0) {
                console.log('👤 Tạo tài khoản admin mặc định...');
                const crypto = require('crypto');
                const password = 'admin123';
                const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
                
                const sql = `INSERT INTO users (username, email, password, fullName, role) 
                             VALUES (?, ?, ?, ?, ?)`;
                
                db.run(sql, ['admin', 'admin@example.com', hashedPassword, 'Administrator', 'admin'], (err) => {
                    if (err) {
                        console.error('❌ Lỗi tạo admin:', err);
                    } else {
                        console.log('✅ Đã tạo tài khoản admin');
                        console.log('📧 Username: admin');
                        console.log('🔒 Password: admin123');
                        console.log('⚠️  Vui lòng đổi mật khẩu sau khi đăng nhập!');
                    }
                    
                    db.close(() => {
                        console.log('✅ Migration hoàn tất!');
                        console.log('🚀 Bạn có thể khởi động server: npm start');
                    });
                });
            } else {
                console.log(`✅ Database đã có ${row.count} người dùng`);
                db.close(() => {
                    console.log('✅ Migration hoàn tất!');
                });
            }
        });
    });
});
