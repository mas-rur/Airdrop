import { supabase } from "./supabase";
import type { TokenSymbol } from "./airdrop-config";

const REMEMBERED_ADDRESS_KEY = "pay3_airdrop_last_address_v1";

export interface SpinResult {
  id: string;
  tierId: string;
  label: string;
  amount: number | null;
  token: TokenSymbol | null;
  timestamp: number;
}

/**
 * Only an EVM wallet address is collected as a withdrawal preference --
 * that's a public identifier, not an account credential. Exchange UIDs
 * (Binance/Bybit/MEXC) are deliberately not collected here: pairing "give
 * us your exchange account ID" with an unfunded, undated future payout
 * promise is a pattern worth avoiding regardless of intent.
 */
export type WithdrawMethodType = "evm";

export interface WithdrawMethod {
  type: WithdrawMethodType;
  value: string;
}

export interface AccountState {
  spinsEarned: number;
  spinsUsed: number;
  spinHistory: SpinResult[];
  pendingRewards: Record<TokenSymbol, number>;
  withdrawMethod: WithdrawMethod | null;
}

function hasStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

/**
 * Public-address-only convenience so the connect screen can offer
 * "reconnect as 0x1234...5678" without storing anything sensitive -- the
 * private key itself is never written here, only ever kept in React state
 * for the current tab. See components/shell/AddressProvider.tsx.
 */
export function getRememberedAddress(): string | null {
  if (!hasStorage()) return null;
  return window.localStorage.getItem(REMEMBERED_ADDRESS_KEY);
}

export function setRememberedAddress(address: string) {
  if (!hasStorage()) return;
  window.localStorage.setItem(REMEMBERED_ADDRESS_KEY, address.toLowerCase());
}

export function forgetRememberedAddress() {
  if (!hasStorage()) return;
  window.localStorage.removeItem(REMEMBERED_ADDRESS_KEY);
}

/** Reads everything Supabase knows about this address in one round trip. */
export async function getAccountState(address: string): Promise<AccountState> {
  const addr = address.toLowerCase();

  const [accountRes, claimedRes, spinsRes] = await Promise.all([
    supabase.from("airdrop_accounts").select("withdraw_evm_address").eq("address", addr).maybeSingle(),
    supabase.from("claimed_transactions").select("tx_hash", { count: "exact", head: true }).eq("address", addr),
    supabase
      .from("spin_history")
      .select("id, tier_id, label, amount, token, created_at")
      .eq("address", addr)
      .order("created_at", { ascending: false })
      .limit(200),
  ]);

  if (accountRes.error) throw new Error(accountRes.error.message);
  if (claimedRes.error) throw new Error(claimedRes.error.message);
  if (spinsRes.error) throw new Error(spinsRes.error.message);

  const spinHistory: SpinResult[] = (spinsRes.data ?? []).map((row) => ({
    id: row.id,
    tierId: row.tier_id,
    label: row.label,
    amount: row.amount,
    token: row.token as TokenSymbol | null,
    timestamp: new Date(row.created_at).getTime(),
  }));

  const pendingRewards: Record<TokenSymbol, number> = { USDT: 0, USDC: 0 };
  for (const s of spinHistory) {
    if (s.amount && s.token) pendingRewards[s.token] += s.amount;
  }

  return {
    spinsEarned: claimedRes.count ?? 0,
    spinsUsed: spinHistory.length,
    spinHistory,
    pendingRewards,
    withdrawMethod: accountRes.data?.withdraw_evm_address
      ? { type: "evm", value: accountRes.data.withdraw_evm_address }
      : null,
  };
}

/**
 * Attempts to claim confirmed on-chain transactions as spin credits.
 * Safe to call repeatedly with the same txs -- the database's primary key
 * on tx_hash means only the first call for a given transaction actually
 * counts (see supabase/schema.sql). Pre-filters against what's already
 * claimed so a repeat visitor with a long history doesn't re-touch every
 * old transaction on every refresh. Returns how many were newly claimed.
 */
export async function claimRewardTxs(
  address: string,
  txs: { txHash: string; amount: number; block: number }[]
): Promise<number> {
  if (txs.length === 0) return 0;
  const addr = address.toLowerCase();

  const { data: already, error: lookupError } = await supabase
    .from("claimed_transactions")
    .select("tx_hash")
    .eq("address", addr)
    .in("tx_hash", txs.map((t) => t.txHash));
  if (lookupError) throw new Error(lookupError.message);

  const claimedSet = new Set((already ?? []).map((r) => r.tx_hash));
  const unclaimed = txs.filter((t) => !claimedSet.has(t.txHash));
  if (unclaimed.length === 0) return 0;

  const results = await Promise.all(
    unclaimed.map((tx) =>
      supabase.rpc("claim_reward_tx", {
        p_address: address,
        p_tx_hash: tx.txHash,
        p_amount: tx.amount,
        p_block_index: tx.block,
      })
    )
  );

  let newlyClaimed = 0;
  for (const { data, error } of results) {
    if (error) throw new Error(error.message);
    if (data === true) newlyClaimed++;
  }
  return newlyClaimed;
}

/** Spends one spin credit and records the outcome. Returns false if there was no credit to spend. */
export async function recordSpin(address: string, result: SpinResult): Promise<boolean> {
  const { data, error } = await supabase.rpc("record_spin", {
    p_address: address,
    p_tier_id: result.tierId,
    p_label: result.label,
    p_amount: result.amount,
    p_token: result.token,
  });
  if (error) throw new Error(error.message);
  return data === true;
}

export async function setWithdrawMethod(address: string, method: WithdrawMethod): Promise<void> {
  const { error } = await supabase.rpc("set_withdraw_method", {
    p_address: address,
    p_evm_address: method.value,
  });
  if (error) throw new Error(error.message);
}
