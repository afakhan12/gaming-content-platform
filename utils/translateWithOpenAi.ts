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
2. If the article is written in a *personal or opinion-based style* (e.g. a review or experience), rewrite it in a *neutral, objective, and news-like tone*, suitable for a wider audience.
3. Extract the key points and rewrite them in Arabic.
4. The Arabic content must be well-written and *not a direct translation*.
5. Begin each post with a *strong hook* that fits the nature of the article (examples: "عاجل", "هام جداً", "خبر حصري", "لا يفوتك", etc.).
6. The *Facebook post* should be *longer*, with more context and storytelling. It should feel like a casual but informative post someone from the Gulf would write to their friends.
7. The *Twitter post* must be *short, catchy, and under 280 characters*, focusing on the most interesting or surprising part.
8. Add *fitting emojis* in both posts to enhance clarity, tone, and engagement (without overusing them).
9. *End both posts with a question* to encourage interaction.
10. Include *1–2 relevant Arabic hashtags* at the end of each post.
11. Use simple, clear language in a friendly Khaleeji-flavoured Arabic (Modern Standard Arabic with regional warmth). Avoid robotic or overly formal tone.
12. Do NOT include links or any extra explanation.

⚠ Respond ONLY with a *JSON array* in the following format (no extra text or explanation):

[
  {
    "id": the article ID,
    "facebook": "Hook + emojis... Longer Arabic Facebook post here with emojis, a question and hashtags...",
    "twitter": "Hook + emojis... Short Arabic Twitter post here with emojis, a question and hashtags..."
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