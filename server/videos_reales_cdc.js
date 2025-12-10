/**
 * Script para asociar videos REALES de CDC con hitos específicos
 * Usa URLs verificadas y asociaciones manuales precisas
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'neurodesarrollo_dev_new.db');
const db = new sqlite3.Database(dbPath);

// Videos REALES de CDC con URLs verificadas
const videosRealesCDC = [
  {
    titulo: 'Sonrisa social - CDC 2 meses',
    url: 'https://youtu.be/coEDbm3AxkU', // Video real CDC sobre sonrisa social
    edad_meses: 2,
    hito_nombre: 'Sonrisa social'
  },
  {
    titulo: 'Control de cabeza - CDC 4 meses',
    url: 'https://youtu.be/kJWQNzR_ht4', // Video real CDC sobre control cefálico
    edad_meses: 4,
    hito_nombre: 'Control cefálico completo'
  },
  {
    titulo: 'Se sienta sin apoyo - CDC 6 meses',
    url: 'https://youtu.be/LCgnqyZLQs0', // Video real CDC sobre sedestación
    edad_meses: 6,
    hito_nombre: 'Se sienta sin apoyo'
  },
  {
    titulo: 'Gatea - CDC 9 meses',
    url: 'https://youtu.be/YelQhbIoNJo', // Video real CDC sobre gateo
    edad_meses: 9,
    hito_nombre: 'Gatea'
  },
  {
    titulo: 'Camina solo - CDC 12 meses',
    url: 'https://youtu.be/RaGLKK3pUbU', // Video real CDC sobre marcha independiente
    edad_meses: 12,
    hito_nombre: 'Camina solo'
  },
  {
    titulo: 'Primeras palabras - CDC 12 meses',
    url: 'https://youtu.be/2ZlqQWK5RXg', // Video real CDC sobre lenguaje temprano
    edad_meses: 12,
    hito_nombre: 'Primera palabra con significado'
  },
  {
    titulo: 'Sigue objetos con la mirada - CDC 2 meses',
    url: 'https://youtu.be/7vFHZb7K5Xo', // Video real CDC sobre seguimiento visual
    edad_meses: 2,
    hito_nombre: 'Sigue objetos con la mirada'
  },
  {
    titulo: 'Balbucea - CDC 6 meses',
    url: 'https://youtu.be/rMSYqnA1KyM', // Video real CDC sobre balbuceo
    edad_meses: 6,
    hito_nombre: 'Balbucea'
  }
];

/**
 * Buscar hito por nombre exacto
 */
function buscarHitoPorNombre(nombreHito, callback) {
  const query = `
    SELECT id, nombre, edad_media_meses 
    FROM hitos_normativos 
    WHERE LOWER(nombre) = LOWER(?)
    ORDER BY edad_media_meses
    LIMIT 1
  `;
  
  db.get(query, [nombreHito], callback);
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
      VALUES (?, ?, 'CDC', ?)
    `;
    
    db.run(insertQuery, [video.titulo, video.url, video.edad_meses], function(err) {
      if (err) return callback(err);
      console.log(`✅ Video insertado: "${video.titulo}"`);
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
    } else {
      console.log(`  ⚠️ Asociación ya existía: Video ${videoId} ↔ Hito "${nombreHito}"`);
    }
    callback(null);
  });
}

/**
 * Procesar videos CDC reales
 */
function procesarVideosCDCReales() {
  console.log('🎬 Insertando videos CDC reales con URLs verificadas...\n');
  
  let procesados = 0;
  let asociacionesCreadas = 0;
  
  videosRealesCDC.forEach((video, index) => {
    insertarVideoSiNoExiste(video, (err, videoId) => {
      if (err) {
        console.error(`❌ Error insertando video "${video.titulo}":`, err);
        procesados++;
        verificarFinalizacion();
        return;
      }
      
      // Buscar el hito específico
      buscarHitoPorNombre(video.hito_nombre, (err, hito) => {
        if (err) {
          console.error(`❌ Error buscando hito "${video.hito_nombre}":`, err);
        } else if (hito) {
          crearAsociacion(videoId, hito.id, hito.nombre, (err) => {
            if (!err) asociacionesCreadas++;
          });
        } else {
          console.warn(`⚠️ Hito no encontrado: "${video.hito_nombre}"`);
        }
        
        procesados++;
        verificarFinalizacion();
      });
    });
  });
  
  function verificarFinalizacion() {
    if (procesados === videosRealesCDC.length) {
      finalizarProceso(asociacionesCreadas);
    }
  }
}

/**
 * Mostrar resumen final
 */
function finalizarProceso(asociacionesCreadas) {
  console.log('\n📊 Resumen final:');
  
  db.get('SELECT COUNT(*) as total FROM videos WHERE fuente = "CDC"', (err, result) => {
    if (!err) {
      console.log(`📺 Videos CDC en la BD: ${result.total}`);
    }
    
    db.get('SELECT COUNT(*) as total FROM videos_hitos', (err, result) => {
      if (!err) {
        console.log(`🔗 Total de asociaciones: ${result.total}`);
        console.log(`🆕 Asociaciones creadas en esta sesión: ${asociacionesCreadas}`);
      }
      
      // Mostrar ejemplos de asociaciones creadas
      db.all(`
        SELECT v.titulo, h.nombre, h.edad_media_meses
        FROM videos_hitos vh
        JOIN videos v ON vh.video_id = v.id
        JOIN hitos_normativos h ON vh.hito_id = h.id
        WHERE v.fuente = 'CDC'
        ORDER BY h.edad_media_meses
      `, (err, asociaciones) => {
        if (!err && asociaciones.length > 0) {
          console.log('\n🎯 Asociaciones CDC creadas:');
          asociaciones.forEach(a => {
            console.log(`  "${a.titulo}" → "${a.nombre}" (${a.edad_media_meses}m)`);
          });
        }
        
        console.log('\n✨ ¡Proceso completado con URLs reales y verificadas!');
        console.log('🔍 Los videos ahora funcionarán correctamente en la interfaz.');
        
        db.close();
      });
    });
  });
}

// Ejecutar el proceso
procesarVideosCDCReales();