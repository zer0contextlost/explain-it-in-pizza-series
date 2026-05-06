// Narration scripts for each section
const NARRATIONS = {
  1: "Think. Act. Observe. Think again. This is not a program — this is a process. The agent does not know in advance what it will need to do. It discovers the path by walking it.",
  2: "The model alone cannot check the fridge, call the supplier, or ring up the bill. But with tools, it can reach beyond its own boundaries into the world. Each tool is a hand it does not have.",
  3: "The plan is not the prison. The plan is the scaffold. It can change. But without it, the chef begins baking before the dough is stretched, and wonders why the pizza is wrong.",
  4: "The notepad holds only so much. When it fills, the oldest memories fall away. This is the context window made tangible — a limited, precious, and ephemeral thing.",
  5: "The leather book remembers what the notepad cannot hold. It persists across shifts, across seasons. This is external memory — the database behind the agent, not the context within it.",
  6: "Five chefs, five specialities, one brigade. The sous chef does not stretch dough. The dough master does not answer the phone. Division of labour is not inefficiency — it is wisdom at scale.",
  7: "The loop is always the same. Think. Act. Observe nothing new. Think the same thought. Act the same way. The agent has become a broken record, and nobody pressed stop.",
  8: "The most dangerous tool call is the one to a tool that does not exist. The model hallucinates the tool, calls it, receives a hallucinated response, and reports a hallucinated success. Confident. Wrong. Invisible."
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
