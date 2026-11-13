import React, { useEffect, useRef, useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { IconClose } from './Icons';
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
  const workspace = useRef(null);
  const previousRoute = useRef(activeRoute);
  const navigate = route => { setNavigationOpen(false); onNavigate?.(route); };
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
  useEffect(() => {
    if (previousRoute.current === activeRoute) return;
    setNavigationOpen(false);
    if (navigationOpen) return;
    previousRoute.current = activeRoute;
    window.scrollTo({ top: 0, behavior: 'instant' });
    workspace.current?.focus({ preventScroll: true });
  }, [activeRoute, navigationOpen]);
  const initials = user?.fullName
    ? user.fullName.trim().split(/\s+/).slice(0, 2).map(name => name[0]).join('').toUpperCase()
    : '';

  return (
    <div className="acrea-shell">
      <a className="skip-link" href="#workspace-content">Skip to main content</a>
      {/* Sidebar */}
      <div className="desktop-navigation"><Sidebar activeRoute={activeRoute} onNavigate={navigate} isAdmin={user?.role === 'ROLE_ADMIN'} /></div>
      <dialog id="mobile-navigation" ref={navigation} className="mobile-navigation" aria-label="Main navigation"
        onClose={() => setNavigationOpen(false)} onClick={event => { if (event.target === event.currentTarget) setNavigationOpen(false); }}>
        <div className="navigation-close"><button type="button" aria-label="Close navigation" onClick={() => setNavigationOpen(false)} autoFocus><IconClose size={20} /></button></div>
        {navigationOpen && <Sidebar activeRoute={activeRoute} onNavigate={navigate} isAdmin={user?.role === 'ROLE_ADMIN'} />}
      </dialog>

      {/* Main Workspace */}
      <div className="acrea-workspace">
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
        <main id="workspace-content" ref={workspace} className="acrea-main" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  );
}
