import type { Operation } from "../types/operation";

export const fixtureOperations: Operation[] = [
  {
    id: "OP-1001",
    name: "Alpha Deploy",
    responsiblePerson: "Alice",
    status: "Pending",
    createdAt: "2024-01-01T10:00:00.000Z",
    updatedAt: "2024-01-01T10:00:00.000Z",
  },
  {
    id: "OP-1002",
    name: "Beta Sync",
    responsiblePerson: "Bob",
    status: "Running",
    createdAt: "2024-01-02T10:00:00.000Z",
    updatedAt: "2024-01-02T11:00:00.000Z",
  },
  {
    id: "OP-1003",
    name: "Gamma Backup",
    responsiblePerson: "Carol",
    status: "Completed",
    createdAt: "2024-01-03T10:00:00.000Z",
    updatedAt: "2024-01-03T12:00:00.000Z",
  },
  {
    id: "OP-1004",
    name: "Delta Failed Job",
    responsiblePerson: "Dave",
    status: "Failed",
    createdAt: "2024-01-04T10:00:00.000Z",
    updatedAt: "2024-01-04T13:00:00.000Z",
  },
  {
    id: "OP-1005",
    name: "Alpha Cleanup",
    responsiblePerson: "Eve",
    status: "Failed",
    createdAt: "2024-01-05T10:00:00.000Z",
    updatedAt: "2024-01-05T14:00:00.000Z",
  },
  {
    id: "OP-1006",
    name: "Epsilon Migrate",
    responsiblePerson: "Frank",
    status: "Pending",
    createdAt: "2024-01-06T10:00:00.000Z",
    updatedAt: "2024-01-06T15:00:00.000Z",
  },
];
