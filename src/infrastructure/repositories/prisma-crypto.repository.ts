import { ICryptoRepository } from "@/domain/crypto/repositories/crypto.repository.interface";
import { CryptoAnalysisResult } from "@/domain/crypto/types/crypto.types";
import { prisma } from "@/infrastructure/database/prisma";

export class PrismaCryptoRepository implements ICryptoRepository {
  async logQuery(symbol: string, investment: number): Promise<void> {
    await prisma.logging.create({
      data: {
        SYMBOL: symbol,
        INVESTMENT: investment,
      },
    });
  }

  async findOpeningAverage(symbol: string): Promise<number | null> {
    const record = await prisma.opening_Average.findFirst({
      where: {
        SYMBOL: symbol,
      },
    });
    return record ? record.AVERAGE : null;
  }

  async saveOpeningAverage(symbol: string, average: number): Promise<void> {
    await prisma.opening_Average.create({
      data: {
        SYMBOL: symbol,
        AVERAGE: average,
      },
    });
  }

  async saveResult(result: CryptoAnalysisResult): Promise<void> {
    await prisma.results.create({
      data: {
        QUERY: `Symbol: ${result.symbol}, Investment: ${result.investment}`, // Mapping legacy "QUERY" field
        SYMBOL: result.symbol,
        INVESTMENT: result.investment,
        NUMBERCOINS: result.numberOfCoins,
        PROFIT: result.profit,
        GROWTHFACTOR: result.growthFactor,
        LAMBOS: result.lambos,
      },
    });
  }
}
