"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useAddress } from "@/components/shell/AddressProvider";
import { useAirdropStats } from "@/lib/useAirdropStats";
import { recordSpin, type SpinResult } from "@/lib/airdrop-storage";
import { SpinWheel, WheelLegend, SLICE_DEG } from "@/components/SpinWheel";
import { pickRewardTier } from "@/lib/wheel-math";
import { REWARD_TIERS, type RewardTier } from "@/lib/airdrop-config";
import { TokenIcon } from "@/components/icons/TokenIcons";
import { Card, Button } from "@/components/ui";

const EXTRA_SPINS = 6;

export default function SpinPage() {
  const { address, mounted } = useAddress();
  const stats = useAirdropStats(address);

  const [wheelStart, setWheelStart] = useState(0);
  const [wheelEnd, setWheelEnd] = useState(0);
  const [spinKey, setSpinKey] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<RewardTier | null>(null);
  const pendingTier = useRef<RewardTier | null>(null);

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

  function spin() {
    if (stats.spinsAvailable <= 0 || spinning) return;

    const tier = pickRewardTier();
    pendingTier.current = tier;
    setResult(null);

    const sliceIndex = Math.max(
      0,
      REWARD_TIERS.findIndex((t) => t.id === tier.id)
    );
    const sliceCenter = (sliceIndex + 0.5) * SLICE_DEG;
    const jitter = (Math.random() - 0.5) * (SLICE_DEG * 0.6);
    const targetWithinSlice = (((sliceCenter + jitter) % 360) + 360) % 360;

    const currentMod = ((wheelEnd % 360) + 360) % 360;
    const forward = ((((360 - targetWithinSlice) - currentMod) % 360) + 360) % 360;
    const newEnd = wheelEnd + forward + EXTRA_SPINS * 360;

    setWheelStart(wheelEnd);
    setWheelEnd(newEnd);
    setSpinKey((k) => k + 1);
    setSpinning(true);
  }

  function handleSettled() {
    setSpinning(false);
    const tier = pendingTier.current;
    if (!tier || !address) return;

    const spinResult: SpinResult = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      tierId: tier.id,
      label: tier.label,
      amount: tier.amount,
      token: tier.token,
      timestamp: Date.now(),
    };
    recordSpin(address, spinResult);
    setResult(tier);
    pendingTier.current = null;
    stats.refresh();
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-sans text-2xl font-semibold tracking-tight">Spin the wheel</h1>
        <span className="font-mono text-xs text-muted">
          {stats.spinsAvailable} spin{stats.spinsAvailable === 1 ? "" : "s"} available
        </span>
      </div>

      <Card>
        <SpinWheel
          spinKey={spinKey}
          startDeg={wheelStart}
          endDeg={wheelEnd}
          spinning={spinning}
          onSettled={handleSettled}
        />

        <div className="mt-8 flex justify-center">
          <Button onClick={spin} disabled={stats.spinsAvailable <= 0 || spinning}>
            {spinning ? "Spinning..." : stats.spinsAvailable > 0 ? "Spin" : "No spins available"}
          </Button>
        </div>

        {result && !spinning && (
          <div className="pop-in mt-6 rounded-xl bg-surface px-4 py-4 text-center">
            {result.amount && result.token ? (
              <div className="flex items-center justify-center gap-2.5">
                <TokenIcon token={result.token} width={30} height={30} />
                <span className="font-sans text-lg font-semibold">{result.label}</span>
              </div>
            ) : (
              <span className="font-sans text-base font-medium text-muted">{result.label}</span>
            )}
            <p className="text-[11px] text-muted mt-2">
              {result.amount
                ? "Added to your provisional balance -- see the Rewards page."
                : "No reward this time -- come back after your next confirmed transaction."}
            </p>
          </div>
        )}

        <WheelLegend />
      </Card>

      <p className="text-[11px] text-muted mt-4 text-center">
        Odds aren&apos;t equal per slice -- see the Rewards page for the exact table.
      </p>
    </div>
  );
}
