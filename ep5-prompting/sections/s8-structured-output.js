// Section 8: Structured Output (JSON Mode)
// Prose vs JSON output modes

class StructuredOutputSection {
    constructor() {
        this.container = document.getElementById('s8-container');
        if (!this.container) return;

        this.isAnimating = false;
        this.timers = [];
        this.jsonMode = false;
        this.currentOrderIdx = 0;

        this.orders = [
            {
                input: 'pepperoni pizza with extra cheese',
                prose: 'I have crafted for you a classic Italian pepperoni pizza with a perfectly charred thin crust, fresh San Marzano tomato sauce, generous layers of creamy buffalo mozzarella, and authentic Italian pepperoni slices that curl delightfully under the heat. The cheese has been added in extra proportion as requested, creating a delightfully cheesy masterpiece.',
                json: {
                    crust: 'thin',
                    sauce: 'san-marzano',
                    cheese: 'buffalo-mozzarella',
                    cheese_amount: 'extra',
                    toppings: ['pepperoni'],
                    size: '12-inch',
                    quality_rating: 4.8
                }
            },
            {
                input: 'vegetarian with mushrooms and spinach',
                prose: 'A vibrant vegetarian pizza featuring a whole wheat crust base, topped with tangy tomato sauce, melted mozzarella, sautéed mushrooms with their earthy undertones, fresh spinach providing a pop of green, and finished with a drizzle of olive oil and fresh oregano for Mediterranean flair.',
                json: {
                    crust: 'whole-wheat',
                    sauce: 'tomato',
                    cheese: 'mozzarella',
                    toppings: ['mushrooms', 'spinach', 'oregano'],
                    size: '12-inch',
                    vegetarian: true,
                    quality_rating: 4.6
                }
            },
            {
                input: 'hawaiian style with bacon',
                prose: 'A controversial yet beloved pizza with a thick, fluffy crust, topped with a rich tomato base, creamy mozzarella, succulent pineapple chunks, crispy bacon pieces, and a hint of jalapeño for an unexpected kick. This combination of sweet, salty, and spicy creates a memorable flavor experience.',
                json: {
                    crust: 'thick',
                    sauce: 'tomato',
                    cheese: 'mozzarella',
                    toppings: ['pineapple', 'bacon', 'jalapeno'],
                    size: '12-inch',
                    spicy: true,
                    quality_rating: 3.9
                }
            },
            {
                input: 'margherita pizza',
                prose: 'The quintessential Italian pizza in its purest form: a thin, crispy crust with just a whisper of garlic, topped with San Marzano tomato sauce, fresh buffalo mozzarella, vibrant basil leaves added after baking to preserve their delicate flavor, and a finishing touch of extra virgin olive oil. Simple. Perfect. Timeless.',
                json: {
                    crust: 'thin',
                    sauce: 'san-marzano',
                    cheese: 'buffalo-mozzarella',
                    toppings: ['basil'],
                    size: '12-inch',
                    vegetarian: true,
                    traditional: true,
                    quality_rating: 4.9
                }
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
            <div class="json-wrapper">
                <div style="margin: 1rem 0; display: flex; align-items: center; gap: 1rem;">
                    <label class="label" style="margin: 0;">Output Mode:</label>
                    <div style="display: flex; gap: 1rem;">
                        <button id="json-prose-btn" style="background-color: var(--secondary-color); flex: 1;">📖 Prose</button>
                        <button id="json-json-btn" style="background-color: #7f8c8d; flex: 1;">📋 JSON</button>
                    </div>
                </div>

                <div style="margin: 1rem 0; padding: 1rem; background-color: #f9f9f9; border-radius: 8px;">
                    <p class="label">Order ${this.currentOrderIdx + 1} of ${this.orders.length}:</p>
                    <p style="font-size: 1.1rem; color: var(--primary-color); font-weight: bold;" id="json-order-text">
                        ${this.orders[this.currentOrderIdx].input}
                    </p>
                </div>

                <div id="json-output-container" style="
                    background-color: #f9f5f0;
                    padding: 1.5rem;
                    border-radius: 8px;
                    border: 2px solid var(--secondary-color);
                    margin: 1rem 0;
                    font-family: 'Courier New', monospace;
                    overflow-x: auto;
                ">
                    <div id="json-output-content"></div>
                </div>

                <div style="display: flex; gap: 1rem; justify-content: center; margin: 1rem 0;">
                    <button id="json-prev-btn" style="background-color: #7f8c8d;">← Previous</button>
                    <button id="json-next-btn" style="background-color: var(--secondary-color);">Next →</button>
                </div>

                <div style="margin: 1rem 0; padding: 1rem; background-color: #f0f0f0; border-radius: 8px;">
                    <button id="json-why-btn" style="width: 100%; background-color: var(--accent-color);">
                        Why JSON? 🤔
                    </button>
                    <div id="json-why-answer" style="
                        display: none;
                        margin-top: 1rem;
                        padding: 1rem;
                        background-color: white;
                        border-radius: 4px;
                        border-left: 3px solid var(--primary-color);
                    ">
                        <p><strong>JSON is machine-readable:</strong></p>
                        <ul style="margin-left: 1.5rem;">
                            <li>A robot waiter can parse JSON: extract the crust, toppings, size</li>
                            <li>A poem cannot be parsed without human interpretation</li>
                            <li>Your app can validate: "Is crust valid? Is size reasonable?"</li>
                            <li>Your database can store structured fields reliably</li>
                            <li>Your API can combine data with other services</li>
                        </ul>
                    </div>
                </div>

                <div class="insight-box" style="background-color: #f0f0f0; padding: 1rem; border-radius: 8px; margin-top: 1rem;">
                    <strong>💡 Structured Output Reality:</strong>
                    <p>Prose is beautiful but unstructured. JSON is ugly but parseable. When you need a machine to use the output (store it, validate it, route it), structured output is essential. Humans read prose. Machines read JSON.</p>
                </div>
            </div>
        `;

        this.updateDisplay();
    }

    attachEventListeners() {
        const proseBtn = this.container.querySelector('#json-prose-btn');
        const jsonBtn = this.container.querySelector('#json-json-btn');
        const prevBtn = this.container.querySelector('#json-prev-btn');
        const nextBtn = this.container.querySelector('#json-next-btn');
        const whyBtn = this.container.querySelector('#json-why-btn');

        proseBtn.addEventListener('click', () => {
            this.jsonMode = false;
            this.updateDisplay();
        });

        jsonBtn.addEventListener('click', () => {
            this.jsonMode = true;
            this.updateDisplay();
        });

        prevBtn.addEventListener('click', () => {
            this.currentOrderIdx = (this.currentOrderIdx - 1 + this.orders.length) % this.orders.length;
            this.updateDisplay();
        });

        nextBtn.addEventListener('click', () => {
            this.currentOrderIdx = (this.currentOrderIdx + 1) % this.orders.length;
            this.updateDisplay();
        });

        whyBtn.addEventListener('click', () => {
            const answer = this.container.querySelector('#json-why-answer');
            answer.style.display = answer.style.display === 'none' ? 'block' : 'none';
        });
    }

    updateDisplay() {
        const order = this.orders[this.currentOrderIdx];
        const orderText = this.container.querySelector('#json-order-text');
        const outputContent = this.container.querySelector('#json-output-content');
        const proseBtn = this.container.querySelector('#json-prose-btn');
        const jsonBtn = this.container.querySelector('#json-json-btn');

        orderText.textContent = order.input;

        if (this.jsonMode) {
            proseBtn.style.backgroundColor = '#7f8c8d';
            jsonBtn.style.backgroundColor = 'var(--secondary-color)';
            outputContent.innerHTML = this.formatJSON(order.json);
        } else {
            proseBtn.style.backgroundColor = 'var(--secondary-color)';
            jsonBtn.style.backgroundColor = '#7f8c8d';
            outputContent.innerHTML = `<div style="line-height: 1.8; color: var(--text-dark);">${order.prose}</div>`;
        }
    }

    formatJSON(obj, indent = 0) {
        const space = '  '.repeat(indent);
        const nextSpace = '  '.repeat(indent + 1);
        let html = `<span style="color: #999;">{</span><br>`;

        const keys = Object.keys(obj);
        keys.forEach((key, idx) => {
            const value = obj[key];
            const isLast = idx === keys.length - 1;

            html += nextSpace;
            html += `<span style="color: #d73a49;">"${key}"</span>`;
            html += ': ';

            if (typeof value === 'string') {
                html += `<span style="color: #6f42c1;">"${value}"</span>`;
            } else if (typeof value === 'number') {
                html += `<span style="color: #005cc5;">${value}</span>`;
            } else if (typeof value === 'boolean') {
                html += `<span style="color: #d73a49;">${value ? 'true' : 'false'}</span>`;
            } else if (Array.isArray(value)) {
                html += `<span style="color: #999;">[</span>`;
                value.forEach((item, i) => {
                    html += `<span style="color: #6f42c1;">"${item}"</span>`;
                    if (i < value.length - 1) html += ', ';
                });
                html += `<span style="color: #999;">]</span>`;
            }

            if (!isLast) html += ',';
            html += '<br>';
        });

        html += `${space}<span style="color: #999;">}</span>`;
        return html;
    }

    reset() {
        this.timers.forEach(id => clearTimeout(id));
        this.timers = [];
        this.isAnimating = false;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.sectionModules = window.sectionModules || {};
    window.sectionModules.s8 = new StructuredOutputSection();
});
