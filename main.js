let products = [];
let slides = [];
let categories = [];

// Inicializar
document.addEventListener('DOMContentLoaded', async () => {
    init();
    await loadData();
    render();
});

function init() {
    // Navigation
    document.querySelector('.hamburger')?.addEventListener('click', () => {
        document.querySelector('.nav-links')?.classList.toggle('active');
    });
    
    // Search
    document.querySelector('.search-btn')?.addEventListener('click', () => {
        document.querySelector('.search-overlay')?.classList.add('active');
    });
    
    document.querySelector('.search-close')?.addEventListener('click', () => {
        document.querySelector('.search-overlay')?.classList.remove('active');
    });
    
    // Scroll header
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            document.querySelector('.header')?.classList.add('scrolled');
        } else {
            document.querySelector('.header')?.classList.remove('scrolled');
        }
    });
    
    // Hero slider
    initSlider();
}

async function loadData() {
    try {
        // Aguardar Firebase
        let attempts = 0;
        while (!window.db && attempts < 50) {
            await new Promise(r => setTimeout(r, 100));
            attempts++;
        }
        
        if (window.db) {
            products = await getAllProducts();
            slides = await getAllSlides();
            categories = await getAllCategories();
            
            // Init defaults se vazio
            if (categories.length === 0) {
                await saveCategory({ name: 'Femeninos', slug: 'femenino', icon: 'fa-venus' });
                await saveCategory({ name: 'Masculinos', slug: 'masculino', icon: 'fa-mars' });
                await saveCategory({ name: 'Unisex', slug: 'unisex', icon: 'fa-star' });
                categories = await getAllCategories();
            }
        } else {
            console.warn('Firebase não conectou, usando cache');
            products = JSON.parse(localStorage.getItem('products') || '[]');
            slides = JSON.parse(localStorage.getItem('slides') || '[]');
            categories = JSON.parse(localStorage.getItem('categories') || '[]');
        }
    } catch (error) {
        console.error('Erro ao carregar:', error);
    }
}

function render() {
    renderSlides();
    renderProducts();
    renderCategories();
}

// SLIDES
let currentSlide = 0;
let slideInterval;

function initSlider() {
    document.getElementById('heroPrev')?.addEventListener('click', () => changeSlide(-1));
    document.getElementById('heroNext')?.addEventListener('click', () => changeSlide(1));
    startAutoSlide();
}

function renderSlides() {
    const activeSlides = slides.filter(s => s.active).sort((a, b) => (a.order || 0) - (b.order || 0));
    
    const bgSlider = document.querySelector('.hero-bg-slider');
    const floatSlider = document.querySelector('.floating-element-slider');
    const dots = document.querySelector('.slider-dots');
    
    if (!bgSlider || !floatSlider || !dots || activeSlides.length === 0) return;
    
    bgSlider.innerHTML = activeSlides.map(s => 
        `<div class="hero-bg" style="background-image:url('${s.backgroundImage}')"></div>`
    ).join('');
    
    floatSlider.innerHTML = activeSlides.map(s => 
        `<div class="floating-element"><img src="${s.floatingImage}"></div>`
    ).join('');
    
    dots.innerHTML = activeSlides.map((_, i) => 
        `<button class="slider-dot ${i === 0 ? 'active' : ''}" onclick="goToSlide(${i})"></button>`
    ).join('');
    
    updateSlide();
}

function changeSlide(dir) {
    const total = document.querySelectorAll('.hero-bg').length;
    currentSlide = (currentSlide + dir + total) % total;
    updateSlide();
    resetAutoSlide();
}

window.goToSlide = function(index) {
    currentSlide = index;
    updateSlide();
    resetAutoSlide();
};

function updateSlide() {
    document.querySelectorAll('.hero-bg').forEach((el, i) => {
        el.classList.toggle('active', i === currentSlide);
    });
    document.querySelectorAll('.floating-element').forEach((el, i) => {
        el.classList.toggle('active', i === currentSlide);
    });
    document.querySelectorAll('.slider-dot').forEach((el, i) => {
        el.classList.toggle('active', i === currentSlide);
    });
}

function startAutoSlide() {
    slideInterval = setInterval(() => changeSlide(1), 5000);
}

function resetAutoSlide() {
    clearInterval(slideInterval);
    startAutoSlide();
}

// PRODUCTS
function renderProducts() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    
    if (products.length === 0) {
        grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:3rem; color:#999;"><i class="fas fa-box-open" style="font-size:3rem; display:block; margin-bottom:1rem;"></i><p>No hay productos</p></div>';
        return;
    }
    
    grid.innerHTML = products.map(p => `
        <div class="product-card">
            ${p.featured ? '<div class="product-badge">Destacado</div>' : ''}
            <div class="product-image">
                <img src="${p.image}" alt="${p.name}">
                <div class="product-overlay">
                    <button class="btn btn-icon" onclick="addToCart('${p.id}')">
                        <i class="fas fa-shopping-cart"></i>
                    </button>
                </div>
            </div>
            <div class="product-info">
                <span class="product-category">${p.category}</span>
                <h3 class="product-name">${p.name}</h3>
                <div class="product-rating">${'★'.repeat(p.rating || 5)}</div>
                <p class="product-price">$${(p.price || 0).toLocaleString('es-AR')}</p>
            </div>
        </div>
    `).join('');
}

function renderCategories() {
    const container = document.getElementById('categoryFilters');
    if (!container) return;
    
    const cats = [
        { slug: 'all', name: 'Todos', icon: 'fa-th' },
        ...categories
    ];
    
    container.innerHTML = cats.map(c => `
        <button class="category-filter-btn ${c.slug === 'all' ? 'active' : ''}" onclick="filterByCategory('${c.slug}')">
            <i class="fas ${c.icon || 'fa-tag'}"></i>
            <span>${c.name}</span>
        </button>
    `).join('');
}

window.filterByCategory = function(slug) {
    document.querySelectorAll('.category-filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.closest('.category-filter-btn').classList.add('active');
    
    // Filter products (simplified)
    if (slug === 'all') {
        renderProducts();
    } else {
        const filtered = products.filter(p => p.category === slug);
        const grid = document.getElementById('productsGrid');
        if (grid) {
            grid.innerHTML = filtered.map(p => `
                <div class="product-card">
                    ${p.featured ? '<div class="product-badge">Destacado</div>' : ''}
                    <div class="product-image">
                        <img src="${p.image}" alt="${p.name}">
                        <div class="product-overlay">
                            <button class="btn btn-icon" onclick="addToCart('${p.id}')">
                                <i class="fas fa-shopping-cart"></i>
                            </button>
                        </div>
                    </div>
                    <div class="product-info">
                        <span class="product-category">${p.category}</span>
                        <h3 class="product-name">${p.name}</h3>
                        <div class="product-rating">${'★'.repeat(p.rating || 5)}</div>
                        <p class="product-price">$${(p.price || 0).toLocaleString('es-AR')}</p>
                    </div>
                </div>
            `).join('');
        }
    }
};

console.log('✅ Main.js loaded');
