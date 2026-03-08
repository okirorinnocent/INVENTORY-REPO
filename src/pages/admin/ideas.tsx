import React, { useState } from 'react';
import { Lightbulb, Search, Loader2 } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

export function AdminIdeas() {
  const [query, setQuery] = useState('');
  const [ideas, setIdeas] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const generateIdeas = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const prompt = `
        I am an unemployed entrepreneur looking to make money. 
        Based on current trends and the following query: "${query || 'general business ideas'}", 
        give me 3 innovative business ideas that I can apply to my e-commerce/inventory app.
        Use Google Search to find recent trends and data to support these ideas.
      `;

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });

      setIdeas(response.text || 'No ideas generated.');
    } catch (error) {
      console.error(error);
      setIdeas('Failed to generate ideas. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Growth Ideas</h1>
        <p className="text-neutral-500 mt-1">Discover new ways to make money and expand your business</p>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-neutral-200 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
            <Lightbulb size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-900">What are you interested in?</h2>
            <p className="text-sm text-neutral-500">Enter a topic or leave blank for general ideas.</p>
          </div>
        </div>

        <form onSubmit={generateIdeas} className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
            <input 
              type="text" 
              placeholder="e.g., sustainable fashion, tech gadgets, home decor..." 
              className="w-full pl-12 pr-4 py-4 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-colors"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <button 
            type="submit"
            disabled={isLoading}
            className="px-8 py-4 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-amber-500/20"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Generate Ideas'}
          </button>
        </form>
      </div>

      {ideas && (
        <div className="bg-white p-8 rounded-2xl border border-neutral-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
            <span className="w-2 h-8 bg-amber-500 rounded-full inline-block"></span>
            Your Business Ideas
          </h3>
          <div className="prose prose-neutral max-w-none whitespace-pre-wrap">
            {ideas}
          </div>
        </div>
      )}
    </div>
  );
}
