// Section 1: Zero-Shot Prompting
// Vague inputs → unpredictable outputs, quality bar wobbles

class ZeroShotSection {
    constructor() {
        this.container = document.getElementById('s1-container');
        if (!this.container) return;

        this.isAnimating = false;
        this.currentPrompt = '';
        this.timers = [];

        this.init();
    }

    init() {
        this.render();
        this.attachEventListeners();
    }

    render() {
        this.container.innerHTML = `
            <div class="zero-shot-wrapper">
                <p class="small-text">Type a vague order or choose a preset:</p>

                <div class="preset-buttons" style="margin: 1rem 0; display: flex; gap: 0.5rem; flex-wrap: wrap;">
                    <button class="preset-btn" data-prompt="food">food</button>
                    <button class="preset-btn" data-prompt="pizza">pizza</button>
                    <button class="preset-btn" data-prompt="something red">something red</button>
                    <button class="preset-btn" data-prompt="surprise me">surprise me</button>
                    <button class="preset-btn" data-prompt="healthy">healthy</button>
                </div>

                <div style="margin: 1rem 0;">
                    <label class="label">Your order:</label>
                    <input type="text" id="zs-prompt-input" placeholder="Say anything..." value="pizza">
                </div>

                <div style="margin: 1rem 0; text-align: center;">
                    <button id="zs-generate-btn" style="background-color: var(--secondary-color); font-size: 1.1rem; padding: 1rem 2rem;">
                        Chef, make pizza! 👨‍🍳
                    </button>
                </div>

                <div id="zs-results">
                    <div class="pizza-display" id="zs-pizza">🍕</div>
                    <p class="small-text" style="text-align: center;">Quality Bar:</p>
                    <div class="quality-bar">
                        <div class="quality-fill" id="zs-quality-fill" style="width: 50%;"></div>
                    </div>
                </div>

                <div style="margin-top: 1rem; text-align: center;">
                    <button id="zs-try-again-btn" style="background-color: var(--accent-color);">
                        Try Again 🎲
                    </button>
                </div>

                <div class="insight-box" style="background-color: #f0f0f0; padding: 1rem; border-radius: 8px; margin-top: 1rem;">
                    <strong>💡 Zero-Shot Reality:</strong>
                    <p>With no examples, the model has to guess. Same vague input = different output every time. The quality bar wobbles because the model is improvising.</p>
                </div>
            </div>
        `;
    }

    attachEventListeners() {
        const promptInput = this.container.querySelector('#zs-prompt-input');
        const generateBtn = this.container.querySelector('#zs-generate-btn');
        const tryAgainBtn = this.container.querySelector('#zs-try-again-btn');
        const presetBtns = this.container.querySelectorAll('.preset-btn');

        presetBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                promptInput.value = btn.dataset.prompt;
                this.generate();
            });
        });

        promptInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.generate();
        });

        generateBtn.addEventListener('click', () => this.generate());
        tryAgainBtn.addEventListener('click', () => this.generateAgain());
    }

    generate() {
        if (this.isAnimating) return;

        this.isAnimating = true;
        const input = this.container.querySelector('#zs-prompt-input');
        this.currentPrompt = input.value || 'pizza';

        const generateBtn = this.container.querySelector('#zs-generate-btn');
        generateBtn.disabled = true;

        try {
            this.animateGeneration();
        } finally {
            generateBtn.disabled = false;
            this.isAnimating = false;
        }
    }

    generateAgain() {
        if (this.isAnimating) return;

        this.isAnimating = true;
        const tryAgainBtn = this.container.querySelector('#zs-try-again-btn');
        tryAgainBtn.disabled = true;

        try {
            this.animateGeneration();
        } finally {
            tryAgainBtn.disabled = false;
            this.isAnimating = false;
        }
    }

    animateGeneration() {
        const pizzaEl = this.container.querySelector('#zs-pizza');
        const qualityFill = this.container.querySelector('#zs-quality-fill');

        // Spinner animation
        pizzaEl.textContent = '⏳';
        pizzaEl.style.animation = 'spin 1s linear infinite';

        const timeoutId = setTimeout(() => {
            pizzaEl.style.animation = 'none';

            // Generate a random pizza
            const pizza = this.generateRandomPizza();
            pizzaEl.textContent = pizza;

            // Random quality (0-100%)
            const quality = window.utils.randomInt(20, 95);
            qualityFill.style.width = quality + '%';
            qualityFill.parentElement.classList.add('quality-wobble');

            setTimeout(() => {
                qualityFill.parentElement.classList.remove('quality-wobble');
            }, 300);
        }, 800);

        this.timers.push(timeoutId);
    }

    generateRandomPizza() {
        const pizzas = [
            '🍕', '🍕🌶️', '🍕🧀', '🍕🍅', '🍕🌿',
            '🥘', '🍝', '🥙', '🌮', '🍔',
            '🍕🍕🍕', '🍝🍅', '🥩🧀', '🌭🌭'
        ];
        return pizzas[Math.floor(Math.random() * pizzas.length)];
    }

    reset() {
        this.timers.forEach(id => clearTimeout(id));
        this.timers = [];
        this.isAnimating = false;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.sectionModules = window.sectionModules || {};
    window.sectionModules.s1 = new ZeroShotSection();
});
