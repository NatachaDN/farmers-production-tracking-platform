import React, { useState, useEffect, useMemo } from 'react';
import { AnimalGroupCard } from './components/AnimalGroupCard';
import { CreateAnimalGroupModal } from './components/CreateAnimalGroupModal';
import { EditAnimalGroupModal } from './components/EditAnimalGroupModal';
import { AnimalGroupDetailsModal } from './components/AnimalGroupDetailsModal';
import { DeleteAnimalGroupModal } from './components/DeleteAnimalGroupModal';
import { animalGroupService } from './services/animalGroupService';
import { MetricCard } from '../../shared/components/MetricCard';
import {
  IconLivestock,
  IconPlus,
  IconSearch,
  IconFilter,
  IconCheck,
  IconWarning,
  IconRefresh
} from '../../shared/components/Icons';

export function LivestockView({ user }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const showToast = (message, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => setToast(null), 4000);
  };

  const loadGroups = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await animalGroupService.getGroups();
      setGroups(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load animal groups:', err);
      setError(err.message || 'Failed to load animal groups from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroups();
  }, []);

  // Filtered groups
  const filteredGroups = useMemo(() => {
    return groups.filter((g) => {
      const matchesSearch =
        !searchTerm.trim() ||
        (g.name && g.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (g.breed && g.breed.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (g.location && g.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (g.purpose && g.purpose.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesType = typeFilter === 'ALL' || g.animalType === typeFilter;
      const matchesStatus = statusFilter === 'ALL' || (g.status || 'ACTIVE') === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [groups, searchTerm, typeFilter, statusFilter]);

  // Derived metrics
  const totalGroups = groups.length;
  const totalHeadcount = groups.reduce(
    (sum, g) => sum + (g.currentPopulation ?? g.initialPopulation ?? 0),
    0
  );
  const activeGroupsCount = groups.filter((g) => (g.status || 'ACTIVE') === 'ACTIVE').length;
  const distinctSpeciesCount = new Set(groups.map((g) => g.animalType)).size;

  // Handlers
  const handleCreateGroup = async (formData) => {
    const created = await animalGroupService.createGroup(formData);
    setGroups((prev) => [created, ...prev]);
    showToast(`Animal group "${created.name}" registered successfully.`);
  };

  const handleUpdateGroup = async (id, formData) => {
    const updated = await animalGroupService.updateGroup(id, formData);
    setGroups((prev) => prev.map((g) => (g.id === id ? updated : g)));
    if (selectedGroup && selectedGroup.id === id) {
      setSelectedGroup(updated);
    }
    showToast(`Animal group "${updated.name}" updated successfully.`);
  };

  const handleDeleteGroup = async (id) => {
    await animalGroupService.deleteGroup(id);
    setGroups((prev) => prev.filter((g) => g.id !== id));
    showToast('Animal group deleted successfully.');
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 2000,
            backgroundColor: toast.isError ? '#B91C1C' : '#164230',
            color: '#FFFFFF',
            padding: '12px 20px',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.18)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.875rem',
            fontWeight: 500,
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          {toast.isError ? <IconWarning size={18} color="#FFFFFF" /> : <IconCheck size={18} color="#FFFFFF" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Banner & Action */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--color-card-border)',
          borderRadius: 'var(--radius-xl)',
          padding: '24px 28px',
          boxShadow: 'var(--shadow-card)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              backgroundColor: '#FEF3C7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <IconLivestock size={28} color="#D97706" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--color-text-primary)' }}>
                Animal Groups & Livestock
              </h2>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: '#EAF4ED',
                  color: '#2A6740',
                  padding: '2px 8px',
                  borderRadius: '999px'
                }}
              >
                {activeGroupsCount} Active
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: '4px 0 0 0' }}>
              Register herds, pens, coops, and colonies to track headcounts, breeds, and housing.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '11px 22px',
            borderRadius: '9999px',
            backgroundColor: 'var(--color-brand-primary)',
            color: '#FFFFFF',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
            border: 'none',
            boxShadow: '0 2px 8px rgba(62, 123, 82, 0.25)',
            transition: 'background 150ms'
          }}
        >
          <IconPlus size={16} color="#FFFFFF" />
          <span>Register animal group</span>
        </button>
      </div>

      {/* 4 Summary Stat Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '20px'
        }}
      >
        <MetricCard
          label="Animal Groups"
          value={loading ? '…' : String(totalGroups)}
          subtext={totalGroups > 0 ? `${activeGroupsCount} active groups` : 'No groups registered'}
          icon={<IconLivestock size={20} color="#D97706" />}
          iconBg="#FEF3C7"
        />
        <MetricCard
          label="Total Headcount"
          value={loading ? '…' : totalHeadcount.toLocaleString()}
          subtext={totalGroups > 0 ? `Across ${distinctSpeciesCount} species` : '0 live animals'}
          icon={<IconLivestock size={20} color="#2D7A52" />}
          iconBg="#EAF4ED"
        />
        <MetricCard
          label="Active Breeding / Rearing"
          value={loading ? '…' : String(activeGroupsCount)}
          subtext={activeGroupsCount > 0 ? `${Math.round((activeGroupsCount / (totalGroups || 1)) * 100)}% of registered groups` : 'None in progress'}
          icon={<IconLivestock size={20} color="#0D9488" />}
          iconBg="#E6F6F4"
        />
        <MetricCard
          label="Species Categories"
          value={loading ? '…' : String(distinctSpeciesCount)}
          subtext={distinctSpeciesCount > 0 ? 'Livestock diversity' : 'No species recorded'}
          icon={<IconFilter size={20} color="#788680" />}
          iconBg="#F4EFE6"
        />
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--color-card-border)',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          boxShadow: 'var(--shadow-card)'
        }}
      >
        {/* Search input */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: '#FBF9F4',
            border: '1px solid #DFD8CA',
            borderRadius: '10px',
            padding: '8px 14px',
            minWidth: '280px',
            flex: 1
          }}
        >
          <IconSearch size={18} color="#788680" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search groups by name, breed, location..."
            style={{
              border: 'none',
              background: 'none',
              outline: 'none',
              fontSize: '0.875rem',
              color: 'var(--color-text-primary)',
              width: '100%'
            }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '0.75rem' }}
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{
              padding: '9px 14px',
              borderRadius: '10px',
              border: '1px solid #DFD8CA',
              backgroundColor: '#FFFFFF',
              fontSize: '0.875rem',
              color: 'var(--color-text-secondary)',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="ALL">All Animal Types</option>
            <option value="CATTLE">Cattle</option>
            <option value="POULTRY">Poultry</option>
            <option value="GOATS">Goats</option>
            <option value="SHEEP">Sheep</option>
            <option value="PIGS">Pigs</option>
            <option value="RABBITS">Rabbits</option>
            <option value="BEES">Bees</option>
            <option value="FISH">Fish</option>
            <option value="OTHER">Other</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '9px 14px',
              borderRadius: '10px',
              border: '1px solid #DFD8CA',
              backgroundColor: '#FFFFFF',
              fontSize: '0.875rem',
              color: 'var(--color-text-secondary)',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="SOLD">Sold</option>
            <option value="ARCHIVED">Archived</option>
            <option value="INACTIVE">Inactive</option>
          </select>

          <button
            onClick={loadGroups}
            title="Refresh animal groups"
            style={{
              background: '#FFFFFF',
              border: '1px solid #DFD8CA',
              borderRadius: '10px',
              padding: '9px 12px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              color: 'var(--color-text-secondary)'
            }}
          >
            <IconRefresh size={16} color="#4B5752" />
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div
          style={{
            backgroundColor: '#FEF2F2',
            border: '1px solid #FCA5A5',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            color: '#B91C1C',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <IconWarning size={20} color="#B91C1C" />
            <span>{error}</span>
          </div>
          <button
            onClick={loadGroups}
            style={{
              backgroundColor: '#B91C1C',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              padding: '6px 14px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && groups.length === 0 && (
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid #ECE7DC', borderTopColor: '#3E7B52', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '12px', fontSize: '0.875rem' }}>Loading animal groups...</p>
        </div>
      )}

      {/* Empty State (AC-04) */}
      {!loading && filteredGroups.length === 0 && (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--color-card-border)',
            borderRadius: 'var(--radius-xl)',
            padding: '60px 24px',
            textAlign: 'center',
            boxShadow: 'var(--shadow-card)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#FEF3C7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}
          >
            <IconLivestock size={32} color="#D97706" />
          </div>

          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
            {groups.length === 0 ? 'No animal groups registered yet' : 'No matching animal groups found'}
          </h3>

          <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-muted)', maxWidth: '440px', lineHeight: 1.5, marginBottom: '24px' }}>
            {groups.length === 0
              ? 'Register your cattle, poultry, goats, sheep, or other livestock batches to monitor populations, breeds, and housing.'
              : 'Try clearing your search terms or adjusting the type and status filters.'}
          </p>

          {groups.length === 0 ? (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '11px 24px',
                borderRadius: '9999px',
                backgroundColor: 'var(--color-brand-primary)',
                color: '#FFFFFF',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer',
                border: 'none',
                boxShadow: '0 2px 8px rgba(62, 123, 82, 0.25)'
              }}
            >
              <IconPlus size={16} color="#FFFFFF" />
              <span>Register first animal group</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setSearchTerm('');
                setTypeFilter('ALL');
                setStatusFilter('ALL');
              }}
              style={{
                padding: '9px 18px',
                borderRadius: '9999px',
                border: '1px solid #DFD8CA',
                backgroundColor: '#FFFFFF',
                color: 'var(--color-text-secondary)',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              Reset filters
            </button>
          )}
        </div>
      )}

      {/* Animal Groups Grid */}
      {!loading && filteredGroups.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '20px'
          }}
        >
          {filteredGroups.map((group) => (
            <AnimalGroupCard
              key={group.id}
              group={group}
              onViewDetails={(g) => {
                setSelectedGroup(g);
                setIsDetailsModalOpen(true);
              }}
              onEdit={(g) => {
                setSelectedGroup(g);
                setIsEditModalOpen(true);
              }}
              onDelete={(g) => {
                setSelectedGroup(g);
                setIsDeleteModalOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateAnimalGroupModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateGroup={handleCreateGroup}
      />

      <EditAnimalGroupModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedGroup(null);
        }}
        group={selectedGroup}
        onUpdateGroup={handleUpdateGroup}
      />

      <AnimalGroupDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedGroup(null);
        }}
        group={selectedGroup}
        onEdit={(g) => {
          setSelectedGroup(g);
          setIsEditModalOpen(true);
        }}
        onDelete={(g) => {
          setSelectedGroup(g);
          setIsDeleteModalOpen(true);
        }}
      />

      <DeleteAnimalGroupModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedGroup(null);
        }}
        group={selectedGroup}
        onConfirmDelete={handleDeleteGroup}
      />
    </div>
  );
}

export default LivestockView;

