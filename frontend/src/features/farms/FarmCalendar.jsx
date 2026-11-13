import React, { useEffect, useState } from 'react';
import { apiClient } from '../../shared/services/apiClient';

function localDate() {
  const now = new Date();
  return [now.getFullYear(), now.getMonth() + 1, now.getDate()].map(part => String(part).padStart(2, '0')).join('-');
}

export function FarmCalendar({ farmerId }) {
  const [month, setMonth] = useState(() => localDate().slice(0, 7));
  const [tasks, setTasks] = useState(null);
  const [pending, setPending] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const endpoint = `/farmers/${farmerId}/tasks`;

  useEffect(() => {
    if (!month) return;
    let current = true;
    apiClient.get(`${endpoint}?month=${encodeURIComponent(month)}`)
      .then(rows => { if (current) setTasks(rows); })
      .catch(failure => { if (current) setLoadError(failure.message); });
    return () => { current = false; };
  }, [endpoint, month, attempt]);

  async function save(event, task) {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;
    const fields = Object.fromEntries(new FormData(form));
    setPending(true);
    setError('');
    try {
      const saved = task ? await apiClient.put(`${endpoint}/${task.id}/complete`, {}) : await apiClient.post(endpoint, fields);
      if (!task) form.reset();
      if (saved.date.slice(0, 7) !== month) {
        setTasks(null);
        setLoadError('');
        setMonth(saved.date.slice(0, 7));
      } else {
        setTasks(previous => [...previous.filter(row => row.id !== saved.id), saved]
          .sort((a, b) => a.date.localeCompare(b.date) || a.id - b.id));
      }
    } catch (failure) {
      setError(failure.message);
    } finally {
      setPending(false);
    }
  }

  const today = localDate();
  const byDate = new Map();
  for (const task of tasks ?? []) {
    if (!byDate.has(task.date)) byDate.set(task.date, []);
    byDate.get(task.date).push(task);
  }
  return (
    <div className="workspace-screen">
      <section className="workspace-panel">
        <h2>Schedule an activity</h2>
        <form className="workspace-form-grid" onSubmit={event => save(event)}>
          <label>Activity<input name="title" maxLength={140} required disabled={!tasks || pending} /></label>
          <label>Date<input name="date" type="date" required disabled={!tasks || pending} /></label>
          <button type="submit" className="workspace-button primary" disabled={!tasks || pending}>Schedule activity</button>
        </form>
        {error && <p className="workspace-error" role="alert">{error}</p>}
      </section>
      <section className="workspace-panel">
        <header className="workspace-toolbar"><h2>Monthly agenda</h2>
          <label className="workspace-filter">Month<input type="month" value={month} required disabled={pending} onChange={event => {
            if (!event.target.value || event.target.value === month) return;
            setTasks(null);
            setLoadError('');
            setMonth(event.target.value);
          }} /></label>
        </header>
        {loadError ? <p className="workspace-error" role="alert">{loadError}{' '}
          <button type="button" className="workspace-button" onClick={() => { setLoadError(''); setAttempt(value => value + 1); }}>Try again</button>
        </p> : !tasks ? <p role="status">Loading agenda…</p> : byDate.size ? (
          [...byDate].map(([date, rows]) => <section key={date}>
            <h3><time dateTime={date}>{date}</time></h3>
            <ul className="summary-list">{rows.map(task => <li key={task.id}>
              <strong>{task.title}</strong><span>{task.completed ? 'Completed' : date < today ? 'Overdue' : date === today ? 'Due today' : 'Upcoming'}</span>
              {!task.completed && <form onSubmit={event => save(event, task)}>
                <button type="submit" className="workspace-button" disabled={pending}>Mark complete</button>
              </form>}
            </li>)}</ul>
          </section>)
        ) : <p className="workspace-empty">No activities scheduled for this month.</p>}
      </section>
    </div>
  );
}
