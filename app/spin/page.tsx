"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useAddress } from "@/components/shell/AddressProvider";
import { useAirdropStats } from "@/lib/useAirdropStats";
import { recordSpin, type SpinResult } from "@/lib/airdrop-storage";
import { SpinReel } from "@/components/SpinReel";
import { pickRewardTier } from "@/lib/wheel-math";
import { REWARD_TIERS, type RewardTier } from "@/lib/airdrop-config";
import { TokenIcon } from "@/components/icons/TokenIcons";
import { Card, Button, ErrorText } from "@/components/ui";

const FILLER_COUNT = 24;
const BATCH_PAUSE_MS = 550;

interface BatchEntry {
  id: string;
  tier: RewardTier;
}

function buildSequence(winner: RewardTier): RewardTier[] {
  const filler = Array.from(
    { length: FILLER_COUNT },
    () => REWARD_TIERS[Math.floor(Math.random() * REWARD_TIERS.length)]
  );
  return [...filler, winner];
}

export default function SpinPage() {
  const { address, mounted } = useAddress();
  const stats = useAirdropStats(address);

  const [sequence, setSequence] = useState<RewardTier[]>([REWARD_TIERS[0]]);
  const [spinKey, setSpinKey] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<RewardTier | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [batchLog, setBatchLog] = useState<BatchEntry[]>([]);
  const pendingTier = useRef<RewardTier | null>(null);
  const queueRemaining = useRef(0);
  // Mirrors `spinning` but read synchronously by setTimeout callbacks,
  // which otherwise capture a stale `spinning` value from the render they
  // were scheduled in and never see it flip back to false -- that stale
  // closure was why batch spins used to stop after the first one.
  const spinningRef = useRef(false);

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
    if (spinningRef.current) return;

    const tier = pickRewardTier();
    pendingTier.current = tier;
    setResult(null);
    setError(null);
    setSequence(buildSequence(tier));
    setSpinKey((k) => k + 1);
    spinningRef.current = true;
    setSpinning(true);
  }

  function startBatch(count: number) {
    const n = Math.min(count, stats.spinsAvailable);
    if (n <= 0 || spinningRef.current) return;
    setBatchLog([]);
    queueRemaining.current = n;
    spinOnce();
  }

  async function handleSettled() {
    spinningRef.current = false;
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
  const totalsByToken = batchLog.reduce<Record<string, number>>((acc, e) => {
    if (e.tier.amount && e.tier.token) {
      acc[e.tier.token] = (acc[e.tier.token] ?? 0) + e.tier.amount;
    }
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-sans text-2xl font-semibold tracking-tight">Spin the wheel</h1>
        <span className="font-mono text-xs text-muted">
          {stats.spinsAvailable} spin{stats.spinsAvailable === 1 ? "" : "s"} available
        </span>
      </div>

      <Card>
        <SpinReel
          sequence={sequence}
          spinKey={spinKey}
          spinning={spinning}
          onSettled={handleSettled}
        />

        <div className="mt-6 flex flex-wrap justify-center gap-2.5">
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

        {result && !spinning && batchLog.length <= 1 && (
          <div key={batchLog.length} className="pop-in mt-6 rounded-xl bg-surface px-4 py-4 text-center">
            {result.amount && result.token ? (
              <div className="flex items-center justify-center gap-2.5">
                <TokenIcon token={result.token} size={26} />
                <span className="font-sans text-lg font-semibold">{result.label}</span>
              </div>
            ) : (
              <span className="font-sans text-base font-medium text-muted">{result.label}</span>
            )}
          </div>
        )}

        {inBatch && queueRemaining.current > 0 && (
          <p className="text-[11px] text-muted mt-4 text-center">
            {queueRemaining.current} more spin{queueRemaining.current === 1 ? "" : "s"} left in
            this batch...
          </p>
        )}

        {batchLog.length > 1 && !inBatch && (
          <div className="pop-in mt-6 rounded-xl bg-surface px-4 py-4">
            <p className="text-sm font-semibold mb-1">
              Batch complete -- {wonCount} of {batchLog.length} won something
            </p>
            {Object.keys(totalsByToken).length > 0 ? (
              <div className="flex flex-wrap gap-4 mb-3">
                {Object.entries(totalsByToken).map(([token, total]) => (
                  <div key={token} className="flex items-center gap-2">
                    <TokenIcon token={token as "USDT" | "USDC"} size={22} />
                    <span className="font-mono text-sm font-semibold tabular-nums">
                      +{total.toFixed(2)} {token}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted mb-3">No wins this batch.</p>
            )}
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
      </Card>

      <p className="text-[11px] text-muted mt-4 text-center">
        Odds aren&apos;t equal across outcomes -- see the Rewards page for the exact table.
      </p>
    </div>
  );
}
