import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => cleanup());

// jsdom does not implement <dialog>.showModal / close
HTMLDialogElement.prototype.showModal ??= function showModal(this: HTMLDialogElement) {
  this.setAttribute("open", "");
};
HTMLDialogElement.prototype.close ??= function close(this: HTMLDialogElement) {
  this.removeAttribute("open");
};

// Virtualizer needs a non-zero scroll container size in jsdom
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

Element.prototype.getBoundingClientRect = function getBoundingClientRect() {
  return {
    width: 1000,
    height: 560,
    top: 0,
    left: 0,
    bottom: 560,
    right: 1000,
    x: 0,
    y: 0,
    toJSON() {
      return {};
    },
  };
};

vi.mock("@tanstack/react-virtual", async () => {
  const actual = await vi.importActual<typeof import("@tanstack/react-virtual")>(
    "@tanstack/react-virtual",
  );
  return {
    ...actual,
    useVirtualizer: (options: {
      count: number;
      estimateSize: () => number;
      overscan?: number;
    }) => {
      const size = options.estimateSize();
      const items = Array.from({ length: options.count }, (_, index) => ({
        index,
        start: index * size,
        end: (index + 1) * size,
        size,
        key: index,
      }));
      return {
        getVirtualItems: () => items,
        getTotalSize: () => options.count * size,
        measureElement: () => undefined,
        scrollToIndex: () => undefined,
      };
    },
  };
});
