"use client";

import { useCallback, useEffect, useState } from "react";
import { rpc, type Account, type HistoryEvent } from "./rpc";
import { REWARD_ADDRESS, SPIN_TX_AMOUNT } from "./airdrop-config";
import { getAccountState } from "./airdrop-storage";

export interface AirdropStats {
  loading: boolean;
  error: string | null;
  account: Account | null;
  totalTxCount: number;
  qualifyingTxCount: number;
  qualifyingHistory: HistoryEvent[];
  points: number;
  spinsEarned: number;
  spinsUsed: number;
  spinsAvailable: number;
  refresh: () => Promise<void>;
}

export function useAirdropStats(address: string | null): AirdropStats {
  const [account, setAccount] = useState<Account | null>(null);
  const [history, setHistory] = useState<HistoryEvent[]>([]);
  const [spinsUsed, setSpinsUsed] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    setError(null);
    try {
      const [acct, hist] = await Promise.all([
        rpc.account(address),
        rpc.history(address),
      ]);
      setAccount(acct);
      setHistory(hist.history);
      setSpinsUsed(getAccountState(address).spinsUsed);
    } catch (e) {
      setError(e instanceof Error ? e.message : "lookup failed");
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    setAccount(null);
    setHistory([]);
    if (address) refresh();
  }, [address, refresh]);

  const qualifyingHistory = history.filter(
    (e) =>
      e.direction === "sent" &&
      e.counterparty.toLowerCase() === REWARD_ADDRESS.toLowerCase() &&
      e.amount === SPIN_TX_AMOUNT
  );
  const qualifyingTxCount = qualifyingHistory.length;
  const points = qualifyingTxCount;
  const spinsEarned = qualifyingTxCount;
  const spinsAvailable = Math.max(0, spinsEarned - spinsUsed);

  return {
    loading,
    error,
    account,
    totalTxCount: history.length,
    qualifyingTxCount,
    qualifyingHistory,
    points,
    spinsEarned,
    spinsUsed,
    spinsAvailable,
    refresh,
  };
}
