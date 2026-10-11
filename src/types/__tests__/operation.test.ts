import { describe, expect, it } from "vitest";
import { isOperationStatus, isStatusFilter } from "../operation";

describe("operation guards", () => {
  it("accepts valid status values and rejects invalid ones", () => {
    expect(isOperationStatus("Pending")).toBe(true);
    expect(isOperationStatus("Running")).toBe(true);
    expect(isOperationStatus("Completed")).toBe(true);
    expect(isOperationStatus("Failed")).toBe(true);
    expect(isOperationStatus("Blocked")).toBe(false);
    expect(isOperationStatus("")).toBe(false);
  });

  it("accepts valid status filters and ignores invalid values", () => {
    expect(isStatusFilter("All")).toBe(true);
    expect(isStatusFilter("Pending")).toBe(true);
    expect(isStatusFilter("Running")).toBe(true);
    expect(isStatusFilter("Completed")).toBe(true);
    expect(isStatusFilter("Failed")).toBe(true);
    expect(isStatusFilter("Queued")).toBe(false);
    expect(isStatusFilter(null)).toBe(false);
  });
});
