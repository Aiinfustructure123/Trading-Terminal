import { z } from "zod";

export const GeckoOHLCVItemSchema = z.tuple([
  z.number(), // timestamp (seconds)
  z.number(), // open
  z.number(), // high
  z.number(), // low
  z.number(), // close
  z.number(), // volume
]);

export const GeckoOHLCVResponseSchema = z.object({
  data: z.object({
    id:   z.string(),
    type: z.string(),
    attributes: z.object({
      ohlcv_list: z.array(GeckoOHLCVItemSchema),
    }),
  }),
});

export const GeckoPoolSchema = z.object({
  id:   z.string(),
  type: z.string(),
  attributes: z.object({
    name:              z.string(),
    address:           z.string(),
    base_token_price_usd:  z.string().optional(),
    quote_token_price_usd: z.string().optional(),
    volume_usd: z.object({
      h24: z.string().optional(),
      h6:  z.string().optional(),
      h1:  z.string().optional(),
    }).optional(),
    price_change_percentage: z.object({
      h24: z.string().optional(),
      h6:  z.string().optional(),
      h1:  z.string().optional(),
    }).optional(),
    reserve_in_usd:    z.string().optional(),
    fdv_usd:           z.string().optional(),
    market_cap_usd:    z.string().nullish(),
    pool_created_at:   z.string().optional(),
  }),
  relationships: z.object({
    base_token:  z.object({ data: z.object({ id: z.string() }) }).optional(),
    quote_token: z.object({ data: z.object({ id: z.string() }) }).optional(),
    dex:         z.object({ data: z.object({ id: z.string() }) }).optional(),
  }).optional(),
});

export const GeckoTrendingPoolsResponseSchema = z.object({
  data: z.array(GeckoPoolSchema),
  included: z.array(z.object({
    id:         z.string(),
    type:       z.string(),
    attributes: z.object({
      name:    z.string().optional(),
      symbol:  z.string().optional(),
      address: z.string().optional(),
    }).optional(),
  })).optional(),
});

export type GeckoPool = z.infer<typeof GeckoPoolSchema>;
