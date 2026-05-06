// Narration scripts for RAG sections
const NARRATIONS = {
  1: "The model is brilliant, but his memory ends at a fixed point in time. Beyond that horizon, he guesses. And he guesses with such confidence. Such terrible, terrible confidence.",
  2: "Forget the alphabet. In the vector library, recipes are filed by how they taste. Margherita and marinara are neighbors. Pepperoni and salami share a shelf. Caesar salad is very far away.",
  3: "The database knows that similar things belong together. Ask for something spicy, and it opens to the spicy section. No search bar required. The structure itself is the search.",
  4: "Direction matters. Not size. A personal pepperoni and a party pepperoni point toward the same flavor horizon. Cosine similarity measures the angle between them — and angle is everything.",
  5: "The entire memoir cannot fit in the chef's apron pocket. But a single recipe card can. Chunking is the art of knowing where one idea ends and another begins.",
  6: "Before he cooks, we tape the answer to his cutting board. Not in his memory — physically in front of him. He cannot ignore what is literally taped to his workspace.",
  7: "Grounded answers cite their sources. They point at the card. They say: I am not inventing this — it is written here, on this page, in this recipe. Verify me.",
  8: "The flag in the pizza slice is a promise: I can prove this. Follow the flag, read the source, and judge for yourself. This is how trust is earned, one citation at a time."
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
