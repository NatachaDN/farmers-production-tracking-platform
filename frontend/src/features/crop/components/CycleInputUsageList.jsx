import React, { useState } from 'react';
import './CycleInputUsageList.css';
import {
  IconInputs,
  IconTrash,
  IconClose,
  IconWarning
} from '../../../shared/components/Icons';

/**
 * CycleInputUsageList displays all inputs consumed on the cycle,
 * the real financial cost breakdown, and allows restoring stock if removed.
 */
export function CycleInputUsageList({
  usages = [],
  costSummary = null,
  onDeleteUsage,
  isLoading = false
}) {
  const [deletingId, setDeletingId] = useState(null);

  const handleDeleteClick = (usage) => {
    const confirmMessage = `Remove "${usage.inputName}" from this cycle? This will restore ${usage.quantityUsed} ${usage.unit} back to your available inventory stock.`;
    if (window.confirm(confirmMessage)) {
      setDeletingId(usage.id);
      onDeleteUsage(usage.id).finally(() => setDeletingId(null));
    }
  };

  const totalCost = costSummary?.totalInputCost ?? usages.reduce((sum, u) => sum + (u.totalCost || 0), 0);
  const costByType = costSummary?.costByType || {};

  return (
    <div className="cycle-input-list-container" id="cycle-input-usage-list-container">
      {/* Category Cost Breakdown Bar */}
      {usages.length > 0 && Object.keys(costByType).length > 0 && (
        <div className="cost-breakdown-bar">
          <span className="cost-breakdown-title">Cost by Category:</span>
          {Object.entries(costByType).map(([type, cost]) => (
            <span key={type} className={`breakdown-pill ${type}`}>
              {type}: KES {Number(cost).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          ))}
        </div>
      )}

      {/* Main Records Table Card */}
      <div className="consumed-inputs-table-card">
        <div className="consumed-table-header">
          <div>
            <h4>Consumed Inputs & Expenditure</h4>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted, #788680)', marginTop: '2px' }}>
              {usages.length} {usages.length === 1 ? 'item' : 'items'} applied · Real Cost: KES {Number(totalCost).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div style={{ padding: '36px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            Loading cycle input consumptions...
          </div>
        ) : usages.length === 0 ? (
          <div className="consumed-inputs-empty">
            <div className="empty-icon">
              <IconInputs size={28} color="var(--color-text-muted, #788680)" />
            </div>
            <h4>No Inputs Consumed Yet</h4>
            <p>
              No seeds, fertilizers, or treatments have been logged for this production cycle yet. Click <strong>Record Input Usage</strong> above to deduct from your inventory and start computing real production costs.
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="consumed-table">
              <thead>
                <tr>
                  <th>Input Item</th>
                  <th>Quantity Used</th>
                  <th>Unit Price</th>
                  <th>Total Real Cost</th>
                  <th>Application Date</th>
                  <th>Notes</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {usages.map((usage) => (
                  <tr key={usage.id} id={`cycle-usage-row-${usage.id}`}>
                    <td>
                      <div className="input-item-cell">
                        <span className="input-item-name">{usage.inputName}</span>
                        <span className="input-category-chip">{usage.inputType}</span>
                      </div>
                    </td>
                    <td>
                      <span className="quantity-badge">
                        {Number(usage.quantityUsed).toFixed(2)} {usage.unit}
                      </span>
                    </td>
                    <td>
                      KES {Number(usage.unitPrice || 0).toFixed(2)} / {usage.unit}
                    </td>
                    <td>
                      <span className="cost-highlight">
                        KES {Number(usage.totalCost || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {usage.usageDate}
                    </td>
                    <td style={{ color: 'var(--color-text-secondary, #4B5752)', maxWidth: '240px' }}>
                      {usage.notes || '—'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn-delete-usage"
                        title="Delete record and restore stock to inventory"
                        onClick={() => handleDeleteClick(usage)}
                        disabled={deletingId === usage.id}
                      >
                        <IconTrash size={14} />
                        <span>{deletingId === usage.id ? 'Restoring...' : 'Remove'}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
