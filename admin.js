// Admin panel JavaScript
let currentUser = null;
let allOrders = [];
let allUsers = [];
let allTickets = [];
let allFAQs = [];
let filteredOrders = [];
let filteredUsers = [];
let filteredTickets = [];
let filteredFAQs = [];

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication and admin privileges
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            currentUser = user;
            const isAdmin = await FirebaseUtils.isAdmin(user.uid);
            
            if (isAdmin) {
                await initializeAdminPanel();
            } else {
                // Redirect non-admin users
                showMessage('ليس لديك صلاحية للوصول إلى هذه الصفحة', 'error');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            }
        } else {
            // Redirect to login if not authenticated
            window.location.href = 'login.html';
        }
    });
});

// Initialize admin panel
async function initializeAdminPanel() {
    try {
        // Load user info
        const userResult = await FirebaseUtils.getDocument('users', currentUser.uid);
        if (userResult.success) {
            const userData = userResult.data;
            document.getElementById('adminUserName').textContent = `مرحباً، ${userData.name || 'المدير'}`;
        }
        
        // Load all data
        await loadDashboardData();
        await loadOrders();
        await loadUsers();
        await loadSupportTickets();
        
    } catch (error) {
        console.error('Error initializing admin panel:', error);
        showMessage('حدث خطأ في تحميل لوحة التحكم', 'error');
    }
}

// Switch between tabs
function switchTab(tabName) {
    // Update menu items
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}Tab`).classList.add('active');
    
    // Update page title
    const titles = {
        dashboard: 'لوحة التحكم الرئيسية',
        orders: 'إدارة الطلبات',
        users: 'إدارة المستخدمين',
        support: 'إدارة الدعم الفني',
        systems: 'إدارة الأنظمة',
        posts: 'إدارة المنشورات',
        faq: 'إدارة الأسئلة الشائعة',
        accounts: 'إدارة الحسابات',
        settings: 'إعدادات النظام'
    };
    
    document.getElementById('pageTitle').textContent = titles[tabName] || 'لوحة التحكم';
    
    // Load specific tab data if needed
    switch(tabName) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'orders':
            displayOrders();
            break;
        case 'users':
            displayUsers();
            break;
        case 'support':
            displaySupportTickets();
            break;
        case 'faq':
            loadFAQs();
            break;
    }
}

// Toggle sidebar for mobile
function toggleSidebar() {
    const sidebar = document.getElementById('adminSidebar');
    const main = document.getElementById('adminMain');
    
    sidebar.classList.toggle('show');
    main.classList.toggle('expanded');
}

// Load dashboard data
async function loadDashboardData() {
    try {
        // Load statistics
        const stats = await Promise.all([
            FirebaseUtils.getDocuments('orders'),
            FirebaseUtils.getDocuments('users'),
            FirebaseUtils.getDocuments('support_tickets')
        ]);
        
        const ordersCount = stats[0].success ? stats[0].data.length : 0;
        const usersCount = stats[1].success ? stats[1].data.length : 0;
        const ticketsCount = stats[2].success ? stats[2].data.length : 0;
        
        displayDashboardStats(ordersCount, usersCount, ticketsCount);
        
        // Load recent activities
        await loadRecentActivities();
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

// Display dashboard statistics
function displayDashboardStats(ordersCount, usersCount, ticketsCount) {
    const statsGrid = document.getElementById('statsGrid');
    
    statsGrid.innerHTML = `
        <div class="stat-card orders">
            <i class="fas fa-shopping-cart"></i>
            <div class="stat-number">${ordersCount}</div>
            <div class="stat-label">إجمالي الطلبات</div>
        </div>
        
        <div class="stat-card users">
            <i class="fas fa-users"></i>
            <div class="stat-number">${usersCount}</div>
            <div class="stat-label">المستخدمين المسجلين</div>
        </div>
        
        <div class="stat-card tickets">
            <i class="fas fa-headset"></i>
            <div class="stat-number">${ticketsCount}</div>
            <div class="stat-label">تذاكر الدعم</div>
        </div>
        
        <div class="stat-card">
            <i class="fas fa-chart-line"></i>
            <div class="stat-number">${Math.round((ordersCount * 0.85))}</div>
            <div class="stat-label">معدل النجاح</div>
        </div>
    `;
}

// Load recent activities
async function loadRecentActivities() {
    const activitiesDiv = document.getElementById('recentActivities');
    
    try {
        // Get recent orders
        const recentOrders = await FirebaseUtils.getDocuments('orders', 
            { field: 'createdAt', direction: 'desc' }, 5);
        
        if (recentOrders.success && recentOrders.data.length > 0) {
            const activitiesHTML = recentOrders.data.map(order => `
                <div class="activity-item" style="padding: 1rem; border-bottom: 1px solid #e9ecef;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <strong>${order.customerName}</strong> طلب <strong>${order.systemName}</strong>
                        </div>
                        <small style="color: #666;">
                            ${order.createdAt ? formatDateArabic(order.createdAt.toDate()) : 'غير محدد'}
                        </small>
                    </div>
                </div>
            `).join('');
            
            activitiesDiv.innerHTML = activitiesHTML;
        } else {
            activitiesDiv.innerHTML = '<p style="text-align: center; color: #666;">لا توجد أنشطة حديثة</p>';
        }
    } catch (error) {
        console.error('Error loading recent activities:', error);
        activitiesDiv.innerHTML = '<p style="text-align: center; color: #666;">خطأ في تحميل الأنشطة</p>';
    }
}

// Load orders
async function loadOrders() {
    try {
        const result = await FirebaseUtils.getDocuments('orders', 
            { field: 'createdAt', direction: 'desc' });
        
        if (result.success) {
            allOrders = result.data;
            filteredOrders = [...allOrders];
            displayOrders();
        }
    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

// Display orders
function displayOrders() {
    const ordersTable = document.getElementById('ordersTable');
    
    if (filteredOrders.length === 0) {
        ordersTable.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-shopping-cart"></i>
                <h3>لا توجد طلبات</h3>
                <p>لم يتم تسجيل أي طلبات حتى الآن</p>
            </div>
        `;
        return;
    }
    
    const tableHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>رقم الطلب</th>
                    <th>اسم العميل</th>
                    <th>النظام</th>
                    <th>النشاط التجاري</th>
                    <th>الحالة</th>
                    <th>التاريخ</th>
                    <th>الإجراءات</th>
                </tr>
            </thead>
            <tbody>
                ${filteredOrders.map(order => `
                    <tr>
                        <td>#${order.id.substring(0, 8)}</td>
                        <td>${order.customerName}</td>
                        <td>${order.systemName}</td>
                        <td>${order.businessName}</td>
                        <td>
                            <span class="order-status ${getStatusClass(order.status)}">
                                ${getStatusText(order.status)}
                            </span>
                        </td>
                        <td>${order.createdAt ? formatDateArabic(order.createdAt.toDate()) : 'غير محدد'}</td>
                        <td>
                            <button class="action-btn btn-view" onclick="viewOrderDetails('${order.id}')">
                                <i class="fas fa-eye"></i>
                            </button>
                            ${order.status === 'pending' ? `
                                <button class="action-btn btn-approve" onclick="updateOrderStatus('${order.id}', 'approved')">
                                    <i class="fas fa-check"></i>
                                </button>
                                <button class="action-btn btn-reject" onclick="updateOrderStatus('${order.id}', 'rejected')">
                                    <i class="fas fa-times"></i>
                                </button>
                            ` : ''}
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    ordersTable.innerHTML = tableHTML;
}

// Filter orders
function filterOrders() {
    const statusFilter = document.getElementById('orderStatusFilter').value;
    
    filteredOrders = allOrders.filter(order => {
        return !statusFilter || order.status === statusFilter;
    });
    
    displayOrders();
}

// Search orders
function searchOrders() {
    const searchTerm = document.getElementById('orderSearchInput').value.toLowerCase();
    
    filteredOrders = allOrders.filter(order => {
        return order.customerName.toLowerCase().includes(searchTerm) ||
               order.businessName.toLowerCase().includes(searchTerm) ||
               order.systemName.toLowerCase().includes(searchTerm);
    });
    
    displayOrders();
}

// View order details
function viewOrderDetails(orderId) {
    const order = allOrders.find(o => o.id === orderId);
    if (!order) return;
    
    const modal = createModal();
    
    modal.querySelector('.modal-content').innerHTML = `
        <span class="close">&times;</span>
        <h2>تفاصيل الطلب #${order.id.substring(0, 8)}</h2>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin: 2rem 0;">
            <div>
                <h3>معلومات العميل</h3>
                <p><strong>الاسم:</strong> ${order.customerName}</p>
                <p><strong>النشاط التجاري:</strong> ${order.businessName}</p>
                <p><strong>رقم الهاتف:</strong> ${order.phoneNumber}</p>
                <p><strong>العنوان:</strong> ${order.location}</p>
                ${order.email ? `<p><strong>البريد الإلكتروني:</strong> ${order.email}</p>` : ''}
            </div>
            
            <div>
                <h3>معلومات الطلب</h3>
                <p><strong>النظام:</strong> ${order.systemName}</p>
                <p><strong>السعر:</strong> ${order.systemPrice}</p>
                <p><strong>الحالة:</strong> ${getStatusText(order.status)}</p>
                <p><strong>تاريخ الطلب:</strong> ${order.createdAt ? formatDateArabic(order.createdAt.toDate()) : 'غير محدد'}</p>
            </div>
        </div>
        
        ${order.notes ? `
            <div>
                <h3>ملاحظات</h3>
                <p>${order.notes}</p>
            </div>
        ` : ''}
        
        <div style="margin-top: 2rem; text-align: center;">
            ${order.status === 'pending' ? `
                <button class="btn-primary" onclick="updateOrderStatus('${order.id}', 'approved'); closeModal()">
                    قبول الطلب
                </button>
                <button class="btn-reject" onclick="updateOrderStatus('${order.id}', 'rejected'); closeModal()" style="margin-right: 1rem;">
                    رفض الطلب
                </button>
            ` : ''}
        </div>
    `;

    document.body.appendChild(modal);
    modal.style.display = 'block';

    // Close modal functionality
    const closeBtn = modal.querySelector('.close');
    closeBtn.onclick = () => {
        document.body.removeChild(modal);
    };

    modal.onclick = (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    };
}

// Update order status
async function updateOrderStatus(orderId, newStatus) {
    try {
        const result = await FirebaseUtils.updateDocument('orders', orderId, {
            status: newStatus
        });
        
        if (result.success) {
            showMessage(`تم ${newStatus === 'approved' ? 'قبول' : 'رفض'} الطلب بنجاح`, 'success');
            await loadOrders(); // Reload orders
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('Error updating order status:', error);
        showMessage('حدث خطأ في تحديث حالة الطلب', 'error');
    }
}

// Load users
async function loadUsers() {
    try {
        const result = await FirebaseUtils.getDocuments('users', 
            { field: 'createdAt', direction: 'desc' });
        
        if (result.success) {
            allUsers = result.data;
            filteredUsers = [...allUsers];
            displayUsers();
        }
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

// Display users
function displayUsers() {
    const usersTable = document.getElementById('usersTable');
    
    if (filteredUsers.length === 0) {
        usersTable.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-users"></i>
                <h3>لا توجد مستخدمين</h3>
                <p>لم يتم تسجيل أي مستخدمين حتى الآن</p>
            </div>
        `;
        return;
    }
    
    const tableHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>الاسم</th>
                    <th>البريد الإلكتروني</th>
                    <th>النشاط التجاري</th>
                    <th>النوع</th>
                    <th>تاريخ التسجيل</th>
                    <th>الإجراءات</th>
                </tr>
            </thead>
            <tbody>
                ${filteredUsers.map(user => `
                    <tr>
                        <td>${user.name || 'غير محدد'}</td>
                        <td>${user.email}</td>
                        <td>${user.businessName || 'غير محدد'}</td>
                        <td>${getRoleText(user.role)}</td>
                        <td>${user.createdAt ? formatDateArabic(user.createdAt.toDate()) : 'غير محدد'}</td>
                        <td>
                            <button class="action-btn btn-view" onclick="viewUserDetails('${user.id}')">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="action-btn btn-edit" onclick="editUserRole('${user.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    usersTable.innerHTML = tableHTML;
}

// Filter users
function filterUsers() {
    const roleFilter = document.getElementById('userRoleFilter').value;
    
    filteredUsers = allUsers.filter(user => {
        return !roleFilter || user.role === roleFilter;
    });
    
    displayUsers();
}

// Search users
function searchUsers() {
    const searchTerm = document.getElementById('userSearchInput').value.toLowerCase();
    
    filteredUsers = allUsers.filter(user => {
        return (user.name && user.name.toLowerCase().includes(searchTerm)) ||
               user.email.toLowerCase().includes(searchTerm) ||
               (user.businessName && user.businessName.toLowerCase().includes(searchTerm));
    });
    
    displayUsers();
}

// Load support tickets
async function loadSupportTickets() {
    try {
        const result = await FirebaseUtils.getDocuments('support_tickets', 
            { field: 'createdAt', direction: 'desc' });
        
        if (result.success) {
            allTickets = result.data;
            filteredTickets = [...allTickets];
            displaySupportTickets();
        }
    } catch (error) {
        console.error('Error loading support tickets:', error);
    }
}

// Display support tickets
function displaySupportTickets() {
    const ticketsTable = document.getElementById('supportTicketsTable');
    
    if (filteredTickets.length === 0) {
        ticketsTable.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-headset"></i>
                <h3>لا توجد تذاكر دعم</h3>
                <p>لم يتم تسجيل أي تذاكر دعم حتى الآن</p>
            </div>
        `;
        return;
    }
    
    const tableHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>رقم التذكرة</th>
                    <th>الموضوع</th>
                    <th>العميل</th>
                    <th>الأولوية</th>
                    <th>الحالة</th>
                    <th>التاريخ</th>
                    <th>الإجراءات</th>
                </tr>
            </thead>
            <tbody>
                ${filteredTickets.map(ticket => `
                    <tr>
                        <td>#${ticket.id.substring(0, 8)}</td>
                        <td>${ticket.subject}</td>
                        <td>${ticket.userEmail || 'غير محدد'}</td>
                        <td>
                            <span class="ticket-priority ${getPriorityBadgeClass(ticket.priority)}">
                                ${getPriorityText(ticket.priority)}
                            </span>
                        </td>
                        <td>
                            <span class="ticket-status ${getTicketStatusClass(ticket.status)}">
                                ${getTicketStatusText(ticket.status)}
                            </span>
                        </td>
                        <td>${ticket.createdAt ? formatDateArabic(ticket.createdAt.toDate()) : 'غير محدد'}</td>
                        <td>
                            <button class="action-btn btn-view" onclick="viewTicketDetails('${ticket.id}')">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="action-btn btn-edit" onclick="replyToTicket('${ticket.id}')">
                                <i class="fas fa-reply"></i>
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    ticketsTable.innerHTML = tableHTML;
}

// Utility functions
function getStatusClass(status) {
    switch (status) {
        case 'pending': return 'status-pending';
        case 'approved': return 'status-approved';
        case 'rejected': return 'status-rejected';
        default: return 'status-pending';
    }
}

function getStatusText(status) {
    switch (status) {
        case 'pending': return 'قيد المراجعة';
        case 'approved': return 'مقبول';
        case 'rejected': return 'مرفوض';
        default: return 'قيد المراجعة';
    }
}

function getRoleText(role) {
    switch (role) {
        case 'customer': return 'عميل';
        case 'support': return 'دعم فني';
        case 'admin': return 'مدير';
        case 'super_admin': return 'مدير عام';
        default: return 'عميل';
    }
}

function getTicketStatusClass(status) {
    switch (status) {
        case 'open': return 'status-open';
        case 'in-progress': return 'status-in-progress';
        case 'resolved': return 'status-resolved';
        case 'closed': return 'status-closed';
        default: return 'status-open';
    }
}

function getTicketStatusText(status) {
    switch (status) {
        case 'open': return 'مفتوحة';
        case 'in-progress': return 'قيد المعالجة';
        case 'resolved': return 'تم الحل';
        case 'closed': return 'مغلقة';
        default: return 'مفتوحة';
    }
}

function getPriorityBadgeClass(priority) {
    switch (priority) {
        case 'high': return 'priority-high-badge';
        case 'medium': return 'priority-medium-badge';
        case 'low': return 'priority-low-badge';
        default: return 'priority-medium-badge';
    }
}

function getPriorityText(priority) {
    switch (priority) {
        case 'high': return 'عالية';
        case 'medium': return 'متوسطة';
        case 'low': return 'منخفضة';
        default: return 'متوسطة';
    }
}

// Handle logout
async function handleLogout() {
    if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
        try {
            await FirebaseUtils.signOut();
            showMessage('تم تسجيل الخروج بنجاح', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } catch (error) {
            console.error('Error signing out:', error);
            showMessage('حدث خطأ في تسجيل الخروج', 'error');
        }
    }
}

// Create modal element (reuse from main.js)
function createModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <!-- Content will be added dynamically -->
        </div>
    `;
    return modal;
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

// FAQ Management Functions
async function loadFAQs() {
    try {
        const result = await FirebaseUtils.getDocuments('faqs', 
            { field: 'createdAt', direction: 'desc' });
        
        if (result.success) {
            allFAQs = result.data;
            filteredFAQs = [...allFAQs];
            displayFAQs();
        }
    } catch (error) {
        console.error('Error loading FAQs:', error);
    }
}

function displayFAQs() {
    const faqManagement = document.getElementById('faqManagement');
    
    if (filteredFAQs.length === 0) {
        faqManagement.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-question-circle"></i>
                <h3>لا توجد أسئلة شائعة</h3>
                <p>لم يتم إضافة أي أسئلة شائعة حتى الآن</p>
            </div>
        `;
        return;
    }
    
    const tableHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>السؤال</th>
                    <th>الفئة</th>
                    <th>الحالة</th>
                    <th>تاريخ الإنشاء</th>
                    <th>الإجراءات</th>
                </tr>
            </thead>
            <tbody>
                ${filteredFAQs.map(faq => `
                    <tr>
                        <td style="max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                            ${faq.question}
                        </td>
                        <td>
                            <span class="category-badge ${getCategoryClass(faq.category)}">
                                ${getCategoryText(faq.category)}
                            </span>
                        </td>
                        <td>
                            <span class="status-badge ${faq.isActive ? 'status-active' : 'status-inactive'}">
                                ${faq.isActive ? 'نشط' : 'غير نشط'}
                            </span>
                        </td>
                        <td>${faq.createdAt ? formatDateArabic(faq.createdAt.toDate()) : 'غير محدد'}</td>
                        <td>
                            <button class="action-btn btn-view" onclick="viewFAQDetails('${faq.id}')">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="action-btn btn-edit" onclick="editFAQ('${faq.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn btn-delete" onclick="deleteFAQ('${faq.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    faqManagement.innerHTML = tableHTML;
}

function showAddFAQModal() {
    const modal = createModal();
    
    modal.querySelector('.modal-content').innerHTML = `
        <span class="close">&times;</span>
        <h2>إضافة سؤال شائع جديد</h2>
        
        <form id="addFAQForm">
            <div class="form-group">
                <label for="faqCategory">الفئة *</label>
                <select id="faqCategory" name="category" required>
                    <option value="">اختر الفئة</option>
                    <option value="technical">الأسئلة التقنية</option>
                    <option value="pricing">أسئلة الأسعار</option>
                    <option value="support">أسئلة الدعم الفني</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="faqQuestion">السؤال *</label>
                <input type="text" id="faqQuestion" name="question" required>
            </div>
            
            <div class="form-group">
                <label for="faqAnswer">الإجابة *</label>
                <textarea id="faqAnswer" name="answer" rows="6" required></textarea>
            </div>
            
            <div class="form-group">
                <label for="faqOrder">ترتيب العرض</label>
                <input type="number" id="faqOrder" name="order" value="1" min="1">
            </div>
            
            <div class="form-group">
                <label>
                    <input type="checkbox" id="faqActive" name="isActive" checked>
                    نشط (سيظهر في الموقع)
                </label>
            </div>
            
            <button type="submit" class="btn-submit">
                <span class="btn-text">إضافة السؤال</span>
                <span class="loading" style="display: none;"></span>
            </button>
        </form>
    `;

    document.body.appendChild(modal);
    modal.style.display = 'block';

    // Close modal functionality
    const closeBtn = modal.querySelector('.close');
    closeBtn.onclick = () => {
        document.body.removeChild(modal);
    };

    modal.onclick = (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    };

    // Handle form submission
    const addForm = document.getElementById('addFAQForm');
    addForm.onsubmit = async (e) => {
        e.preventDefault();
        await handleAddFAQ(addForm, modal);
    };
}

async function handleAddFAQ(form, modal) {
    const submitBtn = form.querySelector('.btn-submit');
    const btnText = submitBtn.querySelector('.btn-text');
    const loading = submitBtn.querySelector('.loading');
    
    // Show loading state
    btnText.style.display = 'none';
    loading.style.display = 'inline-block';
    submitBtn.disabled = true;
    
    const formData = new FormData(form);
    
    const faqData = {
        category: formData.get('category'),
        question: formData.get('question'),
        answer: formData.get('answer'),
        order: parseInt(formData.get('order')) || 1,
        isActive: formData.get('isActive') === 'on',
        createdBy: currentUser.uid
    };
    
    try {
        const result = await FirebaseUtils.addDocument('faqs', faqData);
        
        if (result.success) {
            showMessage('تم إضافة السؤال بنجاح!', 'success');
            document.body.removeChild(modal);
            await loadFAQs(); // Reload FAQs
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('Error adding FAQ:', error);
        showMessage('حدث خطأ في إضافة السؤال', 'error');
    } finally {
        // Reset button state
        btnText.style.display = 'inline';
        loading.style.display = 'none';
        submitBtn.disabled = false;
    }
}

function editFAQ(faqId) {
    const faq = allFAQs.find(f => f.id === faqId);
    if (!faq) return;
    
    const modal = createModal();
    
    modal.querySelector('.modal-content').innerHTML = `
        <span class="close">&times;</span>
        <h2>تعديل السؤال الشائع</h2>
        
        <form id="editFAQForm">
            <div class="form-group">
                <label for="editFaqCategory">الفئة *</label>
                <select id="editFaqCategory" name="category" required>
                    <option value="technical" ${faq.category === 'technical' ? 'selected' : ''}>الأسئلة التقنية</option>
                    <option value="pricing" ${faq.category === 'pricing' ? 'selected' : ''}>أسئلة الأسعار</option>
                    <option value="support" ${faq.category === 'support' ? 'selected' : ''}>أسئلة الدعم الفني</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="editFaqQuestion">السؤال *</label>
                <input type="text" id="editFaqQuestion" name="question" value="${faq.question}" required>
            </div>
            
            <div class="form-group">
                <label for="editFaqAnswer">الإجابة *</label>
                <textarea id="editFaqAnswer" name="answer" rows="6" required>${faq.answer}</textarea>
            </div>
            
            <div class="form-group">
                <label for="editFaqOrder">ترتيب العرض</label>
                <input type="number" id="editFaqOrder" name="order" value="${faq.order || 1}" min="1">
            </div>
            
            <div class="form-group">
                <label>
                    <input type="checkbox" id="editFaqActive" name="isActive" ${faq.isActive ? 'checked' : ''}>
                    نشط (سيظهر في الموقع)
                </label>
            </div>
            
            <button type="submit" class="btn-submit">
                <span class="btn-text">حفظ التغييرات</span>
                <span class="loading" style="display: none;"></span>
            </button>
        </form>
    `;

    document.body.appendChild(modal);
    modal.style.display = 'block';

    // Close modal functionality
    const closeBtn = modal.querySelector('.close');
    closeBtn.onclick = () => {
        document.body.removeChild(modal);
    };

    modal.onclick = (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    };

    // Handle form submission
    const editForm = document.getElementById('editFAQForm');
    editForm.onsubmit = async (e) => {
        e.preventDefault();
        await handleEditFAQ(faqId, editForm, modal);
    };
}

async function handleEditFAQ(faqId, form, modal) {
    const submitBtn = form.querySelector('.btn-submit');
    const btnText = submitBtn.querySelector('.btn-text');
    const loading = submitBtn.querySelector('.loading');
    
    // Show loading state
    btnText.style.display = 'none';
    loading.style.display = 'inline-block';
    submitBtn.disabled = true;
    
    const formData = new FormData(form);
    
    const updateData = {
        category: formData.get('category'),
        question: formData.get('question'),
        answer: formData.get('answer'),
        order: parseInt(formData.get('order')) || 1,
        isActive: formData.get('isActive') === 'on'
    };
    
    try {
        const result = await FirebaseUtils.updateDocument('faqs', faqId, updateData);
        
        if (result.success) {
            showMessage('تم تحديث السؤال بنجاح!', 'success');
            document.body.removeChild(modal);
            await loadFAQs(); // Reload FAQs
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('Error updating FAQ:', error);
        showMessage('حدث خطأ في تحديث السؤال', 'error');
    } finally {
        // Reset button state
        btnText.style.display = 'inline';
        loading.style.display = 'none';
        submitBtn.disabled = false;
    }
}

async function deleteFAQ(faqId) {
    if (!confirm('هل أنت متأكد من حذف هذا السؤال؟')) return;
    
    try {
        const result = await FirebaseUtils.deleteDocument('faqs', faqId);
        
        if (result.success) {
            showMessage('تم حذف السؤال بنجاح!', 'success');
            await loadFAQs(); // Reload FAQs
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('Error deleting FAQ:', error);
        showMessage('حدث خطأ في حذف السؤال', 'error');
    }
}

function viewFAQDetails(faqId) {
    const faq = allFAQs.find(f => f.id === faqId);
    if (!faq) return;
    
    const modal = createModal();
    
    modal.querySelector('.modal-content').innerHTML = `
        <span class="close">&times;</span>
        <h2>تفاصيل السؤال الشائع</h2>
        
        <div style="margin: 2rem 0;">
            <div style="margin-bottom: 1rem;">
                <strong>الفئة:</strong> 
                <span class="category-badge ${getCategoryClass(faq.category)}">
                    ${getCategoryText(faq.category)}
                </span>
            </div>
            
            <div style="margin-bottom: 1rem;">
                <strong>الحالة:</strong> 
                <span class="status-badge ${faq.isActive ? 'status-active' : 'status-inactive'}">
                    ${faq.isActive ? 'نشط' : 'غير نشط'}
                </span>
            </div>
            
            <div style="margin-bottom: 1rem;">
                <strong>ترتيب العرض:</strong> ${faq.order || 1}
            </div>
            
            <div style="margin-bottom: 2rem;">
                <strong>تاريخ الإنشاء:</strong> ${faq.createdAt ? formatDateArabic(faq.createdAt.toDate()) : 'غير محدد'}
            </div>
            
            <div style="margin-bottom: 2rem;">
                <h3 style="color: #2c5aa0; margin-bottom: 1rem;">السؤال:</h3>
                <p style="background: #f8f9fa; padding: 1rem; border-radius: 8px; line-height: 1.6;">
                    ${faq.question}
                </p>
            </div>
            
            <div>
                <h3 style="color: #2c5aa0; margin-bottom: 1rem;">الإجابة:</h3>
                <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; line-height: 1.8;">
                    ${faq.answer.replace(/\n/g, '<br>')}
                </div>
            </div>
        </div>
        
        <div style="text-align: center; margin-top: 2rem;">
            <button class="btn-primary" onclick="editFAQ('${faq.id}'); closeModal()">
                <i class="fas fa-edit"></i> تعديل السؤال
            </button>
        </div>
    `;

    document.body.appendChild(modal);
    modal.style.display = 'block';

    // Close modal functionality
    const closeBtn = modal.querySelector('.close');
    closeBtn.onclick = () => {
        document.body.removeChild(modal);
    };

    modal.onclick = (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    };
}

function filterFAQs() {
    const categoryFilter = document.getElementById('faqCategoryFilter').value;
    
    filteredFAQs = allFAQs.filter(faq => {
        return !categoryFilter || faq.category === categoryFilter;
    });
    
    displayFAQs();
}

function searchFAQs() {
    const searchTerm = document.getElementById('faqSearchInput').value.toLowerCase();
    
    filteredFAQs = allFAQs.filter(faq => {
        return faq.question.toLowerCase().includes(searchTerm) ||
               faq.answer.toLowerCase().includes(searchTerm);
    });
    
    displayFAQs();
}

function loadFAQCategories() {
    loadFAQs();
}

function getCategoryClass(category) {
    switch (category) {
        case 'technical': return 'category-technical';
        case 'pricing': return 'category-pricing';
        case 'support': return 'category-support';
        default: return 'category-default';
    }
}

function getCategoryText(category) {
    switch (category) {
        case 'technical': return 'الأسئلة التقنية';
        case 'pricing': return 'أسئلة الأسعار';
        case 'support': return 'أسئلة الدعم الفني';
        default: return 'غير محدد';
    }
}
