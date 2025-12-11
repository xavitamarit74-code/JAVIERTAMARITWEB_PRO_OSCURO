// js/articulos.js
// Carga contenido dinámico de artículos y Lightbox

// Función para procesar HTML básico (br tags)
function procesarHTMLBasico(texto) {
  return texto.replace(/<br\s*\/?>/gi, '<br>');
}

// Obtener rutas de imagen en diferentes formatos
function getImagePaths(imagenBase) {
  // Extraer nombre base sin extensión
  const basePath = imagenBase.replace(/\.[^/.]+$/, '');
  return {
    avif: basePath + '.avif',
    webp: basePath + '.webp',
    jpg: basePath.endsWith('.png') ? imagenBase : basePath + '.jpg',
    fallback: imagenBase
  };
}

// Cargar contenido del artículo desde JSON
async function cargarContenidoArticulo() {
  // Verificar si estamos en la página de artículo
  const contenedor = document.querySelector('#articulo-contenido .blog__articulo');
  if (!contenedor) return;
  
  // Obtener el ID del artículo desde la URL (?id=X)
  const params = new URLSearchParams(window.location.search);
  const articuloId = parseInt(params.get('id'), 10);
  if (!articuloId) {
    contenedor.innerHTML = '<p>Artículo no encontrado. Por favor selecciona un artículo desde el blog.</p>';
    return;
  }
  
  try {
    const res = await fetch('data/articulos.json');
    const data = await res.json();
    const articulo = data.articulos.find(a => a.id === articuloId);
    
    if (!articulo) {
      contenedor.innerHTML = '<p>Artículo no encontrado.</p>';
      return;
    }
    
    // Actualizar título de la página y del header
    document.title = `${articulo.titulo.replace(/<br\s*\/?>/gi, ' ')} - JavierTamarit Web`;
    const tituloHeader = document.getElementById('articulo-titulo');
    if (tituloHeader) {
      tituloHeader.innerHTML = procesarHTMLBasico(articulo.titulo);
    }
    
    // Cargar imagen en el picture element
    const marcoFoto = document.querySelector('.blog__marco-foto');
    if (marcoFoto && articulo.imagen) {
      const paths = getImagePaths(articulo.imagen);
      marcoFoto.innerHTML = `
        <picture>
          <source srcset="${paths.avif}" type="image/avif">
          <source srcset="${paths.webp}" type="image/webp">
          <img class="blog__miniatura lightbox-trigger" 
               src="${paths.fallback}" 
               data-lightbox-src="${paths.fallback}"
               alt="${articulo.titulo}" 
               style="cursor: pointer;">
        </picture>
      `;
    }
    
    // Cargar autor y fecha
    const autorEl = document.querySelector('.blog__author');
    const fechaEl = document.querySelector('.blog__fecha');
    
    if (autorEl && articulo.autor) {
      autorEl.textContent = `Autor: ${articulo.autor}`;
    }
    if (fechaEl && articulo.fecha) {
      const fecha = new Date(articulo.fecha);
      fechaEl.innerHTML = `<time datetime="${articulo.fecha}">${fecha.toLocaleDateString('es-ES')}</time>`;
    }
    
    // Generar párrafos con clase para estilos
    if (articulo.contenido) {
      contenedor.innerHTML = articulo.contenido
        .map(parrafo => `<p class="blog__parrafo">${procesarHTMLBasico(parrafo)}</p>`)
        .join('');
    }
  } catch (error) {
    console.error('Error cargando contenido del artículo:', error);
    contenedor.innerHTML = '<p>Error al cargar el artículo.</p>';
  }
}

// Cargar listado de blog desde JSON
async function cargarListadoBlog() {
  const contenedor = document.getElementById('blog-listado');
  if (!contenedor) return;
  
  try {
    const res = await fetch('data/articulos.json');
    const data = await res.json();
    const articulos = data.articulos || [];
    
    // Generar HTML para cada artículo
    contenedor.innerHTML = articulos.map(articulo => {
      const paths = getImagePaths(articulo.imagen);
      const fecha = new Date(articulo.fecha);
      const fechaFormateada = fecha.toLocaleDateString('es-ES');
      
      return `
        <div class="blog" data-articulo-id="${articulo.id}">
          <div class="blog__marco-foto">
            <a href="articulo.html?id=${articulo.id}">
              <picture>
                <source srcset="${paths.avif}" type="image/avif">
                <source srcset="${paths.webp}" type="image/webp">
                <img class="blog__miniatura" src="${paths.fallback}" alt="${articulo.titulo}">
              </picture>
            </a>
          </div>
          <h3 class="blog__title"><a href="articulo.html?id=${articulo.id}">${procesarHTMLBasico(articulo.titulo)}</a></h3>
          <p class="blog__fecha"><time datetime="${articulo.fecha}">${fechaFormateada}</time></p>
          <p class="blog__articulo">${articulo.extracto}</p>
          <a class="blog__enlace" href="articulo.html?id=${articulo.id}">Leer Más</a>
        </div>
      `;
    }).join('');
  } catch (error) {
    console.error('Error cargando listado de blog:', error);
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  cargarContenidoArticulo();
  cargarListadoBlog();
  inicializarLightbox();
});

// Funciones del Lightbox
function crearLightbox() {
  const lightbox = document.createElement('div');
  lightbox.id = 'lightbox';
  lightbox.className = 'lightbox';
  
  const img = document.createElement('img');
  img.id = 'lightbox-img';
  img.className = 'lightbox__img';
  
  const closeBtn = document.createElement('span');
  closeBtn.innerHTML = '&times;';
  closeBtn.className = 'lightbox__close';
  
  // Crear controles de zoom
  const zoomControls = document.createElement('div');
  zoomControls.id = 'lightbox-zoom-controls';
  zoomControls.className = 'lightbox__zoom-controls';
  
  // Botón de zoom out
  const zoomOutBtn = document.createElement('button');
  zoomOutBtn.innerHTML = '−';
  zoomOutBtn.id = 'lightbox-zoom-out';
  zoomOutBtn.className = 'lightbox__btn';
  
  // Display de zoom actual
  const zoomDisplay = document.createElement('button');
  zoomDisplay.innerHTML = '100%';
  zoomDisplay.id = 'lightbox-zoom-display';
  zoomDisplay.className = 'lightbox__zoom-display';
  
  // Botón de zoom in
  const zoomInBtn = document.createElement('button');
  zoomInBtn.innerHTML = '+';
  zoomInBtn.id = 'lightbox-zoom-in';
  zoomInBtn.className = 'lightbox__btn';
  
  // Botón de lupa/buscar
  const searchBtn = document.createElement('button');
  searchBtn.innerHTML = '🔍';
  searchBtn.id = 'lightbox-search';
  searchBtn.className = 'lightbox__btn lightbox__btn--accent';
  
  // Los efectos hover ahora están en CSS
  
  // Agregar controles al contenedor
  zoomControls.appendChild(zoomOutBtn);
  zoomControls.appendChild(zoomDisplay);
  zoomControls.appendChild(zoomInBtn);
  zoomControls.appendChild(searchBtn);
  
  lightbox.appendChild(img);
  lightbox.appendChild(closeBtn);
  lightbox.appendChild(zoomControls);
  document.body.appendChild(lightbox);
  
  // Variables de zoom
  let currentZoom = 100;
  const minZoom = 30;
  const maxZoom = 200;
  const zoomStep = 10;
  
  // Funciones de zoom
  function updateZoomDisplay() {
    zoomDisplay.innerHTML = `${currentZoom}%`;
    updateZoomButtons();
  }
  
  function updateZoomButtons() {
    zoomOutBtn.disabled = currentZoom <= minZoom;
    zoomInBtn.disabled = currentZoom >= maxZoom;
    
    if (zoomOutBtn.disabled) {
      zoomOutBtn.style.opacity = '0.5';
      zoomOutBtn.style.cursor = 'not-allowed';
    } else {
      zoomOutBtn.style.opacity = '1';
      zoomOutBtn.style.cursor = 'pointer';
    }
    
    if (zoomInBtn.disabled) {
      zoomInBtn.style.opacity = '0.5';
      zoomInBtn.style.cursor = 'not-allowed';
    } else {
      zoomInBtn.style.opacity = '1';
      zoomInBtn.style.cursor = 'pointer';
    }
  }
  
  function applyZoom() {
    const scale = currentZoom / 100;
    img.style.transform = `scale(${scale})`;
    updateZoomDisplay();
  }
  
  function resetZoom() {
    currentZoom = 100;
    applyZoom();
  }
  
  // Event listeners para los controles
  zoomOutBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (currentZoom > minZoom) {
      currentZoom -= zoomStep;
      applyZoom();
    }
  });
  
  zoomInBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (currentZoom < maxZoom) {
      currentZoom += zoomStep;
      applyZoom();
    }
  });
  
  zoomDisplay.addEventListener('click', (e) => {
    e.stopPropagation();
    resetZoom();
  });
  
  searchBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    // Resetear zoom al 100%
    resetZoom();
    // Toggle entre diferentes vistas o funcionalidades adicionales
    if (img.style.maxWidth === '100%') {
      img.style.maxWidth = '90%';
      img.style.maxHeight = '90%';
    } else {
      img.style.maxWidth = '100%';
      img.style.maxHeight = '100%';
    }
  });
  
  // Prevenir que los clics en los controles cierren el lightbox
  zoomControls.addEventListener('click', (e) => {
    e.stopPropagation();
  });
  
  // Cerrar lightbox al hacer clic en el fondo o en la X
  lightbox.onclick = (e) => {
    if (e.target === lightbox || e.target === closeBtn) {
      lightbox.style.display = 'none';
      resetZoom(); // Resetear zoom al cerrar
    }
  };
  
  // Cerrar con Escape y atajos de teclado
  document.addEventListener('keydown', (e) => {
    if (lightbox.style.display === 'flex') {
      if (e.key === 'Escape') {
        lightbox.style.display = 'none';
        resetZoom();
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        if (currentZoom < maxZoom) {
          currentZoom += zoomStep;
          applyZoom();
        }
      } else if (e.key === '-') {
        e.preventDefault();
        if (currentZoom > minZoom) {
          currentZoom -= zoomStep;
          applyZoom();
        }
      } else if (e.key === '0') {
        e.preventDefault();
        resetZoom();
      }
    }
  });
  
  // Inicializar zoom
  updateZoomDisplay();
  
  return lightbox;
}

function inicializarLightbox() {
  // Crear lightbox si no existe
  let lightbox = document.getElementById('lightbox');
  if (!lightbox) {
    lightbox = crearLightbox();
  }
  
  // Agregar eventos a las imágenes
  const images = document.querySelectorAll('.lightbox-trigger');
  images.forEach(img => {
    img.addEventListener('click', (e) => {
      e.preventDefault();
      const lightboxImg = document.getElementById('lightbox-img');
      // Usar la imagen completa si está disponible, sino usar la imagen normal
      const imageSrc = img.getAttribute('data-lightbox-src') || img.src;
      lightboxImg.src = imageSrc;
      lightboxImg.alt = img.alt;
      lightbox.style.display = 'flex';
    });
  });
}
