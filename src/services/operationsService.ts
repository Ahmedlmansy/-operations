import { initialOperations } from "../data/operations";
import type { Operation } from "../types/operation";

// Single seam between UI and data. Phase 2 replaces the body with the Mock API
// (and likely makes it async) without touching components.
export const operationsService = {
  getOperations(): Operation[] {
    return initialOperations;
  },
};
