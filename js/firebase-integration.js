/* FIREBASE INTEGRATION - Sistema completo com compressão de imagens */

// === COMPRESSÃO DE IMAGENS ===
export async function compressImage(file, maxWidth = 1200, quality = 0.85) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const img = new Image();
            
            img.onload = () => {
                // Criar canvas
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                
                // Redimensionar se necessário
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
                
                canvas.width = width;
                canvas.height = height;
                
                // Desenhar imagem redimensionada
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // Converter para Base64 comprimido
                const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
                
                // Calcular tamanho
                const sizeKB = Math.round((compressedBase64.length * 3) / 4 / 1024);
                
                console.log(`📦 Imagem comprimida: ${sizeKB}KB`);
                
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

// === FIRESTORE OPERATIONS ===
export async function getFirestore() {
    if (!window.firebaseDB) {
        throw new Error('Firebase não inicializado');
    }
    return window.firebaseDB;
}

// PRODUTOS
export async function loadProducts() {
    try {
        const { collection, getDocs } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        const db = await getFirestore();
        
        const querySnapshot = await getDocs(collection(db, 'products'));
        const products = [];
        
        querySnapshot.forEach((doc) => {
            products.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        console.log(`✅ ${products.length} produtos carregados do Firebase`);
        return products;
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        return [];
    }
}

export async function saveProduct(product) {
    try {
        const { collection, addDoc, updateDoc, doc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        const db = await getFirestore();
        
        if (product.firebaseId) {
            // Update existing
            await updateDoc(doc(db, 'products', product.firebaseId), product);
            console.log('✅ Produto atualizado no Firebase');
        } else {
            // Create new
            const docRef = await addDoc(collection(db, 'products'), product);
            product.firebaseId = docRef.id;
            console.log('✅ Produto salvo no Firebase:', docRef.id);
        }
        
        return true;
    } catch (error) {
        console.error('Erro ao salvar produto:', error);
        return false;
    }
}

export async function deleteProduct(productId) {
    try {
        const { doc, deleteDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        const db = await getFirestore();
        
        await deleteDoc(doc(db, 'products', productId));
        console.log('✅ Produto deletado do Firebase');
        return true;
    } catch (error) {
        console.error('Erro ao deletar produto:', error);
        return false;
    }
}

// CATEGORIAS
export async function loadCategories() {
    try {
        const { collection, getDocs } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        const db = await getFirestore();
        
        const querySnapshot = await getDocs(collection(db, 'categories'));
        const categories = [];
        
        querySnapshot.forEach((doc) => {
            categories.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        console.log(`✅ ${categories.length} categorias carregadas do Firebase`);
        return categories;
    } catch (error) {
        console.error('Erro ao carregar categorias:', error);
        return [];
    }
}

export async function saveCategory(category) {
    try {
        const { collection, addDoc, updateDoc, doc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        const db = await getFirestore();
        
        if (category.firebaseId) {
            await updateDoc(doc(db, 'categories', category.firebaseId), category);
        } else {
            const docRef = await addDoc(collection(db, 'categories'), category);
            category.firebaseId = docRef.id;
        }
        
        return true;
    } catch (error) {
        console.error('Erro ao salvar categoria:', error);
        return false;
    }
}

// SLIDES
export async function loadSlides() {
    try {
        const { collection, getDocs, query, orderBy } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        const db = await getFirestore();
        
        const q = query(collection(db, 'slides'), orderBy('order'));
        const querySnapshot = await getDocs(q);
        const slides = [];
        
        querySnapshot.forEach((doc) => {
            slides.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        console.log(`✅ ${slides.length} slides carregados do Firebase`);
        return slides;
    } catch (error) {
        console.error('Erro ao carregar slides:', error);
        return [];
    }
}

export async function saveSlide(slide) {
    try {
        const { collection, addDoc, updateDoc, doc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        const db = await getFirestore();
        
        if (slide.firebaseId) {
            await updateDoc(doc(db, 'slides', slide.firebaseId), slide);
        } else {
            const docRef = await addDoc(collection(db, 'slides'), slide);
            slide.firebaseId = docRef.id;
        }
        
        return true;
    } catch (error) {
        console.error('Erro ao salvar slide:', error);
        return false;
    }
}

// MIGRAÇÃO DE DADOS LOCALSTORAGE → FIREBASE
export async function migrateLocalStorageToFirebase() {
    try {
        console.log('🔄 Iniciando migração...');
        
        // Migrar produtos
        const localProducts = JSON.parse(localStorage.getItem('products') || '[]');
        for (const product of localProducts) {
            await saveProduct(product);
        }
        console.log(`✅ ${localProducts.length} produtos migrados`);
        
        // Migrar categorias
        const localCategories = JSON.parse(localStorage.getItem('categories') || '[]');
        for (const category of localCategories) {
            await saveCategory(category);
        }
        console.log(`✅ ${localCategories.length} categorias migradas`);
        
        // Migrar slides
        const localSlides = JSON.parse(localStorage.getItem('slides') || '[]');
        for (const slide of localSlides) {
            await saveSlide(slide);
        }
        console.log(`✅ ${localSlides.length} slides migrados`);
        
        return true;
    } catch (error) {
        console.error('Erro na migração:', error);
        return false;
    }
}

console.log('✅ Firebase Integration Module loaded');
