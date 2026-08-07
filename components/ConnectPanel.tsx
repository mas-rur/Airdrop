"use client";

import { useState } from "react";
import { Card, Input, Button, Label, ErrorText } from "@/components/ui";
import { useAddress } from "@/components/shell/AddressProvider";
import { shortenAddress } from "@/lib/format";

export function ConnectPanel() {
  const { connectWithKey, rememberedAddress } = useAddress();
  const [privateKey, setPrivateKey] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleConnect() {
    try {
      connectWithKey(privateKey);
      setError(null);
      setPrivateKey("");
    } catch {
      setError("That doesn't look like a valid private key");
    }
  }

  return (
    <Card>
      <h1 className="font-sans text-xl font-semibold mb-1.5">
        Connect with your private key
      </h1>
      <p className="text-sm text-muted mb-5">
        This is intentionally not just a public address field: pasting in
        someone else&apos;s address used to let anyone view (and even spin
        for) an account that wasn&apos;t theirs. Your key proves it&apos;s
        actually your account. It&apos;s signed and used entirely in your
        browser, kept in memory for this tab only, and{" "}
        <span className="text-foreground">never saved anywhere</span> --
        gone the moment you refresh or close the tab.
      </p>

      {rememberedAddress && (
        <p className="text-xs text-muted mb-4">
          Last connected as{" "}
          <span className="font-mono text-foreground">
            {shortenAddress(rememberedAddress, 6)}
          </span>
          . Paste that account&apos;s key below to reconnect.
        </p>
      )}

      <div className="space-y-3">
        <div>
          <Label>Private key</Label>
          <Input
            type="password"
            value={privateKey}
            onChange={(e) => setPrivateKey(e.target.value)}
            placeholder="0x..."
            onKeyDown={(e) => e.key === "Enter" && handleConnect()}
          />
        </div>
        <Button onClick={handleConnect} disabled={!privateKey.trim()}>
          Connect
        </Button>
      </div>

      {error && <ErrorText>{error}</ErrorText>}
    </Card>
  );
}
