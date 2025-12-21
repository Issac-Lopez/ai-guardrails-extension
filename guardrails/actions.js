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

        <div id="guardrails-journal-write-view">
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
              <button class="guardrails-btn guardrails-btn-secondary" id="guardrails-journal-history-btn">
                View History
              </button>
              <button class="guardrails-btn guardrails-btn-secondary" id="guardrails-journal-close">
                Close
              </button>
              <button class="guardrails-btn guardrails-btn-primary" id="guardrails-journal-save">
                Save Entry
              </button>
            </div>
          </div>
        </div>

        <div id="guardrails-journal-history-view" style="display: none;">
          <div class="guardrails-journal-history-list" id="guardrails-journal-history-list">
            <div class="journal-empty">No journal entries yet</div>
          </div>

          <div class="guardrails-journal-footer">
            <div style="flex: 1;"></div>
            <div class="guardrails-journal-actions">
              <button class="guardrails-btn guardrails-btn-secondary" id="guardrails-journal-back-btn">
                Back to Write
              </button>
              <button class="guardrails-btn guardrails-btn-secondary" id="guardrails-journal-close-history">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Get elements
    const textarea = overlay.querySelector('#guardrails-journal-text');
    const saveBtn = overlay.querySelector('#guardrails-journal-save');
    const closeBtn = overlay.querySelector('#guardrails-journal-close');
    const closeHistoryBtn = overlay.querySelector('#guardrails-journal-close-history');
    const savedMsg = overlay.querySelector('#guardrails-journal-saved');
    const historyBtn = overlay.querySelector('#guardrails-journal-history-btn');
    const backBtn = overlay.querySelector('#guardrails-journal-back-btn');
    const writeView = overlay.querySelector('#guardrails-journal-write-view');
    const historyView = overlay.querySelector('#guardrails-journal-history-view');
    const historyList = overlay.querySelector('#guardrails-journal-history-list');

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

    // Close button handlers
    closeBtn.addEventListener('click', function() {
      overlay.remove();
    });

    closeHistoryBtn.addEventListener('click', function() {
      overlay.remove();
    });

    // View History button handler
    historyBtn.addEventListener('click', function() {
      writeView.style.display = 'none';
      historyView.style.display = 'block';
      loadJournalHistoryInOverlay(historyList);
    });

    // Back to Write button handler
    backBtn.addEventListener('click', function() {
      historyView.style.display = 'none';
      writeView.style.display = 'block';
      textarea.focus();
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

  // Load journal history in overlay
  function loadJournalHistoryInOverlay(historyList) {
    chrome.storage.local.get(['journal_entries'], function(result) {
      const entries = result.journal_entries || {};
      const dates = Object.keys(entries).sort().reverse(); // Most recent first

      if (dates.length === 0) {
        historyList.innerHTML = '<div style="text-align: center; padding: 40px; color: #999;">No journal entries yet</div>';
        return;
      }

      let html = '<div style="max-height: 400px; overflow-y: auto;">';
      dates.forEach(date => {
        const text = entries[date];
        const preview = text.substring(0, 100) + (text.length > 100 ? '...' : '');

        html += `
          <div class="journal-history-item" data-date="${date}" style="
            padding: 16px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            margin-bottom: 12px;
            cursor: pointer;
            transition: all 0.2s;
          ">
            <div style="font-weight: 600; color: #1a1a1a; margin-bottom: 4px;">${formatDateHelper(date)}</div>
            <div style="font-size: 14px; color: #6e6e80; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${preview}</div>
          </div>
        `;
      });
      html += '</div>';

      historyList.innerHTML = html;

      // Add click handlers to view entries
      historyList.querySelectorAll('.journal-history-item').forEach(item => {
        item.addEventListener('click', function() {
          const date = this.getAttribute('data-date');
          viewJournalEntryInModal(date, entries[date]);
        });

        // Hover effect
        item.addEventListener('mouseenter', function() {
          this.style.borderColor = '#10a37f';
          this.style.background = '#f0fdf9';
        });
        item.addEventListener('mouseleave', function() {
          this.style.borderColor = '#e0e0e0';
          this.style.background = '';
        });
      });
    });
  }

  // View journal entry in modal
  function viewJournalEntryInModal(date, text) {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.className = 'guardrails-modal-overlay';
    modal.style.zIndex = '1000001'; // Higher than journal overlay
    modal.innerHTML = `
      <div class="guardrails-modal" style="max-width: 700px;">
        <div class="guardrails-modal-header">
          <h2 class="guardrails-modal-title">Journal Entry - ${formatDateHelper(date)}</h2>
        </div>
        <div class="guardrails-modal-message" style="max-height: 400px; overflow-y: auto; white-space: pre-wrap; line-height: 1.6;">
          ${text}
        </div>
        <div class="guardrails-modal-actions">
          <button class="guardrails-btn guardrails-btn-secondary" id="view-modal-close">
            Close
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Close button
    const closeBtn = modal.querySelector('#view-modal-close');
    closeBtn.addEventListener('click', function() {
      modal.remove();
    });

    // Close on overlay click
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  // Helper: Format date
  function formatDateHelper(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayStr = today.toISOString().split('T')[0];
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (dateStr === todayStr) {
      return 'Today - ' + dateStr;
    } else if (dateStr === yesterdayStr) {
      return 'Yesterday - ' + dateStr;
    } else {
      return dateStr;
    }
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
    closeBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      overlay.remove();
    });

    // Close on overlay background click (not on modal content)
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) {
        overlay.remove();
      }
    });
  }

  // Alternative Action: Set 24-hour wait
  async function setWait24Hours(category) {
    console.log(`Guardrails: Setting 24-hour wait for ${category.name}...`);

    // Set the block
    const blockUntil = await window.GuardrailsStorage.setBlock(category.strikeKey);

    // Show confirmation (no background overlay, just modal)
    const modal = document.createElement('div');
    modal.className = 'guardrails-modal';
    modal.style.position = 'fixed';
    modal.style.top = '50%';
    modal.style.left = '50%';
    modal.style.transform = 'translate(-50%, -50%)';
    modal.style.zIndex = '999999';
    modal.innerHTML = `
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
    `;

    document.body.appendChild(modal);

    // Close button
    const closeBtn = modal.querySelector('#wait-close');
    closeBtn.addEventListener('click', function() {
      modal.remove();
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
