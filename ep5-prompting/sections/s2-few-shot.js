// Section 2: Few-Shot Prompting
// Add examples to show patterns, accuracy increases

class FewShotSection {
    constructor() {
        this.container = document.getElementById('s2-container');
        if (!this.container) return;

        this.examples = [];
        this.isAnimating = false;
        this.timers = [];

        this.exampleBank = [
            { input: 'pepperoni please', output: '🍕🌶️' },
            { input: 'four cheese', output: '🧀🧀🧀🧀' },
            { input: 'veggie special', output: '🥬🌶️🍄🧅' },
            { input: 'meat lovers', output: '🍖🍖🥩🌭' },
            { input: 'hawaiian style', output: '🍕🍍🌶️' },
            { input: 'mushroom pizza', output: '🍄🍄🍄' },
            { input: 'white pizza', output: '🧀🧀🍕' }
        ];

        this.init();
    }

    init() {
        this.render();
        this.attachEventListeners();
    }

    render() {
        this.container.innerHTML = `
            <div class="few-shot-wrapper">
                <p class="small-text">Drag examples from the bank to teach the chef a pattern:</p>

                <div style="margin: 1rem 0;">
                    <label class="label">📚 Example Bank (drag to counter):</label>
                    <div class="example-bank" id="fs-bank" style="
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                        gap: 0.5rem;
                        padding: 1rem;
                        background-color: #f9f9f9;
                        border-radius: 8px;
                        border: 2px dashed var(--border-color);
                    ">
                    </div>
                </div>

                <div style="margin: 1rem 0;">
                    <label class="label">👨‍🍳 Counter (examples chef is studying):</label>
                    <div class="counter-zone" id="fs-counter" style="
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                        gap: 0.5rem;
                        padding: 1rem;
                        background-color: #fdf5e6;
                        border-radius: 8px;
                        border: 2px solid var(--secondary-color);
                        min-height: 100px;
                    "></div>
                </div>

                <div style="margin: 1rem 0;">
                    <label class="label">Now order:</label>
                    <input type="text" id="fs-order-input" placeholder="What would you like?" value="pepperoni please">
                </div>

                <div style="margin: 1rem 0; text-align: center;">
                    <button id="fs-generate-btn" style="background-color: var(--secondary-color); font-size: 1.1rem; padding: 1rem 2rem;">
                        Chef, create! 👨‍🍳
                    </button>
                </div>

                <div id="fs-results">
                    <div class="pizza-display" id="fs-pizza">🍕</div>
                    <p class="small-text" style="text-align: center;">Accuracy:</p>
                    <div class="quality-bar">
                        <div class="quality-fill" id="fs-accuracy-fill" style="width: 40%; background: linear-gradient(90deg, #e74c3c 0%, #27ae60 100%);"></div>
                    </div>
                    <p class="small-text" style="text-align: center;" id="fs-accuracy-text">0 examples = 40% accuracy</p>
                </div>

                <div class="insight-box" style="background-color: #f0f0f0; padding: 1rem; border-radius: 8px; margin-top: 1rem;">
                    <strong>💡 Few-Shot Power:</strong>
                    <p>1 example = 65% accuracy | 2 examples = 82% accuracy | 3 examples = 95% accuracy. Pattern recognition beats lengthy instructions.</p>
                </div>
            </div>
        `;

        this.populateBank();
    }

    populateBank() {
        const bankEl = this.container.querySelector('#fs-bank');
        bankEl.innerHTML = '';

        this.exampleBank.forEach((example, idx) => {
            const card = document.createElement('div');
            card.className = 'card';
            card.draggable = true;
            card.dataset.index = idx;
            card.innerHTML = `
                <div><strong>"${example.input}"</strong></div>
                <div style="color: var(--secondary-color); font-size: 1.5rem;">${example.output}</div>
            `;

            card.addEventListener('dragstart', (e) => {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('example-idx', idx);
                card.style.opacity = '0.6';
            });

            card.addEventListener('dragend', () => {
                card.style.opacity = '1';
            });

            bankEl.appendChild(card);
        });
    }

    attachEventListeners() {
        const counterEl = this.container.querySelector('#fs-counter');
        const generateBtn = this.container.querySelector('#fs-generate-btn');
        const orderInput = this.container.querySelector('#fs-order-input');

        counterEl.addEventListener('dragover', (e) => {
            e.preventDefault();
            counterEl.style.backgroundColor = 'rgba(255, 107, 53, 0.1)';
        });

        counterEl.addEventListener('dragleave', () => {
            counterEl.style.backgroundColor = '#fdf5e6';
        });

        counterEl.addEventListener('drop', (e) => {
            e.preventDefault();
            counterEl.style.backgroundColor = '#fdf5e6';

            const idx = parseInt(e.dataTransfer.getData('example-idx'));
            const example = this.exampleBank[idx];

            if (this.examples.length < 3 && !this.examples.some(ex => ex.input === example.input)) {
                this.examples.push(example);
                this.updateCounter();
                this.updateAccuracy();
            }
        });

        generateBtn.addEventListener('click', () => this.generate());
        orderInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.generate();
        });
    }

    updateCounter() {
        const counterEl = this.container.querySelector('#fs-counter');
        counterEl.innerHTML = '';

        this.examples.forEach((example, idx) => {
            const card = document.createElement('div');
            card.className = 'card selected';
            card.innerHTML = `
                <div><strong>"${example.input}"</strong></div>
                <div style="color: var(--secondary-color); font-size: 1.2rem;">${example.output}</div>
                <button style="
                    background-color: var(--warning-color);
                    padding: 0.3rem 0.6rem;
                    font-size: 0.8rem;
                    margin-top: 0.5rem;
                    width: 100%;
                " onclick="window.sectionModules.s2.removeExample(${idx})">Remove</button>
            `;
            counterEl.appendChild(card);
        });

        if (this.examples.length === 0) {
            counterEl.innerHTML = '<p style="color: #999; grid-column: 1/-1; text-align: center;">Drag examples here</p>';
        }
    }

    removeExample(idx) {
        this.examples.splice(idx, 1);
        this.updateCounter();
        this.updateAccuracy();
    }

    updateAccuracy() {
        const accuracyFill = this.container.querySelector('#fs-accuracy-fill');
        const accuracyText = this.container.querySelector('#fs-accuracy-text');

        const accuracies = [40, 65, 82, 95];
        const accuracy = accuracies[this.examples.length];

        accuracyFill.style.width = accuracy + '%';

        const messages = [
            '0 examples = 40% accuracy',
            '1 example = 65% accuracy',
            '2 examples = 82% accuracy',
            '3 examples = 95% accuracy'
        ];
        accuracyText.textContent = messages[this.examples.length];
    }

    generate() {
        if (this.isAnimating) return;

        this.isAnimating = true;
        const generateBtn = this.container.querySelector('#fs-generate-btn');
        generateBtn.disabled = true;

        try {
            const pizzaEl = this.container.querySelector('#fs-pizza');
            pizzaEl.textContent = '⏳';
            pizzaEl.style.animation = 'spin 1s linear infinite';

            const timeoutId = setTimeout(() => {
                pizzaEl.style.animation = 'none';

                // Simple generation based on example count
                if (this.examples.length === 0) {
                    pizzaEl.textContent = '🥘'; // Random
                } else if (this.examples.length === 1) {
                    pizzaEl.textContent = this.examples[0].output;
                } else if (this.examples.length === 2) {
                    pizzaEl.textContent = this.examples[0].output + this.examples[1].output;
                } else {
                    pizzaEl.textContent = this.examples[0].output + this.examples[1].output + this.examples[2].output;
                }

                this.isAnimating = false;
                generateBtn.disabled = false;
            }, 800);

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
        this.examples = [];
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.sectionModules = window.sectionModules || {};
    window.sectionModules.s2 = new FewShotSection();
});
