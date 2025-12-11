// js/entrenos.js

// Función para formatear tiempo con unidades dinámicas
function formatTime(timeValue) {
  if (!timeValue) return '0 min';
  
  const numValue = parseFloat(timeValue);
  
  // Si es mayor a 60 minutos, convertir a horas y minutos
  if (numValue >= 60) {
    const hours = Math.floor(numValue / 60);
    const minutes = numValue % 60;
    
    if (minutes === 0) {
      return `${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    } else {
      return `${hours}h ${minutes}min`;
    }
  }
  
  // Si es menor a 60, mostrar en minutos
  return `${numValue} min`;
}

fetch('data/workouts.json')
  .then(res => res.json())
  .then(entries => {
    const grouped = {};
    entries.forEach(e => {
      const d = new Date(e.date),
            y = d.getFullYear(),
            m = d.toLocaleString('es', { month: 'long' });
      grouped[y] ??= {};
      grouped[y][m] ??= [];
      grouped[y][m].push(e);
    });

    const grid = document.querySelector('.entrenos__grid');
    Object.keys(grouped).sort((a, b) => b - a).forEach(year => {
      const yearDiv = document.createElement('div');
      yearDiv.className = 'entrenos__year';
      yearDiv.innerHTML = `
        <h3 class="entrenos__year-title">
          <span class="material-icons">calendar_today</span>
          ${year}
        </h3>
      `;

      const monthsDiv = document.createElement('div');
      monthsDiv.className = 'entrenos__months';

      Object.keys(grouped[year])
        .sort((a, b) => new Date(`${b} 1, ${year}`) - new Date(`${a} 1, ${year}`))
        .forEach(month => {
          const mDiv = document.createElement('div');
          mDiv.className = 'entrenos__month';
          mDiv.innerHTML = `
            <h4 class="entrenos__month-title">
              <span class="material-icons">date_range</span>
              ${month}
            </h4>
          `;
          const list = document.createElement('div');
          list.className = 'entrenos__entries';

          grouped[year][month].forEach(ent => {
            const eDiv = document.createElement('div');
            eDiv.className = 'entrenos__entry';
            eDiv.innerHTML = `
              <div class="entry-date">
                <span class="date-icon">📅</span>
                <span class="date-label">Fecha:</span> 
                <span class="date-value">${ent.date}</span>
              </div>
              
              <div class="cinta-section">
                <div class="section-title">
                  <span class="section-icon">🏃‍♂️</span>
                  Cinta de Correr
                </div>
                <div class="cinta-stats">
                  <div class="stat-item stat-tiempo">
                    <div class="stat-icon-wrapper">
                      <span class="stat-icon">⏱️</span>
                    </div>
                    <div class="stat-content">
                      <span class="stat-label">Tiempo</span>
                      <span class="stat-value">${formatTime(ent.treadmillTime)}</span>
                    </div>
                  </div>
                  <div class="stat-item stat-velocidad">
                    <div class="stat-icon-wrapper">
                      <span class="stat-icon">⚡</span>
                    </div>
                    <div class="stat-content">
                      <span class="stat-label">Velocidad</span>
                      <span class="stat-value">${ent.treadmillSpeed} <span class="stat-unit">km/h</span></span>
                    </div>
                  </div>
                  <div class="stat-item stat-pendiente">
                    <div class="stat-icon-wrapper">
                      <span class="stat-icon">📈</span>
                    </div>
                    <div class="stat-content">
                      <span class="stat-label">Pendiente</span>
                      <span class="stat-value">${ent.treadmillIncline}<span class="stat-unit">%</span></span>
                    </div>
                  </div>
                  <div class="stat-item stat-pulsaciones">
                    <div class="stat-icon-wrapper">
                      <span class="stat-icon">❤️</span>
                    </div>
                    <div class="stat-content">
                      <span class="stat-label">Pulsaciones</span>
                      <span class="stat-value">${ent.heartRate} <span class="stat-unit">ppm</span></span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="other-activities">
                <div class="activity-item bioness">
                  <span class="activity-icon">💪</span>
                  <span class="activity-label">Registro de uso del Bioness:</span> 
                  <span class="activity-value">${formatTime(ent.bionessTime)}</span>
                </div>
                <div class="activity-item complementary">
                  <span class="activity-icon">🧘‍♂️</span>
                  <span class="activity-label">Actividad Complementaria:</span> 
                  <span class="activity-value">
                    ${ent.activities} (${formatTime(ent.complementaryTime)}, ${ent.complementaryIntensity})
                  </span>
                </div>
                <div class="activity-item gym">
                  <span class="activity-icon">🏋️‍♂️</span>
                  <span class="activity-label">Ejercicio en el Gym:</span> 
                  <span class="activity-value">${ent.gymExType} (${formatTime(ent.gymExTime)}, ${ent.gymExIntensity})</span>
                </div>
              </div>
            `;
            list.appendChild(eDiv);
          });

          mDiv.appendChild(list);
          monthsDiv.appendChild(mDiv);
        });

      yearDiv.appendChild(monthsDiv);
      grid.appendChild(yearDiv);
    });
  })
  .catch(err => console.error('Error cargando workouts.json:', err));