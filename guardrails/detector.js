// Guardrail Detection Logic
// Detects which guardrail category (if any) a message violates

(function() {
  'use strict';

  // Function to detect which guardrail category is violated
  function detectViolation(message) {
    const lowerMessage = message.toLowerCase();
    const categories = window.GuardrailsConfig.categories;

    // Check each enabled category
    for (const [categoryId, category] of Object.entries(categories)) {
      if (!category.enabled) continue;

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

  // Expose to global scope
  window.GuardrailsDetector = {
    detectViolation
  };

  console.log('Guardrails: Detector module loaded');
})();
