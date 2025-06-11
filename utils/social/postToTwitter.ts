import fs from 'fs/promises';

export const postToTwitter = async ({
  text,
  imagePath,
  translatedX,
}: {
  text: string;
  imagePath: string;
  translatedX: string;
}) => {
  try {
    // Dynamically import TwitterApi to avoid circular dependencies
    const { TwitterApi } = await import('twitter-api-v2');

    const twitterClient = new TwitterApi({
      appKey: process.env.TWITTER_APP_KEY!,
      appSecret: process.env.TWITTER_APP_SECRET!,
      accessToken: process.env.TWITTER_ACCESS_TOKEN!,
      accessSecret: process.env.TWITTER_ACCESS_SECRET!,
    });

    const tweetText = `${text}\n\n${translatedX}`.slice(0, 280);
    const mediaBuffer = await fs.readFile(`public${imagePath}`);
    const mediaId = await twitterClient.v1.uploadMedia(mediaBuffer, {
      mimeType: 'image/jpeg',
    });

    const response = await twitterClient.v1.tweet(tweetText, {
      media_ids: [mediaId],
    });

    console.log('✅ Posted to X:', response.id_str);
    return { success: true, tweetId: response.id_str };
  } catch (error) {
    console.error('❌ Twitter post failed:', error);
    throw error;
  }
};