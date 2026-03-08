import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { DollarSign, ShoppingBag, AlertTriangle, TrendingUp } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

export function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [insights, setInsights] = useState<string>('');
  const [loadingInsights, setLoadingInsights] = useState(false);

  useEffect(() => {
    fetch('/api/analytics')
      .then(res => res.json())
      .then(setData);
  }, []);

  const getInsights = async () => {
    setLoadingInsights(true);
    try {
      const [productsRes, ordersRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/orders')
      ]);
      const products = await productsRes.json();
      const orders = await ordersRes.json();

      const prompt = `
        Analyze this business data and tell me what customers need most, what I should stock more of, and how I can improve to make more money.
        
        Products: ${JSON.stringify(products)}
        Recent Orders: ${JSON.stringify(orders.slice(0, 50))}
        
        Provide a concise, actionable business advice summary.
      `;

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
      });

      setInsights(response.text || 'No insights generated.');
    } catch (e) {
      console.error(e);
      setInsights('Failed to generate insights.');
    }
    setLoadingInsights(false);
  };

  if (!data) return <div className="p-8 text-center text-neutral-500">Loading dashboard...</div>;
  if (data.error) return <div className="p-8 text-center text-red-500">Error: {data.error}</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Dashboard</h1>
        <p className="text-neutral-500 mt-1">Overview of your business performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total Revenue" 
          value={`$${(data.totalSales || 0).toFixed(2)}`} 
          icon={<DollarSign className="text-emerald-500" />} 
          trend="+12.5%" 
        />
        <StatCard 
          title="Total Orders" 
          value={data.orderCount} 
          icon={<ShoppingBag className="text-blue-500" />} 
          trend="+5.2%" 
        />
        <StatCard 
          title="Low Stock Items" 
          value={data.lowStock} 
          icon={<AlertTriangle className="text-orange-500" />} 
          trend="-2" 
          trendDown 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
          <h3 className="text-lg font-bold text-neutral-900 mb-6">Sales Last 7 Days</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.salesByDay}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#737373', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#737373', fontSize: 12 }} dx={-10} tickFormatter={(val) => `$${val}`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Sales']}
                />
                <Line type="monotone" dataKey="sales" stroke="#171717" strokeWidth={3} dot={{ r: 4, fill: '#171717' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <TrendingUp size={20} className="text-indigo-500" />
              AI Business Insights
            </h3>
            <button 
              onClick={getInsights}
              disabled={loadingInsights}
              className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors disabled:opacity-50"
            >
              {loadingInsights ? 'Analyzing...' : 'Generate Insights'}
            </button>
          </div>
          
          <div className="flex-1 bg-neutral-50 rounded-xl p-5 border border-neutral-100 overflow-y-auto">
            {insights ? (
              <div className="prose prose-sm max-w-none text-neutral-700 whitespace-pre-wrap">
                {insights}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-neutral-400 text-center">
                <TrendingUp size={48} className="mb-4 opacity-20" />
                <p>Click "Generate Insights" to let Gemini analyze your<br/>sales data and suggest improvements.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend, trendDown = false }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-neutral-500 mb-1">{title}</p>
        <h4 className="text-3xl font-bold text-neutral-900">{value}</h4>
        <div className={`mt-2 text-sm font-medium flex items-center gap-1 ${trendDown ? 'text-red-500' : 'text-emerald-500'}`}>
          {trend} <span className="text-neutral-400 font-normal ml-1">vs last week</span>
        </div>
      </div>
      <div className="p-3 bg-neutral-50 rounded-xl">
        {icon}
      </div>
    </div>
  );
}
