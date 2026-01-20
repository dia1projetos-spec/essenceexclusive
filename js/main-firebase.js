/* MAIN.JS - Firebase Integration Module */
import {loadProducts as loadProductsFirebase, loadCategories as loadCategoriesFirebase, loadSlides as loadSlidesFirebase} from './firebase-integration.js';

let productsCache = [];
let categoriesCache = [];
let slidesCache = [];

// === INITIALIZATION ===
document.addEventListener('DOMContentLoaded', async () => {
    initLoader();
    initNavigation();
    initSearch();
    initAnimations();
    initScrollEffects();
    
    // Carregar dados do Firebase
    await loadAllData();
    
    initHeroSlider();
    loadDynamicSlides();
    loadProducts();
    loadCategoryFilters();
    initFilters();
    initForms();
});

async function loadAllData() {
    try {
        // Esperar Firebase inicializar
        await waitForFirebase();
        
        // Carregar tudo do Firebase
        productsCache = await loadProductsFirebase();
        categoriesCache = await loadCategoriesFirebase();
        slidesCache = await loadSlidesFirebase();
        
        console.log(`✅ Carregados ${productsCache.length} produtos do Firebase`);
        console.log(`✅ Carregadas ${categoriesCache.length} categorias do Firebase`);
        console.log(`✅ Carregados ${slidesCache.length} slides do Firebase`);
    } catch (error) {
        console.error('Erro ao carregar dados do Firebase:', error);
        // Fallback para localStorage se Firebase falhar
        productsCache = JSON.parse(localStorage.getItem('products') || '[]');
        categoriesCache = JSON.parse(localStorage.getItem('categories') || '[]');
        slidesCache = JSON.parse(localStorage.getItem('slides') || '[]');
        console.log('⚠️ Usando dados do LocalStorage como fallback');
    }
}

function waitForFirebase(timeout = 5000) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        const checkFirebase = () => {
            if (window.firebaseDB) {
                resolve();
            } else if (Date.now() - startTime > timeout) {
                reject(new Error('Firebase timeout'));
            } else {
                setTimeout(checkFirebase, 100);
            }
        };
        checkFirebase();
    });
}

// === LOADER ===
function initLoader() {
    const loader = document.getElementById('loader');
    window.addEventListener('load', () => {
        setTimeout(() => {
            loader?.classList.add('hidden');
        }, 1500);
    });
}

// === HERO SLIDER ===
let currentSlide = 0;
let slideInterval;

function initHeroSlider() {
    updateSliderElements();
    const prevBtn = document.getElementById('heroPrev');
    const nextBtn = document.getElementById('heroNext');
    prevBtn?.addEventListener('click', () => changeSlide(-1));
    nextBtn?.addEventListener('click', () => changeSlide(1));
    const dots = document.querySelectorAll('.slider-dot');
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => goToSlide(index));
    });
    startAutoSlide();
}

function loadDynamicSlides() {
    const bgSlider = document.querySelector('.hero-bg-slider');
    const floatSlider = document.querySelector('.floating-element-slider');
    const dotsContainer = document.querySelector('.slider-dots');
    
    if (!bgSlider || !floatSlider || !dotsContainer) return;
    
    const slides = slidesCache.filter(s => s.active).sort((a, b) => (a.order || 0) - (b.order || 0));
    
    if (slides.length === 0) return;
    
    bgSlider.innerHTML = slides.map(slide => 
        `<div class="hero-bg" style="background-image: url('${slide.backgroundImage}');"></div>`
    ).join('');
    
    floatSlider.innerHTML = slides.map(slide => 
        `<div class="floating-element"><img src="${slide.floatingImage}" alt="Producto"></div>`
    ).join('');
    
    dotsContainer.innerHTML = slides.map((_, i) => 
        `<button class="slider-dot ${i === 0 ? 'active' : ''}" data-slide="${i}"></button>`
    ).join('');
    
    currentSlide = 0;
    updateSliderElements();
}

function updateSliderElements() {
    const bgSlides = document.querySelectorAll('.hero-bg');
    const floatElements = document.querySelectorAll('.floating-element');
    const dots = document.querySelectorAll('.slider-dot');
    
    bgSlides.forEach((slide, i) => {
        slide.classList.toggle('active', i === currentSlide);
    });
    
    floatElements.forEach((element, i) => {
        element.classList.toggle('active', i === currentSlide);
    });
    
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentSlide);
    });
}

function changeSlide(direction) {
    const totalSlides = document.querySelectorAll('.hero-bg').length;
    currentSlide = (currentSlide + direction + totalSlides) % totalSlides;
    updateSliderElements();
    resetAutoSlide();
}

function goToSlide(index) {
    currentSlide = index;
    updateSliderElements();
    resetAutoSlide();
}

function startAutoSlide() {
    slideInterval = setInterval(() => {
        changeSlide(1);
    }, 5000);
}

function resetAutoSlide() {
    clearInterval(slideInterval);
    startAutoSlide();
}

// === PRODUCTS ===
function loadProducts(filter = {}) {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    
    let filtered = productsCache;
    
    if (filter.search) {
        const s = filter.search.toLowerCase();
        filtered = filtered.filter(p => p.name.toLowerCase().includes(s) || p.description?.toLowerCase().includes(s));
    }
    
    if (filter.category && filter.category !== 'all') {
        filtered = filtered.filter(p => p.category === filter.category);
    }
    
    if (filter.minPrice) {
        filtered = filtered.filter(p => p.price >= filter.minPrice);
    }
    
    if (filter.maxPrice) {
        filtered = filtered.filter(p => p.price <= filter.maxPrice);
    }
    
    if (filter.featured === 'featured') {
        filtered = filtered.filter(p => p.featured);
    }
    
    if (filtered.length === 0) {
        grid.innerHTML = '<div class="no-results"><i class="fas fa-search"></i><p>No se encontraron productos</p></div>';
        return;
    }
    
    grid.innerHTML = filtered.map(p => `
        <div class="product-card" data-aos="fade-up">
            ${p.featured ? '<div class="product-badge">Destacado</div>' : ''}
            <div class="product-image">
                <img src="${p.image}" alt="${p.name}">
                <div class="product-overlay">
                    <button class="btn btn-icon" onclick="addToCart(${p.id})">
                        <i class="fas fa-shopping-cart"></i>
                    </button>
                    <a href="product-${p.id}.html" class="btn btn-icon">
                        <i class="fas fa-eye"></i>
                    </a>
                </div>
            </div>
            <div class="product-info">
                <span class="product-category">${categoriesCache.find(c=>c.slug===p.category)?.name || p.category}</span>
                <h3 class="product-name">${p.name}</h3>
                <div class="product-rating">${'★'.repeat(p.rating || 5)}${'☆'.repeat(5-(p.rating||5))}</div>
                <p class="product-price">$${(p.price||0).toLocaleString('es-AR')}</p>
            </div>
        </div>
    `).join('');
}

function loadCategoryFilters() {
    const filterContainer = document.getElementById('categoryFilters');
    if (!filterContainer) return;
    
    const categories = [
        { slug: 'all', name: 'Todos', icon: 'fa-th' },
        ...categoriesCache.map(c => ({ slug: c.slug, name: c.name, icon: c.icon || 'fa-tag' }))
    ];
    
    filterContainer.innerHTML = categories.map(c => `
        <button class="category-filter-btn ${c.slug === 'all' ? 'active' : ''}" data-category="${c.slug}">
            <i class="fas ${c.icon}"></i>
            <span>${c.name}</span>
        </button>
    `).join('');
}

function initFilters() {
    const searchInput = document.getElementById('searchInput');
    const categoryBtns = document.querySelectorAll('.category-filter-btn');
    const priceRange = document.getElementById('priceRange');
    const featuredFilter = document.getElementById('featuredFilter');
    
    searchInput?.addEventListener('input', applyFilters);
    priceRange?.addEventListener('input', applyFilters);
    featuredFilter?.addEventListener('change', applyFilters);
    
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            applyFilters();
        });
    });
}

function applyFilters() {
    const search = document.getElementById('searchInput')?.value || '';
    const category = document.querySelector('.category-filter-btn.active')?.dataset.category || 'all';
    const maxPrice = document.getElementById('priceRange')?.value ? parseInt(document.getElementById('priceRange').value) : null;
    const featured = document.getElementById('featuredFilter')?.value;
    
    loadProducts({
        search,
        category,
        maxPrice,
        featured
    });
}

// === CART ===
window.addToCart = function(productId) {
    const product = productsCache.find(p => p.id === productId);
    if (!product) return;
    
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    showNotification('Producto agregado al carrito!');
    updateCartCount();
};

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartCount').textContent = count;
}

function showNotification(msg) {
    const n = document.createElement('div');
    n.style.cssText = 'position:fixed;top:100px;right:20px;background:#fff;padding:1rem 2rem;border-radius:10px;box-shadow:0 10px 30px rgba(0,0,0,0.2);z-index:99999;animation:slideIn 0.3s';
    n.textContent = msg;
    document.body.appendChild(n);
    setTimeout(() => n.remove(), 2000);
}

// === NAVIGATION ===
function initNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    hamburger?.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });
}

function initSearch() {
    const searchBtn = document.querySelector('.search-btn');
    const searchOverlay = document.querySelector('.search-overlay');
    const searchClose = document.querySelector('.search-close');
    
    searchBtn?.addEventListener('click', () => searchOverlay?.classList.add('active'));
    searchClose?.addEventListener('click', () => searchOverlay?.classList.remove('active'));
}

function initAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('[data-aos]').forEach(el => observer.observe(el));
}

function initScrollEffects() {
    window.addEventListener('scroll', () => {
        const header = document.querySelector('.header');
        if (window.scrollY > 100) {
            header?.classList.add('scrolled');
        } else {
            header?.classList.remove('scrolled');
        }
    });
}

function initForms() {
    const newsletterForm = document.getElementById('newsletterForm');
    newsletterForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('newsletterEmail').value;
        showNotification('¡Gracias por suscribirte!');
        newsletterForm.reset();
    });
}

console.log('✅ Main.js with Firebase loaded');
updateCartCount();
