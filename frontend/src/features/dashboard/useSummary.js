import { useEffect, useState } from 'react';
import { apiClient } from '../../shared/services/apiClient';

export function useSummary(farmerId, farmId) {
  const [state, setState] = useState({ data: null, loading: true, error: '' });
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    setState({ data: null, loading: true, error: '' });
    if (!farmerId) { setState({ data: null, loading: false, error: 'Sign in to view your records.' }); return; }
    apiClient.get(`/farmers/${farmerId}/summary${farmId != null ? `?farmId=${farmId}` : ''}`)
      .then(data => { if (active) setState({ data, loading: false, error: '' }); })
      .catch(error => { if (active) setState({ data: null, loading: false, error: error.message || 'Could not load the summary.' }); });
    return () => { active = false; };
  }, [farmerId, farmId, revision]);
  return { ...state, refresh: () => setRevision(value => value + 1) };
}
