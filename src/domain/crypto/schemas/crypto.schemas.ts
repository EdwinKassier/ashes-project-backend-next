import { z } from "zod";

export const CryptoAnalysisSchema = z.object({
  symbol: z
    .string()
    .min(1, "Symbol is required")
    .max(10, "Symbol is too long")
    .toUpperCase(),
  investment: z.coerce
    .number()
    .positive("Investment must be a positive number"),
});

export type CryptoAnalysisInput = z.infer<typeof CryptoAnalysisSchema>;
