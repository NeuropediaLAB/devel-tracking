const fs = require('fs');
const path = require('path');

// Leer los archivos JSON con los hitos reales
const hitosRealesCDC = JSON.parse(fs.readFileSync(path.join(__dirname, 'hitos_reales_cdc.json'), 'utf8'));
const hitosRealesOMS = JSON.parse(fs.readFileSync(path.join(__dirname, 'hitos_reales_oms.json'), 'utf8'));

// Configurar conexión a base de datos (usaremos SQLite por simplicidad)
const sqlite3 = require('sqlite3').verbose();
const dbPath = path.join(__dirname, '..', 'server', 'neurodesarrollo_dev_new.db');

console.log('Iniciando actualización de hitos reales...');
console.log('Ruta de la base de datos:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error conectando a la base de datos:', err.message);
    return;
  }
  console.log('Conectado a la base de datos SQLite.');
});

// Mapeo de áreas a dominios
const areaTodominio = {
  'Motor Grueso': 1,
  'Motor Fino': 2, 
  'Lenguaje Receptivo': 3,
  'Lenguaje Expresivo': 4,
  'Social-Emocional': 5,
  'Cognitivo': 6,
  'Adaptativo': 7
};

// Mapeo de fuentes normativas
const fuenteToId = {
  'CDC - Centros para el Control y Prevención de Enfermedades': 1,
  'OMS - Organización Mundial de la Salud': 2,
  'Bayley Scales of Infant Development': 3,
  'Battelle Developmental Inventory': 4
};

async function updateDatabase() {
  try {
    // 1. Primero, marcar hitos de Battelle y Bayley como "en cuarentena"
    console.log('1. Marcando hitos Battelle y Bayley en cuarentena...');
    
    await new Promise((resolve, reject) => {
      const updateQuery = `
        UPDATE hitos_normativos 
        SET nombre = '[CUARENTENA] ' || nombre,
            descripcion = COALESCE(descripcion, '') || ' - PENDIENTE DATOS REALES'
        WHERE fuente_normativa_id IN (3, 4)
      `;
      
      db.run(updateQuery, (err) => {
        if (err) {
          console.error('Error marcando en cuarentena:', err.message);
          reject(err);
        } else {
          console.log('Hitos Battelle y Bayley marcados en cuarentena');
          resolve();
        }
      });
    });

    // 2. Eliminar hitos falsos de CDC
    console.log('2. Eliminando hitos falsos de CDC...');
    await new Promise((resolve, reject) => {
      const deleteQuery = `
        DELETE FROM hitos_normativos 
        WHERE fuente_normativa_id = 1
      `;
      
      db.run(deleteQuery, (err) => {
        if (err) {
          console.error('Error eliminando hitos CDC falsos:', err.message);
          reject(err);
        } else {
          console.log('Hitos CDC falsos eliminados');
          resolve();
        }
      });
    });

    // 3. Insertar hitos reales de CDC
    console.log('3. Insertando hitos reales de CDC...');
    for (const [index, hito] of hitosRealesCDC.entries()) {
      const dominioId = areaTodominio[hito.area];
      if (!dominioId) {
        console.warn(`Área desconocida para hito CDC ${index + 1}: ${hito.area}`);
        continue;
      }

      await new Promise((resolve, reject) => {
        const insertQuery = `
          INSERT INTO hitos_normativos (
            dominio_id, nombre, descripcion, edad_media_meses, 
            desviacion_estandar, fuente_normativa_id,
            video_url_cdc, video_url_pathways
          ) VALUES (?, ?, ?, ?, ?, ?, NULL, NULL)
        `;
        
        db.run(insertQuery, [
          dominioId,
          hito.descripcion, // nombre
          hito.descripcion, // descripción
          hito.edad,
          0.5, // desviación estándar por defecto
          1 // CDC
        ], (err) => {
          if (err) {
            console.error(`Error insertando hito CDC ${index + 1}:`, err.message);
            reject(err);
          } else {
            resolve();
          }
        });
      });
    }
    console.log(`Insertados ${hitosRealesCDC.length} hitos reales de CDC`);

    // 4. Eliminar hitos falsos de OMS
    console.log('4. Eliminando hitos falsos de OMS...');
    await new Promise((resolve, reject) => {
      const deleteQuery = `
        DELETE FROM hitos_normativos 
        WHERE fuente_normativa_id = 2
      `;
      
      db.run(deleteQuery, (err) => {
        if (err) {
          console.error('Error eliminando hitos OMS falsos:', err.message);
          reject(err);
        } else {
          console.log('Hitos OMS falsos eliminados');
          resolve();
        }
      });
    });

    // 5. Insertar hitos reales de OMS
    console.log('5. Insertando hitos reales de OMS...');
    for (const [index, hito] of hitosRealesOMS.entries()) {
      const dominioId = areaTodominio[hito.area];
      if (!dominioId) {
        console.warn(`Área desconocida para hito OMS ${index + 1}: ${hito.area}`);
        continue;
      }

      await new Promise((resolve, reject) => {
        const insertQuery = `
          INSERT INTO hitos_normativos (
            dominio_id, nombre, descripcion, edad_media_meses,
            desviacion_estandar, fuente_normativa_id,
            video_url_cdc, video_url_pathways
          ) VALUES (?, ?, ?, ?, ?, ?, NULL, NULL)
        `;
        
        db.run(insertQuery, [
          dominioId,
          hito.descripcion, // nombre
          hito.descripcion, // descripción  
          hito.edad,
          0.5, // desviación estándar por defecto
          2 // OMS
        ], (err) => {
          if (err) {
            console.error(`Error insertando hito OMS ${index + 1}:`, err.message);
            reject(err);
          } else {
            resolve();
          }
        });
      });
    }
    console.log(`Insertados ${hitosRealesOMS.length} hitos reales de OMS`);

    // 6. Mostrar resumen final
    console.log('6. Generando resumen final...');
    await new Promise((resolve, reject) => {
      const countQuery = `
        SELECT f.nombre as fuente_normativa, COUNT(*) as total
        FROM hitos_normativos h
        JOIN fuentes_normativas f ON h.fuente_normativa_id = f.id
        GROUP BY h.fuente_normativa_id, f.nombre
        ORDER BY f.nombre
      `;
      
      db.all(countQuery, (err, rows) => {
        if (err) {
          console.error('Error obteniendo resumen:', err.message);
          reject(err);
        } else {
          console.log('\n=== RESUMEN FINAL ===');
          rows.forEach(row => {
            const status = row.fuente_normativa.includes('Battelle') || row.fuente_normativa.includes('Bayley') 
              ? '(EN CUARENTENA - pendiente datos reales)'
              : '(DATOS REALES)';
            console.log(`${row.fuente_normativa}: ${row.total} hitos ${status}`);
          });
          resolve();
        }
      });
    });

    console.log('\n✅ Actualización completada exitosamente');
    console.log('📋 Resumen:');
    console.log('  - CDC: Datos reales implementados');
    console.log('  - OMS: Datos reales implementados');
    console.log('  - Battelle: En cuarentena, pendiente datos reales');
    console.log('  - Bayley: En cuarentena, pendiente datos reales');

  } catch (error) {
    console.error('Error durante la actualización:', error);
  } finally {
    db.close((err) => {
      if (err) {
        console.error('Error cerrando la base de datos:', err.message);
      } else {
        console.log('Conexión a base de datos cerrada.');
      }
    });
  }
}

// Ejecutar la actualización
updateDatabase();