import React, { useState, useEffect } from 'react';
import { Package, Search, ChevronDown, ChevronUp, Clock, CheckCircle2, Truck, XCircle } from 'lucide-react';

interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  name: string;
  image: string;
}

interface Order {
  id: number;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  status: string;
  created_at: string;
  items: OrderItem[];
}

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const res = await fetch('/api/orders');
    setOrders(await res.json());
  };

  const updateOrderStatus = async (id: number, status: string) => {
    await fetch(`/api/orders/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    fetchOrders();
  };

  const filteredOrders = orders.filter(o => 
    o.customer_name.toLowerCase().includes(search.toLowerCase()) || 
    o.customer_email.toLowerCase().includes(search.toLowerCase()) ||
    o.id.toString().includes(search)
  );

  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'pending': return 'bg-orange-100 text-orange-700';
      case 'processing': return 'bg-blue-100 text-blue-700';
      case 'shipped': return 'bg-indigo-100 text-indigo-700';
      case 'delivered': return 'bg-emerald-100 text-emerald-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-neutral-100 text-neutral-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status.toLowerCase()) {
      case 'pending': return <Clock size={14} className="mr-1" />;
      case 'processing': return <Package size={14} className="mr-1" />;
      case 'shipped': return <Truck size={14} className="mr-1" />;
      case 'delivered': return <CheckCircle2 size={14} className="mr-1" />;
      case 'cancelled': return <XCircle size={14} className="mr-1" />;
      default: return null;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Orders</h1>
          <p className="text-neutral-500 mt-1">Manage and fulfill customer orders</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
            <input 
              type="text" 
              placeholder="Search orders..." 
              className="pl-10 pr-4 py-2 bg-white border border-neutral-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-200">
              <th className="p-4 font-semibold text-neutral-500 text-sm uppercase tracking-wider">Order ID</th>
              <th className="p-4 font-semibold text-neutral-500 text-sm uppercase tracking-wider">Customer</th>
              <th className="p-4 font-semibold text-neutral-500 text-sm uppercase tracking-wider">Date</th>
              <th className="p-4 font-semibold text-neutral-500 text-sm uppercase tracking-wider">Total</th>
              <th className="p-4 font-semibold text-neutral-500 text-sm uppercase tracking-wider">Status</th>
              <th className="p-4 font-semibold text-neutral-500 text-sm uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(order => (
              <React.Fragment key={order.id}>
                <tr className={`border-b border-neutral-100 hover:bg-neutral-50/50 transition-colors ${expandedOrderId === order.id ? 'bg-neutral-50/50' : ''}`}>
                  <td className="p-4 font-medium text-neutral-900">#{order.id.toString().padStart(5, '0')}</td>
                  <td className="p-4">
                    <div className="font-bold text-neutral-900">{order.customer_name}</div>
                    <div className="text-sm text-neutral-500">{order.customer_email}</div>
                  </td>
                  <td className="p-4 text-neutral-600">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4 font-medium text-neutral-900">${order.total_amount.toFixed(2)}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <select 
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="text-sm border border-neutral-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <button 
                        onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                        className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                      >
                        {expandedOrderId === order.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                    </div>
                  </td>
                </tr>
                {expandedOrderId === order.id && (
                  <tr className="bg-neutral-50/50 border-b border-neutral-200">
                    <td colSpan={6} className="p-6">
                      <h4 className="text-sm font-bold text-neutral-900 uppercase tracking-wider mb-4">Order Items</h4>
                      <div className="space-y-4">
                        {order.items.map(item => (
                          <div key={item.id} className="flex items-center justify-between bg-white p-4 rounded-xl border border-neutral-100 shadow-sm">
                            <div className="flex items-center gap-4">
                              <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-neutral-100" referrerPolicy="no-referrer" />
                              <div>
                                <div className="font-bold text-neutral-900">{item.name}</div>
                                <div className="text-sm text-neutral-500">Qty: {item.quantity}</div>
                              </div>
                            </div>
                            <div className="font-medium text-neutral-900">
                              ${(item.price * item.quantity).toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan={6} className="p-12 text-center text-neutral-500">
                  <Package size={48} className="mx-auto mb-4 opacity-20" />
                  <p>No orders found.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
