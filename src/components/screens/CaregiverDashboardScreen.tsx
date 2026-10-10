import React, { useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { formatKolkataDate, formatKolkataTime, getKolkataDateString } from '../../utils/timezone';
import { getEffectiveStatus } from '../../utils/doseStatus';
import { StatusChip } from '../common/StatusChip';
import { MedicineTitle } from '../common/MedicineTitle';
import {
  ShieldAlert,
  Bell,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Info,
  Clock,
} from 'lucide-react';

import { getDoseStats } from '../../utils/doseStats';

export const CaregiverDashboardScreen: React.FC = () => {
  const { data, acknowledgeAlert, t } = useStore();

  const todayStr = getKolkataDateString();
  const nowMs = Date.now();

  const consent = data.consents.find((c) => c.caregiverId === 'c_kiran');
  const isSharingActive = consent ? consent.enabled : false;

  // Single source of truth selector getDoseStats
  const doseStats = useMemo(() => {
    return getDoseStats(data.dose_occurrences, 'today', data.medications, nowMs);
  }, [data.dose_occurrences, data.medications, nowMs]);

  const summary = useMemo(() => {
    return {
      taken: doseStats.taken,
      pending: doseStats.pendingNotCounted,
      missed: doseStats.missed,
      unconfirmed: doseStats.unconfirmed,
    };
  }, [doseStats]);

  // Caregiver Alerts inbox
  const alerts = data.caregiver_alerts;
  const unacknowledgedAlerts = alerts.filter((a) => !a.acknowledged);

  if (!isSharingActive) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 text-center">
        <div className="bg-white border border-[#D5DCD5] rounded-xl p-8 max-w-md mx-auto space-y-4 shadow-xs">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#F0F3ED] text-[#718278] flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-[#1F2B25]">
            {t.sharingNotEnabledNotice}
          </h1>
          <p className="text-sm text-[#53645A]">
            Patient Lakshmi has not enabled caregiver sharing, or access has been paused. Please ask Lakshmi to enable sharing from her account under Caregiver Sharing.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 border-b border-[#D5DCD5] pb-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#1F2B25] tracking-tight">
            {t.dashboardTitle}
          </h1>
          <p className="text-sm text-[#53645A] mt-1">
            {t.dashboardSubtitle}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-[#214F3A] bg-[#EAF3ED] px-3.5 py-1.5 rounded-full border border-[#B8D7C2]">
          <Calendar className="w-4 h-4" />
          <span>{formatKolkataDate(todayStr)}</span>
        </div>
      </div>

      {/* Patient Today Status Summary */}
      <section className="space-y-3">
        <h2 className="text-lg font-serif font-bold text-[#1F2B25] flex items-center gap-2">
          <span>{t.patientTodaySummary}</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white border border-[#D5DCD5] rounded-lg p-4 text-center">
            <p className="text-xs uppercase font-bold text-[#53645A]">{t.summaryTakenCount}</p>
            <p className="text-2xl sm:text-3xl font-serif font-bold text-[#266044] mt-1 tabular-nums">
              {summary.taken}
            </p>
          </div>
          <div className="bg-white border border-[#D5DCD5] rounded-lg p-4 text-center">
            <p className="text-xs uppercase font-bold text-[#53645A]">{t.summaryPendingCount}</p>
            <p className="text-2xl sm:text-3xl font-serif font-bold text-[#875E16] mt-1 tabular-nums">
              {summary.pending}
            </p>
          </div>
          <div className="bg-white border border-[#D5DCD5] rounded-lg p-4 text-center">
            <p className="text-xs uppercase font-bold text-[#53645A]">{t.summaryMissedCount}</p>
            <p className="text-2xl sm:text-3xl font-serif font-bold text-[#A3342A] mt-1 tabular-nums">
              {summary.missed}
            </p>
          </div>
          <div className="bg-white border border-[#D5DCD5] rounded-lg p-4 text-center">
            <p className="text-xs uppercase font-bold text-[#53645A]">{t.summaryUnconfirmedCount}</p>
            <p className="text-2xl sm:text-3xl font-serif font-bold text-[#805A13] mt-1 tabular-nums">
              {summary.unconfirmed}
            </p>
          </div>
        </div>
      </section>

      {/* Alerts Inbox */}
      <section className="bg-white border border-[#D5DCD5] rounded-xl overflow-hidden shadow-xs space-y-0">
        <div className="px-6 py-4 bg-[#F0F3ED] border-b border-[#D5DCD5] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#875E16]" />
            <h2 className="text-lg font-serif font-bold text-[#1F2B25]">
              {t.caregiverAlertsHeading}
            </h2>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#FBF2D9] text-[#805A13] border border-[#E6D4A5]">
            {unacknowledgedAlerts.length} unacknowledged
          </span>
        </div>

        {alerts.length === 0 ? (
          <div className="p-8 text-center text-[#53645A] space-y-2">
            <CheckCircle2 className="w-10 h-10 mx-auto text-[#266044] opacity-80" />
            <p className="font-semibold text-base text-[#1F2B25]">{t.noAlertsInbox}</p>
            <p className="text-xs">No doses were marked missed or remained unconfirmed.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#D5DCD5]">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                  !alert.acknowledged ? 'bg-[#FBF2D9]/30' : 'bg-white'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-[#214F3A] tabular-nums">
                      {formatKolkataTime(alert.scheduledAt)}
                    </span>
                    <StatusChip
                      status={alert.status === 'MISSED' ? 'Missed' : 'Unconfirmed'}
                      size="sm"
                    />
                    {alert.acknowledged && (
                      <span className="text-xs bg-[#EAF3ED] text-[#266044] px-2 py-0.5 rounded border border-[#B8D7C2]">
                        {t.alertAcknowledged}
                      </span>
                    )}
                  </div>
                  <MedicineTitle
                    name={alert.medicationName}
                    transliterations={data.medications.find((m) => m.name.toLowerCase() === alert.medicationName.toLowerCase())?.nameTransliterations}
                    size="md"
                  />
                  <p className="text-xs text-[#53645A]">
                    Scheduled: {formatKolkataDate(alert.scheduledAt)}
                  </p>
                </div>

                <div>
                  {!alert.acknowledged ? (
                    <button
                      type="button"
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="min-h-[44px] px-4 py-2 bg-[#214F3A] hover:bg-[#173E2D] text-white text-xs font-semibold rounded transition-colors focus-visible:outline-2 focus-visible:outline-[#94631A]"
                    >
                      {t.alertAcknowledgeButton}
                    </button>
                  ) : (
                    <span className="text-xs text-[#53645A] italic">
                      {t.alertAcknowledged}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Important rule explanation note */}
      <div className="p-4 bg-[#F0F3ED] rounded-lg border border-[#D5DCD5] text-xs text-[#53645A] flex items-start gap-2.5">
        <Info className="w-4 h-4 shrink-0 text-[#214F3A] mt-0.5" />
        <p>{t.alertAcknowledgeNotice}</p>
      </div>
    </div>
  );
};
