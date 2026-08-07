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
import { Card, Button, ErrorText } from "@/components/ui";

const EXTRA_SPINS = 6;
const BATCH_PAUSE_MS = 550;

interface BatchEntry {
  id: string;
  tier: RewardTier;
}

export default function SpinPage() {
  const { address, mounted } = useAddress();
  const stats = useAirdropStats(address);

  const [wheelStart, setWheelStart] = useState(0);
  const [wheelEnd, setWheelEnd] = useState(0);
  const [spinKey, setSpinKey] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<RewardTier | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [batchLog, setBatchLog] = useState<BatchEntry[]>([]);
  const pendingTier = useRef<RewardTier | null>(null);
  const queueRemaining = useRef(0);

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

  function spinOnce() {
    if (spinning) return;

    const tier = pickRewardTier();
    pendingTier.current = tier;
    setResult(null);
    setError(null);

    const sliceIndex = Math.max(0, REWARD_TIERS.findIndex((t) => t.id === tier.id));
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

  function startBatch(count: number) {
    const n = Math.min(count, stats.spinsAvailable);
    if (n <= 0 || spinning) return;
    setBatchLog([]);
    queueRemaining.current = n;
    spinOnce();
  }

  async function handleSettled() {
    setSpinning(false);
    const tier = pendingTier.current;
    if (!tier || !address) return;
    pendingTier.current = null;

    const spinResult: SpinResult = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      tierId: tier.id,
      label: tier.label,
      amount: tier.amount,
      token: tier.token,
      timestamp: Date.now(),
    };

    try {
      const spent = await recordSpin(address, spinResult);
      if (!spent) {
        setError("No spin credit was available for that -- refresh and try again.");
        queueRemaining.current = 0;
        return;
      }
      setResult(tier);
      setBatchLog((log) => [...log, { id: spinResult.id, tier }]);
      await stats.refreshLocal();
    } catch (e) {
      setError(e instanceof Error ? e.message : "couldn't save that spin");
      queueRemaining.current = 0;
      return;
    }

    queueRemaining.current -= 1;
    if (queueRemaining.current > 0) {
      setTimeout(spinOnce, BATCH_PAUSE_MS);
    }
  }

  const inBatch = queueRemaining.current > 0 || spinning;
  const wonCount = batchLog.filter((e) => e.tier.amount).length;

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

        <div className="mt-8 flex flex-wrap justify-center gap-2.5">
          <Button onClick={() => startBatch(1)} disabled={stats.spinsAvailable <= 0 || inBatch}>
            {spinning ? "Spinning..." : "Spin"}
          </Button>
          {stats.spinsAvailable >= 2 && (
            <Button
              variant="outline"
              onClick={() => startBatch(5)}
              disabled={stats.spinsAvailable <= 0 || inBatch}
            >
              Spin x5
            </Button>
          )}
          {stats.spinsAvailable >= 2 && (
            <Button
              variant="outline"
              onClick={() => startBatch(stats.spinsAvailable)}
              disabled={stats.spinsAvailable <= 0 || inBatch}
            >
              Spin all ({stats.spinsAvailable})
            </Button>
          )}
        </div>

        {error && <ErrorText>{error}</ErrorText>}

        {result && !spinning && (
          <div key={batchLog.length} className="pop-in mt-6 rounded-xl bg-surface px-4 py-4 text-center">
            {result.amount && result.token ? (
              <div className="flex items-center justify-center gap-2.5">
                <TokenIcon token={result.token} size={30} />
                <span className="font-sans text-lg font-semibold">{result.label}</span>
              </div>
            ) : (
              <span className="font-sans text-base font-medium text-muted">{result.label}</span>
            )}
            {queueRemaining.current > 0 && (
              <p className="text-[11px] text-muted mt-2">
                Next spin in a moment -- {queueRemaining.current} left in this batch.
              </p>
            )}
          </div>
        )}

        {batchLog.length > 1 && !inBatch && (
          <div className="mt-4 rounded-xl bg-surface px-4 py-3">
            <p className="text-xs font-medium mb-2">
              Batch done: {wonCount} of {batchLog.length} won something.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {batchLog.map((e) => (
                <span
                  key={e.id}
                  className={`rounded-full px-2.5 py-1 text-[11px] ${
                    e.tier.amount ? "bg-success/10 text-success" : "bg-border text-muted"
                  }`}
                >
                  {e.tier.label}
                </span>
              ))}
            </div>
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
