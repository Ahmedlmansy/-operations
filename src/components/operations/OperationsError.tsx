import { ExclamationTriangleIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

interface Props {
  message?: string;
  onRetry?: () => void;
}

export function OperationsError({ message = "Something went wrong", onRetry }: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-8 text-center" role="alert">
      <div className="mx-auto mb-4 h-12 w-12 text-amber-500" aria-hidden="true">
        <ExclamationTriangleIcon className="h-full w-full" />
      </div>
      <h3 className="text-lg font-medium text-gray-900">Unable to load operations</h3>
      <p className="mt-1 text-sm text-gray-500">{message}</p>
      {onRetry && (
        <button
          type="button"
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          onClick={onRetry}
        >
          <ArrowPathIcon className="h-4 w-4" aria-hidden="true" />
          Try Again
        </button>
      )}
    </div>
  );
}