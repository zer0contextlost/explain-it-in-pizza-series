// Section 4: Short-Term Memory
let notepadNotes = [];
let currentContext = 0;
const MAX_CONTEXT = 10;
let timeoutIds = [];

const sampleCustomerFacts = [
  'Customer name: Alice',
  'Prefers thin crust',
  'Allergic to mushrooms',
  'Loves extra cheese',
  'Wants it delivered by 6 PM',
  'Likes extra sauce',
  'Always orders the Margherita',
  'Pre-ordered for a birthday party',
  'Allergic to olives',
  'Wants garlic knots with every order',
  'Last visit: complained the crust was soggy',
  'Wants gluten-free crust'
];

export function init(containerEl) {
  const html = `
    <div class="memory-short-wrapper">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin: 2rem 0;">
        <div class="notepad-panel">
          <h3 style="text-align: center; margin-bottom: 1rem;">📝 Apron Notepad (Context Window)</h3>
          <div class="notepad-container">
            <div id="notepad" class="notepad-content"></div>
          </div>
          <div style="text-align: center; margin-top: 1rem; font-weight: bold; color: #264653;">
            Context: <span id="contextCounter">0</span>/${MAX_CONTEXT} notes
          </div>
        </div>

        <div>
          <h3 style="text-align: center; margin-bottom: 1rem;">Customer Tells You...</h3>
          <div id="factsButtons" class="facts-grid"></div>
        </div>
      </div>

      <div class="control-panel">
        <button id="addFactBtn" class="primary">Add Next Fact</button>
        <button id="newShiftBtn">New Shift (Clear Notepad)</button>
        <button id="recallBtn">Recall a Fact</button>
        <button id="resetBtn">Reset</button>
      </div>

      <div id="recallResult" style="display: none; margin-top: 2rem; padding: 1.5rem; background: rgba(255, 255, 255, 0.7); border-radius: 8px; text-align: center;"></div>
    </div>
  `;

  containerEl.innerHTML = html;

  const notepad = containerEl.querySelector('#notepad');
  const contextCounter = containerEl.querySelector('#contextCounter');
  const addFactBtn = containerEl.querySelector('#addFactBtn');
  const newShiftBtn = containerEl.querySelector('#newShiftBtn');
  const recallBtn = containerEl.querySelector('#recallBtn');
  const resetBtn = containerEl.querySelector('#resetBtn');
  const recallResult = containerEl.querySelector('#recallResult');
  const factsButtons = containerEl.querySelector('#factsButtons');

  // Create fact buttons
  sampleCustomerFacts.forEach((fact, idx) => {
    const btn = document.createElement('button');
    btn.textContent = `Fact ${idx + 1}`;
    btn.dataset.fact = fact;
    btn.style.padding = '0.5rem 1rem';
    btn.style.fontSize = '0.85rem';
    btn.disabled = false;
    btn.addEventListener('click', () => {
      try {
        if (notepadNotes.length < MAX_CONTEXT) {
          notepadNotes.push(fact);
          currentContext = notepadNotes.length;
          renderNotepad();
          window.soundManager?.plop();
        } else {
          // Drop oldest note
          notepadNotes.shift();
          notepadNotes.push(fact);
          renderNotepad();
          window.soundManager?.ping();
        }
      } finally {
        // Done
      }
    });
    factsButtons.appendChild(btn);
  });

  function renderNotepad() {
    notepad.innerHTML = '';
    contextCounter.textContent = currentContext;

    // Show notes with falling animation
    notepadNotes.forEach((note, idx) => {
      const noteEl = document.createElement('div');
      noteEl.className = 'notepad-note';
      noteEl.innerHTML = `<span class="note-number">${idx + 1}</span> ${note}`;
      noteEl.style.animation = 'slideIn 0.3s ease-out';
      noteEl.style.animationDelay = `${idx * 0.05}s`;

      // If at capacity, highlight the bottom note as "falling off"
      if (notepadNotes.length === MAX_CONTEXT && idx === 0) {
        noteEl.style.opacity = '0.5';
        noteEl.style.textDecoration = 'line-through';
      }

      notepad.appendChild(noteEl);
    });

    // Show empty slots
    for (let i = notepadNotes.length; i < MAX_CONTEXT; i++) {
      const emptySlot = document.createElement('div');
      emptySlot.className = 'notepad-note empty';
      emptySlot.innerHTML = `<span class="note-number">${i + 1}</span> (empty)`;
      notepad.appendChild(emptySlot);
    }
  }

  addFactBtn.addEventListener('click', async () => {
    try {
      if (currentContext >= MAX_CONTEXT) {
        // Drop one and add new
        notepadNotes.shift();
        notepadNotes.push(sampleCustomerFacts[Math.floor(Math.random() * sampleCustomerFacts.length)]);
        renderNotepad();

        // Animate the "falling off" effect
        const firstNote = notepad.querySelector('.notepad-note:first-child');
        if (firstNote) {
          firstNote.style.animation = 'fadeOut 0.4s ease-out forwards';
          timeoutIds.push(setTimeout(() => {
            renderNotepad();
          }, 200));
        }

        recallResult.style.display = 'block';
        recallResult.innerHTML = '<span style="color: #E63946;">⚠️ Notepad full! Oldest note dropped: The oldest fact is now forgotten.</span>';
        window.soundManager?.ping();
      } else {
        notepadNotes.push(sampleCustomerFacts[currentContext]);
        currentContext++;
        renderNotepad();
        recallResult.style.display = 'none';
        window.soundManager?.plop();
      }
    } finally {
      // Done
    }
  });

  newShiftBtn.addEventListener('click', () => {
    try {
      // Animate notepad clearing
      const allNotes = notepad.querySelectorAll('.notepad-note');
      allNotes.forEach((note, idx) => {
        note.style.animation = `fadeOut 0.4s ease-out forwards`;
        note.style.animationDelay = `${idx * 0.05}s`;
      });

      timeoutIds.push(setTimeout(() => {
        notepadNotes = [];
        currentContext = 0;
        renderNotepad();

        recallResult.style.display = 'block';
        recallResult.innerHTML = '<span style="color: #E63946;">🚨 New shift started! All notepad memories cleared.</span>';
        window.soundManager?.error();
      }, 300));
    } finally {
      // Cleanup done in timeout
    }
  });

  recallBtn.addEventListener('click', () => {
    try {
      if (notepadNotes.length === 0) {
        recallResult.style.display = 'block';
        recallResult.innerHTML = '<span style="color: #E63946;">❌ Notepad is empty! Chef says: "I don\'t remember anything!"</span>';
        window.soundManager?.error();
        return;
      }

      const randomIdx = Math.floor(Math.random() * notepadNotes.length);
      const fact = notepadNotes[randomIdx];

      recallResult.style.display = 'block';
      recallResult.innerHTML = `<span style="color: #2A9D8F;">✓ Chef remembers: "${fact}"</span>`;
      window.soundManager?.success();
    } finally {
      // Done
    }
  });

  resetBtn.addEventListener('click', () => {
    try {
      notepadNotes = [];
      currentContext = 0;
      renderNotepad();
      recallResult.style.display = 'none';

      timeoutIds.forEach(id => clearTimeout(id));
      timeoutIds = [];

      window.soundManager?.plop();
    } finally {
      // Done
    }
  });

  // Add CSS
  const style = document.createElement('style');
  style.textContent = `
    .notepad-container {
      border: 3px solid #D2B48C;
      border-radius: 8px;
      padding: 1rem;
      background: linear-gradient(135deg, #FDFBF7 0%, #F5F0E8 100%);
      min-height: 300px;
      box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.1);
    }
    .notepad-content {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
    }
    .notepad-note {
      padding: 0.5rem;
      background: rgba(255, 255, 200, 0.6);
      border-left: 3px solid #F4A261;
      font-size: 0.9rem;
      color: #264653;
      border-radius: 2px;
      display: flex;
      gap: 0.5rem;
      align-items: flex-start;
    }
    .notepad-note.empty {
      opacity: 0.3;
      font-style: italic;
      border-left-color: #ccc;
    }
    .note-number {
      font-weight: bold;
      color: #6B3A2A;
      min-width: 20px;
      text-align: center;
    }
    .facts-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.5rem;
      padding: 1rem;
      background: rgba(255, 255, 255, 0.5);
      border-radius: 8px;
      border: 2px solid #F4A261;
    }
    .notepad-panel {
      padding: 1.5rem;
      background: rgba(255, 255, 255, 0.5);
      border-radius: 8px;
      border: 2px solid #F4A261;
    }
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(-10px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
  `;
  document.head.appendChild(style);

  // Initial render
  renderNotepad();
}

export function reset() {
  notepadNotes = [];
  currentContext = 0;
  timeoutIds.forEach(id => clearTimeout(id));
  timeoutIds = [];
}
