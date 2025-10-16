// Main JavaScript file
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }

    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
            
            // Close mobile menu if open
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
            }
        });
    });

    // Load systems data
    loadSystems();
    
    // Load FAQ data if on FAQ section
    if (window.location.hash === '#faq' || document.getElementById('faq')) {
        loadFAQFromFirebase();
    }
});

// Systems data (يمكن نقلها لاحقاً إلى Firebase)
const systemsData = [
    {
        id: 1,
        name: "AS3G SYSTEM - الباقة التجريبية",
        description: "باقة مثالية للمحلات الصغيرة والمشاريع الناشئة مع المميزات الأساسية",
        price: "299 جنيه/شهر",
        originalPrice: "399 جنيه/شهر",
        image: "fas fa-seedling",
        features: [
            "واجهة مستخدم عربية بالكامل مع دعم RTL",
            "إدارة المبيعات والفواتير الإلكترونية",
            "تتبع المخزون مع تنبيهات النفاد الذكية",
            "طباعة الفواتير والإيصالات الحرارية",
            "تقارير المبيعات اليومية والشهرية التفاعلية",
            "إدارة العملاء وبيانات الاتصال المتقدمة",
            "نظام الخصومات والعروض الذكي",
            "نسخ احتياطي تلقائي للبيانات السحابي",
            "دعم QR Code والباركود المتقدم",
            "تكامل مع أنظمة الدفع الإلكتروني",
            "إدارة المرتجعات والاستبدالات",
            "تقارير الضرائب والزكاة التلقائية",
            "دعم فني عبر الهاتف والواتساب",
            "تدريب مجاني شامل للموظفين",
            "تحديثات مجانية لمدة عام كامل"
        ],
        gallery: [
            "images/as3g-basic-1.jpg",
            "images/as3g-basic-2.jpg",
            "images/as3g-basic-3.jpg"
        ],
        videos: [
            "videos/as3g-basic-demo.mp4",
            "videos/as3g-training.mp4"
        ]
    },
    {
        id: 2,
        name: "AS3G SYSTEM - الباقة الأساسية",
        description: "نظام AS3G الأساسي المصمم للمحلات المتوسطة مع واجهة سهلة الاستخدام ومميزات شاملة",
        price: "750 جنيه/شهر",
        originalPrice: "950 جنيه/شهر",
        image: "fas fa-cash-register",
        features: [
            "جميع مميزات الباقة الأساسية",
            "إدارة متعددة الفروع من مكان واحد",
            "تطبيق موبايل متقدم للأندرويد والآيفون",
            "لوحات معلومات تفاعلية مع الذكاء الاصطناعي",
            "تحليلات متقدمة للمبيعات والأرباح",
            "إدارة الموردين وأوامر الشراء الذكية",
            "نظام إدارة الموظفين والمرتبات المتكامل",
            "تكامل مع جميع أنظمة الدفع الإلكتروني",
            "إدارة برامج الولاء ونقاط العملاء المتقدمة",
            "نظام CRM أساسي لإدارة العملاء",
            "تصدير البيانات لجميع التنسيقات",
            "API متقدم للتكامل مع الأنظمة الخارجية",
            "تقارير مخصصة حسب الطلب",
            "نظام الإشعارات الذكية والتنبيهات",
            "دعم التجارة الإلكترونية والمتاجر الرقمية",
            "تحليل سلوك العملاء الأساسي",
            "دعم فني متقدم 24/7 مع أولوية",
            "تحديثات مجانية مدى الحياة"
        ],
        gallery: [
            "images/as3g-advanced-1.jpg",
            "images/as3g-advanced-2.jpg",
            "images/as3g-advanced-3.jpg",
            "images/as3g-mobile-app.jpg"
        ],
        videos: [
            "videos/as3g-advanced-demo.mp4",
            "videos/as3g-mobile-app.mp4",
            "videos/as3g-multi-branch.mp4"
        ]
    },
    {
        id: 3,
        name: "AS3G SYSTEM - الباقة المتقدمة",
        description: "نظام AS3G المتقدم للمؤسسات الكبيرة مع إدارة متعددة الفروع وتحليلات متقدمة",
        price: "1500 جنيه/شهر",
        originalPrice: "2000 جنيه/شهر",
        image: "fas fa-desktop",
        features: [
            "جميع مميزات الباقة المتقدمة",
            "تخصيص كامل للواجهات والتقارير والعمليات",
            "ذكاء اصطناعي متقدم مع التعلم الآلي",
            "توقعات المبيعات والطلب بدقة عالية",
            "تحليل المنافسين والسوق الذكي",
            "تكامل مع جميع أنظمة المحاسبة العالمية",
            "إدارة سلسلة التوريد الذكية والمؤتمتة",
            "نظام CRM احترافي مع أتمتة التسويق",
            "تحليل سلوك العملاء والتوصيات الذكية",
            "لوحات معلومات تفاعلية ثلاثية الأبعاد",
            "تقارير مخصصة مع الذكاء الاصطناعي",
            "نظام الموافقات والصلاحيات المتدرج المتقدم",
            "تشفير عسكري وأمان متقدم",
            "نظام إدارة المخاطر والتنبؤ بالأزمات",
            "تحليلات الأداء المالي المتقدمة",
            "تكامل مع منصات التواصل الاجتماعي",
            "نظام إدارة الجودة والمعايير الدولية",
            "تحليل البيانات الضخمة والتنبؤات",
            "مدير حساب مخصص ودعم فوري VIP",
            "تدريب شامل وورش عمل دورية متخصصة",
            "استشارات تطوير الأعمال والتحول الرقمي",
            "دعم التوسع الدولي وإدارة العملات",
            "ضمان وقت التشغيل 99.9% مع SLA"
        ],
        gallery: [
            "images/as3g-pro-1.jpg",
            "images/as3g-pro-2.jpg",
            "images/as3g-pro-3.jpg",
            "images/as3g-ai-analytics.jpg",
            "images/as3g-dashboard.jpg"
        ],
        videos: [
            "videos/as3g-advanced-demo.mp4",
            "videos/as3g-ai-features.mp4",
            "videos/as3g-crm-integration.mp4"
        ]
    },
    {
        id: 4,
        name: "AS3G SYSTEM - الباقة الاحترافية",
        description: "الحل الأمثل للشركات الكبيرة والمؤسسات مع تخصيص كامل وذكاء اصطناعي متقدم",
        price: "3000 جنيه/شهر",
        originalPrice: "4000 جنيه/شهر",
        image: "fas fa-crown",
        features: [
            "جميع مميزات الباقة المتقدمة",
            "تخصيص كامل للواجهات والتقارير والعمليات",
            "ذكاء اصطناعي متقدم مع التعلم الآلي",
            "توقعات المبيعات والطلب بدقة عالية",
            "تحليل المنافسين والسوق الذكي",
            "تكامل مع جميع أنظمة المحاسبة العالمية",
            "إدارة سلسلة التوريد الذكية والمؤتمتة",
            "نظام CRM احترافي مع أتمتة التسويق",
            "تحليل سلوك العملاء والتوصيات الذكية",
            "لوحات معلومات تفاعلية ثلاثية الأبعاد",
            "تقارير مخصصة مع الذكاء الاصطناعي",
            "نظام الموافقات والصلاحيات المتدرج المتقدم",
            "تشفير عسكري وأمان متقدم",
            "نظام إدارة المخاطر والتنبؤ بالأزمات",
            "تحليلات الأداء المالي المتقدمة",
            "تكامل مع منصات التواصل الاجتماعي",
            "نظام إدارة الجودة والمعايير الدولية",
            "تحليل البيانات الضخمة والتنبؤات",
            "مدير حساب مخصص ودعم فوري VIP",
            "تدريب شامل وورش عمل دورية متخصصة",
            "استشارات تطوير الأعمال والتحول الرقمي",
            "دعم التوسع الدولي وإدارة العملات",
            "ضمان وقت التشغيل 99.9% مع SLA"
        ],
        gallery: [
            "images/as3g-pro-1.jpg",
            "images/as3g-pro-2.jpg",
            "images/as3g-pro-3.jpg",
            "images/as3g-ai-analytics.jpg",
            "images/as3g-dashboard.jpg",
            "images/as3g-enterprise.jpg"
        ],
        videos: [
            "videos/as3g-pro-demo.mp4",
            "videos/as3g-ai-features.mp4",
            "videos/as3g-enterprise.mp4",
            "videos/as3g-advanced-reports.mp4"
        ]
    }
];

// Load and display systems
function loadSystems() {
    const systemsGrid = document.getElementById('systemsGrid');
    if (!systemsGrid) return;

    systemsGrid.innerHTML = '';

    const systemsHTML = systemsData.map(system => `
        <div class="system-card" onclick="showSystemDetails(${system.id})">
            <div class="system-icon">
                <i class="${system.image}"></i>
            </div>
            <h3>${system.name}</h3>
            <p class="system-description">${system.description}</p>
            <div class="system-pricing">
                ${system.originalPrice ? `
                    <div class="original-price">${system.originalPrice}</div>
                    <div class="discount-badge">وفر ${Math.round(((parseFloat(system.originalPrice) - parseFloat(system.price)) / parseFloat(system.originalPrice)) * 100)}%</div>
                ` : ''}
                <div class="system-price">${system.price}</div>
            </div>
            <div class="system-features">
                ${system.features.slice(0, 3).map(feature => `<span class="feature-item">${feature}</span>`).join('')}
                ${system.features.length > 3 ? `<span class="more-features">+${system.features.length - 3} مميزات أخرى</span>` : ''}
            </div>
            <button class="btn-order" onclick="event.stopPropagation(); showOrderModal(${system.id})">
                اطلب الآن
            </button>
        </div>
    `).join('');

    systemsGrid.innerHTML = systemsHTML;
}

// Show system details modal
function showSystemDetails(system) {
    const modal = createModal();
    
    const galleryHTML = system.gallery.map(img => 
        `<img src="${img}" alt="${system.name}" style="width: 100%; margin-bottom: 1rem; border-radius: 8px;">`
    ).join('');

    const videosHTML = system.videos.map(video => 
        `<video controls style="width: 100%; margin-bottom: 1rem; border-radius: 8px;">
            <source src="${video}" type="video/mp4">
            متصفحك لا يدعم تشغيل الفيديو
        </video>`
    ).join('');

    const featuresHTML = system.features.map(feature => 
        `<li><i class="fas fa-check" style="color: #28a745; margin-left: 10px;"></i> ${feature}</li>`
    ).join('');

    modal.querySelector('.modal-content').innerHTML = `
        <span class="close">&times;</span>
        <h2>${system.name}</h2>
        <p style="font-size: 1.1rem; color: #666; margin-bottom: 2rem;">${system.description}</p>
        
        <h3>صور النظام</h3>
        <div style="margin-bottom: 2rem;">
            ${galleryHTML}
        </div>
        
        <h3>فيديوهات توضيحية</h3>
        <div style="margin-bottom: 2rem;">
            ${videosHTML}
        </div>
        
        <h3>المميزات</h3>
        <ul style="list-style: none; margin-bottom: 2rem;">
            ${featuresHTML}
        </ul>
        
        <div style="text-align: center; padding: 2rem; background: #f8f9fa; border-radius: 10px;">
            <h3 style="color: #2c5aa0; margin-bottom: 1rem;">السعر: ${system.price}</h3>
            <button class="btn-order" onclick="showOrderForm(${system.id})" style="width: auto; padding: 1rem 3rem;">
                اطلب الآن
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

// Show order form
function showOrderForm(systemId) {
    const system = systemsData.find(s => s.id === systemId);
    if (!system) return;

    const modal = createModal();
    
    modal.querySelector('.modal-content').innerHTML = `
        <span class="close">&times;</span>
        <h2>طلب اشتراك - ${system.name}</h2>
        <form id="orderForm">
            <div class="form-group">
                <label for="customerName">الاسم الكامل *</label>
                <input type="text" id="customerName" name="customerName" required>
            </div>
            
            <div class="form-group">
                <label for="businessName">اسم النشاط التجاري *</label>
                <input type="text" id="businessName" name="businessName" required>
            </div>
            
            <div class="form-group">
                <label for="phoneNumber">رقم الهاتف *</label>
                <input type="tel" id="phoneNumber" name="phoneNumber" required>
            </div>
            
            <div class="form-group">
                <label for="location">العنوان/المكان *</label>
                <textarea id="location" name="location" rows="3" required></textarea>
            </div>
            
            <div class="form-group">
                <label for="email">البريد الإلكتروني</label>
                <input type="email" id="email" name="email">
            </div>
            
            <div class="form-group">
                <label for="notes">ملاحظات إضافية</label>
                <textarea id="notes" name="notes" rows="3"></textarea>
            </div>
            
            <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                <h4>تفاصيل الطلب:</h4>
                <p><strong>النظام:</strong> ${system.name}</p>
                <p><strong>السعر:</strong> ${system.price}</p>
            </div>
            
            <button type="submit" class="btn-submit">
                <span class="btn-text">تأكيد الطلب</span>
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
    const orderForm = document.getElementById('orderForm');
    orderForm.onsubmit = async (e) => {
        e.preventDefault();
        await submitOrder(systemId, orderForm, modal);
    };
}

// Submit order to Firebase
async function submitOrder(systemId, form, modal) {
    const submitBtn = form.querySelector('.btn-submit');
    const btnText = submitBtn.querySelector('.btn-text');
    const loading = submitBtn.querySelector('.loading');
    
    // Show loading state
    btnText.style.display = 'none';
    loading.style.display = 'inline-block';
    submitBtn.disabled = true;

    const formData = new FormData(form);
    const system = systemsData.find(s => s.id === systemId);
    
    const orderData = {
        systemId: systemId,
        systemName: system.name,
        systemPrice: system.price,
        customerName: formData.get('customerName'),
        businessName: formData.get('businessName'),
        phoneNumber: formData.get('phoneNumber'),
        location: formData.get('location'),
        email: formData.get('email'),
        notes: formData.get('notes'),
        status: 'pending',
        userId: FirebaseUtils.getCurrentUser() ? FirebaseUtils.getCurrentUser().uid : null,
        orderDate: new Date().toISOString()
    };

    try {
        const result = await FirebaseUtils.addDocument('orders', orderData);
        
        if (result.success) {
            showMessage('تم إرسال طلبك بنجاح! سنقوم بالرد عليك قريباً. يمكنك متابعة حالة طلبك من صفحة حسابك.', 'success');
            document.body.removeChild(modal);
            
            // Show detailed success message
            setTimeout(() => {
                showOrderConfirmationModal(result.id, system.name);
            }, 1000);
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('Error submitting order:', error);
        showMessage('حدث خطأ في إرسال الطلب. يرجى المحاولة مرة أخرى.', 'error');
    } finally {
        // Reset button state
        btnText.style.display = 'inline';
        loading.style.display = 'none';
        submitBtn.disabled = false;
    }
}

// Create modal element
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

// Show message to user
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

// Utility function to format date in Arabic
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

// FAQ Toggle functionality
function toggleFAQ(element) {
    const faqItem = element.parentElement;
    const answer = faqItem.querySelector('.faq-answer');
    const icon = element.querySelector('i');
    
    // Close all other FAQ items
    document.querySelectorAll('.faq-item').forEach(item => {
        if (item !== faqItem) {
            const otherAnswer = item.querySelector('.faq-answer');
            const otherIcon = item.querySelector('.faq-question i');
            otherAnswer.style.maxHeight = '0';
            otherIcon.style.transform = 'rotate(0deg)';
        }
    });
    
    // Toggle current FAQ item
    if (answer.style.maxHeight === '0px' || !answer.style.maxHeight) {
        answer.style.maxHeight = answer.scrollHeight + 'px';
        icon.style.transform = 'rotate(180deg)';
    } else {
        answer.style.maxHeight = '0';
        icon.style.transform = 'rotate(0deg)';
    }
}

// Load FAQ from Firebase and update the page
async function loadFAQFromFirebase() {
    try {
        const result = await FirebaseUtils.getDocuments('faqs', 
            { field: 'order', direction: 'asc' });
        
        if (result.success && result.data.length > 0) {
            const faqs = result.data.filter(faq => faq.isActive);
            updateFAQSection(faqs);
        }
    } catch (error) {
        console.error('Error loading FAQs from Firebase:', error);
        // Keep the static FAQ if Firebase fails
    }
}

// Show order confirmation modal
function showOrderConfirmationModal(orderId, systemName) {
    const modal = createModal();
    
    modal.querySelector('.modal-content').innerHTML = `
        <span class="close">&times;</span>
        <div style="text-align: center; padding: 2rem;">
            <div style="font-size: 4rem; color: #28a745; margin-bottom: 1rem;">
                <i class="fas fa-check-circle"></i>
            </div>
            <h2 style="color: #28a745; margin-bottom: 1rem;">تم إرسال طلبك بنجاح!</h2>
            
            <div style="background: #f8f9fa; padding: 2rem; border-radius: 10px; margin: 2rem 0; text-align: right;">
                <h3 style="color: #2c5aa0; margin-bottom: 1rem;">تفاصيل الطلب:</h3>
                <div style="margin-bottom: 1rem;">
                    <strong>رقم الطلب:</strong> #${orderId.substring(0, 8)}
                </div>
                <div style="margin-bottom: 1rem;">
                    <strong>النظام المطلوب:</strong> ${systemName}
                </div>
                <div style="margin-bottom: 1rem;">
                    <strong>حالة الطلب:</strong> <span style="color: #ffc107;">قيد المراجعة</span>
                </div>
                <div>
                    <strong>تاريخ الطلب:</strong> ${new Date().toLocaleDateString('ar-EG')}
                </div>
            </div>
            
            <div style="background: #e3f2fd; padding: 1.5rem; border-radius: 10px; margin: 2rem 0;">
                <h4 style="color: #1565c0; margin-bottom: 1rem;">
                    <i class="fas fa-info-circle"></i> ماذا بعد؟
                </h4>
                <ul style="text-align: right; color: #666; line-height: 1.8;">
                    <li>سيقوم فريقنا بمراجعة طلبك خلال 24 ساعة</li>
                    <li>ستتلقى رسالة تأكيد على بريدك الإلكتروني</li>
                    <li>سيتواصل معك أحد ممثلي المبيعات لتحديد موعد العرض التوضيحي</li>
                    <li>يمكنك متابعة حالة طلبك من صفحة حسابك</li>
                </ul>
            </div>
            
            <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; margin-top: 2rem;">
                <a href="account.html" class="btn-primary">
                    <i class="fas fa-user"></i> عرض حسابي
                </a>
                <button class="btn-primary" onclick="closeModal()" style="background: #6c757d;">
                    <i class="fas fa-times"></i> إغلاق
                </button>
            </div>
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
    
    // Global close function
    window.closeModal = () => {
        document.body.removeChild(modal);
    };
}

// Update FAQ section with dynamic data
function updateFAQSection(faqs) {
    const faqCategories = {
        technical: { title: 'الأسئلة التقنية', icon: 'fas fa-cogs', items: [] },
        pricing: { title: 'أسئلة حول الأسعار', icon: 'fas fa-dollar-sign', items: [] },
        support: { title: 'أسئلة حول الدعم الفني', icon: 'fas fa-headset', items: [] }
    };
    
    // Group FAQs by category
    faqs.forEach(faq => {
        if (faqCategories[faq.category]) {
            faqCategories[faq.category].items.push(faq);
        }
    });
    
    // Find FAQ categories containers
    const technicalCategory = document.querySelector('.faq-category:nth-child(1)');
    const pricingCategory = document.querySelector('.faq-category:nth-child(2)');
    const supportCategory = document.querySelector('.faq-category:nth-child(3)');
    
    const categories = [
        { element: technicalCategory, data: faqCategories.technical },
        { element: pricingCategory, data: faqCategories.pricing },
        { element: supportCategory, data: faqCategories.support }
    ];
    
    categories.forEach(({ element, data }) => {
        if (element && data.items.length > 0) {
            // Update category title
            const titleElement = element.querySelector('h3');
            if (titleElement) {
                titleElement.innerHTML = `<i class="${data.icon}"></i> ${data.title}`;
            }
            
            // Clear existing items except title
            const existingItems = element.querySelectorAll('.faq-item');
            existingItems.forEach(item => item.remove());
            
            // Add new items
            data.items.forEach(faq => {
                const faqItemHTML = `
                    <div class="faq-item" style="margin-bottom: 1rem; border: 1px solid #e9ecef; border-radius: 10px; overflow: hidden;">
                        <div class="faq-question" onclick="toggleFAQ(this)" style="padding: 1.5rem; background: #f8f9fa; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-weight: 600; color: #333;">${faq.question}</span>
                            <i class="fas fa-chevron-down" style="transition: transform 0.3s;"></i>
                        </div>
                        <div class="faq-answer" style="padding: 0 1.5rem; max-height: 0; overflow: hidden; transition: all 0.3s;">
                            <div style="padding: 1.5rem 0; color: #666; line-height: 1.8;">
                                ${faq.answer.replace(/\n/g, '<br>')}
                            </div>
                        </div>
                    </div>
                `;
                element.insertAdjacentHTML('beforeend', faqItemHTML);
            });
        }
    });
}
