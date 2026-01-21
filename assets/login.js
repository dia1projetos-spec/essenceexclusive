document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember').checked;
    
    // Validação simples
    if (email === 'sofia@essenceexclusive.com' && password === 'qpaczm134679') {
        const userData = { email, loggedAt: new Date().toISOString() };
        
        if (remember) {
            localStorage.setItem('adminUser', JSON.stringify(userData));
        } else {
            sessionStorage.setItem('adminUser', JSON.stringify(userData));
        }
        
        window.location.href = 'admin.html';
    } else {
        alert('Email ou senha incorretos');
    }
});

console.log('✅ Login.js loaded');
