import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, ReferenceLine } from 'recharts';
import './Investigacion.css';

/**
 * Componente de Fundamentos Científicos
 * Explica las bases teóricas y metodológicas que sustentan las herramientas de investigación
 */
function FundamentosCientificos() {
  return (
    <div className="investigacion-container">
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
        }}>Limitaciones Estadísticas</h2>
        <p style={{
          fontSize: '1.2rem',
          color: 'white',
          lineHeight: '1.8',
          margin: '0',
          fontWeight: '400'
        }}>
          Análisis de las limitaciones estadísticas en la evaluación del desarrollo infantil y metodologías alternativas.
        </p>
      </div>

      {/* Limitaciones Estadísticas */}
      <div className="fundamento-teorico-seccion">
        
        <div className="teoria-card">
          <h3>⚠️ Problema 1: Limitaciones del Cociente de Desarrollo (CD) Aislado</h3>
          <p className="teoria-texto">
            El <strong>Cociente de Desarrollo</strong> se define como <code>CD = (Edad de Desarrollo / Edad Cronológica) × 100</code>. 
            Aunque es una métrica útil, su uso aislado presenta problemas metodológicos importantes:
          </p>
          
          <div className="problema-detalle">
            <h4>🔴 Problema del Análisis Transversal Único</h4>
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

          {/* Gráfica explicativa del análisis transversal */}
          <div className="grafica-explicativa">
            <h4>📊 Visualización: Problema del Análisis Transversal Único</h4>
            <div style={{ width: '100%', height: '400px', marginTop: '1rem', background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #ddd' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={[
                    // Datos que muestran diferentes trayectorias con CD similares
                    { edad: 6, caso1: 6, caso2: 6, caso3: 6, tipico: 6 },
                    { edad: 12, caso1: 12, caso2: 12, caso3: 12, tipico: 12 },
                    { edad: 18, caso1: 18, caso2: 15, caso3: 18, tipico: 18 },
                    { edad: 24, caso1: 24, caso2: 17, caso3: 20, tipico: 24 },
                    { edad: 30, caso1: 30, caso2: 18, caso3: 24, tipico: 30 },
                    { edad: 36, caso1: 36, caso2: 18, caso3: 30, tipico: 36 },
                  ]}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="edad" 
                    label={{ value: 'Edad Cronológica (meses)', position: 'insideBottom', offset: -10 }}
                  />
                  <YAxis 
                    label={{ value: 'Edad de Desarrollo (meses)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    formatter={(value, name) => {
                      const nombres = {
                        tipico: 'Desarrollo Típico',
                        caso1: 'Caso 1: Retraso estable (CD=100→100%)',  
                        caso2: 'Caso 2: Desaceleración (CD=100→50%)',
                        caso3: 'Caso 3: Recuperación (CD=100→83%)'
                      };
                      return [value + ' meses', nombres[name] || name];
                    }}
                    labelFormatter={(edad) => `Edad cronológica: ${edad} meses`}
                  />
                  {/* Línea de referencia diagonal (desarrollo típico) */}
                  <ReferenceLine 
                    segment={[{x: 6, y: 6}, {x: 36, y: 36}]} 
                    stroke="#666" 
                    strokeDasharray="5 5"
                    label={{ value: "Desarrollo Típico (CD = 100%)", position: "topRight" }}
                  />
                  {/* Casos de desarrollo */}
                  <Line 
                    type="monotone" 
                    dataKey="caso1" 
                    stroke="#4caf50" 
                    strokeWidth={3}
                    name="caso1"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="caso2" 
                    stroke="#f44336" 
                    strokeWidth={3}
                    name="caso2"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="caso3" 
                    stroke="#ff9800" 
                    strokeWidth={3}
                    name="caso3"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="grafica-explicacion" style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
              <p><strong>Interpretación:</strong> Tres niños con el mismo CD final (~83%) pero trayectorias muy diferentes:</p>
              <ul>
                <li><span style={{color: '#4caf50'}}>🟢 Verde</span>: Retraso estable - mantiene el mismo ritmo</li>
                <li><span style={{color: '#f44336'}}>🔴 Rojo</span>: Desaceleración progresiva - empeora con el tiempo</li>  
                <li><span style={{color: '#ff9800'}}>🟠 Naranja</span>: Recuperación parcial - mejora tras intervención</li>
              </ul>
              <p><strong>Problema:</strong> Una evaluación única no distingue estos patrones. Solo el seguimiento longitudinal revela la trayectoria real.</p>
            </div>
          </div>

          <div className="problema-detalle">
            <h4>🔴 Problema de Comparabilidad entre Edades</h4>
            <ul>
              <li>Un CD del 80% a los 12 meses (retraso de 2.4 meses) <strong>no es equivalente</strong> 
                  a un CD del 80% a los 36 meses (retraso de 7.2 meses)</li>
              <li>La <strong>variabilidad normal</strong> del desarrollo es mayor en edades más avanzadas</li>
              <li>La <strong>significancia clínica</strong> del retraso cambia con la edad</li>
            </ul>
          </div>

          {/* Gráfica explicativa del problema de comparabilidad */}
          <div className="grafica-explicativa">
            <h4>📊 Visualización: Problema de Comparabilidad entre Edades</h4>
            <div style={{ width: '100%', height: '400px', marginTop: '1rem', background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #ddd' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={[
                    // Niño A: CD constante de 50% - retraso relativo creciente
                    // Niño B: Retraso fijo de 6 meses - CD mejora con la edad
                    { edad: 12, ninoA: 6, ninoB: 6, tipico: 12 },
                    { edad: 18, ninoA: 9, ninoB: 12, tipico: 18 },
                    { edad: 24, ninoA: 12, ninoB: 18, tipico: 24 },
                    { edad: 30, ninoA: 15, ninoB: 24, tipico: 30 },
                    { edad: 36, ninoA: 18, ninoB: 30, tipico: 36 },
                    { edad: 48, ninoA: 24, ninoB: 42, tipico: 48 },
                    { edad: 60, ninoA: 30, ninoB: 54, tipico: 60 },
                  ]}
                  margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="edad" 
                    label={{ value: 'Edad Cronológica (meses)', position: 'insideBottom', offset: -10 }}
                  />
                  <YAxis 
                    label={{ value: 'Edad de Desarrollo (meses)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    formatter={(value, name) => {
                      const nombres = {
                        tipico: 'Desarrollo Típico (CD = 100%)',
                        ninoA: 'Niño A: CD constante 50%',  
                        ninoB: 'Niño B: Retraso fijo 6 meses'
                      };
                      return [value + ' meses', nombres[name] || name];
                    }}
                    labelFormatter={(edad) => `Edad cronológica: ${edad} meses`}
                  />
                  {/* Línea de referencia diagonal (desarrollo típico) */}
                  <ReferenceLine 
                    segment={[{x: 12, y: 12}, {x: 60, y: 60}]} 
                    stroke="#666" 
                    strokeDasharray="5 5"
                    label={{ value: "Desarrollo Típico", position: "topRight" }}
                  />
                  {/* Casos de desarrollo */}
                  <Line 
                    type="monotone" 
                    dataKey="ninoA" 
                    stroke="#e74c3c" 
                    strokeWidth={3}
                    name="ninoA"
                    strokeDasharray="8 4"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="ninoB" 
                    stroke="#3498db" 
                    strokeWidth={3}
                    name="ninoB"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="tipico" 
                    stroke="#666" 
                    strokeWidth={2}
                    name="tipico"
                    strokeDasharray="5 5"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="grafica-explicacion" style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
              <p><strong>Interpretación:</strong> Dos patrones de desarrollo con significancia clínica muy diferente:</p>
              <ul>
                <li><span style={{color: '#e74c3c'}}>🔴 Rojo (línea punteada)</span>: <strong>Niño A - CD constante 50%</strong>
                  <ul style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
                    <li>A los 12m: 6 meses de retraso (CD=50%)</li>
                    <li>A los 36m: 18 meses de retraso (CD=50%)</li>
                    <li>A los 60m: 30 meses de retraso (CD=50%)</li>
                    <li><strong>Problema:</strong> El retraso absoluto aumenta dramáticamente</li>
                  </ul>
                </li>
                <li><span style={{color: '#3498db'}}>🔵 Azul (línea sólida)</span>: <strong>Niño B - Retraso fijo 6 meses</strong>
                  <ul style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
                    <li>A los 12m: 6 meses de retraso (CD=50%)</li>
                    <li>A los 36m: 6 meses de retraso (CD=83%)</li>
                    <li>A los 60m: 6 meses de retraso (CD=90%)</li>
                    <li><strong>Mejora:</strong> El CD mejora aunque el retraso sea constante</li>
                  </ul>
                </li>
              </ul>
              <p><strong>Conclusión:</strong> Mismo CD inicial (50%) pero pronósticos opuestos. El Niño A empeora progresivamente mientras el Niño B se aproxima al desarrollo típico. <strong>El CD debe interpretarse en el contexto de la edad.</strong></p>
            </div>
          </div>

        </div>

        <div className="teoria-card">
          <h3>⚠️ Problema 2: Heterocedasticidad en el Desarrollo Infantil</h3>
          <p className="teoria-texto">
            La <strong>heterocedasticidad</strong> se refiere a que la varianza del desarrollo no es constante 
            a lo largo de las edades. En el desarrollo infantil, esto se manifiesta de varias formas:
          </p>

          <div className="problema-detalle">
            <h4>📈 Varianza Creciente con la Edad</h4>
            <ul>
              <li>A los 6 meses: Diferencias de ±2 semanas son normales</li>
              <li>A los 24 meses: Diferencias de ±3-4 meses pueden ser normales</li>
              <li>A los 48 meses: Diferencias de ±6-8 meses pueden ser normales</li>
              <li><strong>Implicación</strong>: Los percentiles y puntos de corte deben ajustarse por edad</li>
            </ul>
          </div>

          <div className="problema-detalle">
            <h4>🎯 Varianza por Dominio del Desarrollo</h4>
            <ul>
              <li><strong>Motor grueso</strong>: Más homogéneo, menor variabilidad</li>
              <li><strong>Lenguaje expresivo</strong>: Muy heterogéneo, alta variabilidad</li>
              <li><strong>Adaptativo</strong>: Variabilidad moderada, influida por cultura</li>
              <li><strong>Implicación</strong>: Cada dominio requiere bandas de confianza específicas</li>
            </ul>
          </div>

          <div className="problema-detalle">
            <h4>🧬 Factores de Riesgo y Variabilidad</h4>
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

          {/* Gráfica explicativa de heterocedasticidad */}
          <div className="grafica-explicativa">
            <h4>📊 Visualización: Heterocedasticidad en el Desarrollo</h4>
            <div style={{ width: '100%', height: '400px', marginTop: '1rem', background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #ddd' }}>
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart
                  data={[
                    // Datos que muestran varianza creciente con la edad
                    // Edad temprana (6-12 meses) - poca varianza
                    { edad: 6, desarrollo: 6, grupo: 'normal' }, { edad: 7, desarrollo: 6.5, grupo: 'normal' }, 
                    { edad: 6.5, desarrollo: 6.8, grupo: 'normal' }, { edad: 7.2, desarrollo: 5.8, grupo: 'normal' },
                    { edad: 6.8, desarrollo: 7.1, grupo: 'normal' }, { edad: 6.2, desarrollo: 6.3, grupo: 'normal' },
                    
                    // Edad media (18-24 meses) - varianza moderada  
                    { edad: 18, desarrollo: 18, grupo: 'normal' }, { edad: 19, desarrollo: 16, grupo: 'normal' },
                    { edad: 20, desarrollo: 21, grupo: 'normal' }, { edad: 18.5, desarrollo: 15, grupo: 'normal' },
                    { edad: 19.8, desarrollo: 22, grupo: 'normal' }, { edad: 18.2, desarrollo: 17, grupo: 'normal' },
                    { edad: 19.5, desarrollo: 20, grupo: 'normal' }, { edad: 18.8, desarrollo: 14, grupo: 'normal' },
                    
                    // Edad tardía (30-36 meses) - alta varianza
                    { edad: 30, desarrollo: 30, grupo: 'normal' }, { edad: 32, desarrollo: 24, grupo: 'normal' },
                    { edad: 31, desarrollo: 38, grupo: 'normal' }, { edad: 33, desarrollo: 22, grupo: 'normal' },
                    { edad: 30.5, desarrollo: 35, grupo: 'normal' }, { edad: 31.8, desarrollo: 26, grupo: 'normal' },
                    { edad: 32.5, desarrollo: 40, grupo: 'normal' }, { edad: 30.2, desarrollo: 28, grupo: 'normal' },
                    { edad: 33.2, desarrollo: 20, grupo: 'normal' }, { edad: 31.5, desarrollo: 36, grupo: 'normal' },
                    { edad: 32.8, desarrollo: 25, grupo: 'normal' }, { edad: 30.8, desarrollo: 42, grupo: 'normal' },
                  ]}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="edad"
                    type="number" 
                    domain={[0, 40]}
                    label={{ value: 'Edad Cronológica (meses)', position: 'insideBottom', offset: -10 }}
                  />
                  <YAxis 
                    dataKey="desarrollo"
                    type="number"
                    domain={[0, 45]}
                    label={{ value: 'Edad de Desarrollo (meses)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    formatter={(value, name) => [`${value} meses`, name === 'desarrollo' ? 'Edad de Desarrollo' : name]}
                    labelFormatter={(edad) => `Edad cronológica: ${edad} meses`}
                  />
                  {/* Línea de referencia diagonal */}
                  <ReferenceLine 
                    segment={[{x: 0, y: 0}, {x: 40, y: 40}]} 
                    stroke="#666" 
                    strokeDasharray="5 5"
                    label={{ value: "Desarrollo Típico", position: "topRight" }}
                  />
                  {/* Puntos de datos */}
                  <Scatter 
                    dataKey="desarrollo" 
                    fill="#2196f3"
                    fillOpacity={0.6}
                  />
                  {/* Bandas de confianza aproximadas */}
                  <ReferenceLine segment={[{x: 5, y: 4}, {x: 8, y: 9}]} stroke="#4caf50" strokeWidth={2} />
                  <ReferenceLine segment={[{x: 17, y: 12}, {x: 21, y: 24}]} stroke="#4caf50" strokeWidth={2} />
                  <ReferenceLine segment={[{x: 29, y: 18}, {x: 35, y: 44}]} stroke="#4caf50" strokeWidth={2} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            <div className="grafica-explicacion" style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
              <p><strong>Interpretación:</strong> La variabilidad del desarrollo aumenta progresivamente con la edad:</p>
              <ul>
                <li><strong>6-8 meses:</strong> Variación de ±1 mes es normal (banda estrecha)</li>
                <li><strong>18-21 meses:</strong> Variación de ±3-4 meses es normal (banda moderada)</li>  
                <li><strong>30-35 meses:</strong> Variación de ±6-8 meses es normal (banda amplia)</li>
              </ul>
              <p><strong>Problema:</strong> Usar los mismos percentiles/umbrales a todas las edades subestima la variabilidad natural en edades tardías y sobreestima en edades tempranas.</p>
              <p><strong>Solución:</strong> Bandas de confianza ajustadas por edad (líneas verdes) que se amplían progresivamente.</p>
            </div>
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