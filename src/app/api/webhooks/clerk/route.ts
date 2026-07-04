import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { createUserFromWebhook } from "@/lib/user";
import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req);

    if (evt.type === "user.created") {
      const { id, username, email_addresses } = evt.data;

      await createUserFromWebhook({
        id,
        username: username ?? null,
        email_addresses: email_addresses ?? [],
      });
    }

    return new Response("OK", { status: 200 });
  } catch {
    return new Response("Webhook verification failed", { status: 400 });
  }
}
