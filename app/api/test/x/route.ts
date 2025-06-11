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

    // Use v2 API
    const tweet = await client.v2.tweet(
      `✅ Twitter v2 API test - ${new Date().toLocaleString()}`
    );

    return NextResponse.json({
      success: true,
      tweetId: tweet.data.id,
      url: `https://twitter.com/i/status/${tweet.data.id}`
    });

  } catch (error: any) {
    console.error('Twitter API error:', error);
    return NextResponse.json(
      { 
        error: "Twitter post failed",
        details: error.data?.detail || error.message,
        code: error.code
      },
      { status: 500 }
    );
  }
}