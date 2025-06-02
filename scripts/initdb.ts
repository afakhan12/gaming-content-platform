import db from "@/db/db";

async function initArticleDefaults() {
  const updated = await db.article.updateMany({
    data: {
      isBucketed: false,
      Interesting: true,
      updatedAt: new Date(),
    },
  });

  console.log(`✅ Updated ${updated.count} articles with defaults.`);
}

initArticleDefaults()
  .catch((e) => {
    console.error("❌ Failed to update articles:", e);
  })
  .finally(() => {
    process.exit();
  });
