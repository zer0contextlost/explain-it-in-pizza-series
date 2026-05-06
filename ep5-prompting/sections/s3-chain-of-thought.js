// Section 3: Chain-of-Thought
// Silent vs Thinking chef, showing reasoning prevents errors

class ChainOfThoughtSection {
    constructor() {
        this.container = document.getElementById('s3-container');
        if (!this.container) return;

        this.currentOrderIdx = 0;
        this.isAnimating = false;
        this.timers = [];

        this.orders = [
            {
                text: 'spicy vegetarian — no meat, but jalapeños OK?',
                thinking: 'They want no meat... so vegetarian. But they want it spicy, and jalapeños are spicy peppers... they explicitly asked if jalapeños are OK even though they said no meat. This means they want jalapeños ON the pizza. No meat, yes jalapeños.',
                silent: '🥩🌶️', // wrong: includes meat
                thinking_result: '🌶️🌶️🥬' // right: spicy veggies
            },
            {
                text: 'pizza but absolutely no cheese',
                thinking: 'No cheese is explicit. So I need pizza without the most defining ingredient. Tomato base, toppings, no mozzarella. Possible but unusual.',
                silent: '🍕🧀', // wrong: has cheese
                thinking_result: '🍅🌿🌶️' // right: cheeseless
            },
            {
                text: 'make me something that tastes good',
                thinking: 'Vague. "Tastes good" is subjective. But the safest assumption is a classic, well-loved pizza. Margherita is universally acclaimed. Fresh, simple, balanced.',
                silent: '🥘', // wrong: random dish
                thinking_result: '🍕🧀🌿' // right: margherita
            },
            {
                text: 'I want pizza, but NOT with that thing you always use',
                thinking: 'They say "that thing you always use" but I don\'t know them. No context. I cannot assume. I should make a standard pizza, because I have no personalized history with this customer.',
                silent: '🍝', // wrong: assumes something specific
                thinking_result: '🍕🌶️🧀' // right: standard pizza
            },
            {
                text: 'deep dish, but thin crust',
                thinking: 'Contradiction detected. Deep dish IS thick crust. Thin crust IS NOT deep dish. I should ask for clarification or choose one. Most generous interpretation: they want deep-dish SIZE with thin-crust STYLE.',
                silent: '❌', // wrong: contradiction
                thinking_result: '🥖🧀' // right: thin crust, large
            }
        ];

        this.init();
    }

    init() {
        this.render();
        this.attachEventListeners();
    }

    render() {
        this.container.innerHTML = `
            <div class="cot-wrapper">
                <div style="margin: 1rem 0; display: flex; align-items: center; gap: 1rem;">
                    <label class="label" style="margin: 0;">Think out loud:</label>
                    <label class="toggle-switch">
                        <input type="checkbox" id="cot-toggle" checked>
                        <span class="slider"></span>
                    </label>
                </div>

                <div style="margin: 1rem 0; padding: 1rem; background-color: #f9f9f9; border-radius: 8px;">
                    <p class="label">Order ${this.currentOrderIdx + 1} of ${this.orders.length}:</p>
                    <p style="font-size: 1.1rem; color: var(--primary-color); font-weight: bold;" id="cot-order-text">
                        ${this.orders[this.currentOrderIdx].text}
                    </p>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 1rem 0;">
                    <div style="background-color: #f0f0f0; padding: 1rem; border-radius: 8px; border: 2px solid #999;">
                        <h3 style="color: var(--text-dark); margin-bottom: 0.5rem;">🤐 Silent Chef</h3>
                        <p class="small-text" style="margin-bottom: 1rem;">Rushes. No thinking.</p>
                        <div class="pizza-display" id="cot-silent-pizza" style="font-size: 2.5rem; padding: 1rem; border: none; background: none;">🍕</div>
                    </div>

                    <div style="background-color: #fdf5e6; padding: 1rem; border-radius: 8px; border: 2px solid var(--secondary-color);">
                        <h3 style="color: var(--secondary-color); margin-bottom: 0.5rem;">🤔 Thinking Chef</h3>
                        <div id="cot-thinking-bubble" style="
                            background-color: white;
                            padding: 1rem;
                            border-radius: 8px;
                            min-height: 80px;
                            margin-bottom: 1rem;
                            border: 1px solid var(--secondary-color);
                            color: var(--text-dark);
                            font-size: 0.9rem;
                            font-style: italic;
                        ">💭 Thinking...</div>
                        <div class="pizza-display" id="cot-thinking-pizza" style="font-size: 2.5rem; padding: 1rem; border: none; background: none;">🍕</div>
                    </div>
                </div>

                <div style="display: flex; gap: 1rem; justify-content: center; margin: 1rem 0;">
                    <button id="cot-prev-btn" style="background-color: #7f8c8d;">← Previous</button>
                    <button id="cot-next-btn" style="background-color: var(--secondary-color);">Next →</button>
                </div>

                <div class="insight-box" style="background-color: #f0f0f0; padding: 1rem; border-radius: 8px; margin-top: 1rem;">
                    <strong>💡 Chain-of-Thought Advantage:</strong>
                    <p>Showing your reasoning (thinking out loud) catches errors before they happen. The silent chef rushes and makes mistakes on ambiguous or contradictory prompts. The thinking chef reasons through it.</p>
                </div>
            </div>
        `;
    }

    attachEventListeners() {
        const toggle = this.container.querySelector('#cot-toggle');
        const prevBtn = this.container.querySelector('#cot-prev-btn');
        const nextBtn = this.container.querySelector('#cot-next-btn');

        toggle.addEventListener('change', () => this.updateDisplay());
        prevBtn.addEventListener('click', () => this.prevOrder());
        nextBtn.addEventListener('click', () => this.nextOrder());

        this.updateDisplay();
    }

    updateDisplay() {
        const order = this.orders[this.currentOrderIdx];
        const toggle = this.container.querySelector('#cot-toggle');
        const orderText = this.container.querySelector('#cot-order-text');
        const silentPizza = this.container.querySelector('#cot-silent-pizza');
        const thinkingBubble = this.container.querySelector('#cot-thinking-bubble');
        const thinkingPizza = this.container.querySelector('#cot-thinking-pizza');

        orderText.textContent = order.text;

        if (toggle.checked) {
            // Thinking mode
            thinkingBubble.parentElement.parentElement.style.opacity = '1';
            this.typeOutThinking(thinkingBubble, order.thinking);

            setTimeout(() => {
                thinkingPizza.textContent = order.thinking_result;
            }, order.thinking.split(' ').length * 50);
        } else {
            // Silent mode
            silentPizza.textContent = order.silent;
            thinkingBubble.textContent = '💭 (thinking disabled)';
            thinkingPizza.textContent = '?';
        }
    }

    typeOutThinking(el, text) {
        el.innerHTML = '';
        const words = text.split(' ');
        let idx = 0;

        const timer = setInterval(() => {
            if (idx < words.length) {
                el.textContent += (idx === 0 ? '' : ' ') + words[idx];
                idx++;
            } else {
                clearInterval(timer);
            }
        }, 50);

        this.timers.push(timer);
    }

    prevOrder() {
        this.timers.forEach(id => clearInterval(id));
        this.timers = [];

        this.currentOrderIdx = (this.currentOrderIdx - 1 + this.orders.length) % this.orders.length;
        this.updateDisplay();
    }

    nextOrder() {
        this.timers.forEach(id => clearInterval(id));
        this.timers = [];

        this.currentOrderIdx = (this.currentOrderIdx + 1) % this.orders.length;
        this.updateDisplay();
    }

    reset() {
        this.timers.forEach(id => clearInterval(id));
        this.timers = [];
        this.isAnimating = false;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.sectionModules = window.sectionModules || {};
    window.sectionModules.s3 = new ChainOfThoughtSection();
});
