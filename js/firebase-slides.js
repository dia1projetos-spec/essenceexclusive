/**
 * FIREBASE SLIDES - Gerenciamento de slides com Firebase + LocalStorage fallback
 */

// === CARREGAR SLIDES ===
async function loadSlidesFromFirebase() {
    try {
        const db = await window.waitForFirebase(3000);
        const { collection, getDocs, query, orderBy } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        
        const q = query(collection(db, 'slides'), orderBy('order'));
        const snapshot = await getDocs(q);
        const slides = [];
        
        snapshot.forEach(doc => {
            slides.push({
                firebaseId: doc.id,
                id: doc.id,
                ...doc.data()
            });
        });
        
        console.log(`✅ ${slides.length} slides do Firebase`);
        localStorage.setItem('slides', JSON.stringify(slides));
        
        return slides;
        
    } catch (error) {
        console.warn('⚠️ Firebase indisponível, usando cache local');
        return JSON.parse(localStorage.getItem('slides') || '[]');
    }
}

// === SALVAR SLIDE ===
async function saveSlideToFirebase(slide) {
    let localSlides = JSON.parse(localStorage.getItem('slides') || '[]');
    
    if (slide.firebaseId) {
        const idx = localSlides.findIndex(s => s.firebaseId === slide.firebaseId || s.id === slide.firebaseId);
        if (idx !== -1) {
            localSlides[idx] = slide;
        }
    } else {
        slide.id = 'local_' + Date.now();
        slide.firebaseId = slide.id;
        localSlides.push(slide);
    }
    
    localStorage.setItem('slides', JSON.stringify(localSlides));
    console.log('💾 Slide salvo no LocalStorage');
    
    try {
        const db = await window.waitForFirebase(3000);
        const { collection, addDoc, doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        
        if (slide.firebaseId && !slide.firebaseId.startsWith('local_')) {
            await setDoc(doc(db, 'slides', slide.firebaseId), slide);
            console.log('✅ Slide atualizado no Firebase');
        } else {
            const docRef = await addDoc(collection(db, 'slides'), slide);
            slide.firebaseId = docRef.id;
            slide.id = docRef.id;
            
            const idx = localSlides.findIndex(s => s.id.startsWith('local_'));
            if (idx !== -1) {
                localSlides[idx] = slide;
                localStorage.setItem('slides', JSON.stringify(localSlides));
            }
            
            console.log('✅ Slide criado no Firebase:', docRef.id);
        }
        
        return true;
        
    } catch (error) {
        console.warn('⚠️ Firebase indisponível, salvo apenas local');
        return true;
    }
}

// Exportar
window.FirebaseSlides = {
    load: loadSlidesFromFirebase,
    save: saveSlideToFirebase
};

console.log('🎬 Firebase Slides module loaded');
