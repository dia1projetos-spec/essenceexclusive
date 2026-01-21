/* ADMIN v3.0 - Com Firebase + LocalStorage fallback */
let currentEditId = null;
let currentEditSlideId = null;
let currentEditCategoryId = null;
let deleteProductId = null;
let productsCache = [];
let categoriesCache = [];
let slidesCache = [];

document.addEventListener('DOMContentLoaded', async () => {
    initAuth();
    initNav();
    initModals();
    initFilters();
    initSidebar();
    initFileUploads();
    
    // Carregar dados (Firebase ou LocalStorage)
    await refreshAllData();
});

function initAuth() {
    const user = localStorage.getItem('adminUser') || sessionStorage.getItem('adminUser');
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    
    try {
        const userData = JSON.parse(user);
        document.getElementById('userEmail').textContent = userData.email;
    } catch (e) {
        console.error(e);
    }
}

async function refreshAllData() {
    showLoading(true);
    
    // Carregar produtos
    productsCache = await window.FirebaseProducts.load();
    
    // Carregar categorias  
    categoriesCache = await window.FirebaseCategories.load();
    if (categoriesCache.length === 0) {
        await initDefaultCategories();
    }
    
    // Carregar slides
    slidesCache = await window.FirebaseSlides.load();
    if (slidesCache.length === 0) {
        await initDefaultSlides();
    }
    
    // Atualizar UI
    loadProductsUI();
    loadCategoriesUI();
    loadSlidesUI();
    loadStats();
    loadCategoryFilters();
    
    showLoading(false);
}

async function initDefaultCategories() {
    const defaults = [
        { name: 'Femeninos', slug: 'femenino', icon: 'fa-venus', subcategories: [] },
        { name: 'Masculinos', slug: 'masculino', icon: 'fa-mars', subcategories: [] },
        { name: 'Unisex', slug: 'unisex', icon: 'fa-star', subcategories: [] }
    ];
    
    for (const cat of defaults) {
        await window.FirebaseCategories.save(cat);
    }
    
    categoriesCache = await window.FirebaseCategories.load();
}

async function initDefaultSlides() {
    const defaults = [
        {
            backgroundImage: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=1920',
            floatingImage: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59d75?w=600',
            order: 0,
            active: true
        }
    ];
    
    for (const slide of defaults) {
        await window.FirebaseSlides.save(slide);
    }
    
    slidesCache = await window.FirebaseSlides.load();
}

function initNav() {
    document.querySelectorAll('.nav-item[data-section]').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            item.classList.add('active');
            
            document.querySelectorAll('.admin-section').forEach(sec => sec.classList.remove('active'));
            document.getElementById(section + 'Section')?.classList.add('active');
        });
    });
}

function loadStats() {
    document.getElementById('totalProducts').textContent = productsCache.length;
    document.getElementById('featuredProducts').textContent = productsCache.filter(p => p.featured).length;
    document.getElementById('categories').textContent = categoriesCache.length;
    document.getElementById('totalValue').textContent = '$' + productsCache.reduce((sum, p) => sum + (p.price || 0), 0).toLocaleString('es-AR');
}

function loadProductsUI(filter = {}) {
    let filtered = productsCache;
    
    if (filter.search) {
        const s = filter.search.toLowerCase();
        filtered = filtered.filter(p => p.name.toLowerCase().includes(s));
    }
    
    if (filter.category && filter.category !== 'all') {
        filtered = filtered.filter(p => p.category === filter.category);
    }
    
    if (filter.featured && filter.featured !== 'all') {
        filtered = filtered.filter(p => p.featured === (filter.featured === 'featured'));
    }
    
    const tbody = document.getElementById('productsTableBody');
    
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:3rem"><i class="fas fa-inbox" style="font-size:3rem;display:block;margin-bottom:1rem"></i>No hay productos</td></tr>';
        return;
    }
    
    tbody.innerHTML = filtered.map(p => `
        <tr>
            <td>${p.id || 'N/A'}</td>
            <td><div class="product-image-cell"><img src="${p.image}"></div></td>
            <td><strong>${p.name}</strong></td>
            <td><span class="category-badge category-${p.category}">${p.category}</span></td>
            <td><strong>$${(p.price || 0).toLocaleString('es-AR')}</strong></td>
            <td>${'★'.repeat(p.rating || 5)}${'☆'.repeat(5 - (p.rating || 5))}</td>
            <td><span class="featured-badge ${p.featured ? 'featured-yes' : 'featured-no'}"><i class="fas fa-${p.featured ? 'star' : 'circle'}"></i> ${p.featured ? 'Sí' : 'No'}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn action-btn-edit" onclick="editProduct('${p.firebaseId || p.id}')"><i class="fas fa-edit"></i></button>
                    <button class="action-btn action-btn-delete" onclick="confirmDelete('${p.firebaseId || p.id}')"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        </tr>
    `).join('');
}

window.editProduct = (id) => {
    const product = productsCache.find(p => p.firebaseId === id || p.id === id);
    if (!product) return;
    
    document.getElementById('modalTitle').textContent = 'Editar Producto';
    document.getElementById('productId').value = product.id || '';
    document.getElementById('productName').value = product.name;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productSubcategory').value = product.subcategory || '';
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productRating').value = product.rating || 5;
    document.getElementById('productDescription').value = product.description || '';
    document.getElementById('productFeatured').checked = product.featured;
    
    const preview = document.getElementById('productImagePreview');
    preview.innerHTML = `<img src="${product.image}">`;
    preview.classList.add('active');
    
    currentEditId = id;
    document.getElementById('productModal').classList.add('active');
};

window.confirmDelete = (id) => {
    deleteProductId = id;
    document.getElementById('deleteModal').classList.add('active');
};

async function saveProductForm() {
    showLoading(true);
    
    const imgInput = document.getElementById('productImage');
    let imgData = '';
    
    if (imgInput.files && imgInput.files[0]) {
        imgData = await fileToBase64(imgInput.files[0]);
    } else if (currentEditId) {
        const existingProduct = productsCache.find(p => p.firebaseId === currentEditId || p.id === currentEditId);
        imgData = existingProduct?.image || '';
    }
    
    const productData = {
        name: document.getElementById('productName').value.trim(),
        category: document.getElementById('productCategory').value,
        subcategory: document.getElementById('productSubcategory').value || '',
        price: parseInt(document.getElementById('productPrice').value),
        rating: parseInt(document.getElementById('productRating').value) || 5,
        image: imgData,
        description: document.getElementById('productDescription').value.trim(),
        featured: document.getElementById('productFeatured').checked
    };
    
    if (!productData.name || !productData.category || !productData.price || !imgData) {
        showNotification('Complete todos los campos requeridos', 'error');
        showLoading(false);
        return;
    }
    
    if (currentEditId) {
        productData.firebaseId = currentEditId;
        productData.id = currentEditId;
    }
    
    const success = await window.FirebaseProducts.save(productData);
    
    if (success) {
        showNotification(currentEditId ? 'Producto actualizado' : 'Producto agregado', 'success');
        await refreshAllData();
        document.getElementById('productModal').classList.remove('active');
        currentEditId = null;
    } else {
        showNotification('Error al guardar', 'error');
    }
    
    showLoading(false);
}

async function deleteProductConfirm() {
    showLoading(true);
    
    const success = await window.FirebaseProducts.delete(deleteProductId);
    
    if (success) {
        showNotification('Producto eliminado', 'success');
        await refreshAllData();
    } else {
        showNotification('Error al eliminar', 'error');
    }
    
    showLoading(false);
}

async function saveSlideForm() {
    showLoading(true);
    
    const bgInput = document.getElementById('slideBackgroundImage');
    const floatInput = document.getElementById('slideFloatingImage');
    let bgData = '', floatData = '';
    
    if (bgInput.files && bgInput.files[0]) {
        bgData = await fileToBase64(bgInput.files[0]);
    } else if (currentEditSlideId) {
        const existing = slidesCache.find(s => s.firebaseId === currentEditSlideId || s.id === currentEditSlideId);
        bgData = existing?.backgroundImage || '';
    }
    
    if (floatInput.files && floatInput.files[0]) {
        floatData = await fileToBase64(floatInput.files[0]);
    } else if (currentEditSlideId) {
        const existing = slidesCache.find(s => s.firebaseId === currentEditSlideId || s.id === currentEditSlideId);
        floatData = existing?.floatingImage || '';
    }
    
    const slideData = {
        backgroundImage: bgData,
        floatingImage: floatData,
        order: parseInt(document.getElementById('slideOrder').value) || 0,
        active: document.getElementById('slideActive').checked
    };
    
    if (!bgData || !floatData) {
        showNotification('Agregue ambas imágenes', 'error');
        showLoading(false);
        return;
    }
    
    if (currentEditSlideId) {
        slideData.firebaseId = currentEditSlideId;
        slideData.id = currentEditSlideId;
    }
    
    const success = await window.FirebaseSlides.save(slideData);
    
    if (success) {
        showNotification(currentEditSlideId ? 'Slide actualizado' : 'Slide agregado', 'success');
        await refreshAllData();
        document.getElementById('slideModal').classList.remove('active');
        currentEditSlideId = null;
    } else {
        showNotification('Error al guardar slide', 'error');
    }
    
    showLoading(false);
}

function loadCategoriesUI() {
    const list = document.getElementById('categoriesList');
    
    if (categoriesCache.length === 0) {
        list.innerHTML = '<div class="category-empty"><i class="fas fa-tags"></i><p>No hay categorías</p></div>';
        return;
    }
    
    list.innerHTML = categoriesCache.map(cat => `
        <div class="category-item">
            <div class="category-header">
                <div class="category-name">
                    <div class="category-icon"><i class="fas ${cat.icon || 'fa-tag'}"></i></div>
                    <span>${cat.name}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function loadSlidesUI() {
    const grid = document.getElementById('slidesGrid');
    
    if (slidesCache.length === 0) {
        grid.innerHTML = '<div class="slides-empty"><i class="fas fa-images"></i><p>No hay slides</p></div>';
        return;
    }
    
    grid.innerHTML = slidesCache.map(s => `
        <div class="slide-card">
            <div class="slide-bg" style="background-image:url('${s.backgroundImage}')">
                <div class="slide-floating">
                    <img src="${s.floatingImage}">
                </div>
            </div>
            <div class="slide-info">
                <span class="slide-order">Orden: ${s.order || 0}</span>
                <span class="slide-status ${s.active ? 'active' : 'inactive'}">${s.active ? 'Activo' : 'Inactivo'}</span>
            </div>
        </div>
    `).join('');
}

function loadCategoryFilters() {
    const select = document.getElementById('productCategory');
    const filter = document.getElementById('filterCategory');
    
    select.innerHTML = '<option value="">Seleccionar...</option>' + categoriesCache.map(c => `<option value="${c.slug}">${c.name}</option>`).join('');
    filter.innerHTML = '<option value="all">Todas las Categorías</option>' + categoriesCache.map(c => `<option value="${c.slug}">${c.name}</option>`).join('');
}

function initModals() {
    // Producto modal
    document.getElementById('addProductBtn')?.addEventListener('click', () => {
        document.getElementById('modalTitle').textContent = 'Agregar Producto';
        document.getElementById('productForm').reset();
        document.getElementById('productImagePreview').classList.remove('active');
        currentEditId = null;
        document.getElementById('productModal').classList.add('active');
    });
    
    document.getElementById('modalClose')?.addEventListener('click', () => {
        document.getElementById('productModal').classList.remove('active');
    });
    
    document.getElementById('cancelBtn')?.addEventListener('click', () => {
        document.getElementById('productModal').classList.remove('active');
    });
    
    document.getElementById('productForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        saveProductForm();
    });
    
    // Slide modal
    document.getElementById('addSlideBtn')?.addEventListener('click', () => {
        document.getElementById('slideModalTitle').textContent = 'Agregar Slide';
        document.getElementById('slideForm').reset();
        ['slideBackgroundPreview', 'slideFloatingPreview'].forEach(id => {
            document.getElementById(id).classList.remove('active');
        });
        currentEditSlideId = null;
        document.getElementById('slideModal').classList.add('active');
    });
    
    document.getElementById('slideModalClose')?.addEventListener('click', () => {
        document.getElementById('slideModal').classList.remove('active');
    });
    
    document.getElementById('cancelSlideBtn')?.addEventListener('click', () => {
        document.getElementById('slideModal').classList.remove('active');
    });
    
    document.getElementById('slideForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        saveSlideForm();
    });
    
    // Delete modal
    document.getElementById('deleteModalClose')?.addEventListener('click', () => {
        document.getElementById('deleteModal').classList.remove('active');
    });
    
    document.getElementById('cancelDeleteBtn')?.addEventListener('click', () => {
        document.getElementById('deleteModal').classList.remove('active');
    });
    
    document.getElementById('confirmDeleteBtn')?.addEventListener('click', () => {
        deleteProductConfirm();
        document.getElementById('deleteModal').classList.remove('active');
    });
}

function initFileUploads() {
    document.getElementById('productImage')?.addEventListener('change', e => handleFileSelect(e, 'productImagePreview'));
    document.getElementById('slideBackgroundImage')?.addEventListener('change', e => handleFileSelect(e, 'slideBackgroundPreview'));
    document.getElementById('slideFloatingImage')?.addEventListener('change', e => handleFileSelect(e, 'slideFloatingPreview'));
}

function handleFileSelect(e, previewId) {
    const file = e.target.files[0];
    if (!file) return;
    
    const fileName = e.target.parentElement.querySelector('.file-name');
    if (fileName) fileName.textContent = file.name;
    
    const reader = new FileReader();
    reader.onload = (ev) => {
        const preview = document.getElementById(previewId);
        if (preview) {
            preview.innerHTML = `<img src="${ev.target.result}">`;
            preview.classList.add('active');
        }
    };
    reader.readAsDataURL(file);
}

async function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function initFilters() {
    document.getElementById('searchProducts')?.addEventListener('input', e => {
        loadProductsUI({
            search: e.target.value,
            category: document.getElementById('filterCategory').value,
            featured: document.getElementById('filterFeatured').value
        });
    });
    
    document.getElementById('filterCategory')?.addEventListener('change', e => {
        loadProductsUI({
            search: document.getElementById('searchProducts').value,
            category: e.target.value,
            featured: document.getElementById('filterFeatured').value
        });
    });
    
    document.getElementById('filterFeatured')?.addEventListener('change', e => {
        loadProductsUI({
            search: document.getElementById('searchProducts').value,
            category: document.getElementById('filterCategory').value,
            featured: e.target.value
        });
    });
}

function initSidebar() {
    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        if (confirm('¿Cerrar sesión?')) {
            localStorage.removeItem('adminUser');
            sessionStorage.removeItem('adminUser');
            window.location.href = 'login.html';
        }
    });
}

function showNotification(msg, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = 'position:fixed;top:100px;right:20px;background:#fff;padding:1rem 2rem;border-radius:10px;box-shadow:0 10px 30px rgba(0,0,0,0.2);z-index:99999;';
    notification.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'times-circle' : 'info-circle'}"></i><span style="margin-left:0.5rem">${msg}</span>`;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

function showLoading(show) {
    let overlay = document.getElementById('loadingOverlay');
    
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'loadingOverlay';
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);display:none;align-items:center;justify-content:center;z-index:999999;';
        overlay.innerHTML = '<div style="background:#fff;padding:2rem 3rem;border-radius:15px;text-align:center"><div style="width:50px;height:50px;border:5px solid #f3f3f3;border-top:5px solid #c4a76b;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 1rem"></div><p style="color:#333">Procesando...</p></div>';
        document.body.appendChild(overlay);
        
        const style = document.createElement('style');
        style.textContent = '@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}';
        document.head.appendChild(style);
    }
    
    overlay.style.display = show ? 'flex' : 'none';
}

console.log('✅ Admin v3.0 with Firebase loaded');
