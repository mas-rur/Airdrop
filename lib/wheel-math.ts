import { REWARD_TIERS, TOTAL_WEIGHT, type RewardTier } from "./airdrop-config";

/** Picks a tier using the configured weights. Client-side only -- fine for
 * a visual demo, but a production system should resolve the spin
 * server-side so the outcome can't be inspected or influenced from
 * devtools. */
export function pickRewardTier(): RewardTier {
  let roll = Math.random() * TOTAL_WEIGHT;
  for (const tier of REWARD_TIERS) {
    if (roll < tier.weight) return tier;
    roll -= tier.weight;
  }
  return REWARD_TIERS[0];
}
