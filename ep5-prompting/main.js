// Main initialization and coordination
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the page
    console.log('Episode 5: Prompt Engineering initialized');

    // Morph the hero speech bubble text
    morphHeroText();

    // Initialize all sections
    window.sectionModules = {};
});

function morphHeroText() {
    const textSequence = ['pizza', 'be specific', 'show examples', 'think it through'];
    const bubbleEl = document.querySelector('.bubble-text');
    let currentIndex = 0;

    setInterval(() => {
        currentIndex = (currentIndex + 1) % textSequence.length;
        bubbleEl.textContent = textSequence[currentIndex];
    }, 2000);
}

// Utility: Create a container for a section
function createSectionContainer(containerId) {
    return document.getElementById(containerId);
}

// Global state for all sections
window.sectionState = {};

// Export utilities
window.utils = {
    createSectionContainer,
    randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    },
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    shuffleArray(arr) {
        const copy = [...arr];
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
    },
    emojiPizza() {
        const bases = ['🍕', '🥘', '🍝'];
        const toppings = ['🌶️', '🧀', '🍅', '🫒', '🌿', '🍖', '🥩', '🧅', '🍄'];
        const base = bases[Math.floor(Math.random() * bases.length)];
        const topping1 = toppings[Math.floor(Math.random() * toppings.length)];
        const topping2 = toppings[Math.floor(Math.random() * toppings.length)];
        return `${base} ${topping1}${topping2}`;
    },
    debounce(fn, delay) {
        let timeoutId;
        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => fn.apply(this, args), delay);
        };
    }
};
