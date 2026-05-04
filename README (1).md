# Alpha Brawl

A browser-based 2D platform fighter in the style of Super Smash Bros. Ultimate.
Single-file HTML5 Canvas implementation — no build step, no dependencies, no server.
Drop `index.html` into any browser or static host and play.

## Status

Playable prototype. Local 2-player (shared keyboard) **and** online 2-player over WebRTC,
with ten characters, full move sets, camera tracking, ledge recoveries, and stock-based
matches.

## Online play

The title screen has three modes: **LOCAL 2P**, **HOST ONLINE**, **JOIN ONLINE**.
Online uses peer-to-peer WebRTC via the public PeerJS signaling server (no backend needed
on your end), with deterministic lockstep netcode and a 3-frame input delay buffer.

- **Host**: pick HOST, confirm your fighter, share the 6-char room code with a friend.
- **Join**: pick JOIN, type the 6-char code, confirm your fighter. The host then presses
  ENTER to start the match.
- **Controls (online, both sides)**: WASD move/jump, `L-Shift` block, `R` attack, `F` special.
  Both host and guest use the P1 scheme on their physical keyboard regardless of which
  fighter index they own — the netcode routes inputs to the correct fighter on each client.
- **ESC** in any state returns to the main menu and tears down the connection.

Online play needs the page hosted on a real URL (Netlify Drop / GitHub Pages) — the
PeerJS CDN won't load reliably from `file://`. NAT traversal usually succeeds for ~80% of
home networks; a TURN relay would be needed for the rest (out of scope).

The match status overlay in the top-right shows connection state, current frame, and
desync warnings. State hashes are exchanged every 60 frames; if they diverge, the overlay
flags `DESYNC @ frameN` so you know to restart.

## Quick start

Open `index.html` in any modern browser. That's it.

To deploy: drag `index.html` onto [app.netlify.com/drop](https://app.netlify.com/drop)
or push to a GitHub repo and enable GitHub Pages (Settings → Pages → Deploy from main branch).

## Controls

| Action | Player 1 | Player 2 |
|--------|----------|----------|
| Move / aim | `WASD` | `Arrow keys` |
| Block | `Left Shift` | `Right Shift` |
| Attack | `R` | `K` |
| Special | `F` | `L` |
| Confirm/start | `Enter` | `Enter` |

Specials and attacks both take a directional modifier. Hold a direction *before* pressing
the button to get the variant:

- **Neutral** (no direction held)
- **Side** (left or right)
- **Up**
- **Down**

In the air, regular attacks become aerials (neutral air, forward air, back air, up air,
down air — down air is a spike).

## Roster

Ten characters with distinct archetypes. All have four directional specials, ground tilts
(jab/forward/up/down) and full aerials. Stats below are relative.

### Nico — Rushdown (orange/yellow)
Fast close-range pressure with fire.
- **Neutral**: Fireball (arcing projectile that **bounces up to 3 times** off the floor before despawning)
- **Side**: Burning Dash (invuln startup, 11 dmg, KO move)
- **Up**: Fire Propulsion (recovery + hitbox)
- **Down**: Counter (reflects next attack at 1.5×)

### Derek — Zoner (blue/purple)
Keep-away ninja with ranged tools.
- **Neutral**: Shuriken (fast straight projectile)
- **Side**: Hand Crossbow (piercing bolt)
- **Up**: Katana Upward Dash (12 dmg vertical)
- **Down**: Smoke Bomb (lingering AoE)

### Rhys — Trapper (green)
Low base damage, but specials inflict 1.5s poison DoT (1.5%/15 frames).
- **Neutral**: Toxic Punch (heaviest punch, KB scales with current speed)
- **Side**: Toxic Headbutt (Green-Missile-style horizontal launch)
- **Up**: Poison Lob (bomb arcs up, lands as a poison cloud)
- **Down**: Spore Trap (stationary armed trap, lasts 6s)

Rhys's regular attacks deal 55% base damage to compensate for the DoT power.

### Greyson — Hybrid (military olive/khaki)
Balanced kit with bombs and a shield-piercing grab.
- **Neutral**: Grenade (lobbed, fuse + radius blast, friendly fire applies)
- **Side**: Hard Punch (single 15 dmg blow, long endlag)
- **Up**: Mega Jump (huge vertical launch + superarmor)
- **Down**: Command Grab (pierces shields, 14 dmg throw)

### Kele — Heavyweight (red/gold)
Slowest walk, heaviest weight, no ranged tools. All-melee bruiser.
- **Neutral**: Power Punch (20 dmg, 14-frame superarmor windup)
- **Side**: Suplex (Mii-Brawler-style grab → lift → slam, 18 dmg, pierces shields)
- **Up**: Uppercut (14 dmg, sends opponent into free-fall)
- **Down**: Body Slam (plunge with hitbox + ground shockwave AoE)

### Jonah — Flier (pink/teal)
Lightest weight, 5 air jumps, floaty gravity.
- **Neutral**: Beet Blast (5-pellet shotgun spread, very short range)
- **Side**: Mach 5 (long no-damage dash with invuln)
- **Up**: Glide (60 frames of near-zero fall speed)
- **Down**: Ultra Spike (vertical plunge, bounces off surfaces)

### Theo — Controller (purple/cyan)
Medium stats, battlefield-control specialist with dark-energy tools.
- **Neutral**: Charge Orb (hold special to charge — release to **fire a flying orb projectile** that detonates on impact for 7→25 dmg, 55→120 radius based on charge held)
- **Side**: Power Blast (energy rifle shot — laser projectile + close-range bayonet thrust; both connect at point-blank)
- **Up**: Teleport (vanishes briefly, reappears 200px in the directional key pressed; helpless after if airborne)
- **Down**: Absorb (consumes incoming projectiles within 80px and converts their damage into healing at 1.2×)

### Cole — Pyromaniac (coal-black/orange)
Medium stats with a **fuel meter** (0–100, regenerates ~0.4/frame on the ground, ~0.2/frame airborne)
that gates his rocket boost and gasoline spray. Gas + ignite is the combo identity.
- **Neutral**: Igniter Toss (lobs a small sparking device forward in an arc, 7 dmg on direct hit. On impact — ground or enemy — the device sparks: it lights any gasoline puddle within 80 px into a fire patch and detonates **any** fueled enemy in the splash for +14 bonus damage. Direct hits on a fueled target also get the bonus.)
- **Side**: Gasoline Spray (costs 25 fuel; lobbed oil arc — direct hit douses an enemy with the *fueled* status; misses land as a 360-frame puddle that douses anyone who walks through it)
- **Up**: Rocket Boost (hold special to thrust upward, drains 0.34 fuel/frame ≈ 5s at full tank; steerable left/right, 14f endlag on landing, helpless if airborne when fuel runs dry)
- **Down**: Molotov (lobbed bottle, 8 dmg direct; on impact spawns a 100-frame fire patch that ticks 1.4 dmg every 12f. Direct hits also apply *fueled*.)
- **Fueled** status (4s) is shared across the kit — anything that ignites it (Ignite hitbox or Fire Patch tick) deals bonus damage and clears the status.

### Angus — Hacker (dark green / matrix green)
Computer nerd. Has a **code meter** (0–100) that **charges by taking damage** (2 code per
damage point). Drives platforms and dashes; reset on death.
- **Neutral**: Code Disrupter (costs 25 code; spawns a 110×8 px temporary platform in front of Angus that lasts ~5 seconds — anyone can stand on it)
- **Side**: HTML Dash (costs 20 code; fast 12-speed dash that **re-reads directional inputs every frame** and curves to match — change direction mid-dash by holding new keys, brief invuln)
- **Up**: Grappling Hook (lobbed hook — direct hit on a fighter **yanks them toward Angus**; miss/expiry pulls **Angus toward the hook tip** as a recovery boost)
- **Down**: Code Farm (channels for 3 seconds and fills the code meter to max — vulnerable, no super armor)

### Aidan — Jester (purple/gold)
Jokester with a chaos kit — random effects, hammers, and lobbed cheese.
- **Neutral**: Loot Box (lobbed crate; on direct hit applies one of: Poisoned 3s · Doused (fueled) 4s · Slowed 40f hitstun · Bonus 10 dmg · Aidan heals 12%)
- **Side**: Hammer Bonk (heavy overhead swing, 14 dmg + strong KB)
- **Up**: Cannon Launch (fast upward burst, vy = -17, brief invuln, helpless after if airborne)
- **Down**: Cheese Throw (lobbed yellow wedge that arcs and falls, 9 dmg on contact)

## Core mechanics

- **Stock match** — first to knock the other off 3 times wins.
- **Damage percent** — SSB-style. Higher % = more knockback. No cap.
- **Weight** — multiplier on knockback received (Jonah 0.75 lightest, Kele 1.35 heaviest).
- **Block** — shield reduces damage and KB by 70%, drains nothing.
- **Counter** — Nico's down-special reflects attacks at 1.5×. Beats grabs.
- **Grabs** — Greyson's Cmd Grab and Kele's Suplex pierce shields. Counter beats them.
- **Free-fall (helpless)** — propulsion specials lock you out of further actions until
  you land or get hit. Affects: Fire Propulsion, Burning Dash, Katana Dash, Toxic Headbutt,
  Mega Jump, Uppercut, Glide, Teleport. Drift-only horizontal control during helpless.
- **End lag** — dash moves apply input-locking recovery frames on landing:
  Mach 5 (22f), Burning Dash (20f), Toxic Headbutt (18f), Katana/Fire Propulsion/Mega Jump
  (12f), Glide/Uppercut/Teleport (10f). Getting hit clears endlag.
- **Poison DoT** — Rhys-only status. 1.5s, ticks 1.5% per 15 frames, no KB. Re-poisoning
  refreshes (doesn't stack). Clears on death.
- **Ledge grab** — auto-grab when falling near either stage corner. 40 frames invuln.
  Press up/away to climb up, down/toward to drop.
- **Camera** — tracks midpoint of both fighters with dynamic zoom (0.5×–1.1×).
- **Off-screen indicators** — color-coded arrows around viewport edge point to
  off-screen fighters. Red `!` warns at 500+ world-pixels distance.
- **Blastzones** — explicit world-coordinate boundaries well outside the visible viewport.
  Crossing kills.

## Architecture

Single self-contained `index.html` file (~2500 lines) with three top-level sections:

1. **HTML/CSS** — minimal page chrome, control legend, single 960×540 canvas.
2. **JavaScript IIFE** — entire game in one closure. Everything is closure-local
   (no globals). Top-down structure:
   - World/stage/blastzone constants
   - Camera state and `updateCamera`/`applyCamera`/`releaseCamera`
   - Character definitions in `CHARS` object, `CHAR_KEYS` ordered list
   - Per-player control maps in `controls` array
   - `Fighter` class — stateful per-player object; per-character logic dispatched
     via `this.key` switches in `startSpecial`, motion locks, hitbox returns, render
   - Standalone projectile system (`projectiles[]`, `updateProjectiles`,
     `explodeGrenade`)
   - Standalone melee resolver (`resolveMelee`)
   - Render functions (`drawBackdrop`, `drawStage`, `drawProjectiles`, `drawEffects`,
     `drawHUD`, `drawOffstageIndicators`, `drawMenu`, `drawGameOver`)
   - Main loop (`loop`) — switches on `state` (MENU / PLAY / OVER)
3. **No external dependencies** — no Tailwind, no React, no libs. Pure Canvas2D.

### World coordinates vs viewport

The world is 1800×1200, the viewport is 960×540. Stage spans world X 400–1400 with the
top surface at Y 700. Blastzones are world bounds 100/1700/100/1120. The camera transform
maps world → screen each frame inside `applyCamera()`.

### Move-state lifecycle

Every special move sets `this.moveState = { type, timer, ... }`. The `update()` method
ticks `timer` down each frame and runs motion-lock logic for that move type. When `timer`
reaches 0, the moveState is cleared and (if applicable) `helpless` and `endlag` are set.
Hitboxes are returned by `getHitbox()` based on current moveState type and active-frame
windows. The melee resolver tracks `hasHit` sets per moveState to prevent multi-hit
chip-stun.

### Critical bug pattern to know about

If a move sets `this.moveState = null` mid-frame (suplex slam impact, ultra spike bounce),
and there are sibling `if (this.moveState.type === ...)` checks after it in the same chain,
those will throw a null deref. The fix is `if (this.moveState && this.moveState.type === ...)`.
Several such guards already exist; if you add a move that nulls `moveState` early,
audit the velocity-lock block for sibling checks.

## File layout

This is a single-file project. There are no other source files.

```
.
├── index.html         # The entire game
└── README.md          # This file
```

## Tooling

- **Validation** — extract the script tag and run `new Function(src)` to syntax-check.
  No transpilation needed.
- **Testing** — Node simulation can run the IIFE with a mock canvas/document/window
  to test specific scenarios (move connect/whiff, ledge grab, blastzone death,
  endlag punish windows). See past chat history for examples.

## Deployment to GitHub Pages

1. Create a new repo on GitHub (public).
2. Upload `index.html` to the root of the repo.
3. Repo settings → Pages → Deploy from a branch → main branch, root folder → Save.
4. Wait ~30 seconds. The page settings show your live URL.

For Netlify drag-and-drop: upload just the `index.html` file (not a folder containing it,
and make sure the filename is exactly `index.html` — not `index (1).html`).

## Roadmap / good next features

- Throws on regular grabs (currently Greyson and Kele are the only grab characters via specials)
- Wall-jumps for recovery variety
- Dodge-roll on double-tap direction
- Hold-to-charge smash attacks
- AI opponent for solo play
- Touch controls / gamepad support
- More stages (currently a single fixed stage)
- Sound effects and music
- Sprite art replacing placeholder rectangles
- Online netplay (would require a server, currently out of scope)

## Tuning levers worth knowing

- Move damage/KB values are in each character's `xxxSpecial(dir)` method and in
  `getHitbox()` returns for melee specials.
- Endlag values are in the `endlagMap` inside the move-timer expiration block.
- Character stats (walk speed, jump power, weight, max jumps) live in the `CHARS` object
  at the top of the script.
- Camera zoom limits and lerp factors are in `updateCamera()`.
- Blastzone coordinates and ledge positions are in the stage-constants block.

## Credits

Designed and built collaboratively. Implementation in a single-session iterative process
with extensive playtesting and balance tuning.
