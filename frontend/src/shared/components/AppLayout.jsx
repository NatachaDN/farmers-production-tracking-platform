import React from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export function AppLayout({
  activeRoute,
  onNavigate,
  title,
  subtitle,
  children
}) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-canvas-bg)' }}>
      {/* Sidebar */}
      <Sidebar activeRoute={activeRoute} onNavigate={onNavigate} />

      {/* Main Workspace */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopBar title={title} subtitle={subtitle} />
        <main style={{ padding: '0 36px 36px 36px', flex: 1 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
