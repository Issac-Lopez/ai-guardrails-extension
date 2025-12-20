# AI Guardrails - Chrome Extension (MVP)

A browser extension that helps you use AI chatbots more intentionally by adding gentle guardrails when discussing emotionally sensitive topics.

## Purpose

Stop using AI chatbots to replace human connection. This extension detects when you're discussing relationship issues, emotional decisions, or personal problems and encourages healthier alternatives like journaling, talking to real people, or taking a break.

## Features

### Current MVP Features
- Smart Detection - Intercepts messages on ChatGPT before sending
- Relationship Keyword Matching - Detects relationship-related discussions
- 3-Strike System
  - Strike 1: Soft warning (5s delay)
  - Strike 2: Stronger warning (10s delay) + usage stats
  - Strike 3: Hard block for 24 hours
- Alternative Actions
  - Journal Instead - Built-in journaling with history
  - Talk to Someone - Encouragement to reach out
  - Wait 24 Hours - Block yourself from the topic
- Privacy-First - All data stored locally, zero telemetry
- Journal Features
  - Daily entries with auto-save
  - View past entries (read-only)
  - Export as .txt files
  - Copy to clipboard
  - Obsidian vault path reminder

## Installation

### For Development
1. Clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the extension folder

### Supported Sites
- ChatGPT (chat.openai.com, chatgpt.com)
- Claude.ai support coming soon

## Roadmap

See [CLAUDE.md](CLAUDE.md) for the full Product Spec Document.

### Upcoming Features
- Semantic intent detection (decision-making vs. exploration)
- Contextual resources (articles, videos, hotlines)
- More guardrail categories (work, family, health, finances)
- Dashboard with stats and insights
- Light/dark mode support
- Data export (all journals + stats)

## Privacy

- Zero telemetry - Nothing leaves your browser
- No account required - No sign-up, no tracking
- Local storage only - All data stored in Chrome's local storage
- No external APIs - All detection happens locally
- Open source - Audit the code yourself

## Tech Stack

- Manifest V3 Chrome Extension
- Vanilla JavaScript (no frameworks)
- Chrome Storage API
- Simple keyword matching + pattern detection

## Development

This is an MVP built incrementally. Check the commit history to see the step-by-step development process.

## Contributing

This is currently a personal project in early development. Contributions, ideas, and feedback welcome!

## License

TBD

## Philosophy

This tool is not about perfection - it's about awareness. It's a reminder, not a prison. Self-aware users will respect the boundaries they set for themselves.

---

Built with the goal of encouraging real human connection over AI dependency.
