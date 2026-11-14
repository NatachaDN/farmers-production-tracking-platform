import React from 'react';
import { useSummary } from '../dashboard/useSummary';
import { SummaryPanels, SummaryStatus } from '../dashboard/SummaryPanels';

export function FarmSummaryOverview({ farmerId, farm, onNavigate }) {
  const summary = useSummary(farmerId, farm.id);
  return <div style={{ display: 'grid', gap: '24px' }}>
    <SummaryStatus {...summary} />
    {summary.data && farm.type === 'CROP' && <SummaryPanels data={summary.data} onNavigate={onNavigate} farm />}
  </div>;
}
