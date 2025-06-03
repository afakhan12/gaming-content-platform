export async function postToFacebook(message: string) {
  const pageId = process.env.FB_PAGE_ID;
  const token = process.env.FB_PAGE_ACCESS_TOKEN;

  const res = await fetch(`https://graph.facebook.com/${pageId}/feed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      access_token: token,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Facebook Post Failed: ${JSON.stringify(data)}`);
  }

  console.log("✅ Posted to Facebook:", data.id);
}
