<p align="center">
  <img src="https://img.shields.io/badge/Theme-Squid_Games-ff0066?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHRleHQgeD0iNTAlIiB5PSI1MCUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW55LWJhc2VsaW5lPSJjZW50cmFsIiBmb250LXNpemU9IjE2Ij7wn46tPC90ZXh0Pjwvc3ZnPg==&labelColor=0a0a0a" alt="Theme: Squid Games"/>
  <img src="https://img.shields.io/badge/Node.js-Express-39ff14?style=for-the-badge&logo=node.js&labelColor=0a0a0a" alt="Node.js + Express"/>
  <img src="https://img.shields.io/badge/Database-MongoDB-39ff14?style=for-the-badge&logo=mongodb&labelColor=0a0a0a" alt="MongoDB"/>
  <img src="https://img.shields.io/badge/Auth-Google_OAuth_2.0-ff0066?style=for-the-badge&logo=google&labelColor=0a0a0a" alt="Google OAuth"/>
</p>

<h1 align="center">🎭 The Masked Arena</h1>

<p align="center">
  <strong>A Squid Games-Themed Anonymous Confession Platform for College Students</strong>
</p>

<p align="center">
  <em>Everyone hides behind a mask. Drop your truth. No names, no faces — just raw, unfiltered confessions from behind the mask.</em>
</p>

---

## 🎬 Concept & Theme

**The Masked Arena** is a campus-oriented anonymous confession platform inspired by the visual aesthetics and psychological tension of **Squid Games**. The core philosophy mirrors the show: *everyone wears a mask, everyone is equal, and your identity is hidden*.

In the arena, students become **Players** — anonymous masked figures who can share their deepest confessions, campus secrets, and unfiltered thoughts without fear of judgment. The entire experience is wrapped in a dark, neon-lit atmosphere that brings the intensity of the Squid Games universe to a college-friendly, youth-targeted web application.

### 🎨 Design Language

| Element | Implementation |
|---|---|
| **Color Palette** | Jet black (`#0a0a0a`) background, **Neon Pink** (`#ff0066`), **Neon Green** (`#39ff14`) |
| **Typography** | `Orbitron` — futuristic display font for headings & game UI; `Inter` — clean body text |
| **Identity** | 🎭 Mask icons replace all profile imagery. Users are `Player #XXX` identities |
| **Language** | Confessions → "Messages from the Masked" · Feed → "The Arena" · Delete → "Eliminate" |
| **Visual FX** | CRT scanline overlay, glitch text animations, neon glow pulses, gradient border sweeps |
| **Glassmorphism** | Dark translucent cards with blurred backdrops and neon border accents |

---

## ✨ Features & Functionalities

### 🔐 Authentication
- **Google OAuth 2.0** sign-in via Passport.js
- Session-based authentication with `express-session`
- Automatic redirect to arena after successful login
- Secure logout with session cleanup

### 🎭 Anonymous Confessions (Messages from the Masked)
- **Drop Messages**: Write and post anonymous confessions with a randomly generated `AnonID` (e.g., `Anon84721`)
- **Vibe Tagging**: Categorize messages with vibes — 💘 Crush, 📖 Study, 😈 Funny, 🤫 Secret
- **Custom Tags**: Add hashtags for discoverability (e.g., `#masked_truth`, `#late_night_feels`)
- **Secret Code Protection**: Each message is secured with a user-defined secret code, required to edit or eliminate the message later
- **Arena Feed**: Real-time scrollable feed of all messages, sorted newest-first

### ⚡ Reactions System
- **Three Reaction Types**: 💗 Heart, 😈 Laugh, 💀 Sad — themed to match the arena aesthetic
- **Toggle Reactions**: Click to react, click again to switch reaction type
- **Per-User Tracking**: Each user can only have one active reaction per message, preventing spam
- **Real-Time Counts**: Reaction counts update instantly on the UI

### 💬 Arena Chat (Comments)
- **Threaded Comments**: Open the Arena Chat modal on any confession to view and post comments
- **Anonymous Attribution**: Comments show as "you" or "masked player" — never revealing real identity
- **Comment Counts**: Visible on each confession card in the feed

### 📋 Message Management
- **Edit Messages**: Modify your confession text and vibe — requires the original secret code
- **Eliminate Messages**: Permanently delete a confession — requires secret code verification
- **Error Handling**: Clear error messages for wrong secret codes or missing fields

### 📂 My Missions (History & Drafts)
- **My Drops**: View all your posted confessions in one place with edit/delete actions
- **Drafts**: Save incomplete messages as local drafts (stored in `localStorage`)
  - Continue editing drafts later
  - Delete unwanted drafts
- **Saved Posts**: Bookmark other players' confessions to revisit later
  - Save/Unsave toggle on every confession card
  - View all saved posts in the Saved tab

### 🔥 Sidebar — Arena Intelligence
- **Arena Buzz**: Trending topics with themed icons (🎭 Masked Confession, 💀 Dark Secret, 🃏 Plot Twist)
- **Arena Rules**: Community guidelines displayed prominently (✦ Hide Your Identity, ✦ No Real Names, ✦ Respect The Game)
- **Arena Tags**: Clickable hashtag pills with neon hover effects
- **Arena Pulse**: Visual mood bars showing the arena's emotional state (Intense vs. Chill)

### 📊 Player Dashboard (Right Sidebar)
- **Player Profile**: Displays masked identity with player number and division
- **Stats**: Count of messages dropped and reactions received
- **Arena Intel**: Peak hours, arena mood, total messages, reactions given, arenas online

### 🎯 Feed Filtering
- Filter confessions by vibe category: 🎭 All, 💘 Crush, 📖 Study, 😈 Funny, 🤫 Secret
- Active filter highlighted with neon pink glow
- Smooth re-rendering on filter change

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | HTML5, Vanilla CSS3, Vanilla JavaScript (ES6+) |
| **Backend** | Node.js, Express.js 5 |
| **Database** | MongoDB with Mongoose ODM |
| **Authentication** | Passport.js with Google OAuth 2.0 Strategy |
| **Session Management** | express-session |
| **Environment** | dotenv for configuration |
| **Fonts** | Google Fonts (Orbitron, Inter) |

---

## 📁 Project Structure

```
Minor-Project-2/
├── client/                      # Frontend (served as static files)
│   ├── index.html               # Landing page — "Enter The Arena"
│   ├── app.html                 # Main app — The Arena feed, sidebars, modals
│   ├── styles.css               # Complete Squid Games design system
│   └── script.js                # Client-side logic (confessions, reactions, comments, drafts)
│
├── server/                      # Backend
│   ├── server.js                # Express app entry point (port 3000)
│   ├── .env                     # Environment variables (OAuth keys, DB URI, session secret)
│   ├── package.json             # Dependencies and scripts
│   │
│   ├── config/
│   │   ├── db.js                # MongoDB connection via Mongoose
│   │   └── passport.js          # Google OAuth 2.0 strategy configuration
│   │
│   ├── models/
│   │   └── confession.js        # Mongoose schema (confession, reactions, comments)
│   │
│   └── routes/
│       ├── authRoutes.js        # Google OAuth login/callback/logout/user routes
│       └── confessionRoutes.js  # CRUD + reactions + comments API
│
└── README.md                    # This file
```

---

## 🔌 API Endpoints

### Authentication (`/auth`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/auth/google` | Initiates Google OAuth login flow |
| `GET` | `/auth/google/callback` | OAuth callback — redirects to `/app.html` |
| `GET` | `/auth/user` | Returns the current authenticated user or `null` |
| `GET` | `/auth/logout` | Logs out the user and redirects to `/` |

### Confessions (`/confessions`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/confessions` | Fetch all confessions (sorted newest first) |
| `POST` | `/confessions` | Create a new anonymous confession |
| `GET` | `/confessions/my` | Fetch current user's confessions |
| `PUT` | `/confessions/:id` | Edit a confession (requires secret code) |
| `DELETE` | `/confessions/:id` | Delete a confession (requires secret code) |
| `POST` | `/confessions/:id/react` | Add/change a reaction (heart, laugh, sad) |
| `POST` | `/confessions/:id/comment` | Add a comment to a confession |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18+ recommended)
- **MongoDB** running locally or a MongoDB Atlas connection
- **Google Cloud Console** project with OAuth 2.0 credentials

### 1. Clone the Repository

```bash
git clone https://github.com/Phoenix-Noah0806/Minor-Project-2.git
cd Minor-Project-2
```

### 2. Install Dependencies

```bash
cd server
npm install
```

### 3. Configure Environment Variables

Create or edit `server/.env`:

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
MONGO_URI=mongodb://127.0.0.1:27017/confessionDB
SESSION_SECRET=your_session_secret
```

### 4. Start MongoDB

Ensure MongoDB is running locally:

```bash
mongod
```

### 5. Start the Server

```bash
cd server
npm start
```

The server runs on **http://localhost:3000**.

### 6. Open in Browser

Navigate to:

```
http://localhost:3000
```

You'll be greeted by **The Masked Arena** landing page. Sign in with Google to enter the arena.

---

## 🎮 User Flow

```
┌─────────────────────────────────────┐
│         🎭 LANDING PAGE             │
│   "The Masked Arena"                │
│   Sign in with Google               │
└──────────────┬──────────────────────┘
               │ OAuth
               ▼
┌─────────────────────────────────────┐
│         🎭 THE ARENA                │
│  ┌─────────┬──────────┬──────────┐  │
│  │  Left   │   Feed   │  Right   │  │
│  │ Sidebar │  Cards   │ Sidebar  │  │
│  │         │          │          │  │
│  │ • Buzz  │ • View   │ • Player │  │
│  │ • Rules │ • React  │   Stats  │  │
│  │ • Tags  │ • Chat   │ • Intel  │  │
│  │ • Pulse │ • Save   │          │  │
│  └─────────┴──────────┴──────────┘  │
│                                     │
│  [Drop Message] → Write Modal       │
│  [My Missions]  → History Modal     │
└─────────────────────────────────────┘
```

---

## 🧠 Design Philosophy

### Why Squid Games?

1. **Masked Identity** — The show's players are numbered and masked, mirroring the anonymous confession concept perfectly. Every user becomes a faceless player in the arena.

2. **Youth Appeal** — Squid Games is a cultural phenomenon among college-age audiences. The aesthetic is instantly recognizable and engaging.

3. **Tension & Excitement** — The neon-drenched, high-stakes visual language transforms mundane confessions into thrilling "messages from the masked."

4. **Equality** — In both the show and the app, everyone is equal behind the mask. No social hierarchy, no reputation — just raw truth.

### Visual Design Choices

- **Pure Black Background**: Creates dramatic contrast for neon elements, mimicking the show's dark corridors
- **Neon Pink (`#ff0066`)**: Primary action color — represents intensity, danger, and the iconic Squid Games pink
- **Neon Green (`#39ff14`)**: Secondary/success color — represents the game's surveillance systems and player numbers
- **Scanline Overlay**: Subtle CRT television effect adds a surveillance/retro-tech atmosphere
- **Glitch Text**: The title animation references digital interference, adding unease and edge
- **Orbitron Font**: Futuristic, geometric typeface evokes game terminals and sci-fi interfaces

---

## 📸 Pages Overview

### Landing Page (`index.html`)
- Hero section with glitch-animated "THE MASKED ARENA" title
- Feature badges: Masked Identity, The Arena Feed, Zero Judgement
- Google OAuth sign-in card with neon glow effects
- Floating mask decorations and animated neon background orbs

### The Arena (`app.html`)
- **3-column responsive layout**: Left sidebar (Arena Buzz, Rules, Tags, Pulse) → Feed (filterable confession cards) → Right sidebar (Player Dashboard, Stats, Intel)
- **5 modals**: Drop Message, Edit Message, Eliminate Message, Arena Chat, My Missions
- **Confession cards**: Dark glassmorphism cards with mask icon avatars, neon category badges, themed reaction buttons, and gradient top-border animation on hover

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-game-mode`)
3. Commit your changes (`git commit -m 'Add new arena feature'`)
4. Push to the branch (`git push origin feature/new-game-mode`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the ISC License.

---

<p align="center">
  <strong>🎭 Everyone wears a mask. What's behind yours?</strong>
</p>
