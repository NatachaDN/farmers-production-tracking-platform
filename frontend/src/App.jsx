import React, { useState, useEffect } from 'react';
import { AppLayout } from './shared/components/AppLayout';
import { DashboardView } from './features/dashboard/DashboardView';
import { FarmsAndPlotsView } from './features/farms/FarmsAndPlotsView';
import { CreateFarmView } from './features/farms/CreateFarmView';
import { CreateFarmPage } from './features/farms/CreateFarmPage';
import { FarmDetailsView } from './features/farms/FarmDetailsView';
import { CreatePlotPage } from './features/farms/CreatePlotPage';
import { PlotDetailsView } from './features/farms/PlotDetailsView';
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
import { LivestockView } from './features/livestock/LivestockView';
import { ManagerDashboardView } from './features/manager/ManagerDashboardView';
import { ManagerFarmersView } from './features/manager/ManagerFarmersView';
import { ManagerReportsView } from './features/manager/ManagerReportsView';
import { ReportsView } from './features/reports/ReportsView';
import { AdminReferenceCrops } from './features/admin/AdminReferenceCrops';
import { managerService } from './features/admin/services/adminService';
import { farmService } from './features/farms/services/farmService';
import './features/admin/admin.css';
import './features/auth/auth.css';
import './shared/components/Workspace.css';
import './features/manager/manager.css';

const hasConsoleAccess = user => ['ROLE_ADMIN', 'ROLE_MANAGER'].includes(user?.role);
const homeRouteFor = (user) => {
  if (authService.isAdmin(user)) return 'admin-overview';
  if (authService.isManager(user)) return 'manager-dashboard';
  return 'dashboard';
};
const routeParams = () => new URLSearchParams(window.location.search);
const cycleRoutes = new Set(['activities', 'production', 'cycle-inputs', 'incidents']);

const todayLabel = () =>
  new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

export function App() {
  const [currentUser, setCurrentUser] = useState(() => authService.getStoredUser());
  const [currentRoute, setCurrentRoute] = useState(() => {
    if (googleAuth.isCallback()) return 'google-callback';
    return 'login';
  });
  const [selectedFarmId, setSelectedFarmId] = useState(() => Number(routeParams().get('farm')) || null);
  const [linkedCycleId, setLinkedCycleId] = useState(() => Number(routeParams().get('cycle')) || null);
  const [farms, setFarms] = useState([]);
  const [farmsError, setFarmsError] = useState('');
  const [farmsAttempt, setFarmsAttempt] = useState(0);
  const [loginError, setLoginError] = useState('');
  const [loginSuccessMessage, setLoginSuccessMessage] = useState('');
  const [loginPrefilledIdentifier, setLoginPrefilledIdentifier] = useState('');
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [selectedPlotId, setSelectedPlotId] = useState(null);
  const [createPlotFarmId, setCreatePlotFarmId] = useState(null);

  useEffect(() => {
    if (!currentUser?.id || hasConsoleAccess(currentUser)) return;
    let active = true;
    setFarmsError('');
    farmService.getFarms().then(rows => { if (active) setFarms(rows); })
      .catch(error => { if (active) setFarmsError(error.message); });
    return () => { active = false; };
  }, [currentUser?.id, currentUser?.role, farmsAttempt]);

  useEffect(() => {
    if (currentRoute === 'google-callback') return;
    const url = new URL(window.location.href);
    if (['login', 'register', 'forgot-password'].includes(currentRoute)) {
      url.searchParams.delete('page');
      url.searchParams.delete('farm');
    } else {
      url.searchParams.set('page', currentRoute);
      if (selectedFarmId && ['farm-details', 'livestock', 'crops'].includes(currentRoute)) {
        url.searchParams.set('farm', selectedFarmId);
      } else url.searchParams.delete('farm');
    }
    if (!cycleRoutes.has(currentRoute)) url.searchParams.delete('cycle');
    else if (linkedCycleId) url.searchParams.set('cycle', linkedCycleId);
    else if (routeParams().get('page') !== currentRoute) url.searchParams.delete('cycle');
    if (url.href !== window.location.href) window.history.pushState({}, '', url);
  }, [currentRoute, selectedFarmId, linkedCycleId]);

  useEffect(() => {
    const restore = () => {
      if (!authService.isAuthenticated()) return;
      setSelectedFarmId(Number(routeParams().get('farm')) || null);
      setLinkedCycleId(Number(routeParams().get('cycle')) || null);
      setCurrentRoute(routeParams().get('page') || homeRouteFor(authService.getStoredUser()));
    };
    window.addEventListener('popstate', restore);
    return () => window.removeEventListener('popstate', restore);
  }, []);

  useEffect(() => {
    const expireSession = () => {
      authService.logout();
      setCurrentUser(null);
      setCurrentRoute('login');
      setLoginError('Your session is no longer valid. Please sign in again.');
    };
    window.addEventListener('acrea-session-expired', expireSession);
    return () => window.removeEventListener('acrea-session-expired', expireSession);
  }, []);

  useEffect(() => {
    if (currentRoute !== 'google-callback') return;
    authService.completeGoogleSignIn()
      .then((response) => {
        if (!response.token) {
          setLoginSuccessMessage(response.message);
          setCurrentRoute('login');
          return;
        }
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
    const handleUnauthorized = () => {
      authService.logout();
      setCurrentUser(null);
      setCurrentRoute('login');
      setLoginError('Your session has expired. Please sign in again.');
    };
    window.addEventListener('acrea:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('acrea:unauthorized', handleUnauthorized);
  }, []);

  useEffect(() => {
    if (authService.isAuthenticated()) {
      authService.getCurrentUser().then((user) => {
        if (user) {
          setCurrentUser(user);
        } else {
          setCurrentUser(null);
          setCurrentRoute('login');
        }
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
    'manager-overview': { title: 'Manager overview', subtitle: 'Production across your assigned farmers' },
    'manager-activity': { title: 'Assigned farmer activity', subtitle: 'Field work across your assigned farms' },
    'farms-create': { title: 'Create farm', subtitle: 'Register your land and farm details' },
    'admin-overview': { title: 'Platform overview', subtitle: `${todayLabel()} · Every farmer, one view` },
    'admin-farmers': { title: 'Farmers', subtitle: 'Accounts, farms and production by farmer' },
    'admin-activity': { title: 'Activity', subtitle: 'Field work and account events across the platform' },
    'admin-production': { title: 'Production', subtitle: 'Cycles, harvests and input spending' },
    'admin-system': { title: 'System health', subtitle: 'Server, database and API traffic' },
    'admin-crops': { title: 'Reference crops', subtitle: 'Manage shared crop choices for farmers' },
    'manager-dashboard': { title: 'Supervision Dashboard', subtitle: `${todayLabel()} · Cooperative Network Production` },
    'manager-farmers': { title: 'Supervised Farmers', subtitle: 'Member directory, crop allocations and registration approvals' },
    'manager-reports': { title: 'Consolidated Production Reports', subtitle: 'Multi-farmer production aggregation and exports' },
    dashboard: {
      title: 'Dashboard',
      subtitle: `${todayLabel()}${currentUser?.farmName ? ` · ${currentUser.farmName}` : ''}`
    },
    farms: {
      title: 'Farms & Plots',
      subtitle: 'Organize land, plots and active production cycles'
    },
    'farm-details': {
      title: 'Farm Overview & Fields',
      subtitle: 'Field parcels, terrain profile, and operational notes'
    },
    'create-farm': {
      title: 'New Farm Registration',
      subtitle: 'Configure your farm structure, acreage, and location step-by-step'
    },
    'create-plot': {
      title: 'New Plot Registration',
      subtitle: 'Assign a cultivated plot to your farm and record its crop details'
    },
    'plot-details': {
      title: 'Plot Overview & Cycles',
      subtitle: 'Cultivated parcel details, farm assignment, and production cycles'
    },
    crops: {
      title: 'Crop cycles',
      subtitle: 'Plan and follow every crop from planting to harvest'
    },
    livestock: {
      title: 'Livestock',
      subtitle: 'Animal groups and production'
    },
    activities: {
      title: 'Activities',
      subtitle: 'Record and track daily farming activities per cycle'
    },
    production: {
      title: 'Harvest records',
      subtitle: 'Record harvests and compare results with your crop targets'
    },
    inputs: {
      title: 'Input inventory',
      subtitle: 'Track seeds, fertilizers, and pesticides — stock & costs'
    },
    'cycle-inputs': {
      title: 'Input usage',
      subtitle: 'Record and deduct inputs used in crop cycles'
    },
    incidents: {
      title: 'Incidents',
      subtitle: 'Log and monitor pests, diseases, and damages'
    },
    reports: {
      title: 'Reports',
      subtitle: 'Farm production summaries'
    },
    equipment: { title: 'Equipment', subtitle: 'Track equipment availability and maintenance' },
    calendar: { title: 'Activity calendar', subtitle: 'Plan field work and keep track of what is due' },
    finances: { title: 'Finances', subtitle: 'Record farm expenses, harvest sales and cycle margins' },
    settings: {
      title: 'Settings',
      subtitle: 'Manage your profile and account'
    }
  };

  const currentHeader = routeHeaders[currentRoute] || routeHeaders.dashboard;
  const isAdmin = authService.isAdmin(currentUser);
  const isManager = currentUser?.role === 'ROLE_MANAGER';
  const isAdminRoute = currentRoute.startsWith('admin-');
  const isManagerRoute = currentRoute.startsWith('manager-');
  const canOpenRoute = isAdminRoute ? isAdmin : isManagerRoute ? isManager : !isAdmin && !isManager;
  const livestockFarms = farms.filter(farm => farm.type === 'LIVESTOCK');
  const hasCropFarms = farms.some(farm => farm.type === 'CROP');

  if (currentRoute === 'google-callback') {
    return <GoogleCallbackView />;
  }

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      {/* Screen Views */}
      {currentRoute === 'login' ? (
        <LoginView
          onNavigate={(r) => {
            setSelectedFarmId(null);
            setLinkedCycleId(null);
            setCurrentRoute(r);
          }}
          onLoginSuccess={handleLoginSuccess}
          initialError={loginError}
          initialIdentifier={loginPrefilledIdentifier}
          initialSuccess={loginSuccessMessage}
        />
      ) : currentRoute === 'register' ? (
        <RegisterView
          onNavigate={(r, message) => {
            if (message) setLoginSuccessMessage(message);
            setCurrentRoute(r);
          }}
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
          onNavigate={(r) => {
            setSelectedFarmId(null);
            setLinkedCycleId(null);
            setCurrentRoute(r);
          }}
          title={currentHeader.title}
          subtitle={currentHeader.subtitle}
          user={currentUser}
          hasLivestockFarms={livestockFarms.length > 0}
          hasCropFarms={hasCropFarms}
          onLogout={handleLogout}
          onEditProfile={() => setIsEditProfileModalOpen(true)}
          onUserUpdate={(updated) => setCurrentUser(updated)}
        >
          {!canOpenRoute ? (
            <div style={{
              backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-card-border)',
              padding: '40px', textAlign: 'center'
            }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '8px' }}>Administrators only</h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                Your account does not have access to this workspace.
              </p>
              <button type="button" onClick={() => setCurrentRoute(homeRouteFor(currentUser))}>Return to your workspace</button>
            </div>
          ) : <>
          {farmsError && !hasConsoleAccess(currentUser) && <p role="alert">{farmsError} <button type="button" onClick={() => setFarmsAttempt(value => value + 1)}>Retry loading farms</button></p>}
          {currentRoute === 'manager-overview' && <AdminOverviewView onNavigate={setCurrentRoute} isAdmin={false} />}
          {currentRoute === 'manager-farmers' && <AdminFarmersView user={currentUser} />}
          {currentRoute === 'manager-activity' && <AdminActivityView isAdmin={false} />}
          {currentRoute === 'manager-reports' && <AdminProductionView service={managerService} />}
          {currentRoute === 'manager-dashboard' && (
            <ManagerDashboardView onNavigate={(r) => setCurrentRoute(r)} />
          )}
          {currentRoute === 'manager-farmers' && (
            <ManagerFarmersView />
          )}
          {currentRoute === 'manager-reports' && (
            <ManagerReportsView />
          )}
          {currentRoute === 'admin-overview' && <AdminOverviewView onNavigate={setCurrentRoute} isAdmin />}
          {currentRoute === 'admin-farmers' && <AdminFarmersView user={currentUser} />}
          {currentRoute === 'admin-activity' && <AdminActivityView isAdmin />}
          {currentRoute === 'admin-production' && <AdminProductionView />}
          {isAdmin && currentRoute === 'admin-system' && <AdminSystemView />}
          {isAdmin && currentRoute === 'admin-crops' && <AdminReferenceCrops />}
          {currentRoute === 'dashboard' && (
            <DashboardView
              hasCropFarms={hasCropFarms}
              livestockFarms={livestockFarms}
              onNavigate={(r) => setCurrentRoute(r)}
              user={currentUser}
            />
          )}
          {currentRoute === 'farms' && (
            <FarmsAndPlotsView
              farmerId={currentUser?.id}
              onNavigate={(r, extraId) => {
                if (extraId) setSelectedFarmId(extraId);
                setCurrentRoute(r);
              }}
              onSelectFarm={(farmId) => {
                setSelectedFarmId(farmId);
                setCurrentRoute('farm-details');
              }}
              onSelectPlot={(plotId) => {
                setSelectedPlotId(plotId);
                setCurrentRoute('plot-details');
              }}
              onCreatePlot={(farmId) => {
                setCreatePlotFarmId(farmId || null);
                setCurrentRoute('create-plot');
              }}
            />
          )}
          {currentRoute === 'farms-create' && (
            <CreateFarmView
              onNavigate={(r) => setCurrentRoute(r)}
              onFarmCreated={(newFarm) => {
                setFarms(current => [newFarm, ...current]);
                setSelectedFarmId(newFarm.id);
                setCurrentRoute('farm-details');
              }}
            />
          )}
          {currentRoute === 'create-farm' && (
            <CreateFarmPage
              onNavigate={(r) => setCurrentRoute(r)}
              initialFarmer={currentUser}
              onFarmCreated={(newFarm) => {
                setCurrentRoute('farms');
              }}
            />
          )}
          {currentRoute === 'farm-details' && (
            <FarmDetailsView
              user={currentUser}
              farmId={selectedFarmId}
              farmerId={currentUser?.id}
              onNavigate={(r, extraId) => {
                if (extraId) setSelectedFarmId(extraId);
                setCurrentRoute(r);
              }}
              onSelectPlot={(plotId) => {
                setSelectedPlotId(plotId);
                setCurrentRoute('plot-details');
              }}
              onCreatePlot={(farmId) => {
                setCreatePlotFarmId(farmId || selectedFarmId || null);
                setCurrentRoute('create-plot');
              }}
              onBack={() => setCurrentRoute('farms')}
            />
          )}
          {currentRoute === 'create-plot' && (
            <CreatePlotPage
              farmerId={currentUser?.id}
              initialFarmId={createPlotFarmId}
              onBack={() => setCurrentRoute(createPlotFarmId ? 'farm-details' : 'farms')}
              onNavigate={(r, extraId) => {
                if (r === 'farm-details' && extraId) setSelectedFarmId(extraId);
                if (r === 'plot-details' && extraId) setSelectedPlotId(extraId);
                setCurrentRoute(r);
              }}
              onPlotCreated={(newPlot) => {
                setSelectedPlotId(newPlot.id);
                if (newPlot.farmId) setSelectedFarmId(newPlot.farmId);
                setCurrentRoute('plot-details');
              }}
            />
          )}
          {currentRoute === 'plot-details' && (
            <PlotDetailsView
              plotId={selectedPlotId}
              farmerId={currentUser?.id}
              onSelectFarm={(farmId) => {
                setSelectedFarmId(farmId);
                setCurrentRoute('farm-details');
              }}
              onNavigate={(r) => setCurrentRoute(r)}
              onBack={(farmId) => {
                if (farmId) {
                  setSelectedFarmId(farmId);
                  setCurrentRoute('farm-details');
                } else {
                  setCurrentRoute('farms');
                }
              }}
            />
          )}
          {currentRoute === 'crops' && (
            <CropProductionView
              farmerId={currentUser?.id}
              farmId={selectedFarmId}
              onNavigate={(r, cycleId) => {
                setLinkedCycleId(cycleId || null);
                setCurrentRoute(r);
              }}
            />
          )}
          {currentRoute === 'activities' && (
            <CycleActivitiesPage key={linkedCycleId || 'activities'} farmerId={currentUser?.id} initialCycleId={linkedCycleId} />
          )}
          {currentRoute === 'production' && (
            <HarvestPage key={linkedCycleId || 'production'} farmerId={currentUser?.id} initialCycleId={linkedCycleId} />
          )}
          {currentRoute === 'inputs' && (
            <FarmInputsView farmerId={currentUser?.id} onNavigate={(r) => setCurrentRoute(r)} />
          )}
          {currentRoute === 'cycle-inputs' && (
            <CycleInputsPage key={linkedCycleId || 'cycle-inputs'} farmerId={currentUser?.id} initialCycleId={linkedCycleId} />
          )}
          {currentRoute === 'incidents' && (
            <CycleIncidentsPage key={linkedCycleId || 'incidents'} farmerId={currentUser?.id} initialCycleId={linkedCycleId} />
          )}
          {currentRoute === 'settings' && (
            <FarmerProfileSettingsView
              user={currentUser}
              onProfileUpdated={(updated) => {
                setCurrentUser(updated);
              }}
            />
          )}
          {currentRoute === 'livestock' && (livestockFarms.length
            ? <LivestockView farms={livestockFarms} initialFarmId={selectedFarmId || ''} onSelectFarm={setSelectedFarmId}
                onCreateFarm={() => setCurrentRoute('farms-create')} />
            : <button type="button" onClick={() => setCurrentRoute('farms-create')}>Create a livestock farm</button>)}
          {currentRoute === 'reports' && <ReportsView key={currentUser?.id} farmerId={currentUser?.id}
            hasCropFarms={hasCropFarms} hasLivestockFarms={livestockFarms.length > 0} />}
          {['equipment', 'calendar', 'finances'].includes(currentRoute) && <section className="workspace-panel">
            <h2>This workspace is currently unavailable</h2>
            <p>Equipment, calendar, and finance records need a farm assignment before they can be managed here.</p>
            <button className="workspace-button" type="button" onClick={() => setCurrentRoute('farms')}>Open farms</button>
          </section>}
          </>}
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
