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

  /**
   * Identifies the best solemn neutral Spanish male voice available in the browser/OS.
   */
  public getBestSolemnMaleVoice(): SpeechSynthesisVoice | null {
    if (!('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    // Check user chosen voice first
    if (this.selectedVoiceURI) {
      const custom = voices.find(v => v.voiceURI === this.selectedVoiceURI);
      if (custom) return custom;
    }

    // Female names and terms to strictly exclude across all OS voices
    const femaleNames = [
      "monica", "mónica", "sabina", "lucia", "lucía", "marisol", "marta", "conchita",
      "esperanza", "paloma", "victoria", "laura", "helena", "mia", "mía",
      "rosa", "penelope", "penélope", "carmen", "soledad", "pilar", "isabel",
      "paulina", "fernanda", "jimena", "ximena", "sofia", "sofía", "camila",
      "valeria", "elena", "dalia", "salma", "lupe", "luisa", "female",
      "mujer", "girl", "lady", "woman", "her", "she", "zira", "yolda",
      "margarita", "hilda", "regina", "monika", "silvia", "alicia", "fiona",
      "ines", "inés", "carolina", "paola", "catalina", "valentina", "daniela", "maria", "maría"
    ];

    // Spanish voices filter
    const spanishVoices = voices.filter(v => 
      v.lang.toLowerCase().startsWith("es") || 
      v.name.toLowerCase().includes("spanish") || 
      v.name.toLowerCase().includes("español")
    );

    // Male keywords
    const maleKeywords = [
      "jorge", "carlos", "miguel", "pablo", "diego", "enrique", "juan",
      "gonzalo", "rodrigo", "raul", "raúl", "alberto", "david", "lorenzo",
      "alvaro", "álvaro", "mateo", "alonso", "felipe", "manuel", "javier",
      "hector", "héctor", "andres", "andrés", "mario", "julio", "sergio", "ricardo",
      "esteban", "tomas", "tomás", "ignacio", "pedro", "santiago", "fernando",
      "alejandro", "francisco", "male", "hombre", "masculino", "guy", "boy",
      "es-us-x-sfb#male", "es-es-x-ana#male", "google español de estados unidos", "google español"
    ];

    // Priority 1: Specifically matched Spanish male voice
    const matchedMale = spanishVoices.find(v => {
      const name = v.name.toLowerCase();
      const uri = v.voiceURI.toLowerCase();
      const isMale = maleKeywords.some(k => name.includes(k) || uri.includes(k));
      const isFemale = femaleNames.some(f => name.includes(f) || uri.includes(f));
      return isMale && !isFemale;
    });
    if (matchedMale) return matchedMale;

    // Priority 2: Spanish voice strictly avoiding any female naming or characteristics
    const strictlyNonFemaleSpanish = spanishVoices.find(v => {
      const name = v.name.toLowerCase();
      const uri = v.voiceURI.toLowerCase();
      const isFemale = femaleNames.some(f => name.includes(f) || uri.includes(f));
      return !isFemale;
    });
    if (strictlyNonFemaleSpanish) return strictlyNonFemaleSpanish;

    // Priority 3: Any other male voice installed on the device (e.g., multilingual male)
    const anyDeviceMaleVoice = voices.find(v => {
      const name = v.name.toLowerCase();
      const uri = v.voiceURI.toLowerCase();
      const isMale = maleKeywords.some(k => name.includes(k) || uri.includes(k));
      const isFemale = femaleNames.some(f => name.includes(f) || uri.includes(f));
      return isMale && !isFemale;
    });
    if (anyDeviceMaleVoice) return anyDeviceMaleVoice;

    // Fallback: first spanish voice or default
    return spanishVoices[0] || null;
  }

  public getAvailableMaleVoices(): VoiceOption[] {
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
      "mario", "julio", "sergio", "ricardo", "esteban", "male", "hombre", "masculino"
    ];

    return voices
      .filter(v => v.lang.toLowerCase().startsWith("es") || v.name.toLowerCase().includes("spanish"))
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

  public speakSpiritText(text: string, onStart?: () => void, onEnd?: () => void) {
    if (this.isMuted) return;
    if (!('speechSynthesis' in window)) {
      console.warn("Speech synthesis not available in window");
      return;
    }

    try {
      const synth = window.speechSynthesis;
      
      // If paused, resume
      if (synth.paused) {
        synth.resume();
      }

      // Cancel previous speaking gracefully
      synth.cancel();

      const speakAction = () => {
        try {
          const utterance = new SpeechSynthesisUtterance(text);
          // Deep, solemn, baritone male acoustics
          utterance.rate = 0.82; // Slow, dignified, deliberate sacred cadence
          utterance.pitch = 0.62; // Deep baritone masculine resonance
          utterance.volume = 1.0;

          const selectedVoice = this.getBestSolemnMaleVoice();
          if (selectedVoice) {
            utterance.voice = selectedVoice;
            utterance.lang = selectedVoice.lang || "es-419";
          } else {
            utterance.lang = "es-419";
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

      // Slight delay (50ms) to prevent Chrome's cancel() bug
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

