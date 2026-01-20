/* ========================================
   ESSENCE EXCLUSIVE - ADMIN JAVASCRIPT
   ======================================== */

let currentEditId = null;
let deleteProductId = null;

// === INITIALIZATION ===
document.addEventListener('DOMContentLoaded', () => {
    initAdmin();
    loadDashboardStats();
    loadProductsTable();
    initModals();
    initFilters();
    initSidebar();
});

// === INITIALIZE ADMIN ===
function initAdmin() {
    console.log('🎯 Admin Panel Initialized');
    
    // Check for products in localStorage
    const products = getProducts();
    if (!products || products.length === 0) {
        initializeDefaultProducts();
    }
}

// === GET PRODUCTS ===
function getProducts() {
    try {
        return JSON.parse(localStorage.getItem('products')) || [];
    } catch (error) {
        console.error('Error loading products:', error);
        return [];
    }
}

// === SAVE PRODUCTS ===
function saveProducts(products) {
    try {
        localStorage.setItem('products', JSON.stringify(products));
        return true;
    } catch (error) {
        console.error('Error saving products:', error);
        showNotification('Error al guardar productos', 'error');
        return false;
    }
}

// === INITIALIZE DEFAULT PRODUCTS ===
function initializeDefaultProducts() {
    const defaultProducts = [
        {
            id: 1,
            name: 'Chanel N°5 Eau de Parfum',
            category: 'femenino',
            price: 125000,
            image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=500',
            description: 'El perfume más icónico del mundo',
            featured: true,
            rating: 5
        },
        {
            id: 2,
            name: 'Dior Sauvage',
            category: 'masculino',
            price: 98000,
            image: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=500',
            description: 'Frescura y elegancia masculina',
            featured: true,
            rating: 5
        },
        {
            id: 3,
            name: 'Versace Bright Crystal',
            category: 'femenino',
            price: 85000,
            image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=500',
            description: 'Luminoso y fresco',
            featured: false,
            rating: 4
        },
        {
            id: 4,
            name: 'Giorgio Armani Acqua di Giò',
            category: 'masculino',
            price: 92000,
            image: 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=500',
            description: 'Inspirado en el Mediterráneo',
            featured: true,
            rating: 5
        },
        {
            id: 5,
            name: 'Lancôme La Vie Est Belle',
            category: 'femenino',
            price: 110000,
            image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=500',
            description: 'La vida es bella',
            featured: false,
            rating: 5
        },
        {
            id: 6,
            name: 'Paco Rabanne 1 Million',
            category: 'masculino',
            price: 88000,
            image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=500',
            description: 'El aroma del éxito',
            featured: true,
            rating: 4
        },
        {
            id: 7,
            name: 'Gucci Bloom',
            category: 'femenino',
            price: 95000,
            image: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=500',
            description: 'Un jardín de flores',
            featured: false,
            rating: 5
        },
        {
            id: 8,
            name: 'Tom Ford Black Orchid',
            category: 'unisex',
            price: 145000,
            image: 'https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=500',
            description: 'Misterioso y sensual',
            featured: true,
            rating: 5
        }
    ];
    
    saveProducts(defaultProducts);
}

// === LOAD DASHBOARD STATS ===
function loadDashboardStats() {
    const products = getProducts();
    
    const totalProducts = products.length;
    const featuredProducts = products.filter(p => p.featured).length;
    const categories = [...new Set(products.map(p => p.category))].length;
    const totalValue = products.reduce((sum, p) => sum + p.price, 0);
    
    document.getElementById('totalProducts').textContent = totalProducts;
    document.getElementById('featuredProducts').textContent = featuredProducts;
    document.getElementById('categories').textContent = categories;
    document.getElementById('totalValue').textContent = `$${totalValue.toLocaleString('es-AR')}`;
}

// === LOAD PRODUCTS TABLE ===
function loadProductsTable(filter = {}) {
    const products = getProducts();
    const tbody = document.getElementById('productsTableBody');
    
    let filteredProducts = products;
    
    // Apply filters
    if (filter.search) {
        const search = filter.search.toLowerCase();
        filteredProducts = filteredProducts.filter(p => 
            p.name.toLowerCase().includes(search) ||
            p.category.toLowerCase().includes(search) ||
            p.description.toLowerCase().includes(search)
        );
    }
    
    if (filter.category && filter.category !== 'all') {
        filteredProducts = filteredProducts.filter(p => p.category === filter.category);
    }
    
    if (filter.featured && filter.featured !== 'all') {
        const isFeatured = filter.featured === 'featured';
        filteredProducts = filteredProducts.filter(p => p.featured === isFeatured);
    }
    
    // Render table
    if (filteredProducts.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 3rem; color: #999;">
                    <i class="fas fa-inbox" style="font-size: 3rem; display: block; margin-bottom: 1rem;"></i>
                    No se encontraron productos
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = filteredProducts.map(product => `
        <tr>
            <td>${product.id}</td>
            <td>
                <div class="product-image-cell">
                    <img src="${product.image}" alt="${product.name}">
                </div>
            </td>
            <td><strong>${product.name}</strong></td>
            <td>
                <span class="category-badge category-${product.category}">
                    ${product.category}
                </span>
            </td>
            <td><strong>$${product.price.toLocaleString('es-AR')}</strong></td>
            <td>${'★'.repeat(product.rating)}${'☆'.repeat(5 - product.rating)}</td>
            <td>
                <span class="featured-badge ${product.featured ? 'featured-yes' : 'featured-no'}">
                    <i class="fas fa-${product.featured ? 'star' : 'circle'}"></i>
                    ${product.featured ? 'Sí' : 'No'}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn action-btn-edit" onclick="editProduct(${product.id})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn action-btn-delete" onclick="confirmDelete(${product.id})" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// === INITIALIZE MODALS ===
function initModals() {
    const addProductBtn = document.getElementById('addProductBtn');
    const productModal = document.getElementById('productModal');
    const modalClose = document.getElementById('modalClose');
    const cancelBtn = document.getElementById('cancelBtn');
    const productForm = document.getElementById('productForm');
    
    // Open modal for new product
    addProductBtn?.addEventListener('click', () => {
        openProductModal();
    });
    
    // Close modal
    const closeModal = () => {
        productModal.classList.remove('active');
        resetForm();
    };
    
    modalClose?.addEventListener('click', closeModal);
    cancelBtn?.addEventListener('click', closeModal);
    
    productModal?.addEventListener('click', (e) => {
        if (e.target === productModal) {
            closeModal();
        }
    });
    
    // Submit form
    productForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        saveProduct();
    });
    
    // Delete modal
    const deleteModalClose = document.getElementById('deleteModalClose');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    const deleteModal = document.getElementById('deleteModal');
    
    const closeDeleteModal = () => {
        deleteModal.classList.remove('active');
        deleteProductId = null;
    };
    
    deleteModalClose?.addEventListener('click', closeDeleteModal);
    cancelDeleteBtn?.addEventListener('click', closeDeleteModal);
    confirmDeleteBtn?.addEventListener('click', () => {
        deleteProduct(deleteProductId);
        closeDeleteModal();
    });
    
    deleteModal?.addEventListener('click', (e) => {
        if (e.target === deleteModal) {
            closeDeleteModal();
        }
    });
}

// === OPEN PRODUCT MODAL ===
function openProductModal(productId = null) {
    const modal = document.getElementById('productModal');
    const modalTitle = document.getElementById('modalTitle');
    
    if (productId) {
        // Edit mode
        modalTitle.textContent = 'Editar Producto';
        const products = getProducts();
        const product = products.find(p => p.id === productId);
        
        if (product) {
            document.getElementById('productId').value = product.id;
            document.getElementById('productName').value = product.name;
            document.getElementById('productCategory').value = product.category;
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productRating').value = product.rating;
            document.getElementById('productImage').value = product.image;
            document.getElementById('productDescription').value = product.description || '';
            document.getElementById('productFeatured').checked = product.featured;
            
            currentEditId = productId;
        }
    } else {
        // Add mode
        modalTitle.textContent = 'Agregar Producto';
        resetForm();
        currentEditId = null;
    }
    
    modal.classList.add('active');
}

// === RESET FORM ===
function resetForm() {
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    currentEditId = null;
}

// === SAVE PRODUCT ===
function saveProduct() {
    const products = getProducts();
    
    const productData = {
        name: document.getElementById('productName').value.trim(),
        category: document.getElementById('productCategory').value,
        price: parseInt(document.getElementById('productPrice').value),
        rating: parseInt(document.getElementById('productRating').value),
        image: document.getElementById('productImage').value.trim(),
        description: document.getElementById('productDescription').value.trim(),
        featured: document.getElementById('productFeatured').checked
    };
    
    // Validation
    if (!productData.name || !productData.category || !productData.price || !productData.image) {
        showNotification('Por favor complete todos los campos requeridos', 'error');
        return;
    }
    
    if (currentEditId) {
        // Update existing product
        const index = products.findIndex(p => p.id === currentEditId);
        if (index !== -1) {
            products[index] = { ...products[index], ...productData };
            showNotification('Producto actualizado exitosamente', 'success');
        }
    } else {
        // Add new product
        const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
        products.push({ id: newId, ...productData });
        showNotification('Producto agregado exitosamente', 'success');
    }
    
    saveProducts(products);
    loadProductsTable();
    loadDashboardStats();
    
    // Close modal
    document.getElementById('productModal').classList.remove('active');
    resetForm();
}

// === EDIT PRODUCT ===
function editProduct(productId) {
    openProductModal(productId);
}

// === CONFIRM DELETE ===
function confirmDelete(productId) {
    deleteProductId = productId;
    document.getElementById('deleteModal').classList.add('active');
}

// === DELETE PRODUCT ===
function deleteProduct(productId) {
    let products = getProducts();
    products = products.filter(p => p.id !== productId);
    
    saveProducts(products);
    loadProductsTable();
    loadDashboardStats();
    
    showNotification('Producto eliminado exitosamente', 'success');
}

// === INITIALIZE FILTERS ===
function initFilters() {
    const searchInput = document.getElementById('searchProduct');
    const categoryFilter = document.getElementById('filterCategory');
    const featuredFilter = document.getElementById('filterFeatured');
    
    const applyFilters = () => {
        const filter = {
            search: searchInput.value,
            category: categoryFilter.value,
            featured: featuredFilter.value
        };
        loadProductsTable(filter);
    };
    
    searchInput?.addEventListener('input', applyFilters);
    categoryFilter?.addEventListener('change', applyFilters);
    featuredFilter?.addEventListener('change', applyFilters);
}

// === INITIALIZE SIDEBAR ===
function initSidebar() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.querySelector('.sidebar');
    
    menuToggle?.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 1024) {
            if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                sidebar.classList.remove('active');
            }
        }
    });
}

// === NOTIFICATION ===
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `admin-notification notification-${type}`;
    
    const icon = type === 'success' ? 'check-circle' : 'exclamation-circle';
    const bgColor = type === 'success' 
        ? 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
        : 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)';
    
    notification.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
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

// === EXPORT FUNCTIONS TO WINDOW ===
window.editProduct = editProduct;
window.confirmDelete = confirmDelete;

// === ADD ANIMATION STYLES ===
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
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
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

console.log('✅ Admin Panel Ready');
