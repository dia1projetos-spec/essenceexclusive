# 📁 Pasta de Imagens do Hero Slider

## 🎯 Para que serve esta pasta?

Esta pasta é onde você deve colocar as **imagens do slider principal** do site (Hero Section).

## 📷 Tipos de Imagens

### 1. Imagens de Fundo (Background)
- **Nome sugerido:** `bg1.jpg`, `bg2.jpg`, `bg3.jpg`, etc.
- **Tamanho:** 1920x1080px (Full HD)
- **Formato:** JPG
- **Peso máximo:** 500KB

### 2. Elementos Flutuantes (Produtos)
- **Nome sugerido:** `perfume1.png`, `perfume2.png`, `perfume3.png`, etc.
- **Tamanho:** 600x600px (quadrado)
- **Formato:** PNG (com fundo transparente)
- **Peso máximo:** 200KB

## ✅ Como Usar

1. Coloque suas imagens nesta pasta
2. No arquivo `index.html`, troque as URLs por:
   - `assets/hero/bg1.jpg`
   - `assets/hero/perfume1.png`
   - etc.

## 🌐 Imagens Online

Se preferir usar imagens da internet (Unsplash, Pexels):
- Não precisa colocar nada nesta pasta
- Use diretamente a URL da imagem no HTML

## 📝 Exemplo

```html
<!-- Usando imagem local -->
<div class="hero-bg-slide active" style="background-image: url('assets/hero/bg1.jpg');"></div>

<!-- Usando imagem online -->
<div class="hero-bg-slide active" style="background-image: url('https://images.unsplash.com/photo-xxx.jpg');"></div>
```

Veja o arquivo **GUIA_TROCAR_IMAGENS.md** na raiz do projeto para instruções completas!
