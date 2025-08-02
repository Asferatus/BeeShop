// ===== VARIABILE GLOBALE =====
// Coșul de cumpărături - stocat în localStorage pentru persistență
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// ===== FUNCȚII PENTRU COȘUL DE CUMPĂRĂTURI =====

/**
 * Funcția pentru adăugarea produselor în coș
 * @param {number} productId - ID-ul produsului
 * @param {string} productName - Numele produsului
 * @param {number} productPrice - Prețul produsului
 * @param {number} quantity - Cantitatea (implicit 1)
 */
function addToCart(productId, productName, productPrice, quantity = 1) {
    // Verificăm dacă produsul există deja în coș
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        // Dacă există, mărim cantitatea
        existingItem.quantity += quantity;
    } else {
        // Dacă nu există, adăugăm un nou produs
        cart.push({
            id: productId,
            name: productName,
            price: productPrice,
            quantity: quantity
        });
    }
    
    // Salvăm coșul în localStorage
    saveCart();
    
    // Actualizăm afișarea coșului
    updateCartDisplay();
    
    // Afișăm o notificare de succes
    showNotification(`${productName} a fost adăugat în coș!`, 'success');
}

/**
 * Funcția pentru eliminarea produselor din coș
 * @param {number} productId - ID-ul produsului de eliminat
 */
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartDisplay();
    showNotification('Produsul a fost eliminat din coș!', 'info');
}

/**
 * Funcția pentru actualizarea cantității unui produs din coș
 * @param {number} productId - ID-ul produsului
 * @param {number} newQuantity - Noua cantitate
 */
function updateCartQuantity(productId, newQuantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        if (newQuantity <= 0) {
            removeFromCart(productId);
        } else {
            item.quantity = newQuantity;
            saveCart();
            updateCartDisplay();
        }
    }
}

/**
 * Funcția pentru salvarea coșului în localStorage
 */
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

/**
 * Funcția pentru actualizarea afișării coșului
 */
function updateCartDisplay() {
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    // Actualizăm numărul de produse din coș
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Actualizăm lista de produse din coș
    if (cartItems) {
        cartItems.innerHTML = '';
        
        if (cart.length === 0) {
            cartItems.innerHTML = '<p class="empty-cart">Coșul tău este gol</p>';
        } else {
            cart.forEach(item => {
                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                cartItem.innerHTML = `
                    <div class="cart-item-image">
                        <img src="/static/images/placeholder.jpg" alt="${item.name}">
                    </div>
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">${item.price.toFixed(2)} MDL</div>
                        <div class="cart-item-quantity">
                            <button class="quantity-btn" onclick="updateCartQuantity(${item.id}, ${item.quantity - 1})">-</button>
                            <span>${item.quantity}</span>
                            <button class="quantity-btn" onclick="updateCartQuantity(${item.id}, ${item.quantity + 1})">+</button>
                        </div>
                    </div>
                    <button class="remove-item-btn" onclick="removeFromCart(${item.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                `;
                cartItems.appendChild(cartItem);
            });
        }
    }
    
    // Actualizăm totalul coșului
    if (cartTotal) {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotal.textContent = `${total.toFixed(2)} MDL`;
    }
}

/**
 * Funcția pentru toggle-ul coșului de cumpărături
 */
function toggleCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    const cartOverlay = document.getElementById('cartOverlay');
    
    cartSidebar.classList.toggle('open');
    cartOverlay.classList.toggle('open');
    
    // Închidem meniul mobil dacă este deschis
    const navMenu = document.querySelector('.nav-menu');
    const hamburger = document.querySelector('.hamburger');
    if (navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    }
}

/**
 * Funcția pentru finalizarea comenzii
 */
function checkout() {
    if (cart.length === 0) {
        showNotification('Coșul tău este gol!', 'warning');
        return;
    }
    
    // Aici ar trebui să redirecționăm către pagina de checkout
    // Pentru moment, vom afișa un formular modal
    showCheckoutModal();
}

/**
 * Funcția pentru afișarea modalului de checkout
 */
function showCheckoutModal() {
    const modal = document.createElement('div');
    modal.className = 'checkout-modal';
    modal.innerHTML = `
        <div class="checkout-content">
            <div class="checkout-header">
                <h3>Finalizează Comanda</h3>
                <button onclick="closeCheckoutModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <form id="checkoutForm" onsubmit="submitOrder(event)">
                <div class="form-group">
                    <label for="customerName">Numele tău *</label>
                    <input type="text" id="customerName" name="name" required>
                </div>
                <div class="form-group">
                    <label for="customerEmail">Email *</label>
                    <input type="email" id="customerEmail" name="email" required>
                </div>
                <div class="form-group">
                    <label for="customerPhone">Telefon *</label>
                    <input type="tel" id="customerPhone" name="phone" required>
                </div>
                <div class="form-group">
                    <label for="customerAddress">Adresa de livrare *</label>
                    <textarea id="customerAddress" name="address" rows="3" required></textarea>
                </div>
                <div class="order-summary">
                    <h4>Sumar Comandă</h4>
                    <div class="order-items">
                        ${cart.map(item => `
                            <div class="order-item">
                                <span>${item.name} x${item.quantity}</span>
                                <span>${(item.price * item.quantity).toFixed(2)} MDL</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="order-total">
                        <strong>Total: ${cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)} MDL</strong>
                    </div>
                </div>
                <button type="submit" class="submit-order-btn">
                    <i class="fas fa-check"></i>
                    Confirmă Comanda
                </button>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Adăugăm stiluri pentru modal
    const style = document.createElement('style');
    style.textContent = `
        .checkout-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            z-index: 3000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
        }
        .checkout-content {
            background: white;
            border-radius: 8px;
            max-width: 600px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
        }
        .checkout-header {
            padding: 1.5rem;
            border-bottom: 1px solid #f0f0f0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .checkout-header h3 {
            margin: 0;
            color: #2c3e50;
        }
        .checkout-header button {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: #6c757d;
        }
        .checkout-content form {
            padding: 1.5rem;
        }
        .form-group {
            margin-bottom: 1rem;
        }
        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 600;
            color: #2c3e50;
        }
        .form-group input,
        .form-group textarea {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 1rem;
        }
        .order-summary {
            margin: 1.5rem 0;
            padding: 1rem;
            background: #f8f9fa;
            border-radius: 4px;
        }
        .order-summary h4 {
            margin-bottom: 1rem;
            color: #2c3e50;
        }
        .order-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.5rem;
        }
        .order-total {
            border-top: 1px solid #ddd;
            padding-top: 1rem;
            margin-top: 1rem;
            text-align: right;
            font-size: 1.2rem;
        }
        .submit-order-btn {
            width: 100%;
            background: #28a745;
            color: white;
            border: none;
            padding: 1rem;
            border-radius: 4px;
            cursor: pointer;
            font-size: 1.1rem;
            font-weight: 600;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
        }
        .submit-order-btn:hover {
            background: #218838;
        }
    `;
    document.head.appendChild(style);
}

/**
 * Funcția pentru închiderea modalului de checkout
 */
function closeCheckoutModal() {
    const modal = document.querySelector('.checkout-modal');
    if (modal) {
        modal.remove();
    }
}

/**
 * Funcția pentru trimiterea comenzii
 * @param {Event} event - Event-ul formularului
 */
function submitOrder(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const orderData = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        address: formData.get('address'),
        items: cart,
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    };
    
    // Aici ar trebui să facem un request AJAX către server
    console.log('Comanda:', orderData);
    
    // Simulăm trimiterea comenzii
    showNotification('Comanda ta a fost plasată cu succes! Vom contacta în curând.', 'success');
    
    // Golim coșul
    cart = [];
    saveCart();
    updateCartDisplay();
    
    // Închidem modalul
    closeCheckoutModal();
    toggleCart();
}

// ===== FUNCȚII PENTRU NAVIGARE MOBILĂ =====

/**
 * Funcția pentru toggle-ul meniului mobil
 */
function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    const hamburger = document.querySelector('.hamburger');
    
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
}

// ===== FUNCȚII PENTRU NOTIFICĂRI =====

/**
 * Funcția pentru afișarea notificărilor
 * @param {string} message - Mesajul de afișat
 * @param {string} type - Tipul notificării (success, error, warning, info)
 */
function showNotification(message, type = 'info') {
    // Creăm elementul de notificare
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Adăugăm stiluri pentru notificare
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            z-index: 5000;
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem;
            min-width: 300px;
            animation: slideIn 0.3s ease-out;
        }
        .notification-success {
            border-left: 4px solid #28a745;
        }
        .notification-error {
            border-left: 4px solid #dc3545;
        }
        .notification-warning {
            border-left: 4px solid #ffc107;
        }
        .notification-info {
            border-left: 4px solid #17a2b8;
        }
        .notification-content {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            flex: 1;
        }
        .notification-content i {
            font-size: 1.2rem;
        }
        .notification-success .notification-content i {
            color: #28a745;
        }
        .notification-error .notification-content i {
            color: #dc3545;
        }
        .notification-warning .notification-content i {
            color: #ffc107;
        }
        .notification-info .notification-content i {
            color: #17a2b8;
        }
        .notification button {
            background: none;
            border: none;
            cursor: pointer;
            color: #6c757d;
            font-size: 1.1rem;
        }
        .notification button:hover {
            color: #dc3545;
        }
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Adăugăm notificarea la pagină
    document.body.appendChild(notification);
    
    // Eliminăm notificarea după 5 secunde
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

/**
 * Funcția pentru obținerea iconiței pentru tipul de notificare
 * @param {string} type - Tipul notificării
 * @returns {string} Numele iconiței
 */
function getNotificationIcon(type) {
    switch (type) {
        case 'success':
            return 'check-circle';
        case 'error':
            return 'exclamation-circle';
        case 'warning':
            return 'exclamation-triangle';
        case 'info':
        default:
            return 'info-circle';
    }
}

// ===== FUNCȚII PENTRU ANIMAȚII ȘI EFECTE =====

/**
 * Funcția pentru animarea elementelor la scroll
 */
function animateOnScroll() {
    const elements = document.querySelectorAll('.animate-on-scroll');
    
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < window.innerHeight - elementVisible) {
            element.classList.add('animate');
        }
    });
}

/**
 * Funcția pentru smooth scroll la elemente
 * @param {string} elementId - ID-ul elementului țintă
 */
function scrollToElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// ===== FUNCȚII PENTRU VALIDARE =====

/**
 * Funcția pentru validarea email-ului
 * @param {string} email - Email-ul de validat
 * @returns {boolean} True dacă email-ul este valid
 */
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Funcția pentru validarea numărului de telefon
 * @param {string} phone - Numărul de telefon de validat
 * @returns {boolean} True dacă numărul este valid
 */
function validatePhone(phone) {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
}

// ===== EVENT LISTENERS =====

// Inițializăm aplicația când DOM-ul este încărcat
document.addEventListener('DOMContentLoaded', function() {
    // Actualizăm afișarea coșului
    updateCartDisplay();
    
    // Adăugăm event listener pentru scroll
    window.addEventListener('scroll', animateOnScroll);
    
    // Adăugăm event listener pentru închiderea coșului la click pe overlay
    const cartOverlay = document.getElementById('cartOverlay');
    if (cartOverlay) {
        cartOverlay.addEventListener('click', toggleCart);
    }
    
    // Adăugăm event listener pentru închiderea meniului mobil la click pe link-uri
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            const navMenu = document.querySelector('.nav-menu');
            const hamburger = document.querySelector('.hamburger');
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            }
        });
    });
    
    // Adăugăm event listener pentru închiderea modalei la click în afara ei
    document.addEventListener('click', function(event) {
        const quickViewModal = document.getElementById('quickViewModal');
        if (quickViewModal && event.target === quickViewModal) {
            closeQuickView();
        }
    });
    
    // Inițializăm animațiile
    animateOnScroll();
});

// ===== FUNCȚII UTILITARE =====

/**
 * Funcția pentru formatarea prețurilor
 * @param {number} price - Prețul de formatat
 * @returns {string} Prețul formatat
 */
function formatPrice(price) {
    return price.toFixed(2) + ' MDL';
}

/**
 * Funcția pentru formatarea datelor
 * @param {Date} date - Data de formatat
 * @returns {string} Data formatată
 */
function formatDate(date) {
    return new Intl.DateTimeFormat('ro-RO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(date);
}

/**
 * Funcția pentru debounce
 * @param {Function} func - Funcția de debounce
 * @param {number} wait - Timpul de așteptare în ms
 * @returns {Function} Funcția debounced
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Exportăm funcțiile pentru a fi disponibile global
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateCartQuantity = updateCartQuantity;
window.toggleCart = toggleCart;
window.checkout = checkout;
window.toggleMobileMenu = toggleMobileMenu;
window.showNotification = showNotification;
window.scrollToElement = scrollToElement;
window.validateEmail = validateEmail;
window.validatePhone = validatePhone;
window.formatPrice = formatPrice;
window.formatDate = formatDate; 