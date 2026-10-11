import { useCallback, useState } from "react";
import { useOperationsView } from "../../hooks/useOperationsView";
import { OperationStats } from "./OperationStats";
import { OperationsToolbar } from "./OperationsToolbar";
import { OperationsTable } from "./OperationsTable";
import { OperationDetailsModal } from "./OperationDetailsModal";
import { OperationsEmptyState } from "./OperationsEmptyState";
import type { OperationStatus } from "../../types/operation";

export function OperationsDashboardContent() {
  const v = useOperationsView();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = v.operations.find((o) => o.id === selectedId) ?? null;

  const handleView = useCallback((id: string) => setSelectedId(id), []);
  const handleSave = (id: string, status: OperationStatus) => v.updateStatus(id, status);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Operations Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Monitor and manage operations.</p>
      </div>

      <OperationStats stats={v.stats} />

      <section aria-label="Operations" className="bg-white border border-gray-200 rounded-lg">
        <OperationsToolbar
          searchTerm={v.searchTerm}
          onSearchChange={v.setSearchTerm}
          statusFilter={v.statusFilter}
          onStatusChange={v.setStatusFilter}
          sortField={v.sortField}
          sortDirection={v.sortDirection}
          onSortFieldChange={v.setSortField}
          onSortDirectionChange={v.setSortDirection}
        />

        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-500" aria-live="polite">
            Showing {v.displayed.length} of {v.operations.length}
          </p>
        </div>

        {v.displayed.length === 0 ? (
          <OperationsEmptyState onClearFilters={() => { v.setSearchTerm(""); v.setStatusFilter("All"); }} />
        ) : (
          <OperationsTable operations={v.displayed} onView={handleView} />
        )}
      </section>

      {selected && (
        <OperationDetailsModal
          operation={selected}
          onSave={handleSave}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}