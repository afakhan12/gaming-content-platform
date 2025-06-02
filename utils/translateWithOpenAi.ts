import db from "@/db/db";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Utility to extract the first valid JSON array block from GPT response
function extractJsonArray(text: string): string | null {
  const match = text.match(/\[\s*{[\s\S]*?}\s*\]/);
  return match ? match[0] : null;
}

export async function translateWithOpenAI() {
  const articles = await db.article.findMany({
    where: {
      translatedFacebook: null,
      translatedX: null,
    },
    take: 10,
  });

  if (articles.length === 0) {
    console.log("📭 No new articles to translate.");
    return;
  }

  const inputPayload = articles.map((a) => ({
    id: a.id,
    title: a.title,
    originalText: JSON.parse(a.originalText || "[]"),
    author: a.author || "Unknown",
  }));

  const prompt = `
I want you to choose top 5 articles relevant to the day (make sure they're fresh news) from the JSON below, which you feel are most likely to generate engagement on the page.

Then, rephrase them as Facebook and Twitter posts in **Arabic**, making them easy to read and engaging.

⚠️ Respond ONLY with a **JSON array** in the following format (no extra text or explanation):

[
  {
    "id": 1,
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
      console.error("❌ No valid JSON found. GPT response was:\n", rawContent);
      return;
    }

    const parsed = JSON.parse(jsonPart);

    if (!Array.isArray(parsed)) {
      throw new Error("❌ GPT response was not an array");
    }

    for (const item of parsed) {
      if (!item.id || !item.facebook || !item.twitter) continue;

      await db.article.update({
        where: { id: item.id },
        data: {
          translatedFacebook: item.facebook,
          translatedX: item.twitter,
        },
      });

      console.log(`✅ Updated article #${item.id} with translations.`);
    }

    console.log("🎉 All top articles translated and saved.");
  } catch (err) {
    console.error("❌ OpenAI translation failed:", err);
  }
}
