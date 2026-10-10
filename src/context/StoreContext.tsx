import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import {
  ActivityLogItem,
  CaregiverAlert,
  Consent,
  DoseOccurrence,
  Language,
  Medication,
  PharmacistNote,
  PharmacistVerification,
  Profile,
  ReminderVoiceMode,
  ReminderVoiceSettings,
  ScreenId,
  StoreData,
  VoiceSlotMeta,
} from '../types';
import { translations, TranslationDictionary } from '../i18n';
import {
  createKolkataISO,
  getKolkataDateString,
  getKolkataTimeString,
} from '../utils/timezone';
import {
  generateRollingOccurrences,
  getEffectiveStatus,
} from '../utils/doseStatus';
import {
  voiceManager,
  saveVoiceClip,
  getVoiceClip,
  deleteVoiceClip,
  validateAudioFile,
  isIndexedDbAvailable,
} from '../services/voiceReminder';
import { getSpokenMedicineName } from '../utils/transliteration';

const STORAGE_KEY = 'caredose_v1';

export const PROFILES: Profile[] = [
  { id: 'p_lakshmi', name: 'Lakshmi', role: 'patient', pin: '1234' },
  { id: 'c_kiran', name: 'Kiran', role: 'caregiver', pin: '5678' },
  { id: 'ph_meera', name: 'Meera', role: 'pharmacist', pin: '9012', registrationId: 'PHARM-DEMO-0001' },
];

function createInitialStoreData(): StoreData {
  const todayStr = getKolkataDateString();
  const preloadedMed: Medication = {
    id: 'med_preloaded_metformin',
    patientId: 'p_lakshmi',
    name: 'Metformin Hydrochloride',
    strength: '500 mg',
    amountPerDose: '1 tablet',
    frequencyWording: 'Twice daily after food',
    dosesPerDay: 2,
    times: ['08:00', '20:00'],
    startDate: todayStr,
    ongoing: true,
    instructions: 'Take with or immediately after food',
    route: 'Oral',
    sourceExcerpt: 'Tab Metformin 500mg 1-0-1 after food',
    state: 'ACTIVE',
    reviewFlags: [],
    nameTransliterations: {
      te: 'మెట్‌ఫార్మిన్ హైడ్రోక్లోరైడ్',
      hi: 'मेटफॉर्मिन हाइड्रोक्लोराइड',
    },
    pharmacistVerification: {
      status: 'UNVERIFIED',
    },
  };

  const initialOccurrences = generateRollingOccurrences(preloadedMed, todayStr, []);

  // Pre-fill some realistic status for today's morning dose if current time is past 08:00
  const currentTimeStr = getKolkataTimeString();
  if (currentTimeStr >= '08:30') {
    const morningDose = initialOccurrences.find(
      (o) => o.scheduledAt.includes(`${todayStr}T08:00`)
    );
    if (morningDose) {
      morningDose.status = 'TAKEN';
      morningDose.recordedAt = createKolkataISO(todayStr, '08:15');
    }
  }

  const initialConsentKiran: Consent = {
    id: 'consent_kiran_1',
    patientId: 'p_lakshmi',
    caregiverId: 'c_kiran',
    granteeRole: 'caregiver',
    enabled: true,
    updatedAt: new Date().toISOString(),
  };

  const initialConsentMeera: Consent = {
    id: 'consent_meera_1',
    patientId: 'p_lakshmi',
    caregiverId: 'ph_meera',
    granteeRole: 'pharmacist',
    enabled: false, // Pharmacist sharing is OFF by default
    updatedAt: new Date().toISOString(),
  };

  const defaultVoiceSettings: ReminderVoiceSettings = {
    mode: 'machine',
    useOneForAll: false,
    permissionAgreed: false,
    playSoundOnDue: true,
    sayMedNameAfter: true,
    slots: {
      en: { hasClip: false },
      hi: { hasClip: false },
      te: { hasClip: false },
    },
  };

  return {
    profiles: PROFILES,
    medications: [preloadedMed],
    dose_occurrences: initialOccurrences,
    consents: [initialConsentKiran, initialConsentMeera],
    caregiver_alerts: [],
    pharmacist_notes: [],
    reminder_voice_settings: defaultVoiceSettings,
    activity_log: [
      {
        id: 'act_init_1',
        timestamp: new Date().toISOString(),
        actorId: 'p_lakshmi',
        action: 'INIT_MEDICATION',
        details: 'Initial active medication schedule configured for Metformin 500 mg.',
      },
      {
        id: 'act_init_2',
        timestamp: new Date().toISOString(),
        actorId: 'p_lakshmi',
        action: 'ENABLE_CAREGIVER_SHARING',
        details: 'Caregiver sharing enabled for Kiran.',
      },
    ],
  };
}

const defaultVoiceSettings: ReminderVoiceSettings = {
  mode: 'machine',
  useOneForAll: false,
  permissionAgreed: false,
  playSoundOnDue: true,
  sayMedNameAfter: true,
  slots: {
    en: { hasClip: false },
    hi: { hasClip: false },
    te: { hasClip: false },
  },
};

function loadStoreData(): StoreData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialStoreData();
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      Array.isArray(parsed.medications) &&
      Array.isArray(parsed.dose_occurrences)
    ) {
      // Migrate and normalize data
      const data = parsed as StoreData;
      data.profiles = PROFILES;

      if (!Array.isArray(data.consents)) {
        data.consents = [];
      }

      // Ensure Kiran consent exists
      if (!data.consents.some((c) => c.caregiverId === 'c_kiran')) {
        data.consents.push({
          id: 'consent_kiran_1',
          patientId: 'p_lakshmi',
          caregiverId: 'c_kiran',
          granteeRole: 'caregiver',
          enabled: true,
          updatedAt: new Date().toISOString(),
        });
      }

      // Ensure Meera consent exists (OFF by default)
      if (!data.consents.some((c) => c.caregiverId === 'ph_meera')) {
        data.consents.push({
          id: 'consent_meera_1',
          patientId: 'p_lakshmi',
          caregiverId: 'ph_meera',
          granteeRole: 'pharmacist',
          enabled: false,
          updatedAt: new Date().toISOString(),
        });
      }

      if (!Array.isArray(data.pharmacist_notes)) {
        data.pharmacist_notes = [];
      }

      // Ensure medications have pharmacistVerification field
      data.medications = data.medications.map((m) => ({
        ...m,
        pharmacistVerification: m.pharmacistVerification || { status: 'UNVERIFIED' },
      }));

      // Ensure reminder voice settings
      if (!data.reminder_voice_settings) {
        data.reminder_voice_settings = defaultVoiceSettings;
      } else {
        data.reminder_voice_settings = {
          ...defaultVoiceSettings,
          ...data.reminder_voice_settings,
          slots: {
            ...defaultVoiceSettings.slots,
            ...(data.reminder_voice_settings.slots || {}),
          },
        };
      }

      return data;
    }
  } catch (err) {
    console.error('Failed to parse caredose_v1 from localStorage, fallback to defaults:', err);
  }
  return createInitialStoreData();
}

function saveStoreData(data: StoreData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

interface StoreContextType {
  data: StoreData;
  currentProfile: Profile | null;
  activeScreen: ScreenId;
  language: Language;
  t: TranslationDictionary;
  setLanguage: (lang: Language) => void;
  navigateTo: (screen: ScreenId) => void;
  signIn: (profileId: string, pin: string, registrationId?: string) => boolean;
  signOut: () => void;
  recordDose: (occurrenceId: string, status: 'TAKEN' | 'MISSED') => Promise<void>;
  correctDose: (occurrenceId: string, newStatus: 'TAKEN' | 'MISSED') => Promise<void>;
  saveDraftMedication: (draft: Partial<Medication>) => { success: boolean; error?: string };
  deleteDraftMedication: (id: string) => void;
  activateMedication: (draftId: string) => { success: boolean; error?: string };
  toggleCaregiverConsent: (enabled: boolean) => void;
  togglePharmacistConsent: (enabled: boolean) => void;
  verifyMedication: (medicationId: string, status: 'VERIFIED' | 'QUERY', note?: string) => void;
  addPharmacistNote: (patientId: string, text: string, medicationId?: string) => void;
  markPharmacistNoteAsRead: (noteId: string) => void;
  acknowledgeAlert: (alertId: string) => void;
  resetAllData: () => void;
  browserNotificationsAllowed: boolean;
  requestBrowserNotifications: () => Promise<boolean>;
  speakText: (text: string) => { supported: boolean; message?: string };
  dueDosesCount: number;
  lastUpdated: string;
  navigationAlert: string | null;
  clearNavigationAlert: () => void;
  isPharmacistConsentActive: boolean;

  // Custom Reminder Voice Additions
  reminderVoiceSettings: ReminderVoiceSettings;
  updateVoiceSettings: (settings: Partial<ReminderVoiceSettings>) => void;
  uploadVoiceClip: (
    lang: Language,
    file: File
  ) => Promise<{ success: boolean; error?: string; persisted: boolean }>;
  removeVoiceClip: (lang: Language) => Promise<void>;
  playVoicePreview: (lang: Language) => Promise<{ played: boolean; autoplayBlocked: boolean }>;
  stopVoiceAudio: () => void;
  playDoseReminderAudio: (
    medicationName?: string,
    transliterations?: { te?: string; hi?: string }
  ) => Promise<{
    played: boolean;
    autoplayBlocked: boolean;
    voiceType: 'recorded' | 'machine' | 'fallback_machine' | 'none';
    message?: string;
  }>;
  isAudioPlaying: boolean;
  hasUserInteracted: boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<StoreData>(loadStoreData);
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [activeScreen, setActiveScreen] = useState<ScreenId>('signin');
  const [language, setLanguage] = useState<Language>('en');
  const [browserNotificationsAllowed, setBrowserNotificationsAllowed] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>(() => new Date().toISOString());
  const [navigationAlert, setNavigationAlert] = useState<string | null>(null);

  const t = translations[language];

  const clearNavigationAlert = useCallback(() => {
    setNavigationAlert(null);
  }, []);

  const isPharmacistConsentActive = useMemo(() => {
    const consent = data.consents.find((c) => c.caregiverId === 'ph_meera');
    return Boolean(consent?.enabled);
  }, [data.consents]);

  // Sync hash routing with strict role permissions
  const navigateTo = useCallback(
    (screen: ScreenId) => {
      // Check role permissions before navigation
      if (currentProfile?.role === 'pharmacist') {
        const allowedPharmacistScreens: ScreenId[] = [
          'pharmacist-dashboard',
          'pharmacist-patient-detail',
          'settings',
          'signin',
        ];
        if (!allowedPharmacistScreens.includes(screen)) {
          setNavigationAlert(t.accessRestrictedMsg);
          screen = 'pharmacist-dashboard';
        } else if (screen === 'pharmacist-patient-detail' && !isPharmacistConsentActive) {
          setNavigationAlert(t.noPatientsShared);
          screen = 'pharmacist-dashboard';
        }
      } else if (currentProfile?.role === 'caregiver') {
        const allowedCaregiverScreens: ScreenId[] = [
          'caregiver-dashboard',
          'settings',
          'signin',
          'demo-mode',
        ];
        if (!allowedCaregiverScreens.includes(screen)) {
          setNavigationAlert(t.accessRestrictedMsg);
          screen = 'caregiver-dashboard';
        }
      } else if (currentProfile?.role === 'patient') {
        const forbiddenForPatient: ScreenId[] = [
          'caregiver-dashboard',
          'pharmacist-dashboard',
          'pharmacist-patient-detail',
        ];
        if (forbiddenForPatient.includes(screen)) {
          setNavigationAlert(t.accessRestrictedMsg);
          screen = 'today';
        }
      } else if (!currentProfile && screen !== 'demo-mode') {
        screen = 'signin';
      }

      window.location.hash = `#/${screen}`;
      setActiveScreen(screen);
    },
    [currentProfile, isPharmacistConsentActive, t.accessRestrictedMsg, t.noPatientsShared]
  );

  // Handle hash changes and enforce direct links redirection with messages
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      const validScreens: ScreenId[] = [
        'signin',
        'today',
        'prescription-entry',
        'medicines',
        'review-entries',
        'history-report',
        'caregiver-sharing',
        'settings',
        'caregiver-dashboard',
        'demo-mode',
        'pharmacist-dashboard',
        'pharmacist-patient-detail',
      ];

      const targetScreen = validScreens.includes(hash as ScreenId)
        ? (hash as ScreenId)
        : null;

      if (!currentProfile) {
        if (targetScreen === 'demo-mode') {
          setActiveScreen('demo-mode');
        } else {
          setActiveScreen('signin');
          window.location.hash = '#/signin';
        }
        return;
      }

      if (currentProfile.role === 'pharmacist') {
        const allowedPharmacistScreens: ScreenId[] = [
          'pharmacist-dashboard',
          'pharmacist-patient-detail',
          'settings',
          'signin',
        ];
        if (!targetScreen || !allowedPharmacistScreens.includes(targetScreen)) {
          setNavigationAlert(t.accessRestrictedMsg);
          setActiveScreen('pharmacist-dashboard');
          window.location.hash = '#/pharmacist-dashboard';
          return;
        }
        if (targetScreen === 'pharmacist-patient-detail' && !isPharmacistConsentActive) {
          setNavigationAlert(t.noPatientsShared);
          setActiveScreen('pharmacist-dashboard');
          window.location.hash = '#/pharmacist-dashboard';
          return;
        }
        setActiveScreen(targetScreen);
        return;
      }

      if (currentProfile.role === 'caregiver') {
        const allowedCaregiverScreens: ScreenId[] = [
          'caregiver-dashboard',
          'settings',
          'signin',
          'demo-mode',
        ];
        if (!targetScreen || !allowedCaregiverScreens.includes(targetScreen)) {
          setNavigationAlert(t.accessRestrictedMsg);
          setActiveScreen('caregiver-dashboard');
          window.location.hash = '#/caregiver-dashboard';
          return;
        }
        setActiveScreen(targetScreen);
        return;
      }

      if (currentProfile.role === 'patient') {
        const forbiddenPatientScreens: ScreenId[] = [
          'caregiver-dashboard',
          'pharmacist-dashboard',
          'pharmacist-patient-detail',
        ];
        if (targetScreen && forbiddenPatientScreens.includes(targetScreen)) {
          setNavigationAlert(t.accessRestrictedMsg);
          setActiveScreen('today');
          window.location.hash = '#/today';
          return;
        }
        if (targetScreen) {
          setActiveScreen(targetScreen);
        } else {
          setActiveScreen('today');
          window.location.hash = '#/today';
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [currentProfile, isPharmacistConsentActive, t.accessRestrictedMsg, t.noPatientsShared]);

  // Persist to localStorage whenever data changes
  useEffect(() => {
    saveStoreData(data);
  }, [data]);

  // Sync across tabs via window storage event
  useEffect(() => {
    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (
            parsed &&
            Array.isArray(parsed.medications) &&
            Array.isArray(parsed.dose_occurrences)
          ) {
            setData(parsed as StoreData);
            setLastUpdated(new Date().toISOString());
          }
        } catch (err) {
          console.error('Failed to parse updated storage in secondary tab:', err);
        }
      }
    };

    window.addEventListener('storage', handleStorageEvent);
    return () => {
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, []);

  // Rolling occurrences maintenance and unconfirmed alerts check
  const refreshOccurrencesAndAlerts = useCallback(() => {
    const todayStr = getKolkataDateString();
    const nowMs = Date.now();

    setData((prev) => {
      let changed = false;
      let occurrences = [...prev.dose_occurrences];
      let alerts = [...prev.caregiver_alerts];

      // 1. Ensure 7 rolling days of occurrences for all active medications
      for (const med of prev.medications) {
        if (med.state === 'ACTIVE') {
          const newOnes = generateRollingOccurrences(med, todayStr, occurrences);
          if (newOnes.length > 0) {
            occurrences = [...occurrences, ...newOnes];
            changed = true;
          }
        }
      }

      // 2. Check if sharing is enabled
      const consentActive = prev.consents.some((c) => c.enabled);

      // 3. For any pending dose that is now >= 60 min past scheduled time, generate alert if not already alerted
      occurrences.forEach((occ) => {
        const effStatus = getEffectiveStatus(occ, nowMs);
        if (
          consentActive &&
          (effStatus === 'Unconfirmed' || occ.status === 'MISSED')
        ) {
          const med = prev.medications.find((m) => m.id === occ.medicationId);
          const medName = med ? med.name : 'Medication';
          const existingAlert = alerts.find((a) => a.occurrenceId === occ.id);
          if (!existingAlert) {
            alerts.push({
              id: `alert_${occ.id}_${Date.now()}`,
              patientId: 'p_lakshmi',
              occurrenceId: occ.id,
              medicationName: medName,
              scheduledAt: occ.scheduledAt,
              status: occ.status === 'MISSED' ? 'MISSED' : 'UNCONFIRMED',
              acknowledged: false,
              createdAt: new Date().toISOString(),
            });
            changed = true;
          }
        }
      });

      if (!changed) return prev;
      return {
        ...prev,
        dose_occurrences: occurrences,
        caregiver_alerts: alerts,
      };
    });
  }, []);

  // 30 seconds interval for status checks
  useEffect(() => {
    refreshOccurrencesAndAlerts();
    const interval = setInterval(() => {
      refreshOccurrencesAndAlerts();
    }, 30000);
    return () => clearInterval(interval);
  }, [refreshOccurrencesAndAlerts]);

  // Auth actions
  const signIn = useCallback((profileId: string, pin: string, registrationId?: string): boolean => {
    const profile = PROFILES.find((p) => p.id === profileId);
    if (!profile) return false;
    if (profile.pin !== pin) return false;

    // Fictional registration ID requirement for Pharmacist
    if (profile.role === 'pharmacist') {
      const expectedReg = profile.registrationId?.trim().toUpperCase();
      const inputReg = registrationId?.trim().toUpperCase();
      if (!inputReg || inputReg !== expectedReg) {
        return false;
      }
    }

    setCurrentProfile(profile);
    setNavigationAlert(null);

    if (profile.role === 'caregiver') {
      window.location.hash = '#/caregiver-dashboard';
      setActiveScreen('caregiver-dashboard');
    } else if (profile.role === 'pharmacist') {
      window.location.hash = '#/pharmacist-dashboard';
      setActiveScreen('pharmacist-dashboard');
    } else {
      window.location.hash = '#/today';
      setActiveScreen('today');
    }
    return true;
  }, []);

  const signOut = useCallback(() => {
    setCurrentProfile(null);
    window.location.hash = '#/signin';
    setActiveScreen('signin');
  }, []);

  // Record a dose outcome
  const recordDose = useCallback(
    async (occurrenceId: string, status: 'TAKEN' | 'MISSED') => {
      setData((prev) => {
        const occIndex = prev.dose_occurrences.findIndex((o) => o.id === occurrenceId);
        if (occIndex === -1) return prev;

        const currentOcc = prev.dose_occurrences[occIndex];
        const nowIso = new Date().toISOString();
        const updatedOcc: DoseOccurrence = {
          ...currentOcc,
          status,
          recordedAt: nowIso,
        };

        const updatedOccurrences = [...prev.dose_occurrences];
        updatedOccurrences[occIndex] = updatedOcc;

        const med = prev.medications.find((m) => m.id === currentOcc.medicationId);
        const medName = med ? `${med.name} (${med.strength})` : 'Medication';
        const rawMedName = med ? med.name : 'Medication';

        // Log activity
        const newLog: ActivityLogItem = {
          id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          timestamp: nowIso,
          actorId: currentProfile?.id || 'p_lakshmi',
          action: 'RECORD_DOSE',
          details: `Recorded dose for ${medName} as ${status === 'TAKEN' ? 'Taken' : 'Not taken'}.`,
          medicineName: rawMedName,
          newValue: status === 'TAKEN' ? 'Taken' : 'Not taken',
          actionType: status === 'TAKEN' ? 'TAKEN' : 'MISSED',
        };

        // Create alert if missed and sharing active
        const consentActive = prev.consents.some((c) => c.enabled);
        const alerts = [...prev.caregiver_alerts];
        if (status === 'MISSED' && consentActive) {
          alerts.push({
            id: `alert_${currentOcc.id}_${Date.now()}`,
            patientId: 'p_lakshmi',
            occurrenceId: currentOcc.id,
            medicationName: medName,
            scheduledAt: currentOcc.scheduledAt,
            status: 'MISSED',
            acknowledged: false,
            createdAt: nowIso,
          });
        }

        setLastUpdated(nowIso);

        return {
          ...prev,
          dose_occurrences: updatedOccurrences,
          caregiver_alerts: alerts,
          activity_log: [newLog, ...prev.activity_log],
        };
      });
    },
    [currentProfile]
  );

  // Correct a previously recorded dose outcome
  const correctDose = useCallback(
    async (occurrenceId: string, newStatus: 'TAKEN' | 'MISSED') => {
      setData((prev) => {
        const occIndex = prev.dose_occurrences.findIndex((o) => o.id === occurrenceId);
        if (occIndex === -1) return prev;

        const currentOcc = prev.dose_occurrences[occIndex];
        const oldStatus = currentOcc.status;
        const nowIso = new Date().toISOString();

        const updatedOcc: DoseOccurrence = {
          ...currentOcc,
          originalStatus: currentOcc.originalStatus || oldStatus,
          status: newStatus,
          recordedAt: nowIso,
        };

        const updatedOccurrences = [...prev.dose_occurrences];
        updatedOccurrences[occIndex] = updatedOcc;

        const med = prev.medications.find((m) => m.id === currentOcc.medicationId);
        const medName = med ? `${med.name} (${med.strength})` : 'Medication';
        const rawMedName = med ? med.name : 'Medication';

        const prevDisplay =
          oldStatus === 'TAKEN' ? 'Taken' : oldStatus === 'MISSED' ? 'Not taken' : 'Unconfirmed';
        const newDisplay = newStatus === 'TAKEN' ? 'Taken' : 'Not taken';

        // Log correction trail
        const newLog: ActivityLogItem = {
          id: `act_corr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          timestamp: nowIso,
          actorId: currentProfile?.id || 'p_lakshmi',
          action: 'CORRECT_DOSE',
          details: `Corrected outcome for ${medName} from ${prevDisplay} to ${newDisplay}.`,
          medicineName: rawMedName,
          previousValue: prevDisplay,
          newValue: newDisplay,
          actionType: 'CORRECTED',
        };

        setLastUpdated(nowIso);

        return {
          ...prev,
          dose_occurrences: updatedOccurrences,
          activity_log: [newLog, ...prev.activity_log],
        };
      });
    },
    [currentProfile]
  );

  // Save draft medication
  const saveDraftMedication = useCallback(
    (draft: Partial<Medication>): { success: boolean; error?: string } => {
      let result = { success: false, error: undefined as string | undefined };
      setData((prev) => {
        const draftsCount = prev.medications.filter((m) => m.state === 'DRAFT').length;
        if (!draft.id && draftsCount >= 20) {
          result = { success: false, error: 'Maximum 20 drafts allowed.' };
          return prev;
        }

        const nowIso = new Date().toISOString();
        let updatedMeds: Medication[];

        if (draft.id) {
          // Update existing: if a verified medicine's fields later change as a new draft, reset status
          updatedMeds = prev.medications.map((m) => {
            if (m.id === draft.id) {
              return {
                ...m,
                ...draft,
                state: 'DRAFT',
                pharmacistVerification: {
                  status: 'UNVERIFIED',
                },
              } as Medication;
            }
            return m;
          });
        } else {
          // Create new
          const newDraft: Medication = {
            id: `draft_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            patientId: 'p_lakshmi',
            name: draft.name || '',
            strength: draft.strength || '',
            amountPerDose: draft.amountPerDose || '',
            frequencyWording: draft.frequencyWording || '',
            dosesPerDay: draft.dosesPerDay || 1,
            times: draft.times || ['08:00'],
            startDate: draft.startDate || getKolkataDateString(),
            ongoing: draft.ongoing ?? true,
            endDate: draft.endDate,
            instructions: draft.instructions,
            route: draft.route,
            sourceExcerpt: draft.sourceExcerpt,
            state: 'DRAFT',
            reviewFlags: draft.reviewFlags || [],
            pharmacistVerification: {
              status: 'UNVERIFIED',
            },
          };
          updatedMeds = [...prev.medications, newDraft];
        }

        const logItem = {
          id: `act_${Date.now()}`,
          timestamp: nowIso,
          actorId: currentProfile?.id || 'p_lakshmi',
          action: draft.id ? 'UPDATE_DRAFT' : 'CREATE_DRAFT',
          details: `Saved draft prescription: ${draft.name || 'Unnamed'}.`,
        };

        result = { success: true, error: undefined };
        return {
          ...prev,
          medications: updatedMeds,
          activity_log: [logItem, ...prev.activity_log],
        };
      });
      return result;
    },
    [currentProfile]
  );

  // Delete draft medication
  const deleteDraftMedication = useCallback(
    (id: string) => {
      setData((prev) => {
        const med = prev.medications.find((m) => m.id === id);
        if (!med || med.state === 'ACTIVE') return prev;

        const updatedMeds = prev.medications.filter((m) => m.id !== id);
        const logItem = {
          id: `act_${Date.now()}`,
          timestamp: new Date().toISOString(),
          actorId: currentProfile?.id || 'p_lakshmi',
          action: 'DELETE_DRAFT',
          details: `Deleted draft medication: ${med.name}.`,
        };

        return {
          ...prev,
          medications: updatedMeds,
          activity_log: [logItem, ...prev.activity_log],
        };
      });
    },
    [currentProfile]
  );

  // Activate medication
  const activateMedication = useCallback(
    (draftId: string): { success: boolean; error?: string } => {
      let result = { success: false, error: undefined as string | undefined };
      setData((prev) => {
        const activeCount = prev.medications.filter((m) => m.state === 'ACTIVE').length;
        if (activeCount >= 10) {
          result = { success: false, error: 'Maximum limit of 10 active medications reached.' };
          return prev;
        }

        const targetMed = prev.medications.find((m) => m.id === draftId);
        if (!targetMed) {
          result = { success: false, error: 'Draft not found.' };
          return prev;
        }

        const todayStr = getKolkataDateString();
        const activatedMed: Medication = {
          ...targetMed,
          state: 'ACTIVE',
          reviewFlags: [],
        };

        const updatedMeds = prev.medications.map((m) =>
          m.id === draftId ? activatedMed : m
        );

        // Generate 7-day rolling occurrences
        const newOccurrences = generateRollingOccurrences(
          activatedMed,
          todayStr,
          prev.dose_occurrences
        );

        const logItem = {
          id: `act_${Date.now()}`,
          timestamp: new Date().toISOString(),
          actorId: currentProfile?.id || 'p_lakshmi',
          action: 'ACTIVATE_MEDICATION',
          details: `Activated schedule for ${activatedMed.name} (${activatedMed.strength}), ${activatedMed.dosesPerDay} doses/day.`,
        };

        result = { success: true, error: undefined };
        return {
          ...prev,
          medications: updatedMeds,
          dose_occurrences: [...prev.dose_occurrences, ...newOccurrences],
          activity_log: [logItem, ...prev.activity_log],
        };
      });
      return result;
    },
    [currentProfile]
  );

  // Toggle caregiver consent
  const toggleCaregiverConsent = useCallback(
    (enabled: boolean) => {
      setData((prev) => {
        const nowIso = new Date().toISOString();
        const updatedConsents = prev.consents.map((c) =>
          c.caregiverId === 'c_kiran'
            ? { ...c, enabled, updatedAt: nowIso }
            : c
        );

        const logItem: ActivityLogItem = {
          id: `act_${Date.now()}`,
          timestamp: nowIso,
          actorId: currentProfile?.id || 'p_lakshmi',
          action: enabled ? 'ENABLE_CAREGIVER_SHARING' : 'REVOKE_CAREGIVER_SHARING',
          details: `Caregiver sharing for Kiran set to ${enabled ? 'ENABLED' : 'DISABLED'}.`,
        };

        return {
          ...prev,
          consents: updatedConsents,
          activity_log: [logItem, ...prev.activity_log],
        };
      });
    },
    [currentProfile]
  );

  // Toggle pharmacist consent
  const togglePharmacistConsent = useCallback(
    (enabled: boolean) => {
      setData((prev) => {
        const nowIso = new Date().toISOString();
        let found = false;
        const updatedConsents = prev.consents.map((c) => {
          if (c.caregiverId === 'ph_meera') {
            found = true;
            return { ...c, enabled, updatedAt: nowIso };
          }
          return c;
        });

        if (!found) {
          updatedConsents.push({
            id: 'consent_meera_1',
            patientId: 'p_lakshmi',
            caregiverId: 'ph_meera',
            granteeRole: 'pharmacist',
            enabled,
            updatedAt: nowIso,
          });
        }

        const logItem: ActivityLogItem = {
          id: `act_${Date.now()}`,
          timestamp: nowIso,
          actorId: currentProfile?.id || 'p_lakshmi',
          action: enabled ? 'ENABLE_PHARMACIST_SHARING' : 'REVOKE_PHARMACIST_SHARING',
          details: `Pharmacist sharing for Meera set to ${enabled ? 'ENABLED' : 'DISABLED'}.`,
        };

        return {
          ...prev,
          consents: updatedConsents,
          activity_log: [logItem, ...prev.activity_log],
        };
      });
    },
    [currentProfile]
  );

  // Verify medication (Pharmacist action)
  const verifyMedication = useCallback(
    (medicationId: string, status: 'VERIFIED' | 'QUERY', note?: string) => {
      setData((prev) => {
        const med = prev.medications.find((m) => m.id === medicationId);
        if (!med) return prev;

        const nowIso = new Date().toISOString();
        const updatedVerification: PharmacistVerification = {
          status,
          verifiedAt: nowIso,
          pharmacistName: 'Meera',
          pharmacistId: 'ph_meera',
          note: note?.trim() || undefined,
        };

        const updatedMeds = prev.medications.map((m) =>
          m.id === medicationId ? { ...m, pharmacistVerification: updatedVerification } : m
        );

        const logItem: ActivityLogItem = {
          id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          timestamp: nowIso,
          actorId: currentProfile?.id || 'ph_meera',
          action: status === 'VERIFIED' ? 'PHARMACIST_VERIFY' : 'PHARMACIST_QUERY',
          details:
            status === 'VERIFIED'
              ? `Pharmacist Meera marked ${med.name} as verified against prescription.${note ? ` Note: "${note.trim()}"` : ''}`
              : `Pharmacist Meera raised a query on ${med.name}: "${note?.trim() || ''}"`,
          medicineName: med.name,
        };

        let updatedNotes = prev.pharmacist_notes || [];
        if (status === 'QUERY' && note?.trim()) {
          const queryNote: PharmacistNote = {
            id: `note_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            patientId: med.patientId,
            medicationId: med.id,
            medicationName: med.name,
            pharmacistId: 'ph_meera',
            pharmacistName: 'Meera',
            text: `Query regarding ${med.name}: ${note.trim()}`,
            createdAt: nowIso,
            isRead: false,
          };
          updatedNotes = [queryNote, ...updatedNotes];
        }

        return {
          ...prev,
          medications: updatedMeds,
          pharmacist_notes: updatedNotes,
          activity_log: [logItem, ...prev.activity_log],
        };
      });
    },
    [currentProfile]
  );

  // Add general or medicine-specific pharmacist note
  const addPharmacistNote = useCallback(
    (patientId: string, text: string, medicationId?: string) => {
      setData((prev) => {
        const nowIso = new Date().toISOString();
        const med = medicationId ? prev.medications.find((m) => m.id === medicationId) : undefined;
        const newNote: PharmacistNote = {
          id: `note_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          patientId,
          medicationId,
          medicationName: med?.name,
          pharmacistId: 'ph_meera',
          pharmacistName: 'Meera',
          text: text.trim(),
          createdAt: nowIso,
          isRead: false,
        };

        const logItem: ActivityLogItem = {
          id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          timestamp: nowIso,
          actorId: currentProfile?.id || 'ph_meera',
          action: 'PHARMACIST_NOTE',
          details: `Pharmacist Meera added note${med ? ` for ${med.name}` : ''}: "${text.trim()}".`,
          medicineName: med?.name,
        };

        return {
          ...prev,
          pharmacist_notes: [newNote, ...(prev.pharmacist_notes || [])],
          activity_log: [logItem, ...prev.activity_log],
        };
      });
    },
    [currentProfile]
  );

  // Mark pharmacist note as read
  const markPharmacistNoteAsRead = useCallback((noteId: string) => {
    setData((prev) => {
      const updatedNotes = (prev.pharmacist_notes || []).map((n) =>
        n.id === noteId ? { ...n, isRead: true } : n
      );
      return {
        ...prev,
        pharmacist_notes: updatedNotes,
      };
    });
  }, []);

  // Acknowledge caregiver alert
  const acknowledgeAlert = useCallback((alertId: string) => {
    setData((prev) => {
      const updatedAlerts = prev.caregiver_alerts.map((a) =>
        a.id === alertId ? { ...a, acknowledged: true } : a
      );
      return {
        ...prev,
        caregiver_alerts: updatedAlerts,
      };
    });
  }, []);

  // Reset all data to seed defaults
  const resetAllData = useCallback(() => {
    const initial = createInitialStoreData();
    setData(initial);
    saveStoreData(initial);
  }, []);

  // Web notifications
  const requestBrowserNotifications = useCallback(async (): Promise<boolean> => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        const granted = permission === 'granted';
        setBrowserNotificationsAllowed(granted);
        return granted;
      } catch (err) {
        console.error('Notification permission error:', err);
        return false;
      }
    }
    return false;
  }, []);

  // Speech synthesis
  const speakText = useCallback(
    (text: string): { supported: boolean; message?: string } => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        return { supported: false, message: 'Audio is unavailable in this browser.' };
      }

      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language === 'te' ? 'te-IN' : 'en-IN';
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
        return { supported: true };
      } catch (err) {
        console.error('Speech synthesis error:', err);
        return { supported: false, message: 'Audio is unavailable in this browser.' };
      }
    },
    [language]
  );

  // Number of doses currently Due right now
  const dueDosesCount = useMemo(() => {
    const nowMs = Date.now();
    const todayStr = getKolkataDateString();
    return data.dose_occurrences.filter((o) => {
      if (o.status !== 'PENDING') return false;
      if (!o.scheduledAt.startsWith(todayStr)) return false;
      return getEffectiveStatus(o, nowMs) === 'Due';
    }).length;
  }, [data.dose_occurrences]);

  // Audio playing state
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);

  useEffect(() => {
    const unregister = voiceManager.registerOnStop(() => {
      setIsAudioPlaying(false);
    });
    return unregister;
  }, []);

  const reminderVoiceSettings = useMemo(() => {
    return data.reminder_voice_settings || defaultVoiceSettings;
  }, [data.reminder_voice_settings]);

  // Update voice settings (mode, toggles, etc.)
  const updateVoiceSettings = useCallback((partial: Partial<ReminderVoiceSettings>) => {
    setData((prev) => {
      const current = prev.reminder_voice_settings || defaultVoiceSettings;
      const updated: ReminderVoiceSettings = {
        ...current,
        ...partial,
        slots: {
          ...current.slots,
          ...(partial.slots || {}),
        },
      };
      const nextData: StoreData = {
        ...prev,
        reminder_voice_settings: updated,
      };
      saveStoreData(nextData);
      return nextData;
    });
  }, []);

  // Upload an MP3 voice clip for a language slot
  const uploadVoiceClip = useCallback(
    async (
      lang: Language,
      file: File
    ): Promise<{ success: boolean; error?: string; persisted: boolean }> => {
      const val = await validateAudioFile(file);
      if (!val.valid) {
        let errMsg = t.errorAudioRead;
        if (val.error === 'not_mp3') errMsg = t.errorMp3Only;
        else if (val.error === 'too_large') errMsg = t.errorMax3Mb;
        else if (val.error === 'too_long') errMsg = t.errorMax60Sec;
        return { success: false, error: errMsg, persisted: false };
      }

      const saveRes = await saveVoiceClip(lang, file, file.name, val.duration);

      setData((prev) => {
        const current = prev.reminder_voice_settings || defaultVoiceSettings;
        const nextSlots = {
          ...current.slots,
          [lang]: {
            fileName: file.name,
            duration: val.duration,
            hasClip: true,
          },
        };
        const updated: ReminderVoiceSettings = {
          ...current,
          slots: nextSlots,
        };
        const nextData: StoreData = {
          ...prev,
          reminder_voice_settings: updated,
        };
        saveStoreData(nextData);
        return nextData;
      });

      return { success: true, persisted: saveRes.persisted };
    },
    [t]
  );

  // Remove voice clip for a slot
  const removeVoiceClip = useCallback(async (lang: Language) => {
    voiceManager.stop();
    await deleteVoiceClip(lang);
    setData((prev) => {
      const current = prev.reminder_voice_settings || defaultVoiceSettings;
      const nextSlots = {
        ...current.slots,
        [lang]: {
          fileName: undefined,
          duration: undefined,
          hasClip: false,
        },
      };
      const updated: ReminderVoiceSettings = {
        ...current,
        slots: nextSlots,
      };
      const nextData: StoreData = {
        ...prev,
        reminder_voice_settings: updated,
      };
      saveStoreData(nextData);
      return nextData;
    });
  }, []);

  // Play a slot preview
  const playVoicePreview = useCallback(
    async (lang: Language): Promise<{ played: boolean; autoplayBlocked: boolean }> => {
      setIsAudioPlaying(true);
      let clip = await getVoiceClip(lang);

      if (!clip && reminderVoiceSettings.useOneForAll) {
        const langs: Language[] = ['en', 'hi', 'te'];
        for (const l of langs) {
          const c = await getVoiceClip(l);
          if (c) {
            clip = c;
            break;
          }
        }
      }

      if (clip) {
        const res = await voiceManager.playClip(clip.blob, () => {
          setIsAudioPlaying(false);
        });
        if (!res.played) setIsAudioPlaying(false);
        return { played: res.played, autoplayBlocked: res.autoplayBlocked };
      }

      // Default audio fallback /audio/reminder.mp3
      try {
        const res = await voiceManager.playClip('/audio/reminder.mp3', () => {
          setIsAudioPlaying(false);
        });
        if (!res.played) setIsAudioPlaying(false);
        return { played: res.played, autoplayBlocked: res.autoplayBlocked };
      } catch {
        setIsAudioPlaying(false);
        return { played: false, autoplayBlocked: false };
      }
    },
    [reminderVoiceSettings]
  );

  // Stop any audio
  const stopVoiceAudio = useCallback(() => {
    voiceManager.stop();
    setIsAudioPlaying(false);
  }, []);

  // Play dose reminder audio (custom voice, machine voice fallback, or off)
  // NEVER marks dose as Taken
  const playDoseReminderAudio = useCallback(
    async (
      medicationName?: string,
      transliterations?: { te?: string; hi?: string }
    ): Promise<{
      played: boolean;
      autoplayBlocked: boolean;
      voiceType: 'recorded' | 'machine' | 'fallback_machine' | 'none';
      message?: string;
    }> => {
      const settings = reminderVoiceSettings;
      if (settings.mode === 'off') {
        return { played: false, autoplayBlocked: false, voiceType: 'none' };
      }

      const spokenName = medicationName
        ? getSpokenMedicineName(medicationName, transliterations, language)
        : '';

      if (settings.mode === 'machine') {
        setIsAudioPlaying(true);
        const textToSpeak = spokenName
          ? `${spokenName}. ${t.dueNowNotification}`
          : t.dueNowNotification;
        const res = voiceManager.speak(textToSpeak, language, () => {
          setIsAudioPlaying(false);
        });
        if (!res.supported) setIsAudioPlaying(false);
        return {
          played: res.supported,
          autoplayBlocked: false,
          voiceType: 'machine',
          message: res.message,
        };
      }

      // Mode is 'recorded'
      setIsAudioPlaying(true);
      let clip = await getVoiceClip(language);

      if (!clip && settings.useOneForAll) {
        const langs: Language[] = ['en', 'hi', 'te'];
        for (const l of langs) {
          const c = await getVoiceClip(l);
          if (c) {
            clip = c;
            break;
          }
        }
      }

      if (clip) {
        const res = await voiceManager.playClip(clip.blob, () => {
          if (settings.sayMedNameAfter && spokenName) {
            voiceManager.speak(spokenName, language, () => {
              setIsAudioPlaying(false);
            });
          } else {
            setIsAudioPlaying(false);
          }
        });
        if (!res.played) setIsAudioPlaying(false);
        return {
          played: res.played,
          autoplayBlocked: res.autoplayBlocked,
          voiceType: 'recorded',
        };
      }

      // Try default /audio/reminder.mp3 if available
      try {
        const check = await fetch('/audio/reminder.mp3', { method: 'HEAD' });
        if (check.ok) {
          const res = await voiceManager.playClip('/audio/reminder.mp3', () => {
            if (settings.sayMedNameAfter && spokenName) {
              voiceManager.speak(spokenName, language, () => {
                setIsAudioPlaying(false);
              });
            } else {
              setIsAudioPlaying(false);
            }
          });
          if (!res.played) setIsAudioPlaying(false);
          return {
            played: res.played,
            autoplayBlocked: res.autoplayBlocked,
            voiceType: 'recorded',
          };
        }
      } catch {
        // ignore
      }

      // No recorded clip found for language -> Fall back to machine voice and show "No recorded voice for this language."
      const textToSpeak = spokenName
        ? `${spokenName}. ${t.dueNowNotification}`
        : t.dueNowNotification;
      const res = voiceManager.speak(textToSpeak, language, () => {
        setIsAudioPlaying(false);
      });
      if (!res.supported) setIsAudioPlaying(false);

      return {
        played: true,
        autoplayBlocked: false,
        voiceType: 'fallback_machine',
        message: t.noRecordedVoiceForLang,
      };
    },
    [reminderVoiceSettings, language, t]
  );

  return (
    <StoreContext.Provider
      value={{
        data,
        currentProfile,
        activeScreen,
        language,
        t,
        setLanguage,
        navigateTo,
        signIn,
        signOut,
        recordDose,
        correctDose,
        saveDraftMedication,
        deleteDraftMedication,
        activateMedication,
        toggleCaregiverConsent,
        togglePharmacistConsent,
        verifyMedication,
        addPharmacistNote,
        markPharmacistNoteAsRead,
        acknowledgeAlert,
        resetAllData,
        browserNotificationsAllowed,
        requestBrowserNotifications,
        speakText,
        dueDosesCount,
        lastUpdated,
        navigationAlert,
        clearNavigationAlert,
        isPharmacistConsentActive,
        reminderVoiceSettings,
        updateVoiceSettings,
        uploadVoiceClip,
        removeVoiceClip,
        playVoicePreview,
        stopVoiceAudio,
        playDoseReminderAudio,
        isAudioPlaying,
        hasUserInteracted: voiceManager.hasInteracted,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = (): StoreContextType => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
