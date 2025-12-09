import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

/**
 * Guía Educativa para Clasificación de Trayectorias del Desarrollo
 * Basado en Thomas et al. (2009) - Figure 4
 * 
 * Componente informativo que muestra gráficas teóricas y criterios
 * para clasificar manualmente las trayectorias del desarrollo.
 */

export default function GuiaClasificacionTrayectorias() {
  const [tipoSeleccionado, setTipoSeleccionado] = useState('delayed-onset');

  // Datos sintéticos para las gráficas teóricas
  const generarDatosTipicos = () => {
    const datos = [];
    for (let edad = 6; edad <= 36; edad += 6) {
      datos.push({
        edad: edad,
        tipico: edad,
        atipico: null // Se llenará según el tipo
      });
    }
    return datos;
  };

  const tiposTrayectorias = {
    'delayed-onset': {
      nombre: 'Delayed Onset (Inicio Retrasado)',
      descripcion: 'Diferencia significativa en el intercepto. El desarrollo empieza más tarde pero progresa al mismo ritmo.',
      criterios: [
        'Intercepto significativamente menor que el grupo típico',
        'Pendiente similar al grupo típico (paralela)',
        'La distancia entre trayectorias se mantiene constante',
        'Todas las mediciones están por debajo de la normalidad en la misma magnitud'
      ],
      caracteristicas: [
        'Trayectoria paralela a la típica pero desplazada hacia abajo',
        'Velocidad de desarrollo: NORMAL',
        'Edad de inicio: RETRASADA',
        'Los hitos se alcanzan en el mismo orden y secuencia que típico'
      ],
      implicaciones: [
        'Mecanismo subyacente: Retraso generalizado pero no específico',
        'Intervención: Estimulación global apropiada para edad de desarrollo',
        'Pronóstico: La brecha se mantiene pero no aumenta',
        'Ejemplo: Retraso global del desarrollo sin alteración cualitativa'
      ],
      generarDatos: () => {
        const datos = [];
        for (let edad = 6; edad <= 36; edad += 6) {
          datos.push({
            edad: edad,
            tipico: edad,
            atipico: edad - 6 // Desfase constante de 6 meses
          });
        }
        return datos;
      }
    },
    
    'slowed-rate': {
      nombre: 'Slowed Rate (Velocidad Reducida)',
      descripcion: 'Diferencia en la pendiente. El desarrollo progresa más lentamente que el típico.',
      criterios: [
        'Intercepto similar al grupo típico (inicio normal)',
        'Pendiente menor que el grupo típico (más plana)',
        'La distancia entre trayectorias aumenta con el tiempo',
        'Velocidad de cambio inferior a la esperada'
      ],
      caracteristicas: [
        'Trayectoria con menor pendiente que la típica',
        'Velocidad de desarrollo: REDUCIDA',
        'Edad de inicio: NORMAL',
        'La brecha con la normalidad se hace cada vez mayor'
      ],
      implicaciones: [
        'Mecanismo subyacente: Procesamiento más lento',
        'Intervención: Intensiva y específica al dominio afectado',
        'Pronóstico: Sin intervención, la diferencia aumentará',
        'Ejemplo: Dificultades específicas de aprendizaje'
      ],
      generarDatos: () => {
        const datos = [];
        for (let edad = 6; edad <= 36; edad += 6) {
          datos.push({
            edad: edad,
            tipico: edad,
            atipico: edad * 0.6 // Progresa al 60% de velocidad típica
          });
        }
        return datos;
      }
    },
    
    'delayed-slowed': {
      nombre: 'Delayed Onset + Slowed Rate',
      descripcion: 'Diferencias en ambos parámetros. El desarrollo empieza tarde Y progresa más lento.',
      criterios: [
        'Intercepto significativamente menor (inicio retrasado)',
        'Pendiente menor que típico (velocidad reducida)',
        'Ambas diferencias son estadísticamente significativas',
        'La brecha aumenta progresivamente'
      ],
      caracteristicas: [
        'Doble afectación: inicio y velocidad',
        'Velocidad de desarrollo: REDUCIDA',
        'Edad de inicio: RETRASADA',
        'Pronóstico más reservado que retraso simple'
      ],
      implicaciones: [
        'Mecanismo subyacente: Afectación múltiple',
        'Intervención: Intensiva, precoz y prolongada',
        'Pronóstico: Más desfavorable, requiere seguimiento estrecho',
        'Ejemplo: Discapacidad intelectual, trastornos múltiples'
      ],
      generarDatos: () => {
        const datos = [];
        for (let edad = 6; edad <= 36; edad += 6) {
          datos.push({
            edad: edad,
            tipico: edad,
            atipico: (edad * 0.5) - 3 // Inicio retrasado Y velocidad al 50%
          });
        }
        return datos;
      }
    },
    
    'nonlinear': {
      nombre: 'Nonlinear (No Lineal)',
      descripcion: 'Función no lineal ajusta mejor. La velocidad de desarrollo varía con la edad.',
      criterios: [
        'R² del modelo lineal es pobre',
        'Modelo curvilíneo (cuadrático, logístico) ajusta mejor',
        'Test F estadísticamente significativo',
        'Patrón en S, U invertida, u otra forma curva'
      ],
      caracteristicas: [
        'Trayectoria curva, no recta',
        'Velocidad de desarrollo: VARIABLE',
        'Posibles ventanas críticas o períodos sensibles',
        'Oleadas de desarrollo o mesetas temporales'
      ],
      implicaciones: [
        'Mecanismo subyacente: Procesos no lineales, reorganización',
        'Intervención: Adaptada a las fases de desarrollo',
        'Pronóstico: Depende de la forma de la curva',
        'Ejemplo: Desarrollo con períodos de aceleración/desaceleración'
      ],
      generarDatos: () => {
        const datos = [];
        for (let edad = 6; edad <= 36; edad += 6) {
          // Curva logística (S)
          const t = (edad - 18) / 10; // Normalizar
          datos.push({
            edad: edad,
            tipico: edad,
            atipico: 18 + 12 / (1 + Math.exp(-t)) // Función logística
          });
        }
        return datos;
      }
    },
    
    'premature-asymptote': {
      nombre: 'Premature Asymptote (Asíntota Prematura)',
      descripcion: 'Desarrollo inicialmente similar que se estanca antes del nivel esperado.',
      criterios: [
        'Desarrollo inicial normal o cercano a normal',
        'Desaceleración marcada en etapas posteriores',
        'Se alcanza una meseta por debajo del nivel esperado',
        'Cambio inicial > Cambio tardío'
      ],
      caracteristicas: [
        'Inicio: NORMAL',
        'Trayectoria posterior: MESETA',
        'Nivel alcanzado: INFERIOR al esperado',
        'Patrón sugestivo de límite alcanzado'
      ],
      implicaciones: [
        'Mecanismo subyacente: Límite en capacidad de desarrollo',
        'Intervención: Estrategias para superar la meseta',
        'Pronóstico: Nivel final limitado',
        'Ejemplo: Algunos síndromes con límite superior definido'
      ],
      generarDatos: () => {
        const datos = [];
        for (let edad = 6; edad <= 36; edad += 6) {
          // Función con asíntota
          const maxNivel = 24; // Se estanca en 24 meses
          const tasa = 0.15;
          datos.push({
            edad: edad,
            tipico: edad,
            atipico: maxNivel * (1 - Math.exp(-tasa * edad))
          });
        }
        return datos;
      }
    },
    
    'zero-trajectory': {
      nombre: 'Zero Trajectory (Sin Cambio)',
      descripcion: 'No hay cambio confiable en el rendimiento con la edad.',
      criterios: [
        'No hay relación significativa entre edad y rendimiento',
        'Varianza muy baja (desviación < 3 puntos)',
        'Pendiente no significativamente diferente de 0',
        'Todas las mediciones en el mismo nivel'
      ],
      caracteristicas: [
        'Nivel: ESTABLE',
        'Progreso: AUSENTE',
        'Sistema ha alcanzado su límite ontogenético',
        'Sin efecto de maduración'
      ],
      implicaciones: [
        'Mecanismo subyacente: Límite absoluto alcanzado',
        'Intervención: Considerar enfoques alternativos',
        'Pronóstico: Sin cambio esperado sin intervención',
        'Ejemplo: Afectación severa, meseta prolongada'
      ],
      generarDatos: () => {
        const datos = [];
        for (let edad = 6; edad <= 36; edad += 6) {
          datos.push({
            edad: edad,
            tipico: edad,
            atipico: 12 // Permanece en 12 meses ED
          });
        }
        return datos;
      }
    },
    
    'no-systematic': {
      nombre: 'No Systematic Relationship (Sin Relación Sistemática)',
      descripcion: 'No existe patrón predecible entre edad y rendimiento.',
      criterios: [
        'R² muy bajo (< 0.3) para todos los modelos',
        'Alta variabilidad sin tendencia clara',
        'No hay función que ajuste bien los datos',
        'Patrón errático'
      ],
      caracteristicas: [
        'Variabilidad: MUY ALTA',
        'Patrón: IMPREDECIBLE',
        'No sigue trayectoria típica ni atípica definida',
        'Posible perfil "pico-valle" extremo'
      ],
      implicaciones: [
        'Mecanismo subyacente: Desarrollo muy heterogéneo',
        'Intervención: Evaluación caso por caso',
        'Pronóstico: Difícil de establecer',
        'Ejemplo: Perfiles cognitivos muy irregulares'
      ],
      generarDatos: () => {
        const datos = [];
        for (let edad = 6; edad <= 36; edad += 6) {
          // Datos con alta variabilidad sin patrón
          const variacion = (Math.random() - 0.5) * 8;
          datos.push({
            edad: edad,
            tipico: edad,
            atipico: Math.max(6, Math.min(30, edad * 0.7 + variacion))
          });
        }
        return datos;
      }
    }
  };

  const tipoActual = tiposTrayectorias[tipoSeleccionado];
  const datosGrafica = tipoActual.generarDatos();

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
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
          marginTop: 0,
          marginBottom: '1rem',
          letterSpacing: '-0.01em',
          lineHeight: '1.2'
        }}>
          📚 Guía de Clasificación de Trayectorias del Desarrollo
        </h2>
        <p style={{
          fontSize: '1.2rem',
          color: 'white',
          lineHeight: '1.8',
          margin: '0',
          fontWeight: '400'
        }}>
          Basado en Thomas et al. (2009) - 7 tipologías de trayectorias atípicas con criterios de clasificación e implicaciones clínicas
        </p>
      </div>

      {/* Selector de tipo */}
      <div style={{ marginBottom: '30px' }}>
        <label style={{ 
          display: 'block', 
          marginBottom: '10px', 
          fontWeight: 'bold',
          fontSize: '16px'
        }}>
          Selecciona un tipo de trayectoria para ver detalles:
        </label>
        <select
          value={tipoSeleccionado}
          onChange={(e) => setTipoSeleccionado(e.target.value)}
          style={{ 
            padding: '12px 15px', 
            borderRadius: '6px', 
            border: '2px solid #2196F3',
            fontSize: '15px',
            width: '100%',
            maxWidth: '600px',
            cursor: 'pointer',
            backgroundColor: 'white'
          }}
        >
          {Object.entries(tiposTrayectorias).map(([key, tipo]) => (
            <option key={key} value={key}>
              {tipo.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Contenido principal */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '30px',
        marginBottom: '30px'
      }}>
        {/* Columna izquierda: Gráfica */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid #ddd'
        }}>
          <h3 style={{ marginTop: 0, color: '#1976D2' }}>
            Gráfica Teórica
          </h3>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
            {tipoActual.descripcion}
          </p>
          
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={datosGrafica} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="edad" 
                type="number"
                domain={[6, 36]}
                label={{ value: 'Edad Cronológica (meses)', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                domain={[0, 40]}
                label={{ value: 'Edad de Desarrollo (meses)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="tipico" 
                stroke="#4CAF50" 
                strokeWidth={3}
                name="Trayectoria Típica (TD)"
                dot={{ fill: '#4CAF50', r: 5 }}
              />
              <Line 
                type="monotone" 
                dataKey="atipico" 
                stroke="#F44336" 
                strokeWidth={3}
                name="Trayectoria Atípica"
                dot={{ fill: '#F44336', r: 5 }}
                strokeDasharray={tipoSeleccionado === 'no-systematic' ? "5 5" : "0"}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>

          <div style={{ 
            marginTop: '15px', 
            padding: '10px', 
            backgroundColor: '#FFF3E0',
            borderRadius: '4px',
            fontSize: '13px'
          }}>
            <strong>Leyenda:</strong>
            <div style={{ marginTop: '5px' }}>
              <span style={{ color: '#4CAF50' }}>●</span> Trayectoria Típica (grupo control)<br/>
              <span style={{ color: '#F44336' }}>●</span> Trayectoria Atípica (grupo con trastorno)<br/>
              <span style={{ color: '#999' }}>---</span> Línea de referencia (ED = EC)
            </div>
          </div>
        </div>

        {/* Columna derecha: Criterios */}
        <div>
          {/* Criterios de clasificación */}
          <div style={{ 
            backgroundColor: 'white', 
            padding: '20px', 
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid #ddd',
            marginBottom: '20px'
          }}>
            <h3 style={{ marginTop: 0, color: '#1976D2' }}>
              <i className="fas fa-check-circle"></i> Criterios de Clasificación
            </h3>
            <ul style={{ lineHeight: '1.8', paddingLeft: '20px' }}>
              {tipoActual.criterios.map((criterio, index) => (
                <li key={index} style={{ marginBottom: '8px' }}>
                  {criterio}
                </li>
              ))}
            </ul>
          </div>

          {/* Características */}
          <div style={{ 
            backgroundColor: 'white', 
            padding: '20px', 
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid #ddd'
          }}>
            <h3 style={{ marginTop: 0, color: '#1976D2' }}>
              <i className="fas fa-list-ul"></i> Características
            </h3>
            <ul style={{ lineHeight: '1.8', paddingLeft: '20px' }}>
              {tipoActual.caracteristicas.map((car, index) => (
                <li key={index} style={{ marginBottom: '8px' }}>
                  {car}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Implicaciones clínicas */}
      <div style={{ 
        backgroundColor: '#FFF9C4', 
        padding: '20px', 
        borderRadius: '8px',
        border: '2px solid #FBC02D',
        marginBottom: '30px'
      }}>
        <h3 style={{ marginTop: 0, color: '#F57F17' }}>
          💡 Implicaciones Clínicas
        </h3>
        <ul style={{ lineHeight: '1.8', paddingLeft: '20px', marginBottom: 0 }}>
          {tipoActual.implicaciones.map((impl, index) => (
            <li key={index} style={{ marginBottom: '10px' }}>
              {impl}
            </li>
          ))}
        </ul>
      </div>

      {/* Sección adicional con gráficos de problemas metodológicos */}
      <div style={{
        backgroundColor: '#FFF8E7',
        padding: '20px',
        borderRadius: '8px',
        border: '2px solid #FFA726',
        marginBottom: '30px'
      }}>
        <h3 style={{ marginTop: 0, color: '#E65100' }}>
          📈 Simulaciones de Problemas Metodológicos
        </h3>
        <p style={{ marginBottom: '20px', fontSize: '14px', color: '#555' }}>
          Las siguientes gráficas ilustran problemas comunes en la evaluación del desarrollo que las trayectorias ayudan a identificar.
        </p>

        {/* Gráfico del problema del CD */}
        <div style={{ marginBottom: '25px' }}>
          <h4 style={{ color: '#E65100', marginBottom: '10px' }}>
            ⚠️ Problema del Cociente de Desarrollo (CD) Aislado
          </h4>
          <p style={{ fontSize: '13px', color: '#666', marginBottom: '15px' }}>
            Tres niños con el mismo CD (70%) pero trayectorias muy diferentes. Solo el análisis longitudinal revela el verdadero patrón.
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart 
              data={[
                {edad: 12, tipico: 12, ninoA: 8.4, ninoB: 11, ninoC: 6},
                {edad: 18, tipico: 18, ninoA: 12.6, ninoB: 14.5, ninoC: 8.5},
                {edad: 24, tipico: 24, ninoA: 16.8, ninoB: 16.8, ninoC: 16.8},
                {edad: 30, tipico: 30, ninoA: 21, ninoB: 18, ninoC: 26},
                {edad: 36, tipico: 36, ninoA: 25.2, ninoB: 18.5, ninoC: 34}
              ]}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="edad"
                type="number"
                domain={[12, 36]}
                label={{ value: 'Edad Cronológica (meses)', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                domain={[0, 40]}
                label={{ value: 'Edad de Desarrollo (meses)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip formatter={(value, name) => [`${value.toFixed(1)} meses`, name]} />
              <Legend />
              <Line 
                type="monotone"
                dataKey="tipico"
                stroke="#4CAF50" 
                strokeWidth={3}
                name="Desarrollo Típico"
                dot={false}
              />
              <Line 
                type="monotone"
                dataKey="ninoA"
                stroke="#2196F3" 
                strokeWidth={3}
                name="Niño A: Retraso Estable"
                dot={{ fill: '#2196F3', r: 4 }}
              />
              <Line 
                type="monotone"
                dataKey="ninoB"
                stroke="#F44336" 
                strokeWidth={3}
                name="Niño B: Desaceleración"
                dot={{ fill: '#F44336', r: 4 }}
              />
              <Line 
                type="monotone"
                dataKey="ninoC"
                stroke="#9C27B0" 
                strokeWidth={3}
                name="Niño C: Recuperación"
                dot={{ fill: '#9C27B0', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div style={{ 
            backgroundColor: '#FFF3E0',
            padding: '10px',
            borderRadius: '4px',
            fontSize: '12px',
            marginTop: '10px'
          }}>
            <strong>Interpretación:</strong> Los tres niños tienen CD = 70% a los 24 meses, pero:
            <br/>• <span style={{color: '#2196F3'}}>Azul</span>: Progreso constante, buen pronóstico
            <br/>• <span style={{color: '#F44336'}}>Rojo</span>: Deterioro progresivo, requiere intervención urgente
            <br/>• <span style={{color: '#9C27B0'}}>Morado</span>: Respuesta excelente a la intervención
          </div>
        </div>

        {/* Gráfico del problema de heterocedasticidad */}
        <div style={{ marginBottom: '15px' }}>
          <h4 style={{ color: '#E65100', marginBottom: '10px' }}>
            📊 Problema de la Heterocedasticidad
          </h4>
          <p style={{ fontSize: '13px', color: '#666', marginBottom: '15px' }}>
            La variabilidad del desarrollo no es constante: aumenta con la edad, especialmente en poblaciones atípicas.
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart 
              data={[
                {edad: 6, mediaTipica: 6, plusDETipico: 7.5, menosDETipico: 4.5, mediaAtipica: 4.2, plusDEAtipico: 5.5, menosDEAtipico: 2.9},
                {edad: 12, mediaTipica: 12, plusDETipico: 15.5, menosDETipico: 8.5, mediaAtipica: 8.4, plusDEAtipico: 13, menosDEAtipico: 3.8},
                {edad: 18, mediaTipica: 18, plusDETipico: 24, menosDETipico: 12, mediaAtipica: 12.6, plusDEAtipico: 22, menosDEAtipico: 3.2},
                {edad: 24, mediaTipica: 24, plusDETipico: 33, menosDETipico: 15, mediaAtipica: 16.8, plusDEAtipico: 32.5, menosDEAtipico: 1.1},
                {edad: 30, mediaTipica: 30, plusDETipico: 42.5, menosDETipico: 17.5, mediaAtipica: 21, plusDEAtipico: 44, menosDEAtipico: -2},
                {edad: 36, mediaTipica: 36, plusDETipico: 52.5, menosDETipico: 19.5, mediaAtipica: 25.2, plusDEAtipico: 57, menosDEAtipico: -6.6}
              ]}
              margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="edad"
                type="number"
                domain={[6, 36]}
                label={{ value: 'Edad Cronológica (meses)', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                domain={[-10, 60]}
                label={{ value: 'Edad de Desarrollo (meses)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip formatter={(value, name) => [`${value.toFixed(1)} meses`, name]} />
              <Legend />
              
              <Line 
                type="monotone"
                dataKey="mediaTipica"
                stroke="#4CAF50" 
                strokeWidth={3}
                name="Media Típica"
                dot={false}
              />
              <Line 
                type="monotone"
                dataKey="plusDETipico"
                stroke="#81C784" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="+1 DE Típico"
                dot={false}
              />
              <Line 
                type="monotone"
                dataKey="menosDETipico"
                stroke="#81C784" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="-1 DE Típico"
                dot={false}
              />
              <Line 
                type="monotone"
                dataKey="mediaAtipica"
                stroke="#F44336" 
                strokeWidth={3}
                name="Media Atípica"
                dot={false}
              />
              <Line 
                type="monotone"
                dataKey="plusDEAtipico"
                stroke="#FFCDD2" 
                strokeWidth={2}
                strokeDasharray="3 3"
                name="+1 DE Atípico"
                dot={false}
              />
              <Line 
                type="monotone"
                dataKey="menosDEAtipico"
                stroke="#FFCDD2" 
                strokeWidth={2}
                strokeDasharray="3 3"
                name="-1 DE Atípico"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
          <div style={{ 
            backgroundColor: '#FFEBEE',
            padding: '10px',
            borderRadius: '4px',
            fontSize: '12px',
            marginTop: '10px'
          }}>
            <strong>Observación clave:</strong> La variabilidad aumenta dramáticamente con la edad. 
            A los 36 meses, un niño atípico puede estar entre -6.6 y +57 meses de desarrollo, 
            mientras que uno típico varía solo entre 19.5 y 52.5 meses.
          </div>
        </div>
      </div>

      {/* Tabla comparativa */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: '1px solid #ddd',
        marginBottom: '30px'
      }}>
        <h3 style={{ marginTop: 0, color: '#1976D2' }}>
          📊 Tabla Comparativa de Tipos
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#E3F2FD' }}>
                <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Tipo</th>
                <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Intercepto</th>
                <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Pendiente</th>
                <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Forma</th>
                <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Distancia TD</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}><strong>Delayed Onset</strong></td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>↓ Bajo</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>= Similar</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>Lineal</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>Constante</td>
              </tr>
              <tr style={{ backgroundColor: '#F5F5F5' }}>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}><strong>Slowed Rate</strong></td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>= Similar</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>↓ Menor</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>Lineal</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>Aumenta</td>
              </tr>
              <tr>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}><strong>Delayed + Slowed</strong></td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>↓ Bajo</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>↓ Menor</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>Lineal</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>Aumenta mucho</td>
              </tr>
              <tr style={{ backgroundColor: '#F5F5F5' }}>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}><strong>Nonlinear</strong></td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>Variable</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>Variable</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>Curva</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>Variable</td>
              </tr>
              <tr>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}><strong>Premature Asymptote</strong></td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>= Similar</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>↓ Luego 0</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>Meseta</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>Aumenta luego se estabiliza</td>
              </tr>
              <tr style={{ backgroundColor: '#F5F5F5' }}>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}><strong>Zero Trajectory</strong></td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>↓ Bajo</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>0 Nula</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>Plana</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>Aumenta linealmente</td>
              </tr>
              <tr>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}><strong>No Systematic</strong></td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>N/A</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>N/A</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>Errática</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>Impredecible</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Referencias */}
      <div style={{ 
        backgroundColor: '#ECEFF1', 
        padding: '20px', 
        borderRadius: '8px',
        border: '1px solid #90A4AE'
      }}>
        <h3 style={{ marginTop: 0, color: '#37474F' }}>
          📖 Referencias
        </h3>
        <p style={{ marginBottom: '10px', lineHeight: '1.6' }}>
          <strong>Thomas, M. S., Annaz, D., Ansari, D., Scerif, G., Jarrold, C., & Karmiloff-Smith, A. (2009).</strong><br/>
          Using developmental trajectories to understand developmental disorders.<br/>
          <em>Journal of Speech, Language, and Hearing Research, 52</em>(2), 336-358.
        </p>
        <p style={{ marginBottom: 0, fontSize: '14px', color: '#555' }}>
          <strong>Ubicación del PDF:</strong> <code>biblio/Thomas et al. - 2009 - Using developmental trajectories to understand developmental disorders.pdf</code>
        </p>
      </div>

      {/* Nota sobre uso */}
      <div style={{ 
        marginTop: '30px',
        padding: '15px',
        backgroundColor: '#E8F5E9',
        borderRadius: '6px',
        border: '1px solid #4CAF50',
        fontSize: '14px'
      }}>
        <strong>💡 Cómo usar esta guía:</strong>
        <ol style={{ marginTop: '10px', marginBottom: 0, paddingLeft: '20px' }}>
          <li>Visualiza los datos del niño en el gráfico de desarrollo</li>
          <li>Compara visualmente con las gráficas teóricas de esta guía</li>
          <li>Identifica qué tipo de trayectoria se asemeja más</li>
          <li>Verifica los criterios específicos del tipo identificado</li>
          <li>Considera las implicaciones clínicas para el plan de intervención</li>
        </ol>
      </div>
    </div>
  );
}
