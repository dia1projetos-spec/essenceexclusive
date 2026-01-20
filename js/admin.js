/* ADMIN v3.0 - Firebase Integration */
import {compressImage,loadProducts,saveProduct,deleteProduct,loadCategories,saveCategory,loadSlides,saveSlide} from './firebase-integration.js';

let currentEditId=null,currentEditSlideId=null,currentEditCategoryId=null,deleteProductId=null;
let productsCache=[],categoriesCache=[],slidesCache=[];

document.addEventListener('DOMContentLoaded',async()=>{
    await initAdmin();
    initNav();
    initModals();
    initFilters();
    initSidebar();
    initFileUploads();
    await refreshAll();
});

async function initAdmin(){
    const user=localStorage.getItem('adminUser')||sessionStorage.getItem('adminUser');
    if(!user){window.location.href='login.html';return}
    document.getElementById('userEmail').textContent=JSON.parse(user).email;
}

async function refreshAll(){
    showLoadingOverlay(true);
    productsCache=await loadProducts();
    categoriesCache=await loadCategories();
    slidesCache=await loadSlides();
    if(!categoriesCache.length)await initDefCategories();
    if(!slidesCache.length)await initDefSlides();
    loadProductsUI();
    loadCategoriesUI();
    loadSlidesUI();
    loadStats();
    loadCategoryFilters();
    showLoadingOverlay(false);
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

async function initDefCategories(){
    const cats=[
        {name:'Femeninos',slug:'femenino',icon:'fa-venus',subcategories:[]},
        {name:'Masculinos',slug:'masculino',icon:'fa-mars',subcategories:[]},
        {name:'Unisex',slug:'unisex',icon:'fa-star',subcategories:[]}
    ];
    for(const c of cats)await saveCategory(c);
    categoriesCache=await loadCategories();
}

async function initDefSlides(){
    const slides=[
        {backgroundImage:'https://images.unsplash.com/photo-1541643600914-78b084683601?w=1920',floatingImage:'https://images.unsplash.com/photo-1588405748880-12d1d2a59d75?w=600',order:0,active:true},
        {backgroundImage:'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=1920',floatingImage:'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600',order:1,active:true}
    ];
    for(const s of slides)await saveSlide(s);
    slidesCache=await loadSlides();
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
        tb.innerHTML='<tr><td colspan="8" style="text-align:center;padding:3rem;color:#999"><i class="fas fa-inbox" style="font-size:3rem;display:block;margin-bottom:1rem"></i>No se encontraron productos</td></tr>';
        return;
    }
    tb.innerHTML=fp.map(x=>`<tr><td>${x.id||'N/A'}</td><td><div class="product-image-cell"><img src="${x.image}"></div></td><td><strong>${x.name}</strong></td><td><span class="category-badge category-${x.category}">${x.category}</span></td><td><strong>$${(x.price||0).toLocaleString('es-AR')}</strong></td><td>${'★'.repeat(x.rating||5)}${'☆'.repeat(5-(x.rating||5))}</td><td><span class="featured-badge ${x.featured?'featured-yes':'featured-no'}"><i class="fas fa-${x.featured?'star':'circle'}"></i> ${x.featured?'Sí':'No'}</span></td><td><div class="action-buttons"><button class="action-btn action-btn-edit" onclick="editProduct('${x.id}')"><i class="fas fa-edit"></i></button><button class="action-btn action-btn-delete" onclick="confirmDelete('${x.id}')"><i class="fas fa-trash"></i></button></div></td></tr>`).join('');
}

window.editProduct=id=>{
    const p=productsCache.find(x=>x.id===id);
    if(!p)return;
    document.getElementById('modalTitle').textContent='Editar Producto';
    document.getElementById('productId').value=p.id;
    document.getElementById('productName').value=p.name;
    document.getElementById('productCategory').value=p.category;
    document.getElementById('productSubcategory').value=p.subcategory||'';
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
    showLoadingOverlay(true);
    const imgInput=document.getElementById('productImage');
    let imgData='';
    
    if(imgInput.files&&imgInput.files[0]){
        const compressed=await compressImage(imgInput.files[0]);
        imgData=compressed.base64;
    }else if(currentEditId){
        imgData=productsCache.find(x=>x.id===currentEditId).image;
    }
    
    const pd={
        name:document.getElementById('productName').value.trim(),
        category:document.getElementById('productCategory').value,
        subcategory:document.getElementById('productSubcategory').value,
        price:parseInt(document.getElementById('productPrice').value),
        rating:parseInt(document.getElementById('productRating').value)||5,
        image:imgData,
        description:document.getElementById('productDescription').value.trim(),
        featured:document.getElementById('productFeatured').checked
    };
    
    if(!pd.name||!pd.category||!pd.price||!imgData){
        showNotification('Complete todos los campos requeridos','error');
        showLoadingOverlay(false);
        return;
    }
    
    if(currentEditId){
        pd.id=currentEditId;
        pd.firebaseId=productsCache.find(x=>x.id===currentEditId).firebaseId;
    }
    
    const success=await saveProduct(pd);
    if(success){
        showNotification(currentEditId?'Producto actualizado':'Producto agregado','success');
        await refreshAll();
        document.getElementById('productModal').classList.remove('active');
    }else{
        showNotification('Error al guardar producto','error');
    }
    showLoadingOverlay(false);
}

async function deleteProductConfirm(id){
    showLoadingOverlay(true);
    const p=productsCache.find(x=>x.id===id);
    if(p&&p.firebaseId){
        const success=await deleteProduct(p.firebaseId);
        if(success){
            showNotification('Producto eliminado','success');
            await refreshAll();
        }else{
            showNotification('Error al eliminar','error');
        }
    }
    showLoadingOverlay(false);
}

async function saveSlideForm(){
    showLoadingOverlay(true);
    const bgInput=document.getElementById('slideBackgroundImage');
    const floatInput=document.getElementById('slideFloatingImage');
    let bgData='',floatData='';
    
    if(bgInput.files&&bgInput.files[0]){
        const c=await compressImage(bgInput.files[0],1920);
        bgData=c.base64;
    }else if(currentEditSlideId){
        bgData=slidesCache.find(x=>x.id===currentEditSlideId).backgroundImage;
    }
    
    if(floatInput.files&&floatInput.files[0]){
        const c=await compressImage(floatInput.files[0],600);
        floatData=c.base64;
    }else if(currentEditSlideId){
        floatData=slidesCache.find(x=>x.id===currentEditSlideId).floatingImage;
    }
    
    const sd={
        backgroundImage:bgData,
        floatingImage:floatData,
        order:parseInt(document.getElementById('slideOrder').value)||0,
        active:document.getElementById('slideActive').checked
    };
    
    if(!bgData||!floatData){
        showNotification('Agregue ambas imágenes','error');
        showLoadingOverlay(false);
        return;
    }
    
    if(currentEditSlideId){
        sd.id=currentEditSlideId;
        sd.firebaseId=slidesCache.find(x=>x.id===currentEditSlideId).firebaseId;
    }
    
    const success=await saveSlide(sd);
    if(success){
        showNotification(currentEditSlideId?'Slide actualizado':'Slide agregado','success');
        await refreshAll();
        document.getElementById('slideModal').classList.remove('active');
    }else{
        showNotification('Error al guardar slide','error');
    }
    showLoadingOverlay(false);
}

async function saveCategoryForm(){
    showLoadingOverlay(true);
    const cd={
        name:document.getElementById('categoryName').value.trim(),
        slug:document.getElementById('categorySlug').value.trim(),
        icon:document.getElementById('categoryIcon').value.trim(),
        subcategories:[]
    };
    
    if(!cd.name||!cd.slug){
        showNotification('Complete todos los campos','error');
        showLoadingOverlay(false);
        return;
    }
    
    if(currentEditCategoryId){
        cd.id=currentEditCategoryId;
        cd.firebaseId=categoriesCache.find(x=>x.id===currentEditCategoryId).firebaseId;
    }
    
    const success=await saveCategory(cd);
    if(success){
        showNotification(currentEditCategoryId?'Categoría actualizada':'Categoría agregada','success');
        await refreshAll();
        document.getElementById('categoryModal').classList.remove('active');
    }else{
        showNotification('Error al guardar categoría','error');
    }
    showLoadingOverlay(false);
}

function loadCategoriesUI(){
    const list=document.getElementById('categoriesList');
    if(!categoriesCache.length){
        list.innerHTML='<div class="category-empty"><i class="fas fa-tags"></i><p>No hay categorías</p></div>';
        return;
    }
    list.innerHTML=categoriesCache.map(cat=>`<div class="category-item"><div class="category-header"><div class="category-name"><div class="category-icon"><i class="fas ${cat.icon||'fa-tag'}"></i></div><span>${cat.name}</span></div><div class="category-actions"><button class="action-btn action-btn-edit" onclick="editCategory('${cat.id}')"><i class="fas fa-edit"></i></button></div></div></div>`).join('');
}

window.editCategory=id=>{
    const c=categoriesCache.find(x=>x.id===id);
    if(!c)return;
    document.getElementById('categoryModalTitle').textContent='Editar Categoría';
    document.getElementById('categoryId').value=c.id;
    document.getElementById('categoryName').value=c.name;
    document.getElementById('categorySlug').value=c.slug;
    document.getElementById('categoryIcon').value=c.icon||'';
    currentEditCategoryId=id;
    document.getElementById('categoryModal').classList.add('active');
};

function loadSlidesUI(){
    const grid=document.getElementById('slidesGrid');
    if(!slidesCache.length){
        grid.innerHTML='<div class="slides-empty"><i class="fas fa-images"></i><p>No hay slides</p></div>';
        return;
    }
    grid.innerHTML=slidesCache.map(s=>`<div class="slide-card"><div class="slide-bg" style="background-image:url('${s.backgroundImage}')"><div class="slide-floating"><img src="${s.floatingImage}"></div></div><div class="slide-info"><span class="slide-order">Orden: ${s.order}</span><span class="slide-status ${s.active?'active':'inactive'}">${s.active?'Activo':'Inactivo'}</span></div></div>`).join('');
}

function loadCategoryFilters(){
    const sel=document.getElementById('productCategory'),filt=document.getElementById('filterCategory');
    sel.innerHTML='<option value="">Seleccionar...</option>'+categoriesCache.map(x=>`<option value="${x.slug}">${x.name}</option>`).join('');
    filt.innerHTML='<option value="all">Todas las Categorías</option>'+categoriesCache.map(x=>`<option value="${x.slug}">${x.name}</option>`).join('');
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
    
    document.getElementById('addSlideBtn')?.addEventListener('click',()=>{
        document.getElementById('slideModalTitle').textContent='Agregar Slide';
        document.getElementById('slideForm').reset();
        ['slideBackgroundPreview','slideFloatingPreview'].forEach(id=>document.getElementById(id).classList.remove('active'));
        currentEditSlideId=null;
        document.getElementById('slideModal').classList.add('active');
    });
    document.getElementById('slideModalClose')?.addEventListener('click',()=>document.getElementById('slideModal').classList.remove('active'));
    document.getElementById('cancelSlideBtn')?.addEventListener('click',()=>document.getElementById('slideModal').classList.remove('active'));
    document.getElementById('slideForm')?.addEventListener('submit',e=>{e.preventDefault();saveSlideForm()});
    
    document.getElementById('addCategoryBtn')?.addEventListener('click',()=>{
        document.getElementById('categoryModalTitle').textContent='Agregar Categoría';
        document.getElementById('categoryForm').reset();
        currentEditCategoryId=null;
        document.getElementById('categoryModal').classList.add('active');
    });
    document.getElementById('categoryModalClose')?.addEventListener('click',()=>document.getElementById('categoryModal').classList.remove('active'));
    document.getElementById('cancelCategoryBtn')?.addEventListener('click',()=>document.getElementById('categoryModal').classList.remove('active'));
    document.getElementById('categoryForm')?.addEventListener('submit',e=>{e.preventDefault();saveCategoryForm()});
    
    document.getElementById('deleteModalClose')?.addEventListener('click',()=>document.getElementById('deleteModal').classList.remove('active'));
    document.getElementById('cancelDeleteBtn')?.addEventListener('click',()=>document.getElementById('deleteModal').classList.remove('active'));
    document.getElementById('confirmDeleteBtn')?.addEventListener('click',()=>{
        deleteProductConfirm(deleteProductId);
        document.getElementById('deleteModal').classList.remove('active');
    });
}

function initFileUploads(){
    document.getElementById('productImage')?.addEventListener('change',e=>handleFileSelect(e,'productImagePreview'));
    document.getElementById('slideBackgroundImage')?.addEventListener('change',e=>handleFileSelect(e,'slideBackgroundPreview'));
    document.getElementById('slideFloatingImage')?.addEventListener('change',e=>handleFileSelect(e,'slideFloatingPreview'));
}

function handleFileSelect(e,previewId){
    const f=e.target.files[0];
    if(!f)return;
    const fn=e.target.parentElement.querySelector('.file-name');
    fn&&(fn.textContent=f.name);
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
    document.getElementById('filterFeatured')?.addEventListener('change',e=>{
        loadProductsUI({search:document.getElementById('searchProducts').value,category:document.getElementById('filterCategory').value,featured:e.target.value});
    });
}

function initSidebar(){
    document.getElementById('logoutBtn')?.addEventListener('click',()=>{
        localStorage.removeItem('adminUser');
        sessionStorage.removeItem('adminUser');
        window.location.href='login.html';
    });
}

function showNotification(msg,type='info'){
    const n=document.createElement('div');
    n.className=`notification notification-${type}`;
    n.innerHTML=`<i class="fas fa-${type==='success'?'check-circle':type==='error'?'times-circle':'info-circle'}"></i><span>${msg}</span>`;
    n.style.cssText='position:fixed;top:100px;right:20px;background:#fff;padding:1rem 2rem;border-radius:10px;box-shadow:0 10px 30px rgba(0,0,0,0.2);z-index:99999;animation:slideIn 0.3s';
    document.body.appendChild(n);
    setTimeout(()=>n.remove(),3000);
}

function showLoadingOverlay(show){
    const overlay=document.getElementById('loadingOverlay')||createLoadingOverlay();
    overlay.style.display=show?'flex':'none';
}

function createLoadingOverlay(){
    const o=document.createElement('div');
    o.id='loadingOverlay';
    o.style.cssText='position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:999999';
    o.innerHTML='<div style="background:#fff;padding:2rem 3rem;border-radius:15px;text-align:center"><div style="width:50px;height:50px;border:5px solid #f3f3f3;border-top:5px solid #c4a76b;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 1rem"></div><p style="color:#333;font-weight:600">Procesando...</p></div>';
    document.body.appendChild(o);
    const style=document.createElement('style');
    style.textContent='@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}';
    document.head.appendChild(style);
    return o;
}

console.log('✅ Admin with Firebase Integration loaded');
