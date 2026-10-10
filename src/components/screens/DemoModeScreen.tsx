import React, { useState, useMemo } from 'react';
import { useDemo } from '../../context/DemoContext';
import { useStore } from '../../context/StoreContext';
import {
  formatKolkataDateTime,
  formatKolkataTime,
  formatKolkataDate,
  getKolkataDateString,
  addDaysToDateString,
} from '../../utils/timezone';
import { getEffectiveStatus, isDoseActionAllowed } from '../../utils/doseStatus';
import { getDoseStats } from '../../utils/doseStats';
import { StatusChip } from '../common/StatusChip';
import { MedicineTitle } from '../common/MedicineTitle';
import {
  Sparkles,
  Clock,
  RotateCcw,
  FastForward,
  Calendar,
  Check,
  X,
  ShieldCheck,
  Info,
} from 'lucide-react';

export const DemoModeScreen: React.FC = () => {
  const { t } = useStore();
  const {
    simulatedTimeMs,
    medications,
    occurrences,
    alerts,
    advanceTime,
    advanceDay,
    resetClock,
    resetDemoData,
    recordDemoDose,
  } = useDemo();

  const [demoTab, setDemoTab] = useState<'report' | 'today' | 'caregiver'>('report');

  const simulatedDateObj = new Date(simulatedTimeMs);
  const simTodayStr = getKolkataDateString(simulatedDateObj);

  // Map of medications
  const medMap = useMemo(() => {
    const map = new Map();
    medications.forEach((m) => map.set(m.id, m));
    return map;
  }, [medications]);

  // The 42 completed occurrences across the 7 completed days preceding today
  const sevenDayCompletedOccurrences = useMemo(() => {
    return occurrences.filter((o) => {
      const dStr = o.scheduledAt.split('T')[0];
      // Occurrences with isSimulated and before today
      return o.isSimulated && dStr < simTodayStr;
    });
  }, [occurrences, simTodayStr]);

  // Use the single source of truth selector getDoseStats for 7-day demo report
  const demoDoseStats = useMemo(() => {
    return getDoseStats(occurrences, '7days', medications, simulatedTimeMs);
  }, [occurrences, medications, simulatedTimeMs]);

  const stats = useMemo(() => {
    return {
      taken: demoDoseStats.taken,
      missed: demoDoseStats.missed,
      unconfirmed: demoDoseStats.unconfirmed,
      total: demoDoseStats.totalCounted,
      rate: demoDoseStats.rate,
    };
  }, [demoDoseStats]);

  // Today's occurrences in demo mode
  const todayOccurrences = useMemo(() => {
    return occurrences
      .filter((o) => o.scheduledAt.startsWith(simTodayStr))
      .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
  }, [occurrences, simTodayStr]);

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 space-y-6">
      {/* Isolated Demo Banner */}
      <div className="bg-[#875E16] text-white px-4 py-3 rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-5 h-5 shrink-0" />
          <div>
            <h1 className="font-serif font-bold text-lg">{t.demoTitle}</h1>
            <p className="text-xs text-white/90">{t.demoIsolationNote}</p>
          </div>
        </div>
        <span className="text-xs uppercase font-bold tracking-wider bg-white/20 px-2.5 py-1 rounded self-start sm:self-auto">
          {t.fictionalDemoBadge}
        </span>
      </div>

      {/* Simulated Clock Controls */}
      <div className="bg-white border border-[#D5DCD5] rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D5DCD5] pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#875E16]" />
            <h2 className="text-base font-serif font-bold text-[#1F2B25]">
              {t.demoClockControls}
            </h2>
          </div>
          <div className="text-sm font-mono font-bold text-[#214F3A] bg-[#F0F3ED] px-3.5 py-1.5 rounded-lg border border-[#D5DCD5] tabular-nums">
            {formatKolkataDateTime(simulatedDateObj.toISOString())}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => advanceTime(15)}
            className="min-h-[44px] px-3.5 py-2 bg-[#F0F3ED] hover:bg-[#E5EAE2] border border-[#718278] text-[#1F2B25] text-xs font-semibold rounded flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-[#94631A]"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>{t.advance15Min}</span>
          </button>

          <button
            type="button"
            onClick={() => advanceTime(60)}
            className="min-h-[44px] px-3.5 py-2 bg-[#F0F3ED] hover:bg-[#E5EAE2] border border-[#718278] text-[#1F2B25] text-xs font-semibold rounded flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-[#94631A]"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>{t.advance1Hour}</span>
          </button>

          <button
            type="button"
            onClick={advanceDay}
            className="min-h-[44px] px-3.5 py-2 bg-[#F0F3ED] hover:bg-[#E5EAE2] border border-[#718278] text-[#1F2B25] text-xs font-semibold rounded flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-[#94631A]"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{t.advanceNextDay}</span>
          </button>

          <button
            type="button"
            onClick={resetClock}
            className="min-h-[44px] px-3.5 py-2 bg-white hover:bg-[#F0F3ED] border border-[#D5DCD5] text-[#53645A] text-xs font-semibold rounded flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-[#94631A]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.resetClock}</span>
          </button>

          <button
            type="button"
            onClick={resetDemoData}
            className="min-h-[44px] px-3.5 py-2 bg-white hover:bg-[#FBECEA] border border-[#F2BDB9] text-[#A3342A] text-xs font-semibold rounded flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-[#94631A]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.resetDemoData}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#D5DCD5]">
        <button
          type="button"
          onClick={() => setDemoTab('report')}
          className={`min-h-[44px] px-5 py-2.5 font-semibold text-sm border-b-2 transition-colors ${
            demoTab === 'report'
              ? 'border-[#875E16] text-[#875E16] bg-white'
              : 'border-transparent text-[#53645A] hover:text-[#1F2B25]'
          }`}
        >
          {t.demoHistoryTab} (42 Seed Records)
        </button>

        <button
          type="button"
          onClick={() => setDemoTab('today')}
          className={`min-h-[44px] px-5 py-2.5 font-semibold text-sm border-b-2 transition-colors ${
            demoTab === 'today'
              ? 'border-[#875E16] text-[#875E16] bg-white'
              : 'border-transparent text-[#53645A] hover:text-[#1F2B25]'
          }`}
        >
          Demo Live Today
        </button>

        <button
          type="button"
          onClick={() => setDemoTab('caregiver')}
          className={`min-h-[44px] px-5 py-2.5 font-semibold text-sm border-b-2 transition-colors ${
            demoTab === 'caregiver'
              ? 'border-[#875E16] text-[#875E16] bg-white'
              : 'border-transparent text-[#53645A] hover:text-[#1F2B25]'
          }`}
        >
          {t.demoCaregiverTab}
        </button>
      </div>

      {/* VIEW 1: DEMO 7-DAY REPORT (STRICT 42 SEED OCCURRENCES, 85.7%) */}
      {demoTab === 'report' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#D5DCD5] rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D5DCD5] pb-4">
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-[#875E16]">
                  {t.fictionalDemoBadge}
                </span>
                <h3 className="text-2xl font-serif font-bold text-[#1F2B25] mt-0.5">
                  Confirmed Taken Rate: {stats.rate}%
                </h3>
                <p className="text-xs text-[#53645A] mt-1 max-w-lg">
                  {t.demoSeedSummary}
                </p>
              </div>

              <div className="text-right">
                <span className="text-4xl font-serif font-bold text-[#214F3A] tabular-nums">
                  {stats.rate}%
                </span>
                <p className="text-xs text-[#53645A]">
                  {stats.taken} / {stats.total} confirmed
                </p>
              </div>
            </div>

            {/* Visual Bar */}
            <div className="h-4 w-full bg-[#F0F3ED] rounded-full overflow-hidden flex border border-[#D5DCD5]">
              <div
                style={{ width: `${(stats.taken / stats.total) * 100}%` }}
                className="bg-[#266044]"
                title={`Taken: ${stats.taken}`}
              />
              <div
                style={{ width: `${(stats.missed / stats.total) * 100}%` }}
                className="bg-[#A3342A]"
                title={`Missed: ${stats.missed}`}
              />
              <div
                style={{ width: `${(stats.unconfirmed / stats.total) * 100}%` }}
                className="bg-[#805A13]"
                title={`Unconfirmed: ${stats.unconfirmed}`}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#266044]" />
                <span className="font-semibold text-[#1F2B25]">Taken: {stats.taken}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#A3342A]" />
                <span className="font-semibold text-[#1F2B25]">Not taken: {stats.missed}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#805A13]" />
                <span className="font-semibold text-[#1F2B25]">Unconfirmed: {stats.unconfirmed}</span>
              </span>
              <span className="text-[#53645A]">Total: {stats.total} occurrences</span>
            </div>
          </div>

          {/* 42 Occurrences Table */}
          <div className="bg-white border border-[#D5DCD5] rounded-xl overflow-hidden shadow-xs">
            <div className="px-6 py-4 bg-[#F0F3ED] border-b border-[#D5DCD5] flex items-center justify-between">
              <h4 className="text-base font-serif font-bold text-[#1F2B25]">
                Seed Fixture Occurrences (42 Total)
              </h4>
              <span className="text-xs font-semibold text-[#875E16] bg-[#FBF2D9] px-2.5 py-0.5 rounded border border-[#E6D4A5]">
                All records labelled Simulated
              </span>
            </div>

            <div className="max-h-96 overflow-y-auto divide-y divide-[#D5DCD5]">
              {sevenDayCompletedOccurrences.map((occ) => {
                const med = medMap.get(occ.medicationId);
                return (
                  <div key={occ.id} className="p-3.5 flex items-center justify-between text-sm hover:bg-[#FAFAF7]">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-semibold text-[#53645A] tabular-nums">
                        {formatKolkataDate(occ.scheduledAt)} {formatKolkataTime(occ.scheduledAt)}
                      </span>
                      <MedicineTitle
                        name={med?.name || ''}
                        transliterations={med?.nameTransliterations}
                        size="sm"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] uppercase tracking-wider font-bold bg-[#F0F3ED] text-[#53645A] px-2 py-0.5 rounded border border-[#D5DCD5]">
                        {t.simulatedRecord}
                      </span>
                      <StatusChip
                        status={
                          occ.status === 'TAKEN'
                            ? 'Taken'
                            : occ.status === 'MISSED'
                            ? 'Missed'
                            : 'Unconfirmed'
                        }
                        size="sm"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: DEMO LIVE TODAY */}
      {demoTab === 'today' && (
        <div className="bg-white border border-[#D5DCD5] rounded-xl overflow-hidden shadow-xs divide-y divide-[#D5DCD5]">
          <div className="p-4 bg-[#F0F3ED] border-b border-[#D5DCD5] flex items-center justify-between">
            <h3 className="font-serif font-bold text-[#1F2B25]">
              Simulated Doses for {formatKolkataDate(simTodayStr)}
            </h3>
            <span className="text-xs text-[#53645A]">Advance time above to trigger Due state</span>
          </div>

          {todayOccurrences.map((dose) => {
            const med = medMap.get(dose.medicationId);
            const effStatus = getEffectiveStatus(dose, simulatedTimeMs);
            const action = isDoseActionAllowed(dose, simulatedTimeMs);

            return (
              <div key={dose.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#214F3A] tabular-nums">
                      {formatKolkataTime(dose.scheduledAt)}
                    </span>
                    <StatusChip status={effStatus} size="sm" />
                    <span className="text-[10px] uppercase font-bold text-[#875E16] bg-[#FBF2D9] px-1.5 py-0.5 rounded">
                      Simulated
                    </span>
                  </div>
                  <MedicineTitle
                    name={med?.name || ''}
                    transliterations={med?.nameTransliterations}
                    size="md"
                    className="mt-1"
                  />
                  <p className="text-xs text-[#53645A]">
                    <span className={med?.strength ? '' : 'italic text-[#718278]'}>
                      {med?.strength || 'Strength not specified'}
                    </span>
                    {' '}&bull;{' '}
                    <span className={med?.amountPerDose ? '' : 'italic text-[#718278]'}>
                      {med?.amountPerDose || 'Amount not specified'}
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {action.allowed ? (
                    <>
                      <button
                        type="button"
                        onClick={() => recordDemoDose(dose.id, 'TAKEN')}
                        className="px-3.5 py-1.5 min-h-[44px] bg-[#214F3A] hover:bg-[#173E2D] text-white text-xs font-semibold rounded flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Taken</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => recordDemoDose(dose.id, 'MISSED')}
                        className="px-3.5 py-1.5 min-h-[44px] bg-white hover:bg-[#FBECEA] text-[#A3342A] border border-[#718278] text-xs font-semibold rounded flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Not taken</span>
                      </button>
                    </>
                  ) : (
                    <span className="text-xs text-[#53645A] bg-[#F0F3ED] px-2.5 py-1.5 rounded">
                      Unlocks at {formatKolkataTime(dose.scheduledAt)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 3: DEMO CAREGIVER PREVIEW */}
      {demoTab === 'caregiver' && (
        <div className="bg-white border border-[#D5DCD5] rounded-xl overflow-hidden shadow-xs divide-y divide-[#D5DCD5]">
          <div className="p-4 bg-[#F0F3ED] flex items-center justify-between">
            <h3 className="font-serif font-bold text-[#1F2B25] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#214F3A]" />
              <span>Demo Caregiver Inbox Preview ({alerts.length} Alerts)</span>
            </h3>
            <span className="text-xs text-[#53645A]">Read-only preview</span>
          </div>

          {alerts.map((al) => (
            <div key={al.id} className="p-4 flex items-center justify-between text-sm">
              <div>
                <p className="font-bold text-[#1F2B25]">{al.medicationName}</p>
                <p className="text-xs text-[#53645A]">
                  Scheduled: {formatKolkataDate(al.scheduledAt)} {formatKolkataTime(al.scheduledAt)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatusChip status={al.status === 'MISSED' ? 'Missed' : 'Unconfirmed'} size="sm" />
                <span className="text-xs bg-[#F0F3ED] text-[#53645A] px-2 py-0.5 rounded">
                  Simulated
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product boundary footer */}
      <div className="p-4 bg-[#F0F3ED] rounded-lg border border-[#D5DCD5] text-xs text-[#53645A] flex items-start gap-2">
        <Info className="w-4 h-4 shrink-0 text-[#214F3A] mt-0.5" />
        <p>
          Demo Mode is completely isolated in separate memory. Clock advancements and simulated records never touch your real saved prescription schedules or real caregiver consent.
        </p>
      </div>
    </div>
  );
};
