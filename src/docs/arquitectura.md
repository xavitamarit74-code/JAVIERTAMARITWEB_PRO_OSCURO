# Arquitectura del Proyecto JavierTamaritWeb

## Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Estructura de Directorios](#estructura-de-directorios)
3. [Arquitectura SCSS](#arquitectura-scss)
4. [Arquitectura JavaScript](#arquitectura-javascript)
5. [Sistema de Build](#sistema-de-build)
6. [Flujo de Desarrollo](#flujo-de-desarrollo)
7. [Convenciones de Código](#convenciones-de-código)

---

## Visión General

JavierTamaritWeb es un sitio web personal estático enfocado en recuperación post-ictus, con recetas saludables, blog, podcasts y testimonios.

### Stack Tecnológico

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **SCSS** | - | Estilos con arquitectura modular |
| **JavaScript** | ES6+ | Funcionalidad dinámica |
| **Gulp** | 4.x | Sistema de build |
| **HTML5** | - | Marcado semántico |
| **Node.js** | - | Entorno de desarrollo |

### Características Principales

- ✅ 10 páginas HTML
- ✅ Modo oscuro con toggle
- ✅ Búsqueda de recetas segura
- ✅ Custom selects accesibles
- ✅ Reproductor de podcasts
- ✅ Blog con artículos
- ✅ SEO optimizado

---

## Estructura de Directorios

```
JAVIERTAMARITWEB_PRO_OSCURO/
│
├── src/                          # Código fuente
│   ├── scss/                     # Estilos SCSS
│   │   ├── base/                 # Fundamentos
│   │   │   ├── _variables.scss   # Variables de color, espaciado, etc.
│   │   │   ├── _mixins.scss      # Funciones reutilizables
│   │   │   ├── _globales.scss    # Estilos globales
│   │   │   ├── _tipografia.scss  # Fuentes y tipografía
│   │   │   ├── _dark-mode.scss   # Modo oscuro completo
│   │   │   ├── _normalize.scss   # Reset CSS
│   │   │   └── _index.scss       # Barrel export
│   │   │
│   │   ├── ui/                   # Componentes UI
│   │   │   ├── header/           # Cabecera
│   │   │   ├── navegacion/       # Menú de navegación
│   │   │   ├── footer/           # Pie de página
│   │   │   ├── contador/         # Contador de tiempo
│   │   │   ├── componentes/      # Componentes reutilizables
│   │   │   ├── contenido/        # Secciones de contenido
│   │   │   └── menus/            # Menús de recetas
│   │   │
│   │   └── app.scss              # Archivo principal
│   │
│   ├── js/                       # JavaScript
│   │   ├── theme-toggle.js       # Toggle modo oscuro
│   │   ├── buscador-seguro.js    # Seguridad de formularios
│   │   ├── buscador-recetas-cocina.js  # Búsqueda de recetas
│   │   ├── custom-select.js      # Selectores personalizados
│   │   ├── podcasts.js           # Reproductor de podcasts
│   │   ├── recetas-cocina.js     # Datos de recetas
│   │   ├── articulos.js          # Datos del blog
│   │   ├── relatos.js            # Datos de relatos
│   │   └── script.js             # Funciones generales
│   │
│   ├── docs/                     # Documentación
│   │   ├── README.md             # Índice de documentación
│   │   ├── dark-mode.md          # Documentación modo oscuro
│   │   ├── formularios-seguridad.md  # Documentación seguridad
│   │   └── arquitectura.md       # Este archivo
│   │
│   ├── data/                     # Datos JSON
│   ├── contents/                 # Contenido estático
│   ├── img/                      # Imágenes
│   ├── fonts/                    # Fuentes
│   ├── podcasts/                 # Archivos de audio
│   └── video/                    # Videos
│
├── build/                        # Archivos compilados (producción)
│   ├── css/                      # CSS compilado
│   ├── js/                       # JS copiado
│   ├── img/                      # Imágenes optimizadas
│   └── *.html                    # HTML procesado
│
├── *.html                        # Páginas HTML fuente
├── gulpfile.js                   # Configuración Gulp
├── package.json                  # Dependencias NPM
└── README.md                     # Documentación principal
```

---

## Arquitectura SCSS

### Metodología: BEM + SCSS Modules

**BEM (Block Element Modifier):**

```scss
// Block
.blog {}

// Element
.blog__article {}
.blog__title {}

// Modifier
.blog__article--featured {}
```

**SCSS Modules con @forward:**

```scss
// base/_index.scss
@forward 'variables';
@forward 'mixins';
@forward 'globales';
@forward 'tipografia';
@forward 'dark-mode';
@forward 'normalize';
```

### Sistema de Variables

**Categorías:**

1. **Colores**
   ```scss
   $primario: #4ECDC4;        // Turquesa
   $secundario: #FFE4E8;       // Rosa suave
   $terciario: #FBF1F3;       // Rosa muy claro
   $rosaOscuro: #f790b2;      // Rosa oscuro
   ```

2. **Espaciado**
   ```scss
   $separacion: 4rem;
   ```

3. **Fuentes**
   ```scss
   $fuentePrincipal: 'Outfit', sans-serif;
   $fuenteHeadings: 'Outfit', sans-serif;
   ```

4. **Breakpoints**
   ```scss
   $tablet: 768px;
   $desktop: 1200px;
   ```

### Mixins Principales

**Botones:**
```scss
@mixin boton($background, $color) {
    background: $background;
    color: $color;
    padding: 1rem 2rem;
    border-radius: v.$border-radius;
    // ...
}
```

**Responsive:**
```scss
@mixin tablet {
    @media (min-width: v.$tablet) {
        @content;
    }
}

@mixin desktop {
    @media (min-width: v.$desktop) {
        @content;
    }
}
```

**Grid:**
```scss
@mixin grid($columnas, $gap) {
    display: grid;
    grid-template-columns: repeat($columnas, 1fr);
    gap: $gap;
}
```

### Orden de Importación

```scss
// app.scss
@use 'base';        // Variables, mixins, globales, dark-mode
@use 'ui/header';   // Componentes UI
@use 'ui/navegacion';
@use 'ui/contador';
@use 'ui/contenido';
@use 'ui/menus';
@use 'ui/footer';
@use 'ui/componentes';
```

---

## Arquitectura JavaScript

### Patrón: Módulos ES6 + Clases

#### 1. Theme Toggle (Singleton Pattern)

```javascript
// theme-toggle.js
let currentTheme = getThemePreference();

function getThemePreference() { /* ... */ }
function applyTheme(theme) { /* ... */ }
function toggleTheme() { /* ... */ }
function createToggleButton() { /* ... */ }

// Ejecutar al cargar
applyTheme(currentTheme);
createToggleButton();
```

**Características:**
- No usa clases (funciones simples)
- Estado global (`currentTheme`)
- Auto-ejecutable

#### 2. Buscador Seguro (Class Pattern)

```javascript
// buscador-seguro.js
class BuscadorSeguro {
    constructor() {
        this.inputBusqueda = document.getElementById('busqueda-texto');
        this.filtrosBloqueo = this.crearFiltrosSeguridad();
        this.inicializar();
    }
    
    crearFiltrosSeguridad() { /* ... */ }
    sanitizarTexto(texto) { /* ... */ }
    escaparHTML(texto) { /* ... */ }
    detectarInyeccion(texto) { /* ... */ }
    manejarInput(event) { /* ... */ }
    inicializar() { /* ... */ }
}

// Instanciar al cargar DOM
document.addEventListener('DOMContentLoaded', () => {
    new BuscadorSeguro();
});
```

**Características:**
- Encapsulación en clase
- Inicialización en DOMContentLoaded
- Event-driven

#### 3. Custom Select (Module Pattern)

```javascript
// custom-select.js
(function() {
    'use strict';
    
    class CustomSelect {
        constructor(element) { /* ... */ }
        
        render() { /* ... */ }
        attachEvents() { /* ... */ }
        open() { /* ... */ }
        close() { /* ... */ }
        selectOption(value) { /* ... */ }
    }
    
    // Auto-inicialización de todos los selects
    document.addEventListener('DOMContentLoaded', function() {
        const selects = document.querySelectorAll('.custom-select-wrapper');
        selects.forEach(wrapper => {
            new CustomSelect(wrapper);
        });
    });
})();
```

**Características:**
- IIFE para evitar contaminación global
- Múltiples instancias
- Event delegation

### Convenciones de Nombres

**Variables:**
```javascript
// camelCase para variables
const inputBusqueda = document.getElementById('busqueda');
const textoLimpio = sanitizarTexto(input);
```

**Funciones:**
```javascript
// camelCase para funciones
function sanitizarTexto(texto) { }
function detectarInyeccion(texto) { }
```

**Clases:**
```javascript
// PascalCase para clases
class BuscadorSeguro { }
class CustomSelect { }
```

**Constantes:**
```javascript
// UPPER_SNAKE_CASE para constantes
const MAX_LENGTH = 100;
const PATRON_PERMITIDO = /^[a-zA-Z]*$/;
```

---

## Sistema de Build

### Gulp Tasks

**Ubicación:** `gulpfile.js`

#### Task: `css`

```javascript
function css() {
    return src('src/scss/app.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(dest('build/css'));
}
```

**Función:** Compila SCSS a CSS

**Uso:**
```bash
npx gulp css
```

#### Task: `js`

```javascript
function javascript() {
    return src('src/js/**/*.js')
        .pipe(dest('build/js'));
}
```

**Función:** Copia archivos JS a build

#### Task: `images`

```javascript
function imagenes() {
    return src('src/img/**/*')
        .pipe(imagemin())
        .pipe(dest('build/img'));
}
```

**Función:** Optimiza y copia imágenes

#### Task: `dev` (Watch)

```javascript
function dev() {
    watch('src/scss/**/*.scss', css);
    watch('src/js/**/*.js', javascript);
    watch('src/img/**/*', imagenes);
}
```

**Función:** Observa cambios y recompila automáticamente

**Uso:**
```bash
npx gulp
```

#### Task: Default

```javascript
exports.default = series(
    parallel(css, javascript, fonts, imagenes, favicon, data, contents, podcasts, video),
    html,
    rootFiles,
    seo,
    dev
);
```

**Función:** Ejecuta todas las tasks y activa watch

---

## Flujo de Desarrollo

### 1. Desarrollo Local

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar watch mode
npx gulp

# 3. Hacer cambios en src/
# - Modificar SCSS en src/scss/
# - Modificar JS en src/js/
# - Modificar HTML en raíz

# 4. Ver cambios en build/
# - Los archivos se compilan automáticamente
# - Abrir build/index.html en navegador
```

### 2. Añadir Estilos

```bash
# 1. Editar archivo SCSS apropiado
# Ejemplo: src/scss/ui/contenido/_blog.scss

# 2. Guardar archivo
# Gulp recompila automáticamente

# 3. Refrescar navegador
# Cmd+R o Ctrl+R
```

### 3. Añadir Funcionalidad JS

```bash
# 1. Crear nuevo archivo
# src/js/mi-feature.js

# 2. Escribir código
class MiFeature {
    // ...
}

# 3. Incluir en HTML
<script src="js/mi-feature.js" defer></script>

# 4. Gulp copia automáticamente a build/js/
```

### 4. Modo Oscuro para Nuevo Componente

```bash
# 1. Abrir _dark-mode.scss
# src/scss/base/_dark-mode.scss

# 2. Añadir sección
[data-theme="dark"] .mi-componente {
    background: v.$gris-900;
    color: v.$blanco;
}

# 3. Guardar
# Gulp recompila

# 4. Probar en navegador
# Activar toggle y verificar
```

---

## Convenciones de Código

### SCSS

**1. Orden de propiedades:**

```scss
.elemento {
    // Posicionamiento
    position: relative;
    top: 0;
    left: 0;
    
    // Box Model
    display: flex;
    width: 100%;
    margin: 1rem;
    padding: 2rem;
    
    // Tipografía
    font-size: 1.6rem;
    line-height: 1.5;
    color: v.$negro;
    
    // Visual
    background: v.$blanco;
    border: 1px solid v.$gris;
    border-radius: v.$border-radius;
    
    // Misceláneos
    transition: all 0.3s ease;
}
```

**2. Nesting (máximo 3 niveles):**

```scss
// ✅ BIEN
.blog {
    &__article {
        &__title {
            // Nivel 3 - OK
        }
    }
}

// ❌ MAL (demasiado anidado)
.blog {
    &__article {
        &__header {
            &__title {
                &__text {
                    // Nivel 5 - Evitar
                }
            }
        }
    }
}
```

**3. Comentarios:**

```scss
// ============================================
// SECCIÓN PRINCIPAL
// ============================================

// Subsección
.componente {
    // Comentario inline para propiedad específica
    color: v.$primario; // Turquesa principal
}
```

### JavaScript

**1. Comentarios JSDoc:**

```javascript
/**
 * Sanitiza texto removiendo caracteres peligrosos
 * @param {string} texto - Texto a sanitizar
 * @returns {string} - Texto limpio y seguro
 */
function sanitizarTexto(texto) {
    // ...
}
```

**2. Manejo de errores:**

```javascript
function procesarData(data) {
    if (!data || typeof data !== 'object') {
        console.error('❌ Data inválida:', data);
        return null;
    }
    
    try {
        // Procesar
        return result;
    } catch (error) {
        console.error('❌ Error procesando:', error);
        return null;
    }
}
```

**3. Console logs informativos:**

```javascript
console.log('✅ Módulo inicializado');
console.warn('⚠️ Advertencia: configuración por defecto');
console.error('❌ Error crítico');
```

### HTML

**1. Semántica:**

```html
<!-- ✅ BIEN -->
<header>
    <nav>
        <a href="/">Inicio</a>
    </nav>
</header>

<main>
    <article>
        <h1>Título</h1>
        <p>Contenido...</p>
    </article>
</main>

<!-- ❌ MAL -->
<div class="header">
    <div class="nav">
        <div class="link">Inicio</div>
    </div>
</div>
```

**2. Accesibilidad:**

```html
<!-- Siempre incluir aria labels -->
<input 
    type="text" 
    aria-label="Campo de búsqueda"
    aria-describedby="search-help"
>
<span id="search-help">Busca recetas por nombre o ingredientes</span>

<!-- Botones descriptivos -->
<button aria-label="Cerrar modal" class="close-btn">
    ×
</button>
```

**3. Orden de atributos:**

```html
<input 
    type="text"
    id="my-input"
    class="input-field"
    name="search"
    placeholder="Buscar..."
    maxlength="100"
    autocomplete="off"
    aria-label="Campo de búsqueda"
    data-validation="true"
>
```

---

## Performance y Optimización

### CSS

- ✅ **Minificación** en producción
- ✅ **Concatenación** de archivos
- ✅ **Autoprefixer** para compatibilidad
- ✅ **Critical CSS** inline en `<head>`

### JavaScript

- ✅ **Defer** para scripts no críticos
- ✅ **Event delegation** para múltiples elementos
- ✅ **Debounce** en eventos frecuentes (scroll, resize)

### Imágenes

- ✅ **WebP** para web moderna
- ✅ **lazy loading** con `loading="lazy"`
- ✅ **Dimensiones especificadas** (width/height)
- ✅ **Compresión** con imagemin

---

## SEO

### Meta Tags Esenciales

```html
<head>
    <!-- Básico -->
    <title>Título de la Página</title>
    <meta name="description" content="Descripción...">
    <link rel="canonical" href="https://javiertamaritweb.es/pagina.html">
    
    <!-- Open Graph -->
    <meta property="og:title" content="Título">
    <meta property="og:description" content="Descripción">
    <meta property="og:image" content="https://...">
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Título">
</head>
```

### Sitemaps

- ✅ `sitemap.xml` - Páginas principales
- ✅ `sitemap-news.xml` - Artículos del blog
- ✅ `sitemap-podcasts.xml` - Episodios de podcast
- ✅ `sitemap-images.xml` - Imágenes
- ✅ `sitemap-index.xml` - Índice de sitemaps

---

**Última actualización:** 2025-12-12  
**Versión del proyecto:** 3.0.7
