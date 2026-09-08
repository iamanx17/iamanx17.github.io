export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "";

/**
 * Only ever called with a tool slug and an event name. Nothing a user types is
 * passed in, so no input can reach analytics.
 */
export function track(event: string, params: Record<string, string> = {}) {
  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;

  gtag?.("event", event, params);
}
