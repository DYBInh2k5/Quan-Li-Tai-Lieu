// Media & Links Management

// Setup media tabs
function setupMediaTabs() {
    const mediaTabs = document.querySelectorAll('.media-tab-btn');
    const mediaContents = document.querySelectorAll('.media-tab-content');
    
    mediaTabs.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.mediaTab;
            
            mediaTabs.forEach(b => b.classList.remove('active'));
            mediaContents.forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(tabName).classList.add('active');
            
            if (tabName === 'images') {
                loadImages();
            } else if (tabName === 'links') {
                loadLinks();
            }
        });
    });
}

// Setup image upload preview
function setupImagePreview() {
    const imageFile = document.getElementById('image-file');
    if (imageFile) {
        imageFile.addEventListener('change', (e) => {
            showImagePreview(e.target.files);
        });
    }
}

function showImagePreview(files) {
    const container = document.getElementById('image-preview-grid');
    if (!container) return;
    
    container.innerHTML = '';
    Array.from(files).forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const item = document.createElement('div');
            item.className = 'image-preview-item';
            item.innerHTML = `
                <img src="${e.target.result}" alt="Preview">
                <button class="image-preview-remove" onclick="removeImagePreview(${index})">×</button>
            `;
            container.appendChild(item);
        };
        reader.readAsDataURL(file);
    });
}

function removeImagePreview(index) {
    const fileInput = document.getElementById('image-file');
    const dt = new DataTransfer();
    const files = fileInput.files;
    
    for (let i = 0; i < files.length; i++) {
        if (i !== index) {
            dt.items.add(files[i]);
        }
    }
    
    fileInput.files = dt.files;
    showImagePreview(fileInput.files);
}

// Upload image
async function uploadImage() {
    const form = document.getElementById('image-form');
    const btn = form.querySelector('button');
    const btnText = btn.querySelector('.btn-text');
    const btnLoading = btn.querySelector('.btn-loading');
    
    const title = document.getElementById('image-title').value.trim();
    const category = document.getElementById('image-category').value;
    const fileInput = document.getElementById('image-file');
    const description = document.getElementById('image-description').value.trim();
    
    if (!fileInput.files[0]) {
        showToast('Vui lòng chọn hình ảnh!', 'error');
        return;
    }
    
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline';
    btn.disabled = true;
    
    try {
        // Upload từng ảnh
        for (const file of fileInput.files) {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('category', category);
            formData.append('description', description);
            formData.append('file', file);
            formData.append('type', 'images');
            
            const response = await fetch(`${API_URL}/images`, {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.error);
            }
        }
        
        showToast(`✅ Upload ${fileInput.files.length} hình ảnh thành công!`, 'success');
        form.reset();
        document.getElementById('image-preview-grid').innerHTML = '';
        loadImages();
    } catch (error) {
        showToast('❌ Lỗi: ' + error.message, 'error');
    } finally {
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
        btn.disabled = false;
    }
}

// Load images
async function loadImages() {
    const container = document.getElementById('images-list');
    if (!container) return;
    
    try {
        const search = document.getElementById('search-images')?.value || '';
        const category = document.getElementById('filter-image-category')?.value || 'all';
        
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (category) params.append('category', category);
        
        const response = await fetch(`${API_URL}/images?${params}`);
        const images = await response.json();
        
        if (images.length === 0) {
            container.innerHTML = '<div class="empty-state">Chưa có hình ảnh nào</div>';
            return;
        }
        
        container.innerHTML = images.map(img => `
            <div class="image-card" onclick="viewImage(${img.id})">
                <img src="/uploads/images/${img.filePath.split('\\\\').pop()}" 
                     alt="${img.title}" 
                     class="image-card-img"
                     onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%23ddd%22 width=%22200%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23999%22%3ENo Image%3C/text%3E%3C/svg%3E'">
                <div class="image-card-content">
                    <div class="image-card-title">
                        ${img.category ? `<span class="category-badge category-${img.category}">${getCategoryName(img.category)}</span>` : ''}
                        ${img.title}
                    </div>
                    <div class="image-card-meta">
                        📅 ${new Date(img.uploadDate).toLocaleDateString('vi-VN')} | 
                        👁️ ${img.viewCount} lượt xem
                    </div>
                    ${img.description ? `<div class="item-description">${img.description}</div>` : ''}
                    <div class="image-card-actions">
                        <button class="btn-small btn-download" onclick="event.stopPropagation(); downloadImage(${img.id})">
                            ⬇️ Tải
                        </button>
                        <button class="btn-small btn-delete" onclick="event.stopPropagation(); deleteImage(${img.id})">
                            🗑️ Xóa
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        container.innerHTML = '<div class="error-state">❌ Lỗi tải dữ liệu</div>';
    }
}

// View image in modal
async function viewImage(id) {
    try {
        // Tăng view count
        await fetch(`${API_URL}/images/${id}/view`, { method: 'POST' });
        
        // Lấy thông tin ảnh
        const response = await fetch(`${API_URL}/images`);
        const images = await response.json();
        const img = images.find(i => i.id === id);
        
        if (!img) return;
        
        // Tạo modal
        const modal = document.createElement('div');
        modal.className = 'image-modal show';
        modal.innerHTML = `
            <div class="image-modal-content">
                <button class="image-modal-close" onclick="closeImageModal()">×</button>
                <img src="/uploads/images/${img.filePath.split('\\\\').pop()}" 
                     alt="${img.title}" 
                     class="image-modal-img">
                <div class="image-modal-info">
                    <div class="image-modal-title">${img.title}</div>
                    <div class="image-modal-meta">
                        ${img.description || ''} | 
                        ${new Date(img.uploadDate).toLocaleString('vi-VN')} | 
                        ${img.viewCount + 1} lượt xem
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close on click outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeImageModal();
            }
        });
    } catch (error) {
        showToast('❌ Lỗi xem ảnh', 'error');
    }
}

function closeImageModal() {
    const modal = document.querySelector('.image-modal');
    if (modal) {
        modal.remove();
    }
}

// Download image
function downloadImage(id) {
    window.open(`${API_URL}/images/${id}/download`, '_blank');
}

// Delete image
async function deleteImage(id) {
    if (!confirm('Bạn có chắc muốn xóa hình ảnh này?')) return;
    
    try {
        const response = await fetch(`${API_URL}/images/${id}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showToast('✅ ' + result.message, 'success');
            loadImages();
        } else {
            showToast('❌ Lỗi: ' + result.error, 'error');
        }
    } catch (error) {
        showToast('❌ Lỗi kết nối', 'error');
    }
}

// ===== LINKS =====

// Setup link preview
function setupLinkPreview() {
    const linkUrl = document.getElementById('link-url');
    if (linkUrl) {
        linkUrl.addEventListener('input', (e) => {
            const url = e.target.value;
            if (url && isValidUrl(url)) {
                showLinkPreview(url);
            } else {
                document.getElementById('link-preview-box').classList.remove('show');
            }
        });
    }
}

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

function showLinkPreview(url) {
    const container = document.getElementById('link-preview-box');
    if (!container) return;
    
    container.className = 'link-preview show';
    container.innerHTML = `
        <div class="link-preview-title">🔗 Preview</div>
        <div class="link-preview-url">${url}</div>
    `;
}

// Add link
async function addLink() {
    const title = document.getElementById('link-title').value.trim();
    const url = document.getElementById('link-url').value.trim();
    const category = document.getElementById('link-category').value;
    const description = document.getElementById('link-description').value.trim();
    
    if (!title || !url) {
        showToast('Vui lòng nhập đầy đủ thông tin!', 'error');
        return;
    }
    
    if (!isValidUrl(url)) {
        showToast('URL không hợp lệ!', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/links`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, url, category, description })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showToast('✅ ' + result.message, 'success');
            document.getElementById('link-form').reset();
            document.getElementById('link-preview-box').classList.remove('show');
            loadLinks();
        } else {
            showToast('❌ Lỗi: ' + result.error, 'error');
        }
    } catch (error) {
        showToast('❌ Lỗi kết nối: ' + error.message, 'error');
    }
}

// Load links
async function loadLinks() {
    const container = document.getElementById('links-list');
    if (!container) return;
    
    try {
        const search = document.getElementById('search-links')?.value || '';
        const category = document.getElementById('filter-link-category')?.value || 'all';
        
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (category) params.append('category', category);
        
        const response = await fetch(`${API_URL}/links?${params}`);
        const links = await response.json();
        
        if (links.length === 0) {
            container.innerHTML = '<div class="empty-state">Chưa có liên kết nào</div>';
            return;
        }
        
        container.innerHTML = links.map(link => `
            <div class="link-card">
                <div class="link-card-icon">${getLinkIcon(link.category)}</div>
                <div class="link-card-content">
                    <div class="link-card-title">${link.title}</div>
                    <a href="${link.url}" target="_blank" class="link-card-url" onclick="trackLinkClick(${link.id})">
                        ${link.url}
                    </a>
                    ${link.description ? `<div class="link-card-description">${link.description}</div>` : ''}
                    <div class="link-card-meta">
                        📅 ${new Date(link.createdAt).toLocaleDateString('vi-VN')}
                        <span class="click-count">👆 ${link.clickCount} clicks</span>
                    </div>
                    <div class="link-card-actions">
                        <button class="btn-small btn-delete" onclick="deleteLink(${link.id})">
                            🗑️ Xóa
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        container.innerHTML = '<div class="error-state">❌ Lỗi tải dữ liệu</div>';
    }
}

function getLinkIcon(category) {
    const icons = {
        video: '🎥',
        article: '📰',
        course: '📚',
        tool: '🛠️',
        reference: '📖',
        other: '🔗'
    };
    return icons[category] || '🔗';
}

async function trackLinkClick(id) {
    try {
        await fetch(`${API_URL}/links/${id}/click`, { method: 'POST' });
    } catch (error) {
        console.error('Error tracking click:', error);
    }
}

async function deleteLink(id) {
    if (!confirm('Bạn có chắc muốn xóa liên kết này?')) return;
    
    try {
        const response = await fetch(`${API_URL}/links/${id}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showToast('✅ ' + result.message, 'success');
            loadLinks();
        } else {
            showToast('❌ Lỗi: ' + result.error, 'error');
        }
    } catch (error) {
        showToast('❌ Lỗi kết nối', 'error');
    }
}

// Initialize when DOM loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMedia);
} else {
    initMedia();
}

function initMedia() {
    setupMediaTabs();
    setupImagePreview();
    setupLinkPreview();
    
    // Setup forms
    const imageForm = document.getElementById('image-form');
    if (imageForm) {
        imageForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await uploadImage();
        });
    }
    
    const linkForm = document.getElementById('link-form');
    if (linkForm) {
        linkForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await addLink();
        });
    }
    
    // Setup filters
    const searchImages = document.getElementById('search-images');
    const filterImageCategory = document.getElementById('filter-image-category');
    const searchLinks = document.getElementById('search-links');
    const filterLinkCategory = document.getElementById('filter-link-category');
    
    let timeout;
    if (searchImages) {
        searchImages.addEventListener('input', () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => loadImages(), 300);
        });
    }
    
    if (filterImageCategory) {
        filterImageCategory.addEventListener('change', () => loadImages());
    }
    
    if (searchLinks) {
        searchLinks.addEventListener('input', () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => loadLinks(), 300);
        });
    }
    
    if (filterLinkCategory) {
        filterLinkCategory.addEventListener('change', () => loadLinks());
    }
    
    // Load initial data
    loadImages();
    loadLinks();
}


// Export functions to global scope
window.uploadImage = uploadImage;
window.loadImages = loadImages;
window.viewImage = viewImage;
window.closeImageModal = closeImageModal;
window.downloadImage = downloadImage;
window.deleteImage = deleteImage;
window.addLink = addLink;
window.loadLinks = loadLinks;
window.trackLinkClick = trackLinkClick;
window.deleteLink = deleteLink;
