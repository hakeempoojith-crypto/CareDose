import React, { useState } from 'react';
import { useStore, PROFILES } from '../../context/StoreContext';
import { User, ShieldCheck, KeyRound, AlertCircle, ArrowRight, Stethoscope, FileText, Info } from 'lucide-react';

export const SignInScreen: React.FC = () => {
  const { signIn, t } = useStore();
  const [selectedProfileId, setSelectedProfileId] = useState<string>('p_lakshmi');
  const [pin, setPin] = useState<string>('1234');
  const [registrationId, setRegistrationId] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const selectedProfile = PROFILES.find((p) => p.id === selectedProfileId);
  const isPharmacist = selectedProfile?.role === 'pharmacist';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!selectedProfileId) {
      setErrorMessage(t.selectProfileFirst);
      return;
    }

    setIsSubmitting(true);
    const success = signIn(selectedProfileId, pin, registrationId);
    if (!success) {
      setErrorMessage(isPharmacist ? t.regIdError : t.pinError);
      setIsSubmitting(false);
    }
  };

  const handleProfileSelect = (id: string, defaultPin: string, defaultRegId?: string) => {
    setSelectedProfileId(id);
    setPin(defaultPin);
    setRegistrationId(defaultRegId || '');
    setErrorMessage('');
  };

  return (
    <div className="max-w-xl mx-auto py-8 px-4 sm:px-6">
      <div className="bg-white border border-[#D5DCD5] rounded-lg shadow-xs p-6 sm:p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif font-bold text-[#214F3A] mb-2 tracking-tight">
            {t.signInTitle}
          </h1>
          <p className="text-base text-[#53645A]">
            {t.signInSubtitle}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Chooser: 3 cards (Lakshmi, Kiran, Meera) */}
          <div>
            <label className="block text-sm font-semibold text-[#1F2B25] mb-2">
              {t.selectAccount}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {PROFILES.map((profile) => {
                const isSelected = selectedProfileId === profile.id;
                const isPat = profile.role === 'patient';
                const isCare = profile.role === 'caregiver';
                const isPharm = profile.role === 'pharmacist';

                let roleLabel = t.patientAccount;
                let IconComponent = User;
                let iconBg = 'bg-[#EAF3ED] text-[#214F3A]';

                if (isCare) {
                  roleLabel = t.caregiverAccount;
                  IconComponent = ShieldCheck;
                  iconBg = 'bg-[#FBF2D9] text-[#805A13]';
                } else if (isPharm) {
                  roleLabel = t.pharmacistAccount;
                  IconComponent = Stethoscope;
                  iconBg = 'bg-[#E5EEF9] text-[#1E4E8C]';
                }

                return (
                  <button
                    type="button"
                    key={profile.id}
                    onClick={() => handleProfileSelect(profile.id, profile.pin, profile.registrationId)}
                    className={`flex flex-col sm:items-start items-center gap-2 p-3.5 rounded-lg border text-left transition-all min-h-[56px] focus-visible:outline-2 focus-visible:outline-[#94631A] ${
                      isSelected
                        ? 'border-[#214F3A] bg-[#F0F3ED] ring-2 ring-[#214F3A]/20'
                        : 'border-[#D5DCD5] hover:bg-[#FAFAF7]'
                    }`}
                  >
                    <div className="flex items-center gap-3 sm:w-full">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${iconBg}`}
                      >
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-[#1F2B25] truncate">
                          {profile.name}
                        </p>
                        <p className="text-[11px] text-[#53645A] truncate">
                          {isPat ? 'Patient' : isCare ? 'Caregiver' : 'Pharmacist'}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4-Digit PIN */}
          <div>
            <label htmlFor="pin-input" className="block text-sm font-semibold text-[#1F2B25] mb-1.5">
              {t.enterPin}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#53645A]">
                <KeyRound className="w-5 h-5" />
              </div>
              <input
                id="pin-input"
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value.replace(/\D/g, ''));
                  setErrorMessage('');
                }}
                placeholder={t.pinPlaceholder}
                className="block w-full pl-11 pr-4 py-2.5 min-h-[44px] text-lg font-mono tracking-widest bg-white border border-[#718278] rounded text-[#1F2B25] placeholder-[#718278] focus-visible:outline-2 focus-visible:outline-[#94631A]"
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          {/* Pharmacist Registration ID (shown only when Pharmacist is selected) */}
          {isPharmacist && (
            <div>
              <label htmlFor="reg-id-input" className="block text-sm font-semibold text-[#1F2B25] mb-1.5">
                {t.regIdLabel} <span className="text-[#A3342A]">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#53645A]">
                  <FileText className="w-5 h-5" />
                </div>
                <input
                  id="reg-id-input"
                  type="text"
                  value={registrationId}
                  onChange={(e) => {
                    setRegistrationId(e.target.value);
                    setErrorMessage('');
                  }}
                  placeholder={t.regIdPlaceholder}
                  className="block w-full pl-11 pr-4 py-2.5 min-h-[44px] text-sm font-mono uppercase bg-white border border-[#718278] rounded text-[#1F2B25] placeholder-[#718278] focus-visible:outline-2 focus-visible:outline-[#94631A]"
                  required
                />
              </div>
              <p className="mt-1 text-xs text-[#53645A]">
                {t.regIdHelp}
              </p>
            </div>
          )}

          {/* Demo credential hints ONLY on Sign In Screen */}
          <div className="p-3.5 bg-[#F0F3ED] border border-[#D5DCD5] rounded-lg text-xs text-[#53645A] space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-[#214F3A]">
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span>Demo Credentials</span>
            </div>
            <p className="font-mono text-[11px] text-[#1F2B25]">
              &bull; Lakshmi (Patient): PIN <strong>1234</strong><br />
              &bull; Kiran (Caregiver): PIN <strong>5678</strong><br />
              &bull; Meera (Pharmacist): PIN <strong>9012</strong> &amp; Reg ID <strong>PHARM-DEMO-0001</strong>
            </p>
          </div>

          {/* Inline Error Message */}
          {errorMessage && (
            <div
              className="p-3 bg-[#FBECEA] border border-[#F2BDB9] rounded flex items-center gap-2.5 text-[#A3342A] text-sm"
              role="alert"
            >
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || pin.length < 4 || (isPharmacist && !registrationId.trim())}
            className="w-full min-h-[48px] py-2.5 px-4 bg-[#214F3A] hover:bg-[#173E2D] disabled:opacity-50 disabled:pointer-events-none text-white font-semibold rounded transition-colors flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-[#94631A]"
          >
            <span>{isSubmitting ? t.loading : t.signInButton}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
