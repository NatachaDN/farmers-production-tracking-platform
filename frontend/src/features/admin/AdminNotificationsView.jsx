import React, { useEffect, useState } from 'react';
import { adminService } from './services/adminService';
import { notificationService } from '../../shared/services/notificationService';

const cardStyle = {
  backgroundColor: '#FFFFFF',
  border: '1px solid #ECE7DC',
  borderRadius: '16px',
  padding: 'clamp(16px, 3vw, 24px)',
  boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
};

const inputStyle = {
  width: '100%',
  maxWidth: '100%',
  minWidth: 0,
  padding: '10px 12px',
  borderRadius: '10px',
  border: '1px solid #DFD8CA',
  fontSize: '0.875rem',
  backgroundColor: '#FFFFFF',
  color: '#19201C',
  boxSizing: 'border-box',
};

const labelStyle = {
  display: 'block',
  fontSize: '0.75rem',
  fontWeight: 600,
  color: '#4B5752',
  marginBottom: '5px',
};

export function AdminNotificationsView() {
  const [users, setUsers] = useState([]);
  const [sent, setSent] = useState([]);
  const [targetMode, setTargetMode] = useState('ALL');
  const [recipientId, setRecipientId] = useState('');
  const [type, setType] = useState('INFO');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      const [uList, sList] = await Promise.all([
        adminService.users({}),
        notificationService.getAllSent(),
      ]);
      setUsers(Array.isArray(uList) ? uList : []);
      setSent(Array.isArray(sList) ? sList : []);
    } catch (err) {
      setError(err.message || 'Failed to load notification data.');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      const payload = {
        recipientId: targetMode === 'USER' && recipientId ? Number(recipientId) : null,
        recipientRole: targetMode === 'USER' ? null : targetMode,
        title: title.trim(),
        message: message.trim(),
        type,
      };
      await notificationService.send(payload);
      setTitle('');
      setMessage('');
      setToast('Notification dispatched.');
      setTimeout(() => setToast(''), 3500);
      await loadData();
    } catch (err) {
      setError(err.message || 'Could not send notification.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '20px', alignItems: 'start' }}>
      <form onSubmit={handleSend} style={cardStyle}>
        <h2 style={{ margin: '0 0 4px', fontSize: '1.125rem', fontWeight: 700, color: '#164230' }}>
          Send Platform Notification
        </h2>
        <p style={{ margin: '0 0 16px', fontSize: '0.8125rem', color: '#64716B' }}>
          Broadcast announcements to all users, managers, farmers, or message an individual account.
        </p>

        {toast && (
          <div style={{ padding: '10px 12px', borderRadius: '10px', backgroundColor: '#EAF4ED', color: '#164230', fontWeight: 600, fontSize: '0.8125rem', marginBottom: '12px' }}>
            {toast}
          </div>
        )}
        {error && (
          <div style={{ padding: '10px 12px', borderRadius: '10px', backgroundColor: '#FEF2F2', color: '#B91C1C', fontWeight: 600, fontSize: '0.8125rem', marginBottom: '12px' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={labelStyle}>Audience</label>
            <select value={targetMode} onChange={(e) => setTargetMode(e.target.value)} style={inputStyle}>
              <option value="ALL">All Platform Users</option>
              <option value="ROLE_FARMER">All Farmers</option>
              <option value="ROLE_MANAGER">All Managers</option>
              <option value="USER">Specific User</option>
            </select>
          </div>

          {targetMode === 'USER' && (
            <div>
              <label style={labelStyle}>Select User *</label>
              <select required value={recipientId} onChange={(e) => setRecipientId(e.target.value)} style={inputStyle}>
                <option value="">Choose a user…</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName} ({u.emailOrPhone} · {u.role?.replace('ROLE_', '')})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label style={labelStyle}>Notification Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)} style={inputStyle}>
              <option value="INFO">Info</option>
              <option value="WARNING">Warning</option>
              <option value="ALERT">Alert</option>
              <option value="SUCCESS">Success</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>Title *</label>
            <input required placeholder="e.g., Seasonal Reporting Reminder" value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Message *</label>
            <textarea rows={4} required placeholder="Write the notification message..." value={message} onChange={(e) => setMessage(e.target.value)} style={inputStyle} />
          </div>

          <button
            type="submit"
            disabled={sending}
            style={{
              padding: '10px 18px',
              borderRadius: '9999px',
              border: 'none',
              backgroundColor: '#164230',
              color: '#FFFFFF',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: sending ? 'not-allowed' : 'pointer',
              alignSelf: 'flex-start',
            }}
          >
            {sending ? 'Sending…' : 'Send Notification'}
          </button>
        </div>
      </form>

      <div style={cardStyle}>
        <h3 style={{ margin: '0 0 12px', fontSize: '1rem', fontWeight: 700, color: '#164230' }}>
          Sent History ({sent.length})
        </h3>
        {sent.length === 0 ? (
          <p style={{ margin: 0, color: '#64716B', fontSize: '0.875rem' }}>No notifications sent yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '520px', overflowY: 'auto' }}>
            {sent.map((n) => (
              <div key={n.id} style={{ padding: '12px', borderRadius: '10px', backgroundColor: '#F9F6F0', border: '1px solid #ECE7DC' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#19201C' }}>{n.title}</span>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#3E7B52' }}>{n.type}</span>
                </div>
                <p style={{ margin: '4px 0', fontSize: '0.8125rem', color: '#4B5752' }}>{n.message}</p>
                <div style={{ fontSize: '0.7rem', color: '#64716B' }}>
                  Target: {n.recipientId ? `User #${n.recipientId}` : (n.recipientRole || 'ALL')} · {n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

