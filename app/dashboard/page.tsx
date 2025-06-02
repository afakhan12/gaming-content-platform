"use client";

import { useEffect, useState, useTransition  } from "react";
import Image from 'next/image'
import axios from 'axios'
import { refetchArticles } from "@/app/actions/refetch"
type Article = {
  id: number;
  title: string;
  sourceUrl: string;
  localImagePath?: string;
  createdAt: string;
  originalText: string; // Added content field
};

export default function DashboardPage() {
  const [articles, setArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const handleRefetch = () => {
    startTransition(async () => {
      await refetchArticles();
      window.location.reload(); // or re-fetch your articles state if you're using SWR
    });
  };


  useEffect(() => {
    axios.get('/api/articles')
      .then(res => 
      setArticles(res.data.filter((a: any) => a.Interesting)))
      .catch(err => console.error("Failed to fetch articles:", err))
      .finally(() => setLoading(false));
  }, [])

  const updateArticle = async (id: number, action: 'bucket' | 'ignore') => {
    await axios.put(`/api/articles/${id}`, {
      isBucketed: action === 'bucket',
      Interesting: action !== 'ignore'
    })
    setArticles(prev => prev.filter(a => a.id !== id))
  }

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">🧠 Admin Dashboard</h1>
       <button
          onClick={handleRefetch}
          disabled={isPending}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {isPending ? "Refetching..." : "Refetch Articles"}
        </button>
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
            <div className="mt-4 flex gap-4">
            <button onClick={() => updateArticle(article.id, 'bucket')} className="bg-green-600 text-white px-4 py-2 rounded">Add to Bucket</button>
            <button onClick={() => updateArticle(article.id, 'ignore')} className="bg-red-600 text-white px-4 py-2 rounded">Not Interesting</button>
          </div>
          </div>
        ))}
      </div>
    </div>
  );
}
