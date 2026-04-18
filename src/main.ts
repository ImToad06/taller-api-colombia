import './style.css';

declare const Plotly: any;

interface Attraction {
  id: number;
  name: string;
  description: string;
  images: string[];
  city: {
    name: string;
  } | null;
}

async function init() {
  const loadingEl = document.getElementById('loading');
  const chartEl = document.getElementById('chart-container');
  
  if (!loadingEl || !chartEl) return;

  try {
    const response = await fetch('https://api-colombia.com/api/v1/TouristicAttraction');
    if (!response.ok) {
      throw new Error('Error al obtener los datos de la API');
    }
    
    const data: Attraction[] = await response.json();
    
    // Contar las atracciones por ciudad
    const cityCounts: Record<string, number> = {};
    for (const attr of data) {
      if (attr.city && attr.city.name) {
        const cityName = attr.city.name;
        cityCounts[cityName] = (cityCounts[cityName] || 0) + 1;
      }
    }
    
    // Ordenar y tomar las 15 ciudades con más atracciones
    const sortedCities = Object.entries(cityCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15);
      
    const xData = sortedCities.map(item => item[0]);
    const yData = sortedCities.map(item => item[1]);
    
    const trace = {
      x: xData,
      y: yData,
      type: 'bar',
      marker: {
        color: '#d92525' // Rojo para combinar con el esquema
      }
    };
    
    const layout = {
      title: 'Top 15 Ciudades con más Atracciones Turísticas',
      paper_bgcolor: 'white',
      plot_bgcolor: 'white',
      font: {
        family: 'system-ui, -apple-system, sans-serif'
      },
      xaxis: {
        title: 'Ciudad',
        tickangle: -45,
        automargin: true
      },
      yaxis: {
        title: 'Número de Atracciones'
      },
      margin: {
        b: 120 // Margen inferior para los nombres de las ciudades
      }
    };
    
    loadingEl.style.display = 'none';
    Plotly.newPlot(chartEl, [trace], layout, { responsive: true });
    
    // Top 6 atracciones
    const topAttractions = data.slice(0, 6);
    const attractionsListEl = document.getElementById('attractions-list');
    
    if (attractionsListEl) {
      attractionsListEl.innerHTML = topAttractions.map(attr => `
        <div class="attraction-card">
          ${attr.images && attr.images.length > 0 ? `<img src="${attr.images[0]}" alt="${attr.name}" class="attraction-image" loading="lazy">` : `<div class="attraction-image" style="background:#eee; display:flex; align-items:center; justify-content:center; color:#999;">Sin imagen</div>`}
          <div class="attraction-info">
            <h3>${attr.name}</h3>
            <span class="city">📍 ${attr.city?.name || 'Ubicación desconocida'}</span>
            <p title="${attr.description.replace(/"/g, '&quot;')}">${attr.description}</p>
          </div>
        </div>
      `).join('');
    }
    
  } catch (error) {
    loadingEl.textContent = 'Hubo un error al cargar los datos. Por favor, intenta de nuevo.';
    console.error(error);
  }
}

// Iniciar la aplicación
init();
