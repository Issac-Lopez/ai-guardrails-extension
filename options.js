// ========================================
// AI GUARDRAILS - OPTIONS PAGE
// ========================================

// Category definitions (must match content.js)
const GUARDRAIL_CATEGORIES = {
  relationships: {
    id: 'relationships',
    name: 'Intimate Relationships',
    namePlural: 'relationship',
    icon: '💔',
    description: 'Dating, breakups, partner conflicts'
  },
  work: {
    id: 'work',
    name: 'Work Conflicts',
    namePlural: 'work',
    icon: '💼',
    description: 'Coworker venting, job decisions'
  },
  family: {
    id: 'family',
    name: 'Family Issues',
    namePlural: 'family',
    icon: '👨‍👩‍👧',
    description: 'Family conflicts, parenting decisions'
  },
  comingsoon: {
    id: 'comingsoon',
    name: 'More Categories Coming Soon!',
    namePlural: 'coming soon',
    icon: '💭',
    description: '',
    disabled: true
  },
};

const DEFAULT_ENABLED_CATEGORIES = ['relationships', 'work', 'family'];
const SETTINGS_KEY = 'guardrails_settings';
const STRIKES_KEY = 'guardrails_strikes';
const EVENT_LOG_KEY = 'guardrails_event_log';
const JOURNAL_ENTRIES_KEY = 'journal_entries';

// DOM Elements
const categoryList = document.getElementById('category-list');
const saveSettingsBtn = document.getElementById('save-settings');
const resetSettingsBtn = document.getElementById('reset-settings');
const exportDataBtn = document.getElementById('export-data');
const exportJournalBtn = document.getElementById('export-journal');
const clearDataBtn = document.getElementById('clear-data');
const feedbackBtn = document.getElementById('feedback-btn');
const successToast = document.getElementById('success-toast');
const totalInterventions = document.getElementById('total-interventions');
const journalUses = document.getElementById('journal-uses');
const blocksTriggered = document.getElementById('blocks-triggered');
const currentStreak = document.getElementById('current-streak');
const categoryBreakdown = document.getElementById('category-breakdown');
const timeBtns = document.querySelectorAll('.time-btn');

// Current settings state
let enabledCategories = [...DEFAULT_ENABLED_CATEGORIES];
let currentTimePeriod = 'week';

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', function() {
  loadSettings();
  renderCategories();
  loadDashboardStats();
  attachEventListeners();
});

// ========================================
// SETTINGS MANAGEMENT
// ========================================

// Load settings from storage
function loadSettings() {
  chrome.storage.local.get([SETTINGS_KEY], function(result) {
    if (result[SETTINGS_KEY] && result[SETTINGS_KEY].enabledCategories) {
      enabledCategories = result[SETTINGS_KEY].enabledCategories;
    } else {
      enabledCategories = [...DEFAULT_ENABLED_CATEGORIES];
    }
    renderCategories();
  });
}

// Save settings to storage
function saveSettings() {
  const settings = {
    enabledCategories: enabledCategories,
    lastUpdated: Date.now()
  };

  chrome.storage.local.set({ [SETTINGS_KEY]: settings }, function() {
    showToast('Settings saved successfully!');
  });
}

// Reset to default settings
function resetSettings() {
  if (confirm('Reset all settings to defaults?')) {
    enabledCategories = [...DEFAULT_ENABLED_CATEGORIES];
    saveSettings();
    renderCategories();
  }
}

// ========================================
// CATEGORY RENDERING
// ========================================

function renderCategories() {
  categoryList.innerHTML = '';

  Object.values(GUARDRAIL_CATEGORIES).forEach(category => {
    const isEnabled = enabledCategories.includes(category.id);
    const isDisabled = category.disabled || false;

    const categoryItem = document.createElement('div');
    categoryItem.className = 'category-item';
    if (isDisabled) {
      categoryItem.style.opacity = '0.5';
    }

    categoryItem.innerHTML = `
      <div class="category-info">
        <div class="category-icon">${category.icon}</div>
        <div class="category-details">
          <h3>${category.name}</h3>
          <p>${category.description}</p>
        </div>
      </div>
      <div class="toggle-switch ${isEnabled && !isDisabled ? 'active' : ''}" data-category="${category.id}" ${isDisabled ? 'style="opacity: 0.5; cursor: not-allowed;"' : ''}></div>
    `;

    categoryList.appendChild(categoryItem);

    // Add click handler for toggle
    if (!isDisabled) {
      const toggle = categoryItem.querySelector('.toggle-switch');
      toggle.addEventListener('click', function() {
        toggleCategory(category.id);
      });
    }
  });
}

function toggleCategory(categoryId) {
  const index = enabledCategories.indexOf(categoryId);

  if (index === -1) {
    // Enable category
    enabledCategories.push(categoryId);
  } else {
    // Disable category
    enabledCategories.splice(index, 1);
  }

  renderCategories();
}

// ========================================
// DASHBOARD STATS
// ========================================

function loadDashboardStats() {
  chrome.storage.local.get([EVENT_LOG_KEY, JOURNAL_ENTRIES_KEY], function(result) {
    const eventLog = result[EVENT_LOG_KEY] || [];
    const journalEntries = result[JOURNAL_ENTRIES_KEY] || {};

    // Calculate stats based on current time period and event log
    const stats = calculateStats(eventLog, journalEntries, currentTimePeriod);

    // Update UI
    totalInterventions.textContent = stats.totalInterventions;
    journalUses.textContent = stats.journalUses;
    blocksTriggered.textContent = stats.blocksTriggered;
    currentStreak.textContent = stats.streak;

    // Render category breakdown
    renderCategoryBreakdown(stats.categoryBreakdown);
  });
}

function calculateStats(eventLog, journalEntries, period) {
  const now = Date.now();
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // Filter events by time period
  let cutoffDate;
  if (period === 'week') {
    cutoffDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
  } else if (period === 'month') {
    cutoffDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
  } else {
    cutoffDate = new Date(0); // All time
  }

  const filteredEvents = eventLog.filter(event => event.timestamp >= cutoffDate.getTime());

  // Calculate total interventions
  const interventionEvents = filteredEvents.filter(e => e.event === 'intervention_triggered');
  const totalInterventions = interventionEvents.length;

  // Count alternative actions (journal, talk, wait)
  const alternativeEvents = filteredEvents.filter(e => e.event === 'alternative_chosen');
  const journalActions = alternativeEvents.filter(e => e.action === 'journal').length;
  const talkActions = alternativeEvents.filter(e => e.action === 'talk').length;
  const waitActions = alternativeEvents.filter(e => e.action === 'wait').length;

  // Count blocks triggered
  const blockEvents = filteredEvents.filter(e => e.event === 'block_active');
  const blocksTriggered = blockEvents.length;

  // Category breakdown
  const categoryBreakdown = {};
  interventionEvents.forEach(event => {
    const cat = event.category;
    categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1;
  });

  // Calculate streak (consecutive days without interventions)
  const streak = calculateStreak(eventLog);

  // Journal uses (actual entries saved)
  const journalUses = Object.keys(journalEntries).length;

  return {
    totalInterventions,
    journalUses,
    blocksTriggered,
    streak,
    categoryBreakdown,
    alternativeActions: {
      journal: journalActions,
      talk: talkActions,
      wait: waitActions
    }
  };
}

function calculateStreak(eventLog) {
  // Find days with interventions
  const daysWithInterventions = new Set();
  eventLog.forEach(event => {
    if (event.event === 'intervention_triggered') {
      daysWithInterventions.add(event.date);
    }
  });

  // Calculate consecutive days without interventions from today
  const today = new Date();
  let streak = 0;

  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);
    const dateStr = checkDate.toISOString().split('T')[0];

    if (daysWithInterventions.has(dateStr)) {
      break;
    }
    streak++;
  }

  return streak;
}

function renderCategoryBreakdown(breakdown) {
  if (Object.keys(breakdown).length === 0) {
    categoryBreakdown.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📊</div>
        <div class="empty-state-text">No interventions yet. Keep using AI mindfully!</div>
      </div>
    `;
    return;
  }

  categoryBreakdown.innerHTML = '';

  // Sort by count (highest first)
  const sortedCategories = Object.entries(breakdown)
    .sort((a, b) => b[1] - a[1]);

  sortedCategories.forEach(([categoryId, count]) => {
    const category = GUARDRAIL_CATEGORIES[categoryId];
    if (!category) return;

    const item = document.createElement('div');
    item.className = 'breakdown-item';
    item.innerHTML = `
      <div class="breakdown-category">
        <span>${category.icon}</span>
        <span>${category.name}</span>
      </div>
      <div class="breakdown-count">${count}</div>
    `;

    categoryBreakdown.appendChild(item);
  });
}

// ========================================
// EVENT LISTENERS
// ========================================

function attachEventListeners() {
  // Save settings button
  saveSettingsBtn.addEventListener('click', saveSettings);

  // Reset settings button
  resetSettingsBtn.addEventListener('click', resetSettings);

  // Feedback button
  // feedbackBtn.addEventListener('click', function() {
  //   const subject = encodeURIComponent('AI Guardrails Feedback');
  //   const body = encodeURIComponent('Hi! I have feedback about the AI Guardrails extension:\n\n');
  //   window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  // });

  // Export data button (JSON)
  exportDataBtn.addEventListener('click', function() {
    exportAllData();
  });

  // Export journal entries button (TXT)
  exportJournalBtn.addEventListener('click', function() {
    exportJournalEntries();
  });

  // Clear data button
  clearDataBtn.addEventListener('click', function() {
    if (confirm('Are you sure you want to clear ALL data? This will delete all strikes, blocks, and journal entries. This action cannot be undone.')) {
      if (confirm('This is permanent. Are you absolutely sure?')) {
        clearAllData();
      }
    }
  });

  // Time period selector
  timeBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      timeBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      currentTimePeriod = this.getAttribute('data-period');
      loadDashboardStats();
    });
  });
}

// ========================================
// DATA MANAGEMENT
// ========================================

function exportJournalEntries() {
  chrome.storage.local.get([JOURNAL_ENTRIES_KEY], function(result) {
    const entries = result[JOURNAL_ENTRIES_KEY] || {};
    const dates = Object.keys(entries).sort(); // Sort chronologically

    if (dates.length === 0) {
      showToast('No journal entries to export!');
      return;
    }

    // Build formatted text content
    let textContent = 'AI Guardrails - Journal Entries\n';
    textContent += `Exported: ${new Date().toLocaleString()}\n`;
    textContent += `Total Entries: ${dates.length}\n\n`;
    textContent += '='.repeat(60) + '\n\n';

    dates.forEach((date, index) => {
      const content = entries[date];

      textContent += `Entry: ${date}\n`;
      textContent += '='.repeat(60) + '\n\n';
      textContent += content + '\n\n';

      if (index < dates.length - 1) {
        textContent += '='.repeat(60) + '\n\n';
      }
    });

    // Download as text file
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `journal-entries-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast(`${dates.length} journal entries exported!`);
  });
}

function exportAllData() {
  chrome.storage.local.get(null, function(allData) {
    const journalEntries = allData[JOURNAL_ENTRIES_KEY] || {};

    // Create readable export
    const exportData = {
      exportDate: new Date().toISOString(),
      version: '0.1.0',
      settings: allData[SETTINGS_KEY] || {},
      eventLog: allData[EVENT_LOG_KEY] || [],
      strikes: allData[STRIKES_KEY] || {},
      journalEntries: journalEntries,
      journalEntryCount: Object.keys(journalEntries).length,
      note: 'This export contains your personal journal entries and anonymous usage data. Keep this file secure.'
    };

    // Download as JSON
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `guardrails-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Data exported successfully!');
  });
}

function clearAllData() {
  chrome.storage.local.clear(function() {
    showToast('All data cleared successfully!');

    // Reset to defaults
    enabledCategories = [...DEFAULT_ENABLED_CATEGORIES];
    saveSettings();

    // Reload UI
    renderCategories();
    loadDashboardStats();
  });
}

// ========================================
// UI HELPERS
// ========================================

function showToast(message) {
  successToast.textContent = '✓ ' + message;
  successToast.classList.add('show');

  setTimeout(() => {
    successToast.classList.remove('show');
  }, 3000);
}

// ========================================
// CONSTANTS
// ========================================

// const JOURNAL_ENTRIES_KEY = 'journal_entries';
