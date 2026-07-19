# SkillForge — AI-Powered Developer Growth Platform 🚀

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deploys-000000?style=flat-square&logo=vercel)](https://vercel.com/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-2.0_Flash-00D1FF?style=flat-square&logo=google)](https://aistudio.google.com/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/)

SkillForge is a full-stack, AI-powered developer growth platform designed to bridge the gap between a developer's current GitHub profile and their dream job. By analyzing public repositories, language footprint, and commit activity, SkillForge structures a custom, day-by-day learning roadmap using **Google Gemini 2.0 Flash AI** to fill key technical skill gaps.

🔗 **Vercel Live Demo:** [https://skillforge.vercel.app](https://skillforge.vercel.app) *(To be deployed by owner)*

---

## ✦ Key Features

1. **GitHub Profile Analyzer:** Connect via GitHub OAuth to analyze public repositories, aggregate language usage weights, and generate a visual Radar Chart profile across 8 developer domains.
2. **AI Skill Gap Report:** Paste target job listings to parse exact technical requirements and compare them side-by-side with your active capabilities, generating a color-coded priority gaps listing.
3. **Personalized Roadmaps:** Generate custom 30, 60, or 90 day day-by-day study paths with accordion check-ins and curated tutorial/resource suggestions.
4. **Daily Challenges & Streaks:** Engage in daily conceptual quizzes or sandbox coding questions tailored specifically to fill your active gaps, logging consecutive streak counts.
5. **AI Mentor Conversational Chat:** Ask coding questions or explanation drills to an AI career mentor loaded with your repository footprint and roadmap milestones.
6. **Resume AI bullet optimizer:** Pick repositories and generate STAR-method achievements following a high-impact recruiter format.

---

## ✦ Tech Stack

### Frontend (client/)
* **Core:** React JS (v18) + Vite (v5)
* **Styling:** Tailwind CSS v3 (Custom dark sleek theme: `#0A0F1C` backdrop)
* **Icons:** Font Awesome tree-shaking React packages (no CDNs, lightweight)
* **State Management:** Zustand global stores with automatic localStorage sync
* **Visualizations:** Recharts RadarCharts and SVG gauge trackers
* **Animations:** Framer Motion scroll and hover micro-animations

### Backend (server/)
* **Core:** Node.js (v20) + Express.js (v4)
* **Database:** MongoDB Atlas (SCRAM cloud cluster) + Mongoose ODM schemas
* **Authentication:** Passport.js (GitHub OAuth 2.0 Strategy) + JWT verification
* **Schedulers:** node-cron midnight challenge pre-generators
* **AI Engine:** Official `@google/genai` Node.js SDK (BYOK + Demo mock failsafes)

---

## ✦ Monorepo Folder Structure

```
skillforge/
├── client/                     # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout/         # Navbar, Sidebar, Footer (using Font Awesome)
│   │   │   └── UI/             # Reusable Button, Card, Badge, Modal
│   │   ├── pages/              # Landing, Dashboard, Analyze, Challenges, MentorChat, Resume, etc.
│   │   ├── store/              # Zustand global state (useSkillForgeStore)
│   │   ├── utils/              # Axios interceptors (api.js), string helpers
│   │   └── index.css           # Styling directives, Outfit/Inter font imports
│   ├── tailwind.config.js      # Color tokens configuration
│   └── package.json
├── server/                     # Express Backend
│   ├── config/                 # Passport strategies (passport.js)
│   ├── middleware/             # requireAuth JWT verification, CORS settings
│   ├── models/                 # User, SkillGap, Roadmap, Challenge, ChatHistory
│   ├── routes/                 # auth, github, ai, roadmap, challenges, resume, settings
│   ├── services/               # githubService, aiService (Gemini Node SDK), challengeScheduler
│   ├── index.js                # App bootstrap entry point
│   └── package.json
├── .env.example
├── .gitignore
└── README.md
```

---

## ✦ Database Design (Schemas)

SkillForge operates five secure MongoDB collections:
* **`User`**: GitHub profile info, normalized radar skills levels, streak days, custom Gemini key (BYOK), public visibility settings.
* **`SkillGap`**: Captured target job listings, calculated compatibility scores, requirements breakdown.
* **`Roadmap`**: Week-by-week learning accordions and daily completion checkmarks.
* **`Challenge`**: Tailored quiz or sandbox questions linking back to weak categories.
* **`ChatHistory`**: Conversational persistence logs for the AI Mentor.

---

## ✦ Google Gemini SDK: BYOK Model & Demo Failsafes

SkillForge implements an optimized **Bring Your Own Key (BYOK)** model. The user enters their private Gemini API Key on the Settings screen:
* This key is stored in the client store and attached to requests via headers (`x-api-key`). It is never saved permanently on the server, ensuring complete security.
* **Demo Mode Failsafe:** If no key is entered (or the key expires), the backend service (`aiService.js`) dynamically spins up high-fidelity, customized mockup generators flagged with `isDemo: true`, keeping the entire app fully functional for preview!

---

## ✦ Local Development Guide

### Prerequisites
* Node.js (v20+)
* MongoDB Atlas Cluster account
* GitHub Developer Account

### 1. Configure the `.env` Credentials
Create a `.env` file inside the `server/` directory and populate your keys:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Connection (MongoDB Atlas Cloud DB)
Enter Here Your Monogo DB Connection URI

# GitHub OAuth Configurations
GITHUB_CLIENT_ID=Your Github Client ID
GITHUB_CLIENT_SECRET=Your Github Client Secret here !
GITHUB_CALLBACK_URL=Your Github Callback URL

# Security Keys
JWT_SECRET=Your Security KEY
SESSION_SECRET=Seesion Secret Here!

# Client Configuration
CLIENT_URL=http://localhost:5173
VITE_API_URL=http://localhost:5000
```

### 2. Boot the Express Server
```bash
cd server
npm install
npm run dev
```
The server will start on **`http://localhost:5000`** and log active MongoDB connections.

### 3. Boot the React Frontend
Open a new terminal window:
```bash
cd client
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser to access the platform!

---

## ✦ Production Cloud Deployment

### 1. Backend: Deploy to Railway / Render
1. Push your monorepo code to a GitHub repository.
2. Link the repository to Railway or Render.
3. Configure the start command: `npm --prefix server start`
4. Set all Environment Variables from the `.env` file in the hosting dashboard.

### 2. Frontend: Deploy to Vercel
1. Link your GitHub repository to Vercel.
2. Select the `client` directory as the root.
3. Build Command: `vite build`
4. Output Directory: `dist`
5. Configure Environment Variables:
   * `VITE_API_URL`: Your deployed backend URL (e.g. `https://skillforge-api.up.railway.app`)
6. Deploy!
7. **Important:** Go to your GitHub developer settings and update the **Authorization callback URL** and **Homepage URL** to point to your live deployed domain!
   * Callback: `https://skillforge-api.up.railway.app/api/auth/github/callback`
   * Homepage: `https://skillforge.vercel.app`
