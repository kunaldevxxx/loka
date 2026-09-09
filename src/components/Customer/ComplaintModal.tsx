import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../lib/api';
import { ComplaintIssueType } from '../../types/api';
import { X, AlertCircle, Upload, CheckCircle2 } from 'lucide-react';

export const ComplaintModal: React.FC = () => {
  const {
    isComplaintModalOpen,
    setIsComplaintModalOpen,
    activeOrderId,
    currentCafe,
    tableId,
    sessionToken,
    showToast
  } = useApp();

  const [issueType, setIssueType] = useState<ComplaintIssueType>('wrong_item');
  const [itemName, setItemName] = useState('Cappuccino');
  const [description, setDescription] = useState('');
  const [photoSelected, setPhotoSelected] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  if (!isComplaintModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.submitComplaint({
        orderId: activeOrderId || 'order-seed-101',
        cafeId: currentCafe?.cafeId || 'cafe-001',
        tableId,
        issueType,
        itemName,
        description,
        sessionToken
      });
      setSubmittedId(res.complaintId);
      showToast('Support ticket submitted to floor manager');
    } catch (err: any) {
      showToast(err.message || 'Failed to submit complaint');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsComplaintModalOpen(false);
    setSubmittedId(null);
    setDescription('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[var(--card)] text-[var(--card-foreground)] rounded-3xl border border-[var(--border)] shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-2 text-amber-500">
            <AlertCircle className="w-5 h-5" />
            <h2 className="text-base font-bold text-[var(--card-foreground)]">Report an Order Issue</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-full text-[var(--muted-foreground)] hover:text-[var(--card-foreground)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submittedId ? (
          <div className="py-6 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="font-bold text-base">Ticket Received #{submittedId}</h3>
            <p className="text-xs text-[var(--muted-foreground)]">
              Our shift manager has been alerted and will arrive at {tableId} immediately with a resolution or replacement.
            </p>
            <button
              onClick={handleClose}
              className="mt-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-xs"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-1.5">
                Issue Type
              </label>
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value as ComplaintIssueType)}
                className="w-full p-2.5 rounded-xl border border-[var(--border)] bg-[var(--muted)]/50 focus:outline-none focus:ring-1 focus:ring-[var(--primary)] text-xs font-medium"
              >
                <option value="wrong_item">Wrong Item Received</option>
                <option value="missing_item">Missing Item</option>
                <option value="quality_issue">Quality / Taste Issue</option>
                <option value="wrong_quantity">Incorrect Quantity</option>
                <option value="other">Other Inquiry</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-1.5">
                Item Affected
              </label>
              <input
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="e.g. Cappuccino"
                required
                className="w-full p-2.5 rounded-xl border border-[var(--border)] bg-[var(--muted)]/50 focus:outline-none focus:ring-1 focus:ring-[var(--primary)] text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-1.5">
                Description of the issue
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please describe what happened so our barista or floor staff can fix it..."
                required
                className="w-full p-2.5 rounded-xl border border-[var(--border)] bg-[var(--muted)]/50 focus:outline-none focus:ring-1 focus:ring-[var(--primary)] text-xs resize-none"
              />
            </div>

            {/* Photo upload mock */}
            <div>
              <label className="block font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-1.5">
                Photo Evidence (Optional)
              </label>
              <label className="border border-dashed border-[var(--border)] rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer hover:bg-[var(--muted)] transition-colors">
                <Upload className="w-4 h-4 text-[var(--muted-foreground)]" />
                <span className="text-[11px] text-[var(--muted-foreground)]">
                  {photoSelected ? '1 photo attached (item_photo.jpg)' : 'Click to take or attach photo'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={() => setPhotoSelected(true)}
                  className="hidden"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              {submitting ? 'Submitting to Manager...' : 'Submit Issue to Floor Staff'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
