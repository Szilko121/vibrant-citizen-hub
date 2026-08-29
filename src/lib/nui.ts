import { useEffect } from "react";

/**
 * FiveM NUI bridge.
 * Works inside the game (CEF) and in the browser (mock mode for development).
 */

export type PlayerData = {
  name: string;
  citizenId: string;
  bank: number;
  cash: number;
  framework: string;
  inventory: string;
};

export type NuiMessage<T = unknown> = {
  action: string;
  data: T;
};

export const isInGame = (): boolean =>
  typeof window !== "undefined" && Boolean((window as { invokeNative?: unknown }).invokeNative);

const resourceName = (): string => {
  const g = window as { GetParentResourceName?: () => string };
  return typeof g.GetParentResourceName === "function"
    ? g.GetParentResourceName()
    : "nexus-cityhall";
};

/** Send an NUI callback to the Lua client script and await its response. */
export async function fetchNui<T = unknown>(
  event: string,
  data: unknown = {},
  mock?: T,
): Promise<T> {
  if (!isInGame()) {
    // Development fallback so the UI stays usable in the browser preview.
    return new Promise<T>((resolve) => setTimeout(() => resolve(mock as T), 300));
  }

  const res = await fetch(`https://${resourceName()}/${event}`, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=UTF-8" },
    body: JSON.stringify(data),
  });

  return (await res.json()) as T;
}

/** Subscribe to `SendNUIMessage({ action, data })` payloads from Lua. */
export function useNuiEvent<T = unknown>(action: string, handler: (data: T) => void) {
  useEffect(() => {
    const listener = (event: MessageEvent<NuiMessage<T>>) => {
      const payload = event.data;
      if (!payload || payload.action !== action) return;
      handler(payload.data);
    };

    window.addEventListener("message", listener);
    return () => window.removeEventListener("message", listener);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [action, handler]);
}
