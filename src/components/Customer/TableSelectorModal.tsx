import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, MapPin, Check } from 'lucide-react';

export const TableSelectorModal: React.FC = () => {
  const { isTableModalOpen, setIsTableModalOpen, tableId, setTableId, currentCafe, showToast } = useApp();
  const [customTable, setCustomTable] = useState(tableId);

  if (!isTableModalOpen) return null;

  const tableList = [
    'table-01',
    'table-02',
    'table-03',
    'table-04',
    'table-05',
    'table-06',
    'table-07',
    'table-08',
    'table-09',
    'table-10',
    'bar-counter',
    'patio-garden'
  ];

  const handleSelect = (t: string) => {
    setTableId(t);
    showToast(`Table changed to ${t}`);
    setIsTableModalOpen(false);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTable.trim()) return;
    setTableId(customTable.trim());
    showToast(`Table changed to ${customTable.trim()}`);
    setIsTableModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[var(--card)] text-[var(--card-foreground)] rounded-3xl border border-[var(--border)] shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[var(--primary)]" />
            <div>
              <h2 className="text-base font-bold">Select Your Table</h2>
              <p className="text-[11px] text-[var(--muted-foreground)]">{currentCafe?.name}</p>
            </div>
          </div>
          <button
            onClick={() => setIsTableModalOpen(false)}
            className="p-1 text-[var(--muted-foreground)] hover:text-[var(--card-foreground)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset tables grid */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
            Floor & Seating Layout
          </label>
          <div className="grid grid-cols-3 gap-2">
            {tableList.map((t) => {
              const isSelected = tableId === t;
              return (
                <button
                  key={t}
                  onClick={() => handleSelect(t)}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    isSelected
                      ? 'border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)] shadow-xs'
                      : 'border-[var(--border)] bg-[var(--muted)]/50 hover:bg-[var(--muted)] text-[var(--card-foreground)]'
                  }`}
                >
                  <span>{t.toUpperCase()}</span>
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Input */}
        <form onSubmit={handleCustomSubmit} className="pt-2 border-t border-[var(--border)] space-y-2 text-xs">
          <label className="block font-bold text-[var(--muted-foreground)] uppercase tracking-wider">
            Or enter custom table / booth:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={customTable}
              onChange={(e) => setCustomTable(e.target.value)}
              placeholder="e.g. VIP-Booth-3"
              className="flex-1 p-2 rounded-xl border border-[var(--border)] bg-[var(--muted)]/50 text-xs font-medium"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-2xs"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              Set
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
