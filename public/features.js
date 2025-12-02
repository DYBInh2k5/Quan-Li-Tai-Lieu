// File chứa các tính năng mở rộng

// Load Analytics
async function loadAnalytics() {
    try {
        const [docsRes, assignmentsRes] = await Promise.all([
            fetch(`${API_URL}/documents`),
            fetch(`${API_URL}/assignments`)
        ]);
        
        const documents = await docsRes.json();
        const assignments = await assignmentsRes.json();
        
        // Update analytics cards
        document.getElementById('total-docs').textContent = documents.length;
        document.getElementById('total-assignments').textContent = assignments.length;
        document.getElementById('pending-count').textContent = 
            assignments.filter(a => a.status === 'pending').length;
        
        const gradedAssignments = assignments.filter(a => a.grade !== null);
        const avgGrade = gradedAssignments.length > 0
            ? (gradedAssignments.reduce((sum, a) => sum + a.grade, 0) / gradedAssignments.length).toFixed(2)
            : 0;
        document.getElementById('avg-grade').textContent = avgGrade;
        
        // Leaderboard
        renderLeaderboard(assignments);
        
        // Grade distribution
        renderGradeDistribution(assignments);
        
        // Activity log
        renderActivityLog();
    } catch (error) {
        console.error('Lỗi tải analytics:', error);
    }
}

// Render Leaderboard
function renderLeaderboard(assignments) {
    const studentGrades = {};
    
    assignments.forEach(a => {
        if (a.grade !== null) {
            if (!studentGrades[a.student]) {
                studentGrades[a.student] = { total: 0, count: 0 };
            }
            studentGrades[a.student].total += a.grade;
            studentGrades[a.student].count += 1;
        }
    });
    
    const leaderboard = Object.entries(studentGrades)
        .map(([name, data]) => ({
            name,
            avg: (data.total / data.count).toFixed(2),
            count: data.count
        }))
        .sort((a, b) => b.avg - a.avg)
        .slice(0, 10);

    
    const container = document.getElementById('leaderboard');
    if (leaderboard.length === 0) {
        container.innerHTML = '<div class="empty-state">Chưa có dữ liệu</div>';
        return;
    }
    
    container.innerHTML = leaderboard.map((student, index) => {
        let rankClass = '';
        if (index === 0) rankClass = 'gold';
        else if (index === 1) rankClass = 'silver';
        else if (index === 2) rankClass = 'bronze';
        
        return `
            <div class="leaderboard-item">
                <div class="leaderboard-rank ${rankClass}">${index + 1}</div>
                <div class="leaderboard-info">
                    <div class="leaderboard-name">${student.name}</div>
                    <div class="leaderboard-stats">${student.count} bài tập</div>
                </div>
                <div class="leaderboard-grade">${student.avg}</div>
            </div>
        `;
    }).join('');
}

// Render Grade Distribution
function renderGradeDistribution(assignments) {
    const graded = assignments.filter(a => a.grade !== null);
    const ranges = {
        '9-10': 0,
        '8-8.9': 0,
        '7-7.9': 0,
        '6-6.9': 0,
        '5-5.9': 0,
        '0-4.9': 0
    };
    
    graded.forEach(a => {
        if (a.grade >= 9) ranges['9-10']++;
        else if (a.grade >= 8) ranges['8-8.9']++;
        else if (a.grade >= 7) ranges['7-7.9']++;
        else if (a.grade >= 6) ranges['6-6.9']++;
        else if (a.grade >= 5) ranges['5-5.9']++;
        else ranges['0-4.9']++;
    });
    
    const total = graded.length || 1;
    const container = document.getElementById('grade-distribution');

    
    container.innerHTML = Object.entries(ranges).map(([range, count]) => {
        const percentage = ((count / total) * 100).toFixed(1);
        return `
            <div class="grade-bar">
                <div class="grade-label">${range} điểm</div>
                <div class="grade-progress">
                    <div class="grade-progress-fill" style="width: ${percentage}%">
                        ${count > 0 ? `${count} (${percentage}%)` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Render Activity Log
async function renderActivityLog() {
    try {
        const response = await fetch(`${API_URL}/activities?limit=15`);
        const activities = await response.json();
        
        const container = document.getElementById('activity-log');
        
        if (activities.length === 0) {
            container.innerHTML = '<div class="empty-state">Chưa có hoạt động nào</div>';
            return;
        }
        
        const iconMap = {
            upload: '📤',
            submit: '📝',
            grade: '✅',
            delete: '🗑️',
            create: '➕',
            update: '✏️'
        };
        
        container.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">${iconMap[activity.action] || '📌'}</div>
                <div class="activity-content">
                    <div class="activity-text">
                        <strong>${activity.entityTitle}</strong> - ${activity.details}
                    </div>
                    <div class="activity-time">${new Date(activity.createdAt).toLocaleString('vi-VN')}</div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading activity log:', error);
    }
}

// Deadline Management
async function addDeadline() {
    const title = document.getElementById('deadline-title').value.trim();
    const deadlineDate = document.getElementById('deadline-date').value;
    const type = document.getElementById('deadline-type').value;
    const description = document.getElementById('deadline-description').value.trim();
    
    if (!title || !deadlineDate) {
        showToast('Vui lòng nhập đầy đủ thông tin!', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/deadlines`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title,
                deadlineDate,
                type,
                description,
                priority: 'normal'
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            document.getElementById('deadline-form').reset();
            loadDeadlines();
            showToast('✅ ' + result.message, 'success');
        } else {
            showToast('❌ Lỗi: ' + result.error, 'error');
        }
    } catch (error) {
        showToast('❌ Lỗi kết nối: ' + error.message, 'error');
    }
}

async function loadDeadlines() {
    const filterType = document.getElementById('filter-deadline-type')?.value || 'all';
    const filterStatus = document.getElementById('filter-deadline-status')?.value || 'all';
    
    const container = document.getElementById('deadlines-list');
    if (!container) return;
    
    try {
        const params = new URLSearchParams();
        if (filterType) params.append('type', filterType);
        if (filterStatus) params.append('status', filterStatus);
        
        const response = await fetch(`${API_URL}/deadlines?${params}`);
        let deadlines = await response.json();
        
        // Update status based on date
        const now = new Date();
        for (const d of deadlines) {
            const deadlineDate = new Date(d.deadlineDate);
            if (d.status !== 'completed') {
                const newStatus = deadlineDate < now ? 'overdue' : 'upcoming';
                if (newStatus !== d.status) {
                    await fetch(`${API_URL}/deadlines/${d.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: newStatus })
                    });
                    d.status = newStatus;
                }
            }
        }
        
        if (deadlines.length === 0) {
            container.innerHTML = '<div class="empty-state">Không có lịch hẹn nào</div>';
            return;
        }
        
        container.innerHTML = deadlines.map(d => `
            <div class="item-card deadline-item ${d.type}">
                <div class="item-header">
                    <div class="item-title">${getDeadlineIcon(d.type)} ${d.title}</div>
                    <span class="deadline-status ${d.status}">
                        ${getStatusText(d.status)}
                    </span>
                </div>
                <div class="deadline-date">📅 ${new Date(d.deadlineDate).toLocaleString('vi-VN')}</div>
                ${d.description ? `<div class="item-description">${d.description}</div>` : ''}
                <div class="item-actions">
                    ${d.status !== 'completed' ? 
                        `<button class="btn-small" onclick="markCompleted(${d.id})">✅ Hoàn thành</button>` : ''}
                    <button class="btn-small btn-delete" onclick="deleteDeadline(${d.id})">🗑️ Xóa</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        container.innerHTML = '<div class="error-state">❌ Lỗi tải dữ liệu</div>';
    }
}

function getDeadlineIcon(type) {
    const icons = {
        deadline: '⏰',
        meeting: '👥',
        exam: '📝',
        event: '🎉'
    };
    return icons[type] || '📅';
}

function getStatusText(status) {
    const texts = {
        upcoming: 'Sắp tới',
        overdue: 'Quá hạn',
        completed: 'Hoàn thành'
    };
    return texts[status] || status;
}

async function markCompleted(id) {
    try {
        const response = await fetch(`${API_URL}/deadlines/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'completed' })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            loadDeadlines();
            showToast('✅ ' + result.message, 'success');
        } else {
            showToast('❌ Lỗi: ' + result.error, 'error');
        }
    } catch (error) {
        showToast('❌ Lỗi kết nối', 'error');
    }
}

async function deleteDeadline(id) {
    if (!confirm('Bạn có chắc muốn xóa lịch hẹn này?')) return;
    
    try {
        const response = await fetch(`${API_URL}/deadlines/${id}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (response.ok) {
            loadDeadlines();
            showToast('✅ ' + result.message, 'success');
        } else {
            showToast('❌ Lỗi: ' + result.error, 'error');
        }
    } catch (error) {
        showToast('❌ Lỗi kết nối', 'error');
    }
}

async function checkDeadlineNotifications() {
    try {
        const response = await fetch(`${API_URL}/deadlines?status=upcoming`);
        const deadlines = await response.json();
        
        const now = new Date();
        const oneHour = 60 * 60 * 1000;
        
        deadlines.forEach(d => {
            const deadlineDate = new Date(d.deadlineDate);
            const diff = deadlineDate - now;
            
            const notifiedKey = `notified_${d.id}`;
            const wasNotified = localStorage.getItem(notifiedKey);
            
            if (diff > 0 && diff < oneHour && !wasNotified) {
                showToast(`⏰ Sắp đến hạn: ${d.title}`, 'warning');
                localStorage.setItem(notifiedKey, 'true');
            }
        });
    } catch (error) {
        console.error('Error checking notifications:', error);
    }
}

// Export to Excel (simple CSV)
function exportAssignments() {
    fetch(`${API_URL}/assignments`)
        .then(res => res.json())
        .then(assignments => {
            let csv = 'Tên Bài Tập,Học Sinh,Ngày Nộp,Trạng Thái,Điểm\n';
            assignments.forEach(a => {
                csv += `"${a.title}","${a.student}","${new Date(a.submitDate).toLocaleString('vi-VN')}","${a.status === 'graded' ? 'Đã chấm' : 'Chờ chấm'}","${a.grade || 'Chưa chấm'}"\n`;
            });
            
            const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `bai-tap-${Date.now()}.csv`;
            link.click();
            
            showToast('✅ Đã xuất file Excel', 'success');
        })
        .catch(error => {
            showToast('❌ Lỗi xuất file: ' + error.message, 'error');
        });
}


// Export functions to global scope
window.loadAnalytics = loadAnalytics;
window.renderLeaderboard = renderLeaderboard;
window.renderGradeDistribution = renderGradeDistribution;
window.renderActivityLog = renderActivityLog;
window.addDeadline = addDeadline;
window.loadDeadlines = loadDeadlines;
window.markCompleted = markCompleted;
window.deleteDeadline = deleteDeadline;
window.checkDeadlineNotifications = checkDeadlineNotifications;
window.exportAssignments = exportAssignments;
