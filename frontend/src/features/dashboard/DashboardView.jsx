import React, { useState } from 'react';
import { MetricCard } from '../../shared/components/MetricCard';
import {
  IconCrop,
  IconProduction,
  IconShoppingBag,
  IconShieldAlert,
  IconPlus,
  IconArrowRight,
  IconCalendar
} from '../../shared/components/Icons';
import { DashboardGreetingHeader } from './DashboardGreetingHeader';
import { ProductionOverviewChart } from './ProductionOverviewChart';
import { UpcomingActivitiesCard } from './UpcomingActivitiesCard';
import { RecentActivitiesCard } from './RecentActivitiesCard';
import { QuickModuleCards } from './QuickModuleCards';

export function DashboardView({ onNavigate, user }) {
  const farmerId = user?.id || 1;

  // Whether the farmer has any production data yet.
  // Defaults to true so the indicator summary is visible on first load (AC1).
  // Set to false to render the "add initial data" empty-state prompt (AC2).
  const [hasData, setHasData] = useState(true);

  const resetDemoData = () => setHasData(true);
  const clearDemoData = () => setHasData(false);

  // ------------------------------------------------------------------ //
  //  Empty state: no data entered yet -> prompt to add initial data   //
  // ------------------------------------------------------------------ //
  if (!hasData) {
    return (
      <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        <DashboardGreetingHeader
          user={user}
          onRecordProduction={() => onNavigate && onNavigate('production')}
        />

        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--color-card-border)',
          borderRadius: 'var(--radius-xl)',
          padding: '48px 32px',
          boxShadow: 'var(--shadow-card)',
          textAlign: 'center'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: '#FEF3C7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <IconPlus size={22} color="#B45309" />
          </div>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            marginBottom: '8px'
          }}>
            No production data yet
          </h2>
          <p style={{
            fontSize: '0.9375rem',
            color: 'var(--color-text-muted)',
            lineHeight: 1.5,
            maxWidth: '420px',
            margin: '0 auto 24px'
          }}>
            Your dashboard is empty. Add your first crop cycle, log an activity, or record a harvest to start tracking your farm.
          </p>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            alignItems: 'center'
          }}>
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('crops')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'var(--color-brand-primary)',
                color: '#FFFFFF',
                padding: '10px 20px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-subtle)',
                transition: 'background-color var(--transition-fast)'
              }}
            >
              <IconPlus size={16} color="#FFFFFF" />
              <span>Add your first crop cycle</span>
            </button>

            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('activities')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: 'transparent',
                  color: 'var(--color-text-primary)',
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  border: '1px solid var(--color-card-border)',
                  cursor: 'pointer'
                }}
              >
                <IconCalendar size={14} color="currentColor" />
                <span>Log an activity</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('production')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: 'transparent',
                  color: 'var(--color-text-primary)',
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  border: '1px solid var(--color-card-border)',
                  cursor: 'pointer'
                }}
              >
                <IconArrowRight size={14} color="currentColor" />
                <span>Record a harvest</span>
              </button>
            </div>

            <div style={{
              marginTop: '20px',
              fontSize: '0.8125rem',
              color: 'var(--color-text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}>
              <span onClick={clearDemoData} style={{ color: 'var(--color-brand-primary)', fontWeight: 600, textDecoration: 'underline' }}>
                Simulate empty state
              </span>
              <span>|</span>
              <span onClick={resetDemoData} style={{ color: 'var(--color-brand-primary)', fontWeight: 600, textDecoration: 'underline' }}>
                Restore demo data
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------------ //
  //  Data present: show key indicators + overview sections            //
  // ------------------------------------------------------------------ //
  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Dynamic Greeting Header */}
      <DashboardGreetingHeader
        user={user}
        onRecordProduction={() => onNavigate && onNavigate('production')}
      />

      {/* 4 Stat Cards Row — key indicators from the user story */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '20px'
      }}>
        <MetricCard
          label="Active cycles"
          value="4"
          subtext="3 on schedule · 1 due soon"
          icon={<IconCrop size={20} color="#2D7A52" />}
          iconBg="#EAF4ED"
        />
        <MetricCard
          label="Latest yield"
          value="12.8 t"
          subtext="+8.4% this season"
          icon={<IconProduction size={20} color="#0D9488" />}
          iconBg="#E6F6F4"
        />
        <MetricCard
          label="Input stock"
          value="12"
          subtext="2 items running low"
          icon={<IconShoppingBag size={20} color="#B45309" />}
          iconBg="#FEF3C7"
        />
        <MetricCard
          label="Alerts"
          value="3"
          subtext="1 critical · 2 warnings"
          icon={<IconShieldAlert size={20} color="#DC2626" />}
          iconBg="#FEE2E2"
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
