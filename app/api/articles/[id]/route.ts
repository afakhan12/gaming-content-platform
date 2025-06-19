import { NextRequest, NextResponse } from "next/server";
import db from "@/db/db";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);

  try {
    const article = await db.article.findUnique({
      where: { id },
    });

    if (!article) {
      return new NextResponse("Not Found", { status: 404 });
    }

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

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const body = await request.json();

  try {
    const updated = await db.article.update({
      where: { id },
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