"use client";

import type { ReactNode } from "react";
import { AddressProvider, useAddress } from "./AddressProvider";
import { TopNav } from "./TopNav";

function Inner({ children }: { children: ReactNode }) {
  const { address } = useAddress();
  return (
    <>
      <TopNav address={address} />
      <main>{children}</main>
    </>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <AddressProvider>
      <Inner>{children}</Inner>
    </AddressProvider>
  );
}
