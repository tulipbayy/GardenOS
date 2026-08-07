# 🌸 Handoff / "Keep Everything" Guide — Bayansulu's Projects

_Written before leaving the 3E internship. This covers both projects (Room Portfolio + GardenOS),
how to run/edit/host them, every account & key they depend on, and how to keep improving them
**without** the Claude session they were built in._

---

## ⚠️ DO THIS FIRST — before you lose the internship laptop & Claude account

Everything below lives on the **work computer** and was built in a **work Claude account**.
When the internship ends you lose: this laptop's files, the Claude chat, and probably the
`claude.ai/code/artifact/...` preview link. So:

1. **Copy both project folders off this machine to storage YOU own** (personal laptop, Google
   Drive, Dropbox, or a USB stick):
   - `C:\Users\I01854\Documents\RoomPortfolio\`
   - `C:\Users\I01854\Documents\GardenOS\`
2. **Push the Room Portfolio to your personal GitHub** (`tulipbayy`) and turn on GitHub Pages —
   that becomes its **permanent public home** (see "Hosting" below). Do the same for GardenOS when it's ready.
3. **Do NOT rely on the `claude.ai/code/artifact/...` link** — it's tied to the work account and
   may stop working. Your **GitHub Pages URL is the one to share.**
4. **Check the accounts these depend on are personal, not work:**
   - **GitHub** (`tulipbayy`) → Settings → Emails → **add a personal email** so you keep the account after your Smith email ends.
   - **Supabase** (the guestbook DB) → make sure you signed up with a **personal** login you'll keep.
   - **Résumé Google Doc** → it's on your Smith email; if Smith deactivates it, move a copy to a personal Google account.

---

## 📁 What's in each folder

```
RoomPortfolio/
├─ index.html         ← THE ENTIRE SITE (open this in a browser to view it)
├─ README.md          ← repo description (shows on GitHub)
├─ screenshot.png     ← preview image for the README
├─ HANDOFF.md         ← this file
├─ photos/            ← the ORIGINAL photos (already embedded in index.html; kept for re-editing)
└─ dev/               ← optional helper scripts (embed.ps1, shotpixel.js) — NOT needed to run the site

GardenOS/
├─ index.html         ← the game/desktop world (self-contained)
├─ IDEAS.md           ← full design notes + the roadmap we planned
└─ HANDOFF.md         ← copy of this file
```

Both `index.html` files are **100% self-contained** (all art is drawn in code, photos are embedded
as text). No installs, no server. Double-click `index.html` and it just runs.

---

## 🖥️ PROJECT 1 — Room Portfolio

**What it is:** your portfolio as an explorable pixel-art room. The room is *drawn pixel-by-pixel
in JavaScript on a `<canvas>`* (not images). Click objects → panels open (about, projects, etc.).

### How to edit it
Open `index.html` in a code editor (**VS Code** is free: code.visualstudio.com). It's plain
HTML/CSS/JavaScript, heavily commented.
- **Your text/content** (bio, projects, experience, links…) lives in the big **`var C = { ... }`**
  object near the middle of the file. Edit the text there.
- **The room's look** is the `draw...()` functions (e.g. `drawBed`, `drawPiano`) near the top.
- After editing, refresh the browser to see changes.

### How to HOST it (free, GitHub Pages)
1. On **github.com/new**, make a repo named `room` (Public).
2. **Add file → Upload files** → drag in `index.html`, `README.md`, and `screenshot.png` → Commit.
   *(You do NOT need the `photos/` folder online — the photos are already inside index.html.)*
3. Repo → **Settings → Pages** → Source: **main / root** → Save.
4. In ~1 min your site is live at **https://tulipbayy.github.io/room-portfolio/**. That's your link to share.

### How to UPDATE it later
Edit `index.html`, then re-upload it to the repo (Add file → Upload files → replace) — or, if you
use git, commit & push. GitHub Pages redeploys automatically.

### Things it connects to (and where they live)
| Feature | Details |
|---|---|
| **Guestbook** | Backed by **Supabase**. Project ref: `tyajnbbtgerbdvvtqoii`. URL `https://tyajnbbtgerbdvvtqoii.supabase.co`, table `guestbook`. The URL + **publishable** key are in `index.html` (safe to be public). Manage/read notes at **supabase.com** → your project → Table Editor. ⏸️ Free projects **pause after ~1 week idle** — if the guestbook stops loading, click **Restore** in the dashboard. There's one "setup test" note you can delete. |
| **Spotify player** | Playlist embedded via its ID `37i9dQZF1FwLWOlZxSYMyt` (in the "now playing" panel). Change it by swapping that ID. |
| **Résumé link** | Google Doc, in the Contact panel. Keep the doc shared **"Anyone with the link → Viewer."** |
| **Links** | GitHub `github.com/tulipbayy`, LinkedIn `linkedin.com/in/bayansulu-tulepbayeva` (⚠️ verify this is your real handle). |

### The `photos/` folder + `dev/` scripts (only if you re-edit photos)
Photos are embedded as base64 text inside `index.html` (that's why it's one self-contained file).
To swap a photo: replace it in `photos/`, then re-run `dev/embed.ps1` (needs **Node.js** + a
PowerShell terminal). `dev/shotpixel.js` just takes screenshots. **You never need these for normal
text edits or hosting** — only for re-embedding images. (Honestly: easiest is to ask any AI
assistant to do it, or just describe the change.)

---

## 🌱 PROJECT 2 — GardenOS (in progress)

A cozy **standalone game**: a solarpunk pixel "desktop world" with a pet you care for. The world is
already built (draggable windows, day/night, plantable flowers, fairies, a pet). The **game systems**
are the next step. **Full design + roadmap is in `GardenOS/IDEAS.md`** — including everything we
decided:
- The pet is a **Sproutling** 🌱 — a plant-kin garden spirit the player **designs** (base shape +
  plant motif + colors + name) and that **grows/blooms** with care.
- The heart = a **living solarpunk ecosystem** with 4 interlocking mechanics: ☀️ solar energy,
  🐝 pollination, 📖 flower-dex + cross-breeding, 🌦️ seasons & weather — plus light goals/progression.
- Phased build plan (Foundation → Ecosystem → Seasons → Progression) is written out in IDEAS.md.

Edit/host it exactly like the room portfolio (single `index.html`).

---

## 🔑 Accounts & links — quick reference
- **GitHub:** github.com/tulipbayy  *(add a personal email!)*
- **Portfolio (once hosted):** https://tulipbayy.github.io/room-portfolio/
- **Supabase (guestbook DB):** supabase.com → project `tyajnbbtgerbdvvtqoii`
- **Résumé:** Google Doc (on Smith email — copy to personal if needed)
- **LinkedIn:** linkedin.com/in/bayansulu-tulepbayeva (verify)
- **Contact email on the site:** btulepbayeva@smith.edu

---

## 🤖 How to keep improving these WITHOUT this Claude session
Everything is plain, well-commented **HTML/CSS/JavaScript** — any developer or AI assistant can pick
it up. To continue:
1. Open the project folder in **VS Code**.
2. Use **any AI assistant on your personal account** (Claude, ChatGPT, Cursor, GitHub Copilot…).
   Paste the relevant file (or the section you want to change) and describe what you want — e.g.
   *"Here's my index.html. Add a new clickable object to the room that opens a 'blog' panel."*
3. Test by opening `index.html` in a browser; re-upload to GitHub to publish.

Nothing here is locked to Claude or to 3E — it's your code, in your accounts, forever. 🌸
