import React from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export function AppLayout({
  activeRoute,
  onNavigate,
  title,
  subtitle,
  user,
  onLogout,
  onEditProfile,
  children
}) {
  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'JM';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-canvas-bg)' }}>
      {/* Sidebar */}
      <Sidebar activeRoute={activeRoute} onNavigate={onNavigate} isAdmin={user?.role === 'ROLE_ADMIN'} />

      {/* Main Workspace */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopBar
          title={title}
          subtitle={subtitle}
          userName={user?.fullName || "Joyce M."}
          userInitials={initials}
          farmName={user?.role === 'ROLE_ADMIN' ? 'Administrator' : (user?.farmName || user?.location || "Green Acres Farm")}
          avatarUrl={user?.avatarUrl}
          onLogout={onLogout}
          onEditProfile={onEditProfile}
        />
        <main style={{ padding: '0 36px 36px 36px', flex: 1 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
