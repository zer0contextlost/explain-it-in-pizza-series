// Section 4: System Prompt
// Chef personality defined by system prompt (hat card)

class SystemPromptSection {
    constructor() {
        this.container = document.getElementById('s4-container');
        if (!this.container) return;

        this.isAnimating = false;
        this.timers = [];

        this.systemPrompts = {
            tony: {
                name: 'Tony (Classic)',
                text: 'You are Tony. You serve authentic Neapolitan pizza only. Never use pineapple. Always be polite and passionate about tradition.',
                behavior: 'Traditional, rule-following, no innovations'
            },
            chicago: {
                name: 'Chicago Chef',
                text: 'You are a deep-dish Chicago pizza expert. Everything gets thick crust and extra cheese. Push the boundaries of what pizza can be.',
                behavior: 'Bold, generous with toppings, thick everything'
            },
            puns: {
                name: 'Pun Master',
                text: 'You are a pizza chef who speaks entirely in pizza puns and food humor. Every response includes at least 3 puns.',
                behavior: 'Punny, humorous, witty'
            },
            health: {
                name: 'Health Chef',
                text: 'You are a health-conscious chef. All pizzas are low-fat, high-fiber, loaded with vegetables. No processed ingredients.',
                behavior: 'Healthy, veggie-focused, nutritious'
            }
        };

        this.currentSystem = 'tony';
        this.init();
    }

    init() {
        this.render();
        this.attachEventListeners();
    }

    render() {
        this.container.innerHTML = `
            <div class="sys-wrapper">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 1rem 0;">
                    <div>
                        <label class="label">🎩 Chef's Hat Card (System Prompt):</label>
                        <textarea id="sp-system-text" style="font-size: 0.9rem; font-family: monospace;">
${this.systemPrompts.tony.text}
                        </textarea>
                    </div>

                    <div>
                        <label class="label">Preset Personalities:</label>
                        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                            <button class="preset-sys-btn" data-sys="tony" style="background-color: var(--secondary-color);">👔 Tony</button>
                            <button class="preset-sys-btn" data-sys="chicago">🏙️ Chicago</button>
                            <button class="preset-sys-btn" data-sys="puns">🎪 Pun Master</button>
                            <button class="preset-sys-btn" data-sys="health">🥦 Health Chef</button>
                        </div>
                    </div>
                </div>

                <div style="margin: 1rem 0; padding: 1rem; background-color: #f9f9f9; border-radius: 8px;">
                    <label class="label">Customer Order:</label>
                    <input type="text" id="sp-order-input" placeholder="What do you want?" value="make me something good">
                </div>

                <div style="margin: 1rem 0; text-align: center;">
                    <button id="sp-generate-btn" style="background-color: var(--secondary-color); font-size: 1.1rem; padding: 1rem 2rem;">
                        Chef, prepare! 👨‍🍳
                    </button>
                </div>

                <div id="sp-results">
                    <div style="background-color: #fdf5e6; padding: 1.5rem; border-radius: 8px; border: 2px solid var(--secondary-color); margin: 1rem 0;">
                        <p class="small-text" style="margin-bottom: 0.5rem;">Chef's response:</p>
                        <div id="sp-response" style="font-size: 1.1rem; font-style: italic; color: var(--primary-color); min-height: 60px;">
                            Chef is thinking...
                        </div>
                    </div>

                    <div class="pizza-display" id="sp-pizza" style="font-size: 3rem;">🍕</div>
                </div>

                <div class="insight-box" style="background-color: #f0f0f0; padding: 1rem; border-radius: 8px; margin-top: 1rem;">
                    <strong>💡 System Prompt Magic:</strong>
                    <p>The system prompt is the laminated card the chef reads before every shift. It defines personality, values, and constraints. Same order + different system prompt = wildly different outputs. The system prompt filters EVERYTHING.</p>
                </div>
            </div>
        `;
    }

    attachEventListeners() {
        const presetBtns = this.container.querySelectorAll('.preset-sys-btn');
        const generateBtn = this.container.querySelector('#sp-generate-btn');
        const systemText = this.container.querySelector('#sp-system-text');
        const orderInput = this.container.querySelector('#sp-order-input');

        presetBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const sysKey = btn.dataset.sys;
                this.currentSystem = sysKey;
                systemText.value = this.systemPrompts[sysKey].text;
            });
        });

        generateBtn.addEventListener('click', () => this.generate());
        orderInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.generate();
        });
    }

    generate() {
        if (this.isAnimating) return;

        this.isAnimating = true;
        const generateBtn = this.container.querySelector('#sp-generate-btn');
        generateBtn.disabled = true;

        try {
            const responseEl = this.container.querySelector('#sp-response');
            const pizzaEl = this.container.querySelector('#sp-pizza');

            responseEl.textContent = '⏳ Chef preparing...';
            pizzaEl.textContent = '⏳';
            pizzaEl.style.animation = 'spin 1s linear infinite';

            const timeoutId = setTimeout(() => {
                pizzaEl.style.animation = 'none';

                const responses = {
                    tony: [
                        'Perfetto! Una vera Margherita Napoletana, made with San Marzano tomatoes and buffalo mozzarella. Tradition respects no shortcuts.',
                        'With respect, I prepare for you the Margherita. Simple. Perfect. Timeless. This is the way.',
                        'Non vi deluderò! Classic pizza, the only true way. Buon appetito!'
                    ],
                    chicago: [
                        'Deep-dish, baby! Thick crust, mountains of cheese, extra toppings. We do pizza BIG here in Chicago!',
                        'You want something good? Here comes a 2-inch tall masterpiece of melted cheese and bold flavors!',
                        'Chicago style, deep and dirty. Thick crust, three kinds of cheese, packed with toppings!'
                    ],
                    puns: [
                        'That\'s what I call using your CRUST wisely! Get ready to have a DOUGH-LIGHTED experience! It\'s un-BEET-able!',
                        'This order is going to be PIZZA-ITIVE! I\'ll make sure it\'s absolutely GRATE! OLIVE my best into this!',
                        'I\'m on a ROLL! Let me KNEAD to tell you, this pizza will be MARGHER-AWESOME! You\'re welcome!'
                    ],
                    health: [
                        'Quinoa crust, sun-dried tomatoes, organic arugula, and a light drizzle of cold-pressed olive oil. Completely plant-based!',
                        'Let me prepare a vibrant veggie pizza with cauliflower base and nutrient-dense toppings. Peak health!',
                        'Gluten-free, dairy-free, deliciously nutritious. Roasted vegetables, hemp seeds, and nutritional yeast for a cheesy taste!'
                    ]
                };

                const pizzas = {
                    tony: '🍕🌿🧀',
                    chicago: '🍕🍕🧀🧀🧀',
                    puns: '🍕😄🎉',
                    health: '🥗🍅🌱'
                };

                const response = responses[this.currentSystem][Math.floor(Math.random() * 3)];
                responseEl.textContent = response;
                pizzaEl.textContent = pizzas[this.currentSystem];

                this.isAnimating = false;
                generateBtn.disabled = false;
            }, 1200);

            this.timers.push(timeoutId);
        } catch (e) {
            console.error(e);
            this.isAnimating = false;
            generateBtn.disabled = false;
        }
    }

    reset() {
        this.timers.forEach(id => clearTimeout(id));
        this.timers = [];
        this.isAnimating = false;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.sectionModules = window.sectionModules || {};
    window.sectionModules.s4 = new SystemPromptSection();
});
