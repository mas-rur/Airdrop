import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.85,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function IconMenu(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 6.5h16" />
      <path d="M4 12h16" />
      <path d="M4 17.5h16" />
    </svg>
  );
}

export function IconClose(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5 5l14 14" />
      <path d="M19 5L5 19" />
    </svg>
  );
}

export function IconCopy(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="8.5" y="8.5" width="11.5" height="11.5" rx="2" />
      <path d="M15.5 8.5V6.25A1.75 1.75 0 0013.75 4.5H5.75A1.75 1.75 0 004 6.25v8A1.75 1.75 0 005.75 16h2.75" />
    </svg>
  );
}

export function IconCheck(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4.5 12.5l5 5L19.5 7" />
    </svg>
  );
}

export function IconWallet(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 7.5A2.5 2.5 0 016.5 5H17a2 2 0 012 2v1" />
      <rect x="3" y="7.5" width="18" height="12.5" rx="2.25" />
      <path d="M16.25 13.5a1.25 1.25 0 100 2.5 1.25 1.25 0 000-2.5z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconGift(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="4" y="9.5" width="16" height="10.5" rx="1.5" />
      <path d="M4 13h16" />
      <path d="M12 9.5V20" />
      <path d="M12 9.5c-1-3-3.5-4-4.7-2.8C6 7.9 7 9.5 12 9.5z" />
      <path d="M12 9.5c1-3 3.5-4 4.7-2.8C18 7.9 17 9.5 12 9.5z" />
    </svg>
  );
}

export function IconTicket(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 9.5a2 2 0 000 4v3a1.5 1.5 0 001.5 1.5h13A1.5 1.5 0 0020 16.5v-3a2 2 0 000-4v-3A1.5 1.5 0 0018.5 5h-13A1.5 1.5 0 004 6.5v3z" />
      <path d="M14 5.5v13" strokeDasharray="2.2 2.2" />
    </svg>
  );
}

export function IconRefresh(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M20 12a8 8 0 10-2.7 6" />
      <path d="M20 6.5V12h-5.5" />
    </svg>
  );
}

export function IconLock(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V7.5a4 4 0 018 0V11" />
    </svg>
  );
}

export function IconChevronRight(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M9.5 5.5L16 12l-6.5 6.5" />
    </svg>
  );
}

export function IconArrowUpRight(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M7 17L17 7" />
      <path d="M8.5 7H17v8.5" />
    </svg>
  );
}

export function IconAlert(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 4.5L21 19.5H3z" />
      <path d="M12 10v4" />
      <circle cx="12" cy="17" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}
