import { NextResponse } from "next/server";
import db from "@/db/db";

export async function GET() {
  const translated = await db.article.findMany({
    where: {
      translatedFacebook: { not: null },
      translatedX: { not: null },
      postedToFacebook: false,
      postedToX: false,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(translated);
}
