/* ========================================
   PRODUCT PAGE JAVASCRIPT
   ======================================== */

// Product data
const productData = {
    id: 999, // ID especial para Khamrah
    name: 'Khamrah Body Mist',
    price: 145000,
    image: 'assets/khamrah-campaign.jpg',
    category: 'masculino',
    description: 'Olor a Poder. Firma de Respeto.',
    featured: true,
    rating: 5
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initQuantityControls();
    initAddToCart();
    updateCartUI(); // Atualiza UI do carrinho
});

// === QUANTITY CONTROLS ===
function initQuantityControls() {
    const decreaseBtn = document.getElementById('decreaseQty');
    const increaseBtn = document.getElementById('increaseQty');
    const quantityInput = document.getElementById('productQuantity');
    
    if (!quantityInput) return;
    
    decreaseBtn?.addEventListener('click', () => {
        let currentValue = parseInt(quantityInput.value);
        if (currentValue > 1) {
            quantityInput.value = currentValue - 1;
        }
    });
    
    increaseBtn?.addEventListener('click', () => {
        let currentValue = parseInt(quantityInput.value);
        if (currentValue < 10) {
            quantityInput.value = currentValue + 1;
        }
    });
}

// === ADD TO CART ===
function initAddToCart() {
    const addToCartBtn = document.getElementById('addToCartBtn');
    const quantityInput = document.getElementById('productQuantity');
    
    addToCartBtn?.addEventListener('click', () => {
        const quantity = parseInt(quantityInput.value) || 1;
        
        // Adiciona ao carrinho
        addProductToCart(productData, quantity);
        
        // Animação do botão
        addToCartBtn.innerHTML = '<i class="fas fa-check"></i> AGREGADO!';
        addToCartBtn.style.background = '#27ae60';
        
        setTimeout(() => {
            addToCartBtn.innerHTML = '<i class="fas fa-shopping-cart"></i> AGREGAR AL CARRITO';
            addToCartBtn.style.background = '';
        }, 2000);
        
        // Reset quantidade
        setTimeout(() => {
            quantityInput.value = 1;
        }, 2000);
    });
}

// === ADD PRODUCT TO CART ===
function addProductToCart(product, quantity) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            ...product,
            quantity: quantity
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
    
    showProductNotification(`${quantity}x ${product.name} agregado al carrito!`);
}

// === NOTIFICATION ===
function showProductNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: linear-gradient(135deg, #4ecca3 0%, #93e4c1 100%);
        color: white;
        padding: 1.2rem 2rem;
        border-radius: 15px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        z-index: 99999;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 1rem;
        animation: slideInRight 0.4s ease;
    `;
    
    notification.innerHTML = `
        <i class="fas fa-check-circle" style="font-size: 1.5rem;"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

console.log('✅ Product page loaded');
