import { z } from "zod";

// GoPlus returns "0" or "1" as strings for boolean flags
const BoolStr = z.union([z.literal("0"), z.literal("1"), z.string()]).transform(v => v === "1");

export const GoPlusTokenResultSchema = z.object({
  is_honeypot:          BoolStr.optional(),
  is_mintable:          BoolStr.optional(),
  is_open_source:       BoolStr.optional(),
  is_proxy:             BoolStr.optional(),
  is_blacklisted:       BoolStr.optional(),
  is_whitelisted:       BoolStr.optional(),
  can_take_back_ownership: BoolStr.optional(),
  owner_address:        z.string().optional(),
  creator_address:      z.string().optional(),
  owner_percent:        z.string().optional(),
  creator_percent:      z.string().optional(),
  lp_holder_count:      z.string().optional(),
  lp_total_supply:      z.string().optional(),
  holder_count:         z.string().optional(),
  total_supply:         z.string().optional(),
  token_name:           z.string().optional(),
  token_symbol:         z.string().optional(),
  buy_tax:              z.string().optional(),
  sell_tax:             z.string().optional(),
  transfer_pausable:    BoolStr.optional(),
  selfdestruct:         BoolStr.optional(),
  anti_whale_modifiable: BoolStr.optional(),
  is_anti_whale:        BoolStr.optional(),
  trading_cooldown:     BoolStr.optional(),
  personal_slippage_modifiable: BoolStr.optional(),
  lp_holders: z.array(z.object({
    address:    z.string(),
    percent:    z.string().optional(),
    is_locked:  z.union([z.number(), z.string()]).optional(),
    is_contract: z.union([z.number(), z.string()]).optional(),
  })).optional(),
  holders: z.array(z.object({
    address:  z.string(),
    percent:  z.string().optional(),
    is_locked: z.union([z.number(), z.string()]).optional(),
    tag:      z.string().optional(),
  })).optional(),
  dex: z.array(z.object({
    name:          z.string().optional(),
    liquidity:     z.string().optional(),
    pair:          z.string().optional(),
  })).optional(),
}).passthrough();

export const GoPlusResponseSchema = z.object({
  code:    z.number(),
  message: z.string(),
  result:  z.record(z.string(), GoPlusTokenResultSchema),
});

export type GoPlusTokenResult = z.infer<typeof GoPlusTokenResultSchema>;
