<div align="center">

<img src="src/img/brain-neon-sin-fondo.png" alt="Logo Brain Neon" width="180">

#  Javier Tamarit Web
### Historia de Recuperación y Segunda Vida

[![Estado](https://img.shields.io/badge/Estado-Producción%20Ready-2ea44f?style=for-the-badge&logo=github)](https://github.com/javitamarit/web)
[![Versión](https://img.shields.io/badge/VERSIÓN-3.0.7-007ec6?style=for-the-badge&logo=semver&logoColor=white)](https://github.com/javitamarit/web/releases)
[![Build](https://img.shields.io/badge/Build-Passing-Success?style=for-the-badge&logo=github-actions)](https://github.com/javitamarit/web/actions)
[![License](https://img.shields.io/badge/Licencia-MIT-green?style=for-the-badge)](https://github.com/javitamarit/web/blob/main/LICENSE)

**[Ver Demo en Vivo](https://javiertamaritweb.es)** • **[Leer Documentación](#-documentación-técnica)** • **[Reportar Bug](https://github.com/javitamarit/web/issues)**

</div>

---

## 📋 Resumen Ejecutivo

**Javier Tamarit Web** es una plataforma digital de alto rendimiento diseñada para narrar una historia de superación personal tras un ictus. Más allá de un blog convencional, este proyecto representa una **ingeniería web moderna** enfocada en la accesibilidad, la velocidad de carga (Core Web Vitals) y una experiencia de usuario inmersiva.

La arquitectura se basa en un enfoque **JAMstack híbrido**, utilizando generación de sitios estáticos optimizada con inyección dinámica de contenido vía JSON, garantizando seguridad máxima y tiempos de respuesta mínimos.

---

## 🏗 Arquitectura y Flujo de Datos

```mermaid
graph TD
    User[👤 Usuario] -->|Accede| CDN[🌍 Servidor Apache/CDN]
    CDN -->|Entrega| HTML[📄 HTML5 Estático]
    CDN -->|Entrega| Assets[🖼️ Assets Optimizados]
    
    subgraph "Cliente (Navegador)"
        HTML --> JS[⚡ JavaScript Core]
        JS -->|Fetch| JSON[📦 Estructura de Datos (JSON)]
        JSON -->|Renderiza| UI[🎨 Interfaz Dinámica]
        UI -->|Interacción| Modules[🧩 Módulos (Audio, Buscador)]
    end
    
    subgraph "Build System (Gulp)"
        SCSS[🎨 SCSS Source] -->|Sass + PostCSS| CSS[💅 CSS Minificado]
        JSSrc[📜 JS Source] -->|Babel/Minify| JSBundle[⚡ JS Bundle]
        IMG[🖼️ Imágenes Raw] -->|Sharp| WebP[🖼️ WebP/AVIF]
    end
```

---

## ✨ Características Técnicas Avanzadas

### 🚀 Performance (Core Web Vitals)
*   **Next-Gen Images:** Conversión automática pipeline de `Sharp` a **WebP (-30%)** y **AVIF (-50%)**.
*   **Resource Hints:** Uso estratégico de `preload`, `preconnect` y `dns-prefetch` en el `<head>`.
*   **Lazy Loading Nativo:** Implementado en todas las imágenes off-screen y iframes de YouTube.
*   **Compresión Brotli/Gzip:** Configurada a nivel de servidor (`.htaccess`) para todos los activos de texto.
*   **HTTP/2 Push:** Priorización de recursos críticos CSS/JS.

### �️ Seguridad y Servidor (`.htaccess`)
*   **HSTS (Strict-Transport-Security):** Forzado de HTTPS con `max-age` de 1 año y `preload`.
*   **CSP (Content Security Policy):** Headers estrictos para prevenir XSS y ataques de inyección.
*   **Protección Anti-Clickjacking:** Header `X-Frame-Options: SAMEORIGIN`.
*   **Ocultación de Tecnologías:** Eliminación de headers `X-Powered-By`.
*   **Cache Inmutable:** Assets estáticos con cache de 1 año (`max-age=31536000, immutable`).

### 🧩 Ingeniería de Frontend
*   **Arquitectura CSS ITCSS + BEM:** Estructura escalable dividida en Settings, Tools, Generic, Elements, Objects, Components y Utilities.
*   **JavaScript Modular:** Uso de **ES6 Modules** para separación de responsabilidades (Reproductor, Buscador, Renderizado).
*   **Accesibilidad (a11y):** Semántica HTML5 estricta, roles ARIA y foco visible gestionado.
*   **Scrollbars Cross-Browser:** Estilos personalizados que funcionan consistentemente en WebKit (Chrome/Safari) y Firefox.

---

## 💻 Stack Tecnológico

<div align="center">

| Core | Estilos | Procesamiento | Datos |
| :---: | :---: | :---: | :---: |
| ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white) | ![SASS](https://img.shields.io/badge/Sass-CC6699?style=flat-square&logo=sass&logoColor=white) | ![Gulp](https://img.shields.io/badge/Gulp-CF4647?style=flat-square&logo=gulp&logoColor=white) | ![JSON](https://img.shields.io/badge/JSON-000000?style=flat-square&logo=json&logoColor=white) |
| **Semántica** | **SCSS Modules** | **Automator** | **API Estática** |

</div>

### Dependencias Clave
*   **Sharp (`^3.x`):** Motor de procesamiento de imágenes de altísimo rendimiento.
*   **Plyr:** Reproductor multimedia accesible y personalizable para los podcasts.
*   **Autoprefixer:** Garantía de compatibilidad CSS automática.
*   **BrowserSync:** Servidor de desarrollo con sincronización en tiempo real.

---

## 🎨 Design System

El sistema de diseño "Vitality" combina la energía de la recuperación con la calma necesaria para la lectura.

### 🎨 Paleta Cromática
| Token | Valor Hex | Uso Principal |
| :--- | :--- | :--- |
| **$primario** | `#4ECDC4` | Identidad de marca, CTAs principales |
| **$primario-oscuro** | `#3BA99F` | Estados hover, bordes activos |
| **$rosaOscuro** | `#F790B2` | Acentos emocionales, scrollbars |
| **$gris-900** | `#1A1A1A` | Texto principal (Alto contraste AAA) |
| **$blanco** | `#FFFFFF` | Superficies y contenedores |

### 🔍 SEO y Semántica
*   **Estructura Semántica:** HTML5 estricto (`article`, `section`, `nav`, `aside`).
*   **Metadatos Completos:** Open Graph, Twitter Cards y Schema.org JSON-LD.
*   **SEO para IA:** Metatags específicos (`ai-purpose`, `ai-audience`) para indexado por LLMs.
*   **Sitemaps Múltiples:** Índices para páginas, imágenes, noticias y podcasts.

### 🍳 Módulo de Recetas Inteligente
El sistema incluye una base de datos culinaria interactiva accesible de dos formas:
1.  **Recetario Visual (`consejos.html`):** Grid de tarjetas con todas las recetas disponibles, ideal para exploración visual.
2.  **Buscador Avanzado (`dieta_equilibrada.html`):** Herramienta de filtrado en tiempo real que permite:
    *   **Búsqueda por texto:** Ingredientes o nombres de platos.
    *   **Filtrado por Categoría:** Desayunos, Comidas, Cenas, Snacks, Postres.
    *   **Filtrado por Dificultad:** Fácil, Media, Difícil.
    *   **Resultados Dinámicos:** Las recetas coincidentes se renderizan instantáneamente sin recargar la página.

---

## 📂 Estructura del Proyecto

Organización lógica separando código fuente (`src`) de distribución (`build`).

```bash
/
├──build/                 # 🚀 PRODUCTION READY (No editar)
│  ├──css/                # CSS compilado y minificado
│  ├──img/                # Imágenes optimizadas (WebP/AVIF)
│  └──js/                 # Bundles JavaScript
├──src/                   # 🛠️ SOURCE CODE
│  ├──data/               # "Base de Datos" estática (JSON)
│  │  ├──articulos.json   # Blog posts
│  │  ├──podcasts.json    # Episodios y metadatos
│  │  └──recetas.json     # Recetario estructurado
│  ├──img/                # Assets originales (PNG/JPG alta calidad)
│  ├──js/                 # Lógica de aplicación
│  │  ├──modules/         # Módulos reutilizables
│  │  └──app.js           # Entry point
│  └──scss/               # Arquitectura SASS
│     ├──base/            # Variables, Mixins, Boilerplate
│     └──ui/              # Componentes visuales (Cards, Nav)
├──gulpfile.js            # Pipeline de CI/CD local
└──package.json           # Dependencias y scripts
```

---

## 🛠 Guía de Desarrollo

### Comandos NPM
| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | **Modo Desarrollo:** Levanta servidor local, vigila cambios y compila al vuelo. |
| `npm run build` | **Modo Producción:** Compilación completa, optimización de imágenes y minificación. |

### Configuración del Pipeline (Gulp)
El archivo `gulpfile.js` define las siguientes tareas automatizadas:
1.  **`css`:** Compila SCSS → PostCSS (Autoprefixer) → CSS destino.
2.  **`images`:** Detecta nuevas imágenes → Convierte a WebP + AVIF → Copia originales.
3.  **`js`:** Transpila y copia scripts.
4.  **`seo`:** Mueve `sitemap.xml`, `robots.txt` y archivos de verificación a la raíz de build.

---

## 🔮 Roadmap Futuro

*   [x] **Modo Oscuro v2:** Implementación con preferencias de sistema (`prefers-color-scheme`) y toggle manual.
*   [x] **Animación Podcast:** Video dinámico en reproducción de episodios (v3.1.0).
*   [ ] **PWA (Progressive Web App):** Service Workers para funcionamiento offline completo.
*   [ ] **Testing E2E:** Integración de Cypress para pruebas de flujo crítico.
*   [ ] **Búsqueda Full-Text:** Implementación de Fuse.js para búsquedas instantáneas en el blog.

---

<div align="center">

**© 2025 Javier Tamarit**  
*Ingeniería Web con Propósito.*

[Instagram](https://instagram.com/javi_t) • [TikTok](https://tiktok.com/@_javier_t_) • [YouTube](https://youtube.com/@JabsThw)

</div>
