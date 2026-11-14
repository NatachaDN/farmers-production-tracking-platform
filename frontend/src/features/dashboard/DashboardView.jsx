import React, { useEffect, useState } from 'react';
import { DashboardGreetingHeader } from './DashboardGreetingHeader';
import { SummaryPanels, SummaryStatus } from './SummaryPanels';
import { useSummary } from './useSummary';
import { LowStockAlerts } from '../inputs/components/LowStockAlerts';
import { apiClient } from '../../shared/services/apiClient';

export function DashboardView({ onNavigate, user, hasCropFarms, livestockFarms }) {
  const summary = useSummary(user?.id);
  const [livestock, setLivestock] = useState(null);
  const [livestockError, setLivestockError] = useState('');
  const hasLivestock = livestockFarms.length > 0;
  useEffect(() => {
    if (!hasLivestock) return;
    let active = true;
    setLivestockError('');
    apiClient.get('/animals/groups')
      .then(rows => { if (active) setLivestock(rows); })
      .catch(error => { if (active) setLivestockError(error.message); });
    return () => { active = false; };
  }, [user?.id, hasLivestock]);
  const farmIds = new Set(livestockFarms.map(farm => farm.id));
  const activeGroups = livestock?.filter(group => group.status === 'ACTIVE' && farmIds.has(group.farmId));

  return (
    <div className="dashboard-overview">
      <DashboardGreetingHeader user={user} onRecordProduction={hasCropFarms ? () => onNavigate?.('production') : undefined} />
      {user?.id && hasCropFarms && <LowStockAlerts key={`stock-${user.id}`} farmerId={user.id} onOpen={() => onNavigate?.('inputs')} />}
      <SummaryStatus {...summary} />
      {summary.data && hasCropFarms && <SummaryPanels data={summary.data} onNavigate={onNavigate} />}
      {summary.data?.farmCount === 0 && !hasCropFarms && <section className="workspace-panel">
        <h2>Create your first farm</h2><button type="button" onClick={() => onNavigate?.('farms-create')}>Create a farm</button>
      </section>}
      {hasLivestock && <section className="workspace-panel">
        <h2>Livestock</h2>
        {livestockError ? <p role="alert">{livestockError}</p> : activeGroups
          ? <p>{activeGroups.length} active groups · {activeGroups.reduce((sum, group) => sum + group.currentPopulation, 0)} animals</p>
          : <p role="status">Loading animal groups…</p>}
        <button className="workspace-button" type="button" onClick={() => onNavigate?.('livestock')}>Open livestock</button>
      </section>}
    </div>
  );
}

export default DashboardView;
