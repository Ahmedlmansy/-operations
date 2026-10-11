import type {
  Operation, OperationStats, SortDirection, SortField, StatusFilter,
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
  return [...ops].sort((a, b) => (Date.parse(a[field]) - Date.parse(b[field])) * m);
}

export function computeStats(ops: Operation[]): OperationStats {
  const stats: OperationStats = { Total: ops.length, Pending: 0, Running: 0, Completed: 0, Failed: 0 };
  for (const o of ops) stats[o.status]++;
  return stats;
}

const fmt = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" });
export const formatDate = (iso: string) => fmt.format(new Date(iso));
