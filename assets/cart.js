let cart = [];

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    updateCartCount();
    
    // Botão carrinho
    document.getElementById('cartBtn')?.addEventListener('click', openCart);
});

function loadCart() {
    cart = JSON.parse(localStorage.getItem('cart') || '[]');
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const el = document.getElementById('cartCount');
    if (el) el.textContent = count;
}

// ADICIONAR
window.addToCart = function(productId) {
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const product = products.find(p => p.id === productId);
    
    if (!product) {
        alert('Produto não encontrado');
        return;
    }
    
    const existing = cart.find(item => item.id === productId);
    
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }
    
    saveCart();
    updateCartCount();
    showNotif(`${product.name} agregado!`);
};

// ABRIR CARRINHO
function openCart() {
    renderCart();
    document.getElementById('cartModal').style.display = 'flex';
}

window.closeCart = function() {
    document.getElementById('cartModal').style.display = 'none';
};

// RENDERIZAR
function renderCart() {
    const container = document.getElementById('cartItems');
    const empty = document.getElementById('emptyCart');
    const checkout = document.getElementById('checkoutSection');
    const totalEl = document.getElementById('cartTotal');
    
    if (cart.length === 0) {
        container.innerHTML = '';
        empty.style.display = 'block';
        checkout.style.display = 'none';
        return;
    }
    
    empty.style.display = 'none';
    checkout.style.display = 'block';
    
    container.innerHTML = cart.map(item => `
        <div style="display:flex; align-items:center; gap:1rem; padding:1rem; border-bottom:1px solid #eee;">
            <img src="${item.image}" style="width:80px; height:80px; object-fit:cover; border-radius:8px;">
            <div style="flex:1;">
                <strong>${item.name}</strong>
                <p style="color:#999; font-size:0.9rem; margin:0.25rem 0;">$${item.price.toLocaleString('es-AR')} c/u</p>
            </div>
            <div style="display:flex; align-items:center; gap:0.5rem;">
                <button onclick="updateQty('${item.id}', -1)" style="width:30px; height:30px; border:1px solid #ddd; background:white; border-radius:5px; cursor:pointer;">-</button>
                <span style="min-width:30px; text-align:center; font-weight:600;">${item.quantity}</span>
                <button onclick="updateQty('${item.id}', 1)" style="width:30px; height:30px; border:1px solid #ddd; background:white; border-radius:5px; cursor:pointer;">+</button>
            </div>
            <div style="min-width:100px; text-align:right;">
                <strong>$${(item.price * item.quantity).toLocaleString('es-AR')}</strong>
            </div>
            <button onclick="removeItem('${item.id}')" style="width:35px; height:35px; border:none; background:#ff4444; color:white; border-radius:5px; cursor:pointer;">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    totalEl.textContent = '$' + total.toLocaleString('es-AR');
}

// ATUALIZAR QTD
window.updateQty = function(id, change) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    
    item.quantity += change;
    
    if (item.quantity <= 0) {
        cart = cart.filter(i => i.id !== id);
    }
    
    saveCart();
    updateCartCount();
    renderCart();
};

// REMOVER
window.removeItem = function(id) {
    cart = cart.filter(i => i.id !== id);
    saveCart();
    updateCartCount();
    renderCart();
    showNotif('Producto eliminado');
};

// FINALIZAR
window.finalizarPedido = function() {
    if (cart.length === 0) {
        alert('Carrito vacío');
        return;
    }
    
    const name = document.getElementById('userName').value.trim();
    const address = document.getElementById('userAddress').value.trim();
    const city = document.getElementById('userCity').value.trim();
    const state = document.getElementById('userState').value.trim();
    const cep = document.getElementById('userCEP').value.trim();
    const phone = document.getElementById('userPhone').value.trim();
    
    if (!name || !address || !city || !state || !cep) {
        alert('Complete los campos obligatorios');
        return;
    }
    
    let msg = '🛍️ *NUEVO PEDIDO - Essence Exclusive*\n\n';
    msg += '👤 *CLIENTE:*\n';
    msg += `Nombre: ${name}\n`;
    msg += `Dirección: ${address}\n`;
    msg += `Ciudad: ${city}\n`;
    msg += `Estado: ${state}\n`;
    msg += `CEP: ${cep}\n`;
    if (phone) msg += `Teléfono: ${phone}\n`;
    msg += '\n📦 *PRODUCTOS:*\n\n';
    
    cart.forEach((item, i) => {
        msg += `${i + 1}. *${item.name}*\n`;
        msg += `   Cant: ${item.quantity}\n`;
        msg += `   Precio: $${item.price.toLocaleString('es-AR')}\n`;
        msg += `   Subtotal: $${(item.price * item.quantity).toLocaleString('es-AR')}\n\n`;
    });
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    msg += `💰 *TOTAL: $${total.toLocaleString('es-AR')}*\n\n`;
    msg += '¡Gracias por tu compra! 🎁';
    
    const encoded = encodeURIComponent(msg);
    const url = `https://wa.me/5513981763452?text=${encoded}`;
    
    window.open(url, '_blank');
    showNotif('Redirigiendo a WhatsApp...');
};

function showNotif(msg) {
    const n = document.createElement('div');
    n.style.cssText = 'position:fixed; top:100px; right:20px; background:#4CAF50; color:white; padding:1rem 2rem; border-radius:10px; box-shadow:0 10px 30px rgba(0,0,0,0.3); z-index:999999; animation:slideIn 0.3s;';
    n.textContent = msg;
    document.body.appendChild(n);
    setTimeout(() => n.remove(), 2500);
}

const style = document.createElement('style');
style.textContent = '@keyframes slideIn{from{transform:translateX(400px);opacity:0}to{transform:translateX(0);opacity:1}}';
document.head.appendChild(style);

console.log('✅ Cart.js loaded');
