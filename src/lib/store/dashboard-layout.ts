"use client";

import { createLocalStore } from "./local-store";

export const DASHBOARD_PANEL_IDS = [
  "opportunities",
  "narratives",
  "heatmap",
  "launches",
] as const;

export type DashboardPanelId = (typeof DASHBOARD_PANEL_IDS)[number];

const store = createLocalStore<DashboardPanelId[]>(
  "dashboard-layout",
  [...DASHBOARD_PANEL_IDS],
);

export function useDashboardLayout(): DashboardPanelId[] {
  const value = store.useValue();
  // heal layouts saved before a panel was added/renamed
  const known = value.filter((id) => DASHBOARD_PANEL_IDS.includes(id));
  const missing = DASHBOARD_PANEL_IDS.filter((id) => !known.includes(id));
  return [...known, ...missing];
}

export function setDashboardLayout(layout: DashboardPanelId[]): void {
  store.set(layout);
}
