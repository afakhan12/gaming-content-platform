import fs from 'fs/promises';
import path from 'path';

export const postToTwitter = async ({
  text,
  imagePath, // Re-added imagePath parameter
  translatedX,
}: {
  text: string;
  imagePath?: string; // Made optional again for flexibility
  translatedX: string;
}) => {
  try {
    // Dynamically import TwitterApi to avoid circular dependencies and ensure it's loaded only when needed
    const { TwitterApi } = await import('twitter-api-v2');

    const twitterClient = new TwitterApi({
      appKey: process.env.TWITTER_APP_KEY!,
      appSecret: process.env.TWITTER_APP_SECRET!,
      accessToken: process.env.TWITTER_ACCESS_TOKEN!,
      accessSecret: process.env.TWITTER_ACCESS_SECRET!,
    });

    // Concatenate text and translatedX, ensuring it fits within 280 characters.
    const tweetText = `${text}\n\n${translatedX}`.slice(0, 280);

    let mediaId: string | undefined; // Initialize mediaId as undefined

    // --- Image upload logic re-added ---
    if (imagePath) {
      // Construct the absolute path to the image file.
      const absoluteImagePath = path.join(process.cwd(), 'public', imagePath);

      console.log(`Attempting to read image from: ${absoluteImagePath}`);

      try {
        const mediaBuffer = await fs.readFile(absoluteImagePath);

        // Dynamically determine MIME type based on file extension
        let mimeType: string | undefined;
        const fileExtension = path.extname(imagePath).toLowerCase();
        switch (fileExtension) {
          case '.jpg':
          case '.jpeg':
            mimeType = 'image/jpeg';
            break;
          case '.png':
            mimeType = 'image/png';
            break;
          case '.gif':
            mimeType = 'image/gif';
            break;
          default:
            console.warn(`Unsupported image file extension: ${fileExtension}. Defaulting to image/jpeg.`);
            mimeType = 'image/jpeg'; // Fallback
        }

        console.log(`Uploading media with detected MIME type: ${mimeType}`);
        // For v2 tweets, you still use v1.1 endpoint for media upload
        mediaId = await twitterClient.v1.uploadMedia(mediaBuffer, {
          mimeType: mimeType,
        });
        console.log(`Media uploaded with ID: ${mediaId}`);
      } catch (fileError) {
        console.error(`❌ Failed to read or upload media from ${absoluteImagePath}:`, fileError);
        mediaId = undefined; // Ensure no invalid mediaId is used if upload fails
      }
    }
    // --- End of image upload logic ---

    // Prepare tweet options for v2.tweet
    // For v2, media_ids are passed inside a 'media' object
    // Prepare tweet options for v2.tweet
    // For v2, media_ids are passed inside a 'media' object as a tuple
    const tweetOptions: { media?: { media_ids: [string] | [string, string] | [string, string, string] | [string, string, string, string] } } = {};
    if (mediaId) {
      tweetOptions.media = { media_ids: [mediaId] as [string] };
    }

    // Using twitterClient.v2.tweet as requested
    const response = await twitterClient.v2.tweet(tweetText, tweetOptions);

    // Note: response structure for v2.tweet is different. It's usually { data: { id: '...', text: '...' } }
    console.log('✅ Posted to X successfully! Tweet ID:', response.data.id);
    console.log('Full tweet response:', response); // Log full response for debugging
    return { success: true, tweetId: response.data.id }; // Access the id via response.data.id
  } catch (error: any) { // Explicitly type error as 'any' for easier access to properties
    console.error('❌ Twitter post failed:');

    // Attempt to extract more specific error details from twitter-api-v2
    if (error.code) { // HTTP status code
      console.error(`HTTP Status Code: ${error.code}`);
    }
    // For v2 API errors, the structure might be in error.data.errors or error.data.detail
    if (error.data?.errors) { // Specific errors from Twitter API v2
      console.error('Twitter API Errors (v2):', error.data.errors);
      error.data.errors.forEach((err: any) => {
        console.error(`  Code: ${err.code}, Message: ${err.message}, Detail: ${err.detail || 'N/A'}`);
      });
    } else if (error.data?.detail) {
      console.error('Twitter API Error Detail:', error.data.detail);
    } else if (error.message) {
      console.error('Error Message:', error.message);
    } else {
      console.error('Unknown Error Object:', error);
    }
    throw error; // Re-throw the error so it can be handled by the calling function
  }
};
