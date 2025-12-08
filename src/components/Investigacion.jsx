import React from 'react';
import './Investigacion.css';
import FuentesNormativas from './FuentesNormativas';
import FundamentosCientificos from './FundamentosCientificos';
import SimulacionPoblaciones from './SimulacionPoblaciones';
import AnalisisResultados from './AnalisisResultados';

/**
 * Componente de Investigación - Router principal
 * 
 * Permite acceso a diferentes herramientas de investigación del desarrollo infantil:
 * - Limitaciones Estadísticas: Bases teóricas y metodológicas
 * - Simulación de Poblaciones: Generación de datos experimentales
 * - Análisis de Resultados: Evaluación de propiedades psicométricas
 * - Fuentes Normativas: Comparación de escalas de desarrollo
 */
function Investigacion({ subVista }) {
  return (
    <div className="investigacion-container">
      {/* Renderizado condicional según la subvista seleccionada */}
      {subVista === 'limitaciones' && <FundamentosCientificos />}
      {subVista === 'simulacion' && <SimulacionPoblaciones />}
      {subVista === 'analisis' && <AnalisisResultados />}
      {subVista === 'fuentes-normativas' && <FuentesNormativas />}
      
      {/* Fallback por si no hay subvista válida */}
      {!['limitaciones', 'simulacion', 'analisis', 'fuentes-normativas'].includes(subVista) && (
        <div className="investigacion-fallback">
          <h2>🔬 Módulo de Investigación</h2>
          <p>Seleccione una herramienta de investigación desde el menú superior.</p>
        </div>
      )}
    </div>
  );
}

export default Investigacion;