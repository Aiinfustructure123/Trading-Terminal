import {
  LayoutDashboard,
  Table2,
  Compass,
  Star,
  Wallet,
  BellRing,
  Settings,
  Palette,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  shortcut?: string;
}

export const NAV: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, shortcut: "G D" },
  { href: "/screener", label: "Screener", icon: Table2, shortcut: "G S" },
  { href: "/discovery", label: "Discovery", icon: Compass, shortcut: "G O" },
  { href: "/watchlist", label: "Watchlist", icon: Star, shortcut: "G W" },
  { href: "/smart-money", label: "Smart Money", icon: Wallet, shortcut: "G M" },
  { href: "/alerts", label: "Alerts", icon: BellRing, shortcut: "G A" },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/styleguide", label: "Styleguide", icon: Palette },
];
