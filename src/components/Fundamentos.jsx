import React from 'react';
import './Bibliografia.css';
import Bibliografia from './Bibliografia';
import Metodologia from './Metodologia';

/**
 * Componente de Fundamentos - Router principal
 * 
 * Permite acceso a diferentes recursos de fundamentos científicos:
 * - Bibliografía: Referencias científicas y documentación
 * - Metodología: Métodos y protocolos de evaluación
 */
function Fundamentos({ subVista }) {
  return (
    <div className="fundamentos-container">
      {/* Renderizado condicional según la subvista seleccionada */}
      {subVista === 'bibliografia' && <Bibliografia />}
      {subVista === 'metodologia' && <Metodologia />}
      
      {/* Fallback por si no hay subvista válida */}
      {!['bibliografia', 'metodologia'].includes(subVista) && (
        <div className="fundamentos-fallback">
          <h2>📖 Fundamentos Científicos</h2>
          <p>Seleccione una sección desde el menú superior.</p>
        </div>
      )}
    </div>
  );
}

export default Fundamentos;