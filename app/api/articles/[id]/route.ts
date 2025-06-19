import { NextRequest, NextResponse } from "next/server";
import db from "@/db/db";

// ✅ Correct type definition for the second argument of route handlers
// This interface defines the *structure* of the second argument
interface RouteContext {
  params: {
    id: string;
  };
}

// GET handler
export async function GET(_req: NextRequest, context: RouteContext) {
  const id = Number(context.params.id); // Access id from context.params

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
export async function PUT(req: NextRequest, context: RouteContext) {
  const id = Number(context.params.id); // Access id from context.params
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