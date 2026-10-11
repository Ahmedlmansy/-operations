import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  fetchOperations,
  updateOperationStatus,
  configureApi,
  resetApiConfig,
  resetStore,
  seedStore,
  ApiError,
} from "../operationsApi";
import { fixtureOperations } from "../../test/fixtures";

describe("operationsApi", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    seedStore(fixtureOperations);
    resetApiConfig();
  });

  afterEach(() => {
    vi.useRealTimers();
    resetStore();
    resetApiConfig();
  });

  it("rejects when failureRate is 1", async () => {
    configureApi({
      failureRate: 1,
      minDelayMs: 10,
      maxDelayMs: 10,
      random: () => 0,
    });

    const promise = fetchOperations({
      search: "",
      status: "All",
      sortField: "createdAt",
      sortDirection: "desc",
    });
    const assertion = expect(promise).rejects.toBeInstanceOf(ApiError);
    await vi.advanceTimersByTimeAsync(10);
    await assertion;
  });

  it("resolves when failureRate is 0", async () => {
    configureApi({
      failureRate: 0,
      minDelayMs: 10,
      maxDelayMs: 10,
      random: () => 0.5,
    });

    const promise = fetchOperations({
      search: "",
      status: "All",
      sortField: "createdAt",
      sortDirection: "desc",
    });
    await vi.advanceTimersByTimeAsync(10);
    const result = await promise;
    expect(result.total).toBe(6);
    expect(result.stats.Total).toBe(6);
  });

  it("abort rejects with AbortError and clears the timer", async () => {
    configureApi({
      failureRate: 0,
      minDelayMs: 500,
      maxDelayMs: 500,
      random: () => 0,
    });

    const controller = new AbortController();
    const promise = fetchOperations(
      { search: "", status: "All", sortField: "createdAt", sortDirection: "desc" },
      { signal: controller.signal },
    );

    controller.abort();
    await expect(promise).rejects.toMatchObject({ name: "AbortError" });
  });

  it("updateOperationStatus persists for subsequent fetches", async () => {
    configureApi({
      failureRate: 0,
      minDelayMs: 5,
      maxDelayMs: 5,
      random: () => 0,
    });

    const updatePromise = updateOperationStatus("OP-1001", "Completed");
    await vi.advanceTimersByTimeAsync(5);
    const updated = await updatePromise;
    expect(updated.status).toBe("Completed");

    const fetchPromise = fetchOperations({
      search: "",
      status: "All",
      sortField: "createdAt",
      sortDirection: "desc",
    });
    await vi.advanceTimersByTimeAsync(5);
    const result = await fetchPromise;
    expect(result.stats.Pending).toBe(1);
    expect(result.stats.Completed).toBe(2);
    expect(result.data.find((o) => o.id === "OP-1001")?.status).toBe("Completed");
  });
});
