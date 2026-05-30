/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  private humOsc: OscillatorNode | null = null;
  private humLfo: OscillatorNode | null = null;
  private humLfoGain: GainNode | null = null;
  private humFilter: BiquadFilterNode | null = null;
  private humGain: GainNode | null = null;
  private isHumPlaying = false;

  constructor() {}

  init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      this.ctx = new AudioContextClass();
    }
  }

  startHum() {
    this.init();
    if (!this.ctx) return;
    if (this.isHumPlaying) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    const ctx = this.ctx;

    // Create a low structural pressure tone (sine/triangle sweep)
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(55, ctx.currentTime); // Low A1 note (55 Hz)

    // Filter to sweep low-end tension and isolate frequencies
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(100, ctx.currentTime);
    filter.Q.setValueAtTime(6, ctx.currentTime);

    // LFO to modulate the frequency, simulating a structural trembling vibration
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(2.8, ctx.currentTime); // 2.8 cycles per second

    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(12, ctx.currentTime); // Trembling frequency shift of +/-12Hz

    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    // Dynamic gain node for smooth fade-ins and scale controls
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.20, ctx.currentTime + 2.0); // Safe scale at 0.20 as requested

    // Subtle ambient glassy crackle
    let noiseFilter: BiquadFilterNode | null = null;
    let noiseSource: AudioBufferSourceNode | null = null;
    let noiseGain: GainNode | null = null;
    try {
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;

      noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'highpass';
      noiseFilter.frequency.setValueAtTime(9500, ctx.currentTime);

      noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.003, ctx.currentTime); // Extremely subtle crystalline gloss

      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noiseSource.start();
    } catch (e) {
      console.warn("Noise buffer sound fallback bypassed", e);
    }

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    lfo.start();

    this.humOsc = osc;
    this.humLfo = lfo;
    this.humLfoGain = lfoGain;
    this.humFilter = filter;
    this.humGain = gainNode;
    this.isHumPlaying = true;
  }

  updateHumTension(scrollProgress: number) {
    if (!this.ctx || !this.isHumPlaying) return;
    const ctx = this.ctx;
    
    // Scale tension based on scroll progress (up to 45% shatter point)
    const factor = Math.min(scrollProgress / 0.45, 1.0);
    
    if (this.humOsc && this.humFilter && this.humGain) {
      // Elevate low frequency to sound like compressed ice/glass cracking under immense stress
      const targetFreq = 55 + factor * 45; // up to 100Hz
      const targetFilter = 100 + factor * 220; // open filter to expose more crisp harmonics

      this.humOsc.frequency.setTargetAtTime(targetFreq, ctx.currentTime, 0.1);
      this.humFilter.frequency.setTargetAtTime(targetFilter, ctx.currentTime, 0.1);
      
      // Gradually build hum volume right before shattering
      const targetVolume = 0.20 + factor * 0.15;
      this.humGain.gain.setTargetAtTime(targetVolume, ctx.currentTime, 0.1);
    }
  }

  stopHum() {
    if (!this.isHumPlaying) return;
    const ctx = this.ctx;
    const osc = this.humOsc;
    const lfo = this.humLfo;
    const gain = this.humGain;

    if (ctx && gain) {
      try {
        gain.gain.cancelScheduledValues(ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
        setTimeout(() => {
          try {
            osc?.stop();
            lfo?.stop();
          } catch (e) {}
        }, 400);
      } catch (e) {}
    }
    this.isHumPlaying = false;
  }

  playGlassSnap() {
    this.init();
    if (!this.ctx) return;

    const ctx = this.ctx;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    try {
      // Razor sharp glass snap frequencies - pure physical snap transient
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      
      const startFreq = 3400 + Math.random() * 900;
      const endFreq = 1400 + Math.random() * 300;
      
      osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + 0.04);

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2200, ctx.currentTime);
      filter.Q.setValueAtTime(15, ctx.currentTime); // Highly resonant, glass-like string pluck

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.45, ctx.currentTime + 0.002);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch (e) {
      console.error("Snap synth failed", e);
    }
  }

  /**
   * Triggers a highly authentic physical glass shattering sound using pure synthesizer physics.
   * Completely avoids standard "white noise sheeee" static blocks in favor of distinct
   * resonant metallic/glass chime rings, hard mallet impact transients, and granular tumbling glass clatters.
   * 
   * Supports 4 distinct break types requested by the user:
   * 0 = CRYSTAL_CHIME_CRASH (Crisp, highly-resonant ringing harmonics and multi-harmonic scattering clinks)
   * 1 = HEAVY_CONCUSSION_SLAM (Deep volumetric drop + glass storm)
   * 2 = RETRO_RESONATING_PINGS (High-frequency structural feedback matrix)
   * 3 = SHATTER_SPLINTER_TUMBLE (Rapid asymmetrical tumbling tinkling shard rain)
   */
  playShatterBurst(modeId: number = 0) {
    this.init();
    if (!this.ctx) return;

    const ctx = this.ctx;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const origin = ctx.currentTime;

    // 1. HARD KINETIC IMPACT TRANSIENT (Damped heavy mallet strike)
    try {
      const strikeOsc = ctx.createOscillator();
      strikeOsc.type = 'triangle';
      
      const strikeBaseFreq = modeId === 1 ? 110 : 250;
      strikeOsc.frequency.setValueAtTime(strikeBaseFreq, origin);
      strikeOsc.frequency.exponentialRampToValueAtTime(32, origin + 0.12);

      const strikeGain = ctx.createGain();
      strikeGain.gain.setValueAtTime(0.01, origin);
      strikeGain.gain.exponentialRampToValueAtTime(0.95, origin + 0.002);
      strikeGain.gain.exponentialRampToValueAtTime(0.0001, origin + 0.15);

      strikeOsc.connect(strikeGain);
      strikeGain.connect(ctx.destination);
      strikeOsc.start();
      strikeOsc.stop(origin + 0.2);
    } catch (_) {}

    // 2. CONCUSSION BOOM FLIGHT
    if (modeId === 1) {
      try {
        const subOsc = ctx.createOscillator();
        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(70, origin);
        subOsc.frequency.linearRampToValueAtTime(20, origin + 0.4);

        const subGain = ctx.createGain();
        subGain.gain.setValueAtTime(0.65, origin);
        subGain.gain.exponentialRampToValueAtTime(0.0001, origin + 0.45);

        subOsc.connect(subGain);
        subGain.connect(ctx.destination);
        subOsc.start();
        subOsc.stop(origin + 0.5);
      } catch (_) {}
    }

    // 3. RESONATING CRYSTAL GLASS CHIMES (Harmonic tone spectrum)
    // Avoids 'sheeee' noise through high-Q resonant bells with staggered long decays
    const glassChimeFrequencies = modeId === 2 
      ? [1800, 2400, 3600, 5200, 7800] // Extremely high retro metallic bells
      : modeId === 3 
      ? [2100, 2900, 3400, 4100] // splinter tumbles
      : [1420, 1980, 2650, 3110, 4850]; // Crystal Chime Crash

    glassChimeFrequencies.forEach((freq, idx) => {
      try {
        const chimeOsc = ctx.createOscillator();
        chimeOsc.type = 'sine';
        chimeOsc.frequency.setValueAtTime(freq, origin);
        
        // Dynamic pitch bending downwards mimics fracturing shard expansion tension!
        const shiftAmount = freq * -0.05 * (idx + 1);
        chimeOsc.frequency.exponentialRampToValueAtTime(freq + shiftAmount, origin + 0.45);

        // Individual chime filters to keep them incredibly crisp
        const chimeFilter = ctx.createBiquadFilter();
        chimeFilter.type = 'bandpass';
        chimeFilter.frequency.setValueAtTime(freq, origin);
        chimeFilter.Q.setValueAtTime(25, origin); // Very narrow bandpass simulates pure glass vibration ringing

        const chimeGain = ctx.createGain();
        chimeGain.gain.setValueAtTime(0.0001, origin);
        chimeGain.gain.exponentialRampToValueAtTime(0.28 / (idx + 1.2), origin + 0.005 + (idx * 0.002));
        
        // Decays range from 0.4s to 1.8s
        const chimeDecay = 0.5 + Math.random() * 0.9;
        chimeGain.gain.exponentialRampToValueAtTime(0.0001, origin + chimeDecay);

        chimeOsc.connect(chimeFilter);
        chimeFilter.connect(chimeGain);
        chimeGain.connect(ctx.destination);
        chimeOsc.start();
        chimeOsc.stop(origin + chimeDecay + 0.1);
      } catch (_) {}
    });

    // 4. GRANULAR TUMBLING SHARD CLATTERS
    // Physically schedules up to 25 distinct glass "tinks" bouncing on the ground over a 2 second span
    const numClatters = modeId === 0 ? 18 : modeId === 1 ? 12 : modeId === 2 ? 15 : 28;
    for (let i = 0; i < numClatters; i++) {
      const scheduledDelay = 0.02 + Math.pow(i / numClatters, 1.4) * 1.8; // Exponential distribution - starts dense and then expands out!
      const chimeTime = origin + scheduledDelay;

      try {
        const clinkOsc = ctx.createOscillator();
        clinkOsc.type = 'sine';
        
        // Random crisp glass clattering frequencies
        const clinkFreq = 2600 + Math.random() * 5500;
        clinkOsc.frequency.setValueAtTime(clinkFreq, chimeTime);
        clinkOsc.frequency.exponentialRampToValueAtTime(clinkFreq * 0.8, chimeTime + 0.03);

        const clinkGain = ctx.createGain();
        clinkGain.gain.setValueAtTime(0, chimeTime);
        
        // Slowly fading bounce velocity profile
        const bounceVolume = 0.15 * (1.0 - (scheduledDelay / 2.0)) * (0.45 + Math.random() * 0.55);
        clinkGain.gain.linearRampToValueAtTime(bounceVolume, chimeTime + 0.001);
        clinkGain.gain.exponentialRampToValueAtTime(0.0001, chimeTime + 0.025 + Math.random() * 0.035);

        // Spatial panning emulation (alternating shard spreads left/right/center)
        let node: AudioNode = clinkGain;
        if (ctx.createStereoPanner) {
          const panner = ctx.createStereoPanner();
          panner.pan.setValueAtTime(((i % 3) - 1) * 0.75, chimeTime);
          clinkGain.connect(panner);
          node = panner;
        }

        clinkOsc.connect(clinkGain);
        node.connect(ctx.destination);

        clinkOsc.start(chimeTime);
        clinkOsc.stop(chimeTime + 0.08);
      } catch (_) {}
    }
  }
}

export const audioEngine = new AudioEngine();
