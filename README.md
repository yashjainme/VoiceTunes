# 🎵 Votetunes

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![MySQL](https://img.shields.io/badge/MySQL-Database-4479A1?style=for-the-badge&logo=mysql)](https://www.mysql.com/)
[![Razorpay](https://img.shields.io/badge/Razorpay-Payments-0C2451?style=for-the-badge&logo=razorpay)](https://razorpay.com/)
[![NextAuth](https://img.shields.io/badge/NextAuth-Auth-7C3AED?style=for-the-badge)](https://next-auth.js.org/)

> **Let your audience decide what plays next — or pay to skip the queue.**

Votetunes is a **real-time collaborative music queue** for live streamers. Your audience can vote on songs in the regular queue, or pay via Razorpay to jump straight to the top of a priority lane. As a creator, you control what plays.

---

## 🔑 Two Roles

| Role | How to Access | What They Can Do |
|------|--------------|-----------------|
| **Creator** | Log in → Dashboard (`/dashboard`) | Submit songs, advance the queue (priority & regular), share their stream link |
| **Audience** | Shared link → `/creator/<id>` | Submit songs, vote up/down in the regular queue, make priority payment requests |

> **Share your stream:** From the Dashboard, click the **Share Stream** button — it copies `/creator/<your-user-id>` to send to your audience.

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────┐
│                     Browser                       │
│                                                  │
│  ┌────────────┐   ┌──────────────┐              │
│  │  Creator   │   │   Audience   │              │
│  │ (Dashboard)│   │ (/creator/*) │              │
│  └─────┬──────┘   └──────┬───────┘              │
│        └─────────┬────────┘                      │
│                  │  Next.js App Router            │
└──────────────────┼──────────────────────────────-┘
                   │
        ┌──────────▼───────────┐
        │   API Routes (/api)  │
        │                      │
        │  GET  /streams       │  ← polls every 5s
        │  POST /streams       │  ← add to queue
        │  POST /streams/upvote│
        │  POST /streams/downvote
        │  GET  /streams/playnext?isPriority=true|false
        │  POST /create-order  │  ← Razorpay order
        │  POST /verify-payment│  ← marks COMPLETED
        └──────────┬───────────┘
                   │  Prisma ORM
        ┌──────────▼───────────┐
        │       MySQL          │
        │                      │
        │  User                │
        │  Stream              │
        │  Payment (optional)  │
        │  CurrentStream       │
        │  Upvote              │
        └──────────────────────┘
              ▲ verify
              │
        ┌─────┴──────┐
        │  Razorpay  │
        └────────────┘
```

### Dual-Lane Queue System

```
 INCOMING SONGS
       │
       ├─── paid (Razorpay completed) ──► 💰 PRIORITY LANE
       │                                   sorted by: amount DESC, time ASC
       └─── free ────────────────────────► 🗳️ REGULAR LANE
                                            sorted by: votes DESC
                                            
PLAY NEXT (creator action or auto on song end):
  if priority lane is not empty → play top priority
  else                          → play top of regular lane
```

---

## ✅ Current Features

### For Creators
- 🎛️ **Creator Dashboard** — your personal stream hub at `/dashboard`
- ▶️ **Manual queue control** — skip to next video from either lane
- ⭐ **Priority-first auto-play** — when a video ends, priority lane drains first automatically
- 📤 **One-click share** — share your audience link from the dashboard
- 🏷️ **Creator badge** — visual indicator showing you're the owner of the stream

### For the Audience
- 🔗 **Shareable stream URL** — `/creator/<id>` for audience to join
- 🎵 **Song submission** — paste any YouTube URL to add to the queue
- 🗳️ **Democratic voting** — upvote/downvote with optimistic UI updates
- 💰 **Priority requests** — pay ₹100–₹1000 via Razorpay to jump to the top
- 👑 **Priority queue visibility** — see the full paid queue sorted by amount

### Platform
- 🔐 **Google OAuth** via NextAuth.js
- 🔄 **Auto-refresh** — queue polls every 5 seconds without page reload
- 🎬 **Embedded YouTube player** via `yt-player` with autoplay
- 💸 **Payments** — Razorpay checkout → server-side verification → DB update

---

## 💸 Where Does the Money Go?

All payments via Razorpay flow **directly into the Razorpay merchant account** linked to the API keys in your `.env`:

```
RAZORPAY_KEY_ID       → the merchant's account
RAZORPAY_KEY_SECRET   → used to sign & verify webhooks
```

If you self-host Votetunes you keep 100% of priority request revenue. A multi-tenant platform split (e.g. 80% creator / 20% platform) would require [Razorpay Route](https://razorpay.com/docs/payments/route/).

---

## 🔮 Roadmap

| Feature | Status |
|---------|--------|
| YouTube priority queue | ✅ Live |
| Razorpay priority payments | ✅ Live |
| Optimistic voting | ✅ Live |
| Auto-play with priority-first logic | ✅ Live |
| WebSocket / SSE real-time push | 🔧 Planned |
| OBS browser-source overlay | 🔧 Planned |
| Spotify integration | 🔧 Planned |
| Multi-tenant creator accounts | 🔧 Planned |
| Tipping without a song request | 🔧 Planned |

---

## 🛠️ Local Setup

### 1. Clone & install
```bash
git clone https://github.com/yourname/votetunes.git
cd votetunes
npm install
```

### 2. Configure environment
Create a `.env` file in the project root:
```env
DATABASE_URL="mysql://user:password@localhost:3306/votetunes"

NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

NEXT_PUBLIC_RAZORPAY_KEY="rzp_test_xxxxxxxxxxxxx"
RAZORPAY_KEY_SECRET="your-razorpay-secret"
```

### 3. Push the database schema
```bash
npx prisma db push
```

### 4. Run the dev server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
project/
├── app/
│   ├── api/
│   │   ├── streams/
│   │   │   ├── route.ts          # GET list + POST add to queue
│   │   │   ├── playnext/         # Advance queue (priority or regular)
│   │   │   ├── upvote/           # Vote up
│   │   │   └── downvote/         # Vote down
│   │   ├── create-order/         # Razorpay order creation
│   │   ├── verify-payment/       # Razorpay payment verification
│   │   └── auth/                 # NextAuth route handler
│   ├── components/
│   │   ├── StreamView.tsx        # Main stream view (creator + audience)
│   │   ├── Header.tsx            # Nav with auth state
│   │   └── StreamComp/
│   │       ├── StreamPlayer.tsx      # yt-player embed
│   │       ├── VideoSubmissionCard.tsx  # Submit a song
│   │       ├── PriorityQueueCard.tsx    # Paid priority lane
│   │       ├── VideoQueueCard.tsx       # Regular voted lane
│   │       ├── ShareStreamCard.tsx      # Share link button
│   │       └── streamTypes.ts           # Shared TypeScript types
│   ├── dashboard/                # Creator's personal stream page
│   ├── creator/[creatorId]/      # Audience-facing stream page
│   ├── lib/
│   │   ├── auth.ts               # NextAuth config
│   │   └── db.ts                 # Prisma client singleton
│   └── utils/
│       └── razorpay.ts           # Payment flow helper
├── prisma/
│   └── schema.prisma             # MySQL schema
└── .env                          # 🚫 gitignored
```

---

## 🛡️ License

MIT — fork it, build on it, make it yours.