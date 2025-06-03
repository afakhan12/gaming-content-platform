export async function postToTwitter(text: string) {
  const token = process.env.TWITTER_BEARER_TOKEN;

  const res = await fetch("https://api.twitter.com/2/tweets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Twitter Post Failed: ${JSON.stringify(data)}`);
  }

  console.log("✅ Posted to Twitter:", data.data?.id);
}
