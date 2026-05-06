// Section 5: Temperature
// Dial 0.0-2.0 controlling creativity/randomness

class TemperatureSection {
    constructor() {
        this.container = document.getElementById('s5-container');
        if (!this.container) return;

        this.temperature = 1.0;
        this.currentPizzas = [];
        this.timers = [];

        this.init();
    }

    init() {
        this.render();
        this.attachEventListeners();
    }

    render() {
        this.container.innerHTML = `
            <div class="temp-wrapper">
                <div style="margin: 1rem 0;">
                    <label class="label">Oven Temperature (Creativity Dial):</label>
                    <div style="display: flex; align-items: center; gap: 1rem; margin: 1rem 0;">
                        <span style="font-weight: bold; min-width: 40px;">0.0</span>
                        <input type="range" id="temp-slider" min="0" max="200" value="100" step="10" style="flex: 1;">
                        <span style="font-weight: bold; min-width: 40px;">2.0</span>
                    </div>
                    <p style="text-align: center; font-size: 1.5rem; color: var(--secondary-color); font-weight: bold;" id="temp-display">
                        Temperature: 1.0
                    </p>
                </div>

                <div style="margin: 1rem 0; padding: 1rem; background-color: #f9f9f9; border-radius: 8px; border: 2px dashed var(--border-color);">
                    <p class="label" style="text-align: center;">Same Order: "pepperoni pizza"</p>
                    <p class="label" style="text-align: center;">6 simultaneous generations:</p>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin: 1rem 0;">
                    ${Array(6).fill(0).map((_, i) => `
                        <div style="
                            padding: 1rem;
                            background-color: #fdf5e6;
                            border-radius: 8px;
                            border: 2px solid var(--secondary-color);
                            text-align: center;
                        ">
                            <div style="font-size: 2rem; min-height: 80px; display: flex; align-items: center; justify-content: center;" class="temp-pizza" data-idx="${i}">
                                🍕
                            </div>
                            <p class="small-text">Pizza ${i + 1}</p>
                        </div>
                    `).join('')}
                </div>

                <div style="margin: 1rem 0; padding: 1rem; background-color: #f0f0f0; border-radius: 8px;">
                    <p class="label">Entropy Indicator:</p>
                    <p style="font-size: 1.2rem; color: var(--primary-color);" id="temp-entropy-text">Predictability: Medium</p>
                </div>

                <div class="insight-box" style="background-color: #f0f0f0; padding: 1rem; border-radius: 8px; margin-top: 1rem;">
                    <strong>💡 Temperature Reality:</strong>
                    <p>At 0.0 (frozen oven), the chef always makes the same pepperoni pizza. At 1.0 (normal), slight variations appear. At 2.0 (scorching), the chef gets creative/wild: pepperoni-banana pizza, pizza-cone hybrid, upside-down-cake-pizza. Higher temperature = more novelty, more risk.</p>
                </div>
            </div>
        `;

        this.generatePizzas();
    }

    attachEventListeners() {
        const slider = this.container.querySelector('#temp-slider');
        slider.addEventListener('input', (e) => {
            this.temperature = parseInt(e.target.value) / 100;
            const display = this.container.querySelector('#temp-display');
            display.textContent = `Temperature: ${this.temperature.toFixed(1)}`;

            this.updateEntropyIndicator();
            this.generatePizzas();
        });
    }

    generatePizzas() {
        const pizzaEls = this.container.querySelectorAll('.temp-pizza');
        this.currentPizzas = [];

        pizzaEls.forEach((el, idx) => {
            el.style.opacity = '0.5';
        });

        setTimeout(() => {
            pizzaEls.forEach((el, idx) => {
                const pizza = this.generatePizzaForTemp();
                this.currentPizzas.push(pizza);
                el.textContent = pizza;
                el.style.opacity = '1';
            });
        }, 200);
    }

    generatePizzaForTemp() {
        const rand = Math.random();

        if (this.temperature < 0.3) {
            // Frozen: always the same
            return '🍕🌶️';
        } else if (this.temperature < 0.7) {
            // Cool: mostly standard with slight variations
            const toppings = [
                '🍕🌶️',
                '🍕🌶️🌶️',
                '🍕🌶️🧀'
            ];
            return toppings[Math.floor(Math.random() * toppings.length)];
        } else if (this.temperature < 1.3) {
            // Medium: some variations
            const variations = [
                '🍕🌶️',
                '🍕🌶️🧀',
                '🍕🧅🌶️',
                '🍕🌿🌶️'
            ];
            return variations[Math.floor(Math.random() * variations.length)];
        } else if (this.temperature < 1.7) {
            // Hot: creative variations
            const creative = [
                '🍕🌶️',
                '🍕🍍🌶️',
                '🍕🌶️🥑',
                '🌮🍕🌶️',
                '🍕🍰',
                '🌭🌶️🧀'
            ];
            return creative[Math.floor(Math.random() * creative.length)];
        } else {
            // Scorching: wild and unpredictable
            const wild = [
                '🍕🌶️',
                '🍕🍌🌶️',
                '🥒🍕🍦',
                '🍕🎂',
                '🎪🌶️🍕',
                '🔥🍕🚀',
                '🦑🍕🌶️',
                '👽🍕',
                '💥🍕'
            ];
            return wild[Math.floor(Math.random() * wild.length)];
        }
    }

    updateEntropyIndicator() {
        const entropyEl = this.container.querySelector('#temp-entropy-text');
        let level = 'Predictability: High';

        if (this.temperature < 0.5) {
            level = 'Predictability: Maximum (same every time)';
        } else if (this.temperature < 1.0) {
            level = 'Predictability: High';
        } else if (this.temperature < 1.5) {
            level = 'Predictability: Medium';
        } else {
            level = 'Predictability: Low (🤪 Very Creative)';
        }

        entropyEl.textContent = level;
    }

    reset() {
        this.timers.forEach(id => clearTimeout(id));
        this.timers = [];
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.sectionModules = window.sectionModules || {};
    window.sectionModules.s5 = new TemperatureSection();
});
