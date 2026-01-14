import { CryptoAnalysisResult } from "../types/crypto.types";

export interface OpeningAverage {
  symbol: string;
  average: number;
}

export interface ICryptoRepository {
  /**
   * Log the query attempt.
   */
  logQuery(symbol: string, investment: number): Promise<void>;

  /**
   * Find the cached opening average for a symbol.
   */
  findOpeningAverage(symbol: string): Promise<number | null>;

  /**
   * Save the opening average for a symbol.
   */
  saveOpeningAverage(symbol: string, average: number): Promise<void>;

  /**
   * Save the final analysis result.
   */
  saveResult(result: CryptoAnalysisResult): Promise<void>;
}
