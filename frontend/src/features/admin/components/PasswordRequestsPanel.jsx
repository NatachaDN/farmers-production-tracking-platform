import React, { useMemo, useState } from 'react';
import { adminService } from '../services/adminService';
import { Avatar, Card, DataGate, EmptyState, Pill, RefreshButton, useAdminData } from './AdminUi';
import { fmtDateTime, timeAgo } from '../adminFormat';
import { IconCheck, IconClose } from '../../../shared/components/Icons';

const STATUS_FILTERS = [
  { id: 'PENDING', label: 'Pending' },
  { id: 'APPROVED', label: 'Approved' },
  { id: 'REJECTED', label: 'Rejected' },
  { id: 'ALL', label: 'All' },
];

export function PasswordRequestsPanel({ onCountChange }) {
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [reviewTarget, setReviewTarget] = useState(null); // { item, action: 'approve' | 'reject' }
  const [adminNote, setAdminNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  const state = useAdminData(async () => {
    const all = await adminService.passwordRequests();
    const list = Array.isArray(all) ? all : [];
    const pendingCount = list.filter((r) => r.status === 'PENDING').length;
    if (onCountChange) onCountChange(pendingCount);
    return list;
  }, []);

  const filtered = useMemo(() => {
    if (!state.data) return [];
    if (statusFilter === 'ALL') return state.data;
    return state.data.filter((r) => r.status === statusFilter);
  }, [state.data, statusFilter]);

  const openReview = (item, action) => {
    setReviewTarget({ item, action });
    setAdminNote('');
    setFeedback({ type: '', text: '' });
  };

  const handleConfirmReview = async (e) => {
    e.preventDefault();
    if (!reviewTarget) return;
    setSubmitting(true);
    setFeedback({ type: '', text: '' });
    try {
      const { item, action } = reviewTarget;
      if (action === 'approve') {
        await adminService.approvePasswordRequest(item.id, adminNote.trim() || null);
        setFeedback({ type: 'success', text: `Approved password change for ${item.farmerName}. Their new password is now active.` });
      } else {
        await adminService.rejectPasswordRequest(item.id, adminNote.trim() || null);
        setFeedback({ type: 'success', text: `Rejected password change request for ${item.farmerName}.` });
      }
      setReviewTarget(null);
      setAdminNote('');
      await state.reload();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Could not process the password change request.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="adm-stack">
      <div className="adm-toolbar">
        <div className="adm-toolbar-group">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.id}
              className="adm-chip"
              aria-pressed={statusFilter === f.id}
              onClick={() => setStatusFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <RefreshButton onClick={state.reload} loading={state.loading} />
      </div>

      {feedback.text && (
        <div
          role={feedback.type === 'error' ? 'alert' : 'status'}
          style={{
            padding: '12px 16px',
            borderRadius: '10px',
            fontSize: '0.875rem',
            fontWeight: 500,
            backgroundColor: feedback.type === 'error' ? '#FEF2F2' : '#EAF4ED',
            border: `1px solid ${feedback.type === 'error' ? '#FECACA' : '#C8E2D0'}`,
            color: feedback.type === 'error' ? '#B91C1C' : '#2A6740',
          }}
        >
          {feedback.text}
        </div>
      )}

      {reviewTarget && (
        <Card
          title={reviewTarget.action === 'approve' ? 'Approve password change' : 'Reject password change'}
          subtitle={`${reviewTarget.item.farmerName} (${reviewTarget.item.farmerEmailOrPhone})`}
        >
          <form onSubmit={handleConfirmReview} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', margin: 0 }}>
              {reviewTarget.action === 'approve'
                ? 'Approving will immediately replace the farmer’s password with the new password they submitted.'
                : 'Rejecting will keep the farmer’s current password unchanged.'}
            </p>
            <div>
              <label
                htmlFor="admin-review-note"
                style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '6px' }}
              >
                Admin note <span className="muted">(optional)</span>
              </label>
              <input
                id="admin-review-note"
                className="adm-input"
                style={{ width: '100%', maxWidth: '520px' }}
                type="text"
                maxLength={500}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder={
                  reviewTarget.action === 'approve'
                    ? 'e.g., Identity verified'
                    : 'e.g., Please contact cooperative support'
                }
              />
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="submit"
                disabled={submitting}
                className="adm-btn"
                style={{
                  backgroundColor: reviewTarget.action === 'approve' ? '#3E7B52' : '#B91C1C',
                  color: '#FFFFFF',
                  borderColor: 'transparent',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {reviewTarget.action === 'approve' ? <IconCheck size={15} /> : <IconClose size={15} />}
                <span>
                  {submitting
                    ? 'Processing…'
                    : reviewTarget.action === 'approve'
                      ? 'Confirm Approval'
                      : 'Confirm Rejection'}
                </span>
              </button>
              <button
                type="button"
                className="adm-btn"
                disabled={submitting}
                onClick={() => setReviewTarget(null)}
              >
                Cancel
              </button>
            </div>
          </form>
        </Card>
      )}

      <DataGate state={state}>
        {() => (
          <Card
            flush
            title={`${filtered.length} ${filtered.length === 1 ? 'request' : 'requests'}`}
            subtitle="Farmers verify their former password before submitting a change request here"
          >
            {filtered.length === 0 ? (
              <EmptyState>
                {statusFilter === 'PENDING'
                  ? 'No pending password change requests.'
                  : 'No password change requests match this filter.'}
              </EmptyState>
            ) : (
              <div className="adm-table-wrap">
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>Farmer</th>
                      <th>Reason</th>
                      <th>Submitted</th>
                      <th>Status</th>
                      <th>Review details</th>
                      <th className="num">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r) => (
                      <tr key={r.id}>
                        <td>
                          <div className="adm-person">
                            <Avatar name={r.farmerName} />
                            <div style={{ minWidth: 0 }}>
                              <div className="strong">{r.farmerName}</div>
                              <div className="muted">{r.farmerEmailOrPhone}</div>
                            </div>
                          </div>
                        </td>
                        <td className="notes" title={r.reason || ''}>
                          {r.reason || <span className="muted">—</span>}
                        </td>
                        <td>
                          <div>{timeAgo(r.createdAt)}</div>
                          <div className="muted">{fmtDateTime(r.createdAt)}</div>
                        </td>
                        <td>
                          <Pill value={r.status} />
                        </td>
                        <td>
                          {r.reviewedAt ? (
                            <div>
                              <div style={{ fontSize: '0.8125rem' }}>{r.reviewedByName || 'Admin'}</div>
                              <div className="muted">{r.adminNote || fmtDateTime(r.reviewedAt)}</div>
                            </div>
                          ) : (
                            <span className="muted">Awaiting review</span>
                          )}
                        </td>
                        <td className="num">
                          {r.status === 'PENDING' ? (
                            <div style={{ display: 'inline-flex', gap: '8px', justifyContent: 'flex-end' }}>
                              <button
                                type="button"
                                className="adm-btn"
                                onClick={() => openReview(r, 'approve')}
                                style={{
                                  backgroundColor: '#EAF4ED',
                                  color: '#2A6740',
                                  borderColor: '#C8E2D0',
                                }}
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                className="adm-btn"
                                onClick={() => openReview(r, 'reject')}
                                style={{
                                  backgroundColor: '#FEF2F2',
                                  color: '#B91C1C',
                                  borderColor: '#FECACA',
                                }}
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="muted">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}
      </DataGate>
    </div>
  );
}

