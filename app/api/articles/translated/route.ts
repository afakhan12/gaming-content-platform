import { NextResponse } from "next/server";
import db from "@/db/db";

export async function GET() {
  const translated = await db.article.findMany({
    where: {
      translatedFacebook: { not: null },
      translatedX: { not: null },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(translated);
}
