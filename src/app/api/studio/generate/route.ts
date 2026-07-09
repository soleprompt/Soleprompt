import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { saveYouTubePackage } from "@/lib/studio/data";
import { generateStudioPackage } from "@/lib/studio/generate";
import { validateStudioGenerateInput } from "@/lib/studio/validation";
import { syncCurrentUser } from "@/lib/user";

export async function POST(request: Request) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbUser = await syncCurrentUser();
  if (!dbUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const validation = validateStudioGenerateInput(body);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  let generated;
  try {
    generated = await generateStudioPackage(validation.data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "AI generation failed.";

    if (message.includes("OPENAI_API_KEY")) {
      return NextResponse.json({ error: message }, { status: 503 });
    }

    return NextResponse.json({ error: message }, { status: 502 });
  }

  try {
    const saved = await saveYouTubePackage(
      dbUser.id,
      validation.data,
      generated,
    );
    return NextResponse.json({ package: saved });
  } catch {
    return NextResponse.json(
      { error: "Failed to save generated package." },
      { status: 500 },
    );
  }
}
