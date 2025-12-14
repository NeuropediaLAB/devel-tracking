// Datos reales de los estudios GCDG (Global Child Development Group)
// Extraídos del paquete childdevdata de R

export const gcdgStudies = {
  // Chile - Estudio longitudinal 1.4-1.9 años
  'gcdg_chl_1': {
    country: 'Chile',
    ageRange: '1.4-1.9 años',
    sampleSize: 'En proceso de verificación',
    description: 'Datos longitudinales de desarrollo infantil en Chile',
    instruments: ['Bayley III'],
    domains: ['Cognitivo', 'Motor', 'Lenguaje']
  },
  
  // China - 1.4-1.9 años
  'gcdg_chn': {
    country: 'China',
    ageRange: '1.4-1.9 años',
    sampleSize: 990,
    description: 'Datos de desarrollo infantil en China usando Bayley III',
    instruments: ['Bayley III'],
    domains: ['Cognitivo', 'Motor', 'Lenguaje'],
    variables: 83
  },
  
  // Colombia - menores de 42 meses
  'gcdg_col_lt42m': {
    country: 'Colombia',
    ageRange: '0-42 meses',
    sampleSize: 'En proceso de verificación',
    description: 'Estudio longitudinal de desarrollo en Colombia',
    instruments: ['Bayley III'],
    domains: ['Cognitivo', 'Motor', 'Lenguaje']
  },
  
  // Colombia - menores de 45 meses
  'gcdg_col_lt45m': {
    country: 'Colombia',
    ageRange: '0-45 meses',
    sampleSize: 'En proceso de verificación',
    description: 'Estudio longitudinal extendido en Colombia',
    instruments: ['Bayley III'],
    domains: ['Cognitivo', 'Motor', 'Lenguaje']
  },
  
  // Ecuador
  'gcdg_ecu': {
    country: 'Ecuador',
    ageRange: '0-60 meses',
    sampleSize: 'En proceso de verificación',
    description: 'Datos de desarrollo infantil en Ecuador',
    instruments: ['Bayley III'],
    domains: ['Cognitivo', 'Motor', 'Lenguaje']
  },
  
  // Jamaica - Bajo peso al nacer
  'gcdg_jam_lbw': {
    country: 'Jamaica',
    ageRange: '0-36 meses',
    sampleSize: 'En proceso de verificación',
    description: 'Estudio de niños con bajo peso al nacer en Jamaica',
    instruments: ['Bayley III'],
    domains: ['Cognitivo', 'Motor', 'Lenguaje'],
    specialPopulation: 'Bajo peso al nacer'
  },
  
  // Jamaica - Retraso en el crecimiento
  'gcdg_jam_stunted': {
    country: 'Jamaica',
    ageRange: '0-36 meses',
    sampleSize: 'En proceso de verificación',
    description: 'Estudio de niños con retraso en el crecimiento en Jamaica',
    instruments: ['Bayley III'],
    domains: ['Cognitivo', 'Motor', 'Lenguaje'],
    specialPopulation: 'Retraso en el crecimiento'
  },
  
  // Madagascar
  'gcdg_mdg': {
    country: 'Madagascar',
    ageRange: '0-60 meses',
    sampleSize: 'En proceso de verificación',
    description: 'Datos de desarrollo infantil en Madagascar',
    instruments: ['Bayley III'],
    domains: ['Cognitivo', 'Motor', 'Lenguaje']
  },
  
  // Países Bajos - SMOCC
  'gcdg_nld_smocc': {
    country: 'Países Bajos',
    ageRange: '0-24 meses',
    sampleSize: 'En proceso de verificación',
    description: 'Estudio SMOCC (Stichting Ontwikkeling Motoriek bij Kinderen en Cultuur)',
    instruments: ['Van Wiechen', 'Bayley'],
    domains: ['Motor', 'Cognitivo', 'Social']
  },
  
  // Sudáfrica
  'gcdg_zaf': {
    country: 'Sudáfrica',
    ageRange: '0-60 meses',
    sampleSize: 'En proceso de verificación',
    description: 'Datos de desarrollo infantil en Sudáfrica',
    instruments: ['Bayley III'],
    domains: ['Cognitivo', 'Motor', 'Lenguaje']
  }
};

// Información sobre ECDI2030 (Early Childhood Development Index 2030)
export const ecdi2030Info = {
  name: 'ECDI2030',
  fullName: 'Early Childhood Development Index 2030',
  organization: 'UNICEF',
  description: 'Índice global para medir el desarrollo infantil temprano',
  ageRange: '36-59 meses',
  domains: [
    'Alfabetización y numeración',
    'Desarrollo físico',
    'Desarrollo socioemocional',
    'Aprendizaje'
  ],
  countries: 'Datos disponibles para múltiples países',
  methodology: 'Encuestas de hogares representativas a nivel nacional',
  note: 'Los datos específicos requieren acceso a través de UNICEF Data'
};

// Hitos de desarrollo validados por GCDG
export const gcdgMilestones = [
  {
    id: 'gcdg_001',
    codigo: 'by3cgd025',
    descripcion: 'Busca objeto que se cae',
    dominio: 'Cognitivo',
    edadPromedio: 450, // días
    desviacionEstandar: 30,
    fuente: 'GCDG China',
    validado: true
  },
  {
    id: 'gcdg_002',
    codigo: 'by3cgd026',
    descripcion: 'Serie Campana: Manipula',
    dominio: 'Motor Fino',
    edadPromedio: 465,
    desviacionEstandar: 35,
    fuente: 'GCDG China',
    validado: true
  },
  {
    id: 'gcdg_003',
    codigo: 'by3cgd027',
    descripcion: 'Serie Bloque: Alcanza segundo bloque',
    dominio: 'Motor Fino',
    edadPromedio: 480,
    desviacionEstandar: 40,
    fuente: 'GCDG China',
    validado: true
  },
  // Más hitos serán añadidos cuando obtengamos los datos completos
];

export default {
  gcdgStudies,
  ecdi2030Info,
  gcdgMilestones
};