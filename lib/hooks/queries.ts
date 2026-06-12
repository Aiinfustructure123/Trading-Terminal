"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAISource,
  getAlertsSource,
  getMarketSource,
  getOnChainSource,
  getSecuritySource,
  getSmartMoneySource,
} from "@/lib/datasources";
import type { CandleInterval, ScreenerQuery } from "@/lib/datasources/types";

/**
 * TanStack Query hooks — components consume these and ONLY these.
 * Swapping sample → live sources changes nothing here or in components.
 */

export function useMarketPulse() {
  return useQuery({
    queryKey: ["marketPulse"],
    queryFn: () => getMarketSource().getMarketPulse(),
    refetchInterval: 5_000,
  });
}

export function useNarratives() {
  return useQuery({
    queryKey: ["narratives"],
    queryFn: () => getMarketSource().getNarratives(),
    refetchInterval: 30_000,
  });
}

export function useScreener(query: ScreenerQuery) {
  return useQuery({
    queryKey: ["screener", query],
    queryFn: () => getMarketSource().screenTokens(query),
    refetchInterval: 8_000,
    placeholderData: (prev) => prev,
  });
}

export function useToken(id: string | null) {
  return useQuery({
    queryKey: ["token", id],
    queryFn: () => getMarketSource().getToken(id!),
    enabled: !!id,
    refetchInterval: 5_000,
  });
}

export function useTokens(ids: string[]) {
  return useQuery({
    queryKey: ["tokens", ids],
    queryFn: () => getMarketSource().getTokens(ids),
    enabled: ids.length > 0,
    refetchInterval: 8_000,
    placeholderData: (prev) => prev,
  });
}

export function useCandles(tokenId: string | null, interval: CandleInterval) {
  return useQuery({
    queryKey: ["candles", tokenId, interval],
    queryFn: () => getMarketSource().getCandles(tokenId!, interval),
    enabled: !!tokenId,
    staleTime: 60_000,
  });
}

export function useNewLaunches(limit = 12) {
  return useQuery({
    queryKey: ["newLaunches", limit],
    queryFn: () => getMarketSource().getNewLaunches(limit),
    refetchInterval: 10_000,
  });
}

export function useTopMovers(limit = 49) {
  return useQuery({
    queryKey: ["topMovers", limit],
    queryFn: () => getMarketSource().getTopMovers(limit),
    refetchInterval: 12_000,
  });
}

export function useTopConviction(limit = 6) {
  return useQuery({
    queryKey: ["topConviction", limit],
    queryFn: () => getMarketSource().getTopConviction(limit),
    refetchInterval: 15_000,
  });
}

export function useRiskReport(tokenId: string | null) {
  return useQuery({
    queryKey: ["riskReport", tokenId],
    queryFn: () => getSecuritySource().getRiskReport(tokenId!),
    enabled: !!tokenId,
    staleTime: 120_000,
  });
}

export function useHolders(tokenId: string | null) {
  return useQuery({
    queryKey: ["holders", tokenId],
    queryFn: () => getOnChainSource().getHolders(tokenId!),
    enabled: !!tokenId,
    staleTime: 60_000,
  });
}

export function useResearchBrief(tokenId: string | null) {
  return useQuery({
    queryKey: ["brief", tokenId],
    queryFn: () => getAISource().getResearchBrief(tokenId!),
    enabled: !!tokenId,
    staleTime: Infinity,
  });
}

export function useRegenerateBrief(tokenId: string | null) {
  const client = useQueryClient();
  return async () => {
    if (!tokenId) return;
    await client.fetchQuery({
      queryKey: ["brief", tokenId],
      queryFn: () => getAISource().getResearchBrief(tokenId, { regenerate: true }),
      staleTime: Infinity,
    });
  };
}

export function useScenarios(tokenId: string | null) {
  return useQuery({
    queryKey: ["scenarios", tokenId],
    queryFn: () => getAISource().getScenarios(tokenId!),
    enabled: !!tokenId,
    staleTime: Infinity,
  });
}

export function useTrackedWallets() {
  return useQuery({
    queryKey: ["trackedWallets"],
    queryFn: () => getSmartMoneySource().getTrackedWallets(),
    staleTime: 60_000,
  });
}

export function useWalletActivity(limit = 20) {
  return useQuery({
    queryKey: ["walletActivity", limit],
    queryFn: () => getSmartMoneySource().getRecentActivity(limit),
    refetchInterval: 20_000,
  });
}

export function useNotifications(limit = 30) {
  return useQuery({
    queryKey: ["notifications", limit],
    queryFn: () => getAlertsSource().getNotifications(limit),
    refetchInterval: 30_000,
  });
}
