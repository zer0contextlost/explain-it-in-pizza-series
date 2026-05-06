// Section 2: Confabulation - Chef's Dossier
window.initSection2Internal = function(container, sectionNum) {
  container.innerHTML = `
    <p class="section-description">
      When asked about a regular he's never met, the chef invents a complete backstory —
      "Oh yes, Marco, loves anchovies, every Tuesday." Marco does not exist.
    </p>

    <div style="margin: var(--spacing-lg) 0;">
      <label for="s2-customer-name" style="font-weight: bold; display: block; margin-bottom: var(--spacing-sm);">
        Customer Name (or pick a preset):
      </label>
      <input type="text" id="s2-customer-name" placeholder="Enter any name..." style="width: 100%; margin-bottom: var(--spacing-md);">
    </div>

    <div class="card-grid" id="s2-presets" style="margin-bottom: var(--spacing-lg);">
      <button class="card" data-name="Giuseppe">
        <span class="card-emoji">👨</span>
        <div class="card-title">Giuseppe</div>
      </button>
      <button class="card" data-name="Lucia">
        <span class="card-emoji">👩</span>
        <div class="card-title">Lucia</div>
      </button>
      <button class="card" data-name="Roberto">
        <span class="card-emoji">👨</span>
        <div class="card-title">Roberto</div>
      </button>
      <button class="card" data-name="Francesca">
        <span class="card-emoji">👩</span>
        <div class="card-title">Francesca</div>
      </button>
      <button class="card" data-name="Antonio">
        <span class="card-emoji">👨</span>
        <div class="card-title">Antonio</div>
      </button>
    </div>

    <button id="s2-generate" style="width: 100%;">Generate Dossier</button>

    <div class="dossier" id="s2-dossier">
      <div class="dossier-field">
        <div class="dossier-label">Name:</div>
        <div class="dossier-value" id="s2-dossier-name"></div>
      </div>
      <div class="dossier-field">
        <div class="dossier-label">Favorite Pizza:</div>
        <div class="dossier-value" id="s2-dossier-pizza"></div>
      </div>
      <div class="dossier-field">
        <div class="dossier-label">Usual Day:</div>
        <div class="dossier-value" id="s2-dossier-day"></div>
      </div>
      <div class="dossier-field">
        <div class="dossier-label">Memorable Quote:</div>
        <div class="dossier-value" id="s2-dossier-quote"></div>
      </div>
      <div class="dossier-field">
        <div class="dossier-label">From:</div>
        <div class="dossier-value" id="s2-dossier-from"></div>
      </div>

      <div class="confidence-meter">
        <div class="confidence-text">Chef's Confidence:</div>
        <div class="confidence-bar">
          <div class="confidence-fill"></div>
        </div>
        <div class="confidence-text">95%</div>
      </div>
    </div>

    <button id="s2-verify" class="btn-success" style="width: 100%; display: none;">Verify This Customer</button>
  `;

  const fakeDetails = {
    Giuseppe: {
      pizza: "Quattro Formaggi con albicocche (four cheeses with apricots)",
      day: "Thursday mornings (has never shown up)",
      quote: "The golden ratio should be applied to all pizzas",
      from: "Pizzaland (est. 1847)"
    },
    Lucia: {
      pizza: "Anchovy and pineapple harmony (gluten-free)",
      day: "Tuesdays at midnight",
      quote: "A pizza without soul is just bread",
      from: "The Floating Cities"
    },
    Roberto: {
      pizza: "Pizza made entirely of other pizzas",
      day: "Every day, tips in ancient coins",
      quote: "I once met a pizza that changed my life",
      from: "Somewhere in time"
    },
    Francesca: {
      pizza: "Invisible pizza (you eat the idea)",
      day: "Sundays that haven't happened yet",
      quote: "The yeast dreams of fermentation",
      from: "The Parallel Kitchen"
    },
    Antonio: {
      pizza: "One-atom-thin Margherita",
      day: "During solar eclipses only",
      quote: "Oregano speaks to those who listen",
      from: "A dream state (provisional)"
    }
  };

  let currentCustomer = null;

  const nameInput = document.getElementById('s2-customer-name');
  const presets = document.querySelectorAll('#s2-presets .card');

  presets.forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.dataset.name;
      nameInput.value = name;
      currentCustomer = name;
      document.getElementById('s2-generate').click();
    });
  });

  document.getElementById('s2-generate').onclick = function() {
    const name = nameInput.value.trim();
    if (!name) {
      alert('Please enter a name');
      return;
    }

    currentCustomer = name;

    // Fabricate details
    const details = fakeDetails[name] || {
      pizza: `${name}'s signature pizza with mysterious ingredients from Pizzaland`,
      day: `${name}'s special day (varies by phase of moon)`,
      quote: `"${name} was here and pizza was better for it"`,
      from: "An imaginary village in the chef's mind"
    };

    // Display dossier
    document.getElementById('s2-dossier-name').textContent = name;
    document.getElementById('s2-dossier-pizza').textContent = details.pizza;
    document.getElementById('s2-dossier-day').textContent = details.day;
    document.getElementById('s2-dossier-quote').textContent = details.quote;
    document.getElementById('s2-dossier-from').textContent = details.from;

    const dossierDiv = document.getElementById('s2-dossier');
    dossierDiv.classList.add('show');

    document.getElementById('s2-verify').style.display = 'block';
  };

  document.getElementById('s2-verify').onclick = function() {
    const dossier = document.getElementById('s2-dossier');
    dossier.style.opacity = '0.5';
    dossier.style.pointerEvents = 'none';

    setTimeout(() => {
      dossier.innerHTML = `
        <div style="text-align: center; padding: var(--spacing-lg); font-style: italic;">
          <div style="font-size: 3rem; margin-bottom: var(--spacing-md);">🔍</div>
          <div style="color: var(--color-danger); font-weight: bold; font-size: 1.2rem;">
            No record of this customer found.
          </div>
          <div style="margin-top: var(--spacing-md); color: var(--color-text-light);">
            Chef invented the whole thing.
          </div>
        </div>
      `;
    }, 600);
  };

  // Update narrator
  if (typeof updateNarrator === 'function') {
    updateNarrator(sectionNum);
  }
};
