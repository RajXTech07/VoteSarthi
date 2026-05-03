import { api } from "../lib/api";

// Mock the global fetch
global.fetch = jest.fn();

describe("API Utility Unit Tests", () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it("successfully calls a GET endpoint", async () => {
    const mockResponse = { status: "ok" };
    fetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockResponse),
    });

    const result = await api.health();

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/health"),
      expect.objectContaining({
        headers: { "Content-Type": "application/json" },
      })
    );
    expect(result).toEqual(mockResponse);
  });

  it("successfully calls a POST endpoint with body", async () => {
    const mockPayload = { question: "How to vote?" };
    const mockResponse = { answer: "Step 1..." };
    
    fetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockResponse),
    });

    const result = await api.askFAQ(mockPayload.question);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/faq/"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(mockPayload),
      })
    );
    expect(result).toEqual(mockResponse);
  });

  it("throws an error for non-OK responses (e.g., 404)", async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 404,
      json: jest.fn().mockResolvedValue({ detail: "Not Found" }),
    });

    await expect(api.getDocuments()).rejects.toThrow("Not Found");
  });

  it("handles empty error details from backend", async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: jest.fn().mockRejectedValue(new Error("Parse Error")),
    });

    await expect(api.getTimeline()).rejects.toThrow("HTTP 500");
  });

  it("handles network/connectivity errors", async () => {
    fetch.mockRejectedValue(new Error("Failed to fetch"));

    await expect(api.health()).rejects.toThrow("Failed to fetch");
  });
});
