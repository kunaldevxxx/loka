import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../lib/api';
import { AnalyticsResponse } from '../../types/api';
import {
  TrendingUp,
  CreditCard,
  QrCode,
  Banknote,
  Download,
  Calendar,
  DollarSign,
  Coffee
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const AnalyticsDashboard: React.FC = () => {
  const { currentCafe, showToast } = useApp();
  const [timeframe, setTimeframe] = useState<'today' | '7days' | '30days'>('today');
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentCafe) return;
    setLoading(true);
    api.getAnalytics(currentCafe.cafeId, timeframe)
      .then((res) => setData(res))
      .catch((err) => console.error('Failed to load analytics', err))
      .finally(() => setLoading(false));
  }, [currentCafe?.cafeId, timeframe]);

  if (loading && !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-8 h-8 border-3 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  const handleExportCSV = () => {
    if (!data) return;
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Item Name,Category,Quantity Sold,Total Revenue (INR)']
        .concat(
          data.topItems.map(
            (it) => `"${it.name}","${it.category}",${it.quantitySold},${it.revenue}`
          )
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `loka_sales_${timeframe}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Analytics CSV exported successfully');
  };

  const paymentColors = {
    upi: '#10B981', // emerald
    card: '#3B82F6', // blue
    cash: '#F59E0B' // amber
  };

  const pieData = data
    ? [
        { name: 'UPI', value: data.paymentBreakdown.upi, color: paymentColors.upi },
        { name: 'Card', value: data.paymentBreakdown.card, color: paymentColors.card },
        { name: 'Cash', value: data.paymentBreakdown.cash, color: paymentColors.cash }
      ]
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <h1 className="text-2xl font-black text-[var(--foreground)] tracking-tight">
            Cafe Sales & Insights
          </h1>
          <p className="text-xs text-[var(--muted-foreground)]">
            Revenue trends, peak ordering hours, and beverage rankings for {currentCafe?.name}.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Timeframe selector */}
          <div className="flex items-center bg-[var(--card)] p-1 rounded-xl border border-[var(--border)] text-xs font-bold">
            {[
              { id: 'today', label: 'Today' },
              { id: '7days', label: 'Last 7 Days' },
              { id: '30days', label: 'Last 30 Days' }
            ].map((tf) => (
              <button
                key={tf.id}
                onClick={() => setTimeframe(tf.id as any)}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  timeframe === tf.id
                    ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                    : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--muted)] text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {data && (
        <>
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-xs">
              <span className="text-xs font-medium text-[var(--muted-foreground)]">Total Revenue</span>
              <div className="text-2xl font-black text-[var(--foreground)] mt-1">₹{data.totalRevenue}</div>
              <span className="text-[11px] text-emerald-600 font-semibold">+14.2% vs prev period</span>
            </div>

            <div className="p-5 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-xs">
              <span className="text-xs font-medium text-[var(--muted-foreground)]">Total Orders</span>
              <div className="text-2xl font-black text-[var(--foreground)] mt-1">{data.totalOrders}</div>
              <span className="text-[11px] text-[var(--muted-foreground)]">Completed transactions</span>
            </div>

            <div className="p-5 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-xs">
              <span className="text-xs font-medium text-[var(--muted-foreground)]">Average Ticket Value</span>
              <div className="text-2xl font-black text-[var(--foreground)] mt-1">₹{data.averageOrderValue}</div>
              <span className="text-[11px] text-[var(--muted-foreground)]">Per table checkout</span>
            </div>

            <div className="p-5 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-xs">
              <span className="text-xs font-medium text-[var(--muted-foreground)]">UPI Adoption</span>
              <div className="text-2xl font-black text-emerald-600 mt-1">
                {Math.round((data.paymentBreakdown.upi / (data.totalRevenue || 1)) * 100)}%
              </div>
              <span className="text-[11px] text-[var(--muted-foreground)]">Instant QR payments</span>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Hourly Order Heat / Distribution */}
            <div className="lg:col-span-2 bg-[var(--card)] rounded-3xl p-6 border border-[var(--border)] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[var(--foreground)]">Hourly Sales & Brewing Volume</h3>
                  <p className="text-xs text-[var(--muted-foreground)]">Orders per hour throughout the service day</p>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.hourlyDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="hour" stroke="#888888" fontSize={11} tickLine={false} />
                    <YAxis stroke="#888888" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--card)',
                        borderColor: 'var(--border)',
                        borderRadius: '12px',
                        fontSize: '12px'
                      }}
                    />
                    <Bar dataKey="orders" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Payment Method Split */}
            <div className="bg-[var(--card)] rounded-3xl p-6 border border-[var(--border)] shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-[var(--foreground)]">Payment Split</h3>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={4}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>UPI (Instant QR)</span>
                  </div>
                  <span className="font-bold">₹{data.paymentBreakdown.upi}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span>Card / POS</span>
                  </div>
                  <span className="font-bold">₹{data.paymentBreakdown.card}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span>Cash / Counter</span>
                  </div>
                  <span className="font-bold">₹{data.paymentBreakdown.cash}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Top Selling Items Table */}
          <div className="bg-[var(--card)] rounded-3xl p-6 border border-[var(--border)] shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[var(--foreground)]">Top Menu Items by Sales</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)]">
                    <th className="pb-3 font-semibold">Dish / Beverage</th>
                    <th className="pb-3 font-semibold">Category</th>
                    <th className="pb-3 font-semibold">Units Sold</th>
                    <th className="pb-3 font-semibold text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {data.topItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-[var(--muted)]/40 transition-colors">
                      <td className="py-3 font-bold flex items-center gap-2">
                        <span className="w-5 text-center text-[var(--muted-foreground)] font-mono text-[11px]">
                          #{idx + 1}
                        </span>
                        <span>{item.name}</span>
                      </td>
                      <td className="py-3 text-[var(--muted-foreground)]">{item.category}</td>
                      <td className="py-3 font-bold">{item.quantitySold}</td>
                      <td className="py-3 font-extrabold text-right">₹{item.revenue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
