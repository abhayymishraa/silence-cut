import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { stat } from "fs/promises";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const joinedPath = path.join("/");
    const filePath = join(process.cwd(), "uploads", joinedPath);

    // Check if file exists
    try {
      await stat(filePath);
    } catch {
      return new NextResponse("File not found", { status: 404 });
    }

    // Read the file
    const fileBuffer = await readFile(filePath);

    // Determine content type based on file extension
    let contentType = "application/octet-stream";
    if (joinedPath.endsWith(".mp4")) {
      contentType = "video/mp4";
    } else if (joinedPath.endsWith(".mov")) {
      contentType = "video/quicktime";
    } else if (joinedPath.endsWith(".avi")) {
      contentType = "video/x-msvideo";
    } else if (joinedPath.endsWith(".webm")) {
      contentType = "video/webm";
    }

    // Return the file with appropriate headers
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error serving file:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
