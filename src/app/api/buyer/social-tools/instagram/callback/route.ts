import { handleMetaOAuthCallback } from "@/lib/social-tools/meta-callback";

export async function GET(request: Request) {
  return handleMetaOAuthCallback(request, "instagram");
}
