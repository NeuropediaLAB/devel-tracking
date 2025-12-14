const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'server', 'neurodesarrollo_dev.db');

console.log('🧹 Iniciando limpieza de datos inventados...');
console.log('📍 Ruta de la base de datos:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error conectando a la base de datos:', err.message);
    return;
  }
  console.log('✅ Conectado a la base de datos SQLite.');
});

async function limpiarDatosInventados() {
  try {
    // 1. Verificar qué fuentes normativas existen
    console.log('\n1. 📋 Verificando fuentes normativas existentes...');
    const fuentes = await new Promise((resolve, reject) => {
      db.all(`
        SELECT f.id, f.nombre, COUNT(h.id) as num_hitos 
        FROM fuentes_normativas f 
        LEFT JOIN hitos_normativos h ON f.id = h.fuente_normativa_id 
        GROUP BY f.id, f.nombre 
        ORDER BY f.nombre
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    console.log('📊 Fuentes normativas actuales:');
    fuentes.forEach(f => {
      console.log(`  - ${f.nombre}: ${f.num_hitos} hitos`);
    });

    // 2. Identificar fuentes con datos validados (reales)
    const fuentesValidadas = [
      'CDC - Centros para el Control y Prevención de Enfermedades',
      'OMS - Organización Mundial de la Salud'
    ];

    // 3. Marcar escalas en cuarentena (sin datos reales verificados)
    console.log('\n2. 🔒 Marcando escalas en cuarentena...');
    
    const fuentesBattelleBayley = fuentes.filter(f => 
      f.nombre.includes('Battelle') || f.nombre.includes('Bayley')
    );

    for (const fuente of fuentesBattelleBayley) {
      if (fuente.num_hitos > 0) {
        await new Promise((resolve, reject) => {
          db.run(`
            UPDATE hitos_normativos 
            SET nombre = '[CUARENTENA] ' || nombre,
                descripcion = COALESCE(descripcion, '') || ' - DATOS PENDIENTES DE VALIDACIÓN'
            WHERE fuente_normativa_id = ? 
            AND nombre NOT LIKE '[CUARENTENA]%'
          `, [fuente.id], (err) => {
            if (err) reject(err);
            else {
              console.log(`  ✅ ${fuente.nombre}: ${fuente.num_hitos} hitos marcados en cuarentena`);
              resolve();
            }
          });
        });
      }
    }

    // 4. Identificar otras fuentes no validadas (posibles datos inventados)
    const fuentesNoValidadas = fuentes.filter(f => 
      !fuentesValidadas.includes(f.nombre) && 
      !f.nombre.includes('Battelle') && 
      !f.nombre.includes('Bayley') &&
      f.num_hitos > 0
    );

    if (fuentesNoValidadas.length > 0) {
      console.log('\n3. ⚠️  Fuentes no validadas detectadas:');
      fuentesNoValidadas.forEach(f => {
        console.log(`  - ${f.nombre}: ${f.num_hitos} hitos (POSIBLES DATOS INVENTADOS)`);
      });

      // Marcar estas fuentes en cuarentena también
      for (const fuente of fuentesNoValidadas) {
        await new Promise((resolve, reject) => {
          db.run(`
            UPDATE hitos_normativos 
            SET nombre = '[CUARENTENA] ' || nombre,
                descripcion = COALESCE(descripcion, '') || ' - PENDIENTE VALIDACIÓN DE DATOS'
            WHERE fuente_normativa_id = ? 
            AND nombre NOT LIKE '[CUARENTENA]%'
          `, [fuente.id], (err) => {
            if (err) reject(err);
            else {
              console.log(`  🔒 ${fuente.nombre}: marcada en cuarentena`);
              resolve();
            }
          });
        });
      }
    }

    // 5. Verificar datos validados (CDC y OMS)
    console.log('\n4. ✅ Verificando datos validados...');
    for (const nombreFuente of fuentesValidadas) {
      const muestra = await new Promise((resolve, reject) => {
        db.all(`
          SELECT h.nombre, h.edad_media_meses, d.nombre as dominio
          FROM hitos_normativos h
          JOIN fuentes_normativas f ON h.fuente_normativa_id = f.id
          JOIN dominios d ON h.dominio_id = d.id
          WHERE f.nombre = ?
          ORDER BY h.edad_media_meses
          LIMIT 3
        `, [nombreFuente], (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });

      console.log(`  📈 ${nombreFuente}:`);
      muestra.forEach(h => {
        console.log(`    - ${h.edad_media_meses}m: ${h.nombre} (${h.dominio})`);
      });
    }

    // 6. Resumen final
    console.log('\n5. 📋 Generando resumen final...');
    const resumenFinal = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          f.nombre as fuente_normativa, 
          COUNT(*) as total,
          COUNT(CASE WHEN h.nombre LIKE '[CUARENTENA]%' THEN 1 END) as en_cuarentena,
          COUNT(CASE WHEN h.nombre NOT LIKE '[CUARENTENA]%' THEN 1 END) as validados
        FROM hitos_normativos h
        JOIN fuentes_normativas f ON h.fuente_normativa_id = f.id
        GROUP BY h.fuente_normativa_id, f.nombre
        ORDER BY f.nombre
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    console.log('\n📊 RESUMEN FINAL:');
    console.log('================');
    resumenFinal.forEach(row => {
      if (row.validados > 0 && row.en_cuarentena === 0) {
        console.log(`✅ ${row.fuente_normativa}: ${row.total} hitos (DATOS VALIDADOS)`);
      } else if (row.en_cuarentena > 0) {
        console.log(`🔒 ${row.fuente_normativa}: ${row.total} hitos (${row.en_cuarentena} en cuarentena, ${row.validados} validados)`);
      } else {
        console.log(`📝 ${row.fuente_normativa}: ${row.total} hitos`);
      }
    });

    // 7. Recomendaciones
    console.log('\n💡 RECOMENDACIONES:');
    console.log('==================');
    console.log('✅ CDC y OMS: Datos reales implementados y validados');
    if (fuentesBattelleBayley.some(f => f.num_hitos > 0)) {
      console.log('🔒 Battelle/Bayley: En cuarentena hasta obtener datos reales');
    }
    if (fuentesNoValidadas.length > 0) {
      console.log('⚠️  Otras fuentes: Requieren validación de datos');
    }
    console.log('📋 Solo utilizar datos validados para análisis clínicos');

  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
  } finally {
    db.close((err) => {
      if (err) {
        console.error('❌ Error cerrando la base de datos:', err.message);
      } else {
        console.log('✅ Conexión a base de datos cerrada.');
      }
    });
  }
}

// Ejecutar la limpieza
limpiarDatosInventados();