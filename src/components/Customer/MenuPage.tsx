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
  Flame,
  Award,
  ArrowRight,
  UtensilsCrossed,
  GlassWater,
  Croissant,
  Sun,
  Wine
} from 'lucide-react';

export const MenuPage: React.FC = () => {
  const { currentCafe, deviceId, setSelectedItemForCustomization, addToCart, showToast } = useApp();

  const [menuData, setMenuData] = useState<MenuResponse | null>(() => {
    return currentCafe ? getFallbackMenuResponse(currentCafe) : null;
  });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

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
          <p className="text-sm font-bold text-[var(--foreground)]">Crafting your personalized menu...</p>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">Connecting to {currentCafe?.name || 'Cafe'}</p>
        </div>
      </div>
    );
  }

  if (!menuData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="p-8 rounded-3xl bg-[var(--card)] border border-[var(--border)] max-w-md mx-auto shadow-sm">
          <Coffee className="w-10 h-10 text-[var(--muted-foreground)] mx-auto mb-3 opacity-40" />
          <h3 className="font-bold text-base text-[var(--card-foreground)]">Unable to load menu</h3>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">Please check your connection and try again.</p>
        </div>
      </div>
    );
  }

  // Filter items
  const filteredItems = menuData.items.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const timeGreeting =
    menuData.timeOfDay === 'morning'
      ? 'Good Morning'
      : menuData.timeOfDay === 'afternoon'
      ? 'Good Afternoon'
      : 'Good Evening';

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
      case 'iced drinks':
        return <GlassWater className="w-3.5 h-3.5 text-cyan-500" />;
      case 'pastries':
      case 'bakery':
        return <Croissant className="w-3.5 h-3.5 text-orange-400" />;
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
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-5 sm:py-8 space-y-7">
      {/* Dynamic Ambient Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl sm:rounded-4xl p-5 sm:p-8 border border-[var(--border)] bg-gradient-to-br from-amber-500/15 via-[var(--card)] to-orange-500/10 dark:from-amber-500/10 dark:via-[#12141c] dark:to-orange-950/20 shadow-sm">
        {/* Colorful background glow orbs */}
        <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-amber-500/15 dark:bg-amber-400/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-12 w-64 h-64 rounded-full bg-orange-500/15 dark:bg-orange-600/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 text-xs font-black uppercase tracking-wider mb-3 border border-amber-500/20">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>{timeGreeting} • {currentCafe?.name}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-[var(--foreground)] tracking-tight leading-tight">
              {menuData.isReturning && (menuData.visitCount ?? 0) > 0
                ? `Crafted Fresh for Visit #${menuData.visitCount}`
                : `Welcome to ${currentCafe?.name || 'Loka Cafe'}`}
            </h1>
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-2 font-medium leading-relaxed">
              Welcome to our digital bar! Recommendations and custom recipes are curated based on your taste history.
            </p>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-xs font-bold text-[var(--card-foreground)]">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                Table Service
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Kitchen Fast-Track Active
              </span>
            </div>
          </div>

          {/* Loyalty VIP Card */}
          <div className="lg:w-80 flex-shrink-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-950 text-white p-5 rounded-3xl border border-amber-500/30 shadow-xl relative overflow-hidden group">
            {/* Metallic shine reflection */}
            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-32 h-32 rounded-full bg-amber-400/20 blur-2xl" />
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 to-yellow-200 text-zinc-950 flex items-center justify-center font-black text-xs shadow-md">
                  ★
                </div>
                <div>
                  <div className="text-[10px] uppercase font-black tracking-widest text-amber-400">Loka Member</div>
                  <div className="font-extrabold text-sm text-white">Gold Tier</div>
                </div>
              </div>
              <span className="text-[11px] font-black px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/30">
                240 pts
              </span>
            </div>

            {/* Progress to reward */}
            <div className="space-y-1.5 mb-3">
              <div className="flex justify-between text-[11px] text-zinc-300 font-medium">
                <span>Next Free Artisanal Brew</span>
                <span className="text-amber-400 font-bold">240 / 300</span>
              </div>
              <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden p-0.5 border border-white/5">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-400 rounded-full transition-all duration-1000 shadow-sm"
                  style={{ width: '80%' }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-2 border-t border-zinc-700/50">
              <span>60 pts to unlock voucher</span>
              <span className="text-amber-400 font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform cursor-pointer">
                Perks <ArrowRight className="w-2.5 h-2.5" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Favorite Dish & Recent Orders Row */}
      {(menuData.favoriteDish || (menuData.recentOrders && menuData.recentOrders.length > 0)) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Favorite Dish */}
          {menuData.favoriteDish && (
            <div className={`${menuData.recentOrders && menuData.recentOrders.length > 0 ? 'lg:col-span-1' : 'lg:col-span-3'} bg-[var(--card)] rounded-3xl p-5 border border-[var(--border)] shadow-xs hover:border-rose-500/30 transition-all flex flex-col justify-between`}>
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="flex items-center gap-1.5 text-xs font-black text-rose-500 uppercase tracking-wider">
                    <Heart className="w-3.5 h-3.5 fill-rose-500" />
                    Your Favorite Dish
                  </span>
                  <span className="text-[10px] bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2.5 py-0.5 rounded-full font-bold border border-rose-500/20">
                    Ordered Most
                  </span>
                </div>

                <div className="flex gap-3.5 mb-4">
                  <img
                    src={menuData.favoriteDish.image}
                    alt={menuData.favoriteDish.name}
                    className="w-22 h-22 rounded-2xl object-cover flex-shrink-0 shadow-sm border border-[var(--border)]"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex flex-col justify-center">
                    <h3 className="font-extrabold text-base text-[var(--card-foreground)] leading-snug">
                      {menuData.favoriteDish.name}
                    </h3>
                    <p className="text-xs text-[var(--muted-foreground)] line-clamp-2 mt-1">
                      {menuData.favoriteDish.description}
                    </p>
                    <div className="text-base font-black text-[var(--foreground)] mt-1.5 tracking-tight">
                      ₹{menuData.favoriteDish.price}
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedItemForCustomization(menuData.favoriteDish)}
                className="w-full py-2.5 px-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-95 cursor-pointer"
                style={{
                  backgroundColor: 'var(--primary)',
                  color: 'var(--primary-foreground)'
                }}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Order Favorite Again</span>
              </button>
            </div>
          )}

          {/* Recent Orders List */}
          {menuData.recentOrders && menuData.recentOrders.length > 0 && (
            <div className={`${menuData.favoriteDish ? 'lg:col-span-2' : 'lg:col-span-3'} bg-[var(--card)] rounded-3xl p-5 border border-[var(--border)] shadow-xs flex flex-col justify-between`}>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="flex items-center gap-1.5 text-xs font-black text-[var(--foreground)] uppercase tracking-wider">
                  <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
                  Recent Orders & Past Pairings
                </span>
                <span className="text-[11px] text-amber-600 dark:text-amber-400 font-bold">1-Tap Fast Reorder</span>
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
                      <div className="font-black text-sm text-[var(--card-foreground)]">
                        {order.dishName}
                      </div>
                      <div className="text-xs text-amber-600 dark:text-amber-400 font-semibold italic truncate mt-0.5">
                        {order.customization}
                      </div>
                    </div>

                    <button
                      onClick={() => handleReorderRecent(order)}
                      className="self-end px-3 py-1.5 rounded-xl text-xs font-bold bg-[var(--card)] text-[var(--card-foreground)] border border-[var(--border)] hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] hover:border-transparent transition-all shadow-2xs hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      + Add to Order
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
          {/* Search bar with glowing focus */}
          <div className="relative flex-1 max-w-lg">
            <Search className="w-4 h-4 text-amber-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search brews, cold pours, artisanal pastries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] text-xs sm:text-sm font-medium text-[var(--card-foreground)] focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 shadow-sm transition-all placeholder:text-[var(--muted-foreground)]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              >
                Clear
              </button>
            )}
          </div>

          {/* Results count pill */}
          <div className="text-xs font-bold text-[var(--muted-foreground)] px-3 py-1.5 rounded-full bg-[var(--muted)] border border-[var(--border)] self-start sm:self-center">
            {filteredItems.length} delicacies available
          </div>
        </div>

        {/* Category Pill Filters with vivid icons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none -mx-1 px-1">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-2 shadow-xs cursor-pointer ${
              selectedCategory === 'All'
                ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-md scale-105'
                : 'bg-[var(--card)] text-[var(--card-foreground)] border border-[var(--border)] hover:bg-[var(--muted)]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>All Items ({menuData.items.length})</span>
          </button>

          {menuData.categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-2 shadow-xs cursor-pointer ${
                  isSelected
                    ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-md scale-105'
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

      {/* Recommended Items Banner */}
      {selectedCategory === 'All' && !searchQuery && (menuData.recommendedIds || []).length > 0 && (
        <div className="space-y-3.5 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-orange-500/15 flex items-center justify-center text-orange-500">
                <Flame className="w-4 h-4 fill-orange-500" />
              </div>
              <h2 className="text-lg font-black text-[var(--foreground)] tracking-tight">
                Chef & AI Recommended for You
              </h2>
            </div>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 hidden sm:inline">
              Matches your profile
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
          <h2 className="text-lg font-black text-[var(--foreground)] tracking-tight flex items-center gap-2">
            <Coffee className="w-5 h-5 text-amber-500" />
            <span>{selectedCategory === 'All' ? 'Full Cafe Menu' : selectedCategory}</span>
          </h2>
        </div>

        {filteredItems.length === 0 ? (
          <div className="py-20 text-center bg-[var(--card)] rounded-3xl border border-[var(--border)] shadow-xs">
            <Coffee className="w-12 h-12 text-[var(--muted-foreground)] mx-auto mb-3 opacity-30" />
            <p className="text-base font-bold text-[var(--card-foreground)]">No matching items found</p>
            <p className="text-xs text-[var(--muted-foreground)] mt-1 max-w-xs mx-auto">
              We couldn't find any drinks or bakery items matching "{searchQuery}".
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-[var(--primary)] text-[var(--primary-foreground)] cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
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
