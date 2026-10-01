import React from 'react';

function App() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '2rem',
      backgroundColor: '#f8fafc',
      color: '#0f172a'
    }}>
      <header style={{
        maxWidth: '700px',
        width: '100%',
        backgroundColor: '#ffffff',
        padding: '2.5rem',
        borderRadius: '16px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #15803d, #22c55e)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.75rem',
            color: '#fff'
          }}>
            🌱
          </div>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, color: '#14532d' }}>
              Farmer Production Tracking Platform
            </h1>
            <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.9rem' }}>
              Crop & Animal Farming Tracking System
            </p>
          </div>
        </div>

        <div style={{
          backgroundColor: '#f1f5f9',
          padding: '1.25rem',
          borderRadius: '12px',
          marginBottom: '1.5rem'
        }}>
          <h3 style={{ margin: '0 0 0.5rem', fontSize: '1rem', color: '#334155' }}>
            Stack Architecture
          </h3>
          <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#475569', fontSize: '0.9rem', lineHeight: '1.7' }}>
            <li><strong>Backend:</strong> Spring Boot 3 with Modular Structure</li>
            <li><strong>Frontend:</strong> React + Vite</li>
            <li><strong>Database:</strong> Neon Online PostgreSQL</li>
            <li><strong>API Documentation:</strong> Swagger / OpenAPI 3 (<a href="http://localhost:8080/swagger-ui.html" target="_blank" rel="noreferrer" style={{ color: '#16a34a', fontWeight: 600 }}>/swagger-ui.html</a>)</li>
          </ul>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <a
            href="http://localhost:8080/swagger-ui.html"
            target="_blank"
            rel="noreferrer"
            style={{
              padding: '0.75rem 1.25rem',
              backgroundColor: '#15803d',
              color: '#ffffff',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '0.9rem'
            }}
          >
            Open Swagger API Docs ↗
          </a>
          <a
            href="https://console.neon.tech"
            target="_blank"
            rel="noreferrer"
            style={{
              padding: '0.75rem 1.25rem',
              backgroundColor: '#ffffff',
              color: '#0f172a',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '0.9rem'
            }}
          >
            Neon Console ↗
          </a>
        </div>
      </header>
    </div>
  );
}

export default App;
