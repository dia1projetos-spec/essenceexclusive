/**
 * FIREBASE ULTRA SIMPLES - SÓ NUVEM, SEM CACHE
 */

const CONFIG = {
    apiKey: "AIzaSyA-pWZ8CSQJURUAgfz9JSVerHGGkovZmbs",
    authDomain: "essence-exclusive-a4252.firebaseapp.com",
    projectId: "essence-exclusive-a4252",
    storageBucket: "essence-exclusive-a4252.firebasestorage.app",
    messagingSenderId: "608148583018",
    appId: "1:608148583018:web:f394b1d511e31190d61013"
};

let db = null;
let auth = null;

// Carregar Firebase
async function initFirebase() {
    try {
        console.log('🔥 Iniciando Firebase...');
        
        // Carregar scripts
        const scripts = [
            'https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js',
            'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js',
            'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js'
        ];
        
        for (const src of scripts) {
            await new Promise((resolve, reject) => {
                const s = document.createElement('script');
                s.src = src;
                s.onload = resolve;
                s.onerror = () => reject(new Error(`Failed to load ${src}`));
                document.head.appendChild(s);
            });
        }
        
        // Init
        firebase.initializeApp(CONFIG);
        db = firebase.firestore();
        auth = firebase.auth();
        
        console.log('✅ Firebase OK');
        
        window.db = db;
        window.auth = auth;
        
        return true;
    } catch (error) {
        console.error('❌ Firebase ERRO:', error);
        alert('ERRO: Firebase não carregou! Veja console (F12)');
        return false;
    }
}

// === PRODUTOS ===
window.DB = {
    // Carregar produtos (SÓ DA NUVEM)
    async getProducts() {
        if (!db) await initFirebase();
        
        try {
            const snapshot = await db.collection('products').get();
            const products = [];
            
            snapshot.forEach(doc => {
                products.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            console.log(`✅ ${products.length} produtos da NUVEM`);
            return products;
        } catch (error) {
            console.error('❌ Erro ao ler produtos:', error);
            throw error;
        }
    },
    
    // Salvar produto
    async saveProduct(product) {
        if (!db) await initFirebase();
        
        try {
            if (product.id && !product.id.startsWith('temp_')) {
                // Update
                await db.collection('products').doc(product.id).set(product, { merge: true });
                console.log('✅ Produto ATUALIZADO na nuvem:', product.id);
            } else {
                // Create
                delete product.id;
                const ref = await db.collection('products').add(product);
                product.id = ref.id;
                console.log('✅ Produto CRIADO na nuvem:', ref.id);
            }
            
            return product.id;
        } catch (error) {
            console.error('❌ Erro ao salvar produto:', error);
            throw error;
        }
    },
    
    // Deletar produto
    async deleteProduct(id) {
        if (!db) await initFirebase();
        
        try {
            await db.collection('products').doc(id).delete();
            console.log('✅ Produto DELETADO da nuvem:', id);
            return true;
        } catch (error) {
            console.error('❌ Erro ao deletar:', error);
            throw error;
        }
    },
    
    // === SLIDES ===
    async getSlides() {
        if (!db) await initFirebase();
        
        try {
            const snapshot = await db.collection('slides').orderBy('order').get();
            const slides = [];
            
            snapshot.forEach(doc => {
                slides.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            console.log(`✅ ${slides.length} slides da NUVEM`);
            return slides;
        } catch (error) {
            console.error('❌ Erro ao ler slides:', error);
            return [];
        }
    },
    
    async saveSlide(slide) {
        if (!db) await initFirebase();
        
        try {
            if (slide.id && !slide.id.startsWith('temp_')) {
                await db.collection('slides').doc(slide.id).set(slide, { merge: true });
                console.log('✅ Slide ATUALIZADO:', slide.id);
            } else {
                delete slide.id;
                const ref = await db.collection('slides').add(slide);
                slide.id = ref.id;
                console.log('✅ Slide CRIADO:', ref.id);
            }
            
            return slide.id;
        } catch (error) {
            console.error('❌ Erro ao salvar slide:', error);
            throw error;
        }
    },
    
    async deleteSlide(id) {
        if (!db) await initFirebase();
        
        try {
            await db.collection('slides').doc(id).delete();
            console.log('✅ Slide DELETADO:', id);
            return true;
        } catch (error) {
            console.error('❌ Erro ao deletar slide:', error);
            throw error;
        }
    },
    
    // === CATEGORIAS ===
    async getCategories() {
        if (!db) await initFirebase();
        
        try {
            const snapshot = await db.collection('categories').get();
            const cats = [];
            
            snapshot.forEach(doc => {
                cats.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            console.log(`✅ ${cats.length} categorias da NUVEM`);
            return cats;
        } catch (error) {
            console.error('❌ Erro ao ler categorias:', error);
            return [];
        }
    },
    
    async saveCategory(cat) {
        if (!db) await initFirebase();
        
        try {
            if (cat.id && !cat.id.startsWith('temp_')) {
                await db.collection('categories').doc(cat.id).set(cat, { merge: true });
            } else {
                delete cat.id;
                const ref = await db.collection('categories').add(cat);
                cat.id = ref.id;
            }
            
            return cat.id;
        } catch (error) {
            console.error('❌ Erro ao salvar categoria:', error);
            throw error;
        }
    }
};

// Auto-init
initFirebase();

console.log('✅ DB helpers carregados');
