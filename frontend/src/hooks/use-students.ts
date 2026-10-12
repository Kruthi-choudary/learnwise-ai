import { useEffect, useRef, useState } from "react";
import { getStudents, ApiError, type CampusStudent } from "@/api";

type State =
  | { status: "loading" }
  | { status: "success"; students: CampusStudent[] }
  | { status: "error"; message: string };

/**
 * Fetches the student list from GET /api/students exactly once per mount.
 * Handles component unmount safely via AbortController.
 * Returns a discriminated-union state plus a `retry` callback.
 */
export function useStudents(): { state: State; retry: () => void } {
  const [state, setState] = useState<State>({ status: "loading" });
  // Increment this to trigger a re-fetch (used by retry)
  const [tick, setTick] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Cancel any in-flight request from a previous render
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState({ status: "loading" });

    getStudents()
      .then((res) => {
        if (controller.signal.aborted) return;
        setState({ status: "success", students: res.data });
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        const message =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Unexpected error loading students.";
        setState({ status: "error", message });
      });

    return () => {
      controller.abort();
    };
  }, [tick]);

  return { state, retry: () => setTick((t) => t + 1) };
}
