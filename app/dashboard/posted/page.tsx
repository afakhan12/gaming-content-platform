"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";

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

export default function PostedDashboard() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/articles/posted")
      .then(res => res.json())
      .then(setArticles);
  }, []);

  const archiveArticle = async (id: number) => {
    setLoadingId(id);
    await axios.put(`/api/articles/${id}`, { Interesting: false });
    setArticles(prev => prev.filter(a => a.id !== id));
    setLoadingId(null);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">📤 Posted Articles</h1>
      {articles.map(article => (
        <div key={article.id} className="border rounded shadow-sm bg-white p-4 space-y-4">
          <div className="text-sm text-gray-500">🆔 Article ID: {article.id}</div>
          <h2 className="text-lg font-semibold">{article.title}</h2>

          {article.localImagePath && (
            <Image
              src={article.localImagePath}
              alt="Article"
              width={600}
              height={400}
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
              onClick={() => archiveArticle(article.id)}
              disabled={!!(loadingId === article.id)}
              className="px-3 py-1 bg-gray-600 text-white rounded transition-colors duration-200 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loadingId === article.id ? "Archiving..." : "Archive"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
