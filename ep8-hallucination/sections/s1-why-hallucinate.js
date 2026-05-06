// Section 1: Why LLMs Hallucinate - Sentence Completion Game
window.initSection1Internal = function(container, sectionNum) {
  container.innerHTML = `
    <p class="section-description">
      The chef wasn't trained to know facts — he was trained to predict the next plausible word.
      "Nonna's secret ingredient is..." → some word has to come next. And "moonbeams" is grammatically fine.
    </p>

    <div class="sentence-display" id="s1-sentence">
      Nonna's secret ingredient is ___
    </div>

    <div class="completion-options" id="s1-options"></div>

    <div class="completion-result" id="s1-result"></div>

    <div id="s1-validation-msg" style="display: none; color: var(--color-danger, #C0392B); font-weight: bold; text-align: center; margin-bottom: 0.5rem;"></div>
    <button id="s1-reveal" class="btn-secondary" style="width: 100%;">Reveal the Truth</button>
    <button id="s1-next" class="btn-secondary" style="width: 100%; display: none;">Next Example</button>
  `;

  const examples = [
    {
      sentence: "Nonna's secret ingredient is",
      options: ["saffron", "love", "the tears of angels", "a 1962 Barolo", "fresh moonbeams"],
      truth: "Nobody knows. Nonna is fictional."
    },
    {
      sentence: "The oldest known pizza was made with",
      options: ["tomatoes", "ancestors' memories", "stardust and salt", "flatbread and cheese", "ancient spells"],
      truth: "Flatbread and cheese. Tomatoes didn't arrive in Italy until the 1600s."
    },
    {
      sentence: "Marco's favorite topping is definitely",
      options: ["pepperoni", "unicorn tears", "whatever is in stock", "regret", "mushrooms"],
      truth: "We don't know Marco. He was made up."
    },
    {
      sentence: "The pizza oven reaches temperatures of",
      options: ["800°F", "dreams of heat", "1000°F", "the sun's jealousy", "500°F"],
      truth: "Around 800-900°F for proper Neapolitan pizza."
    },
    {
      sentence: "Mozzarella cheese comes from",
      options: ["buffalo milk", "clouds", "ancient Rome", "the moon's softness", "cows"],
      truth: "Traditionally from buffalo milk in Italy. Modern versions use cow's milk."
    }
  ];

  let currentExample = 0;
  let selectedOption = null;

  const container_el = document.getElementById(container.id);

  function loadExample(index) {
    currentExample = index;
    const example = examples[index];
    selectedOption = null;

    document.getElementById('s1-sentence').textContent = example.sentence + " ___";
    const optionsDiv = document.getElementById('s1-options');
    optionsDiv.innerHTML = '';

    example.options.forEach((option, idx) => {
      const btn = document.createElement('button');
      btn.className = 'completion-btn';
      btn.textContent = option;
      btn.onclick = () => selectOption(idx, example, option);
      optionsDiv.appendChild(btn);
    });

    const resultDiv = document.getElementById('s1-result');
    resultDiv.classList.remove('show', 'accepted', 'revealed');
    resultDiv.innerHTML = '';

    document.getElementById('s1-reveal').style.display = 'block';
    document.getElementById('s1-next').style.display = 'none';
  }

  function selectOption(idx, example, option) {
    selectedOption = option;
    const resultDiv = document.getElementById('s1-result');
    resultDiv.classList.add('show', 'accepted');
    resultDiv.innerHTML = `✓ "${option}" was accepted. All answers are equally valid to the model.`;
  }

  document.getElementById('s1-reveal').onclick = function() {
    if (!selectedOption) {
      const validationMsg = document.getElementById('s1-validation-msg');
      validationMsg.textContent = 'Pick an answer first, Chef!';
      validationMsg.style.display = 'block';
      setTimeout(() => { validationMsg.style.display = 'none'; }, 2000);
      return;
    }

    const example = examples[currentExample];
    const resultDiv = document.getElementById('s1-result');
    resultDiv.classList.remove('accepted');
    resultDiv.classList.add('revealed');
    resultDiv.innerHTML = `🔍 Truth: ${example.truth}`;

    document.getElementById('s1-reveal').style.display = 'none';
    if (currentExample < examples.length - 1) {
      document.getElementById('s1-next').style.display = 'block';
    }
  };

  document.getElementById('s1-next').onclick = function() {
    if (currentExample < examples.length - 1) {
      loadExample(currentExample + 1);
    }
  };

  // Load first example
  loadExample(0);

  // Update narrator
  if (typeof updateNarrator === 'function') {
    updateNarrator(sectionNum);
  }
};
