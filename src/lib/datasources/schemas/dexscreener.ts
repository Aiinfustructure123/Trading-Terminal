/**
 * Zod schemas for DexScreener API responses.
 * Every external response is validated here — never trust upstream shapes.
 */

import { z } from "zod";

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

export const DexPairSchema = z.object({
  chainId:        z.string(),
  dexId:          z.string().optional(),
  url:            z.string().optional(),
  pairAddress:    z.string(),
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
  liquidity:      DexLiquiditySchema,
  fdv:            z.number().nullish(),
  marketCap:      z.number().nullish(),
  pairCreatedAt:  z.number().nullish(),
  info: z.object({
    imageUrl: z.string().optional(),
    websites: z.array(z.object({ url: z.string() })).optional(),
    socials:  z.array(z.object({ type: z.string(), url: z.string() })).optional(),
  }).optional(),
});

export const DexSearchResponseSchema = z.object({
  pairs: z.array(DexPairSchema).nullable().default([]),
});

export const DexTokenResponseSchema = z.object({
  pairs: z.array(DexPairSchema).nullable().default([]),
});

export const DexProfileSchema = z.object({
  url:         z.string().optional(),
  chainId:     z.string(),
  tokenAddress: z.string(),
  icon:        z.string().optional(),
  header:      z.string().optional(),
  description: z.string().optional(),
  links: z.array(z.object({
    type:  z.string().optional(),
    label: z.string().optional(),
    url:   z.string(),
  })).optional(),
});

export const DexBoostSchema = z.object({
  url:          z.string().optional(),
  chainId:      z.string(),
  tokenAddress: z.string(),
  icon:         z.string().optional(),
  description:  z.string().optional(),
  amount:       z.number().optional(),
  totalAmount:  z.number().optional(),
});

export type DexPair     = z.infer<typeof DexPairSchema>;
export type DexProfile  = z.infer<typeof DexProfileSchema>;
export type DexBoost    = z.infer<typeof DexBoostSchema>;
