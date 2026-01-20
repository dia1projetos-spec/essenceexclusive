/* FIREBASE SYNC - Sistema de sincronização completo */

// === ESPERAR FIREBASE ===
function waitForFirebase(timeout = 10000) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        const check = () => {
            if (window.firebaseDB) {
                console.log('✅ Firebase DB ready');
                resolve(window.firebaseDB);
            } else if (Date.now() - startTime > timeout) {
                console.error('❌ Firebase timeout');
                reject(new Error('Firebase timeout'));
            } else {
                setTimeout(check, 100);
            }
        };
        check();
    });
}

// === COMPRESSÃO DE IMAGENS ===
async function compressImage(file, maxWidth = 1200, quality = 0.85) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const img = new Image();
            
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
                
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
                const sizeKB = Math.round((compressedBase64.length * 3) / 4 / 1024);
                
                console.log(`📦 Comprimido: ${sizeKB}KB`);
                
                resolve({
                    base64: compressedBase64,
                    size: sizeKB,
                    width: width,
                    height: height
                });
            };
            
            img.onerror = reject;
            img.src = e.target.result;
        };
        
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// === PRODUTOS ===
async function loadProducts() {
    try {
        const db = await waitForFirebase();
        const { collection, getDocs } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        
        const querySnapshot = await getDocs(collection(db, 'products'));
        const products = [];
        
        querySnapshot.forEach((doc) => {
            products.push({
                firebaseId: doc.id,
                ...doc.data()
            });
        });
        
        console.log(`✅ ${products.length} produtos carregados`);
        return products;
    } catch (error) {
        console.error('❌ Erro ao carregar produtos:', error);
        // Fallback para LocalStorage
        return JSON.parse(localStorage.getItem('products') || '[]');
    }
}

async function saveProduct(product) {
    try {
        const db = await waitForFirebase();
        const { collection, addDoc, updateDoc, doc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        
        if (product.firebaseId) {
            // Update
            await updateDoc(doc(db, 'products', product.firebaseId), product);
            console.log('✅ Produto atualizado');
        } else {
            // Create
            const docRef = await addDoc(collection(db, 'products'), product);
            product.firebaseId = docRef.id;
            console.log('✅ Produto criado:', docRef.id);
        }
        
        return true;
    } catch (error) {
        console.error('❌ Erro ao salvar produto:', error);
        return false;
    }
}

async function deleteProduct(firebaseId) {
    try {
        const db = await waitForFirebase();
        const { doc, deleteDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        
        await deleteDoc(doc(db, 'products', firebaseId));
        console.log('✅ Produto deletado');
        return true;
    } catch (error) {
        console.error('❌ Erro ao deletar:', error);
        return false;
    }
}

// === CATEGORIAS ===
async function loadCategories() {
    try {
        const db = await waitForFirebase();
        const { collection, getDocs } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        
        const querySnapshot = await getDocs(collection(db, 'categories'));
        const categories = [];
        
        querySnapshot.forEach((doc) => {
            categories.push({
                firebaseId: doc.id,
                ...doc.data()
            });
        });
        
        console.log(`✅ ${categories.length} categorias carregadas`);
        return categories;
    } catch (error) {
        console.error('❌ Erro ao carregar categorias:', error);
        return JSON.parse(localStorage.getItem('categories') || '[]');
    }
}

async function saveCategory(category) {
    try {
        const db = await waitForFirebase();
        const { collection, addDoc, updateDoc, doc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        
        if (category.firebaseId) {
            await updateDoc(doc(db, 'categories', category.firebaseId), category);
        } else {
            const docRef = await addDoc(collection(db, 'categories'), category);
            category.firebaseId = docRef.id;
        }
        
        return true;
    } catch (error) {
        console.error('❌ Erro ao salvar categoria:', error);
        return false;
    }
}

// === SLIDES ===
async function loadSlides() {
    try {
        const db = await waitForFirebase();
        const { collection, getDocs, query, orderBy } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        
        const q = query(collection(db, 'slides'), orderBy('order'));
        const querySnapshot = await getDocs(q);
        const slides = [];
        
        querySnapshot.forEach((doc) => {
            slides.push({
                firebaseId: doc.id,
                ...doc.data()
            });
        });
        
        console.log(`✅ ${slides.length} slides carregados`);
        return slides;
    } catch (error) {
        console.error('❌ Erro ao carregar slides:', error);
        return JSON.parse(localStorage.getItem('slides') || '[]');
    }
}

async function saveSlide(slide) {
    try {
        const db = await waitForFirebase();
        const { collection, addDoc, updateDoc, doc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        
        if (slide.firebaseId) {
            await updateDoc(doc(db, 'slides', slide.firebaseId), slide);
        } else {
            const docRef = await addDoc(collection(db, 'slides'), slide);
            slide.firebaseId = docRef.id;
        }
        
        return true;
    } catch (error) {
        console.error('❌ Erro ao salvar slide:', error);
        return false;
    }
}

// Exportar funções
window.FirebaseSync = {
    compressImage,
    loadProducts,
    saveProduct,
    deleteProduct,
    loadCategories,
    saveCategory,
    loadSlides,
    saveSlide,
    waitForFirebase
};

console.log('✅ Firebase Sync loaded');
