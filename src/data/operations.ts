import type { Operation } from "../types/operation";

// Existing operations (preserved exactly as they are)
const existingOperations: Operation[] = [
  { id: "OP-1001", name: "Payment Processing", responsiblePerson: "Sara Ahmed", status: "Running", createdAt: "2026-09-01T08:15:00Z", updatedAt: "2026-09-03T10:00:00Z" },
  { id: "OP-1002", name: "payment-verification", responsiblePerson: "Omar Hassan", status: "Pending", createdAt: "2026-09-02T09:30:00Z", updatedAt: "2026-09-02T09:30:00Z" },
  { id: "OP-1003", name: "PAYMENT-EXPORT", responsiblePerson: "Laila Nasser", status: "Completed", createdAt: "2026-08-28T12:00:00Z", updatedAt: "2026-08-30T16:45:00Z" },
  { id: "OP-1004", name: "Inventory Sync", responsiblePerson: "Khaled Mostafa", status: "Failed", createdAt: "2026-09-05T07:00:00Z", updatedAt: "2026-09-05T07:42:00Z" },
  { id: "OP-1005", name: "User Data Backup", responsiblePerson: "Mona Ali", status: "Completed", createdAt: "2026-08-20T22:00:00Z", updatedAt: "2026-08-21T01:10:00Z" },
  { id: "OP-1006", name: "Invoice Generation", responsiblePerson: "Sara Ahmed", status: "Running", createdAt: "2026-09-06T11:20:00Z", updatedAt: "2026-09-07T08:05:00Z" },
  { id: "OP-1007", name: "Email Campaign Dispatch", responsiblePerson: "Youssef Adel", status: "Pending", createdAt: "2026-09-08T14:00:00Z", updatedAt: "2026-09-08T14:00:00Z" },
  { id: "OP-1008", name: "Report Aggregation", responsiblePerson: "Omar Hassan", status: "Failed", createdAt: "2026-09-03T06:30:00Z", updatedAt: "2026-09-04T06:50:00Z" },
  { id: "OP-1009", name: "Database Migration", responsiblePerson: "Khaled Mostafa", status: "Running", createdAt: "2026-09-09T20:00:00Z", updatedAt: "2026-09-10T02:15:00Z" },
  { id: "OP-1010", name: "Customer Onboarding", responsiblePerson: "Mona Ali", status: "Completed", createdAt: "2026-08-25T10:10:00Z", updatedAt: "2026-08-27T13:30:00Z" },
  { id: "OP-1011", name: "Log Archival", responsiblePerson: "Youssef Adel", status: "Pending", createdAt: "2026-09-10T05:45:00Z", updatedAt: "2026-09-10T05:45:00Z" },
  { id: "OP-1012", name: "Refund Reconciliation", responsiblePerson: "Laila Nasser", status: "Completed", createdAt: "2026-08-30T09:00:00Z", updatedAt: "2026-09-01T11:25:00Z" },
];

// Configuration for generated operations
const operationNames = [
  "Payment Processing",
  "Payment Verification",
  "Payment Export",
  "Inventory Sync",
  "User Data Backup",
  "Invoice Generation",
  "Email Campaign Dispatch",
  "Report Aggregation",
  "Database Migration",
  "Customer Onboarding",
  "Log Archival",
  "Refund Reconciliation",
  "Order Processing",
  "Data Import",
  "Data Export",
  "Account Verification",
  "Notification Dispatch",
  "File Processing",
  "Analytics Aggregation",
  "Search Indexing",
  "Cache Refresh",
  "Document Processing",
  "User Synchronization",
  "Transaction Reconciliation",
  "Batch Processing",
  "API Health Check",
  "Security Audit",
  "Compliance Report",
  "System Backup",
  "Data Validation",
  "Queue Processing",
];

const responsiblePeople = [
  "Sara Ahmed",
  "Omar Hassan",
  "Laila Nasser",
  "Khaled Mostafa",
  "Mona Ali",
  "Youssef Adel",
  "Ahmed Mahmoud",
  "Nour Hassan",
  "Karim Mohamed",
  "Mariam Adel",
  "Hany Samir",
  "Salma Khaled",
];

// Deterministic pseudo-random number generator (LCG)
function createDeterministicRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

// Generate ISO date string from Date object
function toISOString(date: Date): string {
  return date.toISOString();
}

// Generate 9988 operations (OP-1013 through OP-11000)
const GENERATED_COUNT = 9988;
const generatedOperations: Operation[] = Array.from({ length: GENERATED_COUNT }, (_, index) => {
  const opNumber = 1013 + index;
  const id = `OP-${opNumber}`;

  // Use deterministic random based on index for variation
  const rand = createDeterministicRandom(opNumber * 1000);

  // Operation name - cycle through names with some variation
  const nameIndex = Math.floor(rand() * operationNames.length);
  const name = operationNames[nameIndex];

  // Responsible person - distribute across people
  const personIndex = Math.floor(rand() * responsiblePeople.length);
  const responsiblePerson = responsiblePeople[personIndex];

  // Status - weighted distribution: Pending ~25%, Running ~20%, Completed ~40%, Failed ~15%
  const statusRand = rand();
  let status: Operation["status"];
  if (statusRand < 0.25) status = "Pending";
  else if (statusRand < 0.45) status = "Running";
  else if (statusRand < 0.85) status = "Completed";
  else status = "Failed";

  // Dates - spread across Jan-Oct 2026
  // Base date: Jan 1, 2026
  const baseTime = new Date("2026-01-01T00:00:00Z").getTime();
  
  // createdAt: random offset within ~300 days (Jan-Oct)
  const createdOffsetDays = Math.floor(rand() * 300);
  const createdOffsetMs = createdOffsetDays * 86400000 + Math.floor(rand() * 86400000); // add random time within day
  const createdAtDate = new Date(baseTime + createdOffsetMs);
  const createdAt = toISOString(createdAtDate);

  // updatedAt: 0-14 days after createdAt
  const daysAfter = Math.floor(rand() * 15);
  const updatedOffsetMs = daysAfter * 86400000 + Math.floor(rand() * 86400000);
  const updatedAtDate = new Date(createdAtDate.getTime() + updatedOffsetMs);
  const updatedAt = toISOString(updatedAtDate);

  return {
    id,
    name,
    responsiblePerson,
    status,
    createdAt,
    updatedAt,
  };
});

export const initialOperations: Operation[] = [
  ...existingOperations,
  ...generatedOperations,
];