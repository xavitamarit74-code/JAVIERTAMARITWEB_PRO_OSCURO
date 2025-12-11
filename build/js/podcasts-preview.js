/**
 * Podcasts Preview para index.html
 * Carga y muestra los últimos 3 episodios del podcast
 * Versión ligera sin reproductor (solo enlaces a podcast.html)
 * 
 * @version 1.0.0
 * @date 2025-11-21
 */

class PodcastsPreview {
  constructor() {
    this.container = document.getElementById('podcasts-preview-list');
    this.maxEpisodes = 3; // Mostrar solo los últimos 3 episodios
    this.podcasts = [];
    
    if (this.container) {
      this.init();
    }
  }

  async init() {
    try {
      await this.loadPodcastsData();
      this.renderPreview();
    } catch (error) {
      console.error('Error al cargar episodios de podcast:', error);
      this.showError();
    }
  }

  async loadPodcastsData() {
    try {
      const response = await fetch('data/podcasts.json');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Obtener solo los últimos N episodios (más recientes primero)
      this.podcasts = (data.episodios || [])
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
        .slice(0, this.maxEpisodes);
      
    } catch (error) {
      console.error('Error loading podcasts data:', error);
      throw error;
    }
  }

  renderPreview() {
    if (!this.podcasts || this.podcasts.length === 0) {
      this.container.innerHTML = `
        <div class="podcasts-preview__empty">
          <p>No hay episodios disponibles en este momento.</p>
        </div>
      `;
      return;
    }

    // Limpiar contenedor
    this.container.innerHTML = '';

    // Renderizar cada episodio como card compacta
    this.podcasts.forEach(episode => {
      const card = this.createEpisodeCard(episode);
      this.container.appendChild(card);
    });

    // Anunciar a lectores de pantalla
    this.announceToScreenReader(`${this.podcasts.length} episodios de podcast cargados`);
  }

  createEpisodeCard(episode) {
    const article = document.createElement('article');
    article.className = 'podcast-preview-card';
    article.setAttribute('role', 'listitem');
    
    // Formatear fecha
    const fechaFormateada = this.formatearFecha(episode.fecha);
    
    // Descripción truncada (máximo 120 caracteres)
    const descripcionCorta = this.truncateText(episode.descripcion, 120);
    
    article.innerHTML = `
      <a href="podcasts.html#episode-${episode.id}" class="podcast-preview-card__link" aria-label="Escuchar episodio: ${episode.titulo}">
        <div class="podcast-preview-card__image-container">
          <img 
            src="img/${episode.imagen}" 
            alt="${episode.titulo}"
            class="podcast-preview-card__image"
            loading="lazy"
            width="200"
            height="200"
          >
          <span class="podcast-preview-card__badge" aria-label="Temporada ${episode.temporada} Episodio ${episode.episodio}">
            T${episode.temporada} E${episode.episodio}
          </span>
        </div>
        
        <div class="podcast-preview-card__content">
          <h3 class="podcast-preview-card__title">${episode.titulo}</h3>
          <p class="podcast-preview-card__description">${descripcionCorta}</p>
          
          <div class="podcast-preview-card__meta">
            <time class="podcast-preview-card__date" datetime="${episode.fecha}">
              ${fechaFormateada}
            </time>
            ${episode.duracion ? `
              <span class="podcast-preview-card__duration" aria-label="Duración: ${episode.duracion}">
                🎧 ${episode.duracion}
              </span>
            ` : ''}
          </div>
          
          <span class="podcast-preview-card__cta">
            Escuchar Episodio
          </span>
        </div>
      </a>
    `;
    
    return article;
  }

  truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  }

  formatearFecha(fechaISO) {
    if (!fechaISO) return '';
    
    const fecha = new Date(fechaISO);
    const opciones = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    
    return fecha.toLocaleDateString('es-ES', opciones);
  }

  showError() {
    if (!this.container) return;
    
    this.container.innerHTML = `
      <div class="podcasts-preview__error" role="alert">
        <p>⚠️ No se pudieron cargar los episodios en este momento.</p>
        <p><a href="podcasts.html">Visitar página de Podcasts</a></p>
      </div>
    `;
  }

  announceToScreenReader(message) {
    // Crear elemento oculto para lectores de pantalla
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Eliminar después de 3 segundos
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 3000);
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  // Solo inicializar si existe el contenedor en la página
  if (document.getElementById('podcasts-preview-list')) {
    window.podcastsPreview = new PodcastsPreview();
  }
});

