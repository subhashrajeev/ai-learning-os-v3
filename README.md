# 🧠 Personalized AI Learning System

**Version:** 2.0 (10X Upgrade)  
**Built for:** 100x Engineers Cohort Capstone  
**Tech Stack:** Next.js 15 + React 19 + Gemini AI

---

## ✨ What's New (10X Improvements)

| Feature | Before (v1) | After (v2) |
|---------|-------------|------------|
| **UI/UX** | Basic Streamlit | Premium Anthopic/Claude-themed design |
| **Personalization** | 4 simple fields | Deep multi-step profiling wizard |
| **Persistence** | Session only (lost on refresh) | LocalStorage with full state sync |
| **Adaptability** | Static 7-day plan | AI-powered pace analysis & adjustment |
| **Validation** | None | Practice mode with AI-generated quizzes |
| **Habit Formation** | None | Streak tracking with animations |
| **Ecosystem** | Generic LLM summary | Personalized "Why it matters to YOU" |
| **Progress** | None visible | Dashboard with stats, charts, goals |

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create a `.env.local` file with your Gemini API key:
```env
NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here
```

Get your API key from: [Google AI Studio](https://aistudio.google.com/app/apikey)

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## 📂 Project Structure

```
src/
├── app/
│   ├── layout.jsx       # Root layout with fonts & metadata
│   ├── page.jsx         # Main app with view routing
│   └── globals.css      # Claude-themed design system
├── components/
│   ├── Navigation.jsx   # Top nav with streak display
│   ├── Onboarding.jsx   # Multi-step profiling wizard
│   ├── Dashboard.jsx    # Stats, progress, recommendations
│   ├── LearningPath.jsx # Visual timeline roadmap
│   ├── DailyLesson.jsx  # Lesson viewer with timer
│   ├── PracticeMode.jsx # AI-generated quizzes
│   └── EcosystemPulse.jsx # Personalized AI news
└── lib/
    ├── gemini.js        # AI client for all generations
    └── storage.js       # LocalStorage persistence layer
```

---

## 🎨 Design System (Claude Theme)

| Element | Value |
|---------|-------|
| Primary | `#cc785c` (Claude orange) |
| Surface | Glassmorphism with backdrop-blur |
| Dark BG | `#1a1a1a` |
| Radius | 10-24px for cards |
| Animations | Framer Motion throughout |

---

## 🔑 Key Features

### 1. Deep Onboarding
- Multi-step wizard capturing role, experience, goals
- Learning style & time commitment preferences
- AI instantly generates personalized curriculum

### 2. Adaptive Learning Engine
- 7-day micro-learning curriculum
- Tracks completion speed and quiz scores
- Suggests pace adjustments

### 3. Streak & Habit Formation
- Daily streak counter with fire animation 🔥
- Visible progress motivates consistency
- Recovery messaging for broken streaks

### 4. Practice Mode
- AI-generated quizzes per topic
- Multiple choice & true/false questions
- Explanations for every answer
- Score tracking across sessions

### 5. Ecosystem Pulse
- AI-curated news filtered by YOUR goals
- "Why it matters to you" for each update
- Save for later functionality
- Category filtering

### 6. Progress Dashboard
- Streak display
- Completion percentage
- Time invested
- AI recommendations

---

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **UI:** React 19 + Custom CSS
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **AI:** Google Gemini 2.0 Flash
- **Storage:** Browser LocalStorage

---

## 📝 API Routes (Optional Extension)

The app is fully client-side, but can be extended with API routes:
- `/api/learning` - Curriculum generation
- `/api/practice` - Quiz generation
- `/api/ecosystem` - News updates

---

## 🎯 Evaluation Criteria Mapping

| Criteria | How We Address It |
|----------|-------------------|
| **Clarity of thinking** | Clean component architecture, single responsibility |
| **Quality of personalization** | Deep profiling, AI-adapted content, filtered news |
| **Learning design** | Micro-learning, spaced repetition hints, practice mode |
| **System coherence** | Unified theme, consistent navigation, progress sync |
| **Daily use readiness** | Streak tracking, quick actions, mobile responsive |

---

## 🚧 Future Roadmap

- [ ] Vector DB for long-term memory
- [ ] Spaced repetition scheduler
- [ ] Browser notifications for reminders
- [ ] Export learning history
- [ ] Social sharing of achievements

---

## 📄 License

MIT - Built for 100x Engineers Capstone

---

Created with ❤️ by Rajeev
