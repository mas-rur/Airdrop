"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  getConnectedAddress,
  setConnectedAddress,
  disconnect as disconnectStorage,
} from "@/lib/airdrop-storage";
import { addressFromPrivateKey } from "@/lib/signer";

interface AddressValue {
  address: string | null;
  mounted: boolean;
  /** Only set when the person pastes a key via the optional signer panel.
   *  Lives in React state alone -- never written to storage, gone on
   *  refresh or full reload. */
  sessionPrivateKey: string | null;
  connect: (address: string) => void;
  connectWithKey: (privateKey: string) => string;
  clearSessionKey: () => void;
  disconnect: () => void;
}

const AddressContext = createContext<AddressValue | null>(null);

export function AddressProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [sessionPrivateKey, setSessionPrivateKey] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setAddress(getConnectedAddress());
    setMounted(true);
  }, []);

  function connect(addr: string) {
    setConnectedAddress(addr);
    setAddress(addr.toLowerCase());
    setSessionPrivateKey(null);
  }

  function connectWithKey(privateKey: string): string {
    const derived = addressFromPrivateKey(privateKey);
    setConnectedAddress(derived);
    setAddress(derived.toLowerCase());
    setSessionPrivateKey(privateKey.trim());
    return derived;
  }

  function clearSessionKey() {
    setSessionPrivateKey(null);
  }

  function disconnect() {
    disconnectStorage();
    setAddress(null);
    setSessionPrivateKey(null);
  }

  return (
    <AddressContext.Provider
      value={{ address, mounted, sessionPrivateKey, connect, connectWithKey, clearSessionKey, disconnect }}
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
