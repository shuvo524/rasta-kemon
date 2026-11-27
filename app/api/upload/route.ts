import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { getSessionUser } from "@/lib/server-auth";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

function cloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

/**
 * POST /api/upload — auth required, multipart form with a `file` field.
 * Uploads to Cloudinary (folder "rasta-kemon"). When Cloudinary is not
 * configured, answers a clear 503 instead of crashing — and never
 * exposes any secret.
 */
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!cloudinaryConfigured()) {
    return NextResponse.json(
      {
        error: "upload_unavailable",
        message:
          "Cloudinary is not configured yet. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to env vars — or submit the report without a photo.",
      },
      { status: 503 }
    );
  }
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "invalid_form" }, { status: 400 });
  }
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "no_file" }, { status: 400 });
  }
  if (!/^image\//.test(file.type)) {
    return NextResponse.json(
      { error: "not_an_image" },
      { status: 400 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "file_too_large" }, { status: 400 });
  }
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  const buffer = Buffer.from(await file.arrayBuffer());
  try {
    const result = await new Promise<{ secure_url: string; public_id: string }>(
      (resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "rasta-kemon", resource_type: "image" },
          (err, res) => {
            if (err || !res) reject(err ?? new Error("upload failed"));
            else resolve(res);
          }
        );
        stream.end(buffer);
      }
    );
    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "upload_failed", message: (err as Error).message },
      { status: 502 }
    );
  }
}
