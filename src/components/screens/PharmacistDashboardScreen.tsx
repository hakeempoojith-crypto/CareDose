import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Stethoscope, User, ShieldAlert, ArrowRight, Pill, AlertCircle, CheckCircle2, HelpCircle } from 'lucide-react';

export const PharmacistDashboardScreen: React.FC = () => {
  const { data, navigateTo, isPharmacistConsentActive, t } = useStore();

  const activeMeds = data.medications.filter((m) => m.state === 'ACTIVE');
  const unverifiedCount = data.medications.filter(
    (m) => !m.pharmacistVerification || m.pharmacistVerification.status === 'UNVERIFIED'
  ).length;
  const openQueriesCount = data.medications.filter(
    (m) => m.pharmacistVerification?.status === 'QUERY'
  ).length;

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 space-y-6">
      {/* Title */}
      <div className="border-b border-[#D5DCD5] pb-4 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#1F2B25] tracking-tight flex items-center gap-2.5">
            <Stethoscope className="w-7 h-7 text-[#1E4E8C]" />
            <span>{t.pharmacistDashboardTitle}</span>
          </h1>
          <p className="text-sm text-[#53645A] mt-1">
            {t.pharmacistDashboardSubtitle}
          </p>
        </div>
        <div className="bg-[#E5EEF9] border border-[#BFD5ED] text-[#1E4E8C] px-3.5 py-1.5 rounded-full text-xs font-semibold self-start sm:self-auto">
          Logged in: Meera &bull; PHARM-DEMO-0001
        </div>
      </div>

      {/* Mandatory Clinical Disclaimer Banner */}
      <div className="p-4 bg-[#FBF2D9] border border-[#E6D4A5] rounded-xl text-xs text-[#805A13] flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 shrink-0 text-[#875E16] mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-semibold text-[#1F2B25]">
            Clinical Verification Guardrails
          </p>
          <p>
            {t.verifiedDisclaimer} {t.pharmacistCannotEditNotice}
          </p>
        </div>
      </div>

      {/* Patients List */}
      {!isPharmacistConsentActive ? (
        <div className="bg-white border border-[#D5DCD5] rounded-xl p-12 text-center max-w-lg mx-auto space-y-4 shadow-xs">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#F0F3ED] text-[#718278] flex items-center justify-center">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#1F2B25]">
            {t.noPatientsShared}
          </h2>
          <p className="text-sm text-[#53645A]">
            {t.noPatientsSharedDesc}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-lg font-serif font-bold text-[#1F2B25]">
            Patients Sharing Access (1)
          </h2>

          {/* Patient Card for Lakshmi */}
          <div className="bg-white border border-[#D5DCD5] rounded-xl p-6 shadow-xs hover:border-[#718278] transition-all space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D5DCD5] pb-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full bg-[#EAF3ED] border border-[#B8D7C2] flex items-center justify-center text-[#214F3A] shrink-0">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold text-[#1F2B25]">Lakshmi</h3>
                  <p className="text-xs text-[#53645A]">
                    Patient Account (p_lakshmi) &bull; Verified Consent Active
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigateTo('pharmacist-patient-detail')}
                className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 bg-[#214F3A] hover:bg-[#173E2D] text-white font-semibold rounded text-sm transition-colors focus-visible:outline-2 focus-visible:outline-[#94631A] self-start sm:self-auto"
              >
                <span>{t.viewPatientDetailsBtn}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Counts Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-[#F0F3ED] border border-[#D5DCD5] rounded-lg p-3.5 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase font-bold text-[#53645A]">
                    {t.activeMedicinesCountLabel}
                  </p>
                  <p className="text-2xl font-serif font-bold text-[#214F3A] mt-0.5 tabular-nums">
                    {activeMeds.length}
                  </p>
                </div>
                <Pill className="w-6 h-6 text-[#214F3A] opacity-60" />
              </div>

              <div className="bg-[#FBF2D9] border border-[#E6D4A5] rounded-lg p-3.5 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase font-bold text-[#805A13]">
                    {t.unverifiedMedicinesCountLabel}
                  </p>
                  <p className="text-2xl font-serif font-bold text-[#875E16] mt-0.5 tabular-nums">
                    {unverifiedCount}
                  </p>
                </div>
                <HelpCircle className="w-6 h-6 text-[#875E16] opacity-60" />
              </div>

              <div className="bg-[#FBECEA] border border-[#F2BDB9] rounded-lg p-3.5 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase font-bold text-[#A3342A]">
                    {t.openQueriesCountLabel}
                  </p>
                  <p className="text-2xl font-serif font-bold text-[#A3342A] mt-0.5 tabular-nums">
                    {openQueriesCount}
                  </p>
                </div>
                <AlertCircle className="w-6 h-6 text-[#A3342A] opacity-60" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
