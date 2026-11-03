import React, { useState, useEffect } from 'react';
import { AppLayout } from './shared/components/AppLayout';
import { DashboardView } from './features/dashboard/DashboardView';
import { FarmsAndPlotsView } from './features/farms/FarmsAndPlotsView';
import { CreateFarmView } from './features/farms/CreateFarmView';
import { FarmDetailsView } from './features/farms/FarmDetailsView';
import { CropProductionView } from './features/crops/CropProductionView';
import { CycleActivitiesPage } from './features/crop/pages/CycleActivitiesPage';
import { HarvestPage } from './features/crop/pages/HarvestPage';
import { CycleInputsPage } from './features/crop/pages/CycleInputsPage';
import { CycleIncidentsPage } from './features/crop/pages/CycleIncidentsPage';
import { FarmInputsView } from './features/inputs/FarmInputsView';
import { LoginView } from './features/auth/LoginView';
import { RegisterView } from './features/auth/RegisterView';
import { ForgotPasswordView } from './features/auth/ForgotPasswordView';
import { authService } from './features/auth/services/authService';
import { googleAuth } from './features/auth/services/googleAuth';
import { GoogleCallbackView } from './features/auth/GoogleCallbackView';
import { AdminOverviewView } from './features/admin/AdminOverviewView';
import { AdminFarmersView } from './features/admin/AdminFarmersView';
import { AdminActivityView } from './features/admin/AdminActivityView';
import { AdminProductionView } from './features/admin/AdminProductionView';
import { AdminSystemView } from './features/admin/AdminSystemView';
import { FarmerProfileSettingsView } from './features/farmer/FarmerProfileSettingsView';
import { EditProfileModal } from './features/farmer/components/EditProfileModal';
import './features/admin/admin.css';

const homeRouteFor = (user) => (authService.isAdmin(user) ? 'admin-overview' : 'dashboard');

const todayLabel = () =>
  new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

export function App() {
  const [currentUser, setCurrentUser] = useState(() => authService.getStoredUser());
  const [currentRoute, setCurrentRoute] = useState(() => {
    if (googleAuth.isCallback()) return 'google-callback';
    return authService.isAuthenticated() ? homeRouteFor(authService.getStoredUser()) : 'login';
  });
  const [selectedFarmId, setSelectedFarmId] = useState(null);
  const [loginError, setLoginError] = useState('');
  const [loginSuccessMessage, setLoginSuccessMessage] = useState('');
  const [loginPrefilledIdentifier, setLoginPrefilledIdentifier] = useState('');
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);

  useEffect(() => {
    if (currentRoute !== 'google-callback') return;
    authService.completeGoogleSignIn()
      .then((response) => {
        setCurrentUser(response.farmer);
        setCurrentRoute(homeRouteFor(response.farmer));
      })
      .catch((err) => {
        setLoginError(err.message || 'Google sign-in failed. Please try again.');
        setCurrentRoute('login');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (authService.isAuthenticated()) {
      authService.getCurrentUser().then((user) => {
        if (user) setCurrentUser(user);
      }).catch(() => {});
    }
  }, []);

  const handleLoginSuccess = (farmer) => {
    setLoginError('');
    setLoginSuccessMessage('');
    setCurrentUser(farmer);
    setCurrentRoute(homeRouteFor(farmer));
  };

  const handleRegisterSuccess = (farmer) => {
    setCurrentUser(farmer);
    setCurrentRoute(homeRouteFor(farmer));
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setCurrentRoute('login');
  };

  const handleResetComplete = (identifier) => {
    setLoginPrefilledIdentifier(identifier || '');
    setLoginSuccessMessage('Password has been reset successfully. Please sign in with your new password.');
    setLoginError('');
    setCurrentRoute('login');
  };

  const routeHeaders = {
    'admin-overview': { title: 'Platform overview', subtitle: `${todayLabel()} · Every farmer, one view` },
    'admin-farmers': { title: 'Farmers', subtitle: 'Accounts, farms and production by farmer' },
    'admin-activity': { title: 'Activity', subtitle: 'Field work and account events across the platform' },
    'admin-production': { title: 'Production', subtitle: 'Cycles, harvests and input spending' },
    'admin-system': { title: 'System health', subtitle: 'Server, database and API traffic' },
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
      subtitle: 'Record and track daily farming activities per cycle'
    },
    production: {
      title: 'Harvest & Production Records',
      subtitle: 'Harvest tallies, batch weighings, and yield logs'
    },
    inputs: {
      title: 'Farm Inputs',
      subtitle: 'Track seeds, fertilizers, and pesticides — stock & costs'
    },
    'cycle-inputs': {
      title: 'Cycle Inputs & Cost Tracking',
      subtitle: 'Record and deduct inputs used in crop cycles'
    },
    incidents: {
      title: 'Cycle Incidents & Protection',
      subtitle: 'Log and monitor pests, diseases, and damages'
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
  const isAdmin = authService.isAdmin(currentUser);
  const isAdminRoute = currentRoute.startsWith('admin-');

  if (currentRoute === 'google-callback') {
    return <GoogleCallbackView />;
  }

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      {/* Screen Views */}
      {currentRoute === 'login' ? (
        <LoginView
          onNavigate={(r) => setCurrentRoute(r)}
          onLoginSuccess={handleLoginSuccess}
          initialError={loginError}
          initialIdentifier={loginPrefilledIdentifier}
          initialSuccess={loginSuccessMessage}
        />
      ) : currentRoute === 'register' ? (
        <RegisterView
          onNavigate={(r) => setCurrentRoute(r)}
          onRegisterSuccess={handleRegisterSuccess}
        />
      ) : currentRoute === 'forgot-password' ? (
        <ForgotPasswordView
          onNavigate={(r) => setCurrentRoute(r)}
          onResetComplete={handleResetComplete}
        />
      ) : (
        <AppLayout
          activeRoute={currentRoute}
          onNavigate={(r) => setCurrentRoute(r)}
          title={currentHeader.title}
          subtitle={currentHeader.subtitle}
          user={currentUser}
          onLogout={handleLogout}
          onEditProfile={() => setIsEditProfileModalOpen(true)}
          onUserUpdate={(updated) => setCurrentUser(updated)}
        >
          {isAdminRoute && !isAdmin && (
            <div style={{
              backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-card-border)',
              padding: '40px', textAlign: 'center'
            }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '8px' }}>Administrators only</h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                Your account does not have access to the admin console.
              </p>
            </div>
          )}
          {isAdmin && currentRoute === 'admin-overview' && <AdminOverviewView onNavigate={(r) => setCurrentRoute(r)} />}
          {isAdmin && currentRoute === 'admin-farmers' && <AdminFarmersView />}
          {isAdmin && currentRoute === 'admin-activity' && <AdminActivityView />}
          {isAdmin && currentRoute === 'admin-production' && <AdminProductionView />}
          {isAdmin && currentRoute === 'admin-system' && <AdminSystemView />}
          {currentRoute === 'dashboard' && (
            <DashboardView
              onNavigate={(r) => setCurrentRoute(r)}
              user={currentUser}
            />
          )}
          {currentRoute === 'farms' && (
            <FarmsAndPlotsView
              farmerId={currentUser?.id || 1}
              onNavigate={(r) => setCurrentRoute(r)}
              onSelectFarm={(id) => {
                setSelectedFarmId(id);
                setCurrentRoute('farm-details');
              }}
            />
          )}
          {currentRoute === 'farms-create' && (
            <CreateFarmView
              onNavigate={(r) => setCurrentRoute(r)}
              onFarmCreated={(newFarm) => {
                setSelectedFarmId(newFarm.id);
                setCurrentRoute('farm-details');
              }}
            />
          )}
          {currentRoute === 'farm-details' && (
            <FarmDetailsView
              farmId={selectedFarmId}
              onNavigate={(r) => setCurrentRoute(r)}
            />
          )}
          {currentRoute === 'crops' && (
            <CropProductionView
              farmerId={currentUser?.id || 1}
              onNavigate={(r) => setCurrentRoute(r)}
            />
          )}
          {currentRoute === 'activities' && (
            <CycleActivitiesPage farmerId={currentUser?.id} />
          )}
          {currentRoute === 'production' && (
            <HarvestPage farmerId={currentUser?.id} />
          )}
          {currentRoute === 'inputs' && (
            <FarmInputsView farmerId={currentUser?.id || 1} onNavigate={(r) => setCurrentRoute(r)} />
          )}
          {currentRoute === 'cycle-inputs' && (
            <CycleInputsPage farmerId={currentUser?.id || 1} />
          )}
          {currentRoute === 'incidents' && (
            <CycleIncidentsPage farmerId={currentUser?.id || 1} />
          )}
          {currentRoute === 'settings' && (
            <FarmerProfileSettingsView
              user={currentUser}
              onProfileUpdated={(updated) => {
                setCurrentUser(updated);
              }}
            />
          )}
          {['livestock', 'reports'].includes(currentRoute) && (
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

          {/* Quick Edit Profile Modal */}
          <EditProfileModal
            isOpen={isEditProfileModalOpen}
            onClose={() => setIsEditProfileModalOpen(false)}
            user={currentUser}
            onProfileUpdated={(updated) => {
              setCurrentUser(updated);
            }}
          />
        </AppLayout>
      )}
    </div>
  );
}

export default App;