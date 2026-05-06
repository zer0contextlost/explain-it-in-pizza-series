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

                <div style="margin-top: 1.5rem; border-top: 2px dashed #ccc; padding-top: 1.5rem;">
                    <label class="label">Write your own pizza order:</label>
                    <textarea id="zs-custom-input" placeholder="Describe what you want..." style="width: 100%; margin-top: 0.5rem; min-height: 70px; font-size: 1rem;"></textarea>
                    <div style="margin-top: 0.75rem; text-align: center;">
                        <button id="zs-send-order-btn" style="background-color: var(--primary-color); font-size: 1rem; padding: 0.75rem 1.75rem;">
                            Send Order 📨
                        </button>
                    </div>
                    <div id="zs-custom-result" style="display: none; margin-top: 1rem; background-color: #fdf5e6; padding: 1rem; border-radius: 8px; border: 2px solid var(--secondary-color);">
                        <div id="zs-custom-emoji" style="font-size: 2.5rem; text-align: center; margin-bottom: 0.5rem;"></div>
                        <div id="zs-custom-response" style="font-size: 1rem; font-style: italic; color: var(--primary-color); min-height: 40px;"></div>
                    </div>
                    <p class="small-text" style="margin-top: 0.5rem; text-align: center; color: #888;">The clearer your order, the better zero-shot works</p>
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

        const sendOrderBtn = this.container.querySelector('#zs-send-order-btn');
        const customInput = this.container.querySelector('#zs-custom-input');

        sendOrderBtn.addEventListener('click', () => this.sendCustomOrder());
        customInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendCustomOrder();
            }
        });
    }

    generate() {
        if (this.isAnimating) return;

        this.isAnimating = true;
        const input = this.container.querySelector('#zs-prompt-input');
        this.currentPrompt = input.value || 'pizza';

        const generateBtn = this.container.querySelector('#zs-generate-btn');
        generateBtn.disabled = true;

        this.animateGeneration(() => {
            generateBtn.disabled = false;
            this.isAnimating = false;
        });
    }

    generateAgain() {
        if (this.isAnimating) return;

        this.isAnimating = true;
        const tryAgainBtn = this.container.querySelector('#zs-try-again-btn');
        tryAgainBtn.disabled = true;

        this.animateGeneration(() => {
            tryAgainBtn.disabled = false;
            this.isAnimating = false;
        });
    }

    animateGeneration(onComplete) {
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

            const wobbleId = setTimeout(() => {
                qualityFill.parentElement.classList.remove('quality-wobble');
                if (onComplete) onComplete();
            }, 300);
            this.timers.push(wobbleId);
        }, 800);

        this.timers.push(timeoutId);
    }

    sendCustomOrder() {
        const customInput = this.container.querySelector('#zs-custom-input');
        const resultEl = this.container.querySelector('#zs-custom-result');
        const emojiEl = this.container.querySelector('#zs-custom-emoji');
        const responseEl = this.container.querySelector('#zs-custom-response');
        const sendBtn = this.container.querySelector('#zs-send-order-btn');

        const text = (customInput.value || '').toLowerCase().trim();
        if (!text) return;

        sendBtn.disabled = true;
        resultEl.style.display = 'block';
        emojiEl.textContent = '⏳';
        responseEl.textContent = '';

        let emoji, response;

        if (/spicy|hot|jalap|chilli?|sriracha|heat/.test(text)) {
            emoji = '🌶️🍕🔥';
            response = '"Ooh, you like it HOT! One fiery pizza coming right up — jalapeños, crushed red pepper, and a drizzle of chilli oil. Bring water."';
        } else if (/veg(etarian)?|veggie|no meat|plant|tofu|vegan/.test(text)) {
            emoji = '🥦🍕🌿';
            response = '"Garden fresh! Roasted peppers, mushrooms, spinach, and artichoke hearts on a tomato base. Zero meat, maximum flavour."';
        } else if (/meat|beef|pepperoni|sausage|bacon|chicken|carniv/.test(text)) {
            emoji = '🥩🍕🔥';
            response = '"MEAT FEAST incoming! Pepperoni, Italian sausage, pulled beef, and crispy bacon. This pizza lifts weights."';
        } else if (/simple|classic|plain|basic|margherita|traditional/.test(text)) {
            emoji = '🍕🌿🧀';
            response = '"Keeping it classic — a true Margherita. San Marzano tomatoes, fresh mozzarella, and a leaf of basil. Perfection needs no extras."';
        } else {
            emoji = '😐';
            response = '"Chef stares blankly... zero-shot only works when the request is clear."';
        }

        const timeoutId = setTimeout(() => {
            emojiEl.textContent = emoji;
            this.typeOutCustomResponse(responseEl, response, () => {
                sendBtn.disabled = false;
            });
        }, 700);

        this.timers.push(timeoutId);
    }

    typeOutCustomResponse(el, text, onComplete) {
        el.textContent = '';
        const chars = text.split('');
        let idx = 0;

        const timer = setInterval(() => {
            if (idx < chars.length) {
                el.textContent += chars[idx];
                idx++;
            } else {
                clearInterval(timer);
                if (onComplete) onComplete();
            }
        }, 18);

        this.timers.push(timer);
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
