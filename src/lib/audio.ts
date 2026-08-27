/**
 * Mystical Web Audio API Sound Synthesizer for Ouija Board
 */

export interface VoiceOption {
  name: string;
  lang: string;
  voiceURI: string;
  isPreferredMale: boolean;
}

class OuijaAudioEngine {
  private ctx: AudioContext | null = null;
  private droneGain: GainNode | null = null;
  private isMuted: boolean = false;
  private isDroneRunning: boolean = false;
  private selectedVoiceURI: string | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.droneGain && this.ctx) {
      this.droneGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
    } else if (!muted && this.droneGain && this.ctx && this.isDroneRunning) {
      this.droneGain.gain.setTargetAtTime(0.12, this.ctx.currentTime, 0.5);
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public toggleDrone(): boolean {
    this.initContext();
    if (!this.ctx) return false;

    if (this.isDroneRunning) {
      this.stopDrone();
      return false;
    } else {
      this.startDrone();
      return true;
    }
  }

  public startDrone() {
    this.initContext();
    if (!this.ctx || this.isDroneRunning) return;

    try {
      this.isDroneRunning = true;
      const now = this.ctx.currentTime;

      // Master drone gain
      this.droneGain = this.ctx.createGain();
      this.droneGain.gain.setValueAtTime(this.isMuted ? 0 : 0.01, now);
      this.droneGain.gain.exponentialRampToValueAtTime(this.isMuted ? 0 : 0.12, now + 3);
      this.droneGain.connect(this.ctx.destination);

      // Low binaural frequencies (432Hz & 436Hz)
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const subOsc = this.ctx.createOscillator();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(108, now); // Sub-harmonic of 432Hz

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(109.5, now); // Slight beat frequency for ethereal feel

      subOsc.type = 'triangle';
      subOsc.frequency.setValueAtTime(54, now); // Deep bass floor

      // Low pass filter
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(220, now);

      osc1.connect(filter);
      osc2.connect(filter);
      subOsc.connect(filter);
      filter.connect(this.droneGain);

      osc1.start(now);
      osc2.start(now);
      subOsc.start(now);
    } catch (e) {
      console.warn("Audio drone start error", e);
    }
  }

  public stopDrone() {
    if (!this.ctx || !this.droneGain) return;
    this.isDroneRunning = false;
    const now = this.ctx.currentTime;
    this.droneGain.gain.setTargetAtTime(0, now, 0.5);
  }

  public playWoodSlide() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // White noise buffer for friction sound
      const bufferSize = this.ctx.sampleRate * 0.12;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(450 + Math.random() * 150, now);
      filter.Q.setValueAtTime(1.5, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(now);
    } catch (e) {
      // ignore
    }
  }

  public playChime(freq = 528) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.98, now + 1.2);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 1.5);
    } catch (e) {
      // ignore
    }
  }

  public playMysticSwell() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(144, now);
      osc.frequency.exponentialRampToValueAtTime(288, now + 1.5);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(150, now);
      filter.frequency.exponentialRampToValueAtTime(1200, now + 1.2);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.8);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 1.8);
    } catch (e) {
      // ignore
    }
  }

  public playCardShuffle() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // Quick flutter noise simulating card deck riffle / shuffle
      for (let i = 0; i < 5; i++) {
        const offset = i * 0.045;
        const bufferSize = Math.floor(this.ctx.sampleRate * 0.04);
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let j = 0; j < bufferSize; j++) {
          data[j] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(850 + i * 140, now + offset);
        filter.Q.setValueAtTime(2.2, now + offset);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.07, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.04);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        noise.start(now + offset);
      }
    } catch (e) {
      // ignore
    }
  }

  public playFullDeckShuffle() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      // Realistic multi-wave deck shuffling: 4 waves of rapid riffle cuts + air swoosh
      const waveDelays = [0, 0.35, 0.7, 1.05, 1.35];
      waveDelays.forEach((waveDelay, wIdx) => {
        const waveBaseTime = this.ctx!.currentTime + waveDelay;
        const count = 6 + (wIdx % 3);
        for (let i = 0; i < count; i++) {
          const offset = waveBaseTime + i * 0.032;
          const bufferSize = Math.floor(this.ctx!.sampleRate * 0.035);
          const buffer = this.ctx!.createBuffer(1, bufferSize, this.ctx!.sampleRate);
          const data = buffer.getChannelData(0);
          for (let j = 0; j < bufferSize; j++) {
            data[j] = Math.random() * 2 - 1;
          }

          const noise = this.ctx!.createBufferSource();
          noise.buffer = buffer;

          const filter = this.ctx!.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(700 + ((i + wIdx * 3) % 8) * 160, offset);
          filter.Q.setValueAtTime(2.4, offset);

          const gain = this.ctx!.createGain();
          gain.gain.setValueAtTime(0.08, offset);
          gain.gain.exponentialRampToValueAtTime(0.001, offset + 0.032);

          noise.connect(filter);
          filter.connect(gain);
          gain.connect(this.ctx!.destination);

          noise.start(offset);
        }
      });
    } catch (e) {
      // ignore
    }
  }

  public playTarotReveal() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // Harmonic chord 432Hz & 540Hz & 648Hz (Cosmic Triad)
      [432, 540, 648].forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.01, now + 2.2);

        gain.gain.setValueAtTime(0.07 / (idx + 1), now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.4);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 2.4);
      });
    } catch (e) {
      // ignore
    }
  }

  /**
   * Identifies the best solemn male voice available in the browser/OS for the target language.
   */
  public getBestSolemnMaleVoice(targetLang: string = "es"): SpeechSynthesisVoice | null {
    if (!('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    // Check user chosen voice first
    if (this.selectedVoiceURI) {
      const custom = voices.find(v => v.voiceURI === this.selectedVoiceURI);
      if (custom) return custom;
    }

    const langPrefix = targetLang.slice(0, 2).toLowerCase();

    // Female names and terms to strictly exclude across all OS voices
    const femaleNames = [
      "monica", "mónica", "sabina", "lucia", "lucía", "marisol", "marta", "conchita",
      "esperanza", "paloma", "victoria", "laura", "helena", "mia", "mía",
      "rosa", "penelope", "penélope", "carmen", "soledad", "pilar", "isabel",
      "paulina", "fernanda", "jimena", "ximena", "sofia", "sofía", "camila",
      "valeria", "elena", "dalia", "salma", "lupe", "luisa", "female", "zira",
      "samantha", "karen", "susan", "victoria", "agnes", "alice", "alva", "amélie", "anna",
      "aurora", "carmit", "damayanti", "fiona", "ioana", "joana", "kyoko", "lekha", "luciana",
      "maged", "mariska", "meijia", "melina", "milena", "moira", "monica", "nora", "paulina",
      "sara", "satu", "sin-ji", "tessa", "ting-ting", "veena", "yelda", "yuna", "zuzana",
      "mujer", "girl", "lady", "woman", "her", "she", "zira", "yolda"
    ];

    // Language-specific voices filter
    const langVoices = voices.filter(v => 
      v.lang.toLowerCase().startsWith(langPrefix)
    );

    // Male keywords
    const maleKeywords = [
      "jorge", "carlos", "miguel", "pablo", "diego", "enrique", "juan",
      "gonzalo", "rodrigo", "raul", "raúl", "alberto", "david", "lorenzo",
      "alvaro", "álvaro", "mateo", "alonso", "felipe", "manuel", "javier",
      "hector", "héctor", "andres", "andrés", "mario", "julio", "sergio", "ricardo",
      "daniel", "george", "thomas", "oliver", "alexander", "fred", "guy",
      "henri", "nicolas", "jean", "paul", "pierre", "lucas", "gabriel", "felipe",
      "matteo", "luca", "marco", "stefano", "giovanni", "hans", "stefan", "markus",
      "male", "hombre", "masculino", "homme", "maschile", "männlich"
    ];

    // Priority 1: Specifically matched language male voice
    const matchedMale = langVoices.find(v => {
      const name = v.name.toLowerCase();
      const uri = v.voiceURI.toLowerCase();
      const isMale = maleKeywords.some(k => name.includes(k) || uri.includes(k));
      const isFemale = femaleNames.some(f => name.includes(f) || uri.includes(f));
      return isMale && !isFemale;
    });
    if (matchedMale) return matchedMale;

    // Priority 2: Language voice strictly avoiding female keywords
    const strictlyNonFemale = langVoices.find(v => {
      const name = v.name.toLowerCase();
      const uri = v.voiceURI.toLowerCase();
      const isFemale = femaleNames.some(f => name.includes(f) || uri.includes(f));
      return !isFemale;
    });
    if (strictlyNonFemale) return strictlyNonFemale;

    if (langVoices.length > 0) return langVoices[0];

    // Fallback: any male voice on device
    const anyDeviceMaleVoice = voices.find(v => {
      const name = v.name.toLowerCase();
      const uri = v.voiceURI.toLowerCase();
      const isMale = maleKeywords.some(k => name.includes(k) || uri.includes(k));
      const isFemale = femaleNames.some(f => name.includes(f) || uri.includes(f));
      return isMale && !isFemale;
    });
    return anyDeviceMaleVoice || voices[0] || null;
  }

  public getAvailableMaleVoices(targetLang: string = "es"): VoiceOption[] {
    if (!('speechSynthesis' in window)) return [];
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return [];

    const femaleNames = [
      "monica", "mónica", "sabina", "lucia", "lucía", "marisol", "marta", "conchita",
      "esperanza", "paloma", "victoria", "laura", "helena", "mia", "rosa",
      "penelope", "carmen", "soledad", "pilar", "isabel", "paulina", "fernanda",
      "sofia", "camila", "valeria", "elena", "dalia", "salma", "female", "mujer"
    ];

    const maleKeywords = [
      "jorge", "carlos", "miguel", "pablo", "diego", "enrique", "juan",
      "gonzalo", "rodrigo", "raul", "alberto", "david", "lorenzo", "alvaro",
      "mateo", "alonso", "felipe", "manuel", "javier", "hector", "andres",
      "mario", "julio", "sergio", "ricardo", "esteban", "daniel", "george", "thomas",
      "male", "hombre", "masculino"
    ];

    const prefix = targetLang.slice(0, 2).toLowerCase();

    return voices
      .filter(v => v.lang.toLowerCase().startsWith(prefix))
      .filter(v => !femaleNames.some(f => v.name.toLowerCase().includes(f)))
      .map(v => ({
        name: v.name,
        lang: v.lang,
        voiceURI: v.voiceURI,
        isPreferredMale: maleKeywords.some(k => v.name.toLowerCase().includes(k)),
      }));
  }

  public setSelectedVoiceURI(uri: string | null) {
    this.selectedVoiceURI = uri;
  }

  public getSelectedVoiceURI(): string | null {
    return this.selectedVoiceURI;
  }

  public testMaleVoice(onStart?: () => void, onEnd?: () => void) {
    this.speakSpiritText(
      "Soy la voz de los Registros Akáshicos. El oráculo está consagrado y listo para revelar tus encarnaciones pasadas.",
      onStart,
      onEnd
    );
  }

  private isSpeakingTarot: boolean = false;
  private currentTarotQueue: Array<{ section: string; text: string }> = [];
  private currentTarotIndex: number = 0;

  public stopTarotNarration() {
    this.isSpeakingTarot = false;
    this.currentTarotQueue = [];
    this.currentTarotIndex = 0;
    this.stopSpeech();
  }

  public isTarotSpeaking(): boolean {
    return this.isSpeakingTarot;
  }

  public speakTarotInterpretation(
    arcana: {
      romanNumber: string;
      name: string;
      marseilleTitle?: string;
      archetype: string;
      element: string;
      astrologicalSign: string;
      dailyMessage: string;
      marseilleDetails?: string;
      lightAspect?: string;
      shadowAspect?: string;
      practicalAdvice: string;
      dailyAffirmation: string;
      meditationQuestion?: string;
    },
    callbacks?: {
      onStart?: () => void;
      onSectionChange?: (section: string, text: string) => void;
      onEnd?: () => void;
    },
    voiceSpeed: number = 0.82,
    targetLang: string = "es"
  ) {
    if (this.isMuted) {
      if (callbacks?.onEnd) callbacks.onEnd();
      return;
    }
    if (!('speechSynthesis' in window)) {
      console.warn("Speech synthesis not available");
      if (callbacks?.onEnd) callbacks.onEnd();
      return;
    }

    this.stopTarotNarration();
    this.initContext();
    this.playChime(432);

    const langCode = targetLang.slice(0, 2).toLowerCase();

    // Localized prompt wrappers
    let introPrefix = `Arcano número ${arcana.romanNumber}: ${arcana.name}.`;
    let msgPrefix = `Mensaje sagrado: ${arcana.dailyMessage}`;
    let lightShadowPrefix = `Luz: ${arcana.lightAspect || ""}. Sombra: ${arcana.shadowAspect || ""}.`;
    let advicePrefix = `Consejo: ${arcana.practicalAdvice}`;
    let affirmPrefix = `Afirmación: ${arcana.dailyAffirmation}. Meditación: ${arcana.meditationQuestion || ""}`;

    if (langCode === "en") {
      introPrefix = `Arcana number ${arcana.romanNumber}: ${arcana.name}. ${arcana.archetype}. Element: ${arcana.element}, ruled by ${arcana.astrologicalSign}.`;
      msgPrefix = `Sacred message from the Akashic Records: ${arcana.dailyMessage}`;
      lightShadowPrefix = `Light aspect: ${arcana.lightAspect || ""}. Shadow aspect: ${arcana.shadowAspect || ""}.`;
      advicePrefix = `Practical guidance: ${arcana.practicalAdvice}`;
      affirmPrefix = `Cosmic affirmation: ${arcana.dailyAffirmation}. Reflection: ${arcana.meditationQuestion || ""}`;
    } else if (langCode === "pt") {
      introPrefix = `Arcano número ${arcana.romanNumber}: ${arcana.name}. ${arcana.archetype}.`;
      msgPrefix = `Mensagem sagrada dos Registros: ${arcana.dailyMessage}`;
      lightShadowPrefix = `Luz: ${arcana.lightAspect || ""}. Sombra: ${arcana.shadowAspect || ""}.`;
      advicePrefix = `Conselho prático: ${arcana.practicalAdvice}`;
      affirmPrefix = `Afirmação cósmica: ${arcana.dailyAffirmation}.`;
    } else if (langCode === "fr") {
      introPrefix = `Arcane numéro ${arcana.romanNumber}: ${arcana.name}. ${arcana.archetype}.`;
      msgPrefix = `Message sacré des Annales: ${arcana.dailyMessage}`;
      lightShadowPrefix = `Lumière: ${arcana.lightAspect || ""}. Ombre: ${arcana.shadowAspect || ""}.`;
      advicePrefix = `Conseil pratique: ${arcana.practicalAdvice}`;
      affirmPrefix = `Affirmation cosmique: ${arcana.dailyAffirmation}.`;
    } else if (langCode === "it") {
      introPrefix = `Arcano numero ${arcana.romanNumber}: ${arcana.name}. ${arcana.archetype}.`;
      msgPrefix = `Messaggio sacro: ${arcana.dailyMessage}`;
      lightShadowPrefix = `Luce: ${arcana.lightAspect || ""}. Ombra: ${arcana.shadowAspect || ""}.`;
      advicePrefix = `Consiglio pratico: ${arcana.practicalAdvice}`;
      affirmPrefix = `Affermazione cosmica: ${arcana.dailyAffirmation}.`;
    } else if (langCode === "de") {
      introPrefix = `Arkana Nummer ${arcana.romanNumber}: ${arcana.name}. ${arcana.archetype}.`;
      msgPrefix = `Botschaft der Akasha-Chronik: ${arcana.dailyMessage}`;
      lightShadowPrefix = `Licht: ${arcana.lightAspect || ""}. Schatten: ${arcana.shadowAspect || ""}.`;
      advicePrefix = `Praktischer Rat: ${arcana.practicalAdvice}`;
      affirmPrefix = `Kosmische Affirmation: ${arcana.dailyAffirmation}.`;
    }

    const sections: Array<{ section: string; text: string }> = [
      { section: "INTRO", text: introPrefix },
      { section: "MESSAGE", text: msgPrefix },
      { section: "MARSEILLE", text: arcana.marseilleDetails || arcana.archetype },
      { section: "LIGHT_SHADOW", text: lightShadowPrefix },
      { section: "ADVICE", text: advicePrefix },
      { section: "AFFIRMATION", text: affirmPrefix }
    ];

    this.isSpeakingTarot = true;
    this.currentTarotQueue = sections;
    this.currentTarotIndex = 0;

    if (callbacks?.onStart) callbacks.onStart();

    const synth = window.speechSynthesis;
    const playNext = () => {
      if (!this.isSpeakingTarot) {
        if (callbacks?.onEnd) callbacks.onEnd();
        return;
      }

      if (this.currentTarotIndex >= this.currentTarotQueue.length) {
        this.isSpeakingTarot = false;
        if (callbacks?.onEnd) callbacks.onEnd();
        return;
      }

      const item = this.currentTarotQueue[this.currentTarotIndex];
      if (callbacks?.onSectionChange) {
        callbacks.onSectionChange(item.section, item.text);
      }

      try {
        if (synth.paused) synth.resume();
        synth.cancel();

        const utterance = new SpeechSynthesisUtterance(item.text);
        utterance.rate = voiceSpeed;
        utterance.pitch = 0.62;
        utterance.volume = 1.0;

        const selectedVoice = this.getBestSolemnMaleVoice(targetLang);
        if (selectedVoice) {
          utterance.voice = selectedVoice;
          utterance.lang = selectedVoice.lang || targetLang;
        } else {
          utterance.lang = targetLang;
        }

        utterance.onend = () => {
          if (!this.isSpeakingTarot) return;
          this.currentTarotIndex++;
          setTimeout(() => {
            playNext();
          }, 350);
        };

        utterance.onerror = (e) => {
          console.warn("Utterance error during tarot narration:", e);
          if (!this.isSpeakingTarot) return;
          this.currentTarotIndex++;
          setTimeout(playNext, 200);
        };

        setTimeout(() => {
          synth.speak(utterance);
        }, 50);
      } catch (err) {
        console.warn("Speech synthesis error in playNext:", err);
        this.isSpeakingTarot = false;
        if (callbacks?.onEnd) callbacks.onEnd();
      }
    };

    setTimeout(() => {
      playNext();
    }, 150);
  }

  public speakSpiritText(text: string, onStart?: () => void, onEnd?: () => void, targetLang: string = "es") {
    if (this.isMuted) return;
    if (!('speechSynthesis' in window)) {
      console.warn("Speech synthesis not available in window");
      return;
    }

    try {
      const synth = window.speechSynthesis;
      if (synth.paused) synth.resume();
      synth.cancel();

      const speakAction = () => {
        try {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = 0.82;
          utterance.pitch = 0.62;
          utterance.volume = 1.0;

          const selectedVoice = this.getBestSolemnMaleVoice(targetLang);
          if (selectedVoice) {
            utterance.voice = selectedVoice;
            utterance.lang = selectedVoice.lang || targetLang;
          } else {
            utterance.lang = targetLang;
          }

          utterance.onstart = () => {
            if (onStart) onStart();
          };
          utterance.onend = () => {
            if (onEnd) onEnd();
          };
          utterance.onerror = (err) => {
            console.warn("Utterance error:", err);
            if (onEnd) onEnd();
          };

          synth.speak(utterance);
        } catch (err) {
          console.warn("Error inside speakAction:", err);
          if (onEnd) onEnd();
        }
      };

      setTimeout(speakAction, 50);

      // If voices are not loaded yet, listen for onvoiceschanged
      if (synth.getVoices().length === 0 && 'onvoiceschanged' in synth) {
        synth.onvoiceschanged = () => {
          // voices loaded
        };
      }
    } catch (e) {
      console.warn("Speech synthesis error", e);
    }
  }

  public stopSpeech() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const audio = new OuijaAudioEngine();

