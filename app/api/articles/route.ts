import { NextResponse } from "next/server";
import db from "@/db/db";

export async function GET() {
  try {
    const articles = await db.article.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    const parsed = articles.map((article) => ({
      ...article,
      originalText: article.originalText ? JSON.parse(article.originalText) : [],
      // ✅ These are plain strings, don't parse:
      translatedX: article.translatedX || "",
      translatedFacebook: article.translatedFacebook || "",
    }));

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("❌ Failed to fetch articles:", err);
    return new NextResponse("Server error", { status: 500 });
  }
}
