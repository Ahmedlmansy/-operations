import { useCallback, useState } from "react";
import { operationsService } from "../services/operationsService";
import type { OperationStatus } from "../types/operation";

// Phase 2: swap this for async loading (loading/error) backed by the Mock API.
export function useOperationsData() {
  const [operations, setOperations] = useState(() => operationsService.getOperations());

  const updateStatus = useCallback((id: string, status: OperationStatus) => {
    setOperations((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status, updatedAt: new Date().toISOString() } : o)),
    );
  }, []);

  return { operations, updateStatus };
}
