# 🚀 Hướng Dẫn Deploy Lên Hosting

## Các Lựa Chọn Hosting

### 1. 🆓 Vercel (Miễn Phí - Khuyên Dùng)
**Ưu điểm:**
- Miễn phí hoàn toàn
- Tự động HTTPS
- Tên miền miễn phí: `your-app.vercel.app`
- Deploy tự động từ GitHub
- Hỗ trợ Node.js

**Bước 1: Chuẩn bị**
```bash
# Cài Vercel CLI
npm install -g vercel

# Login
vercel login
```

**Bước 2: Tạo file vercel.json**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    },
    {
      "src": "public/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server.js"
    },
    {
      "src": "/(.*)",
      "dest": "public/$1"
    }
  ]
}
```

**Bước 3: Deploy**
```bash
vercel
```

### 2. 🔷 Heroku (Miễn Phí với giới hạn)
**Ưu điểm:**
- Dễ sử dụng
- Tự động HTTPS
- Tên miền: `your-app.herokuapp.com`

**Bước 1: Cài Heroku CLI**
```bash
# Download từ: https://devcenter.heroku.com/articles/heroku-cli
```

**Bước 2: Tạo file Procfile**
```
web: node server.js
```

**Bước 3: Deploy**
```bash
heroku login
heroku create your-app-name
git push heroku main
```

### 3. 🟢 Render (Miễn Phí)
**Ưu điểm:**
- Miễn phí
- Tự động HTTPS
- Dễ setup

**Bước 1:** Truy cập https://render.com

**Bước 2:** Connect GitHub repo

**Bước 3:** Cấu hình:
- Build Command: `npm install`
- Start Command: `npm start`
- Environment: Node

### 4. 🔵 Railway (Miễn Phí $5/tháng)
**Ưu điểm:**
- Dễ dùng
- Database tích hợp
- Tự động deploy

**Deploy:**
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

### 5. 💻 VPS (VD: DigitalOcean, Vultr)
**Chi phí:** $5-10/tháng
**Ưu điểm:** Toàn quyền kiểm soát

## Chuẩn Bị Deploy

### 1. Cập nhật package.json
```json
{
  "name": "quan-ly-tai-lieu",
  "version": "1.0.0",
  "engines": {
    "node": ">=14.0.0",
    "npm": ">=6.0.0"
  },
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "migrate": "node migrate-database.js",
    "setup": "npm install && node migrate-database.js"
  }
}
```

### 2. Tạo file .env
```env
PORT=3000
NODE_ENV=production
DATABASE_PATH=./database.db
UPLOAD_DIR=./uploads
```

### 3. Cập nhật server.js
```javascript
const PORT = process.env.PORT || 3000;
```

### 4. Cập nhật API_URL trong frontend
Tạo file `public/config.js`:
```javascript
const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000/api'
  : '/api'; // Sử dụng relative URL khi deploy
```

## Deploy Chi Tiết - Vercel (Khuyên Dùng)

### Bước 1: Push code lên GitHub
```bash
# Khởi tạo git (nếu chưa có)
git init

# Add files
git add .

# Commit
git commit -m "Initial commit"

# Tạo repo trên GitHub và push
git remote add origin https://github.com/username/repo-name.git
git branch -M main
git push -u origin main
```

### Bước 2: Deploy với Vercel
```bash
# Cài Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy production
vercel --prod
```

### Bước 3: Cấu hình tên miền riêng
1. Vào Vercel Dashboard
2. Chọn project
3. Settings → Domains
4. Thêm domain của bạn
5. Cập nhật DNS records:
   - Type: A
   - Name: @
   - Value: 76.76.21.21
   
   - Type: CNAME
   - Name: www
   - Value: cname.vercel-dns.com

## Mua Tên Miền

### Nhà Cung Cấp Tên Miền Việt Nam
1. **Pa.vn** - 150k-300k/năm
2. **Tenten.vn** - 200k-400k/năm
3. **Mat Bao** - 250k-500k/năm

### Nhà Cung Cấp Quốc Tế
1. **Namecheap** - $8-15/năm
2. **GoDaddy** - $10-20/năm
3. **Google Domains** - $12/năm
4. **Cloudflare** - $8-10/năm (rẻ nhất)

### Các Đuôi Tên Miền Phổ Biến
- `.com` - Phổ biến nhất
- `.net` - Mạng
- `.org` - Tổ chức
- `.vn` - Việt Nam
- `.edu.vn` - Giáo dục VN
- `.io` - Tech startup
- `.dev` - Developer

## Cấu Hình Sau Deploy

### 1. Environment Variables
Trên Vercel/Heroku, thêm:
```
NODE_ENV=production
DATABASE_PATH=/tmp/database.db
```

### 2. Database
**Lưu ý:** SQLite không phù hợp cho production scale lớn

**Giải pháp:**
- Nâng cấp lên PostgreSQL
- Hoặc sử dụng MongoDB
- Hoặc Firebase

### 3. File Storage
**Vấn đề:** Vercel/Heroku không lưu file uploads lâu dài

**Giải pháp:**
- Sử dụng AWS S3
- Cloudinary (cho images)
- Google Cloud Storage
- Firebase Storage

### 4. HTTPS
Tất cả hosting trên đều tự động có HTTPS

### 5. Custom Domain
```bash
# Trên Vercel
vercel domains add yourdomain.com

# Trên Heroku
heroku domains:add yourdomain.com
```

## Checklist Trước Deploy

- [ ] Test tất cả tính năng local
- [ ] Chạy migration database
- [ ] Cập nhật API_URL
- [ ] Thêm .env file
- [ ] Test trên production mode
- [ ] Backup database
- [ ] Chuẩn bị tài khoản admin
- [ ] Kiểm tra security
- [ ] Setup monitoring
- [ ] Cấu hình CORS

## Monitoring & Maintenance

### 1. Uptime Monitoring
- **UptimeRobot** (miễn phí)
- **Pingdom**
- **StatusCake**

### 2. Error Tracking
- **Sentry** (miễn phí tier)
- **LogRocket**
- **Rollbar**

### 3. Analytics
- **Google Analytics**
- **Plausible** (privacy-focused)
- **Umami** (self-hosted)

## Backup Strategy

### 1. Database Backup
```bash
# Tự động backup mỗi ngày
# Tạo cron job hoặc scheduled task
0 0 * * * node backup-database.js
```

### 2. File Backup
- Sync uploads folder lên cloud storage
- Sử dụng rsync hoặc rclone

## Security Checklist

- [ ] Đổi mật khẩu admin mặc định
- [ ] Enable HTTPS
- [ ] Cấu hình CORS đúng
- [ ] Rate limiting
- [ ] Input validation
- [ ] SQL injection protection
- [ ] XSS protection
- [ ] CSRF protection
- [ ] Secure headers
- [ ] Environment variables

## Cost Estimate

### Miễn Phí (Hobby)
- Hosting: Vercel/Render (Free)
- Domain: $8-12/năm
- **Total: ~$10/năm**

### Startup ($5-20/tháng)
- Hosting: Railway/DigitalOcean ($5-10)
- Domain: $10/năm
- Database: Supabase Free
- Storage: Cloudinary Free
- **Total: ~$60-120/năm**

### Professional ($50-100/tháng)
- VPS: DigitalOcean ($20-40)
- Domain: $10/năm
- Database: Managed DB ($15-30)
- Storage: AWS S3 ($5-20)
- CDN: Cloudflare Pro ($20)
- **Total: ~$600-1200/năm**

## Recommended Setup (Miễn Phí)

1. **Hosting:** Vercel (Free)
2. **Domain:** Namecheap ($8/năm)
3. **Database:** Supabase (Free PostgreSQL)
4. **Storage:** Cloudinary (Free 25GB)
5. **Monitoring:** UptimeRobot (Free)

**Total: ~$8/năm** 🎉

## Quick Deploy Commands

```bash
# 1. Chuẩn bị
npm install
npm run migrate

# 2. Test local
npm start

# 3. Push to GitHub
git add .
git commit -m "Ready for deploy"
git push

# 4. Deploy to Vercel
vercel --prod

# 5. Thêm domain
vercel domains add yourdomain.com
```

## Support & Help

- Vercel Docs: https://vercel.com/docs
- Heroku Docs: https://devcenter.heroku.com
- Railway Docs: https://docs.railway.app
- Render Docs: https://render.com/docs

---

**Chúc bạn deploy thành công! 🚀**

Nếu cần hỗ trợ, hãy check console logs và error messages.
