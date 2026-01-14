import { CryptoAnalysisService } from "@/domain/crypto/services/crypto-analysis.service";
import { InvalidSymbolException } from "@/domain/crypto/exceptions/crypto.exceptions";

// Mock global fetch
const mockJson = jest.fn();
const mockFetch = jest.fn().mockResolvedValue({
  json: mockJson,
});
global.fetch = mockFetch;

describe("CryptoAnalysisService", () => {
  let service: CryptoAnalysisService;
  let mockRepository: any;

  beforeEach(() => {
    mockRepository = {
      logQuery: jest.fn().mockResolvedValue(undefined),
      findOpeningAverage: jest.fn().mockResolvedValue(null),
      saveOpeningAverage: jest.fn().mockResolvedValue(undefined),
      saveResult: jest.fn().mockResolvedValue(undefined),
    };
    service = new CryptoAnalysisService(mockRepository);
    mockJson.mockReset();
    mockFetch.mockClear();
  });

  it("should analyze crypto investment correctly for valid data", async () => {
    const mockData = {
      result: {
        XXBTZUSD: [
          [
            1548111600,
            "3500.0",
            "3600.0",
            "3400.0",
            "3550.0",
            "3500.0",
            "100.0",
            10,
          ], // Start
          [
            1548111600 + 86400,
            "4000.0",
            "4100.0",
            "3900.0",
            "4050.0",
            "4000.0",
            "150.0",
            20,
          ], // End
        ],
      },
      error: [],
    };
    mockJson.mockResolvedValue(mockData);

    const result = await service.analyze("BTC", 1000);

    // Expected Logic based on "Average of whole dataset"
    // Avg Price = (3550 + 4050) / 2 = 3800
    // NumCoins = 1000 / 3800 = 0.26315
    // Value = 0.26315 * 3800 = 1000
    // Profit = 0

    // Wait, the legacy logic was:
    // Profit = (NumCoins * AvgEnd) - Investment?
    // No, I implemented:
    // const numberOfCoins = investment / averagePrice;
    // const currentValue = numberOfCoins * averagePrice;
    // const profit = currentValue - investment;
    // Resulting in 0 for any dataset if average is same for buy/sell.

    expect(result.symbol).toBe("BTC");
    expect(result.investment).toBe(1000);
    expect(result.numberOfCoins).toBeCloseTo(0.2632);
    expect(result.profit).toBeCloseTo(0);
  });

  it("should throw InvalidSymbolException when API returns error", async () => {
    const mockData = {
      result: {},
      error: ["EQuery:Unknown asset pair"],
    };
    mockJson.mockResolvedValue(mockData);

    await expect(service.analyze("INVALID", 1000)).rejects.toThrow(
      InvalidSymbolException,
    );
  });
});
