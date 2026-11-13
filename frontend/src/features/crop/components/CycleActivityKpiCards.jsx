import React from 'react';
import { MetricCard } from '../../../shared/components/MetricCard';
import { IconActivities, IconWater, IconSprout, IconCheck } from '../../../shared/components/Icons';

export function CycleActivityKpiCards({
  totalCount,
  wateringCount,
  fertilizingCount,
  treatmentCount,
  lastIntervention,
  cycleName,
  isLoading
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
      <MetricCard
        label="Total Interventions"
        value={String(totalCount)}
        subtext={`Cycle: ${cycleName}`}
        icon={<IconActivities size={20} color="#2D7A52" />}
        iconBg="#EAF4ED"
        loading={isLoading}
      />
      <MetricCard
        label="Watering / Irrigation"
        value={String(wateringCount)}
        subtext="Moisture maintenance"
        icon={<IconWater size={20} color="#0284C7" />}
        iconBg="#E0F2FE"
        loading={isLoading}
      />
      <MetricCard
        label="Crop Nutrition"
        value={String(fertilizingCount)}
        subtext="Fertilization & compost"
        icon={<IconSprout size={20} color="#D97706" />}
        iconBg="#FEF3C7"
        loading={isLoading}
      />
      <MetricCard
        label="Pest / Treatments"
        value={String(treatmentCount)}
        subtext={`Last: ${lastIntervention}`}
        icon={<IconCheck size={20} color="#2563EB" />}
        iconBg="#EFF6FF"
        loading={isLoading}
      />
    </div>
  );
}
