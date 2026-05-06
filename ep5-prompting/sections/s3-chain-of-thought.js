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
                thinking_result: '🌶️🌶️🥬', // right: spicy veggies
                steps: [
                    'Step 1: What crust? → Not specified → default thin crust ✓',
                    'Step 2: What sauce? → Vegetarian → tomato base ✓',
                    'Step 3: What toppings? → No meat, spicy → jalapeños + roasted peppers ✓',
                    'Step 4: Any conflicts? → "No meat" vs "jalapeños OK?" → jalapeños are vegetables → no conflict ✓'
                ]
            },
            {
                text: 'pizza but absolutely no cheese',
                thinking: 'No cheese is explicit. So I need pizza without the most defining ingredient. Tomato base, toppings, no mozzarella. Possible but unusual.',
                silent: '🍕🧀', // wrong: has cheese
                thinking_result: '🍅🌿🌶️', // right: cheeseless
                steps: [
                    'Step 1: What crust? → Classic → thin crust ✓',
                    'Step 2: What sauce? → Standard → tomato ✓',
                    'Step 3: What toppings? → "absolutely no cheese" is explicit → skip all cheese ✓',
                    'Step 4: Any special requests? → Make it tasty without cheese → extra herbs + drizzle ✓'
                ]
            },
            {
                text: 'make me something that tastes good',
                thinking: 'Vague. "Tastes good" is subjective. But the safest assumption is a classic, well-loved pizza. Margherita is universally acclaimed. Fresh, simple, balanced.',
                silent: '🥘', // wrong: random dish
                thinking_result: '🍕🧀🌿', // right: margherita
                steps: [
                    'Step 1: What crust? → Crowd-pleaser → thin crust ✓',
                    'Step 2: What sauce? → Classic → tomato ✓',
                    'Step 3: What toppings? → "tastes good" = safe classic → mozzarella + basil ✓',
                    'Step 4: Any special requests? → None mentioned → proceed ✓'
                ]
            },
            {
                text: 'I want pizza, but NOT with that thing you always use',
                thinking: 'They say "that thing you always use" but I don\'t know them. No context. I cannot assume. I should make a standard pizza, because I have no personalized history with this customer.',
                silent: '🍝', // wrong: assumes something specific
                thinking_result: '🍕🌶️🧀', // right: standard pizza
                steps: [
                    'Step 1: What crust? → Standard → thin crust ✓',
                    'Step 2: What sauce? → Classic → tomato ✓',
                    'Step 3: What toppings? → "that thing you always use" → unknown reference → cannot infer → default toppings ✓',
                    'Step 4: Any special requests? → Ambiguous pronoun → flag for clarification, proceed with standard ✓'
                ]
            },
            {
                text: 'deep dish, but thin crust',
                thinking: 'Contradiction detected. Deep dish IS thick crust. Thin crust IS NOT deep dish. I should ask for clarification or choose one. Most generous interpretation: they want deep-dish SIZE with thin-crust STYLE.',
                silent: '❌', // wrong: contradiction
                thinking_result: '🥖🧀', // right: thin crust, large
                steps: [
                    'Step 1: What crust? → "deep dish" = thick, "thin crust" = thin → CONTRADICTION detected ⚠️',
                    'Step 2: Resolve contradiction → most generous interpretation: large size + thin style ✓',
                    'Step 3: What sauce? → Classic → tomato ✓',
                    'Step 4: Any special requests? → Flag contradiction for customer, proceed with best guess ✓'
                ]
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

                <div id="cot-steps-panel" style="display: none; margin-top: 1rem; border: 2px solid var(--secondary-color); border-radius: 8px; overflow: hidden;">
                    <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1rem; background-color: #fdf5e6; cursor: pointer;" id="cot-steps-header">
                        <strong style="color: var(--secondary-color);">🧠 Chef's Thinking Steps</strong>
                        <button id="cot-steps-toggle-btn" style="background: none; border: 1px solid var(--secondary-color); color: var(--secondary-color); padding: 0.25rem 0.75rem; border-radius: 4px; cursor: pointer; font-size: 0.85rem;">Hide</button>
                    </div>
                    <div id="cot-steps-body" style="padding: 1rem; background-color: white; display: flex; flex-direction: column; gap: 0.5rem;">
                    </div>
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
        const stepsHeader = this.container.querySelector('#cot-steps-header');

        toggle.addEventListener('change', () => this.updateDisplay());
        prevBtn.addEventListener('click', () => this.prevOrder());
        nextBtn.addEventListener('click', () => this.nextOrder());

        stepsHeader.addEventListener('click', () => this.toggleStepsBody());

        this.updateDisplay();
    }

    toggleStepsBody() {
        const body = this.container.querySelector('#cot-steps-body');
        const btn = this.container.querySelector('#cot-steps-toggle-btn');
        const isVisible = body.style.display !== 'none';
        body.style.display = isVisible ? 'none' : 'flex';
        btn.textContent = isVisible ? 'Show' : 'Hide';
    }

    updateDisplay() {
        const order = this.orders[this.currentOrderIdx];
        const toggle = this.container.querySelector('#cot-toggle');
        const orderText = this.container.querySelector('#cot-order-text');
        const silentPizza = this.container.querySelector('#cot-silent-pizza');
        const thinkingBubble = this.container.querySelector('#cot-thinking-bubble');
        const thinkingPizza = this.container.querySelector('#cot-thinking-pizza');
        const stepsPanel = this.container.querySelector('#cot-steps-panel');
        const stepsBody = this.container.querySelector('#cot-steps-body');
        const stepsToggleBtn = this.container.querySelector('#cot-steps-toggle-btn');

        orderText.textContent = order.text;

        if (toggle.checked) {
            // Thinking mode
            thinkingBubble.parentElement.parentElement.style.opacity = '1';
            this.typeOutThinking(thinkingBubble, order.thinking);

            const thinkingDelay = order.thinking.split(' ').length * 50;
            const thinkingTimer = setTimeout(() => {
                thinkingPizza.textContent = order.thinking_result;
            }, thinkingDelay);
            this.timers.push(thinkingTimer);

            // Show steps panel after thinking finishes
            stepsPanel.style.display = 'none';
            stepsBody.innerHTML = '';
            stepsBody.style.display = 'flex';
            stepsToggleBtn.textContent = 'Hide';

            const stepsDelay = thinkingDelay + 200;
            const stepsTimer = setTimeout(() => {
                stepsPanel.style.display = 'block';
                this.animateSteps(stepsBody, order.steps);
            }, stepsDelay);
            this.timers.push(stepsTimer);
        } else {
            // Silent mode
            silentPizza.textContent = order.silent;
            thinkingBubble.textContent = '💭 (thinking disabled)';
            thinkingPizza.textContent = '?';
            stepsPanel.style.display = 'none';
            stepsBody.innerHTML = '';
        }
    }

    animateSteps(container, steps) {
        container.innerHTML = '';
        steps.forEach((step, i) => {
            const stepTimer = setTimeout(() => {
                const bubble = document.createElement('div');
                bubble.style.cssText = `
                    background-color: #fdf5e6;
                    border: 1px solid var(--secondary-color);
                    border-radius: 8px;
                    padding: 0.6rem 1rem;
                    font-size: 0.9rem;
                    color: var(--text-dark);
                    opacity: 0;
                    transition: opacity 0.25s ease;
                `;
                bubble.textContent = '💭 ' + step;
                container.appendChild(bubble);
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => { bubble.style.opacity = '1'; });
                });
            }, i * 300);
            this.timers.push(stepTimer);
        });
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
