import { useMemo, useState } from "react";
import type { SortDirection, SortField, StatusFilter } from "../types/operation";
import { useOperationsData } from "./useOperationsData";
import { computeStats, filterOperations, sortOperations } from "../utils/operations";

// View logic (search -> filter -> sort). Independent of where data comes from.
export function useOperationsView() {
  const { operations, updateStatus } = useOperationsData();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const stats = useMemo(() => computeStats(operations), [operations]);
  const displayed = useMemo(
    () => sortOperations(filterOperations(operations, searchTerm, statusFilter), sortField, sortDirection),
    [operations, searchTerm, statusFilter, sortField, sortDirection],
  );

  return {
    operations, displayed, stats, updateStatus,
    searchTerm, setSearchTerm, statusFilter, setStatusFilter,
    sortField, setSortField, sortDirection, setSortDirection,
  };
}
