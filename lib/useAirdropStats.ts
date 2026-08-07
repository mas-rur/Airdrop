"use client";

import { useCallback, useEffect, useState } from "react";
import { rpc, type Account, type HistoryEvent } from "./rpc";
import { REWARD_ADDRESS, SPIN_TX_AMOUNT } from "./airdrop-config";
import { claimRewardTxs, getAccountState, type AccountState } from "./airdrop-storage";

export function useAirdropStats(address: string | null) {
  const [account, setAccount] = useState<Account | null>(null);
  const [history, setHistory] = useState<HistoryEvent[]>([]);
  const [state, setState] = useState<AccountState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    setError(null);
    try {
      const [acct, hist] = await Promise.all([rpc.account(address), rpc.history(address)]);
      setAccount(acct);
      setHistory(hist.history);

      // Every confirmed qualifying transaction gets claimed, not just the
      // newest one -- so if someone sent 5 in a row (or their history
      // simply hadn't been reconciled yet), all 5 count now.
      const qualifying = hist.history.filter(
        (e) =>
          e.direction === "sent" &&
          e.counterparty.toLowerCase() === REWARD_ADDRESS.toLowerCase() &&
          e.amount === SPIN_TX_AMOUNT
      );
      if (qualifying.length > 0) {
        await claimRewardTxs(
          address,
          qualifying.map((e) => ({ txHash: e.tx_hash, amount: e.amount, block: e.block }))
        );
      }

      setState(await getAccountState(address));
    } catch (e) {
      setError(e instanceof Error ? e.message : "lookup failed");
    } finally {
      setLoading(false);
    }
  }, [address]);

  const refreshLocal = useCallback(async () => {
    if (!address) return;
    try {
      setState(await getAccountState(address));
    } catch (e) {
      setError(e instanceof Error ? e.message : "lookup failed");
    }
  }, [address]);

  useEffect(() => {
    if (!address) {
      setAccount(null);
      setHistory([]);
      setState(null);
      return;
    }
    refresh();
  }, [address, refresh]);

  const qualifyingHistory = history.filter(
    (e) =>
      e.direction === "sent" &&
      e.counterparty.toLowerCase() === REWARD_ADDRESS.toLowerCase() &&
      e.amount === SPIN_TX_AMOUNT
  );
  const totalTxCount = history.length;
  const spinsEarned = state?.spinsEarned ?? 0;
  const spinsUsed = state?.spinsUsed ?? 0;
  const spinsAvailable = Math.max(0, spinsEarned - spinsUsed);
  const points = spinsEarned;

  return {
    account,
    history,
    qualifyingHistory,
    totalTxCount,
    points,
    spinsEarned,
    spinsUsed,
    spinsAvailable,
    state,
    loading,
    error,
    refresh,
    refreshLocal,
  };
}
