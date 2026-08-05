/**
 * All the "campaign rules" in one place.
 *
 * A note on the reward table: the odds you'd sketch out as percentages
 * (70 / 20 / 20 / 5 / 5 / 0.0001 / 0.0001 / 0.000001 / 0.000001 / 0.0000001)
 * add up to ~120%, which isn't a valid distribution. Below they're kept as
 * integer *weights* in the same ratio to each other -- weight / TOTAL_WEIGHT
 * reproduces your intended proportions exactly, without floating-point
 * rounding error on the very small tiers. Change the `weight` numbers to
 * retune the odds; you don't need them to sum to anything in particular.
 */

export const CHAIN_NAME = "Pay3 Testnet";
export const TESTNET_RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL || "http://localhost:8080";

/** The address that qualifying transactions must be sent to. */
export const REWARD_ADDRESS = "0xe9841251b40e0a57fd2669a4f7b719b0d636e9b8";

/**
 * Each confirmed transaction of exactly this many P3 sent to
 * REWARD_ADDRESS earns exactly 1 spin credit (1:1, no batching).
 */
export const SPIN_TX_AMOUNT = 1;

export type TokenSymbol = "USDT" | "USDC";

export interface RewardTier {
  id: string;
  label: string;
  amount: number | null; // null = "better luck next time"
  token: TokenSymbol | null;
  weight: number;
}

export const REWARD_TIERS: RewardTier[] = [
  { id: "none", label: "Better Luck Next Time", amount: null, token: null, weight: 700_000_000 },
  { id: "usdt-001", label: "0.01 USDT", amount: 0.01, token: "USDT", weight: 200_000_000 },
  { id: "usdc-001", label: "0.01 USDC", amount: 0.01, token: "USDC", weight: 200_000_000 },
  { id: "usdc-01", label: "0.1 USDC", amount: 0.1, token: "USDC", weight: 50_000_000 },
  { id: "usdt-01", label: "0.1 USDT", amount: 0.1, token: "USDT", weight: 50_000_000 },
  { id: "usdc-1", label: "1 USDC", amount: 1, token: "USDC", weight: 1_000 },
  { id: "usdt-1", label: "1 USDT", amount: 1, token: "USDT", weight: 1_000 },
  { id: "usdc-5", label: "5 USDC", amount: 5, token: "USDC", weight: 10 },
  { id: "usdt-5", label: "5 USDT", amount: 5, token: "USDT", weight: 10 },
  { id: "usdc-10", label: "10 USDC", amount: 10, token: "USDC", weight: 1 },
];

export const TOTAL_WEIGHT = REWARD_TIERS.reduce((sum, t) => sum + t.weight, 0);

/**
 * Rewards are recorded as owed the moment a spin lands on them, but this
 * flag is what the Rewards page checks before treating them as
 * withdrawable. Flip it (or wire it to a real date/contract event) when
 * mainnet actually launches.
 */
export const REWARDS_UNLOCKED = false;
export const NO_MINIMUM_WITHDRAW = true;
export const NO_WITHDRAW_FEE = true;
