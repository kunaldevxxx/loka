import React from 'react';
import { MenuItem } from '../../types/api';
import { useApp } from '../../context/AppContext';
import { motion } from 'motion/react';
import { Star, Plus, Sparkles, Flame, Award, SlidersHorizontal } from 'lucide-react';

interface MenuItemCardProps {
  item: MenuItem;
  isRecommended?: boolean;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, isRecommended }) => {
  const { setSelectedItemForCustomization } = useApp();

  const getTagBadge = (tag: string) => {
    switch (tag.toLowerCase()) {
      case 'bestseller':
        return (
          <span
            key={tag}
            className="bg-gradient-to-r from-amber-500 to-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wider flex items-center gap-1 shadow-sm"
          >
            <Flame className="w-2.5 h-2.5 fill-white" />
            Bestseller
          </span>
        );
      case 'signature':
        return (
          <span
            key={tag}
            className="bg-gradient-to-r from-amber-400 to-yellow-600 text-zinc-950 text-[10px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wider flex items-center gap-1 shadow-sm"
          >
            <Award className="w-2.5 h-2.5" />
            Signature
          </span>
        );
      case 'chef-pick':
        return (
          <span
            key={tag}
            className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wider flex items-center gap-1 shadow-sm"
          >
            <Sparkles className="w-2.5 h-2.5" />
            Chef Pick
          </span>
        );
      default:
        return (
          <span
            key={tag}
            className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase tracking-wider border border-white/10"
          >
            {tag}
          </span>
        );
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={`bg-[var(--card)] text-[var(--card-foreground)] rounded-3xl border border-[var(--border)] overflow-hidden shadow-xs hover:shadow-xl hover:border-amber-500/30 transition-all duration-300 flex flex-col justify-between group ${
        !item.available ? 'opacity-65 grayscale-20' : ''
      }`}
    >
      {/* Image container */}
      <div className="relative h-48 w-full overflow-hidden bg-[var(--muted)]">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
          loading="lazy"
          referrerPolicy="no-referrer"
        />

        {/* Gradient vignette on image */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* Tags badge */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 max-w-[85%] z-10">
          {isRecommended && (
            <span className="bg-gradient-to-r from-orange-500 to-rose-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-lg uppercase tracking-wider flex items-center gap-1 shadow-md shimmer-mask">
              <Sparkles className="w-2.5 h-2.5" />
              Chef Recommended
            </span>
          )}
          {(item.tags || []).map(getTagBadge)}
        </div>

        {/* Rating & Orders pill */}
        <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-white/10 shadow-md">
          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
          <span>{item.rating ?? 4.8}</span>
          <span className="text-[10px] text-zinc-300 font-normal">({item.orders ?? 95})</span>
        </div>

        {/* Category tag */}
        <div className="absolute bottom-3 left-3 bg-white/20 dark:bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border border-white/15">
          {item.category}
        </div>

        {!item.available && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
            <span className="bg-red-500/90 text-white font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-3">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="font-extrabold text-base sm:text-lg text-[var(--card-foreground)] leading-snug group-hover:text-[var(--accent)] transition-colors">
              {item.name}
            </h3>
            <span className="font-black text-base text-[var(--foreground)] whitespace-nowrap tracking-tight">
              ₹{item.price}
            </span>
          </div>

          <p className="text-xs text-[var(--muted-foreground)] line-clamp-2 leading-relaxed font-normal">
            {item.description}
          </p>

          {item.recommendationReason && (
            <div className="mt-2.5 py-1 px-2.5 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 text-[11px] font-semibold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-500 flex-shrink-0" />
              <span className="truncate">{item.recommendationReason}</span>
            </div>
          )}
        </div>

        {/* Action Row */}
        <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between gap-2">
          <div className="text-[11px] text-[var(--muted-foreground)] font-medium">
            {item.sizes && item.sizes.length > 0 ? (
              <span className="flex items-center gap-1">
                <SlidersHorizontal className="w-3 h-3 text-amber-500" />
                <span>{item.sizes.length} sizes available</span>
              </span>
            ) : (
              <span>Standard serving</span>
            )}
          </div>

          <button
            onClick={() => setSelectedItemForCustomization(item)}
            disabled={!item.available}
            className="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm hover:shadow-md hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            style={{
              backgroundColor: 'var(--primary)',
              color: 'var(--primary-foreground)'
            }}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Customize</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
