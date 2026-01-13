import React from 'react';
import './DScore.css';

const GSEDResources = () => {
  const documents = [
    {
      id: 1,
      title: "Technical Report",
      description: "Reporte técnico completo con metodología, propiedades psicométricas, validación y marco conceptual del GSED.",
      url: "https://iris.paho.org/handle/10665.2/68424",
      icon: "📊",
      color: "#0ea5e9"
    },
    {
      id: 2,
      title: "Short Form (SF) - Caregiver Report",
      description: "Formulario corto basado en el reporte del cuidador. Incluye 139 ítems, toma 15-20 minutos completar.",
      url: "https://iris.paho.org/handle/10665.2/68423",
      icon: "📋",
      color: "#8b5cf6"
    },
    {
      id: 3,
      title: "Long Form (LF) - Direct Assessment",
      description: "Formulario largo de evaluación directa del niño. Incluye 163 ítems, toma 45-60 minutos administrar.",
      url: "https://iris.paho.org/handle/10665.2/68426",
      icon: "📝",
      color: "#6366f1"
    },
    {
      id: 4,
      title: "Scoring Guidelines",
      description: "Guía completa para la puntuación e interpretación de resultados del D-score.",
      url: "https://iris.paho.org/handle/10665.2/68419",
      icon: "🎯",
      color: "#14b8a6"
    },
    {
      id: 5,
      title: "Item Guide SF",
      description: "Guía detallada de ítems del Short Form con instrucciones de administración y ejemplos.",
      url: "https://iris.paho.org/handle/10665.2/68420",
      icon: "📖",
      color: "#f59e0b"
    },
    {
      id: 6,
      title: "Item Guide LF",
      description: "Guía detallada de ítems del Long Form con protocolos de evaluación directa.",
      url: "https://iris.paho.org/handle/10665.2/68425",
      icon: "📚",
      color: "#f97316"
    },
    {
      id: 7,
      title: "Translation and Adaptation Guide",
      description: "Guía para traducción y adaptación cultural de las escalas GSED a diferentes contextos.",
      url: "https://iris.paho.org/handle/10665.2/68480",
      icon: "🌐",
      color: "#10b981"
    },
    {
      id: 8,
      title: "Implementation Guide",
      description: "Guía práctica para implementación de GSED en programas y estudios poblacionales.",
      url: "https://iris.paho.org/handle/10665.2/68422",
      icon: "🚀",
      color: "#ec4899"
    },
    {
      id: 9,
      title: "Training Materials",
      description: "Materiales de capacitación para evaluadores, supervisores e implementadores de GSED.",
      url: "https://iris.paho.org/handle/10665.2/68421",
      icon: "🎓",
      color: "#06b6d4"
    }
  ];

  return (
    <div className="d-score-educacion">
      <div className="d-score-header">
        <h1>📚 Recursos y Documentación GSED</h1>
        <p className="subtitle">Materiales oficiales de la OMS para las Global Scales for Early Development</p>
      </div>

      {/* Introducción */}
      <div className="d-score-card" style={{ backgroundColor: '#f0f9ff', borderLeft: '4px solid #0284c7' }}>
        <h2>📌 Sobre esta Documentación</h2>
        <p style={{ fontSize: '1.05rem', lineHeight: '1.8' }}>
          Todos los documentos GSED son de <strong>acceso abierto y gratuito</strong>, publicados por la 
          <strong> Organización Mundial de la Salud (OMS)</strong> y disponibles a través de los repositorios 
          institucionales oficiales (IRIS - WHO y PAHO).
        </p>
        <p style={{ fontSize: '1rem', color: '#475569', marginTop: '1rem' }}>
          Esta página proporciona enlaces directos a toda la documentación oficial del paquete GSED v1.0 (2023), 
          organizada por tipo de documento para facilitar su acceso.
        </p>
      </div>

      {/* Listado de documentos */}
      <div className="d-score-card">
        <h2>📑 Documentos del Paquete GSED v1.0</h2>
        <p style={{ marginBottom: '1.5rem' }}>
          El paquete completo consta de 9 documentos principales que cubren todos los aspectos del sistema GSED:
        </p>

        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {documents.map(doc => (
            <a 
              key={doc.id}
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                padding: '1.5rem',
                backgroundColor: '#ffffff',
                border: `2px solid ${doc.color}20`,
                borderLeft: `4px solid ${doc.color}`,
                borderRadius: '12px',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ 
                  fontSize: '2.5rem', 
                  flexShrink: 0,
                  width: '60px',
                  height: '60px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: `${doc.color}10`,
                  borderRadius: '12px'
                }}>
                  {doc.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ 
                    margin: '0 0 0.5rem 0', 
                    fontSize: '1.25rem',
                    color: doc.color,
                    fontWeight: 700
                  }}>
                    {doc.id}. {doc.title}
                  </h3>
                  <p style={{ 
                    margin: 0, 
                    color: '#64748b',
                    lineHeight: '1.6',
                    fontSize: '1rem'
                  }}>
                    {doc.description}
                  </p>
                  <div style={{ 
                    marginTop: '0.75rem',
                    fontSize: '0.875rem',
                    color: doc.color,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    🔗 Acceder al documento
                    <span style={{ fontSize: '1.2rem' }}>→</span>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Información adicional */}
      <div className="d-score-card" style={{ backgroundColor: '#fefce8', borderLeft: '4px solid #eab308' }}>
        <h2>💡 Cómo Usar Esta Documentación</h2>
        <div className="d-score-grid" style={{ marginTop: '1rem' }}>
          <div>
            <h4>👨‍⚕️ Para Profesionales Clínicos</h4>
            <p>Comienza con el <strong>Technical Report</strong> para entender el marco conceptual, luego revisa las guías de ítems (SF o LF) según tu contexto de evaluación.</p>
          </div>
          <div>
            <h4>🔬 Para Investigadores</h4>
            <p>El <strong>Technical Report</strong> y <strong>Scoring Guidelines</strong> son esenciales. Consulta el <strong>Implementation Guide</strong> para diseño de estudios.</p>
          </div>
          <div>
            <h4>🌍 Para Programas Poblacionales</h4>
            <p>Revisa el <strong>Implementation Guide</strong> y <strong>Training Materials</strong>. Considera la <strong>Translation Guide</strong> si trabajas en contexto no anglófono.</p>
          </div>
          <div>
            <h4>🎓 Para Capacitadores</h4>
            <p>Los <strong>Training Materials</strong> y las guías de ítems son fundamentales. El <strong>Scoring Guidelines</strong> es crucial para enseñar interpretación.</p>
          </div>
        </div>
      </div>

      {/* Recursos adicionales */}
      <div className="d-score-card" style={{ backgroundColor: '#f0fdf4', borderLeft: '4px solid #10b981' }}>
        <h2>🌐 Recursos Complementarios</h2>
        <div style={{ marginTop: '1rem' }}>
          <h4>Enlaces Oficiales:</h4>
          <ul style={{ lineHeight: '2' }}>
            <li>
              <strong>OMS - Página oficial GSED:</strong>{' '}
              <a href="https://www.who.int/teams/maternal-newborn-child-adolescent-health-and-ageing/child-health/child-development/gsed" target="_blank" rel="noopener noreferrer">
                WHO GSED Portal
              </a>
            </li>
            <li>
              <strong>D-score.org:</strong>{' '}
              <a href="https://d-score.org" target="_blank" rel="noopener noreferrer">
                Sitio oficial del D-score
              </a>
            </li>
            <li>
              <strong>GCDG - Global Child Development Group:</strong>{' '}
              <a href="https://d-score.org/childdevdata/" target="_blank" rel="noopener noreferrer">
                Base de datos de desarrollo infantil
              </a>
            </li>
            <li>
              <strong>Paquete R 'dscore':</strong>{' '}
              <a href="https://cran.r-project.org/package=dscore" target="_blank" rel="noopener noreferrer">
                Implementación oficial para análisis
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Nota de copyright */}
      <div className="d-score-alert d-score-alert-info">
        <h4>📄 Derechos de Autor y Uso</h4>
        <p style={{ fontSize: '0.95rem', lineHeight: '1.7', margin: 0 }}>
          Todos los materiales GSED son © Organización Mundial de la Salud (OMS) 2023. 
          Se distribuyen bajo licencia <strong>CC BY-NC-SA 3.0 IGO</strong>, que permite uso no comercial con atribución apropiada. 
          Para uso comercial o adaptaciones, consulte las condiciones específicas en cada documento.
        </p>
      </div>
    </div>
  );
};

export default GSEDResources;
