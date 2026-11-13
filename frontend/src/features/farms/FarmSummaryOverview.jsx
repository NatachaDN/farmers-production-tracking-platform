import React from 'react';
import { useSummary } from '../dashboard/useSummary';
import { SummaryPanels, SummaryStatus } from '../dashboard/SummaryPanels';

export function FarmSummaryOverview({ farmerId, farm, onNavigate }) {
  const summary = useSummary(farmerId, farm.id);
  return <div style={{ display: 'grid', gap: '24px' }}>
    <SummaryStatus {...summary} />
    {summary.data && <SummaryPanels data={summary.data} onNavigate={onNavigate} farm />}
    <section className="summary-card"><h3>Farm map</h3>
      {farm.mapImageUrl ? <img src={farm.mapImageUrl} alt={`Saved map image for ${farm.name}`} style={{ width: '100%', maxHeight: '320px', objectFit: 'contain' }} /> : <p>No map image has been saved for this farm.</p>}
    </section>
  </div>;
}
