import { useCallback } from "react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { useOperationsView } from "../../hooks/useOperationsView";
import { OperationStats } from "./OperationStats";
import { OperationsToolbar } from "./OperationsToolbar";
import { OperationsTable } from "./OperationsTable";
import { OperationDetailsModal } from "./OperationDetailsModal";
import { OperationsEmptyState } from "./OperationsEmptyState";
import { OperationsLoading } from "./OperationsLoading";
import { OperationsError } from "./OperationsError";
import type { Operation, OperationStatus } from "../../types/operation";

const EMPTY_STATS = { Total: 0, Pending: 0, Running: 0, Completed: 0, Failed: 0 };

export function OperationsDashboardContent() {
  const {
    status,
    operations,
    total,
    stats,
    error,
    hasResult,
    isInitialLoading,
    isRefetching,
    retry,
    changeStatus,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    sortField,
    setSortField,
    sortDirection,
    setSortDirection,
    currentPage,
    setCurrentPage,
    selectedOperation,
    selectOperation,
    clearSelection,
    clearFilters,
    hasActiveFilters,
  } = useOperationsView();

  const handleView = useCallback(
    (operation: Operation) => {
      selectOperation(operation);
    },
    [selectOperation],
  );

  const handleSave = useCallback(
    async (id: string, nextStatus: OperationStatus) => {
      await changeStatus(id, nextStatus);
    },
    [changeStatus],
  );

  if (isInitialLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Operations Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Monitor and manage operations.</p>
        </div>
        <OperationsLoading />
      </div>
    );
  }

  if (status === "error" && !hasResult) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Operations Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Monitor and manage operations.</p>
        </div>
        <OperationsError message={error?.message} onRetry={retry} />
      </div>
    );
  }

  const displayStats = stats ?? EMPTY_STATS;
  const showEmpty = status === "success" && total === 0;
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPageNumber = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (currentPageNumber - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedOperations = operations.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Operations Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Monitor and manage operations.</p>
      </div>

      <OperationStats stats={displayStats} />

      <section
        aria-label="Operations"
        aria-busy={isRefetching}
        className="bg-white border border-gray-200 rounded-lg relative"
      >
        <OperationsToolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          sortField={sortField}
          sortDirection={sortDirection}
          onSortFieldChange={setSortField}
          onSortDirectionChange={setSortDirection}
          showClearFilters={!showEmpty || !hasActiveFilters}
        />

        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between gap-3">
          <p className="text-sm text-gray-500" aria-live="polite">
            {total === 0 ? "Showing 0 of 0" : `Showing ${startIndex + 1}-${Math.min(endIndex, total)} of ${total}`}
          </p>
          {isRefetching && (
            <span
              className="inline-flex items-center gap-1.5 text-xs text-gray-500"
              role="status"
              aria-live="polite"
            >
              <ArrowPathIcon className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              Updating…
            </span>
          )}
        </div>

        {status === "error" && (
          <div
            className="mx-4 mb-3 flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3"
            role="alert"
          >
            <p className="text-sm text-amber-800">
              {error?.message ?? "Failed to refresh operations."}
            </p>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 shrink-0 px-3 py-1.5 text-sm font-medium text-amber-900 bg-white border border-amber-300 rounded-lg hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              onClick={retry}
            >
              <ArrowPathIcon className="h-4 w-4" aria-hidden="true" />
              Retry
            </button>
          </div>
        )}

        <div className={isRefetching ? "opacity-60 transition-opacity" : "transition-opacity"}>
          {status === "error" && total === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-gray-500">
              Results for the current filters could not be loaded. Retry to try again.
            </p>
          ) : isRefetching && total === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-gray-500" role="status">
              Loading matching operations…
            </p>
          ) : showEmpty ? (
            <OperationsEmptyState
              variant={hasActiveFilters ? "no-results" : "no-data"}
              onClearFilters={hasActiveFilters ? clearFilters : undefined}
            />
          ) : (
            <>
              <OperationsTable operations={paginatedOperations} onView={handleView} />
              {totalPages > 1 && (
                <div className="flex items-center justify-between gap-3 border-t border-gray-200 px-4 py-3">
                  <p className="text-sm text-gray-500">
                    Page {currentPageNumber} of {totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg disabled:cursor-not-allowed disabled:opacity-50 hover:border-gray-400"
                      disabled={currentPageNumber === 1}
                      onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg disabled:cursor-not-allowed disabled:opacity-50 hover:border-gray-400"
                      disabled={currentPageNumber === totalPages}
                      onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {selectedOperation && (
        <OperationDetailsModal
          operation={selectedOperation}
          onSave={handleSave}
          onClose={clearSelection}
        />
      )}
    </div>
  );
}
