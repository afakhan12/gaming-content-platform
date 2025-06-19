import { NextRequest, NextResponse } from "next/server";
import db from "@/db/db";

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
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("❌ Failed to update article:", err);
    return new NextResponse("Server Error", { status: 500 });
  }
}