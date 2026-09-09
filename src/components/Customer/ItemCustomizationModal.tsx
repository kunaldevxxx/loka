import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Minus, Check, Sparkles, SlidersHorizontal, CheckCircle2 } from 'lucide-react';

export const ItemCustomizationModal: React.FC = () => {
  const {
    selectedItemForCustomization,
    setSelectedItemForCustomization,
    addToCart
  } = useApp();

  const item = selectedItemForCustomization;

  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedMilk, setSelectedMilk] = useState<string>('');
  const [selectedSweetness, setSelectedSweetness] = useState<string>('Standard (100%)');
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [qty, setQty] = useState<number>(1);

  useEffect(() => {
    if (item) {
      if (item.sizes && item.sizes.length > 0) {
        setSelectedSize(item.sizes[0].label);
      } else {
        setSelectedSize('');
      }

      if (item.milkOptions && item.milkOptions.length > 0) {
        setSelectedMilk(item.milkOptions[0]);
      } else {
        setSelectedMilk('');
      }

      setSelectedSweetness('Standard (100%)');
      setSelectedExtras([]);
      setNotes('');
      setQty(1);
    }
  }, [item]);

  if (!item) return null;

  // Compute live price
  let currentUnitPrice = item.price;
  if (selectedSize && item.sizes) {
    const sizeObj = item.sizes.find((s) => s.label === selectedSize);
    if (sizeObj) currentUnitPrice += sizeObj.extra;
  }
  if (selectedMilk) {
    if (selectedMilk.includes('Oat') || selectedMilk.includes('Almond')) {
      currentUnitPrice += 40;
    } else if (selectedMilk.includes('Soy')) {
      currentUnitPrice += 30;
    }
  }
  if (selectedExtras.length > 0 && item.addOns) {
    selectedExtras.forEach((extraLabel) => {
      const match = item.addOns?.find((a) => a.label === extraLabel);
      if (match) currentUnitPrice += match.price;
    });
  }

  const calculatedTotal = currentUnitPrice * qty;

  const handleToggleExtra = (label: string) => {
    setSelectedExtras((prev) =>
      prev.includes(label) ? prev.filter((e) => e !== label) : [...prev, label]
    );
  };

  const handleConfirmAddToCart = () => {
    addToCart(item, qty, {
      size: selectedSize || undefined,
      milk: selectedMilk || undefined,
      sweetness: selectedSweetness,
      extras: selectedExtras,
      notes: notes.trim() || undefined
    });
    setSelectedItemForCustomization(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 320 }}
        className="relative w-full max-w-lg bg-[var(--card)] text-[var(--card-foreground)] rounded-3xl sm:rounded-4xl border border-[var(--border)] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header with image */}
        <div className="relative h-48 bg-[var(--muted)] flex-shrink-0 overflow-hidden">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />

          <button
            onClick={() => setSelectedItemForCustomization(null)}
            className="absolute top-3.5 right-3.5 w-9 h-9 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/90 transition-all cursor-pointer border border-white/10"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="absolute bottom-3.5 left-4 right-4 text-white">
            <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold mb-1">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Barista Recipe Tuning</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black leading-tight tracking-tight">{item.name}</h2>
            <p className="text-xs text-zinc-300 line-clamp-1 mt-0.5">{item.description}</p>
          </div>
        </div>

        {/* Customization Options Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 divide-y divide-[var(--border)]">
          {/* Size selection */}
          {item.sizes && item.sizes.length > 0 && (
            <div className="pt-2 first:pt-0">
              <label className="block text-xs font-black uppercase tracking-wider text-[var(--muted-foreground)] mb-2.5">
                Cup / Serving Size
              </label>
              <div className="grid grid-cols-2 gap-2">
                {item.sizes.map((size) => {
                  const isSelected = selectedSize === size.label;
                  return (
                    <button
                      key={size.label}
                      type="button"
                      onClick={() => setSelectedSize(size.label)}
                      className={`px-3.5 py-3 rounded-2xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500/15 text-[var(--foreground)] ring-1 ring-amber-500 shadow-sm'
                          : 'border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:bg-[var(--muted)]'
                      }`}
                    >
                      <span className="font-extrabold">{size.label}</span>
                      <span className={`text-[11px] font-black ${isSelected ? 'text-amber-500' : ''}`}>
                        {size.extra > 0 ? `+₹${size.extra}` : 'Standard'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Milk Options */}
          {item.milkOptions && item.milkOptions.length > 0 && (
            <div className="pt-4">
              <label className="block text-xs font-black uppercase tracking-wider text-[var(--muted-foreground)] mb-2.5">
                Dairy & Plant Milk
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {item.milkOptions.map((milk) => {
                  const isSelected = selectedMilk === milk;
                  return (
                    <button
                      key={milk}
                      type="button"
                      onClick={() => setSelectedMilk(milk)}
                      className={`px-3 py-2.5 rounded-2xl border text-xs text-left truncate transition-all cursor-pointer ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500/15 text-[var(--foreground)] font-black ring-1 ring-amber-500 shadow-sm'
                          : 'border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:bg-[var(--muted)] font-medium'
                      }`}
                    >
                      {milk}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sweetness */}
          {item.category.includes('Coffee') && (
            <div className="pt-4">
              <label className="block text-xs font-black uppercase tracking-wider text-[var(--muted-foreground)] mb-2.5">
                Sweetness Balance
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['No Sugar', 'Less (50%)', 'Standard (100%)', 'Extra Sweet'].map((level) => {
                  const isSelected = selectedSweetness === level;
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setSelectedSweetness(level)}
                      className={`py-2 px-2 rounded-xl border text-[11px] font-bold text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500/15 text-[var(--foreground)] font-black ring-1 ring-amber-500'
                          : 'border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:bg-[var(--muted)]'
                      }`}
                    >
                      {level}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Add-ons */}
          {item.addOns && item.addOns.length > 0 && (
            <div className="pt-4">
              <label className="block text-xs font-black uppercase tracking-wider text-[var(--muted-foreground)] mb-2.5">
                Artisanal Syrups & Toppings
              </label>
              <div className="space-y-2">
                {item.addOns.map((addon) => {
                  const isChecked = selectedExtras.includes(addon.label);
                  return (
                    <button
                      key={addon.label}
                      type="button"
                      onClick={() => handleToggleExtra(addon.label)}
                      className={`w-full px-3.5 py-2.5 rounded-2xl border text-xs flex items-center justify-between transition-all cursor-pointer ${
                        isChecked
                          ? 'border-amber-500 bg-amber-500/15 text-[var(--foreground)] font-bold shadow-sm'
                          : 'border-[var(--border)] bg-[var(--card)] text-[var(--card-foreground)] hover:bg-[var(--muted)]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                            isChecked
                              ? 'bg-amber-500 border-amber-500 text-white'
                              : 'border-[var(--border)] bg-[var(--card)]'
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <span className="font-semibold">{addon.label}</span>
                      </div>
                      <span className="font-black text-amber-600 dark:text-amber-400">+₹{addon.price}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Special instructions */}
          <div className="pt-4">
            <label className="block text-xs font-black uppercase tracking-wider text-[var(--muted-foreground)] mb-1.5">
              Barista Notes & Preparation Preferences
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Extra hot, splash of cinnamon, double cup..."
              className="w-full text-xs p-3 rounded-2xl border border-[var(--border)] bg-[var(--muted)]/50 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none font-medium placeholder:text-[var(--muted-foreground)]"
            />
          </div>
        </div>

        {/* Footer with Qty & Add to Cart */}
        <div className="p-4 sm:p-5 bg-[var(--card)] border-t border-[var(--border)] flex items-center justify-between gap-3 sm:gap-4 shadow-lg">
          {/* Quantity Controls */}
          <div className="flex items-center gap-2 bg-[var(--muted)] px-3 py-2 rounded-2xl border border-[var(--border)]">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="p-1 text-[var(--card-foreground)] hover:text-red-500 transition-colors cursor-pointer active:scale-90"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-6 text-center font-black text-sm text-[var(--card-foreground)]">
              {qty}
            </span>
            <button
              onClick={() => setQty((q) => q + 1)}
              className="p-1 text-[var(--card-foreground)] hover:text-emerald-500 transition-colors cursor-pointer active:scale-90"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add Button */}
          <button
            onClick={handleConfirmAddToCart}
            className="flex-1 py-3.5 px-5 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-between transition-all shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 cursor-pointer"
            style={{
              backgroundColor: 'var(--primary)',
              color: 'var(--primary-foreground)'
            }}
          >
            <span>Add Customized Item</span>
            <span className="font-black text-base">₹{calculatedTotal}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
