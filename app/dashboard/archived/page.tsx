"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";

type Article = {
  id: number;
  title: string;
  localImagePath?: string;
  createdAt: string;
  originalText: string;
};

export default function ArchivedPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/articles/archived")
      .then(res => res.json())
      .then(setArticles);
  }, []);

  const unarchiveArticle = async (id: number) => {
    setLoadingId(id);
    await axios.put(`/api/articles/${id}`, { Interesting: true });
    setArticles(prev => prev.filter(a => a.id !== id));
    setLoadingId(null);
  };

  const deleteArticle = async (id: number) => {
    setDeleteId(id);
    await axios.delete(`/api/articles/${id}`);
    setArticles(prev => prev.filter(a => a.id !== id));
    setDeleteId(null);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">🗄️ Archived Articles</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
        {articles.map(article => (
          <div key={article.id} className="border p-4 rounded shadow bg-white space-y-4">
            <h2 className="text-xl font-semibold">{article.title}</h2>
            <p className="text-sm text-gray-500">{new Date(article.createdAt).toLocaleString()}</p>
            {article.localImagePath && (
              <Image
                src={`/api${article.localImagePath}`}
                alt="Article"
                className="mt-2 max-w-xs border rounded"
                width={400}
                height={225}
                loading="lazy"
                style={{ width: "100%", height: "auto" }}
                unoptimized={true}
                quality={30}
              />
            )}
            <div className="mt-2">
              <h3 className="font-medium mb-2">Content:</h3>
              <div className="text-sm text-gray-700 whitespace-pre-wrap">
                {article.originalText}
              </div>
            </div>
            <button
              onClick={() => unarchiveArticle(article.id)}
              disabled={loadingId === article.id}
              className="bg-green-600 text-white px-4 py-2 rounded transition-colors duration-200 hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed mt-2"
            >
              {loadingId === article.id ? "Unarchiving..." : "Unarchive"}
            </button>
            <button
              onClick={() => deleteArticle(article.id)}
              disabled={deleteId === article.id}
              className="bg-gray-800 text-white px-4 py-2 rounded transition-colors duration-200 hover:bg-black disabled:bg-gray-400 disabled:cursor-not-allowed mt-2"
            >
              {deleteId === article.id ? "Deleting..." : "Delete"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 