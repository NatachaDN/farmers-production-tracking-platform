import React, { useEffect, useState } from 'react';
import { inputService } from '../services/inputService';

export function LowStockAlerts({ farmerId, onOpen }) {
  const [alerts, setAlerts] = useState([]);
  useEffect(() => {
    let current = true;
    inputService.getInputs(farmerId).then(inputs => {
      if (current) setAlerts(inputs.filter(input => input.lowStockThreshold != null && input.quantity < input.lowStockThreshold));
    }).catch(() => { if (current) setAlerts(null); });
    return () => { current = false; };
  }, [farmerId]);
  if (!alerts) return <p className="workspace-muted" role="status">Stock alerts are temporarily unavailable.</p>;
  if (!alerts.length) return null;

  return (
    <section className="workspace-panel">
      <header className="workspace-toolbar"><h2>Low stock</h2><button type="button" className="workspace-button" onClick={onOpen}>Open inventory</button></header>
      <ul className="summary-list">{alerts.map(input => (
        <li key={input.id}><strong>{input.name}</strong><span>{input.quantity} {input.unit} left · threshold {input.lowStockThreshold} {input.unit}</span></li>
      ))}</ul>
    </section>
  );
}
