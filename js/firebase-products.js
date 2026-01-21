/**
 * FIREBASE PRODUCTS - Gerenciamento de produtos com Firebase + LocalStorage fallback
 */

// === CARREGAR PRODUTOS ===
async function loadProductsFromFirebase() {
    try {
        const db = await window.waitForFirebase(3000);
        const { collection, getDocs } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        
        const snapshot = await getDocs(collection(db, 'products'));
        const products = [];
        
        snapshot.forEach(doc => {
            products.push({
                firebaseId: doc.id,
                id: doc.id,
                ...doc.data()
            });
        });
        
        console.log(`✅ ${products.length} produtos do Firebase`);
        
        // Salvar cache
        localStorage.setItem('products', JSON.stringify(products));
        
        return products;
        
    } catch (error) {
        console.warn('⚠️ Firebase indisponível, usando cache local');
        return JSON.parse(localStorage.getItem('products') || '[]');
    }
}

// === SALVAR PRODUTO ===
async function saveProductToFirebase(product) {
    // Sempre salvar no LocalStorage primeiro
    let localProducts = JSON.parse(localStorage.getItem('products') || '[]');
    
    if (product.firebaseId) {
        // Update
        const idx = localProducts.findIndex(p => p.firebaseId === product.firebaseId || p.id === product.firebaseId);
        if (idx !== -1) {
            localProducts[idx] = product;
        }
    } else {
        // Create
        product.id = 'local_' + Date.now();
        product.firebaseId = product.id;
        localProducts.push(product);
    }
    
    localStorage.setItem('products', JSON.stringify(localProducts));
    console.log('💾 Produto salvo no LocalStorage');
    
    // Tentar salvar no Firebase
    try {
        const db = await window.waitForFirebase(3000);
        const { collection, addDoc, doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        
        if (product.firebaseId && !product.firebaseId.startsWith('local_')) {
            // Update no Firebase
            await setDoc(doc(db, 'products', product.firebaseId), product);
            console.log('✅ Produto atualizado no Firebase');
        } else {
            // Create no Firebase
            const docRef = await addDoc(collection(db, 'products'), product);
            
            // Atualizar ID local com ID do Firebase
            product.firebaseId = docRef.id;
            product.id = docRef.id;
            
            const idx = localProducts.findIndex(p => p.id.startsWith('local_'));
            if (idx !== -1) {
                localProducts[idx] = product;
                localStorage.setItem('products', JSON.stringify(localProducts));
            }
            
            console.log('✅ Produto criado no Firebase:', docRef.id);
        }
        
        return true;
        
    } catch (error) {
        console.warn('⚠️ Não foi possível salvar no Firebase, apenas local:', error.message);
        return true; // Retorna true mesmo assim pois salvou local
    }
}

// === DELETAR PRODUTO ===
async function deleteProductFromFirebase(productId) {
    // Deletar do LocalStorage
    let localProducts = JSON.parse(localStorage.getItem('products') || '[]');
    localProducts = localProducts.filter(p => p.firebaseId !== productId && p.id !== productId);
    localStorage.setItem('products', JSON.stringify(localProducts));
    console.log('💾 Produto deletado do LocalStorage');
    
    // Tentar deletar do Firebase
    try {
        const db = await window.waitForFirebase(3000);
        const { doc, deleteDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        
        if (!productId.startsWith('local_')) {
            await deleteDoc(doc(db, 'products', productId));
            console.log('✅ Produto deletado do Firebase');
        }
        
        return true;
        
    } catch (error) {
        console.warn('⚠️ Não foi possível deletar do Firebase, apenas local');
        return true;
    }
}

// Exportar funções globalmente
window.FirebaseProducts = {
    load: loadProductsFromFirebase,
    save: saveProductToFirebase,
    delete: deleteProductFromFirebase
};

console.log('📦 Firebase Products module loaded');
