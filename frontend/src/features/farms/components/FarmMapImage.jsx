import { useEffect, useState } from 'react';
import { farmService } from '../services/farmService';

export function FarmMapImage({ farm, style }) {
  const [source, setSource] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    let objectUrl;
    setError('');
    setSource('');
    if (farm.mapImageUrl === `/farms/${farm.id}/map`) {
      farmService.getMapImage(farm.id).then(blob => {
        if (!active) return;
        objectUrl = URL.createObjectURL(blob);
        setSource(objectUrl);
      }).catch(failure => { if (active) setError(failure.message); });
    } else {
      setSource(farm.mapImageUrl);
    }
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [farm.id, farm.mapImageUrl]);

  if (error) return <p role="alert">{error}</p>;
  if (!source) return <p role="status">Loading farm map…</p>;
  return <img src={source} alt={`Map of ${farm.name}`} style={style}
    onError={() => setError('Could not display the saved map image.')} />;
}
