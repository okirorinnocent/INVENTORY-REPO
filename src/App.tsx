import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router';
import { Storefront } from './pages/storefront';
import { AdminDashboard } from './pages/admin/dashboard';
import { AdminInventory } from './pages/admin/inventory';
import { AdminOrders } from './pages/admin/orders';
import { AdminChat } from './pages/admin/chat';
import { AdminIdeas } from './pages/admin/ideas';
import { AdminSubscribers } from './pages/admin/subscribers';
import { VoiceAssistant } from './pages/voice';
import { Layout } from './components/layout';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Storefront />} />
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="admin/inventory" element={<AdminInventory />} />
          <Route path="admin/orders" element={<AdminOrders />} />
          <Route path="admin/subscribers" element={<AdminSubscribers />} />
          <Route path="admin/chat" element={<AdminChat />} />
          <Route path="admin/ideas" element={<AdminIdeas />} />
          <Route path="voice" element={<VoiceAssistant />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
