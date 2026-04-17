# Focus OS 🎯

> **Transform breaks from productivity black holes into genuine rest**

A revolutionary focus and break management system that doesn't just track your work time — it actively guides your breaks to prevent infinite scroll spirals and ensure you actually recharge.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18-61dafb.svg)
![Status](https://img.shields.io/badge/status-hackathon-orange.svg)

---

## 🎥 Demo

[Add demo GIF/video here after building]

**Try it live:** [Add deployment link]

---

## 🧠 The Problem

Everyone knows this cycle:
```
Work 1 hour → "Quick 5-min break" → Open Instagram → 2 hours later → Guilt → Can't focus → Day ruined
```

**Current productivity apps** only manage work time. They leave you stranded at the break with no structure, no guidance, and infinite temptation.

**Result:** Breaks that drain you instead of recharge you.

---

## 💡 Our Solution

**Focus OS actively manages your breaks**, not just your work sessions.

### Key Innovation: Break Enforcement & Guidance

- **Pre-commitment:** Choose your break type BEFORE temptation hits
- **Active guidance:** Step-by-step instructions (not passive blocking)
- **Hard boundaries:** App enforces time limits automatically
- **Quality rest:** Movement, hydration, meditation — breaks that actually recharge
- **Controlled rewards:** Want Instagram? Fine. 20 minutes, Feed only, Reels blocked, force-close at time limit

### The Result
No willpower required. No 2-hour scroll spirals. No guilt. Just real rest that brings you back refreshed.

---

## ✨ Core Features

### 🔒 Lock-In Phase
- Single-task commitment interface
- AI-powered "next step" suggestions
- Vault-style transition (signature wow moment)

### ⚡ Focus Mode
- Distraction-free workspace
- Exit friction mechanism (hold-to-exit prevents impulsive breaks)
- Clean, minimal timer UI

### 🎯 Break Management (The Game Changer)
Four break types with active guidance:

1. **⚡ Energize (7 min)**
   - Guided movement prompts
   - Hydration reminders
   - Motion detection verification

2. **🧠 Recharge (15 min)**
   - Meditation guidance
   - Rest protocols
   - Eye strain relief

3. **🎮 Reward (20 min)**
   - Controlled app access (blocks infinite scroll features)
   - Progressive warnings (15min, 19min, 20min)
   - Hard force-close at time limit

4. **☕ Social (10 min)**
   - Real human interaction prompts
   - Screen-free encouragement

### 🔄 Re-entry System
- Task context restoration
- AI-generated micro-action ("Start here: Write just the first sentence")
- Instant flow state recovery

### 📊 Session Truth Card
- Planned vs actual focus time
- Distraction analysis
- Actionable insights (no vanity metrics)

---

## 🏗️ Architecture

### Tech Stack
- **Frontend:** React 18 + Vite + TailwindCSS
- **Animations:** Framer Motion (vault transitions, hold gestures)
- **State:** Zustand + persist middleware
- **Storage:** localStorage + IndexedDB (idb-keyval)
- **AI:** Anthropic Claude API (serverless edge function)
- **Deployment:** Vercel

### State Machine Design
```
IDLE → LOCK_IN → FOCUSED → EXIT_FRICTION → BREAK → REENTRY → SUMMARY
          ↑                                            ↓
          └────────────────────────────────────────────┘
```

### Data Flow
```
User commits task → AI generates next step (async)
       ↓
  Focus session → User needs break → Pre-commitment to break type
       ↓
 Active guidance → Hard time limit → Force app close
       ↓
  Re-entry screen → AI suggestion (pre-cached) → Back to focus
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/focus-os.git
cd focus-os

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your Anthropic API key to .env

# Start development server
npm run dev
```

### Environment Variables

```env
VITE_ANTHROPIC_API_KEY=your_api_key_here
```

---

## 📁 Project Structure

```
focus-os/
├── src/
│   ├── screens/              # One file per screen state
│   │   ├── Dashboard.jsx
│   │   ├── LockIn.jsx
│   │   ├── FocusMode.jsx
│   │   ├── ExitFriction.jsx
│   │   ├── Break.jsx         # Active break guidance
│   │   ├── Reentry.jsx       # The money shot
│   │   └── Summary.jsx
│   ├── components/
│   │   ├── HoldRing.jsx      # SVG hold gesture
│   │   ├── FocusTimer.jsx
│   │   ├── TruthCard.jsx     # Session stats
│   │   ├── AIStepCard.jsx
│   │   └── BreakGuide.jsx    # Active break component
│   ├── store/
│   │   ├── useFocusStore.js  # Zustand store
│   │   └── cycleEngine.js    # State machine
│   ├── hooks/
│   │   ├── useAINextStep.js
│   │   ├── useHoldGesture.js
│   │   └── useBreakEnforcer.js
│   └── api/
│       └── ai-suggest.js     # Edge function
├── public/
├── package.json
└── README.md
```

---

## 🎯 Hackathon Build Timeline (24 Hours)

| Hours | Task | Status |
|-------|------|--------|
| 0-2   | Zustand store + state machine + routing | ⏳ |
| 2-4   | Lock-In screen + Focus Mode timer | ⏳ |
| 4-6   | Exit Friction (HoldRing component) | ⏳ |
| 6-8   | Break guidance system (core innovation) | ⏳ |
| 8-10  | Re-entry screen + AI integration | ⏳ |
| 10-12 | Session Truth Card + basic dashboard | ⏳ |
| 12-20 | UI polish: vault transitions, animations | ⏳ |
| 20-24 | Demo prep + testing | ⏳ |

---

## 🎨 Design Philosophy

### Behavioral Design Principles
1. **Pre-commitment beats willpower** - Choose break type before temptation
2. **Active > Passive** - Guide breaks, don't just block apps
3. **Friction for good** - Hold-to-exit adds intentionality
4. **Truth over vanity** - Show real focus time, not inflated numbers

### UI/UX Decisions
- **Vault lock transition** - Closing doors signal full commitment
- **Linear flow** - No nav bar, always one step forward/back
- **Instant re-entry** - AI suggestion pre-cached for 0ms perceived latency
- **Dark theme** - Reduces eye strain during focus sessions

---

## 🔬 Key Differentiators

| Feature | Traditional Focus Apps | Focus OS |
|---------|----------------------|----------|
| Work tracking | ✅ Timer + stats | ✅ Full state machine |
| Break management | ❌ Just a timer | ✅ Active guidance + enforcement |
| Break quality | ❌ Passive blocking | ✅ Pre-commitment + step-by-step |
| Infinite scroll prevention | ❌ None | ✅ Force-close with hard limits |
| Re-entry support | ❌ None | ✅ AI micro-actions + context |
| Truth metrics | ⚠️ Vanity stats | ✅ Actual focus time |

---

## 📊 Future Roadmap

### Phase 2 (Months 1-3)
- [ ] Cloud sync (Supabase)
- [ ] User accounts & authentication
- [ ] Cross-device session continuity

### Phase 3 (Months 3-6)
- [ ] Chrome extension (real tab tracking)
- [ ] Pattern insights dashboard
- [ ] Mobile app (React Native)

### Phase 4 (Months 6-12)
- [ ] Calendar integration (Google/Outlook)
- [ ] Task import (Notion/Linear)
- [ ] Team focus rooms
- [ ] Manager dashboard

### Monetization Strategy
- **Free:** 3 sessions/day, 7-day history
- **Pro ($8/mo):** Unlimited + AI + patterns + calendar sync
- **Teams ($12/seat):** Shared rooms + analytics

---

## 🧪 Testing

```bash
# Run tests
npm test

# Run linting
npm run lint

# Build for production
npm run build
```

---

## 🤝 Contributing

This is a hackathon project, but we welcome contributions!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

---

## 👥 Team

- **[Your Name]** - [GitHub](https://github.com/yourusername) | [LinkedIn](https://linkedin.com/in/yourprofile)
- **[Team Member 2]** - Role
- **[Team Member 3]** - Role

Built with ❤️ for [Hackathon Name] 2024

---

## 🙏 Acknowledgments

- Anthropic Claude API for AI-powered suggestions
- Inspiration from Deep Work by Cal Newport
- All the productivity app users who are tired of infinite scroll spirals

---

## 📞 Contact

**Project Link:** https://github.com/yourusername/focus-os

**Questions?** Open an issue or reach out to [your.email@example.com]

---

<div align="center">

**⭐ Star this repo if Focus OS helped you reclaim your attention! ⭐**

</div># summer_hacks_focus_os
