// Fun & Interactive Features

// ===== GAMIFICATION =====
let userPoints = parseInt(localStorage.getItem('user_points') || '0');
let userLevel = parseInt(localStorage.getItem('user_level') || '1');
let achievements = JSON.parse(localStorage.getItem('achievements') || '[]');

const achievementsList = [
    { id: 'first_upload', name: 'Người Khởi Đầu', desc: 'Upload tài liệu đầu tiên', icon: '🎯', points: 10 },
    { id: 'first_assignment', name: 'Học Sinh Chăm Chỉ', desc: 'Nộp bài tập đầu tiên', icon: '📝', points: 10 },
    { id: 'upload_10', name: 'Người Đóng Góp', desc: 'Upload 10 tài liệu', icon: '📚', points: 50 },
    { id: 'perfect_score', name: 'Điểm Tuyệt Đối', desc: 'Đạt điểm 10', icon: '⭐', points: 100 },
    { id: 'week_streak', name: 'Kiên Trì', desc: 'Đăng nhập 7 ngày liên tiếp', icon: '🔥', points: 50 },
    { id: 'night_owl', name: 'Cú Đêm', desc: 'Hoạt động sau 12h đêm', icon: '🦉', points: 20 },
    { id: 'early_bird', name: 'Chim Sớm', desc: 'Hoạt động trước 6h sáng', icon: '🐦', points: 20 },
    { id: 'social_butterfly', name: 'Người Kết Nối', desc: 'Chia sẻ 5 tài liệu', icon: '🦋', points: 30 },
    { id: 'note_master', name: 'Bậc Thầy Ghi Chú', desc: 'Tạo 20 ghi chú', icon: '📓', points: 40 },
    { id: 'speedster', name: 'Tốc Độ', desc: 'Hoàn thành 5 bài tập trong 1 ngày', icon: '⚡', points: 60 }
];

function addPoints(points, reason) {
    userPoints += points;
    localStorage.setItem('user_points', userPoints);
    
    // Check level up
    const newLevel = Math.floor(userPoints / 100) + 1;
    if (newLevel > userLevel) {
        userLevel = newLevel;
        localStorage.setItem('user_level', userLevel);
        showLevelUpAnimation(newLevel);
    }
    
    showPointsAnimation(points, reason);
    updatePointsDisplay();
}

function showPointsAnimation(points, reason) {
    const animation = document.createElement('div');
    animation.className = 'points-animation';
    animation.innerHTML = `+${points} XP<br><small>${reason}</small>`;
    document.body.appendChild(animation);
    
    setTimeout(() => animation.remove(), 2000);
}

function showLevelUpAnimation(level) {
    const modal = document.createElement('div');
    modal.className = 'modal show level-up-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="level-up-content">
                <div class="level-up-icon">🎉</div>
                <h2>LEVEL UP!</h2>
                <div class="level-number">${level}</div>
                <p>Chúc mừng! Bạn đã lên cấp ${level}</p>
                <button onclick="this.closest('.modal').remove()">Tuyệt vời!</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Confetti effect
    createConfetti();
}

function unlockAchievement(achievementId) {
    if (achievements.includes(achievementId)) return;
    
    const achievement = achievementsList.find(a => a.id === achievementId);
    if (!achievement) return;
    
    achievements.push(achievementId);
    localStorage.setItem('achievements', JSON.stringify(achievements));
    
    addPoints(achievement.points, achievement.name);
    showAchievementUnlock(achievement);
}

function showAchievementUnlock(achievement) {
    const notification = document.createElement('div');
    notification.className = 'achievement-unlock';
    notification.innerHTML = `
        <div class="achievement-icon">${achievement.icon}</div>
        <div class="achievement-info">
            <div class="achievement-title">Thành Tựu Mở Khóa!</div>
            <div class="achievement-name">${achievement.name}</div>
            <div class="achievement-desc">${achievement.desc}</div>
        </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 5000);
}


function showGamificationDashboard() {
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.innerHTML = `
        <div class="modal-content gamification-modal">
            <div class="modal-header">
                <h2>🎮 Thành Tích Của Bạn</h2>
                <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
            </div>
            <div class="modal-body">
                <div class="user-stats">
                    <div class="stat-card">
                        <div class="stat-icon">⭐</div>
                        <div class="stat-value">${userLevel}</div>
                        <div class="stat-label">Level</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">💎</div>
                        <div class="stat-value">${userPoints}</div>
                        <div class="stat-label">XP</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">🏆</div>
                        <div class="stat-value">${achievements.length}</div>
                        <div class="stat-label">Thành Tựu</div>
                    </div>
                </div>
                
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${(userPoints % 100)}%"></div>
                    <div class="progress-text">${userPoints % 100}/100 XP đến level ${userLevel + 1}</div>
                </div>
                
                <h3>🏆 Thành Tựu</h3>
                <div class="achievements-grid">
                    ${achievementsList.map(ach => `
                        <div class="achievement-card ${achievements.includes(ach.id) ? 'unlocked' : 'locked'}">
                            <div class="achievement-icon">${ach.icon}</div>
                            <div class="achievement-name">${ach.name}</div>
                            <div class="achievement-desc">${ach.desc}</div>
                            <div class="achievement-points">+${ach.points} XP</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function updatePointsDisplay() {
    const display = document.getElementById('points-display');
    if (display) {
        display.innerHTML = `Level ${userLevel} | ${userPoints} XP`;
    }
}

// ===== CONFETTI EFFECT =====
function createConfetti() {
    const colors = ['#667eea', '#764ba2', '#ffc107', '#28a745', '#dc3545'];
    const confettiCount = 50;
    
    for (let i = 0; i < confettiCount; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 3 + 's';
            document.body.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 4000);
        }, i * 30);
    }
}

// ===== EASTER EGGS =====
let konamiCode = [];
const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.key);
    konamiCode = konamiCode.slice(-10);
    
    if (konamiCode.join(',') === konamiSequence.join(',')) {
        activateKonamiCode();
    }
});

function activateKonamiCode() {
    showToast('🎮 Konami Code Activated!', 'success');
    createConfetti();
    unlockAchievement('secret_code');
    document.body.style.animation = 'rainbow 5s infinite';
}

// ===== POMODORO TIMER =====
let pomodoroTimer;
let pomodoroMinutes = 25;
let pomodoroSeconds = 0;
let isPomodoro = false;

function showPomodoroTimer() {
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.innerHTML = `
        <div class="modal-content pomodoro-modal">
            <div class="modal-header">
                <h2>🍅 Pomodoro Timer</h2>
                <button class="modal-close" onclick="this.closest('.modal').remove(); stopPomodoro()">×</button>
            </div>
            <div class="modal-body">
                <div class="pomodoro-display">
                    <div class="pomodoro-time" id="pomodoro-time">25:00</div>
                    <div class="pomodoro-label">Tập trung học tập!</div>
                </div>
                <div class="pomodoro-controls">
                    <button onclick="startPomodoro()">▶️ Bắt đầu</button>
                    <button onclick="pausePomodoro()">⏸️ Tạm dừng</button>
                    <button onclick="resetPomodoro()">🔄 Reset</button>
                </div>
                <div class="pomodoro-presets">
                    <button onclick="setPomodoroTime(25)">25 phút</button>
                    <button onclick="setPomodoroTime(15)">15 phút</button>
                    <button onclick="setPomodoroTime(5)">5 phút</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function startPomodoro() {
    if (isPomodoro) return;
    isPomodoro = true;
    
    pomodoroTimer = setInterval(() => {
        if (pomodoroSeconds === 0) {
            if (pomodoroMinutes === 0) {
                stopPomodoro();
                showToast('🎉 Pomodoro hoàn thành! Nghỉ ngơi nào!', 'success');
                addPoints(25, 'Hoàn thành Pomodoro');
                return;
            }
            pomodoroMinutes--;
            pomodoroSeconds = 59;
        } else {
            pomodoroSeconds--;
        }
        
        updatePomodoroDisplay();
    }, 1000);
}

function pausePomodoro() {
    isPomodoro = false;
    clearInterval(pomodoroTimer);
}

function stopPomodoro() {
    isPomodoro = false;
    clearInterval(pomodoroTimer);
    resetPomodoro();
}

function resetPomodoro() {
    pomodoroMinutes = 25;
    pomodoroSeconds = 0;
    updatePomodoroDisplay();
}

function setPomodoroTime(minutes) {
    pomodoroMinutes = minutes;
    pomodoroSeconds = 0;
    updatePomodoroDisplay();
}

function updatePomodoroDisplay() {
    const display = document.getElementById('pomodoro-time');
    if (display) {
        display.textContent = `${String(pomodoroMinutes).padStart(2, '0')}:${String(pomodoroSeconds).padStart(2, '0')}`;
    }
}

// ===== STUDY MUSIC PLAYER =====
const studyPlaylists = [
    { name: 'Lofi Hip Hop', url: 'https://www.youtube.com/embed/jfKfPfyJRdk', icon: '🎵' },
    { name: 'Classical Focus', url: 'https://www.youtube.com/embed/jgpJVI3tDbY', icon: '🎼' },
    { name: 'Nature Sounds', url: 'https://www.youtube.com/embed/eKFTSSKCzWA', icon: '🌿' },
    { name: 'Jazz Study', url: 'https://www.youtube.com/embed/Dx5qFachd3A', icon: '🎷' }
];

function showMusicPlayer() {
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.innerHTML = `
        <div class="modal-content music-modal">
            <div class="modal-header">
                <h2>🎵 Nhạc Học Tập</h2>
                <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
            </div>
            <div class="modal-body">
                <div class="playlist-grid">
                    ${studyPlaylists.map((playlist, index) => `
                        <div class="playlist-card" onclick="playMusic(${index})">
                            <div class="playlist-icon">${playlist.icon}</div>
                            <div class="playlist-name">${playlist.name}</div>
                        </div>
                    `).join('')}
                </div>
                <div id="music-player" class="music-player"></div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function playMusic(index) {
    const playlist = studyPlaylists[index];
    const player = document.getElementById('music-player');
    player.innerHTML = `
        <iframe width="100%" height="200" 
                src="${playlist.url}?autoplay=1" 
                frameborder="0" 
                allow="autoplay; encrypted-media" 
                allowfullscreen>
        </iframe>
    `;
}

// ===== MOTIVATIONAL QUOTES =====
const quotes = [
    { text: "Học tập là kho báu sẽ theo bạn mọi nơi.", author: "Tục ngữ Trung Quốc" },
    { text: "Giáo dục là vũ khí mạnh nhất để thay đổi thế giới.", author: "Nelson Mandela" },
    { text: "Thành công là tổng của những nỗ lực nhỏ lặp đi lặp lại.", author: "Robert Collier" },
    { text: "Học không bao giờ là muộn.", author: "Tục ngữ" },
    { text: "Tri thức là sức mạnh.", author: "Francis Bacon" }
];

function showDailyQuote() {
    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    const notification = document.createElement('div');
    notification.className = 'quote-notification';
    notification.innerHTML = `
        <div class="quote-icon">💡</div>
        <div class="quote-content">
            <div class="quote-text">"${quote.text}"</div>
            <div class="quote-author">- ${quote.author}</div>
        </div>
        <button onclick="this.closest('.quote-notification').remove()">×</button>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 10000);
}

// Initialize fun features
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFunFeatures);
} else {
    initFunFeatures();
}

function initFunFeatures() {
    updatePointsDisplay();
    
    // Show daily quote
    setTimeout(() => {
        showDailyQuote();
    }, 3000);
    
    // Check time-based achievements
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 6) {
        unlockAchievement('early_bird');
    } else if (hour >= 22) {
        unlockAchievement('night_owl');
    }
}


// Export functions to global scope
window.addPoints = addPoints;
window.unlockAchievement = unlockAchievement;
window.showGamificationDashboard = showGamificationDashboard;
window.updatePointsDisplay = updatePointsDisplay;
window.createConfetti = createConfetti;
window.showPomodoroTimer = showPomodoroTimer;
window.startPomodoro = startPomodoro;
window.pausePomodoro = pausePomodoro;
window.stopPomodoro = stopPomodoro;
window.resetPomodoro = resetPomodoro;
window.setPomodoroTime = setPomodoroTime;
window.showMusicPlayer = showMusicPlayer;
window.playMusic = playMusic;
window.showDailyQuote = showDailyQuote;
