// ============================================
// CHECKOUT COMPLETO - FORMULÁRIO DE DADOS
// ============================================

// Mostrar formulário de checkout
window.showCheckoutForm = function() {
    const modal = document.createElement('div');
    modal.className = 'checkout-modal active';
    modal.id = 'checkoutModal';
    
    modal.innerHTML = `
        <div class="checkout-modal-content">
            <div class="checkout-modal-header">
                <h3>📋 Completá tus Datos</h3>
                <button class="checkout-modal-close" onclick="closeCheckoutForm()">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            <form class="checkout-form" id="checkoutFormFinal" onsubmit="submitCheckout(event)">
                <p class="checkout-intro">Por favor, completá tus datos para finalizar la compra:</p>
                
                <div class="form-group">
                    <label for="customerName" class="form-label-checkout">Nombre Completo *</label>
                    <input type="text" id="customerName" required class="form-input-checkout" placeholder="Ej: Juan Pérez">
                </div>
                
                <div class="form-group">
                    <label for="customerPhone" class="form-label-checkout">Teléfono de Contacto *</label>
                    <input type="tel" id="customerPhone" required class="form-input-checkout" placeholder="Ej: +54 9 351 123-4567">
                </div>
                
                <div class="form-group">
                    <label for="customerStreet" class="form-label-checkout">Nombre de la Calle *</label>
                    <input type="text" id="customerStreet" required class="form-input-checkout" placeholder="Ej: Av. Colón">
                </div>
                
                <div class="form-row-checkout">
                    <div class="form-group">
                        <label for="customerNumber" class="form-label-checkout">Número *</label>
                        <input type="text" id="customerNumber" required class="form-input-checkout" placeholder="Ej: 1234">
                    </div>
                    <div class="form-group">
                        <label for="customerNeighborhood" class="form-label-checkout">Barrio *</label>
                        <input type="text" id="customerNeighborhood" required class="form-input-checkout" placeholder="Ej: Centro">
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="customerZip" class="form-label-checkout">Código Postal *</label>
                    <input type="text" id="customerZip" required class="form-input-checkout" placeholder="Ej: 5000">
                </div>
                
                <div class="checkout-summary">
                    <h4>📦 Resumen de tu Pedido:</h4>
                    <div class="summary-items" id="checkoutSummaryItems"></div>
                    <div class="summary-totals">
                        <div class="summary-line">
                            <span>Subtotal Productos:</span>
                            <span>$${cartSubtotal.toLocaleString('es-AR')}</span>
                        </div>
                        <div class="summary-line">
                            <span>Envío:</span>
                            <span>$${shippingCost.toLocaleString('es-AR')}</span>
                        </div>
                        <div class="summary-total">
                            <span>TOTAL:</span>
                            <span>$${(cartSubtotal + shippingCost).toLocaleString('es-AR')}</span>
                        </div>
                    </div>
                </div>
                
                <button type="submit" class="btn btn-primary btn-block">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    Enviar Pedido por WhatsApp
                </button>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Preencher resumo dos itens
    const summaryItems = document.getElementById('checkoutSummaryItems');
    summaryItems.innerHTML = cart.map(item => `
        <div class="summary-item">
            <span>${item.name} x${item.quantity}</span>
            <span>$${(item.price * item.quantity).toLocaleString('es-AR')}</span>
        </div>
    `).join('');
};

// Fechar formulário de checkout
window.closeCheckoutForm = function() {
    const modal = document.getElementById('checkoutModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
};

// Submeter checkout
window.submitCheckout = function(event) {
    event.preventDefault();
    
    // Pegar dados do formulário
    const customerData = {
        name: document.getElementById('customerName').value,
        phone: document.getElementById('customerPhone').value,
        street: document.getElementById('customerStreet').value,
        number: document.getElementById('customerNumber').value,
        neighborhood: document.getElementById('customerNeighborhood').value,
        zip: document.getElementById('customerZip').value
    };
    
    // Criar mensagem para WhatsApp
    let message = '🌸 *ESSENCE EXCLUSIVE* 🌸%0A';
    message += '━━━━━━━━━━━━━━━━━━━━━━%0A%0A';
    message += '📦 *NUEVO PEDIDO*%0A%0A';
    
    // Dados do cliente
    message += '👤 *DATOS DEL CLIENTE:*%0A';
    message += `▫️ Nombre: ${customerData.name}%0A`;
    message += `▫️ Teléfono: ${customerData.phone}%0A`;
    message += `▫️ Dirección: ${customerData.street} ${customerData.number}%0A`;
    message += `▫️ Barrio: ${customerData.neighborhood}%0A`;
    message += `▫️ Código Postal: ${customerData.zip}%0A%0A`;
    
    // Produtos
    message += '🛍️ *PRODUCTOS:*%0A';
    cart.forEach(item => {
        message += `%0A▫️ ${item.name}%0A`;
        message += `   Cantidad: ${item.quantity}%0A`;
        message += `   Precio unit.: $${item.price.toLocaleString('es-AR')}%0A`;
        message += `   Subtotal: $${(item.price * item.quantity).toLocaleString('es-AR')}%0A`;
    });
    
    // Dados de envio
    message += '%0A━━━━━━━━━━━━━━━━━━━━━━%0A';
    message += '📍 *DATOS DE ENVÍO:*%0A';
    message += `▫️ Provincia: ${shippingData.provinceName}%0A`;
    message += `▫️ Ciudad: ${shippingData.city}%0A`;
    message += `▫️ Código Postal: ${shippingData.zipCode}%0A`;
    message += `▫️ Tipo de Entrega: ${shippingData.deliveryTypeName}%0A`;
    message += `▫️ Costo de Envío: $${shippingCost.toLocaleString('es-AR')}%0A`;
    
    // Totais
    message += '%0A━━━━━━━━━━━━━━━━━━━━━━%0A';
    message += `📊 *Subtotal Productos:* $${cartSubtotal.toLocaleString('es-AR')}%0A`;
    message += `🚚 *Envío:* $${shippingCost.toLocaleString('es-AR')}%0A`;
    const total = cartSubtotal + shippingCost;
    message += `%0A💰 *TOTAL A PAGAR: $${total.toLocaleString('es-AR')}*`;
    
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
        closeCheckoutForm();
        showNotification('¡Pedido enviado! Te contactaremos pronto 🎉');
    }, 1000);
};
