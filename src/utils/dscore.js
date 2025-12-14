/**
 * D-score Algorithm Implementation
 * Based on van Buuren, S. (2014). Growth charts of human development. Statistical Methods in Medical Research, 23(4), 346-368.
 * 
 * The D-score is a continuous scale that quantifies generic development of children,
 * analogous to how height and weight are measures of physical development.
 */

// Reference values for D-score calculation (simplified version)
const D_SCORE_REFERENCES = {
  // Age in months -> Expected D-score
  1: 20.0,   2: 25.0,   3: 30.0,   4: 35.0,   5: 38.0,   6: 40.0,
  7: 42.0,   8: 44.0,   9: 46.0,   10: 47.5,  11: 49.0,  12: 50.5,
  15: 53.0,  18: 55.5,  21: 57.5,  24: 59.5,  30: 62.0,  36: 64.0,
  42: 65.5,  48: 66.5,  54: 67.5,  60: 68.0,  66: 68.5,  72: 69.0
};

// Standard deviations for age-adjusted Z-scores (DAZ)
const D_SCORE_SD = {
  1: 3.5,    2: 3.8,    3: 4.0,    4: 4.2,    5: 4.3,    6: 4.4,
  7: 4.5,    8: 4.6,    9: 4.7,    10: 4.8,   11: 4.8,   12: 4.9,
  15: 5.1,   18: 5.2,   21: 5.3,   24: 5.4,   30: 5.6,   36: 5.7,
  42: 5.8,   48: 5.9,   54: 6.0,   60: 6.0,   66: 6.1,   72: 6.1
};

// Item difficulties (tau) - simplified mapping based on typical developmental progression
const ITEM_DIFFICULTIES = {
  'Motor Grueso': {
    base: 35.0,
    ageMultiplier: 0.4,
    examples: {
      'levanta cabeza': -5.0,
      'se sienta': 0.0,
      'gatea': 2.0,
      'camina': 5.0,
      'corre': 8.0,
      'salta': 12.0
    }
  },
  'Motor Fino': {
    base: 38.0,
    ageMultiplier: 0.45,
    examples: {
      'agarra objetos': -3.0,
      'transfiere': 0.0,
      'pinza': 3.0,
      'garabatea': 8.0,
      'copia formas': 15.0
    }
  },
  'Lenguaje Expresivo': {
    base: 40.0,
    ageMultiplier: 0.5,
    examples: {
      'vocaliza': -5.0,
      'balbucea': -2.0,
      'primera palabra': 0.0,
      'dos palabras': 5.0,
      'frases': 12.0,
      'conversación': 20.0
    }
  },
  'Lenguaje Receptivo': {
    base: 37.0,
    ageMultiplier: 0.48,
    examples: {
      'responde sonidos': -4.0,
      'reconoce nombre': 0.0,
      'entiende no': 3.0,
      'sigue instrucciones': 8.0,
      'comprende relatos': 18.0
    }
  },
  'Social-Emocional': {
    base: 36.0,
    ageMultiplier: 0.42,
    examples: {
      'sonrisa social': -6.0,
      'reconoce familiares': -2.0,
      'juego interactivo': 3.0,
      'juego simbólico': 10.0,
      'autorregulación': 18.0
    }
  },
  'Cognitivo': {
    base: 39.0,
    ageMultiplier: 0.47,
    examples: {
      'permanencia objeto': 0.0,
      'causalidad': 5.0,
      'resolución problemas': 10.0,
      'pensamiento simbólico': 15.0,
      'razonamiento': 22.0
    }
  }
};

/**
 * Interpolates reference values for ages not in the reference table
 */
function interpolateReference(ageMonths, referenceTable) {
  const ages = Object.keys(referenceTable).map(Number).sort((a, b) => a - b);
  
  if (ageMonths <= ages[0]) return referenceTable[ages[0]];
  if (ageMonths >= ages[ages.length - 1]) return referenceTable[ages[ages.length - 1]];
  
  // Find surrounding ages
  let lowerAge = ages[0];
  let upperAge = ages[ages.length - 1];
  
  for (let i = 0; i < ages.length - 1; i++) {
    if (ageMonths >= ages[i] && ageMonths <= ages[i + 1]) {
      lowerAge = ages[i];
      upperAge = ages[i + 1];
      break;
    }
  }
  
  // Linear interpolation
  const factor = (ageMonths - lowerAge) / (upperAge - lowerAge);
  return referenceTable[lowerAge] + factor * (referenceTable[upperAge] - referenceTable[lowerAge]);
}

/**
 * Estimates item difficulty (tau) based on milestone characteristics
 */
function estimateItemDifficulty(milestone) {
  const domain = milestone.area || 'Cognitivo';
  const age = milestone.edad || 12;
  const description = (milestone.descripcion || '').toLowerCase();
  
  if (!ITEM_DIFFICULTIES[domain]) {
    return ITEM_DIFFICULTIES['Cognitivo'].base + age * ITEM_DIFFICULTIES['Cognitivo'].ageMultiplier;
  }
  
  const domainParams = ITEM_DIFFICULTIES[domain];
  let baseDifficulty = domainParams.base + age * domainParams.ageMultiplier;
  
  // Adjust based on description keywords
  for (const [keyword, adjustment] of Object.entries(domainParams.examples)) {
    if (description.includes(keyword)) {
      baseDifficulty += adjustment;
      break;
    }
  }
  
  return Math.max(15.0, Math.min(85.0, baseDifficulty)); // Constrain to reasonable range
}

/**
 * Calculates D-score using a simplified Rasch model
 */
export function calculateDScore(milestoneResponses, childAgeMonths) {
  if (!milestoneResponses || milestoneResponses.length === 0) {
    return {
      dscore: null,
      daz: null,
      sem: null,
      n: 0,
      p: null,
      interpretation: 'No hay suficientes datos para calcular D-score'
    };
  }
  
  // Calculate raw score and item parameters
  let sumLogits = 0;
  let validResponses = 0;
  let positiveResponses = 0;
  
  for (const response of milestoneResponses) {
    if (response.achieved !== undefined && response.achieved !== null) {
      validResponses++;
      
      if (response.achieved) {
        positiveResponses++;
        const itemDifficulty = estimateItemDifficulty(response.milestone);
        
        // Simplified Rasch model: person ability - item difficulty
        sumLogits += (50.0 - itemDifficulty); // 50 is assumed person ability baseline
      }
    }
  }
  
  if (validResponses === 0) {
    return {
      dscore: null,
      daz: null,
      sem: null,
      n: 0,
      p: null,
      interpretation: 'No hay respuestas válidas'
    };
  }
  
  // Calculate proportion of items passed
  const proportion = positiveResponses / validResponses;
  
  // Simple D-score estimation based on proportion and age
  const expectedDScore = interpolateReference(childAgeMonths, D_SCORE_REFERENCES);
  const ageAdjustment = (proportion - 0.5) * 20; // Scale adjustment
  const dscore = Math.max(15.0, Math.min(85.0, expectedDScore + ageAdjustment));
  
  // Calculate DAZ (D-score for Age Z-score)
  const expectedSD = interpolateReference(childAgeMonths, D_SCORE_SD);
  const daz = (dscore - expectedDScore) / expectedSD;
  
  // Standard Error of Measurement (simplified)
  const sem = expectedSD * Math.sqrt(proportion * (1 - proportion) / validResponses);
  
  return {
    dscore: Math.round(dscore * 10) / 10,
    daz: Math.round(daz * 100) / 100,
    sem: Math.round(sem * 100) / 100,
    n: validResponses,
    p: Math.round(proportion * 1000) / 1000,
    interpretation: interpretDScore(dscore, daz, childAgeMonths)
  };
}

/**
 * Interprets D-score results in clinical/educational terms
 */
function interpretDScore(dscore, daz, ageMonths) {
  const ageYears = Math.floor(ageMonths / 12);
  const ageMonthsRemainder = ageMonths % 12;
  const ageString = `${ageYears} años${ageMonthsRemainder > 0 ? ` y ${ageMonthsRemainder} meses` : ''}`;
  
  let interpretation = '';
  let concern_level = '';
  
  if (daz >= 1.0) {
    concern_level = 'Superior';
    interpretation = `Desarrollo superior al promedio para ${ageString}. El niño muestra habilidades avanzadas.`;
  } else if (daz >= 0.5) {
    concern_level = 'Sobre el promedio';
    interpretation = `Desarrollo sobre el promedio para ${ageString}. Progreso favorable.`;
  } else if (daz >= -0.5) {
    concern_level = 'Típico';
    interpretation = `Desarrollo típico para ${ageString}. Progreso esperado dentro del rango normal.`;
  } else if (daz >= -1.0) {
    concern_level = 'Ligeramente bajo';
    interpretation = `Desarrollo ligeramente por debajo del promedio para ${ageString}. Monitoreo recomendado.`;
  } else if (daz >= -2.0) {
    concern_level = 'Preocupante';
    interpretation = `Desarrollo significativamente por debajo del promedio para ${ageString}. Evaluación profesional recomendada.`;
  } else {
    concern_level = 'Alto riesgo';
    interpretation = `Desarrollo considerablemente por debajo del promedio para ${ageString}. Intervención temprana urgente recomendada.`;
  }
  
  return {
    level: concern_level,
    description: interpretation,
    recommendation: getRecommendation(daz)
  };
}

/**
 * Provides recommendations based on D-score results
 */
function getRecommendation(daz) {
  if (daz >= 1.0) {
    return 'Continuar estimulando el desarrollo con actividades apropiadas. Considerar enriquecimiento.';
  } else if (daz >= 0.5) {
    return 'Mantener rutinas de estimulación actuales. Monitoreo regular.';
  } else if (daz >= -0.5) {
    return 'Continuar con actividades de desarrollo apropiadas para la edad.';
  } else if (daz >= -1.0) {
    return 'Incrementar actividades de estimulación. Consultar con pediatra en próxima visita.';
  } else if (daz >= -2.0) {
    return 'Evaluación profesional recomendada. Considerar intervención temprana.';
  } else {
    return 'Evaluación urgente por especialista en desarrollo infantil. Intervención temprana necesaria.';
  }
}

/**
 * Calculates developmental age equivalent
 */
export function calculateDevelopmentalAge(dscore) {
  // Find the age where expected D-score matches the calculated D-score
  const ages = Object.keys(D_SCORE_REFERENCES).map(Number).sort((a, b) => a - b);
  
  for (let i = 0; i < ages.length - 1; i++) {
    const lowerAge = ages[i];
    const upperAge = ages[i + 1];
    const lowerScore = D_SCORE_REFERENCES[lowerAge];
    const upperScore = D_SCORE_REFERENCES[upperAge];
    
    if (dscore >= lowerScore && dscore <= upperScore) {
      // Linear interpolation
      const factor = (dscore - lowerScore) / (upperScore - lowerScore);
      return lowerAge + factor * (upperAge - lowerAge);
    }
  }
  
  // Extrapolation for extreme values
  if (dscore < D_SCORE_REFERENCES[ages[0]]) {
    return Math.max(0.5, ages[0] - (D_SCORE_REFERENCES[ages[0]] - dscore) * 0.5);
  } else {
    return ages[ages.length - 1] + (dscore - D_SCORE_REFERENCES[ages[ages.length - 1]]) * 0.3;
  }
}

/**
 * Generates D-score growth chart data points
 */
export function generateDScoreChart(ageRange = [0, 72]) {
  const [minAge, maxAge] = ageRange;
  const dataPoints = [];
  
  for (let age = minAge; age <= maxAge; age += 1) {
    const expectedScore = interpolateReference(age, D_SCORE_REFERENCES);
    const expectedSD = interpolateReference(age, D_SCORE_SD);
    
    dataPoints.push({
      age: age,
      mean: expectedScore,
      plus1sd: expectedScore + expectedSD,
      minus1sd: expectedScore - expectedSD,
      plus2sd: expectedScore + 2 * expectedSD,
      minus2sd: expectedScore - 2 * expectedSD
    });
  }
  
  return dataPoints;
}

/**
 * Validates milestone responses for D-score calculation
 */
export function validateMilestoneResponses(responses) {
  const errors = [];
  const warnings = [];
  
  if (!Array.isArray(responses)) {
    errors.push('Las respuestas deben ser un array');
    return { isValid: false, errors, warnings };
  }
  
  if (responses.length === 0) {
    warnings.push('No hay respuestas para evaluar');
    return { isValid: true, errors, warnings };
  }
  
  let validCount = 0;
  const domains = new Set();
  
  responses.forEach((response, index) => {
    if (!response.milestone) {
      warnings.push(`Respuesta ${index + 1}: Falta información del hito`);
      return;
    }
    
    if (response.achieved === undefined || response.achieved === null) {
      warnings.push(`Respuesta ${index + 1}: Falta indicar si se logró el hito`);
      return;
    }
    
    if (typeof response.achieved !== 'boolean') {
      errors.push(`Respuesta ${index + 1}: El logro debe ser true o false`);
      return;
    }
    
    validCount++;
    if (response.milestone.area) {
      domains.add(response.milestone.area);
    }
  });
  
  if (validCount < 5) {
    warnings.push(`Solo ${validCount} respuestas válidas. Se recomienda al menos 5 para un cálculo confiable.`);
  }
  
  if (domains.size < 2) {
    warnings.push('Se recomienda evaluar hitos de múltiples áreas del desarrollo.');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    validCount,
    domains: Array.from(domains)
  };
}

/**
 * Calculates D-score trajectory from multiple assessments
 */
export function calculateDScoreTrajectory(assessments) {
  if (!Array.isArray(assessments) || assessments.length === 0) {
    return {
      trajectory: [],
      velocity: null,
      acceleration: null,
      interpretation: 'No hay suficientes evaluaciones para calcular trayectoria'
    };
  }
  
  // Sort by age
  const sortedAssessments = [...assessments].sort((a, b) => a.ageMonths - b.ageMonths);
  
  const trajectory = sortedAssessments.map(assessment => {
    const result = calculateDScore(assessment.responses, assessment.ageMonths);
    return {
      age: assessment.ageMonths,
      dscore: result.dscore,
      daz: result.daz,
      date: assessment.date,
      n: result.n
    };
  }).filter(point => point.dscore !== null);
  
  if (trajectory.length < 2) {
    return {
      trajectory,
      velocity: null,
      acceleration: null,
      interpretation: 'Se necesitan al menos 2 evaluaciones válidas para calcular velocidad'
    };
  }
  
  // Calculate velocity (D-score change per month)
  const velocities = [];
  for (let i = 1; i < trajectory.length; i++) {
    const timeDiff = trajectory[i].age - trajectory[i-1].age;
    const scoreDiff = trajectory[i].dscore - trajectory[i-1].dscore;
    velocities.push(scoreDiff / timeDiff);
  }
  
  const avgVelocity = velocities.reduce((sum, v) => sum + v, 0) / velocities.length;
  
  // Calculate acceleration if we have enough points
  let acceleration = null;
  if (velocities.length >= 2) {
    const accelerations = [];
    for (let i = 1; i < velocities.length; i++) {
      const timeIndex = i + 1;
      const timeDiff = trajectory[timeIndex].age - trajectory[timeIndex-1].age;
      const velocityDiff = velocities[i] - velocities[i-1];
      accelerations.push(velocityDiff / timeDiff);
    }
    acceleration = accelerations.reduce((sum, a) => sum + a, 0) / accelerations.length;
  }
  
  return {
    trajectory,
    velocity: Math.round(avgVelocity * 1000) / 1000,
    acceleration: acceleration ? Math.round(acceleration * 1000) / 1000 : null,
    interpretation: interpretTrajectory(avgVelocity, acceleration)
  };
}

/**
 * Interprets D-score trajectory
 */
function interpretTrajectory(velocity, acceleration) {
  let interpretation = '';
  
  if (velocity > 0.5) {
    interpretation = 'Desarrollo acelerado - el niño está progresando más rápido que lo esperado';
  } else if (velocity > 0.1) {
    interpretation = 'Desarrollo normal - progreso constante apropiado para la edad';
  } else if (velocity > -0.1) {
    interpretation = 'Desarrollo estable - progreso mínimo, requiere monitoreo';
  } else {
    interpretation = 'Desarrollo desacelerado - progreso por debajo de lo esperado, evaluación recomendada';
  }
  
  if (acceleration !== null) {
    if (acceleration > 0.1) {
      interpretation += '. La velocidad de desarrollo está aumentando (aceleración positiva).';
    } else if (acceleration < -0.1) {
      interpretation += '. La velocidad de desarrollo está disminuyendo (desaceleración).';
    }
  }
  
  return interpretation;
}

/**
 * Compares D-score with normative references
 */
export function compareWithNorms(dscore, daz, ageMonths, populationNorms = null) {
  const expectedScore = interpolateReference(ageMonths, D_SCORE_REFERENCES);
  const expectedSD = interpolateReference(ageMonths, D_SCORE_SD);
  
  // Calculate percentile approximation
  const percentile = Math.round(normalCDF(daz) * 100);
  
  const comparison = {
    childScore: dscore,
    expectedScore: Math.round(expectedScore * 10) / 10,
    difference: Math.round((dscore - expectedScore) * 10) / 10,
    zScore: daz,
    percentile: percentile,
    standardDeviation: Math.round(expectedSD * 10) / 10,
    interpretation: getPercentileInterpretation(percentile)
  };
  
  // Add population-specific norms if available
  if (populationNorms) {
    comparison.populationComparison = {
      population: populationNorms.name,
      sample_size: populationNorms.n,
      mean: populationNorms.mean,
      sd: populationNorms.sd,
      populationZ: (dscore - populationNorms.mean) / populationNorms.sd
    };
  }
  
  return comparison;
}

/**
 * Approximation of normal cumulative distribution function
 */
function normalCDF(x) {
  // Abramowitz and Stegun approximation
  const t = 1.0 / (1.0 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp(-x * x / 2.0);
  let prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  
  if (x > 0) prob = 1.0 - prob;
  return Math.max(0, Math.min(1, prob));
}

/**
 * Interprets percentile scores
 */
function getPercentileInterpretation(percentile) {
  if (percentile >= 98) {
    return 'Excepcionalmente alto (top 2%)';
  } else if (percentile >= 90) {
    return 'Muy alto (top 10%)';
  } else if (percentile >= 75) {
    return 'Alto (percentil 75-90)';
  } else if (percentile >= 25) {
    return 'Promedio (percentil 25-75)';
  } else if (percentile >= 10) {
    return 'Bajo (percentil 10-25)';
  } else if (percentile >= 2) {
    return 'Muy bajo (percentil 2-10)';
  } else {
    return 'Excepcionalmente bajo (bottom 2%)';
  }
}