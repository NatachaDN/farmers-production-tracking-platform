import React from 'react';
import { IconArrowRight, IconPlus } from '../../shared/components/Icons';

export function DashboardGreetingHeader({ user, onRecordProduction }) {
  const firstName = user?.fullName?.trim().split(/\s+/)[0];

  return (
    <section className="dashboard-greeting" aria-labelledby="dashboard-greeting-title">
      <div>
        <h2 id="dashboard-greeting-title">{firstName ? `Hello, ${firstName}` : 'Welcome to Acrea'}</h2>
        <p>See what’s growing, what’s due for harvest, and what your farm has produced.</p>
      </div>
      <button type="button" className="dashboard-primary-action" onClick={onRecordProduction}>
        <IconPlus size={18} /> Record production <IconArrowRight size={17} />
      </button>
    </section>
  );
}
