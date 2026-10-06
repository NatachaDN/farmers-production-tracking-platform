import React from 'react';
import { MetricCard } from '../../shared/components/MetricCard';
import {
  IconCrop,
  IconLivestock,
  IconProduction,
  IconActivities
} from '../../shared/components/Icons';
import { DashboardGreetingHeader } from './DashboardGreetingHeader';
import { ProductionOverviewChart } from './ProductionOverviewChart';
import { UpcomingActivitiesCard } from './UpcomingActivitiesCard';
import { RecentActivitiesCard } from './RecentActivitiesCard';
import { QuickModuleCards } from './QuickModuleCards';

export function DashboardView({ onNavigate, user }) {
  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Dynamic Greeting Header */}
      <DashboardGreetingHeader
        user={user}
        onRecordProduction={() => onNavigate && onNavigate('production')}
      />

      {/* 4 Stat Cards Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '20px'
      }}>
        <MetricCard
          label="Active crop cycles"
          value="4"
          subtext="3 on schedule · 1 due soon"
          icon={<IconCrop size={20} color="#2D7A52" />}
          iconBg="#EAF4ED"
        />
        <MetricCard
          label="Animal groups"
          value="4"
          subtext="1,442 current population"
          icon={<IconLivestock size={20} color="#D97706" />}
          iconBg="#FEF3C7"
        />
        <MetricCard
          label="Total production"
          value="12.8 t"
          subtext="+8.4% this season"
          icon={<IconProduction size={20} color="#0D9488" />}
          iconBg="#E6F6F4"
        />
        <MetricCard
          label="Upcoming activities"
          value="7"
          subtext="Next: Irrigation at 14:00"
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
        <ProductionOverviewChart />
        <UpcomingActivitiesCard onNavigate={onNavigate} />
      </div>

      {/* Bottom Section: Recent Activities & Module Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr 1fr',
        gap: '20px'
      }}>
        <RecentActivitiesCard onNavigate={onNavigate} />
        <QuickModuleCards onNavigate={onNavigate} />
      </div>
    </div>
  );
}

export default DashboardView;
