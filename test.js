/**
 * Test Suite para AnsiaCalm - Validación clínica y back-testing de desescalada
 */

const assert = require('assert');
const AnsiaCalm = require('./ansiacalm');

console.log('--- INICIANDO TESTS CLÍNICOS DE ANSIACALM ---');

// Test 1: Banderas rojas de sospecha de infarto (dolor opresivo irradiado a brazo)
const triajeInfarto = AnsiaCalm.evaluarTriaje({
  dolorOpresivoBrazoMandibula: true,
  sensacionPesoAplastantePecho: true,
  sudorFrioIntensoSinHiperventilacion: false,
  antecedenteCardiopatiaOEdadRiesgo: true,
  hormigueoDedosBoca: false
});
assert.strictEqual(triajeInfarto.esEmergenciaMedica, true);
assert.strictEqual(triajeInfarto.clasificacion, 'alerta_urgencias_112');
assert.ok(triajeInfarto.banderasRojas.length >= 2);
console.log('✅ Test 1 Superado: Banderas rojas cardiovasculares discriminan urgencia 112.');

// Test 2: Ataque de pánico con hiperventilación y parestesias
const triajePanico = AnsiaCalm.evaluarTriaje({
  dolorOpresivoBrazoMandibula: false,
  sensacionPesoAplastantePecho: false,
  hormigueoDedosBoca: true,
  picoBruscoMenos10Min: true,
  sensacionDesrealizacion: true,
  miedoPerderControlOMorir: true
});
assert.strictEqual(triajePanico.esEmergenciaMedica, false);
assert.strictEqual(triajePanico.clasificacion, 'crisis_panico_probable');
assert.ok(triajePanico.puntosCalma.length >= 3);
console.log('✅ Test 2 Superado: Crisis de pánico clasificada con mensajes de desescalada amigdalina.');

// Test 3: Ansiedad leve/moderada
const triajeLeve = AnsiaCalm.evaluarTriaje({
  dolorOpresivoBrazoMandibula: false,
  sensacionPesoAplastantePecho: false,
  hormigueoDedosBoca: false,
  picoBruscoMenos10Min: false,
  nudoGargantaOHiperventilacion: true
});
assert.strictEqual(triajeLeve.esEmergenciaMedica, false);
assert.strictEqual(triajeLeve.clasificacion, 'ansiedad_leve_moderada');
console.log('✅ Test 3 Superado: Ansiedad leve/moderada identificada.');

// Test 4: Patrones de respiración autonómica
const patron478 = AnsiaCalm.PATRONES_RESPIRACION['478'];
assert.strictEqual(patron478.fases.length, 3);
assert.strictEqual(patron478.fases[0].duracionMs, 4000);
assert.strictEqual(patron478.fases[1].duracionMs, 7000);
assert.strictEqual(patron478.fases[2].duracionMs, 8000);
console.log('✅ Test 4 Superado: Parámetros temporales de respiración 4-7-8 validados.');

// Test 5: Suspiro fisiológico (doble inhalación + exhalación prolongada)
const suspiro = AnsiaCalm.PATRONES_RESPIRACION['suspiro'];
assert.strictEqual(suspiro.fases.length, 3);
assert.strictEqual(suspiro.fases[0].tipo, 'inhala');
assert.strictEqual(suspiro.fases[1].tipo, 'inhala_extra');
assert.strictEqual(suspiro.fases[2].tipo, 'exhala');
console.log('✅ Test 5 Superado: Estructura del suspiro fisiológico verificada.');

// Test 6: Pasos de Grounding 5-4-3-2-1
assert.strictEqual(AnsiaCalm.GROUNDING_STEPS.length, 5);
assert.strictEqual(AnsiaCalm.GROUNDING_STEPS[0].paso, 5);
assert.strictEqual(AnsiaCalm.GROUNDING_STEPS[4].paso, 1);
console.log('✅ Test 6 Superado: Secuencia de anclaje sensorial 5-4-3-2-1 verificada.');

// Test 7: Banderas rojas atípicas de infarto en mujer (fatiga extrema súbita + dolor de mandíbula/epigastrio)
const triajeAtipico = AnsiaCalm.evaluarTriaje({
  fatigaExtremaBruscaSinExplicacion: true,
  malestarEpigastricoONauseas: true,
  dolorMandibulaEspalda: true,
  dolorOpresivoBrazoMandibula: false,
  sensacionPesoAplastantePecho: false
});
assert.strictEqual(triajeAtipico.esEmergenciaMedica, true);
assert.strictEqual(triajeAtipico.clasificacion, 'alerta_urgencias_112');
assert.ok(triajeAtipico.banderasRojas[0].includes('atípico'));
console.log('✅ Test 7 Superado: Presentación atípica de infarto en mujeres discriminada hacia el 112 sin confundirla con pánico.');

console.log('\n--- TODOS LOS 7 TESTS DE ANSIACALM v2.0.0 SUPERADOS EXITOSAMENTE ---');
