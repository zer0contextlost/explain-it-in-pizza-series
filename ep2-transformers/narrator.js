const NARRATIONS = {
    1: "Each word, stripped of its letters, becomes a point in a vast mathematical space. Words with similar meanings cluster together, like family recipes passed down through generations.",
    2: "Position matters profoundly. The word 'bank' near 'river' carries a different meaning entirely from 'bank' near 'money'. The kitchen must remember the order, or the recipe becomes chaos.",
    3: "Now — the true magic of the transformer. Every ingredient simultaneously asks every other: what do you mean to me? The anchovy gazes at the caper. The basil contemplates the tomato. All at once. All in parallel.",
    4: "The raw scores of attraction must be tamed. Softmax — like a strict maitre d' — forces every topping to split its attention budget. Pay more attention to one, and you must pay less to another. The mathematics of focus.",
    5: "But one perspective is never enough. Eight specialist critics examine the same pizza simultaneously — one sees texture, another sees heat, another sees color. Together they perceive what none could alone.",
    6: "After the great conversation, each ingredient retreats. Alone at its prep station, it integrates everything it has learned. This private transformation is where understanding deepens into wisdom.",
    7: "Before the next round begins, the calibration scale resets. No flavor may shout above the others. The habanero is brought to heel. The quiet basil, at last, is heard. Balance is not a compromise — it is a necessity.",
    8: "And here — assembled at last — is the full machine. Attention. Transformation. Normalisation. The original ingredient, always added back, so nothing is forgotten. Stack this twelve times, or ninety-six, and you have built the mind behind the machine."
};

export class Narrator {
    constructor() {
        this.enabled = localStorage.getItem('narrator-enabled') !== 'false';
        this.utterance = null;
    }

    speak(sectionNum) {
        if (!this.enabled) return;
        if (!('speechSynthesis' in window)) return;

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const text = NARRATIONS[sectionNum];
        if (!text) return;

        this.utterance = new SpeechSynthesisUtterance(text);
        this.utterance.rate = 0.95;
        this.utterance.pitch = 1.0;
        this.utterance.volume = 0.9;

        window.speechSynthesis.speak(this.utterance);
    }

    toggle() {
        this.enabled = !this.enabled;
        localStorage.setItem('narrator-enabled', this.enabled);
        return this.enabled;
    }

    stop() {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
    }
}
