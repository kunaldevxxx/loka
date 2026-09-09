import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Cafe, ExploreDish } from '../../types/api';
import { EXPLORE_DISHES } from '../../lib/fallbackData';
import { motion } from 'motion/react';
import {
  MapPin,
  Phone,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Coffee,
  Star,
  Search,
  QrCode,
  Award,
  Store,
  Compass,
  UtensilsCrossed,
  Lock,
  Plus
} from 'lucide-react';

export const CafeDiscovery: React.FC = () => {
  const {
    allCafes,
    currentCafe,
    setCurrentCafe,
    setActiveView,
    showToast,
    setIsQRModalOpen,
    isVenueOnboardingOpen,
    setIsVenueOnboardingOpen,
    isVenueManager,
    isChef,
    isSupport,
    tableId
  } = useApp();

  const [activeTab, setActiveTab] = useState<'dishes' | 'venues'>('dishes');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [venueFilter, setVenueFilter] = useState<string>('all');

  const categories = [
    'All',
    'Pastries & Bakes',
    'Manual Brews',
    'Desserts & Pairings',
    'Breakfast & Brunch',
    'Cold Beverages',
    'Specialty Beverages'
  ];

  // Filtered dishes
  const filteredDishes = useMemo(() => {
    return EXPLORE_DISHES.filter((dish) => {
      const matchesSearch =
        !searchQuery.trim() ||
        dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dish.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dish.cafeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dish.recommendationReason.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dish.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedTag === 'All' || dish.category === selectedTag;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedTag]);

  // Filtered cafes
  const filteredCafes = useMemo(() => {
    return allCafes.filter((c) => {
      if (venueFilter === 'all') return true;
      return c.venueType === venueFilter;
    });
  }, [allCafes, venueFilter]);

  const handleSelectCafe = (cafe: Cafe) => {
    if ((isVenueManager || isChef) && currentCafe?.cafeId !== cafe.cafeId) {
      showToast(`Access restricted: Your role is tied to ${currentCafe?.name}`);
      return;
    }
    setCurrentCafe(cafe);
    setActiveView('menu');
  };

  const handleOrderDishAtVenue = (dish: ExploreDish) => {
    if ((isVenueManager || isChef) && currentCafe?.cafeId !== dish.cafeId) {
      showToast(`Staff access is restricted to ${currentCafe?.name}`);
      return;
    }

    const targetCafe = allCafes.find((c) => c.cafeId === dish.cafeId);
    if (targetCafe) {
      setCurrentCafe(targetCafe);
      showToast(`Switched to ${targetCafe.name} for ${dish.name}`);
    }
    setActiveView('menu');
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-10 space-y-8">
      {/* Hero Header Banner */}
      <div className="relative overflow-hidden rounded-3xl sm:rounded-4xl p-6 sm:p-8 bg-gradient-to-br from-amber-500/15 via-[var(--card)] to-orange-500/10 border border-[var(--border)] shadow-sm">
        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 text-xs font-black uppercase tracking-wider mb-3 border border-amber-500/20">
            <Compass className="w-3.5 h-3.5 text-amber-500" />
            <span>Curated Culinary & Specialty Network</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-[var(--foreground)] tracking-tight">
            Where Is It Available? Where Is It Best?
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-2 font-medium leading-relaxed">
            Search signature dishes across artisanal cafes, roasteries, and evening lounges. 
            Compare artisanal preparation, chef notes, and dine-in or order to your table.
          </p>
        </div>
      </div>

      {/* Seated In-Hotel vs Outside Explorer Banner */}
      <div className="bg-[var(--card)] rounded-3xl border border-[var(--border)] p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20 flex-shrink-0">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[var(--card-foreground)] flex items-center gap-2">
              <span>Seated inside one of our restaurants or hotels?</span>
              <span className="text-[10px] bg-emerald-500/15 text-emerald-600 font-bold px-2 py-0.5 rounded-full">
                Active Table: {tableId}
              </span>
            </h2>
            <p className="text-xs text-[var(--muted-foreground)]">
              Scan your physical table QR to instantly synchronize your dining session and order straight to your seat.
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsQRModalOpen(true)}
          className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-[var(--primary)] text-[var(--primary-foreground)] text-xs font-black flex items-center justify-center gap-2 shadow-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
        >
          <QrCode className="w-4 h-4" />
          <span>Scan Table QR</span>
        </button>
      </div>

      {/* Main Mode Switcher: Dish Finder vs Venues */}
      <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('dishes')}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'dishes'
                ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm'
                : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--card-foreground)]'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>Dish Finder & Best In Town</span>
          </button>
          <button
            onClick={() => setActiveTab('venues')}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'venues'
                ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm'
                : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--card-foreground)]'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>All Specialty Venues ({allCafes.length})</span>
          </button>
        </div>

        {activeTab === 'dishes' && (
          <span className="text-xs text-[var(--muted-foreground)] font-semibold hidden md:inline">
            Showing {filteredDishes.length} signature dishes
          </span>
        )}
      </div>

      {/* Tab 1: Dish Finder */}
      {activeTab === 'dishes' && (
        <div className="space-y-6">
          {/* Search bar & Category filters */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
              <input
                type="text"
                placeholder="Search any dish or craving (e.g. Croissant, Basque Cheesecake, Pour Over, Matcha, Sourdough, Truffle)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[var(--card)] text-[var(--card-foreground)] border border-[var(--border)] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--muted-foreground)] hover:text-[var(--card-foreground)] cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Category chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedTag(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedTag === cat
                      ? 'bg-[var(--card-foreground)] text-[var(--card)] shadow-xs'
                      : 'bg-[var(--card)] text-[var(--muted-foreground)] border border-[var(--border)] hover:bg-[var(--muted)]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Dishes Grid */}
          {filteredDishes.length === 0 ? (
            <div className="text-center py-16 bg-[var(--card)] rounded-3xl border border-[var(--border)] space-y-3">
              <UtensilsCrossed className="w-10 h-10 mx-auto text-[var(--muted-foreground)] opacity-50" />
              <p className="text-sm font-bold text-[var(--card-foreground)]">No dishes found matching your search</p>
              <p className="text-xs text-[var(--muted-foreground)]">Try searching for "Croissant", "Cheesecake", "Matcha" or select "All".</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedTag('All');
                }}
                className="px-4 py-2 rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] text-xs font-bold cursor-pointer"
              >
                Reset Search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDishes.map((dish) => {
                const isCurrentVenue = currentCafe?.cafeId === dish.cafeId;
                const isStaffLocked = (isVenueManager || isChef) && !isCurrentVenue;

                return (
                  <motion.div
                    key={dish.itemId}
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.2 }}
                    className={`rounded-3xl border transition-all duration-300 overflow-hidden flex flex-col justify-between bg-[var(--card)] shadow-xs hover:shadow-xl ${
                      isCurrentVenue
                        ? 'border-amber-500/50 ring-1 ring-amber-500/20'
                        : 'border-[var(--border)] hover:border-amber-500/30'
                    }`}
                  >
                    <div>
                      {/* Image header with tags */}
                      <div className="relative h-48 w-full overflow-hidden bg-[var(--muted)]">
                        <img
                          src={dish.image}
                          alt={dish.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                        {/* Top Rating Pill */}
                        <div className="absolute top-3 left-3 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-[11px] font-black border border-white/10 shadow-sm">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span>{dish.rating}</span>
                          <span className="text-white/60 text-[10px]">({dish.orders}+)</span>
                        </div>

                        {/* Best In Town Badge */}
                        <div className="absolute top-3 right-3 bg-amber-500 text-zinc-950 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md">
                          {dish.bestTag}
                        </div>

                        {/* Venue Tag Overlay */}
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                          <div className="flex items-center gap-1.5 text-xs font-bold drop-shadow-md">
                            <span>{dish.cafeIcon}</span>
                            <span className="truncate">{dish.cafeName}</span>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md font-semibold border border-white/20">
                            {dish.venueType}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 space-y-3.5">
                        <div className="flex items-start justify-between gap-2">
                          <h2 className="font-extrabold text-base text-[var(--card-foreground)] leading-tight">
                            {dish.name}
                          </h2>
                          <span className="text-base font-black text-amber-600 dark:text-amber-400 whitespace-nowrap">
                            ₹{dish.price}
                          </span>
                        </div>

                        <p className="text-xs text-[var(--muted-foreground)] line-clamp-2 leading-relaxed font-medium">
                          {dish.description}
                        </p>

                        {/* Why it's best recommendation callout */}
                        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1">
                          <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300 font-black text-[11px]">
                            <Award className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                            <span>Why It's Ranked Best Here:</span>
                          </div>
                          <p className="text-[11px] text-[var(--card-foreground)] leading-snug font-medium">
                            {dish.recommendationReason}
                          </p>
                        </div>

                        {/* Location pin */}
                        <div className="flex items-center gap-1.5 text-[11px] text-[var(--muted-foreground)] font-medium">
                          <MapPin className="w-3 h-3 text-amber-500 flex-shrink-0" />
                          <span className="truncate">{dish.cafeLocation}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="p-4 bg-[var(--muted)]/40 border-t border-[var(--border)]">
                      {isStaffLocked ? (
                        <div className="py-2.5 px-3 rounded-2xl bg-[var(--muted)] text-[var(--muted-foreground)] text-xs font-bold flex items-center justify-center gap-1.5">
                          <Lock className="w-3.5 h-3.5" />
                          <span>Staff bound to {currentCafe?.name}</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleOrderDishAtVenue(dish)}
                          className="w-full py-2.5 px-4 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-95 cursor-pointer"
                          style={{
                            backgroundColor: isCurrentVenue ? 'var(--primary)' : 'var(--card)',
                            color: isCurrentVenue ? 'var(--primary-foreground)' : 'var(--card-foreground)',
                            border: isCurrentVenue ? 'none' : '1px solid var(--border)'
                          }}
                        >
                          {isCurrentVenue ? (
                            <>
                              <span>Order at Current Cafe (Menu)</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </>
                          ) : (
                            <>
                              <span>Order at {dish.cafeName}</span>
                              <ArrowRight className="w-3.5 h-3.5 text-amber-500" />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: All Specialty Venues */}
      {activeTab === 'venues' && (
        <div className="space-y-6">
          {/* Filter Tabs & Support Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'all', label: 'All Venues' },
                { id: 'cafe', label: 'Artisanal Cafes' },
                { id: 'roastery', label: 'Direct Roasteries' },
                { id: 'lounge', label: 'Evening Lounges' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setVenueFilter(tab.id)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer shadow-xs ${
                    venueFilter === tab.id
                      ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-md scale-105'
                      : 'bg-[var(--card)] text-[var(--card-foreground)] border border-[var(--border)] hover:bg-[var(--muted)]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {isSupport && (
              <button
                type="button"
                onClick={() => setIsVenueOnboardingOpen(true)}
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-black shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Onboard New Venue</span>
              </button>
            )}
          </div>

          {/* Cafes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCafes.map((cafe) => {
              const isSelected = currentCafe?.cafeId === cafe.cafeId;
              const t = cafe.theme;
              const isStaffLocked = (isVenueManager || isChef) && !isSelected;

              return (
                <motion.div
                  key={cafe.cafeId}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                  className={`rounded-3xl border transition-all duration-300 overflow-hidden flex flex-col justify-between group shadow-xs hover:shadow-xl ${
                    isSelected
                      ? 'border-amber-500 ring-2 ring-amber-500/30 bg-[var(--card)] shadow-md'
                      : 'border-[var(--border)] bg-[var(--card)] hover:border-amber-500/30'
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-md border border-[var(--border)] group-hover:scale-105 transition-transform"
                        style={{ backgroundColor: t.primary, color: t.primaryForeground }}
                      >
                        {cafe.icon}
                      </div>
                      {isSelected ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-600 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 shadow-xs">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Active Venue
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-[var(--muted-foreground)] px-2.5 py-1 rounded-xl bg-[var(--muted)] border border-[var(--border)] uppercase tracking-wider">
                          {cafe.venueType}
                        </span>
                      )}
                    </div>

                    <h2 className="text-xl font-extrabold text-[var(--card-foreground)] mb-1 group-hover:text-amber-500 transition-colors">
                      {cafe.name}
                    </h2>
                    <p className="text-xs text-[var(--muted-foreground)] italic font-medium mb-4">
                      "{cafe.tagline}"
                    </p>

                    <div className="space-y-2 text-xs text-[var(--muted-foreground)] mb-5 font-medium">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                        <span className="truncate">{cafe.location}</span>
                      </div>
                      {cafe.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                          <span>{cafe.phone}</span>
                        </div>
                      )}
                    </div>

                    {/* Theme Palette Preview Swatches */}
                    <div className="border-t border-[var(--border)] pt-3.5">
                      <div className="text-[11px] font-bold text-[var(--muted-foreground)] mb-2 flex items-center justify-between">
                        <span>Branded Color Spectrum</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[var(--muted)]">
                          {t.fontDisplay ? t.fontDisplay.split(',')[0] : 'Sans'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-7 h-7 rounded-xl border border-black/10 dark:border-white/10 shadow-xs transition-transform hover:scale-110"
                          style={{ backgroundColor: t.primary }}
                          title="Primary"
                        />
                        <div
                          className="w-7 h-7 rounded-xl border border-black/10 dark:border-white/10 shadow-xs transition-transform hover:scale-110"
                          style={{ backgroundColor: t.secondary }}
                          title="Secondary"
                        />
                        <div
                          className="w-7 h-7 rounded-xl border border-black/10 dark:border-white/10 shadow-xs transition-transform hover:scale-110"
                          style={{ backgroundColor: t.accent }}
                          title="Accent"
                        />
                        <div
                          className="w-7 h-7 rounded-xl border border-black/10 dark:border-white/10 shadow-xs transition-transform hover:scale-110"
                          style={{ backgroundColor: t.background }}
                          title="Background"
                        />
                        <div
                          className="w-7 h-7 rounded-xl border border-black/10 dark:border-white/10 shadow-xs transition-transform hover:scale-110"
                          style={{ backgroundColor: t.foreground }}
                          title="Foreground"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="p-4 bg-[var(--muted)]/40 border-t border-[var(--border)] flex items-center justify-between gap-3">
                    {isStaffLocked ? (
                      <div className="w-full py-2.5 px-3 rounded-2xl bg-[var(--muted)] text-[var(--muted-foreground)] text-xs font-bold flex items-center justify-center gap-1.5">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Staff access bound to {currentCafe?.name}</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleSelectCafe(cafe)}
                        className="w-full py-2.5 px-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-95 cursor-pointer"
                        style={{
                          backgroundColor: isSelected ? 'var(--primary)' : 'var(--card)',
                          color: isSelected ? 'var(--primary-foreground)' : 'var(--card-foreground)',
                          border: isSelected ? 'none' : '1px solid var(--border)'
                        }}
                      >
                        <span>{isSelected ? 'Browse Active Menu' : 'Switch to this Venue'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
