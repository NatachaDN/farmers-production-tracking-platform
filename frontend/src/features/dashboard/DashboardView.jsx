import React from 'react';
import { MetricCard } from '../../shared/components/MetricCard';
import {
  IconCrop,
  IconLivestock,
  IconProduction,
  IconActivities,
  IconPlus,
  IconChevronRight
} from '../../shared/components/Icons';

export function DashboardView({ onNavigate }) {
  // Monthly output data for production overview chart
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const cropHeights = [30, 45, 60, 40, 75, 55, 68, 85, 70, 95, 65, 80];

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Greeting Banner */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            letterSpacing: '-0.02em'
          }}>
            Good morning, Joyce
          </h2>
          <p style={{
            fontSize: '0.875rem',
            color: 'var(--color-text-muted)',
            marginTop: '2px'
          }}>
            Here's an overview of your farm today.
          </p>
        </div>

        <button
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
            boxShadow: 'var(--shadow-subtle)',
            transition: 'background-color var(--transition-fast)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-brand-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-brand-primary)'}
        >
          <IconPlus size={16} />
          <span>Record production</span>
        </button>
      </div>

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
        {/* Production Overview */}
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--color-card-border)',
          borderRadius: 'var(--radius-xl)',
          padding: '24px',
          boxShadow: 'var(--shadow-card)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                Production Overview
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                Monthly output across crops and livestock
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2D7A52' }} />
                  Crops
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#D97706' }} />
                  Animals
                </span>
              </div>

              <span style={{
                fontSize: '0.75rem',
                backgroundColor: '#F4EFE6',
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--color-text-secondary)',
                fontWeight: 500
              }}>
                Last 12 months
              </span>
            </div>
          </div>

          {/* Minimalist Column Chart */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            height: '180px',
            paddingTop: '30px',
            paddingBottom: '10px',
            borderBottom: '1px solid #F0EAE1'
          }}>
            {months.map((m, idx) => (
              <div key={m} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '8px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  height: '120px',
                  width: '6px',
                  position: 'relative'
                }}>
                  <div style={{
                    width: '3px',
                    height: `${cropHeights[idx]}%`,
                    backgroundColor: '#2D7A52',
                    borderRadius: '2px',
                    margin: '0 auto',
                    position: 'relative'
                  }}>
                    <span style={{
                      position: 'absolute',
                      top: '-4px',
                      left: '-2.5px',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#2D7A52'
                    }} />
                  </div>
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{m}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Activities */}
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--color-card-border)',
          borderRadius: 'var(--radius-xl)',
          padding: '24px',
          boxShadow: 'var(--shadow-card)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              Upcoming Activities
            </h3>
            <button
              onClick={() => onNavigate && onNavigate('activities')}
              style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', fontWeight: 500 }}
            >
              View calendar
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { time: '14:00', title: 'Irrigate tomatoes', location: 'Plot B' },
              { time: 'Tomorrow', title: 'Weigh broilers', location: 'Batch C' },
              { time: '04 Oct', title: 'Apply fertilizer', location: 'Plot A' }
            ].map((act, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '10px 12px',
                borderRadius: '10px',
                backgroundColor: '#FAF8F5'
              }}>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--color-text-secondary)',
                  backgroundColor: '#FFFFFF',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: '1px solid #ECE7DC',
                  minWidth: '65px',
                  textAlign: 'center'
                }}>
                  {act.time}
                </span>

                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {act.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    {act.location}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Activities & Module Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr 1fr',
        gap: '20px'
      }}>
        {/* Recent Activities */}
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--color-card-border)',
          borderRadius: 'var(--radius-xl)',
          padding: '24px',
          boxShadow: 'var(--shadow-card)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              Recent Activities
            </h3>
            <button
              onClick={() => onNavigate && onNavigate('activities')}
              style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', fontWeight: 500 }}
            >
              View all
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { title: 'Fertilization — Maize', meta: 'Plot A · Today, 08:30', bg: '#EAF4ED' },
              { title: 'Feeding — Cattle Group 1', meta: 'Dairy unit · Today, 07:15', bg: '#FEF3C7' },
              { title: 'Harvest — Tomatoes', meta: 'Plot B · Yesterday, 16:40', bg: '#E6F6F4' },
              { title: 'Egg collection — Layer Group A', meta: 'Poultry house · Yesterday, 10:20', bg: '#FEF3C7' }
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 4px',
                borderBottom: i < 3 ? '1px solid #F4EFE6' : 'none'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: item.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'currentColor' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {item.meta}
                    </div>
                  </div>
                </div>

                <IconChevronRight size={14} color="var(--color-text-muted)" />
              </div>
            ))}
          </div>
        </div>

        {/* Crop Production Quick Card */}
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--color-card-border)',
          borderRadius: 'var(--radius-xl)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxShadow: 'var(--shadow-card)'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: '#EAF4ED',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <IconCrop size={20} color="#2D7A52" />
              </div>
              <span style={{ fontSize: '0.75rem', backgroundColor: '#EAF4ED', color: '#2D7A52', padding: '3px 8px', borderRadius: '9999px', fontWeight: 500 }}>
                Crop production
              </span>
            </div>

            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '6px' }}>
              Crop Production
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
              Manage plots, production cycles, activities and harvests.
            </p>
          </div>

          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #F4EFE6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              4 active cycles · 6.3 t harvested
            </span>
            <button
              onClick={() => onNavigate && onNavigate('crops')}
              style={{ fontSize: '0.8125rem', color: '#2D7A52', fontWeight: 600 }}
            >
              Open module →
            </button>
          </div>
        </div>

        {/* Animal Production Quick Card */}
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--color-card-border)',
          borderRadius: 'var(--radius-xl)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxShadow: 'var(--shadow-card)'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: '#FEF3C7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <IconLivestock size={20} color="#D97706" />
              </div>
              <span style={{ fontSize: '0.75rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '3px 8px', borderRadius: '9999px', fontWeight: 500 }}>
                Animal production
              </span>
            </div>

            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '6px' }}>
              Animal Production
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
              Track animal groups, feeding, production and population changes.
            </p>
          </div>

          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #F4EFE6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              4 groups · 6,840 units this month
            </span>
            <button
              onClick={() => onNavigate && onNavigate('livestock')}
              style={{ fontSize: '0.8125rem', color: '#D97706', fontWeight: 600 }}
            >
              Open module →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
