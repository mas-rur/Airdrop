import { IconWallet, IconTicket, IconGift } from "@/components/icons/UiIcons";

export const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: IconWallet },
  { href: "/spin", label: "Spin", icon: IconTicket },
  { href: "/rewards", label: "Rewards", icon: IconGift },
] as const;
