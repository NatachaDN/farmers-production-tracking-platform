import React, { useState, useEffect } from 'react';
import { managerService } from './services/managerService.js';
import { ManagerFarmerDetailModal } from './components/ManagerFarmerDetailModal.jsx';
import {
  IconCrop,
  IconProduction,
  IconLivestock,
  IconSearch,
  IconRefresh
} from '../../shared/components/Icons.jsx';
import { Skeleton } from '../../shared/components/Skeleton.jsx';
import './manager.css';

export function ManagerProductionsView() {
  const [data, setData] = useState(null);
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [activeTab, setActiveTab] = useState('cycles');
  const [search, setSearch] = useState('');
  const [farmerFilter, setFarmerFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [farmerDetail, setFarmerDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchProductions = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await managerService.getProductions({
        search,
        farmerId: farmerFilter,
        status: statusFilter,
      });
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to load farmer productions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    managerService.getFarmers({ sort: 'name' })
      .then((list) => setFarmers(list || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchProductions();
  }, [search, farmerFilter, statusFilter]);

  const handleInspectFarmer = async (farmerId) => {
    if (!farmerId) return;
    try {
      setLoadingDetail(true);
      const detail = await managerService.getFarmerDetail(farmerId);
      setFarmerDetail(detail);
    } catch (err) {
      alert(err.message || 'Could not load farmer details.');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleUpdateStatus = async (farmerId, status, rejectionReason) => {
    await managerService.updateFarmerStatus(farmerId, status, rejectionReason);
    setFarmerDetail(null);
    await fetchProductions();
  };

  const cycles = data?.cycles || [];
  const harvests = data?.harvests || [];
  const animalGroups = data?.animalGroups || [];

  return (
    <div className="mgr-stack">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text-primary, #19201C)', margin: 0 }}>
            Farmer Productions Supervision
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted, #788680)', margin: '4px 0 0' }}>
            Monitor active crop cycles, harvest yields, and livestock groups across all supervised farmers.
          </p>
        </div>
        <button className="mgr-btn" onClick={fetchProductions} disabled={loading}>
          <IconRefresh size={15} /> Refresh
        </button>
      </div>

      {error && (
        <div style={{ padding: '12px 18px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', color: '#B91C1C', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      {/* KPI Strip */}
      <div className="mgr-grid cols-4">
        <div className="mgr-card" style={{ padding: '20px 22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>ACTIVE CYCLES</span>
            <div style={{ padding: '6px', background: '#EAF4ED', borderRadius: '8px', color: '#3E7B52' }}><IconCrop size={18} /></div>
          </div>
          <div className="mgr-stat-val" style={{ marginTop: '10px', color: '#3E7B52' }}>{data?.activeCycles ?? 0}</div>
          <div className="mgr-stat-sub">{data?.totalCycles ?? 0} total cycles</div>
        </div>

        <div className="mgr-card" style={{ padding: '20px 22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>COMPLETED CYCLES</span>
            <div style={{ padding: '6px', background: '#E8F5E9', borderRadius: '8px', color: '#2E7D32' }}><IconCrop size={18} /></div>
          </div>
          <div className="mgr-stat-val" style={{ marginTop: '10px' }}>{data?.completedCycles ?? 0}</div>
          <div className="mgr-stat-sub">Harvested / closed cycles</div>
        </div>

        <div className="mgr-card" style={{ padding: '20px 22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>TOTAL HARVESTED</span>
            <div style={{ padding: '6px', background: '#FEF3C7', borderRadius: '8px', color: '#D97706' }}><IconProduction size={18} /></div>
          </div>
          <div style={{ marginTop: '10px' }}>
            <span className="mgr-stat-val">{data?.totalHarvestTons ?? 0}</span>
            <span className="mgr-stat-unit">Tons</span>
          </div>
          <div className="mgr-stat-sub">{(data?.totalHarvestKg ?? 0).toLocaleString()} kg across {harvests.length} records</div>
        </div>

        <div className="mgr-card" style={{ padding: '20px 22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>LIVESTOCK GROUPS</span>
            <div style={{ padding: '6px', background: '#FEF3C7', borderRadius: '8px', color: '#D97706' }}><IconLivestock size={18} /></div>
          </div>
          <div className="mgr-stat-val" style={{ marginTop: '10px' }}>{data?.totalAnimalGroups ?? 0}</div>
          <div className="mgr-stat-sub">{(data?.totalAnimalPopulation ?? 0).toLocaleString()} total headcount</div>
        </div>
      </div>

      {/* Filters & Tabs */}
      <div className="mgr-card" style={{ padding: '18px 22px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', flex: '1 1 320px' }}>
            <div style={{ position: 'relative', flex: '1 1 200px', minWidth: '180px' }}>
              <IconSearch size={15} color="#788680" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                className="mgr-input"
                placeholder="Search farmer, crop, plot, or livestock..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%', paddingLeft: '36px', boxSizing: 'border-box' }}
              />
            </div>

            <select
              className="mgr-input"
              value={farmerFilter}
              onChange={(e) => setFarmerFilter(e.target.value)}
              style={{ minWidth: '180px' }}
            >
              <option value="ALL">All Supervised Farmers</option>
              {farmers.map((f) => (
                <option key={f.id} value={f.id}>{f.fullName}</option>
              ))}
            </select>

            <select
              className="mgr-input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ minWidth: '140px' }}
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '6px', background: 'var(--color-surface-subtle, #F4EFE6)', padding: '4px', borderRadius: '10px' }}>
            {[
              { id: 'cycles', label: `Crop Cycles (${cycles.length})` },
              { id: 'harvests', label: `Harvests (${harvests.length})` },
              { id: 'animals', label: `Livestock (${animalGroups.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  background: activeTab === tab.id ? '#FFFFFF' : 'transparent',
                  color: activeTab === tab.id ? '#164230' : '#4B5752',
                  boxShadow: activeTab === tab.id ? '0 1px 3px rgba(22,66,48,0.08)' : 'none',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="mgr-card">
        <div className="mgr-card-body flush">
          {loading ? (
            <div style={{ padding: '24px' }}>
              <Skeleton width="100%" height="200px" borderRadius="10px" />
            </div>
          ) : activeTab === 'cycles' ? (
            cycles.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                No crop production cycles match your filters.
              </div>
            ) : (
              <div className="mgr-table-wrap">
                <table className="mgr-table">
                  <thead>
                    <tr>
                      <th>Farmer</th>
                      <th>Cycle & Crop</th>
                      <th>Plot</th>
                      <th>Status</th>
                      <th>Timeline</th>
                      <th className="num">Harvested</th>
                      <th className="num">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cycles.map((c) => (
                      <tr key={c.id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{c.farmerName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{c.farmName}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{c.name}</div>
                          <span className="mgr-pill neutral" style={{ fontSize: '0.6875rem', marginTop: '2px' }}>{c.cropName}</span>
                        </td>
                        <td>{c.plotName}</td>
                        <td>
                          <span className={`mgr-pill ${c.status === 'COMPLETED' ? 'approved' : 'pending'}`}>
                            {c.status}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                          {c.startDate || '—'} → {c.endDate || 'Ongoing'}
                        </td>
                        <td className="num">
                          <strong style={{ color: '#3E7B52' }}>{(c.harvestedKg || 0).toLocaleString()} kg</strong>
                        </td>
                        <td className="num">
                          <button className="mgr-btn" style={{ padding: '5px 10px', fontSize: '0.75rem' }} onClick={() => handleInspectFarmer(c.farmerId)}>
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : activeTab === 'harvests' ? (
            harvests.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                No harvest records match your filters.
              </div>
            ) : (
              <div className="mgr-table-wrap">
                <table className="mgr-table">
                  <thead>
                    <tr>
                      <th>Farmer</th>
                      <th>Crop</th>
                      <th>Cycle</th>
                      <th>Harvest Date</th>
                      <th className="num">Yield</th>
                      <th className="num">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {harvests.map((h) => (
                      <tr key={h.id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{h.farmerName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{h.farmName}</div>
                        </td>
                        <td><span className="mgr-pill approved">{h.cropName}</span></td>
                        <td>{h.cycleName}</td>
                        <td style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>{h.harvestDate || '—'}</td>
                        <td className="num"><strong style={{ color: '#3E7B52' }}>{(h.quantityKg || 0).toLocaleString()} kg</strong></td>
                        <td className="num">
                          <button className="mgr-btn" style={{ padding: '5px 10px', fontSize: '0.75rem' }} onClick={() => handleInspectFarmer(h.farmerId)}>
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : animalGroups.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              No livestock groups match your filters.
            </div>
          ) : (
            <div className="mgr-table-wrap">
              <table className="mgr-table">
                <thead>
                  <tr>
                    <th>Farmer</th>
                    <th>Group Name</th>
                    <th>Type & Breed</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th className="num">Population</th>
                    <th className="num">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {animalGroups.map((a) => (
                    <tr key={a.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{a.farmerName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{a.farmName}</div>
                      </td>
                      <td style={{ fontWeight: 600 }}>{a.name}</td>
                      <td>
                        <div>{a.animalType}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{a.breed || '—'}</div>
                      </td>
                      <td>{a.location || '—'}</td>
                      <td><span className="mgr-pill approved">{a.status}</span></td>
                      <td className="num"><strong>{(a.currentPopulation ?? 0).toLocaleString()}</strong></td>
                      <td className="num">
                        <button className="mgr-btn" style={{ padding: '5px 10px', fontSize: '0.75rem' }} onClick={() => handleInspectFarmer(a.farmerId)}>
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {farmerDetail && !loadingDetail && (
        <ManagerFarmerDetailModal
          detail={farmerDetail}
          onClose={() => setFarmerDetail(null)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </div>
  );
}

export default ManagerProductionsView;
