/* ADMIN COM FIREBASE - Versão eficiente */
let currentEditId=null,currentEditSlideId=null,currentEditCategoryId=null,deleteProductId=null;
let productsCache=[],categoriesCache=[],slidesCache=[];

document.addEventListener('DOMContentLoaded',async()=>{
    checkAuth();
    initNav();
    initModals();
    initFilters();
    initFileUploads();
    await refreshAllData();
});

function checkAuth(){
    const user=localStorage.getItem('adminUser')||sessionStorage.getItem('adminUser');
    if(!user){window.location.href='login.html';return}
    try{
        const userData=JSON.parse(user);
        document.getElementById('userEmail').textContent=userData.email;
    }catch(e){console.error(e)}
}

async function refreshAllData(){
    showLoading(true);
    
    // Carregar do Firebase (com fallback para cache)
    productsCache=await window.FirebaseDB.loadProducts();
    categoriesCache=await window.FirebaseDB.loadCategories();
    slidesCache=await window.FirebaseDB.loadSlides();
    
    // Inicializar dados padrão se vazio
    if(!categoriesCache.length)await initDefaultCategories();
    if(!slidesCache.length)await initDefaultSlides();
    
    // Atualizar UI
    loadProductsUI();
    loadCategoriesUI();
    loadSlidesUI();
    loadStats();
    loadCategoryFilters();
    
    showLoading(false);
}

async function initDefaultCategories(){
    const defaults=[
        {name:'Femeninos',slug:'femenino',icon:'fa-venus',subcategories:[]},
        {name:'Masculinos',slug:'masculino',icon:'fa-mars',subcategories:[]},
        {name:'Unisex',slug:'unisex',icon:'fa-star',subcategories:[]}
    ];
    for(const cat of defaults)await window.FirebaseDB.saveCategory(cat);
    categoriesCache=await window.FirebaseDB.loadCategories();
}

async function initDefaultSlides(){
    const defaults=[
        {backgroundImage:'https://images.unsplash.com/photo-1541643600914-78b084683601?w=1920',floatingImage:'https://images.unsplash.com/photo-1588405748880-12d1d2a59d75?w=600',order:0,active:true}
    ];
    for(const slide of defaults)await window.FirebaseDB.saveSlide(slide);
    slidesCache=await window.FirebaseDB.loadSlides();
}

function initNav(){
    document.querySelectorAll('.nav-item[data-section]').forEach(i=>i.addEventListener('click',e=>{
        e.preventDefault();
        const s=i.dataset.section;
        document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
        i.classList.add('active');
        document.querySelectorAll('.admin-section').forEach(sec=>sec.classList.remove('active'));
        document.getElementById(s+'Section')?.classList.add('active');
    }));
}

function loadStats(){
    document.getElementById('totalProducts').textContent=productsCache.length;
    document.getElementById('featuredProducts').textContent=productsCache.filter(x=>x.featured).length;
    document.getElementById('categories').textContent=categoriesCache.length;
    document.getElementById('totalValue').textContent='$'+productsCache.reduce((s,x)=>s+(x.price||0),0).toLocaleString('es-AR');
}

function loadProductsUI(filter={}){
    let fp=productsCache;
    if(filter.search){const s=filter.search.toLowerCase();fp=fp.filter(x=>x.name.toLowerCase().includes(s))}
    if(filter.category&&filter.category!=='all')fp=fp.filter(x=>x.category===filter.category);
    if(filter.featured&&filter.featured!=='all')fp=fp.filter(x=>x.featured===(filter.featured==='featured'));
    
    const tb=document.getElementById('productsTableBody');
    if(!fp.length){
        tb.innerHTML='<tr><td colspan="8" style="text-align:center;padding:3rem"><i class="fas fa-inbox" style="font-size:3rem;display:block;margin-bottom:1rem"></i>No hay productos</td></tr>';
        return;
    }
    
    tb.innerHTML=fp.map(x=>`<tr><td>${x.id||'N/A'}</td><td><div class="product-image-cell"><img src="${x.image}"></div></td><td><strong>${x.name}</strong></td><td><span class="category-badge">${x.category}</span></td><td><strong>$${(x.price||0).toLocaleString('es-AR')}</strong></td><td>${'★'.repeat(x.rating||5)}</td><td><span class="featured-badge ${x.featured?'featured-yes':'featured-no'}">${x.featured?'Sí':'No'}</span></td><td><button class="action-btn action-btn-edit" onclick="editProduct('${x.firebaseId}')"><i class="fas fa-edit"></i></button><button class="action-btn action-btn-delete" onclick="confirmDelete('${x.firebaseId}')"><i class="fas fa-trash"></i></button></td></tr>`).join('');
}

window.editProduct=id=>{
    const p=productsCache.find(x=>x.firebaseId===id);
    if(!p)return;
    document.getElementById('modalTitle').textContent='Editar Producto';
    document.getElementById('productName').value=p.name;
    document.getElementById('productCategory').value=p.category;
    document.getElementById('productPrice').value=p.price;
    document.getElementById('productRating').value=p.rating||5;
    document.getElementById('productDescription').value=p.description||'';
    document.getElementById('productFeatured').checked=p.featured;
    const prev=document.getElementById('productImagePreview');
    prev.innerHTML=`<img src="${p.image}">`;
    prev.classList.add('active');
    currentEditId=id;
    document.getElementById('productModal').classList.add('active');
};

window.confirmDelete=id=>{deleteProductId=id;document.getElementById('deleteModal').classList.add('active')};

async function saveProductForm(){
    showLoading(true);
    
    const imgInput=document.getElementById('productImage');
    let imgData='';
    
    // Upload e compressão
    if(imgInput.files&&imgInput.files[0]){
        const compressed=await window.FirebaseCore.compressImage(imgInput.files[0]);
        imgData=compressed.base64;
    }else if(currentEditId){
        imgData=productsCache.find(x=>x.firebaseId===currentEditId).image;
    }
    
    const pd={
        name:document.getElementById('productName').value.trim(),
        category:document.getElementById('productCategory').value,
        price:parseInt(document.getElementById('productPrice').value),
        rating:parseInt(document.getElementById('productRating').value)||5,
        image:imgData,
        description:document.getElementById('productDescription').value.trim(),
        featured:document.getElementById('productFeatured').checked
    };
    
    if(!pd.name||!pd.category||!pd.price||!imgData){
        showNotification('Complete todos los campos','error');
        showLoading(false);
        return;
    }
    
    if(currentEditId)pd.firebaseId=currentEditId;
    
    const success=await window.FirebaseDB.saveProduct(pd);
    if(success){
        showNotification(currentEditId?'Producto actualizado':'Producto agregado','success');
        await refreshAllData();
        document.getElementById('productModal').classList.remove('active');
        currentEditId=null;
    }else{
        showNotification('Error al guardar','error');
    }
    
    showLoading(false);
}

async function deleteProductConfirm(){
    showLoading(true);
    const success=await window.FirebaseDB.deleteProduct(deleteProductId);
    if(success){
        showNotification('Producto eliminado','success');
        await refreshAllData();
    }else{
        showNotification('Error al eliminar','error');
    }
    showLoading(false);
}

function loadCategoriesUI(){
    const list=document.getElementById('categoriesList');
    if(!categoriesCache.length){
        list.innerHTML='<div class="category-empty"><i class="fas fa-tags"></i><p>No hay categorías</p></div>';
        return;
    }
    list.innerHTML=categoriesCache.map(cat=>`<div class="category-item"><div class="category-header"><div class="category-name"><div class="category-icon"><i class="fas ${cat.icon||'fa-tag'}"></i></div><span>${cat.name}</span></div></div></div>`).join('');
}

function loadSlidesUI(){
    const grid=document.getElementById('slidesGrid');
    if(!slidesCache.length){
        grid.innerHTML='<div class="slides-empty"><i class="fas fa-images"></i><p>No hay slides</p></div>';
        return;
    }
    grid.innerHTML=slidesCache.map(s=>`<div class="slide-card"><div class="slide-bg" style="background-image:url('${s.backgroundImage}')"><div class="slide-floating"><img src="${s.floatingImage}"></div></div><div class="slide-info"><span>Orden: ${s.order}</span><span class="${s.active?'active':'inactive'}">${s.active?'Activo':'Inactivo'}</span></div></div>`).join('');
}

function loadCategoryFilters(){
    const sel=document.getElementById('productCategory'),filt=document.getElementById('filterCategory');
    sel.innerHTML='<option value="">Seleccionar...</option>'+categoriesCache.map(x=>`<option value="${x.slug}">${x.name}</option>`).join('');
    filt.innerHTML='<option value="all">Todas</option>'+categoriesCache.map(x=>`<option value="${x.slug}">${x.name}</option>`).join('');
}

function initModals(){
    document.getElementById('addProductBtn')?.addEventListener('click',()=>{
        document.getElementById('modalTitle').textContent='Agregar Producto';
        document.getElementById('productForm').reset();
        document.getElementById('productImagePreview').classList.remove('active');
        currentEditId=null;
        document.getElementById('productModal').classList.add('active');
    });
    document.getElementById('modalClose')?.addEventListener('click',()=>document.getElementById('productModal').classList.remove('active'));
    document.getElementById('cancelBtn')?.addEventListener('click',()=>document.getElementById('productModal').classList.remove('active'));
    document.getElementById('productForm')?.addEventListener('submit',e=>{e.preventDefault();saveProductForm()});
    
    document.getElementById('deleteModalClose')?.addEventListener('click',()=>document.getElementById('deleteModal').classList.remove('active'));
    document.getElementById('cancelDeleteBtn')?.addEventListener('click',()=>document.getElementById('deleteModal').classList.remove('active'));
    document.getElementById('confirmDeleteBtn')?.addEventListener('click',()=>{
        deleteProductConfirm();
        document.getElementById('deleteModal').classList.remove('active');
    });
}

function initFileUploads(){
    document.getElementById('productImage')?.addEventListener('change',e=>handleFileSelect(e,'productImagePreview'));
}

function handleFileSelect(e,previewId){
    const f=e.target.files[0];
    if(!f)return;
    const r=new FileReader();
    r.onload=ev=>{
        const p=document.getElementById(previewId);
        p&&(p.innerHTML=`<img src="${ev.target.result}">`,p.classList.add('active'));
    };
    r.readAsDataURL(f);
}

function initFilters(){
    document.getElementById('searchProducts')?.addEventListener('input',e=>{
        loadProductsUI({search:e.target.value,category:document.getElementById('filterCategory').value,featured:document.getElementById('filterFeatured').value});
    });
    document.getElementById('filterCategory')?.addEventListener('change',e=>{
        loadProductsUI({search:document.getElementById('searchProducts').value,category:e.target.value,featured:document.getElementById('filterFeatured').value});
    });
}

document.getElementById('logoutBtn')?.addEventListener('click',()=>{
    if(confirm('¿Cerrar sesión?')){
        localStorage.removeItem('adminUser');
        sessionStorage.removeItem('adminUser');
        window.location.href='login.html';
    }
});

function showNotification(msg,type='info'){
    const n=document.createElement('div');
    n.style.cssText='position:fixed;top:100px;right:20px;background:#fff;padding:1rem 2rem;border-radius:10px;box-shadow:0 10px 30px rgba(0,0,0,0.2);z-index:99999;';
    n.textContent=msg;
    document.body.appendChild(n);
    setTimeout(()=>n.remove(),3000);
}

function showLoading(show){
    let overlay=document.getElementById('loadingOverlay');
    if(!overlay){
        overlay=document.createElement('div');
        overlay.id='loadingOverlay';
        overlay.style.cssText='position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);display:none;align-items:center;justify-content:center;z-index:999999;';
        overlay.innerHTML='<div style="background:#fff;padding:2rem;border-radius:15px;text-align:center"><div style="width:50px;height:50px;border:5px solid #f3f3f3;border-top:5px solid #c4a76b;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 1rem"></div><p>Procesando...</p></div>';
        document.body.appendChild(overlay);
        const style=document.createElement('style');
        style.textContent='@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}';
        document.head.appendChild(style);
    }
    overlay.style.display=show?'flex':'none';
}

console.log('✅ Admin Firebase loaded');
