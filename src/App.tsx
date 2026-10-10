import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { DemoProvider } from './context/DemoContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { SignInScreen } from './components/screens/SignInScreen';
import { TodayScreen } from './components/screens/TodayScreen';
import { PrescriptionEntryScreen } from './components/screens/PrescriptionEntryScreen';
import { MedicinesScreen } from './components/screens/MedicinesScreen';
import { ReviewEntriesScreen } from './components/screens/ReviewEntriesScreen';
import { HistoryReportScreen } from './components/screens/HistoryReportScreen';
import { CaregiverSharingScreen } from './components/screens/CaregiverSharingScreen';
import { CaregiverDashboardScreen } from './components/screens/CaregiverDashboardScreen';
import { PharmacistDashboardScreen } from './components/screens/PharmacistDashboardScreen';
import { PharmacistPatientDetailScreen } from './components/screens/PharmacistPatientDetailScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { DemoModeScreen } from './components/screens/DemoModeScreen';
import { AlertCircle, X } from 'lucide-react';

const ScreenRouter: React.FC = () => {
  const { activeScreen } = useStore();

  switch (activeScreen) {
    case 'signin':
      return <SignInScreen />;
    case 'today':
      return <TodayScreen />;
    case 'prescription-entry':
      return <PrescriptionEntryScreen />;
    case 'medicines':
      return <MedicinesScreen />;
    case 'review-entries':
      return <ReviewEntriesScreen />;
    case 'history-report':
      return <HistoryReportScreen />;
    case 'caregiver-sharing':
      return <CaregiverSharingScreen />;
    case 'caregiver-dashboard':
      return <CaregiverDashboardScreen />;
    case 'pharmacist-dashboard':
      return <PharmacistDashboardScreen />;
    case 'pharmacist-patient-detail':
      return <PharmacistPatientDetailScreen />;
    case 'settings':
      return <SettingsScreen />;
    case 'demo-mode':
      return <DemoModeScreen />;
    default:
      return <SignInScreen />;
  }
};

const MainLayout: React.FC = () => {
  const { language, navigationAlert, clearNavigationAlert } = useStore();

  return (
    <div
      lang={language}
      className={`min-h-screen flex flex-col bg-[#F7F5EF] text-[#1F2B25] ${
        language === 'te' ? 'font-telugu' : language === 'hi' ? 'font-devanagari' : ''
      }`}
    >
      <Header />

      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto">
        <Sidebar />
        <main className="flex-1 min-w-0 p-3 sm:p-6 lg:p-8" id="main-content">
          {navigationAlert && (
            <div
              className="mb-4 p-4 bg-[#FBF2D9] border border-[#E6D4A5] text-[#805A13] rounded-xl flex items-center justify-between gap-3 shadow-xs animate-in fade-in"
              role="alert"
            >
              <div className="flex items-center gap-2.5 text-sm font-semibold">
                <AlertCircle className="w-5 h-5 text-[#875E16] shrink-0" />
                <span>{navigationAlert}</span>
              </div>
              <button
                type="button"
                onClick={clearNavigationAlert}
                className="text-[#805A13] hover:text-[#1F2B25] p-1 rounded min-w-[28px] min-h-[28px] flex items-center justify-center"
                aria-label="Dismiss alert"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          <ScreenRouter />
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <StoreProvider>
        <DemoProvider>
          <MainLayout />
        </DemoProvider>
      </StoreProvider>
    </ErrorBoundary>
  );
}
