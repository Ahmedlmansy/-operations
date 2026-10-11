import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { Operation } from "../../types/operation";
import { OperationRow } from "./OperationRow";

const ROW_HEIGHT = 48;
const COL_COUNT = 7;

interface Props {
  operations: Operation[];
  onView: (operation: Operation) => void;
}

export function OperationsTable({ operations, onView }: Props) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: operations.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
  });

  const virtualRows = virtualizer.getVirtualItems();
  const paddingTop = virtualRows.length > 0 ? virtualRows[0].start : 0;
  const paddingBottom =
    virtualRows.length > 0
      ? virtualizer.getTotalSize() - virtualRows[virtualRows.length - 1].end
      : 0;

  return (
    <div
      ref={parentRef}
      className="overflow-auto"
      style={{ height: "min(560px, calc(100vh - 280px))" }}
    >
      <table className="w-full table-fixed" role="grid">
        <colgroup>
          <col style={{ width: "12%" }} />
          <col style={{ width: "22%" }} />
          <col style={{ width: "18%" }} />
          <col style={{ width: "12%" }} />
          <col style={{ width: "14%" }} />
          <col style={{ width: "14%" }} />
          <col style={{ width: "8%" }} />
        </colgroup>
        <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
          <tr>
            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
              ID
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
              Operation
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
              Responsible
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
              Status
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
              Created
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
              Updated
            </th>
            <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {paddingTop > 0 && (
            <tr aria-hidden="true">
              <td colSpan={COL_COUNT} style={{ height: paddingTop, padding: 0, border: "none" }} />
            </tr>
          )}
          {virtualRows.map((virtualRow) => {
            const operation = operations[virtualRow.index];
            return (
              <OperationRow
                key={operation.id}
                operation={operation}
                onView={onView}
              />
            );
          })}
          {paddingBottom > 0 && (
            <tr aria-hidden="true">
              <td colSpan={COL_COUNT} style={{ height: paddingBottom, padding: 0, border: "none" }} />
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
