import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OperationsDashboardContent } from "../OperationsDashboardContent";
import { deferred } from "../../../test/deferred";
import { fixtureOperations } from "../../../test/fixtures";
import type { FetchParams, FetchResult } from "../../../services/operationsApi";
import type { Operation } from "../../../types/operation";
import { computeStats, filterOperations, sortOperations } from "../../../utils/operations";

vi.mock("../../../services/operationsApi", () => ({
  ApiError: class ApiError extends Error {
    code: string;
    constructor(message = "Request failed", code = "NETWORK_ERROR") {
      super(message);
      this.name = "ApiError";
      this.code = code;
    }
  },
  fetchOperations: vi.fn(),
  updateOperationStatus: vi.fn(),
  configureApi: vi.fn(),
  resetApiConfig: vi.fn(),
  resetStore: vi.fn(),
  seedStore: vi.fn(),
}));

import { ApiError, fetchOperations, updateOperationStatus } from "../../../services/operationsApi";

const mockFetch = vi.mocked(fetchOperations);
const mockUpdate = vi.mocked(updateOperationStatus);

function buildResult(store: Operation[], params: FetchParams): FetchResult {
  const filtered = filterOperations(store, params.search, params.status);
  const sorted = sortOperations(filtered, params.sortField, params.sortDirection);
  return { data: sorted, total: sorted.length, stats: computeStats(store) };
}

function setupUser() {
  return userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
}

async function advanceTimers(ms: number) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}

async function renderReady() {
  render(<OperationsDashboardContent />);
  await waitFor(() => {
    expect(screen.queryByLabelText("Loading operations")).not.toBeInTheDocument();
  });
}

function statValue(label: string): number {
  const statsRegion = screen.getByLabelText("Operation statistics");
  const labelEl = within(statsRegion).getByText(label);
  const valueEl = labelEl.parentElement?.querySelector(".tabular-nums");
  return Number(valueEl?.textContent?.replace(/,/g, "") ?? NaN);
}

describe("OperationsDashboard", () => {
  let store: Operation[];

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    store = structuredClone(fixtureOperations);
    window.history.replaceState(null, "", "/");

    mockFetch.mockImplementation(async (params) => buildResult(store, params));
    mockUpdate.mockImplementation(async (id, status) => {
      const index = store.findIndex((operation) => operation.id === id);
      if (index === -1) throw new ApiError(`Operation ${id} not found`, "NOT_FOUND");
      const updated: Operation = {
        ...store[index],
        status,
        updatedAt: new Date().toISOString(),
      };
      store = store.map((operation, i) => (i === index ? updated : operation));
      return updated;
    });
  });

  afterEach(() => {
    act(() => {
      vi.runOnlyPendingTimers();
    });
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("Search + Filter", async () => {
    const user = setupUser();
    await renderReady();

    expect(screen.getByText("Alpha Deploy")).toBeInTheDocument();
    expect(screen.getByText("Delta Failed Job")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Search operations"), "Alpha");
    await advanceTimers(300);

    await waitFor(() => {
      expect(screen.getByText("Alpha Deploy")).toBeInTheDocument();
      expect(screen.getByText("Alpha Cleanup")).toBeInTheDocument();
      expect(screen.queryByText("Delta Failed Job")).not.toBeInTheDocument();
    });

    await user.click(screen.getByLabelText("Filter by status"));
    await user.click(screen.getByRole("button", { name: "Failed" }));

    await waitFor(() => {
      expect(screen.getByText("Alpha Cleanup")).toBeInTheDocument();
      expect(screen.queryByText("Alpha Deploy")).not.toBeInTheDocument();
    });

    await user.clear(screen.getByLabelText("Search operations"));
    await user.type(screen.getByLabelText("Search operations"), "1004");
    await advanceTimers(300);

    await waitFor(() => {
      expect(screen.getByText("Delta Failed Job")).toBeInTheDocument();
      expect(screen.queryByText("Alpha Cleanup")).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /clear filters/i }));
    await advanceTimers(300);

    await waitFor(() => {
      expect(screen.getByText("Alpha Deploy")).toBeInTheDocument();
      expect(screen.getByText("Delta Failed Job")).toBeInTheDocument();
      expect(screen.getByText("Beta Sync")).toBeInTheDocument();
    });
  });

  it("Status change + Statistics", async () => {
    const user = setupUser();
    await renderReady();

    const statsBefore = {
      Pending: statValue("Pending"),
      Completed: statValue("Completed"),
      Total: statValue("Total Operations"),
    };

    expect(statsBefore).toEqual({ Pending: 2, Completed: 1, Total: 6 });

    await user.click(screen.getByLabelText("View details for Alpha Deploy"));
    expect(screen.getByText("Operation Details")).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("Select new status"), "Completed");
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(screen.queryByText("Operation Details")).not.toBeInTheDocument();
    });

    await waitFor(() => {
      const row = screen.getByText("Alpha Deploy").closest("tr");
      expect(row).not.toBeNull();
      expect(within(row as HTMLElement).getByText("Completed")).toBeInTheDocument();
    });

    expect(statValue("Pending")).toBe(statsBefore.Pending - 1);
    expect(statValue("Completed")).toBe(statsBefore.Completed + 1);
    expect(statValue("Total Operations")).toBe(statsBefore.Total);
    expect(screen.getByText("Beta Sync")).toBeInTheDocument();
    expect(within(screen.getByText("Alpha Deploy").closest("tr") as HTMLElement).getByText("Completed")).toBeInTheDocument();
  });

  it("status change while filters change uses latest params", async () => {
    const user = setupUser();
    const deferredUpdate = deferred<Operation>();

    mockUpdate.mockImplementation(async (id) => {
      const index = store.findIndex((operation) => operation.id === id);
      return await deferredUpdate.promise.then((next) => {
      store = store.map((operation, i) => (i === index ? next : operation));
      return next;
    });
    });

    await renderReady();
    await user.click(screen.getByLabelText("View details for Alpha Deploy"));
    await user.selectOptions(screen.getByLabelText("Select new status"), "Completed");
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await user.click(screen.getByLabelText("Filter by status"));
    await user.click(screen.getByRole("button", { name: "Failed" }));

    const updated: Operation = {
      ...store.find((operation) => operation.id === "OP-1001")!,
      status: "Completed",
      updatedAt: new Date().toISOString(),
    };
    await act(async () => {
      await act(async () => {
        deferredUpdate.resolve(updated);
        await deferredUpdate.promise;
        await Promise.resolve();
        await Promise.resolve();
      });
      await deferredUpdate.promise;
    });

    await waitFor(() => {
      expect(screen.getByText("Delta Failed Job")).toBeInTheDocument();
      expect(screen.queryByText("Alpha Deploy")).not.toBeInTheDocument();
      expect(screen.getByLabelText("Filter by status")).toHaveTextContent("Failed");
    });

    const lastCall = mockFetch.mock.calls[mockFetch.mock.calls.length - 1]?.[0] as FetchParams | undefined;
    expect(lastCall?.status).toBe("Failed");
  });

  it("mutation success + refetch failure keeps visible updated row and inline retry", async () => {
    const user = setupUser();
    let fetchCount = 0;

    mockFetch.mockImplementation(async (params) => {
      fetchCount += 1;
      if (fetchCount === 1) {
        return buildResult(store, params);
      }
      throw new ApiError("Refetch failed");
    });

    await renderReady();
    await user.click(screen.getByLabelText("View details for Alpha Deploy"));
    await user.selectOptions(screen.getByLabelText("Select new status"), "Completed");
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      const row = screen.getByText("Alpha Deploy").closest("tr");
      expect(row).not.toBeNull();
      expect(within(row as HTMLElement).getByText("Completed")).toBeInTheDocument();
      expect(screen.getByRole("alert")).toHaveTextContent(/Refetch failed|Failed to refresh operations/i);
      expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
    });

    expect(statValue("Pending")).toBe(1);
    expect(statValue("Completed")).toBe(2);
  });

  it("status change + refetch failure removes rows that no longer match the active status filter", async () => {
    const user = setupUser();
    let fetchCount = 0;
    mockFetch.mockImplementation(async (params) => {
      fetchCount += 1;
      if (fetchCount === 3) throw new ApiError("Refetch failed");
      return buildResult(store, params);
    });

    await renderReady();
    await user.click(screen.getByLabelText("Filter by status"));
    await user.click(screen.getByRole("button", { name: "Pending" }));
    await waitFor(() => expect(screen.getByText("Alpha Deploy")).toBeInTheDocument());

    await user.click(screen.getByLabelText("View details for Alpha Deploy"));
    await user.selectOptions(screen.getByLabelText("Select new status"), "Completed");
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Refetch failed");
      expect(screen.getByText("Epsilon Migrate")).toBeInTheDocument();
      expect(screen.queryByText("Alpha Deploy")).not.toBeInTheDocument();
    });
    expect(screen.getByLabelText("Filter by status")).toHaveTextContent("Pending");
    expect(statValue("Pending")).toBe(1);
    expect(statValue("Completed")).toBe(2);
    expect(screen.getByText("Showing 1-1 of 1")).toBeInTheDocument();
  });

  it("API failure", async () => {
    const user = setupUser();
    mockFetch.mockRejectedValueOnce(new ApiError("Network down"));

    render(<OperationsDashboardContent />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
    expect(screen.getByText(/unable to load operations/i)).toBeInTheDocument();
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();

    mockFetch.mockImplementation(async (params) => buildResult(store, params));
    await user.click(screen.getByRole("button", { name: /try again/i }));

    await waitFor(() => {
      expect(screen.getByRole("grid")).toBeInTheDocument();
    });
    expect(screen.getByText("Alpha Deploy")).toBeInTheDocument();
  });

  it("does not show the previous search results after the new search fails", async () => {
    const user = setupUser();
    mockFetch.mockImplementation(async (params) => {
      if (params.search === "1004") throw new ApiError("Search failed");
      return buildResult(store, params);
    });

    await renderReady();
    const search = screen.getByLabelText("Search operations");
    await user.type(search, "Alpha");
    await advanceTimers(300);
    await waitFor(() => expect(screen.getByText("Alpha Deploy")).toBeInTheDocument());

    await user.clear(search);
    await user.type(search, "1004");
    await advanceTimers(300);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Search failed");
      expect(screen.queryByText("Alpha Deploy")).not.toBeInTheDocument();
      expect(screen.queryByText("Alpha Cleanup")).not.toBeInTheDocument();
    });
    expect(search).toHaveValue("1004");
    expect(screen.getByLabelText("Filter by status")).toBeInTheDocument();
    expect(screen.getByText(/results for the current filters could not be loaded/i)).toBeInTheDocument();

    mockFetch.mockImplementation(async (params) => buildResult(store, params));
    await user.click(screen.getByRole("button", { name: /retry/i }));
    await waitFor(() => expect(screen.getByText("Delta Failed Job")).toBeInTheDocument());
  });

  it("Different response order", async () => {
    const user = setupUser();
    const deferredA = deferred<FetchResult>();
    const deferredB = deferred<FetchResult>();
    let callCount = 0;

    mockFetch.mockImplementation((params) => {
      callCount += 1;
      if (callCount === 1) {
        return Promise.resolve(buildResult(store, params));
      }
      if (params.search === "A") return deferredA.promise;
      if (params.search === "B") return deferredB.promise;
      return Promise.resolve(buildResult(store, params));
    });

    await renderReady();

    await user.type(screen.getByLabelText("Search operations"), "A");
    await advanceTimers(300);
    await waitFor(() => expect(mockFetch.mock.calls.some((call) => call[0].search === "A")).toBe(true));

    await user.clear(screen.getByLabelText("Search operations"));
    await user.type(screen.getByLabelText("Search operations"), "B");
    await advanceTimers(300);
    await waitFor(() => expect(mockFetch.mock.calls.some((call) => call[0].search === "B")).toBe(true));

    await act(async () => {
      deferredB.resolve(
        buildResult(store, { search: "B", status: "All", sortField: "createdAt", sortDirection: "desc" }),
      );
      await deferredB.promise;
    });

    await waitFor(() => {
      expect(screen.getByText("Beta Sync")).toBeInTheDocument();
      expect(screen.queryByText("Alpha Deploy")).not.toBeInTheDocument();
    });

    await act(async () => {
      deferredA.resolve(
        buildResult(store, { search: "A", status: "All", sortField: "createdAt", sortDirection: "desc" }),
      );
      await deferredA.promise;
    });

    await advanceTimers(50);
    expect(screen.getByText("Beta Sync")).toBeInTheDocument();
    expect(screen.queryByText("Alpha Deploy")).not.toBeInTheDocument();
    expect(screen.queryByText("Alpha Cleanup")).not.toBeInTheDocument();
  });

  it("No stale data", async () => {
    const user = setupUser();
    const deferredA = deferred<FetchResult>();
    let callCount = 0;
    let signalA: AbortSignal | undefined;

    mockFetch.mockImplementation((params, options) => {
      callCount += 1;
      if (callCount === 1) {
        return Promise.resolve(buildResult(store, params));
      }
      if (params.status === "Failed") {
        signalA = options?.signal;
        return deferredA.promise;
      }
      return Promise.resolve(buildResult(store, params));
    });

    await renderReady();

    await user.click(screen.getByLabelText("Filter by status"));
    await user.click(screen.getByRole("button", { name: "Failed" }));
    await waitFor(() => expect(signalA).toBeDefined());

    await user.click(screen.getByLabelText("Filter by status"));
    await user.click(screen.getByRole("button", { name: "Pending" }));

    await waitFor(() => {
      expect(screen.getByText("Alpha Deploy")).toBeInTheDocument();
      expect(screen.getByText("Epsilon Migrate")).toBeInTheDocument();
      expect(screen.queryByText("Delta Failed Job")).not.toBeInTheDocument();
    });

    expect(signalA?.aborted).toBe(true);

    await act(async () => {
      deferredA.resolve(
        buildResult(store, { search: "", status: "Failed", sortField: "createdAt", sortDirection: "desc" }),
      );
      await deferredA.promise;
    });

    await advanceTimers(50);
    expect(screen.getByText("Alpha Deploy")).toBeInTheDocument();
    expect(screen.queryByText("Delta Failed Job")).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();

    const deferredReject = deferred<FetchResult>();
    let rejectSignal: AbortSignal | undefined;
    callCount = 0;
    mockFetch.mockImplementation((params, options) => {
      callCount += 1;
      if (params.status === "Running") {
        rejectSignal = options?.signal;
        return deferredReject.promise;
      }
      return Promise.resolve(buildResult(store, params));
    });

    await user.click(screen.getByLabelText("Filter by status"));
    await user.click(screen.getByRole("button", { name: "Running" }));
    await waitFor(() => expect(rejectSignal).toBeDefined());

    await user.click(screen.getByLabelText("Filter by status"));
    await user.click(screen.getByRole("button", { name: "Completed" }));

    await waitFor(() => {
      expect(screen.getByText("Gamma Backup")).toBeInTheDocument();
    });

    await act(async () => {
      deferredReject.reject(new ApiError("stale failure"));
      await deferredReject.promise.catch(() => undefined);
    });
    await advanceTimers(50);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByText("Gamma Backup")).toBeInTheDocument();
    expect(rejectSignal?.aborted).toBe(true);
  });

  it("no-data state appears when the dataset is empty and there are no active filters", async () => {
    mockFetch.mockResolvedValueOnce({
      data: [],
      total: 0,
      stats: { Total: 0, Pending: 0, Running: 0, Completed: 0, Failed: 0 },
    });

    render(<OperationsDashboardContent />);
    await waitFor(() => {
      expect(screen.getByText("No operations yet")).toBeInTheDocument();
    });
    expect(screen.queryByText("No results match your filters")).not.toBeInTheDocument();
  });

  it("no-results state shows clear filters and resets the active filters", async () => {
    const user = setupUser();
    mockFetch.mockResolvedValue({
      data: [],
      total: 0,
      stats: { Total: 0, Pending: 0, Running: 0, Completed: 0, Failed: 0 },
    });

    render(<OperationsDashboardContent />);
    await waitFor(() => {
      expect(screen.getByText("No operations yet")).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText("Search operations"), "zzz");
    await advanceTimers(300);

    await waitFor(() => {
      expect(screen.getByText("No results match your filters")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /clear filters/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /clear filters/i }));
    await advanceTimers(300);
    await waitFor(() => {
      expect(screen.getByLabelText("Operations")).toHaveAttribute("aria-busy", "false");
    });
    expect(screen.getByLabelText("Search operations")).toHaveValue("");
    expect(screen.getByText("No operations yet")).toBeInTheDocument();
  });
});
