// Section 5: Long-Term Memory
let longTermMemory = {};
let currentCustomer = null;
let timeoutIds = [];

const regularCustomers = [
  {
    name: 'Mr. Chen',
    preferences: 'Large pepperoni, no mushrooms, extra cheese',
    orders: 24,
    lastVisit: '2 days ago'
  },
  {
    name: 'Sarah K.',
    preferences: 'Thin crust, veggie pizza, light sauce',
    orders: 8,
    lastVisit: '1 week ago'
  },
  {
    name: 'The Johnsons',
    preferences: 'Family size, half pepperoni/half plain',
    orders: 15,
    lastVisit: '3 days ago'
  }
];

export function init(containerEl) {
  const html = `
    <div class="memory-long-wrapper">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin: 2rem 0;">
        <!-- Notepad (Short-term) -->
        <div class="memory-panel">
          <h3 style="text-align: center; margin-bottom: 1rem;">📝 Apron Notepad (Short-term)</h3>
          <div id="notepadDisplay" class="notepad-simple" style="padding: 1rem; background: rgba(255, 255, 200, 0.3); border-radius: 6px; min-height: 200px; border: 2px dashed #F4A261;">
            <p style="color: #999; text-align: center;">Customer info here (clears with shift)</p>
          </div>
        </div>

        <!-- Leather Book (Long-term) -->
        <div class="memory-panel">
          <h3 style="text-align: center; margin-bottom: 1rem;">📖 Leather-Bound Regulars Book</h3>
          <div class="search-box">
            <input type="text" id="searchInput" placeholder="Search by customer name..." style="width: 100%; padding: 0.5rem; border: 2px solid #F4A261; border-radius: 5px; font-family: 'Nunito', sans-serif;">
          </div>
          <div id="leatherBook" class="leather-book" style="padding: 1rem; background: linear-gradient(135deg, #3A2A1A 0%, #4A3A2A 100%); border-radius: 6px; min-height: 200px; border: 3px solid #8B7355; color: #F5DEB3; margin-top: 0.5rem; overflow-y: auto; max-height: 300px;">
            <p style="text-align: center; opacity: 0.5;">Book is empty. Make some regular customers!</p>
          </div>
        </div>
      </div>

      <div class="control-panel">
        <button id="addCustomerBtn" class="primary">Add New Customer to Book</button>
        <button id="newShiftBtn">Start New Shift (Clear Notepad Only)</button>
        <button id="customerReturnsBtn">Regular Customer Returns</button>
        <button id="resetBtn">Reset</button>
      </div>

      <div id="scenario" style="display: none; margin-top: 2rem; padding: 1.5rem; background: rgba(255, 255, 255, 0.7); border-radius: 8px; border-left: 4px solid #F4A261;"></div>
    </div>
  `;

  containerEl.innerHTML = html;

  const notepadDisplay = containerEl.querySelector('#notepadDisplay');
  const leatherBook = containerEl.querySelector('#leatherBook');
  const searchInput = containerEl.querySelector('#searchInput');
  const addCustomerBtn = containerEl.querySelector('#addCustomerBtn');
  const newShiftBtn = containerEl.querySelector('#newShiftBtn');
  const customerReturnsBtn = containerEl.querySelector('#customerReturnsBtn');
  const resetBtn = containerEl.querySelector('#resetBtn');
  const scenario = containerEl.querySelector('#scenario');

  function renderBook() {
    leatherBook.innerHTML = '';

    const customers = Object.values(longTermMemory);
    if (customers.length === 0) {
      leatherBook.innerHTML = '<p style="text-align: center; opacity: 0.5;">Book is empty. Make some regular customers!</p>';
      return;
    }

    customers.forEach((customer, idx) => {
      const entry = document.createElement('div');
      entry.className = 'book-entry';
      entry.innerHTML = `
        <div style="border-bottom: 1px solid rgba(245, 222, 179, 0.3); padding: 0.75rem 0; margin: 0.5rem 0;">
          <strong style="font-size: 1.1rem;">${customer.name}</strong><br>
          <small>Orders: ${customer.orders} | Last visit: ${customer.lastVisit}</small><br>
          <em>${customer.preferences}</em>
        </div>
      `;
      leatherBook.appendChild(entry);
    });
  }

  function renderNotepad() {
    if (currentCustomer) {
      notepadDisplay.innerHTML = `
        <div style="animation: slideIn 0.3s ease-out;">
          <strong>${currentCustomer.name}</strong><br>
          <small>${currentCustomer.preferences}</small><br>
          <small>Phone: ${currentCustomer.phone}</small><br>
          <small>Address: ${currentCustomer.address}</small>
        </div>
      `;
    } else {
      notepadDisplay.innerHTML = '<p style="color: #999; text-align: center;">No current customer (notepad is empty)</p>';
    }
  }

  addCustomerBtn.addEventListener('click', async () => {
    try {
      const customer = regularCustomers[Math.floor(Math.random() * regularCustomers.length)];
      const newCustomer = {
        ...customer,
        phone: `555-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        address: `${Math.floor(Math.random() * 999) + 1} ${['Main', 'Oak', 'Elm', 'Pine', 'Maple'][Math.floor(Math.random() * 5)]} St`
      };

      longTermMemory[customer.name] = newCustomer;
      currentCustomer = newCustomer;

      renderNotepad();
      renderBook();

      scenario.style.display = 'block';
      scenario.innerHTML = `
        <strong>✓ Added to Book:</strong> "${newCustomer.name}"<br>
        This information will survive the next shift change!
      `;

      window.soundManager?.success();
    } finally {
      // Done
    }
  });

  newShiftBtn.addEventListener('click', async () => {
    try {
      currentCustomer = null;
      renderNotepad();

      scenario.style.display = 'block';
      scenario.innerHTML = `
        <strong>🚨 New Shift Started!</strong><br>
        The notepad (short-term memory) was cleared.<br>
        But the leather book (long-term memory) survived!
      `;

      window.soundManager?.ping();
    } finally {
      // Done
    }
  });

  customerReturnsBtn.addEventListener('click', async () => {
    try {
      const bookCustomers = Object.values(longTermMemory);

      if (bookCustomers.length === 0) {
        scenario.style.display = 'block';
        scenario.innerHTML = '<span style="color: #E63946;">❌ No customers in the book yet. Add some first!</span>';
        window.soundManager?.error();
        return;
      }

      const returnCustomer = bookCustomers[Math.floor(Math.random() * bookCustomers.length)];
      currentCustomer = returnCustomer;
      renderNotepad();

      scenario.style.display = 'block';
      scenario.innerHTML = `
        <strong style="color: #2A9D8F;">✓ Customer Returns!</strong><br>
        <br>
        Chef checks leather book... "Ah! ${returnCustomer.name}! Welcome back!<br>
        I remember: you like ${returnCustomer.preferences.toLowerCase()}.<br>
        You were here ${returnCustomer.lastVisit}. Let me get that ready for you!"<br>
        <br>
        <em>This memory persisted across the shift change because it was saved in long-term memory.</em>
      `;

      window.soundManager?.success();
    } finally {
      // Done
    }
  });

  searchInput.addEventListener('input', (e) => {
    try {
      const query = e.target.value.toLowerCase();
      const filtered = Object.values(longTermMemory).filter(c =>
        c.name.toLowerCase().includes(query)
      );

      leatherBook.innerHTML = '';
      if (filtered.length === 0) {
        leatherBook.innerHTML = '<p style="text-align: center; opacity: 0.5;">No matches found</p>';
        return;
      }

      filtered.forEach(customer => {
        const entry = document.createElement('div');
        entry.className = 'book-entry';
        entry.style.background = 'rgba(255, 255, 255, 0.05)';
        entry.style.padding = '0.75rem';
        entry.style.borderRadius = '4px';
        entry.style.marginBottom = '0.5rem';
        entry.innerHTML = `
          <strong style="font-size: 1.1rem;">${customer.name}</strong><br>
          <small>Orders: ${customer.orders} | Last visit: ${customer.lastVisit}</small><br>
          <em>${customer.preferences}</em>
        `;
        leatherBook.appendChild(entry);
      });
    } finally {
      // Done
    }
  });

  resetBtn.addEventListener('click', () => {
    try {
      longTermMemory = {};
      currentCustomer = null;
      renderNotepad();
      renderBook();
      searchInput.value = '';
      scenario.style.display = 'none';

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
    .memory-panel {
      padding: 1.5rem;
      background: rgba(255, 255, 255, 0.5);
      border-radius: 8px;
      border: 2px solid #F4A261;
    }
    .notepad-simple {
      font-family: 'Nunito', sans-serif;
      line-height: 1.6;
    }
    .leather-book {
      font-family: 'Pacifico', cursive;
      font-size: 0.95rem;
    }
    .book-entry {
      border-bottom: 1px solid rgba(245, 222, 179, 0.3);
      padding: 0.75rem 0;
      margin: 0.5rem 0;
    }
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;
  document.head.appendChild(style);

  renderBook();
  renderNotepad();
}

export function reset() {
  longTermMemory = {};
  currentCustomer = null;
  timeoutIds.forEach(id => clearTimeout(id));
  timeoutIds = [];
}
