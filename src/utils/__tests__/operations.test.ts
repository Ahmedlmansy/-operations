import { describe, it, expect } from "vitest";
import { filterOperations, sortOperations, computeStats } from "../operations";
import { fixtureOperations } from "../../test/fixtures";
import type { Operation } from "../../types/operation";

describe("filterOperations", () => {
  it("matches name case-insensitively", () => {
    const result = filterOperations(fixtureOperations, "alpha", "All");
    expect(result.map((o) => o.id)).toEqual(["OP-1001", "OP-1005"]);
  });

  it("matches ID fragments", () => {
    const result = filterOperations(fixtureOperations, "1004", "All");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("OP-1004");
  });

  it("applies search AND status", () => {
    const result = filterOperations(fixtureOperations, "Alpha", "Failed");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("OP-1005");
  });
});

describe("sortOperations", () => {
  it("sorts by createdAt ascending and descending", () => {
    const asc = sortOperations(fixtureOperations, "createdAt", "asc");
    expect(asc[0].id).toBe("OP-1001");
    expect(asc[asc.length - 1].id).toBe("OP-1006");

    const desc = sortOperations(fixtureOperations, "createdAt", "desc");
    expect(desc[0].id).toBe("OP-1006");
    expect(desc[desc.length - 1].id).toBe("OP-1001");
  });

  it("sorts by updatedAt", () => {
    const asc = sortOperations(fixtureOperations, "updatedAt", "asc");
    expect(asc[0].id).toBe("OP-1001");
  });

  it("tie-breaks equal dates by id ascending", () => {
    const tied: Operation[] = [
      {
        id: "OP-B",
        name: "B",
        responsiblePerson: "X",
        status: "Pending",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      },
      {
        id: "OP-A",
        name: "A",
        responsiblePerson: "X",
        status: "Pending",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      },
    ];
    const sorted = sortOperations(tied, "createdAt", "desc");
    expect(sorted.map((o) => o.id)).toEqual(["OP-A", "OP-B"]);
  });

  it("does not mutate the input array", () => {
    const copy = [...fixtureOperations];
    const originalOrder = copy.map((o) => o.id);
    sortOperations(copy, "createdAt", "asc");
    expect(copy.map((o) => o.id)).toEqual(originalOrder);
  });
});

describe("computeStats", () => {
  it("counts each status and total", () => {
    expect(computeStats(fixtureOperations)).toEqual({
      Total: 6,
      Pending: 2,
      Running: 1,
      Completed: 1,
      Failed: 2,
    });
  });
});
