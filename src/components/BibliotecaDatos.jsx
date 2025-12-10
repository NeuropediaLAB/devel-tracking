import React, { useState, useEffect, Fragment } from 'react';
import './BibliotecaDatos.css';
import { API_URL } from '../config';
import { fetchConAuth } from '../utils/authService';

const BibliotecaDatos = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('escalas-normativas');
  const [activeSubTab, setActiveSubTab] = useState('resumen'); // Nueva subtab
  const [data, setData] = useState({
    escalasNormativas: [],
    cohortesPersonalizadas: [],
    estadisticasUso: [],
    metadatos: {}
  });
  
  // Estados para filtros y ordenación
  const [filtros, setFiltros] = useState({
    escalas: { fuente: '', dominio: '', busqueda: '', vista: 'todos' },
    cohortes: { usuario: '', busqueda: '' },
    estadisticas: { rol: '', activo: '', busqueda: '' }
  });
  
  const [ordenacion, setOrdenacion] = useState({
    campo: '',
    direccion: 'asc' // 'asc' o 'desc'
  });
  
  // Estado para expandir hitos duplicados
  const [hitosExpandidos, setHitosExpandidos] = useState({});

  // Función para alternar expansión de hitos
  const toggleHitoExpansion = (hitoNombre) => {
    setHitosExpandidos(prev => ({
      ...prev,
      [hitoNombre]: !prev[hitoNombre]
    }));
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Función para refrescar datos automáticamente cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔄 Actualizando datos de la biblioteca...');
      cargarDatos();
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      console.log('🔄 Iniciando carga de datos de la biblioteca...');
      console.log('🌐 API_URL:', API_URL);
      
      // Cargar datos de escalas normativas
      console.log('📊 Cargando escalas normativas...');
      const escalasResponse = await fetchConAuth(`${API_URL}/admin/escalas-normativas`);
      console.log('📊 Respuesta escalas status:', escalasResponse.status);
      const escalasData = await escalasResponse.json();
      console.log('📊 Escalas cargadas:', escalasData.length, 'elementos');
      
      // Cargar cohortes personalizadas
      console.log('👥 Cargando cohortes personalizadas...');
      const cohortesResponse = await fetchConAuth(`${API_URL}/admin/cohortes-personalizadas`);
      console.log('👥 Respuesta cohortes status:', cohortesResponse.status);
      const cohortesData = await cohortesResponse.json();
      console.log('👥 Cohortes cargadas:', cohortesData.length, 'elementos');
      
      // Cargar estadísticas de uso
      console.log('📈 Cargando estadísticas de uso...');
      const estadisticasResponse = await fetchConAuth(`${API_URL}/admin/estadisticas-uso`);
      console.log('📈 Respuesta estadísticas status:', estadisticasResponse.status);
      const estadisticasData = await estadisticasResponse.json();
      console.log('📈 Estadísticas cargadas:', estadisticasData.length, 'elementos');
      
      // Cargar metadatos del sistema
      console.log('🔬 Cargando metadatos del sistema...');
      const metadatosResponse = await fetchConAuth(`${API_URL}/admin/metadatos-sistema`);
      console.log('🔬 Respuesta metadatos status:', metadatosResponse.status);
      const metadatosData = await metadatosResponse.json();
      console.log('🔬 Metadatos cargados:', metadatosData);

      const dataFinal = {
        escalasNormativas: Array.isArray(escalasData) ? escalasData : [],
        cohortesPersonalizadas: Array.isArray(cohortesData) ? cohortesData : [],
        estadisticasUso: Array.isArray(estadisticasData) ? estadisticasData : [],
        metadatos: metadatosData || {}
      };
      
      console.log('✅ Datos finales establecidos:', dataFinal);
      setData(dataFinal);
      
    } catch (error) {
      console.error('❌ Error al cargar datos:', error);
      setData({
        escalasNormativas: [],
        cohortesPersonalizadas: [],
        estadisticasUso: [],
        metadatos: {}
      });
    } finally {
      setLoading(false);
    }
  };

  const exportarDatos = (tipo) => {
    let datos = [];
    let nombre = '';
    
    switch (tipo) {
      case 'escalas-normativas':
        datos = filtrarYOrdenarEscalas();
        nombre = 'escalas_normativas';
        break;
      case 'cohortes':
        datos = filtrarYOrdenarCohortes();
        nombre = 'cohortes_personalizadas';
        break;
      case 'estadisticas':
        datos = filtrarYOrdenarEstadisticas();
        nombre = 'estadisticas_uso';
        break;
      default:
        return;
    }
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(datos, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${nombre}_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  // Función para ordenar datos
  const ordenarDatos = (datos, campo, direccion) => {
    return [...datos].sort((a, b) => {
      let valorA = a[campo];
      let valorB = b[campo];
      
      // Manejar valores nulos o undefined
      if (valorA == null) valorA = '';
      if (valorB == null) valorB = '';
      
      // Convertir a string para comparación si es necesario
      if (typeof valorA === 'string') valorA = valorA.toLowerCase();
      if (typeof valorB === 'string') valorB = valorB.toLowerCase();
      
      if (valorA < valorB) return direccion === 'asc' ? -1 : 1;
      if (valorA > valorB) return direccion === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // Función para manejar click en header de tabla
  const manejarOrdenacion = (campo) => {
    const nuevaDireccion = 
      ordenacion.campo === campo && ordenacion.direccion === 'asc' ? 'desc' : 'asc';
    
    setOrdenacion({ campo, direccion: nuevaDireccion });
  };

  // Funciones de filtrado y ordenación específicas
  const filtrarYOrdenarEscalas = () => {
    let escalas = [...data.escalasNormativas];
    
    // Aplicar filtros
    if (filtros.escalas.fuente) {
      escalas = escalas.filter(e => 
        e.fuente_normativa_nombre?.toLowerCase().includes(filtros.escalas.fuente.toLowerCase())
      );
    }
    
    if (filtros.escalas.dominio) {
      escalas = escalas.filter(e => 
        e.dominio_nombre?.toLowerCase().includes(filtros.escalas.dominio.toLowerCase())
      );
    }
    
    if (filtros.escalas.busqueda) {
      escalas = escalas.filter(e => 
        e.nombre?.toLowerCase().includes(filtros.escalas.busqueda.toLowerCase()) ||
        e.descripcion?.toLowerCase().includes(filtros.escalas.busqueda.toLowerCase())
      );
    }
    
    // Aplicar ordenación
    if (ordenacion.campo) {
      escalas = ordenarDatos(escalas, ordenacion.campo, ordenacion.direccion);
    }
    
    return escalas;
  };

  const filtrarYOrdenarCohortes = () => {
    let cohortes = [...data.cohortesPersonalizadas];
    
    // Aplicar filtros
    if (filtros.cohortes.usuario) {
      cohortes = cohortes.filter(c => 
        c.usuario_nombre?.toLowerCase().includes(filtros.cohortes.usuario.toLowerCase())
      );
    }
    
    if (filtros.cohortes.busqueda) {
      cohortes = cohortes.filter(c => 
        c.nombre?.toLowerCase().includes(filtros.cohortes.busqueda.toLowerCase()) ||
        c.descripcion?.toLowerCase().includes(filtros.cohortes.busqueda.toLowerCase())
      );
    }
    
    // Aplicar ordenación
    if (ordenacion.campo) {
      cohortes = ordenarDatos(cohortes, ordenacion.campo, ordenacion.direccion);
    }
    
    return cohortes;
  };

  const filtrarYOrdenarEstadisticas = () => {
    let estadisticas = [...data.estadisticasUso];
    
    // Aplicar filtros
    if (filtros.estadisticas.rol) {
      estadisticas = estadisticas.filter(e => e.rol === filtros.estadisticas.rol);
    }
    
    if (filtros.estadisticas.activo !== '') {
      estadisticas = estadisticas.filter(e => 
        e.activo === (filtros.estadisticas.activo === 'true')
      );
    }
    
    if (filtros.estadisticas.busqueda) {
      estadisticas = estadisticas.filter(e => 
        e.usuario_nombre?.toLowerCase().includes(filtros.estadisticas.busqueda.toLowerCase())
      );
    }
    
    // Aplicar ordenación
    if (ordenacion.campo) {
      estadisticas = ordenarDatos(estadisticas, ordenacion.campo, ordenacion.direccion);
    }
    
    return estadisticas;
  };

  const renderEscalasNormativas = () => (
    <div className="seccion-datos">
      <div className="section-header">
        <h3>📊 Escalas Normativas del Sistema</h3>
        <button 
          className="btn-exportar"
          onClick={() => exportarDatos('escalas-normativas')}
        >
          📥 Exportar JSON
        </button>
      </div>

      {/* Subtabs para escalas normativas */}
      <div className="subtabs-container">
        <div className="subtabs">
          <button 
            className={activeSubTab === 'resumen' ? 'active' : ''}
            onClick={() => setActiveSubTab('resumen')}
          >
            📊 Resumen y Distribución
          </button>
          <button 
            className={activeSubTab === 'tabla' ? 'active' : ''}
            onClick={() => setActiveSubTab('tabla')}
          >
            📋 Tabla Completa
          </button>
        </div>
      </div>

      {/* Contenido según subtab activa */}
      {activeSubTab === 'resumen' && (
        <div className="resumen-y-distribucion">
          {/* Tarjetas de resumen */}
          <div className="resumen-cards">
            <div className="card-resumen">
              <h4>Total de Hitos</h4>
              <div className="numero-grande">{data.escalasNormativas.length}</div>
              <div className="numero-detalle">
                ({new Set(data.escalasNormativas.map(e => e.nombre)).size} únicos)
              </div>
            </div>
            <div className="card-resumen">
              <h4>Escalas Diferentes</h4>
              <div className="numero-grande">
                {new Set(data.escalasNormativas.map(e => e.fuente_normativa_nombre)).size}
              </div>
            </div>
            <div className="card-resumen">
              <h4>Dominios Cubiertos</h4>
              <div className="numero-grande">
                {new Set(data.escalasNormativas.map(e => e.dominio_nombre)).size}
              </div>
            </div>
            <div className="card-resumen">
              <h4>Hitos Únicos por Dominio</h4>
              <div className="numero-grande">
                {(() => {
                  const hitosPorDominio = {};
                  data.escalasNormativas.forEach(e => {
                    if (!hitosPorDominio[e.dominio_nombre]) {
                      hitosPorDominio[e.dominio_nombre] = new Set();
                    }
                    hitosPorDominio[e.dominio_nombre].add(e.nombre);
                  });
                  return Object.values(hitosPorDominio).reduce((total, set) => total + set.size, 0);
                })()}
              </div>
              <div className="numero-detalle">
                (sin duplicados entre dominios)
              </div>
            </div>
          </div>

          {/* Gráficos de distribución */}
          <div className="graficas-uso">
            <div className="analisis-card">
              <h4>Distribución por Fuentes Normativas</h4>
              <div className="distribucion-lista">
                {(() => {
                  const distribucionFuentes = {};
                  data.escalasNormativas.forEach(e => {
                    const fuente = e.fuente_normativa_nombre;
                    distribucionFuentes[fuente] = (distribucionFuentes[fuente] || 0) + 1;
                  });
                  
                  return Object.entries(distribucionFuentes)
                    .sort((a, b) => b[1] - a[1])
                    .map(([fuente, count]) => (
                      <div key={fuente} className="distribucion-item">
                        <span className="fuente-nombre">{fuente}</span>
                        <span className="fuente-count">
                          {count} ({((count / data.escalasNormativas.length) * 100).toFixed(1)}%)
                        </span>
                      </div>
                    ));
                })()}
              </div>
            </div>

            <div className="analisis-card">
              <h4>Distribución por Dominios</h4>
              <div className="distribucion-lista">
                {(() => {
                  const distribucionDominios = {};
                  data.escalasNormativas.forEach(e => {
                    const dominio = e.dominio_nombre;
                    distribucionDominios[dominio] = (distribucionDominios[dominio] || 0) + 1;
                  });
                  
                  return Object.entries(distribucionDominios)
                    .sort((a, b) => b[1] - a[1])
                    .map(([dominio, count]) => (
                      <div key={dominio} className="distribucion-item">
                        <span className="dominio-nombre">{dominio}</span>
                        <span className="dominio-count">
                          {count} ({((count / data.escalasNormativas.length) * 100).toFixed(1)}%)
                        </span>
                      </div>
                    ));
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'tabla' && (
        <>
          {/* Controles de filtrado */}
          <div className="filtros-tabla">
            <div className="filtro-grupo">
              <label>Fuente:</label>
              <select 
                value={filtros.escalas.fuente} 
                onChange={(e) => setFiltros(prev => ({
                  ...prev, 
                  escalas: { ...prev.escalas, fuente: e.target.value }
                }))}
              >
                <option value="">Todas las fuentes</option>
                {[...new Set(data.escalasNormativas.map(e => e.fuente_normativa_nombre))].map(fuente => (
                  <option key={fuente} value={fuente}>{fuente}</option>
                ))}
              </select>
            </div>
            <div className="filtro-grupo">
              <label>Dominio:</label>
              <select 
                value={filtros.escalas.dominio} 
                onChange={(e) => setFiltros(prev => ({
                  ...prev, 
                  escalas: { ...prev.escalas, dominio: e.target.value }
                }))}
              >
                <option value="">Todos los dominios</option>
                {[...new Set(data.escalasNormativas.map(e => e.dominio_nombre))].map(dominio => (
                  <option key={dominio} value={dominio}>{dominio}</option>
                ))}
              </select>
            </div>
            <div className="filtro-grupo">
              <label>Buscar:</label>
              <input 
                type="text" 
                placeholder="Nombre o descripción del hito..."
                value={filtros.escalas.busqueda}
                onChange={(e) => setFiltros(prev => ({
                  ...prev, 
                  escalas: { ...prev.escalas, busqueda: e.target.value }
                }))}
              />
            </div>
            <div className="filtro-grupo">
              <label>Vista:</label>
              <select 
                value={filtros.escalas.vista || 'todos'} 
                onChange={(e) => setFiltros(prev => ({
                  ...prev, 
                  escalas: { ...prev.escalas, vista: e.target.value }
                }))}
              >
                <option value="todos">Todos los registros</option>
                <option value="agrupados">Solo hitos agrupados</option>
              </select>
            </div>
          </div>

          <p className="tabla-descripcion">
            💡 <strong>Hitos duplicados</strong>: Haga clic en las filas marcadas como "duplicado" para ver datos de todas las fuentes.
          </p>

          <div className="tabla-container">
            {(() => {
              // Agrupar hitos si es necesario
              const escalasParaMostrar = filtrarYOrdenarEscalas();
              
              if (filtros.escalas.vista === 'agrupados') {
                // Mostrar solo hitos agrupados
                const hitosRepetidos = {};
                escalasParaMostrar.forEach(e => {
                  if (!hitosRepetidos[e.nombre]) {
                    hitosRepetidos[e.nombre] = [];
                  }
                  hitosRepetidos[e.nombre].push(e);
                });
                
                const hitosDuplicados = Object.entries(hitosRepetidos)
                  .filter(([nombre, registros]) => registros.length > 1)
                  .sort((a, b) => b[1].length - a[1].length);

                return (
                  <div className="tabla-agrupada">
                    {hitosDuplicados.map(([nombre, registros]) => (
                      <div key={nombre} className="grupo-hito">
                        <div 
                          className="hito-header-tabla" 
                          onClick={() => toggleHitoExpansion(nombre)}
                        >
                          <span className="hito-nombre-grupo">{nombre}</span>
                          <span className="hito-stats-grupo">
                            {registros.length} registros - {[...new Set(registros.map(r => r.fuente_normativa_nombre))].length} fuentes
                          </span>
                          <span className="expand-icon">
                            {hitosExpandidos[nombre] ? '▼' : '▶'}
                          </span>
                        </div>
                        
                        {hitosExpandidos[nombre] && (
                          <div className="tabla-expandida">
                            <table className="datos-tabla-incrustada">
                              <thead>
                                <tr>
                                  <th>ID</th>
                                  <th>Fuente</th>
                                  <th>Dominio</th>
                                  <th>Edad Media (meses)</th>
                                  <th>Desv. Est.</th>
                                  <th>P25</th>
                                  <th>P50</th>
                                  <th>P75</th>
                                </tr>
                              </thead>
                              <tbody>
                                {registros.map(registro => (
                                  <tr key={registro.id}>
                                    <td>{registro.id}</td>
                                    <td>{registro.fuente_normativa_nombre}</td>
                                    <td>{registro.dominio_nombre}</td>
                                    <td>{registro.edad_media_meses}</td>
                                    <td>{registro.desviacion_estandar}</td>
                                    <td>{registro.percentil_25}</td>
                                    <td>{registro.percentil_50}</td>
                                    <td>{registro.percentil_75}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              } else {
                // Vista normal con opción de expandir duplicados
                const hitosRepetidos = {};
                data.escalasNormativas.forEach(e => {
                  if (!hitosRepetidos[e.nombre]) {
                    hitosRepetidos[e.nombre] = [];
                  }
                  hitosRepetidos[e.nombre].push(e);
                });

                return (
                  <>
                    <table className="datos-tabla">
                      <thead>
                        <tr>
                          <th onClick={() => manejarOrdenacion('id')} className="sortable">
                            ID {ordenacion.campo === 'id' && (ordenacion.direccion === 'asc' ? '↑' : '↓')}
                          </th>
                          <th onClick={() => manejarOrdenacion('nombre')} className="sortable">
                            Hito {ordenacion.campo === 'nombre' && (ordenacion.direccion === 'asc' ? '↑' : '↓')}
                          </th>
                          <th onClick={() => manejarOrdenacion('fuente_normativa_nombre')} className="sortable">
                            Fuente {ordenacion.campo === 'fuente_normativa_nombre' && (ordenacion.direccion === 'asc' ? '↑' : '↓')}
                          </th>
                          <th>Repeticiones</th>
                          <th onClick={() => manejarOrdenacion('dominio_nombre')} className="sortable">
                            Dominio {ordenacion.campo === 'dominio_nombre' && (ordenacion.direccion === 'asc' ? '↑' : '↓')}
                          </th>
                          <th onClick={() => manejarOrdenacion('edad_media_meses')} className="sortable">
                            Edad Media (meses) {ordenacion.campo === 'edad_media_meses' && (ordenacion.direccion === 'asc' ? '↑' : '↓')}
                          </th>
                          <th onClick={() => manejarOrdenacion('desviacion_estandar')} className="sortable">
                            Desviación Est. {ordenacion.campo === 'desviacion_estandar' && (ordenacion.direccion === 'asc' ? '↑' : '↓')}
                          </th>
                          <th>P25</th>
                          <th>P50</th>
                          <th>P75</th>
                        </tr>
                      </thead>
                      <tbody>
                        {escalasParaMostrar.slice(0, 100).map(escala => {
                          // Calcular repeticiones de este hito
                          const repeticiones = hitosRepetidos[escala.nombre] || [];
                          const fuentesRepetidas = [...new Set(repeticiones.map(r => r.fuente_normativa_nombre))];
                          const esDuplicado = repeticiones.length > 1;
                          
                          return (
                            <Fragment key={escala.id}>
                              <tr 
                                className={esDuplicado ? 'fila-duplicada' : ''}
                                onClick={() => esDuplicado && toggleHitoExpansion(escala.nombre)}
                                style={esDuplicado ? { cursor: 'pointer' } : {}}
                              >
                                <td>{escala.id}</td>
                                <td className="descripcion-cell" title={escala.descripcion}>
                                  {escala.nombre}
                                  {esDuplicado && (
                                    <span className="expand-indicator">
                                      {hitosExpandidos[escala.nombre] ? ' ▼' : ' ▶'}
                                    </span>
                                  )}
                                </td>
                                <td>{escala.fuente_normativa_nombre}</td>
                                <td>
                                  <span className={`repeticion-badge ${esDuplicado ? 'duplicado' : 'unico'}`}>
                                    {esDuplicado ? `${repeticiones.length} escalas` : 'Único'}
                                  </span>
                                  {esDuplicado && (
                                    <div className="fuentes-tooltip" title={fuentesRepetidas.join(', ')}>
                                      ({fuentesRepetidas.length} fuentes)
                                    </div>
                                  )}
                                </td>
                                <td>{escala.dominio_nombre}</td>
                                <td>{escala.edad_media_meses}</td>
                                <td>{escala.desviacion_estandar}</td>
                                <td>{escala.percentil_25}</td>
                                <td>{escala.percentil_50}</td>
                                <td>{escala.percentil_75}</td>
                              </tr>
                              
                              {/* Tabla anidada expandida */}
                              {esDuplicado && hitosExpandidos[escala.nombre] && (
                                <tr className="fila-expandida">
                                  <td colSpan="10">
                                    <div className="tabla-anidada-container">
                                      <h5>Comparación entre fuentes para: "{escala.nombre}"</h5>
                                      <table className="tabla-anidada">
                                        <thead>
                                          <tr>
                                            <th>ID</th>
                                            <th>Fuente</th>
                                            <th>Dominio</th>
                                            <th>Edad Media</th>
                                            <th>Desv. Est.</th>
                                            <th>P25</th>
                                            <th>P50</th>
                                            <th>P75</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {repeticiones.map(registro => (
                                            <tr key={registro.id}>
                                              <td>{registro.id}</td>
                                              <td>{registro.fuente_normativa_nombre}</td>
                                              <td>{registro.dominio_nombre}</td>
                                              <td>{registro.edad_media_meses} meses</td>
                                              <td>{registro.desviacion_estandar}</td>
                                              <td>{registro.percentil_25}</td>
                                              <td>{registro.percentil_50}</td>
                                              <td>{registro.percentil_75}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                    <p className="tabla-nota">
                      Mostrando {Math.min(escalasParaMostrar.length, 100)} de {escalasParaMostrar.length} registros filtrados 
                      (Total: {data.escalasNormativas.length})
                    </p>
                  </>
                );
              }
            })()}
          </div>
        </>
      )}
    </div>
  );

  const renderCohortesPersonalizadas = () => (
    <div className="datos-section">
      <div className="section-header">
        <h3>👥 Cohortes Personalizadas</h3>
        <button 
          className="btn-export"
          onClick={() => exportarDatos('cohortes')}
        >
          📥 Exportar JSON
        </button>
      </div>
      
      <div className="resumen-cards">
        <div className="card-resumen">
          <h4>Total Cohortes</h4>
          <div className="numero-grande">{data.cohortesPersonalizadas.length}</div>
        </div>
        <div className="card-resumen">
          <h4>Usuarios Contribuyentes</h4>
          <div className="numero-grande">
            {new Set(data.cohortesPersonalizadas.map(c => c.usuario_id)).size}
          </div>
        </div>
        <div className="card-resumen">
          <h4>Niños Incluidos</h4>
          <div className="numero-grande">
            {data.cohortesPersonalizadas.reduce((total, c) => total + (c.total_ninos || 0), 0)}
          </div>
        </div>
        <div className="card-resumen">
          <h4>Evaluaciones Totales</h4>
          <div className="numero-grande">
            {data.cohortesPersonalizadas.reduce((total, c) => total + (c.total_evaluaciones || 0), 0)}
          </div>
        </div>
      </div>

      {/* Controles de filtrado para cohortes */}
      <div className="filtros-tabla">
        <div className="filtro-grupo">
          <label>Usuario:</label>
          <select 
            value={filtros.cohortes.usuario} 
            onChange={(e) => setFiltros(prev => ({
              ...prev, 
              cohortes: { ...prev.cohortes, usuario: e.target.value }
            }))}
          >
            <option value="">Todos los usuarios</option>
            {[...new Set(data.cohortesPersonalizadas.map(c => c.usuario_nombre))].map(usuario => (
              <option key={usuario} value={usuario}>{usuario}</option>
            ))}
          </select>
        </div>
        <div className="filtro-grupo">
          <label>Buscar:</label>
          <input 
            type="text" 
            placeholder="Nombre o descripción..."
            value={filtros.cohortes.busqueda}
            onChange={(e) => setFiltros(prev => ({
              ...prev, 
              cohortes: { ...prev.cohortes, busqueda: e.target.value }
            }))}
          />
        </div>
      </div>

      <div className="tabla-container">
        <table className="datos-tabla">
          <thead>
            <tr>
              <th onClick={() => manejarOrdenacion('id')} className="sortable">
                ID {ordenacion.campo === 'id' && (ordenacion.direccion === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => manejarOrdenacion('usuario_nombre')} className="sortable">
                Usuario {ordenacion.campo === 'usuario_nombre' && (ordenacion.direccion === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => manejarOrdenacion('nombre')} className="sortable">
                Nombre Cohorte {ordenacion.campo === 'nombre' && (ordenacion.direccion === 'asc' ? '↑' : '↓')}
              </th>
              <th>Descripción</th>
              <th onClick={() => manejarOrdenacion('total_ninos')} className="sortable">
                Niños {ordenacion.campo === 'total_ninos' && (ordenacion.direccion === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => manejarOrdenacion('total_evaluaciones')} className="sortable">
                Evaluaciones {ordenacion.campo === 'total_evaluaciones' && (ordenacion.direccion === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => manejarOrdenacion('fecha_creacion')} className="sortable">
                Fecha Creación {ordenacion.campo === 'fecha_creacion' && (ordenacion.direccion === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => manejarOrdenacion('fecha_actualizacion')} className="sortable">
                Última Actualización {ordenacion.campo === 'fecha_actualizacion' && (ordenacion.direccion === 'asc' ? '↑' : '↓')}
              </th>
            </tr>
          </thead>
          <tbody>
            {filtrarYOrdenarCohortes().map(cohorte => (
              <tr key={cohorte.id}>
                <td>{cohorte.id}</td>
                <td>{cohorte.usuario_nombre}</td>
                <td>{cohorte.nombre}</td>
                <td className="descripcion-cell" title={cohorte.descripcion}>
                  {cohorte.descripcion}
                </td>
                <td>{cohorte.total_ninos || 0}</td>
                <td>{cohorte.total_evaluaciones || 0}</td>
                <td>{new Date(cohorte.fecha_creacion).toLocaleDateString()}</td>
                <td>{new Date(cohorte.fecha_actualizacion).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="tabla-nota">
          Mostrando {filtrarYOrdenarCohortes().length} de {data.cohortesPersonalizadas.length} registros
        </p>
      </div>
    </div>
  );

  const renderEstadisticasUso = () => (
    <div className="datos-section">
      <div className="section-header">
        <h3>📈 Estadísticas de Uso</h3>
        <button 
          className="btn-export"
          onClick={() => exportarDatos('estadisticas')}
        >
          📥 Exportar JSON
        </button>
      </div>
      
      <div className="resumen-cards">
        <div className="card-resumen">
          <h4>Usuarios Totales</h4>
          <div className="numero-grande">{data.metadatos.total_usuarios || 0}</div>
        </div>
        <div className="card-resumen">
          <h4>Usuarios Activos (30d)</h4>
          <div className="numero-grande">{data.metadatos.usuarios_activos_30d || 0}</div>
        </div>
        <div className="card-resumen">
          <h4>Evaluaciones Realizadas</h4>
          <div className="numero-grande">{data.metadatos.total_evaluaciones || 0}</div>
        </div>
        <div className="card-resumen">
          <h4>Gráficas Generadas</h4>
          <div className="numero-grande">{data.metadatos.total_graficas || 0}</div>
        </div>
        <div className="card-resumen">
          <h4>Escalas Normativas</h4>
          <div className="numero-grande">{data.metadatos.total_escalas_normativas || 0}</div>
        </div>
        <div className="card-resumen">
          <h4>Fuentes Normativas</h4>
          <div className="numero-grande">{data.metadatos.total_fuentes_normativas || 0}</div>
        </div>
      </div>

      <div className="graficas-uso">
        <div className="grafica-card">
          <h4>Actividad por Usuario</h4>
          <div className="tabla-container">
            {/* Controles de filtrado para estadísticas */}
            <div className="filtros-tabla">
              <div className="filtro-grupo">
                <label>Rol:</label>
                <select 
                  value={filtros.estadisticas.rol} 
                  onChange={(e) => setFiltros(prev => ({
                    ...prev, 
                    estadisticas: { ...prev.estadisticas, rol: e.target.value }
                  }))}
                >
                  <option value="">Todos los roles</option>
                  <option value="admin">Administrador</option>
                  <option value="usuario">Usuario</option>
                </select>
              </div>
              <div className="filtro-grupo">
                <label>Estado:</label>
                <select 
                  value={filtros.estadisticas.activo} 
                  onChange={(e) => setFiltros(prev => ({
                    ...prev, 
                    estadisticas: { ...prev.estadisticas, activo: e.target.value }
                  }))}
                >
                  <option value="">Todos</option>
                  <option value="true">Activos</option>
                  <option value="false">Inactivos</option>
                </select>
              </div>
              <div className="filtro-grupo">
                <label>Buscar usuario:</label>
                <input 
                  type="text" 
                  placeholder="Nombre de usuario..."
                  value={filtros.estadisticas.busqueda}
                  onChange={(e) => setFiltros(prev => ({
                    ...prev, 
                    estadisticas: { ...prev.estadisticas, busqueda: e.target.value }
                  }))}
                />
              </div>
            </div>

            <table className="datos-tabla">
              <thead>
                <tr>
                  <th onClick={() => manejarOrdenacion('usuario_nombre')} className="sortable">
                    Usuario {ordenacion.campo === 'usuario_nombre' && (ordenacion.direccion === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => manejarOrdenacion('rol')} className="sortable">
                    Rol {ordenacion.campo === 'rol' && (ordenacion.direccion === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => manejarOrdenacion('activo')} className="sortable">
                    Estado {ordenacion.campo === 'activo' && (ordenacion.direccion === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => manejarOrdenacion('ninos_registrados')} className="sortable">
                    Niños {ordenacion.campo === 'ninos_registrados' && (ordenacion.direccion === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => manejarOrdenacion('evaluaciones_realizadas')} className="sortable">
                    Evaluaciones {ordenacion.campo === 'evaluaciones_realizadas' && (ordenacion.direccion === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => manejarOrdenacion('red_flags_observadas')} className="sortable">
                    Red Flags {ordenacion.campo === 'red_flags_observadas' && (ordenacion.direccion === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => manejarOrdenacion('escalas_aplicadas')} className="sortable">
                    Escalas {ordenacion.campo === 'escalas_aplicadas' && (ordenacion.direccion === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => manejarOrdenacion('ultimo_acceso')} className="sortable">
                    Último Acceso {ordenacion.campo === 'ultimo_acceso' && (ordenacion.direccion === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => manejarOrdenacion('tiempo_total_minutos')} className="sortable">
                    Tiempo Est. (min) {ordenacion.campo === 'tiempo_total_minutos' && (ordenacion.direccion === 'asc' ? '↑' : '↓')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtrarYOrdenarEstadisticas().slice(0, 50).map(stat => (
                  <tr key={stat.usuario_id}>
                    <td>{stat.usuario_nombre}</td>
                    <td>
                      <span className={`rol-badge ${stat.rol}`}>
                        {stat.rol === 'admin' ? 'Admin' : 'Usuario'}
                      </span>
                    </td>
                    <td>
                      <span className={`estado-badge ${stat.activo ? 'activo' : 'inactivo'}`}>
                        {stat.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>{stat.ninos_registrados}</td>
                    <td>{stat.evaluaciones_realizadas}</td>
                    <td>{stat.red_flags_observadas || 0}</td>
                    <td>{stat.escalas_aplicadas || 0}</td>
                    <td>{stat.ultimo_acceso ? new Date(stat.ultimo_acceso).toLocaleDateString() : 'Nunca'}</td>
                    <td>{Math.round(stat.tiempo_total_minutos || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="tabla-nota">
              Mostrando {Math.min(filtrarYOrdenarEstadisticas().length, 50)} de {filtrarYOrdenarEstadisticas().length} registros filtrados 
              (Total: {data.estadisticasUso.length})
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalisisAvanzado = () => (
    <div className="datos-section">
      <div className="section-header">
        <h3>🔬 Análisis Avanzado</h3>
      </div>
      
      <div className="analisis-grid">




        <div className="analisis-card full-width">
          <h4>Calidad de Datos y Métricas del Sistema</h4>
          <div className="calidad-metricas">
            <div className="metrica">
              <span className="metrica-label">Total registros de hitos:</span>
              <span className="metrica-valor">{data.escalasNormativas.length}</span>
            </div>
            <div className="metrica">
              <span className="metrica-label">Hitos únicos (por nombre):</span>
              <span className="metrica-valor">
                {new Set(data.escalasNormativas.map(e => e.nombre)).size}
              </span>
            </div>
            <div className="metrica">
              <span className="metrica-label">Tasa de duplicación:</span>
              <span className="metrica-valor">
                {data.escalasNormativas.length > 0 ? 
                  `${(((data.escalasNormativas.length - new Set(data.escalasNormativas.map(e => e.nombre)).size) / data.escalasNormativas.length) * 100).toFixed(1)}%`
                  : '0%'
                }
              </span>
            </div>
            <div className="metrica">
              <span className="metrica-label">Escalas con datos completos:</span>
              <span className="metrica-valor">
                {data.escalasNormativas.filter(e => 
                  e.edad_media_meses && e.desviacion_estandar && e.percentil_25 && e.percentil_50 && e.percentil_75
                ).length} / {data.escalasNormativas.length}
              </span>
            </div>
            <div className="metrica">
              <span className="metrica-label">Rango de edades cubierto:</span>
              <span className="metrica-valor">
                {data.escalasNormativas.length > 0 ? 
                  `${Math.min(...data.escalasNormativas.map(e => e.edad_media_meses || 999))} - ${Math.max(...data.escalasNormativas.map(e => e.edad_media_meses || 0))} meses`
                  : 'No hay datos'
                }
              </span>
            </div>
            <div className="metrica">
              <span className="metrica-label">Promedio niños por usuario:</span>
              <span className="metrica-valor">
                {data.metadatos.promedio_ninos_por_usuario || 0}
              </span>
            </div>
            <div className="metrica">
              <span className="metrica-label">Promedio evaluaciones por niño:</span>
              <span className="metrica-valor">
                {data.metadatos.promedio_evaluaciones_por_nino || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="biblioteca-datos loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Cargando datos del sistema...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="biblioteca-datos">
      <div className="header-section">
        <div>
          <h2>🗄️ Biblioteca de Datos</h2>
          <p>Visualización y análisis de todas las bases de datos del sistema - Actualización automática cada 30s</p>
        </div>
        <button 
          className="btn-refresh"
          onClick={() => {
            console.log('🔄 Actualizando datos manualmente...');
            cargarDatos();
          }}
          disabled={loading}
        >
          {loading ? '🔄 Cargando...' : '🔄 Actualizar Datos'}
        </button>
      </div>

      <div className="tabs-container">
        <div className="tabs-nav">
          <button 
            className={activeTab === 'escalas-normativas' ? 'tab-active' : ''}
            onClick={() => setActiveTab('escalas-normativas')}
          >
            📊 Escalas Normativas
          </button>
          <button 
            className={activeTab === 'cohortes-personalizadas' ? 'tab-active' : ''}
            onClick={() => setActiveTab('cohortes-personalizadas')}
          >
            👥 Cohortes Personalizadas
          </button>
          <button 
            className={activeTab === 'estadisticas-uso' ? 'tab-active' : ''}
            onClick={() => setActiveTab('estadisticas-uso')}
          >
            📈 Estadísticas de Uso
          </button>
          <button 
            className={activeTab === 'analisis-avanzado' ? 'tab-active' : ''}
            onClick={() => setActiveTab('analisis-avanzado')}
          >
            🔬 Análisis Avanzado
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'escalas-normativas' && renderEscalasNormativas()}
          {activeTab === 'cohortes-personalizadas' && renderCohortesPersonalizadas()}
          {activeTab === 'estadisticas-uso' && renderEstadisticasUso()}
          {activeTab === 'analisis-avanzado' && renderAnalisisAvanzado()}
        </div>
      </div>
    </div>
  );
};

export default BibliotecaDatos;