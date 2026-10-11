import { initialOperations } from "../data/operations";
import { filterOperations, sortOperations, computeStats } from "../utils/operations";
import type { Operation, OperationStatus, SortDirection, SortField, StatusFilter } from "../types/operation";

export type { SortField, SortDirection };

export interface FetchParams {
  search: string;
  status: StatusFilter;
  sortField: SortField;
  sortDirection: SortDirection;
}

export interface FetchResult {
  data: Operation[];
  total: number;
  stats: ReturnType<typeof computeStats>;
}

export class ApiError extends Error {
  constructor(
    message = "Request failed",
    public readonly code = "NETWORK_ERROR",
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export interface ApiConfig {
  minDelayMs: number;
  maxDelayMs: number;
  failureRate: number;
  random: () => number;
}

const defaultConfig: ApiConfig = {
  minDelayMs: 100,
  maxDelayMs: 800,
  failureRate: 0.1,
  random: Math.random,
};

let config: ApiConfig = { ...defaultConfig };

export const configureApi = (partial: Partial<ApiConfig>) => {
  config = { ...config, ...partial };
};

export const resetApiConfig = () => {
  config = { ...defaultConfig };
};

let store: Operation[] = [...initialOperations];

export const resetStore = () => {
  store = [...initialOperations];
};

/** Test helper: replace the in-memory store with a small fixture set. */
export const seedStore = (operations: Operation[]) => {
  store = [...operations];
};

function simulateNetwork(signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }

    const delay =
      config.minDelayMs + config.random() * (config.maxDelayMs - config.minDelayMs);

    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      if (config.random() < config.failureRate) {
        reject(new ApiError());
      } else {
        resolve();
      }
    }, delay);

    const onAbort = () => {
      clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    };
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

export async function fetchOperations(
  params: FetchParams,
  options: { signal?: AbortSignal } = {},
): Promise<FetchResult> {
  await simulateNetwork(options.signal);
  if (options.signal?.aborted) {
    throw new DOMException("Aborted", "AbortError");
  }
  const filtered = filterOperations(store, params.search, params.status);
  const sorted = sortOperations(filtered, params.sortField, params.sortDirection);
  return { data: sorted, total: sorted.length, stats: computeStats(store) };
}

export async function updateOperationStatus(
  id: string,
  status: OperationStatus,
  options: { signal?: AbortSignal } = {},
): Promise<Operation> {
  await simulateNetwork(options.signal);
  if (options.signal?.aborted) {
    throw new DOMException("Aborted", "AbortError");
  }
  const index = store.findIndex((o) => o.id === id);
  if (index === -1) {
    throw new ApiError(`Operation ${id} not found`, "NOT_FOUND");
  }
  const updated: Operation = {
    ...store[index],
    status,
    updatedAt: new Date().toISOString(),
  };
  store = store.map((o, i) => (i === index ? updated : o));
  return updated;
}
