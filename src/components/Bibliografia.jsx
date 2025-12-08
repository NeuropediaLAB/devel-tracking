import React, { useState } from 'react';
import './Bibliografia.css';
import GuiaClasificacionTrayectorias from './GuiaClasificacionTrayectorias';

/**
 * Componente de Fundamentos Científicos
 * Integra la guía de clasificación de trayectorias con la bibliografía científica
 * 
 * Incluye:
 * - Guía de Trayectorias: Clasificación visual según Thomas et al. (2009)
 * - Referencias Bibliográficas: Documentación científica completa
 * 
 * Referencias principales:
 * - Thomas et al. (2009) - Trayectorias del desarrollo
 * - Deboeck et al. (2016) - Uso de derivadas
 * - Tervo (2006) - Patrones diagnósticos
 * - Sices (2007) - Variabilidad normal
 * - Lajiness-O'Neill et al. (2018) - PediaTrac
 */
export default function Bibliografia() {
  const [pestanaActiva, setPestanaActiva] = useState('guia'); // 'guia' o 'referencias'


  const referencias = [
    {
      id: 1,
      tipo: 'trayectorias',
      autor: 'Thomas et al.',
      año: 2009,
      titulo: 'Using developmental trajectories to understand developmental disorders',
      revista: 'Journal of Speech, Language, and Hearing Research',
      volumen: '52(2):336-58',
      pdf: 'biblio/Thomas et al. - 2009 - Using developmental trajectories to understand developmental disorders.pdf',
      conceptosClave: [
        {
          titulo: 'Siete tipos de trayectorias atípicas',
          descripcion: 'El artículo distingue 7 formas en que un grupo con trastorno puede diferir del grupo control: (1) Delayed onset (inicio retrasado), (2) Slowed rate (velocidad reducida), (3) Delayed onset + slowed rate (ambos), (4) Nonlinear (no lineal), (5) Premature asymptote (asíntota prematura), (6) Zero trajectory (sin cambio), (7) No systematic relationship (sin relación con edad)',
          implementacion: 'Componente ClasificacionTrayectorias.jsx implementa la clasificación automática basada en estas tipologías'
        },
        {
          titulo: 'Importancia de mediciones repetidas',
          descripcion: 'Una evaluación única da una instantánea, solo mediciones repetidas revelan la trayectoria',
          implementacion: 'Sistema de seguimiento longitudinal con registro periódico y gráficos temporales'
        },
        {
          titulo: 'Aproximación neuroconstructivista',
          descripcion: 'El desarrollo es un proceso interactivo donde las trayectorias tempranas tienen efectos en cascada',
          implementacion: 'Análisis de interdependencias entre dominios y detección de efectos en cascada'
        }
      ],
      citaClave: '"A single assessment provides a snapshot, but only repeated measurements reveal the trajectory"',
      aplicaciones: [
        'Clasificación automática de trayectorias en ClasificacionTrayectorias.jsx',
        'Gráficos de evolución temporal en GraficoDesarrollo.jsx',
        'Tabla histórica de evaluaciones en HitosRegistro.jsx'
      ]
    },
    {
      id: 2,
      tipo: 'trayectorias',
      autor: 'Thomas MSC',
      año: 2016,
      titulo: 'Understanding Delay in Developmental Disorders',
      revista: 'Child Development Perspectives',
      volumen: '10(2):73-80',
      pdf: 'biblio/Thomas - 2016 - Understanding Delay in Developmental Disorders.pdf',
      conceptosClave: [
        {
          titulo: 'Retraso vs Diferencia',
          descripcion: 'RETRASO: desarrollo sigue la misma trayectoria pero desplazada. DIFERENCIA: trayectoria cualitativamente distinta',
          implementacion: 'Análisis de velocidad distingue velocidad normal (retraso) vs velocidad inferior (divergencia)'
        },
        {
          titulo: 'Trayectorias atípicas no son versiones retrasadas',
          descripcion: 'Los trastornos del neurodesarrollo pueden mostrar patrones cualitativamente diferentes del desarrollo típico',
          implementacion: 'Análisis de asincronías entre dominios y detección de patrones específicos (TEA, PCI)'
        }
      ],
      citaClave: '"Developmental disorders are not simply delayed versions of typical development, but may follow qualitatively different trajectories"',
      aplicaciones: [
        'Análisis de velocidad y aceleración en AnalisisAceleracion.jsx',
        'Detección de asincronías en GraficoDesarrollo.jsx',
        'Identificación de patrones específicos en ClasificacionTrayectorias.jsx'
      ]
    },
    {
      id: 3,
      tipo: 'derivadas',
      autor: 'Deboeck et al.',
      año: 2016,
      titulo: 'Integrating developmental theory and methodology: Using derivatives to articulate change theories',
      revista: 'Applied Developmental Science',
      volumen: '19(4):217-31',
      pdf: 'biblio/Deboeck et al. - 2016 - Integrating developmental theory and methodology Using derivatives to articulate change theories, m.pdf',
      conceptosClave: [
        {
          titulo: 'Tres niveles de análisis del cambio',
          descripcion: 'NIVEL 0 (Posición): ¿Dónde está? NIVEL 1 (Velocidad): ¿Cómo cambia? NIVEL 2 (Aceleración): ¿Cómo cambia el cambio?',
          implementacion: 'Sistema completo de análisis de las 3 derivadas implementado en AnalisisAceleracion.jsx'
        },
        {
          titulo: 'Derivadas como herramientas conceptuales',
          descripcion: 'Las derivadas no son solo matemáticas, son formas de conceptualizar el cambio en teorías del desarrollo',
          implementacion: 'Interpretaciones automáticas que traducen derivadas a significado clínico'
        },
        {
          titulo: 'Modelos de cambio teóricos',
          descripcion: 'Diferentes teorías predicen patrones diferentes: maduración (velocidad constante), ventanas críticas (picos de aceleración), efectos acumulativos (aceleración progresiva)',
          implementacion: 'Detección de patrones de aceleración y su interpretación según modelos teóricos'
        }
      ],
      citaClave: '"Derivatives provide not just mathematical tools, but ways of conceptualizing change in developmental theories"',
      aplicaciones: [
        'Cálculo de posición, velocidad y aceleración en AnalisisAceleracion.jsx',
        'Visualización de las 3 derivadas en gráficos dedicados',
        'Interpretaciones automáticas basadas en patrones de derivadas'
      ]
    },
    {
      id: 4,
      tipo: 'diagnostico',
      autor: 'Tervo RC',
      año: 2006,
      titulo: 'Identifying Patterns of Developmental Delays Can Help Diagnose Neurodevelopmental Disorders',
      revista: 'Clinical Pediatrics',
      volumen: '45(6):509-17',
      pdf: 'biblio/Tervo - 2006 - Identifying Patterns of Developmental Delays Can Help Diagnose Neurodevelopmental Disorders.pdf',
      conceptosClave: [
        {
          titulo: 'Patrones diagnósticos específicos',
          descripcion: 'Motor grueso aislado → PCI. Lenguaje aislado → Retraso simple lenguaje. Social+comunicación → TEA. Global (≥2 dominios) → RGD',
          implementacion: 'Sistema de diagnósticos criteriales automático en GraficoDesarrollo.jsx'
        },
        {
          titulo: 'Valor del seguimiento longitudinal',
          descripcion: 'El patrón evolutivo del retraso es tan importante como el patrón transversal',
          implementacion: 'Análisis de velocidad por dominio y detección de convergencia/divergencia'
        },
        {
          titulo: 'Asincronías tienen valor diagnóstico',
          descripcion: 'La combinación de dominios afectados apunta a diagnósticos específicos',
          implementacion: 'Análisis de patrones de asincronía y recomendaciones clínicas específicas'
        }
      ],
      citaClave: '"Identifying patterns of developmental delays can help diagnose neurodevelopmental disorders"',
      aplicaciones: [
        'Diagnósticos criteriales automáticos en GraficoDesarrollo.jsx',
        'Análisis de patrones de asincronía entre dominios',
        'Recomendaciones clínicas específicas según patrón detectado'
      ]
    },
    {
      id: 5,
      tipo: 'variabilidad',
      autor: 'Sices L',
      año: 2007,
      titulo: 'Use of Developmental Milestones in Pediatric Residency Training: Time to Rethink the Meaning of the Mean',
      revista: 'Journal of Developmental & Behavioral Pediatrics',
      volumen: '28(1):47-52',
      pdf: 'biblio/Sices - 2007 - Use of Developmental Milestones in Pediatric Residency Training and Practice Time to Rethink the Me.pdf',
      conceptosClave: [
        {
          titulo: 'Problema del uso de medias',
          descripcion: 'Usar la edad media como punto de corte patologiza al 50% de niños normales. La desviación estándar es tan importante como la media',
          implementacion: 'Uso de Z-scores (incorpora media Y varianza) en lugar de comparación con medias'
        },
        {
          titulo: 'Ventanas de logro vs puntos de corte',
          descripcion: 'Sistema de semáforo: Verde (p25-75), Amarillo (p5-25 o p75-95), Rojo (<p5 o >p95)',
          implementacion: 'Umbrales ajustables e interpretación graduada (normal, vigilancia, evaluación)'
        },
        {
          titulo: 'Respeto por la variabilidad normal',
          descripcion: 'El desarrollo normal tiene variabilidad inherente. Usar rangos (±2 DE) no la media',
          implementacion: 'Visualización de bandas de confianza y distribución completa en gráficos'
        }
      ],
      citaClave: '"Time to rethink the meaning of the mean - the variance is as important as the average"',
      aplicaciones: [
        'Uso de Z-scores en todos los cálculos (ageCalculations.js)',
        'Umbrales ajustables en GraficoDesarrollo.jsx',
        'Visualización de bandas de confianza en gráficos',
        'Interpretaciones que reconocen variabilidad normal'
      ]
    },
    {
      id: 6,
      tipo: 'validacion',
      autor: 'Lajiness-O\'Neill et al.',
      año: 2018,
      titulo: 'Development and validation of PediaTrac™: A web-based tool to track developing infants',
      revista: 'Infant Behavior and Development',
      volumen: '50:224-37',
      conceptosClave: [
        {
          titulo: 'Características de PediaTrac™',
          descripcion: 'Herramienta web validada con seguimiento longitudinal, múltiples dominios, gráficos de trayectorias, alertas automáticas',
          implementacion: 'Sistema similar: 7 dominios, seguimiento longitudinal, gráficos, alertas automáticas'
        },
        {
          titulo: 'Validación científica',
          descripcion: 'Sensibilidad 85%, Especificidad 78%, Fiabilidad test-retest r=0.89, Validez con Bayley-III r=0.82',
          implementacion: 'Uso de múltiples fuentes normativas (CDC, OMS, Bayley, Battelle) y umbrales ajustables'
        },
        {
          titulo: 'Vigilancia del desarrollo',
          descripcion: 'Modelo de developmental surveillance: evaluaciones periódicas, seguimiento continuo, integración en atención primaria',
          implementacion: 'Sistema de registro periódico, seguimiento continuo con gráficos temporales, interfaz accesible'
        }
      ],
      citaClave: '"Developmental surveillance through continuous tracking is more effective than episodic screening"',
      aplicaciones: [
        'Sistema completo de vigilancia continua del desarrollo',
        'Múltiples fuentes normativas integradas',
        'Interfaz diseñada para atención primaria y familias',
        'Sistema de alertas automáticas basado en umbrales validados'
      ]
    }
  ];

  return (
    <div className="bibliografia-container">
      <div className="bibliografia-header">
        <h2 style={{
          fontSize: '2.4rem',
          fontWeight: '700',
          color: '#111',
          marginBottom: '1rem',
          letterSpacing: '-0.01em',
          lineHeight: '1.2'
        }}>Fundamentos Científicos</h2>
        <p style={{
          fontSize: '1.2rem',
          color: '#767676',
          lineHeight: '1.8',
          margin: '0',
          fontWeight: '400'
        }}>
          Base científica y guías clínicas para la evaluación del desarrollo infantil mediante análisis de trayectorias.
        </p>
      </div>

      {/* Pestañas para navegar entre guía y referencias */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '20px',
        borderBottom: '2px solid #ddd'
      }}>
        <button
          style={{
            padding: '12px 24px',
            border: 'none',
            borderBottom: pestanaActiva === 'guia' ? '3px solid #2196F3' : '3px solid transparent',
            backgroundColor: pestanaActiva === 'guia' ? '#E3F2FD' : 'transparent',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: pestanaActiva === 'guia' ? 'bold' : 'normal',
            color: pestanaActiva === 'guia' ? '#1976D2' : '#666'
          }}
          onClick={() => setPestanaActiva('guia')}
        >
          📊 Guía de Trayectorias
        </button>
        <button
          style={{
            padding: '12px 24px',
            border: 'none',
            borderBottom: pestanaActiva === 'referencias' ? '3px solid #2196F3' : '3px solid transparent',
            backgroundColor: pestanaActiva === 'referencias' ? '#E3F2FD' : 'transparent',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: pestanaActiva === 'referencias' ? 'bold' : 'normal',
            color: pestanaActiva === 'referencias' ? '#1976D2' : '#666'
          }}
          onClick={() => setPestanaActiva('referencias')}
        >
          📚 Referencias Bibliográficas
        </button>
      </div>

      {/* Contenido de la pestaña Guía de Trayectorias */}
      {pestanaActiva === 'guia' && (
        <GuiaClasificacionTrayectorias />
      )}

      {/* Contenido de la pestaña Referencias */}
      {pestanaActiva === 'referencias' && (
        <div>

      <div className="marco-teorico">
        <h3><i className="fas fa-microscope"></i> Marco Conceptual Integrado</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div className="principio-card">
            <h4>1. Naturaleza Dinámica del Desarrollo</h4>
            <p>El desarrollo es un proceso, no un estado. Las mediciones únicas tienen valor limitado, las trayectorias revelan mecanismos subyacentes.</p>
            <small>Thomas et al. (2009), Annaz et al. (2008)</small>
          </div>
          <div className="principio-card">
            <h4>2. Siete Tipos de Trayectorias Atípicas</h4>
            <p>Thomas et al. (2009) distinguen 7 formas de diferir del control: (1) Delayed onset, (2) Slowed rate, (3) Delayed onset + slowed rate, (4) Nonlinear, (5) Premature asymptote, (6) Zero trajectory, (7) No systematic relationship with age.</p>
            <small>Thomas et al. (2009)</small>
          </div>
          <div className="principio-card">
            <h4>3. Análisis con Derivadas</h4>
            <p>Posición (estado actual), Velocidad (ritmo de cambio), Aceleración (dinámica del cambio).</p>
            <small>Deboeck et al. (2016)</small>
          </div>
          <div className="principio-card">
            <h4>4. Patrones Diagnósticos</h4>
            <p>Los patrones de asincronía entre dominios tienen valor diagnóstico específico.</p>
            <small>Tervo (2006)</small>
          </div>
          <div className="principio-card">
            <h4>5. Vigilancia Continua</h4>
            <p>Seguimiento continuo más efectivo que screening puntual. Múltiples fuentes de información.</p>
            <small>Lajiness-O'Neill et al. (2018)</small>
          </div>
          <div className="principio-card">
            <h4>6. Respeto a la Variabilidad</h4>
            <p>Usar rangos de normalidad (±2 DE), no medias. La varianza es inherente al desarrollo.</p>
            <small>Sices (2007)</small>
          </div>
        </div>
      </div>

      <div className="referencias-completas">
        <h3>📚 Referencias Completas (Formato APA)</h3>
        <ol className="lista-referencias-apa">
          <li>
            Thomas, M. S., Annaz, D., Ansari, D., Scerif, G., Jarrold, C., & Karmiloff-Smith, A. (2009). 
            Using developmental trajectories to understand developmental disorders. 
            <em>Journal of Speech, Language, and Hearing Research, 52</em>(2), 336-358.
          </li>
          <li>
            Thomas, M. S. C. (2016). Understanding delay in developmental disorders. 
            <em>Child Development Perspectives, 10</em>(2), 73-80.
          </li>
          <li>
            Deboeck, P. R., Nicholson, J., Kouros, C., Little, T. D., & Garber, J. (2016). 
            Integrating developmental theory and methodology: Using derivatives to articulate change theories, 
            models, and inferences. <em>Applied Developmental Science, 19</em>(4), 217-231.
          </li>
          <li>
            Tervo, R. C. (2006). Identifying patterns of developmental delays can help diagnose 
            neurodevelopmental disorders. <em>Clinical Pediatrics, 45</em>(6), 509-517.
          </li>
          <li>
            Sices, L. (2007). Use of developmental milestones in pediatric residency training and practice: 
            Time to rethink the meaning of the mean. 
            <em>Journal of Developmental & Behavioral Pediatrics, 28</em>(1), 47-52.
          </li>
          <li>
            Lajiness-O'Neill, R., Brooks, J., Lukomski, A., Schilling, S., Huth-Bocks, A., 
            Warschausky, S., et al. (2018). Development and validation of PediaTrac™: 
            A web-based tool to track developing infants. 
            <em>Infant Behavior and Development, 50</em>, 224-237.
          </li>
        </ol>
      </div>
        </div>
      )}
    </div>
  );
}
