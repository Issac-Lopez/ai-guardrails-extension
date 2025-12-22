// Create sample journal entries
(function() {
    const today = new Date();

    const sampleEntries = {
      // Today
      [getDateString(0)]: "Had a really productive day today. Finally finished that project I've been working on for weeks. Feeling accomplished and ready to tackle the next challenge.",

      // Yesterday
      [getDateString(-1)]: "Spent some time reflecting on my goals for the month. I think I need to be more intentional about how I spend my time. Going to try waking up earlier and establishing a better morning routine.",

      // 2 days ago
      [getDateString(-2)]: "Interesting conversation with a friend today about the importance of being present. I've been so caught up in planning the future that I forget to enjoy the moment. Need to work on this.",

      // 3 days ago
      [getDateString(-3)]: "Feeling a bit overwhelmed with everything on my plate. Made a list of priorities and decided to focus on one thing at a time. Sometimes simple solutions are the best.",

      // 1 week ago
      [getDateString(-7)]: "Beautiful weather today. Went for a long walk and just let my mind wander. It's amazing how a change of scenery can shift your perspective on things that seemed impossible before.",

      // 2 weeks ago
      [getDateString(-14)]: "Reading has become such a nice evening ritual. Started a new book tonight and I'm already hooked. There's something special about disconnecting from screens and getting lost in a story.",

      // 3 weeks ago
      [getDateString(-21)]: "Had a moment of clarity today. I've been avoiding a difficult conversation because I was afraid of the outcome. But avoiding it is just making things worse. Tomorrow I'm going to face it head-on.",

      // 1 month ago
      [getDateString(-30)]: "Looking back at this month, I'm proud of how far I've come. There were definitely challenging moments, but I learned something from each of them. Growth isn't always comfortable, but it's worth it."
    };

    // Helper function to get date string
    function getDateString(daysAgo) {
      const date = new Date(today);
      date.setDate(date.getDate() + daysAgo);
      return date.toISOString().split('T')[0];
    }

    // Save to storage
    chrome.storage.local.set({ journal_entries: sampleEntries }, function() {
      console.log('✅ Successfully created', Object.keys(sampleEntries).length, 'journal entries!');
      console.log('📅 Date range:', getDateString(-30), 'to', getDateString(0));
      console.log('🔄 Reload the journal page to see the entries.');
    });
  })();