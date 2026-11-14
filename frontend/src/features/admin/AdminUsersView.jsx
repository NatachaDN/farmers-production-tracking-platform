import React, { useEffect, useState } from 'react';
import { adminService } from './services/adminService';
import { notificationService } from '../../shared/services/notificationService';
import { IconPlus, IconSearch, IconClose, IconEdit, IconTrash } from '../../shared/components/Icons';

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

const btnPrimary = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '8px 15px',
  borderRadius: '9999px',
  border: 'none',
  backgroundColor: '#164230',
  color: '#FFFFFF',
  fontSize: '0.8125rem',
  fontWeight: 600,
  cursor: 'pointer',
};

const btnSecondary = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '7px 13px',
  borderRadius: '9999px',
  border: '1px solid #DFD8CA',
  backgroundColor: '#FFFFFF',
  color: '#19201C',
  fontSize: '0.8125rem',
  fontWeight: 600,
  cursor: 'pointer',
};

const statusColors = (status) => {
  const s = (status || 'APPROVED').toUpperCase();
  if (s === 'APPROVED') return { backgroundColor: '#EAF4ED', color: '#164230' };
  if (s === 'SUSPENDED') return { backgroundColor: '#FEE2E2', color: '#991B1B' };
  if (s === 'REJECTED') return { backgroundColor: '#FEE2E2', color: '#991B1B' };
  return { backgroundColor: '#FEF3C7', color: '#92400E' };
};

const roleLabel = (role) => {
  if (role === 'ROLE_ADMIN') return 'Admin';
  if (role === 'ROLE_MANAGER') return 'Manager';
  return 'Farmer';
};

export function AdminUsersView({ currentUserId }) {
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [modal, setModal] = useState(null);
  const [notifyModal, setNotifyModal] = useState(null);
  const [saving, setSaving] = useState(false);

  const flash = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const list = await adminService.users({ role: roleFilter, status: statusFilter, q: search });
      setUsers(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err.message || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [roleFilter, statusFilter]);

  const openCreate = (defaultRole = 'ROLE_MANAGER') => {
    setModal({
      mode: 'create',
      data: {
        fullName: '',
        emailOrPhone: '',
        password: '',
        role: defaultRole,
        location: '',
        farmName: '',
        farmType: 'MIXED',
        status: 'APPROVED',
      },
    });
  };

  const openEdit = (u) => {
    setModal({
      mode: 'edit',
      id: u.id,
      data: {
        fullName: u.fullName || '',
        emailOrPhone: u.emailOrPhone || '',
        newPassword: '',
        role: u.role || 'ROLE_FARMER',
        location: u.location || '',
        farmName: u.farmName || '',
        farmType: u.farmType || 'MIXED',
        status: u.status || 'APPROVED',
      },
    });
  };

  const saveUser = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (modal.mode === 'create') {
        await adminService.createUser(modal.data);
        flash(`${roleLabel(modal.data.role)} account created.`);
      } else {
        await adminService.updateUser(modal.id, modal.data);
        flash('User updated.');
      }
      setModal(null);
      await loadUsers();
    } catch (err) {
      setError(err.message || 'Could not save user.');
    } finally {
      setSaving(false);
    }
  };

  const toggleSuspend = async (u) => {
    const isSuspended = u.status === 'SUSPENDED';
    const nextStatus = isSuspended ? 'APPROVED' : 'SUSPENDED';
    let reason = '';
    if (!isSuspended) {
      const input = window.prompt(`Reason for suspending ${u.fullName} (optional):`, '');
      if (input === null) return;
      reason = input;
    }
    try {
      await adminService.updateUserStatus(u.id, nextStatus, reason);
      flash(isSuspended ? `${u.fullName} reactivated.` : `${u.fullName} suspended.`);
      await loadUsers();
    } catch (err) {
      setError(err.message || 'Could not update account status.');
    }
  };

  const deleteUser = async (u) => {
    if (!window.confirm(`Permanently delete user "${u.fullName}" (${u.emailOrPhone})?`)) return;
    try {
      await adminService.deleteUser(u.id);
      flash('User deleted.');
      await loadUsers();
    } catch (err) {
      setError(err.message || 'Could not delete user.');
    }
  };

  const sendQuickNotification = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await notificationService.send({
        recipientId: notifyModal.user.id,
        title: notifyModal.title,
        message: notifyModal.message,
        type: notifyModal.type,
      });
      flash(`Notification sent to ${notifyModal.user.fullName}.`);
      setNotifyModal(null);
    } catch (err) {
      setError(err.message || 'Could not send notification.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {toast && (
        <div style={{ padding: '10px 16px', borderRadius: '10px', backgroundColor: '#EAF4ED', border: '1px solid #B7DEC2', color: '#164230', fontWeight: 600, fontSize: '0.875rem' }}>
          {toast}
        </div>
      )}
      {error && (
        <div style={{ padding: '10px 16px', borderRadius: '10px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C', fontWeight: 600, fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: '#164230' }}>
              Users &amp; Managers ({users.length})
            </h2>
            <p style={{ margin: '2px 0 0', fontSize: '0.8125rem', color: '#64716B' }}>
              Create managers and farmers, edit user accounts, suspend or reactivate access, and send direct alerts.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button type="button" style={btnPrimary} onClick={() => openCreate('ROLE_MANAGER')}>
              <IconPlus size={15} /> Create Manager
            </button>
            <button type="button" style={btnSecondary} onClick={() => openCreate('ROLE_FARMER')}>
              <IconPlus size={15} /> Create User
            </button>
          </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); loadUsers(); }} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '16px' }}>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={{ ...inputStyle, width: 'auto' }}>
            <option value="">All Roles</option>
            <option value="ROLE_FARMER">Farmers</option>
            <option value="ROLE_MANAGER">Managers</option>
            <option value="ROLE_ADMIN">Admins</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ ...inputStyle, width: 'auto' }}>
            <option value="">All Statuses</option>
            <option value="APPROVED">Approved / Active</option>
            <option value="PENDING">Pending</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid #DFD8CA', borderRadius: '9999px', padding: '6px 14px', flex: '1 1 180px', maxWidth: '280px', minWidth: 0 }}>
            <IconSearch size={14} color="#7A8680" />
            <input
              type="text"
              placeholder="Search name, email, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '0.8125rem', width: '100%', minWidth: 0 }}
            />
          </div>
          <button type="submit" style={btnSecondary}>Search</button>
        </form>
      </div>

      <div style={{ ...cardStyle, padding: 0, overflowX: 'auto' }}>
        {loading ? (
          <p style={{ padding: '20px', margin: 0, color: '#64716B' }}>Loading users…</p>
        ) : users.length === 0 ? (
          <p style={{ padding: '20px', margin: 0, color: '#64716B' }}>No users found.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', minWidth: '720px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F9F6F0', borderBottom: '1px solid #ECE7DC', textAlign: 'left', color: '#4B5752', fontSize: '0.75rem' }}>
                <th style={{ padding: '12px 16px' }}>User</th>
                <th style={{ padding: '12px 16px' }}>Role</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px' }}>Location</th>
                <th style={{ padding: '12px 16px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isSelf = currentUserId && String(u.id) === String(currentUserId);
                return (
                  <tr key={u.id} style={{ borderBottom: '1px solid #F1EDE4' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 700, color: '#19201C' }}>{u.fullName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64716B' }}>{u.emailOrPhone}</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ padding: '3px 9px', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700, backgroundColor: '#F4EFE6', color: '#164230' }}>
                        {roleLabel(u.role)}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ padding: '3px 9px', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700, ...statusColors(u.status) }}>
                        {u.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#4B5752' }}>{u.location || '—'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <button type="button" style={btnSecondary} onClick={() => openEdit(u)}>
                          <IconEdit size={12} /> Edit
                        </button>
                        <button
                          type="button"
                          style={btnSecondary}
                          onClick={() => setNotifyModal({ user: u, title: '', message: '', type: 'INFO' })}
                        >
                          Notify
                        </button>
                        {!isSelf && (
                          <>
                            <button
                              type="button"
                              style={{ ...btnSecondary, color: u.status === 'SUSPENDED' ? '#164230' : '#B45309', borderColor: u.status === 'SUSPENDED' ? '#B7DEC2' : '#FDE68A' }}
                              onClick={() => toggleSuspend(u)}
                            >
                              {u.status === 'SUSPENDED' ? 'Activate' : 'Suspend'}
                            </button>
                            <button
                              type="button"
                              style={{ ...btnSecondary, color: '#B91C1C', borderColor: '#FECACA' }}
                              onClick={() => deleteUser(u)}
                            >
                              <IconTrash size={12} /> Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Create / Edit User Modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(22,66,48,0.4)', zIndex: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <form onSubmit={saveUser} style={{ ...cardStyle, width: 'min(96vw, 520px)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#164230' }}>
                {modal.mode === 'create' ? 'Create Account' : 'Edit User Account'}
              </h3>
              <button type="button" onClick={() => setModal(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}><IconClose size={18} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Full Name *</label>
                <input required value={modal.data.fullName} onChange={(e) => setModal({ ...modal, data: { ...modal.data, fullName: e.target.value } })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Email or Phone *</label>
                <input required value={modal.data.emailOrPhone} onChange={(e) => setModal({ ...modal, data: { ...modal.data, emailOrPhone: e.target.value } })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Role</label>
                <select value={modal.data.role} onChange={(e) => setModal({ ...modal, data: { ...modal.data, role: e.target.value } })} style={inputStyle}>
                  <option value="ROLE_MANAGER">Manager</option>
                  <option value="ROLE_FARMER">Farmer</option>
                  <option value="ROLE_ADMIN">Administrator</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Status</label>
                <select value={modal.data.status} onChange={(e) => setModal({ ...modal, data: { ...modal.data, status: e.target.value } })} style={inputStyle}>
                  <option value="APPROVED">APPROVED</option>
                  <option value="PENDING">PENDING</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>{modal.mode === 'create' ? 'Password *' : 'New Password (optional)'}</label>
                <input
                  type="password"
                  required={modal.mode === 'create'}
                  value={modal.mode === 'create' ? modal.data.password : modal.data.newPassword}
                  onChange={(e) => setModal({
                    ...modal,
                    data: modal.mode === 'create' ? { ...modal.data, password: e.target.value } : { ...modal.data, newPassword: e.target.value },
                  })}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Location</label>
                <input value={modal.data.location} onChange={(e) => setModal({ ...modal, data: { ...modal.data, location: e.target.value } })} style={inputStyle} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button type="button" style={btnSecondary} onClick={() => setModal(null)}>Cancel</button>
              <button type="submit" style={btnPrimary} disabled={saving}>{saving ? 'Saving…' : 'Save Account'}</button>
            </div>
          </form>
        </div>
      )}

      {/* Quick Notify Modal */}
      {notifyModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(22,66,48,0.4)', zIndex: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <form onSubmit={sendQuickNotification} style={{ ...cardStyle, width: 'min(96vw, 440px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, color: '#164230' }}>Notify {notifyModal.user.fullName}</h3>
              <button type="button" onClick={() => setNotifyModal(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}><IconClose size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Type</label>
                <select value={notifyModal.type} onChange={(e) => setNotifyModal({ ...notifyModal, type: e.target.value })} style={inputStyle}>
                  <option value="INFO">Info</option>
                  <option value="WARNING">Warning</option>
                  <option value="ALERT">Alert</option>
                  <option value="SUCCESS">Success</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Title *</label>
                <input required value={notifyModal.title} onChange={(e) => setNotifyModal({ ...notifyModal, title: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Message *</label>
                <textarea rows={3} required value={notifyModal.message} onChange={(e) => setNotifyModal({ ...notifyModal, message: e.target.value })} style={inputStyle} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button type="button" style={btnSecondary} onClick={() => setNotifyModal(null)}>Cancel</button>
              <button type="submit" style={btnPrimary} disabled={saving}>{saving ? 'Sending…' : 'Send'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
