/**
 * Script para mejorar las asociaciones hito-video usando sinónimos y palabras clave
 * Busca patrones en nombres de hitos para hacer mejores asociaciones
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'neurodesarrollo_dev_new.db');
const db = new sqlite3.Database(dbPath);

// Mapeo de sinónimos y variaciones para mejorar las asociaciones
const sinonimosHitos = {
  // Control cefálico
  'control cefalico': ['levanta la cabeza', 'cabeza', 'cefalico', 'control cefálico'],
  'levanta cabeza': ['control cefalico', 'cabeza', 'levanta la cabeza'],
  
  // Sonrisa y respuesta social
  'sonrisa': ['sonrie', 'sonrisa social'],
  'sonrisa social': ['sonrie', 'sonrisa'],
  
  // Seguimiento visual
  'sigue objetos': ['seguir', 'sigue', 'seguimiento', 'mirada', 'visual'],
  'seguimiento visual': ['sigue objetos', 'mirada', 'visual'],
  'mirada': ['sigue objetos', 'visual', 'seguimiento'],
  
  // Alcanzar y agarrar
  'alcanza': ['alcanzar', 'agarra', 'prensión', 'toma'],
  'agarra': ['alcanza', 'prensión', 'toma', 'alcanzar'],
  'prension': ['agarra', 'alcanza', 'toma'],
  
  // Comunicación
  'balbucea': ['balbuceo', 'vocaliza', 'sonidos', 'arrulla'],
  'vocaliza': ['balbucea', 'sonidos', 'arrulla'],
  'gorjea': ['balbucea', 'vocaliza', 'arrulla'],
  'arrulla': ['balbucea', 'vocaliza', 'gorjea'],
  
  // Motor grueso
  'voltea': ['gira', 'rueda', 'voltear'],
  'gira': ['voltea', 'rueda', 'voltear'],
  'sienta': ['sedestacion', 'sentarse', 'posicion sentado'],
  'gatea': ['gatear', 'cuadrúpedo', 'desplaza'],
  'camina': ['marcha', 'deambula', 'caminar'],
  'corre': ['correr', 'trotar'],
  'salta': ['saltar', 'brincar'],
  'sube': ['subir', 'escalar'],
  
  // Lenguaje
  'palabra': ['palabras', 'habla', 'dice', 'verbal'],
  'dice': ['palabra', 'habla', 'verbal'],
  'habla': ['palabra', 'dice', 'verbal'],
  
  // Otros
  'responde': ['reacciona', 'respuesta'],
  'nombre': ['responde al nombre', 'reconoce nombre']
};

/**
 * Función para normalizar texto
 */
function normalizar(texto) {
  return texto.toLowerCase()
    .replace(/[áàäâ]/g, 'a')
    .replace(/[éèëê]/g, 'e')
    .replace(/[íìïî]/g, 'i')
    .replace(/[óòöô]/g, 'o')
    .replace(/[úùüû]/g, 'u')
    .replace(/ñ/g, 'n')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Función para obtener todas las variaciones de un hito
 */
function obtenerVariaciones(nombreHito) {
  const normalizado = normalizar(nombreHito);
  const palabras = normalizado.split(' ');
  let variaciones = [normalizado];
  
  // Buscar sinónimos para cada palabra
  palabras.forEach(palabra => {
    if (sinonimosHitos[palabra]) {
      sinonimosHitos[palabra].forEach(sinonimo => {
        variaciones.push(sinonimo);
        // También agregar con el resto de palabras
        const nuevaVariacion = normalizado.replace(palabra, sinonimo);
        variaciones.push(nuevaVariacion);
      });
    }
  });
  
  return [...new Set(variaciones)]; // Eliminar duplicados
}

/**
 * Función para buscar hitos por múltiples criterios
 */
function buscarHitosPorCriterios(criterios, callback) {
  // Construir consulta dinámica
  const condiciones = criterios.map(() => 'LOWER(hn.nombre) LIKE ?').join(' OR ');
  const parametros = criterios.map(c => `%${c}%`);
  
  const query = `
    SELECT hn.id, hn.nombre, hn.edad_media_meses, d.nombre as dominio_nombre
    FROM hitos_normativos hn
    JOIN dominios d ON hn.dominio_id = d.id
    WHERE (${condiciones})
    ORDER BY hn.edad_media_meses
  `;
  
  db.all(query, parametros, callback);
}

/**
 * Función para crear asociación video-hito si no existe
 */
function crearAsociacionSiNoExiste(videoId, hitoId, callback) {
  // Verificar si ya existe
  db.get(
    'SELECT id FROM videos_hitos WHERE video_id = ? AND hito_id = ?',
    [videoId, hitoId],
    (err, row) => {
      if (err) return callback(err);
      if (row) return callback(null, false); // Ya existe
      
      // Crear nueva asociación
      db.run(
        'INSERT INTO videos_hitos (video_id, hito_id) VALUES (?, ?)',
        [videoId, hitoId],
        function(err) {
          if (err) return callback(err);
          callback(null, true); // Creada nueva
        }
      );
    }
  );
}

/**
 * Función principal para procesar asociaciones inteligentes
 */
function procesarAsociacionesInteligentes() {
  console.log('🧠 Iniciando asociaciones inteligentes...\n');
  
  // Obtener todos los videos
  db.all('SELECT * FROM videos ORDER BY id', (err, videos) => {
    if (err) {
      console.error('Error obteniendo videos:', err);
      return;
    }
    
    console.log(`📺 Procesando ${videos.length} videos...\n`);
    let procesados = 0;
    let nuevasAsociaciones = 0;
    
    videos.forEach(video => {
      const nombreVideo = normalizar(video.titulo);
      const palabrasVideo = nombreVideo.split(' ');
      
      // Generar criterios de búsqueda basados en el título del video
      let criterios = [];
      
      // Agregar palabras clave del título
      palabrasVideo.forEach(palabra => {
        if (palabra.length > 3 && !['video', 'cdc', 'pathways', 'meses'].includes(palabra)) {
          criterios.push(palabra);
          
          // Agregar sinónimos si existen
          if (sinonimosHitos[palabra]) {
            criterios = criterios.concat(sinonimosHitos[palabra]);
          }
        }
      });
      
      // Si es un video de Pathways, agregar criterios basados en la edad
      if (video.fuente === 'Pathways' && video.edad_meses) {
        // Buscar hitos cercanos en edad
        const edadMin = video.edad_meses - 1;
        const edadMax = video.edad_meses + 1;
        
        db.all(
          'SELECT id, nombre FROM hitos_normativos WHERE edad_media_meses BETWEEN ? AND ? ORDER BY edad_media_meses',
          [edadMin, edadMax],
          (err, hitosEdad) => {
            if (err) return;
            
            hitosEdad.forEach(hito => {
              crearAsociacionSiNoExiste(video.id, hito.id, (err, nueva) => {
                if (!err && nueva) {
                  console.log(`  🔗 Nueva asociación por edad: Video "${video.titulo}" ↔ Hito "${hito.nombre}"`);
                  nuevasAsociaciones++;
                }
              });
            });
          }
        );
      }
      
      if (criterios.length > 0) {
        // Eliminar duplicados
        criterios = [...new Set(criterios)];
        
        buscarHitosPorCriterios(criterios, (err, hitos) => {
          if (err) {
            console.error(`Error buscando hitos para video "${video.titulo}":`, err);
            return;
          }
          
          if (hitos.length > 0) {
            console.log(`🔍 Video "${video.titulo}" - encontrados ${hitos.length} hitos candidatos`);
            
            hitos.forEach(hito => {
              // Calcular puntuación de similitud
              let puntuacion = 0;
              const nombreHito = normalizar(hito.nombre);
              
              criterios.forEach(criterio => {
                if (nombreHito.includes(criterio)) {
                  puntuacion += criterio.length; // Palabras más largas tienen más peso
                }
              });
              
              // Solo crear asociación si hay similitud suficiente
              if (puntuacion >= 4) {
                crearAsociacionSiNoExiste(video.id, hito.id, (err, nueva) => {
                  if (!err && nueva) {
                    console.log(`  ✅ Nueva asociación: Video "${video.titulo}" ↔ Hito "${hito.nombre}" (puntuación: ${puntuacion})`);
                    nuevasAsociaciones++;
                  }
                });
              }
            });
          }
          
          procesados++;
          if (procesados === videos.length) {
            finalizarProceso(nuevasAsociaciones);
          }
        });
      } else {
        procesados++;
        if (procesados === videos.length) {
          finalizarProceso(nuevasAsociaciones);
        }
      }
    });
  });
}

/**
 * Función para mostrar estadísticas finales
 */
function finalizarProceso(nuevasAsociaciones) {
  console.log('\n📊 Generando estadísticas finales...');
  
  // Contar total de asociaciones
  db.get('SELECT COUNT(*) as total FROM videos_hitos', (err, result) => {
    if (err) {
      console.error('Error contando asociaciones:', err);
      return;
    }
    
    console.log(`\n✨ Proceso completado!`);
    console.log(`🆕 Nuevas asociaciones creadas: ${nuevasAsociaciones}`);
    console.log(`🔗 Total de asociaciones en la BD: ${result.total}`);
    
    // Mostrar distribución de videos con hitos asociados
    db.all(`
      SELECT v.fuente, COUNT(DISTINCT v.id) as videos_con_hitos
      FROM videos v
      JOIN videos_hitos vh ON v.id = vh.video_id
      GROUP BY v.fuente
    `, (err, stats) => {
      if (err) return;
      
      console.log('\n📈 Videos con hitos asociados por fuente:');
      stats.forEach(stat => {
        console.log(`  ${stat.fuente}: ${stat.videos_con_hitos} videos`);
      });
      
      // Mostrar ejemplos de hitos con múltiples videos
      db.all(`
        SELECT h.nombre, h.edad_media_meses, COUNT(vh.video_id) as num_videos
        FROM hitos_normativos h
        JOIN videos_hitos vh ON h.id = vh.hito_id
        GROUP BY h.id
        HAVING num_videos > 1
        ORDER BY num_videos DESC, h.edad_media_meses
        LIMIT 5
      `, (err, ejemplos) => {
        if (err) return;
        
        if (ejemplos.length > 0) {
          console.log('\n🎯 Hitos con múltiples videos (top 5):');
          ejemplos.forEach(ej => {
            console.log(`  "${ej.nombre}" (${ej.edad_media_meses}m): ${ej.num_videos} videos`);
          });
        }
        
        db.close();
      });
    });
  });
}

// Ejecutar el proceso
procesarAsociacionesInteligentes();