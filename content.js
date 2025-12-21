// AI Guardrails - Main Content Script
// Orchestrates all modules and handles message interception

console.log('AI Guardrails extension loaded!');

// UI Helper Functions
window.GuardrailsUI = {
  // Function to get the current message from the textarea
  getCurrentMessage() {
    // ChatGPT uses a contenteditable div for the text input
    const textarea = document.querySelector('div[contenteditable="true"]');
    if (textarea) {
      return textarea.textContent || textarea.innerText || '';
    }
    return '';
  },

  // Function to programmatically send the message
  sendMessage(message) {
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
};

// Main interception logic
async function checkAndIntercept(event) {
  const message = window.GuardrailsUI.getCurrentMessage();

  if (message.trim()) {
    // Check if this is a bypass click (user clicked continue)
    const sendButton = document.querySelector('button[data-testid="send-button"]');
    if (sendButton && sendButton.hasAttribute('data-guardrails-bypass')) {
      console.log('Guardrails: Bypassing (user clicked continue)');
      return; // Allow the message through
    }

    // Check if message violates any guardrail
    const violation = window.GuardrailsDetector.detectViolation(message);

    if (violation) {
      const { categoryId, category } = violation;
      console.log(`Guardrails: Intercepted ${category.name} message:`, message);

      // Stop the message from sending
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      // Check if there's an active 24-hour block for this category
      const blockStatus = await window.GuardrailsStorage.isBlocked(categoryId);
      if (blockStatus.blocked) {
        console.log(`Guardrails: 24-hour block active for ${category.name}`);
        window.GuardrailsModals.showBlockedMessage(blockStatus.blockUntil, category);
        return false;
      }

      // Get current strike count and increment
      const strikeCount = await window.GuardrailsStorage.incrementStrike(category.strikeKey);
      console.log(`Guardrails: ${category.name} - Strike ${strikeCount} triggered`);

      // Show the modal with appropriate strike level
      window.GuardrailsModals.showWarningModal(message, strikeCount, category);

      return false;
    } else {
      // No keywords detected - let the message through
      console.log('Guardrails: Message allowed (no keywords detected)');
    }
  }
}

// Function to intercept the send button click
function interceptSendButton() {
  // Find the send button (it's usually the last button in the prompt area)
  const sendButton = document.querySelector('button[data-testid="send-button"]');

  if (sendButton && !sendButton.hasAttribute('data-guardrails-attached')) {
    console.log('Guardrails: Found send button, attaching interceptor...');

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
    console.log('Guardrails: Found textarea, attaching Enter key interceptor...');

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

  console.log('Guardrails: Watching for send button and textarea...');
}

// Start when page is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startWatching);
} else {
  startWatching();
}
