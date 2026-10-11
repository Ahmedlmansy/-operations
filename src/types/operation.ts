export const OPERATION_STATUSES = ["Pending", "Running", "Completed", "Failed"] as const;
export type OperationStatus = (typeof OPERATION_STATUSES)[number];

export interface Operation {
  id: string;
  name: string;
  responsiblePerson: string;
  status: OperationStatus;
  createdAt: string;
  updatedAt: string;
}

export const isOperationStatus = (value: string): value is OperationStatus =>
  (OPERATION_STATUSES as readonly string[]).includes(value);

export const isStatusFilter = (value: string | null): value is "All" | OperationStatus =>
  value === "All" || (value !== null && isOperationStatus(value));

export type StatusFilter = "All" | OperationStatus;
export type SortField = "createdAt" | "updatedAt";
export type SortDirection = "asc" | "desc";
export type OperationStats = Record<"Total" | OperationStatus, number>;
