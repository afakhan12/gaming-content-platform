import { NextResponse } from "next/server";
import db from "@/db/db";

export async function GET() {
  try {
    const articles = await db.article.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    const parsed = articles.map((article) => {
      let parsedOriginalText: string[] = [];

      try {
        parsedOriginalText = article.originalText
          ? typeof article.originalText === "string"
            ? JSON.parse(article.originalText)
            : article.originalText
          : [];
      } catch (e) {
        console.warn(`⚠️ Could not parse originalText for article ID ${article.id}`);
      }

      return {
        id: article.id,
        title: article.title,
        sourceUrl: article.sourceUrl,
        localImagePath: article.localImagePath,
        imageUrl: article.imageUrl,
        author: article.author,
        createdAt: article.createdAt,
        pubDate: article.pubDate,
        updatedAt: article.updatedAt,
        originalText: parsedOriginalText,
        translatedX: article.translatedX || "",
        translatedFacebook: article.translatedFacebook || "",
        isBucketed: article.isBucketed,
        Interesting: article.Interesting,
      };
    });

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("❌ Failed to fetch articles:", err);
    return new NextResponse("Server error", { status: 500 });
  }
}
