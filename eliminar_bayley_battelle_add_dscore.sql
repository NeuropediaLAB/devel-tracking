-- Script para eliminar hitos de Bayley y Battelle, y añadir hitos de D-score
-- Ejecutar desde el contenedor backend

-- 1. Eliminar asociaciones de videos con hitos de Bayley y Battelle (fuentes 3 y 4)
DELETE FROM videos_hitos 
WHERE hito_id IN (
  SELECT id FROM hitos_normativos WHERE fuente_normativa_id IN (3, 4)
);

-- 2. Eliminar hitos conseguidos de Bayley y Battelle
DELETE FROM hitos_conseguidos 
WHERE hito_id IN (
  SELECT id FROM hitos_normativos WHERE fuente_normativa_id IN (3, 4)
);

-- 3. Eliminar hitos no alcanzados de Bayley y Battelle
DELETE FROM hitos_no_alcanzados 
WHERE hito_id IN (
  SELECT id FROM hitos_normativos WHERE fuente_normativa_id IN (3, 4)
);

-- 4. Eliminar los hitos normativos de Bayley y Battelle
DELETE FROM hitos_normativos WHERE fuente_normativa_id IN (3, 4);

-- 5. Desactivar las fuentes normativas de Bayley y Battelle
UPDATE fuentes_normativas SET activa = 0 WHERE id IN (3, 4);

-- 6. Crear nueva fuente normativa para D-score (si no existe)
INSERT OR IGNORE INTO fuentes_normativas (id, nombre, nombre_corto, descripcion, activa)
VALUES (
  10,
  'D-score - Development Score',
  'D-score',
  'Sistema de medición continua del desarrollo infantil basado en Teoría de Respuesta al Ítem',
  1
);

-- 7. Insertar hitos del D-score para screening (0-36 meses)
-- Motor Grueso
INSERT INTO hitos_normativos (nombre, descripcion, dominio_id, edad_media_meses, edad_minima_meses, edad_maxima_meses, desviacion_estandar, fuente_normativa_id)
VALUES 
  ('Sostiene la cabeza estando boca abajo', 'Control cefálico en posición prona', 1, 3, 0, 6, 1.5, 10),
  ('Se mantiene sentado con apoyo', 'Mantiene posición sedente con soporte', 1, 5, 3, 8, 1.5, 10),
  ('Se sienta sin apoyo', 'Sedestación independiente', 1, 7, 6, 10, 1.2, 10),
  ('Gatea', 'Desplazamiento en cuatro puntos de apoyo', 1, 9, 7, 12, 1.5, 10),
  ('Camina solo', 'Marcha independiente sin apoyo', 1, 13, 10, 18, 2.0, 10),
  ('Sube escaleras', 'Sube escaleras con apoyo o sin él', 1, 18, 15, 24, 2.5, 10),
  ('Corre bien', 'Carrera coordinada', 1, 24, 18, 30, 3.0, 10),
  ('Salta con ambos pies', 'Salto bilateral coordinado', 1, 28, 24, 36, 3.0, 10);

-- Motor Fino
INSERT INTO hitos_normativos (nombre, descripcion, dominio_id, edad_media_meses, edad_minima_meses, edad_maxima_meses, desviacion_estandar, fuente_normativa_id)
VALUES 
  ('Agarra objetos pequeños', 'Prensión palmar de objetos', 2, 6, 4, 10, 1.5, 10),
  ('Usa pinza para agarrar', 'Prensión en pinza índice-pulgar', 2, 10, 8, 12, 1.2, 10),
  ('Apila 2-3 bloques', 'Construcción de torre de 2-3 cubos', 2, 15, 12, 20, 2.0, 10),
  ('Garabatea', 'Hace garabatos con lápiz o crayón', 2, 18, 15, 24, 2.0, 10),
  ('Apila 6+ bloques', 'Construcción de torre de 6 o más cubos', 2, 24, 20, 30, 2.5, 10);

-- Lenguaje
INSERT INTO hitos_normativos (nombre, descripcion, dominio_id, edad_media_meses, edad_minima_meses, edad_maxima_meses, desviacion_estandar, fuente_normativa_id)
VALUES 
  ('Sonríe socialmente', 'Sonrisa social en respuesta a estímulos', 3, 2, 1, 4, 1.0, 10),
  ('Balbucea', 'Produce sílabas repetitivas (ba-ba, ma-ma)', 3, 6, 4, 8, 1.2, 10),
  ('Dice "mamá" o "papá" con significado', 'Primera palabra con significado', 3, 11, 8, 14, 2.0, 10),
  ('Dice al menos 3 palabras', 'Vocabulario de 3 o más palabras', 3, 15, 12, 18, 2.0, 10),
  ('Combina 2 palabras', 'Frases de 2 palabras', 3, 22, 18, 30, 3.0, 10),
  ('Usa frases de 3 palabras', 'Frases de 3 o más palabras', 3, 28, 24, 36, 3.0, 10);

-- Social-Emocional
INSERT INTO hitos_normativos (nombre, descripcion, dominio_id, edad_media_meses, edad_minima_meses, edad_maxima_meses, desviacion_estandar, fuente_normativa_id)
VALUES 
  ('Responde a su nombre', 'Gira la cabeza o atiende cuando lo llaman', 4, 9, 6, 12, 1.5, 10),
  ('Juega a las escondidas', 'Participa en juegos de peek-a-boo', 4, 10, 8, 14, 1.5, 10),
  ('Señala para pedir', 'Usa gesto de señalar para comunicar necesidades', 4, 14, 12, 18, 2.0, 10),
  ('Juego simbólico simple', 'Juego de hacer como si (ej: dar de comer a muñeco)', 4, 22, 18, 30, 3.0, 10),
  ('Juega con otros niños', 'Participa en juego cooperativo', 4, 30, 24, 42, 4.0, 10);

-- Verificar inserción
SELECT 'Hitos D-score insertados:' as resultado;
SELECT COUNT(*) as total FROM hitos_normativos WHERE fuente_normativa_id = 10;

SELECT 'Detalle de hitos por dominio:' as resultado;
SELECT 
  d.nombre as dominio,
  COUNT(h.id) as cantidad_hitos
FROM hitos_normativos h
JOIN dominios d ON h.dominio_id = d.id
WHERE h.fuente_normativa_id = 10
GROUP BY d.nombre;
