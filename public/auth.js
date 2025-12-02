const API_URL = window.APP_CONFIG?.API_URL || 'http://localhost:3000/api';

// Setup tabs
document.addEventListener('DOMContentLoaded', function() {
    setupAuthTabs();
    setupForms();
    checkAutoLogin();
});

function setupAuthTabs() {
    const tabs = document.querySelectorAll('.auth-tab');
    const forms = document.querySelectorAll('.auth-form');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            
            tabs.forEach(t => t.classList.remove('active'));
            forms.forEach(f => f.classList.remove('active'));
            
            tab.classList.add('active');
            document.getElementById(`${tabName}-form`).classList.add('active');
        });
    });
}

function setupForms() {
    // Login form
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleLogin();
    });
    
    // Register form
    document.getElementById('register-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleRegister();
    });
}

async function handleLogin() {
    const form = document.getElementById('login-form');
    const btn = form.querySelector('button');
    const btnText = btn.querySelector('.btn-text');
    const btnLoading = btn.querySelector('.btn-loading');
    
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    const rememberMe = document.getElementById('remember-me').checked;
    
    if (!username || !password) {
        showToast('Vui lòng nhập đầy đủ thông tin!', 'error');
        return;
    }
    
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline';
    btn.disabled = true;
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            // Save token
            localStorage.setItem('auth_token', result.token);
            localStorage.setItem('user_info', JSON.stringify(result.user));
            
            if (rememberMe) {
                localStorage.setItem('remember_me', 'true');
            }
            
            showToast('✅ Đăng nhập thành công!', 'success');
            
            // Redirect to main app
            setTimeout(() => {
                window.location.href = '/index.html';
            }, 1000);
        } else {
            showToast('❌ ' + result.error, 'error');
        }
    } catch (error) {
        showToast('❌ Lỗi kết nối: ' + error.message, 'error');
    } finally {
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
        btn.disabled = false;
    }
}

async function handleRegister() {
    const form = document.getElementById('register-form');
    const btn = form.querySelector('button');
    const btnText = btn.querySelector('.btn-text');
    const btnLoading = btn.querySelector('.btn-loading');
    
    const fullName = document.getElementById('register-fullname').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const username = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm').value;
    const role = document.getElementById('register-role').value;
    
    // Validation
    if (!fullName || !email || !username || !password) {
        showToast('Vui lòng nhập đầy đủ thông tin!', 'error');
        return;
    }
    
    if (password.length < 6) {
        showToast('Mật khẩu phải có ít nhất 6 ký tự!', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showToast('Mật khẩu xác nhận không khớp!', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showToast('Email không hợp lệ!', 'error');
        return;
    }
    
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline';
    btn.disabled = true;
    
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullName, email, username, password, role })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showToast('✅ Đăng ký thành công! Đang chuyển sang đăng nhập...', 'success');
            
            // Switch to login tab
            setTimeout(() => {
                document.querySelector('[data-tab="login"]').click();
                document.getElementById('login-username').value = username;
            }, 1500);
        } else {
            showToast('❌ ' + result.error, 'error');
        }
    } catch (error) {
        showToast('❌ Lỗi kết nối: ' + error.message, 'error');
    } finally {
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
        btn.disabled = false;
    }
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function checkAutoLogin() {
    const token = localStorage.getItem('auth_token');
    const rememberMe = localStorage.getItem('remember_me');
    
    if (token && rememberMe) {
        // Verify token
        fetch(`${API_URL}/auth/verify`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(result => {
            if (result.valid) {
                window.location.href = '/index.html';
            }
        })
        .catch(() => {
            // Token invalid, stay on login page
        });
    }
}

function loginWithGoogle() {
    showToast('🔄 Tính năng đăng nhập Google đang được phát triển...', 'warning');
}

function loginWithFacebook() {
    showToast('🔄 Tính năng đăng nhập Facebook đang được phát triển...', 'warning');
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
