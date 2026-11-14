import L from 'leaflet';

export const CAMEROON_HUBS = [
  { name: 'Bandjoun (Ouest)', lat: 5.3734, lng: 10.4147 },
  { name: 'Bafoussam', lat: 5.4778, lng: 10.4176 },
  { name: 'Foumbot', lat: 5.5081, lng: 10.6306 },
  { name: 'Yaoundé (Centre)', lat: 3.8480, lng: 11.5021 },
  { name: 'Douala (Littoral)', lat: 4.0511, lng: 9.7679 },
  { name: 'Bamenda (Nord-Ouest)', lat: 5.9631, lng: 10.1591 }
];

export const DEFAULT_CENTER = [5.3734, 10.4147]; // Bandjoun, Cameroon

export function createPinIcon(color = '#164230', label = '') {
  return L.divIcon({
    className: 'acrea-leaflet-pin',
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
        <div style="background-color: ${color}; color: #FFFFFF; width: 34px; height: 34px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(22,66,48,0.35); border: 2px solid #FFFFFF;">
          <div style="transform: rotate(45deg); width: 10px; height: 10px; border-radius: 50%; background-color: #FAF9F6;"></div>
        </div>
        ${label ? `<div style="background: rgba(22,66,48,0.92); color: #fff; font-size: 11px; font-weight: 700; padding: 2px 7px; border-radius: 9999px; white-space: nowrap; margin-top: 2px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">${label}</div>` : ''}
      </div>
    `,
    iconSize: [34, 42],
    iconAnchor: [0, 0]
  });
}

/**
 * Extracts or resolves geographic coordinates from a location string or locality keyword.
 */
export function resolveLocationCoords(locText) {
  if (!locText) return null;
  const str = String(locText).trim();

  // Pattern 1: Explicit lat/lng like "5.3734, 10.4147" or "(5.3734° N, 10.4147° E)"
  const coordMatch = str.match(/(-?\d+\.\d+)[^\d-]+(-?\d+\.\d+)/);
  if (coordMatch) {
    const lat = parseFloat(coordMatch[1]);
    const lng = parseFloat(coordMatch[2]);
    if (!isNaN(lat) && !isNaN(lng)) {
      return { latitude: lat, longitude: lng };
    }
  }

  // Pattern 2: Cameroonian agricultural keywords
  const lower = str.toLowerCase();
  if (lower.includes('bandjoun')) return { latitude: 5.3734, longitude: 10.4147, locality: 'Bandjoun' };
  if (lower.includes('bafoussam')) return { latitude: 5.4778, longitude: 10.4176, locality: 'Bafoussam' };
  if (lower.includes('foumbot')) return { latitude: 5.5081, longitude: 10.6306, locality: 'Foumbot' };
  if (lower.includes('dschang')) return { latitude: 5.4436, longitude: 10.0531, locality: 'Dschang' };
  if (lower.includes('douala') || lower.includes('bassa')) return { latitude: 4.0511, longitude: 9.7679, locality: 'Douala / Bassa' };
  if (lower.includes('yaoundé') || lower.includes('yaounde') || lower.includes('beti')) return { latitude: 3.8480, longitude: 11.5021, locality: 'Yaoundé / Beti' };
  if (lower.includes('bamenda')) return { latitude: 5.9631, longitude: 10.1591, locality: 'Bamenda' };
  if (lower.includes('buea')) return { latitude: 4.1560, longitude: 9.2435, locality: 'Buea' };
  if (lower.includes('ngaoundéré') || lower.includes('ngaoundere')) return { latitude: 7.3276, longitude: 13.5843, locality: 'Ngaoundéré' };

  return null;
}
