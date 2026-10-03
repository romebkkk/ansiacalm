/**
 * AnsiaCalm - Motor clínico de desescalada de crisis de ansiedad, triaje pánico vs infarto y neuro-regulación.
 * Basado en:
 * - Criterios DSM-5 para Trastorno de Pánico y Crisis de Angustia
 * - Protocolos SEMES / SEMERGEN para diagnóstico diferencial dolor torácico en urgencias
 * - Respiración 4-7-8 (Dr. Andrew Weil, activación parasimpática por nervio vago)
 * - Suspiro Fisiológico / Cyclic Sighing (Balban et al., Cell Reports Medicine 2023)
 * - Técnica de anclaje sensorial Grounding 5-4-3-2-1
 * 
 * 100% In-Browser, privado y sin dependencias.
 * Copyright (c) 2026 DataFlow Elegance — Ismael Ben Kazem
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.AnsiaCalm = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var AnsiaCalm = {};

  /**
   * Pautas de respiración autonómica validadas
   */
  AnsiaCalm.PATRONES_RESPIRACION = {
    '478': {
      nombre: 'Técnica 4-7-8 (Freno Vagal Parasimpático)',
      descripcion: 'Estimula el nervio vago reduciendo la taquicardia refleja y calmando la amígdala.',
      fases: [
        { tipo: 'inhala', duracionMs: 4000, instruccion: 'Inhala profundamente por la nariz...' },
        { tipo: 'manten', duracionMs: 7000, instruccion: 'Retén el aire con calma...' },
        { tipo: 'exhala', duracionMs: 8000, instruccion: 'Exhala lentamente por la boca vaciando los pulmones...' }
      ]
    },
    'box': {
      nombre: 'Respiración Cuadrada (Box Breathing / Navy SEALs)',
      descripcion: 'Equilibra el sistema nervioso autónomo y devuelve el foco atencional al presente.',
      fases: [
        { tipo: 'inhala', duracionMs: 4000, instruccion: 'Inhala suavemente...' },
        { tipo: 'manten', duracionMs: 4000, instruccion: 'Mantén los pulmones llenos...' },
        { tipo: 'exhala', duracionMs: 4000, instruccion: 'Exhala lentamente...' },
        { tipo: 'manten_vacio', duracionMs: 4000, instruccion: 'Mantén en vacío sin tensión...' }
      ]
    },
    'suspiro': {
      nombre: 'Suspiro Fisiológico (Cyclic Sighing)',
      descripcion: 'El método más rápido según la neurobiología para reabrir alvéolos colapsados y bajar la frecuencia cardíaca.',
      fases: [
        { tipo: 'inhala', duracionMs: 3000, instruccion: 'Inhalación profunda por la nariz...' },
        { tipo: 'inhala_extra', duracionMs: 1500, instruccion: 'Inhala un poco más arriba (segunda bocanada)...' },
        { tipo: 'exhala', duracionMs: 6500, instruccion: 'Exhala largo y prolongado por la boca...' }
      ]
    }
  };

  /**
   * Pasos estructurados de la técnica de anclaje sensorial Grounding 5-4-3-2-1
   */
  AnsiaCalm.GROUNDING_STEPS = [
    {
      paso: 5,
      sentido: 'Vista 👁️',
      pregunta: 'Nombra 5 cosas que puedas ver a tu alrededor ahora mismo.',
      ejemplo: 'Por ejemplo: el marco de la puerta, una sombra en la pared, un bolígrafo, tus zapatos, una lámpara.'
    },
    {
      paso: 4,
      sentido: 'Tacto ✋',
      pregunta: 'Toca 4 texturas o sensaciones físicas distintas.',
      ejemplo: 'Por ejemplo: la tela de tu pantalón, el frío de la mesa, el respaldo de la silla, el borde de tu teléfono.'
    },
    {
      paso: 3,
      sentido: 'Oído 👂',
      pregunta: 'Identifica 3 sonidos que percibas en este instante.',
      ejemplo: 'Por ejemplo: el zumbido de un aparato, el tráfico a lo lejos, el sonido de tu propia respiración.'
    },
    {
      paso: 2,
      sentido: 'Olfato 👃',
      pregunta: 'Reconoce 2 olores a tu alrededor o inhala profundamente.',
      ejemplo: 'Por ejemplo: el olor a café, jabón en tus manos, el aire fresco de la ventana o tu ropa.'
    },
    {
      paso: 1,
      sentido: 'Gusto 👅',
      pregunta: 'Nota 1 sabor en tu boca o toma un sorbo de agua fría.',
      ejemplo: 'Por ejemplo: el sabor de la pasta de dientes, un caramelo de menta o una gota de agua fresca.'
    }
  ];

  /**
   * Triaje de síntomas: Discriminador entre Crisis de Pánico y Banderas Rojas Cardíacas
   * @param {Object} s Síntomas reportados
   */
  AnsiaCalm.evaluarTriaje = function (s) {
    if (!s) throw new Error('Parámetros de síntomas no proporcionados.');

    var banderasRojasInfarto = [];

    // Banderas rojas de sospecha de Síndrome Coronario Agudo clásico y atípico femenino
    if (s.dolorOpresivoBrazoMandibula) {
      banderasRojasInfarto.push('Dolor u opresión en el pecho que se irradia al brazo izquierdo, cuello o mandíbula.');
    }
    if (s.sensacionPesoAplastantePecho) {
      banderasRojasInfarto.push('Sensación de pesadez o aplastamiento continuo ("pata de elefante") que no cambia al respirar ni al tocarse.');
    }
    if (s.sudorFrioIntensoSinHiperventilacion) {
      banderasRojasInfarto.push('Sudoración fría profusa y palidez intensa con mareo o pérdida de conocimiento (síncope).');
    }
    if (s.antecedenteCardiopatiaOEdadRiesgo && s.dolorPecho) {
      banderasRojasInfarto.push('Dolor torácico nuevo en persona con antecedentes cardíacos o factores de riesgo cardiovascular elevados.');
    }
    // Patrón atípico (Guías de la American Heart Association - Infarto en la mujer y diabéticos)
    if (s.fatigaExtremaBruscaSinExplicacion && (s.malestarEpigastricoONauseas || s.dolorMandibulaEspalda)) {
      banderasRojasInfarto.push('Patrón de infarto agudo atípico (disnea, náuseas o dolor de mandíbula/espalda con fatiga extrema, sin dolor opresivo clásico, frecuente en mujeres).');
    }

    if (banderasRojasInfarto.length > 0) {
      return {
        clasificacion: 'alerta_urgencias_112',
        esEmergenciaMedica: true,
        titulo: '🚨 ALERTA MÉDICA: Posible Síndrome Coronario o Urgencia Cardiovascular',
        explicacion: 'Se han marcado síntomas que requieren descartar un evento coronario agudo inmediatamente por un médico.',
        banderasRojas: banderasRojasInfarto,
        instrucciones: [
          'Llama de inmediato al 112 / 061 o acude al servicio de urgencias más cercano.',
          'Siéntate o recuéstate semi-incorporado (30-45 grados).',
          'Afloja la ropa apretada en cuello y cintura.',
          'No conduzcas tú mismo.'
        ]
      };
    }

    // Análisis de síntomas típicos de ataque de pánico / crisis de angustia
    var sintomasPanico = [];
    if (s.hormigueoDedosBoca) sintomasPanico.push('Parestesias / hormigueo en dedos o labios (causado por alcalosis respiratoria al respirar rápido).');
    if (s.picoBruscoMenos10Min) sintomasPanico.push('Inicio muy brusco que alcanza su máxima intensidad en menos de 10 minutos.');
    if (s.sensacionDesrealizacion) sintomasPanico.push('Desrealización o despersonalización (sentir que lo que te rodea no es real o sentirse fuera del cuerpo).');
    if (s.miedoPerderControlOMorir) sintomasPanico.push('Miedo intenso a volverse loco, perder el control o morir de forma inminente.');
    if (s.nudoGargantaOHiperventilacion) sintomasPanico.push('Sensación de nudo en la garganta (globo histérico) y respiración rápida superficial.');

    if (sintomasPanico.length >= 2 || s.diagnosticoPrevioAnsiedad) {
      return {
        clasificacion: 'crisis_panico_probable',
        esEmergenciaMedica: false,
        titulo: '🌿 Crisis de Ansiedad / Ataque de Pánico Agudo',
        explicacion: 'Los síntomas coinciden con una activación simpática extrema (respuesta de lucha o huida de la amígdala). Es una experiencia muy intensa y desagradable, pero NO ES PELIGROSA y terminará en unos minutos.',
        puntosCalma: [
          'Tu cuerpo no está en peligro real: es una falsa alarma de tu cerebro.',
          'El hormigueo y el mareo se deben a que respiras demasiado rápido (hiperventilación) y el dióxido de carbono baja temporalmente.',
          'El ataque tiene un límite biológico natural: tu cuerpo no puede mantener la adrenalina alta indefinidamente y la curva empezará a bajar en 10-15 minutos.',
          'No vas a enloquecer ni vas a dejar de respirar. Tu sistema autónomo te protege.'
        ],
        sintomasDetectados: sintomasPanico
      };
    }

    return {
      clasificacion: 'ansiedad_leve_moderada',
      esEmergenciaMedica: false,
      titulo: '🌱 Estado de Ansiedad o Agitación Emocional',
      explicacion: 'Se observa activación emocional o nerviosismo sin criterios claros de ataque de pánico severo ni banderas rojas de infarto.',
      puntosCalma: [
        'Utiliza la respiración 4-7-8 o el anclaje sensorial para restablecer el ritmo cardíaco de reposo.',
        'Bebe un vaso de agua fresca a pequeños sorbos.',
        'Haz una pausa de pantallas y descansa.'
      ]
    };
  };

  /**
   * Generador de audio de relajación local utilizando la Web Audio API (Sin ficheros externos ni descargas)
   */
  AnsiaCalm.generarAudioContext = function () {
    var AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    return new AudioCtx();
  };

  return AnsiaCalm;
});
