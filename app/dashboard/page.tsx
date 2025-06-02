"use client";

import { useEffect, useState } from "react";

type Article = {
  id: number;
  title: string;
  sourceUrl: string;
  localImagePath?: string;
  createdAt: string;
  originalText: string; // Added content field
};

export default function DashboardPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/articles")
      .then((res) => res.json())
      .then((data) => {
        setArticles(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">🧠 Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
        {articles.map((article) => (
          <div key={article.id} className="border p-4 rounded shadow">
            <h2 className="text-xl font-semibold">{article.title}</h2>
            <p className="text-sm text-gray-500">{new Date(article.createdAt).toLocaleString()}</p>
            <p className="text-sm break-all text-blue-600 mt-1">{article.sourceUrl}</p>
            {article.localImagePath && (
              <img
                src={article.localImagePath}
                alt="Article"
                className="mt-2 max-w-xs border rounded"
              />
            )}
            <div className="mt-4">
              <h3 className="font-medium mb-2">Content:</h3>
              <div className="text-sm text-gray-700 whitespace-pre-wrap">
                {article.originalText}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
