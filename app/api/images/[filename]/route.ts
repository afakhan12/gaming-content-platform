import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function GET(req: Request, context: { params: { filename: string } }) {
  const { filename } = context.params;
  const filePath = path.join(process.cwd(), 'tmp', 'images', filename);
  console.log(`🔍 Requested: ${filePath}`);

  try {
    const imageBuffer = fs.readFileSync(filePath);

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/jpeg', // or adjust based on extension
      },
    });
  } catch (error) {
    console.error(`❌ File not found: ${filePath}`);
    return NextResponse.json({ error: 'Image not found' }, { status: 404 });
  }
}
