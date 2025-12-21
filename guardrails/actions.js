// Alternative Action Handlers
// Handles what happens when user chooses an alternative action

(function() {
  'use strict';

  // Alternative Action: Open Journal Page
  function openJournal(message) {
    console.log('Guardrails: Opening journal page...');
    const journalUrl = chrome.runtime.getURL('journal/journal.html');
    window.open(journalUrl, '_blank');
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
