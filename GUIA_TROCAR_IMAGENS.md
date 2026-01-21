# 🎨 GUIA: Como Trocar as Imagens do Slider Hero

## 📍 Localização das Imagens

As imagens do slider estão no arquivo **`index.html`** na seção Hero.

---

## 🖼️ 1. TROCAR IMAGENS DE FUNDO (Background)

### Onde encontrar:
Procure por esta seção no `index.html` (aproximadamente linha 200-210):

```html
<!-- Background Slider -->
<div class="hero-bg-slider">
    <div class="hero-bg-slide active" style="background-image: url('IMAGEM_1');"></div>
    <div class="hero-bg-slide" style="background-image: url('IMAGEM_2');"></div>
    <div class="hero-bg-slide" style="background-image: url('IMAGEM_3');"></div>
    <div class="hero-overlay"></div>
</div>
```

### Como trocar:

**Opção A - Usar imagens online (recomendado para testes):**
```html
<div class="hero-bg-slide active" style="background-image: url('https://suaurl.com/imagem1.jpg');"></div>
```

**Opção B - Usar imagens locais:**
1. Coloque suas imagens na pasta `assets/hero/`
2. Use o caminho relativo:
```html
<div class="hero-bg-slide active" style="background-image: url('assets/hero/fundo1.jpg');"></div>
```

### Dicas para imagens de fundo:
- ✅ Tamanho recomendado: **1920x1080px** (Full HD)
- ✅ Formato: JPG ou PNG
- ✅ Peso: Máximo 500KB (comprima as imagens para carregar rápido)
- ✅ Temas sugeridos: Perfumes, flores, elegância, luxo

---

## 💎 2. TROCAR IMAGENS DO ELEMENTO FLUTUANTE

### Onde encontrar:
Procure por esta seção no `index.html` (aproximadamente linha 230-240):

```html
<!-- Floating Element Slider -->
<div class="floating-element-slider">
    <div class="floating-element active">
        <img src="IMAGEM_FLUTUANTE_1" alt="Perfume 1">
    </div>
    <div class="floating-element">
        <img src="IMAGEM_FLUTUANTE_2" alt="Perfume 2">
    </div>
    <div class="floating-element">
        <img src="IMAGEM_FLUTUANTE_3" alt="Perfume 3">
    </div>
</div>
```

### Como trocar:

**Opção A - Usar imagens online:**
```html
<div class="floating-element active">
    <img src="https://suaurl.com/perfume1.png" alt="Perfume 1">
</div>
```

**Opção B - Usar imagens locais:**
```html
<div class="floating-element active">
    <img src="assets/hero/perfume1.png" alt="Perfume 1">
</div>
```

### Dicas para elemento flutuante:
- ✅ Tamanho recomendado: **600x600px** (quadrado)
- ✅ Formato: **PNG com fundo transparente** (para melhor efeito)
- ✅ Peso: Máximo 200KB
- ✅ Sugestões: Fotos de frascos de perfume, produtos, flores

---

## ➕ 3. ADICIONAR MAIS SLIDES

Para adicionar mais imagens ao slider:

### Passo 1 - Adicionar imagem de fundo:
```html
<div class="hero-bg-slider">
    <div class="hero-bg-slide active" style="background-image: url('imagem1.jpg');"></div>
    <div class="hero-bg-slide" style="background-image: url('imagem2.jpg');"></div>
    <div class="hero-bg-slide" style="background-image: url('imagem3.jpg');"></div>
    <!-- NOVA IMAGEM -->
    <div class="hero-bg-slide" style="background-image: url('imagem4.jpg');"></div>
    <div class="hero-overlay"></div>
</div>
```

### Passo 2 - Adicionar elemento flutuante correspondente:
```html
<div class="floating-element-slider">
    <div class="floating-element active">
        <img src="perfume1.png" alt="Perfume 1">
    </div>
    <div class="floating-element">
        <img src="perfume2.png" alt="Perfume 2">
    </div>
    <div class="floating-element">
        <img src="perfume3.png" alt="Perfume 3">
    </div>
    <!-- NOVO ELEMENTO -->
    <div class="floating-element">
        <img src="perfume4.png" alt="Perfume 4">
    </div>
</div>
```

### Passo 3 - Adicionar dot de controle:
```html
<div class="slider-dots" id="heroDotsContainer">
    <span class="slider-dot active" data-slide="0"></span>
    <span class="slider-dot" data-slide="1"></span>
    <span class="slider-dot" data-slide="2"></span>
    <!-- NOVO DOT -->
    <span class="slider-dot" data-slide="3"></span>
</div>
```

**Importante:** O número de slides deve ser igual em:
- Background slides
- Floating elements
- Slider dots

---

## 🎛️ 4. CONFIGURAÇÕES DO SLIDER

### Mudar velocidade de transição automática:

No arquivo **`js/main.js`**, procure por (linha ~100):

```javascript
slideInterval = setInterval(nextSlide, 5000); // 5000 = 5 segundos
```

Troque `5000` por:
- `3000` = 3 segundos (mais rápido)
- `7000` = 7 segundos (mais lento)
- `10000` = 10 segundos (bem lento)

### Desabilitar auto-play:

Comente esta linha no `js/main.js`:
```javascript
// startAutoPlay(); // Comentar para desabilitar
```

---

## 🔍 ONDE ENCONTRAR IMAGENS GRATUITAS

### Sites recomendados:

1. **Unsplash** - https://unsplash.com
   - Busque: "perfume", "cosmetics", "luxury", "flowers"
   - Copie o link da imagem

2. **Pexels** - https://pexels.com
   - Alta qualidade e gratuitas

3. **Pixabay** - https://pixabay.com
   - Variedade enorme

### Como copiar URL do Unsplash:
1. Abra a imagem
2. Clique direito > "Copiar endereço da imagem"
3. Cole no seu HTML

**Exemplo de URL Unsplash:**
```
https://images.unsplash.com/photo-1541643600914-78b084683601?w=1920&q=80
```

**Dica:** Adicione `?w=1920&q=80` no final da URL para otimizar o tamanho!

---

## 🎨 EXEMPLO COMPLETO

Aqui está um exemplo de como ficaria com 4 slides:

```html
<!-- Background Slider -->
<div class="hero-bg-slider">
    <div class="hero-bg-slide active" style="background-image: url('assets/hero/bg1.jpg');"></div>
    <div class="hero-bg-slide" style="background-image: url('assets/hero/bg2.jpg');"></div>
    <div class="hero-bg-slide" style="background-image: url('assets/hero/bg3.jpg');"></div>
    <div class="hero-bg-slide" style="background-image: url('assets/hero/bg4.jpg');"></div>
    <div class="hero-overlay"></div>
</div>

<!-- Floating Elements -->
<div class="floating-element-slider">
    <div class="floating-element active">
        <img src="assets/hero/perfume1.png" alt="Chanel">
    </div>
    <div class="floating-element">
        <img src="assets/hero/perfume2.png" alt="Dior">
    </div>
    <div class="floating-element">
        <img src="assets/hero/perfume3.png" alt="Versace">
    </div>
    <div class="floating-element">
        <img src="assets/hero/perfume4.png" alt="Gucci">
    </div>
</div>

<!-- Dots -->
<div class="slider-dots">
    <span class="slider-dot active" data-slide="0"></span>
    <span class="slider-dot" data-slide="1"></span>
    <span class="slider-dot" data-slide="2"></span>
    <span class="slider-dot" data-slide="3"></span>
</div>
```

---

## ⚙️ CONTROLES DO SLIDER

Os usuários podem controlar o slider de 3 formas:

1. **Setas na tela** - Clicar nas setas esquerda/direita
2. **Dots (bolinhas)** - Clicar nos pontinhos embaixo
3. **Teclado** - Teclas ← e → (setas do teclado)
4. **Auto-play** - Troca automaticamente a cada 5 segundos
   - Pausa ao passar o mouse sobre o hero
   - Retoma ao tirar o mouse

---

## 🎯 CHECKLIST RÁPIDO

Quando for trocar as imagens:

- [ ] Trocar todas as URLs no HTML
- [ ] Verificar que o número de slides é igual (background, floating, dots)
- [ ] Testar se todas as imagens carregam
- [ ] Verificar se o slider está funcionando
- [ ] Testar em mobile

---

## 🆘 PROBLEMAS COMUNS

**Imagem não aparece:**
- Verifique se a URL está correta
- Certifique-se que a imagem existe
- Verifique se o caminho do arquivo está correto

**Slider não troca:**
- Abra o console (F12) e veja se há erros
- Verifique se o JavaScript está carregado

**Imagem muito grande/pequena:**
- Ajuste o tamanho da imagem antes de usar
- Use ferramentas online como TinyPNG para comprimir

---

**Qualquer dúvida, é só me chamar! 🚀**
