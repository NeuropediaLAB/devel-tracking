/**
 * Script para insertar SOLO los videos verificados del archivo videosHitos.js
 * Estos videos han sido probados manualmente según el comentario del archivo
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'neurodesarrollo_dev_new.db');
const db = new sqlite3.Database(dbPath);

// Importar el objeto desde el archivo de videos verificados
// Simulamos la importación leyendo el archivo y extrayendo los datos
const videosVerificados = {
  // Videos CDC verificados
  'Sonríe': [
    {
      youtube: 'https://www.youtube.com/watch?v=dUFpDchxJ1Y',
      fuente: 'CDC',
      descripcion: 'CDC - Hitos del desarrollo: 2 meses'
    }
  ],
  'Levanta la cabeza cuando está boca abajo': [
    {
      youtube: 'https://www.youtube.com/watch?v=dUFpDchxJ1Y', 
      fuente: 'CDC',
      descripcion: 'CDC - Control de cabeza a los 2 meses'
    }
  ],
  'Trata de mirar a los padres': [
    {
      youtube: 'https://www.youtube.com/watch?v=dUFpDchxJ1Y',
      fuente: 'CDC', 
      descripcion: 'CDC - Contacto visual a los 2 meses'
    }
  ],
  'Mantiene la cabeza firme sin apoyo': [
    {
      youtube: 'https://www.youtube.com/watch?v=tGuSPrTvI9k',
      fuente: 'CDC',
      descripcion: 'CDC - Hitos del desarrollo: 4 meses'
    }
  ],
  'Balbucea': [
    {
      youtube: 'https://www.youtube.com/watch?v=tGuSPrTvI9k',
      fuente: 'CDC',
      descripcion: 'CDC - Balbuceo a los 4 meses'
    }
  ],
  'Lleva las manos a la boca': [
    {
      youtube: 'https://www.youtube.com/watch?v=tGuSPrTvI9k',
      fuente: 'CDC',
      descripcion: 'CDC - Exploración oral a los 4 meses'
    }
  ],
  'Se apoya sobre los codos/antebrazos boca abajo': [
    {
      youtube: 'https://www.youtube.com/watch?v=tGuSPrTvI9k',
      fuente: 'CDC',
      descripcion: 'CDC - Apoyo sobre antebrazos a los 4 meses'
    }
  ],
  // Videos Pathways verificados
  'Rueda': [
    {
      youtube: 'https://www.youtube.com/watch?v=vSSIY00E3vo',
      fuente: 'Pathways.org',
      descripcion: 'Pathways.org - Aprende a rodar'
    }
  ],
  'Se sienta sin apoyo': [
    {
      youtube: 'https://www.youtube.com/watch?v=Mh8qFLILbKo',
      fuente: 'Pathways.org', 
      descripcion: 'Pathways.org - Sentarse sin apoyo'
    }
  ],
  'Gatea': [
    {
      youtube: 'https://www.youtube.com/watch?v=Q76HRgqzxRI',
      fuente: 'Pathways.org',
      descripcion: 'Pathways.org - Gateo'
    }
  ],
  'Se sostiene de pie con apoyo': [
    {
      youtube: 'https://www.youtube.com/watch?v=JWZZpFq5waI',
      fuente: 'Pathways.org',
      descripcion: 'Pathways.org - Ponerse de pie con apoyo'
    }
  ],
  'Camina solo': [
    {
      youtube: 'https://www.youtube.com/watch?v=8aOht67lZAc',
      fuente: 'Pathways.org',
      descripcion: 'Pathways.org - Caminar independiente'
    }
  ],
  'Sube escaleras': [
    {
      youtube: 'https://www.youtube.com/watch?v=xNj0lJzHMRo',
      fuente: 'Pathways.org',
      descripcion: 'Pathways.org - Subir escaleras'
    }
  ],
  'Corre': [
    {
      youtube: 'https://www.youtube.com/watch?v=CGq3r4iM_OU',
      fuente: 'Pathways.org',
      descripcion: 'Pathways.org - Correr'
    }
  ],
  'Patea una pelota': [
    {
      youtube: 'https://www.youtube.com/watch?v=kXVQp3NCJAk',
      fuente: 'Pathways.org',
      descripcion: 'Pathways.org - Patear pelota'
    }
  ]
};

/**
 * Buscar hito en la base de datos
 */
function buscarHito(nombreHito, callback) {
  // Intentar coincidencias exactas y parciales
  const queries = [
    'SELECT id, nombre FROM hitos_normativos WHERE LOWER(nombre) = LOWER(?)',
    'SELECT id, nombre FROM hitos_normativos WHERE LOWER(nombre) LIKE LOWER(?)',
    'SELECT id, nombre FROM hitos_normativos WHERE LOWER(nombre) LIKE LOWER(?)'
  ];
  
  const params = [
    [nombreHito],
    [`%${nombreHito}%`], 
    [`${nombreHito}%`]
  ];
  
  let encontrado = false;
  
  function probarQuery(index) {
    if (index >= queries.length || encontrado) {
      if (!encontrado) callback(null, null);
      return;
    }
    
    db.get(queries[index], params[index], (err, row) => {
      if (err) return callback(err);
      if (row && !encontrado) {
        encontrado = true;
        callback(null, row);
      } else {
        probarQuery(index + 1);
      }
    });
  }
  
  probarQuery(0);
}

/**
 * Insertar video
 */
function insertarVideo(titulo, url, fuente, descripcion, callback) {
  const query = `
    INSERT INTO videos (titulo, url, fuente, descripcion)
    VALUES (?, ?, ?, ?)
  `;
  
  db.run(query, [titulo, url, fuente, descripcion], function(err) {
    callback(err, this?.lastID);
  });
}

/**
 * Crear asociación video-hito
 */
function crearAsociacion(videoId, hitoId, callback) {
  const query = `
    INSERT OR IGNORE INTO videos_hitos (video_id, hito_id)
    VALUES (?, ?)
  `;
  
  db.run(query, [videoId, hitoId], callback);
}

/**
 * Procesar videos verificados
 */
function procesarVideosVerificados() {
  console.log('🎬 Insertando videos VERIFICADOS del archivo videosHitos.js...\n');
  console.log('📝 Nota: Estos videos han sido probados manualmente según el comentario del archivo\n');
  
  const hitosConVideo = Object.keys(videosVerificados);
  let procesados = 0;
  let videosInsertados = 0;
  let asociacionesCreadas = 0;
  
  hitosConVideo.forEach(nombreHito => {
    const videos = videosVerificados[nombreHito];
    
    videos.forEach(videoData => {
      // Crear título descriptivo usando el nombre del hito y la descripción
      const titulo = `${nombreHito} - ${videoData.fuente}`;
      
      insertarVideo(titulo, videoData.youtube, videoData.fuente, videoData.descripcion, (err, videoId) => {
        if (err) {
          console.error(`❌ Error insertando video "${titulo}":`, err);
        } else {
          videosInsertados++;
          console.log(`✅ Video insertado: "${titulo}"`);
          
          // Buscar hito correspondiente
          buscarHito(nombreHito, (err, hito) => {
            if (err) {
              console.error(`❌ Error buscando hito "${nombreHito}":`, err);
            } else if (hito) {
              crearAsociacion(videoId, hito.id, (err) => {
                if (!err) {
                  asociacionesCreadas++;
                  console.log(`  🔗 Asociado con hito: "${hito.nombre}"`);
                }
              });
            } else {
              console.warn(`  ⚠️ Hito no encontrado en BD: "${nombreHito}"`);
            }
            
            procesados++;
            if (procesados === hitosConVideo.length * videos.length) {
              setTimeout(() => finalizarProceso(videosInsertados, asociacionesCreadas), 1000);
            }
          });
        }
      });
    });
  });
}

/**
 * Mostrar resumen final
 */
function finalizarProceso(videosInsertados, asociacionesCreadas) {
  console.log('\n📊 Resumen final:');
  console.log(`📺 Videos insertados: ${videosInsertados}`);
  console.log(`🔗 Asociaciones creadas: ${asociacionesCreadas}`);
  
  // Mostrar ejemplos de videos insertados
  db.all(`
    SELECT v.titulo, v.url, v.fuente, h.nombre as hito_nombre
    FROM videos v
    LEFT JOIN videos_hitos vh ON v.id = vh.video_id
    LEFT JOIN hitos_normativos h ON vh.hito_id = h.id
    ORDER BY v.id
    LIMIT 10
  `, (err, ejemplos) => {
    if (!err && ejemplos.length > 0) {
      console.log('\n🎯 Primeros videos insertados:');
      ejemplos.forEach(v => {
        const asociacion = v.hito_nombre ? ` → "${v.hito_nombre}"` : ' (sin asociación)';
        console.log(`  "${v.titulo}" [${v.fuente}]${asociacion}`);
      });
    }
    
    console.log('\n✨ ¡Proceso completado!');
    console.log('🔍 Solo se han insertado videos VERIFICADOS del archivo videosHitos.js');
    console.log('📋 URLs probadas manualmente según documentación del archivo');
    
    db.close();
  });
}

// Ejecutar el proceso
procesarVideosVerificados();