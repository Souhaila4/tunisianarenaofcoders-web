# 🏆 ArenaOfCoders — Frontend

> The **ArenaOfCoders** web application — built with **Next.js 16**, **TypeScript**, **Tailwind CSS**, and **Stream.io** for real-time chat and video.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Pages & Features](#pages--features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the App](#running-the-app)
- [Build & Deploy](#build--deploy)

---

## 🔍 Overview

ArenaOfCoders is a competitive coding platform for Tunisian developers. This repository contains the **Next.js frontend** — a modern, animated web interface where users can sign up, compete in coding arenas and hackathons, chat in real time, watch live coding streams, and track their rankings on leaderboards.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js](https://nextjs.org) 16 (App Router) |
| Language | TypeScript |
| Styling | [Tailwind CSS](https://tailwindcss.com) v4 |
| Animations | [Framer Motion](https://www.framer.com/motion) |
| Real-time Chat | [Stream Chat React](https://getstream.io/chat/sdk/react) |
| Live Video | [Stream Video React SDK](https://getstream.io/video/sdk/react) |
| HTTP Client | Native `fetch` / custom API wrapper |

---

## 📁 Project Structure

```
app/
├── layout.tsx                  # Root layout (fonts, global providers)
├── globals.css                 # Global Tailwind styles
├── page.tsx                    # Landing / home page
├── signin/                     # Login page
├── signup/                     # Registration page
├── forgot-password/            # Forgot password page
├── reset-password/             # Reset password page
├── verify/                     # Email verification page
├── resend-verification/        # Resend verification email
├── dashboard/                  # User dashboard
├── profile/                    # User profile page
├── settings/                   # Account settings
├── arena/                      # Coding arena (competition rooms)
├── hackathon/                  # Hackathon listings & rooms
├── chat/                       # Real-time chat (Stream Chat)
├── classements/                # Leaderboard / rankings
├── components/
│   ├── AnimatedTechBackground.tsx   # Animated particle background
│   ├── PlatformNavbar.tsx           # Main navigation bar
│   ├── home/                        # Landing page sections
│   ├── arena/                       # Arena-specific components
│   ├── room/                        # Competition room UI
│   ├── stream/                      # Live stream viewer components
│   └── ui/                          # Reusable UI primitives
├── contexts/
│   └── AccessibilityContext.tsx     # Accessibility state provider
├── lib/
│   ├── api.ts                       # API call helpers (auth, user, etc.)
│   └── translations.ts              # i18n / translation strings
└── api/
    └── [...path]/                   # Next.js API proxy routes
```

---

## 📄 Pages & Features

| Route | Description |
|---|---|
| `/` | Animated landing page with hero, features, and CTA |
| `/signin` | Login form with JWT authentication |
| `/signup` | Registration with email verification flow |
| `/forgot-password` | Send password reset email |
| `/reset-password` | Set new password via token |
| `/verify` | Confirm email address |
| `/dashboard` | Personal stats, recent activity, wallet balance |
| `/profile` | View/edit profile, GitHub & LinkedIn links, CV upload |
| `/settings` | Account settings, notifications, accessibility |
| `/arena` | Browse and join coding competition rooms |
| `/hackathon` | Hackathon events list and room view |
| `/chat` | Real-time messaging powered by Stream Chat |
| `/classements` | Global leaderboard sorted by wins and challenges |

---

## ✅ Prerequisites

- Node.js >= 18
- npm >= 9
- Backend API running at `http://localhost:3000` (see backend branch)

---

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/Souhaila4/tunisianarenaofcoders-web.git
cd tunisianarenaofcoders-web

# Switch to frontend branch
git checkout frontend

# Install dependencies
npm install
```

---

## 🔐 Environment Variables

Create a `.env.local` file at the project root:

```env
# Backend API base URL
NEXT_PUBLIC_API_URL="http://localhost:3000"

# Stream.io (Chat & Video)
NEXT_PUBLIC_STREAM_API_KEY="your_stream_api_key"
```

---

## 🚀 Running the App

```bash
# Development server (runs on port 3001)
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

> The app runs on **port 3001** by default so it doesn't conflict with the backend on port 3000.

---

## 🏗 Build & Deploy

```bash
# Production build
npm run build

# Start production server
npm run start

# Lint
npm run lint
```

---

## 📄 License

This project is private and proprietary.

---

## Getting Started (quick)

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
