import React from "react";
import { DataModeBadge } from "./DataBadge";
import type { DataMode } from "@/lib/datasources/types";

interface PanelHeaderProps {
  label: string;
  mode?: DataMode;
  actions?: React.ReactNode;
  className?: string;
}

export function PanelHeader({ label, mode = "sample", actions, className }: PanelHeaderProps) {
  return (
    <div className={`flex items-center justify-between px-4 py-3 border-b border-border ${className ?? ""}`}>
      <div className="flex items-center gap-3">
        <span className="label-eyebrow">{label}</span>
        <DataModeBadge mode={mode} />
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
