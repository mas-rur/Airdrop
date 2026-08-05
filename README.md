# airdrop-dashboard

`airdrop.pay3.space` -- turns confirmed Pay3 Testnet activity into spins on
an animated prize wheel, with provisional USDT/USDC-denominated rewards.
Built with Next.js + Tailwind, same visual language as testnet-dashboard.

## What this is (and isn't)

This tracks **testnet engagement points**, styled like a rewards program.
It is not connected to a real payout system:

- Reward balances are stored in this browser's `localStorage` only, per
  connected address. Nothing is sent to a server.
- `REWARDS_UNLOCKED` in `lib/airdrop-config.ts` is `false` by default --
  the Rewards page shows everything as "locked until mainnet" and doesn't
  claim any of this can be withdrawn yet.
- The withdrawal-preference field only collects an EVM wallet address
  (public, non-sensitive). It deliberately does not collect exchange
  account IDs (Binance/Bybit/MEXC UIDs) -- see the comment in
  `lib/airdrop-storage.ts` for why.
- Token badges are generic monogram circles, not reproductions of the
  actual Tether/Circle logo marks (`components/icons/TokenIcons.tsx`).

If you build a real, funded payout system later, treat that as a separate
project with its own legal/compliance review -- this app's job is just the
engagement/gamification layer.

## How the spin mechanic works

1. Send exactly `SPIN_TX_AMOUNT` (1) P3 to `REWARD_ADDRESS`
   (`lib/airdrop-config.ts`) from your testnet.pay3.space wallet, or use
   the in-app "Send 1 P3 & earn a spin" button (only shown if you connected
   with a private key -- kept in memory for the tab only, never stored).
2. Once that specific transaction shows up in `/history` on the node (i.e.
   it's confirmed in a block, not just sitting in the mempool), it counts.
3. Each qualifying confirmed transaction = 1 spin credit. No batching.
4. Spend a spin credit on `/spin` -- outcome is picked client-side against
   the weights in `REWARD_TIERS`, then the wheel animates to it.

## Configuration

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_RPC_URL` | Same node as testnet-dashboard. Read-only here -- this app never needs a faucet or signing key of its own. |

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
cp .env.example .env.local
npm run dev
```

Needs a reachable `l1_node` (local or the same deployed instance
testnet-dashboard points at).
