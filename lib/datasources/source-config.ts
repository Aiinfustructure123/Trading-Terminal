import { SourceKey, SourceMode, SourceStatus } from "./types";

const sourceModeMap: Record<SourceKey, SourceMode> = {
  market: "sample",
  onChain: "sample",
  security: "sample",
  ai: "sample",
};

export function getSourceMode(key: SourceKey): SourceMode {
  return sourceModeMap[key];
}

export function getSourceStatuses(): SourceStatus[] {
  return (Object.keys(sourceModeMap) as SourceKey[]).map((key) => ({
    key,
    mode: sourceModeMap[key],
    label: key,
  }));
}
