import {
  STUDIO_TONES,
  STUDIO_VIDEO_TYPES,
  type StudioGenerateInput,
  type StudioTone,
  type StudioVideoType,
} from "@/lib/studio/types";

export type StudioValidationResult =
  | { ok: true; data: StudioGenerateInput }
  | { ok: false; error: string };

function isVideoType(value: unknown): value is StudioVideoType {
  return (
    typeof value === "string" &&
    STUDIO_VIDEO_TYPES.includes(value as StudioVideoType)
  );
}

function isTone(value: unknown): value is StudioTone {
  return typeof value === "string" && STUDIO_TONES.includes(value as StudioTone);
}

export function validateStudioGenerateInput(
  body: unknown,
): StudioValidationResult {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid request body." };
  }

  const record = body as Record<string, unknown>;
  const topic = typeof record.topic === "string" ? record.topic.trim() : "";

  if (!topic) {
    return { ok: false, error: "Topic is required." };
  }

  if (topic.length > 200) {
    return { ok: false, error: "Topic must be 200 characters or fewer." };
  }

  const videoTypeRaw = record.videoType ?? "long-form";
  if (!isVideoType(videoTypeRaw)) {
    return { ok: false, error: "Video type must be shorts or long-form." };
  }

  const niche =
    typeof record.niche === "string" && record.niche.trim()
      ? record.niche.trim().slice(0, 120)
      : undefined;

  const tone =
    record.tone === undefined || record.tone === null || record.tone === ""
      ? undefined
      : isTone(record.tone)
        ? record.tone
        : undefined;

  if (
    record.tone !== undefined &&
    record.tone !== null &&
    record.tone !== "" &&
    !tone
  ) {
    return { ok: false, error: "Invalid tone selection." };
  }

  return {
    ok: true,
    data: {
      topic,
      niche,
      videoType: videoTypeRaw,
      tone,
    },
  };
}
