import { useState, useEffect } from 'react';
import { Mail, Calendar, Trash2 } from 'lucide-react';

interface Subscriber {
  id: number;
  email: string;
  created_at: string;
}

export function AdminSubscribers() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      const res = await fetch('/api/subscribers');
      const data = await res.json();
      setSubscribers(data);
    } catch (error) {
      console.error('Failed to fetch subscribers', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteSubscriber = async (id: number) => {
    if (!confirm('Are you sure you want to remove this subscriber?')) return;
    try {
      await fetch(`/api/subscribers/${id}`, { method: 'DELETE' });
      fetchSubscribers();
    } catch (error) {
      console.error('Failed to delete subscriber', error);
    }
  };

  if (loading) return <div className="p-8 text-center text-neutral-500">Loading subscribers...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Newsletter Subscribers</h1>
          <p className="text-neutral-500 mt-1">Manage your email marketing list</p>
        </div>
        <div className="bg-neutral-900 text-white px-4 py-2 rounded-full font-medium flex items-center gap-2">
          <Mail size={18} />
          <span>{subscribers.length} Subscribers</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200">
                <th className="p-4 font-semibold text-neutral-600">Email Address</th>
                <th className="p-4 font-semibold text-neutral-600">Subscribed Date</th>
                <th className="p-4 font-semibold text-neutral-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-neutral-500">
                    No subscribers yet.
                  </td>
                </tr>
              ) : (
                subscribers.map((subscriber) => (
                  <tr key={subscriber.id} className="border-b border-neutral-100 hover:bg-neutral-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500">
                          <Mail size={16} />
                        </div>
                        <span className="font-medium text-neutral-900">{subscriber.email}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-neutral-500">
                        <Calendar size={16} />
                        <span>{new Date(subscriber.created_at).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => deleteSubscriber(subscriber.id)}
                        className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                        title="Remove Subscriber"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
