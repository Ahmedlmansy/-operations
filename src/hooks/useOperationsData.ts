import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchOperations,
  updateOperationStatus,
  type FetchParams,
  type FetchResult,
} from "../services/operationsApi";
import type { OperationStatus } from "../types/operation";
import { patchOperationStatus } from "../utils/operations";

type Status = "idle" | "loading" | "success" | "error";

function isAbortError(err: unknown): boolean {
  return err instanceof DOMException && err.name === "AbortError";
}

export function useOperationsData(params: FetchParams) {
  const [state, setState] = useState<{
    status: Status;
    result: FetchResult | null;
    resultParams: FetchParams | null;
    error: Error | null;
  }>({ status: "idle", result: null, resultParams: null, error: null });

  const paramsRef = useRef(params);
  const latestRequestId = useRef(0);
  const controllerRef = useRef<AbortController | null>(null);
  const mutationControllersRef = useRef<Set<AbortController>>(new Set());

  paramsRef.current = params;

  const load = useCallback(async (p: FetchParams) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    const requestId = ++latestRequestId.current;

    setState((prev) => ({ ...prev, status: "loading", error: null }));

    try {
      const result = await fetchOperations(p, { signal: controller.signal });
      if (requestId !== latestRequestId.current) return;
      setState({ status: "success", result, resultParams: p, error: null });
    } catch (err) {
      if (isAbortError(err)) return;
      if (requestId !== latestRequestId.current) return;
      setState((prev) => ({
        ...prev,
        status: "error",
        error: err instanceof Error ? err : new Error("Unknown error"),
      }));
    }
  }, []);

  useEffect(() => {
    void load(paramsRef.current);
    return () => {
      controllerRef.current?.abort();
    };
  }, [load, params.search, params.status, params.sortField, params.sortDirection]);

  useEffect(() => {
    const mutationControllers = mutationControllersRef.current;
    return () => {
      for (const controller of mutationControllers) {
        controller.abort();
      }
      mutationControllers.clear();
      controllerRef.current?.abort();
    };
  }, []);

  const retry = useCallback(() => {
    void load(paramsRef.current);
  }, [load]);

  const changeStatus = useCallback(
    async (id: string, next: OperationStatus) => {
      const controller = new AbortController();
      mutationControllersRef.current.add(controller);

      try {
        const updated = await updateOperationStatus(id, next, { signal: controller.signal });
        if (controller.signal.aborted) return;

        setState((prev) => {
          if (!prev.result || !prev.resultParams) return prev;
          const patched = patchOperationStatus(prev.result, id, updated, prev.resultParams);
          if (!patched) return prev;
          return {
            ...prev,
            result: patched,
            status: prev.status === "error" ? "success" : prev.status,
            error: null,
          };
        });

        await load(paramsRef.current);
      } catch (err) {
        if (isAbortError(err)) return;
        throw err;
      } finally {
        mutationControllersRef.current.delete(controller);
      }
    },
    [load],
  );

  const hasCurrentResult =
    state.result !== null &&
    state.resultParams !== null &&
    sameFetchParams(state.resultParams, params);
  const visibleResult = hasCurrentResult ? state.result : null;

  return {
    status: state.status,
    operations: visibleResult?.data ?? [],
    total: visibleResult?.total ?? 0,
    stats: state.result?.stats ?? null,
    error: state.error,
    hasResult: state.result !== null,
    isInitialLoading: state.status === "loading" && state.result === null,
    isRefetching: state.status === "loading" && state.result !== null,
    retry,
    changeStatus,
  };
}

function sameFetchParams(a: FetchParams, b: FetchParams): boolean {
  return (
    a.search === b.search &&
    a.status === b.status &&
    a.sortField === b.sortField &&
    a.sortDirection === b.sortDirection
  );
}
