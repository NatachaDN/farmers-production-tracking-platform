import React, { useEffect, useRef, useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import './AppLayout.css';

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
  const [navigationOpen, setNavigationOpen] = useState(false);
  const navigation = useRef(null);
  const navigate = route => { setNavigationOpen(false); onNavigate?.(route); };
  useEffect(() => { setNavigationOpen(false); }, [activeRoute]);
  useEffect(() => {
    const dialog = navigation.current;
    if (navigationOpen && !dialog.open) dialog.showModal();
    if (!navigationOpen && dialog.open) dialog.close();
    if (!navigationOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const desktop = window.matchMedia('(min-width: 901px)');
    const resize = () => { if (desktop.matches) setNavigationOpen(false); };
    desktop.addEventListener('change', resize);
    return () => { document.body.style.overflow = previousOverflow; desktop.removeEventListener('change', resize); };
  }, [navigationOpen]);
  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : '';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-canvas-bg)' }}>
      {/* Sidebar */}
      <div className="desktop-navigation"><Sidebar activeRoute={activeRoute} onNavigate={navigate} isAdmin={user?.role === 'ROLE_ADMIN'} /></div>
      <dialog id="mobile-navigation" ref={navigation} className="mobile-navigation" aria-label="Main navigation"
        onClose={() => setNavigationOpen(false)} onClick={event => { if (event.target === event.currentTarget) setNavigationOpen(false); }}>
        <div className="navigation-close"><button type="button" onClick={() => setNavigationOpen(false)} autoFocus>Close navigation ✕</button></div>
        {navigationOpen && <Sidebar activeRoute={activeRoute} onNavigate={navigate} isAdmin={user?.role === 'ROLE_ADMIN'} />}
      </dialog>

      {/* Main Workspace */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopBar
          onOpenNavigation={() => setNavigationOpen(true)}
          navigationOpen={navigationOpen}
          title={title}
          subtitle={subtitle}
          userName={user?.fullName || ""}
          userInitials={initials}
          farmName={user?.role === 'ROLE_ADMIN' ? 'Administrator' : (user?.farmName || user?.location || "")}
          avatarUrl={user?.avatarUrl}
          onLogout={onLogout}
          onEditProfile={onEditProfile}
          onUserUpdate={onUserUpdate}
        />
        <main className="acrea-main" style={{ flex: 1 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
