import React, { useState } from 'react';
import { generateDScoreChart } from '../utils/dscore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, ComposedChart } from 'recharts';
import GuiaUsoDScore from './GuiaUsoD-score';
import GSEDResources from './GSEDResources';
import './DScore.css';

const DScoreEducacion = ({ activeTab }) => {
  const chartData = generateDScoreChart([0, 60]);



  const ConceptoTab = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-2xl font-bold text-blue-900 mb-4">¿Qué es el D-score?</h3>
        <p className="text-blue-800 text-lg leading-relaxed">
          El <strong>D-score</strong> (Development Score) es una métrica innovadora que mide el desarrollo infantil 
          de manera continua y comparable, similar a como medimos el crecimiento físico con altura y peso.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Ventajas del D-score</h4>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span><strong>Continuo:</strong> No hay límites de edad arbitrarios</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span><strong>Comparable:</strong> Permite comparaciones entre culturas</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span><strong>Preciso:</strong> Basado en teoría psicométrica moderna</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span><strong>Integral:</strong> Combina múltiples áreas del desarrollo</span>
            </li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Aplicaciones Prácticas</h4>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>Monitoreo del progreso del desarrollo</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>Identificación temprana de retrasos</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>Evaluación de intervenciones</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>Investigación del desarrollo infantil</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-yellow-800 mb-2">Importante</h4>
        <p className="text-yellow-700">
          El D-score es una herramienta de evaluación, no un diagnóstico. Siempre debe ser interpretado 
          por profesionales de la salud infantil en conjunto con la observación clínica y el contexto familiar.
        </p>
      </div>
    </div>
  );

  const MetodologiaTab = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Fundamento Científico</h3>
        <p className="text-gray-700 mb-4">
          El D-score se basa en la <strong>Teoría de Respuesta al Ítem (IRT)</strong> y específicamente 
          en el <strong>Modelo de Rasch</strong>, que permite:
        </p>
        
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <h4 className="font-semibold text-gray-800 mb-2">Fórmula básica del modelo:</h4>
          <div className="font-mono text-sm bg-white p-3 rounded border">
            P(Xᵢⱼ = 1) = exp(θⱼ - δᵢ) / (1 + exp(θⱼ - δᵢ))
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Donde θⱼ es la habilidad del niño j, y δᵢ es la dificultad del ítem i
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Parámetros del Niño</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>θ (theta):</strong> Nivel de desarrollo</li>
              <li>• <strong>Edad cronológica:</strong> Referencia temporal</li>
              <li>• <strong>Contexto:</strong> Factores ambientales</li>
            </ul>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">Parámetros del Ítem</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• <strong>δ (delta):</strong> Dificultad del hito</li>
              <li>• <strong>Dominio:</strong> Área del desarrollo</li>
              <li>• <strong>Calibración:</strong> Validación cross-cultural</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Proceso de Cálculo</h3>
        
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 mt-1">1</div>
            <div>
              <h4 className="font-semibold">Recolección de Respuestas</h4>
              <p className="text-gray-600 text-sm">Se registran las respuestas (logrado/no logrado) para cada hito evaluado</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 mt-1">2</div>
            <div>
              <h4 className="font-semibold">Aplicación del Modelo Rasch</h4>
              <p className="text-gray-600 text-sm">Se estima la habilidad del niño considerando la dificultad de cada ítem</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 mt-1">3</div>
            <div>
              <h4 className="font-semibold">Transformación a D-score</h4>
              <p className="text-gray-600 text-sm">El valor de habilidad se transforma a escala D (0-100) para interpretación</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 mt-1">4</div>
            <div>
              <h4 className="font-semibold">Cálculo de DAZ</h4>
              <p className="text-gray-600 text-sm">Se calcula el Z-score ajustado por edad (D-score for Age Z-score)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const InterpretacionTab = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Interpretación de Resultados</h3>
        
        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-3">Valores del D-score</h4>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="mb-2"><strong>Rango típico:</strong> 15-85 puntos</p>
            <p className="mb-2"><strong>Media esperada:</strong> Varía según edad (20 puntos a 1 mes, 69 puntos a 72 meses)</p>
            <p><strong>Incremento típico:</strong> ~0.7 puntos por mes en los primeros 2 años</p>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-3">DAZ (D-score for Age Z-score)</h4>
          <div className="space-y-3">
            {[
              { range: 'DAZ ≥ +2.0', level: 'Muy superior', color: 'bg-green-100 text-green-800 border-green-200', description: 'Desarrollo excepcional para la edad' },
              { range: 'DAZ +1.0 a +1.9', level: 'Superior', color: 'bg-blue-100 text-blue-800 border-blue-200', description: 'Desarrollo avanzado para la edad' },
              { range: 'DAZ -1.0 a +0.9', level: 'Típico', color: 'bg-gray-100 text-gray-800 border-gray-200', description: 'Desarrollo esperado para la edad' },
              { range: 'DAZ -1.9 a -1.0', level: 'Ligeramente bajo', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', description: 'Monitoreo recomendado' },
              { range: 'DAZ ≤ -2.0', level: 'Significativamente bajo', color: 'bg-red-100 text-red-800 border-red-200', description: 'Evaluación profesional urgente' }
            ].map((item, index) => (
              <div key={index} className={`p-4 rounded-lg border ${item.color}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-semibold">{item.range}</span>
                    <span className="mx-2">→</span>
                    <span className="font-medium">{item.level}</span>
                  </div>
                </div>
                <p className="text-sm mt-1">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h4 className="font-semibold text-amber-800 mb-2">Consideraciones Importantes</h4>
          <ul className="text-sm text-amber-700 space-y-1">
            <li>• El SEM (error estándar) indica la precisión de la medición</li>
            <li>• Valores extremos requieren interpretación cuidadosa</li>
            <li>• El contexto cultural y socioeconómico es relevante</li>
            <li>• La variabilidad individual es normal y esperada</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const GraficaTab = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Curva de Referencia D-score</h3>
        <p className="text-gray-600 mb-6">
          Esta gráfica muestra la progresión esperada del D-score según la edad, incluyendo 
          las bandas de desviación estándar para interpretar el desarrollo individual.
        </p>
        
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="age" 
                label={{ value: 'Edad (meses)', position: 'insideBottom', offset: -10 }}
                stroke="#666"
              />
              <YAxis 
                label={{ value: 'D-score', angle: -90, position: 'insideLeft' }}
                domain={[15, 75]}
                stroke="#666"
              />
              <Tooltip 
                formatter={(value, name) => [
                  `${value.toFixed(1)}`,
                  name === 'mean' ? 'Media' :
                  name === 'plus1sd' ? '+1 DE' :
                  name === 'minus1sd' ? '-1 DE' :
                  name === 'plus2sd' ? '+2 DE' : '-2 DE'
                ]}
                labelFormatter={(age) => `Edad: ${age} meses`}
              />
              <Legend />
              
              {/* Bandas de desviación estándar */}
              <Area
                dataKey="plus2sd"
                stroke="none"
                fill="#fef3c7"
                fillOpacity={0.3}
                name="+2 DE"
              />
              <Area
                dataKey="minus2sd"
                stroke="none"
                fill="#fef3c7"
                fillOpacity={0.3}
                name="-2 DE"
              />
              
              {/* Líneas principales */}
              <Line 
                type="monotone" 
                dataKey="plus2sd" 
                stroke="#f59e0b" 
                strokeWidth={1}
                strokeDasharray="5 5"
                dot={false}
                name="+2 DE"
              />
              <Line 
                type="monotone" 
                dataKey="plus1sd" 
                stroke="#3b82f6" 
                strokeWidth={1}
                strokeDasharray="3 3"
                dot={false}
                name="+1 DE"
              />
              <Line 
                type="monotone" 
                dataKey="mean" 
                stroke="#1f2937" 
                strokeWidth={3}
                dot={false}
                name="Media"
              />
              <Line 
                type="monotone" 
                dataKey="minus1sd" 
                stroke="#3b82f6" 
                strokeWidth={1}
                strokeDasharray="3 3"
                dot={false}
                name="-1 DE"
              />
              <Line 
                type="monotone" 
                dataKey="minus2sd" 
                stroke="#f59e0b" 
                strokeWidth={1}
                strokeDasharray="5 5"
                dot={false}
                name="-2 DE"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 grid md:grid-cols-3 gap-4 text-sm">
          <div className="bg-gray-50 p-3 rounded">
            <div className="flex items-center mb-1">
              <div className="w-4 h-0.5 bg-gray-800 mr-2"></div>
              <span className="font-semibold">Línea Media</span>
            </div>
            <p className="text-gray-600">Desarrollo típico esperado</p>
          </div>
          
          <div className="bg-blue-50 p-3 rounded">
            <div className="flex items-center mb-1">
              <div className="w-4 h-0.5 bg-blue-600 mr-2" style={{background: 'repeating-linear-gradient(to right, #3b82f6 0, #3b82f6 3px, transparent 3px, transparent 6px)'}}></div>
              <span className="font-semibold">±1 DE</span>
            </div>
            <p className="text-gray-600">Rango normal (68% de niños)</p>
          </div>
          
          <div className="bg-yellow-50 p-3 rounded">
            <div className="flex items-center mb-1">
              <div className="w-4 h-0.5 bg-yellow-600 mr-2" style={{background: 'repeating-linear-gradient(to right, #f59e0b 0, #f59e0b 5px, transparent 5px, transparent 10px)'}}></div>
              <span className="font-semibold">±2 DE</span>
            </div>
            <p className="text-gray-600">Límites de preocupación (95% de niños)</p>
          </div>
        </div>
      </div>
    </div>
  );

  const FuentesTab = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Referencias Científicas</h3>
        
        <div className="space-y-4">
          <div className="border-l-4 border-blue-500 pl-4">
            <h4 className="font-semibold text-gray-900">Publicación Original</h4>
            <p className="text-gray-700 text-sm">
              van Buuren, S. (2014). <em>Growth charts of human development</em>. Statistical Methods in Medical Research, 23(4), 346-368.
            </p>
            <p className="text-gray-600 text-xs mt-1">
              DOI: 10.1177/0962280212473300
            </p>
          </div>
          
          <div className="border-l-4 border-green-500 pl-4">
            <h4 className="font-semibold text-gray-900">Implementación R</h4>
            <p className="text-gray-700 text-sm">
              van Buuren, S. & Eekhout, I. (2023). <em>dscore: D-score for Child Development</em>. 
              R package version 1.8.0.
            </p>
            <p className="text-gray-600 text-xs mt-1">
              URL: <a href="https://d-score.org" className="text-blue-600 hover:underline">https://d-score.org</a>
            </p>
          </div>
          
          <div className="border-l-4 border-purple-500 pl-4">
            <h4 className="font-semibold text-gray-900">Base de Datos</h4>
            <p className="text-gray-700 text-sm">
              Global Child Development Group. (2023). <em>Child Development Data Repository</em>. 
              R package childdevdata.
            </p>
            <p className="text-gray-600 text-xs mt-1">
              URL: <a href="https://d-score.org/childdevdata/" className="text-blue-600 hover:underline">https://d-score.org/childdevdata/</a>
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Validación Internacional</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Países con Datos</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>🇨🇱 Chile - 2,139 niños</li>
              <li>🇨🇳 China - 990 niños</li>
              <li>🇨🇴 Colombia - 2,646 niños</li>
              <li>🇪🇨 Ecuador - 667 niños</li>
              <li>🇯🇲 Jamaica - 920 niños</li>
              <li>🇲🇬 Madagascar - 205 niños</li>
              <li>🇳🇱 Países Bajos - 16,722 niños</li>
              <li>🇿🇦 Sudáfrica - 4,172 niños</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Instrumentos Incluidos</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Bayley Scales (BSID-III)</li>
              <li>• Ages & Stages Questionnaire (ASQ)</li>
              <li>• Denver Developmental Screening Test</li>
              <li>• Griffiths Mental Development Scales</li>
              <li>• Mullen Scales of Early Learning</li>
              <li>• MacArthur-Bates CDI</li>
              <li>• Vineland Adaptive Behavior Scales</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-blue-800 mb-2">Implementación en esta aplicación</h4>
        <p className="text-blue-700 text-sm">
          Esta implementación del D-score es una versión simplificada para fines educativos y de demostración. 
          Para uso clínico o de investigación, se recomienda utilizar la implementación oficial del paquete R 'dscore' 
          disponible en <a href="https://d-score.org" className="underline font-medium">d-score.org</a>.
        </p>
      </div>
    </div>
  );

  return (
    <div className="max-w-full mx-auto">
      {/* Contenido usando el mismo estilo que el resto de la aplicación */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6">
          {activeTab === 'concepto' && <ConceptoTab />}
          {activeTab === 'metodologia' && <MetodologiaTab />}
          {activeTab === 'interpretacion' && <InterpretacionTab />}
          {activeTab === 'grafica' && <GraficaTab />}
          {activeTab === 'guia' && <GuiaUsoDScore />}
          {activeTab === 'recursos' && <GSEDResources />}
          {activeTab === 'fuentes' && <FuentesTab />}
        </div>
      </div>
    </div>
  );
};

export default DScoreEducacion;