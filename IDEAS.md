# Bayansulu's GardenOS — notes & ideas

My interactive **portfolio** as a solarpunk + pixel + cute + Y2K "desktop" world.
Core concept to protect: **a portfolio that's a desktop with gardens and fairies.**

`index.html` is the whole app — self-contained (hand-rolled pixel-sprite renderer on Canvas,
no external assets/fonts, works offline). Print/deploy as-is.

## Shipped
- Draggable windows: About, Projects, Solar Buddy, Guestbook
- Day ↔ night toggle (theme switch = time of day; buddy sleeps at night)
- 8 plantable + tendable flowers that grow across the desktop (saved in localStorage)
- Pixel fairies: visit blooms, swarm at night, click for a wish, fairy ring around toadstool clusters
- Ambient life: drifting petals, day butterflies/bees, night fireflies
- Parallax background: layered hills + village (glowing windows at night) + a napping Whisker Woods cat
- Guided tour (auto on first visit, ❓ to replay)
- Click the **house → a "room" window** with clickable objects (portrait→About, computer→Projects, bookshelf→Skills, craft table→Hobbies) — a contained version of the house-tour idea
- **Solar Buddy as a desktop tour-host** (bottom-left) with rotating hint bubbles
- **Personality easter eggs**: click the cat / turbine / solar tower for a little line (placeholder text — personalize in index.html `FACTS`)

## Parked idea — walk-in house tour (ON HOLD)
Inspired by **Sabrina Carpenter's "house tour"** and **Olivia Rodrigo's website**.
Enter the main cottage → a room where clickable objects open portfolio sections:
- portrait on the wall → About
- computer → Projects
- bookshelf → Skills
- craft table → hobbies / additional interests
…then exit back out to the garden.
Paused because a full house-interior shifts away from the desktop-garden-fairies core.

**Small piece that fits the current world now:** *diegetic clickable props* — click the
cottage → About, the cat → interests/fun, the solar tower → skills. Same "objects map to
sections" delight, no room to build.

## New direction (2026-07): lean into TAMAGOTCHI gameplay
GardenOS is now the **playful standalone game** (the *portfolio* moved to a separate cozy-room
project). Make Solar Buddy + the garden a real tamagotchi so it's interesting on its own:
- **Pet stats** that decay over time: hunger, happiness, energy (bars in the buddy window)
- Feeding / playing / watering raise stats; neglect lowers them; buddy mood reacts
- **Sleep at night** restores energy (ties to day/night)
- A soft **economy**: tending the garden earns seeds/coins → buy new plant types, decor, buddy accessories
- Buddy can **evolve / grow** as you care for it; flowers bloom into harvestables
- Gentle fail-safe: it never truly "dies" (cozy, not stressful)
- Persist stats in localStorage with real elapsed-time decay

## Still to do
- (portfolio copy now lives in the RoomPortfolio project, not here)
- Build the tamagotchi loop above

## LOCKED DESIGN (from the 2026-08 brainstorm) 🌱

**The pet: a "Sproutling"** — a plant-kin garden spirit (with a little sun-glow = plant + solar).
It grows & blooms as the world thrives (that's the evolution mechanic).
- **Player designs it** at the start — a "meet your Sproutling" creator: pick **base shape**
  (sprout-blob / bun / kit / hopper) + **plant motif** (leaf sprout / flower / mushroom cap /
  antenna / petal-ears) + **colors**, and **type its name** (with a 🎲 shuffle for suggestions).
  Save to localStorage. Species name = "Sproutling".

**The heart: a LIVING SOLARPUNK WORLD** you nurture (chosen over pet-only or garden-sim-only).
Vibe: cozy but with **light goals & progression** (gentle milestones + soft economy, never stressful).

**The one interlocking loop (all 4 mechanics wired together):**
- ☀️ SUN + 🌦️ WEATHER + 🍂 SEASONS → drive growth + charge the Sproutling + power tools
- → 🌱 plant flowers → grow in real time → 🌸 blooms
- → 🐝 bees/butterflies pollinate → seeds + 📖 cross-breed → new hybrids (flower-dex!)
- → 🧚 blooms attract fairies → wishes / buffs
- → 💰 seeds & solar charge → spend at shop (seeds, decor, tools, Sproutling outfits, panels)
- → 🌻 world + Sproutling thrive → light goals ✓

A healthier ecosystem = a happier Sproutling + more to discover.

**Phased roadmap (each phase is playable on its own):**
1. **Foundation** — real-time state engine: Sproutling stats (hunger / happiness / energy) that decay
   over real elapsed time (persisted); ☀️ solar-energy meter tied to day/night; seeds/coins wallet + tiny shop.
2. **Ecosystem** — 🐝 pollination (bees turn blooms → seeds) → 📖 cross-breeding & a flower-dex.
3. **Seasons & weather** — seasonal blooms + rain/sun/rainbow/shooting-star events feeding the loop.
4. **Progression & heart** — 🎯 gentle goals/milestones, Sproutling evolutions + accessories, a little journal.

**First thing to build:** the "meet your Sproutling" creator (the game's opening; also builds the
sprite-composition — base + motif + palette — that everything else reuses).

## SHIPPED (2026-08-06 build) ✅
- Sproutling creator (shape/crown/color/name), sprite composition, saved to localStorage
- Care stats (hunger/happy/energy) with real-elapsed-time decay; energy refills overnight
- Care apps: 🍎 Kitchen (harvest blooms → pantry → feed, favourites), 🎈 Playground
  (bubble-pop mini-game), 💤 Nap Nook (timed energy fill)
- Economy: 🌻 sunseeds (2/bloom on harvest) + Seed Shop — crowns (star/bow/royal) and
  garden decor (stone/birdbath/gnome/lantern); decor is drag-to-reposition, persisted;
  lantern glows at night. Blooms take ~3 min (rebalanced from 20s)
- Full visual redesign: layered pixel-art scene (sky/hills/village/foreground garden),
  golden-hour + midday + night palettes
- Time-of-day system: AUTO follows the real clock (midday/golden/night); button cycles
  auto → midday → golden → night; world (fairies/bugs/lantern/pet) resyncs on auto flips
- Night consistency: pet + desktop host + Nap Nook all sleep at night; messages use the
  pet's chosen name
- Pure-game framing (portfolio windows removed; About = about-the-game); guestbook removed
- README.md + screenshot for the repo
- 🌦️ Weather & sky events: rain (~every 4–5 min by chance, 45s) auto-waters the garden with
  visible streaks + damp tint → followed by a 🌈 rainbow (+5 🌻, 30s); night shooting stars 🌠
  (occasional +1 🌻). Engine in main script, visuals in the scene canvas via window.__weather.
- 📱 Mobile pass: viewport meta added (was missing!), windows cap to screen height + scroll,
  taskbar/icons shrink under 560px; verified at 390×844 with no horizontal overflow.

- 🐣 Sproutling evolution: growth stat (+3 per care act; +2/hr while all stats healthy) →
  stages seedling → 🌸 bloomed (35: leaf-arms) → ✨ radiant (80: gold sparkles + glow).
  4th bar in pet window; evolution toast; sprite recomposes everywhere. Fairy ring removed;
  pixel-Sproutling favicon added.

## NEXT UP (not built)
- 🎯 Gentle goals/milestones + keepsake journal — PICKED
- Phase 2 ecosystem: 🐝 pollination → seeds, 📖 flower-dex + cross-breeding
- Ground the Sproutling + planted flowers visually into the foreground garden bed
- More shop stock (body colors, wind chimes, pond); scene polish (sun glow, cloud shapes)

**Tech notes:** runs fully on GitHub Pages (all client-side JS); saves via localStorage (per-device,
which is fine for a personal pet). The existing code already has the pixel `draw()` sprite renderer,
a pet with feed/happy that sleeps at night, a garden that grows/wilts/waters & saves, fairies, and
day/night — build the game systems on top of those.
