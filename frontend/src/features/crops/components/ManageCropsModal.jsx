import React, { useState, useEffect } from 'react';
import { cropService } from '../services/cropService';
import { AddCropModal } from './AddCropModal';
import {
  IconClose,
  IconSprout,
  IconPlus,
  IconTrash,
  IconTomato,
  IconBean,
  IconLeaf,
  IconWheat,
  IconCheck
} from '../../../shared/components/Icons';

function getCropIcon(cropName) {
  const name = (cropName || '').toLowerCase();
  if (name.includes('tomato')) return <IconTomato size={18} color="#2D7A52" />;
  if (name.includes('bean')) return <IconBean size={18} color="#2D7A52" />;
  if (name.includes('cassava') || name.includes('leaf') || name.includes('potato')) return <IconLeaf size={18} color="#2D7A52" />;
  if (name.includes('rice') || name.includes('wheat')) return <IconWheat size={18} color="#2D7A52" />;
  return <IconSprout size={18} color="#2D7A52" />;
}

export function ManageCropsModal({ isOpen, onClose, farmerId = 1, onCropsUpdated }) {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Editing state
  const [editingCropId, setEditingCropId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editVariety, setEditVariety] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Deleting state
  const [cropToDelete, setCropToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    if (isOpen) {
      loadCrops();
    }
  }, [isOpen, farmerId]);

  const loadCrops = async () => {
    setLoading(true);
    try {
      const data = await cropService.getCrops(farmerId);
      setCrops(data || []);
      if (onCropsUpdated) onCropsUpdated(data || []);
    } catch (err) {
      console.warn('Failed to load crops from API:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCropAdded = (newCrop) => {
    setCrops((prev) => {
      const updated = [...prev, newCrop].sort((a, b) => a.name.localeCompare(b.name));
      if (onCropsUpdated) onCropsUpdated(updated);
      return updated;
    });
    showToast(`"${newCrop.displayName || newCrop.name}" added to your crops list.`);
  };

  const startEditing = (crop) => {
    setEditingCropId(crop.id);
    setEditName(crop.name);
    setEditVariety(crop.variety || '');
  };

  const cancelEditing = () => {
    setEditingCropId(null);
    setEditName('');
    setEditVariety('');
  };

  const saveEdit = async (cropId) => {
    if (!editName.trim()) return;
    setSavingEdit(true);
    try {
      const updated = await cropService.updateCrop(farmerId, cropId, {
        name: editName.trim(),
        variety: editVariety.trim() || undefined
      });
      setCrops((prev) =>
        prev.map((c) => (c.id === cropId ? updated : c)).sort((a, b) => a.name.localeCompare(b.name))
      );
      if (onCropsUpdated) onCropsUpdated(crops);
      showToast('Crop updated successfully.');
      cancelEditing();
    } catch (err) {
      console.error('Failed to update crop:', err);
      showToast(err.message || 'Failed to update crop.');
    } finally {
      setSavingEdit(false);
    }
  };

  const confirmDelete = async () => {
    if (!cropToDelete) return;
    setDeleting(true);
    try {
      await cropService.deleteCrop(farmerId, cropToDelete.id);
      setCrops((prev) => {
        const next = prev.filter((c) => c.id !== cropToDelete.id);
        if (onCropsUpdated) onCropsUpdated(next);
        return next;
      });
      showToast(`"${cropToDelete.displayName || cropToDelete.name}" removed from your list.`);
      setCropToDelete(null);
    } catch (err) {
      console.error('Failed to delete crop:', err);
      showToast(err.message || 'Failed to delete crop.');
    } finally {
      setDeleting(false);
    }
  };

  if (!isOpen) return null;

  const filteredCrops = crops.filter((crop) => {
    const q = searchQuery.toLowerCase();
    return (
      crop.name.toLowerCase().includes(q) ||
      (crop.variety && crop.variety.toLowerCase().includes(q))
    );
  });

  return (
    <>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(19, 32, 28, 0.45)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1100,
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(22, 66, 48, 0.2)',
          width: '100%',
          maxWidth: '680px',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid #ECE7DC',
          overflow: 'hidden'
        }}>
          {/* Toast */}
          {toast && (
            <div style={{
              position: 'absolute',
              top: '16px',
              right: '24px',
              zIndex: 1400,
              backgroundColor: '#164230',
              color: '#FFFFFF',
              padding: '10px 18px',
              borderRadius: '10px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <IconCheck size={14} color="#C8E2D0" />
              <span>{toast}</span>
            </div>
          )}

          {/* Modal Header */}
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid #ECE7DC',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#FCFAF7'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: '#EAF4ED',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#3E7B52',
                border: '1px solid #C8E2D0'
              }}>
                <IconSprout size={22} color="#3E7B52" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#19201C', margin: 0 }}>
                    My Crops Catalog
                  </h2>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '999px',
                    backgroundColor: '#EAF4ED',
                    color: '#285336',
                    fontSize: '0.75rem',
                    fontWeight: 700
                  }}>
                    {crops.length} {crops.length === 1 ? 'crop' : 'crops'}
                  </span>
                </div>
                <p style={{ fontSize: '0.8125rem', color: '#788680', margin: '2px 0 0 0' }}>
                  Manage the crops and varieties you grow to quickly reuse them when creating production cycles.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              aria-label="Close dialog"
              style={{
                padding: '6px',
                borderRadius: '8px',
                color: '#788680',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer'
              }}
            >
              <IconClose size={20} />
            </button>
          </div>

          {/* Controls Bar: Search & Add Crop Button */}
          <div style={{
            padding: '16px 24px',
            borderBottom: '1px solid #ECE7DC',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            backgroundColor: '#FFFFFF'
          }}>
            <div style={{ flex: 1, maxWidth: '320px' }}>
              <input
                type="text"
                placeholder="Search crops or varieties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #DFD8CA',
                  fontSize: '0.875rem',
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
              />
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#3E7B52',
                color: '#FFFFFF',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 150ms ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#336844')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#3E7B52')}
            >
              <IconPlus size={16} />
              <span>Add New Crop</span>
            </button>
          </div>

          {/* Crop List Content */}
          <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#788680', fontSize: '0.875rem' }}>
                Loading crops catalog...
              </div>
            ) : filteredCrops.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '48px 20px',
                backgroundColor: '#F9F6F0',
                borderRadius: '12px',
                border: '1px dashed #DFD8CA'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: '#EAF4ED',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px auto'
                }}>
                  <IconSprout size={24} color="#3E7B52" />
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#19201C', margin: '0 0 4px 0' }}>
                  {searchQuery ? 'No crops match your search' : 'No crops registered yet'}
                </h3>
                <p style={{ fontSize: '0.8125rem', color: '#788680', margin: '0 0 16px 0', maxWidth: '360px', marginLeft: 'auto', marginRight: 'auto' }}>
                  {searchQuery
                    ? 'Try searching for another name or variety, or add it as a new crop.'
                    : 'Add your crops (e.g. Maize, Tomatoes, Beans) with specific varieties to easily select them when planning production cycles.'}
                </p>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: '#3E7B52',
                    color: '#FFFFFF',
                    padding: '8px 18px',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <IconPlus size={15} />
                  <span>Register First Crop</span>
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {filteredCrops.map((crop) => {
                  const isEditing = editingCropId === crop.id;

                  if (isEditing) {
                    return (
                      <div
                        key={crop.id}
                        style={{
                          padding: '14px 16px',
                          borderRadius: '10px',
                          border: '1.5px solid #3E7B52',
                          backgroundColor: '#FCFAF7',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px'
                        }}
                      >
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4B5752', display: 'block', marginBottom: '4px' }}>
                              Crop Name *
                            </label>
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              style={{
                                width: '100%',
                                padding: '6px 10px',
                                borderRadius: '6px',
                                border: '1px solid #DFD8CA',
                                fontSize: '0.875rem',
                                boxSizing: 'border-box'
                              }}
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4B5752', display: 'block', marginBottom: '4px' }}>
                              Variety / Cultivar
                            </label>
                            <input
                              type="text"
                              placeholder="Optional"
                              value={editVariety}
                              onChange={(e) => setEditVariety(e.target.value)}
                              style={{
                                width: '100%',
                                padding: '6px 10px',
                                borderRadius: '6px',
                                border: '1px solid #DFD8CA',
                                fontSize: '0.875rem',
                                boxSizing: 'border-box'
                              }}
                            />
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={cancelEditing}
                            disabled={savingEdit}
                            style={{
                              padding: '5px 12px',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              backgroundColor: '#FFFFFF',
                              border: '1px solid #DFD8CA',
                              color: '#4B5752',
                              cursor: 'pointer'
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => saveEdit(crop.id)}
                            disabled={savingEdit || !editName.trim()}
                            style={{
                              padding: '5px 14px',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              backgroundColor: '#3E7B52',
                              border: 'none',
                              color: '#FFFFFF',
                              cursor: 'pointer'
                            }}
                          >
                            {savingEdit ? 'Saving...' : 'Save Changes'}
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={crop.id}
                      style={{
                        padding: '12px 16px',
                        borderRadius: '10px',
                        border: '1px solid #ECE7DC',
                        backgroundColor: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 150ms ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#C8E2D0';
                        e.currentTarget.style.backgroundColor = '#FAFDFB';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#ECE7DC';
                        e.currentTarget.style.backgroundColor = '#FFFFFF';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          backgroundColor: '#EAF4ED',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px solid #C8E2D0'
                        }}>
                          {getCropIcon(crop.name)}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#19201C' }}>
                              {crop.name}
                            </span>
                            {crop.variety && (
                              <span style={{
                                padding: '2px 8px',
                                borderRadius: '6px',
                                backgroundColor: '#F4EFE6',
                                color: '#4B5752',
                                fontSize: '0.75rem',
                                fontWeight: 500,
                                border: '1px solid #DFD8CA'
                              }}>
                                {crop.variety}
                              </span>
                            )}
                          </div>
                          <span style={{ fontSize: '0.75rem', color: '#788680' }}>
                            Available for selection in production cycles
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => startEditing(crop)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #DFD8CA',
                            color: '#285336',
                            cursor: 'pointer'
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setCropToDelete(crop)}
                          aria-label={`Delete ${crop.name}`}
                          style={{
                            padding: '6px',
                            borderRadius: '6px',
                            backgroundColor: 'transparent',
                            border: 'none',
                            color: '#9CA3AF',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = '#DC2626')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = '#9CA3AF')}
                        >
                          <IconTrash size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{
            padding: '14px 24px',
            borderTop: '1px solid #ECE7DC',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#FCFAF7'
          }}>
            <span style={{ fontSize: '0.8125rem', color: '#788680' }}>
              Changes reflect immediately in the New Cycle creation dropdown.
            </span>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 18px',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#19201C',
                backgroundColor: '#FFFFFF',
                border: '1px solid #DFD8CA',
                cursor: 'pointer'
              }}
            >
              Done
            </button>
          </div>
        </div>
      </div>

      {/* Nested Add Crop Modal */}
      {isAddModalOpen && (
        <AddCropModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onCropAdded={handleCropAdded}
          farmerId={farmerId}
        />
      )}

      {/* Delete Confirmation Modal */}
      {cropToDelete && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(19, 32, 28, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1300,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            padding: '24px',
            maxWidth: '420px',
            width: '100%',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            border: '1px solid #ECE7DC'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: '#FEE2E2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <IconTrash size={20} color="#DC2626" />
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#19201C', margin: 0 }}>
                Remove Crop?
              </h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#4B5752', margin: '0 0 20px 0' }}>
              Are you sure you want to remove <strong>{cropToDelete.displayName || cropToDelete.name}</strong> from your personal crops list?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setCropToDelete(null)}
                disabled={deleting}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #DFD8CA',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  border: 'none',
                  cursor: deleting ? 'not-allowed' : 'pointer'
                }}
              >
                {deleting ? 'Removing...' : 'Remove Crop'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
