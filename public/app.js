const API_URL = window.APP_CONFIG?.API_URL || 'http://localhost:3000/api';

// Khởi tạo khi trang load
document.addEventListener('DOMContentLoaded', function() {
    setupTabs();
    setupForms();
    setupFilters();
    setupViewControls();
    loadDocuments();
    loadAssignments();
    loadStats();
    loadDeadlines();
    setupFilePreview();
    checkDeadlineNotifications();
    setInterval(checkDeadlineNotifications, 60000); // Check mỗi phút
});

// Toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Xử lý tabs
function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;
            
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(tabName).classList.add('active');
            
            if (tabName === 'analytics') {
                loadAnalytics();
            }
        });
    });
}

// Thiết lập forms
function setupForms() {
    document.getElementById('doc-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await uploadDocument();
    });
    
    document.getElementById('assignment-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await submitAssignment();
    });
    
    document.getElementById('deadline-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await addDeadline();
    });
}

// File preview
function setupFilePreview() {
    const docFile = document.getElementById('doc-file');
    const assignFile = document.getElementById('assignment-file');
    
    if (docFile) {
        docFile.addEventListener('change', (e) => {
            showFilePreview(e.target.files, 'doc-preview');
        });
    }
    
    if (assignFile) {
        assignFile.addEventListener('change', (e) => {
            showFilePreview(e.target.files, 'assignment-preview');
        });
    }
}

function showFilePreview(files, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    Array.from(files).forEach((file, index) => {
        const item = document.createElement('div');
        item.className = 'file-preview-item';
        item.innerHTML = `
            <span>📎 ${file.name} (${formatFileSize(file.size)})</span>
        `;
        container.appendChild(item);
    });
}

// View controls
function setupViewControls() {
    const viewBtns = document.querySelectorAll('.view-btn');
    viewBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.dataset.view;
            const list = document.getElementById('documents-list');
            
            viewBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            list.classList.remove('grid-view', 'list-view');
            list.classList.add(`${view}-view`);
        });
    });
}

// Thiết lập bộ lọc
function setupFilters() {
    const searchStudent = document.getElementById('search-student');
    const filterStatus = document.getElementById('filter-status');
    const searchDocs = document.getElementById('search-docs');
    const filterDocCategory = document.getElementById('filter-doc-category');
    const sortDocs = document.getElementById('sort-docs');
    const sortAssignments = document.getElementById('sort-assignments');
    
    let timeout;
    const applyFilters = () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => loadAssignments(), 300);
    };
    
    if (searchStudent) searchStudent.addEventListener('input', applyFilters);
    if (filterStatus) filterStatus.addEventListener('change', applyFilters);
    if (sortAssignments) sortAssignments.addEventListener('change', applyFilters);
    
    const applyDocFilters = () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => loadDocuments(), 300);
    };
    
    if (searchDocs) searchDocs.addEventListener('input', applyDocFilters);
    if (filterDocCategory) filterDocCategory.addEventListener('change', applyDocFilters);
    if (sortDocs) sortDocs.addEventListener('change', applyDocFilters);
    
    // Deadline filters
    const filterDeadlineType = document.getElementById('filter-deadline-type');
    const filterDeadlineStatus = document.getElementById('filter-deadline-status');
    
    const applyDeadlineFilters = () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => loadDeadlines(), 300);
    };
    
    if (filterDeadlineType) filterDeadlineType.addEventListener('change', applyDeadlineFilters);
    if (filterDeadlineStatus) filterDeadlineStatus.addEventListener('change', applyDeadlineFilters);
}

// Tải thống kê
async function loadStats() {
    try {
        const response = await fetch(`${API_URL}/stats`);
        const stats = await response.json();
        
        document.getElementById('stats-bar').innerHTML = `
            <div class="stat-item">📄 ${stats.totalDocuments} tài liệu</div>
            <div class="stat-item">📝 ${stats.totalAssignments} bài tập</div>
            <div class="stat-item">⏳ ${stats.pendingAssignments} chờ chấm</div>
            <div class="stat-item">⭐ Điểm TB: ${stats.averageGrade}</div>
        `;
    } catch (error) {
        console.error('Lỗi tải thống kê:', error);
    }
}

// Upload tài liệu
async function uploadDocument() {
    const form = document.getElementById('doc-form');
    const btn = form.querySelector('button');
    const btnText = btn.querySelector('.btn-text');
    const btnLoading = btn.querySelector('.btn-loading');
    
    const title = document.getElementById('doc-title').value.trim();
    const category = document.getElementById('doc-category').value;
    const fileInput = document.getElementById('doc-file');
    const description = document.getElementById('doc-description').value.trim();
    
    if (!fileInput.files[0]) {
        showToast('Vui lòng chọn file!', 'error');
        return;
    }
    
    const formData = new FormData();
    formData.append('title', title);
    formData.append('category', category);
    formData.append('description', description);
    formData.append('file', fileInput.files[0]);
    formData.append('type', 'documents');
    
    try {
        btnText.style.display = 'none';
        btnLoading.style.display = 'inline';
        btn.disabled = true;
        
        const response = await fetch(`${API_URL}/documents`, {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showToast('✅ ' + result.message, 'success');
            form.reset();
            document.getElementById('doc-preview').innerHTML = '';
            loadDocuments();
            loadStats();
        } else {
            showToast('❌ Lỗi: ' + result.error, 'error');
        }
    } catch (error) {
        showToast('❌ Lỗi kết nối: ' + error.message, 'error');
    } finally {
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
        btn.disabled = false;
    }
}

// Gửi bài tập
async function submitAssignment() {
    const form = document.getElementById('assignment-form');
    const btn = form.querySelector('button');
    const btnText = btn.querySelector('.btn-text');
    const btnLoading = btn.querySelector('.btn-loading');
    
    const title = document.getElementById('assignment-title').value.trim();
    const student = document.getElementById('assignment-student').value.trim();
    const email = document.getElementById('assignment-email').value.trim();
    const fileInput = document.getElementById('assignment-file');
    const note = document.getElementById('assignment-note').value.trim();

    
    if (!fileInput.files[0]) {
        showToast('Vui lòng chọn file!', 'error');
        return;
    }
    
    const formData = new FormData();
    formData.append('title', title);
    formData.append('student', student);
    formData.append('email', email);
    formData.append('note', note);
    formData.append('file', fileInput.files[0]);
    formData.append('type', 'assignments');
    
    try {
        btnText.style.display = 'none';
        btnLoading.style.display = 'inline';
        btn.disabled = true;
        
        const response = await fetch(`${API_URL}/assignments`, {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showToast('✅ ' + result.message, 'success');
            form.reset();
            document.getElementById('assignment-preview').innerHTML = '';
            loadAssignments();
            loadStats();
        } else {
            showToast('❌ Lỗi: ' + result.error, 'error');
        }
    } catch (error) {
        showToast('❌ Lỗi kết nối: ' + error.message, 'error');
    } finally {
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
        btn.disabled = false;
    }
}

// Tải danh sách tài liệu
async function loadDocuments() {
    const container = document.getElementById('documents-list');
    
    try {
        const response = await fetch(`${API_URL}/documents`);
        let documents = await response.json();
        
        // Apply filters
        const search = document.getElementById('search-docs')?.value.toLowerCase() || '';
        const category = document.getElementById('filter-doc-category')?.value || 'all';
        const sort = document.getElementById('sort-docs')?.value || 'newest';
        
        if (search) {
            documents = documents.filter(d => 
                d.title.toLowerCase().includes(search) ||
                (d.description && d.description.toLowerCase().includes(search))
            );
        }
        
        if (category !== 'all') {
            documents = documents.filter(d => d.category === category);
        }
        
        // Sort
        if (sort === 'newest') {
            documents.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
        } else if (sort === 'oldest') {
            documents.sort((a, b) => new Date(a.uploadDate) - new Date(b.uploadDate));
        } else if (sort === 'name') {
            documents.sort((a, b) => a.title.localeCompare(b.title));
        }
        
        if (documents.length === 0) {
            container.innerHTML = '<div class="empty-state">Chưa có tài liệu nào</div>';
            return;
        }
        
        container.innerHTML = documents.map(doc => `
            <div class="item-card">
                <div class="item-header">
                    <div class="item-title">
                        ${doc.category ? `<span class="category-badge category-${doc.category}">${getCategoryName(doc.category)}</span>` : ''}
                        📄 ${doc.title}
                    </div>
                </div>
                <div class="item-meta">
                    📅 ${new Date(doc.uploadDate).toLocaleString('vi-VN')} | 
                    📦 ${formatFileSize(doc.fileSize)} | 
                    📎 ${doc.fileName}
                </div>
                ${doc.description ? `<div class="item-description">${doc.description}</div>` : ''}
                <div class="item-actions">
                    <button class="btn-small btn-download" onclick="downloadDocument(${doc.id})">
                        ⬇️ Tải Xuống
                    </button>
                    <button class="btn-small btn-delete" onclick="deleteDocument(${doc.id})">
                        🗑️ Xóa
                    </button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        container.innerHTML = '<div class="error-state">❌ Lỗi tải dữ liệu</div>';
    }
}

function getCategoryName(category) {
    const names = {
        lecture: 'Bài giảng',
        exercise: 'Bài tập',
        reference: 'Tham khảo',
        exam: 'Đề thi',
        other: 'Khác'
    };
    return names[category] || category;
}

// Tải danh sách bài tập
async function loadAssignments() {
    const container = document.getElementById('assignments-list');
    const search = document.getElementById('search-student')?.value || '';
    const status = document.getElementById('filter-status')?.value || 'all';
    
    try {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (status) params.append('status', status);
        
        const response = await fetch(`${API_URL}/assignments?${params}`);
        let assignments = await response.json();
        
        // Sort
        const sort = document.getElementById('sort-assignments')?.value || 'newest';
        if (sort === 'newest') {
            assignments.sort((a, b) => new Date(b.submitDate) - new Date(a.submitDate));
        } else if (sort === 'oldest') {
            assignments.sort((a, b) => new Date(a.submitDate) - new Date(b.submitDate));
        } else if (sort === 'grade-high') {
            assignments.sort((a, b) => (b.grade || 0) - (a.grade || 0));
        } else if (sort === 'grade-low') {
            assignments.sort((a, b) => (a.grade || 0) - (b.grade || 0));
        }
        
        if (assignments.length === 0) {
            container.innerHTML = '<div class="empty-state">Không tìm thấy bài tập nào</div>';
            return;
        }
        
        container.innerHTML = assignments.map(assignment => `
            <div class="item-card">
                <div class="item-header">
                    <div class="item-title">📝 ${assignment.title}</div>
                    <span class="status-badge status-${assignment.status}">
                        ${assignment.status === 'pending' ? 'Chờ chấm' : 'Đã chấm'}
                    </span>
                </div>
                <div class="item-meta">
                    👤 ${assignment.student} | 
                    📅 ${new Date(assignment.submitDate).toLocaleString('vi-VN')} | 
                    📦 ${formatFileSize(assignment.fileSize)}
                </div>
                <div class="item-meta">📎 ${assignment.fileName}</div>
                ${assignment.note ? `<div class="item-description">💬 ${assignment.note}</div>` : ''}
                ${assignment.grade !== null ? `<div class="item-grade">⭐ Điểm: ${assignment.grade}/10</div>` : ''}
                <div class="item-actions">
                    <button class="btn-small btn-download" onclick="downloadAssignment(${assignment.id})">
                        ⬇️ Tải Xuống
                    </button>
                    ${assignment.status === 'pending' ? 
                        `<button class="btn-small" onclick="gradeAssignment(${assignment.id})">✅ Chấm Điểm</button>` : ''}
                    <button class="btn-small btn-delete" onclick="deleteAssignment(${assignment.id})">
                        🗑️ Xóa
                    </button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        container.innerHTML = '<div class="error-state">❌ Lỗi tải dữ liệu</div>';
    }
}

// Chấm điểm bài tập
async function gradeAssignment(id) {
    const grade = prompt('Nhập điểm (0-10):');
    
    if (grade === null) return;
    
    const gradeNum = parseFloat(grade);
    if (isNaN(gradeNum) || gradeNum < 0 || gradeNum > 10) {
        showToast('❌ Điểm không hợp lệ!', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/assignments/${id}/grade`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ grade: gradeNum })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showToast('✅ ' + result.message, 'success');
            loadAssignments();
            loadStats();
        } else {
            showToast('❌ Lỗi: ' + result.error, 'error');
        }
    } catch (error) {
        showToast('❌ Lỗi kết nối', 'error');
    }
}

// Xóa tài liệu
async function deleteDocument(id) {
    if (!confirm('Bạn có chắc muốn xóa tài liệu này?')) return;
    
    try {
        const response = await fetch(`${API_URL}/documents/${id}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showToast('✅ ' + result.message, 'success');
            loadDocuments();
            loadStats();
        } else {
            showToast('❌ Lỗi: ' + result.error, 'error');
        }
    } catch (error) {
        showToast('❌ Lỗi kết nối', 'error');
    }
}

// Xóa bài tập
async function deleteAssignment(id) {
    if (!confirm('Bạn có chắc muốn xóa bài tập này?')) return;
    
    try {
        const response = await fetch(`${API_URL}/assignments/${id}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showToast('✅ ' + result.message, 'success');
            loadAssignments();
            loadStats();
        } else {
            showToast('❌ Lỗi: ' + result.error, 'error');
        }
    } catch (error) {
        showToast('❌ Lỗi kết nối', 'error');
    }
}

// Tải xuống tài liệu
function downloadDocument(id) {
    window.open(`${API_URL}/documents/${id}/download`, '_blank');
}

// Tải xuống bài tập
function downloadAssignment(id) {
    window.open(`${API_URL}/assignments/${id}/download`, '_blank');
}

// Format kích thước file
function formatFileSize(bytes) {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Export functions to global scope
window.uploadDocument = uploadDocument;
window.submitAssignment = submitAssignment;
window.loadDocuments = loadDocuments;
window.loadAssignments = loadAssignments;
window.gradeAssignment = gradeAssignment;
window.deleteDocument = deleteDocument;
window.deleteAssignment = deleteAssignment;
window.downloadDocument = downloadDocument;
window.downloadAssignment = downloadAssignment;
window.formatFileSize = formatFileSize;
window.getCategoryName = getCategoryName;
window.showToast = showToast;
window.loadStats = loadStats;
