// Modern Features: AI, Voice, Real-time, PWA

// ===== VOICE COMMANDS =====
let recognition;
let isListening = false;

function initVoiceCommands() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        console.log('Voice commands not supported');
        return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'vi-VN';
    
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        handleVoiceCommand(transcript);
    };
    
    recognition.onerror = (event) => {
        console.error('Voice recognition error:', event.error);
        isListening = false;
        updateVoiceButton();
    };
    
    recognition.onend = () => {
        isListening = false;
        updateVoiceButton();
    };
}

function toggleVoiceCommand() {
    if (!recognition) {
        showToast('Trình duyệt không hỗ trợ giọng nói', 'error');
        return;
    }
    
    if (isListening) {
        recognition.stop();
        isListening = false;
    } else {
        recognition.start();
        isListening = true;
        showToast('🎤 Đang nghe...', 'warning');
    }
    updateVoiceButton();
}

function updateVoiceButton() {
    const btn = document.getElementById('voice-btn');
    if (btn) {
        btn.textContent = isListening ? '🔴' : '🎤';
        btn.title = isListening ? 'Dừng nghe' : 'Điều khiển bằng giọng nói';
    }
}

function handleVoiceCommand(command) {
    console.log('Voice command:', command);
    
    if (command.includes('tài liệu') || command.includes('document')) {
        document.querySelector('[data-tab="documents"]')?.click();
        showToast('✅ Đã chuyển sang Tài liệu', 'success');
    } else if (command.includes('bài tập') || command.includes('assignment')) {
        document.querySelector('[data-tab="assignments"]')?.click();
        showToast('✅ Đã chuyển sang Bài tập', 'success');
    } else if (command.includes('thống kê') || command.includes('analytics')) {
        document.querySelector('[data-tab="analytics"]')?.click();
        showToast('✅ Đã chuyển sang Thống kê', 'success');
    } else if (command.includes('ghi chú') || command.includes('note')) {
        document.querySelector('[data-tab="notes"]')?.click();
        showToast('✅ Đã chuyển sang Ghi chú', 'success');
    } else if (command.includes('tìm kiếm') || command.includes('search')) {
        document.getElementById('search-docs')?.focus();
        showToast('✅ Đã focus vào tìm kiếm', 'success');
    } else if (command.includes('tối') || command.includes('dark')) {
        toggleDarkMode();
    } else {
        showToast('❓ Không hiểu lệnh: ' + command, 'warning');
    }
}

// ===== AI ASSISTANT (Simulated) =====
function initAIAssistant() {
    // Simulated AI responses
    const aiResponses = {
        'help': 'Tôi có thể giúp bạn: tìm tài liệu, tạo ghi chú, xem thống kê, hoặc trả lời câu hỏi về hệ thống.',
        'tài liệu': 'Bạn có thể upload tài liệu bằng cách kéo thả file hoặc click nút Upload. Hỗ trợ PDF, DOC, PPT...',
        'bài tập': 'Để nộp bài tập, vào tab Bài Tập, điền thông tin và upload file. Giáo viên sẽ chấm điểm.',
        'thống kê': 'Tab Thống kê hiển thị tổng quan, bảng xếp hạng, phân bố điểm và hoạt động gần đây.',
        'phím tắt': 'Phím tắt: Ctrl+U (upload), Ctrl+F (tìm kiếm), ? (help), ESC (đóng modal)',
        'default': 'Xin lỗi, tôi chưa hiểu câu hỏi. Hãy thử hỏi về: tài liệu, bài tập, thống kê, hoặc phím tắt.'
    };
    
    window.askAI = function(question) {
        const q = question.toLowerCase();
        let response = aiResponses.default;
        
        for (const [key, value] of Object.entries(aiResponses)) {
            if (q.includes(key)) {
                response = value;
                break;
            }
        }
        
        return response;
    };
}

function showAIChat() {
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.innerHTML = `
        <div class="modal-content ai-chat-modal">
            <div class="modal-header">
                <h2>🤖 AI Assistant</h2>
                <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
            </div>
            <div class="modal-body">
                <div class="ai-chat-messages" id="ai-messages">
                    <div class="ai-message bot">
                        <div class="message-avatar">🤖</div>
                        <div class="message-content">
                            Xin chào! Tôi là AI Assistant. Tôi có thể giúp gì cho bạn?
                        </div>
                    </div>
                </div>
                <div class="ai-chat-input">
                    <input type="text" id="ai-input" placeholder="Hỏi gì đó..." onkeypress="if(event.key==='Enter') sendAIMessage()">
                    <button onclick="sendAIMessage()">Gửi</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('ai-input').focus();
}

function sendAIMessage() {
    const input = document.getElementById('ai-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    const messagesContainer = document.getElementById('ai-messages');
    
    // User message
    const userMsg = document.createElement('div');
    userMsg.className = 'ai-message user';
    userMsg.innerHTML = `
        <div class="message-content">${message}</div>
        <div class="message-avatar">👤</div>
    `;
    messagesContainer.appendChild(userMsg);
    
    input.value = '';
    
    // Bot response (simulated delay)
    setTimeout(() => {
        const response = askAI(message);
        const botMsg = document.createElement('div');
        botMsg.className = 'ai-message bot';
        botMsg.innerHTML = `
            <div class="message-avatar">🤖</div>
            <div class="message-content">${response}</div>
        `;
        messagesContainer.appendChild(botMsg);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 500);
    
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// ===== REAL-TIME NOTIFICATIONS =====
function initRealTimeNotifications() {
    // Simulate real-time updates
    setInterval(() => {
        checkForUpdates();
    }, 30000); // Check every 30 seconds
}

async function checkForUpdates() {
    try {
        const response = await fetch(`${API_URL}/activities?limit=1`);
        const activities = await response.json();
        
        if (activities.length > 0) {
            const lastActivity = activities[0];
            const lastCheck = localStorage.getItem('last_activity_check');
            
            if (lastCheck && new Date(lastActivity.createdAt) > new Date(lastCheck)) {
                showNotification('🔔 Hoạt động mới', lastActivity.details);
            }
            
            localStorage.setItem('last_activity_check', new Date().toISOString());
        }
    } catch (error) {
        console.error('Error checking updates:', error);
    }
}

function showNotification(title, body) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body, icon: '/favicon.ico' });
    } else {
        showToast(`${title}: ${body}`, 'success');
    }
}

function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                showToast('✅ Đã bật thông báo', 'success');
            }
        });
    }
}

// ===== PROGRESSIVE WEB APP (PWA) =====
let deferredPrompt;

function initPWA() {
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        showInstallPrompt();
    });
    
    window.addEventListener('appinstalled', () => {
        showToast('✅ Đã cài đặt ứng dụng!', 'success');
        deferredPrompt = null;
    });
}

function showInstallPrompt() {
    const banner = document.createElement('div');
    banner.className = 'install-banner';
    banner.innerHTML = `
        <div class="install-content">
            <span>📱 Cài đặt ứng dụng để truy cập nhanh hơn!</span>
            <div class="install-actions">
                <button onclick="installPWA()">Cài đặt</button>
                <button onclick="this.closest('.install-banner').remove()">Đóng</button>
            </div>
        </div>
    `;
    document.body.appendChild(banner);
}

async function installPWA() {
    if (!deferredPrompt) {
        showToast('Ứng dụng đã được cài đặt hoặc không hỗ trợ', 'warning');
        return;
    }
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
        showToast('✅ Đang cài đặt...', 'success');
    }
    
    deferredPrompt = null;
    document.querySelector('.install-banner')?.remove();
}

// ===== SMART SEARCH WITH SUGGESTIONS =====
let searchTimeout;

function initSmartSearch() {
    const searchInputs = document.querySelectorAll('[id^="search-"]');
    
    searchInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                showSearchSuggestions(e.target);
            }, 300);
        });
    });
}

async function showSearchSuggestions(input) {
    const query = input.value.trim();
    if (query.length < 2) return;
    
    // Remove existing suggestions
    document.querySelector('.search-suggestions')?.remove();
    
    const suggestions = await getSearchSuggestions(query);
    
    if (suggestions.length === 0) return;
    
    const dropdown = document.createElement('div');
    dropdown.className = 'search-suggestions';
    dropdown.innerHTML = suggestions.map(item => `
        <div class="suggestion-item" onclick="applySuggestion('${item.type}', ${item.id})">
            <span class="suggestion-icon">${item.icon}</span>
            <span class="suggestion-text">${item.title}</span>
        </div>
    `).join('');
    
    input.parentElement.style.position = 'relative';
    input.parentElement.appendChild(dropdown);
}

async function getSearchSuggestions(query) {
    const suggestions = [];
    
    try {
        // Search documents
        const docs = await fetch(`${API_URL}/documents`).then(r => r.json());
        docs.filter(d => d.title.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 3)
            .forEach(d => {
                suggestions.push({
                    type: 'document',
                    id: d.id,
                    title: d.title,
                    icon: '📄'
                });
            });
        
        // Search assignments
        const assignments = await fetch(`${API_URL}/assignments`).then(r => r.json());
        assignments.filter(a => a.title.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 3)
            .forEach(a => {
                suggestions.push({
                    type: 'assignment',
                    id: a.id,
                    title: a.title,
                    icon: '📝'
                });
            });
    } catch (error) {
        console.error('Error getting suggestions:', error);
    }
    
    return suggestions.slice(0, 5);
}

function applySuggestion(type, id) {
    document.querySelector('.search-suggestions')?.remove();
    
    if (type === 'document') {
        previewDocument(id);
    } else if (type === 'assignment') {
        // Show assignment details
        showToast('Đang xem bài tập...', 'success');
    }
}

// ===== OFFLINE MODE =====
function initOfflineMode() {
    window.addEventListener('online', () => {
        showToast('✅ Đã kết nối internet', 'success');
        syncOfflineData();
    });
    
    window.addEventListener('offline', () => {
        showToast('⚠️ Mất kết nối internet. Chế độ offline.', 'warning');
    });
}

async function syncOfflineData() {
    const offlineData = JSON.parse(localStorage.getItem('offline_queue') || '[]');
    
    if (offlineData.length === 0) return;
    
    showToast('🔄 Đang đồng bộ dữ liệu...', 'warning');
    
    for (const item of offlineData) {
        try {
            await fetch(item.url, {
                method: item.method,
                headers: item.headers,
                body: item.body
            });
        } catch (error) {
            console.error('Sync error:', error);
        }
    }
    
    localStorage.removeItem('offline_queue');
    showToast('✅ Đã đồng bộ dữ liệu', 'success');
}

// ===== THEME CUSTOMIZATION =====
const themes = {
    default: {
        primary: '#667eea',
        secondary: '#764ba2',
        background: '#ffffff'
    },
    ocean: {
        primary: '#0077be',
        secondary: '#00a8e8',
        background: '#f0f8ff'
    },
    sunset: {
        primary: '#ff6b6b',
        secondary: '#feca57',
        background: '#fff5f5'
    },
    forest: {
        primary: '#27ae60',
        secondary: '#2ecc71',
        background: '#f0fff4'
    },
    purple: {
        primary: '#9b59b6',
        secondary: '#8e44ad',
        background: '#f8f5ff'
    }
};

function changeTheme(themeName) {
    const theme = themes[themeName];
    if (!theme) return;
    
    document.documentElement.style.setProperty('--primary-color', theme.primary);
    document.documentElement.style.setProperty('--secondary-color', theme.secondary);
    document.documentElement.style.setProperty('--background-color', theme.background);
    
    localStorage.setItem('selected_theme', themeName);
    showToast(`✅ Đã đổi theme: ${themeName}`, 'success');
}

function showThemeSelector() {
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>🎨 Chọn Theme</h2>
                <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
            </div>
            <div class="modal-body">
                <div class="theme-grid">
                    ${Object.keys(themes).map(name => `
                        <div class="theme-card" onclick="changeTheme('${name}'); this.closest('.modal').remove();">
                            <div class="theme-preview" style="background: linear-gradient(135deg, ${themes[name].primary}, ${themes[name].secondary})"></div>
                            <div class="theme-name">${name}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// ===== COLLABORATIVE FEATURES =====
function initCollaboration() {
    // Simulated real-time collaboration
    window.collaborators = [];
}

function showActiveUsers() {
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>👥 Người Dùng Đang Online</h2>
                <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
            </div>
            <div class="modal-body">
                <div class="users-list">
                    <div class="user-item">
                        <div class="user-avatar">👤</div>
                        <div class="user-info">
                            <div class="user-name">Bạn</div>
                            <div class="user-status online">Online</div>
                        </div>
                    </div>
                    <div class="empty-state">Tính năng đang được phát triển...</div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Initialize all modern features
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initModernFeatures);
} else {
    initModernFeatures();
}

function initModernFeatures() {
    initVoiceCommands();
    initAIAssistant();
    initRealTimeNotifications();
    initPWA();
    initSmartSearch();
    initOfflineMode();
    initCollaboration();
    
    // Load saved theme
    const savedTheme = localStorage.getItem('selected_theme');
    if (savedTheme) {
        changeTheme(savedTheme);
    }
    
    // Request notification permission
    setTimeout(() => {
        requestNotificationPermission();
    }, 5000);
}


// Export functions to global scope
window.toggleVoiceCommand = toggleVoiceCommand;
window.showAIChat = showAIChat;
window.sendAIMessage = sendAIMessage;
window.askAI = askAI;
window.showNotification = showNotification;
window.requestNotificationPermission = requestNotificationPermission;
window.installPWA = installPWA;
window.applySuggestion = applySuggestion;
window.changeTheme = changeTheme;
window.showThemeSelector = showThemeSelector;
window.showActiveUsers = showActiveUsers;
