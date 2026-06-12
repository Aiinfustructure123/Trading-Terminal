"use client";

import { useQuery } from "@tanstack/react-query";
import { ai, market, onchain, security } from "@/lib/datasources";
import type { CandleInterval, TokenQuery } from "@/lib/datasources/types";

/* Thin TanStack Query wrappers around the source registry. Components
   only touch these hooks; swapping sample→live never changes them.
   refetchInterval gives panels their live-feeling tick. */

export function useMarketPulse() {
  return useQuery({ queryKey: ["market-pulse"], queryFn: () => market.getMarketPulse(), refetchInterval: 6000 });
}

export function useNarratives() {
  return useQuery({ queryKey: ["narratives"], queryFn: () => market.getNarratives(), refetchInterval: 15000 });
}

export function useTokens(query: TokenQuery = {}) {
  return useQuery({ queryKey: ["tokens", query], queryFn: () => market.getTokens(query), refetchInterval: 10000 });
}

export function useToken(address: string) {
  return useQuery({ queryKey: ["token", address], queryFn: () => market.getToken(address), refetchInterval: 8000, enabled: !!address });
}

export function useCandles(address: string, interval: CandleInterval) {
  return useQuery({ queryKey: ["candles", address, interval], queryFn: () => market.getCandles(address, interval), enabled: !!address });
}

export function useNewLaunches() {
  return useQuery({ queryKey: ["new-launches"], queryFn: () => market.getNewLaunches(), refetchInterval: 5000 });
}

export function useMovers() {
  return useQuery({ queryKey: ["movers"], queryFn: () => market.getMovers(), refetchInterval: 12000 });
}

export function useOpportunities(limit = 8) {
  return useQuery({ queryKey: ["opportunities", limit], queryFn: () => market.getTopOpportunities(limit), refetchInterval: 12000 });
}

export function useAlerts() {
  return useQuery({ queryKey: ["alerts"], queryFn: () => market.getAlerts(), refetchInterval: 8000 });
}

export function useHolders(address: string) {
  return useQuery({ queryKey: ["holders", address], queryFn: () => onchain.getHolders(address), enabled: !!address });
}

export function useSmartMoney() {
  return useQuery({ queryKey: ["smart-money"], queryFn: () => onchain.getSmartMoney() });
}

export function useForensics(address: string) {
  return useQuery({ queryKey: ["forensics", address], queryFn: () => security.getForensics(address), enabled: !!address });
}

export function useBrief(address: string) {
  return useQuery({ queryKey: ["brief", address], queryFn: () => ai.getBrief(address), enabled: !!address, refetchOnMount: false, staleTime: 3_600_000 });
}

export function useScenarios(address: string) {
  return useQuery({ queryKey: ["scenarios", address], queryFn: () => ai.getScenarios(address), enabled: !!address, staleTime: 3_600_000 });
}
