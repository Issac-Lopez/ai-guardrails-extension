# AI Guardrails - Chrome Extension (MVP)

A browser extension that helps you use AI chatbots more intentionally by adding gentle guardrails when discussing emotionally sensitive topics.
> [!NOTE]
> [simple-mvp](https://github.com/Issac-Lopez/ai-guardrails-extension/tree/simple-mvp) is the main development branch currently being worked off of.

## Purpose

Stop using AI chatbots to replace human connection. This extension detects when you're discussing relationship issues, work conflicts, family problems, or emotional decisions and encourages healthier alternatives like journaling, talking to real people, or taking a break.

## Features

### Current MVP Features

**Smart Detection & Interception**
- Intercepts messages on ChatGPT **before** sending to the AI
- Real-time keyword matching for sensitive topics
- Prevents send and shows intervention modal

**3 Guardrail Categories** (toggle on/off individually)
- 💔 **Relationships** - Dating, breakups, partner conflicts, relationship decisions
- 💼 **Work** - Boss venting, job conflicts, quitting decisions, toxic workplace issues
- 👨‍👩‍👧 **Family** - Family conflicts, parenting decisions, difficult family conversations
- Each category has independent strike counting (resets daily)
- Separate 24-hour block tracking per category

**3-Strike Intervention System**
- **Strike 1:** Soft warning with 5-second delay before "Continue anyway" is available
- **Strike 2:** Stronger warning with 10-second delay + shows usage stats ("You've triggered this 2 times today")
- **Strike 3:** Hard block for 24 hours - no "Continue anyway" option, message is cleared

**Alternative Actions** (shown in every intervention)
- 📝 **Journal Instead** - Opens built-in journal in new tab
- 💬 **Talk to Someone** - Encouragement to reach out to real people
- ⏰ **Wait 24 Hours** - Self-impose 24-hour block for that category
- 🚫 **Continue Anyway** - Override with forced delay (Strike 1-2 only)

**Settings & Dashboard**
- Options page to toggle categories on/off
- Usage analytics with time filters (this week / this month / all time)
- Stats tracked: Total interventions, times journaled, blocks triggered
- Category breakdown showing which topics trigger most
- Export all data as JSON
- Clear all data option

**Journal Features**
- Daily entries with auto-save to local storage
- View past journal entries (read-only)
- Export individual entries as .txt files
- Copy entries to clipboard
- Fullscreen writing mode
- Obsidian vault path reminder for external sync

**Privacy-First Design**
- All data stored locally in Chrome Storage API
- Zero telemetry - nothing leaves your browser
- No account required, no tracking, no external servers
- All detection happens client-side
- Can export or delete all data anytime

**Event Logging** (local only)
- Tracks interventions with timestamp, category, strike level
- Logs user actions (continue, journal, talk, wait)
- Records block activations
- No message content stored (metadata only)

## Installation

### For Development
1. Clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the extension folder

### Supported Sites
- ✅ **ChatGPT** (chat.openai.com, chatgpt.com) - Fully working
- ⏳ **Claude.ai** - Planned (code exists but not functional yet)

## Current Status

**What's Working:**
- ✅ ChatGPT message interception
- ✅ All 3 guardrail categories with keyword detection
- ✅ Three-strike system with proper escalation
- ✅ "Continue anyway" correctly sends message to ChatGPT
- ✅ Strike 3 automatic 24-hour blocks
- ✅ All alternative actions functional
- ✅ Dashboard with stats and analytics
- ✅ Journal with local storage and export
- ✅ Daily strike reset at midnight

**Known Limitations:**
- ⚠️ Claude.ai support not yet implemented
- ⚠️ Only keyword-based detection (no AI/sentiment analysis)
- ⚠️ Desktop browsers only (Chrome, Edge, Brave)
- ⚠️ Possible false positives/negatives with keyword matching

## Roadmap

See [CLAUDE.md](CLAUDE.md) for the full Product Spec Document.

### Upcoming Features
- Fix Claude.ai support (selector updates needed)
- Add Health & Financial guardrail categories
- Late-night sensitivity boost (10pm-6am higher detection)
- Message length analysis (very long emotional messages)
- "I talked to a real person" checkbox to unblock early after Strike 3
- Pre-configured trusted contacts reminder feature
- Override justification tracking and enforcement
- Custom guardrail categories (user-defined keywords)
- Firefox extension version
- Semantic intent detection (decision-making vs. exploration)
- Contextual resources (articles, hotlines, therapy finder)

## Privacy

- **Zero telemetry** - Nothing leaves your browser
- **No account required** - No sign-up, no tracking
- **Local storage only** - All data in Chrome's local storage
- **No external APIs** - All detection happens client-side
- **Open source** - Audit the code yourself

## Tech Stack

- Manifest V3 Chrome Extension
- Vanilla JavaScript (no frameworks)
- Chrome Storage API (local only)
- Simple keyword matching + pattern detection
- Event-driven message interception

## Development

This is an MVP built incrementally. The extension currently supports ChatGPT with plans to expand to other AI chat platforms.

### Key Files
- `content.js` - Message interception and guardrail logic
- `options.js` / `options.html` - Settings and dashboard
- `journal.js` / `journal.html` - Journaling interface
- `manifest.json` - Extension configuration
- `CLAUDE.md` - Full product specification

## Contributing

This is currently a personal project in early development. Contributions, ideas, and feedback welcome!

## License

TBD

## Philosophy

This tool is not about perfection - it's about awareness. It's a reminder, not a prison. Self-aware users will respect the boundaries they set for themselves.

The goal isn't to block AI entirely, but to add friction when you might be using it to avoid difficult but important human conversations.

---

Built with the goal of encouraging real human connection over AI dependency.
