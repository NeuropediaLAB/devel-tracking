# Eliminación de Escalas Bayley y Battelle + Integración D-score

**Fecha:** 22 de diciembre de 2024

## Cambios Realizados

### 1. Eliminación de Escalas Bayley y Battelle

#### **Hitos eliminados:**
- **Total:** 160 hitos normativos
- **Bayley Scales of Infant Development (Fuente ID: 3)**
  - Referencia: Bayley, N. (2006). Bayley Scales of Infant and Toddler Development (3rd ed.)
  - 80 hitos eliminados
- **Battelle Developmental Inventory (Fuente ID: 4)**
  - Referencia: Newborg, J. (2005). Battelle Developmental Inventory (2nd ed.)
  - 80 hitos eliminados

#### **Datos relacionados eliminados:**
- ✅ Asociaciones de videos con hitos de Bayley/Battelle
- ✅ Hitos conseguidos por niños de estas escalas
- ✅ Hitos no alcanzados de estas escalas
- ✅ Fuentes normativas desactivadas (activa = 0)

### 2. Integración de D-score

#### **Nueva fuente normativa creada:**
- **ID:** 10
- **Nombre:** D-score - Development Score
- **Referencia:** D-score Global Child Development Database. childdevdata. https://d-score.org/childdevdata/ - Weber, A. M., et al. (2019). The D-score: a metric for interpreting the early development of infants and toddlers across global settings. BMJ Global Health, 4(6), e001724.
- **Año:** 2019
- **Población:** Cohortes globales de 15 países (GCDG - Global Child Development Group)
- **Descripción:** Sistema de medición continua del desarrollo infantil basado en Teoría de Respuesta al Ítem (IRT). Base de datos global que integra información de múltiples escalas de desarrollo de 15 países. Permite comparaciones transculturales y monitoreo longitudinal del desarrollo. Datos normativos disponibles en https://d-score.org/childdevdata/

#### **Hitos D-score añadidos:** 24 hitos totales

##### **Motor Grueso (8 hitos):**
1. Sostiene la cabeza estando boca abajo (3 meses)
2. Se mantiene sentado con apoyo (5 meses)
3. Se sienta sin apoyo (7 meses)
4. Gatea (9 meses)
5. Camina solo (13 meses)
6. Sube escaleras (18 meses)
7. Corre bien (24 meses)
8. Salta con ambos pies (28 meses)

##### **Motor Fino (5 hitos):**
1. Agarra objetos pequeños (6 meses)
2. Usa pinza para agarrar (10 meses)
3. Apila 2-3 bloques (15 meses)
4. Garabatea (18 meses)
5. Apila 6+ bloques (24 meses)

##### **Lenguaje Expresivo (6 hitos):**
1. Sonríe socialmente (2 meses)
2. Balbucea (6 meses)
3. Dice "mamá" o "papá" con significado (11 meses)
4. Dice al menos 3 palabras (15 meses)
5. Combina 2 palabras (22 meses)
6. Usa frases de 3 palabras (28 meses)

##### **Social-Emocional (5 hitos):**
1. Responde a su nombre (9 meses)
2. Juega a las escondidas (10 meses)
3. Señala para pedir (14 meses)
4. Juego simbólico simple (22 meses)
5. Juega con otros niños (30 meses)

### 3. Mejoras en Auto-asociación de Videos

#### **Nuevo endpoint backend:**
- **Ruta:** `/api/videos/asociar-multiple`
- **Método:** POST
- **Descripción:** Permite asociar un video con múltiples hitos en una sola llamada
- **Respuesta incluye:**
  - `asociacionesCreadas`: Nuevas asociaciones
  - `asociacionesYaExistentes`: Asociaciones que ya existían
  - `errores`: Número de errores
  - `total`: Hitos procesados

#### **Diccionario de palabras clave expandido:**
- **De 22 a 60+ términos**
- Incluye variaciones, sinónimos y términos técnicos
- Búsqueda mejorada en **título y descripción** del video
- Detección automática de edad mencionada en el video

#### **Palabras clave añadidas para D-score:**
```javascript
'control': ['control cefálico', 'control de cabeza', 'sostiene la cabeza'],
'cabeza': ['control cefálico', 'sostiene la cabeza', 'levanta la cabeza'],
'cefalico': ['control cefálico', 'sostiene la cabeza'],
'sienta': ['se sienta sin apoyo', 'sedestación', 'sentado'],
'sentado': ['se sienta sin apoyo', 'sedestación', 'se mantiene sentado'],
'gatea': ['gatea', 'gateo'],
'camina': ['camina solo', 'marcha independiente', 'camina sin apoyo'],
'balbucea': ['balbucea', 'balbuceo'],
'pinza': ['usa pinza', 'pinza', 'prensión en pinza'],
'apila': ['apila bloques', 'torre de cubos'],
'bloques': ['apila bloques', 'torre de cubos'],
'escaleras': ['sube escaleras', 'baja escaleras'],
'salta': ['salta', 'salto', 'brinca'],
'responde': ['responde', 'responde a su nombre'],
'escondidas': ['juega a las escondidas', 'escondidas'],
'peek': ['juega a las escondidas'],
'simbolico': ['juego simbólico'],
'garabatea': ['garabatea', 'garabato']
```

## Estado Actual de la Base de Datos

### Fuentes normativas activas:
1. **CDC** - Centros para el Control y Prevención de Enfermedades (2022) - ✅ Activa
2. **OMS** - Organización Mundial de la Salud (2006) - ✅ Activa
3. **Bayley Scales** (2006) - ❌ Desactivada
4. **Battelle Developmental Inventory** (2005) - ❌ Desactivada
10. **D-score** (2019) - ✅ Activa

### Resumen de hitos:
- **Hitos totales:** 184
  - CDC: 80 hitos
  - OMS: 80 hitos
  - D-score: 24 hitos

## Impacto en la Aplicación

### ✅ **Componentes actualizados:**
1. **BibliotecaMedios.jsx**
   - Función `asociarAutomaticamentePorNombre()` mejorada
   - Endpoint actualizado a `/api/videos/asociar-multiple`
   - Diccionario de palabras clave expandido
   - Búsqueda en título y descripción

2. **ScreeningEnfermeria.jsx**
   - Ya carga y asocia videos automáticamente
   - Compatible con hitos D-score
   - Usa palabras clave similares para asociación

### ✅ **Funcionalidades preservadas:**
- ✅ Auto-asociación de videos funcional
- ✅ Videos se muestran en Screening de Neurodesarrollo
- ✅ Videos se muestran en Hitos del Desarrollo
- ✅ Filtros por fuente normativa funcionando
- ✅ Selección de fuentes normativas en frontend

### ⚠️ **Consideraciones:**
- Los videos existentes asociados a Bayley/Battelle se han desvinculado
- Será necesario ejecutar **"🤖 Auto-asociar Todo"** para vincular videos a los nuevos hitos D-score
- Los datos de evaluación de usuarios con escalas Bayley/Battelle se han eliminado (si existían)

## Instrucciones de Uso

### Para asociar videos a los nuevos hitos D-score:
1. Iniciar sesión como **admin**
2. Ir a **Biblioteca de Medios**
3. Hacer clic en **"🤖 Auto-asociar Todo"**
4. El sistema buscará coincidencias entre:
   - Títulos/descripciones de videos
   - Hitos D-score recién añadidos
5. Verificar el resultado en consola y mensaje de éxito

### Para usar los hitos D-score:
1. En **Registro de Hitos del Desarrollo**
   - Seleccionar fuente normativa: **"D-score"**
   - Los hitos D-score aparecerán disponibles
2. En **Screening de Neurodesarrollo**
   - Los ítems del screening ya usan lógica compatible con D-score
   - Videos se asocian automáticamente

## Scripts SQL Ejecutados

Archivo: `eliminar_bayley_battelle_add_dscore.sql`

```sql
-- 1. Eliminar asociaciones de videos
DELETE FROM videos_hitos WHERE hito_id IN (
  SELECT id FROM hitos_normativos WHERE fuente_normativa_id IN (3, 4)
);

-- 2. Eliminar hitos conseguidos
DELETE FROM hitos_conseguidos WHERE hito_id IN (
  SELECT id FROM hitos_normativos WHERE fuente_normativa_id IN (3, 4)
);

-- 3. Eliminar hitos no alcanzados
DELETE FROM hitos_no_alcanzados WHERE hito_id IN (
  SELECT id FROM hitos_normativos WHERE fuente_normativa_id IN (3, 4)
);

-- 4. Eliminar hitos normativos
DELETE FROM hitos_normativos WHERE fuente_normativa_id IN (3, 4);

-- 5. Desactivar fuentes
UPDATE fuentes_normativas SET activa = 0 WHERE id IN (3, 4);

-- 6. Crear fuente D-score e insertar 24 hitos...
```

## Verificación

```bash
# Verificar hitos D-score
docker exec neurodesarrollo-backend sqlite3 /app/server/neurodesarrollo_dev_new.db "
  SELECT COUNT(*) FROM hitos_normativos WHERE fuente_normativa_id = 10;
"
# Resultado: 24

# Verificar distribución por dominio
docker exec neurodesarrollo-backend sqlite3 /app/server/neurodesarrollo_dev_new.db "
  SELECT d.nombre, COUNT(h.id) 
  FROM hitos_normativos h
  JOIN dominios d ON h.dominio_id = d.id
  WHERE h.fuente_normativa_id = 10
  GROUP BY d.nombre;
"
```

## Referencias

- Weber, A. M., et al. (2019). The D-score: a metric for interpreting the early development of infants and toddlers across global settings. BMJ Global Health, 4(6), e001724.
- D-score website: https://d-score.org/
- **D-score Global Child Development Database (childdevdata):** https://d-score.org/childdevdata/
- GCDG (Global Child Development Group): https://gcdg.cgdev.org/
- Paquete R dscore: https://github.com/D-score/dscore

### Sobre childdevdata

El proyecto **childdevdata** es una base de datos global abierta que contiene:
- Datos de desarrollo infantil de múltiples cohortes internacionales
- Más de 15 países representados
- Integración de múltiples instrumentos de evaluación del desarrollo
- Datos normalizados usando la métrica D-score
- Acceso abierto para investigación y aplicaciones clínicas
- Actualización continua con nuevos estudios

Los hitos implementados en este sistema están basados en los ítems clave identificados en la base de datos childdevdata, representando los hitos más consistentes y culturalmente invariantes del desarrollo infantil temprano (0-36 meses).

---

**Actualización completada:** ✅ 22 de diciembre de 2024, 11:50 UTC
