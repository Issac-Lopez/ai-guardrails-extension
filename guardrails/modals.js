// Modal UI Components
// Handles creation and display of all modal dialogs

(function() {
  'use strict';

  // Show warning modal based on strike level
  function showWarningModal(message, strikeLevel, category) {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.className = 'guardrails-modal-overlay';

    // Different content based on strike level
    let icon, title, messageText, showContinue, delaySeconds;

    if (strikeLevel === 1) {
      // Strike 1 - Soft warning
      icon = '';
      title = category.messages.strike1Title;
      messageText = category.messages.strike1Body;
      showContinue = true;
      delaySeconds = 5;
    } else if (strikeLevel === 2) {
      // Strike 2 - Stronger warning
      icon = '';
      title = category.messages.strike2Title;
      messageText = category.messages.strike2Body;
      showContinue = true;
      delaySeconds = 10;
    } else {
      // Strike 3+ - Hard block
      icon = '';
      title = category.messages.strike3Title;
      messageText = category.messages.strike3Body;
      showContinue = false;
      delaySeconds = 0;
    }

    // Alternative actions HTML
    let alternativeActionsHTML = '';

    if (strikeLevel === 1 || strikeLevel === 2) {
      // Strike 1 & 2: Show all alternatives including "Continue anyway"
      alternativeActionsHTML = `
      <div class="guardrails-alternatives">
        <button class="guardrails-alt-btn" id="guardrails-journal">
          Journal Instead
        </button>
        <button class="guardrails-alt-btn" id="guardrails-talk">
          Talk to Someone
        </button>
        <button class="guardrails-alt-btn" id="guardrails-wait">
           Wait 24 Hours
        </button>
      </div>
      <div class="guardrails-divider">or</div>
    `;
    } else if (strikeLevel >= 3) {
      // Strike 3+: Only show journal and talk (no "Wait 24 Hours" since already blocked)
      alternativeActionsHTML = `
      <div class="guardrails-alternatives">
        <button class="guardrails-alt-btn" id="guardrails-journal">
          Journal Instead
        </button>
        <button class="guardrails-alt-btn" id="guardrails-talk">
          Talk to Someone
        </button>
      </div>
    `;
    }

    // Create modal content
    overlay.innerHTML = `
      <div class="guardrails-modal">
        <div class="guardrails-modal-header">
          <span class="guardrails-modal-icon">${icon}</span>
          <h2 class="guardrails-modal-title">${title}</h2>
        </div>
        <div class="guardrails-modal-message">
          ${messageText}
        </div>
        ${alternativeActionsHTML}
        <div class="guardrails-modal-actions">
          <button class="guardrails-btn guardrails-btn-secondary" id="guardrails-cancel">
            ${showContinue ? 'Cancel' : 'Close'}
          </button>
          ${showContinue ? '<button class="guardrails-btn guardrails-btn-primary" id="guardrails-continue">Continue anyway</button>' : ''}
        </div>
      </div>
    `;

    // Add to page
    document.body.appendChild(overlay);

    let timer;

    // Handle continue button (if it exists)
    if (showContinue) {
      const continueBtn = overlay.querySelector('#guardrails-continue');
      let countdown = delaySeconds;

      // Disable button initially
      continueBtn.disabled = true;
      continueBtn.textContent = `Continue anyway (${countdown}s)`;

      // Start countdown
      timer = setInterval(function() {
        countdown--;

        if (countdown > 0) {
          continueBtn.textContent = `Continue anyway (${countdown}s)`;
        } else {
          // Enable button after delay
          clearInterval(timer);
          continueBtn.disabled = false;
          continueBtn.textContent = 'Continue anyway';
        }
      }, 1000);

      continueBtn.addEventListener('click', function() {
        if (timer) clearInterval(timer); // Clean up timer
        overlay.remove();
        // Allow the message to send
        window.GuardrailsUI.sendMessage(message);
      });
    }

    // Handle cancel/close button
    const cancelBtn = overlay.querySelector('#guardrails-cancel');
    cancelBtn.addEventListener('click', function() {
      if (timer) clearInterval(timer); // Clean up timer
      overlay.remove();
    });

    // Handle alternative action buttons (for all strike levels)
    if (strikeLevel >= 1) {
      // Journal Instead button
      const journalBtn = overlay.querySelector('#guardrails-journal');
      if (journalBtn) {
        journalBtn.addEventListener('click', function() {
          if (timer) clearInterval(timer);
          overlay.remove();
          window.GuardrailsActions.openJournal(message);
        });
      }

      // Talk to Someone button
      const talkBtn = overlay.querySelector('#guardrails-talk');
      if (talkBtn) {
        talkBtn.addEventListener('click', function() {
          if (timer) clearInterval(timer);
          overlay.remove();
          window.GuardrailsActions.showTalkToSomeone();
        });
      }

      // Wait 24 Hours button (only for Strike 1 & 2)
      const waitBtn = overlay.querySelector('#guardrails-wait');
      if (waitBtn) {
        waitBtn.addEventListener('click', function() {
          if (timer) clearInterval(timer);
          overlay.remove();
          window.GuardrailsActions.setWait24Hours(category);
        });
      }
    }
  }

  // Show blocked message (24-hour wait)
  function showBlockedMessage(blockUntil, category) {
    // Remove any existing overlays first
    document.querySelectorAll('.guardrails-modal-overlay').forEach(el => el.remove());

    const hoursLeft = Math.ceil((blockUntil - Date.now()) / (1000 * 60 * 60));

    const overlay = document.createElement('div');
    overlay.className = 'guardrails-modal-overlay';
    overlay.innerHTML = `
      <div class="guardrails-modal">
        <div class="guardrails-modal-header">
          <span class="guardrails-modal-icon"></span>
          <h2 class="guardrails-modal-title">Still Waiting...</h2>
        </div>
        <div class="guardrails-modal-message">
          ${category.name} discussions are blocked for another <strong>${hoursLeft} hour(s)</strong>.
          <br><br>
          Use this time to talk to someone real.
        </div>
        <div class="guardrails-modal-actions">
          <button class="guardrails-btn guardrails-btn-primary" id="blocked-close">
            Close
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const closeBtn = overlay.querySelector('#blocked-close');
    closeBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      e.preventDefault();
      console.log('Close button clicked');
      overlay.remove();
    });

    // Also close on overlay background click
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) {
        console.log('Overlay background clicked');
        overlay.remove();
      }
    });
  }

  // Expose to global scope
  window.GuardrailsModals = {
    showWarningModal,
    showBlockedMessage
  };

  console.log('Guardrails: Modals module loaded');
})();
