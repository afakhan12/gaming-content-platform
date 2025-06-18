import { NextRequest, NextResponse } from "next/server";
import db from "@/db/db";

// ✅ Valid GET with proper request and context signature
export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = context.params;

  try {
    const article = await db.article.findUnique({
      where: { id: Number(id) },
    });

    if (!article) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const parsed = {
      ...article,
      originalText: article.originalText
        ? JSON.parse(article.originalText)
        : [],
      translatedX: article.translatedX || "",
      translatedFacebook: article.translatedFacebook || "",
    };

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("❌ Failed to fetch article:", err);
    return new NextResponse("Server Error", { status: 500 });
  }
}

// ✅ Valid PUT with proper request and context signature
export async function PUT(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = context.params;

  try {
    const body = await req.json();

    const updated = await db.article.update({
      where: { id: Number(id) },
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
