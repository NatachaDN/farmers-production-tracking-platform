import React, { useState, useEffect } from 'react';
import { managerService } from './services/managerService.js';
import {
  IconReports,
  IconProduction,
  IconCrop,
  IconUsers,
  IconRefresh
} from '../../shared/components/Icons.jsx';
import { Skeleton } from '../../shared/components/Skeleton.jsx';
import './manager.css';

export function ManagerReportsView() {
  const [allFarmers, setAllFarmers] = useState([]);
  const [loadingFarmers, setLoadingFarmers] = useState(true);

  // Report Request Form State
  const today = new Date().toISOString().slice(0, 10);
  const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const [startDate, setStartDate] = useState(sixMonthsAgo);
  const [endDate, setEndDate] = useState(today);
  const [selectedFarmerIds, setSelectedFarmerIds] = useState([]);
  const [regionFilter, setRegionFilter] = useState('ALL');
  const [cropFilter, setCropFilter] = useState('ALL');

  // Report Result State
  const [report, setReport] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    managerService.getFarmers()
      .then(data => {
        setAllFarmers(data || []);
      })
      .catch(err => {
        console.error('Failed to load farmers for report selection', err);
      })
      .finally(() => {
        setLoadingFarmers(false);
      });
  }, []);

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    try {
      setGenerating(true);
      setError('');
      const response = await managerService.generateConsolidatedReport({
        startDate,
        endDate,
        farmerIds: selectedFarmerIds,
        region: regionFilter,
        crop: cropFilter,
      });
      setReport(response);
    } catch (err) {
      setError(err.message || 'Failed to generate consolidated report');
    } finally {
      setGenerating(false);
    }
  };

  const handleExportCsv = async () => {
    try {
      setExporting(true);
      await managerService.downloadConsolidatedReportCsv({
        startDate,
        endDate,
        farmerIds: selectedFarmerIds,
        region: regionFilter,
        crop: cropFilter,
      });
    } catch (err) {
      alert(err.message || 'CSV export failed.');
    } finally {
      setExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleToggleFarmer = (id) => {
    setSelectedFarmerIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAllFarmers = () => {
    if (selectedFarmerIds.length === allFarmers.length) {
      setSelectedFarmerIds([]);
    } else {
      setSelectedFarmerIds(allFarmers.map(f => f.id));
    }
  };

  const applyPreset = (preset) => {
    const now = new Date();
    if (preset === '30d') {
      const d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      setStartDate(d.toISOString().slice(0, 10));
      setEndDate(now.toISOString().slice(0, 10));
    } else if (preset === '90d') {
      const d = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      setStartDate(d.toISOString().slice(0, 10));
      setEndDate(now.toISOString().slice(0, 10));
    } else if (preset === 'year') {
      const d = new Date(now.getFullYear(), 0, 1);
      setStartDate(d.toISOString().slice(0, 10));
      setEndDate(now.toISOString().slice(0, 10));
    }
  };

  // Initial generation on first mount
  useEffect(() => {
    handleGenerate();
  }, []);

  return (
    <div className="mgr-stack">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text-primary, #19201C)', margin: 0 }}>
            Consolidated Multi-Farmer Production Reports
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted, #788680)', margin: '4px 0 0' }}>
            Generate and export aggregated production statements across selected farmers and cooperative regions.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {report && (
            <>
              <button
                className="mgr-btn"
                onClick={handlePrint}
              >
                Print / PDF
              </button>
              <button
                className="mgr-btn mgr-btn-primary"
                onClick={handleExportCsv}
                disabled={exporting}
              >
                {exporting ? 'Exporting...' : 'Export CSV'}
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div style={{
          padding: '12px 18px',
          background: '#FEF2F2',
          border: '1px solid #FECACA',
          borderRadius: '8px',
          color: '#B91C1C',
          fontSize: '0.875rem',
        }}>
          {error}
        </div>
      )}

      {/* Filter / Criteria Card */}
      <div className="mgr-card" style={{ padding: '20px 24px' }}>
        <form onSubmit={handleGenerate}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            {/* Start Date */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                Period Start Date
              </label>
              <input
                type="date"
                className="mgr-input"
                style={{ width: '100%', boxSizing: 'border-box' }}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>

            {/* End Date */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                Period End Date
              </label>
              <input
                type="date"
                className="mgr-input"
                style={{ width: '100%', boxSizing: 'border-box' }}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>

            {/* Quick Presets */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                Quick Presets
              </label>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button type="button" className="mgr-btn" style={{ padding: '8px 10px', fontSize: '0.75rem' }} onClick={() => applyPreset('30d')}>
                  Last 30 Days
                </button>
                <button type="button" className="mgr-btn" style={{ padding: '8px 10px', fontSize: '0.75rem' }} onClick={() => applyPreset('90d')}>
                  Last 90 Days
                </button>
                <button type="button" className="mgr-btn" style={{ padding: '8px 10px', fontSize: '0.75rem' }} onClick={() => applyPreset('year')}>
                  This Year
                </button>
              </div>
            </div>
          </div>

          {/* Farmer Selection Filter */}
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--color-border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                Target Farmers ({selectedFarmerIds.length === 0 ? 'All Supervised Farmers' : `${selectedFarmerIds.length} Selected`})
              </span>
              <button
                type="button"
                className="mgr-btn"
                style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                onClick={handleSelectAllFarmers}
              >
                {selectedFarmerIds.length === allFarmers.length ? 'Clear Selection' : 'Select All'}
              </button>
            </div>

            {loadingFarmers ? (
              <div style={{
                maxHeight: '120px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '8px',
                padding: '8px',
                background: 'var(--color-surface-subtle, #F4EFE6)',
                borderRadius: '8px',
              }}>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 6px' }}>
                    <Skeleton width="16px" height="16px" borderRadius="4px" />
                    <Skeleton width="110px" height="14px" />
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                maxHeight: '120px',
                overflowY: 'auto',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '8px',
                padding: '8px',
                background: 'var(--color-surface-subtle, #F4EFE6)',
                borderRadius: '8px',
              }}>
                {allFarmers.map(f => (
                  <label
                    key={f.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.8125rem',
                      cursor: 'pointer',
                      padding: '4px 6px',
                      borderRadius: '4px',
                      backgroundColor: selectedFarmerIds.includes(f.id) ? '#FFFFFF' : 'transparent',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedFarmerIds.includes(f.id)}
                      onChange={() => handleToggleFarmer(f.id)}
                    />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {f.fullName}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Submit Action */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '18px' }}>
            <button
              type="submit"
              className="mgr-btn mgr-btn-primary"
              disabled={generating}
            >
              {generating ? 'Generating Consolidated Report...' : 'Generate Report'}
            </button>
          </div>
        </form>
      </div>

      {/* Report Output Presentation */}
      {report && (
        <div className="mgr-stack">
          {/* Summary Banner Card */}
          <div className="mgr-card" style={{ padding: '24px 28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <span className="mgr-pill approved" style={{ marginBottom: '8px' }}>
                  {report.reportId}
                </span>
                <h2 style={{ fontSize: '1.375rem', fontWeight: 700, margin: '6px 0 2px' }}>
                  Consolidated Production Summary
                </h2>
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                  Period: <strong>{report.startDate}</strong> to <strong>{report.endDate}</strong> · Covering <strong>{report.totalFarmersCount}</strong> farmers
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Generated at</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{new Date(report.generatedAt).toLocaleString()}</div>
              </div>
            </div>

            {/* KPI Cards Strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginTop: '24px' }}>
              <div style={{ padding: '16px', background: 'var(--color-surface-subtle, #F4EFE6)', borderRadius: '12px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>TOTAL PRODUCTION</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-brand-primary, #3E7B52)', marginTop: '4px' }}>
                  {report.totalYieldTons} <span style={{ fontSize: '0.875rem' }}>Tons</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                  {report.totalYieldKg.toLocaleString()} kg
                </div>
              </div>

              <div style={{ padding: '16px', background: 'var(--color-surface-subtle, #F4EFE6)', borderRadius: '12px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>CULTIVATED AREA</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '4px' }}>
                  {report.totalCultivatedAreaHa} <span style={{ fontSize: '0.875rem' }}>ha</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                  Across {report.totalPlotsCount} plots
                </div>
              </div>

              <div style={{ padding: '16px', background: 'var(--color-surface-subtle, #F4EFE6)', borderRadius: '12px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>CYCLES PERFORMANCE</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#D97706', marginTop: '4px' }}>
                  {report.totalActiveCycles} <span style={{ fontSize: '0.875rem' }}>active</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                  {report.totalCompletedCycles} completed
                </div>
              </div>

              <div style={{ padding: '16px', background: 'var(--color-surface-subtle, #F4EFE6)', borderRadius: '12px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>FARM INPUTS SPEND</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '4px' }}>
                  ${report.totalInputsCost.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                  {report.totalIncidentsCount} incidents recorded
                </div>
              </div>
            </div>
          </div>

          {/* Crop Production Breakdown Table */}
          <div className="mgr-card">
            <div className="mgr-card-head">
              <div>
                <div className="mgr-card-title">Crop Production Breakdown</div>
                <div className="mgr-card-sub">Yield distribution and volume share across all harvested crops</div>
              </div>
            </div>
            <div className="mgr-card-body flush">
              {(!report.cropBreakdown || report.cropBreakdown.length === 0) ? (
                <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  No crop harvest records recorded during this time window.
                </div>
              ) : (
                <div className="mgr-table-wrap">
                  <table className="mgr-table">
                    <thead>
                      <tr>
                        <th>Crop Name</th>
                        <th className="num">Yield (Kg)</th>
                        <th className="num">Yield (Tons)</th>
                        <th className="num">Cycles Count</th>
                        <th style={{ width: '220px' }}>Production Share (%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.cropBreakdown.map((crop, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: 600 }}>{crop.cropName}</td>
                          <td className="num">{crop.yieldKg.toLocaleString()} kg</td>
                          <td className="num">
                            <strong style={{ color: 'var(--color-brand-primary, #3E7B52)' }}>{crop.yieldTons} t</strong>
                          </td>
                          <td className="num">{crop.cyclesCount}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{
                                flex: 1,
                                height: '8px',
                                background: '#E8E3D8',
                                borderRadius: '4px',
                                overflow: 'hidden',
                              }}>
                                <div style={{
                                  width: `${crop.sharePercent}%`,
                                  height: '100%',
                                  background: 'var(--color-brand-primary, #3E7B52)',
                                  borderRadius: '4px',
                                }} />
                              </div>
                              <span style={{ fontSize: '0.75rem', fontWeight: 600, width: '42px' }}>
                                {crop.sharePercent}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Farmer Performance Breakdown Table */}
          <div className="mgr-card">
            <div className="mgr-card-head">
              <div>
                <div className="mgr-card-title">Individual Farmer Performance Breakdown</div>
                <div className="mgr-card-sub">Per-farmer contribution to total cooperative volume</div>
              </div>
            </div>
            <div className="mgr-card-body flush">
              {(!report.farmerBreakdown || report.farmerBreakdown.length === 0) ? (
                <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  No farmer output records available.
                </div>
              ) : (
                <div className="mgr-table-wrap">
                  <table className="mgr-table">
                    <thead>
                      <tr>
                        <th>Farmer</th>
                        <th>Location</th>
                        <th>Crops</th>
                        <th className="num">Plots</th>
                        <th className="num">Active Cycles</th>
                        <th className="num">Completed Cycles</th>
                        <th className="num">Total Yield</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.farmerBreakdown.map(f => (
                        <tr key={f.farmerId}>
                          <td>
                            <div style={{ fontWeight: 600 }}>{f.farmerName}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{f.farmName}</div>
                          </td>
                          <td style={{ fontSize: '0.8125rem' }}>{f.location}</td>
                          <td>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                              {f.crops && f.crops.length > 0 ? (
                                f.crops.map((c, i) => (
                                  <span key={i} className="mgr-pill neutral" style={{ fontSize: '0.6875rem' }}>
                                    {c}
                                  </span>
                                ))
                              ) : (
                                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>—</span>
                              )}
                            </div>
                          </td>
                          <td className="num">{f.plotsCount}</td>
                          <td className="num">
                            <span style={{ color: '#2A6740', fontWeight: 600 }}>{f.activeCycles}</span>
                          </td>
                          <td className="num">{f.completedCycles}</td>
                          <td className="num">
                            <strong style={{ color: 'var(--color-brand-primary, #3E7B52)' }}>{f.harvestedTons} t</strong>
                            <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
                              {f.harvestedKg?.toLocaleString() || 0} kg
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

