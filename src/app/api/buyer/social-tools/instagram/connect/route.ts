import { startMetaOAuthConnect } from "@/lib/social-tools/meta-connect";

export async function GET(request: Request) {
  return startMetaOAuthConnect(request, "instagram");
}
