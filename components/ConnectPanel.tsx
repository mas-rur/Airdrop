"use client";

import { useState } from "react";
import { Card, Input, Button, Label, ErrorText } from "@/components/ui";
import { useAddress } from "@/components/shell/AddressProvider";
import { isValidAddress } from "@/lib/format";
import { addressFromPrivateKey } from "@/lib/signer";

export function ConnectPanel() {
  const { connect, connectWithKey } = useAddress();
  const [address, setAddressInput] = useState("");
  const [showKeyPanel, setShowKeyPanel] = useState(false);
  const [privateKey, setPrivateKey] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleConnect() {
    if (!isValidAddress(address)) {
      setError("Enter a valid 0x... address");
      return;
    }
    setError(null);
    connect(address.trim());
  }

  function handleConnectWithKey() {
    try {
      addressFromPrivateKey(privateKey.trim()); // validates format
      setError(null);
      connectWithKey(privateKey);
    } catch {
      setError("That doesn't look like a valid private key");
    }
  }

  return (
    <Card>
      <h1 className="font-sans text-xl font-semibold mb-1.5">Connect your wallet</h1>
      <p className="text-sm text-muted mb-5">
        Enter the public address of your{" "}
        <span className="text-foreground">testnet.pay3.space</span> wallet to
        see your balance, transactions, and airdrop points. This only reads
        public on-chain data -- your private key is never needed here.
      </p>

      <div className="space-y-3">
        <div>
          <Label>Wallet address</Label>
          <Input
            value={address}
            onChange={(e) => setAddressInput(e.target.value)}
            placeholder="0x..."
            onKeyDown={(e) => e.key === "Enter" && handleConnect()}
          />
        </div>
        <Button onClick={handleConnect} disabled={!isValidAddress(address)}>
          Connect
        </Button>
      </div>

      {error && <ErrorText>{error}</ErrorText>}

      <div className="mt-6 pt-5 border-t border-border">
        {!showKeyPanel ? (
          <button
            onClick={() => setShowKeyPanel(true)}
            className="font-mono text-[11px] uppercase tracking-widest text-muted hover:text-foreground"
          >
            Want to send the qualifying transaction from here instead? &rarr;
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-muted">
              Optional, for convenience only. Signs and sends transactions
              entirely in your browser -- the key is kept in memory for this
              tab and is <span className="text-foreground">never saved</span>,
              gone as soon as you refresh or close it.
            </p>
            <div>
              <Label>Private key</Label>
              <Input
                type="password"
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                placeholder="0x..."
                onKeyDown={(e) => e.key === "Enter" && handleConnectWithKey()}
              />
            </div>
            <Button variant="outline" onClick={handleConnectWithKey} disabled={!privateKey.trim()}>
              Connect with key
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
