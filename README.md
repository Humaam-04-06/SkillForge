# SkillForge — AI-Powered Developer Growth Platform

SkillForge reads a developer's GitHub profile, analyzes job descriptions using Google Gemini AI, identifies skill gaps, and generates a personalized learning roadmap complete with daily challenges, an AI mentor chat, and recruiter-ready resume bullets.

## Tech Stack
- **Frontend:** React (Vite), Tailwind CSS v3, Recharts, Framer Motion, Zustand, Font Awesome Icons
- **Backend:** Node.js, Express, MongoDB (Mongoose), Passport.js (GitHub OAuth 2.0), JWT
- **AI Integration:** Google Gemini 2.0 Flash (via `@google/genai` Node.js SDK, BYOK Model)

## Getting Started

### Prerequisites
- Node.js (v20+ recommended)
- MongoDB Atlas account (or local MongoDB)
- GitHub account (to register an OAuth application)

### Installation & Setup

1. Clone the repository and navigate to the project directory:
   ```bash
   cd SkillForge
   ```

2. Create a `.env` file in the root folder using `.env.example` as a template:
   ```bash
   cp .env.example .env
   ```
   Update the fields inside `.env` with your MongoDB connection string, GitHub OAuth secrets, and other parameters.

3. Install dependencies and start the backend:
   ```bash
   cd server
   # Create a copy of .env in the server folder or symlink it
   cp ../.env .env
   npm install
   npm run dev
   ```

4. Install dependencies and start the frontend:
   ```bash
   cd ../client
   # Create a copy of .env in the client folder or symlink it
   cp ../.env .env
   npm install
   npm run dev
   ```

## Folder Structure
- `client/`: React UI layer
- `server/`: Express REST API endpoints and services
- `SkillForge_Master_Plan.pdf`: Complete architecture document
