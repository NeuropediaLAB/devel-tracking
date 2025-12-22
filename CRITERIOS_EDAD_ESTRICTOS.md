# Criterios de Edad Más Estrictos - Algoritmo de Asociación de Videos

## Fecha
22 de diciembre de 2025 - 13:38 UTC

## Cambios Implementados

### 1. Filtro de Edad Más Estricto

#### Antes (Primera Versión)
```javascript
// Penalización progresiva
if (diferenciaEdad > 2) {
  penalizacionEdad = Math.min(0.5, (diferenciaEdad - 2) * 0.1);
}
// Permitía hasta ±2 meses sin penalización
// Después: penalización gradual hasta ±8 meses
```

#### Ahora (Segunda Versión - MÁS ESTRICTO)
```javascript
// Filtro absoluto
if (diferenciaEdad > 1) {
  descartadoPorEdad = true; // Score = 0, descartado
}
// Solo permite ±1 mes de diferencia
// Sin gradualidad: dentro o fuera
```

### 2. Umbral de Similitud Aumentado

| Parámetro | Antes | Ahora |
|-----------|-------|-------|
| Score mínimo | 0.3 | **0.5** |
| Máximo hitos/video | 5 | **3** |
| Margen edad | ±2 meses | **±1 mes** |

### 3. Comportamiento del Filtro

**Ejemplo con video de 4 meses:**

| Edad Hito | Diferencia | ¿Permitido? |
|-----------|------------|-------------|
| 3.0 meses | 1 mes | ✅ Sí |
| 4.0 meses | 0 meses | ✅ Sí |
| 5.0 meses | 1 mes | ✅ Sí |
| 2.0 meses | 2 meses | ❌ No |
| 6.0 meses | 2 meses | ❌ No |
| 7.0 meses | 3 meses | ❌ No |

## Justificación Médica

En neurodesarrollo infantil:
- Un mes de diferencia a edades tempranas es **significativo**
- Los hitos tienen ventanas de adquisición específicas
- Un video de 2 meses NO debe asociarse con hitos de 4 meses
- La precisión es crucial para detección temprana de retrasos

## Impacto en Asociaciones

### Ejemplo Real: Video "Sonríe cuando usted le habla" (2 meses)

**Antes (±2 meses)**:
```
✅ Sonrisa social (2.0m) - diff: 0
✅ Control cefálico (4.0m) - diff: 2  ← ASOCIACIÓN DUDOSA
✅ Responde al sonido (1.0m) - diff: 1
```

**Ahora (±1 mes)**:
```
✅ Sonrisa social (2.0m) - diff: 0
❌ Control cefálico (4.0m) - diff: 2  ← DESCARTADO
✅ Responde al sonido (1.0m) - diff: 1
```

## Nuevos Logs de Consola

```javascript
🔍 Analizando video: "Video CDC 1 - 2 meses - Sonríe cuando usted le habla"
📅 Edad detectada en video: 2 meses
🔤 Texto normalizado: "sonríe habla"
✅ Hitos coincidentes encontrados: 2

  → "Sonrisa social (2.0m)" (ID: 45)
     Score: 0.85 (similitud: 0.85)
     Edad: video 2m vs hito 2m (diff: 0m) ✅
     
  → "Responde sonido (1.0m)" (ID: 27)
     Score: 0.67 (similitud: 0.67)
     Edad: video 2m vs hito 1m (diff: 1m) ✅
```

## Build Actualizado

- **Archivo anterior**: `index-CabEg3cW.js`
- **Archivo nuevo**: `index-BR6EM1v2.js` ✅
- **Estado**: Desplegado en Docker

## Ventajas del Nuevo Criterio

1. ✅ **Precisión aumentada**: Solo asociaciones altamente relevantes
2. ✅ **Menos ruido**: Máximo 3 hitos en vez de 5
3. ✅ **Edad específica**: ±1 mes es clínicamente apropiado
4. ✅ **Score alto**: 0.5 mínimo garantiza similitud real
5. ✅ **Videos múltiples**: Un hito puede tener varios videos si son relevantes
6. ✅ **Hitos múltiples**: Un video puede tener hasta 3 hitos si son similares

## Casos de Uso Permitidos

### ✅ Múltiples Videos por Hito
```
Hito: "Sonrisa social (2.0m)"
Videos asociados:
  - "Video CDC 1 - 2 meses - Sonríe cuando le habla"
  - "Video Pathways - 2 meses - Sonrisa espontánea"
  - "Video OMS - 2 meses - Respuesta social"
```

### ✅ Múltiples Hitos por Video
```
Video: "CDC 6 meses - Se voltea y se sienta"
Hitos asociados:
  - "Se voltea boca arriba a boca abajo (6.0m)"
  - "Sedestación con apoyo (6.0m)"
  - "Control de tronco (5.0m)" ← diff: 1m, permitido
```

## Resumen de Cambios

| Característica | V1 | V2 (Actual) |
|---------------|-----|-------------|
| Margen edad | ±2 meses gradual | **±1 mes absoluto** |
| Score mínimo | 0.3 | **0.5** |
| Max hitos/video | 5 | **3** |
| Filtro | Penalización | **Descarte total** |
| Precisión | Alta | **Muy alta** |

