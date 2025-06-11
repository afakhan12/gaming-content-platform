"use client";

import { useEffect, useState } from "react";
// Helper to POST to publish endpoints
async function publishTo(platform: "facebook" | "x", id: number) {
  const res = await fetch(`/api/post-to-${platform}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  if (!res.ok) {
    const err = await res.text();
    alert(`❌ Failed to post to ${platform.toUpperCase()}:\n${err}`);
    return false;
  }
  return true;
}

type Article = {
  id: number;
  title: string;
  translatedFacebook: string;
  translatedX: string;
  postedToFacebook: boolean;
  postedToX: boolean;
  localImagePath: string | null;
  originalText: string;
};

export default function TranslationsDashboard() {
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    fetch("/api/articles/translated")
      .then(res => res.json())
      .then(setArticles);
  }, []);

  const markPosted = async (id: number, platform: "facebook" | "x") => {
     const ok = await publishTo(platform, id); // 🔄 Triggers actual post to platform
    if (!ok) return;
    await fetch(`/api/articles/posted`, {
      method: "POST",
      body: JSON.stringify({ id, platform }),
    });

    setArticles(prev =>
      prev.map(a =>
        a.id === id ? { ...a, [`postedTo${platform === "facebook" ? "Facebook" : "X"}`]: true } : a
      )
    );
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">📚 Translated Articles</h1>
      {articles.map(article => (
        <div key={article.id} className="border rounded shadow-sm bg-white p-4 space-y-4">
          <div className="text-sm text-gray-500">🆔 Article ID: {article.id}</div>
          <h2 className="text-lg font-semibold">{article.title}</h2>

          {article.localImagePath && (
            <img
              src={article.localImagePath}
              alt="Article"
              className="w-full max-w-md h-auto rounded shadow-md"
            />
          )}

          <div>
            <p className="font-semibold">📘 Facebook (Arabic)</p>
            <p className="text-right font-arabic text-gray-800">{article.translatedFacebook}</p>
          </div>

          <div>
            <p className="font-semibold">🐦 X (Arabic)</p>
            <p className="text-right font-arabic text-gray-800">{article.translatedX}</p>
          </div>

          <div>
            <p className="font-semibold text-gray-600">📄 Original Content</p>
            <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-2 rounded">
              {JSON.parse(article.originalText).join("\n\n")}
            </pre>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => markPosted(article.id, "facebook")}
              disabled={article.postedToFacebook}
              className="px-3 py-1 bg-blue-600 text-white rounded disabled:bg-gray-400"
            >
              {article.postedToFacebook ? "✅ Posted to Facebook" : "Post to Facebook"}
            </button>

            <button
              onClick={() => markPosted(article.id, "x")}
              disabled={article.postedToX}
              className="px-3 py-1 bg-black text-white rounded disabled:bg-gray-400"
            >
              {article.postedToX ? "✅ Posted to X" : "Post to X"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
