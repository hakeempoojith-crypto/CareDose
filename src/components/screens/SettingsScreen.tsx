import React, { useState, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { Language } from '../../types';
import { isIndexedDbAvailable } from '../../services/voiceReminder';
import {
  Globe,
  Bell,
  UserCheck,
  LogOut,
  RotateCcw,
  Info,
  CheckCircle,
  AlertTriangle,
  Mic,
  Volume2,
  Play,
  Square,
  Upload,
  Trash2,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

export const SettingsScreen: React.FC = () => {
  const {
    currentProfile,
    language,
    setLanguage,
    signOut,
    resetAllData,
    browserNotificationsAllowed,
    requestBrowserNotifications,
    reminderVoiceSettings,
    updateVoiceSettings,
    uploadVoiceClip,
    removeVoiceClip,
    playVoicePreview,
    stopVoiceAudio,
    playDoseReminderAudio,
    isAudioPlaying,
    t,
  } = useStore();

  const [notificationStatusMsg, setNotificationStatusMsg] = useState<string>('');
  const [resetConfirmOpen, setResetConfirmOpen] = useState<boolean>(false);

  // Voice uploading state per language
  const [uploadingLang, setUploadingLang] = useState<Language | null>(null);
  const [slotErrors, setSlotErrors] = useState<Record<string, string>>({});
  const [previewingLang, setPreviewingLang] = useState<string | null>(null);
  const [testFeedback, setTestFeedback] = useState<{
    voiceType: string;
    message?: string;
  } | null>(null);
  const [permissionErrorNotice, setPermissionErrorNotice] = useState<boolean>(false);

  // File input refs for each language slot
  const fileInputRefs = {
    en: useRef<HTMLInputElement>(null),
    hi: useRef<HTMLInputElement>(null),
    te: useRef<HTMLInputElement>(null),
  };

  const indexedDbOk = isIndexedDbAvailable();

  const handleToggleNotifications = async () => {
    const granted = await requestBrowserNotifications();
    if (granted) {
      setNotificationStatusMsg(t.browserNotificationsActive);
    } else {
      setNotificationStatusMsg(t.browserNotificationsDenied);
    }
  };

  const handleConfirmReset = () => {
    resetAllData();
    setResetConfirmOpen(false);
    window.location.reload();
  };

  const handleVoiceModeChange = (mode: 'recorded' | 'machine' | 'off') => {
    stopVoiceAudio();
    updateVoiceSettings({ mode });
  };

  const handleFileSelect = async (lang: Language, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value so same file can be reselected if needed
    e.target.value = '';

    // Validate permission agreed checkbox
    if (!reminderVoiceSettings.permissionAgreed) {
      setPermissionErrorNotice(true);
      setTimeout(() => setPermissionErrorNotice(false), 5000);
      return;
    }

    setUploadingLang(lang);
    setSlotErrors((prev) => ({ ...prev, [lang]: '' }));

    const res = await uploadVoiceClip(lang, file);
    setUploadingLang(null);

    if (!res.success && res.error) {
      setSlotErrors((prev) => ({ ...prev, [lang]: res.error || t.errorAudioRead }));
    }
  };

  const handleTriggerFileInput = (lang: Language) => {
    if (!reminderVoiceSettings.permissionAgreed) {
      setPermissionErrorNotice(true);
      setTimeout(() => setPermissionErrorNotice(false), 5000);
      return;
    }
    fileInputRefs[lang].current?.click();
  };

  const handlePlayPreview = async (lang: Language) => {
    if (isAudioPlaying && previewingLang === lang) {
      stopVoiceAudio();
      setPreviewingLang(null);
      return;
    }
    setPreviewingLang(lang);
    const res = await playVoicePreview(lang);
    if (!res.played) {
      setPreviewingLang(null);
    }
  };

  const handleRemoveClip = async (lang: Language) => {
    stopVoiceAudio();
    if (previewingLang === lang) setPreviewingLang(null);
    await removeVoiceClip(lang);
    setSlotErrors((prev) => ({ ...prev, [lang]: '' }));
  };

  const handleTestMyVoice = async () => {
    setTestFeedback(null);
    const res = await playDoseReminderAudio('Metformin Hydrochloride', {
      te: 'మెట్‌ఫార్మిన్ హైడ్రోక్లోరైడ్',
      hi: 'मेटफॉर्मिन हाइड्रोक्लोराइड',
    });

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

    setTestFeedback({
      voiceType: label,
      message: res.message,
    });
  };

  const formatDuration = (seconds?: number): string => {
    if (seconds === undefined || seconds === null) return '';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const slotsData: Array<{ key: Language; label: string; nativeName: string }> = [
    { key: 'en', label: 'English', nativeName: 'English' },
    { key: 'hi', label: 'Hindi', nativeName: 'हिन्दी' },
    { key: 'te', label: 'Telugu', nativeName: 'తెలుగు' },
  ];

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 space-y-6">
      {/* Title */}
      <div className="border-b border-[#D5DCD5] pb-4">
        <h1 className="text-3xl font-serif font-bold text-[#1F2B25] tracking-tight">
          {t.settingsTitle}
        </h1>
        <p className="text-sm text-[#53645A] mt-1">
          {t.settingsSubtitle}
        </p>
      </div>

      {/* Language Section */}
      <div className="bg-white border border-[#D5DCD5] rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-[#214F3A]" />
          <h2 className="text-lg font-serif font-bold text-[#1F2B25]">
            {t.languageSection}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`min-h-[44px] px-5 py-2.5 rounded-lg border font-semibold text-sm transition-colors focus-visible:outline-2 focus-visible:outline-[#94631A] ${
              language === 'en'
                ? 'bg-[#214F3A] text-white border-[#214F3A]'
                : 'bg-white text-[#1F2B25] border-[#718278] hover:bg-[#F0F3ED]'
            }`}
          >
            English
          </button>

          <button
            type="button"
            onClick={() => setLanguage('hi')}
            className={`min-h-[44px] px-5 py-2.5 rounded-lg border font-semibold text-sm transition-colors focus-visible:outline-2 focus-visible:outline-[#94631A] ${
              language === 'hi'
                ? 'bg-[#214F3A] text-white border-[#214F3A]'
                : 'bg-white text-[#1F2B25] border-[#718278] hover:bg-[#F0F3ED]'
            }`}
          >
            हिन्दी (Hindi)
          </button>

          <button
            type="button"
            onClick={() => setLanguage('te')}
            className={`min-h-[44px] px-5 py-2.5 rounded-lg border font-semibold text-sm transition-colors focus-visible:outline-2 focus-visible:outline-[#94631A] ${
              language === 'te'
                ? 'bg-[#214F3A] text-white border-[#214F3A]'
                : 'bg-white text-[#1F2B25] border-[#718278] hover:bg-[#F0F3ED]'
            }`}
          >
            తెలుగు (Telugu)
          </button>
        </div>

        {/* Translation Notes */}
        <div className="p-3 bg-[#FBF2D9] rounded-lg border border-[#E6D4A5] text-xs text-[#805A13] flex items-center gap-2">
          <Info className="w-4 h-4 shrink-0 text-[#875E16]" />
          <span>{language === 'hi' ? t.hindiReviewNote : t.teluguReviewNote}</span>
        </div>
      </div>

      {/* REMINDER VOICE CARD */}
      <div className="bg-white border border-[#D5DCD5] rounded-xl p-6 shadow-xs space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Mic className="w-5 h-5 text-[#214F3A]" />
              <h2 className="text-lg font-serif font-bold text-[#1F2B25]">
                {t.reminderVoiceCardTitle}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#53645A]">
              {t.reminderVoiceSubtitle}
            </p>
          </div>
        </div>

        {/* IndexedDB Unavailable Warning */}
        {!indexedDbOk && (
          <div className="p-3.5 bg-[#FBF2D9] rounded-lg border border-[#E6D4A5] text-xs text-[#805A13] flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 text-[#875E16] mt-0.5" />
            <span>{t.indexedDbUnavailableNotice}</span>
          </div>
        )}

        {/* Choice: My recorded voice / Machine voice / Off */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-[#53645A]">
            Voice Prompt Type
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => handleVoiceModeChange('recorded')}
              className={`min-h-[48px] p-3 rounded-lg border text-left flex items-center gap-3 transition-colors focus-visible:outline-2 focus-visible:outline-[#94631A] ${
                reminderVoiceSettings.mode === 'recorded'
                  ? 'bg-[#214F3A] text-white border-[#214F3A] shadow-xs'
                  : 'bg-[#F0F3ED] text-[#1F2B25] border-[#718278] hover:bg-[#E5EAE2]'
              }`}
            >
              <Mic className="w-4 h-4 shrink-0" />
              <span className="text-sm font-semibold">{t.voiceModeRecorded}</span>
            </button>

            <button
              type="button"
              onClick={() => handleVoiceModeChange('machine')}
              className={`min-h-[48px] p-3 rounded-lg border text-left flex items-center gap-3 transition-colors focus-visible:outline-2 focus-visible:outline-[#94631A] ${
                reminderVoiceSettings.mode === 'machine'
                  ? 'bg-[#214F3A] text-white border-[#214F3A] shadow-xs'
                  : 'bg-[#F0F3ED] text-[#1F2B25] border-[#718278] hover:bg-[#E5EAE2]'
              }`}
            >
              <Volume2 className="w-4 h-4 shrink-0" />
              <span className="text-sm font-semibold">{t.voiceModeMachine}</span>
            </button>

            <button
              type="button"
              onClick={() => handleVoiceModeChange('off')}
              className={`min-h-[48px] p-3 rounded-lg border text-left flex items-center gap-3 transition-colors focus-visible:outline-2 focus-visible:outline-[#94631A] ${
                reminderVoiceSettings.mode === 'off'
                  ? 'bg-[#214F3A] text-white border-[#214F3A] shadow-xs'
                  : 'bg-[#F0F3ED] text-[#1F2B25] border-[#718278] hover:bg-[#E5EAE2]'
              }`}
            >
              <span className="w-4 h-4 shrink-0 flex items-center justify-center font-bold text-xs">&times;</span>
              <span className="text-sm font-semibold">{t.voiceModeOff}</span>
            </button>
          </div>
        </div>

        {/* Global Reminder Toggles */}
        {reminderVoiceSettings.mode !== 'off' && (
          <div className="space-y-3 pt-2 border-t border-[#D5DCD5]">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={reminderVoiceSettings.playSoundOnDue}
                onChange={(e) =>
                  updateVoiceSettings({ playSoundOnDue: e.target.checked })
                }
                className="w-4 h-4 text-[#214F3A] rounded border-[#718278] focus:ring-[#94631A]"
              />
              <span className="text-sm font-medium text-[#1F2B25]">
                {t.playSoundWhenDueToggle}
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={reminderVoiceSettings.sayMedNameAfter}
                onChange={(e) =>
                  updateVoiceSettings({ sayMedNameAfter: e.target.checked })
                }
                className="w-4 h-4 text-[#214F3A] rounded border-[#718278] focus:ring-[#94631A]"
              />
              <span className="text-sm font-medium text-[#1F2B25]">
                {t.sayMedNameAfterToggle}
              </span>
            </label>
          </div>
        )}

        {/* Upload Slots Section (When 'recorded' mode is active) */}
        {reminderVoiceSettings.mode === 'recorded' && (
          <div className="space-y-4 pt-3 border-t border-[#D5DCD5]">
            {/* Required permission checkbox */}
            <div className="p-3.5 bg-[#F0F3ED] rounded-lg border border-[#D5DCD5] space-y-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reminderVoiceSettings.permissionAgreed}
                  onChange={(e) => {
                    updateVoiceSettings({ permissionAgreed: e.target.checked });
                    if (e.target.checked) setPermissionErrorNotice(false);
                  }}
                  className="w-4 h-4 mt-0.5 text-[#214F3A] rounded border-[#718278] focus:ring-[#94631A]"
                />
                <span className="text-xs sm:text-sm font-medium text-[#1F2B25]">
                  {t.voicePermissionCheckbox}
                </span>
              </label>

              {permissionErrorNotice && (
                <div className="text-xs font-semibold text-[#A3342A] flex items-center gap-1.5 animate-in fade-in">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{t.permissionRequiredNotice}</span>
                </div>
              )}
            </div>

            {/* Checkbox: Use one file for all languages */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reminderVoiceSettings.useOneForAll}
                  onChange={(e) =>
                    updateVoiceSettings({ useOneForAll: e.target.checked })
                  }
                  className="w-4 h-4 text-[#214F3A] rounded border-[#718278] focus:ring-[#94631A]"
                />
                <span className="text-xs sm:text-sm font-medium text-[#1F2B25]">
                  {t.useOneForAllLangs}
                </span>
              </label>
            </div>

            {/* Upload slots */}
            <div className="space-y-3">
              {slotsData.map((slot) => {
                const slotMeta = reminderVoiceSettings.slots[slot.key];
                const isCurrentLang = language === slot.key;
                const isSlotUploading = uploadingLang === slot.key;
                const isSlotPreviewing = isAudioPlaying && previewingLang === slot.key;
                const slotError = slotErrors[slot.key];

                return (
                  <div
                    key={slot.key}
                    className={`p-4 rounded-xl border transition-colors ${
                      isCurrentLang
                        ? 'border-[#214F3A] bg-[#EAF3ED]/30'
                        : 'border-[#D5DCD5] bg-white'
                    }`}
                  >
                    {/* Hidden file input */}
                    <input
                      ref={fileInputRefs[slot.key]}
                      type="file"
                      accept="audio/mpeg,.mp3"
                      className="hidden"
                      onChange={(e) => handleFileSelect(slot.key, e)}
                    />

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-[#1F2B25]">
                            {slot.nativeName} ({slot.label})
                          </span>
                          {isCurrentLang && (
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-[#214F3A] text-white rounded">
                              Current Language
                            </span>
                          )}
                        </div>

                        {slotMeta?.hasClip ? (
                          <div className="flex items-center gap-2 text-xs text-[#53645A]">
                            <span className="font-medium text-[#1F2B25] truncate max-w-[200px] sm:max-w-xs">
                              {slotMeta.fileName || 'custom-voice.mp3'}
                            </span>
                            {slotMeta.duration !== undefined && (
                              <span>&bull; {formatDuration(slotMeta.duration)}</span>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs text-[#718278] italic">
                            {t.noFileUploaded}
                          </p>
                        )}
                      </div>

                      {/* Slot action buttons */}
                      <div className="flex flex-wrap items-center gap-2">
                        {slotMeta?.hasClip ? (
                          <>
                            {/* Play / Stop preview */}
                            <button
                              type="button"
                              onClick={() => handlePlayPreview(slot.key)}
                              className={`min-h-[40px] px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-[#94631A] ${
                                isSlotPreviewing
                                  ? 'bg-[#A3342A] text-white border-[#A3342A]'
                                  : 'bg-[#F0F3ED] text-[#214F3A] border-[#718278] hover:bg-[#E5EAE2]'
                              }`}
                            >
                              {isSlotPreviewing ? (
                                <>
                                  <Square className="w-3.5 h-3.5" />
                                  <span>{t.stopPreview}</span>
                                </>
                              ) : (
                                <>
                                  <Play className="w-3.5 h-3.5" />
                                  <span>{t.playPreview}</span>
                                </>
                              )}
                            </button>

                            {/* Replace */}
                            <button
                              type="button"
                              onClick={() => handleTriggerFileInput(slot.key)}
                              disabled={isSlotUploading}
                              className="min-h-[40px] px-3 py-1.5 rounded-lg border border-[#718278] bg-white text-[#1F2B25] text-xs font-semibold hover:bg-[#F0F3ED] transition-colors focus-visible:outline-2 focus-visible:outline-[#94631A]"
                            >
                              {isSlotUploading ? t.saving : t.replaceFile}
                            </button>

                            {/* Remove */}
                            <button
                              type="button"
                              onClick={() => handleRemoveClip(slot.key)}
                              className="min-h-[40px] px-2.5 py-1.5 rounded-lg border border-[#F2BDB9] bg-[#FBECEA] text-[#A3342A] text-xs font-semibold hover:bg-[#F2BDB9]/40 transition-colors focus-visible:outline-2 focus-visible:outline-[#94631A]"
                              title={t.removeFile}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleTriggerFileInput(slot.key)}
                            disabled={isSlotUploading}
                            className="min-h-[40px] px-4 py-1.5 rounded-lg border border-[#214F3A] bg-[#214F3A] text-white text-xs font-semibold hover:bg-[#173E2D] flex items-center gap-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-[#94631A]"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>{isSlotUploading ? t.saving : t.chooseFile}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Inline Validation Error */}
                    {slotError && (
                      <div className="mt-2 text-xs font-semibold text-[#A3342A] flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{slotError}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* "Test My Voice" Button & Feedback */}
        <div className="pt-3 border-t border-[#D5DCD5] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <button
              type="button"
              onClick={handleTestMyVoice}
              className="min-h-[44px] px-5 py-2.5 bg-[#214F3A] hover:bg-[#173E2D] text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors focus-visible:outline-2 focus-visible:outline-[#94631A]"
            >
              {isAudioPlaying ? (
                <>
                  <Square className="w-4 h-4" />
                  <span>{t.stopPreview}</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" />
                  <span>{t.testVoiceButton}</span>
                </>
              )}
            </button>
            <p className="text-[11px] text-[#53645A]">
              Audio never records a dose as Taken.
            </p>
          </div>

          {testFeedback && (
            <div className="p-3 bg-[#F0F3ED] rounded-lg border border-[#D5DCD5] text-xs text-[#1F2B25] space-y-1">
              <div className="font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#214F3A]" />
                <span>{testFeedback.voiceType}</span>
              </div>
              {testFeedback.message && (
                <p className="text-[#875E16]">{testFeedback.message}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Reminders & Notifications Section */}
      <div className="bg-white border border-[#D5DCD5] rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-[#214F3A]" />
          <h2 className="text-lg font-serif font-bold text-[#1F2B25]">
            {t.notificationsSection}
          </h2>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={handleToggleNotifications}
            className="min-h-[44px] px-4 py-2.5 bg-[#F0F3ED] hover:bg-[#E5EAE2] border border-[#718278] text-[#1F2B25] text-sm font-semibold rounded flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-[#94631A]"
          >
            <Bell className="w-4 h-4 text-[#214F3A]" />
            <span>
              {browserNotificationsAllowed
                ? 'Browser notifications permitted'
                : t.browserNotificationsToggle}
            </span>
          </button>

          {notificationStatusMsg && (
            <p className="text-xs font-semibold text-[#214F3A]">
              {notificationStatusMsg}
            </p>
          )}

          {/* Mandatory constraints notice */}
          <div className="p-4 bg-[#F0F3ED] rounded-lg border border-[#D5DCD5] space-y-1.5 text-xs text-[#53645A]">
            <p className="font-semibold text-[#1F2B25]">
              {t.backgroundPushNotice}
            </p>
            <p>
              {t.writtenScheduleAlwaysAvailable}
            </p>
          </div>
        </div>
      </div>

      {/* Active Profile Section */}
      <div className="bg-white border border-[#D5DCD5] rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-[#214F3A]" />
          <h2 className="text-lg font-serif font-bold text-[#1F2B25]">
            {t.accountDetailsSection}
          </h2>
        </div>

        {currentProfile ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[#F0F3ED] rounded-lg border border-[#D5DCD5]">
            <div>
              <p className="font-bold text-base text-[#1F2B25]">{currentProfile.name}</p>
              <p className="text-xs text-[#53645A]">
                Role: {currentProfile.role === 'patient'
                  ? t.patientAccount
                  : currentProfile.role === 'caregiver'
                  ? t.caregiverAccount
                  : `${t.pharmacistAccount} (ID: ${currentProfile.registrationId})`}
              </p>
            </div>
            <button
              type="button"
              onClick={signOut}
              className="min-h-[44px] px-4 py-2 bg-[#FBECEA] hover:bg-[#F2BDB9]/50 text-[#A3342A] border border-[#F2BDB9] text-xs font-semibold rounded flex items-center gap-1.5 self-start sm:self-auto"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t.logout}</span>
            </button>
          </div>
        ) : (
          <p className="text-xs text-[#53645A]">No profile active.</p>
        )}
      </div>

      {/* Reset Data Section */}
      <div className="bg-white border border-[#D5DCD5] rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <RotateCcw className="w-5 h-5 text-[#A3342A]" />
          <h2 className="text-lg font-serif font-bold text-[#1F2B25]">
            {t.resetSection}
          </h2>
        </div>

        <p className="text-xs text-[#53645A]">
          {t.resetDescription}
        </p>

        {!resetConfirmOpen ? (
          <button
            type="button"
            onClick={() => setResetConfirmOpen(true)}
            className="min-h-[44px] px-4 py-2.5 bg-[#FBECEA] hover:bg-[#F2BDB9]/50 text-[#A3342A] border border-[#F2BDB9] text-xs font-semibold rounded flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.resetButton}</span>
          </button>
        ) : (
          <div className="p-4 bg-[#FBECEA] rounded-lg border border-[#F2BDB9] space-y-3">
            <p className="text-xs font-bold text-[#A3342A]">
              {t.resetConfirmTitle}
            </p>
            <p className="text-xs text-[#85251C]">
              {t.resetConfirmWarning}
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleConfirmReset}
                className="min-h-[44px] px-4 py-2 bg-[#A3342A] hover:bg-[#85251C] text-white text-xs font-semibold rounded flex items-center gap-1.5"
              >
                <span>{t.resetConfirmAction}</span>
              </button>
              <button
                type="button"
                onClick={() => setResetConfirmOpen(false)}
                className="min-h-[44px] px-4 py-2 bg-white text-[#1F2B25] border border-[#718278] text-xs font-semibold rounded"
              >
                {t.cancel}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
