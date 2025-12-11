// js/recetas-cocina.js
// Módulo para manejar recetas de cocina    


class RecetasManager {
    constructor() {
        this.recetas = null;
        this.cargando = false;
    }

    async cargarRecetas() {
        if (this.cargando) return;
        this.cargando = true;

        try {
            const response = await fetch('data/recetas-cocina.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.recetas = await response.json();
            console.log('Recetas cargadas exitosamente');
            
            // Emitir evento personalizado cuando las recetas estén cargadas
            window.dispatchEvent(new CustomEvent('recetasCargadas', {
                detail: { recetas: this.recetas }
            }));
        } catch (error) {
            console.error('Error cargando recetas:', error);
            this.mostrarError('No se pudieron cargar las recetas. Por favor, intenta más tarde.');
        } finally {
            this.cargando = false;
        }
    }

    mostrarError(mensaje) {
        const contenedor = document.querySelector('.contenido');
        if (contenedor) {
            contenedor.innerHTML = `
                <div class="error-recetas">
                    <h3>Error al cargar recetas</h3>
                    <p>${mensaje}</p>
                </div>
            `;
        }
    }

    renderizarReceta(receta) {
        const tiempoCoccion = receta.tiempo_coccion ? 
            `<li class="menu__receta-tcoccion"><strong>Tiempo de cocción:</strong> ${receta.tiempo_coccion}</li>` : '';

        return `
            <section class="menus contenedor">
                <div class="menu">
                    <div class="menu__contenido">
                        <h3 class="menu__title">${receta.titulo}</h3>
                        <div class="menu__flex">
                            <div class="menu__marco-imagen">
                                <img class="menu__imagen lightbox-trigger" src="${receta.imagen}" alt="${receta.alt}" loading="lazy" style="cursor: pointer;">
                            </div>
                            <div class="menu__receta-primera-parte">
                                <ul class="menu__receta">
                                    <li class="menu__receta-racion"><strong>Raciones:</strong> ${receta.raciones}</li>
                                    <li class="menu__receta-tpreparacion"><strong>Tiempo de preparación:</strong> ${receta.tiempo_preparacion}</li>
                                    ${tiempoCoccion}
                                    <li class="menu__receta-ingredientes">
                                        <strong>Ingredientes:</strong>
                                        <ul class="menu__receta-listado-ingredientes">
                                            ${receta.ingredientes.map(ingrediente => `<li>${ingrediente}</li>`).join('')}
                                        </ul>
                                    </li>
                                    <li class="menu__receta-preparacion">
                                        <strong>Preparación:</strong>
                                        <ol>
                                            ${receta.preparacion.map(paso => `<li>${paso}</li>`).join('')}
                                        </ol>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div class="menu__receta-segunda-parte">
                            <ul class="menu__receta-footer">
                                <li class="menu__receta-alergenos">
                                    <strong>Clasificación de alérgenos:</strong>
                                    <ul>
                                        ${receta.alergenos.map(alergeno => `<li>${alergeno}</li>`).join('')}
                                    </ul>
                                </li>
                                <li class="menu__receta-una-mano"><strong>¿Se puede preparar con una mano?</strong> ${receta.una_mano}</li>
                                <li class="menu__receta-comentario"><em>"${receta.comentario}"</em></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    renderizarNavegacionDietas() {
        if (!this.recetas) return '';

        const categorias = Object.keys(this.recetas.categorias);
        return `
            <div class="dietas contenedor">
                <div class="dietas__diaria">
                    ${categorias.map(categoria => {
                        const datos = this.recetas.categorias[categoria];
                        return `
                            <div class="dieta">
                                <a class="dieta__menu" href="${categoria}.html">${datos.titulo}</a>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    async renderizarCategoria(categoria) {
        if (!this.recetas) {
            await this.cargarRecetas();
        }
        
        const datosCategoria = this.recetas?.categorias?.[categoria];
        if (!datosCategoria) {
            console.warn(`Categoría "${categoria}" no encontrada`);
            return '<p>Categoría no encontrada</p>';
        }

        return datosCategoria.recetas.map(receta => this.renderizarReceta(receta)).join('');
    }

    async inicializarPagina(categoria = null) {
        // Si no se especifica categoría, renderizar navegación de dietas
        if (!categoria) {
            await this.cargarRecetas();
            const contenedor = document.querySelector('.contenido');
            if (contenedor && this.recetas) {
                contenedor.innerHTML = this.renderizarNavegacionDietas();
            }
            return;
        }

        // Renderizar categoría específica
        const contenidoHTML = await this.renderizarCategoria(categoria);
        const contenedor = document.querySelector('.contenido');
        if (contenedor) {
            contenedor.innerHTML = contenidoHTML;
            
            // Inicializar lightbox después de renderizar las imágenes
            if (typeof inicializarLightbox === 'function') {
                inicializarLightbox();
            }
        }
    }

    // Método para buscar recetas
    buscarRecetas(termino) {
        if (!this.recetas) return [];
        
        const resultados = [];
        Object.values(this.recetas.categorias).forEach(categoria => {
            categoria.recetas.forEach(receta => {
                const textoCompleto = `${receta.titulo} ${receta.ingredientes.join(' ')} ${receta.comentario}`.toLowerCase();
                if (textoCompleto.includes(termino.toLowerCase())) {
                    resultados.push(receta);
                }
            });
        });
        return resultados;
    }

    // Método para obtener recetas por alérgenos
    filtrarPorAlergenos(alergenos) {
        if (!this.recetas) return [];
        
        const resultados = [];
        Object.values(this.recetas.categorias).forEach(categoria => {
            categoria.recetas.forEach(receta => {
                const tieneAlergenos = alergenos.some(alergeno => 
                    receta.alergenos.some(recetaAlergeno => 
                        recetaAlergeno.toLowerCase().includes(alergeno.toLowerCase())
                    )
                );
                if (!tieneAlergenos) {
                    resultados.push(receta);
                }
            });
        });
        return resultados;
    }
}

// Instancia global
const recetasManager = new RecetasManager();

// Auto-inicialización basada en la página actual
document.addEventListener('DOMContentLoaded', () => {
    const pagina = window.location.pathname;
    const categoria = pagina.match(/(\w+)\.html$/)?.[1];
    
    // Categorías válidas
    const categoriasValidas = ['desayuno', 'almuerzo', 'comida', 'merienda', 'cena'];
    
    if (categoriasValidas.includes(categoria)) {
        recetasManager.inicializarPagina(categoria);
    } else if (pagina.includes('dieta_equilibrada') || pagina.includes('index')) {
        recetasManager.inicializarPagina(); // Sin categoría = navegación
    }
});
