import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../lib/api';
import { StaffOverviewResponse } from '../../types/api';
import {
  TrendingUp,
  ShoppingBag,
  ChefHat,
  PackageCheck,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Clock,
  Sparkles
} from 'lucide-react';

export const StaffDashboard: React.FC = () => {
  const { currentCafe, setActiveView, refreshTrigger, triggerRefresh } = useApp();
  const [overview, setOverview] = useState<StaffOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOverview = () => {
    if (!currentCafe) return;
    setLoading(true);
    api.getStaffOverview(currentCafe.cafeId)
      .then((res) => setOverview(res))
      .catch((err) => console.error('Failed to load staff overview', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOverview();
  }, [currentCafe?.cafeId, refreshTrigger]);

  if (loading && !overview) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-8 h-8 border-3 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  const o = overview || {
    totalOrdersToday: 0,
    pendingOrders: 0,
    preparingOrders: 0,
    readyOrders: 0,
    revenueToday: 0,
    avgPrepTimeMinutes: 6.5,
    recentComplaints: []
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent)] mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Staff Operations Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--foreground)] tracking-tight">
            {currentCafe?.name} Operations
          </h1>
          <p className="text-xs text-[var(--muted-foreground)]">
            Floor status, live kitchen throughput, and floor tickets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('kds')}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shadow-xs"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            <ChefHat className="w-4 h-4" />
            <span>Open Kitchen KDS</span>
          </button>
          <button
            onClick={fetchOverview}
            className="p-2 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--muted)]"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue */}
        <div className="p-5 rounded-3xl bg-[var(--card)] text-[var(--card-foreground)] border border-[var(--border)] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] mb-2">
            <span>Today's Revenue</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-[var(--foreground)]">₹{o.revenueToday}</div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">+18% vs yesterday</p>
        </div>

        {/* Total orders */}
        <div className="p-5 rounded-3xl bg-[var(--card)] text-[var(--card-foreground)] border border-[var(--border)] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] mb-2">
            <span>Total Orders Today</span>
            <ShoppingBag className="w-4 h-4 text-[var(--primary)]" />
          </div>
          <div className="text-2xl font-black text-[var(--foreground)]">{o.totalOrdersToday}</div>
          <p className="text-[11px] text-[var(--muted-foreground)] mt-1">Across all tables & QR codes</p>
        </div>

        {/* In Kitchen Preparing */}
        <div className="p-5 rounded-3xl bg-[var(--card)] text-[var(--card-foreground)] border border-[var(--border)] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] mb-2">
            <span>In Kitchen (Active)</span>
            <ChefHat className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-500">{o.preparingOrders}</div>
          <p className="text-[11px] text-[var(--muted-foreground)] mt-1">
            {o.pendingOrders} queued for barista
          </p>
        </div>

        {/* Average Prep Time */}
        <div className="p-5 rounded-3xl bg-[var(--card)] text-[var(--card-foreground)] border border-[var(--border)] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] mb-2">
            <span>Avg Prep Time</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-[var(--foreground)]">{o.avgPrepTimeMinutes}m</div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">Optimal queue flow</p>
        </div>
      </div>

      {/* Floor complaints and management navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent complaints */}
        <div className="lg:col-span-2 bg-[var(--card)] rounded-3xl p-6 border border-[var(--border)] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Customer Issue Alerts & Floor Tickets</span>
            </h2>
            <span className="text-[11px] text-[var(--muted-foreground)]">
              {o.recentComplaints.length} active issues
            </span>
          </div>

          {o.recentComplaints.length === 0 ? (
            <div className="py-8 text-center text-xs text-[var(--muted-foreground)]">
              No active customer complaints reported.
            </div>
          ) : (
            <div className="space-y-3">
              {o.recentComplaints.map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-2xl bg-[var(--muted)]/50 border border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-amber-500/20 text-amber-600 uppercase">
                        {c.issueType.replace('_', ' ')}
                      </span>
                      <span className="font-bold text-[var(--card-foreground)]">Table {c.tableId}</span>
                      <span className="text-[10px] text-[var(--muted-foreground)] font-mono">
                        #{c.id.slice(-6)}
                      </span>
                    </div>
                    <div className="font-medium text-[var(--card-foreground)]">{c.itemName}</div>
                    <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{c.description}</p>
                  </div>

                  <button
                    onClick={() => {
                      api.resolveComplaint(c.id);
                      triggerRefresh();
                    }}
                    className="self-end sm:self-center px-3 py-1.5 rounded-xl font-bold bg-emerald-600 text-white text-[11px] hover:bg-emerald-700 transition-colors whitespace-nowrap"
                  >
                    Mark Resolved
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Staff Jump Links */}
        <div className="bg-[var(--card)] rounded-3xl p-6 border border-[var(--border)] shadow-xs space-y-3">
          <h2 className="text-sm font-bold text-[var(--foreground)]">Staff Management Panels</h2>
          
          <button
            onClick={() => setActiveView('kds')}
            className="w-full p-3.5 rounded-2xl border border-[var(--border)] hover:bg-[var(--muted)] transition-colors flex items-center justify-between text-xs font-bold"
          >
            <span className="flex items-center gap-2">
              <ChefHat className="w-4 h-4 text-[var(--primary)]" />
              <span>Kitchen Display System</span>
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setActiveView('analytics')}
            className="w-full p-3.5 rounded-2xl border border-[var(--border)] hover:bg-[var(--muted)] transition-colors flex items-center justify-between text-xs font-bold"
          >
            <span className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span>Sales & Drink Analytics</span>
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setActiveView('menu_management')}
            className="w-full p-3.5 rounded-2xl border border-[var(--border)] hover:bg-[var(--muted)] transition-colors flex items-center justify-between text-xs font-bold"
          >
            <span className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-blue-500" />
              <span>Menu Item & Stock Manager</span>
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
