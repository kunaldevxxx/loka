import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../lib/api';
import { Complaint, ComplaintIssueType } from '../../types/api';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  RefreshCw,
  Search,
  ArrowLeft,
  MessageSquareWarning,
  Sparkles,
  ShieldCheck,
  Check
} from 'lucide-react';

export const ComplaintsManagement: React.FC = () => {
  const { currentCafe, showToast, refreshTrigger, triggerRefresh, setActiveView } = useApp();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'resolved'>('all');
  const [issueTypeFilter, setIssueTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const fetchComplaints = async () => {
    if (!currentCafe) return;
    setLoading(true);
    try {
      const res = await api.getStaffComplaints(currentCafe.cafeId);
      setComplaints(res.complaints || []);
    } catch (err) {
      console.warn('Fallback to overview for complaints:', err);
      // Fallback to overview if direct complaints endpoint is restricted
      try {
        const overview = await api.getStaffOverview(currentCafe.cafeId);
        if (overview.recentComplaints) {
          const mapped: Complaint[] = overview.recentComplaints.map((c) => ({
            id: c.id,
            complaintId: c.id,
            orderId: c.orderId || 'order-seed-101',
            cafeId: currentCafe.cafeId,
            tableId: c.tableId,
            issueType: c.issueType as ComplaintIssueType,
            itemName: c.itemName,
            description: c.description,
            status: 'open',
            createdAt: c.createdAt || new Date().toISOString()
          }));
          setComplaints(mapped);
        }
      } catch (overviewErr) {
        console.error('Failed to load complaints', overviewErr);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [currentCafe?.cafeId, refreshTrigger]);

  const handleResolve = async (complaintId: string) => {
    setResolvingId(complaintId);
    try {
      await api.resolveComplaint(complaintId);
      showToast('Complaint resolved and marked closed');
      fetchComplaints();
      triggerRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to resolve complaint');
    } finally {
      setResolvingId(null);
    }
  };

  // Metrics
  const totalCount = complaints.length;
  const openCount = complaints.filter((c) => c.status === 'open').length;
  const resolvedCount = complaints.filter((c) => c.status === 'resolved').length;
  const resolutionRate = totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 100;

  // Filtered complaints
  const filtered = complaints.filter((c) => {
    // Status filter
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;

    // Issue Type filter
    if (issueTypeFilter !== 'all' && c.issueType !== issueTypeFilter) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchOrder = c.orderId.toLowerCase().includes(q);
      const matchTable = (c.tableId || '').toLowerCase().includes(q);
      const matchItem = (c.itemName || '').toLowerCase().includes(q);
      const matchDesc = (c.description || '').toLowerCase().includes(q);
      const matchId = (c.id || c.complaintId || '').toLowerCase().includes(q);
      if (!matchOrder && !matchTable && !matchItem && !matchDesc && !matchId) return false;
    }

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent)] mb-1">
            <ShieldCheck className="w-4 h-4 text-amber-500" />
            <span>Manager Operations Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--foreground)] tracking-tight">
            Customer Complaints & Floor Tickets
          </h1>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
            Real-time customer feedback, issue escalation, and table resolution for {currentCafe?.name}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('staff_dashboard')}
            className="px-3.5 py-2 rounded-xl text-xs font-bold border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--muted)] flex items-center gap-1.5 text-[var(--card-foreground)] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
          <button
            onClick={fetchComplaints}
            className="p-2 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--muted)] text-[var(--card-foreground)] transition-colors cursor-pointer"
            title="Refresh Complaints"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-[var(--card)] text-[var(--card-foreground)] border border-[var(--border)] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] mb-2">
            <span>Total Logged Issues</span>
            <MessageSquareWarning className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[var(--foreground)]">{totalCount}</div>
          <p className="text-[11px] text-[var(--muted-foreground)] mt-1">Across all floor tables</p>
        </div>

        <div className="p-5 rounded-3xl bg-[var(--card)] text-[var(--card-foreground)] border border-[var(--border)] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] mb-2">
            <span>Action Required (Open)</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-500">{openCount}</div>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-1">
            {openCount > 0 ? 'Pending staff resolution' : 'All issues clear'}
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-[var(--card)] text-[var(--card-foreground)] border border-[var(--border)] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] mb-2">
            <span>Resolved Tickets</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-500">{resolvedCount}</div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">Handled successfully</p>
        </div>

        <div className="p-5 rounded-3xl bg-[var(--card)] text-[var(--card-foreground)] border border-[var(--border)] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] mb-2">
            <span>Resolution Rate</span>
            <Sparkles className="w-4 h-4 text-[var(--primary)]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[var(--foreground)]">{resolutionRate}%</div>
          <p className="text-[11px] text-[var(--muted-foreground)] mt-1">Customer satisfaction metric</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[var(--card)] p-3 rounded-2xl border border-[var(--border)]">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 bg-[var(--muted)]/60 p-1 rounded-xl text-xs font-bold">
          {(['all', 'open', 'resolved'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-all cursor-pointer ${
                statusFilter === s
                  ? 'bg-[var(--card)] text-[var(--foreground)] shadow-xs font-extrabold'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
            >
              {s === 'all' ? `All (${totalCount})` : s === 'open' ? `Open (${openCount})` : `Resolved (${resolvedCount})`}
            </button>
          ))}
        </div>

        {/* Issue Type Selector & Search */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs bg-[var(--muted)]/50 px-2.5 py-1.5 rounded-xl border border-[var(--border)]">
            <Filter className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
            <select
              value={issueTypeFilter}
              onChange={(e) => setIssueTypeFilter(e.target.value)}
              className="bg-transparent font-medium text-[var(--card-foreground)] text-xs focus:outline-none cursor-pointer"
            >
              <option value="all">All Issue Types</option>
              <option value="wrong_item">Wrong Item</option>
              <option value="missing_item">Missing Item</option>
              <option value="quality_issue">Quality Issue</option>
              <option value="wrong_quantity">Wrong Quantity</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 text-[var(--muted-foreground)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search table, item, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--muted)]/40 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--primary)] text-[var(--foreground)]"
            />
          </div>
        </div>
      </div>

      {/* Complaints List */}
      {loading && complaints.length === 0 ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-3 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[var(--muted-foreground)] mt-3">Loading customer complaint tickets...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center bg-[var(--card)] rounded-3xl border border-[var(--border)] p-8">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3 opacity-80" />
          <h3 className="text-base font-bold text-[var(--foreground)]">No Complaints Found</h3>
          <p className="text-xs text-[var(--muted-foreground)] mt-1 max-w-sm mx-auto">
            {statusFilter === 'open'
              ? 'Great news! There are no open unresolved customer issues on the floor right now.'
              : 'No complaint tickets match your selected status or filter criteria.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {filtered.map((c) => {
              const cid = c.complaintId || c.id;
              const isOpen = c.status === 'open';

              return (
                <motion.div
                  key={cid}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`p-5 rounded-3xl bg-[var(--card)] border transition-all shadow-xs flex flex-col justify-between gap-4 ${
                    isOpen
                      ? 'border-amber-500/30 hover:border-amber-500/50'
                      : 'border-[var(--border)] opacity-85'
                  }`}
                >
                  <div className="space-y-2.5">
                    {/* Top row: Status, Table, Ticket ID */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                            isOpen
                              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                              : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          {isOpen ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                              Open Ticket
                            </>
                          ) : (
                            <>
                              <Check className="w-3 h-3" />
                              Resolved
                            </>
                          )}
                        </span>

                        <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-[var(--muted)] text-[var(--muted-foreground)] uppercase">
                          {c.issueType.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="text-[11px] font-mono text-[var(--muted-foreground)]">
                        #{cid.slice(-6)}
                      </div>
                    </div>

                    {/* Table & Item Information */}
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-black text-[var(--primary)] uppercase tracking-wide">
                          Table {c.tableId || 'Walk-in'}
                        </span>
                        <span className="text-[11px] text-[var(--muted-foreground)]">
                          Order #{c.orderId.slice(-6)}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-[var(--foreground)] mt-0.5">
                        {c.itemName}
                      </h4>
                    </div>

                    {/* Customer Description */}
                    <p className="text-xs text-[var(--card-foreground)]/90 bg-[var(--muted)]/40 p-3 rounded-2xl border border-[var(--border)]/70">
                      "{c.description}"
                    </p>
                  </div>

                  {/* Footer & Actions */}
                  <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-1 text-[11px] text-[var(--muted-foreground)]">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    {isOpen ? (
                      <button
                        onClick={() => handleResolve(cid)}
                        disabled={resolvingId === cid}
                        className="px-4 py-2 rounded-xl font-bold bg-emerald-600 text-white text-xs hover:bg-emerald-700 transition-all flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
                      >
                        {resolvingId === cid ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Resolving...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Mark Resolved</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>Resolved by {c.resolvedBy || 'Manager'}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
