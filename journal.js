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
const infoAlert = document.getElementById('info-alert');
const alertClose = document.getElementById('alert-close');

// Menu items
const menuSettings = document.getElementById('menu-settings');
// const menuFeedback = document.getElementById('menu-feedback');
const menuHistory = document.getElementById('menu-history');
const menuCopy = document.getElementById('menu-copy');
const menuExport = document.getElementById('menu-export');
const menuClear = document.getElementById('menu-clear');

// Fullscreen
const fullscreenButton = document.getElementById('fullscreen-button');
const fullscreenHint = document.getElementById('fullscreen-hint');

// Prompts
const promptsToggle = document.getElementById('prompts-toggle');
const promptsModal = document.getElementById('prompts-modal');
const promptQuestion = document.getElementById('prompt-question');
const promptsDifferent = document.getElementById('prompts-different');
const promptsClose = document.getElementById('prompts-close');

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
    prompts: [
      "What are you really looking for from this relationship right now?",
      "What would it look like if this situation resolved in the best possible way?",
      "What patterns from past relationships might be showing up here?",
      "If your future self could give you advice right now, what would they say?",
      "What are you afraid will happen if you have this conversation?"
    ]
  },
  work: {
    toggle: questionPrompt,
    prompts: [
      "What aspects of this work situation are within your control?",
      "What would need to change for you to feel fulfilled at work?",
      "What are you learning about yourself through this challenge?",
      "If money wasn't a factor, what would you do differently?",
      "What boundary do you need to set to protect your wellbeing?"
    ]
  },
  family: {
    toggle: questionPrompt,
    prompts: [
      "What would help you feel more understood in this family dynamic?",
      "What role have you been playing in this family, and is it still serving you?",
      "What would you say if you knew they would truly listen?",
      "What patterns are repeating from your childhood?",
      "What do you need to forgive yourself for in this situation?"
    ]
  },
  default: {
    toggle: questionPrompt,
    prompts: [
      "What are you feeling right now, without judging it?",
      "What's taking up the most mental space for you today?",
      "What do you need to hear right now?",
      "What would make today feel meaningful?",
      "What are you grateful for in this moment?"
    ]
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

// Track which prompts have been shown
let shownPrompts = [];
let currentPromptIndex = -1;

// Show initial random prompt
showRandomPrompt();

// Load today's entry and set date
loadTodayEntry();
updateDateDisplay();

// ========================================
// INFO ALERT CLOSE
// ========================================

alertClose.addEventListener('click', function() {
  infoAlert.classList.add('hidden');
});

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

// Close modals with Esc key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    promptsModal.classList.remove('show');
    historyModal.classList.remove('show');
  }
});

// ========================================
// MENU ACTIONS
// ========================================

// Fullscreen button
fullscreenButton.addEventListener('click', function() {
  toggleFullscreen();
});

// Open Settings
menuSettings.addEventListener('click', function() {
  menuDropdown.classList.remove('show');
  const settingsUrl = chrome.runtime.getURL('options.html');
  window.open(settingsUrl, '_blank');
});

// Send Feedback
// menuFeedback.addEventListener('click', function() {
//   menuDropdown.classList.remove('show');
//   const subject = encodeURIComponent('AI Guardrails Feedback');
//   const body = encodeURIComponent('Hi! I have feedback about the AI Guardrails extension:\n\n');
//   window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
// });

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

// Show a random prompt that hasn't been shown yet
function showRandomPrompt() {
  // If all prompts have been shown, reset the list
  if (shownPrompts.length >= categoryPrompt.prompts.length) {
    shownPrompts = [];
  }

  // Get available prompts (ones not yet shown)
  const availableIndices = categoryPrompt.prompts
    .map((_, index) => index)
    .filter(index => !shownPrompts.includes(index));

  // Pick a random one
  const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
  currentPromptIndex = randomIndex;
  shownPrompts.push(randomIndex);

  // Update the prompt text
  promptQuestion.textContent = categoryPrompt.prompts[randomIndex];
}

// Open prompts modal
promptsToggle.addEventListener('click', function(e) {
  e.preventDefault();
  promptsModal.classList.add('show');
});

// Try a different prompt
promptsDifferent.addEventListener('click', function() {
  showRandomPrompt();
});

// Start writing (close modal and insert prompt into journal)
promptsClose.addEventListener('click', function() {
  // Insert the current prompt as a question in the textarea
  const currentPrompt = categoryPrompt.prompts[currentPromptIndex];
  const promptText = `${currentPrompt}\n\n`;

  // Only insert if textarea is empty or user confirms
  if (textarea.value.trim()) {
    // If there's already content, append the prompt
    textarea.value += `\n\n${promptText}`;
  } else {
    // If empty, just set it
    textarea.value = promptText;
  }

  textarea.focus();

  // Set cursor after the prompt
  setTimeout(() => {
    textarea.setSelectionRange(textarea.value.length, textarea.value.length);
  }, 10);

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

// ========================================
// FULLSCREEN MODE
// ========================================

// Toggle fullscreen mode
function toggleFullscreen() {
  if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.mozFullScreenElement) {
    // Enter fullscreen
    const elem = document.documentElement;

    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
    }
  } else {
    // Exit fullscreen
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    }
  }
}

// Handle fullscreen change events
function onFullscreenChange() {
  const isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement);

  if (isFullscreen) {
    // Entered fullscreen - change to exit icon
    fullscreenButton.textContent = 'fullscreen_exit';
    fullscreenButton.title = 'Exit fullscreen (Esc)';

    // Show hint for 3 seconds
    fullscreenHint.classList.add('show');
    setTimeout(() => {
      fullscreenHint.classList.remove('show');
    }, 3000);

    // Focus on textarea
    textarea.focus();
  } else {
    // Exited fullscreen - change to fullscreen icon
    fullscreenButton.textContent = 'fullscreen';
    fullscreenButton.title = 'Enter fullscreen (Ctrl+Shift+F)';
  }
}

// Listen for fullscreen changes
document.addEventListener('fullscreenchange', onFullscreenChange);
document.addEventListener('webkitfullscreenchange', onFullscreenChange);
document.addEventListener('mozfullscreenchange', onFullscreenChange);

// Keyboard shortcut: F11 or Cmd/Ctrl + Shift + F
document.addEventListener('keydown', function(e) {
  // Cmd/Ctrl + Shift + F
  if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'F') {
    e.preventDefault();
    toggleFullscreen();
  }
});

// Auto-focus textarea on load
textarea.focus();
