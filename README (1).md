# Alpha Brawl

A browser-based 2D platform fighter in the style of Super Smash Bros. Ultimate.
Single-file HTML5 Canvas implementation — no build step, no dependencies, no server.
Drop `index.html` into any browser or static host and play.

## Status

Playable prototype. Local 2-player (shared keyboard) **and** online 2-player over WebRTC,
with thirteen characters, full move sets, camera tracking, ledge recoveries with auto-drop,
shield-break mechanic, and stock-based matches.

## Online play

The title screen has three modes: **LOCAL 2P**, **HOST ONLINE**, **JOIN ONLINE**.
Online uses peer-to-peer WebRTC via the public PeerJS signaling server (no backend needed
on your end), with deterministic lockstep netcode and a 3-frame input delay buffer.

- **Host**: pick HOST, confirm your fighter, share the 6-char room code with a friend.
- **Join**: pick JOIN, type the 6-char code, confirm your fighter. The host then presses
  ENTER to start the match.
- **Controls (online, both sides)**: WASD move/jump, `L-Shift` block, `F` attack, `G` special.
  Both host and guest use the P1 scheme on their physical keyboard regardless of which
  fighter index they own — the netcode routes inputs to the correct fighter on each client.
- **ESC** in any state returns to the main menu and tears down the connection.

Online play needs the page hosted on a real URL (Netlify Drop / GitHub Pages) — the
PeerJS CDN won't load reliably from `file://`. NAT traversal usually succeeds on home
networks; very strict NATs (school/corporate) may fail to connect.

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
| Attack | `F` | `.` (period) |
| Special | `G` | `/` (slash) |
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

Thirteen characters with distinct archetypes. All have four directional specials, ground
tilts (jab/forward/up/down) and full aerials. The character-select screen is a centered
multi-row grid with min-max-normalized stat bars. Stats below are relative.

### Nico — Rushdown (orange/yellow)
Fast close-range pressure with fire.
- **Neutral**: Fireball (arcing projectile that **bounces up to 3 times** off the floor before despawning)
- **Side**: Burning Dash (invuln startup, 11 dmg, KO move)
- **Up**: Fire Propulsion (recovery + hitbox)
- **Down**: Counter (reflects next attack at 1.5×)

### Derek — Zoner (blue/purple)
Keep-away ninja with ranged tools.
- **Neutral**: Shuriken (fast straight projectile)
- **Side**: Hand Crossbow (piercing bolt, very low damage — pure spacing tool)
- **Up**: Katana Upward Dash (12 dmg vertical)
- **Down**: Smoke Bomb (lingering AoE)

### Rhys — Trapper (green)
Low base damage, but specials inflict 1.5s poison DoT (1.5%/15 frames).
- **Neutral**: Toxic Punch (heaviest punch, KB scales with current speed)
- **Side**: Toxic Tendril (vine projectile yanks the victim toward Rhys + applies poison)
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
- **Side**: Beet Snatch (close-range command grab — pierces shields. On grab, Jonah holds
  the victim and the attack button can be mashed for repeated damage over up to 2 seconds.)
- **Up**: Glide (60 frames of near-zero fall speed)
- **Down**: Ultra Spike (vertical plunge, bounces off surfaces)

### Theo — Controller (purple/cyan)
Medium stats, battlefield-control specialist with dark-energy tools.
- **Neutral**: Charge Orb (hold special to charge — release to fire a flying orb projectile that detonates on impact for 7→25 dmg, 55→120 radius based on charge held)
- **Side**: Power Blast (energy rifle shot — laser projectile + close-range bayonet thrust)
- **Up**: Teleport (vanishes briefly, reappears 200px in the directional key pressed; helpless after if airborne)
- **Down**: Absorb (consumes incoming projectiles within 80px and converts their damage into healing at 1.2×)

### Cole — Pyromaniac (coal-black/orange)
Medium stats with a **fuel meter** (0–100, regenerates ~0.4/frame on the ground, ~0.2/frame airborne)
that gates his rocket boost and gasoline spray. Gas + ignite is the combo identity.
- **Neutral**: Igniter Toss (lobs a small sparking device, 7 dmg direct; on impact, lights any nearby gas puddle and detonates fueled enemies for +14)
- **Side**: Gasoline Spray (costs 25 fuel; arc spray douses enemies with *fueled* status, leaves a 360-frame puddle)
- **Up**: Rocket Boost (hold special to thrust upward, drains 0.34 fuel/frame; helpless if airborne when fuel runs dry)
- **Down**: Molotov (lobbed bottle, 8 dmg direct + 100-frame fire patch ticking 1.4 dmg/12f. Direct hits apply *fueled*.)
- **Fueled** status (4s) — anything that ignites it deals bonus damage and clears it.

### Angus — Hacker (dark green / matrix green)
Computer nerd. Has a **code meter** (0–100) that **charges by taking damage** (2 code per
damage point). Drives platforms, walls, and recoveries; reset on death.
- **Neutral**: Code Disrupter (costs 25 code; spawns a 110×8 px temporary platform in front of Angus that lasts ~5 seconds — anyone can stand on it)
- **Side**: Firewall (costs 20 code; plants a vertical wall of code that **reflects projectiles** back at the attacker)
- **Up**: Grappling Hook (lobbed hook — direct hit on a fighter yanks them toward Angus; miss/expiry pulls Angus toward the hook tip as a recovery boost)
- **Down**: Virus (forward projectile — direct hit 5 dmg + 3-second DoT ticking 1.5 dmg / 0.5 s. Every DoT tick also pumps +4 code into Angus. No code cost; this is his main code generator.)

### Aidan — Jester (purple/gold)
Jokester with a chaos kit — random effects, hammers, and lobbed cheese.
- **Neutral**: Loot Box (lobbed crate; random effect on direct hit: Poisoned 3s · Fueled 4s · Slowed 40f · +10 dmg · Aidan heals 12%)
- **Side**: Hammer Bonk (heavy overhead swing, 14 dmg + strong KB)
- **Up**: Cannon Launch (fast upward burst, brief invuln, helpless after if airborne)
- **Down**: Cheese Throw (lobbed yellow wedge that arcs and falls, 9 dmg)

### Liam — Ice (cyan/white)
Wields a ski pole — drops it after Ski Pole Throw and loses access to Ice Parry until he picks it back up.
- **Neutral**: Ski Pole Throw (heavy projectile — single-shot until retrieved)
- **Side**: Avalanche (points pole skyward; after a 30-frame telegraph, ice shards fall in a column ahead of him)
- **Up**: Snow Blast (multi-hit upward fan of snowflakes, also functions as a recovery)
- **Down**: Ice Parry (counter — only usable while holding the pole; reflects the next melee hit)

### Colton — Billiards (felt-green / wood)
Pool-hall trickster with a stick and balls. Mid-range zoner.
- **Neutral**: Pool Ball Throw (30-frame / 0.5s windup, then a heavy striped ball at low arc)
- **Side**: Eight Ball (drops a sticky black 8-ball that stays where it lands — re-press special to launch it forward as a heavy projectile)
- **Up**: Jump Shot (third jump using the cue as a pole-vault, vertical hitbox above)
- **Down**: Flashing Mach Spear (5 rapid invisible spear pulses around him, then one big visible thrust)

### Donny — Boxer (brown/gold)
Professional boxer. Heavier hitter on regular punches; specials are all melee with no
projectiles. No-frills all-physical kit.
- **Neutral**: Power Punch (30-frame / 0.5s windup, brutal high-damage straight)
- **Side**: Power Dropkick (fast horizontal leap with a body hitbox in front)
- **Up**: Power Grab (short-range grab that pierces shields and flings the victim straight up)
- **Down**: Ultimate Upper (wide-arc rising uppercut — low damage but huge vertical KB)

## Core mechanics

- **Stock match** — first to knock the other off 3 times wins.
- **Damage percent** — SSB-style. Higher % = more knockback. No cap.
- **Weight** — multiplier on knockback received (Jonah 0.75 lightest, Kele 1.35 heaviest).
- **Block / shield** — shield reduces damage and KB by 70%, **drains while held** (faster
  the bigger the hit absorbed). When the meter hits 0 the shield **breaks** and the fighter
  is stunned wide-open. Shield regenerates while not blocking.
- **Counter** — Nico's down-special and Liam's Ice Parry reflect attacks at 1.5×. Beats grabs.
- **Grabs** — Greyson's Cmd Grab, Kele's Suplex, Jonah's Beet Snatch, and Donny's Power Grab
  all pierce shields. Counter beats them.
- **Free-fall (helpless)** — propulsion specials lock you out of further actions until
  you land or get hit. Affects: Fire Propulsion, Burning Dash, Katana Dash, Toxic Headbutt,
  Mega Jump, Uppercut, Glide, Teleport, Snow Blast, Jump Shot, Power Dropkick, Cannon Launch,
  Rocket Boost (when fuel empties airborne). Drift-only horizontal control during helpless.
- **End lag** — propulsion / dash moves apply input-locking recovery frames on landing.
  Getting hit clears endlag.
- **Poison DoT** — Rhys-only status. 1.5s, ticks 1.5% per 15 frames, no KB. Re-poisoning
  refreshes (doesn't stack). Clears on death.
- **Ledge grab** — auto-grab when falling near either stage corner. 40 frames of invuln,
  then **auto-drops after 5 seconds** (no ledge-stalling). Press up/away to climb up,
  down/toward to drop manually.
- **Camera** — tracks midpoint of both fighters with dynamic zoom (0.5×–1.1×).
- **Off-screen indicators** — color-coded arrows around viewport edge point to off-screen
  fighters. Red `!` warns at 500+ world-pixels distance.
- **Blastzones** — explicit world-coordinate boundaries well outside the visible viewport.
  Crossing kills.
- **Fixed-timestep sim** — game logic is pinned to 60 Hz regardless of monitor refresh rate
  (60/120/144/240 Hz monitors all play at the same speed). Render runs once per vsync;
  the sim catches up via 1–5 ticks per render frame.

## Architecture

Single self-contained `index.html` file (~7400 lines) with three top-level sections:

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
   - PeerJS-based netcode: lockstep sim with seeded RNG (mulberry32),
     `delaySpawn` frame-counter, snapshot/restore for stalls.
   - Render functions (`drawBackdrop`, `drawStage`, `drawProjectiles`, `drawEffects`,
     `drawHUD`, `drawOffstageIndicators`, `drawMenu`, `drawGameOver`)
   - Main loop (`loop` → `stepSim` + `renderFrame`) — switches on `state`
     (MENU / PLAY / OVER), fixed-timestep accumulator at 60 Hz.
3. **External dependency** — PeerJS 1.5.4 loaded from CDN (only used in online mode).
   Falls back gracefully to local-only if blocked. No build step.

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
├── index.html              # The entire game
├── tournament-pitch.html   # Pixel-style pitch deck for school tournament
└── README (1).md           # This file
```

## Tooling

- **Validation** — extract the script tag and run `new Function(src)` to syntax-check.
  No transpilation needed.
- **Testing** — Node simulation can run the IIFE with a mock canvas/document/window
  to test specific scenarios (move connect/whiff, ledge grab, blastzone death,
  endlag punish windows).

## Deployment to GitHub Pages

1. Create a new repo on GitHub (public).
2. Upload `index.html` to the root of the repo.
3. Repo settings → Pages → Deploy from a branch → main branch, root folder → Save.
4. Wait ~30 seconds. The page settings show your live URL.

For Netlify drag-and-drop: upload just the `index.html` file (not a folder containing it,
and make sure the filename is exactly `index.html` — not `index (1).html`).

## Roadmap / good next features

- Throws on regular grabs (currently grabs only happen on specials)
- Wall-jumps for recovery variety
- Dodge-roll on double-tap direction
- Hold-to-charge smash attacks
- AI opponent for solo play
- Touch controls / gamepad support
- More stages (currently a single fixed stage)
- Sound effects and music
- Sprite art replacing placeholder rectangles

## Tuning levers worth knowing

- Move damage/KB values are in each character's `xxxSpecial(dir)` method and in
  `getHitbox()` returns for melee specials.
- Endlag values are in the `endlagMap` inside the move-timer expiration block.
- Character stats (walk speed, jump power, weight, max jumps) live in the `CHARS` object
  at the top of the script.
- Camera zoom limits and lerp factors are in `updateCamera()`.
- Blastzone coordinates and ledge positions are in the stage-constants block.
- Shield drain/regen rates and break-stun duration are in the block-handling section
  of `Fighter.update()`.

## Changelog

### Update 1.1

**Super armor — breakable now**
Heavy commit moves (Kele's specials, Greyson's Mega Jump, Donny's Power Punch)
no longer grant pure invincibility on their armor windows. Instead:

- Hits ≤ 20 dmg are absorbed — no damage, no flinch (yellow flash + block sfx).
- Hits > 20 dmg **break** the armor: the fighter takes full damage and is
  stunned for 60 frames (shield-break style). The move is canceled mid-swing.

The threshold is set so that most jab / fast-aerial damage bounces, but
heavy committed swings (Kele Power Punch 20, Donny Power Punch ~25+,
Drew Shield Spike spike, Aidan Hammer Bonk 14 if charged, charged Orb,
Pool Ball, etc.) can punch through.

**Jonah — fall speed decreased**
- Gravity: 0.38 → 0.30
- Terminal fall velocity: 9 → 7

Jonah is now meaningfully floatier. Recoveries reach farther, and he's harder
to combo or knock out of the air. The trade-off is the same as before: he's
still the lightest fighter (0.75 weight) and dies early to clean hits.

**Kele — King K. Rool-style super armor on more attacks**
Kele already had a super-armor windup on Power Punch. Three more of his
specials now carry (breakable) armor on commitment frames:

- **Power Punch (neutral):** 14 frames of armor — windup. Unchanged duration.
- **Uppercut (up):** 6 frames of armor — startup. Was iframes before; same value,
  now goes through the >20-dmg break rule.
- **Suplex (side):** 12 frames of armor on the startup. Light jabs no longer
  break Kele out of his grab.
- **Body Slam (down):** 18 frames of armor on the launch + drop. Projectiles
  and weak air hits can't knock him out of the plunge once he commits.

He still loses to clean reads, spacing, grabs, and now any single hit
over 20 dmg.

**Drew — Side-special is now Shield Bash**
The Rushing Sword forward dash is replaced with a short-range Shield Bash:

- Forward velocity: 13 → 6 (less than half — Drew is no longer flying across
  the stage)
- Move duration: 22 → 16 frames
- Active hitbox: tighter and closer to Drew's body (54×30 reach → 36×32 chunk)
- Damage / KB unchanged
- Same 4-frame startup invuln

The move now plays as a punchy point-blank smash with a shield instead of a
lunging sword swipe.

**Angus — down-special replaced: Virus**
The old Code Farm channel is gone. Angus's down-special is now a forward
**Virus** projectile:

- Direct hit: 5 dmg + applies the *virus* status to the victim for 3 seconds.
- Virus DoT ticks every 0.5 seconds: 1.5 dmg per tick, no knockback.
- Every tick of the DoT also pumps **+4 code** back into Angus, on top of his
  usual 2-code-per-damage gain. A full 3-second virus is worth ~42 code.
- No code cost to fire (this *is* his code generator now).

Re-infecting refreshes duration (doesn't stack), and the latest Angus owns
the tick payout. Clears on death.

**Angus — passive code regen**
Angus's code meter also ticks up automatically: +0.15 per frame (~9 / sec,
full from empty in ~11 seconds). Stacks with damage-taken gains and virus
ticks. Together with the new virus he's no longer dead in the water if the
opponent refuses to hit him *or* let him channel — landing one virus + the
passive trickle fuels his whole kit.

**Derek — Shuriken is now a three-shuriken spread**
Neutral special throws three shuriken in a vertical spray instead of one:
center shuriken flies straight, upper and lower shuriken angled ±1.6 px/frame.
Same per-shuriken damage (6) and KB. Whiffed shots still get the full Derek
zoner pressure; up close, all three can connect for big chip.

**Stage — horizontal offstage area widened a LOT**
Previously fighters had 300 px between the stage edge and the blastzone. Now
they have 700 px on each side (over double).

- `WORLD_W`: 1800 → 2200
- `BLAST_LEFT`: 100 → -300
- `BLAST_RIGHT`: 1700 → 2100 (still `WORLD_W - 100`)

Recoveries are much more forgiving. Edgeguards are still possible but require
chasing further off-stage. Stage and ledge positions are unchanged.

**New stage — New Heliopolis**
A fifth stage joins the rotation:

- **Theme:** sunbaked Egyptian ruins. Massive golden sun looming behind the
  stage, drifting sand at the horizon, sandstone-and-gold platform palette.
- **Layout:** stepped-pyramid platforms instead of the classic three-layout —
  two wide lower steps flanking the stage, plus a high narrow peak at center.
- **Gimmick:** none (yet). Pure layout + visual variant.

## Credits

Designed and built collaboratively. Implementation in a single-session iterative process
with extensive playtesting and balance tuning.
