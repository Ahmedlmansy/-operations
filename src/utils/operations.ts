import type {
  Operation,
  OperationStats,
  OperationStatus,
  SortDirection,
  SortField,
  StatusFilter,
} from "../types/operation";

export function filterOperations(ops: Operation[], term: string, status: StatusFilter): Operation[] {
  const q = term.trim().toLowerCase();
  return ops.filter(
    (o) =>
      (status === "All" || o.status === status) &&
      (!q || o.name.toLowerCase().includes(q) || o.id.toLowerCase().includes(q)),
  );
}

export function sortOperations(ops: Operation[], field: SortField, dir: SortDirection): Operation[] {
  const m = dir === "asc" ? 1 : -1;
  return [...ops].sort((a, b) => {
    const diff = (Date.parse(a[field]) - Date.parse(b[field])) * m;
    if (diff !== 0) return diff;
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
  });
}

export function computeStats(ops: Operation[]): OperationStats {
  const stats: OperationStats = { Total: ops.length, Pending: 0, Running: 0, Completed: 0, Failed: 0 };
  for (const o of ops) stats[o.status]++;
  return stats;
}

export function patchStatusStats(
  stats: OperationStats,
  previousStatus: OperationStatus,
  nextStatus: OperationStatus,
): OperationStats {
  return {
    ...stats,
    Total: stats.Total,
    [previousStatus]: stats[previousStatus] - 1,
    [nextStatus]: stats[nextStatus] + 1,
  };
}

export function patchOperationStatus(
  result: { data: Operation[]; total: number; stats: OperationStats },
  operationId: string,
  updatedOperation: Operation,
  params: {
    search: string;
    status: StatusFilter;
    sortField: SortField;
    sortDirection: SortDirection;
  },
): { data: Operation[]; total: number; stats: OperationStats } | null {
  const index = result.data.findIndex((operation) => operation.id === operationId);
  if (index === -1) return null;

  const previous = result.data[index];
  const matchesCurrentQuery =
    filterOperations([updatedOperation], params.search, params.status).length > 0;
  const nextData = matchesCurrentQuery
    ? sortOperations(
        result.data.map((operation) =>
          operation.id === operationId ? updatedOperation : operation,
        ),
        params.sortField,
        params.sortDirection,
      )
    : result.data.filter((operation) => operation.id !== operationId);

  return {
    ...result,
    data: nextData,
    total: result.total + (matchesCurrentQuery ? 0 : -1),
    stats:
      previous.status === updatedOperation.status
        ? result.stats
        : patchStatusStats(result.stats, previous.status, updatedOperation.status),
  };
}

const fmt = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" });
export const formatDate = (iso: string) => fmt.format(new Date(iso));
