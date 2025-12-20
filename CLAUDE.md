\*\*Product Spec Document (PSD) - AI Guardrails Extension MVP\*\*



---



\## 1. Product Overview



\*\*Name:\*\* TBD (working title: "Guardrails" or "Mindful AI")



\*\*Tagline:\*\* Stop using AI chatbots to replace human connection



\*\*Problem:\*\* 

Users are increasingly relying on AI chatbots (Claude, ChatGPT) to process emotional decisions, relationship issues, and personal problems that would be better addressed through human connection, self-reflection, or professional help. This creates unhealthy dependency patterns and can lead to poor decision-making (e.g., making relationship decisions at 2am while emotionally compromised).



\*\*Solution:\*\*

A browser extension that detects when users are discussing emotionally sensitive topics with AI chatbots and provides friction through warnings, alternative suggestions, and optional blocking to redirect them toward healthier coping mechanisms.



\*\*Target Users:\*\*

\- People who use AI chatbots frequently for emotional support

\- Those who recognize they're avoiding difficult conversations with real people

\- Users who want to maintain healthy boundaries with AI tools

\- Self-aware individuals seeking to use AI intentionally rather than compulsively



---



\## 2. Core Features (MVP)



\### 2.1 Guardrail Categories

Users can enable/disable preset guardrail categories:



\*\*Launch categories (choose 3-5):\*\*

1\. 💔 \*\*Intimate Relationships\*\* - Dating, breakups, partner conflicts

2\. 👨‍👩‍👧 \*\*Family Issues\*\* - Family conflicts, parenting decisions

3\. 💼 \*\*Work Conflicts\*\* - Coworker venting, job decisions

4\. 🏥 \*\*Health Decisions\*\* - Medical questions, mental health crises

5\. 💰 \*\*Financial Decisions\*\* - Major purchases, investment advice



\*\*Each category includes:\*\*

\- Pre-configured keyword detection

\- Category-specific alternative suggestions

\- Independent strike counting



\### 2.2 Detection System



\*\*How it works:\*\*

\- Intercepts outgoing messages to claude.ai and chat.openai.com BEFORE sending

\- Analyzes text for emotional/personal keywords matching enabled guardrails

\- Triggers intervention based on match confidence and user's strike count



\*\*Detection triggers:\*\*

\- \*\*Primary keywords:\*\* Relationship-specific terms (e.g., "my girlfriend", "should I break up", "my boss is")

\- \*\*Emotional language:\*\* High-emotion words indicating venting/spiraling

\- \*\*Time-based factors:\*\* Late night (10pm-6am) increases sensitivity

\- \*\*Message length:\*\* Very long emotional messages get flagged



\### 2.3 Three-Strike Intervention System



\*\*Strike 1 - Soft Warning:\*\*

\- Modal overlay: "⚠️ It looks like you're discussing \[category]. Consider talking to a real person instead."

\- Shows alternative actions (see 2.4)

\- "Continue anyway" button available

\- Takes 5 seconds before "Continue" is clickable (forced pause)



\*\*Strike 2 - Stronger Warning:\*\*

\- More prominent modal with usage stats

\- "You've triggered this guardrail 2 times today"

\- Shows previous topics you've discussed in this category

\- Same alternatives, longer delay (10 seconds)

\- "I understand the risks, continue" button



\*\*Strike 3 - Hard Block:\*\*

\- Full-screen block: "🛑 You've reached your limit for \[category] today"

\- No option to continue for 24 hours

\- Must choose alternative action or close window

\- Optional: "I talked to someone" checkbox to unblock early



\### 2.4 Alternative Actions



When intervention triggers, user sees these options:



1\. \*\*📝 Journal Instead\*\*

&nbsp;  - Opens simple text editor in new tab

&nbsp;  - Prompts: "What are you feeling?", "What do you really need right now?"

&nbsp;  - Saves locally to browser

&nbsp;  - Can export as .txt file



2\. \*\*⏰ Wait 24 Hours\*\*

&nbsp;  - Sets browser reminder for tomorrow

&nbsp;  - Blocks conversation on this topic until then

&nbsp;  - "Come back when you're fresh"



3\. \*\*💬 Talk to Someone\*\*

&nbsp;  - Suggests: "Call a friend, talk to your partner, or text someone you trust"

&nbsp;  - Optional: Pre-configure trusted contacts (shows their names as reminder)

&nbsp;  - Checkbox: "I talked to a real person" (unblocks after Strike 3)



4\. \*\*🚫 Override (Technical Question)\*\*

&nbsp;  - Available only on Strike 1-2

&nbsp;  - Requires brief explanation: "What problem are you actually solving?"

&nbsp;  - Logged for pattern review

&nbsp;  - If overused (>3 times/week), stops working



\### 2.5 Dashboard \& Logging



\*\*Simple dashboard accessible via extension icon:\*\*



\*\*Stats shown:\*\*

\- Total interventions this week/month

\- Breakdown by category

\- Most common trigger times

\- Override usage patterns

\- Streak counter: "X days since last block"



\*\*Logs include:\*\*

\- Date/time of intervention

\- Category triggered

\- Strike level reached

\- Action taken (continued, journaled, waited, etc.)

\- Override justifications (if used)



\*\*All data:\*\*

\- Stored locally in browser only

\- Never sent to external servers

\- Can be exported as CSV

\- Can be fully deleted



---



\## 3. Technical Architecture



\### 3.1 Platform

\- Chrome Extension (Manifest V3)

\- Works on: claude.ai, chat.openai.com

\- Desktop browsers only (Chrome, Edge, Brave)



\### 3.2 Tech Stack

\- \*\*Frontend:\*\* Vanilla JavaScript (keep it simple for MVP)

\- \*\*Storage:\*\* Chrome Storage API (local only)

\- \*\*Text Analysis:\*\* Simple keyword matching + sentiment scoring (no external APIs)

\- \*\*UI Framework:\*\* Minimal CSS, no heavy libraries



\### 3.3 How It Works



1\. \*\*Content Script\*\* injected on claude.ai and chat.openai.com

2\. \*\*Message Interception:\*\*

&nbsp;  - Listens for form submissions / message sends

&nbsp;  - Grabs message text before HTTP request fires

3\. \*\*Analysis:\*\*

&nbsp;  - Runs keyword matching against enabled guardrails

&nbsp;  - Checks time of day, message length, emotional language

4\. \*\*Intervention:\*\*

&nbsp;  - If match found, prevent message from sending

&nbsp;  - Show modal overlay based on strike count

&nbsp;  - Log interaction

5\. \*\*User Action:\*\*

&nbsp;  - Continue (after delay)

&nbsp;  - Choose alternative

&nbsp;  - Override with explanation



\### 3.4 Data Privacy

\- Zero telemetry - nothing leaves user's browser

\- No account creation required

\- No external API calls for detection

\- Open source code (for trust/transparency)



---



\## 4. User Experience Flow



\### 4.1 First-Time Setup (Onboarding)



\*\*Step 1: Welcome Screen\*\*

```

Welcome to \[Name]!



This extension helps you use AI chatbots more intentionally by 

adding gentle guardrails when you're using them to avoid difficult 

conversations with real people.



\[Next]

```



\*\*Step 2: Choose Guardrails\*\*

```

Which topics do you want guardrails for?



☑️ Intimate Relationships (breakups, dating, partner conflicts)

☐ Family Issues (family conflicts, tough conversations)

☑️ Work Conflicts (venting about coworkers, job decisions)

☐ Health Decisions (medical questions, mental health)

☐ Financial Decisions (major purchases, money stress)



You can always change these later.



\[Continue]

```



\*\*Step 3: How It Works\*\*

```

When you start discussing these topics with AI:



Strike 1: Gentle reminder + alternatives

Strike 2: Stronger warning + usage stats

Strike 3: 24-hour block (talk to a real person instead)



\[Optional] Add trusted contacts for reminders

\[Skip this step]



\[Get Started]

```



\*\*Done - Extension is active\*\*



\### 4.2 Typical Intervention Flow



\*\*User types:\*\* "I don't know if I should break up with my girlfriend..."



\*\*Extension detects:\*\* Relationship guardrail triggered (Strike 1)



\*\*Modal appears:\*\*

```

⚠️ Relationship Check-In



It looks like you're discussing relationship decisions.



Consider:

📝 Journaling about this first

💬 Talking to your partner or a friend

⏰ Waiting until tomorrow (it's 2am)



\[Journal Instead]  \[I'll talk to someone]  \[Wait 24hrs]



...or continue anyway (5 seconds)

```



\*\*User can:\*\*

\- Click alternative action (redirects/blocks)

\- Wait 5 seconds and click "Continue anyway"



---



\## 5. Success Metrics



\*\*For MVP validation:\*\*

1\. \*\*Usage\*\*: 100+ active users within first month

2\. \*\*Engagement\*\*: 60%+ of users keep it enabled after 1 week

3\. \*\*Effectiveness\*\*: Users report reduced AI dependency in feedback

4\. \*\*Intervention rate\*\*: 30%+ of interventions lead to alternative action (not override)



\*\*User feedback channels:\*\*

\- Optional anonymous feedback form in dashboard

\- Reddit post reactions (soft launch)

\- GitHub issues (if open source)



---



\## 6. Development Phases



\### Phase 1: Core MVP (Week 1-2)

\- \[ ] Basic keyword detection for 3 categories

\- \[ ] 3-strike modal system

\- \[ ] Simple onboarding flow

\- \[ ] Local storage for settings/logs

\- \[ ] Works on claude.ai only



\### Phase 2: Polish (Week 3)

\- \[ ] Add chat.openai.com support

\- \[ ] Journal interface

\- \[ ] Dashboard with basic stats

\- \[ ] Better UI/UX for modals

\- \[ ] Override functionality



\### Phase 3: Launch Prep (Week 4)

\- \[ ] Testing with 5-10 beta users

\- \[ ] Bug fixes

\- \[ ] Chrome Web Store submission prep

\- \[ ] Anonymous Reddit launch post



\### Phase 4: Post-Launch (Ongoing)

\- \[ ] Add 2 more guardrail categories

\- \[ ] Improve detection accuracy based on feedback

\- \[ ] Consider Firefox version

\- \[ ] Explore mobile options (future)



---



\## 7. Open Questions



1\. \*\*Name:\*\* What should we call this? (Guardrails? Mindful AI? Reflect?)

2\. \*\*Monetization:\*\* Free forever? Freemium model later? Donations?

3\. \*\*Open source:\*\* Fully open from day 1, or wait until stable?

4\. \*\*Contact suggestions:\*\* Should we let users pre-configure trusted contacts, or keep it simpler?

5\. \*\*Mobile:\*\* Eventually build iOS/Android keyboard version, or stay desktop-only?



---



\## 8. Out of Scope for MVP



\*\*Not building yet:\*\*

\- Mobile app/keyboard

\- Account system / cloud sync

\- AI-powered detection (keeping it simple keyword-based)

\- Integration with therapy apps

\- Social features (sharing stats, accountability partners)

\- Custom guardrail creation (just presets for now)

\- Analytics/telemetry (privacy-first approach)



---



\## 9. Risks \& Mitigations



\*\*Risk:\*\* People just uninstall when blocked

\*\*Mitigation:\*\* Make warnings helpful, not punitive. Offer value through insights/logging.



\*\*Risk:\*\* Too many false positives annoy users

\*\*Mitigation:\*\* Start with high-confidence keywords only. Let users adjust sensitivity.



\*\*Risk:\*\* Easy to bypass (disable extension, use different browser)

\*\*Mitigation:\*\* This is intentional - we're building \*reminders\* not \*prison\*. Self-aware users will respect it.



\*\*Risk:\*\* Not enough people relate to the problem

\*\*Mitigation:\*\* Soft launch on Reddit to gauge interest before heavy investment.



---



\## 10. Next Steps



1\. \*\*Name the product\*\* (brainstorm 10 options, pick one)

2\. \*\*Build basic prototype\*\* (keyword detection + modal on claude.ai)

3\. \*\*Test yourself\*\* for 1 week

4\. \*\*Refine based on personal use\*\*

5\. \*\*Build full MVP\*\* following this spec

6\. \*\*Beta test\*\* with 5-10 people

7\. \*\*Launch anonymously\*\* on Reddit

8\. \*\*Iterate\*\* based on feedback



