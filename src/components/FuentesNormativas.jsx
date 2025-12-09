import React, { useState, useEffect } from 'react';
import { LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, ReferenceLine } from 'recharts';
import { API_URL } from '../config';
import { fetchConAuth } from '../utils/authService';
import './FuentesNormativas.css';

/**
 * Componente de Fuentes Normativas
 * 
 * Permite acceder a información detallada de las fuentes normativas originales
 * y comparar sus características psicométricas estadísticas.
 */
function FuentesNormativas() {
  const [fuentesNormativas, setFuentesNormativas] = useState([]);
  const [fuenteSeleccionada, setFuenteSeleccionada] = useState(null);
  const [estadisticasPorFuente, setEstadisticasPorFuente] = useState({});
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [modoComparacion, setModoComparacion] = useState(false);
  const [fuentesParaComparar, setFuentesParaComparar] = useState([]);
  const [mostrarGraficos, setMostrarGraficos] = useState(false);
  const [escalaSeleccionada, setEscalaSeleccionada] = useState('todas');
  const [datosGraficos, setDatosGraficos] = useState(null);

  useEffect(() => {
    cargarFuentesNormativas();
  }, []);

  const cargarFuentesNormativas = async () => {
    try {
      setCargando(true);
      const response = await fetchConAuth(`${API_URL}/fuentes-normativas-completas`);
      if (response.ok) {
        const fuentes = await response.json();
        setFuentesNormativas(fuentes);
        
        // Cargar estadísticas para cada fuente
        const estadisticas = {};
        for (const fuente of fuentes) {
          const statsResponse = await fetchConAuth(`${API_URL}/estadisticas-fuente/${fuente.id}`);
          if (statsResponse.ok) {
            estadisticas[fuente.id] = await statsResponse.json();
          }
        }
        setEstadisticasPorFuente(estadisticas);
      } else {
        throw new Error('Error al cargar fuentes normativas');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error al cargar la información de fuentes normativas');
    } finally {
      setCargando(false);
    }
  };

  const obtenerIconoFuente = (nombre) => {
    if (nombre.includes('CDC')) return '🏛️';
    if (nombre.includes('OMS') || nombre.includes('WHO')) return '🌍';
    if (nombre.includes('Bayley')) return '🧠';
    if (nombre.includes('Battelle')) return '📊';
    return '📋';
  };

  const obtenerColorFuente = (nombre) => {
    if (nombre.includes('CDC')) return '#0066cc';
    if (nombre.includes('OMS') || nombre.includes('WHO')) return '#009639';
    if (nombre.includes('Bayley')) return '#8e44ad';
    if (nombre.includes('Battelle')) return '#e67e22';
    return '#666666';
  };

  const toggleComparacion = (fuente) => {
    if (fuentesParaComparar.includes(fuente.id)) {
      setFuentesParaComparar(prev => prev.filter(id => id !== fuente.id));
    } else if (fuentesParaComparar.length < 4) {
      setFuentesParaComparar(prev => [...prev, fuente.id]);
    }
  };

  const cargarDatosGraficos = async () => {
    try {
      // Obtener todos los hitos del sistema
      const response = await fetchConAuth(`${API_URL}/hitos`);
      if (response.ok) {
        const hitos = await response.json();
        
        // Procesar datos para gráficos
        const datosPorFuente = {};
        const datosScatter = [];
        
        hitos.forEach(hito => {
          // Usar la fuente normativa del hito
          const fuenteNombre = hito.fuente_normativa || 'Fuente no especificada';
          
          if (!datosPorFuente[fuenteNombre]) {
            datosPorFuente[fuenteNombre] = {
              nombre: fuenteNombre,
              edades: [],
              color: obtenerColorFuente(fuenteNombre)
            };
          }
          
          // Añadir la edad media del hito
          if (hito.edad_media_meses) {
            datosPorFuente[fuenteNombre].edades.push(hito.edad_media_meses);
            
            // Crear punto para scatter plot
            datosScatter.push({
              x: hito.edad_media_meses,
              y: hito.desviacion_estandar || 2, // Valor por defecto si no hay DE
              fuente: fuenteNombre,
              nombre: hito.nombre || 'Hito sin nombre',
              dominio: hito.dominio || 'Sin dominio'
            });
          }
        });
        
        // Calcular estadísticas para cada fuente
        Object.values(datosPorFuente).forEach(fuente => {
          if (fuente.edades.length > 0) {
            const edades = fuente.edades.sort((a, b) => a - b);
            const q1Index = Math.floor(edades.length * 0.25);
            const q3Index = Math.floor(edades.length * 0.75);
            
            fuente.min = Math.min(...edades);
            fuente.max = Math.max(...edades);
            fuente.q1 = edades[q1Index];
            fuente.q3 = edades[q3Index];
            fuente.median = edades[Math.floor(edades.length * 0.5)];
            fuente.mean = edades.reduce((a, b) => a + b, 0) / edades.length;
          }
        });
        
        // Filtrar fuentes que tengan datos
        const fuentesConDatos = Object.values(datosPorFuente).filter(fuente => fuente.edades.length > 0);
        
        setDatosGraficos({
          boxPlotData: fuentesConDatos,
          scatterData: datosScatter
        });
      } else {
        console.error('Error al cargar hitos:', response.statusText);
      }
    } catch (error) {
      console.error('Error cargando datos de gráficos:', error);
    }
  };

  const renderFuenteCard = (fuente) => {
    const estadisticas = estadisticasPorFuente[fuente.id];
    const isSelected = fuenteSeleccionada && fuenteSeleccionada.id === fuente.id;
    const isInComparison = fuentesParaComparar.includes(fuente.id);

    return (
      <div 
        key={fuente.id} 
        className={`fuente-card ${isSelected ? 'selected' : ''} ${isInComparison ? 'comparing' : ''}`}
        style={{ borderLeftColor: obtenerColorFuente(fuente.nombre) }}
      >
        <div className="fuente-header">
          <div className="fuente-titulo">
            <span className="fuente-icono">{obtenerIconoFuente(fuente.nombre)}</span>
            <h3>{fuente.nombre}</h3>
          </div>
          <div className="fuente-acciones">
            {modoComparacion && (
              <button 
                className={`btn-comparar ${isInComparison ? 'active' : ''}`}
                onClick={() => toggleComparacion(fuente)}
                disabled={!isInComparison && fuentesParaComparar.length >= 4}
              >
                {isInComparison ? '✓' : '+'}
              </button>
            )}

          </div>
        </div>

        <div className="fuente-info-rapida">
          <div className="info-item">
            <span className="label">Año de Publicación:</span>
            <span className="valor">{fuente.año_publicacion || 'No especificado'}</span>
          </div>
          <div className="info-item">
            <span className="label">País/Región:</span>
            <span className="valor">{fuente.pais_region || 'No especificado'}</span>
          </div>
          {estadisticas && (
            <>
              <div className="info-item">
                <span className="label">Hitos Totales:</span>
                <span className="valor">{estadisticas.total_hitos}</span>
              </div>
              <div className="info-item">
                <span className="label">Rango de Edad:</span>
                <span className="valor">{estadisticas.edad_minima}-{estadisticas.edad_maxima} meses</span>
              </div>
            </>
          )}
        </div>

        <div className="fuente-detalles">
            <div className="detalle-seccion">
              <h4>📋 Información General</h4>
              <p><strong>Descripción:</strong> {fuente.descripcion || 'No disponible'}</p>
              <p><strong>Autores:</strong> {fuente.autores || 'No especificado'}</p>
              <p><strong>Editorial/Organización:</strong> {fuente.editorial || 'No especificado'}</p>
              
              {fuente.referencias_bibliograficas && (
                <div className="referencias">
                  <strong>Referencias Bibliográficas:</strong>
                  <p className="referencia-texto">{fuente.referencias_bibliograficas}</p>
                </div>
              )}
              
              {fuente.url_original && (
                <div className="enlace-original">
                  <a href={fuente.url_original} target="_blank" rel="noopener noreferrer" className="btn-enlace">
                    🔗 Ver Fuente Original
                  </a>
                </div>
              )}
            </div>

            {estadisticas && (
              <div className="detalle-seccion">
                <h4>📊 Características Psicométricas</h4>
                <div className="estadisticas-grid">
                  <div className="stat-item">
                    <span className="stat-label">Total de Hitos:</span>
                    <span className="stat-valor">{estadisticas.total_hitos}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Edad Media (meses):</span>
                    <span className="stat-valor">{estadisticas.edad_media?.toFixed(1)}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Desviación Estándar Media:</span>
                    <span className="stat-valor">{estadisticas.de_media?.toFixed(2)}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Cobertura por Dominios:</span>
                    <div className="dominios-cobertura">
                      {estadisticas.dominios_cobertura?.map(dom => (
                        <span key={dom.dominio} className="dominio-chip">
                          {dom.dominio}: {dom.cantidad}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Confiabilidad:</span>
                    <span className="stat-valor">{fuente.confiabilidad || 'No especificada'}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Validez:</span>
                    <span className="stat-valor">{fuente.validez || 'No especificada'}</span>
                  </div>
                </div>
              </div>
            )}

            {fuente.metodologia && (
              <div className="detalle-seccion">
                <h4>🔬 Metodología</h4>
                <p>{fuente.metodologia}</p>
              </div>
            )}

            {fuente.limitaciones && (
              <div className="detalle-seccion">
                <h4>⚠️ Limitaciones Conocidas</h4>
                <p>{fuente.limitaciones}</p>
              </div>
            )}
          </div>
      </div>
    );
  };

  const renderComparacion = () => {
    if (fuentesParaComparar.length < 2) {
      return (
        <div className="comparacion-vacia">
          <p>Seleccione al menos 2 fuentes para comparar sus características.</p>
        </div>
      );
    }

    const fuentesComparar = fuentesNormativas.filter(f => fuentesParaComparar.includes(f.id));

    return (
      <div className="comparacion-container">
        <h3>📊 Comparación de Fuentes Normativas</h3>
        
        <div className="tabla-comparacion">
          <table>
            <thead>
              <tr>
                <th>Característica</th>
                {fuentesComparar.map(fuente => (
                  <th key={fuente.id} style={{ color: obtenerColorFuente(fuente.nombre) }}>
                    {obtenerIconoFuente(fuente.nombre)} {fuente.nombre.split(' - ')[0]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Año de Publicación</strong></td>
                {fuentesComparar.map(fuente => (
                  <td key={fuente.id}>{fuente.año_publicacion || 'N/E'}</td>
                ))}
              </tr>
              <tr>
                <td><strong>Total de Hitos</strong></td>
                {fuentesComparar.map(fuente => {
                  const stats = estadisticasPorFuente[fuente.id];
                  return <td key={fuente.id}>{stats?.total_hitos || 'N/D'}</td>;
                })}
              </tr>
              <tr>
                <td><strong>Rango de Edad (meses)</strong></td>
                {fuentesComparar.map(fuente => {
                  const stats = estadisticasPorFuente[fuente.id];
                  return (
                    <td key={fuente.id}>
                      {stats ? `${stats.edad_minima}-${stats.edad_maxima}` : 'N/D'}
                    </td>
                  );
                })}
              </tr>
              <tr>
                <td><strong>Edad Media (meses)</strong></td>
                {fuentesComparar.map(fuente => {
                  const stats = estadisticasPorFuente[fuente.id];
                  return <td key={fuente.id}>{stats?.edad_media?.toFixed(1) || 'N/D'}</td>;
                })}
              </tr>
              <tr>
                <td><strong>DE Media</strong></td>
                {fuentesComparar.map(fuente => {
                  const stats = estadisticasPorFuente[fuente.id];
                  return <td key={fuente.id}>{stats?.de_media?.toFixed(2) || 'N/D'}</td>;
                })}
              </tr>
              <tr>
                <td><strong>País/Región</strong></td>
                {fuentesComparar.map(fuente => (
                  <td key={fuente.id}>{fuente.pais_region || 'No especificado'}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  if (cargando) {
    return (
      <div className="fuentes-normativas-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Cargando fuentes normativas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fuentes-normativas-container">
        <div className="error">
          <p>{error}</p>
          <button onClick={cargarFuentesNormativas} className="btn-reintentar">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fuentes-normativas-container">
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
        }}>Fuentes Normativas</h2>
        <p style={{
          fontSize: '1.2rem',
          color: 'white',
          lineHeight: '1.8',
          margin: '0',
          fontWeight: '400'
        }}>
          Información detallada de las fuentes normativas y sus características psicométricas para la evaluación del desarrollo infantil.
        </p>
      </div>

      <div className="fuentes-controles">
        <button 
          className={`btn-modo ${modoComparacion ? 'active' : ''}`}
          onClick={() => {
            setModoComparacion(!modoComparacion);
            if (!modoComparacion) {
              setFuentesParaComparar([]);
            }
          }}
        >
          {modoComparacion ? '📋 Modo Normal' : '⚖️ Modo Comparación'}
        </button>
        
        {modoComparacion && fuentesParaComparar.length > 0 && (
          <button 
            className="btn-limpiar"
            onClick={() => setFuentesParaComparar([])}
          >
            🗑️ Limpiar Selección
          </button>
        )}
      </div>

      {modoComparacion && fuentesParaComparar.length > 1 && (
        <div className="seccion-comparacion">
          {renderComparacion()}
        </div>
      )}

      <div className="fuentes-lista">
        <h3>📖 Fuentes Disponibles ({fuentesNormativas.length})</h3>
        <div className="fuentes-grid">
          {fuentesNormativas.map(fuente => renderFuenteCard(fuente))}
        </div>
      </div>

      {/* Sección de Visualización Gráfica */}
      <div className="seccion-graficos">
        <div className="graficos-header">
          <h3>📊 Análisis Visual de Fuentes Normativas</h3>
          <p>Comparación gráfica de la distribución de hitos por edad y variabilidad entre diferentes escalas</p>
        </div>

        <div className="graficos-controles">
          <button 
            className={`btn-modo ${mostrarGraficos ? 'active' : ''}`}
            onClick={() => {
              setMostrarGraficos(!mostrarGraficos);
              if (!mostrarGraficos && !datosGraficos) {
                cargarDatosGraficos();
              }
            }}
          >
            {mostrarGraficos ? '📈 Ocultar Gráficos' : '📊 Mostrar Análisis Gráfico'}
          </button>
        </div>

        {mostrarGraficos && (
          <div className="graficos-container">
            {!datosGraficos ? (
              <div className="cargando">Cargando datos de visualización...</div>
            ) : (
              <>
                {/* Diagrama de Cajas */}
                <div className="grafico-seccion">
                  <h4>📦 Distribución de Edades por Fuente Normativa</h4>
                  <p className="grafico-descripcion">
                    Diagrama de cajas mostrando la distribución de edades de los hitos en cada escala.
                    Permite identificar el rango de cobertura y la concentración de hitos por edad.
                  </p>
                  
                  <div className="grafico-wrapper" style={{ width: '100%', height: '400px', background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #ddd' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart data={datosGraficos.scatterData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="x" 
                          type="number"
                          domain={[0, 72]}
                          label={{ value: 'Edad Media (meses)', position: 'insideBottom', offset: -10 }}
                        />
                        <YAxis 
                          dataKey="y"
                          type="number" 
                          domain={[0, 'dataMax + 2']}
                          label={{ value: 'Desviación Estándar (meses)', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip 
                          formatter={(value, name) => {
                            if (name === 'y') return [`${value?.toFixed(2)} meses`, 'Desviación Estándar'];
                            return [value, name];
                          }}
                          labelFormatter={(x) => `Edad: ${x} meses`}
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="custom-tooltip">
                                  <p><strong>{data.nombre}</strong></p>
                                  <p>Fuente: {data.fuente}</p>
                                  <p>Dominio: {data.dominio}</p>
                                  <p>Edad: {data.x} meses</p>
                                  <p>DE: ±{data.y?.toFixed(2)} meses</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        
                        {/* Puntos por fuente con colores diferentes */}
                        {datosGraficos.boxPlotData.map((fuente, index) => (
                          <Scatter
                            key={fuente.nombre}
                            data={datosGraficos.scatterData.filter(d => d.fuente === fuente.nombre)}
                            fill={fuente.color}
                            fillOpacity={0.7}
                            name={fuente.nombre}
                          />
                        ))}
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="leyenda-graficos">
                    <h5>Leyenda por Fuente:</h5>
                    <div className="leyenda-items">
                      {datosGraficos.boxPlotData.map((fuente, index) => (
                        <div key={fuente.nombre} className="leyenda-item">
                          <span 
                            className="color-indicator" 
                            style={{ backgroundColor: fuente.color }}
                          ></span>
                          <span>{obtenerIconoFuente(fuente.nombre)} {fuente.nombre.split(' - ')[0]}</span>
                          <span className="stats-resumidas">
                            (n={fuente.edades.length}, μ={fuente.mean.toFixed(1)}m)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Análisis de Variabilidad */}
                <div className="grafico-seccion">
                  <h4>📈 Análisis de Variabilidad por Edad</h4>
                  <p className="grafico-descripcion">
                    Muestra cómo varía la desviación estándar de los hitos en función de la edad.
                    Ayuda a identificar períodos de mayor o menor variabilidad en el desarrollo.
                  </p>
                  
                  <div className="estadisticas-resumen">
                    <h5>📋 Estadísticas por Fuente:</h5>
                    <div className="stats-grid">
                      {datosGraficos.boxPlotData.map((fuente) => (
                        <div key={fuente.nombre} className="stat-fuente-card">
                          <div className="stat-header" style={{ borderLeft: `4px solid ${fuente.color}` }}>
                            <span>{obtenerIconoFuente(fuente.nombre)}</span>
                            <strong>{fuente.nombre.split(' - ')[0]}</strong>
                          </div>
                          <div className="stat-content">
                            <div className="stat-row">
                              <span>Hitos totales:</span>
                              <span>{fuente.edades.length}</span>
                            </div>
                            <div className="stat-row">
                              <span>Rango de edad:</span>
                              <span>{fuente.min.toFixed(1)} - {fuente.max.toFixed(1)}m</span>
                            </div>
                            <div className="stat-row">
                              <span>Edad media:</span>
                              <span>{fuente.mean.toFixed(1)}m</span>
                            </div>
                            <div className="stat-row">
                              <span>Mediana:</span>
                              <span>{fuente.median.toFixed(1)}m</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default FuentesNormativas;