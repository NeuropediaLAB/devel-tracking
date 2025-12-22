import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';
import { fetchConAuth } from '../utils/authService';
import VideoModal from './VideoModal';
import './ScreeningEnfermeria.css';

export default function ScreeningEnfermeria({ ninoId, nino, onActualizarNino, vistaInicial = 'evaluacion' }) {
  const [edadMeses, setEdadMeses] = useState('');
  const [dscoreCalculado, setDscoreCalculado] = useState(null);
  const [itemsEvaluacion, setItemsEvaluacion] = useState([]);
  const [itemsEstado, setItemsEstado] = useState({}); // { itemId: 'superado' | 'no_superado' | null }
  const [cargando, setCargando] = useState(false);
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [error, setError] = useState('');
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [videoSeleccionado, setVideoSeleccionado] = useState(null);
  const [videosAsociados, setVideosAsociados] = useState({});

  // Items del D-Score adaptados para screening rápido de enfermería
  const itemsDScore = [
    // 0-6 meses
    { id: 'gm001', descripcion: 'Sostiene la cabeza estando boca abajo', edadMin: 0, edadMax: 6, dominio: 'motor_grueso' },
    { id: 'gm002', descripcion: 'Se mantiene sentado con apoyo', edadMin: 3, edadMax: 8, dominio: 'motor_grueso' },
    { id: 'fm001', descripcion: 'Agarra objetos pequeños', edadMin: 4, edadMax: 10, dominio: 'motor_fino' },
    { id: 'lg001', descripcion: 'Sonríe socialmente', edadMin: 1, edadMax: 4, dominio: 'lenguaje' },
    { id: 'lg002', descripcion: 'Balbucea', edadMin: 4, edadMax: 8, dominio: 'lenguaje' },
    { id: 'se001', descripcion: 'Responde a su nombre', edadMin: 6, edadMax: 12, dominio: 'social_emocional' },
    
    // 6-12 meses
    { id: 'gm003', descripcion: 'Se sienta sin apoyo', edadMin: 6, edadMax: 10, dominio: 'motor_grueso' },
    { id: 'gm004', descripcion: 'Gatea', edadMin: 7, edadMax: 12, dominio: 'motor_grueso' },
    { id: 'fm002', descripcion: 'Usa pinza para agarrar', edadMin: 8, edadMax: 12, dominio: 'motor_fino' },
    { id: 'lg003', descripcion: 'Dice "mamá" o "papá" con significado', edadMin: 8, edadMax: 14, dominio: 'lenguaje' },
    { id: 'se002', descripcion: 'Juega a las escondidas', edadMin: 8, edadMax: 14, dominio: 'social_emocional' },
    
    // 12-18 meses
    { id: 'gm005', descripcion: 'Camina solo', edadMin: 10, edadMax: 18, dominio: 'motor_grueso' },
    { id: 'fm003', descripcion: 'Apila 2-3 bloques', edadMin: 12, edadMax: 20, dominio: 'motor_fino' },
    { id: 'lg004', descripcion: 'Dice al menos 3 palabras', edadMin: 12, edadMax: 18, dominio: 'lenguaje' },
    { id: 'se003', descripcion: 'Señala para pedir', edadMin: 12, edadMax: 18, dominio: 'social_emocional' },
    
    // 18-24 meses
    { id: 'gm006', descripcion: 'Sube escaleras', edadMin: 15, edadMax: 24, dominio: 'motor_grueso' },
    { id: 'fm004', descripcion: 'Garabatea', edadMin: 15, edadMax: 24, dominio: 'motor_fino' },
    { id: 'lg005', descripcion: 'Combina 2 palabras', edadMin: 18, edadMax: 30, dominio: 'lenguaje' },
    { id: 'se004', descripcion: 'Juego simbólico simple', edadMin: 18, edadMax: 30, dominio: 'social_emocional' },
    
    // 24-36 meses
    { id: 'gm007', descripcion: 'Corre bien', edadMin: 18, edadMax: 30, dominio: 'motor_grueso' },
    { id: 'gm008', descripcion: 'Salta con ambos pies', edadMin: 24, edadMax: 36, dominio: 'motor_grueso' },
    { id: 'fm005', descripcion: 'Apila 6+ bloques', edadMin: 20, edadMax: 30, dominio: 'motor_fino' },
    { id: 'lg006', descripcion: 'Usa frases de 3 palabras', edadMin: 24, edadMax: 36, dominio: 'lenguaje' },
    { id: 'se005', descripcion: 'Juega con otros niños', edadMin: 24, edadMax: 42, dominio: 'social_emocional' }
  ];

  useEffect(() => {
    if (nino) {
      calcularEdadMeses();
      cargarEvaluacionesAnteriores();
      cargarVideosAsociados();
    }
  }, [nino]);

  const cargarVideosAsociados = async () => {
    try {
      // Mapeo de descripciones del screening a palabras clave para buscar videos
      const mapeoDescripciones = {
        'gm001': 'cabeza boca abajo',
        'gm002': 'sentado con apoyo',
        'fm001': 'agarra objetos',
        'lg001': 'sonríe',
        'lg002': 'balbucea',
        'se001': 'responde nombre',
        'gm003': 'sienta sin apoyo',
        'gm004': 'gatea',
        'fm002': 'pinza',
        'lg003': 'mamá papá',
        'se002': 'escondidas',
        'gm005': 'camina solo',
        'fm003': 'apila bloques',
        'lg004': 'palabras',
        'se003': 'señala',
        'gm006': 'sube escaleras',
        'fm004': 'garabatea',
        'lg005': 'combina palabras',
        'se004': 'juego simbólico',
        'gm007': 'corre',
        'gm008': 'salta',
        'fm005': 'apila bloques',
        'lg006': 'frases',
        'se005': 'juega con otros'
      };

      const response = await fetchConAuth(`${API_URL}/videos`);
      if (response.ok) {
        const todosVideos = await response.json();
        const asociaciones = {};
        
        // Asociar videos a items del screening por similitud de descripción
        itemsDScore.forEach(item => {
          const palabrasClave = mapeoDescripciones[item.id];
          if (palabrasClave) {
            const videosRelacionados = todosVideos.filter(video => {
              const tituloLower = video.titulo.toLowerCase();
              const descripcionLower = video.descripcion?.toLowerCase() || '';
              return palabrasClave.split(' ').some(palabra => 
                tituloLower.includes(palabra) || descripcionLower.includes(palabra)
              );
            });
            if (videosRelacionados.length > 0) {
              asociaciones[item.id] = videosRelacionados;
            }
          }
        });
        
        setVideosAsociados(asociaciones);
      }
    } catch (error) {
      console.error('Error cargando videos:', error);
    }
  };

  const abrirVideo = (video) => {
    setVideoSeleccionado(video);
    setVideoModalOpen(true);
  };

  const cerrarVideo = () => {
    setVideoModalOpen(false);
    setVideoSeleccionado(null);
  };

  const getVideoThumbnail = (url) => {
    if (!url) return null;
    
    let videoId = null;
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1]?.split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    }
    
    return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;
  };

  const handleThumbnailError = (e, videoId, styles) => {
    if (videoId) {
      e.target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    } else {
      e.target.style.display = 'none';
      e.target.parentElement.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: ${styles.backgroundColor}">
          <i class="fas fa-play-circle" style="font-size: 2em; color: ${styles.color}"></i>
        </div>
      `;
    }
  };

  useEffect(() => {
    if (edadMeses) {
      filtrarItemsPorEdad();
    }
  }, [edadMeses]);

  const calcularEdadMeses = () => {
    if (!nino?.fecha_nacimiento) return;
    
    const hoy = new Date();
    const nacimiento = new Date(nino.fecha_nacimiento);
    const diffMeses = (hoy.getFullYear() - nacimiento.getFullYear()) * 12 + 
                     (hoy.getMonth() - nacimiento.getMonth());
    
    setEdadMeses(diffMeses);
  };

  const filtrarItemsPorEdad = () => {
    const edad = parseInt(edadMeses);
    const itemsFiltrados = itemsDScore.filter(item => 
      edad >= item.edadMin - 3 && edad <= item.edadMax + 3
    );
    setItemsEvaluacion(itemsFiltrados);
    // Inicializar todos los items como no evaluados
    const estadoInicial = {};
    itemsFiltrados.forEach(item => {
      estadoInicial[item.id] = null;
    });
    setItemsEstado(estadoInicial);
  };

  const toggleItem = (itemId) => {
    setItemsEstado(prev => {
      const estadoActual = prev[itemId];
      let nuevoEstado;
      
      if (estadoActual === null) {
        nuevoEstado = 'superado'; // null -> superado
      } else if (estadoActual === 'superado') {
        nuevoEstado = 'no_superado'; // superado -> no_superado
      } else {
        nuevoEstado = null; // no_superado -> null
      }
      
      return { ...prev, [itemId]: nuevoEstado };
    });
  };

  const calcularDScore = async () => {
    // Verificar que todos los items estén evaluados
    const itemsNoEvaluados = Object.entries(itemsEstado).filter(([_, estado]) => estado === null);
    
    if (itemsNoEvaluados.length > 0) {
      setError(`Por favor evalúa todos los ítems. Faltan ${itemsNoEvaluados.length} ítems por evaluar.`);
      return;
    }

    setCargando(true);
    setError('');

    try {
      // Solo enviar los items superados al backend
      const itemsSuperados = Object.entries(itemsEstado)
        .filter(([_, estado]) => estado === 'superado')
        .map(([itemId, _]) => itemId);

      const response = await fetchConAuth(`${API_URL}/dscore/calcular`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nino_id: ninoId,
          edad_meses: parseInt(edadMeses),
          items_superados: itemsSuperados,
          items_total: Object.keys(itemsEstado).length
        })
      });

      if (!response.ok) {
        throw new Error('Error al calcular D-Score');
      }

      const resultado = await response.json();
      setDscoreCalculado(resultado);
      
      // Guardar evaluación
      await guardarEvaluacion(resultado);
      
    } catch (err) {
      setError('Error al calcular D-Score: ' + err.message);
    } finally {
      setCargando(false);
    }
  };

  const guardarEvaluacion = async (resultado) => {
    try {
      await fetchConAuth(`${API_URL}/evaluaciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nino_id: ninoId,
          tipo: 'dscore_screening',
          resultado: JSON.stringify(resultado),
          items_evaluados: JSON.stringify(itemsEstado),
          edad_meses: parseInt(edadMeses),
          evaluador: 'enfermeria'
        })
      });
      
      cargarEvaluacionesAnteriores();
    } catch (err) {
      console.error('Error guardando evaluación:', err);
    }
  };

  const cargarEvaluacionesAnteriores = async () => {
    try {
      const response = await fetchConAuth(`${API_URL}/evaluaciones/${ninoId}?tipo=dscore_screening`);
      if (response.ok) {
        const data = await response.json();
        setEvaluaciones(data.evaluaciones || []);
      }
    } catch (err) {
      console.error('Error cargando evaluaciones:', err);
    }
  };

  const interpretarDScore = (score) => {
    if (score >= 75) return { nivel: 'Desarrollo Adecuado', color: 'green', descripcion: 'Desarrollo adecuado' };
    if (score >= 50) return { nivel: 'Desarrollo Normal', color: 'green', descripcion: 'Desarrollo dentro del rango esperado' };
    if (score >= 40) return { nivel: 'Vigilancia', color: 'orange', descripcion: 'Requiere seguimiento cercano' };
    if (score >= 25) return { nivel: 'Alerta', color: 'orange', descripcion: 'Evaluación por pediatra especializado' };
    return { nivel: 'Derivación Urgente', color: 'red', descripcion: 'Derivación inmediata a neuropediatría' };
  };

  const getColorByNivel = (nivel) => {
    if (nivel.includes('Adecuado') || nivel.includes('Normal')) return 'green';
    if (nivel.includes('Vigilancia') || nivel.includes('Alerta')) return 'orange';
    return 'red';
  };

  const getDominioIcon = (dominio) => {
    const iconos = {
      'motor_grueso': '🏃',
      'motor_fino': '✋',
      'lenguaje': '💬',
      'social_emocional': '😊'
    };
    return iconos[dominio] || '📋';
  };

  const getDominioNombre = (dominio) => {
    const nombres = {
      'motor_grueso': 'Motor Grueso',
      'motor_fino': 'Motor Fino',
      'lenguaje': 'Lenguaje',
      'social_emocional': 'Social-Emocional'
    };
    return nombres[dominio] || dominio;
  };

  return (
    <div className="screening-enfermeria">
      <div className="screening-header">
        <h2>🩺 Screening de Desarrollo - Enfermería</h2>
        <p>Evaluación rápida basada en D-Score para {nino?.nombre}</p>
      </div>

      {vistaInicial === 'evaluacion' && (
        <div className="dscore-evaluacion">
          <div className="info-nino">
            <h3>📋 Información del Niño</h3>
            <div className="info-grid">
              <div>
                <strong>Nombre:</strong> {nino?.nombre}
              </div>
              <div>
                <strong>Edad:</strong> {edadMeses} meses
              </div>
              <div>
                <strong>Fecha de nacimiento:</strong> {nino?.fecha_nacimiento}
              </div>
            </div>
          </div>

          {edadMeses && itemsEvaluacion.length > 0 && (
            <div className="items-evaluacion">
              <h3>✅ Ítems de Evaluación</h3>
              <p className="edad-info">
                Mostrando ítems apropiados para {edadMeses} meses de edad
              </p>
              
              {/* Organizar por dominio */}
              {['motor_grueso', 'motor_fino', 'lenguaje', 'social_emocional'].map(dominio => {
                const itemsDominio = itemsEvaluacion.filter(item => item.dominio === dominio);
                if (itemsDominio.length === 0) return null;
                
                return (
                  <div key={dominio} className="dominio-section">
                    <div className="dominio-header">
                      <span className="dominio-icon-large">{getDominioIcon(dominio)}</span>
                      <h4>{getDominioNombre(dominio)}</h4>
                    </div>
                    
                    <div className="hitos-horizontal-list">
                      {itemsDominio.map(item => {
                        const estado = itemsEstado[item.id];
                        return (
                          <div 
                            key={item.id} 
                            className="hito-card-screening"
                          >
                            {/* Contenedor de 2 columnas */}
                            <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
                              
                              {/* COLUMNA IZQUIERDA - Texto (40%) */}
                              <div style={{ flex: '0 0 40%' }}>
                                <div className="hito-descripcion-screening">{item.descripcion}</div>
                                <div className="hito-edad-rango">{item.edadMin}-{item.edadMax} meses</div>
                                
                                {estado !== null && (
                                  <div className="hito-estado-display" style={{
                                    marginTop: '10px',
                                    padding: '8px 12px',
                                    borderRadius: '6px',
                                    fontWeight: 'bold',
                                    fontSize: '0.9em',
                                    backgroundColor: estado === 'superado' ? '#d4edda' : '#f8d7da',
                                    color: estado === 'superado' ? '#155724' : '#721c24',
                                    border: estado === 'superado' ? '1px solid #c3e6cb' : '1px solid #f5c6cb'
                                  }}>
                                    {estado === 'superado' && '✅ Superado'}
                                    {estado === 'no_superado' && '❌ No superado'}
                                  </div>
                                )}
                              </div>

                              {/* COLUMNA DERECHA - Videos (60%) */}
                              <div style={{ flex: '0 0 60%' }}>
                                {videosAsociados[item.id] && videosAsociados[item.id].length > 0 ? (
                                  <div style={{ 
                                    display: 'flex', 
                                    flexDirection: 'column',
                                    gap: '12px'
                                  }}>
                                    <div style={{
                                      fontSize: '0.9em',
                                      fontWeight: '600',
                                      color: '#666',
                                      marginBottom: '8px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '6px'
                                    }}>
                                      <i className="fas fa-video" style={{ color: '#666' }}></i>
                                      Videos educativos:
                                    </div>
                                    
                                    {videosAsociados[item.id].map((video, index) => {
                                      const getVideoStyles = (fuente) => {
                                        if (fuente === 'CDC') {
                                          return {
                                            backgroundColor: '#e8f5e9',
                                            border: '2px solid #4caf50',
                                            color: '#2e7d32',
                                            hoverBg: '#4caf50',
                                            icon: '🏛️',
                                            shadowColor: 'rgba(76,175,80,0.3)'
                                          };
                                        } else if (fuente === 'Pathways') {
                                          return {
                                            backgroundColor: '#e3f2fd',
                                            border: '2px solid #2196f3',
                                            color: '#1976d2',
                                            hoverBg: '#2196f3',
                                            icon: '🎯',
                                            shadowColor: 'rgba(33,150,243,0.3)'
                                          };
                                        } else {
                                          return {
                                            backgroundColor: '#f5f5f5',
                                            border: '2px solid #757575',
                                            color: '#424242',
                                            hoverBg: '#757575',
                                            icon: '📹',
                                            shadowColor: 'rgba(117,117,117,0.3)'
                                          };
                                        }
                                      };

                                      const styles = getVideoStyles(video.fuente);

                                      return (
                                        <button
                                          key={video.id || index}
                                          onClick={() => abrirVideo(video)}
                                          style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            padding: '12px',
                                            backgroundColor: styles.backgroundColor,
                                            border: styles.border,
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontSize: '0.9em',
                                            fontWeight: '600',
                                            color: styles.color,
                                            transition: 'all 0.2s ease',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                          }}
                                          onMouseOver={(e) => {
                                            e.currentTarget.style.backgroundColor = styles.hoverBg;
                                            e.currentTarget.style.color = 'white';
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            e.currentTarget.style.boxShadow = `0 4px 12px ${styles.shadowColor}`;
                                          }}
                                          onMouseOut={(e) => {
                                            e.currentTarget.style.backgroundColor = styles.backgroundColor;
                                            e.currentTarget.style.color = styles.color;
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                                          }}
                                        >
                                          <div style={{
                                            width: '100%',
                                            aspectRatio: '16/9',
                                            borderRadius: '6px',
                                            overflow: 'hidden',
                                            backgroundColor: '#f0f0f0',
                                            marginBottom: '8px'
                                          }}>
                                            {(() => {
                                              const thumbnail = getVideoThumbnail(video.url);
                                              if (thumbnail) {
                                                const videoId = video.url.includes('youtube.com/watch?v=') 
                                                  ? video.url.split('v=')[1]?.split('&')[0]
                                                  : video.url.includes('youtu.be/')
                                                  ? video.url.split('youtu.be/')[1]?.split('?')[0]
                                                  : null;
                                                
                                                return (
                                                  <img 
                                                    src={thumbnail} 
                                                    alt={`Thumbnail ${video.titulo}`}
                                                    style={{
                                                      width: '100%',
                                                      height: '100%',
                                                      objectFit: 'cover'
                                                    }}
                                                    onError={(e) => handleThumbnailError(e, videoId, styles)}
                                                  />
                                                );
                                              } else {
                                                return (
                                                  <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    height: '100%',
                                                    background: '#f0f0f0'
                                                  }}>
                                                    <i className="fas fa-play-circle" style={{ fontSize: '2em', color: styles.color }}></i>
                                                  </div>
                                                );
                                              }
                                            })()}
                                          </div>
                                          <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            width: '100%'
                                          }}>
                                            <div style={{
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: '8px'
                                            }}>
                                              <i className="fab fa-youtube" style={{ fontSize: '1.2em' }}></i>
                                              <span>{styles.icon} {video.titulo}</span>
                                            </div>
                                            <i className="fas fa-external-link-alt" style={{ fontSize: '0.9em', opacity: 0.7 }}></i>
                                          </div>
                                        </button>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <div style={{ 
                                    flex: '0 0 60%', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    background: '#f0f0f0', 
                                    borderRadius: '8px', 
                                    minHeight: '120px' 
                                  }}>
                                    <span style={{ color: '#999', fontSize: '0.9em' }}>
                                      <i className="fas fa-video" style={{ marginRight: '8px' }}></i>
                                      No hay videos disponibles
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* BOTONES DE EVALUACIÓN - Abarcan ambas columnas */}
                            <div className="hito-acciones" style={{ 
                              display: 'flex', 
                              gap: '8px', 
                              flexWrap: 'wrap', 
                              justifyContent: 'center',
                              paddingTop: '15px',
                              borderTop: '1px solid #eee'
                            }}>
                              <button 
                                className={`btn-screening ${estado === 'superado' ? 'active-superado' : ''}`}
                                onClick={() => {
                                  setItemsEstado(prev => ({
                                    ...prev,
                                    [item.id]: prev[item.id] === 'superado' ? null : 'superado'
                                  }));
                                }}
                                style={{
                                  padding: '0.75rem 1.5rem',
                                  border: 'none',
                                  backgroundColor: estado === 'superado' ? '#4caf50' : 'white',
                                  color: estado === 'superado' ? 'white' : '#333',
                                  borderRadius: '5px',
                                  cursor: 'pointer',
                                  fontSize: '0.85rem',
                                  fontWeight: '700',
                                  transition: 'all 0.2s ease',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.03em',
                                  boxShadow: estado === 'superado' ? 'none' : '0 1px 3px rgba(0,0,0,0.12)'
                                }}
                              >
                                <i className="fas fa-check"></i> Conseguido
                              </button>
                              
                              <button 
                                className={`btn-screening ${estado === 'no_superado' ? 'active-no-superado' : ''}`}
                                onClick={() => {
                                  setItemsEstado(prev => ({
                                    ...prev,
                                    [item.id]: prev[item.id] === 'no_superado' ? null : 'no_superado'
                                  }));
                                }}
                                style={{
                                  padding: '0.75rem 1.5rem',
                                  border: 'none',
                                  backgroundColor: estado === 'no_superado' ? '#ff9800' : 'white',
                                  color: estado === 'no_superado' ? 'white' : '#333',
                                  borderRadius: '5px',
                                  cursor: 'pointer',
                                  fontSize: '0.85rem',
                                  fontWeight: '700',
                                  transition: 'all 0.2s ease',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.03em',
                                  boxShadow: estado === 'no_superado' ? 'none' : '0 1px 3px rgba(0,0,0,0.12)'
                                }}
                              >
                                <i className="fas fa-times"></i> No alcanzado
                              </button>
                              
                              {estado !== null && (
                                <button 
                                  className="btn-screening-reset"
                                  onClick={() => {
                                    setItemsEstado(prev => ({
                                      ...prev,
                                      [item.id]: null
                                    }));
                                  }}
                                  style={{
                                    padding: '0.75rem 1.5rem',
                                    border: 'none',
                                    backgroundColor: '#f44336',
                                    color: 'white',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem',
                                    fontWeight: '700',
                                    transition: 'all 0.2s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.03em'
                                  }}
                                >
                                  <i className="fas fa-undo"></i> Eliminar
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              <div className="items-resumen">
                <div className="resumen-item">
                  <span className="resumen-label">Total ítems:</span>
                  <span className="resumen-valor">{Object.keys(itemsEstado).length}</span>
                </div>
                <div className="resumen-item superado">
                  <span className="resumen-label">✅ Superados:</span>
                  <span className="resumen-valor">
                    {Object.values(itemsEstado).filter(e => e === 'superado').length}
                  </span>
                </div>
                <div className="resumen-item no-superado">
                  <span className="resumen-label">❌ No superados:</span>
                  <span className="resumen-valor">
                    {Object.values(itemsEstado).filter(e => e === 'no_superado').length}
                  </span>
                </div>
                <div className="resumen-item pendiente">
                  <span className="resumen-label">⬜ Pendientes:</span>
                  <span className="resumen-valor">
                    {Object.values(itemsEstado).filter(e => e === null).length}
                  </span>
                </div>
              </div>

              <div className="calcular-section">
                <button 
                  className="btn-calcular"
                  onClick={calcularDScore}
                  disabled={cargando || Object.values(itemsEstado).some(e => e === null)}
                >
                  {cargando ? 'Calculando...' : 
                   Object.values(itemsEstado).some(e => e === null) ? 
                   '⚠️ Evalúa todos los ítems para calcular' : 
                   '🧮 Calcular D-Score'}
                </button>
              </div>

              {error && (
                <div className="error-message">
                  ⚠️ {error}
                </div>
              )}
            </div>
          )}

          {dscoreCalculado && (
            <div className="resultado-dscore">
              <h3>📊 Resultado D-Score</h3>
              <div className="score-display">
                <div className="score-value">
                  {dscoreCalculado.dscore}
                </div>
                <div className={`score-interpretacion ${getColorByNivel(dscoreCalculado.nivel_desarrollo)}`}>
                  <strong>{dscoreCalculado.nivel_desarrollo}</strong>
                  <p>{dscoreCalculado.recomendacion}</p>
                </div>
              </div>
              
              <div className="detalles-resultado">
                <div><strong>Edad evaluada:</strong> {dscoreCalculado.edad_meses} meses</div>
                <div><strong>Ítems superados:</strong> {dscoreCalculado.items_superados} de {dscoreCalculado.items_total}</div>
                <div><strong>Ítems no superados:</strong> {dscoreCalculado.items_no_superados}</div>
                <div><strong>Porcentaje superado:</strong> {dscoreCalculado.porcentaje_superado}%</div>
              </div>
            </div>
          )}
        </div>
      )}

      {vistaInicial === 'historial' && (
        <div className="historial-evaluaciones">
          <h3>📋 Historial de Evaluaciones</h3>
          {evaluaciones.length === 0 ? (
            <p>No hay evaluaciones previas registradas.</p>
          ) : (
            <>
              {/* Gráfico de evolución */}
              {evaluaciones.length > 1 && (
                <div className="grafico-evolucion">
                  <h4>📈 Evolución del Desarrollo</h4>
                  <div className="grafico-container">
                    <svg width="100%" height="300" viewBox="0 0 800 300">
                      {/* Líneas de referencia */}
                      <line x1="80" y1="40" x2="80" y2="260" stroke="#ddd" strokeWidth="2" />
                      <line x1="80" y1="260" x2="750" y2="260" stroke="#ddd" strokeWidth="2" />
                      
                      {/* Etiquetas del eje Y (D-Score) */}
                      <text x="60" y="45" fontSize="12" fill="#666" textAnchor="end">100</text>
                      <text x="60" y="95" fontSize="12" fill="#666" textAnchor="end">75</text>
                      <text x="60" y="150" fontSize="12" fill="#666" textAnchor="end">50</text>
                      <text x="60" y="205" fontSize="12" fill="#666" textAnchor="end">25</text>
                      <text x="60" y="265" fontSize="12" fill="#666" textAnchor="end">0</text>
                      
                      {/* Líneas de referencia horizontales */}
                      <line x1="80" y1="40" x2="750" y2="40" stroke="#e0e0e0" strokeWidth="1" strokeDasharray="5,5" />
                      <line x1="80" y1="95" x2="750" y2="95" stroke="#e0e0e0" strokeWidth="1" strokeDasharray="5,5" />
                      <line x1="80" y1="150" x2="750" y2="150" stroke="#27ae60" strokeWidth="1" strokeDasharray="5,5" />
                      <line x1="80" y1="205" x2="750" y2="205" stroke="#f39c12" strokeWidth="1" strokeDasharray="5,5" />
                      
                      {/* Zona de desarrollo adecuado */}
                      <rect x="80" y="40" width="670" height="55" fill="#d4edda" opacity="0.3" />
                      {/* Zona normal */}
                      <rect x="80" y="95" width="670" height="55" fill="#d1ecf1" opacity="0.3" />
                      {/* Zona vigilancia */}
                      <rect x="80" y="150" width="670" height="55" fill="#fff3cd" opacity="0.3" />
                      {/* Zona alerta */}
                      <rect x="80" y="205" width="670" height="55" fill="#f8d7da" opacity="0.3" />
                      
                      {/* Línea de evolución */}
                      {(() => {
                        const sortedEvals = [...evaluaciones].sort((a, b) => a.edad_meses - b.edad_meses);
                        const maxEdad = Math.max(...sortedEvals.map(e => e.edad_meses));
                        const points = sortedEvals.map((ev, i) => {
                          const resultado = JSON.parse(ev.resultado);
                          const x = 80 + ((ev.edad_meses / maxEdad) * 670);
                          const y = 260 - ((resultado.dscore / 100) * 220);
                          return `${x},${y}`;
                        }).join(' ');
                        
                        return (
                          <>
                            <polyline 
                              points={points} 
                              fill="none" 
                              stroke="#3498db" 
                              strokeWidth="3"
                            />
                            {sortedEvals.map((ev, i) => {
                              const resultado = JSON.parse(ev.resultado);
                              const x = 80 + ((ev.edad_meses / maxEdad) * 670);
                              const y = 260 - ((resultado.dscore / 100) * 220);
                              const color = getColorByNivel(resultado.nivel_desarrollo || interpretarDScore(resultado.dscore).nivel);
                              const fillColor = color === 'green' ? '#27ae60' : color === 'orange' ? '#f39c12' : '#e74c3c';
                              
                              return (
                                <g key={i}>
                                  <circle cx={x} cy={y} r="6" fill={fillColor} stroke="white" strokeWidth="2" />
                                  <text x={x} y="280" fontSize="10" fill="#666" textAnchor="middle">{ev.edad_meses}m</text>
                                </g>
                              );
                            })}
                          </>
                        );
                      })()}
                      
                      {/* Etiquetas de ejes */}
                      <text x="400" y="295" fontSize="14" fill="#333" textAnchor="middle" fontWeight="bold">Edad (meses)</text>
                      <text x="20" y="150" fontSize="14" fill="#333" textAnchor="middle" fontWeight="bold" transform="rotate(-90, 20, 150)">D-Score</text>
                    </svg>
                  </div>
                </div>
              )}

              {/* Lista de evaluaciones */}
              <div className="evaluaciones-lista">
                {evaluaciones.map((evaluacion, index) => {
                  const resultado = JSON.parse(evaluacion.resultado);
                  const interpretacion = interpretarDScore(resultado.dscore);
                  
                  return (
                    <div key={index} className="evaluacion-card">
                      <div className="evaluacion-header">
                        <div className="fecha">{new Date(evaluacion.fecha).toLocaleDateString()}</div>
                        <div className={`score ${interpretacion.color}`}>
                          D-Score: {resultado.dscore}
                        </div>
                      </div>
                      <div className="evaluacion-detalles">
                        <div><strong>Edad:</strong> {evaluacion.edad_meses} meses</div>
                        <div><strong>Nivel:</strong> {resultado.nivel_desarrollo || interpretacion.nivel}</div>
                        <div><strong>Ítems evaluados:</strong> {resultado.items_total}</div>
                        <div><strong>Ítems superados:</strong> {resultado.items_superados}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* Modal de video */}
      <VideoModal 
        isOpen={videoModalOpen}
        onClose={cerrarVideo}
        video={videoSeleccionado}
      />
    </div>
  );
}