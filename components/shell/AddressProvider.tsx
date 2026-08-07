"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  getRememberedAddress,
  setRememberedAddress,
  forgetRememberedAddress,
} from "@/lib/airdrop-storage";
import { addressFromPrivateKey } from "@/lib/signer";

interface AddressValue {
  /** Only ever set together with sessionPrivateKey -- there's no more
   *  "view any address" mode, see ConnectPanel.tsx for why. */
  address: string | null;
  mounted: boolean;
  /** Lives in React state alone -- never written to storage, gone on
   *  refresh or full reload. */
  sessionPrivateKey: string | null;
  /** Public address remembered from the last session, for a
   *  "reconnect as 0x1234...5678" prompt. Not a live session. */
  rememberedAddress: string | null;
  connectWithKey: (privateKey: string) => string;
  disconnect: () => void;
}

const AddressContext = createContext<AddressValue | null>(null);

export function AddressProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [sessionPrivateKey, setSessionPrivateKey] = useState<string | null>(null);
  const [rememberedAddress, setRememberedAddressState] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setRememberedAddressState(getRememberedAddress());
    setMounted(true);
  }, []);

  function connectWithKey(privateKey: string): string {
    const derived = addressFromPrivateKey(privateKey).toLowerCase();
    setRememberedAddress(derived);
    setRememberedAddressState(derived);
    setAddress(derived);
    setSessionPrivateKey(privateKey.trim());
    return derived;
  }

  function clearSession() {
    setAddress(null);
    setSessionPrivateKey(null);
  }

  function forgetRemembered() {
    forgetRememberedAddress();
    setRememberedAddressState(null);
  }

  return (
    <AddressContext.Provider
      value={{
        address,
        mounted,
        sessionPrivateKey,
        rememberedAddress,
        connectWithKey,
        disconnect: () => {
          clearSession();
          forgetRemembered();
        },
      }}
    >
      {children}
    </AddressContext.Provider>
  );
}

export function useAddress() {
  const ctx = useContext(AddressContext);
  if (!ctx) throw new Error("useAddress must be used within an AddressProvider");
  return ctx;
}
