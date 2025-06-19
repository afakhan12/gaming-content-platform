import { NextResponse } from "next/server";
import db from "@/db/db";

export async function GET() {
  const archived = await db.article.findMany({
    where: { Interesting: false },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(archived);
} 