import { TwitterApi } from 'twitter-api-v2';
import fs from 'fs';

const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY!,
  appSecret: process.env.TWITTER_API_SECRET!,
  accessToken: process.env.TWITTER_ACCESS_TOKEN!,
  accessSecret: process.env.TWITTER_ACCESS_SECRET!,
});

export async function postToTwitter({ text, imagePath, translatedX }: { text: string; imagePath: string; translatedX: string }) {
  const client = twitterClient.readWrite;

  // Upload media from local path
  const mediaId = await client.v1.uploadMedia(fs.readFileSync(imagePath), { mimeType: 'image/jpeg' });

  // Post tweet with image and Arabic translation
  const tweet = await client.v2.tweet({
    text: `${text}\n\n${translatedX}`,
    media: { media_ids: [mediaId] },
  });

  console.log("✅ Tweeted:", tweet.data?.id);
}
