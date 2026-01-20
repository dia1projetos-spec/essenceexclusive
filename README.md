# 🌿 Essence Exclusive - E-commerce de Perfumes

## 📋 Descripción

**Essence Exclusive** es una tienda online premium de perfumes y cosmética para el mercado argentino. Diseñada con un enfoque en la elegancia, experiencia visual impactante y funcionalidad completa.

## ✨ Características Principales

### 🎨 Diseño Visual
- **Diseño Luxuoso e Impactante**: Colores inspirados en la logo (verde turquesa, dorado, gris oscuro)
- **Animaciones Suaves**: Efectos de scroll, hover y transiciones elegantes
- **Responsive Design**: Optimizado para móviles, tablets y desktop
- **Loading Screen**: Pantalla de carga profesional con logo animado

### 🛍️ Funcionalidades de E-commerce
- **Catálogo de Productos**: Sistema dinámico de productos con imágenes
- **Filtros Avanzados**: Por categoría (Femenino, Masculino, Unisex)
- **Búsqueda en Tiempo Real**: Encuentra productos rápidamente
- **Sistema de Carrinho Completo**:
  - Agregar/eliminar productos
  - Modificar cantidades
  - Cálculo automático de totales
  - Sidebar deslizante elegante
  - Persistencia en LocalStorage

### 👨‍💼 Panel Administrativo
- **Dashboard con Estadísticas**:
  - Total de productos
  - Productos destacados
  - Categorías
  - Valor total del inventario
- **Gestión de Productos (CRUD Completo)**:
  - ✅ Crear nuevos productos
  - ✏️ Editar productos existentes
  - 🗑️ Eliminar productos
  - 📊 Visualización en tabla
- **Filtros Administrativos**:
  - Búsqueda por nombre/categoría
  - Filtro por categoría
  - Filtro por destacados
- **Interfaz Intuitiva**: Diseño moderno y fácil de usar

### 🎯 Secciones del Sitio
1. **Hero Section**: Banner principal con CTA impactante
2. **Features**: Beneficios (Envío gratis, 100% original, etc.)
3. **Categorías**: Navegación visual por tipo de perfume
4. **Productos Destacados**: Mejores productos destacados
5. **Catálogo Completo**: Todos los productos con filtros
6. **Newsletter**: Suscripción de email
7. **Sobre Nosotros**: Historia de la marca
8. **Contacto**: Formulario y datos de contacto
9. **Footer**: Links útiles y redes sociales

## 📂 Estructura de Archivos

```
essence-exclusive/
├── index.html              # Página principal de la tienda
├── admin.html              # Panel administrativo
├── css/
│   ├── styles.css         # Estilos de la tienda
│   └── admin.css          # Estilos del admin
├── js/
│   ├── main.js            # JavaScript principal
│   ├── cart.js            # Sistema de carrinho
│   └── admin.js           # Funcionalidad admin
└── assets/
    └── logo_essence2026.png # Logo de la marca
```

## 🚀 Instalación y Uso

### Opción 1: Uso Local Simple
1. Descomprimir el archivo ZIP
2. Abrir `index.html` en un navegador moderno
3. ¡Listo! El sitio funciona sin servidor

### Opción 2: Con Servidor Local
```bash
# Si tienes Python instalado:
python -m http.server 8000

# O con Node.js:
npx serve
```

Luego acceder a `http://localhost:8000`

## 🔧 Cómo Usar el Panel Administrativo

1. **Acceder al Admin**:
   - Click en "Admin" en el header
   - O navegar directamente a `admin.html`

2. **Agregar Producto**:
   - Click en "Agregar Producto"
   - Completar el formulario:
     * Nombre del producto (requerido)
     * Categoría (Femenino/Masculino/Unisex)
     * Precio en ARS
     * Rating (1-5 estrellas)
     * URL de imagen (puede usar Unsplash, Pexels, etc.)
     * Descripción
     * Marcar si es destacado
   - Click en "Guardar Producto"

3. **Editar Producto**:
   - Click en el ícono de lápiz (editar) en la tabla
   - Modificar los datos
   - Guardar cambios

4. **Eliminar Producto**:
   - Click en el ícono de basura
   - Confirmar eliminación

5. **Filtrar Productos**:
   - Usar la barra de búsqueda
   - Seleccionar categoría
   - Filtrar por destacados

## 💾 Almacenamiento de Datos

**LocalStorage**: Los productos se guardan en el navegador usando LocalStorage:
- `products`: Array con todos los productos
- `cart`: Carrito de compras del usuario

**Ventajas**:
- ✅ No requiere servidor
- ✅ Funciona offline
- ✅ Rápido y simple

**Limitaciones**:
- Los datos son locales (cada navegador tiene sus propios datos)
- Se pierden si se limpia el caché del navegador

## 🔮 Próximas Funcionalidades (Para Implementar)

### 💳 Sistema de Pagos
- [ ] Integración con Mercado Pago
- [ ] Pago con ALIAS (CVU/CBU)
- [ ] Múltiples métodos de pago

### 📦 Envíos
- [ ] Integración con Correo Argentino
- [ ] Cálculo de costos de envío
- [ ] Seguimiento de pedidos

### 👥 Usuarios y Autenticación
- [ ] Registro de usuarios
- [ ] Login/Logout
- [ ] Perfil de usuario
- [ ] Historial de compras

### 📧 Email Marketing
- [ ] Confirmación de pedidos por email
- [ ] Newsletter automático
- [ ] Recuperación de carritos abandonados

### 💾 Backend y Base de Datos
- [ ] Migrar a base de datos real (MySQL, PostgreSQL, MongoDB)
- [ ] API REST para productos
- [ ] Panel admin con autenticación

## 🎨 Personalización

### Cambiar Colores
Editar variables CSS en `css/styles.css`:
```css
:root {
    --primary-color: #4ecca3;    /* Verde principal */
    --secondary-color: #93e4c1;  /* Verde secundario */
    --accent-gold: #c4a76b;      /* Dorado */
    --dark-bg: #1a1a2e;          /* Fondo oscuro */
}
```

### Agregar Productos Iniciales
Editar en `js/main.js` la función `getProducts()` para cambiar los productos demo.

### Modificar Textos
Los textos están directamente en `index.html` y pueden ser editados fácilmente.

## 🌐 URLs de Imágenes Sugeridas

Para agregar productos, puede usar imágenes gratuitas de:
- **Unsplash**: https://unsplash.com
- **Pexels**: https://pexels.com
- **Pixabay**: https://pixabay.com

Ejemplo de URL de Unsplash:
```
https://images.unsplash.com/photo-1541643600914-78b084683601?w=500
```

## 📱 Redes Sociales (Para Configurar)

Actualizar los links en el footer (`index.html`):
- Facebook
- Instagram
- Twitter
- WhatsApp

## 📞 Contacto (Para Configurar)

Actualizar en `index.html`:
- Teléfono: +54 9 11 1234-5678
- Email: contacto@essenceexclusive.com.ar
- Dirección: Av. Corrientes 1234, CABA, Argentina

## 🐛 Solución de Problemas

### Los productos no se muestran
- Verificar la consola del navegador (F12)
- Limpiar LocalStorage: `localStorage.clear()`
- Recargar la página

### El carrinho no funciona
- Verificar que ambos archivos JS están cargados
- Revisar errores en consola

### Imágenes no cargan
- Verificar que las URLs son válidas
- Verificar conexión a internet
- Usar URLs HTTPS

## 📄 Licencia

Este proyecto es de uso libre para **Essence Exclusive**.

## 👨‍💻 Soporte Técnico

Para dudas o mejoras, contactar al desarrollador.

---

**¡Gracias por elegir Essence Exclusive! 🌿✨**
