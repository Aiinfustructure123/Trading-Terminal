/**
 * Live TokenDataSource — DexScreener (all endpoints) + GeckoTerminal (OHLCV).
 *
 * Endpoint strategy:
 *  - getToken()       → /token-pairs/v1  (all pools for a token, most complete)
 *                        + /tokens/v1    (enriched profile: icon, description, socials)
 *  - getTokens()      → /geckoterminal/trending + /dexscreener/search
 *  - getNewLaunches() → /boosts?type=latest merged with /token-profiles/latest/v1
 *  - getOHLCV()       → GeckoTerminal OHLCV via pair address from token-pairs/v1
 */

import type {
  TokenDataSource, Token, Chain, OHLCVData, CandleInterval,
  NewLaunchesData, ScreenerParams, SourceMeta, NewLaunch, RiskTier,
} from "../types";
import type { DexPair, DexTokenData } from "../schemas/dexscreener";
import { buildConvictionScore } from "@/lib/scoring";
import { SAMPLE_TOKENS } from "../sample/tokens";

const LIVE_META: SourceMeta = {
  mode: "live",
  lastUpdated: new Date().toISOString(),
  provider: "dexscreener",
};

// ── Chain helpers ────────────────────────────────────────────────────────────

function chainFromId(id: string): Chain {
  if (id === "solana") return "solana";
  if (id === "ethereum" || id === "eth") return "ethereum";
  if (id === "base") return "base";
  return "solana";
}

function chainToId(chain: Chain): string {
  if (chain === "ethereum") return "ethereum";
  if (chain === "base") return "base";
  return "solana";
}

function chainToGeckoNetwork(chain: Chain): string {
  if (chain === "ethereum") return "eth";
  if (chain === "base") return "base";
  return "solana";
}

// ── DexPair → Token ──────────────────────────────────────────────────────────

function pairToToken(pair: DexPair, profileData?: DexTokenData | null): Token {
  const liquidity   = pair.liquidity?.usd ?? 0;
  const volume24h   = pair.volume?.h24    ?? 0;
  const volume6h    = pair.volume?.h6     ?? 0;
  const volume1h    = pair.volume?.h1     ?? 0;
  const buys24h     = pair.txns?.h24?.buys  ?? 0;
  const sells24h    = pair.txns?.h24?.sells ?? 0;
  const price       = parseFloat(pair.priceUsd ?? pair.priceNative ?? "0") || 0;
  const ageHours    = pair.pairCreatedAt
    ? (Date.now() - pair.pairCreatedAt) / 3_600_000
    : 0;
  const ageDays     = ageHours / 24;

  const score = buildConvictionScore({
    momentum: {
      priceChange5m:  pair.priceChange?.m5  ?? 0,
      priceChange1h:  pair.priceChange?.h1  ?? 0,
      priceChange6h:  pair.priceChange?.h6  ?? 0,
      priceChange24h: pair.priceChange?.h24 ?? 0,
      volume24h,
      volume6h,
      volume1h,
      buys24h,
      sells24h,
      liquidity,
    },
    security: {
      goplus:   null,
      rugcheck: null,
      liquidity,
      ageHours,
      topHolderConcentrationPct: 0,
    },
  });

  // Prefer profile icon > pair info image
  const logoUrl = profileData?.icon ?? pair.info?.imageUrl;

  return {
    address:           pair.baseToken.address,
    symbol:            pair.baseToken.symbol,
    name:              pair.baseToken.name,
    chain:             chainFromId(pair.chainId),
    logoUrl,
    price,
    priceChange5m:     pair.priceChange?.m5  ?? 0,
    priceChange1h:     pair.priceChange?.h1  ?? 0,
    priceChange6h:     pair.priceChange?.h6  ?? 0,
    priceChange24h:    pair.priceChange?.h24 ?? 0,
    volume24h,
    liquidity,
    marketCap:         pair.marketCap ?? 0,
    fdv:               pair.fdv ?? undefined,
    txns24h:           { buys: buys24h, sells: sells24h },
    age:               ageDays,
    holderCount:       0,
    topHolderConcentration: 0,
    score,
    launchedAt:        pair.pairCreatedAt
      ? new Date(pair.pairCreatedAt).toISOString()
      : undefined,
    dexUrl:            pair.url,
  };
}

// ── API fetch helper ──────────────────────────────────────────────────────────

async function api<T>(path: string): Promise<T> {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`${path} → HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

// ── Best-pair selector ────────────────────────────────────────────────────────

function bestPair(pairs: DexPair[]): DexPair | null {
  if (!pairs.length) return null;
  return pairs
    .filter(p => parseFloat(p.priceUsd ?? "0") > 0)
    .sort((a, b) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0))[0]
    ?? pairs[0];
}

// ── Service implementation ────────────────────────────────────────────────────

export const liveTokenSource: TokenDataSource = {

  async getToken(address: string, chain: Chain = "solana"): Promise<Token> {
    try {
      const chainId = chainToId(chain);

      // Fetch all pools + enriched profile data in parallel
      const [pairs, profileArr] = await Promise.all([
        api<DexPair[]>(`/api/dexscreener/token-pairs?chain=${chainId}&address=${address}`),
        api<DexTokenData[]>(`/api/dexscreener/tokens-v1?chain=${chainId}&addresses=${address}`)
          .catch(() => [] as DexTokenData[]),
      ]);

      const pair    = bestPair(pairs);
      const profile = profileArr?.[0] ?? null;

      if (!pair) throw new Error("No pair data");

      return pairToToken(pair, profile);
    } catch (err) {
      console.warn("[live] getToken fallback:", err);
      return SAMPLE_TOKENS.find(t => t.address === address) ?? SAMPLE_TOKENS[0];
    }
  },

  async getTokens(params: ScreenerParams) {
    try {
      const network = chainToGeckoNetwork(params.chain ?? "solana");
      const chainId = chainToId(params.chain ?? "solana");

      // Parallel fetch: trending pools + optional search + top boosts
      const fetches: Promise<unknown>[] = [
        api<{ data: Array<{ attributes: Record<string, unknown> }> }>(
          `/api/geckoterminal/trending?network=${network}`
        ).catch(() => ({ data: [] })),
        api<{ merged: Array<{ chainId: string; tokenAddress: string }> }>(
          "/api/dexscreener/boosts"
        ).catch(() => ({ merged: [] })),
      ];

      if (params.search) {
        fetches.push(
          api<{ pairs: DexPair[] }>(
            `/api/dexscreener/search?q=${encodeURIComponent(params.search)}`
          ).catch(() => ({ pairs: [] }))
        );
      }

      const [trendingResult, boostsResult, searchResult] = await Promise.all(fetches) as [
        { data: Array<{ attributes: Record<string, unknown> }> },
        { merged: Array<{ chainId: string; tokenAddress: string }> },
        { pairs: DexPair[] } | undefined,
      ];

      // Collect token addresses from trending pools + boosts
      const trendingAddresses = (trendingResult.data ?? [])
        .slice(0, 20)
        .map(p => p.attributes?.address as string)
        .filter(Boolean);

      const boostAddresses = (boostsResult.merged ?? [])
        .filter(b => b.chainId === chainId)
        .slice(0, 20)
        .map(b => b.tokenAddress)
        .filter(Boolean);

      // Deduplicate, batch into chunks of 30
      const allAddresses = [...new Set([...trendingAddresses, ...boostAddresses])];
      const chunks: string[][] = [];
      for (let i = 0; i < allAddresses.length; i += 30) {
        chunks.push(allAddresses.slice(i, i + 30));
      }

      // Fetch via token-pairs/v1 for the best pool data per token
      const pairFetches = await Promise.allSettled(
        chunks.map(chunk =>
          // Use tokens-v1 for enriched data when fetching batches
          api<DexTokenData[]>(
            `/api/dexscreener/tokens-v1?chain=${chainId}&addresses=${chunk.join(",")}`
          )
        )
      );

      // Build pair list from tokens-v1 results
      const allPairs: DexPair[] = searchResult?.pairs ?? [];
      const profileMap = new Map<string, DexTokenData>();

      for (const result of pairFetches) {
        if (result.status === "fulfilled") {
          for (const tokenData of result.value ?? []) {
            profileMap.set(tokenData.address?.toLowerCase() ?? "", tokenData);
            const pairs = tokenData.pairs ?? [];
            const top = bestPair(pairs);
            if (top) allPairs.push(top);
          }
        }
      }

      // Deduplicate by base token address
      const seen = new Map<string, DexPair>();
      for (const pair of allPairs) {
        const addr = pair.baseToken.address;
        const existing = seen.get(addr);
        if (!existing || (pair.liquidity?.usd ?? 0) > (existing.liquidity?.usd ?? 0)) {
          seen.set(addr, pair);
        }
      }

      let tokens = Array.from(seen.values())
        .filter(p => parseFloat(p.priceUsd ?? "0") > 0)
        .map(p => pairToToken(p, profileMap.get(p.baseToken.address.toLowerCase()) ?? null));

      // Apply filters
      if (params.chain)         tokens = tokens.filter(t => t.chain === params.chain);
      if (params.mcapMax)       tokens = tokens.filter(t => t.marketCap <= params.mcapMax!);
      if (params.mcapMin)       tokens = tokens.filter(t => t.marketCap >= params.mcapMin!);
      if (params.liquidityMin)  tokens = tokens.filter(t => t.liquidity >= params.liquidityMin!);
      if (params.ageMaxDays)    tokens = tokens.filter(t => t.age <= params.ageMaxDays!);
      if (params.volumeMin)     tokens = tokens.filter(t => t.volume24h >= params.volumeMin!);
      if (params.riskTiers?.length) {
        tokens = tokens.filter(t => params.riskTiers!.includes(t.score.riskTier));
      }

      // Sort
      const sortBy  = params.sortBy  ?? "score";
      const sortDir = params.sortDir === "asc" ? 1 : -1;
      tokens.sort((a, b) => {
        const val = (t: Token) => ({
          score:         t.score.composite,
          volume24h:     t.volume24h,
          mcap:          t.marketCap,
          liquidity:     t.liquidity,
          age:           t.age,
          priceChange24h:t.priceChange24h,
        })[sortBy] ?? t.score.composite;
        return (val(a) - val(b)) * sortDir;
      });

      const total  = tokens.length;
      const offset = params.offset ?? 0;
      const limit  = params.limit  ?? 50;

      return {
        tokens: tokens.slice(offset, offset + limit),
        total,
        source: { ...LIVE_META, lastUpdated: new Date().toISOString() },
      };
    } catch (err) {
      console.error("[live] getTokens fallback:", err);
      const { sampleTokenSource } = await import("../sample/tokens");
      return sampleTokenSource.getTokens(params);
    }
  },

  async getNewLaunches(chain: Chain = "solana", limit = 20): Promise<NewLaunchesData> {
    try {
      const chainId = chainToId(chain);

      // Use latest boosts + profiles feed
      const [boosts, profiles] = await Promise.all([
        api<{ latest: Array<{ chainId: string; tokenAddress: string; icon?: string }> }>(
          "/api/dexscreener/boosts?type=latest"
        ).then(r => r.latest ?? r).catch(() => []),
        api<{ profiles: Array<{ chainId: string; tokenAddress: string; icon?: string }> }>(
          "/api/dexscreener/profiles"
        ).then(r => r.profiles ?? []).catch(() => []),
      ]);

      // Merge deduped: profiles first, then boosts
      const seen = new Set<string>();
      const merged: Array<{ chainId: string; tokenAddress: string; icon?: string }> = [];
      for (const item of [...profiles, ...boosts as typeof profiles]) {
        const key = `${item.chainId}:${item.tokenAddress}`;
        if (!seen.has(key)) { seen.add(key); merged.push(item); }
      }

      const filtered = merged.filter(b => b.chainId === chainId).slice(0, 30);
      if (!filtered.length) throw new Error("No new launches");

      // Enrich with pair data via tokens-v1
      const addresses = filtered.map(b => b.tokenAddress).join(",");
      const tokenDataArr = await api<DexTokenData[]>(
        `/api/dexscreener/tokens-v1?chain=${chainId}&addresses=${encodeURIComponent(addresses)}`
      ).catch(() => [] as DexTokenData[]);

      const tokenMap = new Map(tokenDataArr.map(t => [t.address?.toLowerCase(), t]));

      const launches: NewLaunch[] = [];

      for (const item of filtered) {
        const tData = tokenMap.get(item.tokenAddress.toLowerCase());
        const pair  = bestPair(tData?.pairs ?? []);
        if (!pair) continue;

        const token   = pairToToken(pair, tData ?? null);
        const ageH    = pair.pairCreatedAt ? (Date.now() - pair.pairCreatedAt) / 3_600_000 : 24;

        launches.push({
          address:          token.address,
          symbol:           token.symbol,
          name:             token.name,
          chain:            token.chain,
          launchedAt:       token.launchedAt ?? new Date().toISOString(),
          initialLiquidity: token.liquidity * 0.7,
          currentLiquidity: token.liquidity,
          volume1h:         pair.volume?.h1 ?? token.volume24h / Math.max(1, ageH),
          riskTier:         token.score.riskTier as RiskTier,
          score:            token.score.composite,
        });

        if (launches.length >= limit) break;
      }

      return {
        launches,
        source: { ...LIVE_META, lastUpdated: new Date().toISOString() },
      };
    } catch (err) {
      console.error("[live] getNewLaunches fallback:", err);
      const { sampleTokenSource } = await import("../sample/tokens");
      return sampleTokenSource.getNewLaunches(chain, limit);
    }
  },

  async getOHLCV(address: string, chain: Chain, interval: CandleInterval): Promise<OHLCVData> {
    try {
      const chainId  = chainToId(chain);
      const network  = chainToGeckoNetwork(chain);

      // Get all pools, pick best for charting
      const pairs = await api<DexPair[]>(
        `/api/dexscreener/token-pairs?chain=${chainId}&address=${address}`
      );
      const pair = bestPair(pairs);
      if (!pair) throw new Error("No pair");

      const ohlcv = await api<{
        data: { attributes: { ohlcv_list: number[][] } };
      }>(
        `/api/geckoterminal/ohlcv?network=${network}&pool=${pair.pairAddress}&interval=${interval}`
      );

      const candles = (ohlcv.data?.attributes?.ohlcv_list ?? [])
        .map(([time, open, high, low, close, volume]) => ({
          time: Math.floor(time), open, high, low, close, volume,
        }))
        .sort((a, b) => a.time - b.time);

      return {
        address,
        interval,
        candles,
        source: { mode: "live", lastUpdated: new Date().toISOString(), provider: "geckoterminal" },
      };
    } catch (err) {
      console.warn("[live] getOHLCV fallback:", err);
      const { sampleTokenSource } = await import("../sample/tokens");
      return sampleTokenSource.getOHLCV(address, chain, interval);
    }
  },
};
