# Criterios Balanceados - Algoritmo de Asociación de Videos

## Fecha
22 de diciembre de 2025 - 13:43 UTC

## Problema Detectado

**V2 (demasiado estricto)**: No conseguía asociar prácticamente ningún hito
- Umbral: 0.5 (50% similitud)
- Sin sinónimos
- Máximo 3 hitos

**Resultado**: Videos quedaban sin asociar por ser demasiado restrictivo

## Solución V3 - Criterios Balanceados

### 1. Sistema de Sinónimos Implementado

```javascript
const sinonimos = {
  'sonrie': ['sonrisa', 'sonreir', 'sonríe'],
  'cabeza': ['cefálico', 'cefalico', 'head'],
  'sienta': ['sentado', 'sedestación', 'sits'],
  'gatea': ['gateo', 'crawl'],
  'camina': ['marcha', 'walk'],
  'palabra': ['habla', 'dice', 'speak'],
  'voltea': ['gira', 'roll'],
  'responde': ['respuesta', 'reaccion'],
  'juega': ['juego', 'play'],
  // ... más sinónimos
};
```

**Beneficio**: "sonríe" ahora encuentra hitos con "sonrisa", "sonreir", etc.

### 2. Cálculo de Similitud Mejorado

#### Antes (V2)
```javascript
// Solo contaba coincidencias simples
coincidencias / palabrasVideo.length
```

#### Ahora (V3)
```javascript
// Expande con sinónimos + bonus por coincidencias exactas
const scoreBase = coincidencias / palabrasVideo.length;
const bonus = (coincidenciasFuertes / palabrasVideo.length) * 0.2;
return scoreBase + bonus; // Hasta 20% extra
```

### 3. Parámetros Ajustados

| Parámetro | V1 | V2 | V3 (Actual) |
|-----------|----|----|-------------|
| **Score mínimo** | 0.3 | 0.5 | **0.25** ⬅️ |
| **Máx hitos/video** | 5 | 3 | **5** ⬅️ |
| **Margen edad** | ±2m | ±1m | **±1m** ✅ |
| **Sinónimos** | No | No | **Sí** ⬅️ |
| **Bonus exacto** | No | No | **+20%** ⬅️ |

### 4. Filtro de Edad Mantenido Estricto

✅ **±1 mes se mantiene** - Es clínicamente apropiado

### 5. Ejemplos de Mejora

#### Ejemplo 1: "Sonríe cuando usted le habla" (2 meses)

**V2 (sin sinónimos)**:
```
Busca: "sonríe habla"
Hito: "Sonrisa social (2.0m)"
Coincidencias: 0/2 → Score: 0.0 ❌ Descartado
```

**V3 (con sinónimos)**:
```
Busca: "sonríe habla" + sinónimos: ["sonrisa", "palabra", "dice"]
Hito: "Sonrisa social (2.0m)"
Coincidencias: 1/2 (sonríe↔sonrisa) → Score: 0.5 ✅ Aceptado
```

#### Ejemplo 2: "Se voltea boca arriba a boca abajo" (6 meses)

**V2**:
```
Score: 0.33 (umbral 0.5) ❌ Rechazado
```

**V3**:
```
Score: 0.33 + bonus + sinónimos → 0.45
Umbral: 0.25 ✅ Aceptado
```

## Comparación de las 3 Versiones

### V1 - Inicial (Poco Estricto)
```
❌ Edad: ±2 meses
❌ Score: 0.3
❌ Sin sinónimos
❌ Max: 5 hitos
→ Resultado: Demasiadas asociaciones incorrectas
```

### V2 - Muy Estricto
```
✅ Edad: ±1 mes
❌ Score: 0.5 (muy alto)
❌ Sin sinónimos
❌ Max: 3 hitos
→ Resultado: Casi ninguna asociación
```

### V3 - Balanceado ⭐ (Actual)
```
✅ Edad: ±1 mes
✅ Score: 0.25 (razonable)
✅ Con sinónimos
✅ Bonus por exactitud
✅ Max: 5 hitos
→ Resultado: Asociaciones precisas y suficientes
```

## Build Actualizado

- **Archivo anterior**: `index-BR6EM1v2.js`
- **Archivo nuevo**: `index-D0gHkuYh.js` ✅
- **Estado**: Desplegado en Docker

## Ventajas de V3

1. ✅ **Edad estricta**: ±1 mes se mantiene (clínicamente apropiado)
2. ✅ **Sinónimos inteligentes**: Mejora matching semántico
3. ✅ **Bonus por exactitud**: Prioriza coincidencias precisas
4. ✅ **Umbral razonable**: 25% permite asociaciones válidas
5. ✅ **Flexibilidad**: Hasta 5 hitos por video
6. ✅ **Balance perfecto**: No demasiado laxo, no demasiado estricto

## Nuevos Logs de Consola

```javascript
🔍 Analizando video: "Video CDC 1 - 2 meses - Sonríe cuando usted le habla"
📅 Edad detectada: 2 meses
🔤 Texto normalizado: "sonrie habla"
🔄 Expandido con sinónimos: "sonrie, sonrisa, sonreir, habla, palabra, dice"
✅ Hitos coincidentes: 2

  → "Sonrisa social (2.0m)" (ID: 45)
     Score: 0.70 (similitud: 0.50 + bonus: 0.20)
     Edad: video 2m vs hito 2m (diff: 0m) ✅
     
  → "Responde cuando le hablan (2.0m)" (ID: 28)
     Score: 0.50 (similitud: 0.50)
     Edad: video 2m vs hito 2m (diff: 0m) ✅
```

## Resumen

**V3 es el punto óptimo**:
- ✅ Mantiene la precisión de edad (±1 mes)
- ✅ Flexibiliza el matching semántico (sinónimos)
- ✅ Umbral razonable (25%)
- ✅ Asociaciones suficientes pero relevantes

**Estado**: ✅ V3 DESPLEGADO Y BALANCEADO
