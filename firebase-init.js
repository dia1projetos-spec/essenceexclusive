/**
 * Firebase Initialization - Versão Working
 * Usando Firebase v9 Compat (mais estável)
 */

(async function() {
    'use strict';
    
    // Configuração
    const firebaseConfig = {
        apiKey: "AIzaSyA-pWZ8CSQJURUAgfz9JSVerHGGkovZmbs",
        authDomain: "essence-exclusive-a4252.firebaseapp.com",
        projectId: "essence-exclusive-a4252",
        storageBucket: "essence-exclusive-a4252.firebasestorage.app",
        messagingSenderId: "608148583018",
        appId: "1:608148583018:web:f394b1d511e31190d61013"
    };
    
    // Carregar Firebase dinamicamente
    async function loadFirebaseScripts() {
        const scripts = [
            'https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js',
            'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js',
            'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js'
        ];
        
        for (const src of scripts) {
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = src;
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }
    }
    
    try {
        console.log('🔥 Carregando Firebase...');
        
        // Carregar scripts
        await loadFirebaseScripts();
        
        // Inicializar
        if (typeof firebase === 'undefined') {
            throw new Error('Firebase não carregou');
        }
        
        firebase.initializeApp(firebaseConfig);
        
        const db = firebase.firestore();
        const auth = firebase.auth();
        
        // Configurar Firestore para modo offline
        db.enablePersistence({ synchronizeTabs: true })
            .catch((err) => {
                if (err.code === 'failed-precondition') {
                    console.warn('Persistence já ativada em outra aba');
                } else if (err.code === 'unimplemented') {
                    console.warn('Browser não suporta persistence');
                }
            });
        
        // Exportar globalmente
        window.firebaseApp = firebase.app();
        window.firebaseAuth = auth;
        window.firebaseDB = db;
        window.firebase = firebase;
        
        console.log('✅ Firebase inicializado com sucesso!');
        console.log('✅ Firestore pronto');
        
        // Disparar evento
        window.dispatchEvent(new CustomEvent('firebase-ready'));
        
        // Helpers simplificados
        window.FirebaseHelpers = {
            // Produtos
            async loadProducts() {
                try {
                    const snapshot = await db.collection('products').get();
                    const products = [];
                    snapshot.forEach(doc => {
                        products.push({ id: doc.id, ...doc.data() });
                    });
                    console.log(`✅ ${products.length} produtos carregados`);
                    localStorage.setItem('products', JSON.stringify(products));
                    return products;
                } catch (error) {
                    console.error('Erro ao carregar produtos:', error);
                    return JSON.parse(localStorage.getItem('products') || '[]');
                }
            },
            
            async saveProduct(product) {
                try {
                    let docRef;
                    if (product.id && !product.id.startsWith('temp_')) {
                        // Update
                        docRef = db.collection('products').doc(product.id);
                        await docRef.set(product, { merge: true });
                        console.log('✅ Produto atualizado');
                    } else {
                        // Create
                        delete product.id;
                        docRef = await db.collection('products').add(product);
                        product.id = docRef.id;
                        console.log('✅ Produto criado:', docRef.id);
                    }
                    await this.loadProducts();
                    return true;
                } catch (error) {
                    console.error('❌ Erro ao salvar produto:', error);
                    alert('Erro ao salvar: ' + error.message);
                    return false;
                }
            },
            
            async deleteProduct(productId) {
                try {
                    await db.collection('products').doc(productId).delete();
                    console.log('✅ Produto deletado');
                    await this.loadProducts();
                    return true;
                } catch (error) {
                    console.error('❌ Erro ao deletar:', error);
                    return false;
                }
            },
            
            // Slides
            async loadSlides() {
                try {
                    const snapshot = await db.collection('slides').orderBy('order').get();
                    const slides = [];
                    snapshot.forEach(doc => {
                        slides.push({ id: doc.id, ...doc.data() });
                    });
                    console.log(`✅ ${slides.length} slides carregados`);
                    localStorage.setItem('slides', JSON.stringify(slides));
                    return slides;
                } catch (error) {
                    console.error('Erro ao carregar slides:', error);
                    return JSON.parse(localStorage.getItem('slides') || '[]');
                }
            },
            
            async saveSlide(slide) {
                try {
                    let docRef;
                    if (slide.id && !slide.id.startsWith('temp_')) {
                        docRef = db.collection('slides').doc(slide.id);
                        await docRef.set(slide, { merge: true });
                        console.log('✅ Slide atualizado');
                    } else {
                        delete slide.id;
                        docRef = await db.collection('slides').add(slide);
                        slide.id = docRef.id;
                        console.log('✅ Slide criado:', docRef.id);
                    }
                    await this.loadSlides();
                    return true;
                } catch (error) {
                    console.error('❌ Erro ao salvar slide:', error);
                    alert('Erro ao salvar slide: ' + error.message);
                    return false;
                }
            },
            
            async deleteSlide(slideId) {
                try {
                    await db.collection('slides').doc(slideId).delete();
                    console.log('✅ Slide deletado:', slideId);
                    await this.loadSlides();
                    return true;
                } catch (error) {
                    console.error('❌ Erro ao deletar slide:', error);
                    alert('Erro ao deletar: ' + error.message);
                    return false;
                }
            },
            
            // Categorias
            async loadCategories() {
                try {
                    const snapshot = await db.collection('categories').get();
                    const categories = [];
                    snapshot.forEach(doc => {
                        categories.push({ id: doc.id, ...doc.data() });
                    });
                    console.log(`✅ ${categories.length} categorias carregadas`);
                    localStorage.setItem('categories', JSON.stringify(categories));
                    return categories;
                } catch (error) {
                    console.error('Erro ao carregar categorias:', error);
                    return JSON.parse(localStorage.getItem('categories') || '[]');
                }
            },
            
            async saveCategory(category) {
                try {
                    let docRef;
                    if (category.id && !category.id.startsWith('temp_')) {
                        docRef = db.collection('categories').doc(category.id);
                        await docRef.set(category, { merge: true });
                    } else {
                        delete category.id;
                        docRef = await db.collection('categories').add(category);
                        category.id = docRef.id;
                    }
                    await this.loadCategories();
                    return true;
                } catch (error) {
                    console.error('❌ Erro ao salvar categoria:', error);
                    return false;
                }
            }
        };
        
        console.log('✅ FirebaseHelpers pronto');
        
    } catch (error) {
        console.error('❌ ERRO CRÍTICO ao inicializar Firebase:', error);
        console.error('Detalhes:', error.message);
        console.error('Stack:', error.stack);
        
        // Mostrar alerta visual
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = 'position:fixed;top:0;left:0;width:100%;background:#f44336;color:white;padding:1rem;text-align:center;z-index:999999;font-weight:bold;';
        errorDiv.innerHTML = `⚠️ ERRO: Firebase não inicializou! ${error.message}<br><small>Abra o Console (F12) para mais detalhes</small>`;
        document.body.prepend(errorDiv);
    }
})();
