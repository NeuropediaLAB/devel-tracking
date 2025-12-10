/**
 * Script para asociar los videos reales con hitos usando el mapeo correcto
 * Usa las URLs ya existentes y los títulos descriptivos del mapeo CDC
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'neurodesarrollo_dev_new.db');
const db = new sqlite3.Database(dbPath);

// Mapeo de URLs a nombres de hitos (extraído del archivo update_all_videos.js)
const mapeoVideosCDC = {
  'https://youtu.be/0HZgmcJznu0': {
    titulo: 'Sonrisa social - CDC 2 meses',
    hito: 'Sonrisa social',
    edad: 2
  },
  'https://youtu.be/kpDw2IwrY3A': {
    titulo: 'Levanta la cabeza en posición prona - CDC 2 meses', 
    hito: 'Levanta la cabeza en posición prona',
    edad: 2
  },
  'https://youtu.be/wiTsQzG8HvA': {
    titulo: 'Sigue objetos con la mirada - CDC 2 meses',
    hito: 'Sigue objetos con la mirada',
    edad: 2
  },
  'https://youtu.be/PU28jG7C2D8': {
    titulo: 'Contacto visual - CDC 2 meses',
    hito: 'Contacto visual',
    edad: 2
  },
  'https://youtu.be/wgbHbpa2CxY': {
    titulo: 'Gorjea - CDC 3 meses',
    hito: 'Gorjea',
    edad: 3
  },
  'https://youtu.be/xXZQUO3sZuA': {
    titulo: 'Control cefálico completo - CDC 4 meses',
    hito: 'Control cefálico completo',
    edad: 4
  },
  'https://youtu.be/FDuiy78HOdU': {
    titulo: 'Alcanza objetos - CDC 4 meses',
    hito: 'Alcanza objetos',
    edad: 4
  },
  'https://youtu.be/UOF1iqfUI2U': {
    titulo: 'Gira hacia la voz - CDC 4 meses',
    hito: 'Gira hacia la voz',
    edad: 4
  },
  'https://youtu.be/tD3mjf8zxPU': {
    titulo: 'Ríe - CDC 4 meses',
    hito: 'Ríe',
    edad: 4
  },
  'https://youtu.be/jQxT4zfxg2U': {
    titulo: 'Busca objetos con la mirada - CDC 4 meses',
    hito: 'Busca objetos con la mirada',
    edad: 4
  },
  'https://youtu.be/YESAaHVcP1M': {
    titulo: 'Se voltea de boca arriba a boca abajo - CDC 6 meses',
    hito: 'Se voltea de boca arriba a boca abajo',
    edad: 6
  },
  'https://youtu.be/LCqSikCDgg4': {
    titulo: 'Transfiere objetos de mano a mano - CDC 6 meses',
    hito: 'Transfiere objetos de mano a mano',
    edad: 6
  },
  'https://youtu.be/F8KhcHkNaXc': {
    titulo: 'Balbucea - CDC 6 meses',
    hito: 'Balbucea',
    edad: 6
  },
  'https://youtu.be/74Ks1N8UrfI': {
    titulo: 'Sostiene biberón - CDC 6 meses',
    hito: 'Sostiene biberón',
    edad: 6
  },
  'https://youtu.be/KJzt9N6kNI8': {
    titulo: 'Se sienta sin apoyo - CDC 7 meses',
    hito: 'Se sienta sin apoyo',
    edad: 7
  },
  'https://youtu.be/Ac9uD-po-II': {
    titulo: 'Pinza inferior - CDC 7 meses',
    hito: 'Pinza inferior',
    edad: 7
  },
  'https://youtu.be/7g76fIIAUXA': {
    titulo: 'Responde a su nombre - CDC 7 meses',
    hito: 'Responde a su nombre',
    edad: 7
  },
  'https://youtu.be/sKXbu3VUC-Y': {
    titulo: 'Ansiedad ante extraños - CDC 8 meses',
    hito: 'Ansiedad ante extraños',
    edad: 8
  },
  'https://youtu.be/KK4USWUEkPc': {
    titulo: 'Gatea - CDC 9 meses',
    hito: 'Gatea',
    edad: 9
  },
  'https://youtu.be/Ap0ZIGeO2Js': {
    titulo: 'Comprende "no" - CDC 9 meses',
    hito: 'Comprende "no"',
    edad: 9
  },
  'https://youtu.be/-mCruPPhVRg': {
    titulo: 'Permanencia del objeto - CDC 9 meses',
    hito: 'Permanencia del objeto',
    edad: 9
  },
  'https://youtu.be/ywACPvLw1vY': {
    titulo: 'Pinza superior (pulgar-índice) - CDC 10 meses',
    hito: 'Pinza superior (pulgar-índice)',
    edad: 10
  },
  'https://youtu.be/Qx8XIFR6k8Y': {
    titulo: 'Se pone de pie con apoyo - CDC 10 meses',
    hito: 'Se pone de pie con apoyo',
    edad: 10
  },
  'https://youtu.be/yv7ne3sP74s': {
    titulo: 'Primera palabra con significado - CDC 12 meses',
    hito: 'Primera palabra con significado',
    edad: 12
  },
  'https://youtu.be/NwA3UdVa-So': {
    titulo: 'Camina con apoyo - CDC 12 meses',
    hito: 'Camina con apoyo',
    edad: 12
  },
  'https://youtu.be/B2vOJ35N2w4': {
    titulo: 'Camina solo - CDC 13 meses',
    hito: 'Camina solo',
    edad: 13
  },
  'https://youtu.be/xiZ2Rx8eos8': {
    titulo: 'Sube escaleras con ayuda - CDC 18 meses',
    hito: 'Sube escaleras con ayuda',
    edad: 18
  },
  'https://youtu.be/QTjC3xA5Mjg': {
    titulo: 'Apila 2 cubos - CDC 15 meses',
    hito: 'Apila 2 cubos',
    edad: 15
  },
  'https://youtu.be/82VFkA1KxXc': {
    titulo: 'Corre - CDC 24 meses',
    hito: 'Corre',
    edad: 24
  },
  'https://youtu.be/HzwDn9wBYZ8': {
    titulo: 'Apila 4 cubos - CDC 18 meses',
    hito: 'Apila 4 cubos',
    edad: 18
  },
  'https://youtu.be/IvsZJA5vf3s': {
    titulo: 'Combina dos palabras - CDC 24 meses',
    hito: 'Combina dos palabras',
    edad: 24
  }
};

/**
 * Buscar hito por nombre
 */
function buscarHito(nombreHito, callback) {
  const query = `
    SELECT id, nombre, edad_media_meses 
    FROM hitos_normativos 
    WHERE LOWER(nombre) = LOWER(?) OR LOWER(nombre) LIKE LOWER(?)
    ORDER BY edad_media_meses
    LIMIT 1
  `;
  
  db.get(query, [nombreHito, `%${nombreHito}%`], callback);
}

/**
 * Actualizar título del video
 */
function actualizarTituloVideo(videoId, nuevoTitulo, callback) {
  db.run(
    'UPDATE videos SET titulo = ? WHERE id = ?',
    [nuevoTitulo, videoId],
    callback
  );
}

/**
 * Crear asociación video-hito
 */
function crearAsociacion(videoId, hitoId, callback) {
  db.run(
    'INSERT OR IGNORE INTO videos_hitos (video_id, hito_id) VALUES (?, ?)',
    [videoId, hitoId],
    callback
  );
}

/**
 * Procesar videos existentes
 */
function procesarVideos() {
  console.log('🔗 Asociando videos reales con hitos...\n');
  
  // Obtener todos los videos
  db.all('SELECT id, url FROM videos ORDER BY id', (err, videos) => {
    if (err) {
      console.error('Error obteniendo videos:', err);
      return;
    }
    
    let procesados = 0;
    let asociacionesCreadas = 0;
    let titulosActualizados = 0;
    
    videos.forEach(video => {
      const mapeo = mapeoVideosCDC[video.url];
      
      if (mapeo) {
        // Actualizar título
        actualizarTituloVideo(video.id, mapeo.titulo, (err) => {
          if (!err) {
            titulosActualizados++;
            console.log(`✅ Título actualizado: "${mapeo.titulo}"`);
          }
        });
        
        // Buscar hito asociado
        buscarHito(mapeo.hito, (err, hito) => {
          if (err) {
            console.error(`❌ Error buscando hito "${mapeo.hito}":`, err);
          } else if (hito) {
            crearAsociacion(video.id, hito.id, (err) => {
              if (!err) {
                asociacionesCreadas++;
                console.log(`  🔗 Asociación: "${mapeo.titulo}" ↔ "${hito.nombre}"`);
              }
            });
          } else {
            console.warn(`  ⚠️ Hito no encontrado: "${mapeo.hito}"`);
          }
          
          procesados++;
          if (procesados === videos.length) {
            finalizarProceso(titulosActualizados, asociacionesCreadas);
          }
        });
      } else {
        console.log(`📹 Video sin mapeo: ID ${video.id} - ${video.url}`);
        procesados++;
        if (procesados === videos.length) {
          finalizarProceso(titulosActualizados, asociacionesCreadas);
        }
      }
    });
  });
}

/**
 * Mostrar resumen final
 */
function finalizarProceso(titulosActualizados, asociacionesCreadas) {
  console.log('\n📊 Resumen final:');
  console.log(`📝 Títulos actualizados: ${titulosActualizados}`);
  console.log(`🔗 Asociaciones creadas: ${asociacionesCreadas}`);
  
  // Mostrar algunas asociaciones exitosas
  db.all(`
    SELECT v.titulo, h.nombre, h.edad_media_meses
    FROM videos_hitos vh
    JOIN videos v ON vh.video_id = v.id
    JOIN hitos_normativos h ON vh.hito_id = h.id
    WHERE v.fuente = 'CDC'
    ORDER BY h.edad_media_meses
    LIMIT 10
  `, (err, asociaciones) => {
    if (!err && asociaciones.length > 0) {
      console.log('\n🎯 Primeras 10 asociaciones exitosas:');
      asociaciones.forEach(a => {
        console.log(`  "${a.titulo}" → "${a.nombre}" (${a.edad_media_meses}m)`);
      });
    }
    
    console.log('\n✨ ¡Proceso completado!');
    console.log('🔍 Los videos ahora tienen títulos descriptivos y están asociados correctamente.');
    
    db.close();
  });
}

// Ejecutar el proceso
procesarVideos();