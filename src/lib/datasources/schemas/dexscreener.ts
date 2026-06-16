/**
 * Zod schemas for all DexScreener API endpoints.
 * Every external response is validated here — never trust upstream shapes.
 *
 * Endpoints covered:
 *   GET /latest/dex/search?q=TOKEN
 *   GET /latest/dex/pairs/{chainId}/{pairId}
 *   GET /token-pairs/v1/{chainId}/{tokenAddress}
 *   GET /tokens/v1/{chainId}/{tokenAddresses}
 *   GET /token-boosts/latest/v1
 *   GET /token-boosts/top/v1
 *   GET /token-profiles/latest/v1
 */

import { z } from "zod";

// ── Shared sub-schemas ───────────────────────────────────────────────────────

export const DexTokenSchema = z.object({
  address: z.string(),
  name:    z.string(),
  symbol:  z.string(),
});

export const DexLiquiditySchema = z.object({
  usd:   z.number().optional(),
  base:  z.number().optional(),
  quote: z.number().optional(),
}).optional();

export const DexTxnsSchema = z.object({
  buys:  z.number().default(0),
  sells: z.number().default(0),
});

export const DexInfoSchema = z.object({
  imageUrl: z.string().optional(),
  header:   z.string().optional(),
  openGraph:z.string().optional(),
  websites: z.array(z.object({ label: z.string().optional(), url: z.string() })).optional(),
  socials:  z.array(z.object({ type: z.string(), url: z.string() })).optional(),
}).optional();

// ── Pair schema (used by search, pairs, token-pairs, tokens) ─────────────────

export const DexPairSchema = z.object({
  chainId:        z.string(),
  dexId:          z.string().optional(),
  url:            z.string().optional(),
  pairAddress:    z.string(),
  labels:         z.array(z.string()).optional(),
  baseToken:      DexTokenSchema,
  quoteToken:     DexTokenSchema,
  priceNative:    z.string().optional(),
  priceUsd:       z.string().nullish(),
  txns: z.object({
    m5:  DexTxnsSchema.optional(),
    h1:  DexTxnsSchema.optional(),
    h6:  DexTxnsSchema.optional(),
    h24: DexTxnsSchema.optional(),
  }).optional(),
  volume: z.object({
    h24: z.number().optional(),
    h6:  z.number().optional(),
    h1:  z.number().optional(),
    m5:  z.number().optional(),
  }).optional(),
  priceChange: z.object({
    m5:  z.number().optional(),
    h1:  z.number().optional(),
    h6:  z.number().optional(),
    h24: z.number().optional(),
  }).optional(),
  liquidity:     DexLiquiditySchema,
  fdv:           z.number().nullish(),
  marketCap:     z.number().nullish(),
  pairCreatedAt: z.number().nullish(),
  info:          DexInfoSchema,
  boosts: z.object({
    active: z.number().optional(),
  }).optional(),
});

// ── Response envelopes ───────────────────────────────────────────────────────

/** /latest/dex/search?q= */
export const DexSearchResponseSchema = z.object({
  pairs: z.array(DexPairSchema).nullable().default([]),
});

/** /latest/dex/tokens/{addresses}  (legacy) */
export const DexTokenResponseSchema = z.object({
  pairs: z.array(DexPairSchema).nullable().default([]),
});

/** /latest/dex/pairs/{chainId}/{pairId} */
export const DexPairResponseSchema = z.object({
  pair: DexPairSchema.nullable().optional(),
  // Some responses wrap in pairs array
  pairs: z.array(DexPairSchema).nullable().optional(),
});

/** /token-pairs/v1/{chainId}/{tokenAddress}  — array of pairs */
export const DexTokenPairsV1Schema = z.array(DexPairSchema);

/** /tokens/v1/{chainId}/{tokenAddresses} */
export const DexTokenDataSchema = z.object({
  address:      z.string(),
  name:         z.string().optional(),
  symbol:       z.string().optional(),
  icon:         z.string().optional(),
  header:       z.string().optional(),
  description:  z.string().optional(),
  openGraph:    z.string().optional(),
  websites: z.array(z.object({
    label: z.string().optional(),
    url:   z.string(),
  })).optional(),
  socials: z.array(z.object({
    type:     z.string().optional(),
    platform: z.string().optional(),
    handle:   z.string().optional(),
  })).optional(),
  pairs: z.array(DexPairSchema).optional(),
});

export const DexTokensV1ResponseSchema = z.array(DexTokenDataSchema);

// ── Boosts ───────────────────────────────────────────────────────────────────

export const DexBoostSchema = z.object({
  url:          z.string().optional(),
  chainId:      z.string(),
  tokenAddress: z.string(),
  icon:         z.string().optional(),
  description:  z.string().optional(),
  amount:       z.number().optional(),
  totalAmount:  z.number().optional(),
  links: z.array(z.object({
    label: z.string().optional(),
    type:  z.string().optional(),
    url:   z.string(),
  })).optional(),
});

export const DexBoostsResponseSchema = z.array(DexBoostSchema);

// ── Profiles ─────────────────────────────────────────────────────────────────

export const DexProfileSchema = z.object({
  url:          z.string().optional(),
  chainId:      z.string(),
  tokenAddress: z.string(),
  icon:         z.string().optional(),
  header:       z.string().optional(),
  description:  z.string().optional(),
  links: z.array(z.object({
    type:  z.string().optional(),
    label: z.string().optional(),
    url:   z.string(),
  })).optional(),
});

export const DexProfilesResponseSchema = z.array(DexProfileSchema);

// ── Exported types ────────────────────────────────────────────────────────────

export type DexPair      = z.infer<typeof DexPairSchema>;
export type DexProfile   = z.infer<typeof DexProfileSchema>;
export type DexBoost     = z.infer<typeof DexBoostSchema>;
export type DexTokenData = z.infer<typeof DexTokenDataSchema>;
