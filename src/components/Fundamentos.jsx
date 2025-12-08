import React from 'react';
import './Bibliografia.css';
import Bibliografia from './Bibliografia';
import Metodologia from './Metodologia';

/**
 * Componente de Fundamentos - Muestra la guía de trayectorias
 */
function Fundamentos() {
  return (
    <div className="fundamentos-container">
      <Metodologia />
    </div>
  );
}

export default Fundamentos;