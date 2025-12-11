//js/script.js

document.addEventListener('DOMContentLoaded', () => {
    // Verificar si existe el contador antes de inicializarlo
    const contadorAnios = document.getElementById('contador-anios');
    
    if (!contadorAnios) {
        // El contador no existe en esta página, salir
        return;
    }
    
    const fechaInicio = new Date('2022-12-21T18:07:00');

    function actualizarContador() {
        const ahora = new Date();
        let diferencia = ahora - fechaInicio;

        const anios = Math.floor(diferencia / (1000 * 60 * 60 * 24 * 365.25));
        diferencia %= 1000 * 60 * 60 * 24 * 365.25;

        const meses = Math.floor(diferencia / (1000 * 60 * 60 * 24 * 30.44));
        diferencia %= 1000 * 60 * 60 * 24 * 30.44;

        const semanas = Math.floor(diferencia / (1000 * 60 * 60 * 24 * 7));
        diferencia %= 1000 * 60 * 60 * 24 * 7;

        const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
        diferencia %= 1000 * 60 * 60 * 24;

        const horas = Math.floor(diferencia / (1000 * 60 * 60));
        diferencia %= 1000 * 60 * 60;

        const minutos = Math.floor(diferencia / (1000 * 60));
        diferencia %= 1000 * 60;

        const segundos = Math.floor(diferencia / 1000);

        // Actualiza cada elemento individual
        document.getElementById('contador-anios').textContent = anios;
        document.getElementById('contador-meses').textContent = meses;
        document.getElementById('contador-semanas').textContent = semanas;
        document.getElementById('contador-dias').textContent = dias;
        document.getElementById('contador-horas').textContent = horas;
        document.getElementById('contador-minutos').textContent = minutos;
        document.getElementById('contador-segundos').textContent = segundos;
    }

    setInterval(actualizarContador, 1000);
    actualizarContador();
});