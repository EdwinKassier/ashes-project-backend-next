import { GET } from "@/app/api/process_request/route";
import { NextRequest } from "next/server";

// Mock Services and Repository
// Mocking the Repository bypasses the DB connection issue in the test env
// and allows us to verify the Controller -> Service flow.

jest.mock("@/infrastructure/repositories/prisma-crypto.repository", () => {
  return {
    PrismaCryptoRepository: jest.fn().mockImplementation(() => {
      return {
        logQuery: jest.fn().mockResolvedValue(undefined),
        findOpeningAverage: jest.fn().mockResolvedValue(100.0), // Mock standard behavior
        saveOpeningAverage: jest.fn().mockResolvedValue(undefined),
        saveResult: jest.fn().mockResolvedValue(undefined),
      };
    }),
  };
});

// Mock global fetch
const mockJson = jest.fn();
const mockFetch = jest.fn().mockResolvedValue({
  json: mockJson,
});
global.fetch = mockFetch;

describe("API Integration: GET /api/process_request", () => {
  beforeEach(() => {
    mockJson.mockReset();
    mockFetch.mockClear();
  });

  it("should return 200 with result and graph data for valid request", async () => {
    // Setup Mock Info
    const mockData = {
      result: {
        XXBTZUSD: [
          [1600000000, "100.0", "110.0", "90.0", "105.0", "102.0", "500.0", 50],
        ],
      },
      error: [],
    };
    mockJson.mockResolvedValue(mockData); // Once for analysis
    // mockJson needs to return data twice (analysis + graph) - logic uses parallel Promise.all ??
    // Actually the mock returns the same promise, so result is reused or called twice.
    // Fetch is called twice.

    const req = new NextRequest(
      "http://localhost:3000/api/process_request?symbol=BTC&investment=1000",
    );

    const response = await GET(req);

    expect(response.status).toBe(200);
    const body = await response.json();

    expect(body).toHaveProperty("result");
    expect(body).toHaveProperty("graph_data");
    expect(body.result.symbol).toBe("BTC");
    expect(body.result.profit).toBeDefined();
  });

  it("should return 400 for missing symbol", async () => {
    const req = new NextRequest(
      "http://localhost:3000/api/process_request?investment=1000",
    );

    const response = await GET(req);

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.result).toContain("Symbol is required");
  });

  it("should return 400 for invalid investment", async () => {
    const req = new NextRequest(
      "http://localhost:3000/api/process_request?symbol=BTC&investment=-50",
    );

    const response = await GET(req);

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.result).toContain("Investment must be a positive number");
  });
});
