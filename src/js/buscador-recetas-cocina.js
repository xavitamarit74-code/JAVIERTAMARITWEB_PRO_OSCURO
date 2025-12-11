// Funcionalidad mejorada del buscador de recetas con autocompletado
class BuscadorRecetasMejorado {
    constructor() {
        this.recetasManager = window.recetasManager || new RecetasManager();
        // Filtros jerárquicos: Momento del día > Estación > Evento
        this.filtrosActivos = {
            categoria: '',
            estacion: '',
            evento: ''
        };
        this.terminoBusqueda = '';
        this.sugerenciasVisibles = false;
        this.indiceSugerencia = -1;
        this.init();
    }

    async init() {
        await this.recetasManager.cargarRecetas();
        this.setupEventListeners();
        this.renderizarFiltros();
        
        // Escuchar evento de recetas completamente cargadas para recargar filtros
        window.addEventListener('recetasCargadas', () => {
            console.log('Evento recetasCargadas recibido, recargando filtros...');
            this.recargarFiltros();
        });
    }

    setupEventListeners() {
        // Campo de búsqueda con autocompletado
        const inputBusqueda = document.getElementById('busqueda-texto');
        const btnLimpiarTexto = document.getElementById('limpiar-texto');
        const btnReset = document.getElementById('reset-buscador');
        
        if (inputBusqueda) {
            // Input para autocompletado
            inputBusqueda.addEventListener('input', (e) => {
                this.terminoBusqueda = e.target.value;
                this.actualizarBotonLimpiarTexto(btnLimpiarTexto);
                this.mostrarSugerencias();
                this.actualizarResultados();
            });

            // Focus para mostrar sugerencias
            inputBusqueda.addEventListener('focus', () => {
                if (this.terminoBusqueda.length >= 2) {
                    this.mostrarSugerencias();
                }
            });

            // Navegación por teclado
            inputBusqueda.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    this.navegarSugerencias(1);
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    this.navegarSugerencias(-1);
                } else if (e.key === 'Enter') {
                    e.preventDefault();
                    this.seleccionarSugerencia();
                } else if (e.key === 'Escape') {
                    this.ocultarSugerencias();
                }
            });
        }

        // Click fuera para ocultar sugerencias
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.buscador-recetas__campo')) {
                this.ocultarSugerencias();
            }
        });

        // Botón X para limpiar solo el texto del input
        if (btnLimpiarTexto) {
            btnLimpiarTexto.addEventListener('click', () => {
                if (inputBusqueda) {
                    inputBusqueda.value = '';
                    this.terminoBusqueda = '';
                    this.actualizarBotonLimpiarTexto(btnLimpiarTexto);
                    this.ocultarSugerencias();
                    // Limpiar resultados (no mostrar ninguna receta)
                    const contenedor = document.getElementById('resultados-busqueda');
                    if (contenedor) {
                        contenedor.innerHTML = '';
                    }
                    inputBusqueda.focus();
                }
            });
        }

        // Botón "Limpiar todo" para resetear filtros y resultados
        if (btnReset) {
            btnReset.addEventListener('click', () => {
                this.resetearBuscador();
            });
        }

        // Modal
        const modal = document.getElementById('modal-receta');
        const btnCerrar = document.getElementById('cerrar-modal');
        
        if (btnCerrar) {
            btnCerrar.addEventListener('click', () => {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            });
        }

        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                    document.body.style.overflow = 'auto';
                }
            });
        }

        // Delegación: limpiar filtros al pulsar etiquetas
        const resultados = document.getElementById('resultados-busqueda');
        if (resultados) {
            resultados.addEventListener('click', (e) => {
                const tag = e.target.closest('.etiqueta--clear');
                if (!tag) return;
                const tipo = tag.dataset.clear; // 'categoria' | 'estacion' | 'evento'
                if (!tipo) return;

                // Vaciar filtro seleccionado y dependientes
                if (tipo === 'categoria') {
                    this.filtrosActivos.categoria = '';
                    this.filtrosActivos.estacion = '';
                    this.filtrosActivos.evento = '';
                } else if (tipo === 'estacion') {
                    this.filtrosActivos.estacion = '';
                    this.filtrosActivos.evento = '';
                } else if (tipo === 'evento') {
                    this.filtrosActivos.evento = '';
                }

                // Sincronizar selects
                this.renderizarFiltros();
                this.actualizarContadorFiltros();
                this.actualizarResultados();
            });
        }
    }

    renderizarFiltros() {
        const contenedorFiltros = document.querySelector('.buscador-recetas__filtros-avanzados');
        if (!contenedorFiltros) return;

        // Datos canónicos según especificación
        const categorias = [
            { value: 'desayuno', label: 'Desayuno', icon: '☕' },
            { value: 'almuerzo', label: 'Almuerzo', icon: '🥪' },
            { value: 'comida', label: 'Comida', icon: '🍽️' },
            { value: 'merienda', label: 'Merienda', icon: '🍪' },
            { value: 'cena', label: 'Cena', icon: '🌙' }
        ];

        const estaciones = [
            { value: 'anual', label: 'Todo el año', icon: '🌍' },
            { value: 'primavera', label: 'Primavera', icon: '🌸' },
            { value: 'verano', label: 'Verano', icon: '☀️' },
            { value: 'otono', label: 'Otoño', icon: '🍂' },
            { value: 'invierno', label: 'Invierno', icon: '❄️' }
        ];

        const eventos = [
            { value: 'navidad', label: 'Navidad', icon: '🎄' },
            { value: 'dias_laborables', label: 'Días Laborables', icon: '💼' },
            { value: 'fin_de_semana', label: 'Fin de Semana', icon: '🏠' },
            { value: 'festivo', label: 'Festivo', icon: '🎉' }
        ];

        // Crear estructura HTML para los 3 custom selects
        contenedorFiltros.innerHTML = `
            <div class="filtros-seccion">
                <h4 class="filtros-titulo">� Momento del día:</h4>
                <div class="filtros-grupo">
                    <div id="select-momento-container"></div>
                </div>
            </div>
            
            <div class="filtros-seccion">
                <h4 class="filtros-titulo">🌍 Estacionalidad:</h4>
                <div class="filtros-grupo">
                    <div id="select-estacionalidad-container"></div>
                </div>
            </div>
            
            <div class="filtros-seccion">
                <h4 class="filtros-titulo">🎉 Eventos:</h4>
                <div class="filtros-grupo">
                    <div id="select-eventos-container"></div>
                </div>
            </div>
        `;

        // Inicializar custom selects con el manager global
        this.selectMomentoId = window.CustomSelectManager.init(
            document.getElementById('select-momento-container'),
            {
                name: 'momento',
                options: categorias,
                placeholder: '🍴 Todos los momentos del día',
                ariaLabel: 'Selecciona momento del día',
                onChange: (data) => this.handleMomentoChange(data)
            }
        );

        this.selectEstacionalidadId = window.CustomSelectManager.init(
            document.getElementById('select-estacionalidad-container'),
            {
                name: 'estacionalidad',
                options: estaciones,
                placeholder: '🌍 Todas las estaciones',
                ariaLabel: 'Selecciona estacionalidad',
                onChange: (data) => this.handleEstacionalidadChange(data)
            }
        );

        this.selectEventosId = window.CustomSelectManager.init(
            document.getElementById('select-eventos-container'),
            {
                name: 'eventos',
                options: eventos,
                placeholder: '🎉 Todos los eventos',
                ariaLabel: 'Selecciona eventos',
                onChange: (data) => this.handleEventosChange(data)
            }
        );

        // Configurar el ID del elemento para referencias externas
        const selectMomento = document.querySelector(`#${this.selectMomentoId}`);
        const selectEstacionalidad = document.querySelector(`#${this.selectEstacionalidadId}`);
        const selectEventos = document.querySelector(`#${this.selectEventosId}`);

        if (selectMomento) selectMomento.id = 'select-momento';
        if (selectEstacionalidad) selectEstacionalidad.id = 'select-estacionalidad';
        if (selectEventos) selectEventos.id = 'select-eventos';

        // Actualizar estado inicial
        this.actualizarEstadoJerarquico();
        this.actualizarContadorFiltros();
    }

    // Manejadores de cambio para los custom selects
    handleMomentoChange(data) {
        // Si se desactiva el momento, limpiar estacionalidad y eventos
        if (!data.value) {
            this.filtrosActivos.estacion = '';
            this.filtrosActivos.evento = '';
            window.CustomSelectManager.reset(this.selectEstacionalidadId);
            window.CustomSelectManager.reset(this.selectEventosId);
        }
        
        this.filtrosActivos.categoria = data.value;
        this.actualizarEstadoJerarquico();
        this.actualizarContadorFiltros();
        this.actualizarResultados();
    }

    handleEstacionalidadChange(data) {
        // Si se desactiva la estacionalidad, limpiar eventos
        if (!data.value) {
            this.filtrosActivos.evento = '';
            window.CustomSelectManager.reset(this.selectEventosId);
        }
        
        this.filtrosActivos.estacion = data.value;
        this.actualizarEstadoJerarquico();
        this.actualizarContadorFiltros();
        this.actualizarResultados();
    }

    handleEventosChange(data) {
        this.filtrosActivos.evento = data.value;
        this.actualizarEstadoJerarquico();
        this.actualizarContadorFiltros();
        this.actualizarResultados();
    }

    mostrarSugerencias() {
        const termino = this.terminoBusqueda.toLowerCase().trim();
        
        if (termino.length < 2) {
            this.ocultarSugerencias();
            return;
        }

        const sugerencias = this.obtenerSugerencias(termino);
        
        if (sugerencias.length === 0) {
            this.ocultarSugerencias();
            return;
        }

        const contenedorSugerencias = this.obtenerOCrearContenedorSugerencias();
        contenedorSugerencias.innerHTML = sugerencias.map((sug, index) => `
            <div class="sugerencia-item" data-index="${index}">
                <span class="sugerencia-texto">${this.resaltarCoincidencia(sug.texto, termino)}</span>
                <span class="sugerencia-tipo">${sug.tipo}</span>
            </div>
        `).join('');

        contenedorSugerencias.style.display = 'block';
        this.sugerenciasVisibles = true;
        this.indiceSugerencia = -1;

        // Event listeners para sugerencias
        contenedorSugerencias.querySelectorAll('.sugerencia-item').forEach((item, index) => {
            item.addEventListener('click', () => {
                this.seleccionarSugerenciaEspecifica(index);
            });
            item.addEventListener('mouseenter', () => {
                this.indiceSugerencia = index;
                this.actualizarSugerenciaActiva();
            });
        });
    }

    obtenerSugerencias(termino) {
        const sugerencias = [];
        const terminoLower = termino.toLowerCase();
        
        // Función para buscar palabras que empiecen con el término
        const buscarEnTexto = (texto) => {
            const palabras = texto.toLowerCase().split(/\s+/);
            return palabras.some(palabra => palabra.startsWith(terminoLower));
        };
        
        // Buscar en todas las recetas
        Object.values(this.recetasManager.recetas.categorias).forEach(categoria => {
            categoria.recetas.forEach(receta => {
                // Buscar en título (palabras que empiecen con el término)
                if (buscarEnTexto(receta.titulo)) {
                    sugerencias.push({
                        texto: receta.titulo,
                        tipo: 'receta',
                        receta: receta
                    });
                }
                
                // Buscar en ingredientes (palabras que empiecen con el término)
                receta.ingredientes.forEach(ingrediente => {
                    if (buscarEnTexto(ingrediente)) {
                        const ingredienteLimpio = ingrediente.replace(/^\d+\s*/, '').trim();
                        if (!sugerencias.some(s => s.texto === ingredienteLimpio && s.tipo === 'ingrediente')) {
                            sugerencias.push({
                                texto: ingredienteLimpio,
                                tipo: 'ingrediente',
                                busqueda: ingredienteLimpio
                            });
                        }
                    }
                });
                
                // Buscar en comentarios (palabras que empiecen con el término)
                if (buscarEnTexto(receta.comentario)) {
                    const extracto = this.extraerContexto(receta.comentario, terminoLower, 50);
                    if (extracto && !sugerencias.some(s => s.texto === receta.titulo)) {
                        sugerencias.push({
                            texto: receta.titulo,
                            tipo: 'en comentario',
                            receta: receta,
                            contexto: extracto
                        });
                    }
                }
            });
        });
        
        // Limitar sugerencias y ordenar por relevancia
        return sugerencias
            .sort((a, b) => {
                // Priorizar coincidencias exactas al inicio
                const aStartsWith = a.texto.toLowerCase().startsWith(terminoLower);
                const bStartsWith = b.texto.toLowerCase().startsWith(terminoLower);
                if (aStartsWith && !bStartsWith) return -1;
                if (!aStartsWith && bStartsWith) return 1;
                
                // Luego por tipo (recetas primero)
                if (a.tipo === 'receta' && b.tipo !== 'receta') return -1;
                if (a.tipo !== 'receta' && b.tipo === 'receta') return 1;
                
                return 0;
            })
            .slice(0, 8); // Máximo 8 sugerencias
    }

    resaltarCoincidencia(texto, termino) {
        const regex = new RegExp(`(${termino})`, 'gi');
        return texto.replace(regex, '<mark>$1</mark>');
    }

    extraerContexto(texto, termino, longitudMaxima) {
        const indice = texto.toLowerCase().indexOf(termino);
        if (indice === -1) return null;
        
        const inicio = Math.max(0, indice - 20);
        const fin = Math.min(texto.length, indice + termino.length + 20);
        
        let extracto = texto.substring(inicio, fin);
        if (inicio > 0) extracto = '...' + extracto;
        if (fin < texto.length) extracto = extracto + '...';
        
        return extracto;
    }

    navegarSugerencias(direccion) {
        const contenedor = document.querySelector('.buscador-sugerencias');
        if (!contenedor || !this.sugerenciasVisibles) return;
        
        const items = contenedor.querySelectorAll('.sugerencia-item');
        const maxIndex = items.length - 1;
        
        this.indiceSugerencia += direccion;
        
        if (this.indiceSugerencia < 0) this.indiceSugerencia = maxIndex;
        if (this.indiceSugerencia > maxIndex) this.indiceSugerencia = 0;
        
        this.actualizarSugerenciaActiva();
    }

    actualizarSugerenciaActiva() {
        const items = document.querySelectorAll('.sugerencia-item');
        items.forEach((item, index) => {
            item.classList.toggle('sugerencia-item--activa', index === this.indiceSugerencia);
        });
    }

    seleccionarSugerencia() {
        if (this.indiceSugerencia >= 0) {
            this.seleccionarSugerenciaEspecifica(this.indiceSugerencia);
        }
    }

    seleccionarSugerenciaEspecifica(index) {
        const items = document.querySelectorAll('.sugerencia-item');
        const item = items[index];
        if (!item) return;
        
        const texto = item.querySelector('.sugerencia-texto').textContent;
        const inputBusqueda = document.getElementById('busqueda-texto');
        
        inputBusqueda.value = texto;
        this.terminoBusqueda = texto;
        
        this.ocultarSugerencias();
        this.actualizarResultados();
    }

    ocultarSugerencias() {
        const contenedor = document.querySelector('.buscador-sugerencias');
        if (contenedor) {
            contenedor.style.display = 'none';
        }
        this.sugerenciasVisibles = false;
        this.indiceSugerencia = -1;
    }

    obtenerOCrearContenedorSugerencias() {
        let contenedor = document.querySelector('.buscador-sugerencias');
        
        if (!contenedor) {
            contenedor = document.createElement('div');
            contenedor.className = 'buscador-sugerencias';
            const campoBusqueda = document.querySelector('.buscador-recetas__campo');
            if (campoBusqueda) {
                campoBusqueda.appendChild(contenedor);
            }
        }
        
        return contenedor;
    }

    obtenerEstacionesDisponibles(categoria) {
        // Verificar que las recetas estén cargadas
        if (!this.recetasManager.recetas || !this.recetasManager.recetas.categorias) {
            console.warn('Recetas no cargadas aún, reintentando...');
            return []; // Retornar array vacío si no están cargadas
        }
        
        const set = new Set();
        Object.entries(this.recetasManager.recetas.categorias).forEach(([cat, datos]) => {
            if (!categoria || categoria === cat) {
                if (datos && datos.recetas) {
                    datos.recetas.forEach(r => (r.estaciones || []).forEach(e => set.add(this.normalizar(e))));
                }
            }
        });
        return Array.from(set);
    }

    obtenerEventosDisponibles(categoria, estacion) {
        // Verificar que las recetas estén cargadas
        if (!this.recetasManager.recetas || !this.recetasManager.recetas.categorias) {
            console.warn('Recetas no cargadas aún, reintentando...');
            return ['navidad']; // Retornar solo navidad si no están cargadas
        }
        
        const set = new Set(['navidad']); // siempre disponible
        
        // CAMBIO: Mostrar TODOS los eventos disponibles, no filtrar por categoría/estación
        // Los eventos son opciones independientes que se pueden aplicar a cualquier combinación
        Object.entries(this.recetasManager.recetas.categorias).forEach(([cat, datos]) => {
            if (datos && datos.recetas) {
                datos.recetas.forEach(r => {
                    // Agregar TODOS los eventos de TODAS las recetas
                    (r.eventos || []).forEach(e => set.add(this.normalizar(e)));
                });
            }
        });
        
        return Array.from(set);
    }

    actualizarContadorFiltros() {
        const totalFiltros = 
            (this.filtrosActivos.categoria ? 1 : 0) +
            (this.filtrosActivos.estacion ? 1 : 0) +
            (this.filtrosActivos.evento ? 1 : 0);
        
        const contador = document.querySelector('.filtros-contador');
        if (contador) {
            if (totalFiltros > 0) {
                contador.textContent = `${totalFiltros} filtros activos`;
                contador.style.display = 'inline-block';
            } else {
                contador.style.display = 'none';
            }
        }
    }

    actualizarResultados() {
        const contenedor = document.getElementById('resultados-busqueda');
        if (!contenedor || !this.recetasManager.recetas) return;

        // Si no hay término de búsqueda ni filtros activos, no mostrar nada
        const terminoLimpio = this.terminoBusqueda ? this.terminoBusqueda.trim() : '';
        const tieneTerminoBusquedaValido = terminoLimpio.length >= 2; // Mínimo 2 caracteres
        const tieneFiltrosActivos = !!(this.filtrosActivos.categoria || this.filtrosActivos.estacion || this.filtrosActivos.evento);
        
        // Si hay un término válido O filtros activos, mostrar resultados
        const deberaMostrarResultados = tieneFiltrosActivos || tieneTerminoBusquedaValido;
        
        if (!deberaMostrarResultados) {
            contenedor.innerHTML = '';
            return;
        }
        let recetas = this.obtenerRecetasFiltradas();
        
        if (recetas.length === 0) {
            contenedor.innerHTML = '<p class="buscador-recetas__no-resultados">🔍 No se encontraron recetas que coincidan con tu búsqueda.</p>';
            return;
        }

        const html = recetas.map(receta => {
            const etiquetas = this.obtenerEtiquetasReceta();
            
            return `
                <div class="buscador-recetas__item" data-receta-id="${receta.id}">
                    <div class="buscador-recetas__item-imagen">
                        <img class="lightbox-trigger" 
                             src="${receta.imagen}" 
                             alt="${receta.alt}" 
                             loading="lazy"
                             style="cursor: pointer;">
                    </div>
                    <div class="buscador-recetas__item-info">
                        <h4 class="buscador-recetas__item-titulo">${receta.titulo}</h4>
                        <div class="buscador-recetas__item-etiquetas">
                            ${etiquetas.map(etiqueta => `
                                <span class="etiqueta etiqueta--${etiqueta.tipo}">
                                    ${etiqueta.icono} ${etiqueta.texto}
                                </span>
                            `).join('')}
                        </div>
                        <p class="buscador-recetas__item-tiempo">⏱️ ${receta.tiempo_preparacion}</p>
                        <button class="buscador-recetas__item-btn" onclick="buscadorRecetasMejorado.mostrarReceta(${receta.id})">
                            Ver Receta
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        contenedor.innerHTML = html;
        
        // Inicializar lightbox para las nuevas imágenes cargadas
        if (typeof inicializarLightbox === 'function') {
            inicializarLightbox();
        }
    }

    obtenerRecetasFiltradas() {
        let todasLasRecetas = [];
        
        // Recopilar todas las recetas con su categoría
        Object.keys(this.recetasManager.recetas.categorias).forEach(categoria => {
            const datosCategoria = this.recetasManager.recetas.categorias[categoria];
            datosCategoria.recetas.forEach(receta => {
                todasLasRecetas.push({
                    ...receta,
                    categoria: categoria
                });
            });
        });

        // Aplicar filtros jerárquicos
        if (this.filtrosActivos.categoria) {
            todasLasRecetas = todasLasRecetas.filter(r => this.normalizar(r.categoria) === this.normalizar(this.filtrosActivos.categoria));
        }
        if (this.filtrosActivos.estacion) {
            todasLasRecetas = todasLasRecetas.filter(r => (r.estaciones || []).some(e => this.normalizar(e) === this.normalizar(this.filtrosActivos.estacion)));
        }
        if (this.filtrosActivos.evento) {
            todasLasRecetas = todasLasRecetas.filter(r => (r.eventos || []).some(e => this.normalizar(e) === this.normalizar(this.filtrosActivos.evento)));
        }

        // Filtrar por término de búsqueda
        if (this.terminoBusqueda && this.terminoBusqueda.trim().length >= 2) {
            const termino = this.terminoBusqueda.toLowerCase();
            todasLasRecetas = todasLasRecetas.filter(receta => {
                // Función para buscar en texto
                const buscarEnTexto = (texto) => {
                    const textoLower = texto.toLowerCase();
                    // Buscar coincidencia exacta completa O palabras que empiecen con el término
                    if (textoLower.includes(termino)) {
                        return true;
                    }
                    // También buscar palabras que empiecen con el término
                    const palabras = textoLower.split(/\s+/);
                    return palabras.some(palabra => palabra.startsWith(termino));
                };
                
                return buscarEnTexto(receta.titulo) ||
                       receta.ingredientes.some(ing => buscarEnTexto(ing)) ||
                       buscarEnTexto(receta.comentario);
            });
        }

        return todasLasRecetas;
    }

    obtenerEtiquetasReceta() {
        // Mostrar etiquetas cuando hay 1, 2 o 3 filtros activos
        const { categoria, estacion, evento } = this.filtrosActivos;
        const etiquetas = [];
        
        // Agregar etiqueta de categoría si está activa
        if (categoria) {
            etiquetas.push({
                tipo: 'categoria',
                icono: this.obtenerIconoCategoria(categoria),
                texto: this.obtenerNombreCategoria(categoria)
            });
        }
        
        // Agregar etiqueta de estación si está activa
        if (estacion) {
            etiquetas.push({
                tipo: 'estacion',
                icono: this.obtenerIconoEstacion(estacion),
                texto: this.capitalizarPrimeraLetra(estacion)
            });
        }
        
        // Agregar etiqueta de evento si está activa
        if (evento) {
            etiquetas.push({
                tipo: 'evento',
                icono: this.obtenerIconoEvento(evento),
                texto: this.obtenerNombreEvento(evento)
            });
        }
        
        return etiquetas;
    }

    actualizarEstadoSelect(selectElement) {
        // Agregar o quitar la clase 'activo' según si tiene un valor seleccionado
        if (selectElement.value && selectElement.value !== '') {
            selectElement.classList.add('activo');
        } else {
            selectElement.classList.remove('activo');
        }
    }

    actualizarBotonLimpiarTexto(btnLimpiarTexto) {
        // Mostrar/ocultar el botón X según si hay texto en el input
        if (btnLimpiarTexto) {
            if (this.terminoBusqueda && this.terminoBusqueda.length > 0) {
                btnLimpiarTexto.style.display = 'flex';
            } else {
                btnLimpiarTexto.style.display = 'none';
            }
        }
    }

    actualizarEstadoJerarquico() {
        const selCat = document.getElementById('select-momento');
        const selEst = document.getElementById('select-estacionalidad');
        const selEvt = document.getElementById('select-eventos');
        
        if (!selCat || !selEst || !selEvt) return;
        
        const tieneCategoria = this.filtrosActivos.categoria !== '';
        const tieneEstacion = this.filtrosActivos.estacion !== '';
        const tieneEvento = this.filtrosActivos.evento !== '';
        
        // Lógica jerárquica: solo se puede desactivar el último filtro activado
        // Orden de desactivación: Evento → Estación → Momento del día
        
        if (tieneCategoria && tieneEstacion && tieneEvento) {
            // Los 3 activos: solo se puede cambiar Evento
            selCat.setAttribute('aria-disabled', 'true');
            selEst.setAttribute('aria-disabled', 'true');
            selEvt.setAttribute('aria-disabled', 'false');
        } else if (tieneCategoria && tieneEstacion && !tieneEvento) {
            // Solo Categoría y Estación: solo se puede cambiar Estación
            selCat.setAttribute('aria-disabled', 'true');
            selEst.setAttribute('aria-disabled', 'false');
            selEvt.setAttribute('aria-disabled', 'false');
        } else if (tieneCategoria && !tieneEstacion && !tieneEvento) {
            // Solo Categoría: solo se puede cambiar Categoría
            selCat.setAttribute('aria-disabled', 'false');
            selEst.setAttribute('aria-disabled', 'false');
            selEvt.setAttribute('aria-disabled', 'false');
        } else {
            // Ninguno activo o estados intermedios: todos habilitados
            selCat.setAttribute('aria-disabled', 'false');
            selEst.setAttribute('aria-disabled', 'false');
            selEvt.setAttribute('aria-disabled', 'false');
        }
    }

    resetearBuscador() {
        // Limpiar campo de búsqueda
        const inputBusqueda = document.getElementById('busqueda-texto');
        const btnLimpiarTexto = document.getElementById('limpiar-texto');
        if (inputBusqueda) {
            inputBusqueda.value = '';
        }
        
        // Resetear filtros y ocultar botón X
        this.terminoBusqueda = '';
        this.actualizarBotonLimpiarTexto(btnLimpiarTexto);
        this.filtrosActivos = { categoria: '', estacion: '', evento: '' };
        
        // Resetear custom selects
        if (this.selectMomentoId) {
            window.CustomSelectManager.reset(this.selectMomentoId);
        }
        if (this.selectEstacionalidadId) {
            window.CustomSelectManager.reset(this.selectEstacionalidadId);
        }
        if (this.selectEventosId) {
            window.CustomSelectManager.reset(this.selectEventosId);
        }
        
        // Actualizar estado jerárquico y contador
        this.actualizarEstadoJerarquico();
        this.actualizarContadorFiltros();
        
        // Limpiar resultados
        const contenedor = document.getElementById('resultados-busqueda');
        if (contenedor) {
            contenedor.innerHTML = '';
        }
        
        // Ocultar sugerencias
        this.ocultarSugerencias();
    }

    mostrarReceta(id) {
        const receta = this.encontrarRecetaPorId(id);
        if (!receta) return;

        const modal = document.getElementById('modal-receta');
        const contenido = document.getElementById('contenido-receta');
        
        if (!modal || !contenido) return;

        contenido.innerHTML = this.recetasManager.renderizarReceta(receta);
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Inicializar lightbox para la imagen de la receta completa
        if (typeof inicializarLightbox === 'function') {
            inicializarLightbox();
        }
    }

    encontrarRecetaPorId(id) {
        let recetaEncontrada = null;
        Object.values(this.recetasManager.recetas.categorias).forEach(categoria => {
            const receta = categoria.recetas.find(r => r.id === id);
            if (receta) {
                recetaEncontrada = receta;
            }
        });
        return recetaEncontrada;
    }

    // Métodos auxiliares para iconos y nombres
    obtenerIconoCategoria(categoria) {
        const iconos = {
            'desayuno': '☕',
            'almuerzo': '🥪',
            'comida': '🍽️',
            'merienda': '🍪',
            'cena': '🌙'
        };
        return iconos[categoria] || '🍴';
    }

    obtenerIconoEstacion(estacion) {
        const iconos = {
            'primavera': '🌸',
            'verano': '☀️',
            'otono': '🍂',
            'invierno': '❄️'
        };
        return iconos[estacion] || '📅';
    }

    obtenerIconoEvento(evento) {
        const iconos = {
            'dias_laborables': '💼',
            'fin_de_semana': '🏠',
            'festivo': '�',
            'navidad': '🎄'
        };
        return iconos[evento] || '📅';
    }

    obtenerNombreCategoria(categoria) {
        const nombres = {
            'desayuno': 'Desayuno',
            'almuerzo': 'Almuerzo',
            'comida': 'Comida',
            'merienda': 'Merienda',
            'cena': 'Cena'
        };
        return nombres[categoria] || categoria;
    }

    obtenerNombreEvento(evento) {
        const nombres = {
            'dias_laborables': 'Días laborables',
            'fin_de_semana': 'Fin de semana',
            'festivo': 'Festivo',
            'navidad': 'Navidad'
        };
        const key = this.normalizar(evento);
        return nombres[key] || evento.replace(/_/g, ' ');
    }

    capitalizarPrimeraLetra(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    normalizar(valor) {
        if (valor == null) return '';
        return valor
            .toString()
            .trim()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
    }

    // Nueva función para recargar filtros cuando las recetas estén completamente cargadas
    recargarFiltros() {
        // Los custom selects mantienen su configuración inicial
        // No necesitan recarga ya que las opciones están definidas estáticamente
        console.log('Filtros custom selects no requieren recarga - opciones estáticas definidas');
        
        // Actualizar estado jerárquico por si acaso
        this.actualizarEstadoJerarquico();
        this.actualizarContadorFiltros();
    }
}

// Inicializar buscador mejorado cuando el DOM esté listo
let buscadorRecetasMejorado;
document.addEventListener('DOMContentLoaded', () => {
    buscadorRecetasMejorado = new BuscadorRecetasMejorado();
});
