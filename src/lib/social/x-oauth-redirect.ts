import { NextResponse } from "next/server";

export function redirectToXChecker(
  request: Request,
  params: Record<string, string>,
) {
  const search = new URLSearchParams(params);
  return NextResponse.redirect(
    new URL(`/tools/x-checker?${search.toString()}`, request.url),
  );
}

export function redirectToScrubber(
  request: Request,
  params: Record<string, string>,
) {
  const search = new URLSearchParams(params);
  return NextResponse.redirect(
    new URL(`/buyer/scrubber?${search.toString()}`, request.url),
  );
}

export function redirectXOAuthError(
  request: Request,
  tool: "checker" | "scrubber",
  message: string,
) {
  const params = { x: "error", message };
  return tool === "checker"
    ? redirectToXChecker(request, params)
    : redirectToScrubber(request, params);
}
