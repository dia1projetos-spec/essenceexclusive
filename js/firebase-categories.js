/**
 * FIREBASE CATEGORIES - Gerenciamento de categorias
 */

async function loadCategoriesFromFirebase() {
    try {
        const db = await window.waitForFirebase(3000);
        const { collection, getDocs } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        
        const snapshot = await getDocs(collection(db, 'categories'));
        const categories = [];
        
        snapshot.forEach(doc => {
            categories.push({
                firebaseId: doc.id,
                id: doc.id,
                ...doc.data()
            });
        });
        
        console.log(`✅ ${categories.length} categorias do Firebase`);
        localStorage.setItem('categories', JSON.stringify(categories));
        
        return categories;
        
    } catch (error) {
        console.warn('⚠️ Firebase indisponível, usando cache local');
        return JSON.parse(localStorage.getItem('categories') || '[]');
    }
}

async function saveCategoryToFirebase(category) {
    let localCategories = JSON.parse(localStorage.getItem('categories') || '[]');
    
    if (category.firebaseId) {
        const idx = localCategories.findIndex(c => c.firebaseId === category.firebaseId);
        if (idx !== -1) localCategories[idx] = category;
    } else {
        category.id = 'local_' + Date.now();
        category.firebaseId = category.id;
        localCategories.push(category);
    }
    
    localStorage.setItem('categories', JSON.stringify(localCategories));
    
    try {
        const db = await window.waitForFirebase(3000);
        const { collection, addDoc, doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        
        if (category.firebaseId && !category.firebaseId.startsWith('local_')) {
            await setDoc(doc(db, 'categories', category.firebaseId), category);
        } else {
            const docRef = await addDoc(collection(db, 'categories'), category);
            category.firebaseId = docRef.id;
            category.id = docRef.id;
        }
        
        return true;
    } catch (error) {
        return true;
    }
}

window.FirebaseCategories = {
    load: loadCategoriesFromFirebase,
    save: saveCategoryToFirebase
};

console.log('📁 Firebase Categories module loaded');
