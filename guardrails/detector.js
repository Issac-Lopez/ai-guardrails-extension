// Guardrail Detection Logic
// Detects which guardrail category (if any) a message violates

(function() {
  'use strict';

  // Function to detect which guardrail category is violated
  async function detectViolation(message) {
    const lowerMessage = message.toLowerCase();
    const categories = window.GuardrailsConfig.categories;

    // Get enabled settings from storage
    const enabledSettings = await getEnabledSettings();

    // Check each enabled category
    for (const [categoryId, category] of Object.entries(categories)) {
      // Check if category is enabled (default to true if not set)
      const isEnabled = enabledSettings[categoryId] !== false;
      if (!isEnabled) {
        console.log(`Guardrails: ${category.name} is disabled, skipping`);
        continue;
      }

      // Check keywords for this category
      for (let keyword of category.keywords) {
        if (lowerMessage.includes(keyword.toLowerCase())) {
          console.log(`Guardrails: Detected ${category.name} keyword:`, keyword);
          return {
            categoryId: categoryId,
            category: category,
            keyword: keyword
          };
        }
      }
    }

    return null; // No violation detected
  }

  // Get enabled settings from Chrome storage
  function getEnabledSettings() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['guardrails_enabled'], function(result) {
        resolve(result.guardrails_enabled || {});
      });
    });
  }

  // Expose to global scope
  window.GuardrailsDetector = {
    detectViolation
  };

  console.log('Guardrails: Detector module loaded');
})();
