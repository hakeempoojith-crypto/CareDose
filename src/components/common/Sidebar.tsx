import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { ScreenId } from '../../types';
import {
  Calendar,
  FilePlus,
  Pill,
  ClipboardCheck,
  BarChart3,
  Users,
  Settings,
  Sparkles,
  LogIn,
  Menu,
  X,
  LogOut,
  ShieldCheck,
  Stethoscope,
  User,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { currentProfile, activeScreen, navigateTo, t, signOut, dueDosesCount } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  interface NavItem {
    id: ScreenId;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    allowedFor: ('patient' | 'caregiver' | 'pharmacist' | 'guest')[];
    badge?: number;
  }

  const navItems: NavItem[] = [
    {
      id: 'signin',
      label: t.navSignIn,
      icon: LogIn,
      allowedFor: ['guest', 'patient', 'caregiver', 'pharmacist'],
    },
    {
      id: 'today',
      label: t.navToday,
      icon: Calendar,
      allowedFor: ['patient'],
      badge: dueDosesCount > 0 ? dueDosesCount : undefined,
    },
    {
      id: 'prescription-entry',
      label: t.navPrescriptionEntry,
      icon: FilePlus,
      allowedFor: ['patient'],
    },
    {
      id: 'medicines',
      label: t.navMedicines,
      icon: Pill,
      allowedFor: ['patient'],
    },
    {
      id: 'review-entries',
      label: t.navReviewEntries,
      icon: ClipboardCheck,
      allowedFor: ['patient'],
    },
    {
      id: 'history-report',
      label: t.navHistoryReport,
      icon: BarChart3,
      allowedFor: ['patient'],
    },
    {
      id: 'caregiver-sharing',
      label: t.navSharingAccess,
      icon: Users,
      allowedFor: ['patient'],
    },
    {
      id: 'caregiver-dashboard',
      label: t.navCaregiverDashboard,
      icon: ShieldCheck,
      allowedFor: ['caregiver'],
    },
    {
      id: 'pharmacist-dashboard',
      label: t.navPharmacistDashboard,
      icon: Stethoscope,
      allowedFor: ['pharmacist'],
    },
    {
      id: 'pharmacist-patient-detail',
      label: t.navPatientDetail,
      icon: User,
      allowedFor: ['pharmacist'],
    },
    {
      id: 'settings',
      label: t.navSettings,
      icon: Settings,
      allowedFor: ['patient', 'caregiver', 'pharmacist'],
    },
    {
      id: 'demo-mode',
      label: t.navDemoMode,
      icon: Sparkles,
      allowedFor: ['guest', 'patient', 'caregiver'],
    },
  ];

  // Determine current role category
  const roleCategory: 'patient' | 'caregiver' | 'pharmacist' | 'guest' = currentProfile
    ? currentProfile.role
    : 'guest';

  // Filter items accessible to the current role
  const accessibleItems = navItems.filter((item) => {
    // If not signed in, show Sign in and Demo Mode
    if (!currentProfile) {
      return item.id === 'signin' || item.id === 'demo-mode';
    }
    // If signed in, hide "Sign in" from main menu since user is already authenticated
    if (item.id === 'signin') {
      return false;
    }
    return item.allowedFor.includes(roleCategory);
  });

  const handleNavClick = (screenId: ScreenId) => {
    navigateTo(screenId);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile/Tablet Disclosure Header (< 1024px) */}
      <div className="lg:hidden bg-white border-b border-[#D5DCD5] px-4 py-2.5">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="w-full flex items-center justify-between min-h-[44px] px-3.5 py-2 bg-[#F0F3ED] border border-[#718278] rounded text-[#1F2B25] font-semibold text-sm focus-visible:outline-2 focus-visible:outline-[#94631A]"
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation-list"
        >
          <span className="flex items-center gap-2">
            <Menu className="w-5 h-5 text-[#214F3A]" aria-hidden="true" />
            <span>{t.navigation}</span>
            <span className="text-xs text-[#53645A] font-normal">
              ({accessibleItems.find((i) => i.id === activeScreen)?.label || t.appName})
            </span>
          </span>
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* In-flow disclosure list */}
        {mobileMenuOpen && (
          <nav
            id="mobile-navigation-list"
            className="mt-2.5 pt-2 border-t border-[#D5DCD5] flex flex-col gap-1 pb-2"
            aria-label="Mobile Navigation"
          >
            {accessibleItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeScreen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center justify-between w-full min-h-[44px] px-3 py-2 rounded text-left text-base font-medium transition-colors focus-visible:outline-2 focus-visible:outline-[#94631A] ${
                    isActive
                      ? 'bg-[#214F3A] text-white'
                      : 'text-[#1F2B25] hover:bg-[#F0F3ED]'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[#53645A]'}`} />
                    <span>{item.label}</span>
                  </span>
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#A3342A] text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {currentProfile && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  signOut();
                }}
                className="flex items-center gap-2.5 w-full min-h-[44px] px-3 py-2 rounded text-left text-base font-medium text-[#A3342A] hover:bg-[#FBECEA] transition-colors mt-2 border-t border-[#D5DCD5] pt-3 focus-visible:outline-2 focus-visible:outline-[#94631A]"
              >
                <LogOut className="w-5 h-5" />
                <span>{t.logout}</span>
              </button>
            )}
          </nav>
        )}
      </div>

      {/* Persistent Desktop Sidebar (>= 1024px) */}
      <aside
        className="hidden lg:flex flex-col w-64 shrink-0 bg-white border-r border-[#D5DCD5] min-h-[calc(100vh-6rem)] p-4 justify-between"
        aria-label="Main Navigation"
      >
        <div className="flex flex-col gap-1">
          <div className="px-3 py-2 mb-2">
            <span className="text-xs uppercase font-bold tracking-wider text-[#53645A]">
              {currentProfile ? `${currentProfile.name}’s Notebook` : t.appName}
            </span>
          </div>

          <nav className="flex flex-col gap-1" aria-label="Desktop Screen Navigation">
            {accessibleItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeScreen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center justify-between w-full min-h-[44px] px-3.5 py-2.5 rounded text-left text-base font-medium transition-colors focus-visible:outline-2 focus-visible:outline-[#94631A] ${
                    isActive
                      ? 'bg-[#214F3A] text-white shadow-xs'
                      : 'text-[#1F2B25] hover:bg-[#F0F3ED]'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-[#53645A]'}`} />
                    <span className="truncate">{item.label}</span>
                  </span>
                  {item.badge && (
                    <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold bg-[#A3342A] text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-4 border-t border-[#D5DCD5] flex flex-col gap-2">
          {currentProfile && (
            <button
              onClick={signOut}
              className="flex items-center gap-2.5 w-full min-h-[44px] px-3.5 py-2 rounded text-left text-sm font-semibold text-[#A3342A] hover:bg-[#FBECEA] transition-colors focus-visible:outline-2 focus-visible:outline-[#94631A]"
            >
              <LogOut className="w-4 h-4" />
              <span>{t.logout}</span>
            </button>
          )}
          <div className="px-3 py-1 text-xs text-[#53645A]">
            <p className="font-semibold text-[#1F2B25]">CareDose v1.0</p>
            <p>Asia/Kolkata Timezone</p>
          </div>
        </div>
      </aside>
    </>
  );
};
