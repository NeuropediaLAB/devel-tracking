const fs = require('fs');
const https = require('https');
const { exec } = require('child_process');

// URLs de documentación de los datasets de d-score
const datasets = [
  { name: 'Chile', file: 'gcdg_chl_1', ages: '0.5-1.75 años', records: 2139 },
  { name: 'China', file: 'gcdg_chn', ages: '0-8 años', records: 990 },
  { name: 'Colombia <42m', file: 'gcdg_col_lt42m', ages: '0-42 meses', records: 1311 },
  { name: 'Colombia <45m', file: 'gcdg_col_lt45m', ages: '0-45 meses', records: 1335 },
  { name: 'Ecuador', file: 'gcdg_ecu', ages: '0-5 años', records: 667 }
];

// Función para descargar y procesar un archivo de documentación
function processDatasetDoc(dataset) {
  return new Promise((resolve, reject) => {
    const url = `https://raw.githubusercontent.com/D-score/childdevdata/master/man/${dataset.file}.Rd`;
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const milestones = extractMilestones(data, dataset);
          resolve({ dataset: dataset.name, milestones });
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Función para extraer hitos de la documentación
function extractMilestones(content, dataset) {
  const milestones = [];
  
  // Regex para encontrar líneas de hitos: \code{codigo} \tab 0/1 \tab descripcion
  const milestoneRegex = /\\code\{([^}]+)\}\s*\\tab\s+0\/1\s+\\tab\s+([^\\]+)/g;
  
  let match;
  while ((match = milestoneRegex.exec(content)) !== null) {
    const code = match[1].trim();
    const description = match[2].trim();
    
    // Intentar extraer información del código
    const milestoneInfo = decodeMilestoneCode(code);
    
    milestones.push({
      code: code,
      descripcion: description,
      fuente_normativa: `GCDG - ${dataset.name}`,
      area: milestoneInfo.area || 'No especificada',
      edad_estimada: milestoneInfo.edad || 12, // edad por defecto en meses
      notas: `Dataset: ${dataset.file}, Registros: ${dataset.records}, Rango edad: ${dataset.ages}`
    });
  }
  
  return milestones;
}

// Función para decodificar códigos de hitos y extraer información
function decodeMilestoneCode(code) {
  const info = { area: 'No especificada', edad: 12 };
  
  // Patrones comunes en códigos de hitos
  const patterns = {
    // Bayley (by1) patterns
    'by1mdd': { area: 'Motor Fino', edad_base: 6 },
    'by1cgd': { area: 'Cognitivo', edad_base: 6 },
    'by1lgd': { area: 'Lenguaje Expresivo', edad_base: 6 },
    'by1pdd': { area: 'Social-Emocional', edad_base: 6 },
    
    // Ages & Stages (aqi) patterns
    'aqicmc': { area: 'Lenguaje Receptivo', edad_base: 12 },
    'aqigmc': { area: 'Motor Grueso', edad_base: 12 },
    'aqifmc': { area: 'Motor Fino', edad_base: 12 },
    'aqiprb': { area: 'Cognitivo', edad_base: 12 },
    'aqipse': { area: 'Social-Emocional', edad_base: 12 },
    
    // Denver (ddi) patterns  
    'ddigmd': { area: 'Motor Grueso', edad_base: 12 },
    'ddifmd': { area: 'Motor Fino', edad_base: 12 },
    'ddilgd': { area: 'Lenguaje Expresivo', edad_base: 12 },
    'ddirgd': { area: 'Lenguaje Receptivo', edad_base: 12 },
    'ddipse': { area: 'Social-Emocional', edad_base: 12 }
  };
  
  // Buscar patrón en el código
  for (const [pattern, data] of Object.entries(patterns)) {
    if (code.toLowerCase().includes(pattern)) {
      info.area = data.area;
      info.edad = data.edad_base;
      
      // Intentar extraer número del código para ajustar edad
      const numMatch = code.match(/(\d+)$/);
      if (numMatch) {
        const num = parseInt(numMatch[1]);
        if (num < 100) { // Probablemente meses
          info.edad = num;
        }
      }
      break;
    }
  }
  
  return info;
}

// Función principal
async function extractDScoreMilestones() {
  console.log('🔍 Extrayendo hitos de D-score.org...');
  const allMilestones = [];
  
  try {
    for (const dataset of datasets) {
      console.log(`📊 Procesando dataset: ${dataset.name}...`);
      const result = await processDatasetDoc(dataset);
      console.log(`✅ ${result.milestones.length} hitos extraídos de ${result.dataset}`);
      allMilestones.push(...result.milestones);
    }
    
    // Guardar resultados
    const outputPath = './scripts/hitos_dscore_extracted.json';
    fs.writeFileSync(outputPath, JSON.stringify(allMilestones, null, 2));
    
    // Generar resumen
    const summary = generateSummary(allMilestones);
    console.log('\n📋 RESUMEN DE EXTRACCIÓN:');
    console.log(`Total hitos extraídos: ${allMilestones.length}`);
    console.log('Por área:');
    Object.entries(summary.byArea).forEach(([area, count]) => {
      console.log(`  - ${area}: ${count} hitos`);
    });
    console.log('Por fuente:');
    Object.entries(summary.bySource).forEach(([source, count]) => {
      console.log(`  - ${source}: ${count} hitos`);
    });
    
    console.log(`\n💾 Archivo guardado: ${outputPath}`);
    
  } catch (error) {
    console.error('❌ Error durante la extracción:', error.message);
  }
}

// Función para generar resumen estadístico
function generateSummary(milestones) {
  const byArea = {};
  const bySource = {};
  
  milestones.forEach(milestone => {
    // Contar por área
    const area = milestone.area;
    byArea[area] = (byArea[area] || 0) + 1;
    
    // Contar por fuente
    const source = milestone.fuente_normativa;
    bySource[source] = (bySource[source] || 0) + 1;
  });
  
  return { byArea, bySource };
}

// Ejecutar si se llama directamente
if (require.main === module) {
  extractDScoreMilestones();
}

module.exports = {
  extractDScoreMilestones,
  processDatasetDoc,
  extractMilestones,
  decodeMilestoneCode
};