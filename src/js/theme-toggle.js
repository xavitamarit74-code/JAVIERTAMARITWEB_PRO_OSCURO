/**
 * theme-toggle.js - Gestor de Modo Oscuro
 * ========================================
 * Gestiona el cambio entre modo claro y oscuro con:
 * - Persistencia en localStorage
 * - Detección de preferencia del sistema (prefers-color-scheme)
 * - Sincronización entre pestañas
 * - Prevención de flash en carga inicial
 */

(function () {
  "use strict";

  const STORAGE_KEY = "theme-preference";
  const DARK_THEME = "dark";
  const LIGHT_THEME = "light";

  /**
   * Obtiene la preferencia de tema guardada o la del sistema
   * @returns {string} 'dark' o 'light'
   */
  function getThemePreference() {
    // Primero verificar localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return stored;
    }

    // Si no hay preferencia guardada, usar la del sistema
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      return DARK_THEME;
    }

    return LIGHT_THEME;
  }

  /**
   * Aplica el tema al documento
   * @param {string} theme - 'dark' o 'light'
   * @param {boolean} animate - Si debe animar el cambio
   */
  function applyTheme(theme, animate = false) {
    const root = document.documentElement;

    if (theme === DARK_THEME) {
      root.setAttribute("data-theme", "dark");
    } else {
      root.removeAttribute("data-theme");
    }

    // Actualizar el botón si existe
    updateToggleButton(theme, animate);
  }

  /**
   * Actualiza el estado visual del botón toggle
   * @param {string} theme - Tema actual
   * @param {boolean} animate - Si debe animar
   */
  function updateToggleButton(theme, animate = false) {
    const button = document.getElementById("theme-toggle");
    if (!button) return;

    // Actualizar aria-label
    const label =
      theme === DARK_THEME ? "Cambiar a modo claro" : "Cambiar a modo oscuro";
    button.setAttribute("aria-label", label);
    button.setAttribute("title", label);

    // Animación de rotación
    if (animate) {
      button.classList.add("theme-toggle--animating");
      setTimeout(() => {
        button.classList.remove("theme-toggle--animating");
      }, 500);
    }
  }

  /**
   * Guarda la preferencia de tema
   * @param {string} theme - 'dark' o 'light'
   */
  function saveThemePreference(theme) {
    localStorage.setItem(STORAGE_KEY, theme);
  }

  /**
   * Alterna entre modo claro y oscuro
   */
  function toggleTheme() {
    const currentTheme = document.documentElement.hasAttribute("data-theme")
      ? DARK_THEME
      : LIGHT_THEME;
    const newTheme = currentTheme === DARK_THEME ? LIGHT_THEME : DARK_THEME;

    applyTheme(newTheme, true);
    saveThemePreference(newTheme);
  }

  /**
   * Crea el botón de toggle si no existe
   */
  function createToggleButton() {
    // Verificar si ya existe
    if (document.getElementById("theme-toggle")) return;

    const button = document.createElement("button");
    button.id = "theme-toggle";
    button.className = "theme-toggle";
    button.type = "button";

    button.innerHTML = `
            <span class="material-icons theme-toggle__icon theme-toggle__icon--light" aria-hidden="true">light_mode</span>
            <span class="material-icons theme-toggle__icon theme-toggle__icon--dark" aria-hidden="true">dark_mode</span>
        `;

    // Evento click
    button.addEventListener("click", toggleTheme);

    // Agregar al body
    document.body.appendChild(button);

    // Actualizar estado inicial
    const currentTheme = getThemePreference();
    updateToggleButton(currentTheme, false);
  }

  /**
   * Inicializa el sistema de temas
   */
  function initTheme() {
    // Aplicar tema inmediatamente (sin animación)
    const theme = getThemePreference();
    applyTheme(theme, false);

    // Crear botón cuando el DOM esté listo
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", createToggleButton);
    } else {
      createToggleButton();
    }

    // Escuchar cambios en preferencia del sistema
    if (window.matchMedia) {
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .addEventListener("change", (e) => {
          // Solo aplicar si no hay preferencia guardada
          if (!localStorage.getItem(STORAGE_KEY)) {
            applyTheme(e.matches ? DARK_THEME : LIGHT_THEME, true);
          }
        });
    }

    // Sincronizar entre pestañas
    window.addEventListener("storage", (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        applyTheme(e.newValue, true);
      }
    });
  }

  // Ejecutar inmediatamente para prevenir flash
  initTheme();

  // Exponer función toggle globalmente (por si se necesita)
  window.toggleTheme = toggleTheme;
})();
