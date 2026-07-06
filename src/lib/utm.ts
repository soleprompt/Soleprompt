import { getAppUrl } from "@/lib/app-url";

export const X_CHECKER_PATH = "/tools/x-checker";
export const HOMEPAGE_PATH = "/";

export type UtmParams = {
  source: string;
  campaign?: string;
};

export type UtmAttribution = {
  utmSource?: string;
  utmCampaign?: string;
};

type SearchParamValue = string | string[] | undefined;

/** Canonical acquisition channels and their UTM params. */
export const ACQUISITION_CHANNELS = {
  x_replies: {
    label: "X Replies",
    medal: "🥇",
    source: "x",
    campaign: "reputation_score",
  },
  free_checker: {
    label: "Free Checker Shares",
    medal: "🥈",
    source: "x",
    campaign: "free_checker",
  },
  reddit: {
    label: "Reddit",
    medal: "🥉",
    source: "reddit",
    campaign: "career",
  },
  linkedin: {
    label: "LinkedIn",
    medal: "🏅",
    source: "linkedin",
  },
  youtube: {
    label: "YouTube",
    source: "youtube",
  },
} as const;

export type AcquisitionChannelKey = keyof typeof ACQUISITION_CHANNELS;

/** Ordered keys shown in the admin Top Acquisition Sources card. */
export const TOP_ACQUISITION_CHANNEL_KEYS = [
  "x_replies",
  "free_checker",
  "reddit",
  "linkedin",
] as const satisfies readonly AcquisitionChannelKey[];

/** Example tracked URLs for admin/docs (resolved at call time). */
export function getUtmExampleUrls(): Record<AcquisitionChannelKey, string> {
  return {
    x_replies: buildChannelUrl(X_CHECKER_PATH, "x_replies"),
    free_checker: buildChannelUrl(X_CHECKER_PATH, "free_checker"),
    reddit: buildChannelUrl(X_CHECKER_PATH, "reddit"),
    linkedin: buildChannelUrl(HOMEPAGE_PATH, "linkedin"),
    youtube: buildChannelUrl(HOMEPAGE_PATH, "youtube"),
  };
}

const MAX_UTM_LENGTH = 64;

function firstSearchParam(value: SearchParamValue): string | undefined {
  if (Array.isArray(value)) {
    return value[0]?.trim() || undefined;
  }
  const trimmed = value?.trim();
  return trimmed || undefined;
}

function normalizePath(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}

/** Build a relative or absolute URL with utm_source / utm_campaign query params. */
export function buildUtmUrl(
  path: string,
  { source, campaign }: UtmParams,
  options?: { absolute?: boolean },
): string {
  const params = new URLSearchParams({ utm_source: source });
  if (campaign) {
    params.set("utm_campaign", campaign);
  }

  const query = params.toString();
  const relative = `${normalizePath(path)}?${query}`;

  if (options?.absolute) {
    return `${getAppUrl()}${relative}`;
  }

  return relative;
}

/** Absolute URL for a canonical acquisition channel. */
export function buildChannelUrl(
  path: string,
  channel: AcquisitionChannelKey,
): string {
  const config = ACQUISITION_CHANNELS[channel];
  return buildUtmUrl(
    path,
    {
      source: config.source,
      campaign: "campaign" in config ? config.campaign : undefined,
    },
    { absolute: true },
  );
}

export function getChannelXCheckerUrl(channel: AcquisitionChannelKey): string {
  return buildChannelUrl(X_CHECKER_PATH, channel);
}

export function getChannelHomepageUrl(channel: AcquisitionChannelKey): string {
  return buildChannelUrl(HOMEPAGE_PATH, channel);
}

/** Map stored UTM values to a canonical acquisition channel key, if any. */
export function matchAcquisitionChannel(
  utmSource: string,
  utmCampaign?: string | null,
): AcquisitionChannelKey | null {
  if (utmSource === "x" && utmCampaign === "reputation_score") {
    return "x_replies";
  }
  if (utmSource === "x" && utmCampaign === "free_checker") {
    return "free_checker";
  }
  if (utmSource === "reddit" && utmCampaign === "career") {
    return "reddit";
  }
  if (utmSource === "linkedin") {
    return "linkedin";
  }
  if (utmSource === "youtube") {
    return "youtube";
  }
  return null;
}

/** Parse utm_source / utm_campaign from page search params for visit attribution. */
export function parseUtmAttribution(
  searchParams: Record<string, SearchParamValue>,
): UtmAttribution {
  const utmSource = firstSearchParam(searchParams.utm_source)?.slice(
    0,
    MAX_UTM_LENGTH,
  );
  const utmCampaign = firstSearchParam(searchParams.utm_campaign)?.slice(
    0,
    MAX_UTM_LENGTH,
  );

  if (!utmSource && !utmCampaign) {
    return {};
  }

  return { utmSource, utmCampaign };
}

export function formatUtmLabel(
  utmSource: string,
  utmCampaign?: string | null,
): string {
  if (utmCampaign) {
    return `${utmSource} · ${utmCampaign}`;
  }
  return utmSource;
}

/** Documented outbound links for each top acquisition channel (resolved at call time). */
export const ACQUISITION_SOURCE_URLS = {
  xReplies: buildChannelUrl(HOMEPAGE_PATH, "x_replies"),
  freeCheckerShares: buildChannelUrl(X_CHECKER_PATH, "free_checker"),
  reddit: buildChannelUrl(HOMEPAGE_PATH, "reddit"),
  linkedin: buildChannelUrl(HOMEPAGE_PATH, "linkedin"),
} as const;
