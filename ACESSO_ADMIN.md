# 🔐 GUIA DE ACESSO - ADMIN PANEL

## 📧 Credenciais de Acesso

Para acessar o painel administrativo, use as seguintes credenciais:

```
Email: sofia@essenceexclusive.com
Senha: qpaczm134679
```

## 🔥 FIREBASE ATIVADO!

O site agora usa Firebase para sincronização entre dispositivos!

---

## 🚀 Como Acessar

### Método 1: Pela Loja
1. Abra `index.html`
2. No rodapé, clique em **"Admin"**
3. Será redirecionado para a página de login
4. Digite as credenciais acima
5. Clique em **"Iniciar Sesión"**

### Método 2: Direto
1. Abra `login.html` no navegador
2. Digite as credenciais
3. Faça login

---

## 🔒 Firebase Authentication

✅ **Login com Email/Password ativado**
✅ **Usuário admin criado no Firebase**
✅ **Sincronização entre dispositivos funcionando**

### Para adicionar mais usuários admin:

1. Vá para: https://console.firebase.google.com/
2. Selecione o projeto `essence-exclusive`
3. Menu → **Authentication** → **Users**
4. Clique em **"Add user"**
5. Adicione email e senha
6. Salvar

---

## 💾 SINCRONIZAÇÃO FUNCIONANDO!

Agora os dados são salvos no Firebase (nuvem):

✅ **Produtos** - Sincronizam automaticamente
✅ **Categorias** - Compartilhadas entre dispositivos  
✅ **Slides** - Atualizados em tempo real
✅ **Imagens** - Comprimidas e otimizadas automaticamente

### Como funciona:

```
PC → Adiciona produto → Firebase (nuvem)
                            ↓
Celular → Abre admin → Vê o mesmo produto!
```

---

## 📱 COMPRESSÃO AUTOMÁTICA DE IMAGENS

O sistema agora otimiza imagens automaticamente:

### Antes:
- Foto: 5 MB ❌
- 4000x4000px

### Depois:
- Foto: ~400 KB ✅
- 1200x1200px
- Qualidade: 85% (imperceptível)

**Benefícios:**
- ✅ Carregamento ultra-rápido
- ✅ Economiza espaço no Firestore
- ✅ 100% automático
- ✅ Mantém qualidade visual

---

## 🔄 MIGRAR DADOS ANTIGOS (LocalStorage → Firebase)

Se você tinha produtos no LocalStorage do PC:

### Opção A: Console do Navegador

1. Abra `admin.html`
2. Pressione **F12** (abrir DevTools)
3. Vá na aba **Console**
4. Cole este código:

```javascript
import('./js/firebase-integration.js').then(module => {
    module.migrateLocalStorageToFirebase().then(() => {
        alert('Migração concluída!');
        location.reload();
    });
});
```

5. Pressione **Enter**
6. Aguarde a mensagem "Migração concluída!"

---

## 🛡️ Segurança

- ✅ **Acesso Protegido**: Apenas usuários autenticados
- ✅ **Firebase Rules**: Leitura pública, escrita apenas com login
- ✅ **Sessão Persistente**: Marque "Recordarme" para manter login
- ✅ **Logout Seguro**: Clique no ícone vermelho 🚪 para sair

---

## 📊 Funcionalidades do Admin

Com login ativo, você pode:

### ✅ Produtos
- Criar novos produtos
- **Upload de imagens com compressão automática**
- Editar produtos existentes
- Deletar produtos
- Filtrar e buscar
- **Sincroniza entre todos os dispositivos**

### ✅ Slides Hero
- Adicionar slides ao hero
- Upload de 2 imagens por slide (comprimidas automaticamente)
- Definir ordem
- Ativar/desativar
- Editar e deletar
- **Sincroniza automaticamente**

### ✅ Categorias
- Criar categorias personalizadas
- Adicionar subcategorias
- Definir ícones
- Editar e deletar
- **Compartilhadas entre dispositivos**

---

## 🔥 FIREBASE CONFIGURADO

### Projeto Firebase:
```
Project ID: essence-exclusive-a4252
Region: southamerica-east1 (São Paulo)
```

### Serviços Ativos:
- ✅ **Authentication** (Email/Password)
- ✅ **Firestore Database** (NoSQL)
- ❌ Storage (não necessário - usamos Base64)

### Limites Gratuitos:
- 50.000 leituras/dia
- 20.000 escritas/dia
- 1 GB de dados
- **Mais do que suficiente!**

---

## 🆘 Problemas Comuns

### "Não consigo fazer login"
- ✅ Verifique se está usando: `sofia@essenceexclusive.com`
- ✅ Senha correta: `qpaczm134679`
- ✅ Aguarde 3 segundos para Firebase carregar
- ✅ Abra o Console (F12) e veja se há erros

### "Dados não aparecem no celular"
- ✅ Faça login com as MESMAS credenciais
- ✅ Aguarde alguns segundos (sincronização)
- ✅ Recarregue a página (F5)

### "Imagem muito grande"
- ✅ O sistema comprime automaticamente
- ✅ Aceita qualquer tamanho (será reduzido para ~400KB)
- ✅ Máximo recomendado: 10MB de origem

---

## 🎯 Resumo Rápido

```
URL Login: login.html
Email: sofia@essenceexclusive.com
Senha: qpaczm134679

Firebase: ✅ ATIVO
Sincronização: ✅ FUNCIONANDO
Compressão: ✅ AUTOMÁTICA
```

**Pronto para usar em qualquer dispositivo!** 🚀🔥

