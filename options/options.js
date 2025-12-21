// AI Guardrails - Options Page
// Manages settings, journal history, and data export/import

console.log('AI Guardrails: Options page loaded');

// Guardrail categories configuration (copied from categories.js for options page)
const guardrailCategories = {
  relationships: {
    name: "Intimate Relationships",
    strikeKey: "relationships"
  },
  work: {
    name: "Work Conflicts",
    strikeKey: "work"
  }
};

// DOM Elements
const strikesStats = document.getElementById('strikes-stats');
const guardrailsList = document.getElementById('guardrails-list');
const journalList = document.getElementById('journal-list');
const resetStrikesBtn = document.getElementById('reset-strikes');
const exportAllJournalsBtn = document.getElementById('export-all-journals');
const exportAllDataBtn = document.getElementById('export-all-data');
const clearAllDataBtn = document.getElementById('clear-all-data');
const successMessage = document.getElementById('success-message');
const errorMessage = document.getElementById('error-message');

// Initialize page
init();

function init() {
  loadStrikesStats();
  loadGuardrailToggles();
  loadJournalHistory();
  attachEventListeners();
}

// Load and display strike statistics
function loadStrikesStats() {
  chrome.storage.local.get(['guardrails_strikes'], function(result) {
    const strikes = result.guardrails_strikes || {};

    let statsHTML = '';
    for (const [categoryId, category] of Object.entries(guardrailCategories)) {
      const strikeCount = strikes[category.strikeKey] || 0;
      statsHTML += `
        <div class="stat-card">
          <div class="stat-value">${strikeCount}</div>
          <div class="stat-label">${category.name}</div>
        </div>
      `;
    }

    strikesStats.innerHTML = statsHTML;
  });
}

// Load guardrail toggle switches
function loadGuardrailToggles() {
  chrome.storage.local.get(['guardrails_enabled'], function(result) {
    const enabled = result.guardrails_enabled || {};

    let togglesHTML = '';
    for (const [categoryId, category] of Object.entries(guardrailCategories)) {
      const isEnabled = enabled[categoryId] !== false; // Default to enabled
      togglesHTML += `
        <div class="guardrail-item">
          <div class="guardrail-info">
            <div class="guardrail-name">${category.name}</div>
            <div class="guardrail-status">${isEnabled ? 'Active' : 'Disabled'}</div>
          </div>
          <div class="toggle-switch ${isEnabled ? 'active' : ''}" data-category="${categoryId}"></div>
        </div>
      `;
    }

    guardrailsList.innerHTML = togglesHTML;

    // Attach toggle listeners
    document.querySelectorAll('.toggle-switch').forEach(toggle => {
      toggle.addEventListener('click', function() {
        const categoryId = this.getAttribute('data-category');
        toggleGuardrail(categoryId, this);
      });
    });
  });
}

// Toggle guardrail category on/off
function toggleGuardrail(categoryId, element) {
  chrome.storage.local.get(['guardrails_enabled'], function(result) {
    const enabled = result.guardrails_enabled || {};
    enabled[categoryId] = !element.classList.contains('active');

    chrome.storage.local.set({ guardrails_enabled: enabled }, function() {
      element.classList.toggle('active');
      const statusText = element.previousElementSibling.querySelector('.guardrail-status');
      statusText.textContent = element.classList.contains('active') ? 'Active' : 'Disabled';
      showSuccess(`${guardrailCategories[categoryId].name} ${enabled[categoryId] ? 'enabled' : 'disabled'}`);
    });
  });
}

// Load and display journal entries
function loadJournalHistory() {
  chrome.storage.local.get(['journal_entries'], function(result) {
    const entries = result.journal_entries || {};
    const dates = Object.keys(entries).sort().reverse(); // Most recent first

    if (dates.length === 0) {
      journalList.innerHTML = '<div class="journal-empty">No journal entries yet</div>';
      return;
    }

    let journalsHTML = '';
    dates.forEach(date => {
      const text = entries[date];
      const preview = text.substring(0, 100) + (text.length > 100 ? '...' : '');

      journalsHTML += `
        <div class="journal-item" data-date="${date}">
          <div class="journal-date">${formatDate(date)}</div>
          <div class="journal-preview">${preview}</div>
          <div class="journal-actions">
            <button class="btn btn-small btn-secondary view-journal" data-date="${date}">View</button>
            <button class="btn btn-small btn-secondary export-journal" data-date="${date}">Export</button>
            <button class="btn btn-small btn-danger delete-journal" data-date="${date}">Delete</button>
          </div>
        </div>
      `;
    });

    journalList.innerHTML = journalsHTML;

    // Attach button listeners
    document.querySelectorAll('.view-journal').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        viewJournal(this.getAttribute('data-date'));
      });
    });

    document.querySelectorAll('.export-journal').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        exportJournal(this.getAttribute('data-date'));
      });
    });

    document.querySelectorAll('.delete-journal').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        deleteJournal(this.getAttribute('data-date'));
      });
    });
  });
}

// View journal entry
function viewJournal(date) {
  chrome.storage.local.get(['journal_entries'], function(result) {
    const entries = result.journal_entries || {};
    const text = entries[date];

    if (text) {
      alert(`Journal Entry - ${date}\n\n${text}`);
    }
  });
}

// Export single journal entry
function exportJournal(date) {
  chrome.storage.local.get(['journal_entries'], function(result) {
    const entries = result.journal_entries || {};
    const text = entries[date];

    if (text) {
      const content = `# Journal Entry - ${date}\n\n${text}\n`;
      downloadFile(`journal-${date}.txt`, content);
      showSuccess(`Journal entry exported: ${date}`);
    }
  });
}

// Delete journal entry
function deleteJournal(date) {
  if (confirm(`Are you sure you want to delete the journal entry from ${date}?`)) {
    chrome.storage.local.get(['journal_entries'], function(result) {
      const entries = result.journal_entries || {};
      delete entries[date];

      chrome.storage.local.set({ journal_entries: entries }, function() {
        showSuccess(`Journal entry deleted: ${date}`);
        loadJournalHistory(); // Refresh list
      });
    });
  }
}

// Export all journals
function exportAllJournals() {
  chrome.storage.local.get(['journal_entries'], function(result) {
    const entries = result.journal_entries || {};
    const dates = Object.keys(entries).sort();

    if (dates.length === 0) {
      showError('No journal entries to export');
      return;
    }

    let content = '# AI Guardrails - All Journal Entries\n\n';
    dates.forEach(date => {
      content += `## ${date}\n\n${entries[date]}\n\n---\n\n`;
    });

    const timestamp = new Date().toISOString().split('T')[0];
    downloadFile(`all-journals-${timestamp}.txt`, content);
    showSuccess(`Exported ${dates.length} journal entries`);
  });
}

// Reset all strikes
function resetStrikes() {
  if (confirm('Are you sure you want to reset all strike counts?')) {
    const today = new Date().toISOString().split('T')[0];
    const resetData = { date: today, relationships: 0, work: 0 };

    chrome.storage.local.set({ guardrails_strikes: resetData }, function() {
      showSuccess('All strikes reset to 0');
      loadStrikesStats(); // Refresh stats
    });
  }
}

// Export all data
function exportAllData() {
  chrome.storage.local.get(null, function(allData) {
    const dataStr = JSON.stringify(allData, null, 2);
    const timestamp = new Date().toISOString().split('T')[0];
    downloadFile(`ai-guardrails-data-${timestamp}.json`, dataStr);
    showSuccess('All data exported as JSON');
  });
}

// Clear all data
function clearAllData() {
  if (confirm('⚠️ WARNING: This will permanently delete ALL your data including journal entries, strikes, and settings. This cannot be undone. Are you absolutely sure?')) {
    if (confirm('Final confirmation: Delete everything?')) {
      chrome.storage.local.clear(function() {
        showSuccess('All data cleared');
        // Refresh displays
        loadStrikesStats();
        loadGuardrailToggles();
        loadJournalHistory();
      });
    }
  }
}

// Helper: Download file
function downloadFile(filename, content) {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Helper: Format date
function formatDate(dateStr) {
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

// Helper: Show success message
function showSuccess(message) {
  successMessage.textContent = message;
  successMessage.classList.add('show');
  setTimeout(() => {
    successMessage.classList.remove('show');
  }, 3000);
}

// Helper: Show error message
function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.add('show');
  setTimeout(() => {
    errorMessage.classList.remove('show');
  }, 3000);
}

// Attach event listeners
function attachEventListeners() {
  resetStrikesBtn.addEventListener('click', resetStrikes);
  exportAllJournalsBtn.addEventListener('click', exportAllJournals);
  exportAllDataBtn.addEventListener('click', exportAllData);
  clearAllDataBtn.addEventListener('click', clearAllData);
}
