import React, { useState, useEffect } from 'react';
import { calculateDScoreTrajectory, generateDScoreChart } from '../utils/dscore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Scatter, ScatterChart, Cell } from 'recharts';

const DScoreTrayectoria = ({ 
  assessments, 
  childName = 'el niño',
  onSaveEvaluation = null,
  isLoadingHistory = false 
}) => {
  const [trajectoryData, setTrajectoryData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [currentEvaluation, setCurrentEvaluation] = useState(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  useEffect(() => {
    if (assessments && assessments.length > 0) {
      // Procesar evaluaciones: algunas ya tienen D-score calculado, otras necesitan cálculo
      const processedAssessments = assessments.map(assessment => {
        if (assessment.dscore !== undefined) {
          // Ya tiene D-score calculado (evaluación histórica)
          return {
            ...assessment,
            dscoreResult: {
              dscore: assessment.dscore,
              daz: assessment.daz,
              n: assessment.n
            }
          };
        } else {
          // Necesita calcular D-score (evaluación actual)
          const dscoreResult = calculateDScore(assessment.responses, assessment.ageMonths);
          return {
            ...assessment,
            dscoreResult
          };
        }
      });
      
      // Encontrar evaluación actual para posible guardado
      const current = processedAssessments.find(a => a.isCurrent);
      setCurrentEvaluation(current);
      
      const trajectory = calculateDScoreTrajectoryFromProcessed(processedAssessments);
      setTrajectoryData(trajectory);
      
      if (trajectory.trajectory.length > 0) {
        // Generar curva de referencia que cubra todo el rango de edades
        const minAge = Math.min(...trajectory.trajectory.map(t => t.age));
        const maxAge = Math.max(...trajectory.trajectory.map(t => t.age));
        const referenceData = generateDScoreChart([Math.max(0, minAge - 6), Math.min(72, maxAge + 6)]);
        
        // Combinar datos de referencia con trayectoria del niño
        const combinedData = referenceData.map(ref => {
          const childPoint = trajectory.trajectory.find(t => Math.abs(t.age - ref.age) < 0.5);
          return {
            ...ref,
            childScore: childPoint ? childPoint.dscore : null,
            childDAZ: childPoint ? childPoint.daz : null,
            assessmentDate: childPoint ? childPoint.date : null,
            isCurrent: childPoint ? processedAssessments.find(a => a.isCurrent && Math.abs(a.ageMonths - ref.age) < 0.5) : false
          };
        });
        
        setChartData(combinedData);
      }
    }
  }, [assessments]);

  const getVelocityColor = (velocity) => {
    if (velocity > 0.5) return 'text-green-600 bg-green-50 border-green-200';
    if (velocity > 0.1) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (velocity > -0.1) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getAccelerationIcon = (acceleration) => {
    if (acceleration === null) return '—';
    if (acceleration > 0.1) return '↗️';
    if (acceleration < -0.1) return '↘️';
    return '→';
  };

  // Función para calcular trayectoria de evaluaciones ya procesadas
  const calculateDScoreTrajectoryFromProcessed = (processedAssessments) => {
    if (!Array.isArray(processedAssessments) || processedAssessments.length === 0) {
      return {
        trajectory: [],
        velocity: null,
        acceleration: null,
        interpretation: 'No hay suficientes evaluaciones para calcular trayectoria'
      };
    }
    
    // Sort by age
    const sortedAssessments = [...processedAssessments].sort((a, b) => a.ageMonths - b.ageMonths);
    
    const trajectory = sortedAssessments.map(assessment => ({
      age: assessment.ageMonths,
      dscore: assessment.dscoreResult?.dscore,
      daz: assessment.dscoreResult?.daz,
      date: assessment.date,
      n: assessment.dscoreResult?.n,
      isCurrent: assessment.isCurrent
    })).filter(point => point.dscore !== null && point.dscore !== undefined);
    
    if (trajectory.length < 2) {
      return {
        trajectory,
        velocity: null,
        acceleration: null,
        interpretation: 'Se necesitan al menos 2 evaluaciones válidas para calcular velocidad'
      };
    }
    
    // Calculate velocity (D-score change per month)
    const velocities = [];
    for (let i = 1; i < trajectory.length; i++) {
      const timeDiff = trajectory[i].age - trajectory[i-1].age;
      const scoreDiff = trajectory[i].dscore - trajectory[i-1].dscore;
      if (timeDiff > 0) {
        velocities.push(scoreDiff / timeDiff);
      }
    }
    
    const avgVelocity = velocities.length > 0 ? velocities.reduce((sum, v) => sum + v, 0) / velocities.length : null;
    
    // Calculate acceleration if we have enough points
    let acceleration = null;
    if (velocities.length >= 2) {
      const accelerations = [];
      for (let i = 1; i < velocities.length; i++) {
        const timeIndex = i + 1;
        const timeDiff = trajectory[timeIndex].age - trajectory[timeIndex-1].age;
        const velocityDiff = velocities[i] - velocities[i-1];
        if (timeDiff > 0) {
          accelerations.push(velocityDiff / timeDiff);
        }
      }
      acceleration = accelerations.length > 0 ? accelerations.reduce((sum, a) => sum + a, 0) / accelerations.length : null;
    }
    
    return {
      trajectory,
      velocity: avgVelocity ? Math.round(avgVelocity * 1000) / 1000 : null,
      acceleration: acceleration ? Math.round(acceleration * 1000) / 1000 : null,
      interpretation: interpretTrajectory(avgVelocity, acceleration)
    };
  };

  // Interprets D-score trajectory
  const interpretTrajectory = (velocity, acceleration) => {
    if (velocity === null) return 'No hay suficientes datos para analizar la trayectoria';
    
    let interpretation = '';
    
    if (velocity > 0.5) {
      interpretation = 'Desarrollo acelerado - el niño está progresando más rápido que lo esperado';
    } else if (velocity > 0.1) {
      interpretation = 'Desarrollo normal - progreso constante apropiado para la edad';
    } else if (velocity > -0.1) {
      interpretation = 'Desarrollo estable - progreso mínimo, requiere monitoreo';
    } else {
      interpretation = 'Desarrollo desacelerado - progreso por debajo de lo esperado, evaluación recomendada';
    }
    
    if (acceleration !== null) {
      if (acceleration > 0.1) {
        interpretation += '. La velocidad de desarrollo está aumentando (aceleración positiva).';
      } else if (acceleration < -0.1) {
        interpretation += '. La velocidad de desarrollo está disminuyendo (desaceleración).';
      }
    }
    
    return interpretation;
  };

  const CustomDot = (props) => {
    const { cx, cy, payload } = props;
    if (payload.childScore) {
      const color = payload.isCurrent ? '#dc2626' : // Rojo para evaluación actual
                    payload.childDAZ >= 0 ? '#10b981' : // Verde para DAZ positivo
                    payload.childDAZ >= -1 ? '#f59e0b' : '#ef4444'; // Amarillo o rojo según DAZ
      const radius = payload.isCurrent ? 8 : 6;
      return (
        <g>
          <circle cx={cx} cy={cy} r={radius} fill={color} stroke="#ffffff" strokeWidth={2} />
          <circle cx={cx} cy={cy} r={radius + 3} fill="none" stroke={color} strokeWidth={1} strokeOpacity={0.5} />
          {payload.isCurrent && (
            <circle cx={cx} cy={cy} r={radius + 6} fill="none" stroke={color} strokeWidth={2} strokeDasharray="2 2" />
          )}
        </g>
      );
    }
    return null;
  };

  if (!trajectoryData || trajectoryData.trajectory.length === 0) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Análisis de Trayectoria</h3>
        <p className="text-gray-600">
          Se necesitan al menos 2 evaluaciones para analizar la trayectoria de desarrollo.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Trayectoria de Desarrollo - D-score</h3>
          
          {/* Botón para guardar evaluación actual */}
          {currentEvaluation && onSaveEvaluation && currentEvaluation.dscoreResult?.dscore && (
            <button
              onClick={async () => {
                const success = await onSaveEvaluation(currentEvaluation.dscoreResult);
                if (success) {
                  alert('✅ Evaluación guardada correctamente en el historial');
                } else {
                  alert('❌ Error al guardar la evaluación');
                }
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              disabled={isLoadingHistory}
            >
              {isLoadingHistory ? 'Guardando...' : 'Guardar Evaluación Actual'}
            </button>
          )}
        </div>
        
        <p className="text-gray-600 mb-6">
          La línea conecta las evaluaciones de {childName} a lo largo del tiempo, mostrando el progreso 
          en relación con la curva de desarrollo típica.
          {currentEvaluation && (
            <span className="block text-sm text-blue-600 mt-1">
              ⚡ La evaluación actual (punto punteado) no está guardada permanentemente.
            </span>
          )}
        </p>
        
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="age" 
                label={{ value: 'Edad (meses)', position: 'insideBottom', offset: -10 }}
                stroke="#666"
              />
              <YAxis 
                label={{ value: 'D-score', angle: -90, position: 'insideLeft' }}
                domain={['dataMin - 5', 'dataMax + 5']}
                stroke="#666"
              />
              <Tooltip 
                formatter={(value, name, props) => {
                  if (name === 'childScore' && props.payload.assessmentDate) {
                    return [
                      `${value.toFixed(1)}`,
                      `${childName} (${new Date(props.payload.assessmentDate).toLocaleDateString()})`
                    ];
                  }
                  return [
                    `${value.toFixed(1)}`,
                    name === 'mean' ? 'Desarrollo típico' :
                    name === 'plus1sd' ? '+1 DE' : 
                    name === 'minus1sd' ? '-1 DE' : name
                  ];
                }}
                labelFormatter={(age) => `Edad: ${age} meses`}
              />
              
              {/* Líneas de referencia */}
              <Line 
                type="monotone" 
                dataKey="plus1sd" 
                stroke="#93c5fd" 
                strokeWidth={1}
                strokeDasharray="3 3"
                dot={false}
                connectNulls={false}
                name="+1 DE"
              />
              <Line 
                type="monotone" 
                dataKey="mean" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={false}
                connectNulls={false}
                name="Media esperada"
              />
              <Line 
                type="monotone" 
                dataKey="minus1sd" 
                stroke="#93c5fd" 
                strokeWidth={1}
                strokeDasharray="3 3"
                dot={false}
                connectNulls={false}
                name="-1 DE"
              />
              
              {/* Trayectoria del niño */}
              <Line 
                type="monotone" 
                dataKey="childScore" 
                stroke="#dc2626" 
                strokeWidth={3}
                dot={<CustomDot />}
                connectNulls={false}
                name={childName}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-1 bg-blue-600 mr-2 rounded"></div>
            <span>Desarrollo típico esperado</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-1 bg-blue-300 mr-2 rounded" style={{background: 'repeating-linear-gradient(to right, #93c5fd 0, #93c5fd 3px, transparent 3px, transparent 6px)'}}></div>
            <span>Rango normal (±1 DE)</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-1 bg-red-600 mr-2 rounded"></div>
            <span>Trayectoria de {childName}</span>
          </div>
          {trajectoryData.trajectory.some(t => t.isCurrent) && (
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-600 rounded-full mr-2 border-2 border-white" style={{boxShadow: '0 0 0 2px #dc2626', opacity: 0.7}}></div>
              <span>Evaluación actual (no guardada)</span>
            </div>
          )}
          {trajectoryData.trajectory.some(t => !t.isCurrent) && (
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-600 rounded-full mr-2 border-2 border-white"></div>
              <span>Evaluaciones guardadas</span>
            </div>
          )}
        </div>
      </div>

      {/* Análisis de Velocidad */}
      <div className={`p-6 rounded-lg border ${getVelocityColor(trajectoryData.velocity)}`}>
        <h4 className="text-lg font-semibold mb-4">Análisis de Velocidad de Desarrollo</h4>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">
              {trajectoryData.velocity ? trajectoryData.velocity.toFixed(3) : '—'}
            </div>
            <div className="text-sm font-medium">Velocidad</div>
            <div className="text-xs opacity-75">D-score/mes</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl">
              {getAccelerationIcon(trajectoryData.acceleration)}
            </div>
            <div className="text-sm font-medium">Aceleración</div>
            <div className="text-xs opacity-75">
              {trajectoryData.acceleration ? trajectoryData.acceleration.toFixed(4) : 'N/A'}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold">
              {trajectoryData.trajectory.length}
            </div>
            <div className="text-sm font-medium">Evaluaciones</div>
            <div className="text-xs opacity-75">
              {trajectoryData.trajectory.length > 1 && (
                <>
                  {Math.round((trajectoryData.trajectory[trajectoryData.trajectory.length - 1].age - trajectoryData.trajectory[0].age) / trajectoryData.trajectory.length * 10) / 10} meses promedio
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-white bg-opacity-50 rounded">
          <p className="text-sm">{trajectoryData.interpretation}</p>
        </div>
      </div>

      {/* Tabla de Evaluaciones */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Historial de Evaluaciones</h4>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left p-2">Fecha</th>
                <th className="text-left p-2">Edad</th>
                <th className="text-left p-2">D-score</th>
                <th className="text-left p-2">DAZ</th>
                <th className="text-left p-2">N° Hitos</th>
                <th className="text-left p-2">Estado Dev.</th>
                <th className="text-left p-2">Guardado</th>
              </tr>
            </thead>
            <tbody>
              {trajectoryData.trajectory.map((assessment, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-2">
                    {assessment.date ? new Date(assessment.date).toLocaleDateString() : '—'}
                  </td>
                  <td className="p-2">
                    {Math.floor(assessment.age / 12)}a {assessment.age % 12}m
                  </td>
                  <td className="p-2 font-medium">
                    {assessment.dscore.toFixed(1)}
                  </td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      assessment.daz >= 0 ? 'bg-green-100 text-green-800' :
                      assessment.daz >= -1 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {assessment.daz.toFixed(2)}
                    </span>
                  </td>
                  <td className="p-2">{assessment.n}</td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      assessment.daz >= -0.5 ? 'bg-green-100 text-green-800' :
                      assessment.daz >= -1 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {assessment.daz >= -0.5 ? 'Típico' :
                       assessment.daz >= -1 ? 'Monitoreo' : 'Preocupante'}
                    </span>
                  </td>
                  <td className="p-2">
                    {assessment.isCurrent ? (
                      <span className="px-2 py-1 rounded text-xs bg-orange-100 text-orange-800 flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Temporal
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800 flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Guardado
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recomendaciones */}
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h4 className="text-lg font-semibold text-blue-900 mb-4">Recomendaciones Basadas en la Trayectoria</h4>
        
        <div className="space-y-3 text-sm text-blue-800">
          {trajectoryData.velocity < -0.1 && (
            <div className="flex items-start space-x-2">
              <span className="text-orange-500 mt-1">⚠️</span>
              <p>
                La velocidad de desarrollo ha disminuido. Se recomienda:
                <br />• Consultar con un especialista en desarrollo infantil
                <br />• Incrementar actividades de estimulación temprana
                <br />• Programar evaluaciones más frecuentes
              </p>
            </div>
          )}
          
          {trajectoryData.velocity > 0.5 && (
            <div className="flex items-start space-x-2">
              <span className="text-green-500 mt-1">✅</span>
              <p>
                Excelente progreso en el desarrollo. Continuar:
                <br />• Actividades apropiadas para la edad
                <br />• Estimulación enriquecedora
                <br />• Monitoreo regular
              </p>
            </div>
          )}
          
          {trajectoryData.acceleration && trajectoryData.acceleration < -0.1 && (
            <div className="flex items-start space-x-2">
              <span className="text-yellow-500 mt-1">⚡</span>
              <p>
                Se observa desaceleración en el progreso. Considerar evaluar:
                <br />• Factores ambientales que puedan estar influyendo
                <br />• Necesidades específicas de estimulación
                <br />• Consulta profesional para ajustar intervenciones
              </p>
            </div>
          )}
          
          <div className="flex items-start space-x-2">
            <span className="text-blue-500 mt-1">💡</span>
            <p>
              <strong>Próxima evaluación recomendada:</strong> En {
                trajectoryData.velocity > 0.3 ? '3' : 
                trajectoryData.velocity > 0 ? '2' : '1'
              } mes(es) para monitorear continuidad del progreso.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DScoreTrayectoria;