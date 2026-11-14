import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileBottomNav } from './MobileBottomNav';

export function AppLayout({
  activeRoute,
  onNavigate,
  title,
  subtitle,
  user,
  onLogout,
  onEditProfile,
  onUserUpdate,
  children
}) {
  const displayName = user?.fullName || (user?.emailOrPhone ? user.emailOrPhone.split('@')[0] : 'Farmer');
  const initials = user?.fullName
    ? user.fullName.split(' ').filter(Boolean).map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : displayName.substring(0, 2).toUpperCase();

  const farmDisplayName = user?.role === 'ROLE_ADMIN'
    ? 'Administrator'
    : user?.role === 'ROLE_MANAGER'
    ? 'Cooperative Manager'
    : (user?.farmName || user?.location || 'My Farm');

  const isUserAdmin = user?.role === 'ROLE_ADMIN';
  const isUserManager = user?.role === 'ROLE_MANAGER' || isUserAdmin;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-canvas-bg)' }}>
      {/* Mobile Drawer Backdrop */}
      <div
        className={`acrea-sidebar-backdrop${mobileMenuOpen ? ' open' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Sidebar */}
      <Sidebar
        activeRoute={activeRoute}
        onNavigate={onNavigate}
        isAdmin={isUserAdmin}
        isManager={isUserManager}
        user={user}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Workspace */}
      <div className="acrea-workspace" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopBar
          title={title}
          subtitle={subtitle}
          userName={displayName}
          userInitials={initials}
          farmName={farmDisplayName}
          avatarUrl={user?.avatarUrl}
          onLogout={onLogout}
          onEditProfile={onEditProfile}
          onUserUpdate={onUserUpdate}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />
        <main className="acrea-main">
          {children}
        </main>
        <MobileBottomNav
          activeRoute={activeRoute}
          onNavigate={onNavigate}
          onOpenMore={() => setMobileMenuOpen(true)}
          isAdmin={isUserAdmin}
          isManager={isUserManager}
        />
      </div>
    </div>
  );
}
