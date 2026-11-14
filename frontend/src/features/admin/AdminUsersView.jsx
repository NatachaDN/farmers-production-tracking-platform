import React, { useEffect, useState } from 'react';
import { adminService } from './services/adminService';
import { managerService } from '../manager/services/managerService';
import { notificationService } from '../../shared/services/notificationService';
import { IconPlus, IconSearch, IconClose, IconEdit, IconTrash, IconEye } from '../../shared/components/Icons';
import { EntityDetailModal } from '../../shared/components/EntityDetailModal';

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
  const [farms, setFarms] = useState([]);
  const [farmSearch, setFarmSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [modal, setModal] = useState(null);
  const [notifyModal, setNotifyModal] = useState(null);
  const [detailUser, setDetailUser] = useState(null);
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

  const loadFarms = async () => {
    try {
      const list = await managerService.listFarms('');
      setFarms(Array.isArray(list) ? list : []);
    } catch {
      // Non-blocking if farms fail to load
    }
  };

  useEffect(() => {
    loadUsers();
    loadFarms();
  }, [roleFilter, statusFilter]);

  const openCreate = (defaultRole = 'ROLE_MANAGER') => {
    setFarmSearch('');
    setError('');
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
        managedFarmIds: [],
      },
    });
  };

  const openEdit = (u) => {
    setFarmSearch('');
    setError('');
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
        managedFarmIds: Array.isArray(u.managedFarmIds) ? u.managedFarmIds : [],
      },
    });
  };

  const toggleManagedFarm = (farmId) => {
    setModal((prev) => {
      if (!prev) return prev;
      const current = Array.isArray(prev.data.managedFarmIds) ? prev.data.managedFarmIds : [];
      const exists = current.includes(farmId);
      const next = exists ? current.filter((id) => id !== farmId) : [...current, farmId];
      return { ...prev, data: { ...prev.data, managedFarmIds: next } };
    });
  };

  const saveUser = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...modal.data,
        managedFarmIds: modal.data.role === 'ROLE_MANAGER' ? (modal.data.managedFarmIds || []) : [],
      };
      if (modal.mode === 'create') {
        await adminService.createUser(payload);
        flash(`${roleLabel(modal.data.role)} account created.`);
      } else {
        await adminService.updateUser(modal.id, payload);
        flash('User updated.');
      }
      setModal(null);
      await Promise.all([loadUsers(), loadFarms()]);
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
                <th style={{ padding: '12px 16px' }}>Managed Farms</th>
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
                    <td style={{ padding: '12px 16px', color: '#4B5752' }}>
                      {u.role === 'ROLE_MANAGER' ? (
                        Array.isArray(u.managedFarmNames) && u.managedFarmNames.length > 0 ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {u.managedFarmNames.map((fn, idx) => (
                              <span
                                key={`${u.id}-farm-${idx}`}
                                style={{
                                  padding: '2px 8px',
                                  borderRadius: '9999px',
                                  fontSize: '0.7rem',
                                  fontWeight: 600,
                                  backgroundColor: '#EAF4ED',
                                  color: '#164230',
                                }}
                              >
                                {fn}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>None assigned</span>
                        )
                      ) : (
                        '—'
                      )}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <button type="button" style={btnSecondary} onClick={() => setDetailUser(u)}>
                          <IconEye size={12} /> View
                        </button>
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
            {modal.data.role === 'ROLE_MANAGER' && (() => {
              const fq = farmSearch.trim().toLowerCase();
              const filteredFarms = fq
                ? farms.filter((farm) =>
                    (farm.name || '').toLowerCase().includes(fq) ||
                    (farm.farmerName || '').toLowerCase().includes(fq) ||
                    (farm.region || '').toLowerCase().includes(fq) ||
                    (farm.district || '').toLowerCase().includes(fq) ||
                    (farm.managerName || '').toLowerCase().includes(fq)
                  )
                : farms;
              const selectedIds = modal.data.managedFarmIds || [];
              const allFilteredSelected =
                filteredFarms.length > 0 && filteredFarms.every((farm) => selectedIds.includes(farm.id));

              const toggleSelectAllFiltered = () => {
                setModal((prev) => {
                  if (!prev) return prev;
                  const current = Array.isArray(prev.data.managedFarmIds) ? prev.data.managedFarmIds : [];
                  const filteredIds = filteredFarms.map((f) => f.id);
                  const next = allFilteredSelected
                    ? current.filter((id) => !filteredIds.includes(id))
                    : Array.from(new Set([...current, ...filteredIds]));
                  return { ...prev, data: { ...prev.data, managedFarmIds: next } };
                });
              };

              return (
                <div style={{ marginTop: '14px', padding: '12px', borderRadius: '12px', backgroundColor: '#F9F6F0', border: '1px solid #ECE7DC' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                    <label style={{ ...labelStyle, marginBottom: 0 }}>Assigned Farms (1-N Supervision)</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.72rem', color: '#4B5752', fontWeight: 600 }}>
                        {selectedIds.length} selected
                      </span>
                      {filteredFarms.length > 0 && (
                        <button
                          type="button"
                          onClick={toggleSelectAllFiltered}
                          style={{
                            ...btnSecondary,
                            padding: '4px 10px',
                            fontSize: '0.72rem',
                            backgroundColor: allFilteredSelected ? '#EAF4ED' : '#FFFFFF',
                            borderColor: allFilteredSelected ? '#164230' : '#DFD8CA',
                            color: '#164230',
                          }}
                        >
                          {allFilteredSelected ? 'Deselect All' : 'Select All'}
                        </button>
                      )}
                    </div>
                  </div>
                  {farms.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid #DFD8CA', borderRadius: '9999px', padding: '5px 12px', backgroundColor: '#FFFFFF', marginBottom: '10px' }}>
                      <IconSearch size={13} color="#7A8680" />
                      <input
                        type="text"
                        placeholder="Search farms by name, owner, region..."
                        value={farmSearch}
                        onChange={(e) => setFarmSearch(e.target.value)}
                        style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '0.8rem', width: '100%', minWidth: 0, color: '#19201C' }}
                      />
                      {farmSearch && (
                        <button
                          type="button"
                          onClick={() => setFarmSearch('')}
                          style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, display: 'flex', color: '#7A8680' }}
                          title="Clear search"
                        >
                          <IconClose size={13} />
                        </button>
                      )}
                    </div>
                  )}
                  {farms.length === 0 ? (
                    <p style={{ margin: 0, fontSize: '0.78rem', color: '#64716B' }}>No farms registered on the platform yet.</p>
                  ) : filteredFarms.length === 0 ? (
                    <p style={{ margin: 0, fontSize: '0.78rem', color: '#64716B' }}>No farms match "{farmSearch}".</p>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 210px), 1fr))', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                      {filteredFarms.map((farm) => {
                        const checked = selectedIds.includes(farm.id);
                        const otherManager = farm.managerId && Number(farm.managerId) !== Number(modal.id) ? farm.managerName : null;
                        return (
                          <label
                            key={farm.id}
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '8px',
                              padding: '8px 10px',
                              borderRadius: '10px',
                              border: checked ? '1px solid #164230' : '1px solid #DFD8CA',
                              backgroundColor: checked ? '#EAF4ED' : '#FFFFFF',
                              cursor: 'pointer',
                              fontSize: '0.8rem',
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleManagedFarm(farm.id)}
                              style={{ marginTop: '2px', accentColor: '#164230' }}
                            />
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontWeight: 600, color: '#19201C' }}>{farm.name}</div>
                              <div style={{ fontSize: '0.7rem', color: '#64716B' }}>
                                Owner: {farm.farmerName || '—'}
                                {otherManager ? ` · Current Mgr: ${otherManager}` : ''}
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })()}
            {error && (
              <div style={{ marginTop: '12px', padding: '8px 12px', borderRadius: '10px', backgroundColor: '#FEE2E2', color: '#991B1B', fontSize: '0.8rem', fontWeight: 500 }}>
                {error}
              </div>
            )}
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

      {detailUser && (
        <EntityDetailModal
          open
          onClose={() => setDetailUser(null)}
          title={detailUser.fullName}
          subtitle={`User #${detailUser.id} · ${roleLabel(detailUser.role)} · ${detailUser.emailOrPhone}`}
          badge={detailUser.status}
          badgeStyle={statusColors(detailUser.status)}
          fields={[
            { label: 'Full Name', value: detailUser.fullName },
            { label: 'Email or Phone', value: detailUser.emailOrPhone },
            { label: 'Role', value: roleLabel(detailUser.role) },
            { label: 'Account Status', value: detailUser.status },
            { label: 'Location', value: detailUser.location },
            { label: 'Farm Name', value: detailUser.farmName },
            { label: 'Farm Type', value: detailUser.farmType },
            { label: 'Total Area', value: detailUser.totalArea != null ? `${detailUser.totalArea} ha` : '—' },
            { label: 'Crops Grown', value: detailUser.cropsGrown },
            ...(detailUser.role === 'ROLE_MANAGER'
              ? [{ label: 'Managed Farms', value: detailUser.managedFarmNames?.length ? detailUser.managedFarmNames.join(', ') : 'None assigned' }]
              : []),
            { label: 'Auth Provider', value: detailUser.authProvider || 'LOCAL' },
            { label: 'Joined At', value: detailUser.createdAt ? new Date(detailUser.createdAt).toLocaleString() : '—' },
            { label: 'Last Login', value: detailUser.lastLoginAt ? new Date(detailUser.lastLoginAt).toLocaleString() : 'Never' },
          ]}
          longFields={detailUser.rejectionReason ? [{ label: 'Rejection / Suspension Reason', value: detailUser.rejectionReason }] : []}
          editLabel="Edit Account"
          onEdit={() => {
            const target = detailUser;
            setDetailUser(null);
            openEdit(target);
          }}
        />
      )}
    </div>
  );
}

