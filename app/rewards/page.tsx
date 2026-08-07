"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAddress } from "@/components/shell/AddressProvider";
import {
  getAccountState,
  setWithdrawMethod,
  type AccountState,
  type WithdrawMethod,
} from "@/lib/airdrop-storage";
import {
  REWARD_TIERS,
  TOTAL_WEIGHT,
  REWARDS_UNLOCKED,
  NO_MINIMUM_WITHDRAW,
  NO_WITHDRAW_FEE,
} from "@/lib/airdrop-config";
import { TokenIcon } from "@/components/icons/TokenIcons";
import { EvmWalletIcon } from "@/components/icons/WalletIcon";
import { IconLock, IconCheck, IconAlert, IconRefresh } from "@/components/icons/UiIcons";
import { FlickerSpinner } from "@/components/FlickerSpinner";
import { FLICKER_GRIDS } from "@/lib/flicker-grids";
import { Card, Panel, Button, Input, Label, Pill, ErrorText, SectionHeading } from "@/components/ui";
import { isValidAddress, timeAgo } from "@/lib/format";

function oddsLabel(weight: number): string {
  const pct = (weight / TOTAL_WEIGHT) * 100;
  if (pct >= 0.01) return `${pct.toFixed(pct >= 1 ? 1 : 3)}%`;
  return `${pct.toExponential(2)}%`;
}

export default function RewardsPage() {
  const { address, mounted } = useAddress();
  const [state, setState] = useState<AccountState | null>(null);
  const [loading, setLoading] = useState(false);
  const [evmAddress, setEvmAddress] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    setError(null);
    try {
      const s = await getAccountState(address);
      setState(s);
      setEvmAddress(s.withdrawMethod?.value ?? "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "couldn't load your rewards");
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    if (address) load();
  }, [address, load]);

  if (!mounted) return <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6" />;

  if (!address) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <Card>
          <p className="text-sm text-muted mb-4">
            Connect your wallet from the dashboard first.
          </p>
          <Link href="/">
            <Button>Go to dashboard</Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <Card>
          <div className="flex items-center gap-3">
            <FlickerSpinner grids={FLICKER_GRIDS} onColor="#67c6fe" offColor="#e6e7f0" size={4} gap={2} />
            <span className="text-sm text-muted">
              {error ? error : "Loading your rewards..."}
            </span>
          </div>
        </Card>
      </div>
    );
  }

  async function saveWithdrawMethod() {
    if (!address) return;
    if (!isValidAddress(evmAddress)) {
      setError("Enter a valid 0x... EVM address");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const method: WithdrawMethod = { type: "evm", value: evmAddress.trim() };
      await setWithdrawMethod(address, method);
      await load();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "couldn't save that");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-sans text-2xl font-semibold tracking-tight">Rewards</h1>
        <button
          onClick={load}
          disabled={loading}
          aria-label="Refresh"
          className="flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-surface hover:text-foreground disabled:opacity-40"
        >
          {loading ? (
            <FlickerSpinner grids={FLICKER_GRIDS} onColor="#67c6fe" offColor="#e6e7f0" size={3} gap={1.5} />
          ) : (
            <IconRefresh width={16} height={16} />
          )}
        </button>
      </div>

      <Card>
        <div className="flex items-start justify-between gap-3 mb-4">
          <SectionHeading title="Provisional balance" />
          <Pill tone={REWARDS_UNLOCKED ? "success" : "neutral"}>
            {REWARDS_UNLOCKED ? <IconCheck width={13} height={13} /> : <IconLock width={13} height={13} />}
            {REWARDS_UNLOCKED ? "Unlocked" : "Locked until mainnet"}
          </Pill>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Panel className="flex items-center gap-3">
            <TokenIcon token="USDT" size={32} />
            <div>
              <div className="font-mono text-[11px] uppercase tracking-widest text-muted">USDT</div>
              <div className="font-sans text-lg font-semibold tabular-nums">
                {state.pendingRewards.USDT.toFixed(2)}
              </div>
            </div>
          </Panel>
          <Panel className="flex items-center gap-3">
            <TokenIcon token="USDC" size={32} />
            <div>
              <div className="font-mono text-[11px] uppercase tracking-widest text-muted">USDC</div>
              <div className="font-sans text-lg font-semibold tabular-nums">
                {state.pendingRewards.USDC.toFixed(2)}
              </div>
            </div>
          </Panel>
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-xl bg-surface px-3.5 py-3">
          <IconAlert width={15} height={15} className="text-muted shrink-0 mt-0.5" />
          <p className="text-[11px] text-muted leading-relaxed">
            These are testnet points, denominated in USDT/USDC for
            reference -- not a real token balance and not a guarantee of
            payout. They unlock only if/when Pay3 mainnet launches. No
            minimum withdrawal, no withdrawal fee, whenever that happens.
          </p>
        </div>
      </Card>

      <Card>
        <SectionHeading title="Withdrawal preference" />
        <p className="text-xs text-muted mb-4">
          Save the EVM wallet address you&apos;d want a future payout sent
          to. There&apos;s no live withdrawal system yet, so nothing is
          requested or sent anywhere by saving it.
        </p>

        <div className="flex items-center gap-3 mb-4">
          <EvmWalletIcon />
          <span className="text-sm font-medium">EVM wallet address</span>
        </div>

        <div className="space-y-3">
          <div>
            <Label>Address</Label>
            <Input
              value={evmAddress}
              onChange={(e) => setEvmAddress(e.target.value)}
              placeholder="0x..."
            />
          </div>
          <Button onClick={saveWithdrawMethod} disabled={!evmAddress.trim() || saving}>
            {saving ? "Saving..." : saved ? "Saved" : "Save"}
          </Button>
          {error && <ErrorText>{error}</ErrorText>}
        </div>

        <p className="text-[11px] text-muted mt-4">
          No minimum withdraw{NO_MINIMUM_WITHDRAW ? "" : " (subject to change)"} &middot; no
          withdrawal fee{NO_WITHDRAW_FEE ? "" : " (subject to change)"}, once withdrawals open.
        </p>
      </Card>

      <Card>
        <SectionHeading title="Reward odds" />
        <div className="divide-y divide-border">
          {REWARD_TIERS.map((tier) => (
            <div key={tier.id} className="py-2.5 flex items-center justify-between text-sm">
              <span className={tier.amount ? "text-foreground" : "text-muted"}>{tier.label}</span>
              <span className="font-mono text-xs text-muted tabular-nums">
                {oddsLabel(tier.weight)}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <SectionHeading title="Spin history" />
        {state.spinHistory.length === 0 && (
          <p className="text-sm text-muted py-2">No spins yet.</p>
        )}
        {state.spinHistory.length > 0 && (
          <div className="divide-y divide-border">
            {state.spinHistory.slice(0, 20).map((s) => (
              <div key={s.id} className="py-3 flex items-center gap-3 text-sm">
                {s.token ? (
                  <TokenIcon token={s.token} size={22} />
                ) : (
                  <span className="h-[22px] w-[22px] rounded-full bg-surface shrink-0" />
                )}
                <span className={s.amount ? "text-foreground" : "text-muted"}>{s.label}</span>
                <span className="ml-auto font-mono text-[11px] text-muted">
                  {timeAgo(Math.floor(s.timestamp / 1000))}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
