let globalAudioContext: AudioContext;

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
  constructor(midiNote: number) {
    this.midiNote = midiNote;
    this.audioContext = getAudioContext();
    this.osc = new OscillatorNode(this.audioContext, {
      type: 'sine',
      frequency: midiNoteToFrequency(this.midiNote),
    });
    this.ampSustainTime = 0;
    this.amp = this.audioContext.createGain();
    this.amp.gain.value = 0;
    this.amp.connect(this.audioContext.destination);
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

  noteOff(): void {
    // This fixes a click sound if the gain ramp to 0 happens
    // in the middle of sustain, i.e. after the previous
    // gain ramp ends.
    if (this.audioContext.currentTime >= this.ampSustainTime) {
      this.amp.gain.setValueAtTime(
        ampGain * ampSustain,
        this.audioContext.currentTime,
      );
    }
    const stopTime =
      Math.max(this.audioContext.currentTime, this.ampSustainTime) + ampRelease;
    this.osc.stop(stopTime);
    this.amp.gain.linearRampToValueAtTime(0, stopTime);
  }
}
