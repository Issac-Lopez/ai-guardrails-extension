// Guardrail Categories Configuration
// This file contains all guardrail category definitions

(function() {
  'use strict';

  // Guardrail Categories Configuration
  const guardrailCategories = {
    relationships: {
      name: "Intimate Relationships",
      strikeKey: "relationships",
      enabled: true,
      keywords: [
        // Direct relationship terms
        'girlfriend', 'boyfriend', 'partner', 'wife', 'husband', 'spouse',
        'dating', 'relationship', 'breakup', 'break up', 'breaking up',
        'divorce', 'married', 'marriage', 'engaged', 'engagement',
        'fiance', 'fiancee',

        // Decision-making phrases
        'should i break up', 'should i leave', 'should i stay',
        'is it time to', 'thinking about breaking', 'thinking of leaving',
        'considering breaking up', 'considering divorce', 'worth breaking up',
        'reasons to break up', 'reasons to leave', 'signs i should',

        // Emotional venting
        'my ex', 'my gf', 'my bf', 'my so',
        'fighting with my', 'argue with my', 'mad at my',
        'hate my', 'can\'t stand my', 'done with my',
        'fed up with', 'tired of my', 'sick of my',

        // Relationship quality concerns
        'toxic relationship', 'unhealthy relationship', 'red flags',
        'not working out', 'falling out of love', 'don\'t love',
        'love fading', 'spark is gone', 'growing apart',
        'we fight all the time', 'constant arguing', 'always fighting',

        // Partner discussion indicators
        'she said', 'he said', 'they said', 'she told me', 'he told me',
        'she wants', 'he wants', 'she thinks', 'he thinks',
        'she doesn\'t', 'he doesn\'t', 'she never', 'he never',

        // Therapy/counseling mentions
        'couples therapy', 'relationship counseling', 'marriage counseling',

        // Betrayal/trust issues
        'cheating', 'cheated on me', 'caught cheating', 'affair',
        'can\'t trust', 'trust issues', 'lying to me', 'lied to me'
      ],
      messages: {
        strike1Title: "Relationship Check-In",
        strike1Body: "It looks like you're discussing relationship issues.<br><br><strong>Consider these alternatives:</strong>",
        strike2Title: "Second Warning",
        strike2Body: "You've triggered this guardrail <strong>2 times today</strong>.<br><br>This might be a sign you need to talk to someone real, not AI.<br><br><strong>Try one of these instead:</strong>",
        strike3Title: "Daily Limit Reached",
        strike3Body: "You've reached your limit for relationship discussions today.<br><br><strong>This conversation is blocked for 24 hours.</strong><br><br>Instead of using AI, try one of these:"
      }
    },

    work: {
      name: "Work Conflicts",
      strikeKey: "work",
      enabled: true,
      keywords: [
        // Job/workplace terms
        'my boss', 'my manager', 'my supervisor', 'my coworker', 'my colleague',
        'my job', 'my work', 'at work', 'workplace',

        // Quitting/leaving
        'should i quit', 'thinking about quitting', 'want to quit',
        'hate my job', 'hate this job', 'can\'t stand my job',
        'looking for new job', 'job hunting', 'ready to quit',

        // Workplace conflicts
        'toxic workplace', 'toxic work environment', 'bad boss',
        'micromanaging', 'office politics', 'work drama',
        'hostile work environment', 'bullying at work',

        // Venting about coworkers/boss
        'my boss is', 'my manager is', 'my coworker is',
        'boss said', 'manager said', 'boss told me',
        'doesn\'t appreciate', 'taking credit for my',
        'boss yelled', 'got yelled at', 'unfair treatment'
      ],
      messages: {
        strike1Title: "Work Venting Check-In",
        strike1Body: "Looks like you're venting about work conflicts.<br><br><strong>Consider these alternatives:</strong>",
        strike2Title: "Second Warning",
        strike2Body: "You've triggered this guardrail <strong>2 times today</strong>.<br><br>Venting to AI won't solve work issues.<br><br><strong>Try one of these instead:</strong>",
        strike3Title: "Daily Limit Reached",
        strike3Body: "You've reached your limit for work discussions today.<br><br><strong>This conversation is blocked for 24 hours.</strong><br><br>Instead of using AI, try one of these:"
      }
    }
  };

  // Expose to global scope for other modules to use
  window.GuardrailsConfig = {
    categories: guardrailCategories
  };

  console.log('Guardrails: Categories loaded');
})();
