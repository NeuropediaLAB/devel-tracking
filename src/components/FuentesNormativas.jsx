import React, { useState, useEffect } from 'react';
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
            <button 
              className="btn-detalle"
              onClick={() => setFuenteSeleccionada(isSelected ? null : fuente)}
            >
              {isSelected ? 'Ocultar' : 'Ver Detalles'}
            </button>
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

        {isSelected && (
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
        )}
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
      <div className="fuentes-header">
        <h2>📚 Fuentes Normativas del Desarrollo Infantil</h2>
        <p className="fuentes-descripcion">
          Acceda a información detallada de las fuentes normativas utilizadas en el sistema y compare 
          sus características psicométricas para tomar decisiones informadas en la evaluación del desarrollo.
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
    </div>
  );
}

export default FuentesNormativas;