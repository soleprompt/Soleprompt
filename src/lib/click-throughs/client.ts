import type { ClickThroughEventType } from "@/lib/click-throughs/constants";
import type { ClickThroughMetadata } from "@/lib/click-throughs";

type TrackClickThroughInput = {
  eventType: ClickThroughEventType;
  targetKey: string;
  metadata?: ClickThroughMetadata;
};

export function trackClickThrough(input: TrackClickThroughInput): void {
  const body = JSON.stringify(input);

  if (
    typeof navigator !== "undefined" &&
    typeof navigator.sendBeacon === "function"
  ) {
    const blob = new Blob([body], { type: "application/json" });
    if (navigator.sendBeacon("/api/click-throughs", blob)) {
      return;
    }
  }

  void fetch("/api/click-throughs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {
    // Fire-and-forget.
  });
}
