/**
 * FIREBASE DATABASE - Operações de dados com fallback
 */

(function() {
    'use strict';
    
    /**
     * PRODUTOS
     */
    async function loadProducts() {
        try {
            const db = await window.FirebaseCore.waitForFirebase();
            const { collection, getDocs } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            
            const snapshot = await getDocs(collection(db, 'products'));
            const products = [];
            
            snapshot.forEach(doc => {
                products.push({
                    firebaseId: doc.id,
                    ...doc.data()
                });
            });
            
            console.log(`✅ ${products.length} produtos do Firebase`);
            
            // Cache local
            localStorage.setItem('products_cache', JSON.stringify(products));
            
            return products;
        } catch (error) {
            console.warn('⚠️ Usando cache local de produtos');
            return JSON.parse(localStorage.getItem('products_cache') || '[]');
        }
    }
    
    async function saveProduct(product) {
        try {
            const db = await window.FirebaseCore.waitForFirebase();
            const { collection, addDoc, updateDoc, doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            
            if (product.firebaseId) {
                // Update
                await setDoc(doc(db, 'products', product.firebaseId), product, { merge: true });
                console.log('✅ Produto atualizado no Firebase');
            } else {
                // Create
                const docRef = await addDoc(collection(db, 'products'), product);
                product.firebaseId = docRef.id;
                console.log('✅ Produto criado:', docRef.id);
            }
            
            // Atualizar cache
            const products = await loadProducts();
            localStorage.setItem('products_cache', JSON.stringify(products));
            
            return true;
        } catch (error) {
            console.error('❌ Erro ao salvar produto:', error);
            
            // Fallback: salvar local
            const products = JSON.parse(localStorage.getItem('products') || '[]');
            if (product.firebaseId) {
                const idx = products.findIndex(p => p.firebaseId === product.firebaseId);
                if (idx !== -1) products[idx] = product;
            } else {
                product.firebaseId = 'local_' + Date.now();
                products.push(product);
            }
            localStorage.setItem('products', JSON.stringify(products));
            
            return false;
        }
    }
    
    async function deleteProduct(firebaseId) {
        try {
            const db = await window.FirebaseCore.waitForFirebase();
            const { doc, deleteDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            
            await deleteDoc(doc(db, 'products', firebaseId));
            console.log('✅ Produto deletado');
            
            // Atualizar cache
            const products = await loadProducts();
            localStorage.setItem('products_cache', JSON.stringify(products));
            
            return true;
        } catch (error) {
            console.error('❌ Erro ao deletar:', error);
            return false;
        }
    }
    
    /**
     * CATEGORIAS
     */
    async function loadCategories() {
        try {
            const db = await window.FirebaseCore.waitForFirebase();
            const { collection, getDocs } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            
            const snapshot = await getDocs(collection(db, 'categories'));
            const categories = [];
            
            snapshot.forEach(doc => {
                categories.push({
                    firebaseId: doc.id,
                    ...doc.data()
                });
            });
            
            console.log(`✅ ${categories.length} categorias do Firebase`);
            localStorage.setItem('categories_cache', JSON.stringify(categories));
            
            return categories;
        } catch (error) {
            console.warn('⚠️ Usando cache local de categorias');
            return JSON.parse(localStorage.getItem('categories_cache') || '[]');
        }
    }
    
    async function saveCategory(category) {
        try {
            const db = await window.FirebaseCore.waitForFirebase();
            const { collection, addDoc, doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            
            if (category.firebaseId) {
                await setDoc(doc(db, 'categories', category.firebaseId), category, { merge: true });
            } else {
                const docRef = await addDoc(collection(db, 'categories'), category);
                category.firebaseId = docRef.id;
            }
            
            const categories = await loadCategories();
            localStorage.setItem('categories_cache', JSON.stringify(categories));
            
            return true;
        } catch (error) {
            console.error('❌ Erro ao salvar categoria:', error);
            return false;
        }
    }
    
    /**
     * SLIDES
     */
    async function loadSlides() {
        try {
            const db = await window.FirebaseCore.waitForFirebase();
            const { collection, getDocs, query, orderBy } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            
            const q = query(collection(db, 'slides'), orderBy('order'));
            const snapshot = await getDocs(q);
            const slides = [];
            
            snapshot.forEach(doc => {
                slides.push({
                    firebaseId: doc.id,
                    ...doc.data()
                });
            });
            
            console.log(`✅ ${slides.length} slides do Firebase`);
            localStorage.setItem('slides_cache', JSON.stringify(slides));
            
            return slides;
        } catch (error) {
            console.warn('⚠️ Usando cache local de slides');
            return JSON.parse(localStorage.getItem('slides_cache') || '[]');
        }
    }
    
    async function saveSlide(slide) {
        try {
            const db = await window.FirebaseCore.waitForFirebase();
            const { collection, addDoc, doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            
            if (slide.firebaseId) {
                await setDoc(doc(db, 'slides', slide.firebaseId), slide, { merge: true });
            } else {
                const docRef = await addDoc(collection(db, 'slides'), slide);
                slide.firebaseId = docRef.id;
            }
            
            const slides = await loadSlides();
            localStorage.setItem('slides_cache', JSON.stringify(slides));
            
            return true;
        } catch (error) {
            console.error('❌ Erro ao salvar slide:', error);
            return false;
        }
    }
    
    // Exportar API
    window.FirebaseDB = {
        loadProducts,
        saveProduct,
        deleteProduct,
        loadCategories,
        saveCategory,
        loadSlides,
        saveSlide
    };
    
    console.log('✅ Firebase DB module loaded');
    
})();
