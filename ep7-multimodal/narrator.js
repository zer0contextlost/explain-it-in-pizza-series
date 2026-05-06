const NARRATIONS = {
    1: "The chef has learned something remarkable. A photograph of a pepperoni pizza and the words 'pepperoni pizza' live in the same neighbourhood of meaning. Different languages. Same address.",
    2: "The image is not seen whole. It is read in pieces — sixteen pieces, each becoming a word, each joining the sentence. The chef does not see the pizza. He reads it, patch by patch.",
    3: "As the caption is written, eyes dart back to the image. This word — 'crispy' — glances at the crust patch. This word — 'loaded' — surveys the toppings. Text and image, in constant conversation.",
    4: "The finished pizza was always there, hidden inside the noise. Denoising is not creation — it is revelation. Each step uncovers a little more of what was always, mathematically, present.",
    5: "Sound becomes pattern. Pattern becomes image. Image becomes words. The chef processes speech the same way he processes everything else — by turning it into something he already knows how to read.",
    6: "A single frame is a photograph. A sequence is a story. The chef notices what changed between moments — the dough that was not there before, the cheese that has begun to melt.",
    7: "One library. Every language. The word, the image, the sound, the video — all translated into the same coordinates. Find pepperoni in any modality, and you arrive at the same shelf.",
    8: "The model sees round. Red. Circular hole. It says: pizza. With ninety-four percent confidence. It has never tasted a bagel. It never will. This is the limit at the edge of vision."
};

export function setNarration(sectionNumber) {
    const narrationEl = document.getElementById('narrator-text');
    if (narrationEl && NARRATIONS[sectionNumber]) {
        narrationEl.textContent = NARRATIONS[sectionNumber];
    }
}
