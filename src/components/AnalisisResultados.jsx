import React, { useState, useEffect } from 'react';
import './Investigacion.css';

/**
 * Componente de Análisis de Resultados
 * Analiza datos de poblaciones simuladas y proporciona insights estadísticos
 */
function AnalisisResultados() {
  const [datosImportados, setDatosImportados] = useState(null);
  const [analisisGenerado, setAnalisisGenerado] = useState(null);
  const [cargandoAnalisis, setCargandoAnalisis] = useState(false);
  
  const cargarDatosEjemplo = () => {
    // Datos de ejemplo para demostración
    const datosEjemplo = {
      poblacion: Array.from({length: 100}, (_, i) => ({
        id: i + 1,
        edad: Math.random() * 60 + 6,
        esPrematur: Math.random() < 0.15,
        tieneRetraso: Math.random() < 0.1,
        desarrolloMotorGrueso: Math.random() * 40 + 20,
        desarrolloMotorFino: Math.random() * 40 + 20,
        desarrolloLenguaje: Math.random() * 40 + 15,
        desarrolloCognitivo: Math.random() * 40 + 20,
        desarrolloSocialEmocional: Math.random() * 40 + 18,
        desarrolloAdaptativo: Math.random() * 40 + 16
      })),
      parametrosUsados: {
        tamañoPoblacion: 100,
        rangoEdadMin: 6,
        rangoEdadMax: 60,
        porcentajePrematuros: 15,
        porcentajeRetrasos: 10
      }
    };

    setDatosImportados(datosEjemplo);
    generarAnalisis(datosEjemplo);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/json") {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const datos = JSON.parse(e.target.result);
          setDatosImportados(datos);
          generarAnalisis(datos);
        } catch (error) {
          alert('Error al cargar el archivo JSON. Verifique el formato.');
        }
      };
      reader.readAsText(file);
    }
  };

  const generarAnalisis = (datos) => {
    setCargandoAnalisis(true);
    
    setTimeout(() => {
      const analisis = realizarAnalisisCompleto(datos);
      setAnalisisGenerado(analisis);
      setCargandoAnalisis(false);
    }, 1500);
  };

  const realizarAnalisisCompleto = (datos) => {
    const poblacion = datos.poblacion;
    const dominios = ['desarrolloMotorGrueso', 'desarrolloMotorFino', 'desarrolloLenguaje', 
                     'desarrolloCognitivo', 'desarrolloSocialEmocional', 'desarrolloAdaptativo'];

    // Estadísticas descriptivas
    const estadisticasDescriptivas = calcularEstadisticasDescriptivas(poblacion, dominios);
    
    // Distribución de perfiles
    const perfiles = analizarPerfiles(poblacion);
    
    // Sensibilidad y especificidad
    const metricas = calcularSensibilidadEspecificidad(poblacion);
    
    // Correlaciones entre dominios
    const correlaciones = calcularCorrelaciones(poblacion, dominios);
    
    // Detección de puntos ciegos
    const puntosCiegos = detectarPuntosCiegos(poblacion, dominios);
    
    // Recomendaciones
    const recomendaciones = generarRecomendaciones(estadisticasDescriptivas, metricas, puntosCiegos);

    return {
      estadisticasDescriptivas,
      perfiles,
      metricas,
      correlaciones,
      puntosCiegos,
      recomendaciones,
      fechaAnalisis: new Date().toISOString()
    };
  };

  const calcularEstadisticasDescriptivas = (poblacion, dominios) => {
    const stats = {};
    
    dominios.forEach(dominio => {
      const valores = poblacion.map(p => p[dominio]);
      const media = valores.reduce((a, b) => a + b, 0) / valores.length;
      const varianza = valores.reduce((sq, n) => sq + Math.pow(n - media, 2), 0) / valores.length;
      const desviacion = Math.sqrt(varianza);
      
      stats[dominio] = {
        media: Math.round(media * 100) / 100,
        desviacion: Math.round(desviacion * 100) / 100,
        min: Math.round(Math.min(...valores) * 100) / 100,
        max: Math.round(Math.max(...valores) * 100) / 100,
        p25: Math.round(percentil(valores, 25) * 100) / 100,
        p50: Math.round(percentil(valores, 50) * 100) / 100,
        p75: Math.round(percentil(valores, 75) * 100) / 100
      };
    });

    return stats;
  };

  const percentil = (arr, p) => {
    const sorted = arr.slice().sort((a, b) => a - b);
    const index = (p / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index % 1;
    
    if (upper >= sorted.length) return sorted[sorted.length - 1];
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  };

  const analizarPerfiles = (poblacion) => {
    const perfiles = {
      tipico: 0,
      retrasoLeve: 0,
      retrasoModerado: 0,
      retrasoSevero: 0,
      mixto: 0
    };

    poblacion.forEach(caso => {
      const puntuaciones = [
        caso.desarrolloMotorGrueso,
        caso.desarrolloMotorFino,
        caso.desarrolloLenguaje,
        caso.desarrolloCognitivo,
        caso.desarrolloSocialEmocional,
        caso.desarrolloAdaptativo
      ];

      const promedio = puntuaciones.reduce((a, b) => a + b, 0) / puntuaciones.length;
      const porcentajeDesarrollo = (promedio / caso.edad) * 100;

      if (porcentajeDesarrollo >= 85) {
        perfiles.tipico++;
      } else if (porcentajeDesarrollo >= 70) {
        perfiles.retrasoLeve++;
      } else if (porcentajeDesarrollo >= 55) {
        perfiles.retrasoModerado++;
      } else if (porcentajeDesarrollo >= 40) {
        perfiles.retrasoSevero++;
      } else {
        perfiles.mixto++;
      }
    });

    return perfiles;
  };

  const calcularSensibilidadEspecificidad = (poblacion) => {
    let verdaderosPositivos = 0;
    let falsosPositivos = 0;
    let verdaderosNegativos = 0;
    let falsosNegativos = 0;

    poblacion.forEach(caso => {
      const tieneRetrasoReal = caso.tieneRetraso;
      const puntuacionPromedio = [
        caso.desarrolloMotorGrueso,
        caso.desarrolloMotorFino,
        caso.desarrolloLenguaje,
        caso.desarrolloCognitivo,
        caso.desarrolloSocialEmocional,
        caso.desarrolloAdaptativo
      ].reduce((a, b) => a + b, 0) / 6;
      
      const porcentajeDesarrollo = (puntuacionPromedio / caso.edad) * 100;
      const detectadoComoRetraso = porcentajeDesarrollo < 75;

      if (tieneRetrasoReal && detectadoComoRetraso) verdaderosPositivos++;
      else if (!tieneRetrasoReal && detectadoComoRetraso) falsosPositivos++;
      else if (!tieneRetrasoReal && !detectadoComoRetraso) verdaderosNegativos++;
      else if (tieneRetrasoReal && !detectadoComoRetraso) falsosNegativos++;
    });

    const sensibilidad = verdaderosPositivos / (verdaderosPositivos + falsosNegativos);
    const especificidad = verdaderosNegativos / (verdaderosNegativos + falsosPositivos);
    const precision = verdaderosPositivos / (verdaderosPositivos + falsosPositivos);

    return {
      sensibilidad: Math.round(sensibilidad * 10000) / 100,
      especificidad: Math.round(especificidad * 10000) / 100,
      precision: Math.round(precision * 10000) / 100,
      verdaderosPositivos,
      falsosPositivos,
      verdaderosNegativos,
      falsosNegativos
    };
  };

  const calcularCorrelaciones = (poblacion, dominios) => {
    const correlaciones = {};
    
    for (let i = 0; i < dominios.length; i++) {
      for (let j = i + 1; j < dominios.length; j++) {
        const dominio1 = dominios[i];
        const dominio2 = dominios[j];
        
        const valores1 = poblacion.map(p => p[dominio1]);
        const valores2 = poblacion.map(p => p[dominio2]);
        
        const correlacion = calcularCorrelacionPearson(valores1, valores2);
        correlaciones[`${dominio1}_${dominio2}`] = Math.round(correlacion * 1000) / 1000;
      }
    }
    
    return correlaciones;
  };

  const calcularCorrelacionPearson = (x, y) => {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);
    
    const numerador = n * sumXY - sumX * sumY;
    const denominador = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    return denominador === 0 ? 0 : numerador / denominador;
  };

  const detectarPuntosCiegos = (poblacion, dominios) => {
    const puntosCiegos = [];
    
    // Detectar casos con alto riesgo no detectado
    const casosRiesgoNoDetectado = poblacion.filter(caso => {
      const esPrematur = caso.esPrematur;
      const puntuacionPromedio = dominios.reduce((sum, d) => sum + caso[d], 0) / dominios.length;
      const porcentajeDesarrollo = (puntuacionPromedio / caso.edad) * 100;
      
      return esPrematur && porcentajeDesarrollo > 75; // Prematuro pero parece típico
    });

    if (casosRiesgoNoDetectado.length > 0) {
      puntosCiegos.push({
        tipo: 'riesgo_oculto',
        descripcion: 'Casos prematuros con desarrollo aparentemente típico',
        cantidad: casosRiesgoNoDetectado.length,
        porcentaje: Math.round((casosRiesgoNoDetectado.length / poblacion.length) * 100)
      });
    }

    // Detectar dominios con alta variabilidad
    dominios.forEach(dominio => {
      const valores = poblacion.map(p => p[dominio]);
      const media = valores.reduce((a, b) => a + b, 0) / valores.length;
      const coeficienteVariacion = (Math.sqrt(valores.reduce((sq, n) => sq + Math.pow(n - media, 2), 0) / valores.length) / media) * 100;
      
      if (coeficienteVariacion > 30) {
        puntosCiegos.push({
          tipo: 'alta_variabilidad',
          descripcion: `Dominio ${dominio} muestra alta variabilidad (CV=${Math.round(coeficienteVariacion)}%)`,
          dominio: dominio,
          coeficienteVariacion: Math.round(coeficienteVariacion)
        });
      }
    });

    return puntosCiegos;
  };

  const generarRecomendaciones = (estadisticas, metricas, puntosCiegos) => {
    const recomendaciones = [];

    // Recomendaciones basadas en sensibilidad/especificidad
    if (metricas.sensibilidad < 80) {
      recomendaciones.push({
        tipo: 'sensibilidad',
        prioridad: 'alta',
        mensaje: `Sensibilidad baja (${metricas.sensibilidad}%). Considere reducir umbrales de detección.`
      });
    }

    if (metricas.especificidad < 85) {
      recomendaciones.push({
        tipo: 'especificidad',
        prioridad: 'media',
        mensaje: `Especificidad baja (${metricas.especificidad}%). Riesgo de sobre-referenciación.`
      });
    }

    // Recomendaciones basadas en puntos ciegos
    if (puntosCiegos.length > 0) {
      recomendaciones.push({
        tipo: 'puntos_ciegos',
        prioridad: 'alta',
        mensaje: `Se detectaron ${puntosCiegos.length} tipos de puntos ciegos. Revisar criterios de evaluación.`
      });
    }

    // Recomendaciones para mejora del sistema
    recomendaciones.push({
      tipo: 'mejora',
      prioridad: 'baja',
      mensaje: 'Considere implementar evaluaciones longitudinales para mejorar precisión diagnóstica.'
    });

    return recomendaciones;
  };

  const exportarDatos = () => {
    if (!analisisGenerado) return;
    
    const dataStr = JSON.stringify({
      datosOriginales: datosImportados,
      analisisCompleto: analisisGenerado
    }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `analisis_completo_${Date.now()}.json`;
    
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
        }}>Análisis de Resultados</h2>
        <p style={{
          fontSize: '1.2rem',
          color: 'white',
          lineHeight: '1.8',
          margin: '0',
          fontWeight: '400'
        }}>
          Análisis de datos de poblaciones simuladas para evaluar propiedades psicométricas y optimizar criterios de evaluación.
        </p>
      </div>

      {/* Carga de Datos */}
      <div className="carga-datos-seccion">
        <h3>📂 Cargar Datos para Análisis</h3>
        
        <div className="carga-opciones">
          <div className="opcion-carga">
            <h4>📁 Importar Datos JSON</h4>
            <input 
              type="file" 
              accept=".json"
              onChange={handleFileUpload}
              className="file-input"
            />
            <p>Importe datos generados por el módulo de simulación de poblaciones.</p>
          </div>
          
          <div className="opcion-carga">
            <h4>🎲 Usar Datos de Ejemplo</h4>
            <button onClick={cargarDatosEjemplo} className="btn-ejemplo">
              Cargar Población de Ejemplo
            </button>
            <p>Use datos simulados para explorar las capacidades de análisis.</p>
          </div>
        </div>
      </div>

      {/* Análisis en Proceso */}
      {cargandoAnalisis && (
        <div className="analisis-cargando">
          <div className="spinner"></div>
          <h3>🔄 Generando Análisis...</h3>
          <p>Calculando estadísticas descriptivas, métricas de desempeño y detectando patrones...</p>
        </div>
      )}

      {/* Resultados del Análisis */}
      {analisisGenerado && (
        <div className="resultados-seccion">
          <h3>Resultados del Análisis</h3>

          {/* Estadísticas Descriptivas */}
          <div className="analisis-card estadisticas">
            <h4>📊 Estadísticas Descriptivas</h4>
            <div className="estadisticas-grid">
              {Object.entries(analisisGenerado.estadisticasDescriptivas).map(([dominio, stats]) => (
                <div key={dominio} className="dominio-stats">
                  <h5>{dominio.replace(/([A-Z])/g, ' $1').trim()}</h5>
                  <div className="stats-detalle">
                    <div>Media: <strong>{stats.media}</strong></div>
                    <div>DE: <strong>{stats.desviacion}</strong></div>
                    <div>Rango: <strong>{stats.min} - {stats.max}</strong></div>
                    <div>P25-P75: <strong>{stats.p25} - {stats.p75}</strong></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Distribución de Perfiles */}
          <div className="analisis-card perfiles">
            <h4>👥 Distribución de Perfiles</h4>
            <div className="perfiles-chart">
              {Object.entries(analisisGenerado.perfiles).map(([perfil, cantidad]) => (
                <div key={perfil} className="perfil-bar">
                  <div className="perfil-label">{perfil.replace(/([A-Z])/g, ' $1').trim()}</div>
                  <div className="perfil-value">{cantidad} casos</div>
                  <div 
                    className="perfil-barra"
                    style={{
                      width: `${(cantidad / datosImportados.poblacion.length) * 100}%`,
                      backgroundColor: getPerfilColor(perfil)
                    }}
                  ></div>
                </div>
              ))}
            </div>
          </div>

          {/* Sensibilidad y Especificidad */}
          <div className="analisis-card metricas">
            <h4>🎯 Sensibilidad y Especificidad</h4>
            <div className="metricas-grid">
              <div className="metrica-item">
                <div className="metrica-valor">{analisisGenerado.metricas.sensibilidad}%</div>
                <div className="metrica-label">Sensibilidad</div>
                <div className="metrica-descripcion">Capacidad de detectar casos con retraso</div>
              </div>
              <div className="metrica-item">
                <div className="metrica-valor">{analisisGenerado.metricas.especificidad}%</div>
                <div className="metrica-label">Especificidad</div>
                <div className="metrica-descripcion">Capacidad de identificar casos típicos</div>
              </div>
              <div className="metrica-item">
                <div className="metrica-valor">{analisisGenerado.metricas.precision}%</div>
                <div className="metrica-label">Precisión</div>
                <div className="metrica-descripcion">Proporción de detecciones correctas</div>
              </div>
            </div>

            <div className="confusion-matrix">
              <h5>Matriz de Confusión</h5>
              <table>
                <thead>
                  <tr>
                    <th></th>
                    <th>Detectado +</th>
                    <th>Detectado -</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Real +</strong></td>
                    <td className="tp">{analisisGenerado.metricas.verdaderosPositivos}</td>
                    <td className="fn">{analisisGenerado.metricas.falsosNegativos}</td>
                  </tr>
                  <tr>
                    <td><strong>Real -</strong></td>
                    <td className="fp">{analisisGenerado.metricas.falsosPositivos}</td>
                    <td className="tn">{analisisGenerado.metricas.verdaderosNegativos}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Puntos Ciegos */}
          {analisisGenerado.puntosCiegos.length > 0 && (
            <div className="analisis-card puntos-ciegos">
              <h4>⚠️ Puntos Ciegos Detectados</h4>
              <div className="puntos-ciegos-lista">
                {analisisGenerado.puntosCiegos.map((punto, index) => (
                  <div key={index} className={`punto-ciego ${punto.tipo}`}>
                    <div className="punto-icono">⚠️</div>
                    <div className="punto-contenido">
                      <h5>{punto.descripcion}</h5>
                      <div className="punto-detalles">
                        {punto.cantidad && <span>Casos afectados: {punto.cantidad}</span>}
                        {punto.porcentaje && <span>Porcentaje: {punto.porcentaje}%</span>}
                        {punto.coeficienteVariacion && <span>Coeficiente de Variación: {punto.coeficienteVariacion}%</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Correlaciones entre Dominios */}
          <div className="analisis-card correlaciones">
            <h4>🔗 Correlaciones entre Dominios</h4>
            <div className="correlaciones-grid">
              {Object.entries(analisisGenerado.correlaciones).map(([pares, correlacion]) => {
                const [dom1, dom2] = pares.split('_');
                return (
                  <div key={pares} className="correlacion-item">
                    <div className="correlacion-pares">
                      {dom1.replace(/([A-Z])/g, ' $1').trim()} ↔ {dom2.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                    <div className={`correlacion-valor ${getCorrelacionClass(correlacion)}`}>
                      r = {correlacion}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recomendaciones */}
          {analisisGenerado.recomendaciones.length > 0 && (
            <div className="analisis-card recomendaciones">
              <h4>💡 Recomendaciones</h4>
              <ul className="recomendaciones-lista">
                {analisisGenerado.recomendaciones.map((rec, index) => (
                  <li key={index} className={`recomendacion-item ${rec.tipo}`}>
                    <div className={`prioridad-badge ${rec.prioridad}`}>{rec.prioridad}</div>
                    <div className="recomendacion-texto">{rec.mensaje}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Exportar Resultados */}
          <div className="exportar-resultados">
            <button className="btn-exportar" onClick={exportarDatos}>
              💾 Exportar Datos y Análisis (JSON)
            </button>
          </div>
        </div>
      )}
    </div>
  );

  function getPerfilColor(perfil) {
    const colores = {
      tipico: '#4caf50',
      retrasoLeve: '#ff9800',
      retrasoModerado: '#f44336',
      retrasoSevero: '#9c27b0',
      mixto: '#607d8b'
    };
    return colores[perfil] || '#999';
  }

  function getCorrelacionClass(valor) {
    const abs = Math.abs(valor);
    if (abs >= 0.7) return 'correlacion-alta';
    if (abs >= 0.4) return 'correlacion-media';
    return 'correlacion-baja';
  }
}

export default AnalisisResultados;