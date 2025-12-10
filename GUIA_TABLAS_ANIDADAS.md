# Guía de Uso - Tablas Anidadas en Biblioteca de Datos

## ✅ **Funcionalidad Implementada y Desplegada**

### 🗄️ **Acceso a la Biblioteca de Datos**

#### **Requisitos de Acceso**:
- **Usuario**: Administrador del sistema
- **Credenciales**: admin@neuropedialab.org / admin123
- **Ubicación**: Pestaña "🗄️ Biblioteca de Datos" (solo visible para admins)

### 📊 **Estructura de Navegación Jerárquica**

#### **Pestañas Principales**:
1. **📊 Escalas Normativas** (con subtabs)
2. **👥 Cohortes Personalizadas** 
3. **📈 Estadísticas de Uso**
4. **🔬 Análisis Avanzado**

#### **Subtabs en Escalas Normativas**:
1. **📊 Resumen**: Métricas y totales del sistema
2. **📈 Distribución**: Gráficos por fuentes y dominios  
3. **🔄 Hitos Duplicados**: ⭐ **TABLAS ANIDADAS AQUÍ**
4. **📋 Tabla Completa**: Vista filtrable completa

### 🔄 **Cómo Usar las Tablas Anidadas**

#### **Paso 1: Navegar a Hitos Duplicados**
1. Iniciar sesión como administrador
2. Ir a "🗄️ Biblioteca de Datos" 
3. Asegurar estar en "📊 Escalas Normativas"
4. Hacer click en subtab "🔄 Hitos Duplicados"

#### **Paso 2: Explorar Hitos Duplicados**
- **Lista Principal**: Ver hitos que aparecen en múltiples escalas
- **Ordenación**: Hitos más duplicados aparecen primero
- **Información Summary**: "X escalas - Y fuentes"

#### **Paso 3: Expandir Tabla Anidada**
- **Click en Header**: Hacer clic en cualquier hito duplicado
- **Icono Visual**: ▶ (cerrado) cambia a ▼ (abierto)
- **Tabla Desplegable**: Aparece tabla con datos por fuente

### 📋 **Estructura de la Tabla Anidada**

#### **Ejemplo Visual**:
```
▶ Camina solo (4 escalas - 4 fuentes)  [CLICK AQUÍ]
▼ Al expandirse:
┌─────────────┬─────────────┬─────────────┬─────────────┐
│ Fuente      │ Dominio     │ Edad Media  │ Percentiles │
├─────────────┼─────────────┼─────────────┼─────────────┤
│ CDC         │ Motor Grueso│ 13.0 meses  │ 11.3|13|14.7│
│ OMS         │ Motor Grueso│ 13.7 meses  │ 11.9|13.7|15.4│
│ Bayley      │ Motor Grueso│ 12.7 meses  │ 10.8|12.7|14.6│
│ Battelle    │ Motor Grueso│ 13.3 meses  │ 11.3|13.3|15.2│
└─────────────┴─────────────┴─────────────┴─────────────┘
```

#### **Columnas de Datos**:
- **Fuente**: Escala normativa (CDC, OMS, Bayley, Battelle)
- **Dominio**: Área del desarrollo
- **Edad Media**: Edad promedio en meses
- **Desv. Est.**: Desviación estándar
- **P25/P50/P75**: Percentiles 25, 50 y 75

### 🎯 **Casos de Uso Prácticos**

#### **Para Investigadores**:
1. **Comparar Escalas**: Ver diferencias entre CDC vs OMS para "caminar"
2. **Analizar Variabilidad**: Detectar discrepancias significativas entre fuentes
3. **Validar Consenso**: Identificar hitos con evaluación consistente
4. **Estudiar Metodologías**: Entender diferencias en criterios de evaluación

#### **Para Clínicos**:
1. **Seleccionar Escala**: Elegir la más apropiada según población
2. **Interpretar Variaciones**: Entender rangos normales entre fuentes
3. **Decisiones Clínicas**: Usar múltiples referencias para evaluación
4. **Comunicar a Familias**: Explicar variabilidad normal entre escalas

#### **Para Administradores**:
1. **Auditar Calidad**: Revisar consistencia de datos
2. **Identificar Redundancia**: Detectar duplicación excesiva
3. **Optimizar Base de Datos**: Decidir qué escalas mantener
4. **Reportes Ejecutivos**: Métricas de calidad del sistema

### 🔍 **Funcionalidades Adicionales**

#### **Expansión Múltiple**:
- ✅ Varios hitos pueden estar abiertos simultáneamente
- ✅ El sistema recuerda qué hitos están expandidos
- ✅ Click en otro hito no cierra el anterior

#### **Interactividad**:
- **Hover Effects**: Resaltado visual al pasar el mouse
- **Click Visual**: Feedback inmediato al hacer clic
- **Tooltips**: Información completa del hito al hacer hover
- **Responsive**: Funciona en dispositivos móviles

#### **Datos en Tiempo Real**:
- **Actualización Automática**: Cada 30 segundos
- **Datos Reales**: Conectado directamente a la base de datos
- **Cálculos Dinámicos**: Estadísticas actualizadas en vivo
- **Estado Consistente**: Expansión mantenida durante actualizaciones

### 🚀 **Beneficios de las Tablas Anidadas**

#### **Eficiencia Visual**:
- **Vista Compacta**: Lista principal no abrumadora
- **Exploración Selectiva**: Solo ver detalles cuando se necesiten
- **Contexto Preservado**: Mantener vista general mientras se explora
- **Navegación Intuitiva**: Patrón familiar de expandir/colapsar

#### **Análisis Profundo**:
- **Comparación Directa**: Ver todas las fuentes de un hito juntas
- **Detección de Outliers**: Identificar valores atípicos fácilmente
- **Análisis Estadístico**: Comparar desviaciones y percentiles
- **Validación Cruzada**: Verificar consistencia entre fuentes

### 📊 **Métricas del Sistema**

Con **320 hitos normativos** en la base de datos:
- **Hitos únicos**: ~80 (aproximadamente 25% únicos)
- **Tasa de duplicación**: ~75% (múltiples fuentes por hito)
- **Fuentes promedio**: ~4 por hito duplicado
- **Dominios cubiertos**: 7 áreas del desarrollo

### ✨ **Estado Actual del Deployment**

#### **✅ Completamente Funcional**:
- **Frontend**: Actualizado con nueva estructura
- **Backend**: API endpoints funcionando correctamente  
- **Base de Datos**: 320 escalas normativas pobladas
- **Docker**: Contenedores actualizados y operativos
- **Tablas Anidadas**: Implementadas y desplegadas

#### **🌐 Acceso al Sistema**:
- **URL**: http://localhost:5173 o https://dev.neuropedialab.org
- **Login Admin**: admin@neuropedialab.org / admin123
- **Biblioteca de Datos**: Visible solo para administradores
- **Subtab Target**: "🔄 Hitos Duplicados" → Click en cualquier hito

¡Las **tablas anidadas** están **completamente implementadas y funcionando** en el sistema! Los usuarios pueden ahora explorar los datos estadísticos detallados de cada hito duplicado haciendo click para expandir las tablas con información específica por fuente normativa.