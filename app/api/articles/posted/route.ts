import { NextResponse } from "next/server";
import db from "@/db/db";

export async function GET() {
  const translated = await db.article.findMany({
    where: {
      
      postedToFacebook: true,
      postedToX: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(translated);
}
