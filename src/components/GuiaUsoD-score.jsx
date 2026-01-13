import React from 'react';
import './DScore.css';

const GuiaUsoDScore = () => {
  return (
    <div className="d-score-educacion">
      <div className="d-score-header">
        <h1>🎯 D-score y GSED: Guía Profesional</h1>
        <p className="subtitle">Metodología estandarizada de la OMS para evaluación del desarrollo infantil temprano</p>
      </div>

      {/* Sección GSED Principal */}
      <div className="d-score-card" style={{ backgroundColor: '#f0f9ff', borderLeft: '4px solid #0284c7' }}>
        <h2>📌 ¿Qué es la GSED?</h2>
        <p style={{ fontSize: '1.1rem', lineHeight: '1.8' }}>
          Las <strong>Global Scales for Early Development (GSED)</strong> son un paquete de herramientas 
          de acceso abierto diseñado por la <strong>OMS</strong> para medir el desarrollo integral de niños 
          desde el nacimiento hasta los <strong>36 meses (3 años)</strong> a nivel poblacional y programático 
          en cualquier país del mundo.
        </p>
        <p style={{ fontSize: '1rem', color: '#475569', marginTop: '1rem' }}>
          El paquete fue publicado como <strong>versión 1.0 en 2023</strong> y equipara la medición del 
          desarrollo infantil a la medición del crecimiento físico (como peso o estatura), pero en este 
          caso para habilidades del desarrollo.
        </p>
      </div>

      {/* Imagen GSED */}
      <div className="d-score-card">
        <div style={{ textAlign: 'center' }}>
          <img 
            src="/gsed.jpeg" 
            alt="GSED - Global Scales for Early Development" 
            style={{ 
              maxWidth: '100%', 
              height: 'auto', 
              borderRadius: '12px',
              border: '2px solid #e5e7eb',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }} 
          />
          <p style={{ 
            marginTop: '0.75rem', 
            fontSize: '0.9rem', 
            color: '#64748b',
            fontStyle: 'italic'
          }}>
            Estructura de las escalas GSED para evaluación del desarrollo infantil
          </p>
        </div>
      </div>

      {/* Objetivo Principal */}
      <div className="d-score-card">
        <h2>📊 Objetivo Principal</h2>
        <p>Su propósito es ofrecer una metodología estandarizada, válida y comparable internacionalmente para:</p>
        <div className="d-score-grid" style={{ marginTop: '1rem' }}>
          <div style={{ padding: '1rem', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #86efac' }}>
            <h4>🧠 Medición Holística</h4>
            <p>Medir el desarrollo infantil de forma integral: motor, cognitivo, lenguaje y socioemocional.</p>
          </div>
          <div style={{ padding: '1rem', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #93c5fd' }}>
            <h4>🌍 Comparación Global</h4>
            <p>Comparar datos entre países o regiones con una escala común.</p>
          </div>
          <div style={{ padding: '1rem', backgroundColor: '#fef3c7', borderRadius: '8px', border: '1px solid #fcd34d' }}>
            <h4>📈 Monitoreo de Tendencias</h4>
            <p>Monitorear tendencias nacionales y globales del desarrollo infantil.</p>
          </div>
          <div style={{ padding: '1rem', backgroundColor: '#fce7f3', borderRadius: '8px', border: '1px solid #f9a8d4' }}>
            <h4>🎯 Evaluación de Programas</h4>
            <p>Evaluar programas o intervenciones enfocados en la primera infancia.</p>
          </div>
        </div>
      </div>

      {/* Cómo funciona */}
      <div className="d-score-card" style={{ backgroundColor: '#fefce8', borderLeft: '4px solid #eab308' }}>
        <h2>🧠 ¿Cómo Funciona?</h2>
        <p style={{ fontSize: '1.05rem', marginBottom: '1rem' }}>
          Las GSED generan una <strong>puntuación del desarrollo (D-score)</strong>, una unidad común 
          que resume el nivel de desarrollo de cada niño en múltiples dominios.
        </p>
        <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '8px', marginTop: '1rem' }}>
          <h4>Esto permite:</h4>
          <ul style={{ marginTop: '0.5rem' }}>
            <li>✅ Una comparación más <strong>objetiva</strong> que las mediciones tradicionales que solo consideran hitos aislados</li>
            <li>✅ Analizar si los niños están <strong>"desarrollándose en la ruta esperada"</strong> para su edad</li>
            <li>✅ Generar datos <strong>comparables internacionalmente</strong></li>
          </ul>
        </div>
      </div>

      {/* Paquete GSED */}
      <div className="d-score-card">
        <h2>🧰 ¿Qué Incluye el Paquete GSED v1.0?</h2>
        <div className="d-score-grid" style={{ marginTop: '1rem' }}>
          <div className="d-score-card" style={{ backgroundColor: '#f8fafc' }}>
            <h4>📘 Reporte Técnico</h4>
            <p>Metodología completa y propiedades psicométricas validadas.</p>
          </div>
          <div className="d-score-card" style={{ backgroundColor: '#f8fafc' }}>
            <h4>📋 Short Form (SF)</h4>
            <p>Formulario breve basado en reporte del cuidador (rápido y práctico).</p>
          </div>
          <div className="d-score-card" style={{ backgroundColor: '#f8fafc' }}>
            <h4>📋 Long Form (LF)</h4>
            <p>Formulario largo administrado directamente al niño (evaluación detallada).</p>
          </div>
          <div className="d-score-card" style={{ backgroundColor: '#f8fafc' }}>
            <h4>🧭 Guías de Uso</h4>
            <p>Manuales detallados de ítems para SF y LF.</p>
          </div>
          <div className="d-score-card" style={{ backgroundColor: '#f8fafc' }}>
            <h4>📊 Herramientas de Puntuación</h4>
            <p>Software y guías para calcular el D-score correctamente.</p>
          </div>
          <div className="d-score-card" style={{ backgroundColor: '#f8fafc' }}>
            <h4>🌐 Adaptación Cultural</h4>
            <p>Herramientas para traducción y adaptación a diferentes contextos.</p>
          </div>
        </div>
        <div className="d-score-alert d-score-alert-success" style={{ marginTop: '1rem' }}>
          <strong>✅ Acceso Abierto:</strong> Todos estos materiales están disponibles gratuitamente.
        </div>
      </div>

      {/* Validación */}
      <div className="d-score-card">
        <h2>📍 Validación y Ámbito de Uso</h2>
        <p>
          La herramienta fue <strong>validada inicialmente en tres países</strong> (Bangladesh, Pakistán y Tanzania) 
          con resultados positivos en su fiabilidad y validez, y se están recopilando más datos en otros lugares 
          para ampliar su validez global.
        </p>
        <h4 style={{ marginTop: '1.5rem', marginBottom: '0.75rem' }}>Puede ser utilizada por:</h4>
        <div className="d-score-grid">
          <div style={{ padding: '1rem', backgroundColor: '#f1f5f9', borderRadius: '8px' }}>
            <strong>🏛️ Gobiernos</strong>
            <p>Programas nacionales para monitoreo poblacional</p>
          </div>
          <div style={{ padding: '1rem', backgroundColor: '#f1f5f9', borderRadius: '8px' }}>
            <strong>🔬 Investigadores</strong>
            <p>Estudios de desarrollo infantil</p>
          </div>
          <div style={{ padding: '1rem', backgroundColor: '#f1f5f9', borderRadius: '8px' }}>
            <strong>🌍 Organizaciones Internacionales</strong>
            <p>ONGs para evaluar intervenciones</p>
          </div>
          <div style={{ padding: '1rem', backgroundColor: '#f1f5f9', borderRadius: '8px' }}>
            <strong>👨‍⚕️ Profesionales de Salud</strong>
            <p>Pediatras y equipos de atención primaria</p>
          </div>
        </div>
      </div>

      {/* Importancia Global */}
      <div className="d-score-card" style={{ backgroundColor: '#fef2f2', borderLeft: '4px solid #dc2626' }}>
        <h2>🌍 Importancia Global</h2>
        <p style={{ fontSize: '1.05rem', lineHeight: '1.8' }}>
          Antes de las GSED, <strong>no existía una escala internacional uniforme</strong> para medir el 
          desarrollo infantil en los primeros 3 años con comparación global. Las GSED buscan llenar ese 
          vacío y apoyar el logro de metas como el <strong>Indicador 4.2.1 de los Objetivos de Desarrollo 
          Sostenible</strong> (medición de desarrollo infantil temprano).
        </p>
      </div>

      <div style={{ marginTop: '3rem', marginBottom: '2rem', textAlign: 'center', padding: '2rem', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
        <h2 style={{ color: '#1e40af', fontSize: '2rem', marginBottom: '0.5rem' }}>
          📖 Guía Práctica de Uso del D-score
        </h2>
        <p style={{ color: '#64748b', fontSize: '1.1rem' }}>
          Implementación y interpretación en evaluación clínica
        </p>
      </div>

      <div className="d-score-grid">
        {/* Paso 1 */}
        <div className="d-score-card" style={{ borderTop: '3px solid #3b82f6' }}>
          <h3>1️⃣ Recolección de Datos</h3>
          <p><strong>Datos necesarios para calcular el D-score:</strong></p>
          <ul>
            <li>✓ Lista de hitos del desarrollo evaluados (logrado/no logrado)</li>
            <li>✓ Edad cronológica del niño en meses</li>
            <li>✓ Edad de logro para cada hito conseguido</li>
            <li>✓ Mínimo <strong>10-15 hitos</strong> para resultados confiables</li>
          </ul>
          
          <div className="d-score-alert d-score-alert-info">
            <strong>💡 Recomendación:</strong> Utiliza múltiples fuentes normativas (CDC, OMS, GCDG) para mayor validez científica.
          </div>
        </div>

        {/* Paso 2 */}
        <div className="d-score-card" style={{ borderTop: '3px solid #10b981' }}>
          <h3>2️⃣ Cálculo Automático del D-score</h3>
          <p><strong>El sistema calcula automáticamente:</strong></p>
          <ul>
            <li>📊 <strong>D-score:</strong> Puntuación de desarrollo (rango 15-85)</li>
            <li>📈 <strong>DAZ (D-score-for-Age Z-score):</strong> Puntuación Z ajustada por edad</li>
            <li>📏 <strong>SEM:</strong> Error estándar de medición (precisión)</li>
            <li>🎯 <strong>Proporción:</strong> Porcentaje de hitos logrados</li>
          </ul>
          
          <div className="d-score-alert d-score-alert-success">
            <strong>✅ Basado en modelo Rasch:</strong> Metodología psicométrica validada internacionalmente.
          </div>
        </div>

        {/* Paso 3 */}
        <div className="d-score-card" style={{ borderTop: '3px solid #f59e0b' }}>
          <h3>3️⃣ Interpretación Clínica del DAZ</h3>
          <p><strong>Clasificación según desviaciones estándar:</strong></p>
          <div style={{ marginTop: '1rem' }}>
            <div className="d-score-badge d-score-badge-green" style={{ marginRight: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem 1rem' }}>
              DAZ ≥ +1.0: Desarrollo Superior
            </div>
            <div className="d-score-badge d-score-badge-blue" style={{ marginRight: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem 1rem' }}>
              DAZ +0.5 a +0.9: Sobre el Promedio
            </div>
            <div className="d-score-badge" style={{ backgroundColor: '#e5e7eb', color: '#374151', marginRight: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem 1rem' }}>
              DAZ -0.5 a +0.5: Desarrollo Típico
            </div>
            <div className="d-score-badge d-score-badge-yellow" style={{ marginRight: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem 1rem' }}>
              DAZ -1.0 a -0.5: Ligeramente Bajo
            </div>
            <div className="d-score-badge d-score-badge-red" style={{ marginBottom: '0.5rem', padding: '0.5rem 1rem' }}>
              DAZ ≤ -1.0: Requiere Evaluación
            </div>
          </div>
        </div>

        {/* Paso 4 */}
        <div className="d-score-card" style={{ borderTop: '3px solid #8b5cf6' }}>
          <h3>4️⃣ Decisiones Clínicas Basadas en Evidencia</h3>
          <p><strong>Protocolo de actuación según resultados:</strong></p>
          <ul>
            <li>🟢 <strong>Superior:</strong> Continuar estimulación actual, considerar actividades de enriquecimiento</li>
            <li>🔵 <strong>Típico:</strong> Mantener rutinas, monitoreo regular en controles programados</li>
            <li>🟡 <strong>Bajo:</strong> Incrementar actividades de estimulación, consultar en próxima cita</li>
            <li>🔴 <strong>Preocupante:</strong> Derivación a evaluación especializada urgente</li>
          </ul>
        </div>
      </div>

      {/* Ventajas Científicas */}
      <div className="d-score-card" style={{ backgroundColor: '#ecfdf5', borderLeft: '4px solid #10b981', marginTop: '2rem' }}>
        <h2>🔬 Ventajas Científicas del D-score</h2>
        <div className="d-score-grid" style={{ marginTop: '1rem' }}>
          <div>
            <h4>📊 Objetividad</h4>
            <p>Basado en modelo matemático robusto (Teoría de Respuesta al Ítem - Rasch)</p>
          </div>
          <div>
            <h4>🌍 Comparabilidad</h4>
            <p>Permite comparación entre niños, culturas, países y momentos temporales</p>
          </div>
          <div>
            <h4>🔍 Sensibilidad</h4>
            <p>Detecta cambios pequeños en el desarrollo que otras escalas no captan</p>
          </div>
          <div>
            <h4>✅ Validación</h4>
            <p>Respaldado por datos de más de 28,000 niños en múltiples países</p>
          </div>
        </div>
      </div>

      {/* Limitaciones */}
      <div className="d-score-card" style={{ backgroundColor: '#fef2f2', borderLeft: '4px solid #ef4444' }}>
        <h2>⚠️ Limitaciones y Consideraciones</h2>
        <ul style={{ fontSize: '1.05rem', lineHeight: '1.8' }}>
          <li>🔸 <strong>No es diagnóstico:</strong> Es una herramienta de <em>cribado</em>, no sustituye evaluación especializada</li>
          <li>🔸 <strong>Interpretación profesional obligatoria:</strong> Requiere conocimiento clínico del desarrollo infantil</li>
          <li>🔸 <strong>Contexto cultural:</strong> Considerar siempre factores socioculturales y ambientales del niño</li>
          <li>🔸 <strong>Calidad de datos:</strong> Los resultados dependen de la precisión en la evaluación de hitos</li>
        </ul>
      </div>

      {/* Ejemplos Prácticos */}
      <div className="d-score-card" style={{ marginTop: '2rem' }}>
        <h2>📋 Casos Clínicos de Ejemplo</h2>
        
        <div className="d-score-grid">
          <div style={{ padding: '1.5rem', backgroundColor: '#f0fdf4', borderRadius: '12px', border: '2px solid #bbf7d0' }}>
            <h4 style={{ color: '#166534', marginBottom: '0.75rem' }}>Caso 1: Desarrollo Superior</h4>
            <p><strong>Datos:</strong> María, 18 meses, D-score: 58, DAZ: +1.2</p>
            <p><strong>Interpretación:</strong> Desarrollo superior al promedio para su edad</p>
            <p><strong>Acción:</strong> Continuar estimulación actual, considerar actividades enriquecidas apropiadas</p>
          </div>
          
          <div style={{ padding: '1.5rem', backgroundColor: '#fffbeb', borderRadius: '12px', border: '2px solid #fcd34d' }}>
            <h4 style={{ color: '#92400e', marginBottom: '0.75rem' }}>Caso 2: Monitoreo Necesario</h4>
            <p><strong>Datos:</strong> Carlos, 24 meses, D-score: 52, DAZ: -0.8</p>
            <p><strong>Interpretación:</strong> Ligeramente por debajo del promedio esperado</p>
            <p><strong>Acción:</strong> Incrementar actividades de estimulación, reevaluar en próxima consulta</p>
          </div>
          
          <div style={{ padding: '1.5rem', backgroundColor: '#fee2e2', borderRadius: '12px', border: '2px solid #fca5a5' }}>
            <h4 style={{ color: '#dc2626', marginBottom: '0.75rem' }}>Caso 3: Evaluación Urgente</h4>
            <p><strong>Datos:</strong> Ana, 30 meses, D-score: 45, DAZ: -1.5</p>
            <p><strong>Interpretación:</strong> Significativamente por debajo del promedio</p>
            <p><strong>Acción:</strong> Derivación urgente a neuropediatra, considerar intervención temprana</p>
          </div>
        </div>
      </div>

      {/* Mejores Prácticas */}
      <div className="d-score-card">
        <h2>🎯 Mejores Prácticas Profesionales</h2>
        
        <div className="d-score-grid">
          <div>
            <h4>🔍 Durante la Evaluación</h4>
            <ul>
              <li>✓ Usar ambiente natural y cómodo para el niño</li>
              <li>✓ Permitir múltiples intentos sin presión</li>
              <li>✓ Involucrar activamente a los cuidadores</li>
              <li>✓ Considerar estado del niño (alimentación, sueño, ánimo)</li>
            </ul>
          </div>
          
          <div>
            <h4>📊 Al Interpretar Resultados</h4>
            <ul>
              <li>✓ Considerar siempre el error estándar (SEM)</li>
              <li>✓ Evaluar patrón evolutivo, no solo puntuación aislada</li>
              <li>✓ Incluir observación cualitativa del comportamiento</li>
              <li>✓ Considerar factores contextuales y culturales</li>
            </ul>
          </div>
          
          <div>
            <h4>📈 En el Seguimiento Longitudinal</h4>
            <ul>
              <li>✓ Evaluar cambios y tendencias en el tiempo</li>
              <li>✓ Documentar todas las intervenciones aplicadas</li>
              <li>✓ Usar mismos instrumentos para comparabilidad</li>
              <li>✓ Monitorear progreso de forma regular</li>
            </ul>
          </div>
          
          <div>
            <h4>👥 Comunicación con Familias</h4>
            <ul>
              <li>✓ Explicar resultados en términos comprensibles</li>
              <li>✓ Enfocarse primero en fortalezas del niño</li>
              <li>✓ Dar recomendaciones prácticas y concretas</li>
              <li>✓ Ofrecer recursos de apoyo y seguimiento</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Recursos Adicionales */}
      <div className="d-score-card" style={{ backgroundColor: '#f0f9ff' }}>
        <h2>📚 Recursos Adicionales y Referencias</h2>
        <div className="d-score-grid">
          <div>
            <h4>🔗 Enlaces Oficiales</h4>
            <ul>
              <li>• <a href="https://d-score.org" target="_blank" rel="noopener noreferrer">D-score.org - Sitio oficial</a></li>
              <li>• <a href="https://d-score.org/childdevdata/" target="_blank" rel="noopener noreferrer">Base de datos GCDG</a></li>
              <li>• <a href="https://www.who.int/teams/maternal-newborn-child-adolescent-health-and-ageing/child-health/child-development/gsed" target="_blank" rel="noopener noreferrer">OMS - GSED oficial</a></li>
              <li>• Documentación técnica paquete R</li>
            </ul>
          </div>
          
          <div>
            <h4>📖 Literatura Científica Clave</h4>
            <ul>
              <li>• van Buuren (2014) - Stat Methods Med Res</li>
              <li>• GCDG (2023) - Child Development Repository</li>
              <li>• Artículos de validación transcultural</li>
              <li>• Guías de interpretación clínica OMS</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Nota Final */}
      <div className="d-score-alert d-score-alert-info" style={{ marginTop: '2rem' }}>
        <h4>⚡ Sobre esta Implementación</h4>
        <p style={{ fontSize: '1rem', lineHeight: '1.7' }}>
          Esta implementación del D-score es una versión educativa simplificada basada en la metodología original 
          de las GSED. Para <strong>uso clínico profesional o investigación</strong>, se recomienda utilizar la 
          implementación oficial del paquete R 'dscore' disponible en{' '}
          <a href="https://d-score.org" target="_blank" rel="noopener noreferrer">d-score.org</a>.
          Esta herramienta es de apoyo educativo y debe complementarse siempre con criterio clínico profesional.
        </p>
      </div>
    </div>
  );
};

export default GuiaUsoDScore;
