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
I want you to rephrase articles as Facebook and Twitter posts in *Arabic*, making them easy to read and engaging.

Your task:
1. Read and understand each article in the provided JSON.
2. Extract the key points and rewrite them in Arabic.
3. The Arabic content must be well-written, not a direct translation.
4. The Facebook post can be a bit longer and informative.
5. The Twitter post must be short, attention-grabbing, and under 280 characters.
6. Use a natural, reader-friendly tone, not too formal, not too slangy.
7. Do NOT include hashtags, links, or any extra explanation.

⚠ Respond ONLY with a *JSON array* in the following format (no extra text or explanation):

[
  {
    "id": the article ID,
    "facebook": "Arabic Facebook post here...",
    "twitter": "Arabic Twitter post here..."
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