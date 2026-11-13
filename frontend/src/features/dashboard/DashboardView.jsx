import React from 'react';
import { DashboardGreetingHeader } from './DashboardGreetingHeader';
import { SummaryPanels, SummaryStatus } from './SummaryPanels';
import { useSummary } from './useSummary';

export function DashboardView({ onNavigate, user }) {
  const summary = useSummary(user?.id);
  return <div className="fade-in" style={{ display: 'grid', gap: '28px' }}>
    <DashboardGreetingHeader user={user} onRecordProduction={() => onNavigate?.('production')} />
    <SummaryStatus {...summary} />
    {summary.data && <SummaryPanels data={summary.data} onNavigate={onNavigate} />}
  </div>;
}
export default DashboardView;
