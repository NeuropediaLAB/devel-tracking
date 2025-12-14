import React from 'react';
import './DScore.css';

const GuiaUsoDScore = () => {
  return (
    <div className="d-score-educacion">
      <div className="d-score-header">
        <h1>🎯 Guía Práctica del D-score</h1>
        <p>Cómo usar e interpretar el D-score en la evaluación del desarrollo infantil</p>
      </div>

      <div className="d-score-grid">
        {/* Paso 1 */}
        <div className="d-score-card">
          <h3>1️⃣ Recolectar Datos de Hitos</h3>
          <p><strong>¿Qué necesitas?</strong></p>
          <ul>
            <li>• Lista de hitos evaluados (logrado/no logrado)</li>
            <li>• Edad cronológica del niño en meses</li>
            <li>• Edad de logro para hitos conseguidos</li>
            <li>• Mínimo 10-15 hitos para resultados confiables</li>
          </ul>
          
          <div className="d-score-alert d-score-alert-info">
            <strong>💡 Consejo:</strong> Utiliza múltiples fuentes normativas (CDC, OMS, GCDG) para mayor validez.
          </div>
        </div>

        {/* Paso 2 */}
        <div className="d-score-card">
          <h3>2️⃣ Calcular el D-score</h3>
          <p><strong>El sistema calcula automáticamente:</strong></p>
          <ul>
            <li>• <strong>D-score:</strong> Puntuación de desarrollo (15-85)</li>
            <li>• <strong>DAZ:</strong> Z-score ajustado por edad</li>
            <li>• <strong>SEM:</strong> Error estándar de medición</li>
            <li>• <strong>Proporción:</strong> % de hitos logrados</li>
          </ul>
          
          <div className="d-score-alert d-score-alert-success">
            <strong>✅ Automático:</strong> El cálculo se basa en el modelo Rasch implementado.
          </div>
        </div>

        {/* Paso 3 */}
        <div className="d-score-card">
          <h3>3️⃣ Interpretar Resultados</h3>
          <p><strong>Niveles de interpretación DAZ:</strong></p>
          <div style={{ marginTop: '1rem' }}>
            <div className="d-score-badge d-score-badge-green" style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}>
              DAZ ≥ +1.0: Superior
            </div>
            <div className="d-score-badge d-score-badge-blue" style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}>
              DAZ +0.5 a +0.9: Sobre promedio
            </div>
            <div className="d-score-badge" style={{ backgroundColor: '#f3f4f6', color: '#374151', marginRight: '0.5rem', marginBottom: '0.5rem' }}>
              DAZ -0.5 a +0.5: Típico
            </div>
            <div className="d-score-badge d-score-badge-yellow" style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}>
              DAZ -1.0 a -0.5: Ligeramente bajo
            </div>
            <div className="d-score-badge d-score-badge-red" style={{ marginBottom: '0.5rem' }}>
              DAZ ≤ -1.0: Preocupante
            </div>
          </div>
        </div>

        {/* Paso 4 */}
        <div className="d-score-card">
          <h3>4️⃣ Tomar Decisiones Clínicas</h3>
          <p><strong>Según el resultado:</strong></p>
          <ul>
            <li>• <strong>Superior:</strong> Continuar estimulación, considerar enriquecimiento</li>
            <li>• <strong>Típico:</strong> Mantener rutinas actuales, monitoreo regular</li>
            <li>• <strong>Bajo:</strong> Incrementar actividades, consultar pediatra</li>
            <li>• <strong>Preocupante:</strong> Evaluación profesional urgente</li>
          </ul>
        </div>

        {/* Ventajas */}
        <div className="d-score-card">
          <h3>🔬 Ventajas Científicas</h3>
          <ul>
            <li>• <strong>Objetividad:</strong> Basado en modelo matemático robusto</li>
            <li>• <strong>Comparabilidad:</strong> Entre niños, culturas y tiempos</li>
            <li>• <strong>Sensibilidad:</strong> Detecta cambios pequeños</li>
            <li>• <strong>Validez:</strong> Respaldado por 28,000+ niños</li>
          </ul>
        </div>

        {/* Limitaciones */}
        <div className="d-score-card">
          <h3>⚠️ Limitaciones Importantes</h3>
          <ul>
            <li>• <strong>No es diagnóstico:</strong> Es una herramienta de cribado</li>
            <li>• <strong>Requiere interpretación profesional</strong></li>
            <li>• <strong>Contexto cultural:</strong> Considerar factores ambientales</li>
            <li>• <strong>Calidad de datos:</strong> Depende de evaluación precisa</li>
          </ul>
        </div>
      </div>

      {/* Ejemplos Prácticos */}
      <div className="d-score-card" style={{ marginTop: '2rem' }}>
        <h3>📋 Ejemplos Prácticos de Interpretación</h3>
        
        <div className="d-score-grid">
          <div style={{ padding: '1rem', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
            <h4 style={{ color: '#166534' }}>Caso 1: Desarrollo Superior</h4>
            <p><strong>Datos:</strong> María, 18 meses, D-score: 58, DAZ: +1.2</p>
            <p><strong>Interpretación:</strong> Desarrollo superior al promedio</p>
            <p><strong>Acción:</strong> Continuar estimulación, considerar actividades enriquecidas</p>
          </div>
          
          <div style={{ padding: '1rem', backgroundColor: '#fffbeb', borderRadius: '8px', border: '1px solid #fcd34d' }}>
            <h4 style={{ color: '#92400e' }}>Caso 2: Monitoreo Necesario</h4>
            <p><strong>Datos:</strong> Carlos, 24 meses, D-score: 52, DAZ: -0.8</p>
            <p><strong>Interpretación:</strong> Ligeramente por debajo del promedio</p>
            <p><strong>Acción:</strong> Incrementar actividades, consultar en próxima cita</p>
          </div>
          
          <div style={{ padding: '1rem', backgroundColor: '#fee2e2', borderRadius: '8px', border: '1px solid #fca5a5' }}>
            <h4 style={{ color: '#dc2626' }}>Caso 3: Evaluación Urgente</h4>
            <p><strong>Datos:</strong> Ana, 30 meses, D-score: 45, DAZ: -1.5</p>
            <p><strong>Interpretación:</strong> Significativamente por debajo del promedio</p>
            <p><strong>Acción:</strong> Evaluación profesional urgente, considerar intervención temprana</p>
          </div>
        </div>
      </div>

      {/* Mejores Prácticas */}
      <div className="d-score-card">
        <h3>🎯 Mejores Prácticas</h3>
        
        <div className="d-score-grid">
          <div>
            <h4>🔍 Durante la Evaluación</h4>
            <ul>
              <li>• Usar ambiente natural del niño</li>
              <li>• Permitir múltiples intentos</li>
              <li>• Involucrar a cuidadores</li>
              <li>• Considerar estado del niño (hambre, sueño)</li>
            </ul>
          </div>
          
          <div>
            <h4>📊 Al Interpretar</h4>
            <ul>
              <li>• Considerar error estándar (SEM)</li>
              <li>• Evaluar patrón, no solo puntuación</li>
              <li>• Incluir observación cualitativa</li>
              <li>• Considerar factores contextuales</li>
            </ul>
          </div>
          
          <div>
            <h4>📈 En el Seguimiento</h4>
            <ul>
              <li>• Evaluar cambios en el tiempo</li>
              <li>• Documentar intervenciones</li>
              <li>• Usar mismos instrumentos</li>
              <li>• Monitorear progreso regularmente</li>
            </ul>
          </div>
          
          <div>
            <h4>👥 Con Familias</h4>
            <ul>
              <li>• Explicar en términos simples</li>
              <li>• Enfocarse en fortalezas</li>
              <li>• Dar recomendaciones concretas</li>
              <li>• Ofrecer recursos y apoyo</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Recursos Adicionales */}
      <div className="d-score-card">
        <h3>📚 Recursos Adicionales</h3>
        <div className="d-score-grid">
          <div>
            <h4>🔗 Enlaces Útiles</h4>
            <ul>
              <li>• <a href="https://d-score.org" target="_blank" rel="noopener noreferrer">D-score.org - Sitio oficial</a></li>
              <li>• <a href="https://d-score.org/childdevdata/" target="_blank" rel="noopener noreferrer">Base de datos GCDG</a></li>
              <li>• Documentación técnica R package</li>
              <li>• Artículos científicos relevantes</li>
            </ul>
          </div>
          
          <div>
            <h4>📖 Literatura Clave</h4>
            <ul>
              <li>• van Buuren (2014) - Statistical Methods in Medical Research</li>
              <li>• GCDG (2023) - Child Development Data Repository</li>
              <li>• Artículos de validación cross-cultural</li>
              <li>• Guías de interpretación clínica</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Nota Final */}
      <div className="d-score-alert d-score-alert-info">
        <h4>⚡ Implementación en esta Aplicación</h4>
        <p>
          Esta implementación del D-score es una versión educativa simplificada basada en la metodología original. 
          Para uso clínico o de investigación profesional, se recomienda usar la implementación oficial del 
          paquete R 'dscore' disponible en <a href="https://d-score.org" target="_blank" rel="noopener noreferrer">d-score.org</a>.
        </p>
      </div>
    </div>
  );
};

export default GuiaUsoDScore;