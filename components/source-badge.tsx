import { Badge } from "@/components/ui/badge";
import type { SourceMode } from "@/lib/datasources/types";

type SourceBadgeProps = {
  mode: SourceMode;
  label?: string;
};

export function SourceBadge({ mode, label }: SourceBadgeProps) {
  return (
    <Badge tone={mode === "live" ? "live" : "sample"}>
      {label ?? (mode === "live" ? "Live" : "Sample Data")}
    </Badge>
  );
}
