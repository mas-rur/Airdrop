"use client";

import { useState } from "react";
import { Button, ErrorText } from "@/components/ui";
import { FlickerSpinner } from "@/components/FlickerSpinner";
import { FLICKER_GRIDS } from "@/lib/flicker-grids";
import { rpc } from "@/lib/rpc";
import { signTransfer } from "@/lib/signer";
import { REWARD_ADDRESS, SPIN_TX_AMOUNT } from "@/lib/airdrop-config";

type Phase = "idle" | "sending" | "confirming" | "confirmed" | "error";

export function EarnSpinPanel({
  address,
  privateKey,
  onConfirmed,
}: {
  address: string;
  privateKey: string;
  onConfirmed: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);

  async function send() {
    setPhase("sending");
    setError(null);
    try {
      const account = await rpc.account(address);
      const tx = signTransfer(
        privateKey,
        REWARD_ADDRESS,
        BigInt(SPIN_TX_AMOUNT),
        BigInt(account.nonce)
      );
      const { tx_hash } = await rpc.sendTx(tx);
      setPhase("confirming");
      await waitForConfirmation(address, tx_hash);
      setPhase("confirmed");
      onConfirmed();
    } catch (e) {
      setError(e instanceof Error ? e.message : "send failed");
      setPhase("error");
    }
  }

  async function waitForConfirmation(addr: string, txHash: string) {
    // Blocks land roughly every few seconds; poll history until this
    // specific tx shows up there (mempool acceptance != confirmation).
    for (let attempt = 0; attempt < 40; attempt++) {
      const { history } = await rpc.history(addr);
      if (history.some((e) => e.tx_hash === txHash)) return;
      await new Promise((r) => setTimeout(r, 1500));
    }
    throw new Error("still pending -- check back in a moment, it'll credit automatically");
  }

  if (phase === "sending" || phase === "confirming") {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-surface px-4 py-3.5">
        <FlickerSpinner grids={FLICKER_GRIDS} onColor="#67c6fe" offColor="#e6e7f0" size={4} gap={2} />
        <span className="text-sm text-muted">
          {phase === "sending" ? "Signing & submitting..." : "Waiting for confirmation..."}
        </span>
      </div>
    );
  }

  if (phase === "confirmed") {
    return (
      <div className="rounded-xl bg-success/10 px-4 py-3.5">
        <p className="text-sm text-success font-medium">Confirmed -- 1 spin credited.</p>
      </div>
    );
  }

  return (
    <div>
      <Button onClick={send}>Send {SPIN_TX_AMOUNT} P3 &amp; earn a spin</Button>
      {phase === "error" && error && <ErrorText>{error}</ErrorText>}
    </div>
  );
}
