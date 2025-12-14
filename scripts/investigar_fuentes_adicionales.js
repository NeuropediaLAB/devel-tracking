/**
 * Script para investigar e implementar fuentes adicionales de datos de desarrollo infantil
 * Basado en:
 * - JAMA Network Open article (2790042)
 * - WHO GSED package v1.0-2023.1
 * - ASQ data
 * - Cohortes identificadas
 * - Datos normalizados de España y otros países
 */

console.log('🔍 INVESTIGACIÓN DE FUENTES ADICIONALES DE DATOS NORMATIVOS');
console.log('='.repeat(70));

// Fuentes identificadas para investigación
const fuentesAdicionales = {
  // WHO Global Scale for Early Development (GSED)
  WHO_GSED: {
    nombre: 'WHO Global Scale for Early Development',
    url: 'https://www.who.int/publications/i/item/WHO-MSD-GSED-package-v1.0-2023.1',
    descripcion: 'Escala global OMS para desarrollo temprano (0-36 meses)',
    poblacion: 'Global - múltiples países',
    instrumentos: ['GSED Short Form (SF)', 'GSED Long Form (LF)'],
    dominios: ['Motor Grueso', 'Motor Fino', 'Lenguaje', 'Cognitivo', 'Social-Emocional'],
    status: 'PÚBLICO - OMS',
    implementacion: 'PRIORITARIA',
    notas: 'Datos de validación de múltiples países, incluyendo LMICs'
  },

  // Ages & Stages Questionnaires
  ASQ: {
    nombre: 'Ages & Stages Questionnaires (ASQ-3)',
    url: 'https://agesandstages.com/',
    descripcion: 'Sistema de cribado del desarrollo más utilizado mundialmente',
    poblacion: 'Internacional - datos de múltiples países',
    instrumentos: ['ASQ-3', 'ASQ:SE-2'],
    dominios: ['Comunicación', 'Motor Grueso', 'Motor Fino', 'Resolución Problemas', 'Personal-Social'],
    status: 'COMERCIAL - Datos normativos parcialmente disponibles',
    implementacion: 'INVESTIGAR',
    notas: 'Buscar estudios de validación con datos públicos'
  },

  // España - Fuentes nacionales
  España: {
    nombre: 'Datos normativos España',
    fuentes: [
      {
        nombre: 'Agencia Española de Pediatría (AEP)',
        url: 'https://www.aeped.es/',
        descripcion: 'Guías y protocolos de desarrollo infantil',
        status: 'PÚBLICO'
      },
      {
        nombre: 'Instituto Nacional de Estadística (INE)',
        url: 'https://www.ine.es/',
        descripcion: 'Encuestas de salud y desarrollo infantil',
        status: 'PÚBLICO'
      },
      {
        nombre: 'Estudio longitudinal INMA',
        url: 'https://www.proyectoinma.org/',
        descripcion: 'Infancia y Medio Ambiente - cohorte española',
        poblacion: '32,000 madres-hijos',
        status: 'INVESTIGAR DATOS PÚBLICOS'
      }
    ]
  },

  // Estudios europeos identificados
  Europa: {
    nombre: 'Estudios de cohortes europeos',
    estudios: [
      {
        nombre: 'UK Millennium Cohort Study',
        pais: 'Reino Unido',
        poblacion: '19,000 niños',
        url: 'https://cls.ucl.ac.uk/cls-studies/millennium-cohort-study/',
        status: 'DATOS DISPONIBLES'
      },
      {
        nombre: 'Growing Up in Ireland',
        pais: 'Irlanda',
        poblacion: '11,000 niños',
        url: 'https://www.growingup.ie/',
        status: 'INVESTIGAR'
      },
      {
        nombre: 'Norwegian Mother and Child Cohort (MoBa)',
        pais: 'Noruega',
        poblacion: '114,000 niños',
        url: 'https://www.fhi.no/en/studies/moba/',
        status: 'DATOS DISPONIBLES'
      },
      {
        nombre: 'Danish National Birth Cohort',
        pais: 'Dinamarca',
        poblacion: '100,000 niños',
        url: 'https://www.ssi.dk/en/research/epidemiology/danish-national-birth-cohort',
        status: 'INVESTIGAR'
      }
    ]
  },

  // Otros estudios internacionales de JAMA
  JAMA_Studies: {
    nombre: 'Estudios identificados en JAMA Network Open',
    descripcion: 'Early Child Development and Later Academic Achievement',
    doi: '10.1001/jamanetworkopen.2022.7343',
    estudios_incluidos: [
      'Early Childhood Longitudinal Study (ECLS-K)',
      'National Institute of Child Health and Human Development (NICHD)',
      'Effective Pre-K for All (UPKB)',
      'Building Blocks'
    ],
    poblacion_total: '>50,000 niños',
    status: 'INVESTIGAR METADATOS'
  },

  // Latinoamérica
  Latinoamerica: {
    nombre: 'Estudios latinoamericanos',
    estudios: [
      {
        nombre: 'Young Lives Study',
        paises: ['Peru', 'Colombia'],
        poblacion: '12,000 niños',
        url: 'https://www.younglives.org.uk/',
        status: 'DATOS DISPONIBLES'
      },
      {
        nombre: 'Brazil Early Childhood Development',
        pais: 'Brasil',
        poblacion: '>10,000 niños',
        instrumentos: ['Bayley', 'ASQ'],
        status: 'INVESTIGAR'
      }
    ]
  }
};

console.log('📊 RESUMEN DE FUENTES IDENTIFICADAS:');
console.log('-'.repeat(50));

let totalFuentes = 0;
let fuentesPrioritarias = 0;

Object.entries(fuentesAdicionales).forEach(([categoria, datos]) => {
  console.log(`\n🏷️  ${categoria.toUpperCase()}`);
  
  if (datos.nombre) {
    totalFuentes++;
    console.log(`   📋 ${datos.nombre}`);
    if (datos.implementacion === 'PRIORITARIA') fuentesPrioritarias++;
    if (datos.poblacion) console.log(`   👥 Población: ${datos.poblacion}`);
    if (datos.status) console.log(`   🔓 Estado: ${datos.status}`);
  }
  
  if (datos.fuentes) {
    datos.fuentes.forEach(fuente => {
      totalFuentes++;
      console.log(`   📋 ${fuente.nombre}`);
      console.log(`   🔓 Estado: ${fuente.status}`);
    });
  }
  
  if (datos.estudios) {
    datos.estudios.forEach(estudio => {
      totalFuentes++;
      console.log(`   📋 ${estudio.nombre} (${estudio.pais || 'Múltiples países'})`);
      if (estudio.poblacion) console.log(`   👥 Población: ${estudio.poblacion}`);
      console.log(`   🔓 Estado: ${estudio.status}`);
    });
  }
  
  if (datos.estudios_incluidos) {
    totalFuentes += datos.estudios_incluidos.length;
    console.log(`   📋 Incluye ${datos.estudios_incluidos.length} estudios`);
    console.log(`   👥 Población total: ${datos.poblacion_total}`);
  }
});

console.log(`\n📈 ESTADÍSTICAS:`);
console.log(`   Total fuentes identificadas: ${totalFuentes}`);
console.log(`   Fuentes prioritarias: ${fuentesPrioritarias}`);

// Plan de implementación recomendado
console.log('\n🎯 PLAN DE IMPLEMENTACIÓN RECOMENDADO:');
console.log('='.repeat(50));

const planImplementacion = {
  fase1_inmediata: [
    'WHO GSED - Datos OMS públicos disponibles',
    'Buscar estudios ASQ con datos normativos abiertos',
    'Investigar UK Millennium Cohort - datos disponibles'
  ],
  
  fase2_corto_plazo: [
    'España: Contactar AEP y proyecto INMA',
    'Young Lives Study - datos latinoamericanos',
    'Norwegian MoBa - grandes cohortes europeas'
  ],
  
  fase3_medio_plazo: [
    'Metaanálisis JAMA - extraer datos estandarizados',
    'Cohortes danesas y irlandesas',
    'Estudios brasileños de desarrollo'
  ]
};

Object.entries(planImplementacion).forEach(([fase, acciones]) => {
  console.log(`\n${fase.toUpperCase().replace('_', ' - ')}:`);
  acciones.forEach(accion => {
    console.log(`  ✅ ${accion}`);
  });
});

// Criterios de selección
console.log('\n📋 CRITERIOS DE SELECCIÓN DE FUENTES:');
console.log('-'.repeat(40));
const criterios = [
  '✅ Acceso público o datos abiertos disponibles',
  '✅ Población >1,000 niños para validez estadística', 
  '✅ Rango de edad 0-72 meses (mínimo 0-36 meses)',
  '✅ Múltiples dominios del desarrollo evaluados',
  '✅ Metodología estandarizada y validada',
  '✅ Diversidad geográfica y cultural',
  '✅ Datos longitudinales cuando sea posible'
];

criterios.forEach(criterio => console.log(`  ${criterio}`));

console.log('\n🎯 SIGUIENTE PASO:');
console.log('Crear scripts de extracción para fuentes prioritarias identificadas');
console.log('Comenzar con WHO GSED como fuente de mayor impacto y accesibilidad');

console.log('\n' + '='.repeat(70));
console.log('INVESTIGACIÓN COMPLETADA - Ver plan de implementación arriba');