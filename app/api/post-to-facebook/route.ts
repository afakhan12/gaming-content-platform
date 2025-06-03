// app/api/post-to-facebook/route.ts
import db from "@/db/db";
import { postToFacebook } from "@/utils/social/postToFacebook";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) return new NextResponse("Missing article ID", { status: 400 });
    const article = await db.article.findUnique({
      where: { id },
      select: {
        title: true,
        imageUrl: true,
        translatedFacebook: true,
      },
    });

    if (!article) {
      return new NextResponse("Article not found", { status: 404 });
    }

    if (!article.translatedFacebook) {
      return new NextResponse("Article not translated", { status: 400 });
    }

    await postToFacebook({
      title: article.title,
      imageUrl: article.imageUrl || "",
      translatedFacebook: article.translatedFacebook,
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ Facebook posting failed:", err);
    return new NextResponse("Server Error", { status: 500 });
  }
}
