// app/api/test-facebook/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  try {
    if (!process.env.FB_PAGE_ID || !process.env.FB_PAGE_ACCESS_TOKEN) {
      throw new Error("Missing Facebook environment variables");
    }

    const url = `https://graph.facebook.com/${process.env.FB_PAGE_ID}/feed`;
    
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "✅ Test post from API route - " + new Date().toISOString(),
        access_token: process.env.FB_PAGE_ACCESS_TOKEN,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(`Facebook API error: ${JSON.stringify(errorData)}`);
    }

    const data = await res.json();
    console.log("Facebook post successful:", data);
    return NextResponse.json(data);
    
  } catch (error: any) {
    console.error("Facebook posting failed:", error.message);
    return NextResponse.json(
      { error: error.message || "Failed to post to Facebook" },
      { status: 500 }
    );
  }
}