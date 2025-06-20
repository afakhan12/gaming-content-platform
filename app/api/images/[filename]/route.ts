import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    // Await the params promise
    const { filename } = await params;
    const filePath = path.join(process.cwd(), 'tmp', 'images', filename);
    console.log(`🔍 Requested: ${filePath}`);

    const imageBuffer = fs.readFileSync(filePath);

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': getContentType(filename), // Helper function
      },
    });
  } catch (error) {
    console.error(`❌ Error serving image:`, error);
    return NextResponse.json(
      { error: 'Image not found' }, 
      { status: 404 }
    );
  }
}

// Helper function to determine content type
function getContentType(filename: string) {
  const extension = filename.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'webp':
      return 'image/webp';
    default:
      return 'image/jpeg'; // default to jpeg
  }
}