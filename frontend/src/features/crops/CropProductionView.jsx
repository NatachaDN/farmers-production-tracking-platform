import React, { useState } from 'react';
import { CropCycleCard } from '../../shared/components/CropCycleCard';
import {
  IconPlus,
  IconSprout,
  IconTomato,
  IconBean,
  IconLeaf
} from '../../shared/components/Icons';

export function CropProductionView() {
  const [activeTab, setActiveTab] = useState('Active');

  const cycles = [
    {
      id: 'cycle-1',
      cropName: 'Maize',
      plotName: 'Plot A',
      area: '2.5 ha cultivated',
      status: 'Active',
      plantingDate: '12 Jul 2026',
      expectedHarvest: '28 Nov 2026',
      stage: 'Vegetative growth',
      progress: 62,
      subStatus: 'On track',
      icon: <IconSprout size={20} color="#2D7A52" />
    },
    {
      id: 'cycle-2',
      cropName: 'Tomatoes',
      plotName: 'Plot B',
      area: '1.0 ha cultivated',
      status: 'Active',
      plantingDate: '03 Aug 2026',
      expectedHarvest: '18 Oct 2026',
      stage: 'Flowering',
      progress: 74,
      subStatus: 'On track',
      icon: <IconTomato size={20} color="#2D7A52" />
    },
    {
      id: 'cycle-3',
      cropName: 'Beans',
      plotName: 'Plot C',
      area: '0.8 ha cultivated',
      status: 'Active',
      plantingDate: '20 Sep 2026',
      expectedHarvest: '14 Dec 2026',
      stage: 'Planting',
      progress: 29,
      subStatus: 'On track',
      icon: <IconBean size={20} color="#2D7A52" />
    },
    {
      id: 'cycle-4',
      cropName: 'Cassava',
      plotName: 'Plot D',
      area: '2.0 ha cultivated',
      status: 'Completed',
      plantingDate: '15 Feb 2026',
      expectedHarvest: '30 Nov 2026',
      stage: 'Maturing',
      progress: 84,
      subStatus: 'Final yield 7.9 t',
      icon: <IconLeaf size={20} color="#2D7A52" />
    }
  ];

  const filteredCycles = cycles.filter(c => {
    if (activeTab === 'All') return true;
    return c.status === activeTab;
  });

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Control Bar: Tabs & Action Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Navigation Filter Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {['All', 'Active', 'Completed'].map((tab) => {
            const isSelected = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '8px 18px',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '0.875rem',
                  fontWeight: isSelected ? 600 : 500,
                  backgroundColor: isSelected ? '#FFFFFF' : 'transparent',
                  color: isSelected ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                  border: isSelected ? '1px solid var(--color-card-border)' : '1px solid transparent',
                  boxShadow: isSelected ? 'var(--shadow-subtle)' : 'none',
                  transition: 'all var(--transition-fast)'
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* New Production Cycle Action */}
        <button
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--color-brand-primary)',
            color: '#FFFFFF',
            padding: '10px 18px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.875rem',
            fontWeight: 600,
            boxShadow: 'var(--shadow-subtle)',
            transition: 'background-color var(--transition-fast)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-brand-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-brand-primary)'}
        >
          <IconPlus size={16} />
          <span>New Production Cycle</span>
        </button>
      </div>

      {/* Summary Metrics Row (3 Columns) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '20px'
      }}>
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--color-card-border)',
          borderRadius: 'var(--radius-xl)',
          padding: '20px 24px',
          boxShadow: 'var(--shadow-card)'
        }}>
          <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
            Active cycles
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            4
          </div>
        </div>

        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--color-card-border)',
          borderRadius: 'var(--radius-xl)',
          padding: '20px 24px',
          boxShadow: 'var(--shadow-card)'
        }}>
          <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
            Cultivated area
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            6.3 ha
          </div>
        </div>

        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--color-card-border)',
          borderRadius: 'var(--radius-xl)',
          padding: '20px 24px',
          boxShadow: 'var(--shadow-card)'
        }}>
          <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
            Expected production
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            18.6 t
          </div>
        </div>
      </div>

      {/* 2-Column Crop Cycles Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '20px'
      }}>
        {filteredCycles.map((cycle) => (
          <CropCycleCard
            key={cycle.id}
            icon={cycle.icon}
            cropName={cycle.cropName}
            plotName={cycle.plotName}
            area={cycle.area}
            status={cycle.status}
            plantingDate={cycle.plantingDate}
            expectedHarvest={cycle.expectedHarvest}
            stage={cycle.stage}
            progress={cycle.progress}
            subStatus={cycle.subStatus}
          />
        ))}
      </div>
    </div>
  );
}
