//js/relatos.js 

// Función para obtener parámetros de URL
function getURLParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Función para renderizar un relato individual
function renderRelatoCompleto() {
    const parteId = getURLParameter('parte');
    
    if (!parteId) {
        window.location.href = 'relatos.html';
        return;
    }

    fetch('data/relatos.json')
        .then(response => response.json())
        .then(data => {
            const relato = data.relatos.find(r => r.id == parteId);
            
            if (!relato) {
                window.location.href = 'relatos.html';
                return;
            }

            // Actualizar título de la página
            document.title = `${relato.headerTitulo} - JavierTamaritWeb`;
            
            // Actualizar título del header si existe
            const headerTitle = document.querySelector('.header-inner__title');
            if (headerTitle) {
                headerTitle.textContent = relato.headerTitulo;
            }

            // Actualizar título y fecha
            document.getElementById('relato-titulo').textContent = relato.titulo;
            document.getElementById('relato-fecha').textContent = relato.fecha;

            // Renderizar párrafos del contenido
            const contenidoTexto = document.getElementById('relato-contenido-texto');
            contenidoTexto.innerHTML = relato.contenido
                .map(parrafo => `<p class="relatos__parrafo">${parrafo}</p>`)
                .join('');
        })
        .catch(error => {
            console.error('Error cargando relatos:', error);
            window.location.href = 'relatos.html';
        });
}

// Función para renderizar la lista de relatos (para relatos.html)
function renderRelatos() {
    const container = document.querySelector('.relatos__grid');
    if (!container) return;

    fetch('data/relatos.json')
        .then(response => response.json())
        .then(data => {
            const html = data.relatos.map(relato => {
                const numeroRomano = ['I', 'II', 'III', 'IV', 'V'][relato.id - 1] || relato.id;
                const resumen = relato.contenido[0].length > 200 ? 
                    relato.contenido[0].substring(0, 200) + '...' : 
                    relato.contenido[0];

                return `
                    <div class="relato">
                        <div class="relato__header">
                            <div class="relato__numero">${relato.id.toString().padStart(2, '0')}</div>
                            <h3 class="relato__titulo">${relato.titulo}</h3>
                        </div>
                        <p class="relato__texto">${resumen}</p>
                        <div class="relato__footer">
                            <span class="relato__fecha">${relato.fecha}</span>
                            <a class="relato__enlace" href="relato_parte.html?parte=${relato.id}">Leer Más</a>
                        </div>
                    </div>
                `;
            }).join('');

            container.innerHTML = html;
        })
        .catch(error => {
            console.error('Error cargando relatos:', error);
        });
}

// Inicializar según la página
document.addEventListener('DOMContentLoaded', function() {
    // Si estamos en relato_parte.html
    if (window.location.pathname.includes('relato_parte.html')) {
        renderRelatoCompleto();
    }
    // Si estamos en relatos.html o index.html
    else if (document.querySelector('.relatos__grid')) {
        renderRelatos();
    }
});
