# 🐉 DnD Frontend

A **personal Dungeons & Dragons web app** built for managing our ongoing campaign with friends.
It provides a fast, modern interface for tracking characters, spells, equipment, currencies, and campaign data — all synced with my custom **.NET + MongoDB backend** and **Official DnD5e API**.

## 🎯 Purpose

This app replaces manual notes, spreadsheets, and scattered Discord messages.
It gives my players and me a clean UI where:

* Everyone can view and update **their character sheets**
* I can manage **campaigns, players, inventories, sessions, notes, etc.**
* Spells, items, and stats are always **up-to-date and searchable, also expandable**
* The system stays consistent between sessions
* All data is stored centrally and shared in real time
### Designed specifically for
- **Mobile and desktop use**.
- **Our private campaign world**, with custom items, homebrew rules, and admin tools, but useable for other DMs too.

## 🧰 Tech Highlights

* **React + TypeScript** frontend
* **Mantine** UI components
* **Zustand** for lightweight state management
* **JWT authentication**
* **Markdown Descriptions**
* Integrated with a **C# / ASP.NET API**
* Built for quick iteration during campaign prep
* Currently deployed on Vercel.
## 🚀 Running

```bash
npm install
npm run dev
```

Set API URL in `./dnd-frontend/.env`:

```
VITE_API_BASE=http://localhost:5000/api
