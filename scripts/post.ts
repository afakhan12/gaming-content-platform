import fetch from "node-fetch";
import "dotenv/config";

const PAGE_ID = process.env.FB_PAGE_ID;
const PAGE_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN; // This needs to be the PAGE-SPECIFIC token

async function postToFacebook() {
  try {
    const res = await fetch(`https://graph.facebook.com/${PAGE_ID}/feed`, {
      method: "POST", // Correct for posting
      headers: { "Content-Type": "application/json" }, // Correct header
      body: JSON.stringify({
        message: "✅ Test post from Node.js script using Page token", // Correct parameter for text posts
        access_token: PAGE_TOKEN, // Correct way to pass the token
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(JSON.stringify(data)); // Good error handling
    }

    console.log("✅ Posted to Facebook:", data);
  } catch (err) {
    console.error("❌ Facebook post failed:", err);
  }
}

postToFacebook();