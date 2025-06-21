import db from "@/db/db";
import { postToTwitter } from "@/utils/social/postToTwitter";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) return new NextResponse("Missing article ID", { status: 400 });
    
    const article = await db.article.findUnique({
      where: { id },
      select: {
        title: true,
        localImagePath: true,
        translatedX: true,
      },
    });

    if (!article) {
      return new NextResponse("Article not found", { status: 404 });
    }

    if (!article.translatedX) {
      return new NextResponse("Article not translated", { status: 400 });
    }

    if (!article.localImagePath) {
      return new NextResponse("Article has no image", { status: 400 });
    }

    let imagePath = "";
    if (article.localImagePath && article.localImagePath.startsWith("/images/")) {
      imagePath = path.join(process.cwd(), "tmp", article.localImagePath);
    }

    await postToTwitter({
      text: article.title,
      imagePath: imagePath,
      translatedX: article.translatedX,
    });
    
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ Twitter posting failed:", err);
    return new NextResponse("Server Error", { status: 500 });
  }
}