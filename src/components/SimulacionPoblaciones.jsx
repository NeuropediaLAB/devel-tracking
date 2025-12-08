import React, { useState } from 'react';
import './Investigacion.css';

/**
 * Componente de Simulación de Poblaciones
 * Genera conjuntos de datos experimentales para evaluar propiedades psicométricas
 */
function SimulacionPoblaciones() {
  const [parametros, setParametros] = useState({
    tamañoPoblacion: 100,
    rangoEdadMin: 0,
    rangoEdadMax: 60,
    porcentajePrematuros: 15,
    porcentajeRetrasos: 10,
    distribuciones: {
      motorGrueso: 'normal',
      motorFino: 'normal',
      lenguaje: 'sesgada_derecha',
      cognitivo: 'normal',
      socialEmocional: 'normal',
      adaptativo: 'sesgada_derecha'
    },
    factoresRiesgo: {
      socioeconomicos: true,
      biologicos: true,
      ambientales: true
    }
  });

  const [datosGenerados, setDatosGenerados] = useState(null);
  const [cargando, setCargando] = useState(false);

  const handleParametroChange = (campo, valor) => {
    setParametros(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const handleDistribucionChange = (dominio, distribucion) => {
    setParametros(prev => ({
      ...prev,
      distribuciones: {
        ...prev.distribuciones,
        [dominio]: distribucion
      }
    }));
  };

  const handleFactorRiesgoChange = (factor, valor) => {
    setParametros(prev => ({
      ...prev,
      factoresRiesgo: {
        ...prev.factoresRiesgo,
        [factor]: valor
      }
    }));
  };

  const generarPoblacion = () => {
    setCargando(true);
    
    // Simulación de generación de datos (esto sería llamada a API en implementación real)
    setTimeout(() => {
      const datos = simularDatos(parametros);
      setDatosGenerados(datos);
      setCargando(false);
    }, 2000);
  };

  const simularDatos = (params) => {
    // Simulación simplificada de generación de datos
    const poblacion = [];
    
    for (let i = 0; i < params.tamañoPoblacion; i++) {
      const edad = Math.random() * (params.rangoEdadMax - params.rangoEdadMin) + params.rangoEdadMin;
      const esPrematur = Math.random() < (params.porcentajePrematuros / 100);
      const tieneRetraso = Math.random() < (params.porcentajeRetrasos / 100);
      
      poblacion.push({
        id: i + 1,
        edad: Math.round(edad * 10) / 10,
        esPrematur,
        tieneRetraso,
        desarrolloMotorGrueso: generarPuntuacion('motorGrueso', edad, esPrematur, tieneRetraso),
        desarrolloMotorFino: generarPuntuacion('motorFino', edad, esPrematur, tieneRetraso),
        desarrolloLenguaje: generarPuntuacion('lenguaje', edad, esPrematur, tieneRetraso),
        desarrolloCognitivo: generarPuntuacion('cognitivo', edad, esPrematur, tieneRetraso),
        desarrolloSocialEmocional: generarPuntuacion('socialEmocional', edad, esPrematur, tieneRetraso),
        desarrolloAdaptativo: generarPuntuacion('adaptativo', edad, esPrematur, tieneRetraso)
      });
    }

    return {
      poblacion,
      estadisticas: calcularEstadisticas(poblacion),
      parametrosUsados: params
    };
  };

  const generarPuntuacion = (dominio, edad, esPrematur, tieneRetraso) => {
    let baseScore = edad;
    
    if (esPrematur) baseScore *= 0.9;
    if (tieneRetraso) baseScore *= 0.7;
    
    // Añadir variabilidad según el tipo de distribución
    const variabilidad = Math.random() * 0.3 - 0.15; // ±15%
    
    return Math.max(0, baseScore + (baseScore * variabilidad));
  };

  const calcularEstadisticas = (poblacion) => {
    const dominios = ['desarrolloMotorGrueso', 'desarrolloMotorFino', 'desarrolloLenguaje', 
                     'desarrolloCognitivo', 'desarrolloSocialEmocional', 'desarrolloAdaptativo'];
    
    const stats = {};
    
    dominios.forEach(dominio => {
      const valores = poblacion.map(p => p[dominio]);
      stats[dominio] = {
        media: valores.reduce((a, b) => a + b, 0) / valores.length,
        desviacion: Math.sqrt(valores.reduce((sq, n) => sq + Math.pow(n - (valores.reduce((a, b) => a + b, 0) / valores.length), 2), 0) / valores.length),
        min: Math.min(...valores),
        max: Math.max(...valores)
      };
    });

    return stats;
  };

  const exportarDatos = () => {
    if (!datosGenerados) return;
    
    const dataStr = JSON.stringify(datosGenerados, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `simulacion_poblacion_${Date.now()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="investigacion-container">
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '2rem', 
        borderRadius: '0', 
        marginBottom: '2rem',
        color: 'white'
      }}>
        <h2 style={{
          fontSize: '2.4rem',
          fontWeight: '700',
          color: 'white',
          marginBottom: '1rem',
          letterSpacing: '-0.01em',
          lineHeight: '1.2'
        }}>Simulación de Poblaciones</h2>
        <p style={{
          fontSize: '1.2rem',
          color: 'white',
          lineHeight: '1.8',
          margin: '0',
          fontWeight: '400'
        }}>
          Generación de conjuntos de datos experimentales para evaluar propiedades psicométricas de las escalas de desarrollo.
        </p>
      </div>

      {/* Parámetros de Generación */}
      <div className="parametros-seccion">
        <h3>Parámetros de Generación</h3>
        
        <div className="parametros-grid">
          <div className="parametro-grupo">
            <label>Tamaño de la Población:</label>
            <input 
              type="number" 
              value={parametros.tamañoPoblacion}
              min="10"
              max="10000"
              onChange={(e) => handleParametroChange('tamañoPoblacion', parseInt(e.target.value))}
              className="parametro-input"
            />
            <small>Número de casos a generar (10-10,000)</small>
          </div>

          <div className="parametro-grupo">
            <label>Rango de Edad (meses):</label>
            <div className="rango-inputs">
              <input 
                type="number" 
                value={parametros.rangoEdadMin}
                min="0"
                max="72"
                onChange={(e) => handleParametroChange('rangoEdadMin', parseInt(e.target.value))}
                className="parametro-input-small"
              />
              <span> - </span>
              <input 
                type="number" 
                value={parametros.rangoEdadMax}
                min="1"
                max="72"
                onChange={(e) => handleParametroChange('rangoEdadMax', parseInt(e.target.value))}
                className="parametro-input-small"
              />
            </div>
            <small>Rango etario de la población simulada</small>
          </div>

          <div className="parametro-grupo">
            <label>% Prematuros:</label>
            <input 
              type="number" 
              value={parametros.porcentajePrematuros}
              min="0"
              max="50"
              onChange={(e) => handleParametroChange('porcentajePrematuros', parseInt(e.target.value))}
              className="parametro-input"
            />
            <small>Porcentaje de niños prematuros (0-50%)</small>
          </div>

          <div className="parametro-grupo">
            <label>% Retrasos del Desarrollo:</label>
            <input 
              type="number" 
              value={parametros.porcentajeRetrasos}
              min="0"
              max="30"
              onChange={(e) => handleParametroChange('porcentajeRetrasos', parseInt(e.target.value))}
              className="parametro-input"
            />
            <small>Porcentaje con retrasos significativos (0-30%)</small>
          </div>
        </div>

        {/* Configuración de Distribuciones por Dominio */}
        <div className="distribuciones-seccion">
          <h4>📊 Tipo de Distribución por Dominio</h4>
          <div className="distribuciones-grid">
            {Object.keys(parametros.distribuciones).map(dominio => (
              <div key={dominio} className="distribucion-item">
                <label>{dominio.replace(/([A-Z])/g, ' $1').trim()}:</label>
                <select 
                  value={parametros.distribuciones[dominio]}
                  onChange={(e) => handleDistribucionChange(dominio, e.target.value)}
                  className="distribucion-select"
                >
                  <option value="normal">Normal</option>
                  <option value="sesgada_derecha">Sesgada Derecha</option>
                  <option value="sesgada_izquierda">Sesgada Izquierda</option>
                  <option value="bimodal">Bimodal</option>
                  <option value="uniforme">Uniforme</option>
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* Factores de Riesgo */}
        <div className="factores-riesgo-seccion">
          <h4>⚠️ Factores de Riesgo a Incluir</h4>
          <div className="factores-checkboxes">
            <label className="checkbox-item">
              <input 
                type="checkbox" 
                checked={parametros.factoresRiesgo.socioeconomicos}
                onChange={(e) => handleFactorRiesgoChange('socioeconomicos', e.target.checked)}
              />
              Factores Socioeconómicos
            </label>
            <label className="checkbox-item">
              <input 
                type="checkbox" 
                checked={parametros.factoresRiesgo.biologicos}
                onChange={(e) => handleFactorRiesgoChange('biologicos', e.target.checked)}
              />
              Factores Biológicos
            </label>
            <label className="checkbox-item">
              <input 
                type="checkbox" 
                checked={parametros.factoresRiesgo.ambientales}
                onChange={(e) => handleFactorRiesgoChange('ambientales', e.target.checked)}
              />
              Factores Ambientales
            </label>
          </div>
        </div>

        {/* Botón de Generación */}
        <div className="generacion-controles">
          <button 
            onClick={generarPoblacion}
            disabled={cargando}
            className="btn-generar"
          >
            {cargando ? (
              <>
                <div className="spinner"></div>
                Generando Población...
              </>
            ) : (
              <>🎲 Generar Población Experimental</>
            )}
          </button>
        </div>
      </div>

      {/* Vista Previa de Resultados */}
      {datosGenerados && (
        <div className="resultados-preview">
          <h3>🎯 Vista Previa de Resultados</h3>
          
          <div className="stats-cards">
            <div className="stat-card">
              <h4>👥 Población</h4>
              <div className="stat-number">{datosGenerados.poblacion.length}</div>
              <div className="stat-label">casos generados</div>
            </div>
            
            <div className="stat-card">
              <h4>🍼 Prematuros</h4>
              <div className="stat-number">
                {datosGenerados.poblacion.filter(p => p.esPrematur).length}
              </div>
              <div className="stat-label">casos ({Math.round(datosGenerados.poblacion.filter(p => p.esPrematur).length / datosGenerados.poblacion.length * 100)}%)</div>
            </div>
            
            <div className="stat-card">
              <h4>⚠️ Con Retrasos</h4>
              <div className="stat-number">
                {datosGenerados.poblacion.filter(p => p.tieneRetraso).length}
              </div>
              <div className="stat-label">casos ({Math.round(datosGenerados.poblacion.filter(p => p.tieneRetraso).length / datosGenerados.poblacion.length * 100)}%)</div>
            </div>
            
            <div className="stat-card">
              <h4>📅 Edad Media</h4>
              <div className="stat-number">
                {Math.round(datosGenerados.poblacion.reduce((sum, p) => sum + p.edad, 0) / datosGenerados.poblacion.length * 10) / 10}
              </div>
              <div className="stat-label">meses</div>
            </div>
          </div>

          <div className="exportar-controles">
            <button onClick={exportarDatos} className="btn-exportar">
              💾 Exportar Datos (JSON)
            </button>
            <p className="exportar-info">
              Los datos generados incluyen la población completa con estadísticas descriptivas 
              y parámetros de generación para reproducibilidad.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default SimulacionPoblaciones;