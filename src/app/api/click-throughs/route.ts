import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  isClickThroughEventType,
  type ClickThroughEventType,
} from "@/lib/click-throughs/constants";
import { recordClickThrough } from "@/lib/click-throughs";

type ClickThroughBody = {
  eventType?: string;
  targetKey?: string;
  metadata?: Record<string, string | number | boolean | null>;
};

export async function POST(request: Request) {
  let body: ClickThroughBody;

  try {
    body = (await request.json()) as ClickThroughBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { eventType, targetKey, metadata } = body;

  if (!eventType || !isClickThroughEventType(eventType)) {
    return NextResponse.json({ error: "Invalid event type." }, { status: 400 });
  }

  if (!targetKey || typeof targetKey !== "string" || targetKey.length > 128) {
    return NextResponse.json({ error: "Invalid target key." }, { status: 400 });
  }

  const { userId } = await auth();

  await recordClickThrough({
    eventType: eventType as ClickThroughEventType,
    targetKey,
    metadata,
    clerkUserId: userId,
  });

  return NextResponse.json({ ok: true });
}
