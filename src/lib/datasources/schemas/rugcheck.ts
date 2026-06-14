import { z } from "zod";

export const RugCheckRiskSchema = z.object({
  name:        z.string(),
  value:       z.string().optional(),
  description: z.string().optional(),
  score:       z.number().optional(),
  level:       z.enum(["danger", "warn", "info", "good"]).optional(),
});

export const RugCheckReportSchema = z.object({
  mint:          z.string(),
  score:         z.number().optional(),
  score_normalised: z.number().optional(),
  rugged:        z.boolean().optional(),
  risks:         z.array(RugCheckRiskSchema).optional(),
  token: z.object({
    mintAuthority:   z.string().nullish(),
    freezeAuthority: z.string().nullish(),
    supply:          z.number().optional(),
    decimals:        z.number().optional(),
    isInitialized:   z.boolean().optional(),
  }).optional(),
  markets: z.array(z.object({
    marketType:  z.string().optional(),
    pubkey:      z.string().optional(),
    lp: z.object({
      lpLockedPct: z.number().optional(),
      lpLocked:    z.number().optional(),
    }).optional(),
  })).optional(),
  topHolders: z.array(z.object({
    address:  z.string(),
    pct:      z.number(),
    uiAmount: z.number().optional(),
    owner:    z.string().optional(),
    insider:  z.boolean().optional(),
  })).optional(),
  creator:   z.string().nullish(),
  creatorTokenAccount: z.string().nullish(),
}).passthrough();

export type RugCheckReport = z.infer<typeof RugCheckReportSchema>;
