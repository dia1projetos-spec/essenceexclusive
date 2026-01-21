/* CARRINHO COMPLETO COM FORMULÁRIO DE CHECKOUT */

document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    initCartModal();
});

// Adicionar produto
window.addToCart = function(productId) {
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const product = products.find(p => p.id === productId);
    
    if (!product) {
        console.error('Produto não encontrado');
        return;
    }
    
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            category: product.category,
            quantity: 1
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    
    updateCartCount();
    showNotification(`${product.name} agregado al carrito!`, 'success');
    
    if (document.getElementById('cartModal')?.classList.contains('active')) {
        loadCartItems();
    }
};

// Atualizar contador
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    const cartCountEl = document.getElementById('cartCount');
    if (cartCountEl) {
        cartCountEl.textContent = totalItems;
        cartCountEl.classList.add('bounce');
        setTimeout(() => cartCountEl.classList.remove('bounce'), 300);
    }
}

// Inicializar modal
function initCartModal() {
    const cartBtn = document.getElementById('cartBtn');
    cartBtn?.addEventListener('click', openCart);
    
    const closeBtn = document.getElementById('closeCartBtn');
    closeBtn?.addEventListener('click', closeCart);
    
    const cartModal = document.getElementById('cartModal');
    cartModal?.addEventListener('click', (e) => {
        if (e.target === cartModal) {
            closeCart();
        }
    });
}

// Abrir carrinho
function openCart() {
    const cartModal = document.getElementById('cartModal');
    if (cartModal) {
        cartModal.classList.add('active');
        loadCartItems();
    }
}

// Fechar carrinho
function closeCart() {
    const cartModal = document.getElementById('cartModal');
    if (cartModal) {
        cartModal.classList.remove('active');
    }
}

// Carregar itens
function loadCartItems() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const cartItemsContainer = document.getElementById('cartItems');
    const emptyCartMsg = document.getElementById('emptyCartMessage');
    const checkoutSection = document.getElementById('checkoutSection');
    const cartTotal = document.getElementById('cartTotal');
    
    if (!cartItemsContainer) return;
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '';
        if (emptyCartMsg) emptyCartMsg.style.display = 'block';
        if (checkoutSection) checkoutSection.style.display = 'none';
        if (cartTotal) cartTotal.textContent = '$0';
        return;
    }
    
    if (emptyCartMsg) emptyCartMsg.style.display = 'none';
    if (checkoutSection) checkoutSection.style.display = 'block';
    
    // Renderizar itens
    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
                <h4 class="cart-item-name">${item.name}</h4>
                <p class="cart-item-category">${item.category}</p>
                <p class="cart-item-price">$${item.price.toLocaleString('es-AR')} c/u</p>
            </div>
            <div class="cart-item-quantity">
                <button class="qty-btn" onclick="updateQuantity('${item.id}', -1)">
                    <i class="fas fa-minus"></i>
                </button>
                <span class="qty-value">${item.quantity}</span>
                <button class="qty-btn" onclick="updateQuantity('${item.id}', 1)">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
            <div class="cart-item-subtotal">
                <strong>$${(item.price * item.quantity).toLocaleString('es-AR')}</strong>
            </div>
            <button class="cart-item-remove" onclick="removeFromCart('${item.id}')">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
    
    // Calcular total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (cartTotal) {
        cartTotal.textContent = '$' + total.toLocaleString('es-AR');
    }
}

// Atualizar quantidade
window.updateQuantity = function(productId, change) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const item = cart.find(i => i.id === productId);
    
    if (!item) return;
    
    item.quantity += change;
    
    if (item.quantity <= 0) {
        cart = cart.filter(i => i.id !== productId);
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    
    updateCartCount();
    loadCartItems();
};

// Remover item
window.removeFromCart = function(productId) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const item = cart.find(i => i.id === productId);
    
    cart = cart.filter(i => i.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    
    updateCartCount();
    loadCartItems();
    showNotification('Producto eliminado', 'info');
};

// Checkout WhatsApp
window.checkoutWhatsApp = function() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    if (cart.length === 0) {
        showNotification('El carrito está vacío', 'error');
        return;
    }
    
    // Pegar dados do formulário
    const name = document.getElementById('checkoutName').value.trim();
    const address = document.getElementById('checkoutAddress').value.trim();
    const city = document.getElementById('checkoutCity').value.trim();
    const state = document.getElementById('checkoutState').value.trim();
    const cep = document.getElementById('checkoutCEP').value.trim();
    const phone = document.getElementById('checkoutPhone').value.trim();
    
    // Validar
    if (!name || !address || !city || !state || !cep) {
        showNotification('Complete todos los campos obligatorios', 'error');
        return;
    }
    
    // Montar mensagem WhatsApp
    let message = '🛍️ *NUEVO PEDIDO - Essence Exclusive*\n\n';
    
    message += '👤 *DATOS DEL CLIENTE:*\n';
    message += `Nombre: ${name}\n`;
    message += `Dirección: ${address}\n`;
    message += `Ciudad: ${city}\n`;
    message += `Estado: ${state}\n`;
    message += `CEP: ${cep}\n`;
    if (phone) message += `Teléfono: ${phone}\n`;
    message += '\n';
    
    message += '📦 *PRODUCTOS:*\n\n';
    
    cart.forEach((item, index) => {
        message += `${index + 1}. *${item.name}*\n`;
        message += `   Cantidad: ${item.quantity}\n`;
        message += `   Precio unitario: $${item.price.toLocaleString('es-AR')}\n`;
        message += `   Subtotal: $${(item.price * item.quantity).toLocaleString('es-AR')}\n\n`;
    });
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    message += `💰 *TOTAL: $${total.toLocaleString('es-AR')}*\n\n`;
    message += '¡Gracias por tu compra! 🎁';
    
    // Encodar mensagem
    const encodedMessage = encodeURIComponent(message);
    
    // Número WhatsApp (CORRIGIDO)
    const whatsappNumber = '5513981763452';
    
    // Abrir WhatsApp
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    window.open(whatsappURL, '_blank');
    
    showNotification('Redirigiendo a WhatsApp...', 'success');
    
    // Opcional: Limpar carrinho após enviar
    // localStorage.setItem('cart', '[]');
    // updateCartCount();
    // loadCartItems();
};

// Notificação
function showNotification(msg, type = 'success') {
    const colors = {
        success: '#4CAF50',
        error: '#f44336',
        info: '#2196F3'
    };
    
    const icons = {
        success: 'check-circle',
        error: 'times-circle',
        info: 'info-circle'
    };
    
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${colors[type] || colors.info};
        color: white;
        padding: 1rem 2rem;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        z-index: 999999;
        animation: slideIn 0.3s ease;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 500;
    `;
    notification.innerHTML = `
        <i class="fas fa-${icons[type] || icons.info}"></i>
        <span>${msg}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

console.log('✅ Cart complete loaded');
