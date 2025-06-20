import { NextRequest, NextResponse } from "next/server";
import db from "@/db/db";
import fs from "fs";
import path from "path";

// GET handler for fetching a single article by ID
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params promise to get the actual parameters
    const { id } = await params;
    const numericId = Number(id);

    // Attempt to find the article in the database
    const article = await db.article.findUnique({
      where: { id: numericId },
    });

    // Handle article not found
    if (!article) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Parse the article data
    const parsed = {
      ...article,
      originalText: article.originalText ? JSON.parse(article.originalText) : [],
      translatedX: article.translatedX || "",
      translatedFacebook: article.translatedFacebook || "",
    };

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("❌ Failed to fetch article:", err);
    return new NextResponse("Server Error", { status: 500 });
  }
}

// PUT handler for updating an article by ID
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await both the params and request body
    const [{ id }, body] = await Promise.all([params, req.json()]);
    const numericId = Number(id);

    // Update the article in the database
    const updated = await db.article.update({
      where: { id: numericId },
      data: {
        isBucketed: body.isBucketed,
        Interesting: body.Interesting,
        updatedAt: new Date(),
        ...(body.translatedX !== undefined && { translatedX: body.translatedX }),
        ...(body.translatedFacebook !== undefined && { translatedFacebook: body.translatedFacebook }),
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("❌ Failed to update article:", err);
    return new NextResponse("Server Error", { status: 500 });
  }
}

// DELETE handler for deleting an article by ID
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numericId = Number(id);
    // Find the article to get the image path
    const article = await db.article.findUnique({ where: { id: numericId } });
    if (article && article.localImagePath) {
      const imagePath = path.join(process.cwd(), 'public', article.localImagePath.startsWith('/') ? article.localImagePath.slice(1) : article.localImagePath);
      try {
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
          console.log(`🗑️ Deleted image: ${article.localImagePath}`);
        }
      } catch (err) {
        console.error(`❌ Failed to delete image ${article.localImagePath}:`, err);
      }
    }
    await db.article.delete({ where: { id: numericId } });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("❌ Failed to delete article:", err);
    return new NextResponse("Server Error", { status: 500 });
  }
}