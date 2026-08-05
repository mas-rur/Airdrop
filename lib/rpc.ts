import { TESTNET_RPC_URL } from "./airdrop-config";

export const RPC_URL = TESTNET_RPC_URL.replace(/\/$/, "");

export interface Account {
  address: string;
  balance: number;
  nonce: number;
}

export interface HistoryEvent {
  tx_hash: string;
  block: number;
  timestamp: number;
  direction: "sent" | "received";
  counterparty: string;
  amount: number;
}

export interface HistoryResponse {
  address: string;
  history: HistoryEvent[];
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${RPC_URL}${path}`, { cache: "no-store" });
  const body = await res.json();
  if (!res.ok) {
    throw new Error(body?.error || `request failed (${res.status})`);
  }
  return body as T;
}

export interface SignedTx {
  from: string;
  to: string;
  amount: number;
  nonce: number;
  pubkey: string;
  signature: string;
}

async function post<T>(path: string, payload: unknown): Promise<T> {
  const res = await fetch(`${RPC_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = await res.json();
  if (!res.ok) {
    throw new Error(body?.error || `request failed (${res.status})`);
  }
  return body as T;
}

export const rpc = {
  account: (address: string) => get<Account>(`/account/${address}`),
  history: (address: string) => get<HistoryResponse>(`/history/${address}`),
  sendTx: (tx: SignedTx) => post<{ tx_hash: string }>("/tx", tx),
};
