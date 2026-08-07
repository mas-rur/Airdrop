"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./nav-items";
import { Logo } from "@/components/Logo";
import { shortenAddress } from "@/lib/format";

export function TopNav({ address }: { address: string | null }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto max-w-3xl px-4 py-3.5 sm:px-6 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Logo size={26} />
          <span className="font-sans text-[15px] font-semibold tracking-tight hidden sm:inline">
            Pay3 Airdrop
          </span>
        </Link>

        <nav className="flex items-center gap-1 overflow-x-auto">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                id={`tour-nav-${label.toLowerCase()}`}
                className={`shrink-0 flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-surface text-foreground"
                    : "text-muted hover:bg-surface hover:text-foreground"
                }`}
              >
                <Icon width={16} height={16} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto shrink-0">
          {address && (
            <span className="font-mono text-xs text-muted bg-surface rounded-full px-3 py-1.5">
              {shortenAddress(address)}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
