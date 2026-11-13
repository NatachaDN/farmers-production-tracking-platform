import React from 'react';
import { DashboardGreetingHeader } from './DashboardGreetingHeader';
import { SummaryPanels, SummaryStatus } from './SummaryPanels';
import { useSummary } from './useSummary';
import { LowStockAlerts } from '../inputs/components/LowStockAlerts';
import { FarmReminders } from '../farms/FarmReminders';

export function DashboardView({ onNavigate, user }) {
  const summary = useSummary(user?.id);

  return (
    <div className="dashboard-overview">
      <DashboardGreetingHeader user={user} onRecordProduction={() => onNavigate?.('production')} />
      {user?.id && <LowStockAlerts key={`stock-${user.id}`} farmerId={user.id} onOpen={() => onNavigate?.('inputs')} />}
      {user?.id && <FarmReminders key={`tasks-${user.id}`} farmerId={user.id} onOpen={() => onNavigate?.('calendar')} />}
      <SummaryStatus {...summary} />
      {summary.data && <SummaryPanels data={summary.data} onNavigate={onNavigate} />}
    </div>
  );
}

export default DashboardView;
