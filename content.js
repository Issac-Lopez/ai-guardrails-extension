// ========================================
// AI GUARDRAILS - CONTENT SCRIPT
// ========================================
// This script runs on chat.openai.com and chatgpt.com
// Intercepts messages containing sensitive keywords and provides
// alternatives to using AI for emotional support

console.log('AI Guardrails extension loaded!');

// ========================================
// PLATFORM DETECTION
// ========================================

function detectPlatform() {
  const hostname = window.location.hostname;
  if (hostname.includes('openai.com') || hostname.includes('chatgpt.com')) {
    return 'chatgpt';
  }
  return 'unknown';
}

const PLATFORM = detectPlatform();
console.log('Detected platform:', PLATFORM);

// ========================================
// CONFIGURATION - GUARDRAIL CATEGORIES
// ========================================

const GUARDRAIL_CATEGORIES = {
  relationships: {
    id: 'relationships',
    name: 'Relationship',
    namePlural: 'relationship',
    icon: '💔',
    keywords: [
      // Direct relationship terms
      'girlfriend', 'boyfriend', 'partner', 'wife', 'husband', 'spouse',
      'dating', 'relationship', 'breakup', 'break up', 'breaking up',
      'divorce', 'married', 'marriage', 'engaged', 'engagement',

      // Emotional relationship phrases
      'should i break up', 'should i leave', 'is it time to',
      'thinking about breaking', 'thinking of leaving',
      'my ex', 'my gf', 'my bf',

      // Conflict terms
      'fighting with my', 'argue with my', 'mad at my',
      'she said', 'he said', 'they said'
    ],
    strikeKey: 'relationships',
    blockKey: 'relationship_block_until',
    messages: {
      strike1: {
        title: 'Relationship Check-In',
        text: `
          It looks like you're discussing relationship issues.
          <br><br>
          <strong>Consider these alternatives:</strong>
        `
      },
      strike2: {
        title: 'Second Warning',
        text: `
          You've triggered this guardrail <strong>2 times today</strong>.
          <br><br>
          This might be a sign you need to talk to someone real, not AI.
          <br><br>
          <strong>Try one of these instead:</strong>
        `
      },
      strike3: {
        title: 'Daily Limit Reached',
        text: `
          You've reached your limit for relationship discussions today.
          <br><br>
          <strong>This conversation is blocked for 24 hours.</strong>
          <br><br>
          Instead of using AI, try one of these:
        `
      },
      blocked: {
        title: 'Still Waiting...',
        text: 'Relationship discussions are blocked for another <strong>{hours} hour(s)</strong>.<br><br>Use this time to talk to someone real.'
      },
      wait24: {
        title: 'See You Tomorrow',
        text: 'Relationship discussions are now blocked for 24 hours.'
      }
    }
  },

  work: {
    id: 'work',
    name: 'Work',
    namePlural: 'work',
    icon: '💼',
    keywords: [
      // Direct work terms
      'my boss', 'my manager', 'my coworker', 'my colleague',
      'at work', 'my job', 'my workplace', 'my company',

      // Work conflict terms
      'quit my job', 'quitting my job', 'should i quit',
      'hate my job', 'toxic workplace', 'bad manager',
      'work drama', 'office politics',

      // Work venting
      'my boss is', 'my manager is', 'coworker is',
      'fired', 'getting fired', 'layoff', 'laid off'
    ],
    strikeKey: 'work',
    blockKey: 'work_block_until',
    messages: {
      strike1: {
        title: 'Work Conflict Check-In',
        text: `
          It looks like you're venting about work issues.
          <br><br>
          <strong>Consider these alternatives:</strong>
        `
      },
      strike2: {
        title: 'Second Warning',
        text: `
          You've triggered this guardrail <strong>2 times today</strong>.
          <br><br>
          Work stress is real - consider talking to someone who can actually help.
          <br><br>
          <strong>Try one of these instead:</strong>
        `
      },
      strike3: {
        title: 'Daily Limit Reached',
        text: `
          You've reached your limit for work discussions today.
          <br><br>
          <strong>This conversation is blocked for 24 hours.</strong>
          <br><br>
          Instead of using AI, try one of these:
        `
      },
      blocked: {
        title: 'Still Waiting...',
        text: 'Work discussions are blocked for another <strong>{hours} hour(s)</strong>.<br><br>Use this time to talk to someone who can help.'
      },
      wait24: {
        title: 'See You Tomorrow',
        text: 'Work discussions are now blocked for 24 hours.'
      }
    }
  },

  family: {
    id: 'family',
    name: 'Family',
    namePlural: 'family',
    icon: '👨‍👩‍👧',
    keywords: [
      // Direct family terms
      'my mom', 'my dad', 'my mother', 'my father',
      'my parents', 'my sibling', 'my brother', 'my sister',
      'my son', 'my daughter', 'my child', 'my kids',

      // Family conflict terms
      'family drama', 'family conflict', 'toxic family',
      'argue with my mom', 'argue with my dad',
      'fighting with my parents', 'family issues',

      // Parenting terms
      'parenting', 'raising kids', 'my teenager',
      'grounded my', 'punish my child'
    ],
    strikeKey: 'family',
    blockKey: 'family_block_until',
    messages: {
      strike1: {
        title: 'Family Issues Check-In',
        text: `
          It looks like you're discussing family conflicts.
          <br><br>
          <strong>Consider these alternatives:</strong>
        `
      },
      strike2: {
        title: 'Second Warning',
        text: `
          You've triggered this guardrail <strong>2 times today</strong>.
          <br><br>
          Family issues are complex - consider talking to someone who knows your situation.
          <br><br>
          <strong>Try one of these instead:</strong>
        `
      },
      strike3: {
        title: 'Daily Limit Reached',
        text: `
          You've reached your limit for family discussions today.
          <br><br>
          <strong>This conversation is blocked for 24 hours.</strong>
          <br><br>
          Instead of using AI, try one of these:
        `
      },
      blocked: {
        title: 'Still Waiting...',
        text: 'Family discussions are blocked for another <strong>{hours} hour(s)</strong>.<br><br>Use this time to reach out to someone real.'
      },
      wait24: {
        title: 'See You Tomorrow',
        text: 'Family discussions are now blocked for 24 hours.'
      }
    }
  }
};

// Default categories (if user hasn't configured yet)
const DEFAULT_ENABLED_CATEGORIES = ['relationships', 'work', 'family'];
const SETTINGS_KEY = 'guardrails_settings';

// Get enabled categories from storage
async function getEnabledCategories() {
  return new Promise((resolve) => {
    chrome.storage.local.get([SETTINGS_KEY], function(result) {
      if (result[SETTINGS_KEY] && result[SETTINGS_KEY].enabledCategories) {
        resolve(result[SETTINGS_KEY].enabledCategories);
      } else {
        resolve(DEFAULT_ENABLED_CATEGORIES);
      }
    });
  });
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

// Get today's date string (for daily strike reset)
function getTodayDateString() {
  const today = new Date();
  return today.toISOString().split('T')[0]; // Returns YYYY-MM-DD
}

// Get the current message from the textarea (works across platforms)
function getCurrentMessage() {
  const selectors = [
    'div[contenteditable="true"]',  // ChatGPT
    'textarea[placeholder*="Message"]',  // Fallback
    'textarea',  // Generic textarea
    '.ProseMirror'  // ProseMirror editor
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      const text = element.textContent || element.innerText || element.value || '';
      if (text.trim()) {
        return text;
      }
      return text;
    }
  }

  return '';
}

// ========================================
// STRIKE MANAGEMENT
// ========================================

const STRIKE_STORAGE_KEY = 'guardrails_strikes';
const EVENT_LOG_KEY = 'guardrails_event_log';

// Toast notification constants
const TOAST_KEYWORD_COUNT_KEY = 'toast_keyword_count';
const TOAST_LAST_RESET_KEY = 'toast_last_reset_date';
const TOAST_SHOWN_AT_KEY = 'toast_shown_at';
const TOAST_CATEGORY_TRIGGERS_KEY = 'toast_category_triggers';
const MODAL_SYSTEM_ENABLED_KEY = 'modal_system_enabled';
const TOAST_THRESHOLDS = [1, 3, 6, 9, 12];

// ========================================
// EVENT LOGGING
// ========================================

// Log an event for analytics (local only, no personal data)
async function logEvent(eventType, data = {}) {
  return new Promise((resolve) => {
    chrome.storage.local.get([EVENT_LOG_KEY], function(result) {
      const log = result[EVENT_LOG_KEY] || [];

      // Create event entry (no emojis, no message content)
      const event = {
        timestamp: Date.now(),
        date: new Date().toISOString().split('T')[0],
        event: eventType,
        platform: PLATFORM,
        ...data
      };

      log.push(event);

      // Keep last 1000 events max to avoid storage bloat
      if (log.length > 1000) {
        log.shift();
      }

      chrome.storage.local.set({ [EVENT_LOG_KEY]: log }, function() {
        console.log('Event logged:', eventType, data);
        resolve();
      });
    });
  });
}

// ========================================
// TOAST NOTIFICATION SYSTEM
// ========================================

// Check if modal system is enabled (default: true)
async function isModalSystemEnabled() {
  return new Promise((resolve) => {
    chrome.storage.local.get([MODAL_SYSTEM_ENABLED_KEY], function(result) {
      resolve(result[MODAL_SYSTEM_ENABLED_KEY] === true);
    });
  });
}

// Get toast state from storage (with daily reset)
async function getToastState() {
  return new Promise((resolve) => {
    chrome.storage.local.get(
      [TOAST_KEYWORD_COUNT_KEY, TOAST_LAST_RESET_KEY, TOAST_SHOWN_AT_KEY, TOAST_CATEGORY_TRIGGERS_KEY],
      function(result) {
        const today = getTodayDateString();
        const lastReset = result[TOAST_LAST_RESET_KEY];

        if (lastReset !== today) {
          // New day - reset counter
          resolve({
            count: 0,
            lastReset: today,
            shownAt: [],
            categories: {}
          });
        } else {
          resolve({
            count: result[TOAST_KEYWORD_COUNT_KEY] || 0,
            lastReset: today,
            shownAt: result[TOAST_SHOWN_AT_KEY] || [],
            categories: result[TOAST_CATEGORY_TRIGGERS_KEY] || {}
          });
        }
      }
    );
  });
}

// Save toast state to storage
async function saveToastState(state) {
  return new Promise((resolve) => {
    chrome.storage.local.set({
      [TOAST_KEYWORD_COUNT_KEY]: state.count,
      [TOAST_LAST_RESET_KEY]: state.lastReset,
      [TOAST_SHOWN_AT_KEY]: state.shownAt,
      [TOAST_CATEGORY_TRIGGERS_KEY]: state.categories
    }, resolve);
  });
}

// Handle toast notification logic (increment count, check thresholds, show if needed)
async function handleToastNotification(categoryId) {
  try {
    const state = await getToastState();

    // Increment count and track category
    state.count += 1;
    state.categories[categoryId] = (state.categories[categoryId] || 0) + 1;

    // Check if we've hit a threshold that hasn't been shown yet
    const threshold = TOAST_THRESHOLDS.find(function(t) {
      return t === state.count && state.shownAt.indexOf(t) === -1;
    });

    if (threshold) {
      // Mark threshold as shown
      state.shownAt.push(threshold);

      // Show toast notification
      showToastNotification(categoryId);

      // Log toast event
      await logEvent('toast_shown', {
        threshold: threshold,
        category: categoryId,
        total_count: state.count
      });
    }

    // Save updated state
    await saveToastState(state);

    // Show persistent journal button once any toast has been shown
    if (state.shownAt.length > 0) {
      showPersistentJournalButton(categoryId);
    }
  } catch (error) {
    console.error('Error handling toast notification:', error);
    // Fail gracefully - don't break chat interface
  }
}

// Track last detected category for the persistent journal button
let lastDetectedCategoryId = null;

// Show a small journal button next to the send button
function showPersistentJournalButton(categoryId) {
  lastDetectedCategoryId = categoryId;

  // Don't add if already exists
  if (document.querySelector('.guardrails-journal-btn')) return;

  // Find the send button's parent container
  const sendButton = document.querySelector('button[data-testid="send-button"]');
  if (!sendButton) return;

  const container = sendButton.parentElement;
  if (!container) return;

  const journalBtn = document.createElement('button');
  journalBtn.className = 'guardrails-journal-btn';
  journalBtn.setAttribute('aria-label', 'Open journal');
  journalBtn.setAttribute('title', 'Write it out');
  journalBtn.textContent = '\u{1F4DD}';

  journalBtn.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    const catId = lastDetectedCategoryId || 'relationships';
    const category = GUARDRAIL_CATEGORIES[catId];
    if (category) {
      openJournalPage('', category);
    }
  });

  // Insert before the send button
  container.insertBefore(journalBtn, sendButton);
}

// Show the passive toast notification
function showToastNotification(categoryId) {
  // Remove any existing toast
  const existingToast = document.querySelector('.guardrails-toast');
  if (existingToast) existingToast.remove();

  const toast = document.createElement('div');
  toast.className = 'guardrails-toast';
  toast.innerHTML = `
    <button class="guardrails-toast-close">&times;</button>
    <div class="guardrails-toast-text">Consider journaling?</div>
    <button class="guardrails-toast-action">Write it out</button>
  `;

  document.body.appendChild(toast);

  // Reposition toast above composer (or above promo banner if present)
  function repositionToast() {
    var composerSurface = document.querySelector('[data-composer-surface="true"]');
    if (!composerSurface) return;

    // Banner is a sibling of the form, not inside it
    var promoBanner = document.querySelector('#thread-bottom-container .bottom-full aside');
    var anchorEl = promoBanner || composerSurface;
    var anchorRect = anchorEl.getBoundingClientRect();
    var composerRect = composerSurface.getBoundingClientRect();
    var toastWidth = toast.offsetWidth;

    toast.style.bottom = 'auto';
    toast.style.right = 'auto';
    toast.style.width = composerRect.width + 'px';
    toast.style.top = (anchorRect.top - toast.offsetHeight - 8) + 'px';
    toast.style.left = composerRect.left + 'px';
  }

  // Poll to handle page transitions and dynamic elements (promo banner)
  var repositionInterval = setInterval(function() {
    if (!toast.parentNode) {
      clearInterval(repositionInterval);
      return;
    }
    repositionToast();
  }, 200);

  // Delay fade-in to let ChatGPT's page transition settle
  setTimeout(function() {
    if (!toast.parentNode) return;
    repositionToast();
    requestAnimationFrame(function() {
      toast.classList.add('guardrails-toast-visible');
    });
  }, 600);

  // Close button
  toast.querySelector('.guardrails-toast-close').addEventListener('click', function() {
    toast.classList.remove('guardrails-toast-visible');
    setTimeout(function() { if (toast.parentNode) toast.remove(); }, 300);
  });

  // "Write it out" button - opens journal with category
  toast.querySelector('.guardrails-toast-action').addEventListener('click', function() {
    const category = GUARDRAIL_CATEGORIES[categoryId];
    if (category) {
      openJournalPage('', category);
    }
    toast.classList.remove('guardrails-toast-visible');
    setTimeout(function() { if (toast.parentNode) toast.remove(); }, 300);
  });

}

// ========================================
// STRIKE MANAGEMENT
// ========================================

// Get all strikes from storage
async function getStrikes() {
  return new Promise((resolve) => {
    chrome.storage.local.get([STRIKE_STORAGE_KEY], function(result) {
      const data = result[STRIKE_STORAGE_KEY] || {};
      const today = getTodayDateString();

      // Reset strikes if it's a new day
      if (data.date !== today) {
        console.log('New day detected, resetting strikes');
        const resetData = { date: today };
        // Initialize all categories to 0
        Object.keys(GUARDRAIL_CATEGORIES).forEach(categoryId => {
          resetData[categoryId] = 0;
        });
        resolve(resetData);
      } else {
        resolve(data);
      }
    });
  });
}

// Save strikes to storage
async function saveStrikes(strikes) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [STRIKE_STORAGE_KEY]: strikes }, function() {
      console.log('Strikes saved:', strikes);
      resolve();
    });
  });
}

// Increment strike count for a category
async function incrementStrike(categoryId) {
  const strikes = await getStrikes();
  strikes[categoryId] = (strikes[categoryId] || 0) + 1;
  strikes.date = getTodayDateString();
  await saveStrikes(strikes);
  return strikes[categoryId];
}

// ========================================
// KEYWORD DETECTION
// ========================================

// Check if message contains keywords from a specific category
function containsCategoryKeywords(message, category) {
  const lowerMessage = message.toLowerCase();

  for (let keyword of category.keywords) {
    if (lowerMessage.includes(keyword.toLowerCase())) {
      console.log(`Detected ${category.id} keyword:`, keyword);
      return true;
    }
  }

  return false;
}

// Detect which category (if any) the message triggers
// Returns the first matched category or null
function detectTriggeredCategory(message, enabledCategories) {
  for (const categoryId of enabledCategories) {
    const category = GUARDRAIL_CATEGORIES[categoryId];
    if (containsCategoryKeywords(message, category)) {
      return category;
    }
  }
  return null;
}

// ========================================
// MODAL GENERATION
// ========================================

// Create and show the warning modal for a specific category
function showWarningModal(message, category, strikeLevel) {
  console.log('📋 Showing modal for category:', category.id, 'strike:', strikeLevel);

  const overlay = document.createElement('div');
  overlay.className = 'guardrails-modal-overlay';

  // Get messages for this category and strike level
  let messageConfig, showContinue, delaySeconds;

  if (strikeLevel === 1) {
    messageConfig = category.messages.strike1;
    showContinue = true;
    delaySeconds = 5;
  } else if (strikeLevel === 2) {
    messageConfig = category.messages.strike2;
    showContinue = true;
    delaySeconds = 10;
  } else {
    messageConfig = category.messages.strike3;
    showContinue = false;
    delaySeconds = 0;
  }

  // Alternative actions HTML
  let alternativeActionsHTML = '';

  if (strikeLevel === 1 || strikeLevel === 2) {
    alternativeActionsHTML = `
    <div class="guardrails-alternatives">
      <button class="guardrails-alt-btn" id="guardrails-journal">
        📝 Journal Instead
      </button>
      <button class="guardrails-alt-btn" id="guardrails-talk">
        💬 Talk to Someone
      </button>
      <button class="guardrails-alt-btn" id="guardrails-wait">
        ⏰ Wait 24 Hours
      </button>
    </div>
    <div class="guardrails-divider">or</div>
  `;
  } else {
    alternativeActionsHTML = `
    <div class="guardrails-alternatives">
      <button class="guardrails-alt-btn" id="guardrails-journal">
        📝 Journal Instead
      </button>
      <button class="guardrails-alt-btn" id="guardrails-talk">
        💬 Talk to Someone
      </button>
    </div>
  `;
  }

  // Create modal content
  overlay.innerHTML = `
    <div class="guardrails-modal">
      <div class="guardrails-modal-header">
        <span class="guardrails-modal-icon">${category.icon}</span>
        <h2 class="guardrails-modal-title">${messageConfig.title}</h2>
      </div>
      <div class="guardrails-modal-message">
        ${messageConfig.text}
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

  document.body.appendChild(overlay);

  let timer;

  // Handle continue button (if it exists)
  if (showContinue) {
    const continueBtn = overlay.querySelector('#guardrails-continue');
    let countdown = delaySeconds;

    continueBtn.disabled = true;
    continueBtn.textContent = `Continue anyway (${countdown}s)`;

    timer = setInterval(function() {
      countdown--;

      if (countdown > 0) {
        continueBtn.textContent = `Continue anyway (${countdown}s)`;
      } else {
        clearInterval(timer);
        continueBtn.disabled = false;
        continueBtn.textContent = 'Continue anyway';
      }
    }, 1000);

    continueBtn.addEventListener('click', async function() {
      if (timer) clearInterval(timer);

      // Log override
      await logEvent('continue_anyway', {
        category: category.id,
        strike: strikeLevel
      });

      // Mark this message as allowed to bypass the guardrail
      setBypassedMessage(message);

      overlay.remove();

      // Programmatically trigger the send button click
      // The message is already in the textarea, and we've marked it as bypassed
      setTimeout(() => {
        const sendButton = document.querySelector('button[data-testid="send-button"]');
        if (sendButton) {
          console.log('🔄 Auto-clicking send button after continue...');
          isManualSend = true;
          sendButton.click();
        }
      }, 100); // Small delay to let modal close
    });
  }

  // Handle cancel/close button
  const cancelBtn = overlay.querySelector('#guardrails-cancel');
  cancelBtn.addEventListener('click', function() {
    if (timer) clearInterval(timer);
    overlay.remove();
  });

  // Handle alternative action buttons
  if (strikeLevel >= 1) {
    // Journal Instead button
    const journalBtn = overlay.querySelector('#guardrails-journal');
    if (journalBtn) {
      journalBtn.addEventListener('click', async function() {
        if (timer) clearInterval(timer);

        // Log alternative chosen
        await logEvent('alternative_chosen', {
          category: category.id,
          action: 'journal',
          strike: strikeLevel
        });

        overlay.remove();
        openJournalPage(message, category);
      });
    }

    // Talk to Someone button
    const talkBtn = overlay.querySelector('#guardrails-talk');
    if (talkBtn) {
      talkBtn.addEventListener('click', async function() {
        if (timer) clearInterval(timer);

        // Log alternative chosen
        await logEvent('alternative_chosen', {
          category: category.id,
          action: 'talk',
          strike: strikeLevel
        });

        overlay.remove();
        showTalkToSomeoneMessage();
      });
    }

    // Wait 24 Hours button (only for Strike 1 & 2)
    const waitBtn = overlay.querySelector('#guardrails-wait');
    if (waitBtn) {
      waitBtn.addEventListener('click', async function() {
        if (timer) clearInterval(timer);

        // Log alternative chosen
        await logEvent('alternative_chosen', {
          category: category.id,
          action: 'wait',
          strike: strikeLevel
        });

        overlay.remove();
        setWait24Hours(category);
      });
    }
  }
}

// Show blocked message (when 24-hour block is active)
function showBlockedMessage(category, blockUntil) {
  const hoursLeft = Math.ceil((blockUntil - Date.now()) / (1000 * 60 * 60));
  const messageText = category.messages.blocked.text.replace('{hours}', hoursLeft);

  const overlay = document.createElement('div');
  overlay.className = 'guardrails-modal-overlay';
  overlay.innerHTML = `
    <div class="guardrails-modal">
      <div class="guardrails-modal-header">
        <span class="guardrails-modal-icon">${category.icon}</span>
        <h2 class="guardrails-modal-title">${category.messages.blocked.title}</h2>
      </div>
      <div class="guardrails-modal-message">
        ${messageText}
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
  closeBtn.addEventListener('click', function() {
    overlay.remove();
  });
}

// ========================================
// ALTERNATIVE ACTIONS
// ========================================

// Open journal page in new tab
function openJournalPage(message, category) {
  console.log('Opening journal page for category:', category.id);
  const journalUrl = chrome.runtime.getURL('journal.html') + '?category=' + category.id;
  window.open(journalUrl, '_blank');
}

// Show "Talk to Someone" encouragement message
function showTalkToSomeoneMessage() {
  console.log('User chose to talk to someone');

  const overlay = document.createElement('div');
  overlay.className = 'guardrails-modal-overlay';
  overlay.innerHTML = `
    <div class="guardrails-modal">
      <div class="guardrails-modal-header">
        <span class="guardrails-modal-icon">💬</span>
        <h2 class="guardrails-modal-title">Great Choice!</h2>
      </div>
      <div class="guardrails-modal-message">
        Talking to a real person is often the best way to process difficult emotions.
        <br><br>
        <strong>Consider reaching out to:</strong>
        <ul style="margin-top: 12px; padding-left: 20px;">
          <li>A trusted friend</li>
          <li>Your partner or family member</li>
          <li>A therapist or counselor</li>
          <li>A mentor or advisor</li>
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

  const closeBtn = overlay.querySelector('#talk-close');
  closeBtn.addEventListener('click', function() {
    overlay.remove();
  });
}

// Set 24-hour block for a specific category
async function setWait24Hours(category) {
  console.log(`⏰ Setting 24-hour wait for ${category.id}...`);

  const blockUntil = Date.now() + (24 * 60 * 60 * 1000); // 24 hours from now

  await chrome.storage.local.set({
    [category.blockKey]: blockUntil
  });

  // Show confirmation
  const overlay = document.createElement('div');
  overlay.className = 'guardrails-modal-overlay';
  overlay.innerHTML = `
    <div class="guardrails-modal">
      <div class="guardrails-modal-header">
        <span class="guardrails-modal-icon">${category.icon}</span>
        <h2 class="guardrails-modal-title">${category.messages.wait24.title}</h2>
      </div>
      <div class="guardrails-modal-message">
        ${category.messages.wait24.text}
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

  const closeBtn = overlay.querySelector('#wait-close');
  closeBtn.addEventListener('click', function() {
    overlay.remove();
  });
}

// ========================================
// MESSAGE INTERCEPTION
// ========================================

// Store the message that's allowed to bypass (when user clicks "Continue anyway")
let bypassedMessage = null;
let bypassTimestamp = 0;
const BYPASS_TIMEOUT = 5000; // 5 seconds to send after clicking continue

// Flag to prevent infinite loop when we manually trigger send
let isManualSend = false;

// Set a message as bypassed (allowed to send)
function setBypassedMessage(message) {
  bypassedMessage = message;
  bypassTimestamp = Date.now();
  console.log('✅ Message set to bypass:', message.substring(0, 50) + '...');
}

// Check if a message is currently bypassed
function isBypassed(message) {
  if (!bypassedMessage) return false;

  // Check if bypass has expired
  if (Date.now() - bypassTimestamp > BYPASS_TIMEOUT) {
    bypassedMessage = null;
    return false;
  }

  // Check if message matches (case insensitive, trimmed)
  const matches = message.trim().toLowerCase() === bypassedMessage.trim().toLowerCase();

  if (matches) {
    // Clear the bypass after use
    bypassedMessage = null;
    console.log('✅ Message bypass matched - allowing send');
  }

  return matches;
}

// Main interception function - checks all enabled categories
async function checkAndIntercept(event) {
  // If this is a manual send from our code, let it through immediately
  if (isManualSend) {
    isManualSend = false;
    console.log('✅ Manual send detected, allowing through');
    return;
  }

  // CRITICAL: Prevent the event IMMEDIATELY before any async operations
  // We'll manually trigger the send later if the message is allowed
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();

  // Safety check: ensure chrome API is available
  if (typeof chrome === 'undefined' || !chrome.storage) {
    console.warn('⚠️ Chrome API not available, skipping guardrails check');
    // Manually trigger send since we prevented it
    isManualSend = true;
    const sendButton = document.querySelector('button[data-testid="send-button"]');
    if (sendButton) sendButton.click();
    return;
  }

  const message = getCurrentMessage();

  if (!message.trim()) {
    // Empty message, nothing to do
    return;
  }

  // Check if this message is bypassed (user clicked "Continue anyway")
  if (isBypassed(message)) {
    console.log('✅ Message is bypassed, allowing send');
    // Manually trigger the send since we prevented it earlier
    isManualSend = true;
    const sendButton = document.querySelector('button[data-testid="send-button"]');
    if (sendButton) {
      sendButton.click();
    }
    return;
  }

  // Get enabled categories from settings
  const enabledCategories = await getEnabledCategories();

  // Detect which category (if any) is triggered
  const triggeredCategory = detectTriggeredCategory(message, enabledCategories);

  if (triggeredCategory) {
    console.log(`🚨 Intercepted ${triggeredCategory.id} message:`, message);

      // Check if modal system is enabled
      const modalEnabled = await isModalSystemEnabled();

      if (!modalEnabled) {
        // Modal system disabled - use toast system instead
        await handleToastNotification(triggeredCategory.id);

        // Allow message to send (toast is non-blocking)
        console.log('✅ Modal system disabled, sending message');
        isManualSend = true;
        const sendButton = document.querySelector('button[data-testid="send-button"]');
        if (sendButton) {
          sendButton.click();
        }
        return;
      }

      // Check if there's an active 24-hour block for this category
      const blockData = await chrome.storage.local.get([triggeredCategory.blockKey]);
      const blockUntil = blockData[triggeredCategory.blockKey];

      if (blockUntil && Date.now() < blockUntil) {
        console.log(`🛑 24-hour block is active for ${triggeredCategory.id}`);

        // Log block hit
        await logEvent('block_active', {
          category: triggeredCategory.id
        });

        showBlockedMessage(triggeredCategory, blockUntil);
        return false;
      }

      // Get current strike count and increment
      const strikeCount = await incrementStrike(triggeredCategory.id);
      console.log(`⚠️ Strike ${strikeCount} triggered for ${triggeredCategory.id}`);

      // Log intervention
      await logEvent('intervention_triggered', {
        category: triggeredCategory.id,
        strike: strikeCount
      });

      // If strike 3, automatically set 24-hour block and clear the message
      if (strikeCount >= 3) {
        const blockUntil = Date.now() + (24 * 60 * 60 * 1000); // 24 hours from now
        await chrome.storage.local.set({
          [triggeredCategory.blockKey]: blockUntil
        });
        console.log(`🛑 Strike 3 reached - setting 24-hour block for ${triggeredCategory.id}`);

        // Clear the message from the textarea since they can't send it
        const textarea = document.querySelector('div[contenteditable="true"]');
        if (textarea) {
          textarea.textContent = '';
          textarea.innerHTML = '';
          textarea.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }

      // Show the modal with appropriate strike level
      try {
        showWarningModal(message, triggeredCategory, strikeCount);
      } catch (error) {
        console.error('❌ Error showing modal:', error);
      }

      return false;
  } else {
    // No guardrail triggered - manually send the message since we prevented the event
    console.log('✅ No guardrail triggered, sending message');
    isManualSend = true;
    const sendButton = document.querySelector('button[data-testid="send-button"]');
    if (sendButton) {
      sendButton.click();
    }
  }
}

// ========================================
// DOM INTERCEPTION SETUP
// ========================================

// Intercept send button clicks
function interceptSendButton() {
  const selectors = [
    'button[data-testid="send-button"]'  // ChatGPT
  ];

  for (const selector of selectors) {
    const sendButtons = document.querySelectorAll(selector);

    sendButtons.forEach(sendButton => {
      if (sendButton && !sendButton.hasAttribute('data-guardrails-click-attached')) {
        console.log('✅ Found send button, attaching interceptor...', selector);

        sendButton.setAttribute('data-guardrails-click-attached', 'true');

        // Only use 'click' event to avoid multiple triggers
        sendButton.addEventListener('click', checkAndIntercept, true);
      }
    });
  }
}

// Intercept Enter key on textarea
function interceptTextarea() {
  const selectors = [
    'div[contenteditable="true"]',  // ChatGPT
    'textarea[placeholder*="Message"]',  // Fallback
    'textarea',  // Generic textarea
    '.ProseMirror'  // ProseMirror editor
  ];

  for (const selector of selectors) {
    const textareas = document.querySelectorAll(selector);

    textareas.forEach(textarea => {
      if (textarea && !textarea.hasAttribute('data-guardrails-keydown-attached')) {
        console.log('✅ Found textarea, attaching Enter key interceptor...', selector);

        textarea.setAttribute('data-guardrails-keydown-attached', 'true');

        textarea.addEventListener('keydown', async function(event) {
          // Only intercept Enter key (without Shift, which creates new line)
          if (event.key === 'Enter' && !event.shiftKey) {
            // If this is a manual send, let it through
            if (isManualSend) {
              isManualSend = false;
              console.log('✅ Manual send (Enter key), allowing through');
              return;
            }

            const message = getCurrentMessage();

            if (!message.trim()) {
              // Empty message, don't do anything
              return;
            }

            // CRITICAL: Prevent immediately before async operations
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();

            // Check if this message is bypassed
            if (isBypassed(message)) {
              console.log('✅ Message is bypassed (Enter key), allowing send');
              // Manually trigger send
              isManualSend = true;
              const sendButton = document.querySelector('button[data-testid="send-button"]');
              if (sendButton) {
                sendButton.click();
              }
              return;
            }

            // Get enabled categories from settings
            const enabledCategories = await getEnabledCategories();

            // Detect which category (if any) is triggered
            const triggeredCategory = detectTriggeredCategory(message, enabledCategories);

            if (triggeredCategory) {
              console.log(`🚨 Intercepted ${triggeredCategory.id} message via Enter key:`, message);

              // Check if modal system is enabled
              const modalEnabled = await isModalSystemEnabled();

              if (!modalEnabled) {
                // Modal system disabled - use toast system instead
                await handleToastNotification(triggeredCategory.id);

                // Allow message to send (toast is non-blocking)
                console.log('✅ Modal system disabled (Enter key), sending message');
                isManualSend = true;
                const sendButton = document.querySelector('button[data-testid="send-button"]');
                if (sendButton) {
                  sendButton.click();
                }
                return;
              }

              // Check if there's an active 24-hour block for this category
              const blockData = await chrome.storage.local.get([triggeredCategory.blockKey]);
              const blockUntil = blockData[triggeredCategory.blockKey];

              if (blockUntil && Date.now() < blockUntil) {
                console.log(`🛑 24-hour block is active for ${triggeredCategory.id}`);

                // Log block hit
                await logEvent('block_active', {
                  category: triggeredCategory.id
                });

                showBlockedMessage(triggeredCategory, blockUntil);
                return;
              }

              // Get current strike count and increment
              const strikeCount = await incrementStrike(triggeredCategory.id);
              console.log(`⚠️ Strike ${strikeCount} triggered for ${triggeredCategory.id}`);

              // Log intervention
              await logEvent('intervention_triggered', {
                category: triggeredCategory.id,
                strike: strikeCount
              });

              // If strike 3, automatically set 24-hour block and clear the message
              if (strikeCount >= 3) {
                const blockUntil = Date.now() + (24 * 60 * 60 * 1000); // 24 hours from now
                await chrome.storage.local.set({
                  [triggeredCategory.blockKey]: blockUntil
                });
                console.log(`🛑 Strike 3 reached - setting 24-hour block for ${triggeredCategory.id}`);

                // Clear the message from the textarea since they can't send it
                const textarea = document.querySelector('div[contenteditable="true"]');
                if (textarea) {
                  textarea.textContent = '';
                  textarea.innerHTML = '';
                  textarea.dispatchEvent(new Event('input', { bubbles: true }));
                }
              }

              // Show the modal with appropriate strike level
              showWarningModal(message, triggeredCategory, strikeCount);
            } else {
              // No guardrail triggered - manually send the message since we prevented the event
              console.log('✅ No guardrail triggered (Enter key), sending message');
              isManualSend = true;
              const sendButton = document.querySelector('button[data-testid="send-button"]');
              if (sendButton) {
                sendButton.click();
              }
            }
          }
        }, true);
      }
    });
  }
}

// Watch for DOM changes and attach interceptors
function startWatching() {
  interceptSendButton();
  interceptTextarea();

  const observer = new MutationObserver(function(mutations) {
    interceptSendButton();
    interceptTextarea();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  console.log('👀 Watching for send button and textarea...');
}

// ========================================
// INITIALIZATION
// ========================================

// Start when page is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startWatching);
} else {
  startWatching();
}
