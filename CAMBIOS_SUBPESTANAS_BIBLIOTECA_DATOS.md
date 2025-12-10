# Implementación de Subpestañas Jerárquicas en Biblioteca de Datos

## Resumen de Cambios

Se ha implementado el sistema de subpestañas jerárquicas para la **Biblioteca de Datos** siguiendo la misma estética y funcionalidad que las pestañas de **Niños** y **Tutorial**. Además, se eliminó el encabezado redundante "Biblioteca de Datos" y se simplificó la estructura eliminando la pestaña "Análisis Avanzado".

## Cambios Realizados

### 1. App.jsx

**Estado agregado:**
```javascript
const [subVistaBibliotecaDatos, setSubVistaBibliotecaDatos] = useState('escalas-normativas');
```

**Nueva navegación jerárquica:**
```javascript
{/* Sub-pestañas jerárquicas para biblioteca de datos */}
{esAdmin() && vistaActual === 'datos' && (
  <div className="nav-level-2">
    <div className="sub-nav-buttons">
      <div className="biblioteca-name-tab">
        <div className="biblioteca-nombre">🗄️ Biblioteca de Datos</div>
      </div>
      <button className={`sub-nav-btn ${subVistaBibliotecaDatos === 'escalas-normativas' ? 'active' : ''}`}>
        📊 Escalas Normativas
      </button>
      <button className={`sub-nav-btn ${subVistaBibliotecaDatos === 'cohortes-personalizadas' ? 'active' : ''}`}>
        👥 Cohortes Personalizadas
      </button>
      <button className={`sub-nav-btn ${subVistaBibliotecaDatos === 'estadisticas-uso' ? 'active' : ''}`}>
        📈 Estadísticas de Uso
      </button>

    </div>
  </div>
)}
```

**Prop pasado al componente:**
```javascript
<BibliotecaDatos subVista={subVistaBibliotecaDatos} />
```

### 2. App.css

**Nuevos estilos para la pestaña de biblioteca:**
```css
/* Estilos para pestaña de biblioteca de datos */
.biblioteca-name-tab {
  padding: 0.6rem 1rem;
  background: #e3f2fd;
  border: 1px solid #2196f3;
  border-radius: 3px;
  font-size: 0.75rem;
  color: #1976d2;
  margin-right: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.biblioteca-nombre {
  font-weight: 700;
  font-size: 0.8rem;
}
```

### 3. BibliotecaDatos.jsx

**Función modificada:**
- Acepta prop `subVista` en lugar de manejar pestañas internas
- Eliminado el sistema de pestañas `tabs-container` y `tabs-nav`
- **Eliminado el encabezado `header-section`** ya que es redundante con la navegación jerárquica
- Reemplazado por navegación controlada desde App.jsx
- Movido el botón de actualización a cada sección individual

```javascript
const BibliotecaDatos = ({ subVista = 'escalas-normativas' }) => {
  // ...resto del código
  
  return (
    <div className="biblioteca-datos">
      <div className="content-container">
        {subVista === 'escalas-normativas' && renderEscalasNormativas()}
        {subVista === 'cohortes-personalizadas' && renderCohortesPersonalizadas()}
        {subVista === 'estadisticas-uso' && renderEstadisticasUso()}
      </div>
    </div>
  );
};
```

### 4. BibliotecaDatos.css

**Nuevo contenedor de contenido:**
```css
.content-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  padding: 2rem;
}

/* Contenedor de botones en headers */
.header-buttons {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

/* Botón de actualización rediseñado */
.btn-refresh {
  background: #17a2b8;
  color: white;
  border: 2px solid #17a2b8;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
  white-space: nowrap;
}
```

## Resultado

Ahora la **Biblioteca de Datos** tiene la misma estructura de navegación jerárquica que:

1. **Niños** → Subpestañas: Hitos del Desarrollo, Señales de Alarma, Gráficas
2. **Tutorial** → Subpestañas: Guía de Trayectorias, Ejemplos Prácticos  
3. **Investigación** → Subpestañas: Limitaciones Estadísticas, Simulación de Poblaciones, Fuentes Normativas
4. **📊 Biblioteca de Datos** → Subpestañas: **Escalas Normativas, Cohortes Personalizadas, Estadísticas de Uso**

## Características Mantenidas

- Las **subtabs internas** de "Escalas Normativas" (Resumen y Distribución / Tabla Completa) se mantuvieron ya que proporcionan navegación útil dentro del contenido específico
- El **botón de actualización** ahora aparece en cada sección individual (junto a los botones de exportación)
- La funcionalidad completa de filtros, ordenación y exportación se preserva
- Los estilos y la experiencia de usuario son consistentes

## Mejoras Adicionales

- **Interface más limpia**: Eliminado el encabezado redundante que duplicaba información ya presente en la navegación
- **Botones contextuales**: El botón de actualización ahora está disponible en cada sección donde es relevante
- **Mejor organización visual**: Los botones de acción (actualizar/exportar) están agrupados en el header de cada sección
- **Simplificación**: Eliminada la pestaña "Análisis Avanzado" para reducir la complejidad de la interfaz

## Jerarquía de Navegación

```
🗄️ Biblioteca de Datos (Pestaña Principal)
├── 📊 Escalas Normativas (Subpestaña)
│   ├── 📊 Resumen y Distribución (Subtab interna)
│   └── 📋 Tabla Completa (Subtab interna)
├── 👥 Cohortes Personalizadas (Subpestaña)
└── 📈 Estadísticas de Uso (Subpestaña)
```

Los cambios están listos y probados sin errores de sintaxis.