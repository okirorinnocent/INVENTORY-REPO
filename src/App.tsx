import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router';
import { Storefront } from './pages/storefront';
import { AdminDashboard } from './pages/admin/dashboard';
import { AdminInventory } from './pages/admin/inventory';
import { AdminOrders } from './pages/admin/orders';
import { AdminChat } from './pages/admin/chat';
import { AdminIdeas } from './pages/admin/ideas';
import { AdminSubscribers } from './pages/admin/subscribers';
import { VoiceAssistant } from './pages/voice';
import { AdminLayout } from './components/layout';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Customer Routes */}
        <Route path="/" element={<Storefront />} />
        <Route path="/voice" element={<VoiceAssistant />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="inventory" element={<AdminInventory />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="subscribers" element={<AdminSubscribers />} />
          <Route path="chat" element={<AdminChat />} />
          <Route path="ideas" element={<AdminIdeas />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
