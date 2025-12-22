# Mejora del Algoritmo de Asociación Automática de Videos

## Fecha
22 de diciembre de 2025

## Problema Identificado

El algoritmo anterior de auto-asociación de videos con hitos tenía los siguientes problemas:

1. **Búsqueda por palabras clave aisladas**: Solo buscaba palabras individuales sin entender el contexto
2. **Coincidencias demasiado amplias**: 
   - "habla" encontraba TODO hito con "palabra", "dice" o "habla"
   - "dice" encontraba "índice" en "Pinza superior (pulgar-índice)"
   - Un video de 2 meses sobre "sonrisa" encontraba 16 hitos de diferentes edades
3. **Sin análisis semántico**: No evaluaba la similitud entre la frase completa del video y la descripción del hito
4. **Margen de edad demasiado amplio**: ±6 meses permitía asociaciones incorrectas

## Solución Implementada

### Nuevo Algoritmo Semántico

El algoritmo ahora:

1. **Normaliza el texto**: Elimina artículos, preposiciones y puntuación irrelevante
2. **Analiza toda la frase**: Compara el contexto completo del título del video con cada hito
3. **Calcula similitud semántica**: 
   - Cuenta palabras significativas coincidentes
   - Calcula ratio de coincidencias
4. **Penaliza por diferencia de edad**:
   - Sin penalización si diferencia ≤ 2 meses
   - Penalización progresiva después de 2 meses
5. **Establece umbral de calidad**: Solo asocia hitos con score ≥ 0.3
6. **Limita resultados**: Máximo 5 hitos más relevantes por video

### Ejemplo de Funcionamiento

**Video**: "Sonríe cuando usted le habla" (2 meses)

**Antes**: 16 asociaciones incorrectas incluyendo:
- "Primera palabra con significado (12.0m)"
- "Vocabulario de 200+ palabras (36.0m)"
- "Pinza superior (pulgar-índice)" ← por "dice"

**Después**: Solo hitos realmente relacionados con:
- Sonrisa social
- Respuesta a estímulos vocales
- En edad apropiada (0-4 meses)

## Archivos Modificados

- `src/components/BibliotecaMedios.jsx`: Función `asociarAutomaticamentePorNombre()`

## Beneficios

✅ Asociaciones más precisas y contextuales
✅ Menos falsos positivos
✅ Mejor filtrado por edad
✅ Comprensión semántica de frases completas
✅ Máximo 5 asociaciones por video (las más relevantes)
