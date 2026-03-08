import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, Plus, Minus, Trash2, ArrowRight, Mail } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image: string;
}

interface CartItem extends Product {
  quantity: number;
}

export function Storefront() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      });
  }, []);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQuantity = item.quantity + delta;
        if (newQuantity <= 0) return item;
        if (newQuantity > item.stock) return item;
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const checkout = async () => {
    if (cart.length === 0) return;
    
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: 'Guest Customer',
          customer_email: 'guest@example.com',
          items: cart.map(item => ({ product_id: item.id, quantity: item.quantity }))
        })
      });
      
      if (res.ok) {
        setCart([]);
        setIsCartOpen(false);
        alert('Order placed successfully!');
        // Refresh products to show updated stock
        const productsRes = await fetch('/api/products');
        setProducts(await productsRes.json());
      } else {
        const error = await res.json();
        alert(`Error: ${error.error}`);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to place order');
    }
  };

  const categories = Array.from(new Set(products.map(p => p.category)));

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    
    setSubscribeStatus('loading');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail })
      });
      
      if (res.ok) {
        setSubscribeStatus('success');
        setNewsletterEmail('');
        setTimeout(() => setSubscribeStatus('idle'), 3000);
      } else {
        setSubscribeStatus('error');
        setTimeout(() => setSubscribeStatus('idle'), 3000);
      }
    } catch (err) {
      setSubscribeStatus('error');
      setTimeout(() => setSubscribeStatus('idle'), 3000);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-neutral-500">Loading products...</div>;

  return (
    <div className="min-h-screen bg-neutral-50 pb-12">
      {/* Header / Nav */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-neutral-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-black text-neutral-900 tracking-tighter">STOCKSMART</h1>
        </div>
        
        <div className="flex-1 max-w-md mx-8 hidden md:block">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-neutral-900 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search products..." 
              className="w-full pl-12 pr-4 py-3 bg-neutral-100 border-transparent rounded-full text-sm focus:bg-white focus:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 transition-all"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        
        <button 
          className="relative p-3 bg-neutral-900 text-white rounded-full hover:bg-neutral-800 transition-transform hover:scale-105 shadow-lg shadow-neutral-900/20"
          onClick={() => setIsCartOpen(true)}
        >
          <ShoppingCart size={20} />
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[11px] font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          )}
        </button>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Hero Section */}
        <div className="relative bg-neutral-900 text-white rounded-[2rem] overflow-hidden mb-12 shadow-2xl">
          <div className="absolute inset-0">
            <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop" alt="Hero" className="w-full h-full object-cover opacity-40 mix-blend-overlay" />
          </div>
          <div className="relative p-10 md:p-24 flex flex-col items-center text-center">
            <span className="text-sm font-bold tracking-widest uppercase mb-4 text-neutral-300">New Collection</span>
            <h2 className="text-5xl md:text-7xl font-black tracking-tight mb-6">Elevate Your Everyday</h2>
            <p className="text-lg md:text-xl text-neutral-300 max-w-2xl mb-10">Curated premium products designed to seamlessly integrate into your lifestyle. Experience quality without compromise.</p>
            <button onClick={() => window.scrollTo({ top: 600, behavior: 'smooth' })} className="bg-white text-neutral-900 px-10 py-4 rounded-full font-bold text-lg hover:bg-neutral-100 transition-transform hover:scale-105">
              Explore Collection
            </button>
          </div>
        </div>

        {/* Categories & Mobile Search */}
        <div className="mb-10 space-y-6">
          <div className="md:hidden relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
            <input 
              type="text" 
              placeholder="Search products..." 
              className="w-full pl-12 pr-4 py-3 bg-white border border-neutral-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide items-center">
            <span className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mr-2">Categories:</span>
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                selectedCategory === null 
                  ? 'bg-neutral-900 text-white shadow-md' 
                  : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100 hover:border-neutral-300'
              }`}
            >
              All
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                  selectedCategory === category 
                    ? 'bg-neutral-900 text-white shadow-md' 
                    : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100 hover:border-neutral-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-20">
          {filteredProducts.map(product => (
            <div key={product.id} className="group bg-white rounded-3xl border border-neutral-100 overflow-hidden hover:shadow-2xl hover:shadow-neutral-200/50 transition-all duration-500 flex flex-col">
              <div className="h-64 bg-neutral-100 relative overflow-hidden">
                <img 
                  src={product.image || `https://picsum.photos/seed/${product.id}/400/400`} 
                  alt={product.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                
                {product.stock < 10 && product.stock > 0 && (
                  <div className="absolute top-4 left-4 bg-orange-500/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                    Only {product.stock} left
                  </div>
                )}
                {product.stock === 0 && (
                  <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center">
                    <span className="bg-neutral-900 text-white font-bold px-6 py-3 rounded-full text-sm shadow-lg">Out of Stock</span>
                  </div>
                )}
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                <div className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">{product.category}</div>
                <h3 className="text-xl font-bold text-neutral-900 leading-tight mb-3 group-hover:text-neutral-700 transition-colors">{product.name}</h3>
                <p className="text-sm text-neutral-500 line-clamp-2 mb-6 flex-1 leading-relaxed">{product.description}</p>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-neutral-100">
                  <span className="text-2xl font-black text-neutral-900">${(product.price).toFixed(2)}</span>
                  <button 
                    onClick={() => addToCart(product)}
                    disabled={product.stock === 0}
                    className="bg-neutral-100 text-neutral-900 px-5 py-2.5 rounded-full text-sm font-bold hover:bg-neutral-900 hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Plus size={16} />
                    Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Newsletter Section */}
        <div className="relative rounded-[2rem] overflow-hidden mb-12 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900" />
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
          
          <div className="relative p-10 md:p-16 text-center text-white">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 mb-6 backdrop-blur-sm">
              <Mail size={32} className="text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">Join the Club</h2>
            <p className="text-lg text-neutral-300 max-w-xl mx-auto mb-10">
              Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <input 
                type="email" 
                placeholder="Enter your email address" 
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="flex-1 px-8 py-4 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/20 transition-all text-lg"
              />
              <button 
                type="submit" 
                disabled={subscribeStatus === 'loading' || subscribeStatus === 'success'}
                className="px-10 py-4 rounded-full bg-white text-neutral-900 font-bold text-lg hover:bg-neutral-100 hover:scale-105 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-xl shadow-white/10"
              >
                {subscribeStatus === 'loading' ? 'Subscribing...' : subscribeStatus === 'success' ? 'Subscribed!' : 'Subscribe'}
                {subscribeStatus === 'idle' && <ArrowRight size={20} />}
              </button>
            </form>
            {subscribeStatus === 'error' && (
              <p className="text-red-400 text-sm mt-4 font-medium">Something went wrong. Please try again.</p>
            )}
          </div>
        </div>
      </main>

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-neutral-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-neutral-900">Your Cart</h2>
              <button onClick={() => setIsCartOpen(false)} className="text-neutral-500 hover:text-neutral-900">
                &times;
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="text-center text-neutral-500 mt-10">
                  <ShoppingCart size={48} className="mx-auto mb-4 opacity-20" />
                  <p>Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {cart.map(item => (
                    <div key={item.id} className="flex gap-4">
                      <img src={item.image} alt={item.name} className="w-20 h-20 rounded-lg object-cover bg-neutral-100" referrerPolicy="no-referrer" />
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-bold text-neutral-900">{item.name}</h4>
                          <p className="text-sm text-neutral-500">${(item.price).toFixed(2)}</p>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-3 bg-neutral-100 rounded-full px-2 py-1">
                            <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-white rounded-full transition-colors">
                              <Minus size={14} />
                            </button>
                            <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-white rounded-full transition-colors">
                              <Plus size={14} />
                            </button>
                          </div>
                          <button onClick={() => removeFromCart(item.id)} className="text-red-500 p-2 hover:bg-red-50 rounded-full transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {cart.length > 0 && (
              <div className="p-6 border-t border-neutral-200 bg-neutral-50">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-neutral-500">Total</span>
                  <span className="text-2xl font-bold text-neutral-900">${cartTotal.toFixed(2)}</span>
                </div>
                <button 
                  onClick={checkout}
                  className="w-full bg-neutral-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-neutral-800 transition-colors shadow-lg shadow-neutral-900/20"
                >
                  Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
