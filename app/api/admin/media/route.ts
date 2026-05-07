import { NextRequest, NextResponse } from "next/server";
import { checkPermission, forbiddenResponse, unauthorizedResponse, verifyAdminAuth } from "@/lib/admin-auth";
import { getAllMedia, countMedia, getMediaStats } from "@/lib/media-service";

export async function GET(request: NextRequest) {
  const auth = await verifyAdminAuth(request);
  if (!auth.authenticated) return unauthorizedResponse(auth.error);
  if (!checkPermission(auth.admin, "upload_media")) return forbiddenResponse();

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const search = searchParams.get("search");
    const skip = parseInt(searchParams.get("skip") || "0", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const includeStats = searchParams.get("includeStats") === "true";

    const filters: any = {
      skip,
      limit,
    };
    if (type) filters.type = type;
    if (search) filters.search = search;

    const media = await getAllMedia(filters);
    const total = await countMedia(filters);

    const response: any = {
      media,
      total,
      skip,
      limit,
    };

    if (includeStats) {
      response.stats = await getMediaStats();
    }

    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch media.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
