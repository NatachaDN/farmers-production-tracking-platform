import React from 'react';
import { compareHarvest } from '../productionHistory';
import './HarvestComparison.css';

const formatQuantity = new Intl.NumberFormat(undefined, { maximumSignificantDigits: 8 });
const formatPercent = new Intl.NumberFormat(undefined, { maximumSignificantDigits: 4 });

export function HarvestComparison({ cycle, harvest }) {
  const comparison = compareHarvest(cycle, harvest);
  let gap;
  if (comparison?.difference === 0) {
    gap = 'Met target (0% difference)';
  } else if (comparison?.difference !== undefined) {
    const amount = formatQuantity.format(Math.abs(comparison.difference));
    const percent = formatPercent.format(Math.abs(comparison.percent));
    const direction = comparison.difference > 0 ? 'above' : 'below';
    gap = `${amount} ${comparison.unit} ${direction} target (${percent}%)`;
  }

  return (
    <section className="production-harvest-comparison" aria-label="Harvest compared with target">
      <h4>Harvest compared with target</h4>
      {comparison ? (
        <>
          <p>Expected harvest {formatQuantity.format(comparison.expected)} {comparison.unit}</p>
          {gap ? (
            <>
              <p>Actual harvest {formatQuantity.format(comparison.actual)} {comparison.unit}</p>
              <p><strong>{gap}</strong></p>
            </>
          ) : <p>The target and harvest units can’t be compared without a conversion.</p>}
        </>
      ) : <p>No harvest target was recorded for this cycle.</p>}
    </section>
  );
}
