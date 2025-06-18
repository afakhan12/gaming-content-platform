import { NextResponse } from "next/server";
import { translateWithOpenAI } from "../../../utils/translateWithOpenAi";

export async function POST() {
  try {
    await translateWithOpenAI();
    return NextResponse.json({ message: "Translation started." });
  } catch (err) {
    console.error("❌ Failed to trigger translation:", err);
    return new NextResponse("Server error", { status: 500 });
  }
}
