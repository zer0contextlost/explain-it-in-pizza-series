// Narrator system for Prompt Engineering episode

const NARRATOR_TEXTS = {
    1: "Walk up to a stranger. Say the word 'pizza.' What arrives is entirely up to chance — or rather, up to everything the model has ever seen. Zero-shot is hope dressed as engineering.",
    2: "Three examples, carefully chosen, can communicate more than a thousand adjectives. The model sees the pattern. It does not need to be told — it needs to be shown.",
    3: "The thinking chef makes fewer mistakes. Not because he is smarter, but because he catches his own errors mid-thought, before the wrong pizza reaches the pass.",
    4: "Inside every chef's hat is a laminated card that nobody else can read. It sets the rules. The personality. The constraints. Every order is filtered through it before the chef hears a word.",
    5: "Turn the dial up and the chef improvises. Turn it down and he is reliable, predictable, safe. The right temperature depends on whether you want a surprise or a sandwich.",
    6: "Put on the hat and become the character. The model does not pretend to be a Michelin chef — it actually thinks like one, within the confines of what it knows about Michelin chefs thinking.",
    7: "The danger is not the front door. It is the note hidden inside the order. Injection attacks smuggle instructions past the front-of-house into the kitchen itself.",
    8: "Sometimes you do not want a poem. You want a form. Structured output is the promise: I will give you something a machine can read, count, and act upon without interpretation."
};

class Narrator {
    constructor() {
        this.currentSection = null;
        this.texts = NARRATOR_TEXTS;
    }

    getText(sectionNumber) {
        return this.texts[sectionNumber] || '';
    }

    speakSection(sectionNumber) {
        const text = this.getText(sectionNumber);
        if (!text || typeof window.speechSynthesis === 'undefined') return;

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 0.8;
        window.speechSynthesis.speak(utterance);
    }
}

window.narrator = new Narrator();
