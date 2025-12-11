// js/buscador-seguro.js
// Módulo de seguridad para el buscador de recetas

class BuscadorSeguro {
    constructor() {
        this.inputBusqueda = document.getElementById('busqueda-texto');
        this.filtrosBloqueo = this.crearFiltrosSeguridad();
        this.inicializar();
    }

    crearFiltrosSeguridad() {
        return {
            // Patrones maliciosos básicos
            scriptTags: /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
            htmlTags: /<[^>]*>/g,
            javascript: /javascript:/gi,
            onEvents: /on\w+\s*=/gi,
            sqlInjection: /(union|select|insert|delete|drop|create|alter|exec|execute|\-\-|;)/gi,
            
            // Caracteres peligrosos
            caracteresProhibidos: /[<>\"'`{}|\\^~\[\]]/g,
            
            // URLs maliciosas
            urlSospechosas: /(http|https|ftp|data):/gi
        };
    }

    /**
     * Limpia y valida el input del usuario
     * @param {string} texto - Texto a validar
     * @returns {string} - Texto limpio y seguro
     */
    sanitizarTexto(texto) {
        if (!texto || typeof texto !== 'string') {
            return '';
        }

        // Limitar longitud
        if (texto.length > 100) {
            texto = texto.substring(0, 100);
        }

        // Eliminar espacios al inicio y final
        texto = texto.trim();

        // Aplicar filtros de seguridad
        Object.values(this.filtrosBloqueo).forEach(filtro => {
            texto = texto.replace(filtro, '');
        });

        // Escapar caracteres HTML restantes
        texto = this.escaparHTML(texto);

        return texto;
    }

    /**
     * Escapa caracteres HTML para prevenir XSS
     * @param {string} texto - Texto a escapar
     * @returns {string} - Texto escapado
     */
    escaparHTML(texto) {
        const mapa = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;',
            '/': '&#x2F;'
        };
        
        return texto.replace(/[&<>"'/]/g, char => mapa[char]);
    }

    /**
     * Valida que el texto solo contenga caracteres permitidos
     * @param {string} texto - Texto a validar
     * @returns {boolean} - True si es válido
     */
    esTextoValido(texto) {
        const patronPermitido = /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s0-9\-_.,:;()!¿?¡]*$/;
        return patronPermitido.test(texto);
    }

    /**
     * Detecta intentos de inyección de código
     * @param {string} texto - Texto a analizar
     * @returns {boolean} - True si detecta algo sospechoso
     */
    detectarInyeccion(texto) {
        const textoLower = texto.toLowerCase();
        
        // Patrones sospechosos
        const patronesPeligrosos = [
            'javascript:',
            '<script',
            'onload=',
            'onerror=',
            'onclick=',
            'eval(',
            'document.cookie',
            'window.location',
            'alert(',
            'confirm(',
            'prompt(',
            'union select',
            'drop table',
            '--',
            ';'
        ];

        return patronesPeligrosos.some(patron => textoLower.includes(patron));
    }

    /**
     * Maneja el evento de input con validaciones de seguridad
     * @param {Event} event - Evento del input
     */
    manejarInput(event) {
        const valorOriginal = event.target.value;
        
        // Detectar inyección antes de procesar
        if (this.detectarInyeccion(valorOriginal)) {
            console.warn('⚠️ Intento de inyección detectado y bloqueado');
            event.target.value = '';
            this.mostrarAlerta('Entrada no válida detectada');
            return;
        }

        // Validar caracteres permitidos
        if (!this.esTextoValido(valorOriginal)) {
            // Limpiar caracteres no permitidos en tiempo real
            const textoLimpio = valorOriginal.replace(/[^a-zA-ZÀ-ÿ\u00f1\u00d1\s0-9\-_.,:;()!¿?¡]/g, '');
            event.target.value = textoLimpio;
        }

        // Aplicar sanitización
        const textoSeguro = this.sanitizarTexto(event.target.value);
        
        // Solo actualizar si el texto cambió después de la sanitización
        if (textoSeguro !== event.target.value) {
            event.target.value = textoSeguro;
        }

        // Procesar búsqueda con texto seguro
        this.procesarBusqueda(textoSeguro);
    }

    /**
     * Procesa la búsqueda de forma segura
     * @param {string} textoSeguro - Texto ya sanitizado
     */
    procesarBusqueda(textoSeguro) {
        // Solo procesar si el texto es significativo para una búsqueda
        if (!this.esTerminoSignificativo(textoSeguro)) {
            console.log('🔍 Término no significativo, búsqueda omitida:', textoSeguro);
            return;
        }
        
        console.log('🔍 Búsqueda segura procesada:', textoSeguro);
        
        // Si tienes una función de búsqueda existente, llámala aquí
        // La función actualizarResultados() del buscador se ejecutará automáticamente
        // debido al event listener 'input' que ya está configurado
    }

    /**
     * Verifica si un término es significativo para búsqueda
     * @param {string} texto - Texto a verificar
     * @returns {boolean} - True si es significativo
     */
    esTerminoSignificativo(texto) {
        // Limpiar espacios
        const textoLimpio = texto.trim();
        
        // Debe tener al menos 2 caracteres
        if (textoLimpio.length < 2) {
            return false;
        }
        
        // No debe ser solo signos de puntuación
        const soloSignos = /^[^\w\sÀ-ÿ\u00f1\u00d1]+$/;
        if (soloSignos.test(textoLimpio)) {
            return false;
        }
        
        return true;
    }

    /**
     * Muestra alerta de seguridad al usuario
     * @param {string} mensaje - Mensaje a mostrar
     */
    mostrarAlerta(mensaje) {
        // Crear un elemento de alerta temporal
        const alerta = document.createElement('div');
        alerta.className = 'alerta-seguridad';
        alerta.textContent = mensaje;
        alerta.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff6b6b;
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            z-index: 1000;
            font-size: 14px;
        `;

        document.body.appendChild(alerta);

        // Remover después de 3 segundos
        setTimeout(() => {
            if (alerta.parentNode) {
                alerta.parentNode.removeChild(alerta);
            }
        }, 3000);
    }

    /**
     * Inicializa los event listeners de seguridad
     */
    inicializar() {
        if (!this.inputBusqueda) {
            console.error('❌ Campo de búsqueda no encontrado');
            return;
        }

        // Event listener para el input
        this.inputBusqueda.addEventListener('input', (event) => {
            this.manejarInput(event);
        });

        // Prevenir pegado de contenido malicioso
        this.inputBusqueda.addEventListener('paste', (event) => {
            setTimeout(() => {
                const valorPegado = event.target.value;
                if (this.detectarInyeccion(valorPegado)) {
                    event.target.value = '';
                    this.mostrarAlerta('Contenido pegado bloqueado por seguridad');
                }
            }, 10);
        });

        // Prevenir arrastrar y soltar
        this.inputBusqueda.addEventListener('drop', (event) => {
            event.preventDefault();
            this.mostrarAlerta('Arrastrar y soltar deshabilitado por seguridad');
        });

        console.log('✅ Módulo de seguridad del buscador inicializado');
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new BuscadorSeguro();
});
