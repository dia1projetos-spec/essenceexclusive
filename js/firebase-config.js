/**
 * FIREBASE CONFIG - Inicialização simples e segura
 */

// Configuração
const firebaseConfig = {
    apiKey: "AIzaSyA-pWZ8CSQJURUAgfz9JSVerHGGkovZmbs",
    authDomain: "essence-exclusive-a4252.firebaseapp.com",
    projectId: "essence-exclusive-a4252",
    storageBucket: "essence-exclusive-a4252.firebasestorage.app",
    messagingSenderId: "608148583018",
    appId: "1:608148583018:web:f394b1d511e31190d61013"
};

// Estado global
window.FIREBASE_READY = false;
window.FIREBASE_DB = null;

// Inicializar Firebase de forma assíncrona
(async function initFirebase() {
    try {
        console.log('🔥 Carregando Firebase...');
        
        // Importar Firebase
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
        const { getFirestore } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        
        // Inicializar
        const app = initializeApp(firebaseConfig);
        window.FIREBASE_DB = getFirestore(app);
        window.FIREBASE_READY = true;
        
        console.log('✅ Firebase conectado!');
        
        // Disparar evento customizado
        window.dispatchEvent(new Event('firebase-ready'));
        
    } catch (error) {
        console.warn('⚠️ Firebase não conectou:', error.message);
        console.log('💾 Usando modo offline (LocalStorage)');
    }
})();

// Função helper para esperar Firebase
window.waitForFirebase = function(timeout = 5000) {
    return new Promise((resolve, reject) => {
        if (window.FIREBASE_READY) {
            resolve(window.FIREBASE_DB);
            return;
        }
        
        const timeoutId = setTimeout(() => {
            reject(new Error('Firebase timeout'));
        }, timeout);
        
        window.addEventListener('firebase-ready', () => {
            clearTimeout(timeoutId);
            resolve(window.FIREBASE_DB);
        }, { once: true });
    });
};
