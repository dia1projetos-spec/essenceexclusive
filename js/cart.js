/* ========================================
   ESSENCE EXCLUSIVE - CART FUNCTIONALITY
   ======================================== */

// === CART SIDEBAR CONTROLS ===
document.addEventListener('DOMContentLoaded', () => {
    initCartSidebar();
    updateCartUI();
});

// === INITIALIZE CART SIDEBAR ===
function initCartSidebar() {
    const cartBtn = document.getElementById('cartBtn');
    const cartSidebar = document.getElementById('cartSidebar');
    const cartClose = document.getElementById('cartClose');
    const cartOverlay = document.getElementById('cartOverlay');
    
    // Open cart
    cartBtn?.addEventListener('click', () => {
        cartSidebar.classList.add('active');
        cartOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
    
    // Close cart
    const closeCart = () => {
        cartSidebar.classList.remove('active');
        cartOverlay.classList.remove('active');
        document.body.style.overflow = '';
    };
    
    cartClose?.addEventListener('click', closeCart);
    cartOverlay?.addEventListener('click', closeCart);
    
    // Close with ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && cartSidebar.classList.contains('active')) {
            closeCart();
        }
    });
}

// === CART STORAGE FUNCTIONS ===
const CartStorage = {
    get: () => {
        try {
            return JSON.parse(localStorage.getItem('cart')) || [];
        } catch (error) {
            console.error('Error loading cart:', error);
            return [];
        }
    },
    
    set: (cart) => {
        try {
            localStorage.setItem('cart', JSON.stringify(cart));
            return true;
        } catch (error) {
            console.error('Error saving cart:', error);
            return false;
        }
    },
    
    clear: () => {
        localStorage.removeItem('cart');
    }
};

// === CART CALCULATIONS ===
const CartCalculations = {
    getTotal: (cart) => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    },
    
    getTotalItems: (cart) => {
        return cart.reduce((total, item) => total + item.quantity, 0);
    },
    
    getSubtotal: (item) => {
        return item.price * item.quantity;
    }
};

// === CART OPERATIONS ===
const CartOperations = {
    add: (product) => {
        const cart = CartStorage.get();
        const existingItem = cart.find(item => item.id === product.id);
        
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
        
        CartStorage.set(cart);
        return cart;
    },
    
    remove: (productId) => {
        let cart = CartStorage.get();
        cart = cart.filter(item => item.id !== productId);
        CartStorage.set(cart);
        return cart;
    },
    
    updateQuantity: (productId, newQuantity) => {
        const cart = CartStorage.get();
        const item = cart.find(i => i.id === productId);
        
        if (item) {
            if (newQuantity <= 0) {
                return CartOperations.remove(productId);
            }
            item.quantity = newQuantity;
            CartStorage.set(cart);
        }
        
        return cart;
    },
    
    clear: () => {
        CartStorage.clear();
        return [];
    }
};

// === CART UI RENDERER ===
const CartUI = {
    renderItems: (cart) => {
        const container = document.getElementById('cartItems');
        
        if (!container) return;
        
        if (cart.length === 0) {
            container.innerHTML = `
                <div class="cart-empty">
                    <i class="fas fa-shopping-bag"></i>
                    <p>Tu carrito está vacío</p>
                    <p style="font-size: 0.9rem; color: #999; margin-top: 0.5rem;">
                        Agregá productos para empezar tu compra
                    </p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = cart.map(item => `
            <div class="cart-item" data-item-id="${item.id}">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}" loading="lazy">
                </div>
                <div class="cart-item-details">
                    <h4 class="cart-item-title">${item.name}</h4>
                    <p class="cart-item-category">${item.category}</p>
                    <p class="cart-item-price">$${item.price.toLocaleString('es-AR')}</p>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn decrease-btn" data-id="${item.id}" aria-label="Disminuir cantidad">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button class="quantity-btn increase-btn" data-id="${item.id}" aria-label="Aumentar cantidad">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <p class="cart-item-subtotal">
                        Subtotal: $${CartCalculations.getSubtotal(item).toLocaleString('es-AR')}
                    </p>
                </div>
                <button class="cart-item-remove" data-id="${item.id}" aria-label="Eliminar producto">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
        
        // Attach event listeners
        CartUI.attachEventListeners();
    },
    
    updateCount: (count) => {
        const countElement = document.getElementById('cartCount');
        if (countElement) {
            countElement.textContent = count;
            
            // Add animation
            countElement.style.transform = 'scale(1.3)';
            setTimeout(() => {
                countElement.style.transform = 'scale(1)';
            }, 200);
        }
    },
    
    updateTotal: (total) => {
        const totalElement = document.getElementById('totalPrice');
        if (totalElement) {
            totalElement.textContent = `$${total.toLocaleString('es-AR')}`;
        }
    },
    
    attachEventListeners: () => {
        // Decrease quantity buttons
        document.querySelectorAll('.decrease-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                const cart = CartStorage.get();
                const item = cart.find(i => i.id === id);
                if (item) {
                    CartOperations.updateQuantity(id, item.quantity - 1);
                    updateCartUI();
                }
            });
        });
        
        // Increase quantity buttons
        document.querySelectorAll('.increase-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                const cart = CartStorage.get();
                const item = cart.find(i => i.id === id);
                if (item) {
                    CartOperations.updateQuantity(id, item.quantity + 1);
                    updateCartUI();
                }
            });
        });
        
        // Remove buttons
        document.querySelectorAll('.cart-item-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                const itemElement = btn.closest('.cart-item');
                
                // Add fade out animation
                itemElement.style.opacity = '0';
                itemElement.style.transform = 'translateX(100%)';
                
                setTimeout(() => {
                    CartOperations.remove(id);
                    updateCartUI();
                    showCartNotification('Producto eliminado del carrito');
                }, 300);
            });
        });
    }
};

// === UPDATE ENTIRE CART UI ===
function updateCartUI() {
    const cart = CartStorage.get();
    const totalItems = CartCalculations.getTotalItems(cart);
    const total = CartCalculations.getTotal(cart);
    
    CartUI.renderItems(cart);
    CartUI.updateCount(totalItems);
    CartUI.updateTotal(total);
}

// === CART NOTIFICATIONS ===
function showCartNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `cart-notification cart-notification-${type}`;
    
    const icon = type === 'success' ? 'check-circle' : 'exclamation-circle';
    
    notification.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 120px;
        right: 20px;
        background: ${type === 'success' ? 'linear-gradient(135deg, #4ecca3 0%, #93e4c1 100%)' : '#e74c3c'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 50px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        z-index: 99999;
        display: flex;
        align-items: center;
        gap: 0.8rem;
        font-weight: 500;
        animation: slideInRight 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// === CHECKOUT HANDLER ===
document.getElementById('checkoutBtn')?.addEventListener('click', () => {
    const cart = CartStorage.get();
    
    if (cart.length === 0) {
        showCartNotification('Tu carrito está vacío', 'error');
        return;
    }
    
    const total = CartCalculations.getTotal(cart);
    const totalItems = CartCalculations.getTotalItems(cart);
    
    // Criar mensagem para WhatsApp
    let message = '🛍️ *NUEVO PEDIDO - ESSENCE EXCLUSIVE*\n\n';
    message += '*Productos:*\n';
    
    cart.forEach((item, index) => {
        message += `${index + 1}. ${item.name}\n`;
        message += `   • Cantidad: ${item.quantity}\n`;
        message += `   • Precio unitario: $${item.price.toLocaleString('es-AR')}\n`;
        message += `   • Subtotal: $${(item.price * item.quantity).toLocaleString('es-AR')}\n\n`;
    });
    
    message += `*Total de items:* ${totalItems}\n`;
    message += `*TOTAL: $${total.toLocaleString('es-AR')}*\n\n`;
    message += '¿Podés confirmar este pedido? 😊';
    
    // Codificar mensagem para URL
    const encodedMessage = encodeURIComponent(message);
    const whatsappNumber = '5513981763452'; // Seu número
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    
    // Abrir WhatsApp em nova aba
    window.open(whatsappURL, '_blank');
    
    // Mostrar notificação
    showCartNotification('Abrindo WhatsApp para finalizar tu pedido...');
    
    // Fechar carrinho
    setTimeout(() => {
        document.getElementById('cartSidebar').classList.remove('active');
        document.getElementById('cartOverlay').classList.remove('active');
        document.body.style.overflow = '';
    }, 1000);
});

// === QUICK ADD TO CART (Global function) ===
window.quickAddToCart = (productId) => {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const product = products.find(p => p.id === productId);
    
    if (product) {
        CartOperations.add(product);
        updateCartUI();
        showCartNotification(`${product.name} agregado al carrito`);
    }
};

// === CART ANALYTICS ===
const CartAnalytics = {
    track: (event, data) => {
        console.log(`[Cart Analytics] ${event}:`, data);
        // Here you can integrate with analytics services
        // Example: Google Analytics, Mixpanel, etc.
    },
    
    trackAddToCart: (product) => {
        CartAnalytics.track('add_to_cart', {
            product_id: product.id,
            product_name: product.name,
            price: product.price,
            category: product.category
        });
    },
    
    trackRemoveFromCart: (productId) => {
        CartAnalytics.track('remove_from_cart', {
            product_id: productId
        });
    },
    
    trackCheckout: (cart, total) => {
        CartAnalytics.track('begin_checkout', {
            items_count: cart.length,
            total_value: total,
            cart_items: cart.map(item => ({
                id: item.id,
                name: item.name,
                quantity: item.quantity
            }))
        });
    }
};

// === CART PERSISTENCE ===
// Save cart to localStorage on page unload
window.addEventListener('beforeunload', () => {
    const cart = CartStorage.get();
    if (cart.length > 0) {
        localStorage.setItem('cartLastUpdated', new Date().toISOString());
    }
});

// === CART RECOVERY ===
// Check for abandoned cart on page load
window.addEventListener('load', () => {
    const lastUpdated = localStorage.getItem('cartLastUpdated');
    const cart = CartStorage.get();
    
    if (cart.length > 0 && lastUpdated) {
        const daysSinceUpdate = (new Date() - new Date(lastUpdated)) / (1000 * 60 * 60 * 24);
        
        // If cart is older than 7 days, show recovery message
        if (daysSinceUpdate > 7) {
            console.log('Carrito antiguo detectado. Considera mostrar un mensaje de recuperación.');
        }
    }
});

// === EXPORT CART DATA ===
window.exportCartData = () => {
    const cart = CartStorage.get();
    const total = CartCalculations.getTotal(cart);
    
    const exportData = {
        items: cart,
        total: total,
        totalItems: CartCalculations.getTotalItems(cart),
        exportDate: new Date().toISOString()
    };
    
    return exportData;
};

// === PRINT CART ===
window.printCart = () => {
    const cart = CartStorage.get();
    if (cart.length === 0) {
        alert('El carrito está vacío');
        return;
    }
    
    const printWindow = window.open('', '_blank');
    const total = CartCalculations.getTotal(cart);
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Carrito - Essence Exclusive</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h1 { color: #4ecca3; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                th { background: #4ecca3; color: white; }
                .total { font-size: 1.5em; font-weight: bold; text-align: right; margin-top: 20px; }
            </style>
        </head>
        <body>
            <h1>Essence Exclusive - Carrito de Compras</h1>
            <table>
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th>Categoría</th>
                        <th>Precio</th>
                        <th>Cantidad</th>
                        <th>Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${cart.map(item => `
                        <tr>
                            <td>${item.name}</td>
                            <td>${item.category}</td>
                            <td>$${item.price.toLocaleString('es-AR')}</td>
                            <td>${item.quantity}</td>
                            <td>$${CartCalculations.getSubtotal(item).toLocaleString('es-AR')}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <div class="total">Total: $${total.toLocaleString('es-AR')}</div>
            <script>
                window.onload = () => window.print();
            </script>
        </body>
        </html>
    `);
    
    printWindow.document.close();
};

console.log('🛒 Cart system initialized');
