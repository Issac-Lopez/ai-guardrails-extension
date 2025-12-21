// Chrome Storage Helper Functions
// Handles all interactions with Chrome's local storage API

(function() {
  'use strict';

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
          console.log('Guardrails: New day detected, resetting strikes');
          resolve({ date: today, relationships: 0, work: 0 });
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
        console.log('Guardrails: Strikes saved:', strikes);
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

  // Check if a category is blocked (24-hour wait)
  async function isBlocked(categoryId) {
    const blockKey = `${categoryId}_block_until`;
    return new Promise((resolve) => {
      chrome.storage.local.get([blockKey], function(result) {
        if (result[blockKey] && Date.now() < result[blockKey]) {
          resolve({
            blocked: true,
            blockUntil: result[blockKey]
          });
        } else {
          resolve({ blocked: false });
        }
      });
    });
  }

  // Set a 24-hour block for a category
  async function setBlock(categoryId) {
    const blockUntil = Date.now() + (24 * 60 * 60 * 1000); // 24 hours from now
    const blockKey = `${categoryId}_block_until`;

    return new Promise((resolve) => {
      chrome.storage.local.set({ [blockKey]: blockUntil }, function() {
        console.log(`Guardrails: 24-hour block set for ${categoryId}`);
        resolve(blockUntil);
      });
    });
  }

  // Expose to global scope
  window.GuardrailsStorage = {
    getStrikes,
    saveStrikes,
    incrementStrike,
    isBlocked,
    setBlock,
    getTodayDateString
  };

  console.log('Guardrails: Storage module loaded');
})();
