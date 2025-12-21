// Alternative Action Handlers
// Handles what happens when user chooses an alternative action

(function() {
  'use strict';

  // Alternative Action: Show Journal Fullscreen Overlay
  function openJournal(message) {
    console.log('Guardrails: Opening journal overlay...');

    // Create fullscreen overlay
    const overlay = document.createElement('div');
    overlay.className = 'guardrails-journal-overlay';
    overlay.innerHTML = `
      <div class="guardrails-journal-container">
        <div class="guardrails-journal-header">
          <h1 class="guardrails-journal-title">Journal</h1>
          <p class="guardrails-journal-subtitle">Take a moment to reflect on what you're feeling</p>
        </div>

        <div class="guardrails-journal-prompts">
          <div class="guardrails-journal-prompts-title">Prompts to consider:</div>
          <ul>
            <li>What are you feeling right now?</li>
            <li>What do you really need in this moment?</li>
            <li>What would you tell a friend in this situation?</li>
            <li>What are you afraid will happen?</li>
          </ul>
        </div>

        <textarea
          class="guardrails-journal-textarea"
          id="guardrails-journal-text"
          placeholder="Start writing..."
          autofocus
        ></textarea>

        <div class="guardrails-journal-footer">
          <div class="guardrails-journal-saved" id="guardrails-journal-saved">
            Entry saved
          </div>
          <div class="guardrails-journal-actions">
            <button class="guardrails-btn guardrails-btn-secondary" id="guardrails-journal-close">
              Close
            </button>
            <button class="guardrails-btn guardrails-btn-primary" id="guardrails-journal-save">
              Save Entry
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Get elements
    const textarea = overlay.querySelector('#guardrails-journal-text');
    const saveBtn = overlay.querySelector('#guardrails-journal-save');
    const closeBtn = overlay.querySelector('#guardrails-journal-close');
    const savedMsg = overlay.querySelector('#guardrails-journal-saved');

    // Load today's entry if it exists
    loadTodayEntry(textarea);

    // Auto-focus textarea
    setTimeout(() => textarea.focus(), 100);

    // Save button handler
    saveBtn.addEventListener('click', function() {
      const text = textarea.value.trim();
      if (text) {
        saveJournalEntry(text);
        showSavedMessage(savedMsg);
      }
    });

    // Close button handler
    closeBtn.addEventListener('click', function() {
      overlay.remove();
    });

    // Auto-save every 10 seconds
    const autoSaveInterval = setInterval(function() {
      const text = textarea.value.trim();
      if (text) {
        saveJournalEntry(text);
      }
    }, 10000);

    // Clean up interval when overlay is removed
    overlay.addEventListener('remove', function() {
      clearInterval(autoSaveInterval);
    });

    // Close on overlay click (but not on container click)
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) {
        overlay.remove();
      }
    });
  }

  // Load today's journal entry
  function loadTodayEntry(textarea) {
    const today = new Date().toISOString().split('T')[0];
    chrome.storage.local.get(['journal_entries'], function(result) {
      const entries = result.journal_entries || {};
      if (entries[today]) {
        textarea.value = entries[today];
      }
    });
  }

  // Save journal entry
  function saveJournalEntry(text) {
    const today = new Date().toISOString().split('T')[0];
    chrome.storage.local.get(['journal_entries'], function(result) {
      const entries = result.journal_entries || {};
      entries[today] = text;

      chrome.storage.local.set({ journal_entries: entries }, function() {
        console.log('Guardrails: Journal entry saved for', today);
      });
    });
  }

  // Show saved message
  function showSavedMessage(savedMsg) {
    savedMsg.classList.add('show');
    setTimeout(function() {
      savedMsg.classList.remove('show');
    }, 2000);
  }

  // Alternative Action: Show "Talk to Someone" message
  function showTalkToSomeone() {
    console.log('Guardrails: User chose to talk to someone');

    // Create a simple overlay with encouragement
    const overlay = document.createElement('div');
    overlay.className = 'guardrails-modal-overlay';
    overlay.innerHTML = `
      <div class="guardrails-modal">
        <div class="guardrails-modal-header">
          <span class="guardrails-modal-icon">!</span>
          <h2 class="guardrails-modal-title">Great Choice!</h2>
        </div>
        <div class="guardrails-modal-message">
          Talking to a real person is often the best way to process difficult emotions.
          <br><br>
          <strong>Consider reaching out to:</strong>
          <ul style="margin-top: 12px; padding-left: 20px;">
            <li>A trusted friend</li>
            <li>Your partner</li>
            <li>A family member</li>
            <li>A therapist or counselor</li>
          </ul>
        </div>
        <div class="guardrails-modal-actions">
          <button class="guardrails-btn guardrails-btn-primary" id="talk-close">
            Got it
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Close button
    const closeBtn = overlay.querySelector('#talk-close');
    closeBtn.addEventListener('click', function() {
      overlay.remove();
    });
  }

  // Alternative Action: Set 24-hour wait
  async function setWait24Hours(category) {
    console.log(`Guardrails: Setting 24-hour wait for ${category.name}...`);

    // Set the block
    const blockUntil = await window.GuardrailsStorage.setBlock(category.strikeKey);

    // Show confirmation
    const overlay = document.createElement('div');
    overlay.className = 'guardrails-modal-overlay';
    overlay.innerHTML = `
      <div class="guardrails-modal">
        <div class="guardrails-modal-header">
          <span class="guardrails-modal-icon"></span>
          <h2 class="guardrails-modal-title">See You Tomorrow</h2>
        </div>
        <div class="guardrails-modal-message">
          ${category.name} discussions are now blocked for 24 hours.
          <br><br>
          Take this time to:
          <ul style="margin-top: 12px; padding-left: 20px;">
            <li>Talk to someone you trust</li>
            <li>Sleep on it</li>
            <li>Get some perspective</li>
          </ul>
          <br>
          Come back tomorrow with a fresh mind.
        </div>
        <div class="guardrails-modal-actions">
          <button class="guardrails-btn guardrails-btn-primary" id="wait-close">
            Understood
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Close button
    const closeBtn = overlay.querySelector('#wait-close');
    closeBtn.addEventListener('click', function() {
      overlay.remove();
    });
  }

  // Expose to global scope
  window.GuardrailsActions = {
    openJournal,
    showTalkToSomeone,
    setWait24Hours
  };

  console.log('Guardrails: Actions module loaded');
})();
