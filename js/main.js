/* ========================================
   ESSENCE EXCLUSIVE - MAIN JAVASCRIPT
   ======================================== */

// === INITIALIZATION ===
document.addEventListener('DOMContentLoaded', async () => {
    initLoader();
    initNavigation();
    initSearch();
    initAnimations();
    initScrollEffects();
    initHeroSlider();
    
    // Carregar dados do Firebase/LocalStorage
    await loadDataFromFirebase();
    
    loadDynamicSlides();
    loadProducts();
    loadCategoryFilters();
    initFilters();
    initForms();
});

// Carregar dados do Firebase (ou cache)
async function loadDataFromFirebase() {
    if (window.FirebaseProducts && window.FirebaseSlides && window.FirebaseCategories) {
        console.log('🔄 Carregando dados do Firebase...');
        // Aguardar módulos estarem disponíveis
        await new Promise(resolve => setTimeout(resolve, 100));
    } else {
        console.log('⚠️ Módulos Firebase não carregados, usando LocalStorage');
    }
}

// === LOADER ===
function initLoader() {
    const loader = document.getElementById('loader');
    
    window.addEventListener('load', () => {
        setTimeout(() => {
            loader.classList.add('hidden');
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
    
    // Próximo slide
    function nextSlide() {
        const bgSlides = document.querySelectorAll('.hero-bg-slide');
        if (!bgSlides.length) return;
        const next = (currentSlide + 1) % bgSlides.length;
        goToSlide(next);
    }
    
    // Slide anterior
    function prevSlide() {
        const bgSlides = document.querySelectorAll('.hero-bg-slide');
        if (!bgSlides.length) return;
        const prev = (currentSlide - 1 + bgSlides.length) % bgSlides.length;
        goToSlide(prev);
    }
    
    // Event listeners para botões
    nextBtn?.addEventListener('click', () => {
        nextSlide();
        resetInterval();
    });
    
    prevBtn?.addEventListener('click', () => {
        prevSlide();
        resetInterval();
    });
    
    // Auto-play
    function startAutoPlay() {
        slideInterval = setInterval(nextSlide, 5000);
    }
    
    function resetInterval() {
        clearInterval(slideInterval);
        startAutoPlay();
    }
    
    // Pausar ao passar o mouse
    const heroSection = document.querySelector('.hero');
    heroSection?.addEventListener('mouseenter', () => {
        clearInterval(slideInterval);
    });
    
    heroSection?.addEventListener('mouseleave', () => {
        startAutoPlay();
    });
    
    // Iniciar auto-play
    startAutoPlay();
    
    // Controles com teclado
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            prevSlide();
            resetInterval();
        } else if (e.key === 'ArrowRight') {
            nextSlide();
            resetInterval();
        }
    });
}

function goToSlide(index) {
    const bgSlides = document.querySelectorAll('.hero-bg-slide');
    const floatingElements = document.querySelectorAll('.floating-element');
    const dots = document.querySelectorAll('.slider-dot');
    
    bgSlides.forEach(slide => slide.classList.remove('active'));
    floatingElements.forEach(el => el.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    bgSlides[index]?.classList.add('active');
    floatingElements[index]?.classList.add('active');
    dots[index]?.classList.add('active');
    
    currentSlide = index;
}

function updateSliderElements() {
    const bgSlides = document.querySelectorAll('.hero-bg-slide');
    const floatingElements = document.querySelectorAll('.floating-element');
    const dots = document.querySelectorAll('.slider-dot');
    
    // Attach click events to dots
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            goToSlide(index);
            clearInterval(slideInterval);
            slideInterval = setInterval(() => {
                const next = (currentSlide + 1) % bgSlides.length;
                goToSlide(next);
            }, 5000);
        });
    });
}

// === LOAD DYNAMIC SLIDES ===
function loadDynamicSlides() {
    try {
        const slides = JSON.parse(localStorage.getItem('slides')) || [];
        if (!slides.length) return;
        
        const activeSlides = slides.filter(s => s.active).sort((a, b) => a.order - b.order);
        if (!activeSlides.length) return;
        
        // Update background slides
        const bgSlider = document.querySelector('.hero-bg-slider');
        const overlay = bgSlider?.querySelector('.hero-overlay');
        if (bgSlider) {
            // Remove old slides but keep overlay
            bgSlider.querySelectorAll('.hero-bg-slide').forEach(s => s.remove());
            
            // Add new slides
            activeSlides.forEach((slide, index) => {
                const bgSlide = document.createElement('div');
                bgSlide.className = 'hero-bg-slide' + (index === 0 ? ' active' : '');
                bgSlide.style.backgroundImage = `url('${slide.backgroundImage}')`;
                bgSlider.insertBefore(bgSlide, overlay);
            });
        }
        
        // Update floating elements
        const floatingSlider = document.querySelector('.floating-element-slider');
        if (floatingSlider) {
            floatingSlider.innerHTML = activeSlides.map((slide, index) => `
                <div class="floating-element${index === 0 ? ' active' : ''}">
                    <img src="${slide.floatingImage}" alt="Slide ${index + 1}">
                </div>
            `).join('');
        }
        
        // Update dots
        const dotsContainer = document.getElementById('heroDotsContainer');
        if (dotsContainer) {
            dotsContainer.innerHTML = activeSlides.map((_, index) => 
                `<span class="slider-dot${index === 0 ? ' active' : ''}" data-slide="${index}"></span>`
            ).join('');
        }
        
        // Re-initialize slider controls
        updateSliderElements();
    } catch (error) {
        console.error('Error loading slides:', error);
    }
}

// === LOAD CATEGORY FILTERS ===
function loadCategoryFilters() {
    try {
        const categories = JSON.parse(localStorage.getItem('categories')) || [];
        const filterContainer = document.getElementById('categoryFilters');
        
        if (filterContainer && categories.length) {
            filterContainer.innerHTML = categories.map(cat => 
                `<button class="filter-btn" data-filter="${cat.slug}">${cat.name}</button>`
            ).join('');
        }
    } catch (error) {
        console.error('Error loading category filters:', error);
    }
}

// === NAVIGATION ===
function initNavigation() {
    const header = document.querySelector('.header');
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
    
    // Mobile menu toggle
    menuToggle?.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        menuToggle.classList.toggle('active');
    });
    
    // Active link on scroll
    const sections = document.querySelectorAll('section[id]');
    
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        
        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 150;
            const sectionId = section.getAttribute('id');
            
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    });
    
    // Smooth scroll
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 100;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
                
                navMenu.classList.remove('active');
            }
        });
    });
}

// === SEARCH MODAL ===
function initSearch() {
    const searchBtn = document.getElementById('searchBtn');
    const searchModal = document.getElementById('searchModal');
    const searchClose = document.getElementById('searchClose');
    const searchInput = document.getElementById('searchInput');
    
    searchBtn?.addEventListener('click', () => {
        searchModal.classList.add('active');
        setTimeout(() => searchInput.focus(), 300);
    });
    
    searchClose?.addEventListener('click', () => {
        searchModal.classList.remove('active');
    });
    
    searchModal?.addEventListener('click', (e) => {
        if (e.target === searchModal) {
            searchModal.classList.remove('active');
        }
    });
    
    // Search functionality
    searchInput?.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        filterProducts(searchTerm);
    });
}

// === ANIMATIONS ===
function initAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('aos-animate');
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('[data-aos]').forEach(element => {
        observer.observe(element);
    });
}

// === SCROLL EFFECTS ===
function initScrollEffects() {
    const scrollTop = document.getElementById('scrollTop');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            scrollTop.classList.add('active');
        } else {
            scrollTop.classList.remove('active');
        }
    });
    
    scrollTop?.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// === PRODUCTS DATA ===
function getProducts() {
    const storedProducts = localStorage.getItem('products');
    
    if (storedProducts) {
        return JSON.parse(storedProducts);
    }
    
    // Default demo products
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
    
    localStorage.setItem('products', JSON.stringify(defaultProducts));
    return defaultProducts;
}

// === LOAD PRODUCTS ===
function loadProducts() {
    const products = getProducts();
    const featuredContainer = document.getElementById('featuredProducts');
    const allProductsContainer = document.getElementById('allProducts');
    
    // Load featured products
    if (featuredContainer) {
        const featuredProducts = products.filter(p => p.featured);
        featuredContainer.innerHTML = featuredProducts.map(product => createProductCard(product)).join('');
    }
    
    // Load all products
    if (allProductsContainer) {
        allProductsContainer.innerHTML = products.map(product => createProductCard(product)).join('');
    }
    
    // Add event listeners to add-to-cart buttons
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const productId = parseInt(btn.dataset.productId);
            addToCart(productId);
        });
    });
}

// === CREATE PRODUCT CARD ===
function createProductCard(product) {
    const stars = '★'.repeat(product.rating) + '☆'.repeat(5 - product.rating);
    
    return `
        <div class="product-card" data-category="${product.category}">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
                ${product.featured ? '<span class="product-badge">Destacado</span>' : ''}
                <div class="product-actions">
                    <button class="action-btn" title="Vista rápida">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn" title="Agregar a favoritos">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
            </div>
            <div class="product-info">
                <p class="product-category">${product.category}</p>
                <h3 class="product-title">${product.name}</h3>
                <div class="product-rating">
                    ${stars.split('').map(star => `<i class="fas fa-star${star === '☆' ? '-o' : ''}"></i>`).join('')}
                </div>
                <div class="product-footer">
                    <span class="product-price">$${product.price.toLocaleString('es-AR')}</span>
                    <button class="add-to-cart" data-product-id="${product.id}">
                        <i class="fas fa-shopping-cart"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// === FILTER PRODUCTS ===
function initFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active button
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filter = btn.dataset.filter;
            const productCards = document.querySelectorAll('.product-card');
            
            productCards.forEach(card => {
                if (filter === 'all' || card.dataset.category === filter) {
                    card.style.display = 'block';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 10);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
}

// === SEARCH FILTER ===
function filterProducts(searchTerm) {
    const products = getProducts();
    const allProductsContainer = document.getElementById('allProducts');
    
    if (!searchTerm) {
        allProductsContainer.innerHTML = products.map(product => createProductCard(product)).join('');
        return;
    }
    
    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm)
    );
    
    allProductsContainer.innerHTML = filteredProducts.map(product => createProductCard(product)).join('');
    
    // Re-attach event listeners
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const productId = parseInt(btn.dataset.productId);
            addToCart(productId);
        });
    });
}

// === ADD TO CART ===
function addToCart(productId) {
    const products = getProducts();
    const product = products.find(p => p.id === productId);
    
    if (!product) return;
    
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
    showNotification('Producto agregado al carrito');
}

// === UPDATE CART UI ===
function updateCartUI() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const totalPrice = document.getElementById('totalPrice');
    
    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCount) {
        cartCount.textContent = totalItems;
    }
    
    // Update cart items
    if (cartItems) {
        if (cart.length === 0) {
            cartItems.innerHTML = `
                <div class="cart-empty">
                    <i class="fas fa-shopping-bag"></i>
                    <p>Tu carrito está vacío</p>
                </div>
            `;
        } else {
            cartItems.innerHTML = cart.map(item => `
                <div class="cart-item">
                    <div class="cart-item-image">
                        <img src="${item.image}" alt="${item.name}">
                    </div>
                    <div class="cart-item-details">
                        <h4 class="cart-item-title">${item.name}</h4>
                        <p class="cart-item-price">$${item.price.toLocaleString('es-AR')}</p>
                        <div class="cart-item-quantity">
                            <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                            <span>${item.quantity}</span>
                            <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                        </div>
                    </div>
                    <button class="cart-item-remove" onclick="removeFromCart(${item.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `).join('');
        }
    }
    
    // Update total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (totalPrice) {
        totalPrice.textContent = `$${total.toLocaleString('es-AR')}`;
    }
}

// === UPDATE QUANTITY ===
function updateQuantity(productId, change) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const item = cart.find(i => i.id === productId);
    
    if (item) {
        item.quantity += change;
        
        if (item.quantity <= 0) {
            cart = cart.filter(i => i.id !== productId);
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartUI();
    }
}

// === REMOVE FROM CART ===
function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.id !== productId);
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
    showNotification('Producto eliminado del carrito');
}

// === NOTIFICATION ===
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: linear-gradient(135deg, #4ecca3 0%, #93e4c1 100%);
        color: white;
        padding: 1rem 2rem;
        border-radius: 50px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        z-index: 99999;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// === FORMS ===
function initForms() {
    const newsletterForm = document.querySelector('.newsletter-form');
    const contactForm = document.querySelector('.contact-form');
    
    newsletterForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = e.target.querySelector('input[type="email"]').value;
        showNotification(`¡Gracias por suscribirte! Te enviaremos novedades a ${email}`);
        e.target.reset();
    });
    
    contactForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        showNotification('¡Mensaje enviado! Te contactaremos pronto.');
        e.target.reset();
    });
}

// === CHECKOUT ===
document.getElementById('checkoutBtn')?.addEventListener('click', () => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (cart.length === 0) {
        showNotification('Tu carrito está vacío');
        return;
    }
    
    showNotification('Redirigiendo al checkout...');
    // Here you would redirect to checkout page
    // window.location.href = 'checkout.html';
});

// === EXPOSE FUNCTIONS TO WINDOW ===
window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;

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
