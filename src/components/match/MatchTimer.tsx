import { GlassPill } from "@/src/components/ui/display/GlassPill";
import { Clock } from "lucide-react-native";
import { RefObject, useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";

const TICK_MS = 100;

function formatSeconds(total: number): string {
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function formatElapsed(ms: number): string {
  return formatSeconds(Math.max(0, Math.floor(ms / 1000)));
}

export function MatchTimer({
  running,
  readerRef,
}: {
  running: boolean;
  readerRef?: RefObject<() => number>;
}) {
  const [seconds, setSeconds] = useState(0);
  const [session, setSession] = useState(running);

  const accumulatedRef = useRef(0);
  const startedAtRef = useRef<number | null>(null);

  if (session !== running) {
    setSession(running);
    if (running) setSeconds(0);
  }

  const readElapsed = useCallback(() => {
    const started = startedAtRef.current;
    return (
      accumulatedRef.current + (started === null ? 0 : Date.now() - started)
    );
  }, []);

  useEffect(() => {
    if (!readerRef) return;
    readerRef.current = readElapsed;
  }, [readerRef, readElapsed]);

  useEffect(() => {
    if (!running) return;

    accumulatedRef.current = 0;
    startedAtRef.current = Date.now();

    let paused = false;

    const settle = () => {
      if (startedAtRef.current === null) return;
      accumulatedRef.current += Date.now() - startedAtRef.current;
      startedAtRef.current = null;
    };

    const interval = setInterval(() => {
      if (paused || startedAtRef.current === null) return;
      const next = Math.floor(readElapsed() / 1000);
      setSeconds((prev) => (prev === next ? prev : next));
    }, TICK_MS);

    const subscription = AppState.addEventListener("change", (status) => {
      if (status === "active") {
        if (!paused) return;
        paused = false;
        startedAtRef.current = Date.now();
        return;
      }
      if (paused) return;
      settle();
      paused = true;
    });

    return () => {
      clearInterval(interval);
      subscription.remove();
      settle();
    };
  }, [running, readElapsed]);

  return (
    <GlassPill
      tone="neutral"
      size="md"
      icon={Clock}
      label={formatSeconds(seconds)}
      tabularNums
    />
  );
}
