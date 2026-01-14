import { GraphBuilderService } from "@/domain/crypto/services/graph-builder.service";
import { InvalidSymbolException } from "@/domain/crypto/exceptions/crypto.exceptions";

// Mock global fetch
const mockJson = jest.fn();
const mockFetch = jest.fn().mockResolvedValue({
  json: mockJson,
});
global.fetch = mockFetch;

describe("GraphBuilderService", () => {
  let service: GraphBuilderService;

  beforeEach(() => {
    service = new GraphBuilderService();
    mockJson.mockReset();
    mockFetch.mockClear();
  });

  it("should build graph data correctly", async () => {
    const mockData = {
      result: {
        XXBTZUSD: [
          [1600000000, "100.0", "110.0", "90.0", "105.0", "102.0", "500.0", 50],
          [
            1600003600,
            "105.0",
            "115.0",
            "100.0",
            "110.0",
            "108.0",
            "600.0",
            60,
          ],
        ],
      },
      error: [],
    };
    mockJson.mockResolvedValue(mockData);

    const result = await service.getGraphData("BTC");

    expect(result.points).toHaveLength(2);
    expect(result.points[0]).toEqual({
      x: new Date(1600000000 * 1000).toISOString(),
      y: 105.0,
    });
    expect(result.points[1]).toEqual({
      x: new Date(1600003600 * 1000).toISOString(),
      y: 110.0,
    });
    expect(result.color).toBe("blue");
  });

  it("should throw InvalidSymbolException for invalid symbol", async () => {
    mockJson.mockResolvedValue({
      result: {},
      error: ["EQuery:Invalid symbol"],
    });

    await expect(service.getGraphData("BAD")).rejects.toThrow(
      InvalidSymbolException,
    );
  });
});
