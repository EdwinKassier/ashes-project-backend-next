import {
  DataFetchException,
  InvalidSymbolException,
} from "../exceptions/crypto.exceptions";
import { CryptoAnalysisResult } from "../types/crypto.types";
import { ICryptoRepository } from "../repositories/crypto.repository.interface";
import * as dataForge from "data-forge";

/**
 * Service responsible for analyzing cryptocurrency investment potential.
 */
export class CryptoAnalysisService {
  private readonly KRAKEN_API_URL = "https://api.kraken.com/0/public/OHLC";

  constructor(private readonly repository: ICryptoRepository) {}

  /**
   * Analyze the potential profit of an investment if it had been made in the past.
   * @param symbol The crypto symbol (e.g. BTC, ETH)
   * @param investment The amount invested in USD
   */
  async analyze(
    symbol: string,
    investment: number,
  ): Promise<CryptoAnalysisResult> {
    const pair = `${symbol.toUpperCase()}USD`;

    // 0. Log the query (Restore Legacy Feature)
    await this.repository.logQuery(symbol, investment);

    // 1. Check/Fetch Opening Average (Restore Legacy Feature)
    // Legacy Logic: If cache exists, use it. Else fetch "Start" data (historical) and cache it.

    let averageStartPrice = await this.repository.findOpeningAverage(symbol);

    if (!averageStartPrice) {
      // Fetch historical data
      let response;
      try {
        response = await fetch(
          `${this.KRAKEN_API_URL}?pair=${pair}&interval=21600&since=1548111600`,
        );
      } catch (error: any) {
        throw new DataFetchException(error.message);
      }

      const data = (await response.json()) as any;
      if (data.error && data.error.length > 0)
        throw new InvalidSymbolException(symbol);

      const resultKeys = Object.keys(data.result).filter((key) =>
        key.includes("USD"),
      );
      if (resultKeys.length === 0) throw new InvalidSymbolException(symbol);

      const targetData = data.result[resultKeys[0]];
      const df = new dataForge.DataFrame(targetData);

      // Calculate Average of "Historical" data
      // Note: Legacy logic essentially averaged the *entire* dataset available from that endpoint call.
      const renamedDf = df.renameSeries({ "4": "ClosePrice" });
      const processedDf = renamedDf.generateSeries({
        ClosePrice: (row: any) => parseFloat(row.ClosePrice),
      });

      averageStartPrice = processedDf.getSeries("ClosePrice").average();

      // Save to Cache
      await this.repository.saveOpeningAverage(symbol, averageStartPrice);
    }

    // 2. Fetch Current Data (for "End Price")
    // Legacy Logic: Always fetched again.
    let currentResponse;
    try {
      currentResponse = await fetch(
        `${this.KRAKEN_API_URL}?pair=${pair}&interval=21600&since=1548111600`,
      );
    } catch (error: any) {
      throw new DataFetchException(error.message);
    }

    const currentData = (await currentResponse.json()) as any;
    // Assume validity if previous check passed, strictly speaking
    const currentResultKeys = Object.keys(currentData.result).filter((key) =>
      key.includes("USD"),
    );
    const currentTargetData = currentData.result[currentResultKeys[0]];
    const currentDf = new dataForge.DataFrame(currentTargetData);

    const currentRenamedDf = currentDf.renameSeries({ "4": "ClosePrice" });
    const currentProcessedDf = currentRenamedDf.generateSeries({
      ClosePrice: (row: any) => parseFloat(row.ClosePrice),
    });

    const averageEndPrice = currentProcessedDf
      .getSeries("ClosePrice")
      .average();

    // 3. Calculate metrics using the Restore Logic
    // coins = investment / startPrice
    // profit = (coins * endPrice) - investment

    const numberOfCoins = investment / averageStartPrice;
    const endValue = numberOfCoins * averageEndPrice;
    const profit = endValue - investment;

    const result: CryptoAnalysisResult = {
      symbol: symbol.toUpperCase(),
      investment: investment,
      numberOfCoins: parseFloat(numberOfCoins.toFixed(4)),
      profit: parseFloat(profit.toFixed(2)),
      growthFactor: parseFloat((profit / investment).toFixed(2)),
      lambos: parseFloat((profit / 200000).toFixed(4)),
      generatedAt: new Date().toISOString(),
    };

    // 4. Save Result (Restore Legacy Feature)
    await this.repository.saveResult(result);

    return result;
  }
}
