# AI Guardrails - Chrome Extension

A browser extension that helps you use ChatGPT more intentionally by adding gentle guardrails when discussing emotionally sensitive topics.

> [!NOTE]
> [simple-mvp](https://github.com/Issac-Lopez/ai-guardrails-extension/tree/simple-mvp) is the main development branch currently being worked off of.

## Purpose

Stop using AI chatbots to replace human connection. This extension detects when you're discussing relationship issues, work conflicts, or family problems and encourages healthier alternatives like journaling, talking to real people, or taking a break.

## Features

### Toast Notification System (Default)

**Non-intrusive keyword detection**

- Detects sensitive keywords as you send messages on ChatGPT
- Shows a gentle toast notification above the input area: "Consider journaling?"
- Toast appears on 1st keyword detection, then at 3, 6, 9, and 12 detections
- Does **not** block or interrupt your message - fully passive
- Keyword counter resets daily at midnight
- After 12 detections, stops nudging for the day

**Persistent journal button**

- A small journal button appears next to the send button after the first toast
- Stays visible for the rest of the session for quick access to journaling
- Clicking opens the journal with the relevant category pre-selected

### Modal Intervention System (Opt-in)

**3-Strike system** (disabled by default, enable in settings)

- **Strike 1:** Soft warning with 5-second delay before "Continue anyway" is available
- **Strike 2:** Stronger warning with 10-second delay
- **Strike 3:** Hard block for 24 hours - no "Continue anyway" option, message is cleared

**Alternative actions** (shown in every intervention)

- **Journal Instead** - Opens built-in journal in new tab
- **Talk to Someone** - Encouragement to reach out to real people
- **Wait 24 Hours** - Self-impose 24-hour block for that category
- **Continue Anyway** - Override with forced delay (Strike 1-2 only)

### 3 Guardrail Categories (toggle on/off individually)

- **Relationships** - Dating, breakups, partner conflicts, relationship decisions
- **Work** - Boss venting, job conflicts, quitting decisions, toxic workplace issues
- **Family** - Family conflicts, parenting decisions, difficult family conversations
- Each category has independent strike counting (resets daily)
- Separate 24-hour block tracking per category

### Settings & Dashboard

- Options page to toggle categories on/off
- Toggle between toast-only and toast + modal intervention modes
- Usage analytics with time filters (this week / this month / all time)
- Stats tracked: Total interventions, times journaled, blocks triggered, gentle reminders
- Category breakdown for both interventions and toast reminders
- Export all data as JSON
- Export journal entries as text
- Clear all data option

### Journal Features

- Daily entries with auto-save to local storage
- Category-specific reflection prompts
- View past journal entries (read-only)
- Export individual entries as .txt files
- Copy entries to clipboard
- Fullscreen writing mode

### Privacy-First Design

- All data stored locally in Chrome Storage API
- Zero telemetry - nothing leaves your browser
- No account required, no tracking, no external servers
- All detection happens client-side
- Can export or delete all data anytime

### Event Logging (local only)

- Tracks interventions with timestamp, category, strike level
- Tracks toast notifications with threshold and category
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

- **ChatGPT** (chat.openai.com, chatgpt.com)

## Current Status

**What's Working:**

- ChatGPT message interception
- Toast notification system with progressive thresholds
- Persistent journal button next to send button
- All 3 guardrail categories with keyword detection
- Optional three-strike modal system with proper escalation
- "Continue anyway" correctly sends message to ChatGPT
- Strike 3 automatic 24-hour blocks
- All alternative actions functional
- Dashboard with stats and analytics for both toast and modal systems
- Journal with local storage, category prompts, and export
- Daily strike and toast counter reset at midnight
- Dynamic toast positioning (adapts to ChatGPT UI changes)

**Known Limitations:**

- Only keyword-based detection (no AI/sentiment analysis)
- Desktop browsers only (Chrome, Edge, Brave)
- Possible false positives/negatives with keyword matching

## Roadmap

See [CLAUDE.md](CLAUDE.md) for Product Spec Document.

### Upcoming Features

- Add Health & Financial guardrail categories
- Late-night sensitivity boost (10pm-6am higher detection)
- Message length analysis (very long emotional messages)
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

### Key Files

- `content.js` - Message interception, toast notifications, and guardrail logic
- `modal.css` - Styles for modals, toast notifications, and journal button
- `options.js` / `options.html` - Settings, notification preferences, and dashboard
- `journal.js` / `journal.html` - Journaling interface with category prompts
- `manifest.json` - Extension configuration
- `CLAUDE.md` - Full product specification and philosophy

## Contributing

This is currently a personal project in early development. Contributions, ideas, and feedback welcome!

## License

TBD

## Philosophy

This tool is not about perfection - it's about awareness. It's a reminder, not a prison. Self-aware users will respect the boundaries they set for themselves.

The goal isn't to block AI entirely, but to add friction when you might be using it to avoid difficult but important human conversations.

---

Built with the goal of encouraging real human connection over AI dependency.
