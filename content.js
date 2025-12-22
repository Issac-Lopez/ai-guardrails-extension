// AI Guardrails - Content Script
// This script runs on chat.openai.com and chatgpt.com

console.log('AI Guardrails extension loaded!');

// Store the original message to restore if user cancels
let interceptedMessage = null;

// Strike tracking
const STRIKE_STORAGE_KEY = 'guardrails_strikes';

// Get today's date string (for daily reset)
function getTodayDateString() {
  const today = new Date();
  return today.toISOString().split('T')[0]; // Returns YYYY-MM-DD
}

// Get strikes from storage
async function getStrikes() {
  return new Promise((resolve) => {
    chrome.storage.local.get([STRIKE_STORAGE_KEY], function(result) {
      const data = result[STRIKE_STORAGE_KEY] || {};
      const today = getTodayDateString();

      // Reset strikes if it's a new day
      if (data.date !== today) {
        console.log('New day detected, resetting strikes');
        resolve({ date: today, relationships: 0 });
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
      console.log('� Strikes saved:', strikes);
      resolve();
    });
  });
}

// Increment strike count for a category
async function incrementStrike(category) {
  const strikes = await getStrikes();
  strikes[category] = (strikes[category] || 0) + 1;
  strikes.date = getTodayDateString(); // Ensure date is set
  await saveStrikes(strikes);
  return strikes[category]; // Return current strike count
}

// Note: Strikes will automatically reset daily
// To manually reset for testing: uninstall and reinstall the extension

// Relationship keywords - simple detection for MVP
const relationshipKeywords = [
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
  'she said', 'he said', 'they said' // when discussing partner conversations
];

// Function to check if message contains relationship keywords
function containsRelationshipKeywords(message) {
  const lowerMessage = message.toLowerCase();

  for (let keyword of relationshipKeywords) {
    if (lowerMessage.includes(keyword.toLowerCase())) {
      console.log('� Detected relationship keyword:', keyword);
      return true;
    }
  }

  return false;
}

// Function to get the current message from the textarea
function getCurrentMessage() {
  // ChatGPT uses a contenteditable div for the text input
  const textarea = document.querySelector('div[contenteditable="true"]');
  if (textarea) {
    return textarea.textContent || textarea.innerText || '';
  }
  return '';
}

// Function to create and show the modal
function showWarningModal(message, strikeLevel) {
  // Create modal overlay
  const overlay = document.createElement('div');
  overlay.className = 'guardrails-modal-overlay';

  // Different content based on strike level
  let icon, title, messageText, showContinue, delaySeconds;

  if (strikeLevel === 1) {
    // Strike 1 - Soft warning
    icon = '';
    title = 'Relationship Check-In';
    messageText = `
      It looks like you're discussing relationship issues.
      <br><br>
      <strong>Consider these alternatives:</strong>
    `;
    showContinue = true;
    delaySeconds = 5;
  } else if (strikeLevel === 2) {
    // Strike 2 - Stronger warning
    icon = '';
    title = 'Second Warning';
    messageText = `
      You've triggered this guardrail <strong>2 times today</strong>.
      <br><br>
      This might be a sign you need to talk to someone real, not AI.
      <br><br>
      <strong>Try one of these instead:</strong>
    `;
    showContinue = true;
    delaySeconds = 10;
  } else {
    // Strike 3 - Hard block
    icon = '�';
    title = 'Daily Limit Reached';
    messageText = `
      You've reached your limit for relationship discussions today.
      <br><br>
      <strong>This conversation is blocked for 24 hours.</strong>
      <br><br>
      Instead of using AI, try one of these:
    `;
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
        � Journal Instead
      </button>
      <button class="guardrails-alt-btn" id="guardrails-talk">
        � Talk to Someone
      </button>
      <button class="guardrails-alt-btn" id="guardrails-wait">
         Wait 24 Hours
      </button>
    </div>
    <div class="guardrails-divider">or</div>
  `;
  } else if (strikeLevel === 3) {
    // Strike 3: Only show journal and talk (no "Wait 24 Hours" since already blocked)
    alternativeActionsHTML = `
    <div class="guardrails-alternatives">
      <button class="guardrails-alt-btn" id="guardrails-journal">
        � Journal Instead
      </button>
      <button class="guardrails-alt-btn" id="guardrails-talk">
        � Talk to Someone
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
      sendMessageToChat(message);
    });
  }

  // Handle cancel/close button
  const cancelBtn = overlay.querySelector('#guardrails-cancel');
  cancelBtn.addEventListener('click', function() {
    if (timer) clearInterval(timer); // Clean up timer
    overlay.remove();
  });

  // Handle alternative action buttons (for all strike levels)
  if (strikeLevel === 1 || strikeLevel === 2 || strikeLevel === 3) {
    // Journal Instead button
    const journalBtn = overlay.querySelector('#guardrails-journal');
    if (journalBtn) {
      journalBtn.addEventListener('click', function() {
        if (timer) clearInterval(timer);
        overlay.remove();
        openJournalPage(message);
      });
    }

    // Talk to Someone button
    const talkBtn = overlay.querySelector('#guardrails-talk');
    if (talkBtn) {
      talkBtn.addEventListener('click', function() {
        if (timer) clearInterval(timer);
        overlay.remove();
        showTalkToSomeoneMessage();
      });
    }

    // Wait 24 Hours button (only for Strike 1 & 2)
    const waitBtn = overlay.querySelector('#guardrails-wait');
    if (waitBtn) {
      waitBtn.addEventListener('click', function() {
        if (timer) clearInterval(timer);
        overlay.remove();
        setWait24Hours();
      });
    }
  }
}

// Alternative Action: Open Journal Page
function openJournalPage(message) {
  console.log('� Opening journal page...');
  // Open journal in new tab
  const journalUrl = chrome.runtime.getURL('journal.html');
  window.open(journalUrl, '_blank');
}

// Alternative Action: Show "Talk to Someone" message
function showTalkToSomeoneMessage() {
  console.log('� User chose to talk to someone');

  // Create a simple overlay with encouragement
  const overlay = document.createElement('div');
  overlay.className = 'guardrails-modal-overlay';
  overlay.innerHTML = `
    <div class="guardrails-modal">
      <div class="guardrails-modal-header">
        <span class="guardrails-modal-icon">�</span>
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
async function setWait24Hours() {
  console.log(' Setting 24-hour wait...');

  // Set a block that expires in 24 hours
  const blockUntil = Date.now() + (24 * 60 * 60 * 1000); // 24 hours from now

  await chrome.storage.local.set({
    relationship_block_until: blockUntil
  });

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
        Relationship discussions are now blocked for 24 hours.
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

// Function to programmatically send the message
function sendMessageToChat(message) {
  // Get the textarea and set the message
  const textarea = document.querySelector('div[contenteditable="true"]');
  if (textarea) {
    // Clear and set new content
    textarea.textContent = message;

    // Trigger input event to update ChatGPT's state
    textarea.dispatchEvent(new Event('input', { bubbles: true }));

    // Find and click the send button
    const sendButton = document.querySelector('button[data-testid="send-button"]');
    if (sendButton) {
      // Temporarily disable our interceptor
      sendButton.setAttribute('data-guardrails-bypass', 'true');

      // Click the button
      sendButton.click();

      // Re-enable interceptor after a short delay
      setTimeout(() => {
        sendButton.removeAttribute('data-guardrails-bypass');
      }, 100);
    }
  }
}

// Function to check message and show modal
async function checkAndIntercept(event) {
  const message = getCurrentMessage();

  if (message.trim()) {
    // Check if this is a bypass click (user clicked continue)
    const sendButton = document.querySelector('button[data-testid="send-button"]');
    if (sendButton && sendButton.hasAttribute('data-guardrails-bypass')) {
      console.log(' Bypassing guardrails (user clicked continue)');
      return; // Allow the message through
    }

    // Check if message contains relationship keywords
    if (containsRelationshipKeywords(message)) {
      console.log('� Intercepted relationship message:', message);

      // Stop the message from sending
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      // Check if there's an active 24-hour block
      const blockUntil = await chrome.storage.local.get(['relationship_block_until']);
      if (blockUntil.relationship_block_until && Date.now() < blockUntil.relationship_block_until) {
        console.log('� 24-hour block is active');
        showBlockedMessage(blockUntil.relationship_block_until);
        return false;
      }

      // Get current strike count and increment
      const strikeCount = await incrementStrike('relationships');
      console.log(`� Strike ${strikeCount} triggered`);

      // Show the modal with appropriate strike level
      showWarningModal(message, strikeCount);

      return false;
    } else {
      // No keywords detected - let the message through
      console.log(' Message allowed (no keywords detected)');
    }
  }
}

// Show blocked message (24-hour wait)
function showBlockedMessage(blockUntil) {
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
        Relationship discussions are blocked for another <strong>${hoursLeft} hour(s)</strong>.
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
  closeBtn.addEventListener('click', function() {
    overlay.remove();
  });
}

// Function to intercept the send button click
function interceptSendButton() {
  // Find the send button (it's usually the last button in the prompt area)
  const sendButton = document.querySelector('button[data-testid="send-button"]');

  if (sendButton && !sendButton.hasAttribute('data-guardrails-attached')) {
    console.log(' Found send button, attaching interceptor...');

    // Mark this button as already processed
    sendButton.setAttribute('data-guardrails-attached', 'true');

    // Intercept clicks on the send button - try multiple event types
    ['click', 'mousedown', 'pointerdown'].forEach(eventType => {
      sendButton.addEventListener(eventType, checkAndIntercept, true);
    });
  }
}

// Function to intercept Enter key on textarea
function interceptTextarea() {
  const textarea = document.querySelector('div[contenteditable="true"]');

  if (textarea && !textarea.hasAttribute('data-guardrails-attached')) {
    console.log(' Found textarea, attaching Enter key interceptor...');

    // Mark this textarea as already processed
    textarea.setAttribute('data-guardrails-attached', 'true');

    // Intercept Enter key (without Shift)
    textarea.addEventListener('keydown', function(event) {
      // Enter key without Shift sends the message
      if (event.key === 'Enter' && !event.shiftKey) {
        checkAndIntercept(event);
      }
    }, true);
  }
}

// Watch for the send button to appear (ChatGPT loads dynamically)
function startWatching() {
  // Try to attach immediately
  interceptSendButton();
  interceptTextarea();

  // Also watch for changes (in case button or textarea appears later)
  const observer = new MutationObserver(function(mutations) {
    interceptSendButton();
    interceptTextarea();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  console.log('� Watching for send button and textarea...');
}

// Start when page is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startWatching);
} else {
  startWatching();
}
