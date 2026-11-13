import React, { useEffect, useState } from 'react';
import { cycleActivityService } from '../services/cycleActivityService';
import { cycleIncidentService } from '../services/cycleIncidentService';

function RecordList({ title, records, dateField, typeField, descriptionField }) {
  return (
    <section>
      <h3>{title}</h3>
      {records.status === 'rejected' ? <p role="alert">Could not load {title.toLowerCase()}.</p>
        : records.value.length === 0 ? <p>No {title.toLowerCase()} recorded.</p>
        : <ul className="production-event-list">
            {records.value.map(record => (
              <li key={record.id}>
                <strong>{record[typeField]?.replaceAll('_', ' ').toLowerCase()}</strong>
                <time dateTime={record[dateField]}>{record[dateField]}</time>
                {record[descriptionField] && <p>{record[descriptionField]}</p>}
              </li>
            ))}
          </ul>}
    </section>
  );
}

export function ProductionCycleRecords({ farmerId, cycleId }) {
  const [records, setRecords] = useState(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let current = true;
    Promise.allSettled([
      cycleActivityService.getActivities(farmerId, cycleId),
      cycleIncidentService.getIncidents(farmerId, cycleId),
    ]).then(result => { if (current) setRecords(result); });
    return () => { current = false; };
  }, [farmerId, cycleId, attempt]);

  return (
    <div className="production-history-card">
      {!records ? <p role="status">Loading activities and incidents…</p> : <>
        <div className="production-records-grid">
          <RecordList title="Activities" records={records[0]} dateField="activityDate" typeField="activityType" descriptionField="notes" />
          <RecordList title="Incidents" records={records[1]} dateField="incidentDate" typeField="incidentType" descriptionField="description" />
        </div>
        {records.some(result => result.status === 'rejected') && (
          <button type="button" className="production-history-action" onClick={() => { setRecords(null); setAttempt(value => value + 1); }}>Retry loading records</button>
        )}
      </>}
    </div>
  );
}
