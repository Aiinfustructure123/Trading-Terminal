import {
  Bell,
  Compass,
  Eye,
  LayoutGrid,
  Radar,
  Settings,
  SlidersHorizontal,
  SwatchBook,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  shortcut?: string;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutGrid, shortcut: "G D" },
  { href: "/screener", label: "Screener", icon: SlidersHorizontal, shortcut: "G S" },
  { href: "/discovery", label: "Discovery", icon: Compass, shortcut: "G O" },
  { href: "/smart-money", label: "Smart Money", icon: Wallet, shortcut: "G M" },
  { href: "/alerts", label: "Alerts", icon: Bell, shortcut: "G A" },
  { href: "/watchlist", label: "Watchlist", icon: Eye, shortcut: "G W" },
  { href: "/settings", label: "Settings", icon: Settings },
];

export const SECONDARY_NAV: NavItem[] = [
  { href: "/styleguide", label: "Styleguide", icon: SwatchBook },
];

export const SCREEN_TITLES: Record<string, string> = {
  "/": "Master Dashboard",
  "/screener": "Token Screener",
  "/discovery": "Discovery",
  "/smart-money": "Smart Money",
  "/alerts": "Alerts Center",
  "/watchlist": "Watchlist",
  "/settings": "Settings",
  "/styleguide": "Styleguide",
};

export const RadarIcon = Radar;
