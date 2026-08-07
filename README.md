# airdrop-dashboard

`airdrop.pay3.space` -- turns confirmed Pay3 Testnet activity into spins on
an animated prize wheel, with provisional USDT/USDC-denominated rewards.
Built with Next.js + Tailwind + Supabase, same visual language as
testnet-dashboard.

## What this is (and isn't)

This tracks **testnet engagement points**, styled like a rewards program.
It is not connected to a real payout system:

- `REWARDS_UNLOCKED` in `lib/airdrop-config.ts` is `false` by default --
  the Rewards page shows everything as "locked until mainnet" and doesn't
  claim any of this can be withdrawn yet.
- The withdrawal-preference field only collects an EVM wallet address
  (public, non-sensitive). It deliberately does not collect exchange
  account IDs (Binance/Bybit/MEXC UIDs) -- see the comment in
  `lib/airdrop-storage.ts` for why.

If you build a real, funded payout system later, treat that as a separate
project with its own legal/compliance review -- this app's job is just the
engagement/gamification layer.

## Connecting: private key required, never stored

Earlier versions let you "connect" with just a public address, read-only.
That meant anyone who knew (or guessed) your address could paste it in and
browse -- or even spin -- as if it were their own account, since nothing
proved they actually owned it.

Now the app requires your private key to connect at all:

- It's used entirely in your browser to derive your address and sign the
  optional "earn a spin" transaction.
- It lives in React state for that tab only -- **never written to
  localStorage, never sent to Supabase or anywhere else.** Refresh the
  page and you're logged out; the app remembers your *address* only (for
  a "reconnect as 0x1234...5678" prompt), never the key.

**Known gap, worth knowing about:** this stops the casual case -- someone
can no longer just paste your address into the UI. It does not
cryptographically stop a technically sophisticated person from calling the
Supabase REST API directly for an address they don't hold the key to,
since the RPC functions in `supabase/schema.sql` trust the address
argument they're given. Closing that fully needs a signature-challenge
step verified server-side (e.g. a Supabase Edge Function) before those
functions run -- not implemented here. Ask if you want that built.

## How the spin mechanic works

1. Send exactly `SPIN_TX_AMOUNT` (1) P3 to `REWARD_ADDRESS`
   (`lib/airdrop-config.ts`) from your testnet.pay3.space wallet, or use
   the in-app "Send 1 P3 & earn a spin" button.
2. Once that specific transaction shows up in `/history` on the node (i.e.
   it's confirmed in a block, not just sitting in the mempool), it counts.
3. **Every** qualifying confirmed transaction earns 1 spin -- send five in
   a row and all five count, not just the first. This is enforced with a
   database-level unique constraint on the transaction hash
   (`claimed_transactions.tx_hash`), so it's safe even if you reconnect
   from a different browser or device: a given transaction can only ever
   be claimed once, by whoever gets there first.
4. Spend credits on `/spin` -- one at a time, or as a batch ("Spin x5",
   "Spin all") that runs the wheel automatically N times in a row and
   shows a summary at the end. Outcomes are picked client-side against the
   weights in `REWARD_TIERS`.

## Supabase setup

1. Create a project at supabase.com.
2. SQL Editor -> New query -> paste in `supabase/schema.sql` -> Run.
   This creates the tables, row-level security policies, and the RPC
   functions everything above depends on (see the comments at the top of
   that file for the design rationale).
3. Settings -> API -> copy the Project URL and the `anon` `public` key
   (**not** `service_role`) into `NEXT_PUBLIC_SUPABASE_URL` /
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## First-visit tour

`components/OnboardingTour.tsx` runs once per browser (gated by a
`localStorage` flag that's just a "have they seen this" UX marker, not
account data) using driver.js, walking through the stats, the "earn a
spin" flow, the spin button, and the Rewards nav link. Restyled to match
the app's palette instead of driver.js's default blue theme -- see the
`.driver-*` rules at the bottom of `app/globals.css`.

## Token logos

USDT/USDC badges (`components/icons/TokenIcons.tsx`) hotlink the official
logo images directly from their source (Wikimedia Commons, cryptologos.cc)
rather than copying/hosting them -- used to identify which stablecoin a
reward is denominated in, the same way any exchange or portfolio tracker
does. Falls back to a plain colored monogram if a hotlink ever breaks.

## Configuration

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_RPC_URL` | Same node as testnet-dashboard. Read-only here -- this app never needs a faucet or signing key of its own. |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase's public anon key (safe for the browser -- not `service_role`). |

Campaign rules (reward address, spin amount, the odds table, unlock flag)
all live in `lib/airdrop-config.ts`.

## A note on the odds

The percentages as given (70/20/20/5/5/0.0001/0.0001/0.000001/0.000001/
0.0000001) sum to about 120%, not 100%. Rather than silently picking a
normalization, `REWARD_TIERS` keeps them as integer **weights** in the same
ratio to each other -- `weight / TOTAL_WEIGHT` reproduces the intended
proportions exactly. Change the `weight` numbers in
`lib/airdrop-config.ts` to retune; they don't need to sum to anything in
particular.

## Local development

```bash
npm install
cp .env.example .env.local   # fill in your Supabase project details
npm run dev
```

Needs a reachable `l1_node` (local or the same deployed instance
testnet-dashboard points at) and a Supabase project with `supabase/schema.sql`
already applied.
