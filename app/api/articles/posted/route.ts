import { NextRequest, NextResponse } from "next/server";
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

export async function POST(req: NextRequest) {
  const { id, platform } = await req.json();

  if (!id || !platform) {
    return new NextResponse("Missing id or platform", { status: 400 });
  }

  const updateData: any = {};
  if (platform === "facebook") updateData.postedToFacebook = true;
  if (platform === "x") updateData.postedToX = true;

  await db.article.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json({ success: true });
}