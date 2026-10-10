import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { DoseOccurrence, Medication } from '../../types';
import {
  formatKolkataTime,
  getKolkataDateString,
  formatKolkataDate,
} from '../../utils/timezone';
import { getEffectiveStatus, isDoseActionAllowed } from '../../utils/doseStatus';
import { getDoseStats } from '../../utils/doseStats';
import { StatusChip } from '../common/StatusChip';
import { MedicineTitle } from '../common/MedicineTitle';
import { getSpokenMedicineName } from '../../utils/transliteration';
import {
  Bell,
  Volume2,
  Check,
  X,
  Clock,
  RotateCcw,
  Sparkles,
  Info,
  Calendar,
  Play,
  Square,
} from 'lucide-react';

export const TodayScreen: React.FC = () => {
  const {
    data,
    recordDose,
    correctDose,
    t,
    language,
    reminderVoiceSettings,
    playDoseReminderAudio,
    stopVoiceAudio,
    isAudioPlaying,
    hasUserInteracted,
  } = useStore();

  const [savingDoseId, setSavingDoseId] = useState<string | null>(null);
  const [savedSuccessId, setSavedSuccessId] = useState<string | null>(null);
  const [correctingDoseId, setCorrectingDoseId] = useState<string | null>(null);
  const [audioFeedback, setAudioFeedback] = useState<{
    label: string;
    message?: string;
  } | null>(null);
  const [showTapToPlay, setShowTapToPlay] = useState<boolean>(false);
  const autoPlayedDosesRef = useRef<Set<string>>(new Set());

  const todayStr = getKolkataDateString();
  const nowMs = Date.now();

  // Active medications map
  const medMap = useMemo(() => {
    const map = new Map<string, Medication>();
    data.medications.forEach((m) => map.set(m.id, m));
    return map;
  }, [data.medications]);

  // Today's occurrences sorted chronologically
  const todayDoses = useMemo(() => {
    return data.dose_occurrences
      .filter((o) => o.scheduledAt.startsWith(todayStr))
      .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
  }, [data.dose_occurrences, todayStr]);

  // Next upcoming or due dose
  const nextDose = useMemo(() => {
    return todayDoses.find((o) => {
      const eff = getEffectiveStatus(o, nowMs);
      return eff === 'Due' || eff === 'Upcoming';
    });
  }, [todayDoses, nowMs]);

  // Derived counts summary via single source of truth selector getDoseStats
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

  // Autoplay reminder check for Due doses
  useEffect(() => {
    if (!nextDose) return;
    const eff = getEffectiveStatus(nextDose, nowMs);
    if (eff !== 'Due') return;

    if (!reminderVoiceSettings.playSoundOnDue || reminderVoiceSettings.mode === 'off') {
      return;
    }

    if (autoPlayedDosesRef.current.has(nextDose.id)) {
      return;
    }

    autoPlayedDosesRef.current.add(nextDose.id);
    const med = medMap.get(nextDose.medicationId);

    if (hasUserInteracted) {
      playDoseReminderAudio(med?.name, med?.nameTransliterations).then((res) => {
        if (res.autoplayBlocked) {
          setShowTapToPlay(true);
        } else {
          let label = res.voiceType === 'recorded' ? t.labelRecordedVoice : t.labelMachineVoice;
          if (res.voiceType === 'fallback_machine') {
            label = `${t.noRecordedVoiceForLang} (${t.labelMachineVoice})`;
          }
          setAudioFeedback({ label, message: res.message });
        }
      });
    } else {
      setShowTapToPlay(true);
    }
  }, [nextDose, nowMs, reminderVoiceSettings, hasUserInteracted, playDoseReminderAudio, medMap, t]);

  // Handle marking a dose
  const handleRecord = async (occurrence: DoseOccurrence, status: 'TAKEN' | 'MISSED') => {
    setSavingDoseId(occurrence.id);
    try {
      await recordDose(occurrence.id, status);
      setSavedSuccessId(occurrence.id);
      setTimeout(() => setSavedSuccessId(null), 2500);
    } finally {
      setSavingDoseId(null);
    }
  };

  // Handle correcting an existing dose
  const handleCorrect = async (occurrence: DoseOccurrence, newStatus: 'TAKEN' | 'MISSED') => {
    setSavingDoseId(occurrence.id);
    try {
      await correctDose(occurrence.id, newStatus);
      setCorrectingDoseId(null);
      setSavedSuccessId(occurrence.id);
      setTimeout(() => setSavedSuccessId(null), 2500);
    } finally {
      setSavingDoseId(null);
    }
  };

  // Handle listen for due reminder - NEVER records dose as taken
  const handleListen = async (
    medName: string,
    transliterations?: { te?: string; hi?: string }
  ) => {
    if (isAudioPlaying) {
      stopVoiceAudio();
      setAudioFeedback(null);
      return;
    }

    const res = await playDoseReminderAudio(medName, transliterations);
    let label = '';
    if (res.voiceType === 'recorded') {
      label = t.labelRecordedVoice;
    } else if (res.voiceType === 'machine') {
      label = t.labelMachineVoice;
    } else if (res.voiceType === 'fallback_machine') {
      label = `${t.noRecordedVoiceForLang} (${t.labelMachineVoice})`;
    } else {
      label = t.voiceModeOff;
    }

    setAudioFeedback({
      label,
      message: res.message,
    });
    setShowTapToPlay(false);
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 space-y-6">
      {/* Top Header & Date */}
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 border-b border-[#D5DCD5] pb-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#1F2B25] tracking-tight">
            {t.todayTitle}
          </h1>
          <p className="text-sm text-[#53645A] mt-1">
            {t.todaySubtitle}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-[#214F3A] bg-[#EAF3ED] px-3.5 py-1.5 rounded-full border border-[#B8D7C2]">
          <Calendar className="w-4 h-4" />
          <span>{formatKolkataDate(todayStr)}</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-[#D5DCD5] rounded-lg p-3 sm:p-4 text-center">
          <p className="text-xs uppercase font-bold text-[#53645A]">{t.summaryTakenCount}</p>
          <p className="text-2xl sm:text-3xl font-serif font-bold text-[#266044] mt-1 tabular-nums">
            {summary.taken}
          </p>
        </div>
        <div className="bg-white border border-[#D5DCD5] rounded-lg p-3 sm:p-4 text-center">
          <p className="text-xs uppercase font-bold text-[#53645A]">{t.summaryPendingCount}</p>
          <p className="text-2xl sm:text-3xl font-serif font-bold text-[#875E16] mt-1 tabular-nums">
            {summary.pending}
          </p>
        </div>
        <div className="bg-white border border-[#D5DCD5] rounded-lg p-3 sm:p-4 text-center">
          <p className="text-xs uppercase font-bold text-[#53645A]">{t.summaryMissedCount}</p>
          <p className="text-2xl sm:text-3xl font-serif font-bold text-[#A3342A] mt-1 tabular-nums">
            {summary.missed}
          </p>
        </div>
        <div className="bg-white border border-[#D5DCD5] rounded-lg p-3 sm:p-4 text-center">
          <p className="text-xs uppercase font-bold text-[#53645A]">{t.summaryUnconfirmedCount}</p>
          <p className="text-2xl sm:text-3xl font-serif font-bold text-[#805A13] mt-1 tabular-nums">
            {summary.unconfirmed}
          </p>
        </div>
      </div>

      {/* Next Dose Card */}
      {nextDose && (() => {
        const med = medMap.get(nextDose.medicationId);
        const effectiveStatus = getEffectiveStatus(nextDose, nowMs);
        const isDueNow = effectiveStatus === 'Due';
        const actionCheck = isDoseActionAllowed(nextDose, nowMs);

        return (
          <div
            className={`border rounded-xl p-5 sm:p-6 transition-all shadow-xs ${
              isDueNow
                ? 'bg-[#FBF2D9] border-[#E6D4A5] ring-2 ring-[#875E16]/20'
                : 'bg-white border-[#D5DCD5]'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-bold tracking-wider text-[#875E16] flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    {t.nextDoseCardTitle}
                  </span>
                  <StatusChip status={effectiveStatus} />
                </div>
                <MedicineTitle
                  name={med?.name || 'Medication'}
                  transliterations={med?.nameTransliterations}
                  size="xl"
                />
                <p className="text-base font-semibold text-[#53645A]">
                  <span className={med?.strength ? '' : 'italic text-[#718278]'}>
                    {med?.strength || 'Strength not specified'}
                  </span>
                  {' '}&bull;{' '}
                  <span className={med?.amountPerDose ? '' : 'italic text-[#718278]'}>
                    {med?.amountPerDose || 'Amount not specified'}
                  </span>
                </p>
                {med?.instructions && (
                  <p className="text-sm text-[#1F2B25] italic mt-1">
                    &ldquo;{med.instructions}&rdquo;
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:items-end gap-2 shrink-0">
                <div className="text-2xl font-serif font-bold text-[#214F3A] tabular-nums">
                  {formatKolkataTime(nextDose.scheduledAt)}
                </div>

                {/* Audio Listen Button */}
                <button
                  type="button"
                  onClick={() =>
                    handleListen(
                      med?.name || '',
                      med?.nameTransliterations
                    )
                  }
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[44px] text-xs font-semibold rounded transition-colors focus-visible:outline-2 focus-visible:outline-[#94631A] ${
                    isAudioPlaying
                      ? 'bg-[#A3342A] text-white border border-[#A3342A]'
                      : 'text-[#214F3A] hover:bg-[#F0F3ED] border border-[#718278]'
                  }`}
                  title={t.listenReminder}
                >
                  {isAudioPlaying ? (
                    <>
                      <Square className="w-4 h-4" />
                      <span>{t.stopPreview}</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4 text-[#875E16]" />
                      <span>{t.listenReminder}</span>
                    </>
                  )}
                </button>
                <span className="text-[11px] text-[#53645A] text-right font-medium">
                  {audioFeedback ? (
                    <span>{audioFeedback.label}</span>
                  ) : reminderVoiceSettings.mode === 'recorded' ? (
                    <span>{t.labelRecordedVoice}</span>
                  ) : reminderVoiceSettings.mode === 'machine' ? (
                    <span>{t.labelMachineVoice}</span>
                  ) : (
                    <span>{t.voiceModeOff}</span>
                  )}
                </span>
              </div>
            </div>

            {/* In-App Due Notification Banner */}
            {isDueNow && (
              <div className="mt-4 p-3 bg-white/80 rounded border border-[#E6D4A5] flex items-center justify-between gap-3 text-sm text-[#805A13] font-medium">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#875E16] shrink-0 animate-bounce" />
                  <span>{t.dueNowNotification}</span>
                </div>

                {/* If autoplay was blocked or user hasn't interacted, show "Tap to play reminder" button */}
                {showTapToPlay && (
                  <button
                    type="button"
                    onClick={() =>
                      handleListen(
                        med?.name || '',
                        med?.nameTransliterations
                      )
                    }
                    className="min-h-[36px] px-3 py-1 bg-[#214F3A] hover:bg-[#173E2D] text-white text-xs font-semibold rounded flex items-center gap-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-[#94631A]"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>{t.tapToPlayReminder}</span>
                  </button>
                )}
              </div>
            )}

            {/* Audio message / feedback */}
            {audioFeedback?.message && (
              <div className="mt-2 text-xs text-[#875E16] italic font-medium">
                {audioFeedback.message}
              </div>
            )}

            {/* Action buttons on Next Dose */}
            <div className="mt-5 pt-4 border-t border-[#D5DCD5]/60 flex flex-wrap items-center gap-3">
              {actionCheck.allowed ? (
                <>
                  <button
                    type="button"
                    disabled={savingDoseId === nextDose.id}
                    onClick={() => handleRecord(nextDose, 'TAKEN')}
                    className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 bg-[#214F3A] hover:bg-[#173E2D] disabled:opacity-50 text-white font-semibold rounded transition-colors focus-visible:outline-2 focus-visible:outline-[#94631A]"
                  >
                    <Check className="w-4 h-4" />
                    <span>{savingDoseId === nextDose.id ? t.saving : t.takeButton}</span>
                  </button>

                  <button
                    type="button"
                    disabled={savingDoseId === nextDose.id}
                    onClick={() => handleRecord(nextDose, 'MISSED')}
                    className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 bg-[#FBECEA] hover:bg-[#F2BDB9]/40 text-[#A3342A] border border-[#F2BDB9] disabled:opacity-50 font-semibold rounded transition-colors focus-visible:outline-2 focus-visible:outline-[#94631A]"
                  >
                    <X className="w-4 h-4" />
                    <span>{savingDoseId === nextDose.id ? t.saving : t.notTakenButton}</span>
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2 text-sm text-[#53645A]">
                  <Clock className="w-4 h-4 shrink-0 text-[#875E16]" />
                  <span>{t.futureDoseExplanation}</span>
                </div>
              )}

              {savedSuccessId === nextDose.id && (
                <span className="text-sm font-semibold text-[#266044] animate-fade-in">
                  &bull; {t.saved}
                </span>
              )}
            </div>
          </div>
        );
      })()}

      {/* Chronological Timetable Rows */}
      <div className="bg-white border border-[#D5DCD5] rounded-xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 bg-[#F0F3ED] border-b border-[#D5DCD5] flex items-center justify-between">
          <h2 className="text-lg font-serif font-bold text-[#1F2B25]">
            Daily Timetable
          </h2>
          <span className="text-xs font-semibold text-[#53645A]">
            {todayDoses.length} scheduled doses
          </span>
        </div>

        {todayDoses.length === 0 ? (
          <div className="p-8 text-center text-[#53645A]">
            <p className="text-base">{t.empty}</p>
          </div>
        ) : (
          <div className="divide-y divide-[#D5DCD5]">
            {todayDoses.map((dose) => {
              const med = medMap.get(dose.medicationId);
              const effStatus = getEffectiveStatus(dose, nowMs);
              const actionCheck = isDoseActionAllowed(dose, nowMs);
              const isSaving = savingDoseId === dose.id;
              const isCorrecting = correctingDoseId === dose.id;
              const hasBeenRecorded = dose.status === 'TAKEN' || dose.status === 'MISSED';

              return (
                <div
                  key={dose.id}
                  className={`p-4 sm:p-5 transition-colors ${
                    effStatus === 'Due' ? 'bg-[#FBF2D9]/30' : 'hover:bg-[#FAFAF7]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Medicine details */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-base font-bold text-[#214F3A] tabular-nums">
                          {formatKolkataTime(dose.scheduledAt)}
                        </span>
                        <StatusChip status={effStatus} size="sm" />
                        {dose.originalStatus && (
                          <span className="text-xs bg-[#F0F3ED] text-[#53645A] px-2 py-0.5 rounded border border-[#D5DCD5]">
                            Corrected
                          </span>
                        )}
                      </div>

                      <MedicineTitle
                        name={med?.name || 'Medication'}
                        transliterations={med?.nameTransliterations}
                        size="md"
                      />
                      <p className="text-sm text-[#53645A]">
                        <span className={med?.strength ? '' : 'italic text-[#718278]'}>
                          {med?.strength || 'Strength not specified'}
                        </span>
                        {' '}&bull;{' '}
                        <span className={med?.amountPerDose ? '' : 'italic text-[#718278]'}>
                          {med?.amountPerDose || 'Amount not specified'}
                        </span>
                        {med?.instructions && ` • ${med.instructions}`}
                      </p>
                    </div>

                    {/* Action buttons & feedback */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* If pending and due/past */}
                      {dose.status === 'PENDING' && (
                        <>
                          {actionCheck.allowed ? (
                            <>
                              <button
                                type="button"
                                disabled={isSaving}
                                onClick={() => handleRecord(dose, 'TAKEN')}
                                className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 py-2 bg-[#214F3A] hover:bg-[#173E2D] disabled:opacity-50 text-white text-sm font-semibold rounded transition-colors focus-visible:outline-2 focus-visible:outline-[#94631A]"
                              >
                                <Check className="w-4 h-4" />
                                <span>{isSaving ? t.saving : t.takeButton}</span>
                              </button>

                              <button
                                type="button"
                                disabled={isSaving}
                                onClick={() => handleRecord(dose, 'MISSED')}
                                className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-3.5 py-2 bg-white hover:bg-[#FBECEA] text-[#A3342A] border border-[#718278] disabled:opacity-50 text-sm font-semibold rounded transition-colors focus-visible:outline-2 focus-visible:outline-[#94631A]"
                              >
                                <X className="w-4 h-4" />
                                <span>{isSaving ? t.saving : t.notTakenButton}</span>
                              </button>
                            </>
                          ) : (
                            <div className="flex items-center gap-1.5 text-xs text-[#53645A] bg-[#F0F3ED] px-3 py-2 rounded border border-[#D5DCD5]">
                              <Clock className="w-3.5 h-3.5 text-[#875E16]" />
                              <span>{t.futureDoseExplanation}</span>
                            </div>
                          )}
                        </>
                      )}

                      {/* If already recorded (Taken or Missed) */}
                      {hasBeenRecorded && !isCorrecting && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setCorrectingDoseId(dose.id)}
                            className="inline-flex items-center gap-1.5 min-h-[44px] px-3 py-1.5 text-xs font-semibold text-[#53645A] hover:text-[#1F2B25] hover:bg-[#F0F3ED] border border-[#D5DCD5] rounded transition-colors focus-visible:outline-2 focus-visible:outline-[#94631A]"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>{t.changeOutcome}</span>
                          </button>
                        </div>
                      )}

                      {/* Correction panel */}
                      {isCorrecting && (
                        <div className="flex items-center gap-2 bg-[#F0F3ED] p-2 rounded border border-[#718278]">
                          <span className="text-xs font-bold text-[#1F2B25]">Correct to:</span>
                          <button
                            type="button"
                            disabled={isSaving}
                            onClick={() => handleCorrect(dose, 'TAKEN')}
                            className="px-2.5 py-1 text-xs font-semibold bg-[#214F3A] text-white rounded hover:bg-[#173E2D] min-h-[36px]"
                          >
                            {t.takeButton}
                          </button>
                          <button
                            type="button"
                            disabled={isSaving}
                            onClick={() => handleCorrect(dose, 'MISSED')}
                            className="px-2.5 py-1 text-xs font-semibold bg-[#A3342A] text-white rounded hover:bg-[#85251C] min-h-[36px]"
                          >
                            {t.notTakenButton}
                          </button>
                          <button
                            type="button"
                            onClick={() => setCorrectingDoseId(null)}
                            className="px-2 py-1 text-xs text-[#53645A] hover:text-[#1F2B25] min-h-[36px]"
                          >
                            {t.cancel}
                          </button>
                        </div>
                      )}

                      {/* Saved toast */}
                      {savedSuccessId === dose.id && (
                        <span className="text-xs font-semibold text-[#266044]">
                          &bull; {t.saved}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Product boundary reminder footer */}
      <div className="p-4 bg-[#F0F3ED] rounded-lg border border-[#D5DCD5] flex items-start gap-3 text-xs text-[#53645A]">
        <Info className="w-4 h-4 shrink-0 text-[#214F3A] mt-0.5" />
        <p>
          CareDose displays your self-reported log based on your written doctor prescription. CareDose never alters your dose, makes missed-dose suggestions, or provides clinical diagnosis.
        </p>
      </div>
    </div>
  );
};
