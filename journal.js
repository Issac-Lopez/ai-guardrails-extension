// Journal page functionality

const textarea = document.getElementById('journal-text');
const saveBtn = document.getElementById('save-btn');
const clearBtn = document.getElementById('clear-btn');
const copyBtn = document.getElementById('copy-btn');
const exportBtn = document.getElementById('export-btn');
const savedMessage = document.getElementById('saved-message');
const toggleHistoryBtn = document.getElementById('toggle-history-btn');
const historySection = document.getElementById('journal-history');
const historyList = document.getElementById('history-list');
const obsidianReminder = document.getElementById('obsidian-reminder');
const obsidianSetup = document.getElementById('obsidian-setup');
const obsidianPath = document.getElementById('obsidian-path');
const pathInput = document.getElementById('path-input');
const savePathBtn = document.getElementById('save-path-btn');
const editPathBtn = document.getElementById('edit-path-btn');

let currentDate = new Date().toISOString().split('T')[0]; // Track which entry we're viewing

// Load any existing journal entry for today
loadTodayEntry();

// Load history
loadHistory();

// Load Obsidian path
loadObsidianPath();

// Save button
saveBtn.addEventListener('click', function() {
  const text = textarea.value.trim();

  if (text) {
    saveJournalEntry(text);
    showSavedMessage();
  }
});

// Clear button
clearBtn.addEventListener('click', function() {
  if (confirm('Are you sure you want to clear this entry?')) {
    textarea.value = '';
    textarea.focus();
  }
});

// Copy to clipboard button
copyBtn.addEventListener('click', async function() {
  const text = textarea.value.trim();

  if (!text) {
    alert('Nothing to copy! Write something first.');
    return;
  }

  // Format content with date
  const timeStr = new Date().toLocaleTimeString();
  const formattedContent = `# Journal Entry - ${currentDate}
Created: ${timeStr}

${text}`;

  try {
    await navigator.clipboard.writeText(formattedContent);

    // Show success feedback
    const originalText = copyBtn.textContent;
    copyBtn.textContent = ' Copied!';
    copyBtn.style.background = '#4caf50';
    copyBtn.style.color = 'white';

    setTimeout(() => {
      copyBtn.textContent = originalText;
      copyBtn.style.background = '';
      copyBtn.style.color = '';
    }, 2000);

    console.log('Journal copied to clipboard');
  } catch (err) {
    alert('Failed to copy to clipboard. Please try again.');
    console.error('Copy failed:', err);
  }
});

// Export button
exportBtn.addEventListener('click', function() {
  const text = textarea.value.trim();

  if (!text) {
    alert('Nothing to export! Write something first.');
    return;
  }

  // Create formatted content with date and time
  const timeStr = new Date().toLocaleTimeString(); // Local time

  const formattedContent = `# Journal Entry - ${currentDate}
Created: ${timeStr}

${text}
`;

  // Create blob and download link
  const blob = new Blob([formattedContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `journal-${currentDate}.txt`;

  // Trigger download
  document.body.appendChild(a);
  a.click();

  // Cleanup
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  console.log('Journal exported as:', a.download);
});

// Load today's entry if it exists
function loadTodayEntry() {
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
  chrome.storage.local.get(['journal_entries'], function(result) {
    const entries = result.journal_entries || {};
    entries[currentDate] = text;

    chrome.storage.local.set({ journal_entries: entries }, function() {
      console.log('Journal entry saved for', currentDate);
      loadHistory(); // Refresh history to show updated preview
    });
  });
}

// Show saved message
function showSavedMessage() {
  savedMessage.classList.add('show');

  setTimeout(function() {
    savedMessage.classList.remove('show');
  }, 3000);
}

// Auto-save every 10 seconds
setInterval(function() {
  const text = textarea.value.trim();
  if (text) {
    saveJournalEntry(text);
  }
}, 10000);

// Toggle history visibility
toggleHistoryBtn.addEventListener('click', function() {
  if (historySection.style.display === 'none') {
    historySection.style.display = 'block';
    toggleHistoryBtn.textContent = 'Hide History';
    loadHistory(); // Refresh history when showing
  } else {
    historySection.style.display = 'none';
    toggleHistoryBtn.textContent = 'View History';
  }
});

// Load and display history
function loadHistory() {
  chrome.storage.local.get(['journal_entries'], function(result) {
    const entries = result.journal_entries || {};
    const dates = Object.keys(entries).sort().reverse(); // Most recent first

    if (dates.length === 0) {
      historyList.innerHTML = '<p class="history-empty">No past entries yet.</p>';
      return;
    }

    // Build history HTML
    historyList.innerHTML = dates.map(date => {
      const text = entries[date];
      const preview = text.substring(0, 80) + (text.length > 80 ? '...' : '');
      const isActive = date === currentDate ? 'active' : '';

      return `
        <div class="history-item ${isActive}" data-date="${date}">
          <div class="history-date">${formatDate(date)}</div>
          <div class="history-preview">${preview}</div>
        </div>
      `;
    }).join('');

    // Add click handlers to history items
    document.querySelectorAll('.history-item').forEach(item => {
      item.addEventListener('click', function() {
        const date = this.getAttribute('data-date');
        loadEntryByDate(date);
      });
    });
  });
}

// Load a specific entry by date
function loadEntryByDate(date) {
  chrome.storage.local.get(['journal_entries'], function(result) {
    const entries = result.journal_entries || {};

    if (entries[date]) {
      currentDate = date;
      textarea.value = entries[date];

      // Check if this is today's entry or a past entry
      const today = new Date().toISOString().split('T')[0];
      const isPastEntry = date !== today;

      // Set read-only state for past entries
      updateReadOnlyState(isPastEntry);

      // Update active state in history
      document.querySelectorAll('.history-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-date') === date) {
          item.classList.add('active');
        }
      });
    }
  });
}

// Update read-only state
function updateReadOnlyState(isReadOnly) {
  if (isReadOnly) {
    // Make textarea read-only
    textarea.setAttribute('readonly', 'readonly');
    textarea.style.background = '#f5f5f5';
    textarea.style.cursor = 'default';

    // Disable Save and Clear buttons
    saveBtn.disabled = true;
    saveBtn.style.opacity = '0.5';
    saveBtn.style.cursor = 'not-allowed';

    clearBtn.disabled = true;
    clearBtn.style.opacity = '0.5';
    clearBtn.style.cursor = 'not-allowed';

    // Show read-only message
    showReadOnlyMessage();
  } else {
    // Make textarea editable
    textarea.removeAttribute('readonly');
    textarea.style.background = '';
    textarea.style.cursor = '';

    // Enable Save and Clear buttons
    saveBtn.disabled = false;
    saveBtn.style.opacity = '';
    saveBtn.style.cursor = '';

    clearBtn.disabled = false;
    clearBtn.style.opacity = '';
    clearBtn.style.cursor = '';

    // Hide read-only message
    hideReadOnlyMessage();
  }
}

// Show read-only message
function showReadOnlyMessage() {
  // Create message if it doesn't exist
  let message = document.getElementById('readonly-message');
  if (!message) {
    message = document.createElement('div');
    message.id = 'readonly-message';
    message.className = 'journal-readonly-message';
    message.innerHTML = '’ <strong>Past Entry</strong> - This entry is read-only. Only today\'s entry can be edited.';
    textarea.parentNode.insertBefore(message, textarea);
  }
  message.style.display = 'block';
}

// Hide read-only message
function hideReadOnlyMessage() {
  const message = document.getElementById('readonly-message');
  if (message) {
    message.style.display = 'none';
  }
}

// Format date nicely
function formatDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00'); // Add time to avoid timezone issues
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

// Obsidian path management
function loadObsidianPath() {
  chrome.storage.local.get(['obsidian_vault_path'], function(result) {
    if (result.obsidian_vault_path) {
      // Show the reminder with the saved path
      obsidianPath.textContent = result.obsidian_vault_path;
      obsidianReminder.style.display = 'block';
      obsidianSetup.style.display = 'none';
    } else {
      // Show the setup input
      obsidianReminder.style.display = 'none';
      obsidianSetup.style.display = 'block';
    }
  });
}

// Save Obsidian path
savePathBtn.addEventListener('click', function() {
  const path = pathInput.value.trim();

  if (!path) {
    alert('Please enter a path to your Obsidian vault');
    return;
  }

  chrome.storage.local.set({ obsidian_vault_path: path }, function() {
    console.log('Obsidian path saved:', path);
    loadObsidianPath(); // Refresh display
  });
});

// Edit path button
editPathBtn.addEventListener('click', function() {
  chrome.storage.local.get(['obsidian_vault_path'], function(result) {
    pathInput.value = result.obsidian_vault_path || '';
    obsidianReminder.style.display = 'none';
    obsidianSetup.style.display = 'block';
    pathInput.focus();
  });
});
