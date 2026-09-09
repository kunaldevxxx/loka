import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../lib/api';
import { MenuItem } from '../../types/api';
import { Coffee, Plus, Trash2, Check, X, Search, DollarSign } from 'lucide-react';

export const MenuManagement: React.FC = () => {
  const { currentCafe, showToast } = useApp();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New item state
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Hot Coffee');
  const [newPrice, setNewPrice] = useState('240');
  const [newDescription, setNewDescription] = useState('');
  const [newImage, setNewImage] = useState(
    'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80'
  );

  const loadMenu = () => {
    if (!currentCafe) return;
    setLoading(true);
    api.getStaffMenu(currentCafe.cafeId)
      .then((res) => setItems(res.items))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadMenu();
  }, [currentCafe?.cafeId]);

  const handleToggleAvailable = async (item: MenuItem) => {
    try {
      const updated = await api.setMenuAvailability(item.itemId, !item.available);
      setItems((prev) => prev.map((current) => current.itemId === updated.itemId ? updated : current));
      showToast(`${updated.name} is now ${updated.available ? 'in stock' : 'sold out'}.`);
    } catch (err: any) {
      showToast(err.message || 'Unable to update availability');
    }
  };

  const handleUpdatePrice = (itemId: string, price: number) => {
    setItems((prev) =>
      prev.map((item) => (item.itemId === itemId ? { ...item, price } : item))
    );
    showToast('Price updated');
  };

  const handleAddNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    const created: MenuItem = {
      itemId: `item-custom-${Date.now()}`,
      name: newName,
      category: newCategory,
      price: parseFloat(newPrice) || 200,
      description: newDescription,
      image: newImage,
      rating: 4.9,
      orders: 0,
      tags: ['New', 'Chef Special'],
      available: true
    };

    setItems((prev) => [created, ...prev]);
    showToast(`Added ${newName} to cafe menu`);
    setShowAddModal(false);
    setNewName('');
    setNewDescription('');
  };

  const handleDeleteItem = (itemId: string) => {
    setItems((prev) => prev.filter((i) => i.itemId !== itemId));
    showToast('Menu item removed');
  };

  const filtered = items.filter(
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <h1 className="text-2xl font-black text-[var(--foreground)] tracking-tight">
            Menu Item & Inventory Manager
          </h1>
          <p className="text-xs text-[var(--muted-foreground)]">
            Toggle 86'd items out-of-stock, edit pricing, and curate specials for {currentCafe?.name}.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[var(--muted-foreground)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--card)] text-xs focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shadow-xs"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            <Plus className="w-4 h-4" />
            <span>Add Menu Item</span>
          </button>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-[var(--card)] rounded-3xl border border-[var(--border)] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--muted)]/50 text-[var(--muted-foreground)]">
                <th className="py-3.5 px-4 font-bold">Item</th>
                <th className="py-3.5 px-4 font-bold">Category</th>
                <th className="py-3.5 px-4 font-bold">Price (₹)</th>
                <th className="py-3.5 px-4 font-bold">In-Stock Status</th>
                <th className="py-3.5 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filtered.map((item) => {
                const isAvailable = item.available !== false;
                return (
                  <tr key={item.itemId} className="hover:bg-[var(--muted)]/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="font-bold text-[var(--card-foreground)]">{item.name}</div>
                          <div className="text-[11px] text-[var(--muted-foreground)] line-clamp-1 max-w-xs">
                            {item.description}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-medium text-[var(--muted-foreground)]">
                      {item.category}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <span>₹</span>
                        <input
                          type="number"
                          defaultValue={item.price}
                          onBlur={(e) =>
                            handleUpdatePrice(item.itemId, parseFloat(e.target.value) || item.price)
                          }
                          className="w-16 px-1.5 py-1 rounded-md border border-[var(--border)] bg-[var(--card)] font-bold text-xs"
                        />
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleAvailable(item)}
                        className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase transition-colors flex items-center gap-1 ${
                          isAvailable
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {isAvailable ? (
                          <>
                            <Check className="w-3 h-3" /> In Stock
                          </>
                        ) : (
                          <>
                            <X className="w-3 h-3" /> 86'd (Sold Out)
                          </>
                        )}
                      </button>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeleteItem(item.itemId)}
                        className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors"
                        title="Delete Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-[var(--card)] text-[var(--card-foreground)] rounded-3xl border border-[var(--border)] shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
              <h2 className="text-base font-bold">Add New Menu Dish or Drink</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-[var(--muted-foreground)] hover:text-[var(--card-foreground)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewItem} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[var(--muted-foreground)] mb-1">
                  Item Name
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Vanilla Bean Flat White"
                  className="w-full p-2.5 rounded-xl border border-[var(--border)] bg-[var(--muted)]/50 focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[var(--muted-foreground)] mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[var(--border)] bg-[var(--muted)]/50 font-medium"
                  >
                    <option value="Hot Coffee">Hot Coffee</option>
                    <option value="Cold Coffee">Cold Coffee</option>
                    <option value="Bakery & Pastries">Bakery & Pastries</option>
                    <option value="Signature Cocktails">Signature Cocktails</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[var(--muted-foreground)] mb-1">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[var(--border)] bg-[var(--muted)]/50"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[var(--muted-foreground)] mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Notes on roast, tasting profile, or artisanal ingredients..."
                  className="w-full p-2.5 rounded-xl border border-[var(--border)] bg-[var(--muted)]/50 resize-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[var(--muted-foreground)] mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  value={newImage}
                  onChange={(e) => setNewImage(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[var(--border)] bg-[var(--muted)]/50"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl text-xs font-bold text-white shadow-xs"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                Add Item to Menu
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
