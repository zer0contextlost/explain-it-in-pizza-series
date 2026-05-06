let currentQuestionIdx = 0;

const questionPairs = [
  {
    question: 'What temperature should I cook Margherita?',
    ungrounded: 'I believe pizza should cook at 350°F for about 20 minutes. Maybe 30? I think that sounds right.',
    grounded: 'Cook at 450°F for exactly 4 minutes. (From Nonna\'s Margherita chapter)',
  },
  {
    question: 'Where should clams come from for seafood pizza?',
    ungrounded: 'Any clams work fine, really. Frozen ones are probably the same as fresh. You can use them anytime.',
    grounded: 'Fresh clams from the Tyrrhenian Sea, purchased the same day. Never use frozen. (From Seafood chapter)',
  },
  {
    question: 'What spice is essential for Diavolo?',
    ungrounded: 'I think it\'s probably black pepper? Or maybe paprika? Some kind of spice that makes it hot.',
    grounded: 'Red pepper flakes from Calabria are essential. Fennel seed cuts bitterness. (From Spice chapter)',
  },
  {
    question: 'How long do shrimp cook on pizza?',
    ungrounded: 'Shrimp cook pretty fast, maybe 3-5 minutes? Or longer to be safe. I\'m not really sure.',
    grounded: 'Shrimp cook for only 90 seconds or they become rubber. (From Seafood chapter)',
  },
  {
    question: 'When should I harvest vegetables?',
    ungrounded: 'Any time is fine. You can get vegetables from anywhere and they all taste the same.',
    grounded: 'Every vegetable in Sicily has a season. Respect the season. Don\'t buy tomatoes in winter. (From Vegetables chapter)',
  },
];

export function init(containerEl) {
  const html = `
    <div class="grounding-wrapper">
      <div class="question-nav">
        <button class="button secondary" id="prevBtn">← Previous</button>
        <span id="questionCounter">1 / ${questionPairs.length}</span>
        <button class="button secondary" id="nextBtn">Next →</button>
      </div>
      <div class="grounding-display grid-2">
        <div class="chef-column">
          <h3>😵 Ungrounded Chef</h3>
          <div class="question-box">
            <p id="question" class="question-text"></p>
          </div>
          <div class="answer-box ungrounded">
            <div class="answer-label">Uncertain Answer</div>
            <p id="ungroundedAnswer"></p>
          </div>
        </div>
        <div class="chef-column">
          <h3>✅ Grounded Chef</h3>
          <div class="question-box">
            <p id="question2" class="question-text"></p>
          </div>
          <div class="answer-box grounded">
            <div class="answer-label">Verified Answer (with source)</div>
            <p id="groundedAnswer"></p>
          </div>
        </div>
      </div>
      <div class="grounding-explanation">
        <h4>The Difference:</h4>
        <p><strong>Ungrounded:</strong> I guess. I'm uncertain. I have no source. I might be wrong.</p>
        <p><strong>Grounded:</strong> I know this for a fact. I can prove it. I can cite exactly where this comes from.</p>
      </div>
    </div>
  `;

  containerEl.innerHTML = html;

  const prevBtn = containerEl.querySelector('#prevBtn');
  const nextBtn = containerEl.querySelector('#nextBtn');
  const questionCounter = containerEl.querySelector('#questionCounter');
  const question = containerEl.querySelector('#question');
  const question2 = containerEl.querySelector('#question2');
  const ungroundedAnswer = containerEl.querySelector('#ungroundedAnswer');
  const groundedAnswer = containerEl.querySelector('#groundedAnswer');

  function showQuestion(idx) {
    const pair = questionPairs[idx % questionPairs.length];

    question.textContent = pair.question;
    question2.textContent = pair.question;
    ungroundedAnswer.innerHTML = pair.ungrounded;
    groundedAnswer.innerHTML = pair.grounded;

    questionCounter.textContent = `${(idx % questionPairs.length) + 1} / ${questionPairs.length}`;

    window.soundManager?.plop();
  }

  prevBtn.addEventListener('click', () => {
    currentQuestionIdx = (currentQuestionIdx - 1 + questionPairs.length) % questionPairs.length;
    showQuestion(currentQuestionIdx);
  });

  nextBtn.addEventListener('click', () => {
    currentQuestionIdx = (currentQuestionIdx + 1) % questionPairs.length;
    showQuestion(currentQuestionIdx);
  });

  showQuestion(currentQuestionIdx);
}

export function reset() {
  currentQuestionIdx = 0;
}
