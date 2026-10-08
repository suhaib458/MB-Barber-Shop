import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/firebase/admin";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const ALLOWED_FOLDERS = new Set(["barbers", "reels", "gallery"]);

function cloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );
}

export async function POST(request: Request) {
  try {
    await requireAdmin(request);

    if (!cloudinaryConfigured()) {
      return NextResponse.json(
        { error: "MEDIA_NOT_CONFIGURED" },
        { status: 503 },
      );
    }

    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > MAX_IMAGE_BYTES + 1024 * 1024) {
      return NextResponse.json({ error: "FILE_TOO_LARGE" }, { status: 413 });
    }

    const form = await request.formData();
    const file = form.get("file");
    const requestedFolder = String(form.get("folder") || "gallery");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "FILE_REQUIRED" }, { status: 400 });
    }
    if (!file.type.startsWith("image/") || file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: "INVALID_IMAGE" }, { status: 400 });
    }

    const folderName = ALLOWED_FOLDERS.has(requestedFolder)
      ? requestedFolder
      : "gallery";
    const folder = `mb/${folderName}`;
    const timestamp = Math.floor(Date.now() / 1000);
    const signatureBase = `folder=${folder}&timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET}`;
    const signature = createHash("sha1").update(signatureBase).digest("hex");

    const body = new FormData();
    body.set("file", file);
    body.set("api_key", process.env.CLOUDINARY_API_KEY!);
    body.set("timestamp", String(timestamp));
    body.set("folder", folder);
    body.set("signature", signature);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: "POST", body },
    );

    const payload = (await response.json()) as {
      secure_url?: string;
      public_id?: string;
      width?: number;
      height?: number;
      error?: { message?: string };
    };

    if (!response.ok || !payload.secure_url) {
      console.error("Cloudinary upload failed", payload.error?.message || response.status);
      return NextResponse.json({ error: "UPLOAD_FAILED" }, { status: 502 });
    }

    return NextResponse.json({
      url: payload.secure_url,
      publicId: payload.public_id,
      width: payload.width,
      height: payload.height,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNAUTHORIZED";
    const status = message === "FORBIDDEN" ? 403 : 401;
    return NextResponse.json({ error: message }, { status });
  }
}
