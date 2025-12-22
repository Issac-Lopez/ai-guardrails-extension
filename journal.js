// ========================================
// JOURNAL - Clean & Simple
// ========================================

// DOM Elements
const textarea = document.getElementById('journal-text');
const journalDate = document.getElementById('journal-date');
const menuButton = document.getElementById('menu-button');
const menuDropdown = document.getElementById('menu-dropdown');
const autosaveIndicator = document.getElementById('autosave-indicator');
const successMessage = document.getElementById('success-message');
const readonlyBadge = document.getElementById('readonly-badge');

// Menu items
const menuHistory = document.getElementById('menu-history');
const menuCopy = document.getElementById('menu-copy');
const menuExport = document.getElementById('menu-export');
const menuClear = document.getElementById('menu-clear');

// Prompts
const promptsToggle = document.getElementById('prompts-toggle');
const promptsModal = document.getElementById('prompts-modal');
const promptsClose = document.getElementById('prompts-close');
const promptQuestion = document.getElementById('prompt-question');

// History
const historyModal = document.getElementById('history-modal');
const historyList = document.getElementById('history-list');
const historyClose = document.getElementById('history-close');

// Track current entry date
let currentDate = new Date().toISOString().split('T')[0];

// ========================================
// CATEGORY-SPECIFIC PROMPTS
// ========================================

const questionPrompt = "Do you want help getting started?";

const CATEGORY_PROMPTS = {
  relationships: {
    toggle: questionPrompt,
    modal: "What are you really looking for from this relationship right now?"
  },
  work: {
    toggle: questionPrompt,
    modal: "What aspects of this work situation are within your control?"
  },
  family: {
    toggle: questionPrompt,
    modal: "What would help you feel more understood in this family dynamic?"
  },
  default: {
    toggle: questionPrompt,
    modal: "What are you feeling right now?"
  }
};

// Get category from URL parameter
function getCategoryFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('category') || 'default';
}

const triggeredCategory = getCategoryFromURL();
const categoryPrompt = CATEGORY_PROMPTS[triggeredCategory] || CATEGORY_PROMPTS.default;

// ========================================
// INITIALIZATION
// ========================================

// Set category-specific prompts
promptsToggle.textContent = categoryPrompt.toggle;
promptQuestion.textContent = categoryPrompt.modal;

// Load today's entry and set date
loadTodayEntry();
updateDateDisplay();

// ========================================
// MENU DROPDOWN
// ========================================

menuButton.addEventListener('click', function(e) {
  e.stopPropagation();
  menuDropdown.classList.toggle('show');
});

// Close menu when clicking outside
document.addEventListener('click', function(e) {
  if (!menuDropdown.contains(e.target) && e.target !== menuButton) {
    menuDropdown.classList.remove('show');
  }
});

// Close prompts modal when clicking outside
promptsModal.addEventListener('click', function(e) {
  if (e.target === promptsModal) {
    promptsModal.classList.remove('show');
  }
});

// Close history modal when clicking outside
historyModal.addEventListener('click', function(e) {
  if (e.target === historyModal) {
    historyModal.classList.remove('show');
  }
});

// ========================================
// MENU ACTIONS
// ========================================

// View History
menuHistory.addEventListener('click', function() {
  menuDropdown.classList.remove('show');
  loadHistory();
  historyModal.classList.add('show');
});

// Copy to Clipboard
menuCopy.addEventListener('click', async function() {
  menuDropdown.classList.remove('show');

  const text = textarea.value.trim();

  if (!text) {
    showMessage('Nothing to copy! Write something first.', false);
    return;
  }

  const timeStr = new Date().toLocaleString();
  const formattedContent = `Journal Entry - ${formatDate(currentDate)}
Created: ${timeStr}

${text}`;

  try {
    await navigator.clipboard.writeText(formattedContent);
    showMessage('📋 Copied to clipboard!', true);
  } catch (err) {
    showMessage('Failed to copy to clipboard', false);
    console.error('Copy failed:', err);
  }
});

// Export as .txt
menuExport.addEventListener('click', function() {
  menuDropdown.classList.remove('show');

  const text = textarea.value.trim();

  if (!text) {
    showMessage('Nothing to export! Write something first.', false);
    return;
  }

  const timeStr = new Date().toLocaleString();
  const formattedContent = `Journal Entry - ${formatDate(currentDate)}
Created: ${timeStr}

${text}`;

  const blob = new Blob([formattedContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `journal-${currentDate}.txt`;

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showMessage('💾 Exported successfully!', true);
});

// Clear Entry
menuClear.addEventListener('click', function() {
  menuDropdown.classList.remove('show');

  if (textarea.hasAttribute('readonly')) {
    showMessage('Cannot clear a past entry', false);
    return;
  }

  if (confirm('Are you sure you want to clear this entry?')) {
    textarea.value = '';
    textarea.focus();
  }
});

// ========================================
// PROMPTS MODAL
// ========================================

promptsToggle.addEventListener('click', function(e) {
  e.preventDefault();
  promptsModal.classList.add('show');
});

promptsClose.addEventListener('click', function() {
  promptsModal.classList.remove('show');
});

// ========================================
// HISTORY MODAL
// ========================================

historyClose.addEventListener('click', function() {
  historyModal.classList.remove('show');
});

// ========================================
// AUTO-SAVE
// ========================================

// Auto-save every second
setInterval(function() {
  const text = textarea.value.trim();

  // Only auto-save if not read-only and has content
  if (!textarea.hasAttribute('readonly') && text) {
    saveJournalEntry(text, true); // true = silent save
  }
}, 1000);

// ========================================
// CORE FUNCTIONS
// ========================================

// Load today's entry
function loadTodayEntry() {
  const today = new Date().toISOString().split('T')[0];
  currentDate = today;

  chrome.storage.local.get(['journal_entries'], function(result) {
    const entries = result.journal_entries || {};

    if (entries[today]) {
      textarea.value = entries[today];
    }
  });
}

// Save journal entry
function saveJournalEntry(text, silent = false) {
  chrome.storage.local.get(['journal_entries'], function(result) {
    const entries = result.journal_entries || {};
    entries[currentDate] = text;

    chrome.storage.local.set({ journal_entries: entries }, function() {
      if (!silent) {
        showMessage('✓ Entry saved!', true);
      } else {
        // Show subtle auto-save indicator
        autosaveIndicator.classList.add('show');
        setTimeout(() => {
          autosaveIndicator.classList.remove('show');
        }, 2000);
      }
    });
  });
}

// Load and display history
function loadHistory() {
  chrome.storage.local.get(['journal_entries'], function(result) {
    const entries = result.journal_entries || {};
    const dates = Object.keys(entries).sort().reverse(); // Most recent first

    if (dates.length === 0) {
      historyList.innerHTML = '<p class="history-empty">No past entries yet. Start writing!</p>';
      return;
    }

    historyList.innerHTML = dates.map(date => {
      const text = entries[date];
      const preview = text.substring(0, 100) + (text.length > 100 ? '...' : '');
      const isActive = date === currentDate ? 'active' : '';

      return `
        <div class="history-item ${isActive}" data-date="${date}">
          <div class="history-date">${formatDate(date)}</div>
          <div class="history-preview">${preview}</div>
        </div>
      `;
    }).join('');

    // Add click handlers
    document.querySelectorAll('.history-item').forEach(item => {
      item.addEventListener('click', function() {
        const date = this.getAttribute('data-date');
        loadEntryByDate(date);
        historyModal.classList.remove('show');
      });
    });
  });
}

// Load specific entry by date
function loadEntryByDate(date) {
  chrome.storage.local.get(['journal_entries'], function(result) {
    const entries = result.journal_entries || {};

    if (entries[date]) {
      currentDate = date;
      textarea.value = entries[date];
      updateDateDisplay();

      // Check if this is a past entry
      const today = new Date().toISOString().split('T')[0];
      const isPastEntry = date !== today;

      setReadOnlyState(isPastEntry);
    }
  });
}

// Set read-only state
function setReadOnlyState(isReadOnly) {
  if (isReadOnly) {
    textarea.setAttribute('readonly', 'readonly');
    textarea.style.background = '#fafafa';
    textarea.style.cursor = 'default';
    readonlyBadge.classList.add('show');
  } else {
    textarea.removeAttribute('readonly');
    textarea.style.background = '';
    textarea.style.cursor = '';
    readonlyBadge.classList.remove('show');
  }
}

// Update date display
function updateDateDisplay() {
  journalDate.textContent = formatDate(currentDate);
}

// Format date nicely
function formatDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const todayStr = today.toISOString().split('T')[0];
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (dateStr === todayStr) {
    return 'Today, ' + dateStr;
  } else if (dateStr === yesterdayStr) {
    return 'Yesterday, ' + dateStr;
  } else {
    return dateStr;
  }
}

// Show success/error message
function showMessage(text, isSuccess) {
  successMessage.textContent = text;
  successMessage.style.background = isSuccess ? '#d4edda' : '#f8d7da';
  successMessage.style.color = isSuccess ? '#155724' : '#721c24';
  successMessage.classList.add('show');

  setTimeout(() => {
    successMessage.classList.remove('show');
  }, 3000);
}

// Auto-focus textarea on load
textarea.focus();
