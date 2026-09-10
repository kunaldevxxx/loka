import React from 'react';
import { MenuItem } from '../../types/api';
import { useApp } from '../../context/AppContext';
import { motion } from 'motion/react';
import {
  Sparkles,
  SlidersHorizontal,
  Coffee,
  Compass,
  Flame,
  Award,
  Plus
} from 'lucide-react';

interface MenuItemCardProps {
  item: MenuItem;
  isRecommended?: boolean;
}

// Generates rich artisanal sensory profile & estate origin for specialty coffee & bakery items
function getSensoryProfile(item: MenuItem) {
  const name = item.name.toLowerCase();
  const cat = item.category.toLowerCase();

  let origin = 'Estate Reserve • Direct Trade';
  let roastLevel = 2; // 1: Light, 2: Medium, 3: Medium-Dark, 4: Dark
  let notes: string[] = ['Velvety Cocoa', 'Warm Caramel'];
  let process = 'Washed Arabica';

  if (name.includes('cappuccino') || name.includes('latte') || name.includes('flat white')) {
    origin = 'Chikmagalur Micro-lot • 1,350m';
    roastLevel = 3;
    notes = ['Dark Cacao', 'Toasted Hazelnut', 'Silky Microfoam'];
    process = 'Slow Roast • Washed';
  } else if (name.includes('espresso') || name.includes('americano') || name.includes('cortado')) {
    origin = 'Coorg Peaberry Single Estate';
    roastLevel = 4;
    notes = ['Bittersweet Crema', 'Black Walnut', 'Malted Grain'];
    process = 'Dark Espresso Pull';
  } else if (name.includes('cold brew') || name.includes('tonic') || name.includes('martini')) {
    origin = 'Monsooned Malabar • 18h Extraction';
    roastLevel = 2;
    notes = ['Citrus Zest', 'Stone Fruit', 'Dark Chocolate'];
    process = 'Cold Steeped 18h';
  } else if (name.includes('matcha') || name.includes('tea') || name.includes('chai')) {
    origin = 'Ceremonial Grade • Uji / Assam';
    roastLevel = 1;
    notes = ['Sweet Grass', 'Cardamom Pod', 'Almond Milk'];
    process = 'Stone Milled';
  } else if (name.includes('croissant') || name.includes('danish') || name.includes('pain')) {
    origin = 'Normandy AOP Butter Viennoiserie';
    roastLevel = 1;
    notes = ['Honeycomb Flake', 'Caramelized Crust', 'Pure Butter'];
    process = 'Hearth Baked 6:30 AM';
  } else if (name.includes('sourdough') || name.includes('toast') || name.includes('sandwich') || name.includes('avocado')) {
    origin = 'Wild Yeast Sourdough • 48h Ferment';
    roastLevel = 2;
    notes = ['Rustic Crust', 'Cold-Pressed Olive', 'Flaky Sea Salt'];
    process = 'Slow Levain Ferment';
  } else if (name.includes('tiramisu') || name.includes('cheesecake') || name.includes('tart') || name.includes('cake')) {
    origin = 'Valrhona Grand Cru • House Pâtisserie';
    roastLevel = 2;
    notes = ['Mascarpone Silk', 'Espresso Soak', 'Dutch Cocoa'];
    process = 'Fresh Pâtisserie Daily';
  }

  return { origin, roastLevel, notes, process };
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, isRecommended }) => {
  const { setSelectedItemForCustomization } = useApp();
  const sensory = getSensoryProfile(item);

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`bg-[var(--card)] text-[var(--card-foreground)] rounded-3xl border border-[var(--border)] overflow-hidden shadow-xs hover:shadow-xl hover:border-amber-500/30 transition-all duration-300 flex flex-col justify-between group relative ${
        !item.available ? 'opacity-60 grayscale-30' : ''
      }`}
    >
      {/* Visual Photography Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[var(--muted)]">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-700 ease-out"
          loading="lazy"
          referrerPolicy="no-referrer"
        />

        {/* Tactile Vignette Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30 pointer-events-none" />

        {/* Top Floating Pill: Estate Origin */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 max-w-[88%] z-10">
          <span className="bg-black/65 backdrop-blur-md text-amber-200/90 text-[10px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-white/10 flex items-center gap-1 shadow-sm">
            <Compass className="w-2.5 h-2.5 text-amber-400" />
            <span className="truncate max-w-[160px]">{sensory.origin}</span>
          </span>

          {isRecommended && (
            <span className="bg-amber-500 text-zinc-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-md">
              <Sparkles className="w-2.5 h-2.5" />
              Barista Selection
            </span>
          )}
        </div>

        {/* Bottom Image Overlay: Roast / Method & Category */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-10 text-white">
          <div className="flex items-center gap-1 text-[11px] font-medium bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
            <span className="text-[10px] text-amber-300 uppercase tracking-wide font-bold">Roast</span>
            <div className="flex items-center gap-0.5 ml-1">
              {[1, 2, 3, 4].map((dot) => (
                <span
                  key={dot}
                  className={`w-1.5 h-1.5 rounded-full ${
                    dot <= sensory.roastLevel ? 'bg-amber-400' : 'bg-white/20'
                  }`}
                />
              ))}
            </div>
          </div>

          <span className="text-[10px] uppercase font-bold tracking-widest bg-white/20 backdrop-blur-md text-white/90 px-2 py-0.5 rounded-md border border-white/15">
            {item.category}
          </span>
        </div>

        {!item.available && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-20">
            <span className="bg-zinc-900/90 text-amber-300 border border-amber-500/30 font-black text-xs px-4 py-1.5 rounded-full uppercase tracking-widest shadow-xl">
              Batch Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Editorial Content Container */}
      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
        <div className="space-y-2.5">
          {/* Dish / Drink Title & Price in Editorial Typography */}
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-editorial text-lg sm:text-xl font-bold text-[var(--card-foreground)] leading-tight group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              {item.name}
            </h3>
            <span className="font-editorial font-black text-lg text-[var(--foreground)] whitespace-nowrap tracking-tight bg-amber-500/10 dark:bg-amber-500/15 px-2.5 py-0.5 rounded-xl border border-amber-500/20">
              ₹{item.price}
            </span>
          </div>

          {/* Description */}
          <p className="text-xs text-[var(--muted-foreground)] line-clamp-2 leading-relaxed font-normal">
            {item.description}
          </p>

          {/* Sensory Tasting Notes Chips */}
          <div className="pt-1 flex flex-wrap items-center gap-1.5">
            {sensory.notes.map((note, idx) => (
              <span
                key={idx}
                className="text-[10px] font-medium bg-[var(--muted)] text-[var(--muted-foreground)] px-2 py-0.5 rounded-lg border border-[var(--border)] tracking-tight"
              >
                {note}
              </span>
            ))}
          </div>

          {/* Sommelier / Barista Note if present */}
          {item.recommendationReason && (
            <div className="py-1.5 px-3 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 text-[11px] font-medium text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-500 flex-shrink-0" />
              <span className="truncate">{item.recommendationReason}</span>
            </div>
          )}
        </div>

        {/* Action Row: Micro-Crafting Details & Tactile Order Button */}
        <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between gap-2">
          <div className="text-[11px] text-[var(--muted-foreground)] font-medium">
            {item.sizes && item.sizes.length > 0 ? (
              <span className="flex items-center gap-1">
                <SlidersHorizontal className="w-3 h-3 text-amber-500" />
                <span>{item.sizes.length} sizes • Milk choices</span>
              </span>
            ) : (
              <span className="text-[10px] uppercase tracking-wide text-[var(--muted-foreground)]">
                Handcrafted Single Batch
              </span>
            )}
          </div>

          <button
            onClick={() => setSelectedItemForCustomization(item)}
            disabled={!item.available}
            className="px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-1.5 transition-all shadow-sm hover:shadow-md hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer tracking-wide"
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
