import { NextResponse } from "next/server";
import db from "@/db/db";

export async function GET(
  req: Request,
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
      // ✅ These are plain strings, don't parse:
      translatedX: article.translatedX || "",
      translatedFacebook: article.translatedFacebook || "",
    };

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("❌ Failed to fetch article:", err);
    return new NextResponse("Server Error", { status: 500 });
  }
}
