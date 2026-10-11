import { useEffect, useRef, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  isOperationStatus,
  type Operation,
  type OperationStatus,
} from "../../types/operation";
import { OPERATION_STATUSES } from "../../types/operation";
import { formatDate } from "../../utils/operations";
import { OperationStatusBadge } from "./OperationStatusBadge";

interface Props {
  operation: Operation;
  onSave: (id: string, status: OperationStatus) => Promise<void>;
  onClose: () => void;
}

export function OperationDetailsModal({ operation, onSave, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const [draft, setDraft] = useState<OperationStatus>(operation.status);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      dialog.showModal();
      dialog.focus();
    }
    return () => {
      if (dialog && dialog.open) {
        dialog.close();
      }
      previousActiveElement.current?.focus();
    };
  }, []);

  const handleClose = () => {
    onClose();
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      await onSave(operation.id, draft);
      onClose();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = (event: React.SyntheticEvent<HTMLDialogElement>) => {
    event.preventDefault();
    handleClose();
  };

  const handleBackdropClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) {
      handleClose();
    }
  };

  const dirty = draft !== operation.status;

  return (
    <dialog
      ref={dialogRef}
      className="modal"
      onCancel={handleCancel}
      onClick={handleBackdropClick}
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="modal-content">
        <div className="modal-header">
          <h2 id="modal-title" className="text-lg font-semibold text-gray-900">
            Operation Details
          </h2>
          <button
            type="button"
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            onClick={handleClose}
            aria-label="Close modal"
          >
            <XMarkIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="modal-body space-y-5">
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-4 text-sm">
            <dt className="text-gray-500">Operation ID</dt>
            <dd className="font-mono text-gray-900">{operation.id}</dd>

            <dt className="text-gray-500">Operation Name</dt>
            <dd className="font-medium text-gray-900">{operation.name}</dd>

            <dt className="text-gray-500">Responsible Person</dt>
            <dd className="text-gray-900">{operation.responsiblePerson}</dd>

            <dt className="text-gray-500">Status</dt>
            <dd className="text-gray-900">
              <OperationStatusBadge status={operation.status} />
            </dd>

            <dt className="text-gray-500">Created At</dt>
            <dd className="text-gray-900">{formatDate(operation.createdAt)}</dd>

            <dt className="text-gray-500">Updated At</dt>
            <dd className="text-gray-900">{formatDate(operation.updatedAt)}</dd>
          </dl>

          <div className="pt-2 border-t border-gray-200">
            <label htmlFor="modal-status" className="block text-sm font-medium text-gray-700 mb-2">
              Change Status
            </label>
            <select
              id="modal-status"
              value={draft}
              onChange={(e) => {
                const next = e.target.value;
                if (isOperationStatus(next)) {
                  setDraft(next);
                }
              }}
              disabled={saving}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow disabled:opacity-50"
              aria-label="Select new status"
            >
              {OPERATION_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {saveError && (
            <p className="text-sm text-red-600" role="alert">
              {saveError}
            </p>
          )}
        </div>

        <div className="modal-footer flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            onClick={handleClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!dirty || saving}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            onClick={() => void handleSave()}
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </dialog>
  );
}
