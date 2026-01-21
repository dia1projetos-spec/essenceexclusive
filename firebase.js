/**
 * FIREBASE ULTRA SIMPLES - VERSÃO QUE FUNCIONA
 */

const firebaseConfig = {
    apiKey: "AIzaSyA-pWZ8CSQJURUAgfz9JSVerHGGkovZmbs",
    authDomain: "essence-exclusive-a4252.firebaseapp.com",
    projectId: "essence-exclusive-a4252",
    storageBucket: "essence-exclusive-a4252.firebasestorage.app",
    messagingSenderId: "608148583018",
    appId: "1:608148583018:web:f394b1d511e31190d61013"
};

// Variáveis globais
let db = null;
let auth = null;

// Inicializar Firebase
async function initFirebase() {
    try {
        // Carregar Firebase scripts
        if (typeof firebase === 'undefined') {
            await loadScript('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
            await loadScript('https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js');
            await loadScript('https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js');
        }
        
        // Inicializar
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        
        db = firebase.firestore();
        auth = firebase.auth();
        
        console.log('✅ Firebase conectado');
        return true;
    } catch (error) {
        console.error('❌ Erro Firebase:', error);
        return false;
    }
}

function loadScript(src) {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// PRODUTOS
async function getAllProducts() {
    try {
        const snapshot = await db.collection('products').get();
        const products = [];
        snapshot.forEach(doc => products.push({ id: doc.id, ...doc.data() }));
        localStorage.setItem('products', JSON.stringify(products));
        console.log(`✅ ${products.length} produtos carregados`);
        return products;
    } catch (error) {
        console.error('Erro:', error);
        return JSON.parse(localStorage.getItem('products') || '[]');
    }
}

async function saveProduct(product) {
    try {
        if (product.id && !product.id.startsWith('temp')) {
            await db.collection('products').doc(product.id).set(product);
            console.log('✅ Produto atualizado');
        } else {
            const ref = await db.collection('products').add(product);
            console.log('✅ Produto criado:', ref.id);
        }
        return true;
    } catch (error) {
        console.error('❌ Erro ao salvar:', error);
        alert('Erro: ' + error.message);
        return false;
    }
}

async function deleteProduct(id) {
    try {
        await db.collection('products').doc(id).delete();
        console.log('✅ Produto deletado');
        return true;
    } catch (error) {
        console.error('❌ Erro:', error);
        return false;
    }
}

// SLIDES
async function getAllSlides() {
    try {
        const snapshot = await db.collection('slides').orderBy('order').get();
        const slides = [];
        snapshot.forEach(doc => slides.push({ id: doc.id, ...doc.data() }));
        localStorage.setItem('slides', JSON.stringify(slides));
        console.log(`✅ ${slides.length} slides carregados`);
        return slides;
    } catch (error) {
        console.error('Erro:', error);
        return JSON.parse(localStorage.getItem('slides') || '[]');
    }
}

async function saveSlide(slide) {
    try {
        if (slide.id && !slide.id.startsWith('temp')) {
            await db.collection('slides').doc(slide.id).set(slide);
            console.log('✅ Slide atualizado');
        } else {
            const ref = await db.collection('slides').add(slide);
            console.log('✅ Slide criado:', ref.id);
        }
        return true;
    } catch (error) {
        console.error('❌ Erro ao salvar slide:', error);
        alert('Erro: ' + error.message);
        return false;
    }
}

async function deleteSlide(id) {
    try {
        await db.collection('slides').doc(id).delete();
        console.log('✅ Slide deletado');
        return true;
    } catch (error) {
        console.error('❌ Erro:', error);
        alert('Erro: ' + error.message);
        return false;
    }
}

// CATEGORIAS
async function getAllCategories() {
    try {
        const snapshot = await db.collection('categories').get();
        const categories = [];
        snapshot.forEach(doc => categories.push({ id: doc.id, ...doc.data() }));
        localStorage.setItem('categories', JSON.stringify(categories));
        console.log(`✅ ${categories.length} categorias carregadas`);
        return categories;
    } catch (error) {
        console.error('Erro:', error);
        return JSON.parse(localStorage.getItem('categories') || '[]');
    }
}

async function saveCategory(category) {
    try {
        if (category.id && !category.id.startsWith('temp')) {
            await db.collection('categories').doc(category.id).set(category);
        } else {
            await db.collection('categories').add(category);
        }
        return true;
    } catch (error) {
        console.error('❌ Erro:', error);
        return false;
    }
}

// Inicializar automaticamente
initFirebase();

console.log('📦 Firebase.js carregado');
