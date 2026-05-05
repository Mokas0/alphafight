# Deploying the Alpha Brawl relay to Fly.io

## One-time setup (5 minutes)

1. Install the Fly CLI:
   ```
   curl -L https://fly.io/install.sh | sh
   ```
   (Windows PowerShell: `iwr https://fly.io/install.ps1 -useb | iex`)

2. Sign up / log in:
   ```
   fly auth signup     # first time
   fly auth login      # if you already have an account
   ```
   No credit card is required for the free hobby tier.

## Deploy

From inside the `relay/` directory:

```
fly launch --copy-config --no-deploy
```

When prompted:
- **App name:** pick something unique like `myname-alphabrawl-relay`
  (this becomes part of the URL: `myname-alphabrawl-relay.fly.dev`)
- **Region:** pick the one closest to you (e.g. `iad` for US East)
- **Postgres / Redis / etc:** say **no** to all of them
- **Deploy now:** say no — we want to confirm the toml first

Then deploy:

```
fly deploy
```

After ~60 seconds you'll see: `https://<your-app>.fly.dev`

## Wire it into the game

Open `index.html`, find this line near the top of the netcode section:

```js
const RELAY_URL = '';   // e.g. 'wss://myname-alphabrawl-relay.fly.dev'
```

Set it to **`wss://<your-app>.fly.dev`** (note: `wss`, not `https`). Save and reload.

That's it. Hosting and joining now go through the relay. No STUN, no TURN,
no NAT — just plain HTTPS-grade WebSockets.

## Verifying it works

Check the server is up:
```
fly status
fly logs
```

When a client connects, you'll see lines like:
```
[room AB12CD] host joined (rooms=1)
[room AB12CD] guest joined
```

## Free-tier notes

- The relay sleeps after a few minutes of no connections (`auto_stop_machines`).
  First connection wakes it in ~3 seconds.
- One shared-CPU 256MB machine handles thousands of game-minutes/month,
  well within the free hobby allowance.
- If you want zero cold-start delay, set `min_machines_running = 1` in
  `fly.toml`. Still free if you only have one app.

## Updating

After editing `relay-server.js`:
```
fly deploy
```

## Stopping

```
fly apps destroy <your-app>
```
