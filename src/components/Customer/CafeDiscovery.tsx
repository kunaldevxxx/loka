import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Cafe } from '../../types/api';
import { motion } from 'motion/react';
import { MapPin, Phone, CheckCircle, ArrowRight, Sparkles, Building2, Coffee, Star } from 'lucide-react';

export const CafeDiscovery: React.FC = () => {
  const { allCafes, currentCafe, setCurrentCafe, setActiveView, showToast } = useApp();
  const [filterType, setFilterType] = useState<string>('all');

  const filteredCafes = allCafes.filter((c) => {
    if (filterType === 'all') return true;
    return c.venueType === filterType;
  });

  const handleSelectCafe = (cafe: Cafe) => {
    setCurrentCafe(cafe);
    showToast(`Switched venue to ${cafe.name}`);
    setActiveView('menu');
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-10 space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl sm:rounded-4xl p-6 sm:p-8 bg-gradient-to-br from-amber-500/15 via-[var(--card)] to-orange-500/10 border border-[var(--border)] shadow-sm">
        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 text-xs font-black uppercase tracking-wider mb-3 border border-amber-500/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Multi-Venue Specialty Network</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-[var(--foreground)] tracking-tight">
            Explore Curated Specialty Cafes
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-2 font-medium leading-relaxed">
            Switching venues dynamically re-themes your digital portal, loads live roast batches, unlocks exclusive kitchen items, and pairs you with the localized barista bar.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'all', label: 'All Venues' },
          { id: 'cafe', label: 'Artisanal Cafes' },
          { id: 'roastery', label: 'Direct Roasteries' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer shadow-xs ${
              filterType === tab.id
                ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-md scale-105'
                : 'bg-[var(--card)] text-[var(--card-foreground)] border border-[var(--border)] hover:bg-[var(--muted)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Cafes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCafes.map((cafe) => {
          const isSelected = currentCafe?.cafeId === cafe.cafeId;
          const t = cafe.theme;

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

                <h3 className="text-xl font-extrabold text-[var(--card-foreground)] mb-1 group-hover:text-amber-500 transition-colors">
                  {cafe.name}
                </h3>
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
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[var(--muted)]">{t.fontDisplay.split(',')[0]}</span>
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
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
