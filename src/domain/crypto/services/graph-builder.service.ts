import {
  DataFetchException,
  InvalidSymbolException,
} from "../exceptions/crypto.exceptions";
import * as dataForge from "data-forge";
import { GraphData } from "../types/crypto.types";

export class GraphBuilderService {
  private readonly KRAKEN_API_URL = "https://api.kraken.com/0/public/OHLC";

  async getGraphData(symbol: string): Promise<GraphData> {
    const pair = `${symbol.toUpperCase()}USD`;

    let response;
    try {
      response = await fetch(
        `${this.KRAKEN_API_URL}?pair=${pair}&interval=21600&since=1548111600`,
      );
    } catch (error: any) {
      throw new DataFetchException(error.message);
    }

    const data = (await response.json()) as any;

    if (data.error && data.error.length > 0) {
      throw new InvalidSymbolException(symbol);
    }

    const resultKeys = Object.keys(data.result).filter((key) =>
      key.includes("USD"),
    );
    if (resultKeys.length === 0) {
      throw new InvalidSymbolException(symbol);
    }
    const targetData = data.result[resultKeys[0]];

    const df = new dataForge.DataFrame(targetData);

    // Rename for frontend graph consumption (x, y)
    // 0: time, 4: close price
    const renamedDf = df.renameSeries({
      "0": "x",
      "4": "y",
    });

    const processedDf = renamedDf.generateSeries({
      x: (row: any) => new Date(parseInt(row.x) * 1000).toISOString(), // Kraken is in seconds
      y: (row: any) => parseFloat(row.y),
    });

    // Drop unused columns
    // We only want x and y
    const finalDf = processedDf.subset(["x", "y"]);

    const points = finalDf.toArray().map((row: any) => ({
      x: row.x,
      y: row.y,
    }));

    return {
      points,
      color: "blue", // Default color
    };
  }
}
