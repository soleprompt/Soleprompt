type ApiErrorPayload = {
  error?: string;
  message?: string;
};

export function apiErrorMessage(
  response: Response,
  payload: ApiErrorPayload | null | undefined,
  fallback: string,
): string {
  const explicit = payload?.error?.trim() || payload?.message?.trim();
  if (explicit) {
    return explicit;
  }

  switch (response.status) {
    case 401:
      return "Please sign in again to continue.";
    case 403:
      return "You do not have access to this feature.";
    case 502:
      return "The X API returned an error. Check server logs or try again.";
    case 503:
      return "X API credentials are not configured on this server.";
    default:
      return fallback;
  }
}

export async function parseApiError(
  response: Response,
  fallback: string,
): Promise<string> {
  let payload: ApiErrorPayload | null = null;
  try {
    payload = (await response.json()) as ApiErrorPayload;
  } catch {
    // Non-JSON error bodies fall back to status-based messaging.
  }
  return apiErrorMessage(response, payload, fallback);
}
