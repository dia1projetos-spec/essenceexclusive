let products = [];
let slides = [];
let categories = [];
let editing = null;
let editingSlide = null;

document.addEventListener('DOMContentLoaded', async () => {
    checkAuth();
    initNav();
    initModals();
    
    // Aguardar Firebase
    let attempts = 0;
    while (!window.db && attempts < 50) {
        await new Promise(r => setTimeout(r, 100));
        attempts++;
    }
    
    await loadAll();
    render();
});

function checkAuth() {
    const user = localStorage.getItem('adminUser') || sessionStorage.getItem('adminUser');
    if (!user) {
        window.location.href = 'login.html';
    }
}

async function loadAll() {
    if (window.db) {
        products = await getAllProducts();
        slides = await getAllSlides();
        categories = await getAllCategories();
    }
}

function render() {
    renderProducts();
    renderSlides();
    renderCategories();
}

function initNav() {
    document.querySelectorAll('[data-section]').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            const section = el.dataset.section;
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            el.classList.add('active');
            document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
            document.getElementById(section + 'Section')?.classList.add('active');
        });
    });
}

function initModals() {
    // Produto
    document.getElementById('addProductBtn')?.addEventListener('click', () => {
        document.getElementById('modalTitle').textContent = 'Agregar Producto';
        document.getElementById('productForm').reset();
        editing = null;
        document.getElementById('productModal').classList.add('active');
    });
    
    document.getElementById('modalClose')?.addEventListener('click', () => {
        document.getElementById('productModal').classList.remove('active');
    });
    
    document.getElementById('productForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveProductForm();
    });
    
    // Slide
    document.getElementById('addSlideBtn')?.addEventListener('click', () => {
        document.getElementById('slideModalTitle').textContent = 'Agregar Slide';
        document.getElementById('slideForm').reset();
        editingSlide = null;
        document.getElementById('slideModal').classList.add('active');
    });
    
    document.getElementById('slideModalClose')?.addEventListener('click', () => {
        document.getElementById('slideModal').classList.remove('active');
    });
    
    document.getElementById('slideForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveSlideForm();
    });
    
    // Logout
    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        localStorage.removeItem('adminUser');
        sessionStorage.removeItem('adminUser');
        window.location.href = 'login.html';
    });
}

// PRODUTOS
function renderProducts() {
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) return;
    
    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:3rem">No hay productos</td></tr>';
        return;
    }
    
    tbody.innerHTML = products.map(p => `
        <tr>
            <td>${p.id.substring(0, 8)}...</td>
            <td><img src="${p.image}" style="width:50px;height:50px;object-fit:cover;border-radius:5px;"></td>
            <td><strong>${p.name}</strong></td>
            <td>${p.category}</td>
            <td><strong>$${p.price.toLocaleString('es-AR')}</strong></td>
            <td>${'★'.repeat(p.rating || 5)}</td>
            <td>${p.featured ? 'Sí' : 'No'}</td>
            <td>
                <button class="action-btn action-btn-edit" onclick="editProduct('${p.id}')"><i class="fas fa-edit"></i></button>
                <button class="action-btn action-btn-delete" onclick="deleteProductConfirm('${p.id}')"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

window.editProduct = function(id) {
    const p = products.find(x => x.id === id);
    if (!p) return;
    
    document.getElementById('modalTitle').textContent = 'Editar Producto';
    document.getElementById('productName').value = p.name;
    document.getElementById('productCategory').value = p.category;
    document.getElementById('productPrice').value = p.price;
    document.getElementById('productRating').value = p.rating || 5;
    document.getElementById('productDescription').value = p.description || '';
    document.getElementById('productFeatured').checked = p.featured;
    
    editing = id;
    document.getElementById('productModal').classList.add('active');
};

window.deleteProductConfirm = async function(id) {
    if (!confirm('¿Eliminar producto?')) return;
    
    const success = await deleteProduct(id);
    if (success) {
        alert('Producto eliminado');
        await loadAll();
        render();
    }
};

async function saveProductForm() {
    const imgInput = document.getElementById('productImage');
    let imgData = '';
    
    if (imgInput.files && imgInput.files[0]) {
        imgData = await fileToBase64(imgInput.files[0]);
    } else if (editing) {
        const existing = products.find(p => p.id === editing);
        imgData = existing?.image || '';
    }
    
    const product = {
        name: document.getElementById('productName').value,
        category: document.getElementById('productCategory').value,
        price: parseInt(document.getElementById('productPrice').value),
        rating: parseInt(document.getElementById('productRating').value) || 5,
        image: imgData,
        description: document.getElementById('productDescription').value,
        featured: document.getElementById('productFeatured').checked
    };
    
    if (!product.name || !product.image) {
        alert('Complete os campos');
        return;
    }
    
    if (editing) {
        product.id = editing;
    }
    
    const success = await saveProduct(product);
    if (success) {
        alert('Produto salvo!');
        document.getElementById('productModal').classList.remove('active');
        await loadAll();
        render();
    }
}

// SLIDES
function renderSlides() {
    const grid = document.getElementById('slidesGrid');
    if (!grid) return;
    
    if (slides.length === 0) {
        grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:3rem;color:#999;">No hay slides</div>';
        return;
    }
    
    grid.innerHTML = slides.map(s => `
        <div class="slide-card">
            <div class="slide-bg" style="background-image:url('${s.backgroundImage}')">
                <div class="slide-floating">
                    <img src="${s.floatingImage}">
                </div>
            </div>
            <div class="slide-info">
                <span>Orden: ${s.order || 0}</span>
                <span>${s.active ? 'Activo' : 'Inactivo'}</span>
            </div>
            <div class="slide-actions">
                <button class="action-btn action-btn-edit" onclick="editSlide('${s.id}')"><i class="fas fa-edit"></i> Editar</button>
                <button class="action-btn action-btn-delete" onclick="deleteSlideConfirm('${s.id}')"><i class="fas fa-trash"></i> Eliminar</button>
            </div>
        </div>
    `).join('');
}

window.editSlide = function(id) {
    const s = slides.find(x => x.id === id);
    if (!s) return;
    
    document.getElementById('slideModalTitle').textContent = 'Editar Slide';
    document.getElementById('slideOrder').value = s.order || 0;
    document.getElementById('slideActive').checked = s.active;
    
    editingSlide = id;
    document.getElementById('slideModal').classList.add('active');
};

window.deleteSlideConfirm = async function(id) {
    if (!confirm('¿Eliminar slide?')) return;
    
    const success = await deleteSlide(id);
    if (success) {
        alert('Slide eliminado');
        await loadAll();
        render();
    }
};

async function saveSlideForm() {
    const bgInput = document.getElementById('slideBackgroundImage');
    const floatInput = document.getElementById('slideFloatingImage');
    
    let bgData = '', floatData = '';
    
    if (bgInput.files && bgInput.files[0]) {
        bgData = await fileToBase64(bgInput.files[0]);
    } else if (editingSlide) {
        const existing = slides.find(s => s.id === editingSlide);
        bgData = existing?.backgroundImage || '';
    }
    
    if (floatInput.files && floatInput.files[0]) {
        floatData = await fileToBase64(floatInput.files[0]);
    } else if (editingSlide) {
        const existing = slides.find(s => s.id === editingSlide);
        floatData = existing?.floatingImage || '';
    }
    
    if (!bgData || !floatData) {
        alert('Complete as imagens');
        return;
    }
    
    const slide = {
        backgroundImage: bgData,
        floatingImage: floatData,
        order: parseInt(document.getElementById('slideOrder').value) || 0,
        active: document.getElementById('slideActive').checked
    };
    
    if (editingSlide) {
        slide.id = editingSlide;
    }
    
    const success = await saveSlide(slide);
    if (success) {
        alert('Slide salvo!');
        document.getElementById('slideModal').classList.remove('active');
        await loadAll();
        render();
    }
}

// CATEGORIAS
function renderCategories() {
    const list = document.getElementById('categoriesList');
    if (!list) return;
    
    list.innerHTML = categories.map(c => `
        <div class="category-item">
            <div class="category-name">
                <i class="fas ${c.icon || 'fa-tag'}"></i>
                <span>${c.name}</span>
            </div>
        </div>
    `).join('');
    
    // Populate selects
    const select = document.getElementById('productCategory');
    if (select) {
        select.innerHTML = '<option value="">Seleccionar...</option>' + 
            categories.map(c => `<option value="${c.slug}">${c.name}</option>`).join('');
    }
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

console.log('✅ Admin.js loaded');
