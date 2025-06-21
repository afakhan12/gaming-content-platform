// app/api/post-to-facebook/route.ts
import db from "@/db/db";
import { postToFacebook } from "@/utils/social/postToFacebook";
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
        translatedFacebook: true,
      },
    });

    if (!article) {
      return new NextResponse("Article not found", { status: 404 });
    }

    if (!article.translatedFacebook) {
      return new NextResponse("Article not translated", { status: 400 });
    }

    let imagePath = "";
    if (article.localImagePath && article.localImagePath.startsWith("/images/")) {
      imagePath = path.join(process.cwd(), "tmp", article.localImagePath);
    }
    await postToFacebook({
      title: article.title,
      imageUrl: imagePath,
      translatedFacebook: article.translatedFacebook,
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ Facebook posting failed:", err);
    return new NextResponse("Server Error", { status: 500 });
  }
}
