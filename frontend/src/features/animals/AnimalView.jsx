import React, { useState, useEffect } from 'react';
import { animalService } from './services/animalService';
import { AddAnimalModal } from './components/AddAnimalModal';
import {
  IconLivestock,
  IconPlus,
  IconTrash,
  IconWarning,
  IconCheck,
  IconCalendar,
  IconRefresh
} from '../../shared/components/Icons';

const TYPE_LABELS = {
  CATTLE: 'Cattle',
  SHEEP: 'Sheep',
  GOATS: 'Goats',
  POULTRY: 'Poultry',
  PIGS: 'Pigs',
  RABBITS: 'Rabbits',
  BEES: 'Bees',
  OTHER: 'Other'
};

const PURPOSE_LABELS = {
  MEAT: 'Meat',
  MILK: 'Milk',
  EGGS: 'Eggs',
  WOOL: 'Wool',
  BREEDING: 'Breeding',
  DUAL_PURPOSE: 'Dual Purpose',
  OTHER: 'Other'
};

const TYPE_COLORS = {
  CATTLE: '#2A6740',
  SHEEP: '#92400E',
  GOATS: '#B45309',
  POULTRY: '#D97706',
  PIGS: '#7C3AED',
  RABBITS: '#4F8A64',
  BEES: '#D97706',
  OTHER: '#475569'
};

function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export function AnimalView({ farmerId = 1 }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const [groupToDelete, setGroupToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    async function load() {
      try {
        const data = await animalService.getGroups(farmerId);
        setGroups(Array.isArray(data) ? data : []);
      } catch (err) {
        setLoadError(err?.message || 'Could not load your animal groups.');
        setGroups([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [farmerId]);

  const handleAddAnimal = async (formData) => {
    try {
      await animalService.registerGroup(farmerId, formData);
      showToast(`${formData.numberOfAnimals} ${TYPE_LABELS[formData.type]} registered.`);
    } catch (err) {
      showToast(err?.message || 'Failed to register animal group.', 'error');
    }
  };

  const confirmDelete = async () => {
    if (!groupToDelete) return;
    setIsDeleting(true);
    try {
      await animalService.deleteGroup(farmerId, groupToDelete.id);
      setGroups((prev) => prev.filter((g) => g.id !== groupToDelete.id));
      showToast(`${TYPE_LABELS[groupToDelete.type]} group removed.`);
    } catch {
      setGroups((prev) => prev.filter((g) => g.id !== groupToDelete.id));
      showToast(`${TYPE_LABELS[groupToDelete.type]} group removed locally.`);
    } finally {
      setGroupToDelete(null);
      setIsDeleting(false);
    }
  };

  const totalAnimals = groups.reduce((acc, g) => acc + (g.numberOfAnimals || 0), 0);

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {toast && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px', zIndex: 1100,
          backgroundColor: toast.type === 'error' ? '#B91C1C' : '#164230',
          color: '#FFFFFF',
          padding: '12px 20px', borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          display: 'flex', alignItems: 'center', gap: '10px',
          fontSize: '0.875rem', fontWeight: 500
        }}>
          <span style={{
            width: '22px', height: '22px', borderRadius: '50%',
            backgroundColor: toast.type === 'error' ? '#FCA5A5' : '#3E7B52',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <IconCheck size={14} color="#FFFFFF" />
          </span>
          <span>{toast.msg}</span>
        </div>
      )}

      {groupToDelete && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(19, 32, 28, 0.45)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1300, padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            boxShadow: '0 20px 40px rgba(22, 66, 48, 0.2)',
            width: '100%', maxWidth: '460px',
            padding: '28px',
            border: '1px solid #ECE7DC',
            display: 'flex', flexDirection: 'column', gap: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px',
                backgroundColor: '#FEE2E2',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0
              }}>
                <IconWarning size={22} color="#DC2626" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#19201C', margin: 0 }}>
                  Delete Animal Group?
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#788680', marginTop: '6px', margin: 0, lineHeight: 1.5 }}>
                  Are you sure you want to delete <strong style={{ color: '#19201C' }}>{groupToDelete.numberOfAnimals} {TYPE_LABELS[groupToDelete.type]}</strong>?
                  This action cannot be undone.
                </p>
              </div>
            </div>
            <div style={{
              display: 'flex', justifyContent: 'flex-end', gap: '12px',
              paddingTop: '16px', borderTop: '1px solid #F4EFE6'
            }}>
              <button
                onClick={() => setGroupToDelete(null)}
                style={{
                  padding: '10px 18px', borderRadius: '10px',
                  backgroundColor: 'transparent',
                  border: '1px solid #DFD8CA',
                  color: '#4B5752', fontWeight: 600,
                  fontSize: '0.875rem', cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                style={{
                  padding: '10px 20px', borderRadius: '10px',
                  backgroundColor: '#DC2626', color: '#FFFFFF',
                  border: 'none', fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  opacity: isDeleting ? 0.7 : 1,
                  display: 'inline-flex', alignItems: 'center', gap: '6px'
                }}
              >
                <IconTrash size={15} />
                <span>{isDeleting ? 'Deleting...' : 'Delete Group'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <AddAnimalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddAnimal={handleAddAnimal}
      />

      {/* Summary bar */}
      <div style={{
        backgroundColor: '#FFFFFF', border: '1px solid #ECE7DC',
        borderRadius: '20px', padding: '24px 28px',
        boxShadow: '0 2px 8px rgba(22, 66, 48, 0.06)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '12px',
              backgroundColor: '#EAF4ED', color: '#2A6740',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <IconLivestock size={24} color="#2A6740" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#19201C', marginBottom: '2px', letterSpacing: '-0.01em' }}>
                Animal Groups
              </h2>
              <p style={{ fontSize: '0.8125rem', color: '#788680' }}>
                Track livestock by type, purpose, and headcount
              </p>
            </div>
          </div>
          <button
            id="open-add-animal-modal"
            onClick={() => setIsModalOpen(true)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              backgroundColor: '#3E7B52', color: '#FFFFFF', border: 'none',
              padding: '10px 18px', borderRadius: '10px',
              fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(62,123,82,0.25)',
              transition: 'background-color 150ms ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#336844'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3E7B52'}
          >
            <IconPlus size={16} color="#FFFFFF" />
            <span>Add Animal Group</span>
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #ECE7DC', borderRadius: '14px', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ fontSize: '0.75rem', color: '#788680' }}>Total groups</div>
            <div style={{ fontSize: '1.375rem', fontWeight: 700, color: '#19201C' }}>{groups.length}</div>
          </div>
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #ECE7DC', borderRadius: '14px', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ fontSize: '0.75rem', color: '#788680' }}>Total animals</div>
            <div style={{ fontSize: '1.375rem', fontWeight: 700, color: '#19201C' }}>{totalAnimals}</div>
          </div>
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #ECE7DC', borderRadius: '14px', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ fontSize: '0.75rem', color: '#788680' }}>Types</div>
            <div style={{ fontSize: '1.375rem', fontWeight: 700, color: '#19201C' }}>
              {new Set(groups.map((g) => g.type)).size}
            </div>
          </div>
        </div>
      </div>

      {/* Empty state */}
      {loading ? (
        <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--color-text-muted, #788680)', fontSize: '0.875rem' }}>
          Loading your animal groups…
        </div>
      ) : loadError ? (
        <div style={{ padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ color: '#B91C1C', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>
            {loadError}
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '10px', padding: '8px 16px', borderRadius: '10px',
              backgroundColor: 'var(--color-brand-primary, #3E7B52)', color: '#FFFFFF',
              border: 'none', fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer'
            }}
          >
            Try again
          </button>
        </div>
      ) : groups.length === 0 ? (
        <div style={{
          backgroundColor: '#FFFFFF', border: '1px solid #ECE7DC',
          borderRadius: '16px', padding: '60px 40px', textAlign: 'center'
        }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '16px',
            backgroundColor: '#F4EFE6', color: '#788680',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px auto'
          }}>
            <IconLivestock size={28} color="#788680" />
          </div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#19201C', marginBottom: '6px' }}>
            No animal groups registered yet
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#788680' }}>
            Register your first animal group to start tracking livestock production.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              padding: '10px 20px', borderRadius: '10px',
              backgroundColor: 'var(--color-brand-primary)', color: '#FFFFFF',
              fontWeight: 600, fontSize: '0.875rem',
              border: 'none', cursor: 'pointer'
            }}
          >
            + Register your first animal group
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
          {groups.map((group) => {
            const color = TYPE_COLORS[group.type] || TYPE_COLORS.OTHER;
            return (
              <div
                key={group.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #ECE7DC',
                  borderRadius: '16px',
                  padding: '20px 22px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  cursor: 'default',
                  position: 'relative'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(22, 66, 48, 0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '42px', height: '42px', borderRadius: '12px',
                      backgroundColor: `${color}1A`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color, flexShrink: 0
                    }}>
                      <IconLivestock size={22} color={color} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#19201C', lineHeight: 1.3 }}>
                        {TYPE_LABELS[group.type]} Group
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#788680', marginTop: '2px' }}>
                        {PURPOSE_LABELS[group.purpose]} · Started {formatDate(group.startDate)}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      padding: '4px 10px', borderRadius: '9999px', fontSize: '0.75rem',
                      fontWeight: 600, backgroundColor: `${color}1A`, color,
                      border: `1px solid ${color}`, whiteSpace: 'nowrap',
                      display: 'inline-flex', alignItems: 'center', gap: '5px'
                    }}>
                      <IconLivestock size={13} color={color} />
                      {group.numberOfAnimals} head
                    </span>

                    <button
                      onClick={() => setGroupToDelete(group)}
                      title="Delete group"
                      style={{
                        width: '30px', height: '30px',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5',
                        borderRadius: '8px', color: '#DC2626', cursor: 'pointer',
                        transition: 'all 0.2s ease', flexShrink: 0
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#DC2626';
                        e.currentTarget.style.color = '#FFFFFF';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#FEF2F2';
                        e.currentTarget.style.color = '#DC2626';
                      }}
                    >
                      <IconTrash size={14} />
                    </button>
                  </div>
                </div>

                <div style={{ height: '1px', backgroundColor: '#F4EFE6' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.75rem', color: '#788680', marginBottom: '3px' }}>Purpose</div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#19201C' }}>
                      {PURPOSE_LABELS[group.purpose]}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: '#788680', marginBottom: '3px' }}>Headcount</div>
                    <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#19201C' }}>
                      {group.numberOfAnimals}
                    </div>
                  </div>
                </div>

                {group.notes && (
                  <div style={{ fontSize: '0.75rem', color: '#788680', fontStyle: 'italic', marginTop: '8px' }}>
                    {group.notes}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AnimalView;
