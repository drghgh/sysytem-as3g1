// Support page JavaScript
let currentUser = null;
let userTickets = [];

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication state
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            currentUser = user;
            await loadUserTickets();
        } else {
            // Show login prompt for non-authenticated users
            showLoginPrompt();
        }
    });

    // Handle support form submission
    const supportForm = document.getElementById('supportForm');
    if (supportForm) {
        supportForm.addEventListener('submit', handleSupportSubmission);
    }
});

// Select priority option
function selectPriority(priority, element) {
    // Remove selected class from all options
    document.querySelectorAll('.priority-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Add selected class to clicked option
    element.classList.add('selected');
    
    // Update hidden input value
    document.getElementById('ticketPriority').value = priority;
}

// Handle support form submission
async function handleSupportSubmission(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('.btn-submit');
    const btnText = submitBtn.querySelector('.btn-text');
    const loading = submitBtn.querySelector('.loading');
    
    // Show loading state
    btnText.style.display = 'none';
    loading.style.display = 'inline-block';
    submitBtn.disabled = true;
    
    const formData = new FormData(form);
    
    const ticketData = {
        subject: formData.get('subject'),
        message: formData.get('description'),
        category: formData.get('category') || 'other',
        priority: formData.get('priority'),
        contactInfo: formData.get('contactInfo'),
        status: 'open',
        userId: currentUser ? currentUser.uid : null,
        userEmail: currentUser ? currentUser.email : null,
        replies: []
    };
    
    try {
        const result = await FirebaseUtils.addDocument('support_tickets', ticketData);
        
        if (result.success) {
            showMessage('تم إرسال تذكرة الدعم بنجاح! سيتم الرد عليك قريباً.', 'success');
            form.reset();
            // Reset priority to medium
            selectPriority('medium', document.querySelector('.priority-medium'));
            
            // Reload tickets if user is authenticated
            if (currentUser) {
                await loadUserTickets();
            }
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('Error submitting support ticket:', error);
        showMessage('حدث خطأ في إرسال تذكرة الدعم. يرجى المحاولة مرة أخرى.', 'error');
    } finally {
        // Reset button state
        btnText.style.display = 'inline';
        loading.style.display = 'none';
        submitBtn.disabled = false;
    }
}

// Load user tickets
async function loadUserTickets() {
    if (!currentUser) return;
    
    try {
        const result = await FirebaseUtils.getDocuments('support_tickets', 
            { field: 'createdAt', direction: 'desc' });
        
        if (result.success) {
            // Filter tickets for current user
            userTickets = result.data.filter(ticket => ticket.userId === currentUser.uid);
        } else {
            userTickets = [];
        }
        
        displayUserTickets();
    } catch (error) {
        console.error('Error loading user tickets:', error);
        userTickets = [];
        displayUserTickets();
    }
}

// Display user tickets
function displayUserTickets() {
    const ticketsList = document.getElementById('ticketsList');
    
    if (userTickets.length === 0) {
        ticketsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-ticket-alt"></i>
                <h3>لا توجد تذاكر دعم</h3>
                <p>لم تقم بإنشاء أي تذاكر دعم حتى الآن</p>
            </div>
        `;
        return;
    }
    
    const ticketsHTML = userTickets.map(ticket => {
        const statusClass = getTicketStatusClass(ticket.status);
        const statusText = getTicketStatusText(ticket.status);
        const priorityClass = getPriorityBadgeClass(ticket.priority);
        const priorityText = getPriorityText(ticket.priority);
        
        const repliesHTML = ticket.replies && ticket.replies.length > 0 ? 
            `<div class="ticket-replies">
                <h4 style="margin-bottom: 1rem; color: #2c5aa0;">الردود:</h4>
                ${ticket.replies.map(reply => `
                    <div class="reply-item">
                        <div class="reply-header">
                            <span class="reply-author">${reply.authorName || 'فريق الدعم'}</span>
                            <span class="reply-date">${reply.createdAt ? formatDateArabic(reply.createdAt.toDate()) : ''}</span>
                        </div>
                        <div class="reply-content">${reply.content}</div>
                    </div>
                `).join('')}
            </div>` : '';
        
        return `
            <div class="ticket-card">
                <div class="ticket-header">
                    <span class="ticket-id">تذكرة #${ticket.id.substring(0, 8)}</span>
                    <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
                        <span class="ticket-priority ${priorityClass}">${priorityText}</span>
                        <span class="ticket-status ${statusClass}">${statusText}</span>
                    </div>
                </div>
                
                <div class="ticket-subject">${ticket.subject}</div>
                <div class="ticket-description">${ticket.description}</div>
                
                <div class="ticket-meta">
                    <span>تاريخ الإنشاء: ${ticket.createdAt ? formatDateArabic(ticket.createdAt.toDate()) : 'غير محدد'}</span>
                    ${ticket.contactInfo ? `<span>معلومات التواصل: ${ticket.contactInfo}</span>` : ''}
                </div>
                
                ${repliesHTML}
            </div>
        `;
    }).join('');
    
    ticketsList.innerHTML = ticketsHTML;
}

// Get ticket status CSS class
function getTicketStatusClass(status) {
    switch (status) {
        case 'open':
            return 'status-open';
        case 'in-progress':
            return 'status-in-progress';
        case 'resolved':
            return 'status-resolved';
        case 'closed':
            return 'status-closed';
        default:
            return 'status-open';
    }
}

// Get ticket status text in Arabic
function getTicketStatusText(status) {
    switch (status) {
        case 'open':
            return 'مفتوحة';
        case 'in-progress':
            return 'قيد المعالجة';
        case 'resolved':
            return 'تم الحل';
        case 'closed':
            return 'مغلقة';
        default:
            return 'مفتوحة';
    }
}

// Get priority badge CSS class
function getPriorityBadgeClass(priority) {
    switch (priority) {
        case 'high':
            return 'priority-high-badge';
        case 'medium':
            return 'priority-medium-badge';
        case 'low':
            return 'priority-low-badge';
        default:
            return 'priority-medium-badge';
    }
}

// Get priority text in Arabic
function getPriorityText(priority) {
    switch (priority) {
        case 'high':
            return 'عالية';
        case 'medium':
            return 'متوسطة';
        case 'low':
            return 'منخفضة';
        default:
            return 'متوسطة';
    }
}

// Show login prompt for non-authenticated users
function showLoginPrompt() {
    const ticketsList = document.getElementById('ticketsList');
    ticketsList.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-user-lock"></i>
            <h3>تسجيل الدخول مطلوب</h3>
            <p>يرجى تسجيل الدخول لعرض تذاكر الدعم الخاصة بك</p>
            <a href="login.html" class="btn-primary" style="margin-top: 1rem;">
                تسجيل الدخول
            </a>
        </div>
    `;
}

// Show message to user (reuse from main.js)
function showMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    // Insert at the top of the page
    document.body.insertBefore(messageDiv, document.body.firstChild);
    
    // Remove after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.parentNode.removeChild(messageDiv);
        }
    }, 5000);
}

// Format date in Arabic (reuse from main.js)
function formatDateArabic(date) {
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    return new Date(date).toLocaleDateString('ar-EG', options);
}
