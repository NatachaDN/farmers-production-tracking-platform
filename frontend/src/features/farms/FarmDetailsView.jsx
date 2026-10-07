import React, { useState, useEffect } from 'react';
import { farmService } from './services/farmService';
import {
  IconFarms,
  IconSprout,
  IconMapPin,
  IconCheck,
  IconEdit,
  IconWater,
  IconCalendar,
  IconFilter
} from '../../shared/components/Icons';

export function FarmDetailsView({ farmId, onNavigate }) {
  const [farm, setFarm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadFarmDetails() {
      setLoading(true);
      try {
        if (farmId) {
          const data = await farmService.getFarmById(farmId);
          if (isMounted) {
            setFarm(data);
            setEditFormData(data);
          }
        } else {
          // Fallback initial demo farm
          const mockData = {
            id: 1,
            name: 'Green Valley Farm',
            type: 'CROP',
            size: 25,
            sizeUnit: 'HECTARES',
            country: 'Cameroon',
            region: 'West',
            district: 'Bafoussam',
            status: 'ACTIVE',
            description: 'Main farm for maize, beans and vegetables. Located in the highlands with good access to water.',
            mapImageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
            soilType: 'LOAMY',
            slope: 'MODERATE',
            accessToWater: 'YES',
            additionalNotes: 'Near a small river. Good for irrigation.'
          };
          if (isMounted) {
            setFarm(mockData);
            setEditFormData(mockData);
          }
        }
      } catch (err) {
        console.warn('Using default farm representation for view:', err);
        const fallback = {
          id: farmId || 1,
          name: 'Green Valley Farm',
          type: 'CROP',
          size: 25,
          sizeUnit: 'HECTARES',
          country: 'Cameroon',
          region: 'West',
          district: 'Bafoussam',
          status: 'ACTIVE',
          description: 'Main farm for maize, beans and vegetables.',
          mapImageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
          soilType: 'LOAMY',
          slope: 'MODERATE',
          accessToWater: 'YES'
        };
        if (isMounted) {
          setFarm(fallback);
          setEditFormData(fallback);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadFarmDetails();
    return () => { isMounted = false; };
  }, [farmId]);

  const handleEditSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setEditError(null);

    try {
      const payload = {
        name: editFormData.name,
        type: editFormData.type,
        size: Number(editFormData.size),
        sizeUnit: editFormData.sizeUnit || 'HECTARES',
        description: editFormData.description,
        status: editFormData.status,
        country: editFormData.country,
        region: editFormData.region,
        district: editFormData.district,
        mapImageUrl: editFormData.mapImageUrl,
        soilType: editFormData.soilType,
        slope: editFormData.slope,
        accessToWater: editFormData.accessToWater,
        additionalNotes: editFormData.additionalNotes
      };

      if (farm?.id) {
        const updated = await farmService.updateFarm(farm.id, payload);
        setFarm(updated);
      } else {
        setFarm((prev) => ({ ...prev, ...payload }));
      }
      setIsEditModalOpen(false);
    } catch (err) {
      console.error('Failed to update farm:', err);
      setEditError(err.message || 'Failed to update farm details');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        Loading farm details...
      </div>
    );
  }

  const currentFarm = farm || {
    name: 'Green Valley Farm',
    type: 'CROP',
    size: 25,
    sizeUnit: 'HECTARES',
    country: 'Cameroon',
    region: 'West',
    district: 'Bafoussam',
    status: 'ACTIVE'
  };

  const tabs = ['Overview', 'Crops', 'Livestock', 'Resources', 'Activities', 'Settings'];

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Back Link & Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <button
            onClick={() => onNavigate && onNavigate('farms')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'none',
              border: 'none',
              color: 'var(--color-brand-primary)',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              marginBottom: '6px'
            }}
          >
            ← All farms
          </button>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
            {currentFarm.name}
          </h1>
          <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-muted)' }}>
            Monitor and manage all aspects of your farm in one place.
          </p>
        </div>

        {/* Edit Farm Action Button */}
        <button
          onClick={() => {
            setEditFormData(currentFarm);
            setIsEditModalOpen(true);
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--color-card-border)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 18px',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            boxShadow: 'var(--shadow-subtle)',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F4EFE6'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
        >
          <IconEdit size={16} color="var(--color-brand-primary)" />
          <span>Edit farm</span>
        </button>
      </div>

      {/* Meta Info Banner Card */}
      <div style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid var(--color-card-border)',
        borderRadius: 'var(--radius-xl)',
        padding: '24px',
        boxShadow: 'var(--shadow-card)',
        display: 'grid',
        gridTemplateColumns: '260px 1fr',
        gap: '28px',
        alignItems: 'center'
      }}>
        {/* Left Farm Landscape / Map Image */}
        <div style={{
          position: 'relative',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          height: '160px',
          border: '1px solid var(--color-card-border)'
        }}>
          <img
            src={currentFarm.mapImageUrl || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80'}
            alt="Farm view landscape"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>

        {/* Right Meta Info List */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '20px'
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '6px' }}>Farm type</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.0rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              <IconSprout size={18} color="var(--color-brand-primary)" />
              <span>{currentFarm.type === 'CROP' ? 'Crop farm' : currentFarm.type === 'LIVESTOCK' ? 'Livestock farm' : 'Mixed farm'}</span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '6px' }}>Total area</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {currentFarm.size} {currentFarm.sizeUnit === 'HECTARES' ? 'ha' : 'acres'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '6px' }}>Location</div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              {currentFarm.district}, {currentFarm.region}, {currentFarm.country}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '6px' }}>Status</div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: currentFarm.status === 'ACTIVE' ? '#EAF4ED' : '#F1F5F9',
              color: currentFarm.status === 'ACTIVE' ? '#2A6740' : '#475569',
              padding: '4px 12px',
              borderRadius: '9999px',
              fontSize: '0.8125rem',
              fontWeight: 600
            }}>
              <span style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: currentFarm.status === 'ACTIVE' ? '#22C55E' : '#94A3B8'
              }}></span>
              <span>{currentFarm.status === 'ACTIVE' ? 'Active' : 'Inactive'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div style={{
        display: 'flex',
        gap: '8px',
        borderBottom: '1px solid var(--color-card-border)',
        paddingBottom: '2px'
      }}>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 20px',
              fontSize: '0.875rem',
              fontWeight: activeTab === tab ? 700 : 500,
              color: activeTab === tab ? 'var(--color-brand-primary)' : 'var(--color-text-muted)',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab ? '3px solid var(--color-brand-primary)' : '3px solid transparent',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB CONTENT WIDGETS */}
      {activeTab === 'Overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Top Row: Farm Summary KPI Cards (Left) + Interactive Farm Map Container (Right) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: '24px' }}>
            {/* KPI Cards Grid (4 Cards) */}
            <div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '14px' }}>
                Farm summary
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {/* Total Area Card */}
                <div style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--color-card-border)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '20px',
                  boxShadow: 'var(--shadow-card)'
                }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '6px' }}>Total area</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    {currentFarm.size} {currentFarm.sizeUnit === 'HECTARES' ? 'ha' : 'acres'}
                  </div>
                </div>

                {/* Active Crops Card */}
                <div style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--color-card-border)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '20px',
                  boxShadow: 'var(--shadow-card)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Active crops</div>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--color-brand-tint)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <IconSprout size={18} color="var(--color-brand-primary)" />
                    </div>
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '4px' }}>
                    6
                  </div>
                </div>

                {/* Livestock Card */}
                <div style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--color-card-border)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '20px',
                  boxShadow: 'var(--shadow-card)'
                }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '6px' }}>Livestock</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    12
                  </div>
                </div>

                {/* Active Cycles Card */}
                <div style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--color-card-border)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '20px',
                  boxShadow: 'var(--shadow-card)'
                }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '6px' }}>Active cycles</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    2
                  </div>
                </div>
              </div>
            </div>

            {/* Farm Map Container Widget */}
            <div style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--color-card-border)',
              borderRadius: 'var(--radius-xl)',
              padding: '20px',
              boxShadow: 'var(--shadow-card)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  Farm map
                </div>
                <button style={{ background: 'none', border: 'none', color: 'var(--color-brand-primary)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                  View full map →
                </button>
              </div>

              {/* Map Canvas Frame */}
              <div style={{
                position: 'relative',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                flex: 1,
                minHeight: '180px',
                border: '1px solid var(--color-card-border)'
              }}>
                <img
                  src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80"
                  alt="Farm interactive boundary map"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />

                {/* Simulated Polygon Boundary SVG Overlay */}
                <svg
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  <polygon
                    points="20,15 80,10 90,75 55,90 15,65"
                    fill="rgba(34, 197, 94, 0.25)"
                    stroke="#22C55E"
                    strokeWidth="2"
                    strokeDasharray="3 3"
                  />
                  {/* Field markers */}
                  <circle cx="35" cy="40" r="3" fill="#22C55E" />
                  <circle cx="65" cy="50" r="3" fill="#F59E0B" />
                  <circle cx="50" cy="70" r="3" fill="#3B82F6" />
                </svg>

                {/* Map Controls (+ / -) */}
                <div style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  overflow: 'hidden'
                }}>
                  <button style={{ border: 'none', background: 'none', padding: '6px 10px', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer' }}>+</button>
                  <div style={{ height: '1px', backgroundColor: '#ECE7DC' }}></div>
                  <button style={{ border: 'none', background: 'none', padding: '6px 10px', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer' }}>-</button>
                </div>

                {/* Legend Panel (Right overlay) */}
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.92)',
                  backdropFilter: 'blur(4px)',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22C55E' }}></span>
                    <span>Crops area</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#F59E0B' }}></span>
                    <span>Infrastructure</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3B82F6' }}></span>
                    <span>Water source</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', border: '1.5px solid #64748B' }}></span>
                    <span>Boundary</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Row: Recent Activities (Left) + Crop Distribution Chart (Right) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px' }}>
            {/* Recent Activities List */}
            <div style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--color-card-border)',
              borderRadius: 'var(--radius-xl)',
              padding: '24px',
              boxShadow: 'var(--shadow-card)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <h3 style={{ fontSize: '1.0rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  Recent activities
                </h3>
                <button style={{ background: 'none', border: 'none', color: 'var(--color-brand-primary)', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer' }}>
                  View all →
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {[
                  { title: 'Fertilization (Field A)', date: 'Oct 8, 2025 · 50 kg Urea', status: 'Completed', color: '#2E7D32', bg: '#E8F5E9' },
                  { title: 'Weeding (Field B)', date: 'Oct 6, 2025 · Team A', status: 'In progress', color: '#0284C7', bg: '#E0F2FE' },
                  { title: 'Harvest preparation', date: 'Oct 3, 2025 · Field C', status: 'Planned', color: '#D97706', bg: '#FEF3C7' },
                  { title: 'Irrigation (Field A)', date: 'Sep 28, 2025 · 2 hrs', status: 'Completed', color: '#2E7D32', bg: '#E8F5E9' }
                ].map((act, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      justify: 'space-between',
                      alignItems: 'center',
                      padding: '12px 14px',
                      backgroundColor: '#F9F6F0',
                      borderRadius: 'var(--radius-lg)'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {act.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                        {act.date}
                      </div>
                    </div>
                    <span style={{
                      backgroundColor: act.bg,
                      color: act.color,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      padding: '4px 10px',
                      borderRadius: '9999px'
                    }}>
                      {act.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Crop Distribution Donut Chart Widget */}
            <div style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--color-card-border)',
              borderRadius: 'var(--radius-xl)',
              padding: '24px',
              boxShadow: 'var(--shadow-card)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <h3 style={{ fontSize: '1.0rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  Crop distribution
                </h3>
                <button style={{ background: 'none', border: 'none', color: 'var(--color-brand-primary)', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer' }}>
                  View details →
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                {/* SVG Donut Chart with Center Text */}
                <div style={{ position: 'relative', width: '130px', height: '130px', flexShrink: 0 }}>
                  <svg width="130" height="130" viewBox="0 0 42 42">
                    <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#E2E8F0" strokeWidth="6" />
                    {/* Maize 40% */}
                    <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#164230" strokeWidth="6" strokeDasharray="40 60" strokeDashoffset="25" />
                    {/* Beans 20% */}
                    <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#3E7B52" strokeWidth="6" strokeDasharray="20 80" strokeDashoffset="85" />
                    {/* Vegetables 15% */}
                    <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#D97706" strokeWidth="6" strokeDasharray="15 85" strokeDashoffset="65" />
                    {/* Cassava 10% */}
                    <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#F59E0B" strokeWidth="6" strokeDasharray="10 90" strokeDashoffset="50" />
                  </svg>
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                      25 ha
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
                      Total area
                    </div>
                  </div>
                </div>

                {/* Donut Legend Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                  {[
                    { label: 'Maize', pct: '40%', color: '#164230' },
                    { label: 'Beans', pct: '20%', color: '#3E7B52' },
                    { label: 'Vegetables', pct: '15%', color: '#D97706' },
                    { label: 'Cassava', pct: '10%', color: '#F59E0B' },
                    { label: 'Other', pct: '15%', color: '#94A3B8' }
                  ].map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8125rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: item.color }}></span>
                        <span style={{ color: 'var(--color-text-secondary)' }}>{item.label}</span>
                      </div>
                      <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{item.pct}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row: Quick Stats (Left) + Upcoming Tasks (Right) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* Quick Stats Widget */}
            <div style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--color-card-border)',
              borderRadius: 'var(--radius-xl)',
              padding: '24px',
              boxShadow: 'var(--shadow-card)'
            }}>
              <h3 style={{ fontSize: '1.0rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '16px' }}>
                Quick stats
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ backgroundColor: '#F9F6F0', padding: '14px', borderRadius: 'var(--radius-lg)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Yield (est.)</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '2px' }}>
                    8.5 t
                  </div>
                </div>

                <div style={{ backgroundColor: '#F9F6F0', padding: '14px', borderRadius: 'var(--radius-lg)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Expected revenue</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '2px' }}>
                    $ 6,750
                  </div>
                </div>

                <div style={{ backgroundColor: '#F9F6F0', padding: '14px', borderRadius: 'var(--radius-lg)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Soil health</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#2E7D32', marginTop: '2px' }}>
                    Good
                  </div>
                </div>

                <div style={{ backgroundColor: '#F9F6F0', padding: '14px', borderRadius: 'var(--radius-lg)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Water level</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0284C7', marginTop: '2px' }}>
                    Normal
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming Tasks Widget */}
            <div style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--color-card-border)',
              borderRadius: 'var(--radius-xl)',
              padding: '24px',
              boxShadow: 'var(--shadow-card)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.0rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  Upcoming tasks
                </h3>
                <button style={{ background: 'none', border: 'none', color: 'var(--color-brand-primary)', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer' }}>
                  View all →
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { title: 'Fertilization (Field A)', date: 'Oct 8, 2025', due: 'Today', dueBg: '#E8F5E9', dueColor: '#2E7D32' },
                  { title: 'Harvest (Field C)', date: 'Oct 15, 2025', due: '7 days', dueBg: '#E0F2FE', dueColor: '#0284C7' },
                  { title: 'Equipment maintenance', date: 'Oct 20, 2025', due: '12 days', dueBg: '#FEF3C7', dueColor: '#D97706' }
                ].map((task, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid #F4EFE6' }}>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{task.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{task.date}</div>
                    </div>
                    <span style={{ backgroundColor: task.dueBg, color: task.dueColor, padding: '4px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}>
                      {task.due}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT FARM MODAL */}
      {isEditModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--color-card-border)',
            padding: '28px',
            width: '100%',
            maxWidth: '560px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '18px' }}>
              Edit Farm Information
            </h2>

            {editError && (
              <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '10px', borderRadius: '8px', fontSize: '0.8125rem', marginBottom: '14px' }}>
                {editError}
              </div>
            )}

            <form onSubmit={handleEditSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                  Farm Name *
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.name || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-card-border)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                    Farm Type
                  </label>
                  <select
                    value={editFormData.type || 'CROP'}
                    onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-card-border)' }}
                  >
                    <option value="CROP">Crop farm</option>
                    <option value="LIVESTOCK">Livestock farm</option>
                    <option value="MIXED">Mixed farm</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                    Farm Size ({editFormData.sizeUnit === 'ACRES' ? 'acres' : 'ha'})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={editFormData.size || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, size: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-card-border)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editFormData.description || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-card-border)' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--color-card-border)', background: '#FFFFFF', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: 'var(--color-brand-primary)', color: '#FFFFFF', fontWeight: 600, cursor: 'pointer' }}
                >
                  {isSaving ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
