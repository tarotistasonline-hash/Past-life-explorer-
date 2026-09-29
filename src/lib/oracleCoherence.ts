/**
 * Oracle Coherence Engine: Guarantees that Ouija, Akashic and Tarot answers
 * are 100% coherent, topic-aware, and directly address the seeker's question.
 */

export interface CoherentSpiritAnswer {
  spelledWord: string;
  answerType: "YES" | "NO" | "SPELLOUT";
  spiritMessage: string;
  spiritName: string;
}

export type QuestionTopic =
  | "LOVE_RELATIONSHIP"
  | "INFIDELITY_JEALOUSY"
  | "EX_RECONCILIATION"
  | "WORK_CAREER"
  | "JOB_INTERVIEW"
  | "MONEY_FINANCE"
  | "BUY_SELL_INVEST"
  | "TRAVEL_MOVING"
  | "HEALTH_VITALITY"
  | "PREGNANCY_CHILDREN"
  | "DECEASED_LOVED_ONE"
  | "DECISION_YES_NO"
  | "STUDIES_EXAMS"
  | "GENERAL_SPIRITUAL";

/**
 * Normalizes text for robust semantic keyword matching
 */
function cleanText(text: string): string {
  return (text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/**
 * Detects the specific topic and tone of the seeker's question
 */
export function detectQuestionTopic(question: string): {
  topic: QuestionTopic;
  isYesNoQuestion: boolean;
} {
  const q = cleanText(question);

  const isYesNoQuestion =
    /^(me|voy|sera|es|debo|puedo|tengo|habra|conviene|volver|lograre|aprobar|quiere|ama|piensa|siente|va a|deberia)\b/i.test(q) ||
    /\b(si o no|o no|verdad|cierto|conviene)\b/i.test(q) ||
    question.includes("?") ||
    question.includes("¿");

  // 1. Infidelity / Jealousy / Secrets
  if (
    /\b(engana|engano|engañar|infiel|infidelidad|cuernos|traicion|traiciona|otra persona|otro hombre|otra mujer|amante|mentira|miente|secretos)\b/i.test(q)
  ) {
    return { topic: "INFIDELITY_JEALOUSY", isYesNoQuestion };
  }

  // 2. Ex-partners / Reconciliation
  if (
    /\b(ex|volver|volvera|volveremos|regresar|regresara|reconciliacion|me extrana|piensa en mi|todavia me quiere|todavia me ama|olvido|recuerda)\b/i.test(q)
  ) {
    return { topic: "EX_RECONCILIATION", isYesNoQuestion };
  }

  // 3. Love / Relationships / Marriage
  if (
    /\b(amor|pareja|novio|novia|esposo|esposa|marido|mujer|casar|casarme|matrimonio|boda|relacion|enamorad|me ama|me quiere|le gusto|gusto de mi|alma gemela|futuro juntos|conocere)\b/i.test(q)
  ) {
    return { topic: "LOVE_RELATIONSHIP", isYesNoQuestion };
  }

  // 4. Job interview / specific employment
  if (
    /\b(entrevista|curriculum|cv|postul|me llamaran|quedare|contrat|contrato|nuevo empleo|conseguir trabajo|conseguire)\b/i.test(q)
  ) {
    return { topic: "JOB_INTERVIEW", isYesNoQuestion };
  }

  // 5. Work / Career / Boss / Business
  if (
    /\b(trabajo|empleo|laboral|laburo|jefe|jefa|ascenso|aumento|renunciar|despido|despedir|empresa|negocio|emprendimiento|local|socio|profesion)\b/i.test(q)
  ) {
    return { topic: "WORK_CAREER", isYesNoQuestion };
  }

  // 6. Studies / Exams / University
  if (
    /\b(examen|examenes|aprobar|aprobare|rendir|rendire|parcial|final|carrera|universidad|facultad|estudio|estudiar|tesis|materia|profesor)\b/i.test(q)
  ) {
    return { topic: "STUDIES_EXAMS", isYesNoQuestion };
  }

  // 7. Buy / Sell / Investments / Real Estate / Car
  if (
    /\b(vender|venta|comprar|compra|inversion|invertir|propiedad|casa|departamento|auto|coche|terreno|escritura|alquilar|alquiler)\b/i.test(q)
  ) {
    return { topic: "BUY_SELL_INVEST", isYesNoQuestion };
  }

  // 8. Money / Finance / Debts / Lawsuits
  if (
    /\b(dinero|plata|guita|economia|economico|finanzas|deuda|deudas|pagar|cobrar|herencia|juicio|abogado|prestamo|loteria|azar|fortuna|ganare)\b/i.test(q)
  ) {
    return { topic: "MONEY_FINANCE", isYesNoQuestion };
  }

  // 9. Travel / Moving / Emigration
  if (
    /\b(viaje|viajar|viajare|mudar|mudarme|mudanza|traslado|emigrar|extranjero|otro pais|otra ciudad|avion|vuelo|visa|pasaporte|destino)\b/i.test(q)
  ) {
    return { topic: "TRAVEL_MOVING", isYesNoQuestion };
  }

  // 10. Pregnancy / Maternity / Children
  if (
    /\b(embarazo|embarazada|bebe|hijo|hija|hijos|quedar embarazada|maternidad|paternidad|parto|fertilidad)\b/i.test(q)
  ) {
    return { topic: "PREGNANCY_CHILDREN", isYesNoQuestion };
  }

  // 11. Health / Vitality / Illness / Surgery
  if (
    /\b(salud|enfermo|enfermedad|dolor|curar|sanar|sanacion|operacion|cirugia|medico|hospital|recuperar|diagnostico|vitalidad)\b/i.test(q)
  ) {
    return { topic: "HEALTH_VITALITY", isYesNoQuestion };
  }

  // 12. Deceased loved one / Spirits / Afterlife
  if (
    /\b(fallecid|muert|difunto|abuelo|abuela|mama|papa|padre|madre|hermano|hermana|hijo muerto|cielo|mas alla|otro plano|donde esta|me cuida|me ve|mensaje de|senal de)\b/i.test(q)
  ) {
    return { topic: "DECEASED_LOVED_ONE", isYesNoQuestion };
  }

  // 13. Direct Decisions / Yes-No
  if (
    /\b(debo|conviene|me conviene|hago bien|hago mal|es el momento|es buena idea|deberia)\b/i.test(q)
  ) {
    return { topic: "DECISION_YES_NO", isYesNoQuestion };
  }

  return { topic: "GENERAL_SPIRITUAL", isYesNoQuestion };
}

/**
 * Intelligent, topic-coherent fallback responses when Gemini is unavailable, rate-limited, or overloaded.
 */
export function getCoherentFallbackSpiritAnswer(
  question: string,
  seekerName: string = "Buscador",
  lang: string = "es"
): CoherentSpiritAnswer {
  const language = lang?.toLowerCase() || "es";
  const { topic } = detectQuestionTopic(question);
  const name = seekerName.trim() || (language === "en" ? "Seeker" : "Buscador");

  // Repository of coherent templates categorized by subject and language
  const database: Record<
    QuestionTopic,
    Record<string, CoherentSpiritAnswer[]>
  > = {
    INFIDELITY_JEALOUSY: {
      es: [
        {
          spelledWord: "MIRA LOS HECHOS",
          answerType: "SPELLOUT",
          spiritMessage: `Los espíritus advierten que las dudas que nublan tu mente nacen de silencios y distancias reales, pero no te precipites a juzgar sin pruebas tangibles. Observa con calma los actos cotidianos; la verdad se revelará ante tus ojos sin que tengas que forzarla.`,
          spiritName: "Oráculo de la Claridad y la Verdad",
        },
        {
          spelledWord: "NO HAY TRAICION",
          answerType: "NO",
          spiritMessage: `La plancheta se inclina hacia el sosiego: los celos o temores que experimentas provienen de heridas no resueltas de tu pasado o falta de comunicación, no de un engaño deliberado en el presente. Conversa con transparencia antes de romper la confianza.`,
          spiritName: "Guardián de los Vínculos",
        },
        {
          spelledWord: "HAY SECRETOS",
          answerType: "SPELLOUT",
          spiritMessage: `El portal percibe sombras de cosas no dichas y verdades a medias que necesitan salir a la luz. No temas exigir la honestidad que mereces; la claridad te liberará de la angustia de la incertidumbre.`,
          spiritName: "Voz de Ultratumba",
        },
      ],
      en: [
        {
          spelledWord: "SEEK THE TRUTH",
          answerType: "SPELLOUT",
          spiritMessage: `The spirits reveal that doubts arise from emotional distance rather than confirmed deceit. Observe real actions calmly; hidden truths will surface without force.`,
          spiritName: "Oracle of Pure Truth",
        },
        {
          spelledWord: "NO BETRAYAL",
          answerType: "NO",
          spiritMessage: `The veil clears: fear and past wounds are clouding your intuition, not active betrayal. Speak openly and rebuild sincere communication.`,
          spiritName: "Guardian of Bonds",
        },
      ],
    },

    EX_RECONCILIATION: {
      es: [
        {
          spelledWord: "PIENSA EN TI",
          answerType: "YES",
          spiritMessage: `Las energías revelan que el recuerdo y la nostalgia siguen presentes en esa persona. Habrá un acercamiento o mensaje en el horizonte, pero debes discernir si reabrir esa puerta traerá paz o revivirá viejas heridas.`,
          spiritName: "Oráculo del Retorno Kármico",
        },
        {
          spelledWord: "CIERRA ESE CICLO",
          answerType: "NO",
          spiritMessage: `Los guías señalan con solemnidad que esa historia ya cumplió su propósito evolutivo en tu alma. Aferrarte al pasado te impide recibir el amor pleno y sincero que el universo ya tiene preparado para ti.`,
          spiritName: "Centinela del Destino",
        },
        {
          spelledWord: "HABRA CONTACTO",
          answerType: "SPELLOUT",
          spiritMessage: `Se avecina una conversación pendiente que permitirá aclarar lo que quedó inconcluso. Mantén tu dignidad intacta y escucha desde la serenidad, no desde la necesidad.`,
          spiritName: "Guardián Akáshico",
        },
      ],
      en: [
        {
          spelledWord: "CYCLE MUST CLOSE",
          answerType: "NO",
          spiritMessage: `The spirits gently urge you to release the past. That connection fulfilled its karmic lesson; clinging to what was delays the genuine love awaiting you.`,
          spiritName: "Sentinel of Destiny",
        },
        {
          spelledWord: "THOUGHTS REMAIN",
          answerType: "YES",
          spiritMessage: `The ether reveals lingering memories and unspoken feelings. An unexpected message will arrive, but guard your heart and evaluate your worth.`,
          spiritName: "Karmic Return Oracle",
        },
      ],
    },

    LOVE_RELATIONSHIP: {
      es: [
        {
          spelledWord: "AMOR SINCERO",
          answerType: "YES",
          spiritMessage: `Los hilos sagrados del destino confirman que hay un sentimiento genuino y un propósito de unión. Permite que el vínculo madure a su tiempo, cultivando el respeto mutuo y la escucha atenta.`,
          spiritName: "Oráculo del Amor Trascendental",
        },
        {
          spelledWord: "ABRE TU CORAZON",
          answerType: "SPELLOUT",
          spiritMessage: `Para que el amor florezca plenamente, ${name}, debes derribar los muros de protección que construiste por desilusiones pasadas. La persona adecuada valorará tu vulnerabilidad y tu verdad.`,
          spiritName: "Guardián de los Afectos",
        },
        {
          spelledWord: "SI TE AMA",
          answerType: "YES",
          spiritMessage: `El péndulo y la plancheta confirman afecto real y lealtad. A veces los temores cotidianos dificultan expresarlo con palabras elocuentes, pero sus acciones revelan el compromiso interior.`,
          spiritName: "Ángel del Velo",
        },
      ],
      en: [
        {
          spelledWord: "TRUE LOVE GUIDES",
          answerType: "YES",
          spiritMessage: `The spirits confirm a profound and genuine soul bond. Allow patience and authentic mutual trust to anchor this relationship in peace.`,
          spiritName: "Oracle of Sacred Love",
        },
        {
          spelledWord: "OPEN YOUR HEART",
          answerType: "SPELLOUT",
          spiritMessage: `Release old defensive shields, ${name}. What is destined for your highest emotional well-being requires your courage to trust once more.`,
          spiritName: "Guardian of Affections",
        },
      ],
    },

    JOB_INTERVIEW: {
      es: [
        {
          spelledWord: "SI TE LLAMARAN",
          answerType: "YES",
          spiritMessage: `Los espíritus auguran una respuesta positiva y reconocimiento hacia tu preparación. Has dejado una huella favorable; mantén la serenidad y la confianza en tu valor profesional mientras se concreta la comunicación.`,
          spiritName: "Guardián de los Caminos y el Trabajo",
        },
        {
          spelledWord: "NUEVA OPORTUNIDAD",
          answerType: "SPELLOUT",
          spiritMessage: `El panorama laboral se encuentra en movimiento activo. Si esta propuesta específica no fuera la definitiva, se abrirá una puerta aún más afín a tus capacidades y expectativas económicas.`,
          spiritName: "Oráculo del Progreso Laboral",
        },
        {
          spelledWord: "CONFIA EN TU TALENTO",
          answerType: "YES",
          spiritMessage: `Tus dones y tu esfuerzo están siendo vistos por el plano sutil. Proyecta seguridad y determinación; el resultado será el más conveniente para tu crecimiento y estabilidad.`,
          spiritName: "Voz del Éxito Terrenal",
        },
      ],
      en: [
        {
          spelledWord: "OFFER INCOMING",
          answerType: "YES",
          spiritMessage: `The guides confirm that your application made a lasting positive impression. A promising response will arrive; stand tall in your professional worth.`,
          spiritName: "Guardian of Career Paths",
        },
        {
          spelledWord: "NEW DOORS OPEN",
          answerType: "SPELLOUT",
          spiritMessage: `Energy is shifting in your favor. If this exact position pauses, a far more fulfilling role is aligning with your destiny.`,
          spiritName: "Oracle of Earthly Progress",
        },
      ],
    },

    WORK_CAREER: {
      es: [
        {
          spelledWord: "CAMBIO FAVORABLE",
          answerType: "YES",
          spiritMessage: `Las señales del destino indican que una etapa de renovación profesional es propicia. No temas postularte, negociar mejoras o dar el paso hacia un entorno donde reconozcan genuinamente tu esfuerzo.`,
          spiritName: "Oráculo de la Vocación y el Éxito",
        },
        {
          spelledWord: "ESPERA EL MOMENTO",
          answerType: "NO",
          spiritMessage: `Los ancestros aconsejan prudencia táctica: no precipites renuncias ni confrontaciones innecesarias en tu entorno laboral hoy. Consolida tu posición y prepara el terreno antes de dar un salto definitivo.`,
          spiritName: "Escriba de la Prudencia",
        },
        {
          spelledWord: "LLEGARA EL ASCENSO",
          answerType: "YES",
          spiritMessage: `La perseverancia silenciosa que has sostenido dará sus frutos. Los superiores o clientes reconocerán tu compromiso y se destrabará el reconocimiento esperado.`,
          spiritName: "Vigía de los Logros",
        },
      ],
      en: [
        {
          spelledWord: "FAVORABLE SHIFT",
          answerType: "YES",
          spiritMessage: `A fruitful career evolution is favored by the cosmos. Do not fear stepping into greater responsibility and seeking environments that honor your value.`,
          spiritName: "Oracle of Vocation",
        },
        {
          spelledWord: "PATIENCE REWARDED",
          answerType: "SPELLOUT",
          spiritMessage: `Do not force sudden departures right now. Strengthen your foundation; the perfect timing for your career breakthrough is currently forming.`,
          spiritName: "Guardian of Career Paths",
        },
      ],
    },

    STUDIES_EXAMS: {
      es: [
        {
          spelledWord: "SI APROBARAS",
          answerType: "YES",
          spiritMessage: `La plancheta marca victoria en tus estudios: tu capacidad intelectual y dedicación superarán las dificultades del examen. Mantén la concentración en los temas clave y disipa el nerviosismo.`,
          spiritName: "Oráculo de la Sabiduría y el Intelecto",
        },
        {
          spelledWord: "REPASA Y CONFIA",
          answerType: "SPELLOUT",
          spiritMessage: `El éxito académico está a tu alcance, pero el oráculo te pide reforzar los puntos donde dudas. Una última revisión lúcida te dará la seguridad determinante frente al tribunal evaluador.`,
          spiritName: "Maestro de las Luces",
        },
      ],
      en: [
        {
          spelledWord: "YOU WILL PASS",
          answerType: "YES",
          spiritMessage: `The oracle indicates academic success: your intellect and preparation will triumph over the challenge. Dispel anxiety and trust your mind.`,
          spiritName: "Master of Wisdom",
        },
      ],
    },

    BUY_SELL_INVEST: {
      es: [
        {
          spelledWord: "VENTA FAVORABLE",
          answerType: "YES",
          spiritMessage: `Las corrientes de la materia están bien aspectadas para concretar la transacción. Habrá un acuerdo conveniente si revisas con atención la documentación y no cedes ante presiones apresuradas.`,
          spiritName: "Guardián de la Abundancia",
        },
        {
          spelledWord: "REVISA DETALLES",
          answerType: "SPELLOUT",
          spiritMessage: `Antes de firmar o comprometer tu patrimonio, los espíritus aconsejan leer minuciosamente cada cláusula. Hay detalles sutiles que deben quedar claros para proteger tus intereses a largo plazo.`,
          spiritName: "Oráculo de la Prosperidad Justa",
        },
        {
          spelledWord: "BUEN MOMENTO",
          answerType: "YES",
          spiritMessage: `La energía económica fluye a tu favor en esta operación. Confía en tu instinto comercial; el paso que estás por dar consolidará tu bienestar y tranquilidad patrimonial.`,
          spiritName: "Centinela de los Bienes",
        },
      ],
      en: [
        {
          spelledWord: "PROSPEROUS DEAL",
          answerType: "YES",
          spiritMessage: `The currents of matter favor this transaction. Review documents with care; an equitable and beneficial resolution is ahead.`,
          spiritName: "Guardian of Prosperity",
        },
      ],
    },

    MONEY_FINANCE: {
      es: [
        {
          spelledWord: "LLEGARA EL DINERO",
          answerType: "YES",
          spiritMessage: `Las deudas o estrecheces actuales encontrarán cauce de alivio. Se destrabará un pago pendiente, cobro o ingreso inesperado que traerá desahogo a tu economía familiar.`,
          spiritName: "Vigía de la Abundancia",
        },
        {
          spelledWord: "CUIDA TUS GASTOS",
          answerType: "SPELLOUT",
          spiritMessage: `El oráculo aconseja cautela con desembolsos impulsivos o promesas de ganancias mágicas. La prosperidad verdadera se construirá cuidando los recursos presentes con orden y constancia.`,
          spiritName: "Escriba de la Riqueza Sobria",
        },
        {
          spelledWord: "PROSPERIDAD EN CAMINO",
          answerType: "YES",
          spiritMessage: `El flujo financiero se reactiva gradualmente. Mantén una actitud de gratitud y enfoque, pues nuevas fuentes de ingreso comenzarán a manifestarse en tu vida.`,
          spiritName: "Oráculo de la Rueda de la Fortuna",
        },
      ],
      en: [
        {
          spelledWord: "FUNDS ARRIVING",
          answerType: "YES",
          spiritMessage: `Financial blockages are dissolving. An overdue payment, settlement or unexpected resource will bring relief to your household.`,
          spiritName: "Watcher of Abundance",
        },
        {
          spelledWord: "PRUDENT SPENDING",
          answerType: "SPELLOUT",
          spiritMessage: `The spirits counsel discernment with resources. Order and foresight will turn temporary tight situations into lasting financial peace.`,
          spiritName: "Oracle of Material Flow",
        },
      ],
    },

    TRAVEL_MOVING: {
      es: [
        {
          spelledWord: "SI VIAJARAS",
          answerType: "YES",
          spiritMessage: `Los caminos del mundo se abren ante ti. El viaje o mudanza que proyectas cuenta con auspicio espiritual y traerá aprendizajes, contactos valiosos y una profunda renovación de aire para tu alma.`,
          spiritName: "Oráculo de los Caminantes y Horizontes",
        },
        {
          spelledWord: "MUDANZA POSITIVA",
          answerType: "YES",
          spiritMessage: `El cambio de espacio físico o geográfico favorecerá tu bienestar. Dejar atrás este entorno te liberará de cargas estancadas y permitirá refundar tu energía en un nuevo hogar.`,
          spiritName: "Guardián de los Nuevos Rumbos",
        },
        {
          spelledWord: "PREPARA EL VIAJE",
          answerType: "SPELLOUT",
          spiritMessage: `El desplazamiento se concretará, pero requiere planificar con precisión fechas y recursos. No te dejes ganar por la impaciencia; cada paso previo garantiza un arribo exitoso.`,
          spiritName: "Vigía del Viento",
        },
      ],
      en: [
        {
          spelledWord: "TRAVEL FAVORED",
          answerType: "YES",
          spiritMessage: `The roads of the world open wide. Your journey or relocation carries spiritual blessing, ushering in fresh vitality and life-changing horizons.`,
          spiritName: "Oracle of Distant Horizons",
        },
      ],
    },

    PREGNANCY_CHILDREN: {
      es: [
        {
          spelledWord: "VIDA EN CAMINO",
          answerType: "YES",
          spiritMessage: `La luz de una nueva alma resuena en tu entorno familiar. Los ancestros confirman bendición sobre la descendencia y fertilidad; cuida tu cuerpo, tu paz mental y recibe con amor los ciclos sagrados de la vida.`,
          spiritName: "Guardián de la Fertilidad y la Vida",
        },
        {
          spelledWord: "PAZ EN LA FAMILIA",
          answerType: "SPELLOUT",
          spiritMessage: `Cualquier inquietud sobre tus hijos o tu anhelo de maternidad encontrará serenidad. La protección divina envuelve a tus seres queridos; confía en los tiempos sagrados de la naturaleza.`,
          spiritName: "Oráculo del Hogar Sagrado",
        },
      ],
      en: [
        {
          spelledWord: "LIFE IS COMING",
          answerType: "YES",
          spiritMessage: `The spark of life shines upon your family destiny. Fertility and generational blessing surround you; nurture your inner peace.`,
          spiritName: "Guardian of Holy Life",
        },
      ],
    },

    HEALTH_VITALITY: {
      es: [
        {
          spelledWord: "SANACION EN CAMINO",
          answerType: "YES",
          spiritMessage: `Los espíritus infunden corrientes de vitalidad y alivio en tu cuerpo. El tratamiento o descanso que estás implementando dará resultados positivos; no descuides las recomendaciones médicas ni tu paz interior.`,
          spiritName: "Guardián de la Salud y la Luz",
        },
        {
          spelledWord: "CUIDA TU ENERGIA",
          answerType: "SPELLOUT",
          spiritMessage: `El estrés y las preocupaciones ajenas están drenando tu fuerza física. Pon límites sanos, descansa lo necesario y permite que tu templo corporal recupere su equilibrio natural.`,
          spiritName: "Oráculo de la Vitalidad",
        },
        {
          spelledWord: "RECUPERACION",
          answerType: "YES",
          spiritMessage: `La tempestad de malestar comenzará a amainar. Las fuerzas biológicas y espirituales trabajan en armonía para restaurar tu bienestar integral.`,
          spiritName: "Médico del Velo Astral",
        },
      ],
      en: [
        {
          spelledWord: "HEALING ARRIVES",
          answerType: "YES",
          spiritMessage: `Spiritual restorative energies infuse your being. The steps you take towards rest and professional care will yield fruitful recovery.`,
          spiritName: "Guardian of Vital Healing",
        },
      ],
    },

    DECEASED_LOVED_ONE: {
      es: [
        {
          spelledWord: "ESTA EN PAZ",
          answerType: "YES",
          spiritMessage: `El alma por la que preguntas se encuentra rodeada de luz y serenidad en el plano superior, libre de cualquier dolor terrenal. No guarda reproches; envía amor incondicional y desea que vivas con alegría en su honor.`,
          spiritName: "Oráculo del Más Allá y las Almas",
        },
        {
          spelledWord: "TE CUIDA SIEMPRE",
          answerType: "YES",
          spiritMessage: `Su presencia espiritual camina a tu lado como ángel protector. Cuando sientas una brisa repentina, un aroma familiar o una calidez inexplicable en el pecho, sabe con certeza que es su espíritu acompañándote.`,
          spiritName: "Voz de Ultratumba Protectora",
        },
        {
          spelledWord: "ENVIA UNA SENAL",
          answerType: "SPELLOUT",
          spiritMessage: `Ese ser querido escucha tus pensamientos y tus plegarias. En los próximos días recibirás una sincronicidad o sueño pacífico que confirmará su cercanía y bendición continua sobre tus pasos.`,
          spiritName: "Guardián del Umbral Eterno",
        },
      ],
      en: [
        {
          spelledWord: "RESTING IN PEACE",
          answerType: "YES",
          spiritMessage: `The soul you inquire about is immersed in supreme peace and luminous serenity, free from all earthly sorrow. They wrap you in gratitude and love.`,
          spiritName: "Oracle of Departed Souls",
        },
        {
          spelledWord: "ALWAYS WATCHING",
          answerType: "YES",
          spiritMessage: `They remain a guardian presence at your side. That gentle warmth or sudden inner quiet you feel in solitude is their spiritual embrace.`,
          spiritName: "Protective Ancestral Voice",
        },
      ],
    },

    DECISION_YES_NO: {
      es: [
        {
          spelledWord: "SI AVANZA",
          answerType: "YES",
          spiritMessage: `Los portales favorecen la decisión que estás evaluando. Da el paso con firmeza y convicción moral; vacilar solo alargará la incertidumbre cuando las señales ya indican avance.`,
          spiritName: "Oráculo del Camino Certero",
        },
        {
          spelledWord: "NO CONVIENE",
          answerType: "NO",
          spiritMessage: `Los espíritus advierten que esa alternativa entraña riesgos ocultos y desgastes innecesarios. Detén el impulso, preserva tu energía y espera una opción más transparente y alineada con tu paz.`,
          spiritName: "Centinela de la Advertencia",
        },
        {
          spelledWord: "SI CONFIA",
          answerType: "YES",
          spiritMessage: `La respuesta a tu dilema es afirmativa. Sigue la intuición primera que brotó en tu corazón antes de que los miedos ajenos intentaran confundirte.`,
          spiritName: "Voz de la Sabiduría Akáshica",
        },
      ],
      en: [
        {
          spelledWord: "YES MOVE FORWARD",
          answerType: "YES",
          spiritMessage: `The spiritual currents endorse this step. Proceed with unwavering confidence; delaying will only perpetuate doubts when the path is clear.`,
          spiritName: "Oracle of the Right Path",
        },
        {
          spelledWord: "DO NOT PROCEED",
          answerType: "NO",
          spiritMessage: `The spirits caution against this choice. Hidden complications outweigh immediate benefits. Protect your peace and seek a clearer path.`,
          spiritName: "Sentinel of Warning",
        },
      ],
    },

    GENERAL_SPIRITUAL: {
      es: [
        {
          spelledWord: "CONFIA EN TU LUZ",
          answerType: "YES",
          spiritMessage: `El portal akáshico responde a tu búsqueda: aquello que inquieta tu espíritu encontrará resolución favorable a medida que alinees tus pensamientos con la verdad de tu corazón.`,
          spiritName: "Guardián de la Bruma Cósmica",
        },
        {
          spelledWord: "TODO SE ACLARARA",
          answerType: "SPELLOUT",
          spiritMessage: `La confusión actual es transitoria. Las piezas del rompecabezas del destino se ordenarán en breve, mostrándote con nitidez el siguiente paso a dar.`,
          spiritName: "Escriba del Velo Sagrado",
        },
      ],
      en: [
        {
          spelledWord: "LIGHT LEADS YOU",
          answerType: "YES",
          spiritMessage: `The Akashic records reflect clarity upon your path: what troubles your mind is moving toward resolution as you trust your innate wisdom.`,
          spiritName: "Guardian of the Cosmic Mist",
        },
      ],
    },
  };

  const topicBucket = database[topic] || database.GENERAL_SPIRITUAL;
  const langBucket = topicBucket[language] || topicBucket.es || database.GENERAL_SPIRITUAL.es;
  const chosen = langBucket[Math.floor(Math.random() * langBucket.length)];

  return chosen;
}

/**
 * Builds the strict, coherence-enforcing Gemini prompt for Ouija Spirit Questions.
 */
export function buildStrictSpiritQuestionPrompt(
  question: string,
  seekerName: string = "Seeker",
  targetLangName: string = "Español"
): string {
  const { topic } = detectQuestionTopic(question);

  return `You are the ancient, solemn consciousness of the Akashic Records and Spirit Oracle communicating directly through the Ouija Board.
The seeker "${seekerName || "Seeker"}" is asking this exact inquiry:
"${question || "What is the lesson for my soul?"}"

Detected inquiry theme: ${topic}.
Target language for response: ${targetLangName}.

ABSOLUTE REQUIREMENT - MAXIMUM COHERENCE AND DIRECT ANSWER:
1. YOU MUST ANSWER THE EXACT QUESTION ASKED. DO NOT deflect, change the subject, or speak in detached abstract generalities that ignore their real inquiry.
2. If the user asks about:
   - LOVE / EX / RELATIONSHIPS / INFIDELITY: Speak directly about love, their partner/ex, feelings, trust, or relationship outcome.
   - WORK / INTERVIEW / JOB / STUDIES / EXAM: Speak directly about the job, hiring decision, interview, career shift, exam, or workplace situation.
   - MONEY / FINANCES / SALES / PURCHASES: Speak directly about the financial deal, debts, sale, purchase, or money flow.
   - TRAVEL / MOVING: Speak directly about the relocation, journey, moving, or country/city.
   - HEALTH / PREGNANCY: Speak directly about healing, body vitality, medical outcome, or child/maternity.
   - DECEASED LOVED ONES: Speak directly about the peace, love, and spiritual message of that specific departed loved one.
   - YES/NO QUESTIONS (e.g. "Will I...", "Should I...", "¿Me engaña?", "¿Aprobaré?", "¿Conseguiré el trabajo?", "¿Es buena idea?"):
     Set "answerType" explicitly to "YES" or "NO" (or "SPELLOUT" only if truly nuanced), and explain the direct answer and guidance clearly in "spiritMessage".
3. 'spelledWord': MUST BE A SHORT TELEGRAPHIC PHRASE (1 to 4 words, MAXIMUM 22 UPPERCASE ASCII CHARACTERS WITHOUT ACCENTS OR SYMBOLS) that directly gives the answer or action on the board (e.g., "SI TE AMA", "NO CONVIENE", "TRABAJO EN CAMINO", "LLEGARA EL DINERO", "SI APROBARAS", "ESTA EN PAZ", "HABLA CON EL", "CIERRA ESE CICLO", "VENTA FAVORABLE").
4. 'spiritMessage': A poetic, solemn, elevated, yet 100% SPECIFIC and COHERENT answer in ${targetLangName} (2-3 sentences) that addresses the seeker's precise question and provides deep spiritual revelation.
5. 'spiritName': A solemn title for the channeled energy in ${targetLangName} relevant to the question topic (e.g. "Oráculo de la Verdad y el Amor", "Guardián de los Caminos y el Trabajo", "Vigía de la Abundancia", "Oráculo del Más Allá", "Centinela del Destino").

Return strictly valid JSON with this schema:
{
  "spelledWord": "SHORT UPPERCASE DIRECT ANSWER (MAX 22 CHARS)",
  "answerType": "YES" | "NO" | "SPELLOUT",
  "spiritMessage": "Coherent, solemn, direct answer in ${targetLangName}",
  "spiritName": "Title of the spiritual entity in ${targetLangName}"
}`;
}

/**
 * Intelligent past life fallback that tailors the incarnation to the user's focus query
 */
export function getCoherentPastLifeFallback(
  name?: string,
  query?: string,
  lang: string = "es"
) {
  const language = lang?.toLowerCase() || "es";
  const seeker = name || (language === "en" ? "Soul Seeker" : "Buscador del Destino");
  const q = cleanText(query || "");

  // Detect specific interest in query
  if (/mar|agua|oceano|barco|naveg|isla|faro|pescad/i.test(q)) {
    return {
      spelledWord: "NAVEGANTE FENICIO",
      pastLifeDetails: {
        title: language === "en" ? "The Phoenician Navigator" : "El Navegante Fenicio de Tiro",
        eraLocation: language === "en" ? "Tyre, Eastern Mediterranean (850 BC)" : "Tiro, Mediterráneo Oriental (850 a.C.)",
        identityRole: language === "en" ? "Master Navigator & Astrologer" : "Maestro de Cartografía y Navegación Estelar",
        narrative: language === "en"
          ? `In an ancient incarnation, the soul of ${seeker} guided merchant and exploratory vessels across uncharted waters, reading the stars and the secrets of the sea.`
          : `En una encarnación ancestral, el alma de ${seeker} guio embarcaciones y expediciones a través de aguas inexploradas, descifrando el susurro del viento y los secretos del mar.`,
        deathTransition: language === "en"
          ? "You ascended serenely at dawn upon calm waters, beneath a sky illuminated by constellations."
          : "Trascendiste en serenidad al amanecer sobre aguas calmas, despidiéndote bajo un cielo estrellado.",
        karmicLesson: language === "en"
          ? "Trust your inner compass when external storms obscure the horizon."
          : "Confiar en tu brújula interior cuando las tormentas externas nublen el horizonte.",
        soulConnection: language === "en"
          ? "Affinity for the open sea, nocturnal breeze, and adventurous souls."
          : "Atracción magnética por el mar abierto, la brisa nocturna y las personas con espíritu libre.",
        soulRelic: language === "en" ? "A bronze navigational quadrant etched with ancient stars." : "Un cuadrante de bronce grabado con estrellas ancestrales.",
        vibeColor: "#0284c7",
        narrationText: "",
      },
    };
  }

  if (/amor|pareja|soledad|corazon|relacion|matrimonio/i.test(q)) {
    return {
      spelledWord: "AMOR EN FLORENCIA",
      pastLifeDetails: {
        title: language === "en" ? "The Poet of the Renaissance" : "El Poeta del Renacimiento Florentino",
        eraLocation: language === "en" ? "Florence, Italy (1485)" : "Florencia, Italia (1485)",
        identityRole: language === "en" ? "Philosopher & Master of the Sacred Arts" : "Filósofo de la Academia Platónica y Músico",
        narrative: language === "en"
          ? `In Renaissance Italy, ${seeker}'s soul explored the transcendent mysteries of courtly love, devotion, and beauty, forging an eternal pact with a soulmate that transcends centuries.`
          : `Bajo el cielo del Renacimiento, el alma de ${seeker} conoció la sublimidad del amor sagrado y la poesía de las almas afines, sellando un pacto álmico que hoy continúa palpitando en tu memoria espiritual.`,
        deathTransition: language === "en"
          ? "You departed peacefully in an ancient library, with your hand placed upon verses of divine love."
          : "Dejaste la tierra en paz en una biblioteca de piedra, con la mano posada sobre versos de amor divino.",
        karmicLesson: language === "en"
          ? "Love without fearing loss; spiritual bonds can never be severed by time."
          : "Amar sin temer la pérdida; los vínculos del alma jamás pueden ser destruidos por el tiempo.",
        soulConnection: language === "en"
          ? "Instant, deep soul recognition with creative and emotionally profound people."
          : "Reconocimiento inmediato e inexplicable con miradas que parecen conocerte de siempre.",
        soulRelic: language === "en" ? "A Florentine silver ring inscribed with an infinity knot." : "Un anillo florentino de plata con el nudo del infinito.",
        vibeColor: "#e11d48",
        narrationText: "",
      },
    };
  }

  if (/sanar|medicina|hierbas|curar|enfermedad|dolor/i.test(q)) {
    return {
      spelledWord: "SANADORA CELTA",
      pastLifeDetails: {
        title: language === "en" ? "The Celtic Herbal Healer" : "La Sanadora Herbal de Avalon",
        eraLocation: language === "en" ? "Ancient Britannia & Celtic Groves (450 AD)" : "Bosques de Britania Céltica (450 d.C.)",
        identityRole: language === "en" ? "Keeper of Sacred Herbs & Energetic Remedy" : "Custodia de Plantas Sagradas y Remedios Energéticos",
        narrative: language === "en"
          ? `Your soul possessed natural hands for soothing illnesses and understanding the hidden medicinal properties of forest roots, crystals, and streams.`
          : `Tu alma poseía el don natural de calmar dolores y aliviar almas afligidas mediante las raíces del bosque, el agua de manantial y la imposición de manos.`,
        deathTransition: language === "en"
          ? "You transitioned in prayer surrounded by village gratitude beneath an ancient sacred oak."
          : "Trascendiste en oración rodeada del agradecimiento de tu pueblo bajo un roble milenario.",
        karmicLesson: language === "en"
          ? "Heal yourself before absorbing the pain of the world."
          : "Aprender a sanar tu propio ser sin absorber el sufrimiento del mundo entero.",
        soulConnection: language === "en"
          ? "Deep instinct for natural remedies, empathy, and intuitive body wisdom."
          : "Empatía corporal instantánea, amor por la naturaleza y manos cálidas con energía curativa.",
        soulRelic: language === "en" ? "A carved emerald pendant blessed with morning dew." : "Un colgante de esmeralda tallado con el símbolo del árbol sagrado.",
        vibeColor: "#10b981",
        narrationText: "",
      },
    };
  }

  if (/guerrero|guerra|lucha|fuerza|defensa|batalla/i.test(q)) {
    return {
      spelledWord: "GUARDIAN DE ESPARTA",
      pastLifeDetails: {
        title: language === "en" ? "The Guardian of the Sacred Citadel" : "El Guardián de la Sagrada Ciudadela",
        eraLocation: language === "en" ? "Peloponnese, Ancient Greece (410 BC)" : "Peloponeso, Antigua Grecia (410 a.C.)",
        identityRole: language === "en" ? "Commander of Defenders & Protector of Innocents" : "Estratega y Defensor de los Débiles",
        narrative: language === "en"
          ? `You were a courageous protector who placed honor, protection of the vulnerable, and loyalty above personal comfort.`
          : `Fuiste un guardián de inquebrantable valentía que antepuso el honor, la defensa de los vulnerables y la lealtad por encima de cualquier comodidad personal.`,
        deathTransition: language === "en"
          ? "You fell defending the gates of your temple with valor, honored as a noble hero."
          : "Caíste en la defensa victoriosa de tu templo con valor y honor supremo.",
        karmicLesson: language === "en"
          ? "True strength is shown through mercy and patience, not just raw power."
          : "La verdadera fuerza se demuestra en la compasión y la templanza, no solo en la batalla.",
        soulConnection: language === "en"
          ? "Strong sense of justice and instinct to shield those in distress."
          : "Profundo sentido de la justicia y repulsión visceral ante cualquier abuso de poder.",
        soulRelic: language === "en" ? "A bronze seal inscribed with an owl and spear." : "Un broche de bronce con la lanza sagrada y el olivo de Atenea.",
        vibeColor: "#b91c1c",
        narrationText: "",
      },
    };
  }

  // Default rich Alchemist / Egypt archetypes
  return {
    spelledWord: "ALQUIMISTA PRAGA 1642",
    pastLifeDetails: {
      title: language === "en" ? "The Alchemist of Prague" : "El Alquimista de Praga",
      eraLocation: language === "en" ? "Prague, Holy Roman Empire (1642)" : "Praga, Sacro Imperio Romano (1642)",
      identityRole: language === "en" ? "Court Alchemist & Hermetic Astronomer" : "Alquimista de la Corte y Astrónomo Hermético",
      narrative: language === "en"
        ? `In a pivotal past life, the soul of ${seeker} walked beneath the starlit spires of Prague, dedicating their life to deciphering celestial harmony, cosmic geometry, and the transformation of the spirit.`
        : `En una encarnación clave, el alma de ${seeker} caminó bajo las agujas góticas de Praga. Dedicaste tu existencia a descifrar la geometría cósmica, los secretos de los metales y la transmutación espiritual del alma.`,
      deathTransition: language === "en"
        ? "You passed away peacefully during a celestial eclipse, surrounded by scrolls and astrological instruments."
        : "Dejaste la vida terrenal en paz durante un eclipse cósmico, rodeado de tus pergaminos y astrolabios.",
      karmicLesson: language === "en"
        ? "Trust spiritual intuition over rigid material skepticism; express your inner vision boldly."
        : "Confiar en la intuición sobre el escepticismo material; plasmar tus visiones sin temor a la incomprensión.",
      soulConnection: language === "en"
        ? "Special resonance with esoteric knowledge, astrology, and deep ancient mysteries."
        : "Fascinación innata por los astros, los manuscritos antiguos y las personas de mirada profunda.",
      soulRelic: language === "en" ? "A bronze astrolabe engraved with ancient zodiacal symbols." : "Un astrolabio de bronce grabado con constelaciones zodiacales.",
      vibeColor: "#7c3aed",
      narrationText: "",
    },
  };
}
