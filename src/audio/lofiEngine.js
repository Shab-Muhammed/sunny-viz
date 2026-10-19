/**
 * Cozy Lo-Fi Music & Audio Analysis Engine
 * Features:
 * - 4 Curated procedurally synthesized Lo-Fi Chillhop compositions (warm Rhodes, sub bass, mellow drums, bells)
 * - Continuous ambient layers (Vinyl crackle & gentle rain generator)
 * - Local audio file playback with full scrubber support
 * - Live Microphone / Line-In input
 * - High-resolution multi-band frequency analyzer with organic smoothing
 */

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.analyser = null;
    this.masterGain = null;
    this.ambientGain = null;
    this.musicGain = null;

    // Analyzer data
    this.fftSize = 1024;
    this.frequencyData = null;
    this.timeDomainData = null;

    // Smoothed analysis values for visualizer
    this.audioData = {
      subBass: 0,
      bass: 0,
      lowMid: 0,
      mid: 0,
      highMid: 0,
      treble: 0,
      air: 0,
      energy: 0,
      peak: 0,
    };

    // Current source mode: 'synth' | 'file' | 'mic'
    this.sourceMode = 'synth';
    this.isPlaying = false;
    this.currentTrackIndex = 0;

    // Custom file audio element
    this.fileAudioElement = new Audio();
    this.fileAudioElement.crossOrigin = 'anonymous';
    this.fileSourceNode = null;
    this.fileTrackTitle = '';

    // Mic stream
    this.micStream = null;
    this.micSourceNode = null;

    // Synth sequencer state
    this.synthSequencerTimer = null;
    this.currentStep = 0;
    this.currentChordIndex = 0;
    this.rainNode = null;
    this.vinylNode = null;

    // Curated lo-fi tracks metadata & chords
    this.tracks = [
      {
        id: 'midnight-rain',
        title: 'Midnight Rain & Warm Tea',
        artist: 'Komorebi Soundscapes',
        bpm: 72,
        key: 'Eb Major',
        tag: 'Cozy Chillhop • Tape 01',
        chords: [
          // [root, notes (midi)]
          { name: 'Ebmaj9', root: 39, notes: [51, 55, 58, 62, 65] }, // Eb3, Eb4, G4, Bb4, D5, F5
          { name: 'Gm7', root: 43, notes: [46, 50, 53, 58, 62] },    // G3, Bb3, D4, F4, Bb4, D5
          { name: 'Fm9', root: 41, notes: [44, 48, 51, 55, 58] },    // F3, Ab3, C4, Eb4, G4, Bb4
          { name: 'Bb13', root: 46, notes: [44, 48, 50, 55, 62] }    // Bb3, Ab3, C4, D4, G4, D5
        ],
        drumPattern: 'chill',
        melodyScale: [51, 53, 55, 58, 60, 62, 65, 67, 70, 72]
      },
      {
        id: 'autumn-mist',
        title: 'Autumn Window Mist',
        artist: 'Sleepless Lantern',
        bpm: 66,
        key: 'Ab Major',
        tag: 'Warm Lo-Fi Sanctuary • Tape 02',
        chords: [
          { name: 'Dbmaj9', root: 37, notes: [49, 53, 56, 60, 63] },
          { name: 'Cm7', root: 36, notes: [48, 51, 55, 58, 63] },
          { name: 'Bbm9', root: 34, notes: [46, 49, 53, 56, 60] },
          { name: 'Eb7sus4', root: 39, notes: [46, 51, 54, 58, 61] }
        ],
        drumPattern: 'slowSwing',
        melodyScale: [49, 51, 53, 56, 58, 60, 63, 65, 68]
      },
      {
        id: 'lanterns-breeze',
        title: 'Lanterns in the Breeze',
        artist: 'Gentle Reverie',
        bpm: 78,
        key: 'F Major',
        tag: 'Analog Evening • Tape 03',
        chords: [
          { name: 'Fmaj9', root: 41, notes: [53, 57, 60, 64, 67] },
          { name: 'Am7', root: 45, notes: [52, 57, 60, 64, 69] },
          { name: 'Dm9', root: 38, notes: [50, 53, 57, 60, 64] },
          { name: 'Gm7/C', root: 43, notes: [48, 53, 55, 58, 62] }
        ],
        drumPattern: 'bossaLofi',
        melodyScale: [53, 55, 57, 60, 62, 64, 67, 69, 72]
      },
      {
        id: 'dawn-coffee',
        title: 'Dawn Coffee Sanctuary',
        artist: 'Aura of Serenity',
        bpm: 70,
        key: 'Db Major',
        tag: 'Cozy Morning Glow • Tape 04',
        chords: [
          { name: 'Gbmaj7', root: 42, notes: [54, 58, 61, 65, 68] },
          { name: 'Fm7', root: 41, notes: [53, 56, 60, 63, 68] },
          { name: 'Ebm9', root: 39, notes: [51, 54, 58, 61, 65] },
          { name: 'Ab9sus', root: 44, notes: [51, 56, 58, 61, 66] }
        ],
        drumPattern: 'heartbeat',
        melodyScale: [54, 56, 58, 61, 63, 65, 68, 70, 73]
      }
    ];

    // Ambient settings
    this.ambientSettings = {
      vinyl: true,
      rain: true,
      vinylVolume: 0.22,
      rainVolume: 0.18
    };

    // Synthetic track progress emulation
    this.synthTrackElapsed = 0;
    this.synthTrackDuration = 180; // 3 minutes per loop session

    // Callbacks
    this.onTrackChange = null;
    this.onPlayStateChange = null;
    this.onTimeUpdate = null;
  }

  // Initialize Web Audio Context upon user interaction
  async initContext() {
    if (this.ctx && this.ctx.state !== 'closed') {
      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }
      return;
    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContextClass();

    // Master node chain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);

    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.setValueAtTime(0.9, this.ctx.currentTime);
    this.musicGain.connect(this.masterGain);

    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.setValueAtTime(0.4, this.ctx.currentTime);
    this.ambientGain.connect(this.masterGain);

    // Dynamic compressor to give that warm, analog glued lofi feel
    this.compressor = this.ctx.createDynamicsCompressor();
    this.compressor.threshold.setValueAtTime(-18, this.ctx.currentTime);
    this.compressor.knee.setValueAtTime(24, this.ctx.currentTime);
    this.compressor.ratio.setValueAtTime(4, this.ctx.currentTime);
    this.compressor.attack.setValueAtTime(0.015, this.ctx.currentTime);
    this.compressor.release.setValueAtTime(0.25, this.ctx.currentTime);

    // Warm master filter (gently rolled off highs for vintage warmth)
    this.masterFilter = this.ctx.createBiquadFilter();
    this.masterFilter.type = 'lowpass';
    this.masterFilter.frequency.setValueAtTime(14000, this.ctx.currentTime);
    this.masterFilter.Q.setValueAtTime(0.7, this.ctx.currentTime);

    // Analyser setup
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = this.fftSize;
    this.analyser.smoothingTimeConstant = 0.82;
    this.analyser.minDecibels = -90;
    this.analyser.maxDecibels = -10;

    // Connect chain:
    // masterGain -> compressor -> masterFilter -> analyser -> destination
    this.masterGain.connect(this.compressor);
    this.compressor.connect(this.masterFilter);
    this.masterFilter.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);

    // Frequency and Time arrays
    this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
    this.timeDomainData = new Uint8Array(this.analyser.frequencyBinCount);

    // Wire file audio element
    this.fileSourceNode = this.ctx.createMediaElementSource(this.fileAudioElement);
    this.fileSourceNode.connect(this.musicGain);

    this.fileAudioElement.addEventListener('timeupdate', () => {
      if (this.sourceMode === 'file' && this.onTimeUpdate) {
        this.onTimeUpdate(this.fileAudioElement.currentTime, this.fileAudioElement.duration || 1);
      }
    });

    this.fileAudioElement.addEventListener('ended', () => {
      if (this.sourceMode === 'file') {
        this.pause();
      }
    });

    // Start ambient sound generators
    this.startAmbientGenerators();
  }

  // Procedural Vinyl Crackle & Rain Ambience generator
  startAmbientGenerators() {
    if (!this.ctx) return;

    // --- Vinyl Crackle Generator ---
    const bufferSize = this.ctx.sampleRate * 3;
    const vinylBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const vinylData = vinylBuffer.getChannelData(0);

    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      // Gentle pink noise base
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + 0.02 * white) / 1.02;

      // Random needle pop / dust scratch impulses
      let crackle = 0;
      if (Math.random() < 0.0018) {
        crackle = (Math.random() * 2 - 1) * 0.45;
      }
      if (Math.random() < 0.0003) {
        // Deeper vinyl pop
        crackle = (Math.random() * 2 - 1) * 0.8;
      }
      vinylData[i] = lastOut * 0.15 + crackle;
    }

    const vinylSource = this.ctx.createBufferSource();
    vinylSource.buffer = vinylBuffer;
    vinylSource.loop = true;

    const vinylFilter = this.ctx.createBiquadFilter();
    vinylFilter.type = 'bandpass';
    vinylFilter.frequency.setValueAtTime(1800, this.ctx.currentTime);
    vinylFilter.Q.setValueAtTime(1.2, this.ctx.currentTime);

    this.vinylGain = this.ctx.createGain();
    this.vinylGain.gain.setValueAtTime(this.ambientSettings.vinyl ? this.ambientSettings.vinylVolume : 0, this.ctx.currentTime);

    vinylSource.connect(vinylFilter);
    vinylFilter.connect(this.vinylGain);
    this.vinylGain.connect(this.ambientGain);
    vinylSource.start();

    // --- Soft Rain Whisper Generator ---
    const rainBuffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate);
    const rainL = rainBuffer.getChannelData(0);
    const rainR = rainBuffer.getChannelData(1);

    let b0L = 0, b1L = 0, b2L = 0;
    let b0R = 0, b1R = 0, b2R = 0;
    for (let i = 0; i < bufferSize; i++) {
      const whiteL = Math.random() * 2 - 1;
      const whiteR = Math.random() * 2 - 1;

      // 3-pole pinking filter
      b0L = 0.99886 * b0L + whiteL * 0.0555179;
      b1L = 0.99332 * b1L + whiteL * 0.0750759;
      b2L = 0.96900 * b2L + whiteL * 0.1538520;
      rainL[i] = (b0L + b1L + b2L + whiteL * 0.5362) * 0.08;

      b0R = 0.99886 * b0R + whiteR * 0.0555179;
      b1R = 0.99332 * b1R + whiteR * 0.0750759;
      b2R = 0.96900 * b2R + whiteR * 0.1538520;
      rainR[i] = (b0R + b1R + b2R + whiteR * 0.5362) * 0.08;
    }

    const rainSource = this.ctx.createBufferSource();
    rainSource.buffer = rainBuffer;
    rainSource.loop = true;

    const rainFilter = this.ctx.createBiquadFilter();
    rainFilter.type = 'lowpass';
    rainFilter.frequency.setValueAtTime(1400, this.ctx.currentTime);
    rainFilter.Q.setValueAtTime(0.5, this.ctx.currentTime);

    this.rainGain = this.ctx.createGain();
    this.rainGain.gain.setValueAtTime(this.ambientSettings.rain ? this.ambientSettings.rainVolume : 0, this.ctx.currentTime);

    rainSource.connect(rainFilter);
    rainFilter.connect(this.rainGain);
    this.rainGain.connect(this.ambientGain);
    rainSource.start();
  }

  // Toggle vinyl crackle
  toggleVinyl(enabled) {
    this.ambientSettings.vinyl = enabled;
    if (this.vinylGain && this.ctx) {
      this.vinylGain.gain.setTargetAtTime(enabled ? this.ambientSettings.vinylVolume : 0, this.ctx.currentTime, 0.2);
    }
  }

  // Toggle rain sound
  toggleRain(enabled) {
    this.ambientSettings.rain = enabled;
    if (this.rainGain && this.ctx) {
      this.rainGain.gain.setTargetAtTime(enabled ? this.ambientSettings.rainVolume : 0, this.ctx.currentTime, 0.2);
    }
  }

  // Helper: Convert MIDI note number to frequency (Hz)
  midiToFreq(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  // Play a lush Rhodes-style electric piano chord
  playRhodesChord(notes, duration = 3.2, time = 0) {
    if (!this.ctx) return;
    const startTime = time || this.ctx.currentTime;

    notes.forEach((midi, idx) => {
      const freq = this.midiToFreq(midi);

      // Main tone: gentle sine with slight warm harmonic
      const osc1 = this.ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, startTime);

      // Overtone oscillator (subtle tine sparkle)
      const osc2 = this.ctx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq * 2, startTime);
      // Slight detune for analog warmth
      osc2.detune.setValueAtTime((Math.random() - 0.5) * 8, startTime);

      // Filter: warm lowpass with gentle velocity curve
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(freq * 3.5, startTime);
      filter.frequency.exponentialRampToValueAtTime(freq * 1.8, startTime + duration);
      filter.Q.setValueAtTime(1.5, startTime);

      // Gain envelope
      const gain = this.ctx.createGain();
      const velocity = 0.16 + (Math.random() * 0.04) - (idx * 0.015);
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.001, velocity), startTime + 0.04 + idx * 0.012); // strum delay
      gain.gain.exponentialRampToValueAtTime(0.00001, startTime + duration);

      // Subtle stereo panning for each note of the chord
      const pan = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
      if (pan) {
        pan.pan.setValueAtTime(((idx / notes.length) - 0.5) * 0.6, startTime);
        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(pan);
        pan.connect(this.musicGain);
      } else {
        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);
      }

      osc1.start(startTime + idx * 0.012);
      osc2.start(startTime + idx * 0.012);
      osc1.stop(startTime + duration + 0.1);
      osc2.stop(startTime + duration + 0.1);
    });
  }

  // Play cozy sub bass note (drives lower-left ember glow)
  playBassNote(midi, duration = 1.8, time = 0) {
    if (!this.ctx) return;
    const startTime = time || this.ctx.currentTime;
    const freq = this.midiToFreq(midi);

    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    // Subtle 2nd harmonic for analog warmth
    const subOsc = this.ctx.createOscillator();
    subOsc.type = 'triangle';
    subOsc.frequency.setValueAtTime(freq, startTime);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(220, startTime);
    filter.frequency.exponentialRampToValueAtTime(110, startTime + duration);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(0.42, startTime + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(filter);
    subOsc.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    osc.start(startTime);
    subOsc.start(startTime);
    osc.stop(startTime + duration + 0.05);
    subOsc.stop(startTime + duration + 0.05);
  }

  // Play celestial chime / dust-mote sparkler note
  playChimeNote(midi, time = 0) {
    if (!this.ctx) return;
    const startTime = time || this.ctx.currentTime;
    const freq = this.midiToFreq(midi);

    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    const oscHarmonic = this.ctx.createOscillator();
    oscHarmonic.type = 'sine';
    oscHarmonic.frequency.setValueAtTime(freq * 2.76, startTime); // metallic overtone

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(0.08, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.00001, startTime + 2.2);

    const pan = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
    if (pan) {
      pan.pan.setValueAtTime(0.35 + Math.random() * 0.45, startTime); // biased towards right side
      osc.connect(gain);
      oscHarmonic.connect(gain);
      gain.connect(pan);
      pan.connect(this.musicGain);
    } else {
      osc.connect(gain);
      oscHarmonic.connect(gain);
      gain.connect(this.musicGain);
    }

    osc.start(startTime);
    oscHarmonic.start(startTime);
    osc.stop(startTime + 2.4);
    oscHarmonic.stop(startTime + 2.4);
  }

  // Play soft lofi drum elements
  playDrumElement(type, time = 0) {
    if (!this.ctx) return;
    const startTime = time || this.ctx.currentTime;

    if (type === 'kick') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.frequency.setValueAtTime(115, startTime);
      osc.frequency.exponentialRampToValueAtTime(36, startTime + 0.12);

      gain.gain.setValueAtTime(0.38, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.28);

      osc.connect(gain);
      gain.connect(this.musicGain);

      osc.start(startTime);
      osc.stop(startTime + 0.3);
    } else if (type === 'snare') {
      // Body tone + soft filtered noise
      const osc = this.ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, startTime);
      osc.frequency.exponentialRampToValueAtTime(90, startTime + 0.08);

      const toneGain = this.ctx.createGain();
      toneGain.gain.setValueAtTime(0.14, startTime);
      toneGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.12);
      osc.connect(toneGain);
      toneGain.connect(this.musicGain);

      // Noise sizzle
      const node = this.ctx.createBufferSource();
      const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.2, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      node.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2800, startTime);
      filter.Q.setValueAtTime(1.2, startTime);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.12, startTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.18);

      node.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.musicGain);

      osc.start(startTime);
      osc.stop(startTime + 0.15);
      node.start(startTime);
      node.stop(startTime + 0.2);
    } else if (type === 'hihat') {
      const node = this.ctx.createBufferSource();
      const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.06, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      node.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(7500, startTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.065, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.05);

      node.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      node.start(startTime);
      node.stop(startTime + 0.06);
    }
  }

  // Synthesizer Step Sequencer tick
  scheduleSynthStep() {
    if (!this.isPlaying || this.sourceMode !== 'synth') return;

    const track = this.tracks[this.currentTrackIndex];
    const secondsPerBeat = 60 / track.bpm;
    const stepDuration = secondsPerBeat / 2; // 8th note steps

    const now = this.ctx.currentTime;
    const step = this.currentStep % 16; // 2 bars of 4/4 (16 steps)

    // Progress updating
    this.synthTrackElapsed = (this.synthTrackElapsed + stepDuration) % this.synthTrackDuration;
    if (this.onTimeUpdate) {
      this.onTimeUpdate(this.synthTrackElapsed, this.synthTrackDuration);
    }

    // Measure chord progression
    if (step === 0 || step === 8) {
      const chordIndex = Math.floor(this.currentStep / 8) % track.chords.length;
      const currentChord = track.chords[chordIndex];
      this.playRhodesChord(currentChord.notes, stepDuration * 7.5, now);
      this.playBassNote(currentChord.root, stepDuration * 3.8, now);

      // Trigger chord title if changed
      this.currentChordIndex = chordIndex;
    }

    // Mid-measure bass rhythm variation
    if (step === 5 || step === 12) {
      const currentChord = track.chords[this.currentChordIndex];
      if (Math.random() > 0.3) {
        this.playBassNote(currentChord.root + (Math.random() > 0.6 ? 7 : 0), stepDuration * 2.5, now);
      }
    }

    // Drum sequencing
    // Kick on steps 0, 6, 10
    if (step === 0 || step === 6 || (step === 10 && Math.random() > 0.3)) {
      this.playDrumElement('kick', now);
    }
    // Snare / Rimshot on steps 4, 12 (beats 2 & 4)
    if (step === 4 || step === 12) {
      this.playDrumElement('snare', now);
    }
    // Hi-hats with gentle swing
    if (step % 2 === 0 || Math.random() > 0.4) {
      const swing = (step % 2 !== 0) ? stepDuration * 0.15 : 0;
      this.playDrumElement('hihat', now + swing);
    }

    // Random sparkling chime / melody notes from the track scale
    if (Math.random() < 0.38) {
      const randomNote = track.melodyScale[Math.floor(Math.random() * track.melodyScale.length)];
      // Bias an octave higher for delicate dust mote shimmer
      const octaveShift = Math.random() > 0.4 ? 12 : 0;
      this.playChimeNote(randomNote + octaveShift, now + (Math.random() * 0.1));
    }

    this.currentStep++;

    // Schedule next tick
    this.synthSequencerTimer = setTimeout(() => {
      this.scheduleSynthStep();
    }, stepDuration * 1000);
  }

  // Play audio
  async play() {
    await this.initContext();

    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    this.isPlaying = true;

    if (this.sourceMode === 'synth') {
      if (!this.synthSequencerTimer) {
        this.scheduleSynthStep();
      }
    } else if (this.sourceMode === 'file') {
      try {
        await this.fileAudioElement.play();
      } catch (e) {
        console.warn('Playback resume issue:', e);
      }
    }

    if (this.onPlayStateChange) {
      this.onPlayStateChange(true);
    }
  }

  // Pause audio
  pause() {
    this.isPlaying = false;

    if (this.synthSequencerTimer) {
      clearTimeout(this.synthSequencerTimer);
      this.synthSequencerTimer = null;
    }

    if (this.fileAudioElement) {
      this.fileAudioElement.pause();
    }

    if (this.onPlayStateChange) {
      this.onPlayStateChange(false);
    }
  }

  // Toggle Play / Pause
  async togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      await this.play();
    }
  }

  // Next Track
  nextTrack() {
    if (this.sourceMode === 'synth') {
      this.currentTrackIndex = (this.currentTrackIndex + 1) % this.tracks.length;
      this.currentStep = 0;
      this.synthTrackElapsed = 0;
      if (this.onTrackChange) {
        this.onTrackChange(this.getCurrentTrackInfo());
      }
    }
  }

  // Prev Track
  prevTrack() {
    if (this.sourceMode === 'synth') {
      this.currentTrackIndex = (this.currentTrackIndex - 1 + this.tracks.length) % this.tracks.length;
      this.currentStep = 0;
      this.synthTrackElapsed = 0;
      if (this.onTrackChange) {
        this.onTrackChange(this.getCurrentTrackInfo());
      }
    }
  }

  // Seek / Scrub track
  seek(normalizedTime) {
    if (this.sourceMode === 'file') {
      if (this.fileAudioElement.duration) {
        this.fileAudioElement.currentTime = normalizedTime * this.fileAudioElement.duration;
      }
    } else if (this.sourceMode === 'synth') {
      this.synthTrackElapsed = normalizedTime * this.synthTrackDuration;
      // sync step roughly
      const track = this.tracks[this.currentTrackIndex];
      const secondsPerBeat = 60 / track.bpm;
      const stepDuration = secondsPerBeat / 2;
      this.currentStep = Math.floor(this.synthTrackElapsed / stepDuration);
    }
  }

  // Set Master Volume (0.0 to 1.0)
  setVolume(val) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(val, this.ctx.currentTime, 0.05);
    }
  }

  // Load custom local audio file
  async loadLocalFile(file) {
    await this.initContext();

    const objectUrl = URL.createObjectURL(file);
    this.fileAudioElement.src = objectUrl;
    this.fileTrackTitle = file.name.replace(/\.[^/.]+$/, '');
    this.sourceMode = 'file';

    if (this.synthSequencerTimer) {
      clearTimeout(this.synthSequencerTimer);
      this.synthSequencerTimer = null;
    }

    if (this.onTrackChange) {
      this.onTrackChange(this.getCurrentTrackInfo());
    }

    await this.play();
  }

  // Enable live microphone input
  async enableMicrophone() {
    await this.initContext();

    if (this.micStream) {
      // Toggle off mic, return to synth
      this.stopMicrophone();
      this.sourceMode = 'synth';
      if (this.onTrackChange) {
        this.onTrackChange(this.getCurrentTrackInfo());
      }
      return false;
    }

    try {
      this.micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      this.micSourceNode = this.ctx.createMediaStreamSource(this.micStream);
      this.micGain = this.ctx.createGain();
      this.micGain.gain.setValueAtTime(1.5, this.ctx.currentTime);

      // Note: Connect mic to analyser ONLY (do not loop to destination to prevent howling feedback!)
      this.micSourceNode.connect(this.micGain);
      this.micGain.connect(this.analyser);

      this.sourceMode = 'mic';
      this.pause(); // Pause synth playback while listening to mic

      if (this.onTrackChange) {
        this.onTrackChange({
          title: 'Live Audio Input',
          artist: 'Microphone / Ambient Feed',
          tag: 'Real-time Sound Reactive Mode',
          isLive: true
        });
      }
      return true;
    } catch (err) {
      console.error('Microphone access denied or error:', err);
      alert('Microphone access was denied or is unavailable. Please check your browser permissions.');
      return false;
    }
  }

  // Stop microphone
  stopMicrophone() {
    if (this.micStream) {
      this.micStream.getTracks().forEach(t => t.stop());
      this.micStream = null;
    }
    if (this.micSourceNode) {
      this.micSourceNode.disconnect();
      this.micSourceNode = null;
    }
  }

  // Switch back to built-in sanctuary synth
  switchToSynth() {
    this.stopMicrophone();
    if (this.fileAudioElement) {
      this.fileAudioElement.pause();
    }
    this.sourceMode = 'synth';
    if (this.onTrackChange) {
      this.onTrackChange(this.getCurrentTrackInfo());
    }
    this.play();
  }

  // Current track information object
  getCurrentTrackInfo() {
    if (this.sourceMode === 'mic') {
      return {
        title: 'Live Audio Input',
        artist: 'Microphone / Room Feed',
        tag: 'Real-time Sound Reactive',
        isLive: true
      };
    }

    if (this.sourceMode === 'file') {
      return {
        title: this.fileTrackTitle || 'Uploaded Track',
        artist: 'Local Audio Library',
        tag: 'Custom Audio Stream',
        isLive: false
      };
    }

    const track = this.tracks[this.currentTrackIndex];
    return {
      title: track.title,
      artist: track.artist,
      tag: `${track.tag} • ${track.bpm} BPM`,
      key: track.key,
      isLive: false
    };
  }

  // Calculate decomposed frequency bands from FFT data
  // Using exponential moving averages for soothing, buttery organic motion
  updateAnalysis() {
    if (!this.analyser || !this.frequencyData) {
      return this.audioData;
    }

    this.analyser.getByteFrequencyData(this.frequencyData);

    const binCount = this.analyser.frequencyBinCount;
    // Nyquist is sampleRate / 2 (e.g. 24000Hz). Bin width = Nyquist / binCount ≈ 46.8Hz
    const sampleRate = this.ctx ? this.ctx.sampleRate : 48000;
    const hzPerBin = (sampleRate / 2) / binCount;

    const getAverage = (minHz, maxHz) => {
      const startBin = Math.max(0, Math.floor(minHz / hzPerBin));
      const endBin = Math.min(binCount - 1, Math.ceil(maxHz / hzPerBin));
      if (startBin >= endBin) return (this.frequencyData[startBin] || 0) / 255;

      let sum = 0;
      for (let i = startBin; i <= endBin; i++) {
        sum += this.frequencyData[i];
      }
      return (sum / (endBin - startBin + 1)) / 255;
    };

    // Extract frequency domains
    // Deep Sub-Bass: 20Hz - 90Hz
    const rawSubBass = getAverage(20, 90);
    // Warm Bass: 90Hz - 220Hz
    const rawBass = getAverage(90, 220);
    // Low Mids (Warm chords & body): 220Hz - 700Hz
    const rawLowMid = getAverage(220, 700);
    // Mid Range (Piano, melody): 700Hz - 2400Hz
    const rawMid = getAverage(700, 2400);
    // High Mids (Snare snap, vocal presence): 2400Hz - 5500Hz
    const rawHighMid = getAverage(2400, 5500);
    // Treble (Hi-hats, vinyl crackles): 5500Hz - 10000Hz
    const rawTreble = getAverage(5500, 10000);
    // Air & Sparkle (Celestial bells, sunlight particles): 10000Hz - 18000Hz
    const rawAir = getAverage(10000, 18000);

    // Dynamic smoothing coefficients (faster attack, smooth warm decay)
    const smooth = (current, target, attack = 0.35, decay = 0.08) => {
      const factor = target > current ? attack : decay;
      return current + (target - current) * factor;
    };

    this.audioData.subBass = smooth(this.audioData.subBass, rawSubBass, 0.45, 0.06);
    this.audioData.bass = smooth(this.audioData.bass, rawBass, 0.42, 0.07);
    this.audioData.lowMid = smooth(this.audioData.lowMid, rawLowMid, 0.35, 0.09);
    this.audioData.mid = smooth(this.audioData.mid, rawMid, 0.35, 0.09);
    this.audioData.highMid = smooth(this.audioData.highMid, rawHighMid, 0.38, 0.1);
    this.audioData.treble = smooth(this.audioData.treble, rawTreble, 0.45, 0.12);
    this.audioData.air = smooth(this.audioData.air, rawAir, 0.5, 0.14);

    // Combined energy
    const totalEnergy = (this.audioData.subBass * 1.5 + this.audioData.bass * 1.2 + this.audioData.mid + this.audioData.treble) / 4.7;
    this.audioData.energy = smooth(this.audioData.energy, totalEnergy, 0.3, 0.08);

    return this.audioData;
  }
}
