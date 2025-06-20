import axios from "axios";
import fs from "fs";
import path from "path";
import { XMLParser } from "fast-xml-parser";
import * as cheerio from "cheerio";
import db from "../db/db";

const FEED_URLS = [
  "https://feeds.ign.com/ign/games-all",
  "https://www.gamespot.com/feeds/news",
  "https://www.polygon.com/rss/index.xml",
  "https://www.eurogamer.net/?format=rss",
  "https://kotaku.com/rss",
];

const IMAGE_DIR = path.join(process.cwd(), "tmp", "images");
if (!fs.existsSync(IMAGE_DIR)) fs.mkdirSync(IMAGE_DIR, { recursive: true });

async function downloadImage(url: string, id: string): Promise<string | null> {
  try {
    const filePath = path.join(IMAGE_DIR, `${id}-article.jpg`);
    const writer = fs.createWriteStream(filePath);
    const response = await axios.get(url, { responseType: "stream" });
    response.data.pipe(writer);
    await new Promise<void>((resolve, reject) => {
      writer.on("finish", () => resolve());
      writer.on("error", reject);
    });

    return `/images/${id}-article.jpg`;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(`❌ Image download failed for ${id}:`, err.message);
    } else {
      console.error(`❌ Image download failed for ${id}: Unknown error`);
    }
    return null;
  }
}

function normalizeTitle(raw: any): string {
  if (typeof raw === "string") return raw;
  if (typeof raw === "object" && raw["#text"]) return raw["#text"];
  return "Untitled";
}

function normalizeAuthor(raw: any): string {
  if (typeof raw === "string") return raw;
  if (Array.isArray(raw)) return raw.join(", ");
  if (typeof raw === "object" && raw.name) return raw.name;
  if (typeof raw === "object" && raw["#text"]) return raw["#text"];
  return "Unknown";
}

interface Article {
  id: number;
  title: string;
  originalText: string;
  translatedX: string;
  translatedFacebook: string;
  sourceUrl: string;
  imageUrl: string;
  pubDate: string;
  localImagePath: string;
  author: string;
  createdAt: Date;
  isBucketed: boolean;
  Interesting: boolean;
}

export async function fetchAndSaveArticles(): Promise<Article[]> {
  const insertedArticles = [];
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });

  for (const FEED_URL of FEED_URLS) {
    try {
      const res = await axios.get(FEED_URL);
      const json = parser.parse(res.data);
      const items = json.rss?.channel?.item || json.feed?.entry || [];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const link = item.link?.["@_href"] || item.link || item.id;

        const exists = await db.article.findFirst({ where: { sourceUrl: link } });
        if (exists) continue;

        const contentHtml = item["content:encoded"] || item["content"] || item["description"] || "";
        const $ = cheerio.load(contentHtml);

        const paragraphs: string[] = [];
        $("p").each((_, el) => {
          const text = $(el).text().trim();
          if (text && text.toLowerCase() !== "read more...") paragraphs.push(text);
        });

        const imageUrl =
          item["media:thumbnail"]?.["@_url"] ||
          item["media:content"]?.["@_url"] ||
          $("img").first().attr("src") ||
          null;

        const id = `art-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
        const localImagePath = imageUrl ? await downloadImage(imageUrl, id) : null;
        const title = normalizeTitle(item.title);
        const author = normalizeAuthor(item["dc:creator"] || item.author);

        const article = await db.article.create({
          data: {
            sourceUrl: link,
            title: title || "Untitled",
            originalText: JSON.stringify(paragraphs),
            imageUrl,
            localImagePath,
            author: author || "Unknown",
            pubDate: item.pubDate || item.updated || new Date().toISOString(),
            createdAt: new Date(),
            translatedFacebook: null,
            translatedX: null,
            isBucketed: false,
            Interesting: true,
          },
        });

        insertedArticles.push(article);
        console.log(`✅ Saved: ${title}`);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(`❌ Failed to process feed: ${FEED_URL}\n${err.message}`);
      } else {
        console.error(`❌ Failed to process feed: ${FEED_URL}\nUnknown error occurred`);
      }
    }
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Get articles that will be deleted (only untranslated ones)
  const articlesToDelete = await db.article.findMany({
    where: {
      createdAt: {
        lt: today,
      },
      AND: [
        { translatedX: null },
        { translatedFacebook: null }
      ]
    },
    select: {
      localImagePath: true,
    },
  });

  // Delete associated images
  for (const article of articlesToDelete) {
    if (article.localImagePath) {
      const imagePath = path.join(process.cwd(), 'tmp', article.localImagePath);
      try {
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
          console.log(`🗑️ Deleted image: ${article.localImagePath}`);
        }
      } catch (err) {
        console.error(`❌ Failed to delete image ${article.localImagePath}:`, err);
      }
    }
  }

  // Delete only untranslated articles
  await db.article.deleteMany({
    where: {
      createdAt: {
        lt: today,
      },
      AND: [
        { translatedX: null },
        { translatedFacebook: null }
      ]
    },
  });
  console.log(`🗑️ Deleted untranslated articles older than today: ${insertedArticles.length}`);
  return insertedArticles.map((article) => ({
    id: article.id,
    title: article.title,
    originalText: article.originalText,
    translatedX: article.translatedX ?? "",
    translatedFacebook: article.translatedFacebook ?? "",
    sourceUrl: article.sourceUrl,
    imageUrl: article.imageUrl ?? "",
    localImagePath: article.localImagePath ?? "",
    author: article.author ?? "",
    pubDate: article.pubDate ?? "",
    createdAt: article.createdAt,
    isBucketed: article.isBucketed,
    Interesting: article.Interesting,
  }));
}
