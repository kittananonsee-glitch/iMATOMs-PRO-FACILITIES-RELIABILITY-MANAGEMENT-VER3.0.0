
import React, { useState, useEffect } from 'react';
import { AppView, User } from './types';
import MainDashboard from './components/MainDashboard';
import AssetManager from './components/AssetManager';
import WorkOrderManager from './components/WorkOrderManager';
import PPMManager from './components/PPMManager';
import AdminManager from './components/AdminManager';
import InventoryManager from './components/InventoryManager';
import AIAnalytics from './components/AIAnalytics';
import MobileAppHub from './components/MobileAppHub';
import DashboardMonitor from './components/DashboardMonitor';
import Login from './components/Login';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState<AppView>(AppView.MAIN);
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = (userData: User) => {
    setUser(userData);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setCurrentView(AppView.MAIN);
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  const renderView = () => {
    switch (currentView) {
      case AppView.ASSET:
        return <AssetManager onBack={() => setCurrentView(AppView.MAIN)} />;
      case AppView.WORK_ORDER:
        return <WorkOrderManager onBack={() => setCurrentView(AppView.MAIN)} />;
      case AppView.PPM:
        return <PPMManager onBack={() => setCurrentView(AppView.MAIN)} user={user!} />;
      case AppView.ADMIN:
        return <AdminManager onBack={() => setCurrentView(AppView.MAIN)} />;
      case AppView.INVENTORY:
        return <InventoryManager onBack={() => setCurrentView(AppView.MAIN)} user={user!} />;
      case AppView.AI_ANALYTICS:
        return <AIAnalytics onBack={() => setCurrentView(AppView.MAIN)} user={user!} />;
      case AppView.MOBILE_APPS:
        return <MobileAppHub onBack={() => setCurrentView(AppView.MAIN)} user={user!} />;
      case AppView.DASHBOARD_MONITOR:
        return <DashboardMonitor onBack={() => setCurrentView(AppView.MAIN)} />;
      case AppView.MAIN:
      default:
        return (
          <MainDashboard 
            user={user!} 
            onNavigate={(view) => setCurrentView(view)} 
            onLogout={handleLogout}
          />
        );
    }
  };

  return (
    <div className="h-full bg-[#0a0e17] text-white">
      {renderView()}
    </div>
  );
};

export default App;
