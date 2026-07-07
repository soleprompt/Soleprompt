import { generateToolPreviewSvg } from "@/lib/tool-preview-svg";
import type { ToolCategorySlug } from "@/lib/tool-images";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title")?.trim();
  const category = (searchParams.get("category") ?? "business")
    .toLowerCase()
    .replace(/\s+/g, "-");

  if (!title) {
    return new Response("Missing title", { status: 400 });
  }

  const svg = generateToolPreviewSvg(title, category as ToolCategorySlug);

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
