import React from 'react';
import './Bibliografia.css';
import Bibliografia from './Bibliografia';
import Metodologia from './Metodologia';

/**
 * Componente de Fundamentos - Router principal
 * 
 * Permite acceso a diferentes recursos de fundamentos científicos:
 * - Guía: Guía de trayectorias del desarrollo
 * - Bibliografía: Referencias científicas y documentación
 */
function Fundamentos({ subVista }) {
  return (
    <div className="fundamentos-container">
      {/* Renderizado condicional según la subvista seleccionada */}
      {subVista === 'guia' && <Metodologia />}
      {subVista === 'bibliografia' && <Bibliografia />}
      
      {/* Fallback por si no hay subvista válida */}
      {!['guia', 'bibliografia'].includes(subVista) && (
        <div className="fundamentos-fallback">
          <h2>📖 Fundamentos Científicos</h2>
          <p>Seleccione una sección desde el menú superior.</p>
        </div>
      )}
    </div>
  );
}

export default Fundamentos;