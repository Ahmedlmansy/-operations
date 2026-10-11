import { MagnifyingGlassIcon, FunnelIcon, ArrowsUpDownIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useRef, useEffect, useState } from "react";
import type { StatusFilter, SortField, SortDirection } from "../../types/operation";
import { OPERATION_STATUSES } from "../../types/operation";

interface Props {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: StatusFilter;
  onStatusChange: (value: StatusFilter) => void;
  sortField: SortField;
  sortDirection: SortDirection;
  onSortFieldChange: (value: SortField) => void;
  onSortDirectionChange: (value: SortDirection) => void;
  showClearFilters?: boolean;
}

export function OperationsToolbar({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  sortField,
  sortDirection,
  onSortFieldChange,
  onSortDirectionChange,
  showClearFilters = true,
}: Props) {
  const searchRef = useRef<HTMLInputElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setFilterOpen(false);
      }
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setSortOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasActiveFilters = searchTerm || statusFilter !== "All";

  return (
    <div className="p-4 border-b border-gray-200">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" aria-hidden="true" />
          <input
            ref={searchRef}
            type="search"
            id="op-search"
            placeholder="Search by operation name or ID..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
            aria-label="Search operations"
          />
          {searchTerm && (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded"
              onClick={() => onSearchChange("")}
              aria-label="Clear search"
            >
              <XMarkIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 flex-1 sm:flex-none">
          <div className="relative" ref={filterRef}>
            <button
              type="button"
              className={`flex items-center gap-2 px-4 py-2.5 bg-white border rounded-lg text-sm font-medium transition-colors ${
                statusFilter !== "All"
                  ? "border-blue-300 text-blue-700 bg-blue-50"
                  : "border-gray-300 text-gray-700 hover:border-gray-400"
              }`}
              onClick={() => setFilterOpen(!filterOpen)}
              aria-haspopup="listbox"
              aria-expanded={filterOpen}
              aria-label="Filter by status"
            >
              <FunnelIcon className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span>{statusFilter}</span>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {filterOpen && (
              <div className="absolute z-10 right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg py-1">
                <button
                  type="button"
                  className={`w-full px-4 py-2 text-left text-sm ${
                    statusFilter === "All"
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => { onStatusChange("All"); setFilterOpen(false); }}
                >
                  All
                </button>
                {OPERATION_STATUSES.map((status) => (
                  <button
                    key={status}
                    type="button"
                    className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 ${
                      statusFilter === status
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                    onClick={() => { onStatusChange(status); setFilterOpen(false); }}
                  >
                    <StatusIndicator status={status} className="h-2 w-2" />
                    {status}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative" ref={sortRef}>
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:border-gray-400 transition-colors"
              onClick={() => setSortOpen(!sortOpen)}
              aria-haspopup="listbox"
              aria-expanded={sortOpen}
              aria-label="Sort options"
            >
              <ArrowsUpDownIcon className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span>{sortField === "createdAt" ? "Created At" : "Updated At"}</span>
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                {sortDirection === "desc" ? "Desc" : "Asc"}
              </span>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {sortOpen && (
              <div className="absolute z-10 right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1">
                <p className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Sort By</p>
                <button
                  type="button"
                  className={`w-full px-4 py-2 text-left text-sm ${
                    sortField === "createdAt"
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => { onSortFieldChange("createdAt"); setSortOpen(false); }}
                >
                  Created At
                </button>
                <button
                  type="button"
                  className={`w-full px-4 py-2 text-left text-sm ${
                    sortField === "updatedAt"
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => { onSortFieldChange("updatedAt"); setSortOpen(false); }}
                >
                  Updated At
                </button>
                <hr className="my-1 border-gray-200" />
                <p className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Order</p>
                <button
                  type="button"
                  className={`w-full px-4 py-2 text-left text-sm ${
                    sortDirection === "desc"
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => { onSortDirectionChange("desc"); setSortOpen(false); }}
                >
                  Descending
                </button>
                <button
                  type="button"
                  className={`w-full px-4 py-2 text-left text-sm ${
                    sortDirection === "asc"
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => { onSortDirectionChange("asc"); setSortOpen(false); }}
                >
                  Ascending
                </button>
              </div>
            )}
          </div>

          {showClearFilters && hasActiveFilters && (
            <button
              type="button"
              className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-300 rounded-lg transition-colors"
              onClick={() => { onSearchChange(""); onStatusChange("All"); }}
            >
              Clear filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusIndicator({ status, className }: { status: string; className: string }) {
  const colors: Record<string, string> = {
    Pending: "bg-amber-500",
    Running: "bg-blue-500",
    Completed: "bg-emerald-500",
    Failed: "bg-red-500",
  };
  return <span className={`${className} rounded-full ${colors[status] || "bg-gray-500"}`} aria-hidden="true" />;
}