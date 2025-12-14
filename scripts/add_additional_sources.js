const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

console.log('🌍 AGREGANDO FUENTES ADICIONALES A LA BASE DE DATOS');
console.log('='.repeat(65));

const dbPath = path.join(__dirname, '..', 'server', 'neurodesarrollo_dev_new.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error conectando a la base de datos:', err.message);
    return;
  }
  console.log('Conectado a la base de datos SQLite.');
});

// Mapeo de dominios a IDs
const dominioMapping = {
  'Motor Grueso': 1,
  'Motor Fino': 2,
  'Lenguaje Receptivo': 3,
  'Lenguaje Expresivo': 4,
  'Social-Emocional': 5,
  'Cognitivo': 6,
  'Adaptativo': 7,
  'Comunicación': 3, // Mapear a Lenguaje Receptivo por defecto
  'Personal-Social': 5, // Mapear a Social-Emocional
  'Resolución de Problemas': 6 // Mapear a Cognitivo
};

// Leer datos de las fuentes extraídas
const asqData = JSON.parse(fs.readFileSync(path.join(__dirname, 'hitos_asq3_extracted.json'), 'utf8'));
const ukMcsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'hitos_uk_mcs_extracted.json'), 'utf8'));

async function addAdditionalSources() {
  try {
    console.log('📋 FASE 1: AGREGANDO FUENTE ASQ-3');
    console.log('-'.repeat(40));
    
    // 1. Agregar fuente ASQ-3
    await addSource(
      'ASQ-3 Validation Studies',
      'Squires, J., & Bricker, D. (2009). Ages & Stages Questionnaires, Third Edition. Multiple international validation studies: Turkey (n=1,832), Brazil (n=1,676), Korea (n=2,254), Spain (n=1,567), Norway (n=2,987).',
      'Ages & Stages Questionnaires, Third Edition (ASQ-3) - Items representativos de estudios de validación internacional. ASQ-3 es el sistema de cribado del desarrollo más utilizado mundialmente, validado en más de 60 países. Los items seleccionados representan hitos clave de cada dominio con alta sensibilidad y especificidad demostrada.',
      2009,
      `10,316 niños de estudios de validación en 5 países: Turquía, Brasil, Corea, España, Noruega. Sensibilidad promedio: 81%, Especificidad promedio: 83%`,
      asqData.hitos
    );

    console.log('📋 FASE 2: AGREGANDO FUENTE UK MILLENNIUM COHORT');
    console.log('-'.repeat(40));
    
    // 2. Agregar fuente UK MCS
    await addSource(
      'UK Millennium Cohort Study',
      'Connelly, R., & Platt, L. (2014). Cohort profile: UK Millennium Cohort Study. International Journal of Epidemiology. Hansen, K., et al. (2012). Millennium Cohort Study Technical Reports.',
      'UK Millennium Cohort Study (MCS) - Estudio longitudinal del Reino Unido siguiendo a 19,244 niños desde el nacimiento. Items representativos extraídos de evaluaciones directas a los 9 meses, 3 años y 5 años usando instrumentos como Bracken School Readiness, Naming Vocabulary, British Ability Scales y Strengths & Difficulties Questionnaire.',
      2001,
      `19,244 niños del Reino Unido (Inglaterra, Escocia, Gales, Irlanda del Norte). Muestra nacionalmente representativa con sobremuestreo de familias en pobreza y minorías étnicas. Datos disponibles via UK Data Service.`,
      ukMcsData.hitos
    );

    // 3. Generar resumen final
    console.log('📊 FASE 3: GENERANDO RESUMEN FINAL');
    console.log('-'.repeat(40));
    await generateFinalSummary();

  } catch (error) {
    console.error('❌ Error durante el proceso:', error);
  } finally {
    db.close((err) => {
      if (err) {
        console.error('Error cerrando la base de datos:', err.message);
      } else {
        console.log('\n🔒 Conexión a base de datos cerrada.');
      }
    });
  }
}

async function addSource(nombreFuente, referencia, descripcion, año, poblacion, hitos) {
  console.log(`Agregando fuente: ${nombreFuente}...`);
  
  // Agregar fuente normativa
  const fuenteId = await new Promise((resolve, reject) => {
    const insertFuenteQuery = `
      INSERT OR IGNORE INTO fuentes_normativas (
        nombre, referencia_bibliografica, descripcion, año, 
        poblacion, activa
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    db.run(insertFuenteQuery, [nombreFuente, referencia, descripcion, año, poblacion, 1], function(err) {
      if (err) {
        reject(err);
      } else {
        // Obtener el ID
        db.get('SELECT id FROM fuentes_normativas WHERE nombre = ?', [nombreFuente], (err, row) => {
          if (err) reject(err);
          else resolve(row ? row.id : this.lastID);
        });
      }
    });
  });

  console.log(`✅ Fuente ${nombreFuente} agregada con ID: ${fuenteId}`);

  // Agregar hitos
  let insertados = 0;
  let errores = 0;

  for (const hito of hitos) {
    await new Promise((resolve) => {
      const dominioId = dominioMapping[hito.area];
      
      if (!dominioId) {
        console.warn(`Dominio no mapeado: ${hito.area}`);
        resolve();
        return;
      }

      const insertQuery = `
        INSERT OR IGNORE INTO hitos_normativos (
          dominio_id, nombre, descripcion, edad_media_meses, 
          desviacion_estandar, fuente_normativa_id,
          video_url_cdc, video_url_pathways
        ) VALUES (?, ?, ?, ?, ?, ?, NULL, NULL)
      `;
      
      const nombreUnico = `${hito.descripcion} [${hito.code || 'NO_CODE'}]`;
      const descripcionCompleta = hito.notas || hito.descripcion;
      
      db.run(insertQuery, [
        dominioId,
        nombreUnico.substring(0, 255), // Limitar longitud
        descripcionCompleta.substring(0, 500), // Limitar longitud
        hito.edad_esperada,
        2.0, // desviación estándar por defecto
        fuenteId
      ], (err) => {
        if (err) {
          console.error(`Error insertando hito ${hito.code}:`, err.message);
          errores++;
        } else {
          insertados++;
        }
        resolve();
      });
    });
  }

  console.log(`📊 ${nombreFuente}: ${insertados} hitos insertados, ${errores} errores\n`);
}

async function generateFinalSummary() {
  // Resumen general actualizado
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
        reject(err);
      } else {
        console.log('=== RESUMEN FINAL ACTUALIZADO ===');
        let totalGeneral = 0;
        let fuentesReales = 0;
        let fuentesCuarentena = 0;

        rows.forEach(row => {
          let status = '(DATOS REALES)';
          if (row.fuente_normativa.includes('Battelle') || row.fuente_normativa.includes('Bayley')) {
            status = '(EN CUARENTENA)';
            fuentesCuarentena++;
          } else {
            fuentesReales++;
          }
          console.log(`${row.fuente_normativa}: ${row.total} hitos ${status}`);
          totalGeneral += row.total;
        });
        
        console.log(`\n🎯 ESTADÍSTICAS FINALES:`);
        console.log(`   Total de hitos: ${totalGeneral}`);
        console.log(`   Fuentes con datos reales: ${fuentesReales}`);
        console.log(`   Fuentes en cuarentena: ${fuentesCuarentena}`);
        console.log(`   Porcentaje datos reales: ${Math.round((fuentesReales / (fuentesReales + fuentesCuarentena)) * 100)}%`);
        
        resolve();
      }
    });
  });

  // Resumen por dominios
  await new Promise((resolve, reject) => {
    const dominioQuery = `
      SELECT d.nombre as dominio_nombre, COUNT(*) as total
      FROM hitos_normativos h
      JOIN dominios d ON h.dominio_id = d.id
      JOIN fuentes_normativas f ON h.fuente_normativa_id = f.id
      WHERE f.nombre NOT LIKE '%Battelle%' AND f.nombre NOT LIKE '%Bayley%'
      GROUP BY h.dominio_id, d.nombre
      ORDER BY total DESC
    `;
    
    db.all(dominioQuery, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        console.log('\n📊 HITOS REALES POR DOMINIO:');
        rows.forEach(row => {
          console.log(`   ${row.dominio_nombre}: ${row.total} hitos`);
        });
        resolve();
      }
    });
  });

  // Últimas fuentes agregadas
  await new Promise((resolve, reject) => {
    const recentQuery = `
      SELECT nombre, poblacion 
      FROM fuentes_normativas 
      WHERE nombre IN ('ASQ-3 Validation Studies', 'UK Millennium Cohort Study', 'WHO GSED v1.0-2023.1')
    `;
    
    db.all(recentQuery, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        console.log('\n🆕 NUEVAS FUENTES AGREGADAS HOY:');
        rows.forEach(row => {
          console.log(`   ✅ ${row.nombre}`);
          console.log(`      Población: ${row.poblacion}`);
        });
        resolve();
      }
    });
  });
}

// Ejecutar si se llama directamente
if (require.main === module) {
  addAdditionalSources();
}

module.exports = { addAdditionalSources };