// Section 6: Role Prompting
// Drag costumes onto chef, style changes with each role

class RolePromptingSection {
    constructor() {
        this.container = document.getElementById('s6-container');
        if (!this.container) return;

        this.currentRole = null;
        this.isAnimating = false;
        this.timers = [];

        this.roles = {
            michelin: {
                name: 'Michelin Star',
                emoji: '⭐',
                description: 'Obsessed with perfection and technique',
                responses: [
                    'I shall craft for you a deconstructed pizza experience with sous-vide mozzarella, microgreens, and truffle oil.',
                    'Allow me to present a precision-plated pizza with molecular gastronomy elements.',
                    'A thin crust pizza with imported San Marzano tomatoes and hand-selected basil from my garden.'
                ]
            },
            teen: {
                name: 'Fast Food Teen',
                emoji: '🍔',
                description: 'Quick, efficient, zero fuss',
                responses: [
                    'Yo, here\'s your pepperoni pizza. It slaps. That\'ll be $8.',
                    'One pizza coming right up bro! *slides across counter*',
                    'Boom! Hot pizza, fresh out the oven. You good?'
                ]
            },
            molecular: {
                name: 'Molecular Gastronomist',
                emoji: '🧪',
                description: 'Everything is an experiment',
                responses: [
                    'Fascinating! Pizza as spheres of tomato, crystallized basil powder, and nitrogen-frozen cheese.',
                    'What if we made pizza using only molecular techniques? Behold: edible paper with flavor encapsulation!',
                    'I\'ve deconstructed pizza into its chemical components and reconstructed it as a sauce foam.'
                ]
            },
            nonna: {
                name: 'Nonna (Italian Grandma)',
                emoji: '👵',
                description: 'Love, tradition, and enough food for everyone',
                responses: [
                    'Tesoro! I make for you pizza like my grandmother taught me. Mangia, mangia! You are too thin!',
                    'Here, bellissimo! Fresh from the oven. Eat, eat! I made extra for you to take home.',
                    'Amore, this pizza is made with love, like everything I cook. Bon appetito!'
                ]
            },
            health: {
                name: 'Health Nut',
                emoji: '💪',
                description: 'Everything is optimized for wellness',
                responses: [
                    'Alright, here\'s a cauliflower-based pizza with 40 grams of protein, zero trans fats, and activated charcoal crust.',
                    'This pizza has the optimal macronutrient ratio for muscle recovery post-workout.',
                    'I\'ve replaced cheese with nutritional yeast and the crust is organic sprouted grain. Peak nutrition!'
                ]
            }
        };

        this.init();
    }

    init() {
        this.render();
        this.attachEventListeners();
    }

    render() {
        this.container.innerHTML = `
            <div class="role-wrapper">
                <p class="small-text" style="margin-bottom: 1rem;">Drag a costume onto the chef to change their personality:</p>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin: 1rem 0;">
                    <!-- Chef -->
                    <div style="display: flex; flex-direction: column; align-items: center;">
                        <h3 style="margin-bottom: 1rem;">👨‍🍳 Chef</h3>
                        <div id="role-chef" style="
                            font-size: 4rem;
                            padding: 2rem;
                            background-color: #fdf5e6;
                            border-radius: 12px;
                            border: 3px solid var(--secondary-color);
                            text-align: center;
                            min-height: 200px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            cursor: drop-target;
                        ">👨‍🍳</div>
                        <p class="small-text" style="margin-top: 1rem; text-align: center;" id="role-name">Standard Chef</p>
                    </div>

                    <!-- Costume Rack -->
                    <div style="display: flex; flex-direction: column;">
                        <h3 style="margin-bottom: 1rem;">🎭 Costume Rack</h3>
                        <div id="role-rack" style="
                            display: flex;
                            flex-direction: column;
                            gap: 0.5rem;
                        "></div>
                    </div>
                </div>

                <div style="margin: 1rem 0; padding: 1rem; background-color: #f9f9f9; border-radius: 8px;">
                    <label class="label">Order: "make me something good"</label>
                </div>

                <div style="text-align: center; margin: 1rem 0;">
                    <button id="role-generate-btn" style="background-color: var(--secondary-color); font-size: 1.1rem; padding: 1rem 2rem;">
                        Chef, create! 👨‍🍳
                    </button>
                </div>

                <div id="role-results">
                    <div style="background-color: #fdf5e6; padding: 1.5rem; border-radius: 8px; border: 2px solid var(--secondary-color); margin: 1rem 0;">
                        <p class="small-text" style="margin-bottom: 0.5rem;">Chef's response:</p>
                        <div id="role-response" style="font-size: 1rem; font-style: italic; color: var(--primary-color); min-height: 60px;">
                            (no costume selected yet)
                        </div>
                    </div>

                    <div class="pizza-display" id="role-pizza" style="font-size: 3rem;">🍕</div>
                </div>

                <div style="margin-top: 1.5rem; border-top: 2px dashed #ccc; padding-top: 1.5rem;">
                    <div style="text-align: center; margin-bottom: 0.75rem;">
                        <button id="role-mashup-btn" style="background-color: #8e44ad; font-size: 1rem; padding: 0.75rem 1.75rem; color: white;">
                            🎲 Random Role Mashup
                        </button>
                    </div>
                    <div id="role-mashup-result" style="display: none; margin-top: 1rem; background-color: #f5eeff; padding: 1rem; border-radius: 8px; border: 2px solid #8e44ad;">
                        <p id="role-mashup-label" style="font-weight: bold; color: #8e44ad; margin-bottom: 0.5rem; text-align: center;"></p>
                        <div id="role-mashup-response" style="font-size: 1rem; font-style: italic; color: var(--primary-color); min-height: 40px;"></div>
                    </div>
                    <p class="small-text" style="margin-top: 0.5rem; text-align: center; color: #888;">When prompts combine personas, results get... interesting</p>
                </div>

                <div class="insight-box" style="background-color: #f0f0f0; padding: 1rem; border-radius: 8px; margin-top: 1rem;">
                    <strong>💡 Role Prompting Power:</strong>
                    <p>The role is not just a label—it changes how the model thinks. A Michelin chef doesn't just add fancy words; they think about precision, technique, and presentation. Role prompting is identity + values + methodology.</p>
                </div>
            </div>
        `;

        this.populateRack();
    }

    populateRack() {
        const rackEl = this.container.querySelector('#role-rack');
        rackEl.innerHTML = '';

        Object.keys(this.roles).forEach(roleKey => {
            const role = this.roles[roleKey];
            const card = document.createElement('div');
            card.className = 'card';
            card.draggable = true;
            card.dataset.role = roleKey;
            card.style.cursor = 'grab';

            card.innerHTML = `
                <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">${role.emoji}</div>
                <div style="font-weight: bold;">${role.name}</div>
                <div class="small-text">${role.description}</div>
            `;

            card.addEventListener('dragstart', (e) => {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('role', roleKey);
                card.style.opacity = '0.6';
            });

            card.addEventListener('dragend', () => {
                card.style.opacity = '1';
            });

            rackEl.appendChild(card);
        });
    }

    attachEventListeners() {
        const chefEl = this.container.querySelector('#role-chef');
        const generateBtn = this.container.querySelector('#role-generate-btn');

        chefEl.addEventListener('dragover', (e) => {
            e.preventDefault();
            chefEl.style.backgroundColor = 'rgba(255, 107, 53, 0.1)';
        });

        chefEl.addEventListener('dragleave', () => {
            chefEl.style.backgroundColor = '#fdf5e6';
        });

        chefEl.addEventListener('drop', (e) => {
            e.preventDefault();
            chefEl.style.backgroundColor = '#fdf5e6';

            const roleKey = e.dataTransfer.getData('role');
            this.selectRole(roleKey);
        });

        generateBtn.addEventListener('click', () => this.generate());

        const mashupBtn = this.container.querySelector('#role-mashup-btn');
        mashupBtn.addEventListener('click', () => this.doMashup());
    }

    selectRole(roleKey) {
        this.currentRole = roleKey;
        const role = this.roles[roleKey];
        const chefEl = this.container.querySelector('#role-chef');
        const nameEl = this.container.querySelector('#role-name');

        chefEl.textContent = role.emoji;
        nameEl.textContent = role.name;
    }

    generate() {
        if (this.isAnimating || !this.currentRole) {
            alert('Please drag a costume onto the chef first!');
            return;
        }

        this.isAnimating = true;
        const generateBtn = this.container.querySelector('#role-generate-btn');
        generateBtn.disabled = true;

        try {
            const responseEl = this.container.querySelector('#role-response');
            const pizzaEl = this.container.querySelector('#role-pizza');

            responseEl.textContent = '⏳ Chef preparing...';
            pizzaEl.textContent = '⏳';
            pizzaEl.style.animation = 'spin 1s linear infinite';

            const timeoutId = setTimeout(() => {
                pizzaEl.style.animation = 'none';

                const role = this.roles[this.currentRole];
                const response = role.responses[Math.floor(Math.random() * role.responses.length)];
                responseEl.textContent = response;

                const pizzas = {
                    michelin: '✨🍕🍽️',
                    teen: '🔥🍕👌',
                    molecular: '🧪🍕💫',
                    nonna: '❤️🍕🍝',
                    health: '💪🥗🍕'
                };

                pizzaEl.textContent = pizzas[this.currentRole];

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

    doMashup() {
        const mashupBtn = this.container.querySelector('#role-mashup-btn');
        const mashupResult = this.container.querySelector('#role-mashup-result');
        const mashupLabel = this.container.querySelector('#role-mashup-label');
        const mashupResponse = this.container.querySelector('#role-mashup-response');

        const roleKeys = Object.keys(this.roles);
        // Pick 2 distinct roles randomly
        const shuffled = roleKeys.slice().sort(() => Math.random() - 0.5);
        const [keyA, keyB] = shuffled;
        const roleA = this.roles[keyA];
        const roleB = this.roles[keyB];

        mashupBtn.disabled = true;
        mashupResult.style.display = 'block';
        mashupLabel.textContent = `${roleA.emoji} ${roleA.name}  +  ${roleB.emoji} ${roleB.name}`;
        mashupResponse.textContent = '⏳ Fusing personas...';

        const mashupResponses = {
            'michelin+teen': '"Yo — this here is, like, a DECONSTRUCTED pizza experience, yeah? Truffle oil, bro. That\'ll be $8. But make it, like, artisanal. 👌✨"',
            'teen+michelin': '"Yo — this here is, like, a DECONSTRUCTED pizza experience, yeah? Truffle oil, bro. That\'ll be $8. But make it, like, artisanal. 👌✨"',
            'michelin+molecular': '"Behold: a sous-vide pizza sphere encased in nitrogen-frozen mozzarella foam. I call it \'Pizza 2.0\'. It has six Michelin stars and also explodes flavour chemicals in your mouth.\'"',
            'molecular+michelin': '"Behold: a sous-vide pizza sphere encased in nitrogen-frozen mozzarella foam. I call it \'Pizza 2.0\'. It has six Michelin stars and also explodes flavour chemicals in your mouth.\'"',
            'michelin+nonna': '"With the utmost precision and devotion, I present: Nonna\'s Deconstructed Margherita — hand-pulled basil from my garden at 6am, tears of joy included in the sauce. A 3-star memory."',
            'nonna+michelin': '"With the utmost precision and devotion, I present: Nonna\'s Deconstructed Margherita — hand-pulled basil from my garden at 6am, tears of joy included in the sauce. A 3-star memory."',
            'michelin+health': '"A precision-plated, macro-optimised pizza: cauliflower sphere with 40g protein, micro-arugula garnish, and a truffle-infused protein shake on the side. Peak performance, peak artistry."',
            'health+michelin': '"A precision-plated, macro-optimised pizza: cauliflower sphere with 40g protein, micro-arugula garnish, and a truffle-infused protein shake on the side. Peak performance, peak artistry."',
            'teen+molecular': '"So I literally made your pizza into SPHERES, bro. It\'s molecular. It slaps. The cheese is, like, crystallised powder? Very advanced. That\'ll be $8."',
            'molecular+teen': '"So I literally made your pizza into SPHERES, bro. It\'s molecular. It slaps. The cheese is, like, crystallised powder? Very advanced. That\'ll be $8."',
            'teen+nonna': '"Yo here\'s your pizza, it\'s fire — like literally Nonna made it, she won\'t stop feeding you, bro, just EAT IT, mangia mangia, $8, also she made extra."',
            'nonna+teen': '"Yo here\'s your pizza, it\'s fire — like literally Nonna made it, she won\'t stop feeding you, bro, just EAT IT, mangia mangia, $8, also she made extra."',
            'teen+health': '"Bro your pizza is, like, cauliflower crust and nutritional yeast — it SLAPS though, 40g protein, zero guilt, $8. You\'re gonna be jacked."',
            'health+teen': '"Bro your pizza is, like, cauliflower crust and nutritional yeast — it SLAPS though, 40g protein, zero guilt, $8. You\'re gonna be jacked."',
            'molecular+nonna': '"Tesoro, I have molecularly deconstructed your Nonna\'s recipe into edible nostalgia spheres. Each bite contains 0.3ml of love, scientifically quantified. Mangia!"',
            'nonna+molecular': '"Tesoro, I have molecularly deconstructed your Nonna\'s recipe into edible nostalgia spheres. Each bite contains 0.3ml of love, scientifically quantified. Mangia!"',
            'molecular+health': '"I\'ve eliminated all flavour compounds and replaced them with optimised nutrient vectors suspended in agar foam. The mouthfeel is scientifically identical to pizza. Protein: 40g."',
            'health+molecular': '"I\'ve eliminated all flavour compounds and replaced them with optimised nutrient vectors suspended in agar foam. The mouthfeel is scientifically identical to pizza. Protein: 40g."',
            'nonna+health': '"Bellissimo, but WHAT is this cauliflower base?! My grandmother would weep! Still — you are too thin, eat, it is organic sprouted grain, good for you, mangia!"',
            'health+nonna': '"Bellissimo, but WHAT is this cauliflower base?! My grandmother would weep! Still — you are too thin, eat, it is organic sprouted grain, good for you, mangia!"'
        };

        const comboKey = `${keyA}+${keyB}`;
        const fallbackResponse = `"${roleA.name} meets ${roleB.name}: It's... confusing. But somehow delicious? The pizza smells like ${roleA.emoji} and tastes like ${roleB.emoji}. Nobody can explain it."`;
        const finalResponse = mashupResponses[comboKey] || fallbackResponse;

        const timeoutId = setTimeout(() => {
            mashupResponse.textContent = '';
            this.typeMashupResponse(mashupResponse, finalResponse, () => {
                mashupBtn.disabled = false;
            });
        }, 900);

        this.timers.push(timeoutId);
    }

    typeMashupResponse(el, text, onComplete) {
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

    reset() {
        this.timers.forEach(id => clearTimeout(id));
        this.timers = [];
        this.isAnimating = false;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.sectionModules = window.sectionModules || {};
    window.sectionModules.s6 = new RolePromptingSection();
});
