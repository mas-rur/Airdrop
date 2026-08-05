import type { SVGProps } from "react";

/** Generic EVM-wallet badge for the withdrawal-preference field. */
export function EvmWalletIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" width={26} height={26} {...props}>
      <circle cx="16" cy="16" r="16" fill="#627EEA" />
      <path fill="#fff" fillOpacity="0.8" d="M16.3 6v8.1l6.9 3.1z" />
      <path fill="#fff" d="M16.3 6L9.4 17.2l6.9-3.1z" />
      <path fill="#fff" fillOpacity="0.8" d="M16.3 21.9v4.1l6.9-9.6z" />
      <path fill="#fff" d="M16.3 26v-4.1l-6.9-5.5z" />
      <path fill="#fff" fillOpacity="0.6" d="M16.3 20.6l6.9-4.1-6.9-3.1z" />
      <path fill="#fff" fillOpacity="0.6" d="M9.4 16.5l6.9 4.1v-7.2z" />
    </svg>
  );
}
