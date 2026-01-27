// ============================================
// ESSENCE EXCLUSIVE - MAIN JAVASCRIPT
// ============================================

// ============================================
// GLOBAL STATE
// ============================================

let cart = [];
let cartSubtotal = 0;
let shippingCost = 0;
let shippingData = null;

// Produtos disponíveis (expandir conforme necessário)
const PRODUCTS = {
    'Qaed Al Fursan': {
        price: 38000,
        weight: 350, // gramos
        category: 'Perfume',
        image: 'images/qaed-al-fursan.jpg'
    },
    'Rosa Damascena': {
        price: 42000,
        weight: 350,
        category: 'Perfume',
        image: null
    },
    'Oud Imperial': {
        price: 45000,
        weight: 350,
        category: 'Perfume',
        image: null
    },
    'Jasmine Noir': {
        price: 39000,
        weight: 350,
        category: 'Perfume',
        image: null
    },
    'Aqua Masculine': {
        price: 36000,
        weight: 350,
        category: 'Perfume',
        image: null
    },
    'Sándalo Mystic': {
        price: 41000,
        weight: 350,
        category: 'Perfume',
        image: null
    }
};

// ============================================
// PAGE LOADER
// ============================================

window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    setTimeout(() => {
        loader.classList.add('hidden');
    }, 1500);
});

// ============================================
// NAVIGATION
// ============================================

// Smooth scroll para links de navegação
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerHeight = document.querySelector('.header').offsetHeight;
            const targetPosition = target.offsetTop - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
            
            // Fecha o menu mobile se estiver aberto
            const navMenu = document.getElementById('navMenu');
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
            }
        }
    });
});

// Toggle do menu mobile
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

if (navToggle) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });
}

// Atualiza link ativo baseado na posição do scroll
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

function updateActiveLink() {
    const scrollY = window.pageYOffset;
    
    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

window.addEventListener('scroll', updateActiveLink);

// Header background ao fazer scroll
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.style.background = 'rgba(26, 26, 26, 1)';
        header.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.3)';
    } else {
        header.style.background = 'rgba(26, 26, 26, 0.95)';
        header.style.boxShadow = 'none';
    }
});

// ============================================
// CART FUNCTIONALITY
// ============================================

const cartBtn = document.getElementById('cartBtn');
const cartSidebar = document.getElementById('cartSidebar');
const cartClose = document.getElementById('cartClose');
const cartOverlay = document.getElementById('cartOverlay');
const cartItems = document.getElementById('cartItems');
const cartCount = document.querySelector('.cart-count');
const cartSubtotalElement = document.getElementById('cartSubtotal');
const cartTotalElement = document.getElementById('cartTotal');

// Abrir carrinho
function openCart() {
    cartSidebar.classList.add('active');
    cartOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Fechar carrinho
function closeCart() {
    cartSidebar.classList.remove('active');
    cartOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

// Event listeners
if (cartBtn) {
    cartBtn.addEventListener('click', openCart);
}

// Botão do carrinho na página do produto
const cartBtnMinimal = document.getElementById('cartBtnMinimal');
if (cartBtnMinimal) {
    cartBtnMinimal.addEventListener('click', openCart);
    // Sincronizar contador
    const cartCountMinimal = document.querySelector('.cart-count-minimal');
    if (cartCountMinimal) {
        const originalUpdateCart = updateCart;
        updateCart = function() {
            originalUpdateCart();
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCountMinimal.textContent = totalItems;
            if (totalItems > 0) {
                cartCountMinimal.style.display = 'flex';
            } else {
                cartCountMinimal.style.display = 'none';
            }
        };
    }
}

if (cartClose) {
    cartClose.addEventListener('click', closeCart);
}

if (cartOverlay) {
    cartOverlay.addEventListener('click', closeCart);
}

// Adicionar item ao carrinho
function addToCart(productName, price, weight = 350) {
    // Verifica se o produto já está no carrinho
    const existingItem = cart.find(item => item.name === productName);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        const productData = PRODUCTS[productName] || { weight: weight, category: 'Perfume' };
        cart.push({
            name: productName,
            price: price,
            quantity: 1,
            weight: productData.weight,
            category: productData.category
        });
    }
    
    updateCart();
    openCart();
    
    // Animação de sucesso
    showNotification(`${productName} agregado al carrito`);
}

// Remover item do carrinho
function removeFromCart(productName) {
    cart = cart.filter(item => item.name !== productName);
    
    // Se o carrinho ficar vazio, resetar o frete
    if (cart.length === 0) {
        shippingData = null;
        shippingCost = 0;
    }
    
    updateCart();
}

// Calcular peso total do carrinho
function getTotalWeight() {
    return cart.reduce((sum, item) => sum + (item.weight * item.quantity), 0);
}

// Atualizar UI do carrinho
function updateCart() {
    // Atualizar contador
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    if (totalItems > 0) {
        cartCount.style.display = 'flex';
    } else {
        cartCount.style.display = 'none';
    }
    
    // Atualizar subtotal
    cartSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartSubtotalElement.textContent = `$${cartSubtotal.toLocaleString('es-AR')}`;
    
    // Recalcular frete se já foi calculado
    if (shippingData && cart.length > 0) {
        const totalWeight = getTotalWeight();
        shippingCost = calculateShipping(
            totalWeight,
            shippingData.deliveryType,
            shippingData.province,
            cartSubtotal
        );
        updateShippingDisplay();
    }
    
    // Atualizar total
    const cartTotal = cartSubtotal + shippingCost;
    cartTotalElement.textContent = `$${cartTotal.toLocaleString('es-AR')}`;
    
    // Atualizar lista de itens
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="cart-empty">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                    <path d="M9 2L7.5 6M15 2L16.5 6M6 6h12M6 6l1.5 12h9L18 6M6 6H4M18 6h2"></path>
                </svg>
                <p>Tu carrito está vacío</p>
            </div>
        `;
        document.getElementById('cartShipping').style.display = 'none';
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">$${item.price.toLocaleString('es-AR')}</div>
                    <div class="cart-item-quantity">Cantidad: ${item.quantity}</div>
                </div>
                <button class="cart-item-remove" onclick="removeFromCart('${item.name}')">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
        `).join('');
        document.getElementById('cartShipping').style.display = 'block';
    }
}

// ============================================
// SHIPPING CALCULATOR
// ============================================

const shippingModal = document.getElementById('shippingModal');
const shippingModalClose = document.getElementById('shippingModalClose');
const btnCalculateShipping = document.getElementById('btnCalculateShipping');
const btnChangeShipping = document.getElementById('btnChangeShipping');
const shippingForm = document.getElementById('shippingForm');

// Abrir modal de envio
function openShippingModal() {
    shippingModal.classList.add('active');
}

// Fechar modal de envio
function closeShippingModal() {
    shippingModal.classList.remove('active');
}

if (btnCalculateShipping) {
    btnCalculateShipping.addEventListener('click', openShippingModal);
}

if (btnChangeShipping) {
    btnChangeShipping.addEventListener('click', openShippingModal);
}

if (shippingModalClose) {
    shippingModalClose.addEventListener('click', closeShippingModal);
}

// Fechar ao clicar fora
shippingModal.addEventListener('click', (e) => {
    if (e.target === shippingModal) {
        closeShippingModal();
    }
});

// Processar formulário de envio
if (shippingForm) {
    shippingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const province = document.getElementById('shippingProvince').value;
        const zipCode = document.getElementById('shippingZipCode').value;
        const city = document.getElementById('shippingCity').value;
        const deliveryType = document.getElementById('shippingType').value;
        
        if (!province || !zipCode || !city) {
            showNotification('Por favor, completá todos los campos obligatorios', 'error');
            return;
        }
        
        // Calcular peso total
        const totalWeight = getTotalWeight();
        
        // Calcular frete
        shippingCost = calculateShipping(totalWeight, deliveryType, province, cartSubtotal);
        
        // Salvar dados de envio
        shippingData = {
            province,
            provinceName: PROVINCE_CODES[province],
            zipCode,
            city,
            deliveryType,
            deliveryTypeName: DELIVERY_TYPES[deliveryType]
        };
        
        // Mostrar resultado
        document.getElementById('shippingPrice').textContent = `$${shippingCost.toLocaleString('es-AR')}`;
        document.getElementById('shippingResult').style.display = 'block';
        
        // Atualizar carrinho
        updateShippingDisplay();
        updateCart();
        
        // Fechar modal após 2 segundos
        setTimeout(() => {
            closeShippingModal();
            showNotification('Envío calculado correctamente');
        }, 2000);
    });
}

// Atualizar exibição do frete no carrinho
function updateShippingDisplay() {
    if (shippingData) {
        document.getElementById('btnCalculateShipping').style.display = 'none';
        document.getElementById('shippingDetails').style.display = 'flex';
        document.getElementById('cartShippingCost').textContent = `$${shippingCost.toLocaleString('es-AR')}`;
        document.getElementById('cartShippingTotal').style.display = 'flex';
        document.getElementById('cartShippingAmount').textContent = `$${shippingCost.toLocaleString('es-AR')}`;
    } else {
        document.getElementById('btnCalculateShipping').style.display = 'flex';
        document.getElementById('shippingDetails').style.display = 'none';
        document.getElementById('cartShippingTotal').style.display = 'none';
    }
}

// ============================================
// CHECKOUT
// ============================================

function checkout() {
    if (cart.length === 0) {
        showNotification("Tu carrito está vacío", "error");
        return;
    }
    
    if (!shippingData) {
        showNotification("Por favor, calculá el envío primero", "error");
        openShippingModal();
        return;
    }
    
    // Abrir formulário completo de checkout
    showCheckoutForm();
}

// FUNÇÃO ANTIGA - COMENTADA
/*
function checkoutOLD() {
    if (cart.length === 0) {
        showNotification('Tu carrito está vacío', 'error');
        return;
    }
    
    if (!shippingData) {
        showNotification('Por favor, calculá el envío primero', 'error');
        openShippingModal();
        return;
    }
    
    // Criar mensagem para WhatsApp
    let message = '🌸 *ESSENCE EXCLUSIVE* 🌸%0A';
    message += '--------------------------------%0A%0A';
    message += '📦 *PEDIDO NUEVO*%0A%0A';
    
    // Produtos
    message += '*Productos:*%0A';
    cart.forEach(item => {
        message += `• ${item.name}%0A`;
        message += `  Cantidad: ${item.quantity}%0A`;
        message += `  Precio unitario: $${item.price.toLocaleString('es-AR')}%0A`;
        message += `  Subtotal: $${(item.price * item.quantity).toLocaleString('es-AR')}%0A%0A`;
    });
    
    // Totais
    message += '--------------------------------%0A';
    message += `*Subtotal Productos:* $${cartSubtotal.toLocaleString('es-AR')}%0A`;
    
    // Dados de envio
    message += `%0A📍 *Datos de Envío:*%0A`;
    message += `• Provincia: ${shippingData.provinceName}%0A`;
    message += `• Ciudad: ${shippingData.city}%0A`;
    message += `• Código Postal: ${shippingData.zipCode}%0A`;
    message += `• Tipo de Entrega: ${shippingData.deliveryTypeName}%0A`;
    message += `• Costo de Envío: $${shippingCost.toLocaleString('es-AR')}%0A`;
    
    // Total final
    const total = cartSubtotal + shippingCost;
    message += `%0A*💰 TOTAL: $${total.toLocaleString('es-AR')}*`;
    
    // Número de WhatsApp
    const phoneNumber = '5513981763452';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    
    // Abrir WhatsApp
    window.open(whatsappUrl, '_blank');
    
    // Limpar carrinho após enviar
    setTimeout(() => {
        cart = [];
        shippingData = null;
        shippingCost = 0;
        updateCart();
        closeCart();
        showNotification('Pedido enviado! Te contactaremos pronto');
    }, 1000);
}
*/

// Sistema de notificações
function showNotification(message, type = 'success') {
    // Remove notificação existente se houver
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Cria nova notificação
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                ${type === 'success' 
                    ? '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>'
                    : '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>'
                }
            </svg>
            <span>${message}</span>
        </div>
    `;
    
    // Adiciona estilos inline
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#d4af37' : '#e74c3c'};
        color: ${type === 'success' ? '#1a1a1a' : '#fff'};
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Remove após 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Adiciona animações CSS para notificações
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-weight: 600;
    }
`;
document.head.appendChild(style);

// ============================================
// FORM HANDLING
// ============================================

const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;
        
        // Criar mensagem para WhatsApp
        const whatsappMessage = `Hola, soy ${name}%0A%0AEmail: ${email}%0A%0AMensaje: ${message}`;
        const phoneNumber = '5513981763452';
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${whatsappMessage}`;
        
        // Abrir WhatsApp
        window.open(whatsappUrl, '_blank');
        
        // Limpar formulário
        contactForm.reset();
        
        // Mostrar notificação
        showNotification('Mensaje enviado correctamente');
    });
}

// ============================================
// ANIMATIONS ON SCROLL
// ============================================

// Intersection Observer para animações
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 0.8s ease forwards';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observar elementos para animação
document.addEventListener('DOMContentLoaded', () => {
    const elementsToAnimate = document.querySelectorAll('.collection-card, .feature, .contact-method');
    elementsToAnimate.forEach(el => {
        el.style.opacity = '0';
        observer.observe(el);
    });
});

// ============================================
// PARALLAX EFFECT
// ============================================

window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    
    // Parallax no hero
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        heroTitle.style.transform = `translateY(${scrolled * 0.5}px)`;
        heroTitle.style.opacity = 1 - (scrolled / 600);
    }
    
    // Parallax nos accents do produto destacado
    const accents = document.querySelectorAll('.accent');
    accents.forEach((accent, index) => {
        const speed = (index + 1) * 0.1;
        accent.style.transform = `translate(${scrolled * speed}px, ${scrolled * speed * 0.5}px)`;
    });
});

// ============================================
// SEARCH FUNCTIONALITY
// ============================================

const searchBtn = document.getElementById('searchBtn');

if (searchBtn) {
    searchBtn.addEventListener('click', () => {
        showNotification('Función de búsqueda próximamente', 'error');
    });
}

// ============================================
// PRODUCT HOVER EFFECTS
// ============================================

document.querySelectorAll('.collection-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// ============================================
// CURSOR EFFECT (Opcional - Efeito Premium)
// ============================================

let cursorDot, cursorOutline;

function createCustomCursor() {
    // Criar ponto do cursor
    cursorDot = document.createElement('div');
    cursorDot.style.cssText = `
        width: 8px;
        height: 8px;
        background: #d4af37;
        border-radius: 50%;
        position: fixed;
        pointer-events: none;
        z-index: 10001;
        transform: translate(-50%, -50%);
        transition: transform 0.1s ease;
    `;
    
    // Criar outline do cursor
    cursorOutline = document.createElement('div');
    cursorOutline.style.cssText = `
        width: 30px;
        height: 30px;
        border: 2px solid #d4af37;
        border-radius: 50%;
        position: fixed;
        pointer-events: none;
        z-index: 10000;
        transform: translate(-50%, -50%);
        transition: width 0.3s ease, height 0.3s ease;
    `;
    
    document.body.appendChild(cursorDot);
    document.body.appendChild(cursorOutline);
    
    // Atualizar posição do cursor
    document.addEventListener('mousemove', (e) => {
        cursorDot.style.left = e.clientX + 'px';
        cursorDot.style.top = e.clientY + 'px';
        
        setTimeout(() => {
            cursorOutline.style.left = e.clientX + 'px';
            cursorOutline.style.top = e.clientY + 'px';
        }, 50);
    });
    
    // Efeito hover em elementos clicáveis
    document.querySelectorAll('a, button').forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursorOutline.style.width = '50px';
            cursorOutline.style.height = '50px';
            cursorDot.style.transform = 'translate(-50%, -50%) scale(1.5)';
        });
        
        el.addEventListener('mouseleave', () => {
            cursorOutline.style.width = '30px';
            cursorOutline.style.height = '30px';
            cursorDot.style.transform = 'translate(-50%, -50%) scale(1)';
        });
    });
}

// Ativar cursor customizado apenas em desktop
if (window.innerWidth > 768) {
    createCustomCursor();
}

// ============================================
// PERFORMANCE OPTIMIZATION
// ============================================

// Lazy loading para imagens
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            }
        });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Formatar preço em peso argentino
function formatPrice(price) {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0
    }).format(price);
}

// Debounce function para otimizar eventos
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

// Aplicar debounce ao scroll
window.addEventListener('scroll', debounce(() => {
    updateActiveLink();
}, 10));

// ============================================
// CONSOLE MESSAGE
// ============================================

console.log('%c🌸 Essence Exclusive 🌸', 'font-size: 20px; color: #d4af37; font-weight: bold;');
console.log('%cSitio web desarrollado con excelencia y sofisticación', 'font-size: 12px; color: #666;');
console.log('%c© 2026 - Todos los derechos reservados', 'font-size: 10px; color: #999;');

// ============================================
// INIT
// ============================================

// Inicializar carrinho ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    updateCart();
});
