import React, { useState, useEffect } from 'react';
import './BibliotecaMedios.css';

const BibliotecaMedios = () => {
  const [videos, setVideos] = useState([]);
  const [hitos, setHitos] = useState([]);
  const [filtroFuente, setFiltroFuente] = useState('todos');
  const [filtroEdad, setFiltroEdad] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [videoSeleccionado, setVideoSeleccionado] = useState(null);

  const [hitosSeleccionados, setHitosSeleccionados] = useState([]);
  const [modoAsociacion, setModoAsociacion] = useState('simple'); // 'simple' o 'multiple'
  const [mostrarModalAsociaciones, setMostrarModalAsociaciones] = useState(false);
  const [busquedaModal, setBusquedaModal] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const token = localStorage.getItem('token');
      
      // Cargar videos
      const resVideos = await fetch('/api/videos', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dataVideos = await resVideos.json();
      // Procesar hitosAsociados de string a array
      const videosProcessed = Array.isArray(dataVideos) ? dataVideos.map(video => ({
        ...video,
        hitosAsociados: video.hitosAsociados ? 
          (typeof video.hitosAsociados === 'string' ? 
            video.hitosAsociados.split(',').filter(id => id) : 
            Array.isArray(video.hitosAsociados) ? video.hitosAsociados : []
          ) : []
      })) : [];
      setVideos(videosProcessed);
      
      // Cargar todos los hitos del sistema
      const resHitos = await fetch('/api/hitos-completos', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dataHitos = await resHitos.json();
      setHitos(Array.isArray(dataHitos) ? dataHitos : []);
      
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setVideos([]);
      setHitos([]);
      mostrarMensaje('Error al cargar los datos', 'error');
    } finally {
      setCargando(false);
    }
  };

  const mostrarMensaje = (texto, tipo = 'info') => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje(''), 3000);
  };



  const desasociarVideo = async (videoId, hitoId) => {
    if (!confirm('¿Deseas desasociar este video del hito?')) return;

    try {
      setCargando(true);
      const token = localStorage.getItem('token');
      await fetch('/api/videos/desasociar', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          videoId,
          hitoId
        })
      });
      
      mostrarMensaje('Video desasociado correctamente', 'success');
      cargarDatos();
    } catch (error) {
      console.error('Error al desasociar video:', error);
      mostrarMensaje('Error al desasociar el video', 'error');
    } finally {
      setCargando(false);
    }
  };

  const eliminarVideo = async (videoId) => {
    if (!confirm('¿Estás seguro de eliminar este video? Se desasociará de todos los hitos.')) return;

    try {
      setCargando(true);
      const token = localStorage.getItem('token');
      await fetch(`/api/videos/${videoId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      mostrarMensaje('Video eliminado correctamente', 'success');
      cargarDatos();
    } catch (error) {
      console.error('Error al eliminar video:', error);
      mostrarMensaje('Error al eliminar el video', 'error');
    } finally {
      setCargando(false);
    }
  };

  const abrirModalAsociaciones = (video) => {
    console.log('=== DEBUGGING MODAL ===');
    console.log('Video recibido:', video);
    console.log('Hitos disponibles:', hitos.length);
    console.log('Estado actual modal:', mostrarModalAsociaciones);
    
    if (!video) {
      console.error('No se ha proporcionado un video válido');
      return;
    }
    
    if (hitos.length === 0) {
      console.warn('No hay hitos cargados todavía');
      mostrarMensaje('Cargando hitos, intenta de nuevo en un momento', 'warning');
      return;
    }
    
    setVideoSeleccionado(video);
    setHitosSeleccionados([]);
    setBusquedaModal('');
    setMostrarModalAsociaciones(true);
    
    console.log('Modal debería abrirse ahora');
    console.log('Video seleccionado:', video);
  };

  const cerrarModalAsociaciones = () => {
    setHitosSeleccionados([]);
    setBusquedaModal('');
    setMostrarModalAsociaciones(false);
    // No limpiar videoSeleccionado aquí para evitar conflictos
  };

  const toggleHitoSeleccionado = (hitoId) => {
    setHitosSeleccionados(prev => 
      prev.includes(hitoId) 
        ? prev.filter(id => id !== hitoId)
        : [...prev, hitoId]
    );
  };

  const asociarMultiplesHitos = async () => {
    if (!videoSeleccionado || hitosSeleccionados.length === 0) {
      mostrarMensaje('Selecciona al menos un hito', 'error');
      return;
    }

    try {
      setCargando(true);
      const token = localStorage.getItem('token');
      
      // Asociar cada hito seleccionado
      for (const hitoId of hitosSeleccionados) {
        await fetch('/api/videos/asociar', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            videoId: videoSeleccionado.id,
            hitoId: hitoId
          })
        });
      }
      
      mostrarMensaje(`Video asociado a ${hitosSeleccionados.length} hito(s)`, 'success');
      cerrarModalAsociaciones();
      cargarDatos();
    } catch (error) {
      console.error('Error al asociar videos:', error);
      mostrarMensaje('Error al asociar algunos videos', 'error');
    } finally {
      setCargando(false);
    }
  };

  const videosFiltrados = Array.isArray(videos) ? videos.filter(video => {
    const matchFuente = filtroFuente === 'todos' || video.fuente === filtroFuente;
    const matchEdad = filtroEdad === 'todos' || (video.hitoAsociado && video.hitoAsociado.edad === parseInt(filtroEdad));
    const matchBusqueda = busqueda === '' || 
      video.titulo?.toLowerCase().includes(busqueda.toLowerCase()) ||
      video.descripcion?.toLowerCase().includes(busqueda.toLowerCase()) ||
      video.url?.toLowerCase().includes(busqueda.toLowerCase());
    
    return matchFuente && matchEdad && matchBusqueda;
  }) : [];

  const obtenerNombreHito = (hitoId) => {
    const hito = hitos.find(h => h.id === parseInt(hitoId));
    return hito ? `${hito.descripcion} (${hito.edad} meses)` : 'Hito no encontrado';
  };

  return (
    <div className="biblioteca-medios">
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
        }}>Biblioteca de Medios</h2>
        <p style={{
          fontSize: '1.2rem',
          color: 'white',
          lineHeight: '1.8',
          margin: '0',
          fontWeight: '400'
        }}>
          Gestión de videos educativos y sus asociaciones con hitos del desarrollo infantil.
        </p>
      </div>
      
      {mensaje && (
        <div className={`mensaje mensaje-${mensaje.tipo}`}>
          {mensaje.texto}
        </div>
      )}

      {/* Filtros */}
      <div className="filtros-container">
        <div className="filtro-grupo">
          <label>Fuente:</label>
          <select value={filtroFuente} onChange={(e) => setFiltroFuente(e.target.value)}>
            <option value="todos">Todos</option>
            <option value="CDC">CDC</option>
            <option value="Pathways">Pathways.org</option>
          </select>
        </div>

        <div className="filtro-grupo">
          <label>Edad (meses):</label>
          <select value={filtroEdad} onChange={(e) => setFiltroEdad(e.target.value)}>
            <option value="todos">Todos</option>
            {[2, 4, 6, 9, 12, 15, 18, 24, 30, 36, 48, 60].map(edad => (
              <option key={edad} value={edad}>{edad}</option>
            ))}
          </select>
        </div>

        <div className="filtro-grupo busqueda">
          <label>Buscar:</label>
          <input
            type="text"
            placeholder="Título, descripción o URL..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>



      {/* Lista de videos */}
      <div className="videos-lista">
        <h3>Videos ({videosFiltrados.length})</h3>
        
        {cargando ? (
          <p>Cargando...</p>
        ) : videosFiltrados.length === 0 ? (
          <p>No se encontraron videos con los filtros aplicados</p>
        ) : (
          <div className="videos-grid">
            {videosFiltrados.map(video => (
              <div key={video.id} className="video-card">
                <div className="video-header">
                  <span className={`fuente-badge ${video.fuente.toLowerCase()}`}>
                    {video.fuente}
                  </span>
                  <button 
                    className="btn-eliminar"
                    onClick={() => eliminarVideo(video.id)}
                    title="Eliminar video"
                  >
                    🗑️
                  </button>
                </div>

                <div className="video-thumbnail">
                  <a href={video.url} target="_blank" rel="noopener noreferrer">
                    <img 
                      src={`https://img.youtube.com/vi/${video.url.split('/').pop().replace('watch?v=', '')}/mqdefault.jpg`}
                      alt={video.titulo || 'Video'}
                      onError={(e) => e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="320" height="180"%3E%3Crect fill="%23ddd" width="320" height="180"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="%23999"%3ENo disponible%3C/text%3E%3C/svg%3E'}
                    />
                  </a>
                </div>

                <div className="video-info">
                  <h4>{video.titulo || 'Sin título'}</h4>
                  {video.descripcion && <p className="video-descripcion">{video.descripcion}</p>}
                  


                  {video.hitosAsociados && video.hitosAsociados.length > 0 ? (
                    <div className="hitos-asociados">
                      <strong>Asociado a:</strong>
                      <ul>
                        {video.hitosAsociados.map(hitoId => (
                          <li key={hitoId}>
                            {obtenerNombreHito(hitoId)}
                            <button 
                              className="btn-desasociar"
                              onClick={() => desasociarVideo(video.id, hitoId)}
                            >
                              ✕
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="sin-asociar">Sin hitos asociados</p>
                  )}
                </div>

                <button 
                  type="button"
                  className="btn-asociar-video"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Botón clickeado para video:', video.id);
                    abrirModalAsociaciones(video);
                  }}
                >
                  🔗 Gestionar Asociaciones
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DEBUG: Estado del modal */}
      {console.log('Estado renderizado:', { mostrarModalAsociaciones, videoSeleccionado: !!videoSeleccionado, hitosLength: hitos.length })}
      
      {/* Modal de Asociaciones Múltiples */}
      {mostrarModalAsociaciones && videoSeleccionado && (
        <div 
          className="modal-overlay" 
          onClick={cerrarModalAsociaciones}
          style={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999
          }}
        >
          <div 
            className="modal-asociaciones" 
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '20px',
              width: '90%',
              maxWidth: '800px',
              maxHeight: '90vh',
              overflow: 'auto'
            }}
          >
            <div className="modal-header">
              <h3>Gestionar Asociaciones para: {videoSeleccionado.titulo}</h3>
              <button 
                className="btn-cerrar" 
                onClick={cerrarModalAsociaciones}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  float: 'right'
                }}
              >
                ×
              </button>
            </div>

            <div className="modal-content">
              {/* DEBUG INFO */}
              <div style={{ backgroundColor: '#f0f0f0', padding: '10px', margin: '10px 0', fontSize: '12px' }}>
                <strong>DEBUG:</strong><br/>
                Video ID: {videoSeleccionado?.id}<br/>
                Hitos totales: {hitos.length}<br/>
                Asociaciones actuales: {videoSeleccionado?.hitosAsociados?.length || 0}
              </div>
              
              <div className="video-info-modal">
                <h4>{videoSeleccionado?.titulo || 'Sin título'}</h4>
                <p className="fuente">{videoSeleccionado?.fuente}</p>
              </div>

              <div className="asociaciones-actuales">
                <h5>Asociaciones actuales:</h5>
                {videoSeleccionado?.hitosAsociados && videoSeleccionado.hitosAsociados.length > 0 ? (
                  <div className="lista-asociados">
                    {videoSeleccionado.hitosAsociados.map(hitoId => {
                      const hito = hitos.find(h => h.id === parseInt(hitoId));
                      return (
                        <div key={hitoId} className="asociacion-actual">
                          <span>{hito ? `${hito.nombre} (${hito.fuente_normativa_nombre})` : `Hito ID: ${hitoId}`}</span>
                          <button 
                            className="btn-desasociar-small"
                            onClick={() => {
                              desasociarVideo(videoSeleccionado.id, hitoId);
                              // Actualizar el video seleccionado
                              setVideoSeleccionado(prev => ({
                                ...prev,
                                hitosAsociados: prev.hitosAsociados.filter(id => id !== hitoId)
                              }));
                            }}
                            title="Desasociar"
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="sin-asociaciones">No tiene asociaciones actuales</p>
                )}
              </div>

              <div className="nuevas-asociaciones">
                <h5>Agregar nuevas asociaciones:</h5>
                <div className="filtros-hitos">
                  <input
                    type="text"
                    placeholder="Buscar hitos..."
                    className="buscar-hitos"
                    value={busquedaModal}
                    onChange={(e) => setBusquedaModal(e.target.value)}
                  />
                </div>
                
                <div className="lista-hitos">
                  {hitos
                    .filter(hito => 
                      !videoSeleccionado?.hitosAsociados?.includes(hito.id.toString()) &&
                      ((hito.nombre && hito.nombre.toLowerCase().includes(busquedaModal.toLowerCase())) ||
                       (hito.fuente_normativa_nombre && hito.fuente_normativa_nombre.toLowerCase().includes(busquedaModal.toLowerCase())))
                    )
                    .slice(0, 20) // Limitar a 20 resultados para mejor rendimiento
                    .map(hito => (
                      <div key={hito.id} className="hito-item">
                        <label>
                          <input
                            type="checkbox"
                            checked={hitosSeleccionados.includes(hito.id)}
                            onChange={() => toggleHitoSeleccionado(hito.id)}
                          />
                          <span className="hito-info">
                            <strong>{hito.nombre || 'Sin nombre'}</strong>
                            <small>{hito.fuente_normativa_nombre || 'Sin fuente'} - {hito.dominio_nombre || 'Sin dominio'} - {hito.edad_media_meses || 0}m</small>
                          </span>
                        </label>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn-cancelar" 
                onClick={cerrarModalAsociaciones}
              >
                Cancelar
              </button>
              <button 
                className="btn-asociar" 
                onClick={asociarMultiplesHitos}
                disabled={hitosSeleccionados.length === 0 || cargando}
              >
                {cargando ? 'Asociando...' : `Asociar ${hitosSeleccionados.length} hito(s)`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BibliotecaMedios;
