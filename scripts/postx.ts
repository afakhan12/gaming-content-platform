// app/api/test-twitter/route.ts
import { NextResponse } from 'next/server';
import { TwitterApi } from 'twitter-api-v2';

export async function POST() {
  try {
    const client = new TwitterApi({
      appKey: process.env.TWITTER_APP_KEY!,
      appSecret: process.env.TWITTER_APP_SECRET!,
      accessToken: process.env.TWITTER_ACCESS_TOKEN!,
      accessSecret: process.env.TWITTER_ACCESS_SECRET!,
    });

    const testTweet = await client.v1.tweet("✅ Twitter credentials test - successful connection!");
    return NextResponse.json({ success: true, tweetId: testTweet.id_str });
  } catch (error: any) {
    return NextResponse.json({ 
      error: "Credential test failed", 
      details: error.data?.errors || error.message 
    }, { status: 500 });
  }
}