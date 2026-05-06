// Narration scripts for each section
const NARRATIONS = {
  1: "Here, in the vast digital landscape, the AI awaits its first lesson. These ingredients — thousands upon thousands of them — are the raw material from which intelligence shall be assembled. Quality data, like the finest San Marzano tomatoes, determines everything that follows.",
  2: "Observe the remarkable assembly line. Each station, like a skilled pizzaiolo, receives what came before, transforms it, and passes it onward. Raw dough becomes something magnificent through layer upon layer of refinement.",
  3: "And now — the critic arrives. Merciless, mathematical, and utterly impartial. Every deviation from perfection is measured and recorded. The model must satisfy this judge before it may proceed.",
  4: "The model finds itself lost in a mountainous landscape of possible recipes. It cannot see the valley below — it can only feel which direction slopes downward. Step by cautious step, it descends toward the perfect pizza.",
  5: "A cautionary tale. This chef has studied obsessively — memorising each regular customer with uncanny precision. But when a stranger walks in... catastrophe. True mastery requires wisdom, not mere memorisation.",
  6: "Practice. Repetition. Each pass through the kitchen refines the technique ever so slightly. The chef improves — until, inevitably, the returns diminish. Knowing when to stop is its own form of intelligence.",
  7: "These mysterious ratios — the secret parameters — hold the accumulated wisdom of all that training. Each weight, a hard-won lesson. Together, they form something greater than any single ingredient could suggest.",
  8: "When the pizza emerges wrong, the chef does not simply start over. She traces the error backwards — through each station, each decision — until she finds the root cause. This backward journey of correction is the heart of how models truly learn."
};

class Narrator {
  constructor() {
    this.enabled = false;
    this.synth = window.speechSynthesis;
    this.voice = null;
    this.loadVoices();
  }

  loadVoices() {
    const setVoice = () => {
      const voices = this.synth.getVoices();
      // Prefer British male voices
      this.voice = voices.find(v => v.lang === 'en-GB' && v.name.toLowerCase().includes('male'))
        || voices.find(v => v.lang === 'en-GB')
        || voices.find(v => v.lang.startsWith('en'))
        || null;
    };
    setVoice();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = setVoice;
    }
  }

  speak(sectionNum) {
    if (!this.enabled) return;
    const text = NARRATIONS[sectionNum];
    if (!text) return;
    this.synth.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.voice = this.voice;
    utt.rate = 0.82;
    utt.pitch = 0.88;
    utt.volume = 0.9;
    this.synth.speak(utt);
  }

  stop() {
    this.synth.cancel();
  }

  toggle() {
    this.enabled = !this.enabled;
    if (!this.enabled) this.stop();
    return this.enabled;
  }
}

export const narrator = new Narrator();
