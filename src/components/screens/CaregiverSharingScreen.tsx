import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Users, Stethoscope, ShieldCheck, ShieldAlert, Check, X, Info, AlertTriangle } from 'lucide-react';
import { formatKolkataDateTime } from '../../utils/timezone';

export const CaregiverSharingScreen: React.FC = () => {
  const { data, toggleCaregiverConsent, togglePharmacistConsent, t } = useStore();

  const kiranConsent = data.consents.find((c) => c.caregiverId === 'c_kiran');
  const isKiranEnabled = kiranConsent ? kiranConsent.enabled : false;

  const meeraConsent = data.consents.find((c) => c.caregiverId === 'ph_meera');
  const isMeeraEnabled = meeraConsent ? meeraConsent.enabled : false;

  const [confirmDialog, setConfirmDialog] = useState<{
    target: 'kiran' | 'meera';
    action: 'enable' | 'revoke';
  } | null>(null);

  const handleConfirmToggle = () => {
    if (!confirmDialog) return;

    if (confirmDialog.target === 'kiran') {
      toggleCaregiverConsent(confirmDialog.action === 'enable');
    } else if (confirmDialog.target === 'meera') {
      togglePharmacistConsent(confirmDialog.action === 'enable');
    }

    setConfirmDialog(null);
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 space-y-6">
      {/* Title */}
      <div className="border-b border-[#D5DCD5] pb-4">
        <h1 className="text-3xl font-serif font-bold text-[#1F2B25] tracking-tight">
          {t.sharingTitle}
        </h1>
        <p className="text-sm text-[#53645A] mt-1">
          {t.sharingSubtitle}
        </p>
      </div>

      {/* Overview Notice */}
      <div className="p-4 bg-[#F0F3ED] rounded-xl border border-[#D5DCD5] flex items-start gap-3">
        <Info className="w-5 h-5 shrink-0 text-[#214F3A] mt-0.5" />
        <div className="text-xs sm:text-sm text-[#53645A] space-y-1">
          <p className="font-semibold text-[#1F2B25]">
            Granular privacy controls
          </p>
          <p>
            You control who can view your medication notebook. Caregiver and pharmacist permissions operate independently. If access is revoked, that person immediately loses access.
          </p>
        </div>
      </div>

      {/* Grid of 2 Profile Cards */}
      <div className="space-y-6">
        {/* CARD 1: Caregiver Kiran */}
        <div className="bg-white border border-[#D5DCD5] rounded-xl p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D5DCD5] pb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#FBF2D9] border border-[#E6D4A5] flex items-center justify-center text-[#805A13] shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-serif font-bold text-[#1F2B25]">Kiran</h2>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                      isKiranEnabled
                        ? 'bg-[#EAF3ED] text-[#266044] border-[#B8D7C2]'
                        : 'bg-[#F0F3ED] text-[#718278] border-[#D5DCD5]'
                    }`}
                  >
                    {isKiranEnabled ? (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Access Active</span>
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Access Revoked</span>
                      </>
                    )}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#53645A]">
                  Caregiver Account &bull; Daily schedule and missed dose alerts
                </p>
                {kiranConsent?.updatedAt && (
                  <p className="text-[11px] text-[#718278] mt-0.5">
                    Last permission update: {formatKolkataDateTime(kiranConsent.updatedAt)}
                  </p>
                )}
              </div>
            </div>

            <div>
              {isKiranEnabled ? (
                <button
                  type="button"
                  onClick={() => setConfirmDialog({ target: 'kiran', action: 'revoke' })}
                  className="min-h-[44px] px-5 py-2.5 bg-[#FBECEA] hover:bg-[#F2BDB9]/50 text-[#A3342A] border border-[#F2BDB9] font-semibold text-sm rounded transition-colors focus-visible:outline-2 focus-visible:outline-[#94631A]"
                >
                  {t.revokeSharingButton}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDialog({ target: 'kiran', action: 'enable' })}
                  className="min-h-[44px] px-5 py-2.5 bg-[#214F3A] hover:bg-[#173E2D] text-white font-semibold text-sm rounded transition-colors focus-visible:outline-2 focus-visible:outline-[#94631A]"
                >
                  {t.enableSharingButton}
                </button>
              )}
            </div>
          </div>

          {/* Plain language explanation for Kiran */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-[#FAFAF7] p-4 rounded-lg border border-[#D5DCD5]">
            <div className="space-y-1.5">
              <p className="font-semibold text-[#266044] flex items-center gap-1.5 text-sm">
                <Check className="w-4 h-4 shrink-0 text-[#266044]" />
                What Kiran CAN see:
              </p>
              <ul className="list-disc list-inside space-y-1 text-[#53645A] pl-1">
                <li>Today’s dose schedule and count of taken, missed, or unconfirmed doses.</li>
                <li>Notification alerts if a scheduled dose is recorded as Not taken or becomes Unconfirmed.</li>
              </ul>
            </div>
            <div className="space-y-1.5">
              <p className="font-semibold text-[#A3342A] flex items-center gap-1.5 text-sm">
                <X className="w-4 h-4 shrink-0 text-[#A3342A]" />
                What Kiran CANNOT do:
              </p>
              <ul className="list-disc list-inside space-y-1 text-[#53645A] pl-1">
                <li>Cannot change or overwrite your recorded dose outcomes.</li>
                <li>Cannot edit, add, or delete your medical prescription entries.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CARD 2: Pharmacist Meera */}
        <div className="bg-white border border-[#D5DCD5] rounded-xl p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D5DCD5] pb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#E5EEF9] border border-[#BFD5ED] flex items-center justify-center text-[#1E4E8C] shrink-0">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-serif font-bold text-[#1F2B25]">{t.pharmacistSharingTitle}</h2>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                      isMeeraEnabled
                        ? 'bg-[#EAF3ED] text-[#266044] border-[#B8D7C2]'
                        : 'bg-[#F0F3ED] text-[#718278] border-[#D5DCD5]'
                    }`}
                  >
                    {isMeeraEnabled ? (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Access Active</span>
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Access Revoked (Default Off)</span>
                      </>
                    )}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#53645A]">
                  Clinical Pharmacist &bull; {t.pharmacistSharingSubtitle}
                </p>
                {meeraConsent?.updatedAt && (
                  <p className="text-[11px] text-[#718278] mt-0.5">
                    Last permission update: {formatKolkataDateTime(meeraConsent.updatedAt)}
                  </p>
                )}
              </div>
            </div>

            <div>
              {isMeeraEnabled ? (
                <button
                  type="button"
                  onClick={() => setConfirmDialog({ target: 'meera', action: 'revoke' })}
                  className="min-h-[44px] px-5 py-2.5 bg-[#FBECEA] hover:bg-[#F2BDB9]/50 text-[#A3342A] border border-[#F2BDB9] font-semibold text-sm rounded transition-colors focus-visible:outline-2 focus-visible:outline-[#94631A]"
                >
                  {t.revokePharmacistSharing}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDialog({ target: 'meera', action: 'enable' })}
                  className="min-h-[44px] px-5 py-2.5 bg-[#214F3A] hover:bg-[#173E2D] text-white font-semibold text-sm rounded transition-colors focus-visible:outline-2 focus-visible:outline-[#94631A]"
                >
                  {t.enablePharmacistSharing}
                </button>
              )}
            </div>
          </div>

          {/* Plain language explanation for Meera */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-[#FAFAF7] p-4 rounded-lg border border-[#D5DCD5]">
            <div className="space-y-1.5">
              <p className="font-semibold text-[#266044] flex items-center gap-1.5 text-sm">
                <Check className="w-4 h-4 shrink-0 text-[#266044]" />
                {t.pharmacistCanSee}
              </p>
              <ul className="list-disc list-inside space-y-1 text-[#53645A] pl-1">
                <li>Active medicines and draft prescriptions with complete dosage fields.</li>
                <li>Full 7-day and 30-day adherence report with all analytics graphs.</li>
                <li>Chronological activity audit trail and verification history.</li>
                <li>Can mark medicines as verified against prescription, raise clinical queries, or write advisory notes.</li>
              </ul>
            </div>
            <div className="space-y-1.5">
              <p className="font-semibold text-[#A3342A] flex items-center gap-1.5 text-sm">
                <X className="w-4 h-4 shrink-0 text-[#A3342A]" />
                {t.pharmacistCannotDo}
              </p>
              <ul className="list-disc list-inside space-y-1 text-[#53645A] pl-1">
                <li>Cannot change or overwrite prescription details or dosages.</li>
                <li>Cannot record, change, or falsify your daily dose outcomes.</li>
                <li>Cannot activate draft schedules without your direct consent.</li>
                <li>Loses access immediately if this toggle is turned off.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmDialog && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
        >
          <div className="bg-white border border-[#D5DCD5] rounded-xl max-w-sm w-full p-6 space-y-4 shadow-lg text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#F0F3ED] text-[#214F3A] flex items-center justify-center">
              {confirmDialog.action === 'enable' ? (
                <ShieldCheck className="w-6 h-6 text-[#214F3A]" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-[#A3342A]" />
              )}
            </div>

            <h3 className="text-lg font-serif font-bold text-[#1F2B25]">
              {confirmDialog.target === 'kiran'
                ? t.confirmSharingChange
                : t.confirmPharmacistSharingChange}
            </h3>

            <p className="text-sm text-[#53645A]">
              {confirmDialog.target === 'kiran'
                ? confirmDialog.action === 'enable'
                  ? 'Allow Kiran to view today’s status and receive missed dose alerts?'
                  : 'Revoke Kiran’s access? Kiran will immediately see "Sharing is not enabled".'
                : confirmDialog.action === 'enable'
                ? t.confirmPharmacistEnableMsg
                : t.confirmPharmacistRevokeMsg}
            </p>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="min-h-[44px] px-4 py-2 border border-[#718278] rounded text-sm font-semibold text-[#1F2B25]"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={handleConfirmToggle}
                className={`min-h-[44px] px-5 py-2 rounded text-sm font-semibold text-white ${
                  confirmDialog.action === 'enable'
                    ? 'bg-[#214F3A] hover:bg-[#173E2D]'
                    : 'bg-[#A3342A] hover:bg-[#85251C]'
                }`}
              >
                {t.confirm}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audit trail footer */}
      <div className="p-4 bg-[#F0F3ED] rounded-lg border border-[#D5DCD5] text-xs text-[#53645A] flex items-start gap-2">
        <Info className="w-4 h-4 shrink-0 text-[#214F3A] mt-0.5" />
        <p>
          Every grant or revocation of sharing permissions is logged to your activity log with an exact timestamp in Asia/Kolkata timezone.
        </p>
      </div>
    </div>
  );
};
