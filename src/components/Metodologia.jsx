import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import './Bibliografia.css';

/**
 * Componente de Metodología
 * Explica los métodos y protocolos de evaluación del desarrollo infantil
 */
function Metodologia() {
  return (
    <div className="bibliografia-container">
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
        }}>Metodología de Evaluación</h2>
        <p style={{
          fontSize: '1.2rem',
          color: 'white',
          lineHeight: '1.8',
          margin: '0',
          fontWeight: '400'
        }}>
          Protocolos, métodos y herramientas para la evaluación sistemática del desarrollo infantil.
        </p>
      </div>

      {/* Criterios de Interpretación - Sección prioritaria */}
      <div className="seccion-metodologia">
        <h3>📊 Criterios de Interpretación</h3>
        
        <div className="interpretacion-card">
          <h4>⚖️ Umbrales de Referencia</h4>
          <div className="umbrales-content">
            <div className="umbral-item">
              <div className="umbral-categoria desarrollo-tipico">Desarrollo Típico</div>
              <div className="umbral-descripcion">
                <strong>≥ 85%</strong> del desarrollo esperado para la edad cronológica (o corregida)
              </div>
            </div>
            
            <div className="umbral-item">
              <div className="umbral-categoria vigilancia">Requiere Vigilancia</div>
              <div className="umbral-descripcion">
                <strong>70-84%</strong> del desarrollo esperado. Seguimiento más frecuente
              </div>
            </div>
            
            <div className="umbral-item">
              <div className="umbral-categoria intervencion">Requiere Intervención</div>
              <div className="umbral-descripcion">
                <strong>55-69%</strong> del desarrollo esperado. Intervención temprana
              </div>
            </div>
            
            <div className="umbral-item">
              <div className="umbral-categoria derivacion">Derivación Urgente</div>
              <div className="umbral-descripcion">
                <strong>&lt; 55%</strong> del desarrollo esperado. Evaluación especializada inmediata
              </div>
            </div>
          </div>

          <div className="consideraciones-especiales">
            <h5>⚠️ Consideraciones Especiales</h5>
            <ul>
              <li><strong>Prematuridad</strong>: Usar edad corregida hasta los 24 meses</li>
              <li><strong>Factores de riesgo</strong>: Ajustar umbrales según contexto clínico</li>
              <li><strong>Variabilidad cultural</strong>: Considerar diferencias en prácticas de crianza</li>
              <li><strong>Desarrollo desigual</strong>: Evaluar cada dominio independientemente</li>
            </ul>
          </div>
        </div>

        <div className="interpretacion-card">
          <h4>📈 Análisis de Trayectorias</h4>
          <div className="trayectorias-interpretacion">
            <div className="trayectoria-tipo">
              <h5>🟢 Trayectoria Típica</h5>
              <p>Desarrollo paralelo a la curva normativa con velocidad constante</p>
            </div>
            
            <div className="trayectoria-tipo">
              <h5>🟡 Inicio Retrasado</h5>
              <p>Inicio tardío pero velocidad normal una vez iniciado</p>
            </div>
            
            <div className="trayectoria-tipo">
              <h5>🟠 Velocidad Reducida</h5>
              <p>Desarrollo inicial normal seguido de desaceleración progresiva. El punto de inflexión indica el momento crítico de cambio.</p>
            </div>
            
            <div className="trayectoria-tipo">
              <h5>🔴 Trayectoria Plana</h5>
              <p>Desarrollo inicial normal seguido de estancamiento completo. No hay progreso adicional pero se mantienen las habilidades adquiridas.</p>
            </div>
            
            <div className="trayectoria-tipo">
              <h5>⚫ Regresión</h5>
              <p>Desarrollo inicial normal seguido de pérdida progresiva de habilidades previamente adquiridas. Requiere evaluación neurológica urgente.</p>
            </div>
            
            <div className="trayectoria-tipo">
              <h5>🔵 Respuesta a la Intervención</h5>
              <p>Retraso inicial significativo seguido de aceleración del desarrollo que permite alcanzar niveles normativos. Respuesta favorable a intervención temprana.</p>
            </div>
          </div>

          {/* Gráfica explicativa de trayectorias */}
          <div className="grafica-trayectorias">
            <h5>📊 Visualización de Tipos de Trayectorias</h5>
            <div style={{ width: '100%', height: '400px', marginTop: '1rem', background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #ddd' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={[
                    { edad: 6, tipica: 6, inicioRetrasado: 3, velocidadReducida: 6, plana: 6, regresion: 6, recuperacion: 3 },
                    { edad: 12, tipica: 12, inicioRetrasado: 6, velocidadReducida: 12, plana: 12, regresion: 12, recuperacion: 6 },
                    { edad: 18, tipica: 18, inicioRetrasado: 12, velocidadReducida: 18, plana: 18, regresion: 18, recuperacion: 9 },
                    { edad: 24, tipica: 24, inicioRetrasado: 18, velocidadReducida: 22, plana: 20, regresion: 16, recuperacion: 15 },
                    { edad: 30, tipica: 30, inicioRetrasado: 24, velocidadReducida: 25, plana: 20, regresion: 14, recuperacion: 24 },
                    { edad: 36, tipica: 36, inicioRetrasado: 30, velocidadReducida: 28, plana: 20, regresion: 12, recuperacion: 33 },
                    { edad: 48, tipica: 48, inicioRetrasado: 42, velocidadReducida: 34, plana: 20, regresion: 8, recuperacion: 46 },
                    { edad: 60, tipica: 60, inicioRetrasado: 54, velocidadReducida: 40, plana: 20, regresion: 6, recuperacion: 57 }
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
                        tipica: '🟢 Trayectoria Típica',
                        inicioRetrasado: '🟡 Inicio Retrasado',
                        velocidadReducida: '🟠 Velocidad Reducida',
                        plana: '🔴 Trayectoria Plana',
                        regresion: '⚫ Regresión',
                        recuperacion: '🔵 Respuesta a la Intervención'
                      };
                      return [value + ' meses', nombres[name] || name];
                    }}
                    labelFormatter={(edad) => `Edad cronológica: ${edad} meses`}
                  />
                  
                  {/* Línea de referencia diagonal (desarrollo típico ideal) */}
                  <ReferenceLine 
                    segment={[{x: 6, y: 6}, {x: 60, y: 60}]} 
                    stroke="#ccc" 
                    strokeDasharray="2 2"
                    label={{ value: "Desarrollo Ideal", position: "topRight" }}
                  />
                  
                  {/* Zonas de interpretación */}
                  <ReferenceLine 
                    segment={[{x: 6, y: 5.1}, {x: 60, y: 51}]} 
                    stroke="#28a745" 
                    strokeDasharray="8 4"
                    opacity={0.5}
                  />
                  <ReferenceLine 
                    segment={[{x: 6, y: 4.2}, {x: 60, y: 42}]} 
                    stroke="#ffc107" 
                    strokeDasharray="8 4"
                    opacity={0.5}
                  />
                  <ReferenceLine 
                    segment={[{x: 6, y: 3.3}, {x: 60, y: 33}]} 
                    stroke="#fd7e14" 
                    strokeDasharray="8 4"
                    opacity={0.5}
                  />
                  
                  {/* Líneas de trayectorias */}
                  <Line 
                    type="monotone" 
                    dataKey="tipica" 
                    stroke="#28a745" 
                    strokeWidth={3}
                    name="tipica"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="inicioRetrasado" 
                    stroke="#ffc107" 
                    strokeWidth={3}
                    name="inicioRetrasado"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="velocidadReducida" 
                    stroke="#fd7e14" 
                    strokeWidth={3}
                    name="velocidadReducida"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="plana" 
                    stroke="#dc3545" 
                    strokeWidth={3}
                    name="plana"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="regresion" 
                    stroke="#6c757d" 
                    strokeWidth={3}
                    name="regresion"
                    strokeDasharray="4 4"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="recuperacion" 
                    stroke="#007bff" 
                    strokeWidth={3}
                    name="recuperacion"
                    strokeDasharray="8 2"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="grafica-explicacion" style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
              <p><strong>Interpretación de Trayectorias:</strong></p>
              <ul>
                <li><span style={{color: '#28a745'}}>🟢 Verde</span>: <strong>Trayectoria Típica</strong> - Desarrollo paralelo al esperado (≥85%)</li>
                <li><span style={{color: '#ffc107'}}>🟡 Amarillo</span>: <strong>Inicio Retrasado</strong> - Retraso inicial pero recuperación gradual hasta normalidad</li>
                <li><span style={{color: '#007bff'}}>🔵 Azul (línea discontinua)</span>: <strong>Respuesta a la Intervención</strong> - Retraso inicial severo con aceleración posterior que alcanza normalidad</li>
                <li><span style={{color: '#fd7e14'}}>🟠 Naranja</span>: <strong>Velocidad Reducida</strong> - Inicio normal pero desaceleración progresiva después de los 18-24 meses</li>
                <li><span style={{color: '#dc3545'}}>🔴 Rojo</span>: <strong>Trayectoria Plana</strong> - Inicio normal, luego estancamiento completo (plateau) manteniendo habilidades</li>
                <li><span style={{color: '#6c757d'}}>⚫ Gris (línea punteada)</span>: <strong>Regresión</strong> - Inicio normal seguido de pérdida progresiva de habilidades adquiridas</li>
              </ul>
              <p><strong>⚠️ Punto crítico:</strong> El período 18-24 meses es la ventana crítica donde emergen estos patrones divergentes. La evaluación longitudinal es esencial para distinguir entre los diferentes tipos de trayectorias y planificar intervenciones apropiadas.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Protocolos de Evaluación */}
      <div className="seccion-metodologia">
        <h3>📋 Protocolos de Evaluación</h3>
        
        <div className="protocolo-card">
          <h4>🎯 Protocolo de Evaluación Inicial</h4>
          <div className="protocolo-contenido">
            <h5>1. Anamnesis y Historia Clínica</h5>
            <ul>
              <li><strong>Antecedentes perinatales</strong>: Edad gestacional, peso al nacer, complicaciones</li>
              <li><strong>Historia médica</strong>: Hospitalizaciones, medicamentos, cirugías</li>
              <li><strong>Historia familiar</strong>: Antecedentes de trastornos del desarrollo</li>
              <li><strong>Historia social</strong>: Estructura familiar, nivel socioeconómico, idiomas</li>
            </ul>

            <h5>2. Evaluación Observacional</h5>
            <ul>
              <li><strong>Observación estructurada</strong>: Comportamiento durante la evaluación</li>
              <li><strong>Interacción social</strong>: Contacto visual, respuesta a nombre, sonrisa social</li>
              <li><strong>Comunicación</strong>: Gestos, intentos comunicativos, comprensión</li>
              <li><strong>Juego</strong>: Exploración de objetos, juego funcional, simbólico</li>
            </ul>

            <h5>3. Evaluación por Dominios</h5>
            <div className="dominios-evaluacion">
              <div className="dominio-item">
                <h6>Motor Grueso</h6>
                <p>Control cefálico, sedestación, bipedestación, marcha, coordinación</p>
              </div>
              <div className="dominio-item">
                <h6>Motor Fino</h6>
                <p>Prensión, manipulación, coordinación óculo-manual, grafomotricidad</p>
              </div>
              <div className="dominio-item">
                <h6>Lenguaje</h6>
                <p>Comprensión, expresión, vocabulario, sintaxis, pragmática</p>
              </div>
              <div className="dominio-item">
                <h6>Cognitivo</h6>
                <p>Atención, memoria, resolución de problemas, conceptos</p>
              </div>
              <div className="dominio-item">
                <h6>Social-Emocional</h6>
                <p>Apego, regulación emocional, habilidades sociales, autoconcepto</p>
              </div>
              <div className="dominio-item">
                <h6>Adaptativo</h6>
                <p>Autonomía personal, habilidades de vida diaria, autocuidado</p>
              </div>
            </div>
          </div>
        </div>

        <div className="protocolo-card">
          <h4>📊 Protocolo de Seguimiento Longitudinal</h4>
          <div className="protocolo-contenido">
            <h5>Frecuencia de Evaluaciones</h5>
            <div className="frecuencia-tabla">
              <table>
                <thead>
                  <tr>
                    <th>Edad</th>
                    <th>Frecuencia</th>
                    <th>Objetivos</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>0-6 meses</td>
                    <td>Mensual</td>
                    <td>Detección temprana, establecimiento de línea base</td>
                  </tr>
                  <tr>
                    <td>6-18 meses</td>
                    <td>Bimestral</td>
                    <td>Monitoreo de hitos críticos, ajuste de intervenciones</td>
                  </tr>
                  <tr>
                    <td>18-36 meses</td>
                    <td>Trimestral</td>
                    <td>Evaluación de trayectorias, planificación educativa</td>
                  </tr>
                  <tr>
                    <td>36+ meses</td>
                    <td>Semestral</td>
                    <td>Preparación escolar, seguimiento especializado</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h5>Criterios de Análisis de Trayectorias</h5>
            <ul>
              <li><strong>Velocidad de desarrollo</strong>: Cambio en hitos conseguidos por unidad de tiempo</li>
              <li><strong>Aceleración/desaceleración</strong>: Cambios en la velocidad de desarrollo</li>
              <li><strong>Patrones de recuperación</strong>: Respuesta a intervenciones específicas</li>
              <li><strong>Estabilidad</strong>: Consistencia de las mediciones a lo largo del tiempo</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Herramientas de Evaluación */}
      <div className="seccion-metodologia">
        <h3>🛠️ Herramientas de Evaluación</h3>
        
        <div className="herramienta-card">
          <h4>📱 Herramientas Digitales</h4>
          <div className="herramientas-grid">
            <div className="herramienta-item">
              <h5>Sistema de Gráficas Longitudinales</h5>
              <p>Visualización de trayectorias de desarrollo con análisis estadístico integrado.</p>
              <div className="caracteristicas">
                <span className="tag">Tiempo real</span>
                <span className="tag">Multi-dominio</span>
                <span className="tag">Exportable</span>
              </div>
            </div>
            
            <div className="herramienta-item">
              <h5>Clasificador de Trayectorias</h5>
              <p>Algoritmo automático basado en Thomas et al. (2009) para tipificar patrones de desarrollo.</p>
              <div className="caracteristicas">
                <span className="tag">Automático</span>
                <span className="tag">7 tipologías</span>
                <span className="tag">Validado</span>
              </div>
            </div>
            
            <div className="herramienta-item">
              <h5>Generador de Informes</h5>
              <p>Creación automática de informes profesionales con análisis estadístico y recomendaciones.</p>
              <div className="caracteristicas">
                <span className="tag">PDF</span>
                <span className="tag">Personalizable</span>
                <span className="tag">Profesional</span>
              </div>
            </div>
          </div>
        </div>

        <div className="herramienta-card">
          <h4>📏 Escalas de Referencia</h4>
          <div className="escalas-comparacion">
            <table>
              <thead>
                <tr>
                  <th>Escala</th>
                  <th>Edad</th>
                  <th>Dominios</th>
                  <th>Características</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>CDC Milestones</strong></td>
                  <td>2m - 5a</td>
                  <td>7 dominios</td>
                  <td>Criterio 75%, actualizada 2022</td>
                </tr>
                <tr>
                  <td><strong>OMS Motor</strong></td>
                  <td>0 - 2a</td>
                  <td>Motor grueso</td>
                  <td>Estándares internacionales</td>
                </tr>
                <tr>
                  <td><strong>Bayley-III</strong></td>
                  <td>1m - 42m</td>
                  <td>5 dominios</td>
                  <td>Evaluación directa, normas EE.UU.</td>
                </tr>
                <tr>
                  <td><strong>Battelle-II</strong></td>
                  <td>0 - 8a</td>
                  <td>5 dominios</td>
                  <td>Observacional, amplio rango</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Best Practices */}
      <div className="seccion-metodologia">
        <h3>✅ Mejores Prácticas</h3>
        
        <div className="best-practices-grid">
          <div className="practice-card">
            <h4>🎯 Evaluación Centrada en la Familia</h4>
            <ul>
              <li>Involucrar activamente a los cuidadores</li>
              <li>Considerar prioridades familiares</li>
              <li>Respetar diversidad cultural</li>
              <li>Proporcionar retroalimentación clara</li>
            </ul>
          </div>
          
          <div className="practice-card">
            <h4>🔄 Enfoque Longitudinal</h4>
            <ul>
              <li>Establecer línea base temprana</li>
              <li>Monitoreo regular y sistemático</li>
              <li>Documentar cambios en trayectorias</li>
              <li>Ajustar intervenciones según progreso</li>
            </ul>
          </div>
          
          <div className="practice-card">
            <h4>🤝 Colaboración Interdisciplinaria</h4>
            <ul>
              <li>Comunicación entre especialistas</li>
              <li>Planes de intervención coordinados</li>
              <li>Compartir información relevante</li>
              <li>Decisiones basadas en consenso</li>
            </ul>
          </div>
          
          <div className="practice-card">
            <h4>📊 Toma de Decisiones Basada en Evidencia</h4>
            <ul>
              <li>Usar múltiples fuentes de información</li>
              <li>Considerar contexto clínico completo</li>
              <li>Aplicar criterios estadísticos válidos</li>
              <li>Documentar razonamiento clínico</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Metodologia;