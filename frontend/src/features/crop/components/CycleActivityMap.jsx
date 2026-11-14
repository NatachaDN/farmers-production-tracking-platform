import React from 'react';
import { AcreaMap } from '../../../shared/components/AcreaMap';
import { resolveLocationCoords } from '../../../shared/components/acreaMapUtils';

const TYPE_COLORS = {
  WATERING: '#0284C7',
  TREATMENT: '#DC2626',
  FERTILIZING: '#16A34A',
  WEEDING: '#D97706'
};

export function CycleActivityMap({ activities = [], cycleName = '' }) {
  // Extract activity markers from notes/location
  const markers = activities
    .map((act) => {
      const coords = resolveLocationCoords(act.notes);
      if (!coords) return null;
      return {
        lat: coords.latitude,
        lng: coords.longitude,
        title: `${act.activityType} (${act.activityDate})`,
        description: act.notes || '',
        color: TYPE_COLORS[act.activityType] || '#164230'
      };
    })
    .filter(Boolean);

  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      borderRadius: 'var(--radius-xl)',
      border: '1px solid var(--color-card-border)',
      boxShadow: 'var(--shadow-card)',
      padding: '20px 24px'
    }}>
      <AcreaMap
        markers={markers}
        locationText={cycleName}
        label={`Field Interventions Map (${markers.length} pinned ${markers.length === 1 ? 'task' : 'tasks'})`}
        hint="Interactive map of logged agronomic interventions across the cycle field."
        height="220px"
        interactive={false}
        showPresets={false}
        enableGps={false}
      />
    </div>
  );
}

