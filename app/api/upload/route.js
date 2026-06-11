import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

const MAX_PHOTOS = 4;
const MAX_TOTAL_SIZE_BYTES = 4 * 1024 * 1024; // 4MB total

export async function POST(request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('images');

    if (!files || files.length === 0) {
      return NextResponse.json({ message: 'No images provided' }, { status: 400 });
    }

    if (files.length > MAX_PHOTOS) {
      return NextResponse.json(
        { message: `Maximum ${MAX_PHOTOS} photos allowed.` },
        { status: 400 }
      );
    }

    // Validate total size
    let totalSize = 0;
    for (const file of files) {
      totalSize += file.size;
    }
    if (totalSize > MAX_TOTAL_SIZE_BYTES) {
      return NextResponse.json(
        { message: 'Total size of all photos exceeds 4MB limit.' },
        { status: 400 }
      );
    }

    // Upload ALL images to Cloudinary in PARALLEL (much faster!)
    const uploadedUrls = await Promise.all(
      files.map((file) =>
        file.arrayBuffer().then((arrayBuffer) => {
          const buffer = Buffer.from(arrayBuffer);
          return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              { folder: 'napworks_products' },
              (error, result) => {
                if (error) {
                  console.error('Cloudinary stream error:', JSON.stringify(error));
                  reject(new Error(error.message || 'Cloudinary upload failed'));
                } else {
                  resolve(result.secure_url);
                }
              }
            );
            uploadStream.end(buffer);
          });
        })
      )
    );

    return NextResponse.json({ urls: uploadedUrls }, { status: 200 });

  } catch (error) {
    console.error('Upload route error:', error.message || JSON.stringify(error));
    return NextResponse.json(
      { message: error.message || 'Failed to upload images. Please try again.' },
      { status: 500 }
    );
  }
}
