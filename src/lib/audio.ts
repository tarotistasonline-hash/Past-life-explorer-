/**
 * Mystical Web Audio API Sound Synthesizer for Ouija Board
 */

export interface VoiceOption {
  name: string;
  lang: string;
  voiceURI: string;
  isPreferredMale: boolean;
}

export type VoiceStyle = "ultratumba" | "solemn" | "spectral" | "ancient";

export interface VoiceSettings {
  style: VoiceStyle;
  pitch: number;
  rate: number;
  cavernReverb: boolean;
}

export const VOICE_STYLE_PRESETS: Record<VoiceStyle, { pitch: number; rate: number; cavernReverb: boolean }> = {
  ultratumba: { pitch: 0.60, rate: 0.78, cavernReverb: true },
  solemn: { pitch: 0.75, rate: 0.82, cavernReverb: false },
  spectral: { pitch: 0.65, rate: 0.74, cavernReverb: true },
  ancient: { pitch: 0.55, rate: 0.70, cavernReverb: true },
};

class OuijaAudioEngine {
  private ctx: AudioContext | null = null;
  private droneGain: GainNode | null = null;
  private cavernGain: GainNode | null = null;
  private cavernNodes: any[] = [];
  private isMuted: boolean = false;
  private isDroneRunning: boolean = false;
  private selectedAiVoice: string = (() => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        return localStorage.getItem("ouija_ai_voice") || "Fenrir";
      }
    } catch {
      // ignore
    }
    return "Fenrir";
  })();
  private currentAudioElement: HTMLAudioElement | null = null;
  private selectedVoiceURI: string | null = (() => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        return localStorage.getItem("ouija_preferred_voice_uri") || null;
      }
    } catch {
      // ignore
    }
    return null;
  })();
  private voiceSettings: VoiceSettings = this.loadVoiceSettings();

  private loadVoiceSettings(): VoiceSettings {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const saved = localStorage.getItem("ouija_voice_settings");
        if (saved) {
          const parsed = JSON.parse(saved);
          return {
            style: parsed.style || "ultratumba",
            pitch: typeof parsed.pitch === "number" ? parsed.pitch : 0.60,
            rate: typeof parsed.rate === "number" ? parsed.rate : 0.78,
            cavernReverb: parsed.cavernReverb !== undefined ? parsed.cavernReverb : true,
          };
        }
      }
    } catch {
      // ignore
    }
    return {
      style: "ultratumba",
      pitch: 0.60,
      rate: 0.78,
      cavernReverb: true,
    };
  }

  public getVoiceSettings(): VoiceSettings {
    return { ...this.voiceSettings };
  }

  public setVoiceSettings(newSettings: Partial<VoiceSettings>) {
    this.voiceSettings = {
      ...this.voiceSettings,
      ...newSettings,
    };
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem("ouija_voice_settings", JSON.stringify(this.voiceSettings));
      }
    } catch {
      // ignore
    }
  }

  public setVoiceStyle(style: VoiceStyle) {
    const preset = VOICE_STYLE_PRESETS[style] || VOICE_STYLE_PRESETS.ultratumba;
    this.setVoiceSettings({
      style,
      pitch: preset.pitch,
      rate: preset.rate,
      cavernReverb: preset.cavernReverb,
    });
  }

  public startCavernResonance() {
    if (this.isMuted || !this.voiceSettings.cavernReverb) return;
    this.initContext();
    if (!this.ctx) return;

    this.stopCavernResonance();

    try {
      const now = this.ctx.currentTime;
      this.cavernGain = this.ctx.createGain();
      this.cavernGain.gain.setValueAtTime(0.001, now);
      this.cavernGain.gain.linearRampToValueAtTime(0.048, now + 0.4);
      this.cavernGain.connect(this.ctx.destination);

      // Low ghostly sub-frequencies (48Hz and 72Hz for deep tomb atmosphere)
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(48, now);
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(72, now);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(140, now);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(this.cavernGain);

      // Spectral wind / cold crypt breeze buffer
      const bufferSize = Math.floor(this.ctx.sampleRate * 2);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.18;
      }
      const windSource = this.ctx.createBufferSource();
      windSource.buffer = buffer;
      windSource.loop = true;

      const windFilter = this.ctx.createBiquadFilter();
      windFilter.type = 'bandpass';
      windFilter.frequency.setValueAtTime(260, now);
      windFilter.Q.setValueAtTime(3.2, now);

      const windGain = this.ctx.createGain();
      windGain.gain.setValueAtTime(0.015, now);

      windSource.connect(windFilter);
      windFilter.connect(windGain);
      windGain.connect(this.cavernGain);

      osc1.start(now);
      osc2.start(now);
      windSource.start(now);

      this.cavernNodes = [osc1, osc2, windSource];
    } catch (e) {
      console.warn("Could not start cavern resonance:", e);
    }
  }

  public stopCavernResonance() {
    if (this.cavernGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.cavernGain.gain.linearRampToValueAtTime(0.0001, now + 0.6);
      const nodesToStop = this.cavernNodes;
      const gainToDisconnect = this.cavernGain;
      this.cavernNodes = [];
      this.cavernGain = null;

      setTimeout(() => {
        try {
          nodesToStop.forEach((node) => {
            try {
              node.stop();
              node.disconnect();
            } catch {
              // ignore
            }
          });
          gainToDisconnect.disconnect();
        } catch {
          // ignore
        }
      }, 700);
    }
  }

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
   * Returns whether the matched voice is a verified male voice to tune the pitch accordingly.
   */
  public getSolemnVoiceDetails(targetLang: string = "es"): { voice: SpeechSynthesisVoice | null; isMaleVoice: boolean } {
    if (!('speechSynthesis' in window)) return { voice: null, isMaleVoice: false };
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return { voice: null, isMaleVoice: false };

    // Check user chosen voice first
    if (this.selectedVoiceURI) {
      const custom = voices.find(v => v.voiceURI === this.selectedVoiceURI);
      if (custom) {
        const name = (custom.name || "").toLowerCase();
        const uri = (custom.voiceURI || "").toLowerCase();
        const isMale = ["raul", "pablo", "jorge", "diego", "carlos", "alvaro", "juan", "miguel", "male", "hombre"].some(m => name.includes(m) || uri.includes(m));
        return { voice: custom, isMaleVoice: isMale };
      }
    }

    const langPrefix = targetLang.slice(0, 2).toLowerCase();

    // Comprehensive female names and terms across OS engines (including Chrome's default Google voices)
    const femaleNames = [
      "monica", "mónica", "sabina", "lucia", "lucía", "marisol", "marta", "conchita",
      "esperanza", "paloma", "victoria", "laura", "helena", "elena", "mia", "mía",
      "rosa", "penelope", "penélope", "carmen", "soledad", "pilar", "isabel",
      "paulina", "fernanda", "jimena", "ximena", "sofia", "sofía", "camila",
      "valeria", "dalia", "salma", "lupe", "luisa", "female", "zira",
      "samantha", "karen", "susan", "agnes", "alice", "alva", "amélie", "anna",
      "aurora", "carmit", "damayanti", "fiona", "ioana", "joana", "kyoko", "lekha", "luciana",
      "maged", "mariska", "meijia", "melina", "milena", "moira", "nora",
      "sara", "satu", "sin-ji", "tessa", "ting-ting", "veena", "yelda", "yuna", "zuzana",
      "mujer", "girl", "lady", "woman", "her", "she", "kore", "femenina", "femenino",
      "clara", "silvia", "alicia", "teresa", "sandra", "lorena", "patricia", "andrea",
      "paula", "claudia", "ines", "inés", "eva", "noelia", "raquel", "susana", "cristina",
      "beatriz", "olga", "marina", "natalia", "daniela", "adriana", "cortana",
      "google español", "google espanol", "google us english", "google uk english female"
    ];

    // Language-specific voices filter - STRICT: Must match requested language
    let langVoices = voices.filter(v => 
      (v?.lang || "").toLowerCase().startsWith(langPrefix)
    );
    if (langVoices.length === 0 && langPrefix === "es") {
      langVoices = voices.filter(v => (v?.lang || "").toLowerCase().includes("es"));
    }

    // High-priority solemn/deep male voices in order of natural resonance
    const priorityMaleNames = [
      "raul", "raúl", "pablo", "jorge", "diego", "carlos", "alvaro", "álvaro",
      "gonzalo", "alonso", "juan", "miguel", "enrique", "manuel", "hector", "héctor",
      "mario", "julio", "sergio", "ricardo", "david", "mateo", "felipe", "javier",
      "daniel", "pedro", "antonio", "jose", "josé", "fernando", "luis", "francisco",
      "alejandro", "arturo", "victor", "víctor", "guillermo", "hugo", "ignacio",
      "marcos", "martin", "martín", "ramon", "ramón", "ruben", "rubén", "salvador",
      "vicente", "tomas", "tomás", "guy", "george", "james", "mark"
    ];

    // Priority 1: Check language-matched voices for specific known deep male voices in order
    for (const maleKey of priorityMaleNames) {
      const match = langVoices.find(v => {
        const name = (v?.name || "").toLowerCase();
        const uri = (v?.voiceURI || "").toLowerCase();
        const isFemale = femaleNames.some(f => name.includes(f) || uri.includes(f));
        return (name.includes(maleKey) || uri.includes(maleKey)) && !isFemale;
      });
      if (match) return { voice: match, isMaleVoice: true };
    }

    // Priority 2: Any voice in requested language with explicit male descriptor
    const genericMale = langVoices.find(v => {
      const name = (v?.name || "").toLowerCase();
      const uri = (v?.voiceURI || "").toLowerCase();
      const isMale = ["male", "hombre", "masculino", "homme", "maschile", "männlich", "baritone", "bass"].some(k => name.includes(k) || uri.includes(k));
      const isFemale = femaleNames.some(f => name.includes(f) || uri.includes(f));
      return isMale && !isFemale;
    });
    if (genericMale) return { voice: genericMale, isMaleVoice: true };

    // Priority 3: Any voice in requested language that is strictly non-female
    const strictlyNonFemale = langVoices.find(v => {
      const name = (v?.name || "").toLowerCase();
      const uri = (v?.voiceURI || "").toLowerCase();
      return !femaleNames.some(f => name.includes(f) || uri.includes(f));
    });
    if (strictlyNonFemale) return { voice: strictlyNonFemale, isMaleVoice: false };

    // Priority 4: Default voice of requested language (treated as non-male, will be pitched down)
    if (langVoices.length > 0) return { voice: langVoices[0], isMaleVoice: false };

    // Extreme fallback: first system voice
    return { voice: voices[0] || null, isMaleVoice: false };
  }

  public getBestSolemnMaleVoice(targetLang: string = "es"): SpeechSynthesisVoice | null {
    return this.getSolemnVoiceDetails(targetLang).voice;
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
      "raul", "raúl", "pablo", "jorge", "diego", "carlos", "alvaro", "álvaro",
      "gonzalo", "alonso", "juan", "miguel", "enrique", "manuel", "hector", "héctor",
      "mario", "julio", "sergio", "ricardo", "david", "mateo", "felipe", "javier",
      "daniel", "male", "hombre", "masculino"
    ];

    const prefix = (targetLang || "es").slice(0, 2).toLowerCase();

    return voices
      .filter(v => (v?.lang || "").toLowerCase().startsWith(prefix))
      .filter(v => !femaleNames.some(f => (v?.name || "").toLowerCase().includes(f)))
      .map(v => ({
        name: v.name,
        lang: v.lang,
        voiceURI: v.voiceURI,
        isPreferredMale: maleKeywords.some(k => (v?.name || "").toLowerCase().includes(k)),
      }));
  }

  public setSelectedVoiceURI(uri: string | null) {
    this.selectedVoiceURI = uri;
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        if (uri) {
          localStorage.setItem("ouija_preferred_voice_uri", uri);
        } else {
          localStorage.removeItem("ouija_preferred_voice_uri");
        }
      }
    } catch {
      // ignore
    }
  }

  public getSelectedAiVoice(): string {
    return this.selectedAiVoice || "Fenrir";
  }

  public setSelectedAiVoice(voiceName: string) {
    this.selectedAiVoice = voiceName;
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem("ouija_ai_voice", voiceName);
      }
    } catch {
      // ignore
    }
  }

  public getSelectedVoiceURI(): string | null {
    return this.selectedVoiceURI;
  }

  private pendingAutoplayItem: {
    text: string;
    voice: string;
    onStart?: () => void;
    onEnd?: () => void;
    targetLang?: string;
  } | null = null;
  private isAutoplayListenerAttached: boolean = false;

  public hasPendingAutoplay(): boolean {
    return this.pendingAutoplayItem !== null;
  }

  public isSpeechPlaying(): boolean {
    if (this.currentAudioElement && !this.currentAudioElement.paused && !this.currentAudioElement.ended) {
      return true;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window && window.speechSynthesis.speaking) {
      return true;
    }
    return false;
  }

  private queueAutoplayUnlock(
    text: string,
    voice: string,
    onStart?: () => void,
    onEnd?: () => void,
    targetLang?: string
  ) {
    this.pendingAutoplayItem = { text, voice, onStart, onEnd, targetLang };
    if (this.isAutoplayListenerAttached || typeof window === "undefined") return;

    this.isAutoplayListenerAttached = true;
    const unlockHandler = () => {
      window.removeEventListener("pointerdown", unlockHandler);
      window.removeEventListener("keydown", unlockHandler);
      window.removeEventListener("click", unlockHandler);
      this.isAutoplayListenerAttached = false;

      if (this.pendingAutoplayItem) {
        const item = this.pendingAutoplayItem;
        this.pendingAutoplayItem = null;
        this.playAiVoice(item.text, item.voice, item.onStart, item.onEnd, item.targetLang);
      }
    };

    window.addEventListener("pointerdown", unlockHandler, { once: true });
    window.addEventListener("keydown", unlockHandler, { once: true });
    window.addEventListener("click", unlockHandler, { once: true });
  }

  /**
   * Plays the authentic, high-fidelity AI voice of ultratumba (Fenrir, Puck, or Charon)
   * generated via Gemini TTS and served from the cached backend.
   */
  public async playAiVoice(
    text: string,
    voiceName?: string,
    onStart?: () => void,
    onEnd?: () => void,
    targetLang: string = "es"
  ): Promise<boolean> {
    if (this.isMuted) {
      if (onEnd) onEnd();
      return false;
    }

    this.stopSpeech();
    this.initContext();

    const voice = voiceName || this.selectedAiVoice || "Fenrir";

    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          voice,
          lang: targetLang,
        }),
      });

      if (!res.ok) {
        throw new Error(`TTS server response: ${res.status}`);
      }

      const data = await res.json();
      if (!data.audioData) {
        throw new Error("No audioData received");
      }

      const audioSrc = `data:${data.mimeType || "audio/wav"};base64,${data.audioData}`;
      const audioEl = new Audio(audioSrc);
      this.currentAudioElement = audioEl;

      audioEl.onplay = () => {
        this.startCavernResonance();
        if (onStart) onStart();
      };

      audioEl.onended = () => {
        this.stopCavernResonance();
        this.currentAudioElement = null;
        if (onEnd) onEnd();
      };

      audioEl.onerror = () => {
        this.stopCavernResonance();
        this.currentAudioElement = null;
        this.speakSpiritTextFallback(text, onStart, onEnd, targetLang);
      };

      try {
        await audioEl.play();
        return true;
      } catch (playErr: any) {
        if (playErr?.name === "NotAllowedError") {
          console.warn("Autoplay deferred by browser policy. Will play on first user interaction.");
          this.queueAutoplayUnlock(text, voice, onStart, onEnd, targetLang);
          return false;
        }
        throw playErr;
      }
    } catch (e) {
      console.warn("AI voice playback fallback:", e);
      this.stopCavernResonance();
      this.speakSpiritTextFallback(text, onStart, onEnd, targetLang);
      return false;
    }
  }

  public testMaleVoice(voiceName: string = "Fenrir", onStart?: () => void, onEnd?: () => void, sampleText?: string, lang: string = "es") {
    const text = sampleText || "Hablo desde el umbral de ultratumba... El velo se ha rasgado y los ecos de tu alma vuelven a la luz.";
    this.playAiVoice(
      text,
      voiceName,
      onStart,
      onEnd,
      lang
    );
  }

  private isSpeakingTarot: boolean = false;
  private currentTarotQueue: Array<{ section: string; text: string }> = [];
  private currentTarotIndex: number = 0;

  public stopTarotNarration() {
    this.isSpeakingTarot = false;
    this.currentTarotQueue = [];
    this.currentTarotIndex = 0;
    this.stopCavernResonance();
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
    voiceSpeed?: number,
    targetLang: string = "es"
  ) {
    if (this.isMuted) {
      if (callbacks?.onEnd) callbacks.onEnd();
      return;
    }

    this.stopTarotNarration();
    this.initContext();
    this.playChime(432);

    const fullNarrationText = `${arcana.name}. Arcano número ${arcana.romanNumber}. ${arcana.dailyMessage}. Consejo de los Registros: ${arcana.practicalAdvice}. Afirmación: ${arcana.dailyAffirmation}.`;

    this.isSpeakingTarot = true;
    if (callbacks?.onStart) callbacks.onStart();
    if (callbacks?.onSectionChange) callbacks.onSectionChange("MESSAGE", fullNarrationText);

    this.playAiVoice(
      fullNarrationText,
      this.selectedAiVoice || "Fenrir",
      () => {
        if (callbacks?.onStart) callbacks.onStart();
      },
      () => {
        this.isSpeakingTarot = false;
        if (callbacks?.onEnd) callbacks.onEnd();
      },
      targetLang
    );
  }

  public speakSpiritText(text: string, onStart?: () => void, onEnd?: () => void, targetLang: string = "es") {
    if (this.isMuted) {
      if (onEnd) onEnd();
      return;
    }

    // Safety guard against undefined or literal "undefined"
    if (!text || typeof text !== "string") {
      if (onEnd) onEnd();
      return;
    }

    const clean = text
      .replace(/\bundefined\b/gi, "")
      .replace(/undefined\./gi, "")
      .replace(/\s+/g, " ")
      .trim();

    const safeText = clean || (targetLang === "en"
      ? "The portal opens. The spirit confirms your path."
      : "El portal de ultratumba se abre. El espíritu confirma tu camino.");

    this.stopSpeech();

    this.playAiVoice(
      safeText,
      this.selectedAiVoice || "Fenrir",
      onStart,
      onEnd,
      targetLang
    );
  }

  public speakSpiritTextFallback(text: string, onStart?: () => void, onEnd?: () => void, targetLang: string = "es") {
    if (this.isMuted) {
      if (onEnd) onEnd();
      return;
    }

    if (!('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }

    // Eradicate any literal "undefined"
    const clean = (text || "")
      .replace(/\bundefined\b/gi, "")
      .replace(/undefined\./gi, "")
      .replace(/\s+/g, " ")
      .trim();

    const safeText = clean || (targetLang === "en"
      ? "The portal opens. The spirit confirms your path."
      : "El portal de ultratumba se abre. El espíritu confirma tu camino.");

    try {
      const synth = window.speechSynthesis;
      if (synth.paused) synth.resume();
      synth.cancel();

      const utterance = new SpeechSynthesisUtterance(safeText);
      const voiceDetails = this.getSolemnVoiceDetails(targetLang);

      if (voiceDetails.voice) {
        utterance.voice = voiceDetails.voice;
        utterance.lang = voiceDetails.voice.lang || targetLang;
      } else {
        utterance.lang = targetLang;
      }

      // If a verified deep male voice is available, 0.82 provides a solemn, ceremonial baritone.
      // If a browser fallback or female default voice is active, 0.65 shifts it into a deep, grave, and otherworldly tone.
      utterance.pitch = voiceDetails.isMaleVoice ? 0.82 : 0.65;
      utterance.rate = 0.86;
      utterance.volume = 1.0;

      utterance.onstart = () => {
        this.startCavernResonance();
        if (onStart) onStart();
      };
      utterance.onend = () => {
        this.stopCavernResonance();
        if (onEnd) onEnd();
      };
      utterance.onerror = () => {
        this.stopCavernResonance();
        if (onEnd) onEnd();
      };

      synth.speak(utterance);
    } catch {
      this.stopCavernResonance();
      if (onEnd) onEnd();
    }
  }

  public stopSpeech() {
    this.stopCavernResonance();

    if (this.currentAudioElement) {
      try {
        this.currentAudioElement.pause();
        this.currentAudioElement.currentTime = 0;
        this.currentAudioElement = null;
      } catch {
        // ignore
      }
    }

    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
  }
}

export const audio = new OuijaAudioEngine();

