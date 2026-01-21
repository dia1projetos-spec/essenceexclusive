// Firebase Bundle - Standalone version
// This is a simplified version that works without build tools

(function() {
    'use strict';
    
    // Firebase configuration
    const firebaseConfig = {
        apiKey: "AIzaSyA-pWZ8CSQJURUAgfz9JSVerHGGkovZmbs",
        authDomain: "essence-exclusive-a4252.firebaseapp.com",
        projectId: "essence-exclusive-a4252",
        storageBucket: "essence-exclusive-a4252.firebasestorage.app",
        messagingSenderId: "608148583018",
        appId: "1:608148583018:web:f394b1d511e31190d61013"
    };
    
    // Initialize Firebase using CDN (more reliable)
    window.initFirebaseApp = async function() {
        try {
            // Load Firebase scripts
            await loadScript('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
            await loadScript('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js');
            await loadScript('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js');
            
            // Initialize
            firebase.initializeApp(firebaseConfig);
            window.firebaseApp = firebase.app();
            window.firebaseAuth = firebase.auth();
            window.firebaseDB = firebase.firestore();
            
            console.log('✅ Firebase initialized');
            return true;
        } catch (error) {
            console.error('❌ Firebase init error:', error);
            return false;
        }
    };
    
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
    
    // Helper functions
    window.FirebaseHelpers = {
        // Products
        async loadProducts() {
            try {
                if (!window.firebaseDB) await window.initFirebaseApp();
                
                const snapshot = await window.firebaseDB.collection('products').get();
                const products = [];
                
                snapshot.forEach(doc => {
                    products.push({ id: doc.id, ...doc.data() });
                });
                
                console.log(`✅ Loaded ${products.length} products`);
                localStorage.setItem('products', JSON.stringify(products));
                return products;
            } catch (error) {
                console.error('Error loading products:', error);
                return JSON.parse(localStorage.getItem('products') || '[]');
            }
        },
        
        async saveProduct(product) {
            try {
                if (!window.firebaseDB) await window.initFirebaseApp();
                
                if (product.id && !product.id.startsWith('temp_')) {
                    await window.firebaseDB.collection('products').doc(product.id).set(product);
                    console.log('✅ Product updated');
                } else {
                    const docRef = await window.firebaseDB.collection('products').add(product);
                    product.id = docRef.id;
                    console.log('✅ Product created:', docRef.id);
                }
                
                await this.loadProducts();
                return true;
            } catch (error) {
                console.error('Error saving product:', error);
                return false;
            }
        },
        
        async deleteProduct(productId) {
            try {
                if (!window.firebaseDB) await window.initFirebaseApp();
                
                await window.firebaseDB.collection('products').doc(productId).delete();
                console.log('✅ Product deleted');
                
                await this.loadProducts();
                return true;
            } catch (error) {
                console.error('Error deleting product:', error);
                return false;
            }
        },
        
        // Slides
        async loadSlides() {
            try {
                if (!window.firebaseDB) await window.initFirebaseApp();
                
                const snapshot = await window.firebaseDB.collection('slides').orderBy('order').get();
                const slides = [];
                
                snapshot.forEach(doc => {
                    slides.push({ id: doc.id, ...doc.data() });
                });
                
                console.log(`✅ Loaded ${slides.length} slides`);
                localStorage.setItem('slides', JSON.stringify(slides));
                return slides;
            } catch (error) {
                console.error('Error loading slides:', error);
                return JSON.parse(localStorage.getItem('slides') || '[]');
            }
        },
        
        async saveSlide(slide) {
            try {
                if (!window.firebaseDB) await window.initFirebaseApp();
                
                if (slide.id && !slide.id.startsWith('temp_')) {
                    await window.firebaseDB.collection('slides').doc(slide.id).set(slide);
                } else {
                    const docRef = await window.firebaseDB.collection('slides').add(slide);
                    slide.id = docRef.id;
                }
                
                await this.loadSlides();
                return true;
            } catch (error) {
                console.error('Error saving slide:', error);
                return false;
            }
        },
        
        // Categories
        async loadCategories() {
            try {
                if (!window.firebaseDB) await window.initFirebaseApp();
                
                const snapshot = await window.firebaseDB.collection('categories').get();
                const categories = [];
                
                snapshot.forEach(doc => {
                    categories.push({ id: doc.id, ...doc.data() });
                });
                
                console.log(`✅ Loaded ${categories.length} categories`);
                localStorage.setItem('categories', JSON.stringify(categories));
                return categories;
            } catch (error) {
                console.error('Error loading categories:', error);
                return JSON.parse(localStorage.getItem('categories') || '[]');
            }
        },
        
        async saveCategory(category) {
            try {
                if (!window.firebaseDB) await window.initFirebaseApp();
                
                if (category.id && !category.id.startsWith('temp_')) {
                    await window.firebaseDB.collection('categories').doc(category.id).set(category);
                } else {
                    const docRef = await window.firebaseDB.collection('categories').add(category);
                    category.id = docRef.id;
                }
                
                await this.loadCategories();
                return true;
            } catch (error) {
                console.error('Error saving category:', error);
                return false;
            }
        }
    };
    
    // Auto-initialize
    window.initFirebaseApp();
    
})();

console.log('✅ Firebase Bundle loaded');
