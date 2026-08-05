"use client";

import Link from "next/link";
import { useAddress } from "@/components/shell/AddressProvider";
import { useAirdropStats } from "@/lib/useAirdropStats";
import { ConnectPanel } from "@/components/ConnectPanel";
import { EarnSpinPanel } from "@/components/EarnSpinPanel";
import { Card, Panel, Button, ErrorText, SectionHeading } from "@/components/ui";
import { FlickerSpinner } from "@/components/FlickerSpinner";
import { FLICKER_GRIDS } from "@/lib/flicker-grids";
import { formatNumber, formatToken, shortenAddress, timeAgo } from "@/lib/format";
import { REWARD_ADDRESS, SPIN_TX_AMOUNT, CHAIN_NAME } from "@/lib/airdrop-config";
import { IconRefresh, IconArrowUpRight, IconCopy } from "@/components/icons/UiIcons";

export default function DashboardPage() {
  const { address, mounted, sessionPrivateKey, disconnect } = useAddress();
  const stats = useAirdropStats(address);

  if (!mounted) return <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6" />;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      {!address ? (
        <ConnectPanel />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="font-sans text-2xl font-semibold tracking-tight">
                Your {CHAIN_NAME} activity
              </h1>
              <p className="font-mono text-xs text-muted mt-1">
                {shortenAddress(address, 6)}
              </p>
            </div>
            <button
              onClick={stats.refresh}
              disabled={stats.loading}
              aria-label="Refresh"
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-surface hover:text-foreground disabled:opacity-40"
            >
              {stats.loading ? (
                <FlickerSpinner grids={FLICKER_GRIDS} onColor="#67c6fe" offColor="#e6e7f0" size={3} gap={1.5} />
              ) : (
                <IconRefresh width={16} height={16} />
              )}
            </button>
          </div>

          {stats.error && <ErrorText>{stats.error}</ErrorText>}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Panel>
              <div className="font-mono text-[11px] uppercase tracking-widest text-muted mb-1">
                Balance
              </div>
              <div className="font-sans text-lg font-semibold tabular-nums">
                {stats.account ? formatToken(stats.account.balance) : "—"}
              </div>
            </Panel>
            <Panel>
              <div className="font-mono text-[11px] uppercase tracking-widest text-muted mb-1">
                Transactions
              </div>
              <div className="font-sans text-lg font-semibold tabular-nums">
                {formatNumber(stats.totalTxCount)}
              </div>
            </Panel>
            <Panel>
              <div className="font-mono text-[11px] uppercase tracking-widest text-muted mb-1">
                Airdrop Points
              </div>
              <div className="font-sans text-lg font-semibold tabular-nums">
                {formatNumber(stats.points)}
              </div>
            </Panel>
            <Panel>
              <div className="font-mono text-[11px] uppercase tracking-widest text-muted mb-1">
                Spins available
              </div>
              <div className="font-sans text-lg font-semibold tabular-nums text-accent-link">
                {stats.spinsAvailable}
              </div>
            </Panel>
          </div>

          <Card>
            <SectionHeading title="Earn a spin" />
            <p className="text-xs text-muted mb-4">
              Send exactly {SPIN_TX_AMOUNT} P3 to the reward address below.
              Once that transaction is confirmed on-chain, it credits 1 spin
              -- 1:1, no batching.
            </p>

            {sessionPrivateKey ? (
              <EarnSpinPanel
                address={address}
                privateKey={sessionPrivateKey}
                onConfirmed={stats.refresh}
              />
            ) : (
              <div className="space-y-3">
                <button
                  onClick={() => navigator.clipboard.writeText(REWARD_ADDRESS)}
                  className="w-full flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-3.5 py-2.5 text-left font-mono text-xs hover:border-accent transition-colors"
                >
                  <span className="break-all">{REWARD_ADDRESS}</span>
                  <IconCopy width={15} height={15} className="text-muted shrink-0" />
                </button>
                <p className="text-xs text-muted">
                  Send it from your{" "}
                  <span className="text-foreground">testnet.pay3.space</span>{" "}
                  wallet's Send form -- or connect with your private key on the
                  home screen to send it directly from here.
                </p>
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Link href="/spin">
                <Button disabled={stats.spinsAvailable === 0}>
                  {stats.spinsAvailable > 0
                    ? `Spin now (${stats.spinsAvailable} available)`
                    : "No spins yet"}
                </Button>
              </Link>
            </div>
          </Card>

          <Card>
            <SectionHeading title="Recent qualifying transactions" />
            {stats.qualifyingHistory.length === 0 && (
              <p className="text-sm text-muted py-2">None yet.</p>
            )}
            {stats.qualifyingHistory.length > 0 && (
              <div className="divide-y divide-border">
                {stats.qualifyingHistory.slice(0, 8).map((e) => (
                  <div key={e.tx_hash} className="py-3 flex items-center gap-3 text-sm">
                    <IconArrowUpRight width={15} height={15} className="text-muted shrink-0" />
                    <span className="font-mono text-xs text-muted">
                      Block {e.block} &middot; {timeAgo(e.timestamp)}
                    </span>
                    <span className="ml-auto font-mono text-xs tabular-nums">
                      {formatNumber(e.amount)} P3
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <button
            onClick={disconnect}
            className="font-mono text-[11px] uppercase tracking-widest text-muted hover:text-foreground"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}
