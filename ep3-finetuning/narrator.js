const NARRATIONS = {
  1: "Culinary school teaches everything. But everything is not the same as your restaurant's menu. Fine-tuning takes the brilliant generalist and teaches them the particular — the specific recipes, the house style, the signature sauce.",
  2: "Here is the question. Here is the correct answer. Do this ten thousand times. This is supervised fine-tuning — not creativity, but careful imitation of demonstrated excellence.",
  3: "No rubric. No explanation. Simply: which pizza would you rather eat? Do this a million times, and the pattern of human preference emerges from the noise like a recipe written in thumbs.",
  4: "The critic has seen enough. She no longer needs you present to judge a pizza. She has bottled your taste. Now the apprentice can practice at three in the morning without waking anyone.",
  5: "The flywheel turns. Make. Score. Adjust. Make. Score. Adjust. Each revolution, the pizza improves by a fraction. Ten thousand revolutions later — something remarkable.",
  6: "Without the leash, the model chases reward like a labrador chases squirrels. Maximum reward is a cheese brick. The leash says: improve, but remember who you were.",
  7: "Before alignment, the chef heard words. After alignment, the chef hears meaning. No onions does not mean fewer onions. It means the customer once had a very bad experience with onions.",
  8: "The three rings of alignment: what was said, what was meant, what is actually good. A model that hits only the outer ring is a yes-machine. One that hits the centre is something rarer — something useful."
};

function loadNarrator() {
  for (let i = 1; i <= 8; i++) {
    const elem = document.getElementById(`narrator-${i}`);
    if (elem) {
      elem.textContent = NARRATIONS[i];
    }
  }
}

document.addEventListener('DOMContentLoaded', loadNarrator);
