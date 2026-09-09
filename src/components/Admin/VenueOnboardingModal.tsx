import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../lib/api';
import { Cafe, CafeTheme, MenuItem } from '../../types/api';
import {
  Store,
  Plus,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  X,
  Image as ImageIcon,
  Coffee,
  Award,
  MapPin,
  Phone,
  Palette,
  UtensilsCrossed,
  Trash2,
  ChevronRight,
  Tag
} from 'lucide-react';

const THEME_PRESETS = [
  {
    name: 'Emerald Roastery',
    primary: '#059669',
    secondary: '#047857',
    accent: '#10b981',
    background: '#f6fbf8',
    foreground: '#123026'
  },
  {
    name: 'Amber Artisanal',
    primary: '#d97706',
    secondary: '#b45309',
    accent: '#f59e0b',
    background: '#faf8f5',
    foreground: '#1c1917'
  },
  {
    name: 'Velvet Lounge',
    primary: '#7c3aed',
    secondary: '#6d28d9',
    accent: '#8b5cf6',
    background: '#faf5f9',
    foreground: '#1c1427'
  },
  {
    name: 'Nordic Minimalist',
    primary: '#0284c7',
    secondary: '#0369a1',
    accent: '#38bdf8',
    background: '#f0f9ff',
    foreground: '#082f49'
  },
  {
    name: 'Bakehouse Rose',
    primary: '#e11d48',
    secondary: '#be123c',
    accent: '#f43f5e',
    background: '#fff1f2',
    foreground: '#4c0519'
  }
];

const EMOJI_PRESETS = ['☕', '🫘', '🌿', '🍸', '🥐', '🍰', '🥞', '🍕', '🥯'];

const IMAGE_PRESETS = [
  { label: 'Artisan Latte', url: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600&auto=format&fit=crop&q=80' },
  { label: 'Pour-Over Chemex', url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80' },
  { label: 'Flaky Croissant', url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&auto=format&fit=crop&q=80' },
  { label: 'Avocado Toast', url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&auto=format&fit=crop&q=80' },
  { label: 'Basque Cheesecake', url: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600&auto=format&fit=crop&q=80' },
  { label: 'Matcha Latte', url: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&auto=format&fit=crop&q=80' }
];

interface StagedItem {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  bestTag: string;
  recommendationReason: string;
}

export const VenueOnboardingModal: React.FC = () => {
  const {
    isVenueOnboardingOpen,
    setIsVenueOnboardingOpen,
    isSupport,
    reloadCafes,
    setCurrentCafe,
    setActiveView,
    showToast
  } = useApp();

  const [activeStep, setActiveStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Venue Identity
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [venueType, setVenueType] = useState('cafe');
  const [icon, setIcon] = useState('☕');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('+91-');
  const [defaultTableId, setDefaultTableId] = useState('table-01');
  const [selectedThemeIndex, setSelectedThemeIndex] = useState(0);
  const [customPrimary, setCustomPrimary] = useState(THEME_PRESETS[0].primary);

  // Step 2: Menu Details
  const [stagedItems, setStagedItems] = useState<StagedItem[]>([
    {
      id: 'staged-1',
      name: 'House Signature Brew',
      category: 'Coffee Drinks',
      price: 240,
      description: 'Velvety espresso extracted with micro-lot beans, silky microfoam, and caramelized crema.',
      image: IMAGE_PRESETS[0].url,
      bestTag: '🏆 House Signature',
      recommendationReason: 'Hand-pulled by certified baristas using double-roasted single origin beans.'
    }
  ]);

  // Form for adding a menu item
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState('Coffee Drinks');
  const [itemPrice, setItemPrice] = useState('220');
  const [itemDescription, setItemDescription] = useState('');
  const [itemImage, setItemImage] = useState(IMAGE_PRESETS[1].url);
  const [itemBestTag, setItemBestTag] = useState('');
  const [itemRecommendationReason, setItemRecommendationReason] = useState('');

  if (!isVenueOnboardingOpen || !isSupport) return null;

  const handleAddStagedItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) {
      showToast('Please enter an item name');
      return;
    }

    const newItem: StagedItem = {
      id: `item-staged-${Date.now()}`,
      name: itemName.trim(),
      category: itemCategory,
      price: parseFloat(itemPrice) || 200,
      description: itemDescription.trim() || 'Prepared fresh in-house to order.',
      image: itemImage,
      bestTag: itemBestTag.trim() || '✨ Signature Specialty',
      recommendationReason: itemRecommendationReason.trim() || 'Crafted with premium artisanal ingredients.'
    };

    setStagedItems((prev) => [...prev, newItem]);
    setItemName('');
    setItemDescription('');
    setItemBestTag('');
    setItemRecommendationReason('');
    showToast(`Added "${newItem.name}" to initial venue menu`);
  };

  const handleRemoveStagedItem = (id: string) => {
    setStagedItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleFinalizeOnboarding = async () => {
    if (!name.trim()) {
      setActiveStep(1);
      showToast('Please enter a venue name');
      return;
    }

    setLoading(true);
    try {
      const preset = THEME_PRESETS[selectedThemeIndex];
      const builtTheme: CafeTheme = {
        background: preset.background,
        foreground: preset.foreground,
        card: '#ffffff',
        cardForeground: preset.foreground,
        primary: customPrimary || preset.primary,
        primaryForeground: '#ffffff',
        secondary: preset.secondary,
        secondaryForeground: '#ffffff',
        muted: '#f4efe9',
        mutedForeground: '#78716c',
        accent: preset.accent,
        accentForeground: '#ffffff',
        border: '#e7e0d8',
        fontDisplay: 'Outfit, sans-serif',
        fontSans: 'Plus Jakarta Sans, sans-serif'
      };

      const cafePayload = {
        name: name.trim(),
        tagline: tagline.trim() || 'Specialty Cafe & Kitchen',
        venueType,
        icon,
        location: location.trim() || 'City Center',
        phone: phone.trim() || '+91-9876543210',
        defaultTableId: defaultTableId.trim() || 'table-01',
        theme: builtTheme
      };

      const res = await api.createCafe(cafePayload);
      const createdCafe = res.cafe;

      // Add staged menu items to the new cafe
      if (stagedItems.length > 0 && createdCafe?.cafeId) {
        for (const item of stagedItems) {
          try {
            await api.createMenuItem(createdCafe.cafeId, {
              name: item.name,
              category: item.category,
              price: item.price,
              description: item.description,
              image: item.image,
              recommendationReason: item.recommendationReason,
              tags: [item.bestTag, item.category, 'Specialty']
            });
          } catch (itemErr) {
            console.warn(`Could not add item ${item.name}:`, itemErr);
          }
        }
      }

      await reloadCafes();
      if (createdCafe) {
        setCurrentCafe(createdCafe);
      }
      showToast(`Venue "${name}" onboarded successfully with ${stagedItems.length} menu items!`);
      setIsVenueOnboardingOpen(false);
      setActiveView('menu_management');
    } catch (err: any) {
      showToast(err.message || 'Failed to onboard venue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-[var(--card)] text-[var(--card-foreground)] rounded-3xl border border-[var(--border)] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[var(--border)] flex items-center justify-between bg-gradient-to-r from-blue-500/10 via-[var(--card)] to-amber-500/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20 shadow-sm font-black">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight">Onboard New Cafe Venue</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 font-bold border border-blue-500/20 uppercase tracking-wider">
                  Support Admin
                </span>
              </div>
              <p className="text-xs text-[var(--muted-foreground)]">
                Create venue profile, customize branding palette, and publish initial menu details.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsVenueOnboardingOpen(false)}
            className="p-1.5 rounded-xl hover:bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--card-foreground)] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Tabs */}
        <div className="px-6 pt-3 pb-2 border-b border-[var(--border)] flex items-center gap-3 bg-[var(--muted)]/40 text-xs font-bold">
          <button
            onClick={() => setActiveStep(1)}
            className={`flex items-center gap-2 pb-2 border-b-2 transition-all cursor-pointer ${
              activeStep === 1
                ? 'border-blue-500 text-blue-600 dark:text-blue-400 font-black'
                : 'border-transparent text-[var(--muted-foreground)] hover:text-[var(--card-foreground)]'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[11px] font-black">
              1
            </span>
            <span>Venue Profile & Theme</span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
          <button
            onClick={() => {
              if (!name.trim()) {
                showToast('Please specify a venue name first');
                return;
              }
              setActiveStep(2);
            }}
            className={`flex items-center gap-2 pb-2 border-b-2 transition-all cursor-pointer ${
              activeStep === 2
                ? 'border-blue-500 text-blue-600 dark:text-blue-400 font-black'
                : 'border-transparent text-[var(--muted-foreground)] hover:text-[var(--card-foreground)]'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[11px] font-black">
              2
            </span>
            <span>Initial Menu Items ({stagedItems.length})</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-xs">
          {activeStep === 1 && (
            <div className="space-y-4">
              {/* Name & Tagline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[var(--card-foreground)] flex items-center gap-1">
                    <span>Venue / Cafe Name *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. The Glasshouse Roastery"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[var(--muted)]/60 border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[var(--card-foreground)]">Tagline / Ethos</label>
                  <input
                    type="text"
                    placeholder="e.g. Nordic micro-lot roasts & sourdough pastries"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[var(--muted)]/60 border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Type, Icon, Default Table */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[var(--card-foreground)]">Venue Type</label>
                  <select
                    value={venueType}
                    onChange={(e) => setVenueType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[var(--muted)]/60 border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                  >
                    <option value="cafe">Artisanal Cafe</option>
                    <option value="roastery">Direct Roastery</option>
                    <option value="lounge">Evening Lounge</option>
                    <option value="bakery">French Bakery</option>
                    <option value="bistro">Specialty Bistro</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[var(--card-foreground)]">Brand Icon Emoji</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={icon}
                      onChange={(e) => setIcon(e.target.value)}
                      className="w-12 text-center text-lg py-1.5 rounded-xl bg-[var(--muted)]/60 border border-[var(--border)]"
                    />
                    <div className="flex items-center gap-1 overflow-x-auto">
                      {EMOJI_PRESETS.map((em) => (
                        <button
                          key={em}
                          type="button"
                          onClick={() => setIcon(em)}
                          className="p-1.5 rounded-lg hover:bg-[var(--muted)] text-base"
                        >
                          {em}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[var(--card-foreground)]">Default Table Code</label>
                  <input
                    type="text"
                    value={defaultTableId}
                    onChange={(e) => setDefaultTableId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[var(--muted)]/60 border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Location & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[var(--card-foreground)] flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-500" />
                    <span>Physical Location / Address</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Indiranagar 100ft Rd, Bangalore"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[var(--muted)]/60 border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[var(--card-foreground)] flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-orange-500" />
                    <span>Contact Phone</span>
                  </label>
                  <input
                    type="text"
                    placeholder="+91-9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[var(--muted)]/60 border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Color Theme Selector */}
              <div className="space-y-2 border-t border-[var(--border)] pt-3.5">
                <label className="text-[11px] font-bold text-[var(--card-foreground)] flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-blue-500" />
                  <span>Venue Branding Palette & Theme Preset</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {THEME_PRESETS.map((preset, idx) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        setSelectedThemeIndex(idx);
                        setCustomPrimary(preset.primary);
                      }}
                      className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        selectedThemeIndex === idx
                          ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-500/5'
                          : 'border-[var(--border)] bg-[var(--card)] hover:border-blue-500/30'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <div
                          className="w-4 h-4 rounded-full border border-black/10"
                          style={{ backgroundColor: preset.primary }}
                        />
                        <div
                          className="w-3 h-3 rounded-full border border-black/10"
                          style={{ backgroundColor: preset.accent }}
                        />
                      </div>
                      <span className="font-bold text-[11px] block truncate">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeStep === 2 && (
            <div className="space-y-5">
              {/* Staged Items List */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[var(--card-foreground)] flex items-center gap-1.5">
                    <UtensilsCrossed className="w-3.5 h-3.5 text-amber-500" />
                    <span>Venue Menu Roster ({stagedItems.length} items configured)</span>
                  </span>
                  <span className="text-[11px] text-[var(--muted-foreground)]">
                    Published automatically to customer menu & dish finder
                  </span>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {stagedItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-2xl bg-[var(--muted)]/50 border border-[var(--border)] flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                        />
                        <div className="truncate">
                          <div className="font-extrabold text-xs text-[var(--card-foreground)] flex items-center gap-2">
                            <span className="truncate">{item.name}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold">
                              ₹{item.price}
                            </span>
                          </div>
                          <div className="text-[11px] text-[var(--muted-foreground)] truncate">
                            {item.category} • {item.bestTag}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveStagedItem(item.id)}
                        className="p-1.5 rounded-xl text-[var(--muted-foreground)] hover:text-red-500 hover:bg-red-500/10 cursor-pointer"
                        title="Remove Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add another item form */}
              <div className="p-4 rounded-3xl bg-[var(--muted)]/30 border border-[var(--border)] space-y-3">
                <span className="text-xs font-black text-[var(--card-foreground)] flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-blue-500" />
                  <span>Add Another Dish to Menu</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[10px] font-bold text-[var(--card-foreground)]">Item Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Kyoto Ceremonial Uji Matcha"
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[var(--card)] border border-[var(--border)] focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--card-foreground)]">Price (₹) *</label>
                    <input
                      type="number"
                      value={itemPrice}
                      onChange={(e) => setItemPrice(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[var(--card)] border border-[var(--border)] focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--card-foreground)]">Category</label>
                    <select
                      value={itemCategory}
                      onChange={(e) => setItemCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[var(--card)] border border-[var(--border)] text-xs font-semibold"
                    >
                      <option value="Coffee Drinks">Coffee Drinks</option>
                      <option value="Manual Brews">Manual Brews</option>
                      <option value="Cold Beverages">Cold Beverages</option>
                      <option value="Pastries & Bakes">Pastries & Bakes</option>
                      <option value="Breakfast & Brunch">Breakfast & Brunch</option>
                      <option value="Desserts & Pairings">Desserts & Pairings</option>
                      <option value="Specialty Beverages">Specialty Beverages</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--card-foreground)]">Best Tag / Ranking</label>
                    <input
                      type="text"
                      placeholder="e.g. 🏆 #1 Ranked Matcha"
                      value={itemBestTag}
                      onChange={(e) => setItemBestTag(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[var(--card)] border border-[var(--border)] text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[var(--card-foreground)]">
                    Why It's Ranked Best Here (Chef / Recommendation Reason)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Hand-whisked stone-ground Uji matcha with velvety steamed oat milk."
                    value={itemRecommendationReason}
                    onChange={(e) => setItemRecommendationReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--card)] border border-[var(--border)] text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[var(--card-foreground)] flex items-center justify-between">
                    <span>Dish Photo Presets</span>
                  </label>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {IMAGE_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setItemImage(preset.url)}
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                          itemImage === preset.url
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-[var(--card)] text-[var(--muted-foreground)] border border-[var(--border)]'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddStagedItem}
                  className="w-full py-2 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 font-bold border border-blue-500/20 hover:bg-blue-500/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add This Dish to Venue Roster</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-[var(--border)] bg-[var(--muted)]/30 flex items-center justify-between gap-3">
          {activeStep === 1 ? (
            <>
              <button
                type="button"
                onClick={() => setIsVenueOnboardingOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-[var(--border)] text-xs font-bold text-[var(--muted-foreground)] hover:text-[var(--card-foreground)] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!name.trim()) {
                    showToast('Please specify a venue name first');
                    return;
                  }
                  setActiveStep(2);
                }}
                className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-black shadow-md hover:bg-blue-700 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Continue to Add Menu Items</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setActiveStep(1)}
                className="px-4 py-2.5 rounded-xl border border-[var(--border)] text-xs font-bold text-[var(--muted-foreground)] hover:text-[var(--card-foreground)] cursor-pointer"
              >
                Back to Profile
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleFinalizeOnboarding}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-black shadow-md hover:opacity-95 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <span>Publishing Venue & Menu...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Complete Onboarding & Publish Venue</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
