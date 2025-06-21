"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";
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
  const [loadingId, setLoadingId] = useState<{ id: number, platform: string } | null>(null);
  const [archiveId, setArchiveId] = useState<number | null>(null);
  const [editState, setEditState] = useState<{ id: number, platform: 'x' | 'facebook' } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/articles/translated")
      .then(res => res.json())
      .then(data => setArticles(data.filter((a: Article) => !(a.postedToFacebook && a.postedToX))));
  }, []);

  const markPosted = async (id: number, platform: "facebook" | "x") => {
    setLoadingId({ id, platform });
    const ok = await publishTo(platform, id); // 🔄 Triggers actual post to platform
    if (!ok) { setLoadingId(null); return; }
    await fetch(`/api/articles/posted`, {
      method: "POST",
      body: JSON.stringify({ id, platform }),
    });
    setArticles(prev =>
      prev.map(a =>
        a.id === id ? { ...a, [`postedTo${platform === "facebook" ? "Facebook" : "X"}`]: true } : a
      )
    );
    setLoadingId(null);
  };

  const archiveArticle = async (id: number) => {
    setArchiveId(id);
    await axios.put(`/api/articles/${id}`, { Interesting: false });
    setArticles(prev => prev.filter(a => a.id !== id));
    setArchiveId(null);
  };

  const deleteArticle = async (id: number) => {
    setDeleteId(id);
    await axios.delete(`/api/articles/${id}`);
    setArticles(prev => prev.filter(a => a.id !== id));
    setDeleteId(null);
  };

  const startEdit = (id: number, platform: 'x' | 'facebook', current: string) => {
    setEditState({ id, platform });
    setEditValue(current);
  };

  const sendEdit = async () => {
    if (!editState) return;
    setEditLoading(true);
    const field = editState.platform === 'x' ? 'translatedX' : 'translatedFacebook';
    await axios.put(`/api/articles/${editState.id}`, { [field]: editValue });
    setArticles(prev => prev.map(a =>
      a.id === editState.id ? { ...a, [field]: editValue } : a
    ));
    setEditLoading(false);
    setEditState(null);
    setEditValue("");
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">📚 Translated Articles</h1>
      {articles.map(article => (
        <div key={article.id} className="border rounded shadow-sm bg-white p-4 space-y-4">
          <div className="text-sm text-gray-500">🆔 Article ID: {article.id}</div>
          <h2 className="text-lg font-semibold">{article.title}</h2>

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

          <div className="flex gap-4 flex-wrap">
            <button
              onClick={() => markPosted(article.id, "facebook")}
              disabled={!!article.postedToFacebook || !!(loadingId && loadingId.id === article.id && loadingId.platform === "facebook")}
              className="px-3 py-1 bg-blue-600 text-white rounded transition-colors duration-200 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              {(loadingId && loadingId.id === article.id && loadingId.platform === "facebook") ? "Posting..." : (article.postedToFacebook ? "✅ Posted to Facebook" : "Post to Facebook")}
            </button>
            <button
              onClick={() => markPosted(article.id, "x")}
              disabled={!!article.postedToX || !!(loadingId && loadingId.id === article.id && loadingId.platform === "x")}
              className="px-3 py-1 bg-black text-white rounded transition-colors duration-200 hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {(loadingId && loadingId.id === article.id && loadingId.platform === "x") ? "Posting..." : (article.postedToX ? "✅ Posted to X" : "Post to X")}
            </button>
            <button
              onClick={() => archiveArticle(article.id)}
              disabled={archiveId === article.id}
              className="px-3 py-1 bg-gray-600 text-white rounded transition-colors duration-200 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {archiveId === article.id ? "Archiving..." : "Archive"}
            </button>
            <button
              onClick={() => startEdit(article.id, 'x', article.translatedX)}
              className="px-3 py-1 bg-purple-600 text-white rounded transition-colors duration-200 hover:bg-purple-700"
            >
              Update X
            </button>
            <button
              onClick={() => startEdit(article.id, 'facebook', article.translatedFacebook)}
              className="px-3 py-1 bg-blue-900 text-white rounded transition-colors duration-200 hover:bg-blue-800"
            >
              Update Facebook
            </button>
            <button
              onClick={() => deleteArticle(article.id)}
              disabled={deleteId === article.id}
              className="px-3 py-1 bg-gray-800 text-white rounded transition-colors duration-200 hover:bg-black disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {deleteId === article.id ? "Deleting..." : "Delete"}
            </button>
          </div>
          {editState && editState.id === article.id && (
            <div className="mt-4 flex flex-col gap-2">
              <textarea
                className="w-full border rounded p-2 text-sm"
                rows={3}
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                disabled={editLoading}
              />
              <div className="flex gap-2">
                <button
                  onClick={sendEdit}
                  disabled={editLoading || !editValue.trim()}
                  className="px-3 py-1 bg-green-600 text-white rounded transition-colors duration-200 hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed"
                >
                  {editLoading ? "Sending..." : "Send"}
                </button>
                <button
                  onClick={() => { setEditState(null); setEditValue(""); }}
                  disabled={editLoading}
                  className="px-3 py-1 bg-gray-400 text-white rounded transition-colors duration-200 hover:bg-gray-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
