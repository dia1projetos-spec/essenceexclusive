# 🔥 GUIA: Configuração do Firebase

## 📝 O que foi preparado

O sistema já está **100% preparado** para Firebase. Você só precisa configurar as credenciais!

### Funcionalidades Prontas:
- ✅ Login com email/senha
- ✅ Login com Google
- ✅ Proteção de rotas (admin)
- ✅ Gerenciamento de sessão
- ✅ Preparado para Firestore (banco de dados)
- ✅ Preparado para Storage (imagens)

---

## 🚀 Passo a Passo - Configuração

### 1️⃣ Criar Projeto no Firebase

1. Acesse: https://console.firebase.google.com/
2. Clique em **"Adicionar projeto"**
3. Nome do projeto: `essence-exclusive` (ou outro nome)
4. Siga os passos e crie o projeto

### 2️⃣ Habilitar Authentication

1. No menu lateral, clique em **"Authentication"**
2. Clique em **"Começar"**
3. Na aba **"Sign-in method"**, habilite:
   - ✅ **Email/Password**
   - ✅ **Google** (opcional, mas recomendado)

### 3️⃣ Criar Usuário Admin

1. Vá em **Authentication** → **Users**
2. Clique em **"Add user"**
3. Coloque:
   - Email: `admin@essenceexclusive.com` (ou seu email)
   - Senha: Escolha uma senha forte
4. Salve

### 4️⃣ Obter Credenciais do Projeto

1. Clique no ícone de **engrenagem** ⚙️ → **Configurações do projeto**
2. Role até **"Seus apps"**
3. Clique no ícone **</>** (Web)
4. Registre o app com nome: `Essence Exclusive Web`
5. **NÃO marque** "Também configurar o Firebase Hosting"
6. Copie as credenciais que aparecerem (parecido com isso):

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "essence-exclusive.firebaseapp.com",
  projectId: "essence-exclusive",
  storageBucket: "essence-exclusive.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:xxxxxxxxxxxxx"
};
```

### 5️⃣ Configurar no Código

**Abra o arquivo `login.html`** e encontre a seção comentada do Firebase (linha ~100):

**ANTES:**
```html
<!-- Firebase SDK (Comentado até configurar) -->
<!--
<script type="module">
    // Import the functions you need...
```

**DEPOIS (descomente e cole suas credenciais):**
```html
<!-- Firebase SDK -->
<script type="module">
    // Import the functions you need from the SDKs you need
    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
    import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
    
    // COLE SUAS CREDENCIAIS AQUI 👇
    const firebaseConfig = {
        apiKey: "SUA_API_KEY_AQUI",
        authDomain: "SEU_AUTH_DOMAIN",
        projectId: "SEU_PROJECT_ID",
        storageBucket: "SEU_STORAGE_BUCKET",
        messagingSenderId: "SEU_MESSAGING_SENDER_ID",
        appId: "SEU_APP_ID"
    };
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();
    
    // Export for use in login.js
    window.firebaseAuth = auth;
    window.googleProvider = provider;
</script>
```

### 6️⃣ Descomente o Código de Autenticação

**Abra `js/login.js`** e encontre os blocos comentados:

Procure por `// MODO DEMO` e remova esse bloco, depois descomente o `// CÓDIGO FIREBASE`.

**ANTES:**
```javascript
// MODO DEMO: Verificação básica sem Firebase
if (email && password) {
    // ... código demo
}

/* 
// CÓDIGO FIREBASE (descomente quando configurar)
const { signInWithEmailAndPassword } = await import(...);
...
*/
```

**DEPOIS:**
```javascript
// CÓDIGO FIREBASE ATIVO
const { signInWithEmailAndPassword } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
const userCredential = await signInWithEmailAndPassword(window.firebaseAuth, email, password);
// ... resto do código
```

Faça o mesmo para a função `handleGoogleLogin()`.

---

## 🗄️ Configurar Firestore (Banco de Dados)

### Para Produtos e Slides

1. No console Firebase, vá em **Firestore Database**
2. Clique em **"Criar banco de dados"**
3. Escolha modo **"Produção"** (ou "Teste" para desenvolvimento)
4. Escolha a localização mais próxima (ex: `southamerica-east1` para Brasil)
5. Crie as seguintes coleções:

#### Coleção: `products`
```
products/
  ├── {productId}
  │   ├── id: number
  │   ├── name: string
  │   ├── category: string
  │   ├── price: number
  │   ├── image: string (URL)
  │   ├── description: string
  │   ├── featured: boolean
  │   └── rating: number
```

#### Coleção: `slides`
```
slides/
  ├── {slideId}
  │   ├── backgroundImage: string (URL)
  │   ├── floatingImage: string (URL)
  │   ├── order: number
  │   └── active: boolean
```

### Regras de Segurança do Firestore

Em **Firestore** → **Regras**, cole:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Produtos - Leitura pública, escrita apenas autenticados
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Slides - Leitura pública, escrita apenas autenticados
    match /slides/{slideId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Pedidos - Apenas autenticados
    match /orders/{orderId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## 📦 Storage para Imagens

### Configurar Firebase Storage

1. Vá em **Storage** no console Firebase
2. Clique em **"Começar"**
3. Escolha modo de segurança (produção)
4. Crie as pastas:
   - `/products/` - Para imagens de produtos
   - `/slides/` - Para imagens de slides
   - `/campaigns/` - Para campanhas especiais

### Regras de Storage

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

---

## 🌐 Hospedagem no GitHub Pages

### Opção 1: GitHub Pages Simples

1. Crie um repositório no GitHub: `essence-exclusive`
2. Faça upload de todos os arquivos
3. Vá em **Settings** → **Pages**
4. Source: **Deploy from a branch**
5. Branch: **main** → **/ (root)**
6. Salve

Seu site estará em: `https://seu-usuario.github.io/essence-exclusive/`

### Opção 2: Firebase Hosting (Recomendado)

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Inicializar no projeto
firebase init

# Escolher:
# - Hosting
# - Usar projeto existente
# - Public directory: . (ponto)
# - Configure as single-page app: No
# - Set up automatic builds: No

# Deploy
firebase deploy --only hosting
```

Seu site estará em: `https://essence-exclusive.web.app/`

---

## ✅ Checklist Final

Antes de colocar em produção:

- [ ] Firebase configurado em `login.html`
- [ ] Código do Firebase descomentado em `js/login.js`
- [ ] Usuário admin criado no Firebase Authentication
- [ ] Firestore Database criado e configurado
- [ ] Storage configurado (opcional)
- [ ] Regras de segurança aplicadas
- [ ] Site hospedado (GitHub Pages ou Firebase Hosting)
- [ ] Testado login com email/senha
- [ ] Testado login com Google (se habilitado)
- [ ] WhatsApp atualizado com número correto

---

## 🔒 Segurança

### API Keys no Frontend são Seguras?

SIM! As API keys do Firebase podem ficar expostas no código. Elas são protegidas pelas **Regras de Segurança** do Firestore e Authentication.

**O que protege seu app:**
- ✅ Regras do Firestore (quem pode ler/escrever)
- ✅ Authentication (quem pode fazer login)
- ✅ Storage Rules (quem pode fazer upload)

---

## 🆘 Problemas Comuns

### Login não funciona
- Verifique se o Firebase está configurado em `login.html`
- Abra o Console do navegador (F12) e veja se há erros
- Verifique se o usuário existe no Firebase Authentication

### "Firebase is not defined"
- Certifique-se que descomentou o código em `login.html`
- Verifique a conexão com internet

### CORS Error
- Use o site em HTTPS (não http://)
- GitHub Pages já é HTTPS
- Firebase Hosting já é HTTPS

---

## 📚 Próximos Passos

Após configurar o Firebase:

1. **Migrar produtos para Firestore** 
   - Criar funções para ler/escrever do Firestore
   - Substituir LocalStorage por Firestore

2. **Upload de Imagens**
   - Adicionar upload para Firebase Storage
   - Gerar URLs automáticas

3. **Gerenciar Slides pelo Admin**
   - CRUD de slides conectado ao Firestore
   - Sincronização automática com index

---

**Qualquer dúvida, estou aqui! 🚀**
