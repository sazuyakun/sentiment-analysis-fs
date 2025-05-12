'use client'

import { useState } from "react"
import axios from 'axios'
import { SentimentType } from "@/types/sentiment";

export default function Home() {
  const [text, setText] = useState('');                               // Form input text
  const [result, setResult] = useState<SentimentType | null>(null);   // Result object from the api
  const [loading, setLoading] = useState(false);                      // Loading boolean
  const [error, setError] = useState<string | null>(null);            // Error message


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/analyze', { text })
      setResult(response.data)
    } catch (err) {
      setError('An error occured while analyzing the text.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-6">Sentiment Analysis</h1>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md"
      >
        <textarea
          className="w-full p-4 border rounded-lg mb-4"
          rows={5}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text to analyze..."
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? 'Analyzing...' : 'Analyze'}
        </button>
      </form>
      {result && (
        <div className="mt-6 p-4 bg-white rounded-lg shadow w-full max-w-md">
          <h2 className="text-xl font-semibold">Result</h2>
          <p>Sentiment: <span>{result.sentiment}</span></p>
          <p>Confidence: {(result.confidence * 100).toFixed(2)}%</p>
          <p>Text: {result.text}</p>
        </div>
      )}
      {error && <p className="mt-4 text-red-500">{error}</p>}
    </div>
  )
}
