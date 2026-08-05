import { NextResponse } from "next/server";
import cloudinary, {
  ensureCloudinaryConfigured,
} from "@utils/cloudinary";
import {
  getCloudinaryApartmentUploadOptions,
  getCloudinaryBrandUploadOptions,
} from "@config/cloudinary";

/**
 * POST /api/order/update/image
 * form fields:
 *   image — file
 *   purpose — optional "hero" | "brand" | "general" → brand folder + returns secure_url
 *             otherwise apartments folder + returns public_id (legacy)
 */
export async function POST(req) {
  try {
    const cfg = ensureCloudinaryConfigured();
    if (!cfg.ok) {
      return NextResponse.json(
        { success: false, message: cfg.message },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("image");
    const purpose = String(formData.get("purpose") || "")
      .trim()
      .toLowerCase();
    const forBrandFolder =
      purpose === "hero" || purpose === "brand" || purpose === "general";

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file uploaded" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uploadOptions = forBrandFolder
      ? getCloudinaryBrandUploadOptions()
      : getCloudinaryApartmentUploadOptions();

    const cloudinaryResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      const stream = require("stream");
      const passthrough = new stream.PassThrough();
      passthrough.end(buffer);
      passthrough.pipe(uploadStream);
    });

    // Brand/hero/general: absolute CDN URL. Apartments: public_id for CldImage.
    const data = forBrandFolder
      ? cloudinaryResult.secure_url || cloudinaryResult.url
      : cloudinaryResult.public_id;

    return NextResponse.json({
      success: true,
      data,
      publicId: cloudinaryResult.public_id,
      message: "File uploaded successfully to Cloudinary",
    });
  } catch (e) {
    console.error("Error in image upload:", e);
    return NextResponse.json(
      { success: false, message: e.message },
      { status: 500 }
    );
  }
}
