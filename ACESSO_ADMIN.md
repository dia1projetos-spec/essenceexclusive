# 🔐 GUIA DE ACESSO - ADMIN PANEL

## 📧 Credenciais de Acesso

Para acessar o painel administrativo, use as seguintes credenciais:

```
Email: sofia@essenceexclusive.com
Senha: qpaczm134679
```

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

## 🔒 Segurança

- ✅ **Acesso Protegido**: Apenas usuários autenticados podem acessar o admin
- ✅ **Redirecionamento Automático**: Se tentar acessar `admin.html` sem login, será redirecionado para `login.html`
- ✅ **Sessão Persistente**: Marque "Recordarme" para manter login
- ✅ **Logout Seguro**: Clique no ícone vermelho 🚪 para sair

---

## 🛡️ Proteção de Rotas

O sistema verifica autenticação em:
- `admin.html` - Painel administrativo
- Todas as ações de CRUD

Se **NÃO** estiver logado:
- É redirecionado automaticamente para `login.html`
- Não pode acessar nenhuma função administrativa

Se **ESTÁ** logado:
- Nome de usuário aparece no topo direito
- Pode gerenciar produtos, slides e categorias
- Botão de logout disponível

---

## 🔄 Sessões

### SessionStorage (padrão)
- Sessão válida apenas enquanto o navegador está aberto
- Fecha o navegador = logout automático
- **Não marque** "Recordarme"

### LocalStorage (persistente)
- Sessão mantida mesmo após fechar navegador
- Logout apenas clicando no botão
- **Marque** "Recordarme"

---

## 🆘 Problemas Comuns

### "Não consigo fazer login"
- ✅ Verifique se está digitando o email exato: `sofia@essenceexclusive.com`
- ✅ Senha correta: `qpaczm134679` (case-sensitive)
- ✅ Abra o Console (F12) e veja se há erros

### "Fui redirecionado para login"
- ✅ Significa que sua sessão expirou
- ✅ Faça login novamente
- ✅ Marque "Recordarme" para sessão persistente

### "Quero trocar a senha"
Edite o arquivo `js/login.js` na linha ~20:

```javascript
const AUTHORIZED_EMAIL = 'sofia@essenceexclusive.com';
const AUTHORIZED_PASSWORD = 'SUA_NOVA_SENHA_AQUI';
```

---

## 🔥 Firebase (Futuro)

Quando migrar para Firebase:
1. Configure Firebase Authentication
2. Crie usuário no Firebase Console
3. Descomente o código Firebase em `login.js`
4. As credenciais passarão a ser gerenciadas pelo Firebase

---

## 📊 Funcionalidades do Admin

Com login ativo, você pode:

### ✅ Produtos
- Criar novos produtos
- Upload de imagens
- Editar produtos existentes
- Deletar produtos
- Filtrar e buscar

### ✅ Slides Hero
- Adicionar slides ao hero
- Upload de 2 imagens por slide
- Definir ordem
- Ativar/desativar
- Editar e deletar

### ✅ Categorias
- Criar categorias personalizadas
- Adicionar subcategorias
- Definir ícones
- Editar e deletar

### ✅ Dashboard
- Ver estatísticas
- Total de produtos
- Produtos destacados
- Total de categorias
- Valor do inventário

---

## 🎯 Resumo Rápido

```
URL Login: login.html
Email: sofia@essenceexclusive.com
Senha: qpaczm134679
```

**Pronto para usar!** 🚀
