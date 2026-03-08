import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Package } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image: string;
}

export function AdminInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [isEditing, setIsEditing] = useState<Product | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const res = await fetch('/api/products');
    setProducts(await res.json());
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
    fetchProducts();
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const productData = Object.fromEntries(formData.entries());
    
    const url = isEditing ? `/api/products/${isEditing.id}` : '/api/products';
    const method = isEditing ? 'PUT' : 'POST';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });

    setIsEditing(null);
    setIsAdding(false);
    fetchProducts();
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Inventory</h1>
          <p className="text-neutral-500 mt-1">Manage your products and stock levels</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
            <input 
              type="text" 
              placeholder="Search inventory..." 
              className="pl-10 pr-4 py-2 bg-white border border-neutral-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-neutral-800 transition-colors"
          >
            <Plus size={18} />
            Add Product
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-200">
              <th className="p-4 font-semibold text-neutral-500 text-sm uppercase tracking-wider">Product</th>
              <th className="p-4 font-semibold text-neutral-500 text-sm uppercase tracking-wider">Category</th>
              <th className="p-4 font-semibold text-neutral-500 text-sm uppercase tracking-wider">Price</th>
              <th className="p-4 font-semibold text-neutral-500 text-sm uppercase tracking-wider">Stock</th>
              <th className="p-4 font-semibold text-neutral-500 text-sm uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(product => (
              <tr key={product.id} className="border-b border-neutral-100 hover:bg-neutral-50/50 transition-colors">
                <td className="p-4 flex items-center gap-4">
                  <img src={product.image} alt={product.name} className="w-12 h-12 rounded-lg object-cover bg-neutral-100" referrerPolicy="no-referrer" />
                  <div>
                    <div className="font-bold text-neutral-900">{product.name}</div>
                    <div className="text-sm text-neutral-500 truncate max-w-xs">{product.description}</div>
                  </div>
                </td>
                <td className="p-4 text-neutral-600">{product.category}</td>
                <td className="p-4 font-medium text-neutral-900">${(product.price).toFixed(2)}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    product.stock > 20 ? 'bg-emerald-100 text-emerald-700' :
                    product.stock > 0 ? 'bg-orange-100 text-orange-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {product.stock} in stock
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => setIsEditing(product)}
                      className="p-2 text-neutral-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(product.id)}
                      className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan={5} className="p-12 text-center text-neutral-500">
                  <Package size={48} className="mx-auto mb-4 opacity-20" />
                  <p>No products found.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {(isAdding || isEditing) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setIsAdding(false); setIsEditing(null); }} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">
              {isEditing ? 'Edit Product' : 'Add New Product'}
            </h2>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Name</label>
                <input required name="name" defaultValue={isEditing?.name} className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:outline-none" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
                <textarea required name="description" defaultValue={isEditing?.description} rows={3} className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:outline-none" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Price ($)</label>
                  <input required type="number" step="0.01" name="price" defaultValue={isEditing?.price} className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Stock</label>
                  <input required type="number" name="stock" defaultValue={isEditing?.stock} className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:outline-none" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Category</label>
                <input required name="category" defaultValue={isEditing?.category} className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:outline-none" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Image URL</label>
                <input required name="image" defaultValue={isEditing?.image || 'https://picsum.photos/seed/product/400/300'} className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:outline-none" />
              </div>
              
              <div className="flex justify-end gap-3 mt-8">
                <button 
                  type="button" 
                  onClick={() => { setIsAdding(false); setIsEditing(null); }}
                  className="px-4 py-2 text-neutral-600 font-medium hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 bg-neutral-900 text-white font-medium rounded-lg hover:bg-neutral-800 transition-colors"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
