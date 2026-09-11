# slotwire

Live Solana mainnet as a **Western Union telegraph desk**.

The sounder lever drops on each new slot. Fee / load pressure thickens the click train. Skips and failed program signatures punch red on the tape. Hot programs show up as short Morse-ish callsigns (JUP, TKN, RAY…). Sensory instrument — not an explorer, not a dashboard, not a newspaper.

Live: https://robertkodes.github.io/slotwire/

## Builder notes

I wired this as a night office, not a product page. The desk is dark until you press **KEY**; that gesture both unlocks Web Audio and starts JSON-RPC against public mainnet.

Polling stays polite:

- `getSlot` about every 450ms (confirmed)
- `getRecentPerformanceSamples` + `getRecentPrioritizationFees` about every 8s for a congestion proxy
- one rotating `getSignaturesForAddress` about every 7s against a small roster of known programs — that’s how callsigns and failed-tx stamps arrive without pulling a full `getBlock` (those are multi-megabyte on mainnet)

Public endpoints rotate on failure: `api.mainnet-beta.solana.com`, PublicNode, dRPC, Ankr, Llama. Override with `VITE_RPC_URL`. No wallet, no seeds, no trading UI.

Tape encoding is 5-unit Baudot-ish: slot bits plus extra holes as load rises. SAVE 10s writes JSON; REPLAY scrubs it back through the sounder.

`prefers-reduced-motion`: tape steps instead of sliding; armature snaps; mute the sounder if you don’t want clicks.

## Design tokens

Named hex in `src/index.css`:

| token | hex | use |
| --- | --- | --- |
| `--brass` | `#c4a15a` | plates, levers, type accent |
| `--brass-bright` | `#e6d199` | highlights, masthead |
| `--brass-oxide` | `#6b4e24` | aged metal edges |
| `--brass-deep` | `#3d2c12` | engraving / screws |
| `--soot` | `#100e0b` | night office void |
| `--soot-mid` | `#1b1712` | HUD chassis |
| `--walnut` | `#2c1a0e` | desk |
| `--walnut-lit` | `#4a2e18` | wood grain |
| `--paper-cream` | `#e6d7b8` | tape stock |
| `--paper-aged` | `#cbb992` | foxing / edges |
| `--ink` | `#1c1610` | punch holes, HUD type |
| `--ink-faded` | `#5c4e3a` | faint stamps |
| `--alert-red` | `#9b2a1a` | fail / skip stamps |
| `--alert-red-ink` | `#7a1e14` | red punch fill |
| `--tungsten` | `#f2c36b` | lamp, KEY affordance |
| `--tungsten-dim` | `#8a6230` | unpowered glow |
| `--felt-green` | `#243226` | sounder pad |
| `--copper` | `#b87333` | coil windings |
| `--bakelite` | `#1a120c` | key knob / mute |

Type: **Bebas Neue** (condensed industrial mast), **Special Elite** (stamped labels), **Courier Prime** (tape codes / HUD digits). No Inter, no Roboto, no system-ui-only stack.

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:5173/slotwire/` (Vite `base` is `/slotwire/` to match GitHub Pages).

```bash
npm run build
npm run preview
```

## Deploy

Push to `main`. `.github/workflows/pages.yml` builds and publishes the `gh-pages` branch. Repo Pages source should be **branch `gh-pages` / root**. `public/.nojekyll` ships in the artifact.
