const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Leer los archivos JSON con los nuevos hitos
const hitosECDI = JSON.parse(fs.readFileSync(path.join(__dirname, 'hitos_ecdi2030.json'), 'utf8'));
const hitosDenver = JSON.parse(fs.readFileSync(path.join(__dirname, 'hitos_denver.json'), 'utf8'));

const dbPath = path.join(__dirname, '..', 'server', 'neurodesarrollo_dev_new.db');

console.log('Iniciando adición de nuevas fuentes de datos...');
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

async function addNewSources() {
  try {
    // 1. Agregar nuevas fuentes normativas si no existen
    console.log('1. Agregando nuevas fuentes normativas...');
    
    // Agregar ECDI2030
    await new Promise((resolve, reject) => {
      const insertFuenteQuery = `
        INSERT OR IGNORE INTO fuentes_normativas (
          nombre, referencia_bibliografica, descripcion, año, 
          poblacion, activa
        ) VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      db.run(insertFuenteQuery, [
        'ECDI2030 - UNICEF',
        'UNICEF. (2020). Early Childhood Development Index 2030 (ECDI2030). New York: UNICEF.',
        'Índice de desarrollo de la primera infancia basado en 4 dominios: alfabetización-numeración, físico, socio-emocional y aprendizaje. Diseñado para monitorear el SDG 4.2.',
        2020,
        'Población infantil de 36-59 meses en múltiples países participantes en MICS',
        1
      ], (err) => {
        if (err) {
          console.error('Error agregando fuente ECDI2030:', err.message);
          reject(err);
        } else {
          console.log('Fuente ECDI2030 agregada');
          resolve();
        }
      });
    });

    // Agregar Denver II
    await new Promise((resolve, reject) => {
      const insertFuenteQuery = `
        INSERT OR IGNORE INTO fuentes_normativas (
          nombre, referencia_bibliografica, descripcion, año, 
          poblacion, activa
        ) VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      db.run(insertFuenteQuery, [
        'Denver II - DDM Inc',
        'Frankenburg, W. K., et al. (1992). The Denver II: A major revision and restandardization of the Denver Developmental Screening Test. Pediatrics, 89(1), 91-97.',
        'Test de cribado del desarrollo para edades 0-6 años. Evalúa 4 áreas: personal-social, motor fino-adaptativo, lenguaje y motor grueso. Ampliamente utilizado en pediatría.',
        1992,
        'Población normativa estadounidense (n=2,096) estratificada por edad, sexo y origen materno',
        1
      ], (err) => {
        if (err) {
          console.error('Error agregando fuente Denver II:', err.message);
          reject(err);
        } else {
          console.log('Fuente Denver II agregada');
          resolve();
        }
      });
    });

    // 2. Obtener los IDs de las fuentes
    console.log('2. Obteniendo IDs de las nuevas fuentes...');
    const [ecdiId, denverId] = await Promise.all([
      new Promise((resolve, reject) => {
        db.get('SELECT id FROM fuentes_normativas WHERE nombre = ?', ['ECDI2030 - UNICEF'], (err, row) => {
          if (err) reject(err);
          else resolve(row ? row.id : null);
        });
      }),
      new Promise((resolve, reject) => {
        db.get('SELECT id FROM fuentes_normativas WHERE nombre = ?', ['Denver II - DDM Inc'], (err, row) => {
          if (err) reject(err);
          else resolve(row ? row.id : null);
        });
      })
    ]);

    console.log(`ECDI2030 ID: ${ecdiId}, Denver II ID: ${denverId}`);

    // 3. Insertar hitos ECDI2030
    if (ecdiId) {
      console.log('3. Insertando hitos ECDI2030...');
      for (const [index, hito] of hitosECDI.entries()) {
        const dominioId = areaTodominio[hito.area];
        if (!dominioId) {
          console.warn(`Área desconocida para hito ECDI ${index + 1}: ${hito.area}`);
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
            hito.descripcion,
            hito.descripcion + (hito.notas ? ` (${hito.notas})` : ''),
            hito.edad,
            1.0, // desviación estándar por defecto para ECDI
            ecdiId
          ], (err) => {
            if (err) {
              console.error(`Error insertando hito ECDI ${index + 1}:`, err.message);
              reject(err);
            } else {
              resolve();
            }
          });
        });
      }
      console.log(`Insertados ${hitosECDI.length} hitos ECDI2030`);
    }

    // 4. Insertar hitos Denver II
    if (denverId) {
      console.log('4. Insertando hitos Denver II...');
      for (const [index, hito] of hitosDenver.entries()) {
        const dominioId = areaTodominio[hito.area];
        if (!dominioId) {
          console.warn(`Área desconocida para hito Denver ${index + 1}: ${hito.area}`);
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
            hito.descripcion,
            hito.descripcion + (hito.notas ? ` (${hito.notas})` : ''),
            hito.edad,
            0.5, // desviación estándar por defecto para Denver
            denverId
          ], (err) => {
            if (err) {
              console.error(`Error insertando hito Denver ${index + 1}:`, err.message);
              reject(err);
            } else {
              resolve();
            }
          });
        });
      }
      console.log(`Insertados ${hitosDenver.length} hitos Denver II`);
    }

    // 5. Mostrar resumen final
    console.log('5. Generando resumen final...');
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
          console.log('\n=== RESUMEN FINAL ACTUALIZADO ===');
          rows.forEach(row => {
            let status = '(DATOS REALES)';
            if (row.fuente_normativa.includes('Battelle') || row.fuente_normativa.includes('Bayley')) {
              status = '(EN CUARENTENA - pendiente datos reales)';
            }
            console.log(`${row.fuente_normativa}: ${row.total} hitos ${status}`);
          });
          resolve();
        }
      });
    });

    console.log('\n✅ Actualización completada exitosamente');
    console.log('📋 Nuevas fuentes agregadas:');
    console.log('  - ECDI2030: Hitos de 36-59 meses (4 dominios)');
    console.log('  - Denver II: Hitos de 1-48 meses (desarrollo general)');
    console.log('  - Total nuevos hitos:', hitosECDI.length + hitosDenver.length);

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
addNewSources();