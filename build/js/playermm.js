/**
 * playermm.js - Reproductor de Audio para Podcasts
 * Usa Plyr.js para compatibilidad cross-browser
 * Incluye ecualizador animado y controles accesibles
 * Video background dynamic implementation
 */

class PodcastPlayer {
  // Static property for video preloading
  static videoSource = 'video/animaciones/animacion_reproductor_1.mp4';
  static videoBlobUrl = null;
  static isPreloading = false;

  constructor(audioElement, episodeId) {
    this.audioElement = audioElement;
    this.episodeId = episodeId;
    this.player = null;
    this.equalizer = null;
    this.imageContainer = null;
    this.videoElement = null; // Reference to the injected video
    this.isPlaying = false;
    
    // Preload video globally if not done yet
    PodcastPlayer.preloadVideo();

    this.init();
  }

  /**
   * Preloads the animation video once for all instances
   */
  static async preloadVideo() {
    if (PodcastPlayer.videoBlobUrl || PodcastPlayer.isPreloading) return;

    PodcastPlayer.isPreloading = true;
    try {
        const response = await fetch(PodcastPlayer.videoSource);
        const blob = await response.blob();
        PodcastPlayer.videoBlobUrl = URL.createObjectURL(blob);
        console.log('Podcast animation video preloaded successfully');
    } catch (error) {
        console.error('Failed to preload podcast animation:', error);
        // Fallback to direct URL if blob fails
        PodcastPlayer.videoBlobUrl = PodcastPlayer.videoSource;
    } finally {
        PodcastPlayer.isPreloading = false;
    }
  }
  
  /**
   * Inicializa el reproductor Plyr
   */
  init() {
    // Configuración de Plyr
    const controls = [
      'play-large',
      'play',
      'progress',
      'current-time',
      'duration',
      'mute',
      'volume',
      'settings'
    ];
    
    // Obtener la URL del archivo de audio
    const audioSource = this.audioElement.querySelector('source');
    const audioUrl = audioSource ? audioSource.src : '';
    
    this.player = new Plyr(this.audioElement, {
      controls,
      settings: ['speed'],
      speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
      urls: {
        download: audioUrl
      },
      i18n: {
        restart: 'Reiniciar',
        rewind: 'Retroceder {seektime}s',
        play: 'Reproducir',
        pause: 'Pausar',
        fastForward: 'Adelantar {seektime}s',
        seek: 'Buscar',
        seekLabel: '{currentTime} de {duration}',
        played: 'Reproducido',
        buffered: 'Buffered',
        currentTime: 'Tiempo actual',
        duration: 'Duración',
        volume: 'Volumen',
        mute: 'Silenciar',
        unmute: 'Activar sonido',
        enableCaptions: 'Activar subtítulos',
        disableCaptions: 'Desactivar subtítulos',
        download: 'Descargar',
        enterFullscreen: 'Pantalla completa',
        exitFullscreen: 'Salir de pantalla completa',
        frameTitle: 'Reproductor de {title}',
        captions: 'Subtítulos',
        settings: 'Ajustes',
        menuBack: 'Volver al menú anterior',
        speed: 'Velocidad',
        normal: 'Normal',
        quality: 'Calidad',
        loop: 'Repetir',
        start: 'Inicio',
        end: 'Fin',
        all: 'Todo',
        reset: 'Restablecer',
        disabled: 'Deshabilitado',
        enabled: 'Habilitado',
        advertisement: 'Anuncio',
        qualityBadge: {
          2160: '4K',
          1440: 'HD',
          1080: 'HD',
          720: 'HD',
          576: 'SD',
          480: 'SD'
        }
      },
      keyboard: {
        focused: true,
        global: false
      },
      tooltips: {
        controls: true,
        seek: true
      }
    });
    
    // Crear el ecualizador
    this.createEqualizer();
    
    // Encontrar contenedor de imagen y preparar video
    this.findImageContainer();
    
    // Event listeners
    this.setupEventListeners();
    
    // Guardar estado en sessionStorage
    this.loadState();
  }
  
  /**
   * Crea el ecualizador animado
   */
  createEqualizer() {
    const playerContainer = this.audioElement.closest('.podcast-player-container');
    if (!playerContainer) return;
    
    // Detectar tamaño de pantalla para número de barras
    const width = window.innerWidth;
    let numBars;
    
    if (width > 1199) {
      numBars = 100; // Desktop: 100 barras
    } else if (width >= 768) {
      numBars = 80;  // Tablet: 80 barras
    } else {
      numBars = 40;  // Mobile: 40 barras
    }
    
    // Generar barras dinámicamente
    let barsHTML = '';
    for (let i = 0; i < numBars; i++) {
      barsHTML += '<div class="podcast-equalizer__bar"></div>';
    }
    
    const equalizerHTML = `
      <div class="podcast-equalizer" role="img" aria-label="Visualización de audio">
        ${barsHTML}
      </div>
    `;
    
    playerContainer.insertAdjacentHTML('afterbegin', equalizerHTML);
    this.equalizer = playerContainer.querySelector('.podcast-equalizer');
  }
  
  /**
   * Encuentra el contenedor de imagen del episodio
   */
  findImageContainer() {
    const episodeCard = this.audioElement.closest('.podcast-episode');
    if (episodeCard) {
      this.imageContainer = episodeCard.querySelector('.podcast-episode__image-container');
    }
  }

  /**
   * Crea e inyecta el elemento de video si no existe
   */
  createVideoElement() {
    if (!this.imageContainer || this.videoElement) return;

    this.videoElement = document.createElement('video');
    this.videoElement.className = 'podcast-episode__video';
    this.videoElement.src = PodcastPlayer.videoBlobUrl || PodcastPlayer.videoSource;
    this.videoElement.loop = true;
    this.videoElement.muted = true;
    this.videoElement.playsInline = true;
    this.videoElement.setAttribute('aria-hidden', 'true'); // Decorativo
    
    // Insertar como primer hijo para que quede detrás del badge si se desea, 
    // pero con z-index cubriremos la imagen.
    this.imageContainer.appendChild(this.videoElement);
  }
  
  /**
   * Gestión global de videos: Pausa y oculta todos los videos activos
   * para asegurar que solo uno se reproduce a la vez.
   */
  resetAllVideos() {
    const allVideos = document.querySelectorAll('.podcast-episode__video');
    allVideos.forEach(video => {
        video.pause();
        video.style.opacity = '0';
        // Opcional: reiniciar tiempo
        // video.currentTime = 0;
    });

    const allContainers = document.querySelectorAll('.podcast-episode__image-container');
    allContainers.forEach(container => container.classList.remove('is-playing-video'));
  }
  
  /**
   * Configura los event listeners del reproductor
   */
  setupEventListeners() {
    // Play event
    this.player.on('play', () => {
      this.isPlaying = true;
      this.showEqualizer();
      
      // Resetear otros videos y animaciones
      this.resetAllVideos();
      
      // Iniciar video actual
      if (this.imageContainer) {
          this.imageContainer.classList.add('is-playing-video');
          
          // Crear video si es la primera vez
          if (!this.videoElement) {
              this.createVideoElement();
          }

          // Reproducir video
          if (this.videoElement) {
              this.videoElement.play().catch(e => console.warn('Auto-play prevented:', e));
              this.videoElement.style.opacity = '1';
          }
      }
      
      this.saveState();
      this.announceToScreenReader('Reproduciendo');
    });
    
    // Pause event
    this.player.on('pause', () => {
      this.isPlaying = false;
      this.hideEqualizer();
      
      // Pausar y ocultar video
      if (this.videoElement) {
          this.videoElement.style.opacity = '0';
          setTimeout(() => {
              if (!this.isPlaying) this.videoElement.pause();
          }, 300); // Esperar a la transición CSS
      }
      
      if (this.imageContainer) {
          this.imageContainer.classList.remove('is-playing-video');
      }
      
      this.saveState();
      this.announceToScreenReader('Pausado');
    });
    
    // Ended event
    this.player.on('ended', () => {
      this.isPlaying = false;
      this.hideEqualizer();
      
      // Pausar y ocultar video
      if (this.videoElement) {
        this.videoElement.style.opacity = '0';
        this.videoElement.pause();
      }

      if (this.imageContainer) {
        this.imageContainer.classList.remove('is-playing-video');
      }
      
      this.saveState();
      this.announceToScreenReader('Episodio finalizado');
    });
    
    // Time update event (guardar progreso cada 5 segundos)
    let lastSaveTime = 0;
    this.player.on('timeupdate', () => {
      const currentTime = this.player.currentTime;
      if (currentTime - lastSaveTime >= 5) {
        this.saveState();
        lastSaveTime = currentTime;
      }
    });
    
    // Volume change event
    this.player.on('volumechange', () => {
      this.saveState();
    });
    
    // Speed change event
    this.player.on('ratechange', () => {
      this.announceToScreenReader(`Velocidad cambiada a ${this.player.speed}x`);
    });
    
    // Error handling
    this.player.on('error', (event) => {
      console.error('Error en el reproductor:', event);
      this.showError('Error al cargar el audio. Por favor, inténtalo de nuevo.');
    });
    
    // Teclado personalizado para adelantar/retroceder
    document.addEventListener('keydown', (e) => {
      // Solo si el reproductor tiene el foco o está activo
      if (!this.player.playing && e.key !== ' ') return;
      
      switch(e.key) {
        case 'ArrowRight':
          e.preventDefault();
          this.skip(15);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          this.skip(-15);
          break;
      }
    });
  }
  
  /**
   * Muestra el ecualizador
   */
  showEqualizer() {
    if (this.equalizer) {
      this.equalizer.classList.add('active');
    }
  }
  
  /**
   * Oculta el ecualizador
   */
  hideEqualizer() {
    if (this.equalizer) {
      this.equalizer.classList.remove('active');
    }
  }
  
  /**
   * Adelanta o retrocede el audio
   * @param {number} seconds - Segundos a avanzar (positivo) o retroceder (negativo)
   */
  skip(seconds) {
    const newTime = this.player.currentTime + seconds;
    this.player.currentTime = Math.max(0, Math.min(newTime, this.player.duration));
    this.announceToScreenReader(`${seconds > 0 ? 'Adelantado' : 'Retrocedido'} ${Math.abs(seconds)} segundos`);
  }
  
  /**
   * Guarda el estado del reproductor en sessionStorage
   */
  saveState() {
    const state = {
      currentTime: this.player.currentTime,
      volume: this.player.volume,
      muted: this.player.muted,
      speed: this.player.speed,
      lastUpdate: Date.now()
    };
    
    try {
      sessionStorage.setItem(`podcast-player-${this.episodeId}`, JSON.stringify(state));
    } catch (error) {
      console.warn('No se pudo guardar el estado del reproductor:', error);
    }
  }
  
  /**
   * Carga el estado del reproductor desde sessionStorage
   */
  loadState() {
    try {
      const savedState = sessionStorage.getItem(`podcast-player-${this.episodeId}`);
      if (!savedState) return;
      
      const state = JSON.parse(savedState);
      
      // Solo restaurar si la última actualización fue hace menos de 1 hora
      const oneHour = 60 * 60 * 1000;
      if (Date.now() - state.lastUpdate < oneHour) {
        this.player.volume = state.volume || 1;
        this.player.muted = state.muted || false;
        this.player.speed = state.speed || 1;
        
        // Restaurar tiempo solo si hay un progreso significativo (más de 5 segundos)
        if (state.currentTime > 5) {
          this.player.currentTime = state.currentTime;
        }
      }
    } catch (error) {
      console.warn('No se pudo cargar el estado del reproductor:', error);
    }
  }
  
  /**
   * Muestra un mensaje de error
   * @param {string} message - Mensaje de error a mostrar
   */
  showError(message) {
    const playerContainer = this.audioElement.closest('.podcast-player-container');
    if (!playerContainer) return;
    
    const errorHTML = `
      <div class="podcast-error" role="alert">
        <span class="podcast-error__icon" aria-hidden="true">⚠️</span>
        <h4 class="podcast-error__title">Error de Reproducción</h4>
        <p class="podcast-error__message">${message}</p>
      </div>
    `;
    
    playerContainer.innerHTML = errorHTML;
  }
  
  /**
   * Anuncia mensajes a lectores de pantalla
   * @param {string} message - Mensaje a anunciar
   */
  announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'podcast-sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remover después de 1 segundo
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }
  
  /**
   * Destruye el reproductor y limpia los event listeners
   */
  destroy() {
    if (this.player) {
      this.saveState();
      this.player.destroy();
    }
    
    if (this.equalizer) {
      this.equalizer.remove();
    }

    if (this.videoElement) {
        this.videoElement.pause();
        this.videoElement.remove();
        this.videoElement = null; // Liberar referencia
    }
  }
}

// Exportar para uso global
window.PodcastPlayer = PodcastPlayer;

// Función para inicializar reproductores (llamada por podcasts.js después de crear el DOM)
window.initPodcastPlayers = function() {
  const audioElements = document.querySelectorAll('.podcast-audio');
  
  audioElements.forEach((audio) => {
    const episodeId = audio.dataset.episodeId;
    if (episodeId && !audio.plyrInitialized) {
      new PodcastPlayer(audio, episodeId);
      audio.plyrInitialized = true;
    }
  });
};

// Auto-inicializar si hay reproductores ya en el HTML (no dinámicos)
document.addEventListener('DOMContentLoaded', () => {
  // Esperar un poco para dar tiempo a que se carguen dinámicamente
  setTimeout(() => {
    if (typeof window.initPodcastPlayers === 'function') {
      window.initPodcastPlayers();
    }
  }, 500);
});

