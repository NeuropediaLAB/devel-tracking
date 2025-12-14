import React, { useState, useEffect } from 'react';
import { calculateDScore, calculateDevelopmentalAge, generateDScoreChart } from '../utils/dscore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Dot } from 'recharts';
import './DScore.css';

const DScoreResultados = ({ milestoneResponses, childAge, childName = 'el niño' }) => {
  const [dscoreResults, setDscoreResults] = useState(null);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (milestoneResponses && milestoneResponses.length > 0 && childAge) {
      const results = calculateDScore(milestoneResponses, childAge);
      setDscoreResults(results);
      
      // Generar datos para la gráfica incluyendo el punto del niño
      const referenceData = generateDScoreChart([Math.max(0, childAge - 12), Math.min(72, childAge + 12)]);
      
      if (results.dscore !== null) {
        const childDataPoint = {
          age: childAge,
          mean: referenceData.find(d => d.age === Math.round(childAge))?.mean || 50,
          childScore: results.dscore,
          isChildData: true
        };
        
        setChartData([...referenceData, childDataPoint]);
      } else {
        setChartData(referenceData);
      }
    }
  }, [milestoneResponses, childAge]);

  const CustomDot = (props) => {
    const { cx, cy, payload } = props;
    if (payload.isChildData) {
      return (
        <g>
          <circle cx={cx} cy={cy} r={8} fill="#dc2626" stroke="#ffffff" strokeWidth={3} />
          <circle cx={cx} cy={cy} r={12} fill="none" stroke="#dc2626" strokeWidth={2} strokeDasharray="5 5" />
        </g>
      );
    }
    return null;
  };

  const getScoreInterpretationColor = (level) => {
    switch (level) {
      case 'Superior': return 'text-green-600 bg-green-50 border-green-200';
      case 'Sobre el promedio': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Típico': return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'Ligeramente bajo': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Preocupante': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Alto riesgo': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (!dscoreResults) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Calculando D-score...</p>
        </div>
      </div>
    );
  }

  if (dscoreResults.dscore === null) {
    return (
      <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
        <div className="flex items-start">
          <div className="bg-yellow-100 p-2 rounded-full mr-3">
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">D-score no disponible</h3>
            <p className="text-yellow-700">{dscoreResults.interpretation}</p>
          </div>
        </div>
      </div>
    );
  }

  const developmentalAge = calculateDevelopmentalAge(dscoreResults.dscore);
  const developmentalYears = Math.floor(developmentalAge / 12);
  const developmentalMonths = Math.round(developmentalAge % 12);

  return (
    <div className="space-y-6">
      {/* Resumen Principal */}
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Resultados D-score</h2>
            <p className="text-gray-600">Evaluación cuantitativa del desarrollo de {childName}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">{dscoreResults.dscore}</div>
            <div className="text-sm text-gray-500">D-score</div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-blue-700">{dscoreResults.daz}</div>
            <div className="text-sm text-blue-600 mb-1">DAZ (Z-score ajustado por edad)</div>
            <div className="text-xs text-blue-500">
              {dscoreResults.daz > 0 ? 'Por encima' : dscoreResults.daz < 0 ? 'Por debajo' : 'En'} del promedio
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-700">
              {developmentalYears > 0 ? `${developmentalYears}a ` : ''}{developmentalMonths}m
            </div>
            <div className="text-sm text-green-600 mb-1">Edad de desarrollo equivalente</div>
            <div className="text-xs text-green-500">
              Basado en hitos alcanzados
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-gray-700">{dscoreResults.n}</div>
            <div className="text-sm text-gray-600 mb-1">Hitos evaluados</div>
            <div className="text-xs text-gray-500">
              {Math.round(dscoreResults.p * 100)}% alcanzados
            </div>
          </div>
        </div>
      </div>

      {/* Interpretación */}
      <div className={`p-6 rounded-lg border ${getScoreInterpretationColor(dscoreResults.interpretation.level)}`}>
        <div className="flex items-start">
          <div className="bg-white p-2 rounded-full mr-4 shadow-sm">
            {dscoreResults.interpretation.level === 'Superior' && (
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            )}
            {(dscoreResults.interpretation.level === 'Típico' || dscoreResults.interpretation.level === 'Sobre el promedio') && (
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {dscoreResults.interpretation.level === 'Ligeramente bajo' && (
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            )}
            {(dscoreResults.interpretation.level === 'Preocupante' || dscoreResults.interpretation.level === 'Alto riesgo') && (
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-2">
              Desarrollo {dscoreResults.interpretation.level}
            </h3>
            <p className="mb-4 leading-relaxed">
              {dscoreResults.interpretation.description}
            </p>
            <div className="bg-white bg-opacity-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Recomendación:</h4>
              <p className="text-sm">
                {dscoreResults.interpretation.recommendation}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfica de Desarrollo */}
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Posición en la Curva de Desarrollo</h3>
        <p className="text-gray-600 mb-6">
          El punto rojo muestra la posición de {childName} en relación con la curva de desarrollo típica.
        </p>
        
        <div className="h-80">
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
                formatter={(value, name) => [
                  `${value.toFixed(1)}`,
                  name === 'mean' ? 'Desarrollo típico' :
                  name === 'childScore' ? `D-score de ${childName}` :
                  name === 'plus1sd' ? '+1 DE' : '-1 DE'
                ]}
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
                strokeWidth={3}
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
              
              {/* Punto del niño */}
              <Line 
                type="monotone" 
                dataKey="childScore" 
                stroke="#dc2626" 
                strokeWidth={0}
                dot={<CustomDot />}
                connectNulls={false}
                name={`${childName}`}
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
            <div className="w-3 h-3 bg-red-600 rounded-full mr-2 border-2 border-white shadow-sm"></div>
            <span>Puntuación de {childName}</span>
          </div>
        </div>
      </div>

      {/* Información Técnica */}
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Técnica</h3>
        
        <div className="grid md:grid-cols-2 gap-6 text-sm">
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Parámetros de Medición</h4>
            <ul className="space-y-1 text-gray-600">
              <li><strong>Hitos evaluados:</strong> {dscoreResults.n}</li>
              <li><strong>Proporción lograda:</strong> {Math.round(dscoreResults.p * 100)}%</li>
              <li><strong>Error estándar (SEM):</strong> {dscoreResults.sem}</li>
              <li><strong>Edad cronológica:</strong> {Math.floor(childAge / 12)} años {childAge % 12} meses</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Interpretación DAZ</h4>
            <div className="space-y-1 text-gray-600">
              <div className="flex justify-between">
                <span>DAZ > +2.0:</span>
                <span className="font-medium">Muy superior</span>
              </div>
              <div className="flex justify-between">
                <span>DAZ +1.0 a +2.0:</span>
                <span className="font-medium">Superior</span>
              </div>
              <div className="flex justify-between">
                <span>DAZ -1.0 a +1.0:</span>
                <span className="font-medium">Típico</span>
              </div>
              <div className="flex justify-between">
                <span>DAZ -2.0 a -1.0:</span>
                <span className="font-medium">Bajo</span>
              </div>
              <div className="flex justify-between">
                <span>DAZ < -2.0:</span>
                <span className="font-medium">Muy bajo</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            <strong>Nota:</strong> Esta implementación del D-score es una versión simplificada para fines educativos. 
            Para evaluaciones clínicas, se recomienda consultar con un profesional de desarrollo infantil.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DScoreResultados;