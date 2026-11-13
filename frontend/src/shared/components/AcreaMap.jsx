import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { IconMapPin, IconCheck, IconAlertCircle } from './Icons';
import { CAMEROON_HUBS, DEFAULT_CENTER, createPinIcon, resolveLocationCoords } from './acreaMapUtils';

/**
 * AcreaMap — Tactile Leaflet map designed for farmers.
 * Supports:
 * - Direct tap/click to pinpoint coordinates
 * - "Locate Me (GPS)" one-touch geolocation
 * - Satellite vs Standard terrain toggle
 * - Cameroon agricultural region presets
 */
export function AcreaMap({
  latitude,
  longitude,
  locationText = '',
  onLocationSelect,
  interactive = true,
  height = '240px',
  label = 'Interactive Map Location',
  hint = 'Tap anywhere on the map or use the GPS button to set your coordinates.',
  markers = [],
  showSatelliteToggle = true,
  showPresets = true,
  enableGps = true,
  pinColor = '#164230',
  pinLabel = ''
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const tileLayerRef = useRef(null);

  const [mapMode, setMapMode] = useState('street'); // 'street' | 'satellite'
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsMsg, setGpsMsg] = useState(null);

  const resolved = (!latitude && !longitude && locationText) ? resolveLocationCoords(locationText) : null;
  const currentLat = latitude ? parseFloat(latitude) : (resolved?.latitude ?? null);
  const currentLng = longitude ? parseFloat(longitude) : (resolved?.longitude ?? null);
  const hasCoords = currentLat != null && currentLng != null && !isNaN(currentLat) && !isNaN(currentLng);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initialCenter = hasCoords ? [currentLat, currentLng] : DEFAULT_CENTER;
    const initialZoom = hasCoords ? 14 : 11;

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      zoomControl: true,
      attributionControl: false
    });
    mapInstanceRef.current = map;

    const streetTiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 });
    streetTiles.addTo(map);
    tileLayerRef.current = streetTiles;

    if (interactive) {
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          markerRef.current = L.marker([lat, lng], { icon: createPinIcon(pinColor, pinLabel) }).addTo(map);
        }
        if (onLocationSelect) {
          onLocationSelect({
            latitude: parseFloat(lat.toFixed(6)),
            longitude: parseFloat(lng.toFixed(6))
          });
        }
      });
    }

    if (hasCoords) {
      markerRef.current = L.marker([currentLat, currentLng], {
        icon: createPinIcon(pinColor, pinLabel)
      }).addTo(map);
    }

    markers.forEach((m) => {
      if (m.lat && m.lng) {
        L.marker([m.lat, m.lng], { icon: createPinIcon(m.color || '#3E7B52', m.title || '') })
          .addTo(map)
          .bindPopup(`<strong>${m.title || 'Location'}</strong><br/>${m.description || ''}`);
      }
    });

    setTimeout(() => map.invalidateSize(), 200);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update marker position when props change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (hasCoords) {
      if (markerRef.current) {
        markerRef.current.setLatLng([currentLat, currentLng]);
      } else {
        markerRef.current = L.marker([currentLat, currentLng], {
          icon: createPinIcon(pinColor, pinLabel)
        }).addTo(map);
      }
      map.setView([currentLat, currentLng], 14, { animate: true });
    }
  }, [currentLat, currentLng, pinColor, pinLabel, hasCoords]);

  // Handle tile switch (Street vs Satellite)
  const handleToggleMode = (mode) => {
    const map = mapInstanceRef.current;
    if (!map || !tileLayerRef.current) return;
    setMapMode(mode);
    map.removeLayer(tileLayerRef.current);
    const tileUrl = mode === 'satellite'
      ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    const newLayer = L.tileLayer(tileUrl, { maxZoom: 19 });
    newLayer.addTo(map);
    tileLayerRef.current = newLayer;
  };

  // GPS Geolocation
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setGpsMsg({ type: 'error', text: 'GPS not supported on this browser.' });
      return;
    }
    setGpsLoading(true);
    setGpsMsg(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(6));
        const lng = parseFloat(pos.coords.longitude.toFixed(6));
        setGpsLoading(false);
        setGpsMsg({ type: 'success', text: `GPS Pinned (±${Math.round(pos.coords.accuracy || 10)}m)` });
        const map = mapInstanceRef.current;
        if (map) {
          map.setView([lat, lng], 15, { animate: true });
          if (markerRef.current) markerRef.current.setLatLng([lat, lng]);
          else markerRef.current = L.marker([lat, lng], { icon: createPinIcon('#2E7D32', 'My GPS') }).addTo(map);
        }
        if (onLocationSelect) onLocationSelect({ latitude: lat, longitude: lng });
      },
      (err) => {
        setGpsLoading(false);
        setGpsMsg({ type: 'error', text: err.message || 'Unable to retrieve GPS.' });
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  const handleSelectPreset = (hub) => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.setView([hub.lat, hub.lng], 13, { animate: true });
    if (interactive) {
      if (markerRef.current) markerRef.current.setLatLng([hub.lat, hub.lng]);
      else markerRef.current = L.marker([hub.lat, hub.lng], { icon: createPinIcon(pinColor, hub.name) }).addTo(map);
      if (onLocationSelect) onLocationSelect({ latitude: hub.lat, longitude: hub.lng, localityHint: hub.name });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary, #19201C)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <IconMapPin size={15} color="#164230" />
            <span>{label}</span>
          </label>
          {hint && <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--color-text-muted, #788680)' }}>{hint}</p>}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {showSatelliteToggle && (
            <div style={{ display: 'inline-flex', padding: '2px', backgroundColor: '#F4EFE6', borderRadius: '8px', border: '1px solid #ECE7DC' }}>
              <button
                type="button"
                onClick={() => handleToggleMode('street')}
                style={{
                  border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '0.725rem', fontWeight: 600, cursor: 'pointer',
                  backgroundColor: mapMode === 'street' ? '#FFFFFF' : 'transparent',
                  color: mapMode === 'street' ? '#164230' : '#788680',
                  boxShadow: mapMode === 'street' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                Terrain
              </button>
              <button
                type="button"
                onClick={() => handleToggleMode('satellite')}
                style={{
                  border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '0.725rem', fontWeight: 600, cursor: 'pointer',
                  backgroundColor: mapMode === 'satellite' ? '#164230' : 'transparent',
                  color: mapMode === 'satellite' ? '#FFFFFF' : '#788680',
                  boxShadow: mapMode === 'satellite' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                Satellite
              </button>
            </div>
          )}

          {interactive && enableGps && (
            <button
              type="button"
              onClick={handleLocateMe}
              disabled={gpsLoading}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 12px',
                borderRadius: '9999px', backgroundColor: '#EAF4ED', color: '#164230',
                border: '1px solid #C8E2D0', fontSize: '0.75rem', fontWeight: 600, cursor: gpsLoading ? 'wait' : 'pointer'
              }}
            >
              <IconMapPin size={12} color="#164230" />
              <span>{gpsLoading ? 'Locating...' : '📍 Use My GPS'}</span>
            </button>
          )}
        </div>
      </div>

      {gpsMsg && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem',
          color: gpsMsg.type === 'success' ? '#2E7D32' : '#DC2626',
          backgroundColor: gpsMsg.type === 'success' ? '#E8F5E9' : '#FEF2F2',
          padding: '4px 10px', borderRadius: '6px'
        }}>
          {gpsMsg.type === 'success' ? <IconCheck size={12} /> : <IconAlertCircle size={12} />}
          <span>{gpsMsg.text}</span>
        </div>
      )}

      <div
        ref={mapContainerRef}
        style={{
          width: '100%', height, borderRadius: 'var(--radius-lg, 12px)',
          border: '1.5px solid var(--color-card-border, #ECE7DC)', overflow: 'hidden',
          backgroundColor: '#FAF9F6', position: 'relative', boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}
      />

      {showPresets && interactive && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '2px' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-text-muted, #788680)' }}>Quick jump:</span>
          {CAMEROON_HUBS.map((hub) => (
            <button
              key={hub.name}
              type="button"
              onClick={() => handleSelectPreset(hub)}
              style={{
                fontSize: '0.72rem', padding: '2px 8px', borderRadius: '6px',
                border: '1px solid #DFD8CA', backgroundColor: '#FAF9F6', color: '#4B5752', cursor: 'pointer'
              }}
            >
              {hub.name}
            </button>
          ))}
        </div>
      )}

      {hasCoords && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontSize: '0.75rem', color: '#5C6F64', backgroundColor: '#F9F6F0',
          padding: '6px 12px', borderRadius: '8px', border: '1px solid #ECE7DC'
        }}>
          <span>Pinned Coordinates: <strong>{currentLat.toFixed(4)}° N, {currentLng.toFixed(4)}° E</strong></span>
          <span style={{ color: '#2E7D32', fontWeight: 600 }}>Active Marker</span>
        </div>
      )}
    </div>
  );
}
