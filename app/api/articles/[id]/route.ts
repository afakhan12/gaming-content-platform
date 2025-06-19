import { NextRequest, NextResponse } from "next/server";
import db from "@/db/db";

// ✅ Correct context param for dynamic routes in Next.js App Router
type Params = {
  params: {
    id: string;
  };
};

// GET handler
export async function GET(_req: NextRequest, { params }: Params) {
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

// PUT handler
export async function PUT(req: NextRequest, { params }: Params) {
  const id = Number(params.id);
  const body = await req.json();

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
