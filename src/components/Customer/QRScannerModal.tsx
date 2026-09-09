import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../lib/api';
import { QRCodeResponse } from '../../types/api';
import { X, QrCode, Camera, Check, ExternalLink, RefreshCw } from 'lucide-react';

export const QRScannerModal: React.FC = () => {
  const {
    isQRModalOpen,
    setIsQRModalOpen,
    currentCafe,
    tableId,
    setTableId,
    setActiveView,
    showToast
  } = useApp();

  const [mode, setMode] = useState<'scan' | 'generate'>('scan');
  const [qrData, setQrData] = useState<QRCodeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [scanSimulated, setScanSimulated] = useState(false);

  useEffect(() => {
    if (isQRModalOpen && currentCafe) {
      setLoading(true);
      api.generateQR(currentCafe.cafeId, tableId)
        .then((res) => setQrData(res))
        .catch((err) => console.error('Failed to generate QR', err))
        .finally(() => setLoading(false));
    }
  }, [isQRModalOpen, currentCafe?.cafeId, tableId]);

  if (!isQRModalOpen) return null;

  const handleSimulateScan = async (selectedTid: string) => {
    setScanSimulated(true);
    setTableId(selectedTid);
    showToast(`Scanned table QR: ${selectedTid} at ${currentCafe?.name}`);
    setTimeout(() => {
      setIsQRModalOpen(false);
      setActiveView('menu');
      setScanSimulated(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[var(--card)] text-[var(--card-foreground)] rounded-3xl border border-[var(--border)] shadow-2xl p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-[var(--primary)]" />
            <h2 className="text-base font-bold">QR Table Ordering</h2>
          </div>
          <button
            onClick={() => setIsQRModalOpen(false)}
            className="p-1 text-[var(--muted-foreground)] hover:text-[var(--card-foreground)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher */}
        <div className="grid grid-cols-2 p-1 bg-[var(--muted)] rounded-xl border border-[var(--border)] text-xs font-bold">
          <button
            onClick={() => setMode('scan')}
            className={`py-1.5 rounded-lg transition-colors ${
              mode === 'scan' ? 'bg-[var(--card)] text-[var(--foreground)] shadow-xs' : 'text-[var(--muted-foreground)]'
            }`}
          >
            Scan Table QR
          </button>
          <button
            onClick={() => setMode('generate')}
            className={`py-1.5 rounded-lg transition-colors ${
              mode === 'generate' ? 'bg-[var(--card)] text-[var(--foreground)] shadow-xs' : 'text-[var(--muted-foreground)]'
            }`}
          >
            View Table QR Code
          </button>
        </div>

        {mode === 'scan' ? (
          /* Scanner Simulation */
          <div className="space-y-4">
            <div className="relative h-56 bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-700 flex flex-col items-center justify-center text-white">
              {/* Camera Scanner Viewfinder */}
              <div className="relative w-40 h-40 border-2 border-dashed border-emerald-400 rounded-xl flex items-center justify-center">
                <div className="w-full h-0.5 bg-emerald-400 absolute top-1/2 -translate-y-1/2 animate-bounce opacity-80" />
                <Camera className="w-8 h-8 opacity-40" />
              </div>
              <p className="text-[11px] text-zinc-400 mt-2">Align cafe table QR within camera frame</p>
            </div>

            {/* Quick table scan triggers for demo testing */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                Simulate Scanning Table QR:
              </span>
              <div className="grid grid-cols-3 gap-2">
                {['table-01', 'table-02', 'table-05', 'table-07', 'table-10', 'table-12'].map((tid) => (
                  <button
                    key={tid}
                    onClick={() => handleSimulateScan(tid)}
                    className="p-2 rounded-xl text-xs font-semibold border border-[var(--border)] bg-[var(--muted)]/50 hover:bg-[var(--primary)] hover:text-white transition-colors"
                  >
                    {tid.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* QR Generator Display */
          <div className="space-y-4 text-center">
            {loading ? (
              <div className="h-52 flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : qrData ? (
              <div className="space-y-3">
                <div className="inline-block p-4 bg-white rounded-2xl shadow-sm border border-zinc-200">
                  <img
                    src={qrData.qrCode}
                    alt="Table QR Code"
                    className="w-48 h-48 mx-auto"
                  />
                </div>
                <div className="text-xs">
                  <div className="font-bold">{currentCafe?.name}</div>
                  <div className="text-[11px] text-[var(--muted-foreground)]">
                    Table ID: <span className="font-mono font-bold">{tableId}</span>
                  </div>
                  <a
                    href={qrData.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-[var(--primary)] hover:underline mt-1"
                  >
                    <span>{qrData.url}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};
