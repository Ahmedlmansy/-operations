import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";

vi.unmock("@tanstack/react-virtual");

const { OperationsTable } = await import("../OperationsTable");

describe("OperationsTable virtualization", () => {
  it("renders a small visible window for 10,000 operations", () => {
    Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
      configurable: true,
      get() {
        return 560;
      },
    });
    Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
      configurable: true,
      get() {
        return 1000;
      },
    });
    Object.defineProperty(HTMLElement.prototype, "clientHeight", {
      configurable: true,
      get() {
        return 560;
      },
    });
    Object.defineProperty(HTMLElement.prototype, "clientWidth", {
      configurable: true,
      get() {
        return 1000;
      },
    });
    // jsdom cannot do real layout, so we assert the virtualized window stays small.
    const operations = Array.from({ length: 10_000 }, (_, index) => ({
      id: `OP-${index + 1}`,
      name: `Operation ${index + 1}`,
      responsiblePerson: "Test User",
      status: (index % 4 === 0 ? "Pending" : index % 4 === 1 ? "Running" : index % 4 === 2 ? "Completed" : "Failed") as "Pending" | "Running" | "Completed" | "Failed",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-02T00:00:00.000Z",
    }));

    const { container } = render(<OperationsTable operations={operations} onView={() => undefined} />);
    const bodyRows = container.querySelectorAll("tbody tr");
    expect(bodyRows.length).toBeLessThan(100);
  });
});
