import { useCallback, useEffect, useState } from 'react';
import { cropCycleService } from '../../crops/services/cropCycleService';

/**
 * Loads the authenticated farmer's real production cycles and keeps track of
 * the selected one. Shared by the activities, incidents, inputs and harvest pages.
 *
 * @param {number|undefined} farmerId
 */
export function useFarmerCycles(farmerId, initialCycleId) {
  const [cycles, setCycles] = useState([]);
  const [selectedCycleId, setCycle] = useState(() => initialCycleId || Number(new URLSearchParams(window.location.search).get('cycle')) || null);
  const setSelectedCycleId = id => {
    const url = new URL(window.location.href);
    if (id) url.searchParams.set('cycle', id);
    else url.searchParams.delete('cycle');
    window.history.replaceState(window.history.state, '', url);
    setCycle(id);
  };
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    if (!farmerId) {
      setCycles([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await cropCycleService.getCycles(farmerId);
      const list = Array.isArray(data) ? data : [];
      setCycles(list);
      setCycle(current => list.some(cycle => cycle.id === current) ? current : null);
    } catch (err) {
      setCycles([]);
      setError(err?.message || 'Could not load your production cycles.');
    } finally {
      setIsLoading(false);
    }
  }, [farmerId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const selectedCycle = cycles.find((c) => c.id === selectedCycleId) || null;

  return { cycles, selectedCycle, selectedCycleId, setSelectedCycleId, isLoading, error, reload };
}

/** Human-readable label for a cycle returned by the API. */
export function cycleLabel(cycle) {
  if (!cycle) return '';
  if (cycle.name) return cycle.name;
  return [cycle.cropName, cycle.plotName && `(${cycle.plotName})`].filter(Boolean).join(' ');
}
