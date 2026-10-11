import { InboxIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

interface Props {
  variant: "no-data" | "no-results";
  onClearFilters?: () => void;
}

export function OperationsEmptyState({ variant, onClearFilters }: Props) {
  if (variant === "no-data") {
    return (
      <div className="py-12 px-4 text-center" role="status">
        <div className="mx-auto mb-4 h-12 w-12 text-gray-300" aria-hidden="true">
          <InboxIcon className="h-full w-full" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">No operations yet</h3>
        <p className="mt-1 text-sm text-gray-500">
          Operations will appear here once they are created.
        </p>
      </div>
    );
  }

  return (
    <div className="py-12 px-4 text-center" role="status">
      <div className="mx-auto mb-4 h-12 w-12 text-gray-300" aria-hidden="true">
        <MagnifyingGlassIcon className="h-full w-full" />
      </div>
      <h3 className="text-lg font-medium text-gray-900">No results match your filters</h3>
      <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filters.</p>
      {onClearFilters && (
        <button
          type="button"
          className="mt-4 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          onClick={onClearFilters}
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}
