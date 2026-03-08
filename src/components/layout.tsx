import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router';
import { Store, BarChart3, Package, MessageSquare, Lightbulb, ShoppingBag, Mail, Lock } from 'lucide-react';

export function AdminLayout() {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const auth = localStorage.getItem('admin_auth');
    if (auth === 'true') setIsAuthenticated(true);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
      localStorage.setItem('admin_auth', 'true');
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Incorrect password. Try "admin123"');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_auth');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-neutral-200">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center">
              <Lock size={32} className="text-neutral-900" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center text-neutral-900 mb-2">Admin Access</h1>
          <p className="text-center text-neutral-500 mb-8">Enter password to access the dashboard</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="Password (admin123)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-neutral-900 focus:outline-none"
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}
            <button type="submit" className="w-full bg-neutral-900 text-white py-3 rounded-xl font-bold hover:bg-neutral-800 transition-colors">
              Login
            </button>
          </form>
          <div className="mt-8 text-center pt-6 border-t border-neutral-100">
            <Link to="/" className="text-sm text-neutral-500 hover:text-neutral-900 font-medium transition-colors">
              &larr; Return to Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <nav className="w-full md:w-64 bg-white border-r border-neutral-200 flex flex-col">
        <div className="p-6 border-b border-neutral-200">
          <h1 className="text-2xl font-black text-neutral-900 tracking-tighter">STOCKSMART</h1>
          <p className="text-sm text-neutral-500 mt-1 font-medium">Admin Portal</p>
        </div>

        <div className="flex-1 py-6 flex flex-col gap-1 px-3 overflow-y-auto">
          <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2 px-3">
            Management
          </div>
          <NavLink to="/admin" icon={<BarChart3 size={18} />} label="Dashboard" active={location.pathname === '/admin'} />
          <NavLink to="/admin/orders" icon={<ShoppingBag size={18} />} label="Orders" active={location.pathname === '/admin/orders'} />
          <NavLink to="/admin/inventory" icon={<Package size={18} />} label="Inventory" active={location.pathname === '/admin/inventory'} />
          <NavLink to="/admin/subscribers" icon={<Mail size={18} />} label="Subscribers" active={location.pathname === '/admin/subscribers'} />

          <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mt-8 mb-2 px-3">
            AI Tools
          </div>
          <NavLink to="/admin/chat" icon={<MessageSquare size={18} />} label="Business Advisor" active={location.pathname === '/admin/chat'} />
          <NavLink to="/admin/ideas" icon={<Lightbulb size={18} />} label="Growth Ideas" active={location.pathname === '/admin/ideas'} />
        </div>

        <div className="p-4 border-t border-neutral-200 space-y-2">
          <Link to="/" target="_blank" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-neutral-600 hover:bg-neutral-100 transition-colors w-full">
            <Store size={18} />
            View Storefront
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors w-full text-left">
            <Lock size={18} />
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-neutral-50/50">
        <Outlet />
      </main>
    </div>
  );
}

function NavLink({ to, icon, label, active }: { to: string; icon: React.ReactNode; label: string; active: boolean }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
        active 
          ? 'bg-neutral-900 text-white shadow-md' 
          : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}
