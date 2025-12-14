const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Leer los hitos extraídos de WHO GSED
const whoGsedData = JSON.parse(fs.readFileSync(path.join(__dirname, 'hitos_who_gsed_extracted.json'), 'utf8'));

const dbPath = path.join(__dirname, '..', 'server', 'neurodesarrollo_dev_new.db');

console.log('🌍 Iniciando adición de hitos WHO GSED...');
console.log('Ruta de la base de datos:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error conectando a la base de datos:', err.message);
    return;
  }
  console.log('Conectado a la base de datos SQLite.');
});

// Mapeo de dominios WHO GSED a IDs de la base de datos
const dominioMapping = {
  'Motor Grueso': 1,
  'Motor Fino': 2,
  'Comunicación': 3,  // Mapear a Lenguaje Receptivo/Expresivo
  'Cognitivo': 6,
  'Personal-Social': 5  // Social-Emocional
};

async function addWhoGsedMilestones() {
  try {
    console.log('1. Agregando fuente normativa WHO GSED...');
    
    // Agregar fuente normativa WHO GSED
    await new Promise((resolve, reject) => {
      const insertFuenteQuery = `
        INSERT OR IGNORE INTO fuentes_normativas (
          nombre, referencia_bibliografica, descripcion, año, 
          poblacion, activa
        ) VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      const descripcion = `WHO Global Scale for Early Development (GSED) v1.0-2023.1. La primera escala global de la OMS para medir el desarrollo infantil temprano (0-36 meses). Validada en 7 países: ${Object.keys(whoGsedData.normas_por_pais).join(', ')}. Incluye 32 items críticos del Short Form seleccionados por su alta predictividad y relevancia cross-cultural.`;
      
      db.run(insertFuenteQuery, [
        'WHO GSED v1.0-2023.1',
        'WHO. (2023). Global Scale for Early Development Package v1.0-2023.1. McCoy, D. C., et al. (2023). Early childhood development assessment at scale: Validation of the caregiver-reported early development instruments (CREDI) in multiple countries. Developmental Science.',
        descripcion,
        2023,
        `4,061 niños (0-42 meses) de 7 países: ${Object.keys(whoGsedData.normas_por_pais).join(', ')}`,
        1
      ], (err) => {
        if (err) {
          console.error('Error agregando fuente WHO GSED:', err.message);
          reject(err);
        } else {
          console.log('✅ Fuente WHO GSED agregada exitosamente');
          resolve();
        }
      });
    });

    // Obtener ID de la fuente recién creada
    let fuenteId = null;
    await new Promise((resolve, reject) => {
      db.get('SELECT id FROM fuentes_normativas WHERE nombre = ?', ['WHO GSED v1.0-2023.1'], (err, row) => {
        if (err) {
          reject(err);
        } else {
          fuenteId = row ? row.id : null;
          console.log(`ID de fuente WHO GSED: ${fuenteId}`);
          resolve();
        }
      });
    });

    if (!fuenteId) {
      throw new Error('No se pudo obtener el ID de la fuente WHO GSED');
    }

    console.log('2. Procesando e insertando hitos WHO GSED...');
    
    let insertados = 0;
    let errores = 0;
    
    // Procesar cada hito
    for (const hito of whoGsedData.hitos) {
      await new Promise((resolve, reject) => {
        const dominioId = dominioMapping[hito.area];
        
        if (!dominioId) {
          console.warn(`Dominio no mapeado: ${hito.area}`);
          resolve();
          return;
        }

        const insertQuery = `
          INSERT OR IGNORE INTO hitos_normativos (
            dominio_id, nombre, descripcion, edad_media_meses, 
            desviacion_estandar, fuente_normativa_id,
            video_url_cdc, video_url_pathways
          ) VALUES (?, ?, ?, ?, ?, ?, NULL, NULL)
        `;
        
        // Nombre único con código WHO GSED
        const nombreUnico = `${hito.descripcion} [${hito.code}]`;
        const descripcionCompleta = `${hito.descripcion} [${hito.code}]. ${hito.notas}`;
        
        db.run(insertQuery, [
          dominioId,
          nombreUnico,
          descripcionCompleta,
          hito.edad_esperada,
          2.5, // desviación estándar promedio para WHO GSED
          fuenteId
        ], (err) => {
          if (err) {
            console.error(`Error insertando hito ${hito.code}:`, err.message);
            errores++;
          } else {
            insertados++;
          }
          resolve();
        });
      });
    }

    console.log('3. Generando resumen de inserción...');
    
    // Verificar hitos insertados por dominio
    await new Promise((resolve, reject) => {
      const countQuery = `
        SELECT d.nombre as dominio_nombre, COUNT(*) as total
        FROM hitos_normativos h
        JOIN dominios d ON h.dominio_id = d.id
        WHERE h.fuente_normativa_id = ?
        GROUP BY h.dominio_id, d.nombre
        ORDER BY d.nombre
      `;
      
      db.all(countQuery, [fuenteId], (err, rows) => {
        if (err) {
          console.error('Error obteniendo resumen por dominio:', err.message);
          reject(err);
        } else {
          console.log('\n=== HITOS WHO GSED POR DOMINIO ===');
          let totalWhoGsed = 0;
          rows.forEach(row => {
            console.log(`${row.dominio_nombre}: ${row.total} hitos`);
            totalWhoGsed += row.total;
          });
          console.log(`Total WHO GSED: ${totalWhoGsed} hitos`);
          resolve();
        }
      });
    });

    // Resumen general actualizado
    await new Promise((resolve, reject) => {
      const countAllQuery = `
        SELECT f.nombre as fuente_normativa, COUNT(*) as total
        FROM hitos_normativos h
        JOIN fuentes_normativas f ON h.fuente_normativa_id = f.id
        GROUP BY h.fuente_normativa_id, f.nombre
        ORDER BY f.nombre
      `;
      
      db.all(countAllQuery, (err, rows) => {
        if (err) {
          console.error('Error obteniendo resumen general:', err.message);
          reject(err);
        } else {
          console.log('\n=== RESUMEN GENERAL ACTUALIZADO ===');
          let totalGeneral = 0;
          rows.forEach(row => {
            let status = '(DATOS REALES)';
            if (row.fuente_normativa.includes('Battelle') || row.fuente_normativa.includes('Bayley')) {
              status = '(EN CUARENTENA)';
            }
            console.log(`${row.fuente_normativa}: ${row.total} hitos ${status}`);
            totalGeneral += row.total;
          });
          console.log(`\n🎯 TOTAL GENERAL: ${totalGeneral} hitos`);
          resolve();
        }
      });
    });

    console.log(`\n✅ Proceso WHO GSED completado exitosamente`);
    console.log(`📊 Estadísticas:`);
    console.log(`  - Hitos WHO GSED procesados: ${whoGsedData.hitos.length}`);
    console.log(`  - Hitos insertados: ${insertados}`);
    console.log(`  - Errores: ${errores}`);
    console.log(`  - Países de validación: ${Object.keys(whoGsedData.normas_por_pais).length}`);
    console.log(`  - Población total: ${Object.values(whoGsedData.normas_por_pais).reduce((sum, pais) => sum + pais.n, 0)} niños`);

    // Información sobre la nueva fuente
    console.log('\n📋 INFORMACIÓN DE LA NUEVA FUENTE:');
    console.log('='.repeat(50));
    console.log(`Nombre: ${whoGsedData.metadata.nombre}`);
    console.log(`Versión: ${whoGsedData.metadata.version}`);
    console.log(`Población: ${whoGsedData.metadata.poblacion}`);
    console.log(`Muestra: ${whoGsedData.metadata.muestra_total}`);
    console.log(`Dominios: ${whoGsedData.metadata.dominios}`);
    console.log(`Validación: ${whoGsedData.metadata.validacion}`);

    console.log('\n🌍 DATOS NORMATIVOS POR PAÍS:');
    Object.entries(whoGsedData.normas_por_pais).forEach(([pais, datos]) => {
      console.log(`  • ${pais}: n=${datos.n}, media=${datos.media_total}, SD=${datos.sd}`);
    });

  } catch (error) {
    console.error('❌ Error durante el proceso WHO GSED:', error);
  } finally {
    db.close((err) => {
      if (err) {
        console.error('Error cerrando la base de datos:', err.message);
      } else {
        console.log('\n🔒 Conexión a base de datos cerrada.');
        console.log('🎯 Los hitos WHO GSED están listos para usar en el sistema.');
      }
    });
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  addWhoGsedMilestones();
}

module.exports = { addWhoGsedMilestones };