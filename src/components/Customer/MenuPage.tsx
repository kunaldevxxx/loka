import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../lib/api';
import { MenuResponse, MenuItem, RecentOrder } from '../../types/api';
import { getFallbackMenuResponse } from '../../lib/fallbackData';
import { MenuItemCard } from './MenuItemCard';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Sparkles,
  Heart,
  RotateCcw,
  Clock,
  Coffee,
  Compass,
  ArrowRight,
  UtensilsCrossed,
  GlassWater,
  Croissant,
  Sun,
  Wine,
  MapPin,
  Flame,
  Award
} from 'lucide-react';

export const MenuPage: React.FC = () => {
  const { currentCafe, deviceId, setSelectedItemForCustomization, addToCart, showToast, tableId } = useApp();

  const [menuData, setMenuData] = useState<MenuResponse | null>(() => {
    return currentCafe ? getFallbackMenuResponse(currentCafe) : null;
  });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [flavorFilter, setFlavorFilter] = useState<string>('all');

  useEffect(() => {
    if (!currentCafe) return;
    setLoading(true);
    api.getMenu(currentCafe.cafeId, deviceId)
      .then((res) => {
        setMenuData(res);
      })
      .catch((err) => {
        console.warn('Live menu fetch failed or offline; using fallback menu:', err);
        setMenuData((prev) => prev || getFallbackMenuResponse(currentCafe));
      })
      .finally(() => setLoading(false));
  }, [currentCafe?.cafeId, deviceId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="w-14 h-14 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
          <Coffee className="w-6 h-6 text-amber-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <div className="text-center">
          <p className="font-editorial text-lg font-bold text-[var(--foreground)]">Brewing your digital catalog...</p>
          <p className="text-xs text-[var(--muted-foreground)] mt-1 font-medium">Connecting to {currentCafe?.name || 'Artisanal Cafe'}</p>
        </div>
      </div>
    );
  }

  if (!menuData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="p-8 rounded-3xl bg-[var(--card)] border border-[var(--border)] max-w-md mx-auto shadow-sm">
          <Coffee className="w-10 h-10 text-[var(--muted-foreground)] mx-auto mb-3 opacity-40" />
          <h3 className="font-editorial text-lg font-bold text-[var(--card-foreground)]">Unable to load tasting menu</h3>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">Please check your connection and refresh.</p>
        </div>
      </div>
    );
  }

  // Filter items by category, search, and sensory profile
  const filteredItems = menuData.items.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesFlavor = true;
    if (flavorFilter !== 'all') {
      const combinedText = (item.name + ' ' + item.description + ' ' + (item.tags || []).join(' ')).toLowerCase();
      if (flavorFilter === 'chocolate') {
        matchesFlavor = combinedText.includes('chocolate') || combinedText.includes('cacao') || combinedText.includes('cocoa') || combinedText.includes('mocha');
      } else if (flavorFilter === 'nutty') {
        matchesFlavor = combinedText.includes('nut') || combinedText.includes('hazelnut') || combinedText.includes('almond') || combinedText.includes('caramel');
      } else if (flavorFilter === 'citrus') {
        matchesFlavor = combinedText.includes('citrus') || combinedText.includes('orange') || combinedText.includes('berry') || combinedText.includes('fruity');
      } else if (flavorFilter === 'bakery') {
        matchesFlavor = combinedText.includes('butter') || combinedText.includes('croissant') || combinedText.includes('sourdough') || combinedText.includes('bake');
      }
    }

    return matchesCategory && matchesSearch && matchesFlavor;
  });

  const timeGreeting =
    menuData.timeOfDay === 'morning'
      ? 'Morning Brew & Bakes'
      : menuData.timeOfDay === 'afternoon'
      ? 'Afternoon Pour-Over & Pastries'
      : 'Evening Bistro & Roast Reserve';

  const handleReorderRecent = (order: RecentOrder) => {
    const match = menuData.items.find((i) => i.itemId === order.dishId);
    if (match) {
      addToCart(match, 1, {
        notes: order.customization
      });
      showToast(`Added ${match.name} (${order.customization}) to cart`);
    } else {
      showToast(`Added ${order.dishName} to order`);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'coffee drinks':
      case 'hot coffee':
        return <Coffee className="w-3.5 h-3.5 text-amber-500" />;
      case 'cold coffee':
      case 'iced coffee':
      case 'cold beverages':
      case 'iced drinks':
        return <GlassWater className="w-3.5 h-3.5 text-cyan-500" />;
      case 'pastries & bakes':
      case 'pastries':
      case 'bakery':
        return <Croissant className="w-3.5 h-3.5 text-amber-600" />;
      case 'breakfast':
      case 'brunch':
        return <Sun className="w-3.5 h-3.5 text-emerald-500" />;
      case 'coffee cocktails':
      case 'specialty':
        return <Wine className="w-3.5 h-3.5 text-rose-500" />;
      default:
        return <UtensilsCrossed className="w-3.5 h-3.5 text-amber-500" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* Editorial Boutique Hero Marquee */}
      <div className="relative overflow-hidden rounded-3xl sm:rounded-4xl p-6 sm:p-10 border border-amber-950/10 dark:border-amber-400/10 bg-[var(--card)] shadow-sm">
        {/* Subtle warm ambient lighting */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-amber-500/10 dark:bg-amber-400/5 blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-orange-500/5 blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="max-w-2xl space-y-3">
            {/* Estate & Table Indicator Pill */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 text-[11px] font-bold uppercase tracking-wider border border-amber-500/20">
                <Compass className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                <span>{timeGreeting}</span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800/10 dark:bg-zinc-100/10 text-[11px] font-semibold text-[var(--muted-foreground)] border border-[var(--border)]">
                <MapPin className="w-3 h-3 text-amber-500" />
                <span>Seated at {tableId || currentCafe?.defaultTableId || 'Table 05'}</span>
              </span>
            </div>

            {/* Editorial Serif Display Headline */}
            <h1 className="font-editorial text-3xl sm:text-5xl font-black text-[var(--foreground)] tracking-tight leading-[1.1]">
              {currentCafe?.name || 'Artisanal Roastery & Cafe'}
            </h1>
            
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed font-normal max-w-xl">
              {currentCafe?.tagline || 'Direct-trade single estate beans roasted in micro-batches and served alongside hearth-baked French viennoiserie.'}
            </p>

            {/* Specialty Coffee Origin Attributes */}
            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[var(--muted)] border border-[var(--border)] font-medium text-[var(--card-foreground)]">
                <Coffee className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Micro-lot Indian Arabica</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 font-medium text-emerald-700 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Freshly Pulled to Order</span>
              </span>
            </div>
          </div>

          {/* Patron Sensory & Loyalty Atelier Card */}
          <div className="lg:w-80 flex-shrink-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-amber-950 text-white p-5 rounded-3xl border border-amber-500/30 shadow-xl relative overflow-hidden group">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-400 text-zinc-950 flex items-center justify-center font-bold text-xs shadow-md">
                  ★
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-widest text-amber-300">Patron Club</div>
                  <div className="font-editorial font-bold text-sm text-white">Gold Reserve Member</div>
                </div>
              </div>
              <span className="text-[11px] font-black px-2 py-0.5 rounded-lg bg-amber-400/20 text-amber-300 border border-amber-400/30">
                240 pts
              </span>
            </div>

            <div className="space-y-1.5 mb-3">
              <div className="flex justify-between text-[11px] text-zinc-300 font-medium">
                <span>Complimentary Pour-Over</span>
                <span className="text-amber-400 font-bold">240 / 300</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full"
                  style={{ width: '80%' }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-2 border-t border-zinc-800">
              <span>60 pts to unlock voucher</span>
              <span className="text-amber-400 font-bold flex items-center gap-0.5">
                5% Dining Privilege
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sensory Flavor Filter Strip - Unique Artisan Feature */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase font-black tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curate by Sensory Flavor Profile</span>
          </span>
          <span className="text-[11px] text-[var(--muted-foreground)] font-medium">
            Explore taste palates
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
          {[
            { id: 'all', label: 'All Profiles', icon: '✨' },
            { id: 'chocolate', label: 'Dark Cocoa & Mocha', icon: '🍫' },
            { id: 'nutty', label: 'Roasted Hazelnut & Praline', icon: '🌰' },
            { id: 'citrus', label: 'Bright Citrus & Stone Fruit', icon: '🍊' },
            { id: 'bakery', label: 'Normandy Butter & Viennoiserie', icon: '🥐' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFlavorFilter(f.id)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                flavorFilter === f.id
                  ? 'bg-amber-500/20 text-amber-800 dark:text-amber-300 border-2 border-amber-500/40 shadow-xs font-bold'
                  : 'bg-[var(--card)] text-[var(--muted-foreground)] border border-[var(--border)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]'
              }`}
            >
              <span>{f.icon}</span>
              <span>{f.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Favorite Pairing / Recent Order Bar */}
      {(menuData.favoriteDish || (menuData.recentOrders && menuData.recentOrders.length > 0)) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Favorite Dish */}
          {menuData.favoriteDish && (
            <div className={`${menuData.recentOrders && menuData.recentOrders.length > 0 ? 'lg:col-span-1' : 'lg:col-span-3'} bg-[var(--card)] rounded-3xl p-5 border border-[var(--border)] shadow-xs flex flex-col justify-between`}>
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-rose-500 uppercase tracking-wider">
                    <Heart className="w-3.5 h-3.5 fill-rose-500" />
                    Your Personal Favorite
                  </span>
                  <span className="text-[10px] bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2.5 py-0.5 rounded-full font-bold border border-rose-500/20">
                    Signature Choice
                  </span>
                </div>

                <div className="flex gap-3.5 mb-4">
                  <img
                    src={menuData.favoriteDish.image}
                    alt={menuData.favoriteDish.name}
                    className="w-20 h-20 rounded-2xl object-cover flex-shrink-0 shadow-xs border border-[var(--border)]"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex flex-col justify-center">
                    <h3 className="font-editorial text-base font-bold text-[var(--card-foreground)] leading-snug">
                      {menuData.favoriteDish.name}
                    </h3>
                    <p className="text-xs text-[var(--muted-foreground)] line-clamp-2 mt-1">
                      {menuData.favoriteDish.description}
                    </p>
                    <div className="font-editorial font-bold text-base text-[var(--foreground)] mt-1">
                      ₹{menuData.favoriteDish.price}
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedItemForCustomization(menuData.favoriteDish)}
                className="w-full py-2.5 px-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md hover:scale-[1.01] active:scale-95 cursor-pointer"
                style={{
                  backgroundColor: 'var(--primary)',
                  color: 'var(--primary-foreground)'
                }}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Re-craft Favorite</span>
              </button>
            </div>
          )}

          {/* Recent Orders List */}
          {menuData.recentOrders && menuData.recentOrders.length > 0 && (
            <div className={`${menuData.favoriteDish ? 'lg:col-span-2' : 'lg:col-span-3'} bg-[var(--card)] rounded-3xl p-5 border border-[var(--border)] shadow-xs flex flex-col justify-between`}>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="flex items-center gap-1.5 text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">
                  <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
                  Past Visits & Custom Pairings
                </span>
                <span className="text-[11px] text-amber-600 dark:text-amber-400 font-bold">Quick Reorder</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(menuData.recentOrders || []).map((order, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-2xl bg-[var(--muted)]/60 hover:bg-[var(--muted)] border border-[var(--border)] flex flex-col justify-between gap-2.5 transition-colors"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 text-[10px] text-[var(--muted-foreground)] font-bold mb-1">
                        <span className="px-2 py-0.5 rounded-md bg-[var(--card)] uppercase">{order.dayOfWeek} • {order.timeOfDay}</span>
                        <span className="font-mono">
                          {new Date(order.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <div className="font-editorial font-bold text-sm text-[var(--card-foreground)]">
                        {order.dishName}
                      </div>
                      <div className="text-xs text-amber-600 dark:text-amber-400 font-medium italic truncate mt-0.5">
                        {order.customization}
                      </div>
                    </div>

                    <button
                      onClick={() => handleReorderRecent(order)}
                      className="self-end px-3 py-1.5 rounded-xl text-xs font-bold bg-[var(--card)] text-[var(--card-foreground)] border border-[var(--border)] hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] hover:border-transparent transition-all shadow-2xs hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      + Add to Tasting
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search & Category Filter Section */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Refined Search input */}
          <div className="relative flex-1 max-w-lg">
            <Search className="w-4 h-4 text-amber-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search origin beans, espresso pulls, flaky viennoiserie..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] text-xs sm:text-sm font-medium text-[var(--card-foreground)] focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 shadow-xs transition-all placeholder:text-[var(--muted-foreground)]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          <div className="text-xs font-medium text-[var(--muted-foreground)] px-3.5 py-1.5 rounded-full bg-[var(--muted)] border border-[var(--border)] self-start sm:self-center">
            {filteredItems.length} curated creations
          </div>
        </div>

        {/* Editorial Category Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none -mx-1 px-1">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 shadow-xs cursor-pointer ${
              selectedCategory === 'All'
                ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-md'
                : 'bg-[var(--card)] text-[var(--card-foreground)] border border-[var(--border)] hover:bg-[var(--muted)]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>All Offerings ({menuData.items.length})</span>
          </button>

          {menuData.categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 shadow-xs cursor-pointer ${
                  isSelected
                    ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-md'
                    : 'bg-[var(--card)] text-[var(--card-foreground)] border border-[var(--border)] hover:bg-[var(--muted)]'
                }`}
              >
                {getCategoryIcon(cat)}
                <span>{cat}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Barista Recommended Selection */}
      {selectedCategory === 'All' && !searchQuery && flavorFilter === 'all' && (menuData.recommendedIds || []).length > 0 && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
              </div>
              <h2 className="font-editorial text-xl font-black text-[var(--foreground)] tracking-tight">
                Barista Reserve & Tasting Highlights
              </h2>
            </div>
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-300 hidden sm:inline">
              Pairing Recommendations
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuData.items
              .filter((item) => (menuData.recommendedIds || []).includes(item.itemId))
              .map((item) => (
                <MenuItemCard key={`rec-${item.itemId}`} item={item} isRecommended />
              ))}
          </div>
        </div>
      )}

      {/* Main Items Grid */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="font-editorial text-xl font-black text-[var(--foreground)] tracking-tight flex items-center gap-2">
            <Coffee className="w-5 h-5 text-amber-500" />
            <span>{selectedCategory === 'All' ? 'Complete Tasting Menu' : selectedCategory}</span>
          </h2>
        </div>

        {filteredItems.length === 0 ? (
          <div className="py-20 text-center bg-[var(--card)] rounded-3xl border border-[var(--border)] shadow-xs">
            <Coffee className="w-12 h-12 text-[var(--muted-foreground)] mx-auto mb-3 opacity-30" />
            <p className="font-editorial text-lg font-bold text-[var(--card-foreground)]">No matching items found</p>
            <p className="text-xs text-[var(--muted-foreground)] mt-1 max-w-xs mx-auto">
              We couldn't find any creations matching your search or flavor filter.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setFlavorFilter('all');
              }}
              className="mt-4 px-5 py-2.5 rounded-2xl text-xs font-bold bg-[var(--primary)] text-[var(--primary-foreground)] cursor-pointer shadow-sm hover:scale-105 active:scale-95 transition-all"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredItems.map((item) => (
              <MenuItemCard key={item.itemId} item={item} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};
