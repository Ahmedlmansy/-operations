import { memo } from "react";
import type { Operation } from "../../types/operation";
import { formatDate } from "../../utils/operations";
import { OperationStatusBadge } from "./OperationStatusBadge";
import { PencilIcon } from "@heroicons/react/24/outline";

interface Props {
  operation: Operation;
  onView: (id: string) => void;
}

export const OperationRow = memo(function OperationRow({ operation: o, onView }: Props) {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3 text-sm font-mono text-gray-900">{o.id}</td>
      <td className="px-4 py-3 text-sm text-gray-900 font-medium">{o.name}</td>
      <td className="px-4 py-3 text-sm text-gray-700">{o.responsiblePerson}</td>
      <td className="px-4 py-3">
        <OperationStatusBadge status={o.status} />
      </td>
      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{formatDate(o.createdAt)}</td>
      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{formatDate(o.updatedAt)}</td>
      <td className="px-4 py-3 text-right">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          onClick={() => onView(o.id)}
          aria-label={`View details for ${o.name}`}
        >
          <PencilIcon className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">View</span>
        </button>
      </td>
    </tr>
  );
});