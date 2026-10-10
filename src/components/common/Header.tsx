import React from 'react';
import { useStore } from '../../context/StoreContext';
import { ShieldAlert, Globe, UserCheck, LogOut } from 'lucide-react';

export const Header: React.FC = () => {
  const { currentProfile, language, setLanguage, t, signOut, navigateTo } = useStore();

  return (
    <header className="border-b border-[#D5DCD5] bg-white sticky top-0 z-30">
      {/* Universal Mandatory Disclaimer Banner */}
      <div className="bg-[#FBF2D9] border-b border-[#E6D4A5] px-4 py-2 text-center text-xs md:text-sm font-medium text-[#805A13] flex items-center justify-center gap-2">
        <ShieldAlert className="w-4 h-4 shrink-0 text-[#875E16]" aria-hidden="true" />
        <span>{t.bannerDisclaimer}</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* App Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              navigateTo(
                currentProfile?.role === 'pharmacist'
                  ? 'pharmacist-dashboard'
                  : currentProfile?.role === 'caregiver'
                  ? 'caregiver-dashboard'
                  : 'today'
              )
            }
            className="flex items-baseline gap-2.5 text-left focus-visible:outline-2 focus-visible:outline-[#94631A] rounded p-1"
          >
            <span className="text-2xl font-serif font-bold text-[#214F3A] tracking-tight">
              CareDose
            </span>
            <span className="hidden sm:inline text-xs uppercase tracking-wider text-[#53645A] font-semibold border-l border-[#D5DCD5] pl-2.5">
              {t.appSubtitle}
            </span>
          </button>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Language Selector */}
          <div className="flex items-center gap-1.5 bg-[#F0F3ED] rounded border border-[#D5DCD5] p-0.5 text-sm">
            <Globe className="w-4 h-4 ml-2 text-[#53645A]" aria-hidden="true" />
            <button
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 rounded text-xs sm:text-sm font-medium transition-colors min-h-[36px] ${
                language === 'en'
                  ? 'bg-white text-[#214F3A] font-semibold shadow-xs'
                  : 'text-[#53645A] hover:text-[#1F2B25]'
              }`}
              aria-label="Switch language to English"
            >
              English
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`px-2.5 py-1 rounded text-xs sm:text-sm font-medium transition-colors min-h-[36px] ${
                language === 'hi'
                  ? 'bg-white text-[#214F3A] font-semibold shadow-xs'
                  : 'text-[#53645A] hover:text-[#1F2B25]'
              }`}
              aria-label="Switch language to Hindi"
            >
              हिन्दी
            </button>
            <button
              onClick={() => setLanguage('te')}
              className={`px-2.5 py-1 rounded text-xs sm:text-sm font-medium transition-colors min-h-[36px] ${
                language === 'te'
                  ? 'bg-white text-[#214F3A] font-semibold shadow-xs'
                  : 'text-[#53645A] hover:text-[#1F2B25]'
              }`}
              aria-label="Switch language to Telugu"
            >
              తెలుగు
            </button>
          </div>

          {/* Active Profile Badge or Sign In button */}
          {currentProfile ? (
            <div className="flex items-center gap-2">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-sm font-semibold text-[#1F2B25] flex items-center gap-1 justify-end">
                  <UserCheck className="w-3.5 h-3.5 text-[#214F3A]" />
                  {currentProfile.name}
                </span>
                <span className="text-xs text-[#53645A]">
                  {currentProfile.role === 'patient'
                    ? t.patientAccount
                    : currentProfile.role === 'caregiver'
                    ? t.caregiverAccount
                    : t.pharmacistAccount}
                </span>
              </div>
              <button
                onClick={signOut}
                title={t.logout}
                className="inline-flex items-center justify-center gap-1.5 min-h-[44px] min-w-[44px] px-3 py-2 text-sm text-[#A3342A] hover:bg-[#FBECEA] border border-transparent hover:border-[#F2BDB9] rounded transition-colors focus-visible:outline-2 focus-visible:outline-[#94631A]"
                aria-label={t.logout}
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline text-xs font-semibold">{t.logout}</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigateTo('signin')}
              className="inline-flex items-center justify-center min-h-[44px] px-3 py-2 text-sm text-[#214F3A] hover:bg-[#F0F3ED] border border-[#D5DCD5] rounded font-medium focus-visible:outline-2 focus-visible:outline-[#94631A]"
            >
              {t.navSignIn}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
