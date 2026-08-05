import type { TokenSymbol } from "./airdrop-config";

const STORE_KEY = "pay3_airdrop_v1";
const ADDRESS_KEY = "pay3_airdrop_address_v1";

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

interface AccountState {
  spinsUsed: number;
  spinHistory: SpinResult[];
  pendingRewards: Record<TokenSymbol, number>;
  withdrawMethod: WithdrawMethod | null;
  withdrawRequestedAt: number | null;
}

interface Store {
  accounts: Record<string, AccountState>;
}

function emptyAccount(): AccountState {
  return {
    spinsUsed: 0,
    spinHistory: [],
    pendingRewards: { USDT: 0, USDC: 0 },
    withdrawMethod: null,
    withdrawRequestedAt: null,
  };
}

function hasStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

function readStore(): Store {
  if (!hasStorage()) return { accounts: {} };
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (!raw) return { accounts: {} };
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : { accounts: {} };
  } catch {
    return { accounts: {} };
  }
}

function writeStore(store: Store) {
  if (!hasStorage()) return;
  window.localStorage.setItem(STORE_KEY, JSON.stringify(store));
}

export function getConnectedAddress(): string | null {
  if (!hasStorage()) return null;
  return window.localStorage.getItem(ADDRESS_KEY);
}

export function setConnectedAddress(address: string) {
  if (!hasStorage()) return;
  window.localStorage.setItem(ADDRESS_KEY, address.toLowerCase());
}

export function disconnect() {
  if (!hasStorage()) return;
  window.localStorage.removeItem(ADDRESS_KEY);
}

export function getAccountState(address: string): AccountState {
  const store = readStore();
  return store.accounts[address.toLowerCase()] ?? emptyAccount();
}

function updateAccount(address: string, fn: (state: AccountState) => AccountState) {
  const store = readStore();
  const key = address.toLowerCase();
  const current = store.accounts[key] ?? emptyAccount();
  store.accounts[key] = fn(current);
  writeStore(store);
  return store.accounts[key];
}

/** Records a spin outcome: consumes one spin credit and, if it won, credits the reward. */
export function recordSpin(address: string, result: SpinResult) {
  return updateAccount(address, (state) => {
    const pendingRewards = { ...state.pendingRewards };
    if (result.amount && result.token) {
      pendingRewards[result.token] += result.amount;
    }
    return {
      ...state,
      spinsUsed: state.spinsUsed + 1,
      spinHistory: [result, ...state.spinHistory].slice(0, 200),
      pendingRewards,
    };
  });
}

export function setWithdrawMethod(address: string, method: WithdrawMethod) {
  return updateAccount(address, (state) => ({ ...state, withdrawMethod: method }));
}

export function requestWithdraw(address: string) {
  return updateAccount(address, (state) => ({
    ...state,
    withdrawRequestedAt: Date.now(),
  }));
}
