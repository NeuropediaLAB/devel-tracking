const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Leer los hitos extraídos de D-score
const hitosExtraidos = JSON.parse(fs.readFileSync(path.join(__dirname, 'hitos_dscore_extracted.json'), 'utf8'));

const dbPath = path.join(__dirname, '..', 'server', 'neurodesarrollo_dev_new.db');

console.log('Iniciando adición de hitos D-score...');
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
  'Adaptativo': 7,
  'No especificada': 6  // Por defecto, asignar a cognitivo
};

async function addDScoreMilestones() {
  try {
    // 1. Agregar fuentes normativas únicas
    console.log('1. Agregando fuentes normativas GCDG...');
    
    const fuentesUnicas = [...new Set(hitosExtraidos.map(h => h.fuente_normativa))];
    const fuenteIds = {};
    
    for (const fuente of fuentesUnicas) {
      await new Promise((resolve, reject) => {
        const insertFuenteQuery = `
          INSERT OR IGNORE INTO fuentes_normativas (
            nombre, referencia_bibliografica, descripcion, año, 
            poblacion, activa
          ) VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        // Extraer país de la fuente
        const pais = fuente.replace('GCDG - ', '');
        
        db.run(insertFuenteQuery, [
          fuente,
          'Global Child Development Group. (2023). Child Development Data Repository. https://d-score.org/childdevdata/',
          `Datos de desarrollo infantil del ${pais} como parte del Global Child Development Group (GCDG). Incluye múltiples escalas estandarizadas (Bayley, ASQ, Denver) aplicadas en estudios longitudinales.`,
          2023,
          `Población infantil del ${pais} participante en estudios GCDG`,
          1
        ], (err) => {
          if (err) {
            console.error(`Error agregando fuente ${fuente}:`, err.message);
            reject(err);
          } else {
            console.log(`Fuente ${fuente} agregada`);
            resolve();
          }
        });
      });
    }
    
    // 2. Obtener IDs de las fuentes
    console.log('2. Obteniendo IDs de fuentes GCDG...');
    for (const fuente of fuentesUnicas) {
      await new Promise((resolve, reject) => {
        db.get('SELECT id FROM fuentes_normativas WHERE nombre = ?', [fuente], (err, row) => {
          if (err) reject(err);
          else {
            fuenteIds[fuente] = row ? row.id : null;
            resolve();
          }
        });
      });
    }
    
    console.log('IDs obtenidos:', fuenteIds);
    
    // 3. Procesar y insertar hitos por lotes para eficiencia
    console.log('3. Procesando e insertando hitos...');
    
    let insertados = 0;
    let errores = 0;
    
    // Procesar en lotes de 50
    const loteSize = 50;
    for (let i = 0; i < hitosExtraidos.length; i += loteSize) {
      const lote = hitosExtraidos.slice(i, i + loteSize);
      
      await new Promise((resolve, reject) => {
        db.serialize(() => {
          db.run('BEGIN TRANSACTION');
          
          let operacionesPendientes = lote.length;
          let hayError = false;
          
          lote.forEach((hito, index) => {
            const dominioId = areaTodominio[hito.area] || 6; // Default cognitivo
            const fuenteId = fuenteIds[hito.fuente_normativa];
            
            if (!fuenteId) {
              console.warn(`Fuente no encontrada para: ${hito.fuente_normativa}`);
              operacionesPendientes--;
              if (operacionesPendientes === 0) resolve();
              return;
            }
            
            // Traducir descripción básica al español
            const descripcionTraducida = traducirDescripcion(hito.descripcion);
            
            const insertQuery = `
              INSERT OR IGNORE INTO hitos_normativos (
                dominio_id, nombre, descripcion, edad_media_meses, 
                desviacion_estandar, fuente_normativa_id,
                video_url_cdc, video_url_pathways
              ) VALUES (?, ?, ?, ?, ?, ?, NULL, NULL)
            `;
            
            db.run(insertQuery, [
              dominioId,
              `${descripcionTraducida} [${hito.code}]`, // nombre único con código
              `${descripcionTraducida} [${hito.code}] (${hito.notas})`,
              hito.edad_estimada,
              1.0, // desviación estándar por defecto
              fuenteId
            ], (err) => {
              if (err) {
                console.error(`Error insertando hito ${i + index + 1}:`, err.message);
                errores++;
                hayError = true;
              } else {
                insertados++;
              }
              
              operacionesPendientes--;
              if (operacionesPendientes === 0) {
                if (hayError) {
                  db.run('ROLLBACK', () => reject(new Error('Errores en lote')));
                } else {
                  db.run('COMMIT', () => resolve());
                }
              }
            });
          });
        });
      });
      
      console.log(`Procesado lote ${Math.floor(i/loteSize) + 1}/${Math.ceil(hitosExtraidos.length/loteSize)} - Insertados: ${insertados}, Errores: ${errores}`);
    }
    
    // 4. Generar resumen final
    console.log('4. Generando resumen final...');
    await new Promise((resolve, reject) => {
      const countQuery = `
        SELECT f.nombre as fuente_normativa, COUNT(*) as total
        FROM hitos_normativos h
        JOIN fuentes_normativas f ON h.fuente_normativa_id = f.id
        WHERE f.nombre LIKE 'GCDG%'
        GROUP BY h.fuente_normativa_id, f.nombre
        ORDER BY f.nombre
      `;
      
      db.all(countQuery, (err, rows) => {
        if (err) {
          console.error('Error obteniendo resumen:', err.message);
          reject(err);
        } else {
          console.log('\n=== RESUMEN HITOS D-SCORE AGREGADOS ===');
          let totalGcdg = 0;
          rows.forEach(row => {
            console.log(`${row.fuente_normativa}: ${row.total} hitos`);
            totalGcdg += row.total;
          });
          console.log(`Total GCDG: ${totalGcdg} hitos`);
          resolve();
        }
      });
    });

    // Resumen general
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

    console.log(`\n✅ Proceso completado exitosamente`);
    console.log(`📊 Estadísticas:`);
    console.log(`  - Hitos procesados: ${hitosExtraidos.length}`);
    console.log(`  - Hitos insertados: ${insertados}`);
    console.log(`  - Errores: ${errores}`);
    console.log(`  - Fuentes GCDG agregadas: ${fuentesUnicas.length}`);

  } catch (error) {
    console.error('❌ Error durante el proceso:', error);
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

// Función para traducir descripciones básicas al español
function traducirDescripcion(descripcion) {
  const traducciones = {
    'inspects own hand': 'inspecciona su propia mano',
    'closes on dangling ring': 'cierra la mano al anillo colgante',
    'turns head to sound of bell': 'gira la cabeza al sonido de campana',
    'turns head to sound of rattle': 'gira la cabeza al sonido de sonaja',
    'reaches for cube': 'alcanza el cubo',
    'manipulates table edge actively': 'manipula activamente el borde de la mesa',
    'eye-hand coordination in reaching': 'coordinación ojo-mano al alcanzar',
    'regards pellet': 'observa pastilla pequeña',
    'mirror image approach': 'aproximación a imagen en espejo',
    'picks up cube': 'recoge el cubo',
    'vocalises attitudes': 'vocaliza actitudes',
    'retains 2 cubes': 'retiene 2 cubos',
    'exploitive paper play': 'juego exploratorio con papel',
    'discriminates strangers': 'discrimina extraños',
    'recovers rattle': 'recupera sonaja',
    'reaches persistently': 'alcanza persistentemente',
    'likes frolic play': 'le gusta el juego alegre',
    'lifts inverted cup': 'levanta taza invertida',
    'reaches for second cube': 'alcanza segundo cubo',
    'hands': 'manos',
    'head': 'cabeza',
    'sound': 'sonido',
    'cube': 'cubo',
    'play': 'juego',
    'walks': 'camina',
    'sits': 'se sienta',
    'stands': 'se pone de pie',
    'throws': 'lanza',
    'says': 'dice',
    'points': 'señala'
  };
  
  let traducido = descripcion.toLowerCase();
  
  // Aplicar traducciones
  for (const [en, es] of Object.entries(traducciones)) {
    traducido = traducido.replace(new RegExp(en, 'gi'), es);
  }
  
  // Capitalizar primera letra
  return traducido.charAt(0).toUpperCase() + traducido.slice(1);
}

// Ejecutar si se llama directamente
if (require.main === module) {
  addDScoreMilestones();
}

module.exports = { addDScoreMilestones };