export async function postToFacebook({ title, imageUrl, translatedFacebook }: { title: string; imageUrl: string; translatedFacebook: string }) {
  const pageId = process.env.FB_PAGE_ID;
  const token = process.env.FB_PAGE_ACCESS_TOKEN;

  const res = await fetch(`https://graph.facebook.com/${pageId}/photos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: imageUrl, // full URL to image (e.g. https://yourdomain.com/images/xyz.jpg)
      caption: `${translatedFacebook}`,
      access_token: token,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Facebook Image Post Failed: ${JSON.stringify(data)}`);
  }

  console.log("✅ Posted to Facebook with image:", data.id);
}
