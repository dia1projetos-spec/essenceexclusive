/* ========================================
   LOGIN PAGE JAVASCRIPT
   Preparado para Firebase Authentication
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
    initLogin();
});

function initLogin() {
    const loginForm = document.getElementById('loginForm');
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    const googleLoginBtn = document.getElementById('googleLoginBtn');
    
    // Toggle password visibility
    togglePassword?.addEventListener('click', () => {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;
        
        const icon = togglePassword.querySelector('i');
        icon.classList.toggle('fa-eye');
        icon.classList.toggle('fa-eye-slash');
    });
    
    // Form submission
    loginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleLogin();
    });
    
    // Google login
    googleLoginBtn?.addEventListener('click', async () => {
        await handleGoogleLogin();
    });
}

// === EMAIL/PASSWORD LOGIN ===
async function handleLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    showLoading(true);
    
    try {
        // CREDENCIAIS AUTORIZADAS (Modo Local - SEM Firebase)
        const AUTHORIZED_EMAIL = 'sofia@essenceexclusive.com';
        const AUTHORIZED_PASSWORD = 'qpaczm134679';
        
        // Simular delay de autenticação
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Validar credenciais
        if (email === AUTHORIZED_EMAIL && password === AUTHORIZED_PASSWORD) {
            // Login bem-sucedido
            const user = {
                email: email,
                uid: 'admin-sofia-local',
                displayName: 'Sofia - Admin'
            };
            
            // Salvar sessão
            if (rememberMe) {
                localStorage.setItem('adminUser', JSON.stringify(user));
            } else {
                sessionStorage.setItem('adminUser', JSON.stringify(user));
            }
            
            showNotification('¡Bienvenida Sofia!', 'success');
            
            // Redirecionar para admin
            setTimeout(() => {
                window.location.href = 'admin.html';
            }, 1000);
        } else {
            // Credenciais inválidas
            throw new Error('Email o contraseña incorrectos');
        }
        
    } catch (error) {
        console.error('Erro de login:', error);
        showNotification(error.message || 'Email o contraseña incorrectos', 'error');
    } finally {
        showLoading(false);
    }
}

// === GOOGLE LOGIN ===
async function handleGoogleLogin() {
    showLoading(true);
    
    try {
        // DESABILITADO NO MODO LOCAL
        showNotification('Login con Google no disponible en modo local. Use: sofia@essenceexclusive.com', 'error');
        
    } catch (error) {
        console.error('Erro Google login:', error);
        showNotification('Login con Google no disponible', 'error');
    } finally {
        showLoading(false);
    }
}

// === VERIFICAR SE JÁ ESTÁ LOGADO ===
function checkAuth() {
    const user = localStorage.getItem('adminUser') || sessionStorage.getItem('adminUser');
    
    if (user && window.location.pathname.includes('login.html')) {
        window.location.href = 'admin.html';
    }
}

// Executar verificação
checkAuth();

// === LOADING ===
function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.toggle('active', show);
    }
}

// === NOTIFICATION ===
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' : 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'};
        color: white;
        padding: 1.2rem 2rem;
        border-radius: 15px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        z-index: 99999;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 1rem;
        animation: slideInRight 0.4s ease;
    `;
    
    const icon = type === 'success' ? 'check-circle' : 'exclamation-circle';
    notification.innerHTML = `
        <i class="fas fa-${icon}" style="font-size: 1.5rem;"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// === ERROR MESSAGES ===
function getErrorMessage(error) {
    const errorMessages = {
        'auth/invalid-email': 'Email inválido',
        'auth/user-disabled': 'Usuario deshabilitado',
        'auth/user-not-found': 'Usuario no encontrado',
        'auth/wrong-password': 'Contraseña incorrecta',
        'auth/too-many-requests': 'Demasiados intentos. Intente más tarde',
        'auth/network-request-failed': 'Error de conexión. Verifique su internet',
        'auth/popup-closed-by-user': 'Inicio de sesión cancelado'
    };
    
    return errorMessages[error.code] || error.message || 'Error al iniciar sesión';
}

// === ANIMATIONS ===
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

console.log('🔐 Login system initialized (LOCAL MODE)');
console.log('📧 Email: sofia@essenceexclusive.com');
console.log('🔑 Password: qpaczm134679');
console.log('💾 Dados salvos em LocalStorage (sem sincronização)');
