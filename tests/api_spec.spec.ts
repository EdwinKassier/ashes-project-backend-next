import { test, expect } from "@playwright/test";

test("UI render test", async ({ page }) => {
  // Start from the index page (the baseURL is set via the webServer in the playwright.config.ts)
  await page.goto("/");
  // The new page should contain an h1 with "About Page"
  await expect(page.getByText("Get started by editing")).toContainText(
    "Get started by editing",
  );
});

test("Test api - all valid", async ({ request }) => {
  const newIssue = await request.get(`/api/process_request`, {
    params: {
      symbol: "ETH",
      investment: 123,
    },
  });
  expect(newIssue.ok()).toBeTruthy();

  const responseBody = await newIssue.json();

  // New API returns camelCase
  expect(responseBody.result.numberOfCoins).toBeGreaterThan(0);
  expect(responseBody.result.profit).toBeDefined();

  // Graph data validation (legacy was stringified JSON??)
  // New service returns object directly?
  // Let's check GraphBuilderService... assuming it returns object.
  // Legacy test said: JSON.parse(responseBody.graph_data).length
  // If new API returns object directly, we don't parse.
  // Checking route.ts: result and graph_data are returned directly.

  // Safe check: handle both if possible, or assume object
  const graphData = responseBody.graph_data;
  // If it's an array directly
  expect(graphData.length).toBeGreaterThanOrEqual(1);
});

test("Test api - invalid symbol", async ({ request }) => {
  const newIssue = await request.get(`/api/process_request`, {
    params: {
      symbol: 123,
      investment: 123,
    },
  });
  // Expect 400 Bad Request
  expect(newIssue.status()).toBe(400);

  const responseBody = await newIssue.json();
  // Zod error string
  expect(responseBody.result).toContain("Expected string, received number");
});

test("Test api - no symbol", async ({ request }) => {
  const newIssue = await request.get(`/api/process_request`, {
    params: {
      investment: 123,
    },
  });
  expect(newIssue.status()).toBe(400);

  const responseBody = await newIssue.json();
  expect(responseBody.result).toContain("Symbol is required");
});

test("Test api - invalid investment", async ({ request }) => {
  const newIssue = await request.get(`/api/process_request`, {
    params: {
      symbol: "ETH",
      investment: "ETH",
    },
  });
  expect(newIssue.status()).toBe(400);

  const responseBody = await newIssue.json();
  // Investment parsing failure defaults to 0 or NaN, likely "Investment must be a positive number"
  // Route logic: parseFloat("ETH") -> NaN.
  // CryptoAnalysisSchema probably validates number > 0.
  expect(responseBody.result).toContain("Investment must be a positive number");
});

test("Test api - no investment", async ({ request }) => {
  const newIssue = await request.get(`/api/process_request`, {
    params: {
      symbol: "ETH",
    },
  });
  expect(newIssue.status()).toBe(400);

  const responseBody = await newIssue.json();
  // parseFloat(null) -> 0. Schema: min(0)?
  // Logic in route: investmentString ? parseFloat : 0.
  // Zod: investment.min(0)? If min is 1?
  expect(responseBody.result).toContain("Investment must be a positive number");
});

test("Test api - no args", async ({ request }) => {
  const newIssue = await request.get(`/api/process_request`, {
    params: {},
  });
  expect(newIssue.status()).toBe(400);

  const responseBody = await newIssue.json();
  expect(responseBody.result).toContain("Symbol is required");
});
