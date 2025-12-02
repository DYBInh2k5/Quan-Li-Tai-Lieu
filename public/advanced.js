// Advanced Features for Document Management

// ===== DRAG & DROP UPLOAD =====
function setupDragAndDrop() {
    const dropZones = [
        { id: 'doc-form', type: 'documents', fileInput: 'doc-file' },
        { id: 'assignment-form', type: 'assignments', fileInput: 'assignment-file' },
        { id: 'image-form', type: 'images', fileInput: 'image-file' }
    ];
    
    dropZones.forEach(zone => {
        const element = document.getElementById(zone.id);
        if (!element) return;
        
        // Tạo drop zone overlay
        const dropOverlay = document.createElement('div');
        dropOverlay.className = 'drop-overlay';
        dropOverlay.innerHTML = '<div class="drop-message">📁 Thả file vào đây</div>';
        element.style.position = 'relative';
        element.appendChild(dropOverlay);
        
        element.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropOverlay.classList.add('active');
        });
        
        element.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropOverlay.classList.remove('active');
        });
        
        element.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropOverlay.classList.remove('active');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                const fileInput = document.getElementById(zone.fileInput);
                if (fileInput) {
                    fileInput.files = files;
                    fileInput.dispatchEvent(new Event('change', { bubbles: true }));
                    showToast(`✅ Đã thêm ${files.length} file`, 'success');
                }
            }
        });
    });
}

// ===== BULK UPLOAD =====
async function bulkUploadDocuments() {
    const fileInput = document.getElementById('bulk-upload-input');
    if (!fileInput || !fileInput.files.length) {
        showToast('Vui lòng chọn file!', 'error');
        return;
    }
    
    const files = Array.from(fileInput.files);
    const category = document.getElementById('bulk-category').value;
    const progressBar = document.getElementById('bulk-progress');
    const progressText = document.getElementById('bulk-progress-text');
    
    progressBar.style.display = 'block';
    let completed = 0;
    
    for (const file of files) {
        try {
            const formData = new FormData();
            formData.append('title', file.name.replace(/\.[^/.]+$/, ''));
            formData.append('category', category);
            formData.append('description', `Bulk upload - ${new Date().toLocaleDateString('vi-VN')}`);
            formData.append('file', file);
            formData.append('type', 'documents');
            
            const response = await fetch(`${API_URL}/documents`, {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                completed++;
                const percent = Math.round((completed / files.length) * 100);
                progressBar.querySelector('.progress-fill').style.width = percent + '%';
                progressText.textContent = `${completed}/${files.length} files`;
            }
        } catch (error) {
            console.error('Error uploading:', file.name, error);
        }
    }
    
    showToast(`✅ Đã upload ${completed}/${files.length} files`, 'success');
    fileInput.value = '';
    progressBar.style.display = 'none';
    loadDocuments();
}

// ===== CLOUD STORAGE INTEGRATION =====
async function uploadFromURL() {
    const url = document.getElementById('url-input').value.trim();
    const title = document.getElementById('url-title').value.trim();
    const category = document.getElementById('url-category').value;
    
    if (!url || !title) {
        showToast('Vui lòng nhập đầy đủ thông tin!', 'error');
        return;
    }
    
    try {
        showToast('⏳ Đang tải file từ URL...', 'warning');
        
        const response = await fetch(`${API_URL}/documents/from-url`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url, title, category })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showToast('✅ ' + result.message, 'success');
            document.getElementById('url-input').value = '';
            document.getElementById('url-title').value = '';
            loadDocuments();
        } else {
            showToast('❌ Lỗi: ' + result.error, 'error');
        }
    } catch (error) {
        showToast('❌ Lỗi kết nối: ' + error.message, 'error');
    }
}

// ===== GOOGLE DRIVE INTEGRATION =====
function connectGoogleDrive() {
    showToast('🔄 Tính năng Google Drive đang được phát triển...', 'warning');
    // TODO: Implement Google Drive API
}

// ===== DROPBOX INTEGRATION =====
function connectDropbox() {
    showToast('🔄 Tính năng Dropbox đang được phát triển...', 'warning');
    // TODO: Implement Dropbox API
}

// ===== DOCUMENT VERSIONING =====
async function uploadNewVersion(documentId) {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx';
    
    fileInput.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('documentId', documentId);
            
            const response = await fetch(`${API_URL}/documents/${documentId}/version`, {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (response.ok) {
                showToast('✅ Đã upload phiên bản mới', 'success');
                loadDocuments();
            } else {
                showToast('❌ Lỗi: ' + result.error, 'error');
            }
        } catch (error) {
            showToast('❌ Lỗi: ' + error.message, 'error');
        }
    };
    
    fileInput.click();
}

// ===== DOCUMENT SHARING =====
async function shareDocument(documentId) {
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>🔗 Chia Sẻ Tài Liệu</h2>
                <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
            </div>
            <div class="modal-body">
                <div class="share-section">
                    <h3>📧 Chia sẻ qua Email</h3>
                    <input type="email" id="share-email" placeholder="email@example.com">
                    <button class="btn-primary" onclick="sendShareEmail(${documentId})">Gửi</button>
                </div>
                <div class="share-section">
                    <h3>🔗 Link chia sẻ</h3>
                    <div class="share-link-box">
                        <input type="text" id="share-link" value="${window.location.origin}/share/${documentId}" readonly>
                        <button class="btn-primary" onclick="copyShareLink()">📋 Copy</button>
                    </div>
                </div>
                <div class="share-section">
                    <h3>📱 QR Code</h3>
                    <div id="qr-code" class="qr-code-container"></div>
                    <button class="btn-primary" onclick="generateQRCode(${documentId})">Tạo QR Code</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function copyShareLink() {
    const input = document.getElementById('share-link');
    input.select();
    document.execCommand('copy');
    showToast('✅ Đã copy link', 'success');
}

function generateQRCode(documentId) {
    const container = document.getElementById('qr-code');
    const url = `${window.location.origin}/share/${documentId}`;
    
    // Simple QR code using API
    container.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}" alt="QR Code">`;
}

async function sendShareEmail(documentId) {
    const email = document.getElementById('share-email').value.trim();
    
    if (!email) {
        showToast('Vui lòng nhập email!', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/documents/${documentId}/share`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showToast('✅ Đã gửi email', 'success');
        } else {
            showToast('❌ Lỗi: ' + result.error, 'error');
        }
    } catch (error) {
        showToast('❌ Lỗi: ' + error.message, 'error');
    }
}

// ===== DOCUMENT TEMPLATES =====
const documentTemplates = [
    { name: 'Báo cáo tuần', icon: '📊', content: '# Báo cáo tuần\n\n## Công việc đã hoàn thành\n\n## Công việc đang thực hiện\n\n## Kế hoạch tuần tới' },
    { name: 'Biên bản họp', icon: '📝', content: '# Biên bản họp\n\nNgày: \nĐịa điểm: \nThành phần: \n\n## Nội dung họp\n\n## Kết luận' },
    { name: 'Đề cương bài giảng', icon: '📖', content: '# Đề cương bài giảng\n\n## Mục tiêu\n\n## Nội dung\n\n## Tài liệu tham khảo' },
    { name: 'Đề thi', icon: '📝', content: '# Đề thi\n\nMôn: \nThời gian: \n\n## Câu hỏi\n\n1. \n2. \n3. ' }
];

function showTemplateSelector() {
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>📄 Chọn Mẫu Tài Liệu</h2>
                <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
            </div>
            <div class="modal-body">
                <div class="template-grid">
                    ${documentTemplates.map((template, index) => `
                        <div class="template-card" onclick="useTemplate(${index})">
                            <div class="template-icon">${template.icon}</div>
                            <div class="template-name">${template.name}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function useTemplate(index) {
    const template = documentTemplates[index];
    document.getElementById('doc-title').value = template.name;
    document.getElementById('doc-description').value = template.content;
    document.querySelector('.modal').remove();
    showToast(`✅ Đã áp dụng mẫu: ${template.name}`, 'success');
}

// ===== DOCUMENT COMPRESSION =====
async function compressAndUpload(file) {
    if (file.size < 1024 * 1024) {
        return file; // Không nén nếu < 1MB
    }
    
    showToast('🔄 Đang nén file...', 'warning');
    
    // TODO: Implement file compression
    // For now, just return original file
    return file;
}

// ===== DOCUMENT PREVIEW =====
async function previewDocument(documentId) {
    try {
        const response = await fetch(`${API_URL}/documents/${documentId}/preview`);
        const data = await response.json();
        
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content preview-modal">
                <div class="modal-header">
                    <h2>👁️ Xem Trước: ${data.title}</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
                </div>
                <div class="modal-body">
                    <div class="preview-container">
                        ${getPreviewContent(data)}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    } catch (error) {
        showToast('❌ Không thể xem trước file này', 'error');
    }
}

function getPreviewContent(data) {
    const ext = data.fileName.split('.').pop().toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
        return `<img src="/uploads/documents/${data.filePath.split('\\\\').pop()}" alt="${data.title}" style="max-width: 100%;">`;
    } else if (ext === 'pdf') {
        return `<iframe src="/uploads/documents/${data.filePath.split('\\\\').pop()}" style="width: 100%; height: 600px; border: none;"></iframe>`;
    } else if (['txt', 'md'].includes(ext)) {
        return `<pre style="white-space: pre-wrap; padding: 20px; background: #f5f5f5; border-radius: 8px;">${data.content || 'Không thể hiển thị nội dung'}</pre>`;
    } else {
        return `<div class="preview-unavailable">
            <div style="font-size: 4em; margin-bottom: 20px;">📄</div>
            <p>Không thể xem trước file loại này</p>
            <button class="btn-primary" onclick="downloadDocument(${data.id})">⬇️ Tải Xuống</button>
        </div>`;
    }
}

// ===== DOCUMENT TAGS =====
async function addTagToDocument(documentId) {
    const tag = prompt('Nhập tag:');
    if (!tag) return;
    
    try {
        const response = await fetch(`${API_URL}/documents/${documentId}/tags`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tag })
        });
        
        if (response.ok) {
            showToast('✅ Đã thêm tag', 'success');
            loadDocuments();
        }
    } catch (error) {
        showToast('❌ Lỗi: ' + error.message, 'error');
    }
}

// ===== DOCUMENT FAVORITES =====
async function toggleFavorite(documentId) {
    try {
        const response = await fetch(`${API_URL}/documents/${documentId}/favorite`, {
            method: 'POST'
        });
        
        if (response.ok) {
            showToast('✅ Đã cập nhật yêu thích', 'success');
            loadDocuments();
        }
    } catch (error) {
        showToast('❌ Lỗi: ' + error.message, 'error');
    }
}

// ===== DOCUMENT COLLABORATION =====
async function inviteCollaborator(documentId) {
    const email = prompt('Nhập email người cộng tác:');
    if (!email) return;
    
    try {
        const response = await fetch(`${API_URL}/documents/${documentId}/collaborators`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showToast('✅ Đã gửi lời mời', 'success');
        } else {
            showToast('❌ Lỗi: ' + result.error, 'error');
        }
    } catch (error) {
        showToast('❌ Lỗi: ' + error.message, 'error');
    }
}

// Initialize advanced features
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdvancedFeatures);
} else {
    initAdvancedFeatures();
}

function initAdvancedFeatures() {
    setupDragAndDrop();
    
    // Setup keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + U: Upload
        if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
            e.preventDefault();
            document.getElementById('doc-file')?.click();
        }
        
        // Ctrl/Cmd + F: Focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            document.getElementById('search-docs')?.focus();
        }
    });
}


// Export functions to global scope
window.bulkUploadDocuments = bulkUploadDocuments;
window.uploadFromURL = uploadFromURL;
window.connectGoogleDrive = connectGoogleDrive;
window.connectDropbox = connectDropbox;
window.uploadNewVersion = uploadNewVersion;
window.shareDocument = shareDocument;
window.copyShareLink = copyShareLink;
window.generateQRCode = generateQRCode;
window.sendShareEmail = sendShareEmail;
window.showTemplateSelector = showTemplateSelector;
window.useTemplate = useTemplate;
window.previewDocument = previewDocument;
window.addTagToDocument = addTagToDocument;
window.toggleFavorite = toggleFavorite;
window.inviteCollaborator = inviteCollaborator;
window.showBulkUpload = function() {
    showToast('🔄 Tính năng đang được phát triển...', 'warning');
};
window.showURLUpload = function() {
    showToast('🔄 Tính năng đang được phát triển...', 'warning');
};
