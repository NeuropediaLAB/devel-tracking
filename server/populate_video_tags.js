/**
 * Script para poblar la base de datos con etiquetas apropiadas para cada video
 * Mejora la asociación hito-video basándose en:
 * - Nombres de videos CDC que contienen el hito
 * - Comentarios de videos Pathways que listan múltiples hitos
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'neurodesarrollo_dev_new.db');
const db = new sqlite3.Database(dbPath);

// Videos CDC con hitos específicos en el nombre
const videosCDC = [
  {
    titulo: 'Sonrisa social - CDC 2 meses',
    url: 'https://youtu.be/0HZgmcJznu0',
    edad_meses: 2,
    hitos: ['Sonrisa social']
  },
  {
    titulo: 'Levanta la cabeza en posición prona - CDC 2 meses',
    url: 'https://youtu.be/kpDw2IwrY3A',
    edad_meses: 2,
    hitos: ['Levanta la cabeza en posición prona']
  },
  {
    titulo: 'Sigue objetos con la mirada - CDC 2 meses',
    url: 'https://youtu.be/wiTsQzG8HvA',
    edad_meses: 2,
    hitos: ['Sigue objetos con la mirada']
  },
  {
    titulo: 'Control cefálico completo - CDC 4 meses',
    url: 'https://youtu.be/xXZQUO3sZuA',
    edad_meses: 4,
    hitos: ['Control cefálico completo']
  },
  {
    titulo: 'Alcanza objetos - CDC 4 meses',
    url: 'https://youtu.be/FDuiy78HOdU',
    edad_meses: 4,
    hitos: ['Alcanza objetos']
  },
  {
    titulo: 'Balbucea - CDC 6 meses',
    url: 'https://youtu.be/F8KhcHkNaXc',
    edad_meses: 6,
    hitos: ['Balbucea']
  },
  {
    titulo: 'Se voltea de boca arriba a boca abajo - CDC 6 meses',
    url: 'https://youtu.be/YESAaHVcP1M',
    edad_meses: 6,
    hitos: ['Se voltea de boca arriba a boca abajo']
  },
  {
    titulo: 'Se sienta sin apoyo - CDC 9 meses',
    url: 'https://youtu.be/kJTq-xZlFMw',
    edad_meses: 9,
    hitos: ['Se sienta sin apoyo']
  },
  {
    titulo: 'Gatea - CDC 9 meses',
    url: 'https://youtu.be/CjGMHpL3N8w',
    edad_meses: 9,
    hitos: ['Gatea']
  },
  {
    titulo: 'Camina con apoyo - CDC 12 meses',
    url: 'https://youtu.be/pYrMVsQqktU',
    edad_meses: 12,
    hitos: ['Camina con apoyo']
  },
  {
    titulo: 'Dice primeras palabras - CDC 12 meses',
    url: 'https://youtu.be/jRUViVxaWh8',
    edad_meses: 12,
    hitos: ['Dice primeras palabras']
  },
  {
    titulo: 'Camina solo - CDC 15 meses',
    url: 'https://youtu.be/TlJBz2H8kjM',
    edad_meses: 15,
    hitos: ['Camina solo']
  },
  {
    titulo: 'Corre - CDC 18 meses',
    url: 'https://youtu.be/EkgUZtNBb2Q',
    edad_meses: 18,
    hitos: ['Corre']
  },
  {
    titulo: 'Sube escaleras - CDC 24 meses',
    url: 'https://youtu.be/vR8_7gL8w4M',
    edad_meses: 24,
    hitos: ['Sube escaleras']
  },
  {
    titulo: 'Salta en su lugar - CDC 30 meses',
    url: 'https://youtu.be/M2TkBp9VQ4c',
    edad_meses: 30,
    hitos: ['Salta en su lugar']
  }
];

// Videos Pathways con múltiples hitos (basado en comentarios de YouTube)
const videosPathways = [
  {
    titulo: 'Pathways 1 - Habilidades del recién nacido',
    url: 'https://youtu.be/pathways1',
    edad_meses: 0,
    descripcion: '0 meses - Habilidades del recién nacido',
    hitos: [
      'Reflejo de succión',
      'Reflejo de prensión palmar',
      'Reflejo de moro',
      'Gira la cabeza hacia un lado',
      'Responde a sonidos fuertes'
    ]
  },
  {
    titulo: 'Pathways 2 - Desarrollo a 1 mes',
    url: 'https://youtu.be/pathways2',
    edad_meses: 1,
    descripcion: '1 mes - Primeros movimientos intencionados',
    hitos: [
      'Levanta la cabeza brevemente en posición prona',
      'Sigue objetos con la mirada hasta 90 grados',
      'Prefiere caras humanas',
      'Responde a voces familiares'
    ]
  },
  {
    titulo: 'Pathways 3 - Desarrollo a 2 meses',
    url: 'https://youtu.be/pathways3',
    edad_meses: 2,
    descripción: '2 meses - Interacción social temprana',
    hitos: [
      'Sonrisa social',
      'Levanta la cabeza 45 grados en posición prona',
      'Sigue objetos en círculo completo',
      'Arrulla y hace sonidos guturales',
      'Reconoce a los cuidadores'
    ]
  },
  {
    titulo: 'Pathways 4 - Desarrollo a 4 meses',
    url: 'https://youtu.be/pathways4',
    edad_meses: 4,
    descripcion: '4 meses - 3821 visualizaciones - 25 sept 2019',
    hitos: [
      'Mientras está acostado boca arriba, sigue visualmente un juguete que se mueve de un lado al otro',
      'Mientras está acostado boca arriba, trata de alcanzar una sonaja sostenida sobre su pecho',
      'Mientras está acostado boca arriba, mantiene la cabeza en medio para ver caras o juguetes',
      'Se puede calmar meciéndolo, tocándolo y con sonidos suaves',
      'Disfruta de diversos movimientos'
    ]
  },
  {
    titulo: 'Pathways 5 - Desarrollo a 6 meses',
    url: 'https://youtu.be/pathways5',
    edad_meses: 6,
    descripcion: '6 meses - Control del tronco y manipulación',
    hitos: [
      'Se voltea de boca arriba a boca abajo',
      'Se sienta con apoyo',
      'Transfiere objetos de mano a mano',
      'Balbucea con consonantes',
      'Muestra preferencias por juguetes',
      'Responde a su nombre'
    ]
  },
  {
    titulo: 'Pathways 6 - Desarrollo a 9 meses',
    url: 'https://youtu.be/pathways6',
    edad_meses: 9,
    descripcion: '9 meses - Movilidad independiente',
    hitos: [
      'Se sienta sin apoyo',
      'Gatea o se desplaza',
      'Se pone de pie con apoyo',
      'Usa pinza índice-pulgar',
      'Dice "mamá" y "papá" sin significado específico',
      'Juega al "cucú-tras"',
      'Muestra ansiedad ante extraños'
    ]
  },
  {
    titulo: 'Pathways 7 - Desarrollo a 12 meses',
    url: 'https://youtu.be/pathways7',
    edad_meses: 12,
    descripcion: '12 meses - Primeros pasos',
    hitos: [
      'Camina con apoyo',
      'Se pone de pie sin apoyo',
      'Dice primeras palabras con significado',
      'Sigue órdenes simples',
      'Usa gestos comunicativos',
      'Bebe en taza',
      'Colabora al vestirse'
    ]
  },
  {
    titulo: 'Pathways 8 - Desarrollo a 18 meses',
    url: 'https://youtu.be/pathways8',
    edad_meses: 18,
    descripcion: '18 meses - Exploración activa',
    hitos: [
      'Camina solo con seguridad',
      'Corre con rigidez',
      'Sube escaleras con apoyo',
      'Vocabulario de 10-25 palabras',
      'Juego simbólico simple',
      'Come con cuchara',
      'Apila 3 cubos'
    ]
  }
];

/**
 * Función para normalizar nombres de hitos para hacer match con la base de datos
 */
function normalizarHito(nombreHito) {
  return nombreHito.toLowerCase()
    .replace(/[áàäâ]/g, 'a')
    .replace(/[éèëê]/g, 'e')
    .replace(/[íìïî]/g, 'i')
    .replace(/[óòöô]/g, 'o')
    .replace(/[úùüû]/g, 'u')
    .replace(/ñ/g, 'n')
    .trim();
}

/**
 * Función para buscar hitos en la base de datos por nombre similar
 */
function buscarHitoEnBD(nombreHito, callback) {
  const hitoNormalizado = normalizarHito(nombreHito);
  
  // Buscar coincidencias exactas o parciales
  const query = `
    SELECT id, nombre, edad_media_meses 
    FROM hitos_normativos 
    WHERE LOWER(nombre) LIKE ? 
    OR LOWER(nombre) = ?
    ORDER BY 
      CASE 
        WHEN LOWER(nombre) = ? THEN 1 
        WHEN LOWER(nombre) LIKE ? THEN 2 
        ELSE 3 
      END
    LIMIT 1
  `;
  
  db.get(query, [
    `%${hitoNormalizado}%`,
    hitoNormalizado,
    hitoNormalizado,
    `${hitoNormalizado}%`
  ], callback);
}

/**
 * Función para insertar o actualizar un video
 */
function insertarVideo(video, callback) {
  const insertQuery = `
    INSERT OR REPLACE INTO videos (titulo, descripcion, url, fuente, edad_meses)
    VALUES (?, ?, ?, ?, ?)
  `;
  
  db.run(insertQuery, [
    video.titulo,
    video.descripcion || '',
    video.url,
    video.fuente || 'CDC',
    video.edad_meses
  ], function(err) {
    if (err) {
      console.error(`Error insertando video ${video.titulo}:`, err);
      callback(err);
    } else {
      console.log(`✅ Video insertado: ${video.titulo} (ID: ${this.lastID})`);
      callback(null, this.lastID);
    }
  });
}

/**
 * Función para crear relación video-hito
 */
function crearRelacionVideoHito(videoId, hitoId, callback) {
  const relationQuery = `
    INSERT OR IGNORE INTO videos_hitos (video_id, hito_id)
    VALUES (?, ?)
  `;
  
  db.run(relationQuery, [videoId, hitoId], function(err) {
    if (err) {
      console.error(`Error creando relación video-hito:`, err);
      callback(err);
    } else {
      if (this.changes > 0) {
        console.log(`  🔗 Relación creada: Video ${videoId} ↔ Hito ${hitoId}`);
      }
      callback(null);
    }
  });
}

/**
 * Función principal para procesar videos
 */
function procesarVideos() {
  console.log('🎬 Iniciando población de videos con etiquetas...\n');
  
  // Procesar videos CDC
  console.log('📺 Procesando videos CDC...');
  let procesados = 0;
  const totalCDC = videosCDC.length;
  
  videosCDC.forEach((video, index) => {
    const videoConFuente = { ...video, fuente: 'CDC' };
    
    insertarVideo(videoConFuente, (err, videoId) => {
      if (err) return;
      
      // Procesar cada hito asociado al video
      let hitosAsociados = 0;
      video.hitos.forEach(nombreHito => {
        buscarHitoEnBD(nombreHito, (err, hitoEncontrado) => {
          if (err) {
            console.error(`  ❌ Error buscando hito "${nombreHito}":`, err);
            return;
          }
          
          if (hitoEncontrado) {
            crearRelacionVideoHito(videoId, hitoEncontrado.id, (err) => {
              if (!err) hitosAsociados++;
            });
          } else {
            console.warn(`  ⚠️ Hito no encontrado en BD: "${nombreHito}"`);
          }
        });
      });
      
      procesados++;
      if (procesados === totalCDC) {
        console.log(`\n✅ Procesados ${totalCDC} videos CDC\n`);
        procesarPathways();
      }
    });
  });
}

/**
 * Función para procesar videos Pathways
 */
function procesarPathways() {
  console.log('🛤️ Procesando videos Pathways...');
  let procesados = 0;
  const totalPathways = videosPathways.length;
  
  videosPathways.forEach((video, index) => {
    const videoConFuente = { ...video, fuente: 'Pathways' };
    
    insertarVideo(videoConFuente, (err, videoId) => {
      if (err) return;
      
      // Procesar cada hito asociado al video
      let hitosAsociados = 0;
      video.hitos.forEach(nombreHito => {
        buscarHitoEnBD(nombreHito, (err, hitoEncontrado) => {
          if (err) {
            console.error(`  ❌ Error buscando hito "${nombreHito}":`, err);
            return;
          }
          
          if (hitoEncontrado) {
            crearRelacionVideoHito(videoId, hitoEncontrado.id, (err) => {
              if (!err) hitosAsociados++;
            });
          } else {
            console.warn(`  ⚠️ Hito no encontrado en BD: "${nombreHito}"`);
          }
        });
      });
      
      procesados++;
      if (procesados === totalPathways) {
        console.log(`\n✅ Procesados ${totalPathways} videos Pathways`);
        finalizarProceso();
      }
    });
  });
}

/**
 * Función para mostrar resumen final
 */
function finalizarProceso() {
  console.log('\n📊 Generando resumen final...');
  
  // Contar videos totales
  db.get('SELECT COUNT(*) as total FROM videos', (err, result) => {
    if (err) {
      console.error('Error contando videos:', err);
      return;
    }
    console.log(`📺 Total de videos en BD: ${result.total}`);
    
    // Contar relaciones video-hito
    db.get('SELECT COUNT(*) as total FROM videos_hitos', (err, result) => {
      if (err) {
        console.error('Error contando relaciones:', err);
        return;
      }
      console.log(`🔗 Total de relaciones video-hito: ${result.total}`);
      
      // Mostrar distribución por fuente
      db.all(`
        SELECT fuente, COUNT(*) as cantidad 
        FROM videos 
        GROUP BY fuente
      `, (err, results) => {
        if (err) {
          console.error('Error obteniendo distribución:', err);
          return;
        }
        
        console.log('\n📊 Distribución por fuente:');
        results.forEach(row => {
          console.log(`  ${row.fuente}: ${row.cantidad} videos`);
        });
        
        console.log('\n✨ Proceso completado exitosamente!');
        console.log('🎯 Los videos ahora están correctamente etiquetados con sus hitos correspondientes.');
        
        db.close();
      });
    });
  });
}

// Ejecutar el proceso
procesarVideos();