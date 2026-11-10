import React, { useState, useEffect } from 'react';
import { MetricCard } from '../../shared/components/MetricCard';
import {
  IconCrop,
  IconFarms,
  IconProduction,
  IconActivities
} from '../../shared/components/Icons';
import { DashboardGreetingHeader } from './DashboardGreetingHeader';
import { ProductionOverviewChart } from './ProductionOverviewChart';
import { UpcomingActivitiesCard } from './UpcomingActivitiesCard';
import { RecentActivitiesCard } from './RecentActivitiesCard';
import { QuickModuleCards } from './QuickModuleCards';
import { dashboardService } from './services/dashboardService';

export function DashboardView({ onNavigate, user }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const farmerId = user?.id;

  useEffect(() => {
    let isMounted = true;

    async function loadSummary() {
      if (!farmerId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await dashboardService.getSummary(farmerId);
        if (isMounted) setSummary(data);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        if (isMounted) setError(err.message || 'Failed to load dashboard data.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadSummary();
    return () => { isMounted = false; };
  }, [farmerId]);

  // Derived values from real DB summary
  const activeCycles = summary?.activeCyclesCount ?? 0;
  const completedCycles = summary?.completedCyclesCount ?? 0;
  const plotsCount = summary?.plotsCount ?? 0;
  const totalAreaHa = summary?.totalAreaHa ?? 0;
  const totalHarvestKg = summary?.totalHarvestKg ?? 0;
  const harvestCount = summary?.harvestCount ?? 0;
  const activitiesCount = summary?.activitiesCount ?? 0;

  const harvestDisplay = totalHarvestKg >= 1000
    ? `${(totalHarvestKg / 1000).toFixed(1)} t`
    : `${totalHarvestKg.toFixed(0)} kg`;

  const nextActivityText = summary?.upcomingActivities?.length > 0
    ? `Next: ${summary.upcomingActivities[0].title}`
    : (activitiesCount > 0 ? `${activitiesCount} activities recorded` : 'No activities logged yet');

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Dynamic Greeting Header */}
      <DashboardGreetingHeader
        user={user}
        onRecordProduction={() => onNavigate && onNavigate('production')}
      />

      {error && (
        <div style={{
          backgroundColor: '#FEF2F2',
          border: '1px solid #FCA5A5',
          borderRadius: 'var(--radius-lg)',
          padding: '12px 16px',
          color: '#B91C1C',
          fontSize: '0.875rem'
        }}>
          {error}
        </div>
      )}

      {/* 4 Stat Cards Row - 100% Real Database Values */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '20px'
      }}>
        <MetricCard
          label="Active crop cycles"
          value={loading ? '…' : String(activeCycles)}
          subtext={activeCycles > 0 ? `${activeCycles} in progress · ${completedCycles} completed` : 'No active cycles'}
          icon={<IconCrop size={20} color="#2D7A52" />}
          iconBg="#EAF4ED"
        />
        <MetricCard
          label="Plots & Cultivation"
          value={loading ? '…' : String(plotsCount)}
          subtext={plotsCount > 0 ? `${totalAreaHa} ha total area` : 'No plots registered'}
          icon={<IconFarms size={20} color="#D97706" />}
          iconBg="#FEF3C7"
        />
        <MetricCard
          label="Total production"
          value={loading ? '…' : harvestDisplay}
          subtext={harvestCount > 0 ? `${harvestCount} harvest record${harvestCount === 1 ? '' : 's'}` : 'No harvests recorded yet'}
          icon={<IconProduction size={20} color="#0D9488" />}
          iconBg="#E6F6F4"
        />
        <MetricCard
          label="Upcoming activities"
          value={loading ? '…' : String(summary?.upcomingActivities?.length ?? 0)}
          subtext={nextActivityText}
          icon={<IconActivities size={20} color="#2D7A52" />}
          iconBg="#E8F5E9"
        />
      </div>

      {/* Middle Section: Production Overview & Upcoming Activities */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.7fr 1fr',
        gap: '20px'
      }}>
        <ProductionOverviewChart
          data={summary?.monthlyProduction || []}
          totalKg={totalHarvestKg}
        />
        <UpcomingActivitiesCard
          activities={summary?.upcomingActivities || []}
          onNavigate={onNavigate}
        />
      </div>

      {/* Bottom Section: Recent Activities & Module Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr 1fr',
        gap: '20px'
      }}>
        <RecentActivitiesCard
          activities={summary?.recentActivities || []}
          onNavigate={onNavigate}
        />
        <QuickModuleCards
          summary={summary}
          onNavigate={onNavigate}
        />
      </div>
    </div>
  );
}

export default DashboardView;
