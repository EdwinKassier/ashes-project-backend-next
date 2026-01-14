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
  // It is now an object { points: [], color: "" }
  expect(graphData.points.length).toBeGreaterThanOrEqual(1);
});

test("Test api - invalid symbol", async ({ request }) => {
  const newIssue = await request.get(`/api/process_request`, {
    params: {
      symbol: "INV@LID", // Use obviously invalid symbol that passes schema string check
      investment: 123,
    },
  });
  // Expect 400 Bad Request
  expect(newIssue.status()).toBe(400);

  const responseBody = await newIssue.json();
  // Validates string, so hits Service -> InvalidSymbolException
  expect(responseBody.result).toContain("Invalid symbol provided");
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
  // "ETH" -> NaN. Zod: expected number, received NaN.
  // The error message might contain JSON structure or raw string.
  // We check for "expected number" OR "NaN" to be safe, or just check that it's an error.
  // The logs showed: "Invalid input: expected number, received NaN"
  expect(responseBody.result).toContain("expected number");
});

test("Test api - no investment", async ({ request }) => {
  const newIssue = await request.get(`/api/process_request`, {
    params: {
      symbol: "ETH",
    },
  });
  expect(newIssue.status()).toBe(400);

  const responseBody = await newIssue.json();
  // Investment 0. Positive means > 0.
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
