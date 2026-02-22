# 🏆 ArenaOfCoders — Tunisian Arena of Coders

> A competitive coding platform for Tunisian developers — compete in real-time coding arenas, join hackathons, stream your sessions, and climb the leaderboard.

---

## 📌 Repository Structure

This repository is organized into two main branches:

| Branch | Description | Stack |
|---|---|---|
| [`backend`](https://github.com/Souhaila4/tunisianarenaofcoders-web/tree/backend) | REST API & server logic | NestJS · Prisma · MongoDB |
| [`frontend`](https://github.com/Souhaila4/tunisianarenaofcoders-web/tree/frontend) | Web application UI | Next.js 16 · Tailwind CSS · Stream.io |

---

## 🔍 Overview

**ArenaOfCoders** is a full-stack web platform designed specifically for Tunisian developers. It combines competitive programming, live streaming, AI-powered skill classification, and real-time communication into a single platform.

### Key Features

- 🥊 **Coding Arenas** — Join real-time coding competitions against other developers
- 🏅 **Hackathons** — Participate in timed hackathon challenges with prize pools
- 📡 **Live Streaming** — Stream your coding sessions and watch others in real time
- 💬 **Real-time Chat** — In-arena messaging powered by Stream Chat
- 🤖 **AI CV Parsing** — Upload your CV and get auto-classified by specialty (Frontend, Backend, DevOps, etc.)
- 🐙 **GitHub Integration** — Automatically fetch and display your latest public repositories
- 🏆 **Leaderboard** — Global rankings based on wins, challenges solved, and wallet balance
- 🔐 **Full Auth Flow** — Register, email verification, login, forgot/reset password

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Client (Browser)                  │
│              Next.js 16 — port 3001                  │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP / REST
┌──────────────────────▼──────────────────────────────┐
│                  NestJS Backend                      │
│                    port 3000                         │
│  Auth · Users · Scraper · Stream · CV Extraction    │
└──────────────────────┬──────────────────────────────┘
                       │ Prisma ORM
┌──────────────────────▼──────────────────────────────┐
│                    MongoDB Atlas                     │
└─────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/Souhaila4/tunisianarenaofcoders-web.git
cd tunisianarenaofcoders-web
```

### 2. Set up the Backend

```bash
git checkout backend
npm install
# Create .env file (see backend branch README for variables)
npx prisma generate
npx prisma db push
npm run start:dev
# API running at http://localhost:3000
# Swagger docs at http://localhost:3000/api
```

### 3. Set up the Frontend

```bash
git checkout frontend
npm install
# Create .env.local file (see frontend branch README for variables)
npm run dev
# App running at http://localhost:3001
```

---

## 📚 Detailed Documentation

For full setup instructions, environment variables, and API reference:

- 📖 **[Backend README](https://github.com/Souhaila4/tunisianarenaofcoders-web/blob/backend/README.md)** — NestJS API, Prisma, MongoDB, all modules explained
- 📖 **[Frontend README](https://github.com/Souhaila4/tunisianarenaofcoders-web/blob/frontend/README.md)** — Next.js app, pages, components, Stream.io integration

---

## 🛠️ Tech Stack Summary

**Backend**
- [NestJS](https://nestjs.com) v11 — modular Node.js framework
- [Prisma](https://www.prisma.io) v6 — type-safe ORM
- MongoDB — NoSQL database
- JWT + Passport.js — authentication
- Nodemailer — transactional emails
- Stream.io Node SDK — live video/streaming
- Swagger — auto-generated API docs

**Frontend**
- [Next.js](https://nextjs.org) 16 — React framework (App Router)
- TypeScript
- [Tailwind CSS](https://tailwindcss.com) v4 — utility-first styling
- [Framer Motion](https://www.framer.com/motion) — animations
- [Stream Chat React](https://getstream.io/chat/sdk/react) — real-time messaging
- [Stream Video React SDK](https://getstream.io/video/sdk/react) — live streaming

---

## 📄 License

This project is private and proprietary — **Tunisian Arena of Coders**.
