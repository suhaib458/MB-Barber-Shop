import { auth } from "@/lib/firebase/client";

export type MediaFolder = "barbers" | "reels" | "gallery";

export async function uploadAdminImage(
  file: File,
  folder: MediaFolder,
): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Choose a valid image file.");
  }
  if (file.size > 8 * 1024 * 1024) {
    throw new Error("Choose an image smaller than 8 MB.");
  }

  const user = auth?.currentUser;
  if (!user) throw new Error("Admin session required.");

  const token = await user.getIdToken();
  const body = new FormData();
  body.set("file", file);
  body.set("folder", folder);

  const response = await fetch("/api/admin/media", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body,
  });

  const payload = (await response.json()) as { url?: string; error?: string };
  if (!response.ok || !payload.url) {
    if (payload.error === "MEDIA_NOT_CONFIGURED") {
      throw new Error(
        "Media upload is not configured yet. Add Cloudinary environment variables or paste an image URL.",
      );
    }
    throw new Error(payload.error || "Image upload failed.");
  }

  return payload.url;
}
