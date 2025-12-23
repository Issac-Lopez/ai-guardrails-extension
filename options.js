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

// DOM Elements
const categoryList = document.getElementById('category-list');
const saveSettingsBtn = document.getElementById('save-settings');
const resetSettingsBtn = document.getElementById('reset-settings');
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
  chrome.storage.local.get([STRIKES_KEY, 'journal_entries'], function(result) {
    const strikes = result[STRIKES_KEY] || {};
    const journalEntries = result[JOURNAL_ENTRIES_KEY] || {};

    // Calculate stats based on current time period
    const stats = calculateStats(strikes, journalEntries, currentTimePeriod);

    // Update UI
    totalInterventions.textContent = stats.totalInterventions;
    journalUses.textContent = stats.journalUses;
    blocksTriggered.textContent = stats.blocksTriggered;
    currentStreak.textContent = stats.streak;

    // Render category breakdown
    renderCategoryBreakdown(stats.categoryBreakdown);
  });
}

function calculateStats(strikes, journalEntries, period) {
  // For MVP, we'll use simple strike counting
  // In the future, we can track more detailed intervention logs

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // Calculate total interventions from strikes
  let totalInterventions = 0;
  const categoryBreakdown = {};

  Object.keys(GUARDRAIL_CATEGORIES).forEach(categoryId => {
    const count = strikes[categoryId] || 0;
    totalInterventions += count;
    if (count > 0) {
      categoryBreakdown[categoryId] = count;
    }
  });

  // Count journal entries
  const journalCount = Object.keys(journalEntries).length;

  // Count blocks triggered (strike 3s)
  // For now, we'll estimate this as total / 3 (rough approximation)
  const blocksTriggered = Math.floor(totalInterventions / 3);

  // Calculate streak (days without interventions)
  // For MVP, this is simplified - just check if today has strikes
  const streak = (strikes[todayStr] && Object.keys(strikes).length > 1) ? 0 : 1;

  return {
    totalInterventions,
    journalUses: journalCount,
    blocksTriggered,
    streak,
    categoryBreakdown
  };
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

const JOURNAL_ENTRIES_KEY = 'journal_entries';
