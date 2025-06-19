import db from "@/db/db";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function extractJsonArray(text: string): string | null {
  const match = text.match(/\[\s*{[\s\S]*?}\s*\]/);
  return match ? match[0] : null;
}

export async function translateWithOpenAI() {
  const articles = await db.article.findMany({
    where: {
      isBucketed: true,
      translatedFacebook: null,
      translatedX: null,
    },
    take: 10,
  });

  if (articles.length === 0) {
    console.log("📭 No bucketed articles to translate.");
    return;
  }

  const inputPayload = articles.map((a) => ({
    id: a.id,
    title: a.title,
    originalText: JSON.parse(a.originalText || "[]"),
    author: a.author || "Unknown",
  }));
  console.log(`📦 Preparing to translate ${inputPayload.length} articles...`);

  const prompt = `
I want you to rephrase articles as Facebook and Twitter posts in *Arabic*, using a Gulf (Khaleeji) tone that feels natural, friendly, and engaging.

Your task:
1. Read and understand each article in the provided JSON.
2. Extract the key points and rewrite them in Arabic.
3. The Arabic content must be well-written and *not a direct translation*.
4. The *Facebook post should be longer, with more context and storytelling. Use a tone that feels casual and informative — as if you're talking to friends from the Gulf region. End the post with a **question to encourage interaction, and include **1–2 relevant Arabic hashtags* only.
5. The *Twitter post must be short, catchy, and under 280 characters* — with a clear takeaway or interesting twist. End with a *question* and *1–2 Arabic hashtags* only.
6. Use simple, clear language in a friendly Gulf Arabic tone (Fusha with Khaleeji flavour). Avoid formal or robotic phrasing.
7. Do NOT include links or any extra explanation.

⚠ Respond ONLY with a *JSON array* in the following format (no extra text or explanation):

[
  {
    "id": the article ID,
    "facebook": "Longer Arabic Facebook post here with a question and hashtags...",
    "twitter": "Short Arabic Twitter post here with a question and hashtags..."
  }
]
Here is the JSON:
${JSON.stringify(inputPayload, null, 2)}
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const rawContent = completion.choices[0].message?.content || "";
    const jsonPart = extractJsonArray(rawContent);
    if (!jsonPart) {
      console.error("❌ No valid JSON found. GPT response:\n", rawContent);
      return;
    }

    const parsed = JSON.parse(jsonPart);
    if (!Array.isArray(parsed)) throw new Error("❌ GPT response is not a valid array");

    for (const item of parsed) {
      if (!item.id || !item.facebook || !item.twitter) continue;

      await db.article.update({
        where: { id: item.id },
        data: {
          translatedFacebook: item.facebook,
          translatedX: item.twitter,
          isBucketed: false,
          Interesting: false,
          updatedAt: new Date(),
        },
      });

      console.log(`✅ Translated & cleared bucket for article #${item.id}`);
    }

    console.log("🎉 Translations completed and articles updated.");
  } catch (err) {
    console.error("❌ OpenAI translation failed:", err);
  }
}
translateWithOpenAI();