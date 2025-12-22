-- Optimización de base de datos para mejorar el rendimiento de las gráficas
-- Crear índices para las consultas más frecuentes

-- Índices para hitos_conseguidos
CREATE INDEX IF NOT EXISTS idx_hitos_conseguidos_nino_id ON hitos_conseguidos(nino_id);
CREATE INDEX IF NOT EXISTS idx_hitos_conseguidos_hito_id ON hitos_conseguidos(hito_id);
CREATE INDEX IF NOT EXISTS idx_hitos_conseguidos_edad ON hitos_conseguidos(edad_conseguido_meses);

-- Índices para hitos_normativos 
CREATE INDEX IF NOT EXISTS idx_hitos_normativos_nombre ON hitos_normativos(nombre);
CREATE INDEX IF NOT EXISTS idx_hitos_normativos_dominio ON hitos_normativos(dominio_id);
CREATE INDEX IF NOT EXISTS idx_hitos_normativos_fuente ON hitos_normativos(fuente_normativa_id);
CREATE INDEX IF NOT EXISTS idx_hitos_normativos_nombre_dominio_fuente ON hitos_normativos(nombre, dominio_id, fuente_normativa_id);

-- Índices para dominios
CREATE INDEX IF NOT EXISTS idx_dominios_id ON dominios(id);

-- Índice compuesto para la consulta compleja del análisis
CREATE INDEX IF NOT EXISTS idx_hitos_complex ON hitos_normativos(fuente_normativa_id, nombre, dominio_id);

-- Verificar los índices creados
SELECT name FROM sqlite_master WHERE type='index' AND tbl_name IN ('hitos_conseguidos', 'hitos_normativos', 'dominios');