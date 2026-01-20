/* MAIN.JS OTIMIZADO - Firebase com fallback */
let productsCache=[],categoriesCache=[],slidesCache=[];

document.addEventListener('DOMContentLoaded',async()=>{
    initLoader();
    initNavigation();
    initSearch();
    initHeroSlider();
    
    // Carregar dados (Firebase ou cache)
    await loadAllData();
    
    loadDynamicSlides();
    loadProducts();
    loadCategoryFilters();
    initFilters();
    updateCartCount();
});

async function loadAllData(){
    try{
        // Tentar carregar do Firebase
        productsCache=await window.FirebaseDB.loadProducts();
        categoriesCache=await window.FirebaseDB.loadCategories();
        slidesCache=await window.FirebaseDB.loadSlides();
    }catch(error){
        console.warn('⚠️ Firebase não disponível, usando cache');
        // Fallback para cache local
        productsCache=JSON.parse(localStorage.getItem('products_cache')||'[]');
        categoriesCache=JSON.parse(localStorage.getItem('categories_cache')||'[]');
        slidesCache=JSON.parse(localStorage.getItem('slides_cache')||'[]');
    }
}

function initLoader(){
    const loader=document.getElementById('loader');
    window.addEventListener('load',()=>{
        setTimeout(()=>loader?.classList.add('hidden'),1500);
    });
}

let currentSlide=0,slideInterval;

function initHeroSlider(){
    updateSliderElements();
    document.getElementById('heroPrev')?.addEventListener('click',()=>changeSlide(-1));
    document.getElementById('heroNext')?.addEventListener('click',()=>changeSlide(1));
    document.querySelectorAll('.slider-dot').forEach((dot,i)=>{
        dot.addEventListener('click',()=>goToSlide(i));
    });
    startAutoSlide();
}

function loadDynamicSlides(){
    const bgSlider=document.querySelector('.hero-bg-slider');
    const floatSlider=document.querySelector('.floating-element-slider');
    const dotsContainer=document.querySelector('.slider-dots');
    
    if(!bgSlider||!floatSlider||!dotsContainer)return;
    
    const slides=slidesCache.filter(s=>s.active).sort((a,b)=>(a.order||0)-(b.order||0));
    
    if(slides.length===0)return;
    
    bgSlider.innerHTML=slides.map(slide=>`<div class="hero-bg" style="background-image:url('${slide.backgroundImage}');"></div>`).join('');
    floatSlider.innerHTML=slides.map(slide=>`<div class="floating-element"><img src="${slide.floatingImage}"></div>`).join('');
    dotsContainer.innerHTML=slides.map((_,i)=>`<button class="slider-dot ${i===0?'active':''}" data-slide="${i}"></button>`).join('');
    
    currentSlide=0;
    updateSliderElements();
}

function updateSliderElements(){
    document.querySelectorAll('.hero-bg').forEach((s,i)=>s.classList.toggle('active',i===currentSlide));
    document.querySelectorAll('.floating-element').forEach((e,i)=>e.classList.toggle('active',i===currentSlide));
    document.querySelectorAll('.slider-dot').forEach((d,i)=>d.classList.toggle('active',i===currentSlide));
}

function changeSlide(direction){
    const total=document.querySelectorAll('.hero-bg').length;
    currentSlide=(currentSlide+direction+total)%total;
    updateSliderElements();
    resetAutoSlide();
}

function goToSlide(index){
    currentSlide=index;
    updateSliderElements();
    resetAutoSlide();
}

function startAutoSlide(){
    slideInterval=setInterval(()=>changeSlide(1),5000);
}

function resetAutoSlide(){
    clearInterval(slideInterval);
    startAutoSlide();
}

function loadProducts(filter={}){
    const grid=document.getElementById('productsGrid');
    if(!grid)return;
    
    let filtered=productsCache;
    
    if(filter.search){const s=filter.search.toLowerCase();filtered=filtered.filter(p=>p.name.toLowerCase().includes(s))}
    if(filter.category&&filter.category!=='all')filtered=filtered.filter(p=>p.category===filter.category);
    if(filter.featured==='featured')filtered=filtered.filter(p=>p.featured);
    
    if(filtered.length===0){
        grid.innerHTML='<div class="no-results"><i class="fas fa-search"></i><p>No se encontraron productos</p></div>';
        return;
    }
    
    grid.innerHTML=filtered.map(p=>`
        <div class="product-card">
            ${p.featured?'<div class="product-badge">Destacado</div>':''}
            <div class="product-image">
                <img src="${p.image}" alt="${p.name}">
                <div class="product-overlay">
                    <button class="btn btn-icon" onclick="addToCart('${p.firebaseId||p.id}')">
                        <i class="fas fa-shopping-cart"></i>
                    </button>
                </div>
            </div>
            <div class="product-info">
                <span class="product-category">${p.category}</span>
                <h3 class="product-name">${p.name}</h3>
                <div class="product-rating">${'★'.repeat(p.rating||5)}</div>
                <p class="product-price">$${(p.price||0).toLocaleString('es-AR')}</p>
            </div>
        </div>
    `).join('');
}

function loadCategoryFilters(){
    const filterContainer=document.getElementById('categoryFilters');
    if(!filterContainer)return;
    
    const categories=[
        {slug:'all',name:'Todos',icon:'fa-th'},
        ...categoriesCache.map(c=>({slug:c.slug,name:c.name,icon:c.icon||'fa-tag'}))
    ];
    
    filterContainer.innerHTML=categories.map(c=>`
        <button class="category-filter-btn ${c.slug==='all'?'active':''}" data-category="${c.slug}">
            <i class="fas ${c.icon}"></i>
            <span>${c.name}</span>
        </button>
    `).join('');
}

function initFilters(){
    const searchInput=document.getElementById('searchInput');
    const categoryBtns=document.querySelectorAll('.category-filter-btn');
    
    searchInput?.addEventListener('input',applyFilters);
    
    categoryBtns.forEach(btn=>{
        btn.addEventListener('click',()=>{
            categoryBtns.forEach(b=>b.classList.remove('active'));
            btn.classList.add('active');
            applyFilters();
        });
    });
}

function applyFilters(){
    const search=document.getElementById('searchInput')?.value||'';
    const category=document.querySelector('.category-filter-btn.active')?.dataset.category||'all';
    
    loadProducts({search,category});
}

window.addToCart=function(productId){
    const product=productsCache.find(p=>(p.firebaseId||p.id)===productId);
    if(!product)return;
    
    let cart=JSON.parse(localStorage.getItem('cart')||'[]');
    const existingItem=cart.find(item=>(item.firebaseId||item.id)===productId);
    
    if(existingItem){
        existingItem.quantity+=1;
    }else{
        cart.push({...product,quantity:1});
    }
    
    localStorage.setItem('cart',JSON.stringify(cart));
    showNotification('Producto agregado al carrito!');
    updateCartCount();
};

function updateCartCount(){
    const cart=JSON.parse(localStorage.getItem('cart')||'[]');
    const count=cart.reduce((sum,item)=>sum+item.quantity,0);
    const cartCountEl=document.getElementById('cartCount');
    if(cartCountEl)cartCountEl.textContent=count;
}

function showNotification(msg){
    const n=document.createElement('div');
    n.style.cssText='position:fixed;top:100px;right:20px;background:#fff;padding:1rem 2rem;border-radius:10px;box-shadow:0 10px 30px rgba(0,0,0,0.2);z-index:99999;';
    n.textContent=msg;
    document.body.appendChild(n);
    setTimeout(()=>n.remove(),2000);
}

function initNavigation(){
    const hamburger=document.querySelector('.hamburger');
    const navLinks=document.querySelector('.nav-links');
    
    hamburger?.addEventListener('click',()=>{
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });
}

function initSearch(){
    const searchBtn=document.querySelector('.search-btn');
    const searchOverlay=document.querySelector('.search-overlay');
    const searchClose=document.querySelector('.search-close');
    
    searchBtn?.addEventListener('click',()=>searchOverlay?.classList.add('active'));
    searchClose?.addEventListener('click',()=>searchOverlay?.classList.remove('active'));
}

console.log('✅ Main.js optimized loaded');
