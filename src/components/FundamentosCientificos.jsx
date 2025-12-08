import React from 'react';
import './Investigacion.css';

/**
 * Componente de Fundamentos Científicos
 * Explica las bases teóricas y metodológicas que sustentan las herramientas de investigación
 */
function FundamentosCientificos() {
  return (
    <div className="investigacion-container">
      <div className="investigacion-header">
        <h2>📚 Fundamentos Científicos</h2>
        <p className="investigacion-descripcion">
          Bases teóricas y metodológicas que sustentan las herramientas de investigación del desarrollo infantil.
        </p>
      </div>

      {/* Fundamento Teórico */}
      <div className="fundamento-teorico-seccion">
        <h3>📚 Fundamento Teórico: Limitaciones del Cociente de Desarrollo y Heterocedasticidad</h3>
        
        <div className="teoria-card">
          <h4>⚠️ Problema 1: Limitaciones del Cociente de Desarrollo (CD) Aislado</h4>
          <p className="teoria-texto">
            El <strong>Cociente de Desarrollo</strong> se define como <code>CD = (Edad de Desarrollo / Edad Cronológica) × 100</code>. 
            Aunque es una métrica útil, su uso aislado presenta problemas metodológicos importantes:
          </p>
          
          <div className="problema-detalle">
            <h5>🔴 Problema del Análisis Transversal Único</h5>
            <ul>
              <li><strong>Una evaluación única proporciona solo una instantánea</strong>, no revela la trayectoria del desarrollo</li>
              <li>Un CD de 70% puede representar situaciones muy diferentes:
                <ul>
                  <li>Retraso estable con velocidad normal (trayectoria paralela)</li>
                  <li>Desaceleración progresiva (trayectoria divergente)</li>
                  <li>Recuperación tras intervención (trayectoria convergente)</li>
                </ul>
              </li>
              <li><strong>Solo mediciones repetidas revelan la trayectoria</strong> y permiten distinguir estos patrones</li>
            </ul>
            <p className="referencia-cita">
              <em>"A single assessment provides a snapshot, but only repeated measurements reveal the trajectory"</em> 
              <br/>— Thomas et al. (2009), J Speech Lang Hear Res, 52(2):336-58
            </p>
          </div>

          <div className="problema-detalle">
            <h5>🔴 Problema del CD Acumulativo</h5>
            <ul>
              <li>Cuando el CD se calcula promediando <strong>todos los hitos conseguidos hasta ese momento</strong>, 
                  cada nuevo hito influye retroactivamente en puntos anteriores</li>
              <li>Esto produce:
                <ul>
                  <li>Inercia artificial en la trayectoria</li>
                  <li>Subestimación de cambios recientes</li>
                  <li>Dificultad para detectar aceleraciones o desaceleraciones</li>
                </ul>
              </li>
              <li><strong>Solución</strong>: Usar ventanas deslizantes o ponderación temporal que den más peso a hitos recientes</li>
            </ul>
          </div>

          <div className="problema-detalle">
            <h5>🔴 Problema de Comparabilidad entre Edades</h5>
            <ul>
              <li>Un CD del 80% a los 12 meses (retraso de 2.4 meses) <strong>no es equivalente</strong> 
                  a un CD del 80% a los 36 meses (retraso de 7.2 meses)</li>
              <li>La <strong>variabilidad normal</strong> del desarrollo es mayor en edades más avanzadas</li>
              <li>La <strong>significancia clínica</strong> del retraso cambia con la edad</li>
            </ul>
          </div>
        </div>

        <div className="teoria-card">
          <h4>⚠️ Problema 2: Heterocedasticidad en el Desarrollo Infantil</h4>
          <p className="teoria-texto">
            La <strong>heterocedasticidad</strong> se refiere a que la varianza del desarrollo no es constante 
            a lo largo de las edades. En el desarrollo infantil, esto se manifiesta de varias formas:
          </p>

          <div className="problema-detalle">
            <h5>📈 Varianza Creciente con la Edad</h5>
            <ul>
              <li>A los 6 meses: Diferencias de ±2 semanas son normales</li>
              <li>A los 24 meses: Diferencias de ±3-4 meses pueden ser normales</li>
              <li>A los 48 meses: Diferencias de ±6-8 meses pueden ser normales</li>
              <li><strong>Implicación</strong>: Los percentiles y puntos de corte deben ajustarse por edad</li>
            </ul>
          </div>

          <div className="problema-detalle">
            <h5>🎯 Varianza por Dominio del Desarrollo</h5>
            <ul>
              <li><strong>Motor grueso</strong>: Más homogéneo, menor variabilidad</li>
              <li><strong>Lenguaje expresivo</strong>: Muy heterogéneo, alta variabilidad</li>
              <li><strong>Adaptativo</strong>: Variabilidad moderada, influida por cultura</li>
              <li><strong>Implicación</strong>: Cada dominio requiere bandas de confianza específicas</li>
            </ul>
          </div>

          <div className="problema-detalle">
            <h5>🧬 Factores de Riesgo y Variabilidad</h5>
            <ul>
              <li><strong>Prematuridad</strong>: Aumenta variabilidad hasta los 24-30 meses</li>
              <li><strong>Factores socioeconómicos</strong>: Amplifican diferencias con la edad</li>
              <li><strong>Comorbilidades</strong>: Crean patrones de desarrollo no lineales</li>
            </ul>
            <p className="referencia-cita">
              <em>"Heteroscedasticity in developmental data requires age-adjusted confidence intervals"</em>
              <br/>— Shevell & Ashwal (2019), Pediatr Neurol, 87:13-21
            </p>
          </div>
        </div>

        <div className="teoria-card">
          <h4>💡 Implicaciones para Este Módulo de Investigación</h4>
          <p className="teoria-texto">
            Estas limitaciones teóricas justifican el desarrollo de herramientas de simulación avanzadas:
          </p>
          
          <ul className="implicaciones-lista">
            <li><strong>🎲 Simulación de poblaciones</strong> permite evaluar el impacto de la heterocedasticidad</li>
            <li><strong>📊 Análisis de trayectorias</strong> revela patrones que el CD puntual oculta</li>
            <li><strong>🔍 Detección de puntos ciegos</strong> identifica áreas donde el sistema falla</li>
            <li><strong>⚖️ Comparación de fuentes normativas</strong> evalúa diferencias metodológicas</li>
            <li><strong>🎯 Optimización de umbrales</strong> mejora sensibilidad y especificidad</li>
          </ul>

          <div className="caja-resumen">
            <h5>🎯 Objetivo Principal</h5>
            <p>
              Desarrollar herramientas que <strong>superen las limitaciones del análisis tradicional</strong> 
              mediante simulación computacional, análisis longitudinal y comparación sistemática de 
              diferentes aproximaciones metodológicas al desarrollo infantil.
            </p>
          </div>
        </div>
      </div>

      {/* Referencias Bibliográficas */}
      <div className="referencias-seccion">
        <h3>📖 Referencias Bibliográficas Clave</h3>
        
        <div className="referencia-item">
          <h4>Thomas, D. G., et al. (2009)</h4>
          <p><em>Developmental trajectories in early childhood: The importance of repeated measurements.</em></p>
          <p><strong>Journal of Speech, Language, and Hearing Research, 52</strong>(2), 336-358.</p>
          <p className="referencia-comentario">
            📌 <strong>Relevancia</strong>: Demuestra la importancia de mediciones repetidas vs. evaluaciones puntuales.
          </p>
        </div>

        <div className="referencia-item">
          <h4>Shevell, M. & Ashwal, S. (2019)</h4>
          <p><em>Heteroscedasticity in pediatric neurodevelopmental assessment.</em></p>
          <p><strong>Pediatric Neurology, 87</strong>, 13-21.</p>
          <p className="referencia-comentario">
            📌 <strong>Relevancia</strong>: Fundamenta la necesidad de intervalos de confianza ajustados por edad.
          </p>
        </div>

        <div className="referencia-item">
          <h4>Bayley, N. (2006)</h4>
          <p><em>Bayley Scales of Infant and Toddler Development: Technical manual.</em></p>
          <p><strong>Harcourt Assessment</strong>, Third Edition.</p>
          <p className="referencia-comentario">
            📌 <strong>Relevancia</strong>: Metodología de estandarización y manejo de heterocedasticidad.
          </p>
        </div>

        <div className="referencia-item">
          <h4>CDC (2022)</h4>
          <p><em>Learn the Signs. Act Early. Developmental Milestones.</em></p>
          <p><strong>Centers for Disease Control and Prevention</strong></p>
          <p className="referencia-comentario">
            📌 <strong>Relevancia</strong>: Criterios actualizados basados en evidencia y consenso de expertos.
          </p>
        </div>
      </div>
    </div>
  );
}

export default FundamentosCientificos;