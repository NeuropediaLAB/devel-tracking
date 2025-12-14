import React, { useState, useEffect } from 'react';
import { LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, ReferenceLine, BarChart, Bar, Cell, ComposedChart, ErrorBar, Line } from 'recharts';
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
    // Iconos para fuentes principales con datos reales
    if (nombre.includes('CDC')) return '🏛️';
    if (nombre.includes('OMS') || nombre.includes('WHO') || nombre.includes('GSED')) return '🌍';
    
    // Iconos para fuentes internacionales con datos reales
    if (nombre.includes('ASQ')) return '📝';
    if (nombre.includes('UK Millennium') || nombre.includes('MCS')) return '🇬🇧';
    if (nombre.includes('GCDG')) return '🧬';
    if (nombre.includes('Denver')) return '⚕️';
    if (nombre.includes('ECDI')) return '🎯';
    if (nombre.includes('China')) return '🇨🇳';
    if (nombre.includes('Chile')) return '🇨🇱';
    if (nombre.includes('Colombia')) return '🇨🇴';
    if (nombre.includes('Ecuador')) return '🇪🇨';
    
    // Fuentes en cuarentena (sin datos reales aún)
    if (nombre.includes('Bayley')) return '🔒'; // Cuarentena
    if (nombre.includes('Battelle')) return '🔒'; // Cuarentena
    
    // Icono por defecto
    return '📋';
  };

  const obtenerColorFuente = (nombre) => {
    // Colores para fuentes principales con datos reales
    if (nombre.includes('CDC')) return '#0066cc';
    if (nombre.includes('OMS') || nombre.includes('WHO') || nombre.includes('GSED')) return '#009639';
    
    // Colores para fuentes internacionales con datos reales
    if (nombre.includes('ASQ')) return '#ff6b6b';
    if (nombre.includes('UK Millennium') || nombre.includes('MCS')) return '#4ecdc4';
    if (nombre.includes('GCDG')) return '#45b7d1';
    if (nombre.includes('Denver')) return '#96ceb4';
    if (nombre.includes('ECDI')) return '#ffeaa7';
    if (nombre.includes('China')) return '#fd79a8';
    if (nombre.includes('Chile')) return '#fdcb6e';
    if (nombre.includes('Colombia')) return '#6c5ce7';
    if (nombre.includes('Ecuador')) return '#a29bfe';
    
    // Fuentes en cuarentena (sin datos reales aún)
    if (nombre.includes('Bayley')) return '#999999'; // Gris para indicar cuarentena
    if (nombre.includes('Battelle')) return '#999999'; // Gris para indicar cuarentena
    
    // Color por defecto para otras fuentes
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
      // Obtener todos los hitos de todas las fuentes CON DATOS REALES SOLAMENTE
      const todosHitos = [];
      const estadisticasFuentes = [];
      
      // Cargar hitos solo de fuentes con datos reales (CDC y OMS)
      const fuentesConDatos = fuentesNormativas.filter(f => f.id === 1 || f.id === 2);
      
      for (const fuente of fuentesConDatos) {
        const response = await fetchConAuth(`${API_URL}/hitos-normativos?fuente=${fuente.id}`);
        if (response.ok) {
          const hitos = await response.json();
          // Agregar información completa de la fuente a cada hito
          hitos.forEach(hito => {
            hito.fuente_normativa_nombre = fuente.nombre;
            hito.fuente_tamaño_muestra = fuente.tamaño_muestra;
            hito.fuente_poblacion = fuente.poblacion;
            hito.fuente_año = fuente.año;
          });
          todosHitos.push(...hitos);
          
          // Agregar estadísticas de la fuente
          estadisticasFuentes.push({
            nombre: fuente.nombre,
            tamaño_muestra: fuente.tamaño_muestra,
            año: fuente.año,
            poblacion: fuente.poblacion,
            color: obtenerColorFuente(fuente.nombre),
            icono: obtenerIconoFuente(fuente.nombre)
          });
        }
      }
      
      if (todosHitos.length === 0) {
        console.warn('No se pudieron cargar hitos para los gráficos');
        return;
      }
      
      // Procesar datos para gráficos
      const datosPorFuente = {};
      const datosScatter = [];
      const datosPoderEstadistico = [];
      const datosBoxplotHitos = []; // Nuevos datos para boxplot de hitos individuales
      
      todosHitos.forEach(hito => {
        const fuenteNombre = hito.fuente_normativa_nombre || 'Fuente no especificada';
        
        if (!datosPorFuente[fuenteNombre]) {
          datosPorFuente[fuenteNombre] = {
            nombre: fuenteNombre,
            edades: [],
            color: obtenerColorFuente(fuenteNombre),
            tamaño_muestra: hito.fuente_tamaño_muestra,
            año: hito.fuente_año,
            poblacion: hito.fuente_poblacion
          };
        }
        
        // Añadir la edad media del hito
        if (hito.edad_media_meses) {
          datosPorFuente[fuenteNombre].edades.push(hito.edad_media_meses);
          
          // Crear punto para scatter plot con información de poder estadístico
          datosScatter.push({
            x: hito.edad_media_meses,
            y: hito.desviacion_estandar || 2,
            fuente: fuenteNombre,
            nombre: hito.nombre || 'Hito sin nombre',
            dominio: hito.dominio_nombre || 'Sin dominio',
            tamaño_muestra: hito.fuente_tamaño_muestra,
            poder_estadistico: calcularPoderEstadistico(hito.fuente_tamaño_muestra)
          });
          
          // Crear entrada para boxplot de hitos individuales
          const edad = hito.edad_media_meses;
          const de = hito.desviacion_estandar || 2;
          const hitoId = `${fuenteNombre.split(' - ')[0]}_${hito.nombre?.replace(/\s+/g, '_') || 'Hito'}`;
          
          datosBoxplotHitos.push({
            categoria: hitoId,
            fuente: fuenteNombre.split(' - ')[0],
            hito: hito.nombre || 'Sin nombre',
            dominio: hito.dominio_nombre || 'Sin dominio',
            min: Math.max(0, edad - 2*de),
            q1: edad - de,
            median: edad,
            q3: edad + de,
            max: edad + 2*de,
            mean: edad,
            sd: de,
            color: obtenerColorFuente(fuenteNombre),
            tamaño_muestra: hito.fuente_tamaño_muestra
          });
        }
      });
      
      // Calcular estadísticas para cada fuente
      Object.values(datosPorFuente).forEach(fuente => {
        if (fuente.edades.length > 0) {
          const edades = fuente.edades.sort((a, b) => a - b);
          const n = edades.length;
          const q1Index = Math.floor(n * 0.25);
          const q3Index = Math.floor(n * 0.75);
          
          fuente.min = Math.min(...edades);
          fuente.max = Math.max(...edades);
          fuente.q1 = edades[q1Index];
          fuente.q3 = edades[q3Index];
          fuente.median = edades[Math.floor(n * 0.5)];
          fuente.mean = edades.reduce((a, b) => a + b, 0) / n;
          fuente.sd = Math.sqrt(edades.reduce((acc, val) => acc + Math.pow(val - fuente.mean, 2), 0) / n);
          fuente.iqr = fuente.q3 - fuente.q1;
          
          // Datos para gráfico de poder estadístico
          datosPoderEstadistico.push({
            nombre: fuente.nombre.split(' - ')[0],
            n: fuente.tamaño_muestra,
            hitos: n,
            poder: calcularPoderEstadistico(fuente.tamaño_muestra),
            color: fuente.color
          });
        }
      });
      
      // Filtrar fuentes que tengan datos
      const fuentesConDatosReales = Object.values(datosPorFuente).filter(fuente => fuente.edades.length > 0);
      
      console.log('Datos para gráficos cargados:', {
        fuentesConDatos: fuentesConDatosReales.length,
        totalHitos: todosHitos.length,
        scatterPoints: datosScatter.length,
        estadisticas: estadisticasFuentes
      });
      
      setDatosGraficos({
        boxPlotData: fuentesConDatosReales,
        scatterData: datosScatter,
        poderEstadistico: datosPoderEstadistico,
        estadisticasFuentes: estadisticasFuentes,
        boxplotHitos: datosBoxplotHitos.slice(0, 20) // Limitar a 20 hitos para mejor visualización
      });
    } catch (error) {
      console.error('Error cargando datos de gráficos:', error);
    }
  };

  // Función para calcular el poder estadístico basado en el tamaño de muestra
  const calcularPoderEstadistico = (n) => {
    if (!n) return 'Bajo';
    if (n < 100) return 'Muy Bajo';
    if (n < 500) return 'Bajo';
    if (n < 1000) return 'Moderado';
    if (n < 5000) return 'Alto';
    return 'Muy Alto';
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
                {/* Poder Estadístico */}
                <div className="grafico-seccion">
                  <h4>🔬 Comparación del Poder Estadístico</h4>
                  <p className="grafico-descripcion">
                    Comparación del tamaño de muestra (n) utilizado para normar cada escala.
                    Un mayor tamaño de muestra proporciona mayor precisión estadística y representatividad poblacional.
                  </p>
                  
                  <div className="grafico-wrapper" style={{ width: '100%', height: '350px', background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #ddd' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={datosGraficos.poderEstadistico} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="nombre" 
                          tick={{ fontSize: 12 }}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis 
                          scale="log"
                          domain={['dataMin', 'dataMax']}
                          label={{ value: 'Tamaño de Muestra (n)', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip 
                          formatter={(value, name, props) => [
                            `n = ${value.toLocaleString()}`,
                            'Tamaño de Muestra'
                          ]}
                          labelFormatter={(label) => `Fuente: ${label}`}
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="custom-tooltip">
                                  <p><strong>{label}</strong></p>
                                  <p>Tamaño muestra: n = {data.n.toLocaleString()}</p>
                                  <p>Hitos disponibles: {data.hitos}</p>
                                  <p>Poder estadístico: <strong>{data.poder}</strong></p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar dataKey="n" name="Tamaño de Muestra">
                          {datosGraficos.poderEstadistico.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="poder-estadistico-info">
                    <h5>📋 Interpretación del Poder Estadístico:</h5>
                    <div className="poder-grid">
                      <div className="poder-categoria muy-alto">
                        <span className="poder-nivel">Muy Alto</span>
                        <span className="poder-rango">n ≥ 5,000</span>
                        <span className="poder-desc">Máxima precisión estadística</span>
                      </div>
                      <div className="poder-categoria alto">
                        <span className="poder-nivel">Alto</span>
                        <span className="poder-rango">1,000 ≤ n &lt; 5,000</span>
                        <span className="poder-desc">Buena representatividad</span>
                      </div>
                      <div className="poder-categoria moderado">
                        <span className="poder-nivel">Moderado</span>
                        <span className="poder-rango">500 ≤ n &lt; 1,000</span>
                        <span className="poder-desc">Representatividad aceptable</span>
                      </div>
                      <div className="poder-categoria bajo">
                        <span className="poder-nivel">Bajo</span>
                        <span className="poder-rango">n &lt; 500</span>
                        <span className="poder-desc">Limitaciones estadísticas</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Diagrama de Cajas Real */}
                <div className="grafico-seccion">
                  <h4>📦 Distribución de Edades por Fuente (Box Plot)</h4>
                  <p className="grafico-descripcion">
                    Diagrama de cajas mostrando la distribución de edades de los hitos por fuente normativa.
                    Visualiza mediana, cuartiles, rango y valores atípicos en la distribución de edades.
                  </p>
                  
                  <div className="boxplot-container">
                    {datosGraficos.boxPlotData.map((fuente, index) => (
                      <div key={fuente.nombre} className="boxplot-fuente" style={{ borderColor: fuente.color }}>
                        <div className="boxplot-header">
                          <span className="fuente-icono">{obtenerIconoFuente(fuente.nombre)}</span>
                          <span className="fuente-nombre">{fuente.nombre.split(' - ')[0]}</span>
                          <span className="muestra-info">n = {fuente.tamaño_muestra?.toLocaleString()}</span>
                        </div>
                        
                        <div className="boxplot-visual" style={{ '--color': fuente.color }}>
                          <div className="box-stats">
                            <div className="stat-line">
                              <span className="stat-label">Mín:</span>
                              <span className="stat-value">{fuente.min.toFixed(1)}m</span>
                            </div>
                            <div className="stat-line">
                              <span className="stat-label">Q1:</span>
                              <span className="stat-value">{fuente.q1.toFixed(1)}m</span>
                            </div>
                            <div className="stat-line main-stat">
                              <span className="stat-label">Mediana:</span>
                              <span className="stat-value">{fuente.median.toFixed(1)}m</span>
                            </div>
                            <div className="stat-line">
                              <span className="stat-label">Q3:</span>
                              <span className="stat-value">{fuente.q3.toFixed(1)}m</span>
                            </div>
                            <div className="stat-line">
                              <span className="stat-label">Máx:</span>
                              <span className="stat-value">{fuente.max.toFixed(1)}m</span>
                            </div>
                            <div className="stat-line">
                              <span className="stat-label">IQR:</span>
                              <span className="stat-value">{fuente.iqr.toFixed(1)}m</span>
                            </div>
                            <div className="stat-line">
                              <span className="stat-label">Hitos:</span>
                              <span className="stat-value">{fuente.edades.length}</span>
                            </div>
                          </div>

                          <div className="box-visual">
                            <div className="box-range" style={{ 
                              background: `linear-gradient(90deg, transparent 0%, ${fuente.color}20 20%, ${fuente.color}40 50%, ${fuente.color}20 80%, transparent 100%)`,
                              height: '20px',
                              position: 'relative',
                              borderRadius: '4px',
                              border: `1px solid ${fuente.color}`
                            }}>
                              <div className="quartile-lines">
                                <div className="q1-line" style={{ left: '25%', borderColor: fuente.color }}></div>
                                <div className="median-line" style={{ left: '50%', borderColor: fuente.color, borderWidth: '2px' }}></div>
                                <div className="q3-line" style={{ left: '75%', borderColor: fuente.color }}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Scatter Plot de Precisión */}
                <div className="grafico-seccion">
                  <h4>🎯 Precisión vs Edad de los Hitos</h4>
                  <p className="grafico-descripcion">
                    Análisis de la desviación estándar (precisión) de cada hito en función de la edad.
                    Puntos más cercanos al eje X indican mayor precisión normativa.
                  </p>
                  
                  <div className="grafico-wrapper" style={{ width: '100%', height: '400px', background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #ddd' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart data={datosGraficos.scatterData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="x" 
                          type="number"
                          domain={[0, 72]}
                          label={{ value: 'Edad del Hito (meses)', position: 'insideBottom', offset: -10 }}
                        />
                        <YAxis 
                          dataKey="y"
                          type="number" 
                          domain={[0, 'dataMax + 1']}
                          label={{ value: 'Desviación Estándar (meses)', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="custom-tooltip">
                                  <p><strong>{data.nombre}</strong></p>
                                  <p>Fuente: {data.fuente.split(' - ')[0]}</p>
                                  <p>Dominio: {data.dominio}</p>
                                  <p>Edad: {data.x} meses</p>
                                  <p>DE: ±{data.y?.toFixed(2)} meses</p>
                                  <p>Muestra: n = {data.tamaño_muestra?.toLocaleString()}</p>
                                  <p>Poder: <strong>{data.poder_estadistico}</strong></p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        
                        {/* Línea de referencia para alta precisión */}
                        <ReferenceLine y={1} stroke="#ff6b6b" strokeDasharray="5 5" label={{ value: "Alta precisión (DE < 1m)", position: "topRight" }} />
                        
                        {/* Puntos por fuente */}
                        {datosGraficos.boxPlotData.map((fuente) => (
                          <Scatter
                            key={fuente.nombre}
                            data={datosGraficos.scatterData.filter(d => d.fuente === fuente.nombre)}
                            fill={fuente.color}
                            fillOpacity={0.8}
                            name={fuente.nombre.split(' - ')[0]}
                          />
                        ))}
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="leyenda-graficos">
                    <h5>📊 Resumen Estadístico:</h5>
                    <div className="leyenda-items">
                      {datosGraficos.estadisticasFuentes.map((fuente) => (
                        <div key={fuente.nombre} className="leyenda-item-completa">
                          <div className="leyenda-header">
                            <span className="color-indicator" style={{ backgroundColor: fuente.color }}></span>
                            <span className="fuente-info">
                              {fuente.icono} <strong>{fuente.nombre.split(' - ')[0]}</strong> ({fuente.año})
                            </span>
                          </div>
                          <div className="leyenda-detalles">
                            <p className="poblacion-info">{fuente.poblacion}</p>
                            <p className="muestra-poder">
                              <strong>n = {fuente.tamaño_muestra?.toLocaleString()}</strong> 
                              | Poder estadístico: <strong>{calcularPoderEstadistico(fuente.tamaño_muestra)}</strong>
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Boxplot de Hitos Individuales */}
                <div className="grafico-seccion">
                  <h4>📦 Distribución de Edad por Hito Individual</h4>
                  <p className="grafico-descripcion">
                    Diagramas de cajas mostrando la distribución de edades normativas (media ± DE) para hitos específicos.
                    Cada caja representa el rango típico de desarrollo para ese hito.
                  </p>
                  
                  <div className="boxplot-custom-container" style={{ width: '100%', background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #ddd' }}>
                    {datosGraficos.boxplotHitos.map((hito, index) => (
                      <div key={hito.categoria} className="boxplot-row" style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        marginBottom: '8px',
                        padding: '4px 0',
                        borderBottom: index < datosGraficos.boxplotHitos.length - 1 ? '1px solid #f0f0f0' : 'none'
                      }}>
                        {/* Etiqueta del hito */}
                        <div className="boxplot-label" style={{ 
                          width: '200px', 
                          fontSize: '11px', 
                          fontWeight: '500',
                          textAlign: 'right',
                          paddingRight: '10px',
                          color: hito.color,
                          borderRight: `2px solid ${hito.color}`
                        }}>
                          <div>{hito.fuente}</div>
                          <div style={{ fontSize: '10px', opacity: 0.8 }}>
                            {hito.hito.length > 20 ? hito.hito.substring(0, 20) + '...' : hito.hito}
                          </div>
                        </div>
                        
                        {/* Visualización del boxplot */}
                        <div className="boxplot-visual" style={{ 
                          flex: 1, 
                          height: '24px', 
                          position: 'relative', 
                          marginLeft: '20px',
                          marginRight: '20px'
                        }}>
                          {/* Escala de fondo */}
                          <div style={{ 
                            position: 'absolute', 
                            top: '50%', 
                            left: 0, 
                            right: 0, 
                            height: '1px', 
                            background: '#e0e0e0',
                            transform: 'translateY(-50%)'
                          }}></div>
                          
                          {/* Marcadores de escala (cada 12 meses) */}
                          {[0, 12, 24, 36, 48, 60, 72].map(mes => (
                            <div key={mes} style={{
                              position: 'absolute',
                              left: `${(mes / 72) * 100}%`,
                              top: '50%',
                              width: '1px',
                              height: '8px',
                              background: '#ccc',
                              transform: 'translate(-50%, -50%)'
                            }}>
                              <span style={{
                                position: 'absolute',
                                top: '-15px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                fontSize: '8px',
                                color: '#999'
                              }}>{mes}</span>
                            </div>
                          ))}
                          
                          {/* Bigotes (min-max) */}
                          <div style={{
                            position: 'absolute',
                            left: `${(hito.min / 72) * 100}%`,
                            width: `${((hito.max - hito.min) / 72) * 100}%`,
                            top: '50%',
                            height: '2px',
                            background: hito.color,
                            transform: 'translateY(-50%)',
                            opacity: 0.6
                          }}></div>
                          
                          {/* Caja (Q1-Q3) */}
                          <div style={{
                            position: 'absolute',
                            left: `${(hito.q1 / 72) * 100}%`,
                            width: `${((hito.q3 - hito.q1) / 72) * 100}%`,
                            top: '50%',
                            height: '16px',
                            background: `${hito.color}40`,
                            border: `2px solid ${hito.color}`,
                            borderRadius: '3px',
                            transform: 'translateY(-50%)'
                          }}></div>
                          
                          {/* Línea de la mediana */}
                          <div style={{
                            position: 'absolute',
                            left: `${(hito.median / 72) * 100}%`,
                            top: '50%',
                            width: '2px',
                            height: '20px',
                            background: '#333',
                            transform: 'translate(-50%, -50%)'
                          }}></div>
                          
                          {/* Tooltip hover area */}
                          <div 
                            className="boxplot-hover"
                            style={{
                              position: 'absolute',
                              left: 0,
                              right: 0,
                              top: 0,
                              bottom: 0,
                              cursor: 'pointer'
                            }}
                            title={`${hito.hito} (${hito.fuente})
Dominio: ${hito.dominio}
Edad Media: ${hito.median.toFixed(1)} meses
Desviación: ±${hito.sd?.toFixed(1)} meses
Rango: ${hito.min.toFixed(1)} - ${hito.max.toFixed(1)} meses
Muestra: n = ${hito.tamaño_muestra?.toLocaleString()}`}
                          ></div>
                        </div>
                        
                        {/* Valor numérico */}
                        <div className="boxplot-value" style={{ 
                          width: '80px', 
                          textAlign: 'center',
                          fontSize: '11px',
                          fontWeight: '600',
                          color: hito.color
                        }}>
                          {hito.median.toFixed(1)}m
                          <div style={{ fontSize: '9px', opacity: 0.7 }}>
                            ±{hito.sd?.toFixed(1)}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Escala inferior */}
                    <div className="boxplot-scale" style={{ 
                      marginTop: '20px', 
                      paddingTop: '10px',
                      borderTop: '1px solid #ddd',
                      fontSize: '10px',
                      color: '#666',
                      textAlign: 'center'
                    }}>
                      Escala: 0 - 72 meses | Línea negra: mediana | Caja: Q1-Q3 | Línea completa: rango ±2DE
                    </div>
                  </div>

                  <div className="boxplot-interpretacion" style={{ marginTop: '15px' }}>
                    <h5>🔍 Interpretación del Boxplot:</h5>
                    <div className="interpretacion-items" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', fontSize: '12px' }}>
                      <div className="interpretacion-item" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="interpretacion-simbolo">📦</span>
                        <span><strong>Caja coloreada:</strong> Rango intercuartil (Q1 a Q3)</span>
                      </div>
                      <div className="interpretacion-item" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="interpretacion-simbolo">➖</span>
                        <span><strong>Línea negra:</strong> Mediana (edad típica)</span>
                      </div>
                      <div className="interpretacion-item" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="interpretacion-simbolo">📏</span>
                        <span><strong>Línea completa:</strong> Rango de variabilidad (±2 DE)</span>
                      </div>
                      <div className="interpretacion-item" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="interpretacion-simbolo">🎯</span>
                        <span><strong>Cajas estrechas:</strong> Mayor consistencia normativa</span>
                      </div>
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