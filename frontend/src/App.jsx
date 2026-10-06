import React, { useState, useEffect } from 'react';
import { AppLayout } from './shared/components/AppLayout';
import { DashboardView } from './features/dashboard/DashboardView';
import { FarmsAndPlotsView } from './features/farms/FarmsAndPlotsView';
import { CropProductionView } from './features/crops/CropProductionView';
import { LoginView } from './features/auth/LoginView';
import { RegisterView } from './features/auth/RegisterView';
import { authService } from './features/auth/services/authService';

export function App() {
  const [currentUser, setCurrentUser] = useState(() => authService.getStoredUser());
  const [currentRoute, setCurrentRoute] = useState(() => (authService.isAuthenticated() ? 'dashboard' : 'login'));

  useEffect(() => {
    // If authenticated on mount, refresh current profile
    if (authService.isAuthenticated()) {
      authService.getCurrentUser().then((user) => {
        if (user) setCurrentUser(user);
      }).catch(() => {});
    }
  }, []);

  const handleLoginSuccess = (farmer) => {
    setCurrentUser(farmer);
    setCurrentRoute('dashboard');
  };

  const handleRegisterSuccess = (farmer) => {
    setCurrentUser(farmer);
    setCurrentRoute('dashboard');
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setCurrentRoute('login');
  };

  // Title and subtitle per authenticated route
  const routeHeaders = {
    dashboard: {
      title: 'Dashboard',
      subtitle: 'Tuesday, 2 October · Green Acres Farm'
    },
    farms: {
      title: 'Farms & Plots',
      subtitle: 'Organize land, plots and active production cycles'
    },
    crops: {
      title: 'Crop Production Cycles',
      subtitle: 'Plan and follow every crop from planting to harvest'
    },
    livestock: {
      title: 'Livestock & Animal Production',
      subtitle: 'Track herds, flocks, feed logs and daily yields'
    },
    activities: {
      title: 'Farm Activities',
      subtitle: 'Schedule and verify daily plot tasks and field work'
    },
    production: {
      title: 'Production Records',
      subtitle: 'Harvest tallies, batch weighings, and yield logs'
    },
    reports: {
      title: 'Reports & Analytics',
      subtitle: 'Seasonal output forecasts and historical performance'
    },
    settings: {
      title: 'Farm Settings',
      subtitle: 'Configure acreage units, team members, and farm profiles'
    }
  };

  const currentHeader = routeHeaders[currentRoute] || routeHeaders.dashboard;

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      {/* Quick Screen Preview Switcher Bar (Pins at bottom for testing all mockups) */}
      <div style={{
        position: 'fixed',
        bottom: '16px',
        right: '20px',
        zIndex: 9999,
        backgroundColor: 'rgba(22, 66, 48, 0.94)',
        backdropFilter: 'blur(8px)',
        color: '#FFFFFF',
        borderRadius: '9999px',
        padding: '6px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.25)',
        fontSize: '0.75rem',
        border: '1px solid rgba(255, 255, 255, 0.15)'
      }}>
        <span style={{ color: 'rgba(255, 255, 255, 0.65)', fontWeight: 600, marginRight: '4px' }}>
          DESIGNS:
        </span>
        {[
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'farms', label: 'Farms & Plots' },
          { id: 'crops', label: 'Crop Cycles' },
          { id: 'login', label: 'Login' },
          { id: 'register', label: 'Register' }
        ].map((screen) => (
          <button
            key={screen.id}
            onClick={() => setCurrentRoute(screen.id)}
            style={{
              padding: '4px 10px',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: currentRoute === screen.id ? 700 : 500,
              backgroundColor: currentRoute === screen.id ? '#FFFFFF' : 'transparent',
              color: currentRoute === screen.id ? '#164230' : 'rgba(255, 255, 255, 0.85)',
              transition: 'all 150ms ease'
            }}
          >
            {screen.label}
          </button>
        ))}
      </div>

      {/* Screen Views */}
      {currentRoute === 'login' ? (
        <LoginView
          onNavigate={(r) => setCurrentRoute(r)}
          onLoginSuccess={handleLoginSuccess}
        />
      ) : currentRoute === 'register' ? (
        <RegisterView
          onNavigate={(r) => setCurrentRoute(r)}
          onRegisterSuccess={handleRegisterSuccess}
        />
      ) : (
        <AppLayout
          activeRoute={currentRoute}
          onNavigate={(r) => setCurrentRoute(r)}
          title={currentHeader.title}
          subtitle={currentHeader.subtitle}
          user={currentUser}
          onLogout={handleLogout}
        >
          {currentRoute === 'dashboard' && (
            <DashboardView
              onNavigate={(r) => setCurrentRoute(r)}
              user={currentUser}
            />
          )}
          {currentRoute === 'farms' && <FarmsAndPlotsView />}
          {currentRoute === 'crops' && <CropProductionView />}
          {['livestock', 'activities', 'production', 'reports', 'settings'].includes(currentRoute) && (
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--color-card-border)',
              padding: '40px',
              textAlign: 'center'
            }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
                {currentHeader.title}
              </h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                This module follows the Acrea Design System standards.
              </p>
            </div>
          )}
        </AppLayout>
      )}
    </div>
  );
}

export default App;
