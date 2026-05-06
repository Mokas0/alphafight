# Build a 2D Platform Fighter — Implementation Prompt

You are building a complete, playable 2D platform fighter inspired by the
*Super Smash Bros.* lineage. Pick whatever runtime, language, and rendering
stack you think best fits the requirements below; this document specifies
what to build, not how. Aim for a self-contained, distributable artifact a
player can launch with as little setup as possible.

## 1. Game vision in one paragraph

Two fighters on a single fixed stage knock each other off the screen until
one runs out of stocks. Damage accumulates as a percentage; higher percent
means launches go farther. Each fighter has a small set of universal moves
(jump, attack, block, grab) plus four directional **specials** that define
their identity. Matches are short (90 seconds typical), high-energy, and
readable from a distance.

## 2. Hard requirements

- **Local 2-player on one keyboard** is the baseline. Both players must be
  able to move, attack, block, and use specials simultaneously without input
  conflicts.
- **Online 2-player** between two browsers / two machines, room-code based,
  lobby into character select into match. Use deterministic lockstep with
  a small input-delay buffer; both clients run the same simulation from a
  shared seed.
- **Refresh-rate independent simulation.** Game logic ticks at a fixed rate
  (60 Hz). Rendering may run faster; the simulation must not. A 240 Hz
  monitor must play at the same speed as a 60 Hz monitor.
- **No backend you have to host** for online play (use a public signaling
  service, P2P, or whatever is free + zero-ops).
- **One-file or single-binary distribution** if your stack allows it.

## 3. Stage and world

- A single stage with a flat top surface, two ledges (one per side), and
  empty space below + around it.
- The **world** is larger than the **viewport**. Fighters can travel
  off-screen briefly without dying. They die only when they cross explicit
  **blast-zone** boundaries that sit beyond the edges of the visible world.
- The camera tracks the midpoint of both fighters and zooms out when they
  separate (clamped within sane min/max). When one fighter is far off-screen,
  show a directional indicator at the viewport edge with their color and
  a distance warning.

## 4. Universal mechanics

### Damage and knockback
- Each fighter has a damage **percent** that starts at 0 and accumulates.
- When hit, knockback = `base_knockback * (1 + damage_percent * scaling) /
  weight`. Heavier fighters take less knockback. Tune so first kills happen
  around 80–130%.
- No damage cap.

### Stocks
- First-to-3 stocks wins. On death, respawn at a fixed point with brief
  invulnerability and 0% damage.

### Movement
- Walk, run, jump (configurable max-jumps per character — most have 2,
  the flier has 5), wall-less air control, gravity, terminal velocity.
- A **fast-fall** (down while airborne) accelerates downward.
- Helpless / free-fall state: certain recovery moves leave the fighter
  unable to act until they land or get hit, with drift-only horizontal control.
- Landing endlag: dash / propulsion moves apply a brief input-locked
  recovery on touchdown. Getting hit cancels endlag.

### Attacking
- One **attack** button and one **special** button per player.
- Direction modifies both: holding a direction at the moment of input gives
  the side / up / down variant; no direction = neutral.
- Grounded attacks differ from aerials. Aerials come in five variants
  (neutral, forward, back, up, down). The down-air is a meteor / spike that
  sends opponents downward.

### Shielding
- Block button raises a shield that reduces damage and knockback by ~70%.
- Shield has its own HP that **drains while held** (more drain per hit
  absorbed). When it hits zero the shield **breaks** and the fighter is
  stunned wide-open for a long, punishable window.
- Shield regenerates while not blocking.

### Ledges
- Auto-grab when falling within range of either ledge corner.
- Brief invuln (~40 frames) on grab.
- **Auto-drop after 5 seconds** to prevent ledge-stalling.
- Inputs allow climbing up, dropping back, or jumping off.

### Hit confirmation
- Each move has explicit active-frame windows for its hitbox.
- Each active hitbox has a `hasHit` set so a single move can't multi-hit
  the same target on the same swing (unless designed to multi-hit, like a
  flurry move).
- Hits cause hitstun (input lockout proportional to knockback) and a brief
  visual flash on the victim.

### Counters
- A handful of characters have a **counter** down-special: short
  invulnerable window that, if hit during it, instead launches the
  attacker for 1.5× the incoming damage. Counter beats grabs.

### Grabs
- Some specials are **command grabs** that pierce shields. Counter beats
  them; ordinary attacks don't. On grab connect, the grabber locks the
  victim into a throw animation and deals damage / launch.

## 5. Roster

You need **13 characters**, each with four directional specials, a unique
visual silhouette / palette, and stats (walk speed, jump strength, max
jumps, weight, shield-HP). Each character should feel distinctly different
to play. Don't make them carbon copies. Suggested archetypes (you may
rename / re-skin freely, but preserve the design intent):

1. **Rushdown** — Fast close-range pressure with fire. Fireball that bounces
   on the floor; invuln-startup KO dash; recovery propulsion; counter.
2. **Zoner** — Ranged ninja. Fast straight projectile; piercing low-damage
   spacer projectile; vertical sword dash; lingering smoke AoE.
3. **Trapper** — Poison damage-over-time. Heaviest melee punch (KB scales
   with run speed); a vine projectile that yanks the victim toward you and
   poisons them; lobbed bomb that lands as a poison cloud; armed stationary
   trap. Regular attacks deal reduced base damage to compensate for DoT power.
4. **Hybrid soldier** — Lobbed grenade with friendly-fire blast; a heavy
   single punch with long endlag; a super-armored mega-jump recovery; a
   shield-piercing command grab.
5. **Heavyweight** — Slow but devastating. Super-armored windup punch;
   shield-piercing suplex; uppercut sending into free-fall; plunging body
   slam with shockwave AoE.
6. **Flier** — Lightest, 5 air jumps, floaty gravity. Short-range shotgun
   spread; close-range mash-grab that pierces shields and lets the grabber
   tap an attack button to deal repeated damage for up to 2 seconds; gliding
   recovery; bouncing vertical spike.
7. **Controller** — Battlefield manipulation. Charge-up energy orb
   projectile; dual-mode rifle (laser + bayonet thrust); short-range
   teleport; absorb-projectiles-into-healing.
8. **Pyromaniac** — Has a regenerating **fuel meter** (0–100). Spark-throw
   that ignites nearby gasoline; gas spray that douses (status "fueled");
   rocket-boost recovery that drains fuel; molotov leaving a fire patch.
   Status "fueled" + any ignite source = bonus damage.
9. **Hacker** — Has a **code meter** that fills by taking damage.
   Spawns temporary platforms; plants a wall that **reflects projectiles**;
   grappling hook that yanks targets / pulls self for recovery; channeling
   move that fills the code meter at the cost of being defenseless.
10. **Jester** — Chaos kit. Random-effect lootbox crate; heavy hammer
    overhead; cannon-burst recovery; arcing lobbed cheese.
11. **Ice fighter** — Wields a ski pole. Single-shot heavy projectile (drops
    the pole when thrown until retrieved); telegraphed avalanche column;
    multi-hit upward snow-blast recovery; counter-parry that requires the
    pole.
12. **Billiards / pool** — Sticky-ball setplay. Heavy windup ball-throw;
    sticky 8-ball that's set in place then re-launched on second press;
    pole-vault upward recovery; multi-hit invisible spear flurry.
13. **Boxer** — All-melee, no projectiles, hits hard. Big windup straight
    punch; horizontal dropkick; shield-piercing grab that flings up;
    wide rising uppercut with massive vertical KB.

For each character, define:
- Color palette (primary + accent for visual identity).
- Walk speed, run speed, jump velocity, max jumps, weight (knockback divisor),
  shield HP. Make these meaningfully different.
- Hitbox sizes and damage / knockback values per move. Tune by playtesting.
- Visual flourishes during specials (a glow, a particle burst, a unique
  sprite element like a hammer, ball, or pole).

## 6. Online play

- Pick a P2P-friendly transport (WebRTC data channels, WebSockets, etc.).
- A public signaling service is fine; you don't need to host one.
- **Lockstep determinism**:
  - Both clients run the identical simulation each frame.
  - All RNG goes through a single seeded generator (a small reproducible
    PRNG; mulberry32 or equivalent). The seed is exchanged at match start.
  - Inputs from each player are sent each frame and applied **N frames
    delayed** (3 frames is a good default) to allow buffering.
  - Detect desync by exchanging state hashes every ~60 frames; if they
    diverge, surface a `DESYNC @ frameN` overlay.
- Lobby flow: HOST generates a 6-character room code; GUEST types it.
  After both confirm characters, host starts the match.
- **ESC** at any time tears down the connection and returns to the menu.

## 7. Input layout

| Action | Player 1 | Player 2 |
|---|---|---|
| Move / aim | left-hand WASD cluster | arrow keys |
| Block | left-hand modifier | right-hand modifier |
| Attack | left-hand action key | right-hand action key |
| Special | left-hand secondary | right-hand secondary |
| Confirm / start | shared confirm key | shared confirm key |

Online play uses only the P1 layout; the netcode routes inputs to whichever
fighter index that client owns.

Edge-case handling:
- If a key press + release happens between simulation frames, latch the
  press so it isn't lost.
- Don't let hitstun or other lockouts strand "previous-key" trackers; update
  them outside the early-return paths so directional reads stay fresh.

## 8. UI screens

1. **Mode select** — Local / Host Online / Join Online.
2. **Room-code entry** (online only) — type 6 chars then Enter.
3. **Character select** — multi-row centered grid showing every fighter
   with their portrait, color, and a small stat-bar panel (speed / jump /
   weight / power) normalized across the roster so the bars are comparable.
   Each player picks independently; both confirm to proceed.
4. **Match HUD** — per-player damage % display (color shifts toward red as
   damage rises), stock icons, optional fuel/code meters for characters
   with resource systems. Online mode adds a small status overlay
   (connection state, current frame, ICE/desync warnings).
5. **Game-over screen** — winner name + "press Enter to rematch / ESC for
   menu". In online mode, Enter returns to character select while keeping
   the connection open.

## 9. Visual / audio polish

- Hitsparks, screen shake on heavy KO hits, brief slow-motion on
  match-winning blow.
- Off-screen color-coded directional arrows with distance warnings.
- A simple parallax or color-gradient backdrop is fine; the focus is
  silhouette-readable fighters.
- Sound + music are optional polish; skip if your runtime makes it painful.

## 10. Anti-patterns to avoid

- **Tying simulation rate to render rate.** Use a fixed-timestep accumulator
  with a max-steps-per-frame cap to avoid spiral-of-death after long stalls.
- **Off-screen culling using viewport coords for world-space objects.**
  Cull projectiles against world / blast-zone bounds, not viewport bounds.
- **Naked `moveState.type` checks.** If a move can null its own moveState
  mid-frame (a slam-impact or bounce), the next sibling check in the same
  chain throws. Always guard with `moveState && moveState.type === ...`.
- **Eating input latches in stall paths.** If you have stall/burst frames in
  your netcode, only consume the input latch in the actual capture/snapshot
  step — not in the stall.
- **Refresh-rate-coupled physics.** A 144 Hz monitor should not produce a
  2.4× faster game.

## 11. Required deliverables

When the game is complete, the player should be able to:

1. Open the artifact (one file, one binary, one URL — pick what fits).
2. Pick **Local 2P**, both choose a character, play a match to 3 stocks.
3. Pick **Host Online**, share a room code with a friend on another
   network. Friend picks **Join Online**, types the code, both confirm
   characters, host hits Enter, match starts. Inputs feel responsive
   (≤100 ms input → reaction). Disconnects bail back to the menu cleanly.
4. Replay several matches without restarting the artifact.

A README accompanies the artifact and documents:
- Controls table (P1, P2)
- Each character's four specials in one or two lines each
- Core mechanics (stocks, percent, weight, shields, ledges, blast zones)
- How to deploy / share for online play

## 12. Tone

The game should feel **chaotic, readable, and fast**. Not a sim; not a
hyper-technical fighter. A pickup-and-play party brawler where the depth
comes from learning each character's special set and the timing of the
universal mechanics (block→counter→grab triangles, ledge edgeguards,
percent-based KO ranges).

Build it.
