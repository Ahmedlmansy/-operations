import { useCallback, useEffect, useMemo, useState } from "react";
import {
  isStatusFilter,
  type Operation,
  type SortDirection,
  type SortField,
  type StatusFilter,
} from "../types/operation";
import { useDebouncedValue } from "./useDebouncedValue";
import { useOperationsData } from "./useOperationsData";
import type { FetchParams } from "../services/operationsApi";

export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;
export type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];

export function isPageSize(value: unknown): value is PageSize {
  return typeof value === "number" && PAGE_SIZE_OPTIONS.includes(value as PageSize);
}

function readUrlParams(): {
  searchTerm: string;
  statusFilter: StatusFilter;
  sortField: SortField;
  sortDirection: SortDirection;
  page: number;
  pageSize: PageSize;
} {
  if (typeof window === "undefined") {
    return {
      searchTerm: "",
      statusFilter: "All",
      sortField: "createdAt",
      sortDirection: "desc",
      page: 1,
      pageSize: 50,
    };
  }
  const sp = new URLSearchParams(window.location.search);
  const status = sp.get("status");
  const sort = sp.get("sort");
  const dir = sp.get("dir");
  const pageParam = Number(sp.get("page") ?? "1");
  const sizeParam = Number(sp.get("size") ?? "50");
  const statusFilter = isStatusFilter(status) ? status : "All";
  const sortField: SortField = sort === "updatedAt" ? "updatedAt" : "createdAt";
  const sortDirection: SortDirection = dir === "asc" ? "asc" : "desc";
  const pageSize: PageSize = isPageSize(sizeParam) ? sizeParam : 50;
  return {
    searchTerm: sp.get("q") ?? "",
    statusFilter,
    sortField,
    sortDirection,
    page: Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1,
    pageSize,
  };
}

function syncUrl(params: {
  searchTerm: string;
  statusFilter: StatusFilter;
  sortField: SortField;
  sortDirection: SortDirection;
  page: number;
  pageSize: PageSize;
}) {
  if (typeof window === "undefined") return;
  const sp = new URLSearchParams();
  if (params.searchTerm) sp.set("q", params.searchTerm);
  if (params.statusFilter !== "All") sp.set("status", params.statusFilter);
  if (params.sortField !== "createdAt") sp.set("sort", params.sortField);
  if (params.sortDirection !== "desc") sp.set("dir", params.sortDirection);
  if (params.page > 1) sp.set("page", String(params.page));
  if (params.pageSize !== 50) sp.set("size", String(params.pageSize));
  const qs = sp.toString();
  const next = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
  window.history.replaceState(null, "", next);
}

export function useOperationsView() {
  const initial = useMemo(() => readUrlParams(), []);
  const [searchTerm, setSearchTerm] = useState(initial.searchTerm);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(initial.statusFilter);
  const [sortField, setSortField] = useState<SortField>(initial.sortField);
  const [sortDirection, setSortDirection] = useState<SortDirection>(initial.sortDirection);
  const [currentPage, setCurrentPage] = useState(initial.page);
  const [pageSize, setPageSize] = useState<PageSize>(initial.pageSize);
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(null);

  const debouncedSearch = useDebouncedValue(searchTerm, 300);

  const params: FetchParams = useMemo(
    () => ({
      search: debouncedSearch,
      status: statusFilter,
      sortField,
      sortDirection,
    }),
    [debouncedSearch, statusFilter, sortField, sortDirection],
  );

  const data = useOperationsData(params);

  useEffect(() => {
    syncUrl({
      searchTerm: debouncedSearch,
      statusFilter,
      sortField,
      sortDirection,
      page: currentPage,
      pageSize,
    });
  }, [debouncedSearch, statusFilter, sortField, sortDirection, currentPage, pageSize]);

  useEffect(() => {
    if (data.total === 0) {
      setCurrentPage(1);
      return;
    }
    const totalPages = Math.max(1, Math.ceil(data.total / pageSize));
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, data.total, pageSize]);

  // Keep selected operation in sync with latest list data when still present
  useEffect(() => {
    if (!selectedOperation) return;
    const fresh = data.operations.find((o) => o.id === selectedOperation.id);
    if (fresh && fresh !== selectedOperation) {
      setSelectedOperation(fresh);
    }
  }, [data.operations, selectedOperation]);

  const selectOperation = useCallback((operation: Operation) => {
    setSelectedOperation(operation);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedOperation(null);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setStatusFilter("All");
    setCurrentPage(1);
  }, []);

  const setSearchTermAndResetPage = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, []);

  const setStatusFilterAndResetPage = useCallback((value: StatusFilter) => {
    setStatusFilter(value);
    setCurrentPage(1);
  }, []);

  const setSortFieldAndResetPage = useCallback((value: SortField) => {
    setSortField(value);
    setCurrentPage(1);
  }, []);

  const setSortDirectionAndResetPage = useCallback((value: SortDirection) => {
    setSortDirection(value);
    setCurrentPage(1);
  }, []);

  const changePageSize = useCallback((value: PageSize) => {
    setPageSize(value);
    setCurrentPage(1);
  }, []);

  const hasActiveFilters = searchTerm.trim() !== "" || statusFilter !== "All";

  return {
    ...data,
    searchTerm,
    setSearchTerm: setSearchTermAndResetPage,
    statusFilter,
    setStatusFilter: setStatusFilterAndResetPage,
    sortField,
    setSortField: setSortFieldAndResetPage,
    sortDirection,
    setSortDirection: setSortDirectionAndResetPage,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize: changePageSize,
    selectedOperation,
    selectOperation,
    clearSelection,
    clearFilters,
    hasActiveFilters,
  };
}
