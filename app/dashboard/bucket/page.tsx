
'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import axios from 'axios'

export default function BucketPage() {
  const [articles, setArticles] = useState<any[]>([])

  useEffect(() => {
    axios.get('/api/articles')
      .then(res => setArticles(res.data.filter((a: any) => a.isBucketed)))
  }, [])
  const [translating, setTranslating] = useState(false);
  const [message, setMessage] = useState("");

  const handleTranslate = async () => {
    setTranslating(true);
    setMessage("");

    try {
      const res = await axios.post("/api/translate-bucket");
      setMessage(res.data.message || "Translation started.");
    } catch (err) {
      setMessage("Failed to start translation.");
      console.error(err);
    } finally {
      setTranslating(false);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">Bucket Queue</h1>
      <button
        onClick={handleTranslate}
        disabled={translating}
        className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
      >
        {translating ? "Translating..." : "Translate Bucketed Articles"}
      </button>

      {message && <p className="text-sm mt-2 text-gray-700">{message}</p>}
      {articles.map(article => (
        <div key={article.id} className="border rounded shadow-sm bg-white p-4 space-y-4">
          <div className="text-sm text-gray-500">🆔 Article ID: {article.id}</div>
          <h2 className="text-lg font-semibold">{article.title}</h2>
          {article.localImagePath && (
            <Image src={article.localImagePath} alt={article.title} width={600} height={300} />
          )}
          <h2 className="text-xl font-semibold mt-2">{article.title}</h2>
          <p className="text-gray-600">{article.author} – {new Date(article.pubDate).toLocaleString()}</p>
          <div>
            <p className="font-semibold text-gray-600">📄 Original Content</p>
            <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-2 rounded">
              {(() => {
                try {
                  const parsed = JSON.parse(article.originalText);
                  return Array.isArray(parsed)
                    ? parsed.join("\n\n")
                    : parsed;
                } catch {
                  return article.originalText;
                }
              })()}
            </pre>
          </div>
        </div>
      ))}
    </div>
  )
}

          
