import React, { useEffect, useState } from 'react';
import { apiClient } from '../../shared/services/apiClient';

export function FarmReminders({ farmerId, onOpen }) {
  const [reminders, setReminders] = useState(null);
  useEffect(() => {
    let current = true;
    apiClient.get(`/farmers/${farmerId}/tasks/reminders`).then(data => { if (current) setReminders(data); })
      .catch(() => { if (current) setReminders(false); });
    return () => { current = false; };
  }, [farmerId]);
  if (reminders === false) return <p className="workspace-muted" role="status">Activity reminders are temporarily unavailable.</p>;
  if (!reminders?.tasks.length) return null;
  return (
    <section className="workspace-panel">
      <header className="workspace-toolbar"><h2>Activity reminders</h2><button type="button" className="workspace-button" onClick={onOpen}>Open calendar</button></header>
      <ul className="summary-list">{reminders.tasks.map(task => (
        <li key={task.id}><strong>{task.title}</strong><span>{task.date < reminders.today ? 'Overdue' : task.date === reminders.today ? 'Due today' : 'Due tomorrow'} · {task.date}</span></li>
      ))}</ul>
    </section>
  );
}
