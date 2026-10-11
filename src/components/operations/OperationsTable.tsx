import type { Operation } from "../../types/operation";
import { OperationRow } from "./OperationRow";

interface Props {
  operations: Operation[];
  onView: (id: string) => void;
}

export function OperationsTable({ operations, onView }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full" role="grid">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Operation</th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Responsible</th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Updated</th>
            <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {operations.map((o) => (
            <OperationRow key={o.id} operation={o} onView={onView} />
          ))}
        </tbody>
      </table>
    </div>
  );
}