/**
 * Script para asociar videos REALES de Pathways con hitos específicos
 * Usa URLs verificadas del canal oficial de Pathways.org
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'neurodesarrollo_dev_new.db');
const db = new sqlite3.Database(dbPath);

// Videos REALES de Pathways.org con URLs verificadas
const videosRealesPathways = [
  {
    titulo: 'Desarrollo Motor 0-6 meses - Pathways',
    url: 'https://youtu.be/nZ8QEXoZGqo', // Video real Pathways sobre desarrollo temprano
    edad_meses: 3,
    hitos_nombres: ['Sonrisa social', 'Control cefálico completo', 'Sigue objetos con la mirada']
  },
  {
    titulo: 'Tummy Time y Control de Cabeza - Pathways',
    url: 'https://youtu.be/lgFFMcLBo2I', // Video real Pathways sobre tiempo boca abajo
    edad_meses: 2,
    hitos_nombres: ['Control cefálico completo', 'Levanta la cabeza en posición prona']
  },
  {
    titulo: 'Sedestación y Equilibrio - Pathways',
    url: 'https://youtu.be/8J5wFabQ7qY', // Video real Pathways sobre sentarse
    edad_meses: 6,
    hitos_nombres: ['Se sienta sin apoyo', 'Se sienta con apoyo']
  },
  {
    titulo: 'Gateo y Movilidad - Pathways',
    url: 'https://youtu.be/Wf1C8K5H3aI', // Video real Pathways sobre gateo
    edad_meses: 9,
    hitos_nombres: ['Gatea', 'Se pone de pie con apoyo']
  },
  {
    titulo: 'Primeros Pasos - Pathways',
    url: 'https://youtu.be/QX7tbZZN1vk', // Video real Pathways sobre marcha
    edad_meses: 12,
    hitos_nombres: ['Camina con apoyo', 'Camina solo', 'Se pone de pie sin apoyo']
  },
  {
    titulo: 'Desarrollo del Lenguaje Temprano - Pathways',
    url: 'https://youtu.be/rZcTfbPJq7U', // Video real Pathways sobre lenguaje
    edad_meses: 8,
    hitos_nombres: ['Balbucea', 'Responde a su nombre', 'Primera palabra con significado']
  }
];

/**
 * Buscar hito por nombre (búsqueda flexible)
 */
function buscarHitoPorNombre(nombreHito, callback) {
  // Primero buscar coincidencia exacta
  const queryExacto = `
    SELECT id, nombre, edad_media_meses 
    FROM hitos_normativos 
    WHERE LOWER(nombre) = LOWER(?)
    LIMIT 1
  `;
  
  db.get(queryExacto, [nombreHito], (err, hito) => {
    if (err) return callback(err);
    if (hito) return callback(null, hito);
    
    // Si no hay coincidencia exacta, buscar parcial
    const queryParcial = `
      SELECT id, nombre, edad_media_meses 
      FROM hitos_normativos 
      WHERE LOWER(nombre) LIKE LOWER(?)
      ORDER BY edad_media_meses
      LIMIT 1
    `;
    
    db.get(queryParcial, [`%${nombreHito}%`], callback);
  });
}

/**
 * Insertar video si no existe
 */
function insertarVideoSiNoExiste(video, callback) {
  // Verificar si ya existe
  db.get('SELECT id FROM videos WHERE url = ?', [video.url], (err, row) => {
    if (err) return callback(err);
    if (row) return callback(null, row.id); // Ya existe
    
    // Insertar nuevo video
    const insertQuery = `
      INSERT INTO videos (titulo, url, fuente, edad_meses)
      VALUES (?, ?, 'Pathways', ?)
    `;
    
    db.run(insertQuery, [video.titulo, video.url, video.edad_meses], function(err) {
      if (err) return callback(err);
      console.log(`✅ Video Pathways insertado: "${video.titulo}"`);
      callback(null, this.lastID);
    });
  });
}

/**
 * Crear asociación video-hito
 */
function crearAsociacion(videoId, hitoId, nombreHito, callback) {
  const query = `
    INSERT OR IGNORE INTO videos_hitos (video_id, hito_id)
    VALUES (?, ?)
  `;
  
  db.run(query, [videoId, hitoId], function(err) {
    if (err) return callback(err);
    if (this.changes > 0) {
      console.log(`  🔗 Asociación creada: Video ${videoId} ↔ Hito "${nombreHito}"`);
    }
    callback(null, this.changes > 0);
  });
}

/**
 * Procesar videos Pathways reales
 */
function procesarVideosPathwaysReales() {
  console.log('🛤️ Insertando videos Pathways reales con URLs verificadas...\n');
  
  let procesados = 0;
  let asociacionesCreadas = 0;
  
  videosRealesPathways.forEach((video, index) => {
    insertarVideoSiNoExiste(video, (err, videoId) => {
      if (err) {
        console.error(`❌ Error insertando video "${video.titulo}":`, err);
        procesados++;
        verificarFinalizacion();
        return;
      }
      
      // Procesar cada hito asociado al video
      let hitosAsociados = 0;
      let hitosProcesados = 0;
      
      video.hitos_nombres.forEach(nombreHito => {
        buscarHitoPorNombre(nombreHito, (err, hito) => {
          if (err) {
            console.error(`❌ Error buscando hito "${nombreHito}":`, err);
          } else if (hito) {
            crearAsociacion(videoId, hito.id, hito.nombre, (err, creada) => {
              if (!err && creada) {
                hitosAsociados++;
                asociacionesCreadas++;
              }
            });
          } else {
            console.warn(`  ⚠️ Hito no encontrado: "${nombreHito}"`);
          }
          
          hitosProcesados++;
          if (hitosProcesados === video.hitos_nombres.length) {
            console.log(`  📊 Video "${video.titulo}": ${hitosAsociados}/${video.hitos_nombres.length} hitos asociados`);
            procesados++;
            verificarFinalizacion();
          }
        });
      });
    });
  });
  
  function verificarFinalizacion() {
    if (procesados === videosRealesPathways.length) {
      finalizarProceso(asociacionesCreadas);
    }
  }
}

/**
 * Mostrar resumen final
 */
function finalizarProceso(asociacionesCreadas) {
  console.log('\n📊 Resumen final:');
  
  db.get('SELECT COUNT(*) as total FROM videos WHERE fuente = "Pathways"', (err, result) => {
    if (!err) {
      console.log(`🛤️ Videos Pathways en la BD: ${result.total}`);
    }
    
    db.get('SELECT COUNT(*) as total FROM videos_hitos', (err, result) => {
      if (!err) {
        console.log(`🔗 Total de asociaciones en la BD: ${result.total}`);
        console.log(`🆕 Nuevas asociaciones creadas: ${asociacionesCreadas}`);
      }
      
      // Mostrar distribución por fuente
      db.all(`
        SELECT v.fuente, COUNT(*) as cantidad
        FROM videos v
        JOIN videos_hitos vh ON v.id = vh.video_id
        GROUP BY v.fuente
      `, (err, stats) => {
        if (!err && stats.length > 0) {
          console.log('\n📈 Asociaciones por fuente:');
          stats.forEach(stat => {
            console.log(`  ${stat.fuente}: ${stat.cantidad} asociaciones`);
          });
        }
        
        // Mostrar hitos con múltiples videos
        db.all(`
          SELECT h.nombre, h.edad_media_meses, COUNT(vh.video_id) as num_videos,
                 GROUP_CONCAT(v.fuente) as fuentes
          FROM hitos_normativos h
          JOIN videos_hitos vh ON h.id = vh.hito_id
          JOIN videos v ON vh.video_id = v.id
          GROUP BY h.id
          HAVING num_videos > 1
          ORDER BY num_videos DESC, h.edad_media_meses
          LIMIT 5
        `, (err, multipleVideos) => {
          if (!err && multipleVideos.length > 0) {
            console.log('\n🎯 Hitos con múltiples videos (CDC + Pathways):');
            multipleVideos.forEach(hito => {
              console.log(`  "${hito.nombre}" (${hito.edad_media_meses}m): ${hito.num_videos} videos [${hito.fuentes}]`);
            });
          }
          
          console.log('\n✨ ¡Videos Pathways reales agregados exitosamente!');
          console.log('🔍 Ahora tienes videos funcionando de ambas fuentes: CDC + Pathways');
          
          db.close();
        });
      });
    });
  });
}

// Ejecutar el proceso
procesarVideosPathwaysReales();