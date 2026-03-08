import React from 'react';
import { Link, Outlet, useLocation } from 'react-router';
import { Store, BarChart3, Package, MessageSquare, Lightbulb, Mic, ShoppingBag, Mail } from 'lucide-react';

export function Layout() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <nav className="w-full md:w-64 bg-white border-r border-neutral-200 flex flex-col">
        <div className="p-6 border-b border-neutral-200">
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">StockSmart</h1>
          <p className="text-sm text-neutral-500 mt-1">E-Commerce & Inventory</p>
        </div>

        <div className="flex-1 py-4 flex flex-col gap-1 px-3">
          <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2 px-3">
            Customer View
          </div>
          <NavLink to="/" icon={<Store size={18} />} label="Storefront" active={location.pathname === '/'} />
          <NavLink to="/voice" icon={<Mic size={18} />} label="Voice Assistant" active={location.pathname === '/voice'} />

          <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mt-6 mb-2 px-3">
            Management
          </div>
          <NavLink to="/admin" icon={<BarChart3 size={18} />} label="Dashboard" active={location.pathname === '/admin'} />
          <NavLink to="/admin/orders" icon={<ShoppingBag size={18} />} label="Orders" active={location.pathname === '/admin/orders'} />
          <NavLink to="/admin/inventory" icon={<Package size={18} />} label="Inventory" active={location.pathname === '/admin/inventory'} />
          <NavLink to="/admin/subscribers" icon={<Mail size={18} />} label="Subscribers" active={location.pathname === '/admin/subscribers'} />
          
          <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mt-6 mb-2 px-3">
            AI Tools
          </div>
          <NavLink to="/admin/chat" icon={<MessageSquare size={18} />} label="Business Advisor" active={location.pathname === '/admin/chat'} />
          <NavLink to="/admin/ideas" icon={<Lightbulb size={18} />} label="Growth Ideas" active={location.pathname === '/admin/ideas'} />
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
      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
        active 
          ? 'bg-neutral-900 text-white' 
          : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
      }`}
    >
      {icon}
      <span className="font-medium text-sm">{label}</span>
    </Link>
  );
}
