import type { StudioResearchInput } from "@/lib/studio/research/types";
import { STUDIO_TONES, STUDIO_VIDEO_TYPES } from "@/lib/studio/types";

export type ResearchValidationResult =
  | { ok: true; data: StudioResearchInput & { projectId?: string } }
  | { ok: false; error: string };

export function validateStudioResearchInput(body: unknown): ResearchValidationResult {
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

  const niche =
    typeof record.niche === "string" && record.niche.trim()
      ? record.niche.trim().slice(0, 120)
      : undefined;

  const videoTypeRaw = record.videoType;
  const videoType =
    videoTypeRaw === undefined || videoTypeRaw === null || videoTypeRaw === ""
      ? undefined
      : typeof videoTypeRaw === "string" &&
          STUDIO_VIDEO_TYPES.includes(videoTypeRaw as (typeof STUDIO_VIDEO_TYPES)[number])
        ? videoTypeRaw
        : undefined;

  if (
    videoTypeRaw !== undefined &&
    videoTypeRaw !== null &&
    videoTypeRaw !== "" &&
    !videoType
  ) {
    return { ok: false, error: "Video type must be shorts or long-form." };
  }

  const toneRaw = record.tone;
  const tone =
    toneRaw === undefined || toneRaw === null || toneRaw === ""
      ? undefined
      : typeof toneRaw === "string" &&
          STUDIO_TONES.includes(toneRaw as (typeof STUDIO_TONES)[number])
        ? toneRaw
        : undefined;

  if (toneRaw !== undefined && toneRaw !== null && toneRaw !== "" && !tone) {
    return { ok: false, error: "Invalid tone selection." };
  }

  const projectId =
    typeof record.projectId === "string" && record.projectId.trim()
      ? record.projectId.trim()
      : undefined;

  const trendingAngles = Array.isArray(record.trendingAngles)
    ? record.trendingAngles
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 10)
    : undefined;

  return {
    ok: true,
    data: {
      topic,
      niche,
      videoType,
      tone,
      projectId,
      trendingAngles,
    },
  };
}
