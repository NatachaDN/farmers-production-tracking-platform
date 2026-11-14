import React, { useEffect, useState } from 'react';
import { adminService } from './services/adminService';

const cardStyle = {
  backgroundColor: '#FFFFFF',
  border: '1px solid #ECE7DC',
  borderRadius: '16px',
  padding: 'clamp(16px, 3vw, 24px)',
  boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
};

const kpiStyle = {
  ...cardStyle,
  padding: '16px 18px',
};

function BarRow({ label, value, max, suffix = '' }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
        <span style={{ fontWeight: 600, color: '#19201C' }}>{label}</span>
        <span style={{ color: '#4B5752' }}>{value}{suffix}</span>
      </div>
      <div style={{ height: '7px', borderRadius: '9999px', backgroundColor: '#F4EFE6', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', backgroundColor: '#3E7B52', borderRadius: '9999px' }} />
      </div>
    </div>
  );
}

export function AdminAnalyticsView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    adminService.analytics()
      .then((res) => setData(res))
      .catch((err) => setError(err.message || 'Failed to load analytics.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={cardStyle}><p style={{ margin: 0, color: '#64716B' }}>Loading platform analytics…</p></div>;
  if (error) return <div style={cardStyle}><p style={{ margin: 0, color: '#B91C1C' }}>{error}</p></div>;
  if (!data) return null;

  const maxCropKg = Math.max(1, ...(data.harvestByCrop || []).map((c) => c.kg || 0));
  const maxRegionFarms = Math.max(1, ...(data.farmsByRegion || []).map((r) => r.farms || 0));
  const maxLivestockPop = Math.max(1, ...(data.livestockByType || []).map((l) => l.population || 0));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 190px), 1fr))', gap: '14px' }}>
        <div style={kpiStyle}>
          <div style={{ fontSize: '0.75rem', color: '#64716B', fontWeight: 600 }}>Total Users</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#164230' }}>{data.totalUsers}</div>
          <div style={{ fontSize: '0.75rem', color: '#4B5752' }}>{data.totalFarmers} farmers · {data.totalManagers} managers</div>
        </div>
        <div style={kpiStyle}>
          <div style={{ fontSize: '0.75rem', color: '#64716B', fontWeight: 600 }}>Farms &amp; Plots</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#164230' }}>{data.totalFarms} / {data.totalPlots}</div>
          <div style={{ fontSize: '0.75rem', color: '#4B5752' }}>{Number(data.totalPlotAreaHa || 0).toFixed(1)} ha cultivated</div>
        </div>
        <div style={kpiStyle}>
          <div style={{ fontSize: '0.75rem', color: '#64716B', fontWeight: 600 }}>Livestock Headcount</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#164230' }}>{data.totalAnimalPopulation}</div>
          <div style={{ fontSize: '0.75rem', color: '#4B5752' }}>across {data.totalAnimalGroups} animal groups</div>
        </div>
        <div style={kpiStyle}>
          <div style={{ fontSize: '0.75rem', color: '#64716B', fontWeight: 600 }}>Total Harvested</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#164230' }}>{Math.round(data.totalHarvestedKg || 0)} kg</div>
          <div style={{ fontSize: '0.75rem', color: '#4B5752' }}>{data.activeCycles} active · {data.completedCycles} completed cycles</div>
        </div>
        <div style={kpiStyle}>
          <div style={{ fontSize: '0.75rem', color: '#64716B', fontWeight: 600 }}>Incidents</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#164230' }}>{data.totalIncidents}</div>
          <div style={{ fontSize: '0.75rem', color: '#4B5752' }}>{data.openIncidents} open · {data.resolvedIncidents} resolved</div>
        </div>
      </div>

      {/* Breakdown Grids */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '18px' }}>
        <div style={cardStyle}>
          <h3 style={{ margin: '0 0 14px', fontSize: '1rem', fontWeight: 700, color: '#164230' }}>Harvest Output by Crop</h3>
          {(data.harvestByCrop || []).length === 0 ? (
            <p style={{ margin: 0, color: '#64716B', fontSize: '0.875rem' }}>No harvest records yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {data.harvestByCrop.map((c) => (
                <BarRow key={c.crop} label={c.crop} value={Math.round(c.kg)} max={maxCropKg} suffix=" kg" />
              ))}
            </div>
          )}
        </div>

        <div style={cardStyle}>
          <h3 style={{ margin: '0 0 14px', fontSize: '1rem', fontWeight: 700, color: '#164230' }}>Farms by Region</h3>
          {(data.farmsByRegion || []).length === 0 ? (
            <p style={{ margin: 0, color: '#64716B', fontSize: '0.875rem' }}>No regional farm data yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {data.farmsByRegion.map((r) => (
                <BarRow key={r.region} label={`${r.region} (${Number(r.totalAreaHa || 0).toFixed(1)} ha)`} value={r.farms} max={maxRegionFarms} suffix=" farms" />
              ))}
            </div>
          )}
        </div>

        <div style={cardStyle}>
          <h3 style={{ margin: '0 0 14px', fontSize: '1rem', fontWeight: 700, color: '#164230' }}>Livestock Population by Species</h3>
          {(data.livestockByType || []).length === 0 ? (
            <p style={{ margin: 0, color: '#64716B', fontSize: '0.875rem' }}>No livestock groups yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {data.livestockByType.map((l) => (
                <BarRow key={l.animalType} label={`${l.animalType} (${l.groups} groups)`} value={l.population} max={maxLivestockPop} suffix=" head" />
              ))}
            </div>
          )}
        </div>

        <div style={cardStyle}>
          <h3 style={{ margin: '0 0 14px', fontSize: '1rem', fontWeight: 700, color: '#164230' }}>Account &amp; Incident Health</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {(data.usersByRole || []).map((r) => (
              <BarRow key={r.label} label={r.label} value={r.count} max={Math.max(1, data.totalUsers)} />
            ))}
            <div style={{ borderTop: '1px solid #ECE7DC', paddingTop: '10px', marginTop: '4px', display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '0.8125rem', color: '#4B5752' }}>
              <span>Suspended: <strong>{data.suspendedUsers}</strong></span>
              <span>Pending: <strong>{data.pendingUsers}</strong></span>
              <span>Activities: <strong>{data.totalActivities}</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

