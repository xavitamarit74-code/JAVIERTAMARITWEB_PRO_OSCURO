/**
 * podcasts.js - Carga dinámica de episodios de podcast
 * Gestiona la carga, renderizado y inicialización de reproductores
 */

class PodcastManager {
  constructor() {
    this.podcasts = [];
    this.categorias = [];
    this.players = [];
    this.init();
  }
  
  /**
   * Inicializa el gestor de podcasts
   */
  async init() {
    try {
      await this.loadPodcastsData();
      this.renderCategory();
      this.renderEpisodes();
    } catch (error) {
      this.showError(error.message);
    }
  }
  
  /**
   * Carga los datos de podcasts desde JSON
   */
  async loadPodcastsData() {
    try {
      const response = await fetch('data/podcasts.json');
      
      if (!response.ok) {
        throw new Error(`Error al cargar los datos: ${response.status}`);
      }
      
      const data = await response.json();
      this.categorias = data.categorias || [];
      this.podcasts = data.episodios || [];
      
      if (this.podcasts.length === 0) {
        throw new Error('No hay episodios disponibles');
      }
    } catch (error) {
      console.error('Error cargando podcasts:', error);
      throw new Error('No se pudieron cargar los episodios de podcast');
    }
  }
  
  /**
   * Renderiza la descripción de la categoría
   */
  renderCategory() {
    const categoryDescription = document.getElementById('category-description');
    if (!categoryDescription || this.categorias.length === 0) return;
    
    const categoria = this.categorias[0]; // Gaviotas y Anclas
    categoryDescription.textContent = categoria.descripcion;
  }
  
  /**
   * Renderiza todos los episodios
   */
  renderEpisodes() {
    const container = document.getElementById('podcast-list');
    if (!container) return;
    
    // Limpiar el loading
    container.innerHTML = '';
    
    // Ordenar por fecha (más reciente primero)
    const sortedEpisodes = [...this.podcasts].sort((a, b) => {
      return new Date(b.fecha) - new Date(a.fecha);
    });
    
    // Renderizar cada episodio
    sortedEpisodes.forEach(episode => {
      const episodeCard = this.createEpisodeCard(episode);
      container.appendChild(episodeCard);
    });
    
    // Inicializar reproductores después de renderizar
    this.initPlayers();
  }
  
  /**
   * Inicializa los reproductores de audio
   */
  initPlayers() {
    // Esperar a que Plyr esté disponible
    if (typeof Plyr === 'undefined') {
      console.error('Plyr no está cargado. Asegúrate de incluir el script de Plyr.');
      return;
    }
    
    // Esperar a que PodcastPlayer esté disponible
    if (typeof window.initPodcastPlayers === 'function') {
      window.initPodcastPlayers();
    } else {
      // Si aún no está disponible, esperar un poco
      setTimeout(() => {
        if (typeof window.initPodcastPlayers === 'function') {
          window.initPodcastPlayers();
        }
      }, 100);
    }
  }
  
  /**
   * Crea la tarjeta de un episodio
   * @param {Object} episode - Datos del episodio
   * @returns {HTMLElement} - Elemento DOM de la tarjeta
   */
  createEpisodeCard(episode) {
    const article = document.createElement('article');
    article.className = 'podcast-episode';
    article.setAttribute('role', 'listitem');
    
    // Formatear la fecha
    const fecha = this.formatDate(episode.fecha);
    
    // Schema.org markup para el episodio
    const schemaMarkup = {
      "@context": "https://schema.org",
      "@type": "PodcastEpisode",
      "episodeNumber": episode.episodio,
      "seasonNumber": episode.temporada,
      "name": episode.titulo,
      "description": episode.descripcion,
      "datePublished": episode.fecha,
      "duration": `PT${episode.duracion.replace(':', 'M')}S`,
      "associatedMedia": {
        "@type": "MediaObject",
        "contentUrl": `podcasts/${episode.archivo}`
      }
    };
    
    article.innerHTML = `
      <script type="application/ld+json">
        ${JSON.stringify(schemaMarkup)}
      </script>
      
      <div class="podcast-episode__image-container">
        <img 
          class="podcast-episode__image" 
          src="img/${episode.imagen}" 
          alt="Portada del episodio: ${episode.titulo}"
          loading="lazy"
          width="300"
          height="300"
        >
        <span class="podcast-episode__badge" aria-label="Temporada ${episode.temporada}, Episodio ${episode.episodio}">
          T${episode.temporada} E${episode.episodio}
        </span>
      </div>
      
      <div class="podcast-episode__content">
        <div class="podcast-episode__meta">
          <time class="podcast-episode__date" datetime="${episode.fecha}">
            <span class="material-icons" aria-hidden="true">calendar_today</span>
            ${fecha}
          </time>
          <span class="podcast-episode__duration">
            <span class="material-icons" aria-hidden="true">schedule</span>
            ${episode.duracion}
          </span>
        </div>
        
        <h3 class="podcast-episode__title">${episode.titulo}</h3>
        
        <p class="podcast-episode__description">${episode.descripcion}</p>
        
        <div class="podcast-player-container">
          <audio 
            class="podcast-audio" 
            data-episode-id="${episode.id}"
            preload="metadata"
            aria-label="Reproductor de audio para ${episode.titulo}"
          >
            <source src="podcasts/${episode.archivo}" type="audio/mp4">
            Tu navegador no soporta el elemento de audio.
          </audio>
        </div>
      </div>
    `;
    
    return article;
  }
  
  /**
   * Formatea una fecha ISO a formato legible
   * @param {string} isoDate - Fecha en formato ISO (YYYY-MM-DD)
   * @returns {string} - Fecha formateada
   */
  formatDate(isoDate) {
    const date = new Date(isoDate);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('es-ES', options);
  }
  
  /**
   * Muestra un mensaje de error
   * @param {string} message - Mensaje de error
   */
  showError(message) {
    const container = document.getElementById('podcast-list');
    if (!container) return;
    
    container.innerHTML = `
      <div class="podcast-error" role="alert">
        <span class="podcast-error__icon" aria-hidden="true">⚠️</span>
        <h3 class="podcast-error__title">Error al cargar los podcasts</h3>
        <p class="podcast-error__message">${message}</p>
      </div>
    `;
  }
  
  /**
   * Limpia y destruye todos los reproductores
   */
  destroy() {
    this.players.forEach(player => {
      if (player && player.destroy) {
        player.destroy();
      }
    });
    this.players = [];
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  // Solo inicializar en la página de podcasts
  if (document.getElementById('podcast-list')) {
    window.podcastManager = new PodcastManager();
  }
});

// Limpiar al salir de la página
window.addEventListener('beforeunload', () => {
  if (window.podcastManager) {
    window.podcastManager.destroy();
  }
});

