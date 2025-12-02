// Notes & To-Do Management

let currentFilter = 'all';

// ===== NOTES =====

async function addQuickNote() {
    const title = document.getElementById('quick-note-title').value.trim();
    const content = document.getElementById('quick-note-content').value.trim();
    const color = document.getElementById('note-color').value;
    
    if (!title) {
        showToast('Vui lòng nhập tiêu đề!', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/notes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, content, color })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showToast('✅ ' + result.message, 'success');
            document.getElementById('quick-note-title').value = '';
            document.getElementById('quick-note-content').value = '';
            loadNotes();
        } else {
            showToast('❌ Lỗi: ' + result.error, 'error');
        }
    } catch (error) {
        showToast('❌ Lỗi kết nối: ' + error.message, 'error');
    }
}

async function loadNotes() {
    const container = document.getElementById('notes-grid');
    if (!container) return;
    
    try {
        const response = await fetch(`${API_URL}/notes?filter=${currentFilter}`);
        const notes = await response.json();
        
        if (notes.length === 0) {
            container.innerHTML = '<div class="empty-state">Chưa có ghi chú nào</div>';
            return;
        }
        
        container.innerHTML = notes.map(note => `
            <div class="note-card ${note.color} ${note.isPinned ? 'pinned' : ''}" onclick="editNote(${note.id})">
                <div class="note-title">${note.title}</div>
                <div class="note-content">${note.content || ''}</div>
                <div class="note-meta">
                    ${new Date(note.updatedAt).toLocaleDateString('vi-VN')}
                </div>
                <div class="note-actions" onclick="event.stopPropagation()">
                    <button class="btn-small" onclick="togglePin(${note.id}, ${note.isPinned})">
                        ${note.isPinned ? '📌 Bỏ ghim' : '📌 Ghim'}
                    </button>
                    <button class="btn-small" onclick="archiveNote(${note.id})">
                        📦 Lưu trữ
                    </button>
                    <button class="btn-small btn-delete" onclick="deleteNote(${note.id})">
                        🗑️ Xóa
                    </button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        container.innerHTML = '<div class="error-state">❌ Lỗi tải dữ liệu</div>';
    }
}

async function editNote(id) {
    try {
        const response = await fetch(`${API_URL}/notes?filter=all`);
        const notes = await response.json();
        const note = notes.find(n => n.id === id);
        
        if (!note) return;
        
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>✏️ Chỉnh Sửa Ghi Chú</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
                </div>
                <div class="modal-body">
                    <input type="text" id="edit-note-title" value="${note.title}" 
                           style="width: 100%; margin-bottom: 15px;">
                    <textarea id="edit-note-content" rows="10" 
                              style="width: 100%; margin-bottom: 15px;">${note.content || ''}</textarea>
                    <select id="edit-note-color" style="margin-bottom: 15px;">
                        <option value="yellow" ${note.color === 'yellow' ? 'selected' : ''}>🟨 Vàng</option>
                        <option value="blue" ${note.color === 'blue' ? 'selected' : ''}>🟦 Xanh dương</option>
                        <option value="green" ${note.color === 'green' ? 'selected' : ''}>🟩 Xanh lá</option>
                        <option value="pink" ${note.color === 'pink' ? 'selected' : ''}>🟪 Hồng</option>
                        <option value="orange" ${note.color === 'orange' ? 'selected' : ''}>🟧 Cam</option>
                    </select>
                    <button class="btn-primary" onclick="saveNoteEdit(${id})">💾 Lưu</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    } catch (error) {
        showToast('❌ Lỗi: ' + error.message, 'error');
    }
}

async function saveNoteEdit(id) {
    const title = document.getElementById('edit-note-title').value.trim();
    const content = document.getElementById('edit-note-content').value.trim();
    const color = document.getElementById('edit-note-color').value;
    
    try {
        const response = await fetch(`${API_URL}/notes/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, content, color })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showToast('✅ ' + result.message, 'success');
            document.querySelector('.modal').remove();
            loadNotes();
        } else {
            showToast('❌ Lỗi: ' + result.error, 'error');
        }
    } catch (error) {
        showToast('❌ Lỗi kết nối: ' + error.message, 'error');
    }
}

async function togglePin(id, isPinned) {
    try {
        const response = await fetch(`${API_URL}/notes/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isPinned: !isPinned })
        });
        
        if (response.ok) {
            showToast(isPinned ? '📌 Đã bỏ ghim' : '📌 Đã ghim', 'success');
            loadNotes();
        }
    } catch (error) {
        showToast('❌ Lỗi: ' + error.message, 'error');
    }
}

async function archiveNote(id) {
    try {
        const response = await fetch(`${API_URL}/notes/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isArchived: true })
        });
        
        if (response.ok) {
            showToast('📦 Đã lưu trữ', 'success');
            loadNotes();
        }
    } catch (error) {
        showToast('❌ Lỗi: ' + error.message, 'error');
    }
}

async function deleteNote(id) {
    if (!confirm('Bạn có chắc muốn xóa ghi chú này?')) return;
    
    try {
        const response = await fetch(`${API_URL}/notes/${id}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showToast('✅ ' + result.message, 'success');
            loadNotes();
        } else {
            showToast('❌ Lỗi: ' + result.error, 'error');
        }
    } catch (error) {
        showToast('❌ Lỗi kết nối: ' + error.message, 'error');
    }
}

// ===== TO-DO =====

async function addTodo() {
    const text = document.getElementById('todo-input').value.trim();
    
    if (!text) {
        showToast('Vui lòng nhập nội dung!', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/todos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            document.getElementById('todo-input').value = '';
            loadTodos();
        } else {
            showToast('❌ Lỗi: ' + result.error, 'error');
        }
    } catch (error) {
        showToast('❌ Lỗi kết nối: ' + error.message, 'error');
    }
}

async function loadTodos() {
    const container = document.getElementById('todo-list');
    if (!container) return;
    
    try {
        const response = await fetch(`${API_URL}/todos`);
        const todos = await response.json();
        
        if (todos.length === 0) {
            container.innerHTML = '<div class="empty-state">Chưa có công việc nào</div>';
            return;
        }
        
        container.innerHTML = todos.map(todo => `
            <div class="todo-item ${todo.isCompleted ? 'completed' : ''}">
                <input type="checkbox" class="todo-checkbox" 
                       ${todo.isCompleted ? 'checked' : ''} 
                       onchange="toggleTodo(${todo.id}, ${!todo.isCompleted})">
                <span class="todo-text">${todo.text}</span>
                <button class="todo-delete" onclick="deleteTodo(${todo.id})">×</button>
            </div>
        `).join('');
    } catch (error) {
        container.innerHTML = '<div class="error-state">❌ Lỗi tải dữ liệu</div>';
    }
}

async function toggleTodo(id, isCompleted) {
    try {
        const response = await fetch(`${API_URL}/todos/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isCompleted })
        });
        
        if (response.ok) {
            loadTodos();
        }
    } catch (error) {
        showToast('❌ Lỗi: ' + error.message, 'error');
    }
}

async function deleteTodo(id) {
    try {
        const response = await fetch(`${API_URL}/todos/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            loadTodos();
        }
    } catch (error) {
        showToast('❌ Lỗi: ' + error.message, 'error');
    }
}

// Setup note filters
function setupNoteFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            currentFilter = btn.dataset.filter;
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            loadNotes();
        });
    });
}

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNotes);
} else {
    initNotes();
}

function initNotes() {
    setupNoteFilters();
    loadNotes();
    loadTodos();
    
    // Enter key to add todo
    const todoInput = document.getElementById('todo-input');
    if (todoInput) {
        todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addTodo();
            }
        });
    }
}

// ===== BACKUP & SETTINGS =====

function showBackupModal() {
    document.getElementById('backup-modal').classList.add('show');
}

function closeBackupModal() {
    document.getElementById('backup-modal').classList.remove('show');
}

function showSettingsModal() {
    document.getElementById('settings-modal').classList.add('show');
}

function closeSettingsModal() {
    document.getElementById('settings-modal').classList.remove('show');
}

async function exportAllData() {
    try {
        window.open(`${API_URL}/export/all`, '_blank');
        showToast('✅ Đang tải xuống dữ liệu...', 'success');
    } catch (error) {
        showToast('❌ Lỗi: ' + error.message, 'error');
    }
}

async function exportDatabase() {
    try {
        window.open(`${API_URL}/export/database`, '_blank');
        showToast('✅ Đang tải xuống database...', 'success');
    } catch (error) {
        showToast('❌ Lỗi: ' + error.message, 'error');
    }
}

function clearAllData() {
    const confirm1 = confirm('⚠️ CẢNH BÁO: Bạn sắp xóa TẤT CẢ dữ liệu!\n\nHành động này KHÔNG THỂ HOÀN TÁC!\n\nBạn có chắc chắn muốn tiếp tục?');
    if (!confirm1) return;
    
    const confirm2 = prompt('Nhập "XOA TAT CA" để xác nhận:');
    if (confirm2 !== 'XOA TAT CA') {
        showToast('❌ Đã hủy', 'error');
        return;
    }
    
    showToast('🔄 Tính năng này cần được thực hiện trên server', 'warning');
}

function saveSettings() {
    const settings = {
        darkMode: document.getElementById('setting-dark-mode').checked,
        animations: document.getElementById('setting-animations').checked,
        notifications: document.getElementById('setting-notifications').checked,
        deadlineAlerts: document.getElementById('setting-deadline-alerts').checked,
        itemsPerPage: document.getElementById('setting-items-per-page').value
    };
    
    localStorage.setItem('app-settings', JSON.stringify(settings));
    applySettings(settings);
    showToast('✅ Đã lưu cài đặt', 'success');
    closeSettingsModal();
}

function applySettings(settings) {
    if (settings.darkMode) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
    
    if (!settings.animations) {
        document.body.style.setProperty('--animation-duration', '0s');
    }
}

function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('app-settings') || '{}');
    
    if (settings.darkMode) document.getElementById('setting-dark-mode').checked = true;
    if (settings.animations !== undefined) document.getElementById('setting-animations').checked = settings.animations;
    if (settings.notifications !== undefined) document.getElementById('setting-notifications').checked = settings.notifications;
    if (settings.deadlineAlerts !== undefined) document.getElementById('setting-deadline-alerts').checked = settings.deadlineAlerts;
    if (settings.itemsPerPage) document.getElementById('setting-items-per-page').value = settings.itemsPerPage;
    
    applySettings(settings);
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    showToast(isDark ? '🌙 Chế độ tối' : '☀️ Chế độ sáng', 'success');
}

// Load settings on init
loadSettings();

// Close modals on ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal.show').forEach(modal => {
            modal.classList.remove('show');
        });
    }
});

// Show shortcuts help with ?
document.addEventListener('keydown', (e) => {
    if (e.key === '?' && !e.target.matches('input, textarea')) {
        document.getElementById('shortcuts-help').classList.toggle('show');
    }
});


// Export functions to global scope
window.addQuickNote = addQuickNote;
window.loadNotes = loadNotes;
window.editNote = editNote;
window.saveNoteEdit = saveNoteEdit;
window.togglePin = togglePin;
window.archiveNote = archiveNote;
window.deleteNote = deleteNote;
window.addTodo = addTodo;
window.loadTodos = loadTodos;
window.toggleTodo = toggleTodo;
window.deleteTodo = deleteTodo;
window.showBackupModal = showBackupModal;
window.closeBackupModal = closeBackupModal;
window.showSettingsModal = showSettingsModal;
window.closeSettingsModal = closeSettingsModal;
window.exportAllData = exportAllData;
window.exportDatabase = exportDatabase;
window.clearAllData = clearAllData;
window.saveSettings = saveSettings;
window.toggleDarkMode = toggleDarkMode;
