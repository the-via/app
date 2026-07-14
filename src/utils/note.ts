let globalAudioContext: AudioContext;
let globalAmp: GainNode;
let globalAmpGain: number = 1.0;

const ampGain = 0.25;
const ampAttack = 0.05;
const ampDecay = 0.05;
const ampSustain = 1.0;
const ampRelease = 0.05;

function getAudioContext(): AudioContext {
  if (globalAudioContext === undefined) {
    globalAudioContext = new AudioContext();
  }
  return globalAudioContext;
}

function getGlobalAmp(): GainNode {
  if (globalAmp === undefined) {
    const audioContext = getAudioContext();
    // Keep the original note gain/volume behavior, but add a compressor at the
    // output bus to prevent clipping when several key sounds are summed.
    const compressor = audioContext.createDynamicsCompressor();
    compressor.threshold.value = -6;
    compressor.knee.value = 3;
    compressor.ratio.value = 12;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.08;

    globalAmp = audioContext.createGain();
    globalAmp.gain.value = globalAmpGain;
    globalAmp.connect(compressor);
    compressor.connect(audioContext.destination);
  }
  return globalAmp;
}

export function setGlobalAmpGain(ampGain: number) {
  // Cache the value in case we don't have an AudioContext yet
  // See https://goo.gl/7K7WLu
  globalAmpGain = ampGain;
  if (globalAmp === undefined) {
    return;
  }
  // This fixes a crackle sound when changing volume slider quickly
  // while playing a note.
  const audioContext = getAudioContext();
  // Cancel pending volume automation so rapid slider changes do not stack
  // conflicting ramps on the same GainNode.
  globalAmp.gain.cancelScheduledValues(audioContext.currentTime);
  globalAmp.gain.setValueAtTime(
    globalAmp.gain.value,
    audioContext.currentTime
  );
  globalAmp.gain.linearRampToValueAtTime(
    globalAmpGain,
    audioContext.currentTime + 0.2,
  );
}

function midiNoteToFrequency(midiNote: number): number {
  let a = 440; //frequency of A (common value is 440Hz)
  return Math.pow(2, (midiNote - 69) / 12) * a;
}

export class Note {
  audioContext: AudioContext;
  osc: OscillatorNode;
  amp: GainNode;
  ampSustainTime: number;
  midiNote: number;
  constructor(midiNote: number, oscillatorType: OscillatorType) {
    this.midiNote = midiNote;
    this.audioContext = getAudioContext();
    this.osc = new OscillatorNode(this.audioContext, {
      type: oscillatorType,
      frequency: midiNoteToFrequency(this.midiNote),
    });
    this.ampSustainTime = 0;
    this.amp = this.audioContext.createGain();
    this.amp.gain.value = 0;
    this.amp.connect(getGlobalAmp());
    this.osc.connect(this.amp);
  }

  noteOn(): void {
    const startTime = this.audioContext.currentTime;
    this.osc.start(startTime);
    this.ampSustainTime = startTime + ampAttack + ampDecay;
    this.amp.gain.linearRampToValueAtTime(ampGain, startTime + ampAttack);
    this.amp.gain.linearRampToValueAtTime(
      ampGain * ampSustain,
      this.ampSustainTime,
    );
  }

  noteOff(immediate: boolean = false): void {
    // This fixes a click sound if the gain ramp to 0 happens
    // in the middle of sustain, i.e. after the previous
    // gain ramp ends.
    if (this.audioContext.currentTime >= this.ampSustainTime) {
      this.amp.gain.setValueAtTime(
        ampGain * ampSustain,
        this.audioContext.currentTime,
      );
    }
    const releaseTime = immediate ? 0 : ampRelease;
    const stopTime =
      Math.max(this.audioContext.currentTime, this.ampSustainTime) + releaseTime;
    this.osc.stop(stopTime);
    this.amp.gain.linearRampToValueAtTime(0, stopTime);
  }
}
