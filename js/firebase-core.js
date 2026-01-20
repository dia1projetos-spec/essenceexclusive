/**
 * FIREBASE CORE - Carregamento otimizado
 * Evita travamentos e garante compatibilidade
 */

(function() {
    'use strict';
    
    const FIREBASE_CONFIG = {
        apiKey: "AIzaSyA-pWZ8CSQJURUAgfz9JSVerHGGkovZmbs",
        authDomain: "essence-exclusive-a4252.firebaseapp.com",
        projectId: "essence-exclusive-a4252",
        storageBucket: "essence-exclusive-a4252.firebasestorage.app",
        messagingSenderId: "608148583018",
        appId: "1:608148583018:web:f394b1d511e31190d61013"
    };
    
    let firebaseApp = null;
    let firebaseAuth = null;
    let firebaseDB = null;
    let isInitialized = false;
    
    // Fila de operações pendentes
    const pendingOperations = [];
    
    /**
     * Inicializar Firebase
     */
    async function initFirebase() {
        if (isInitialized) return true;
        
        try {
            console.log('🔥 Inicializando Firebase...');
            
            // Importar Firebase de forma assíncrona
            const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
            const { getAuth } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
            const { getFirestore } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            
            firebaseApp = initializeApp(FIREBASE_CONFIG);
            firebaseAuth = getAuth(firebaseApp);
            firebaseDB = getFirestore(firebaseApp);
            
            // Exportar globalmente
            window.firebaseApp = firebaseApp;
            window.firebaseAuth = firebaseAuth;
            window.firebaseDB = firebaseDB;
            
            isInitialized = true;
            console.log('✅ Firebase inicializado com sucesso!');
            
            // Processar operações pendentes
            processPendingOperations();
            
            return true;
        } catch (error) {
            console.error('❌ Erro ao inicializar Firebase:', error);
            return false;
        }
    }
    
    /**
     * Processar operações que aguardavam Firebase
     */
    function processPendingOperations() {
        while (pendingOperations.length > 0) {
            const operation = pendingOperations.shift();
            operation();
        }
    }
    
    /**
     * Aguardar Firebase estar pronto
     */
    function waitForFirebase(timeout = 10000) {
        return new Promise((resolve, reject) => {
            if (isInitialized) {
                resolve(firebaseDB);
                return;
            }
            
            const startTime = Date.now();
            const checkInterval = setInterval(() => {
                if (isInitialized) {
                    clearInterval(checkInterval);
                    resolve(firebaseDB);
                } else if (Date.now() - startTime > timeout) {
                    clearInterval(checkInterval);
                    reject(new Error('Firebase timeout'));
                }
            }, 100);
        });
    }
    
    /**
     * Compressão de imagens
     */
    function compressImage(file, maxWidth = 1200, quality = 0.85) {
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
                    
                    const compressed = canvas.toDataURL('image/jpeg', quality);
                    const sizeKB = Math.round((compressed.length * 3) / 4 / 1024);
                    
                    console.log(`📦 Imagem comprimida: ${sizeKB}KB`);
                    
                    resolve({
                        base64: compressed,
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
    
    // Exportar API pública
    window.FirebaseCore = {
        init: initFirebase,
        waitForFirebase: waitForFirebase,
        compressImage: compressImage,
        isReady: () => isInitialized,
        getDB: () => firebaseDB,
        getAuth: () => firebaseAuth
    };
    
    // Inicializar automaticamente
    initFirebase().catch(err => {
        console.warn('⚠️ Firebase não carregou, usando modo fallback');
    });
    
})();
