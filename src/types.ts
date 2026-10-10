export type UserRole = 'patient' | 'caregiver' | 'pharmacist';

export interface Profile {
  id: string;
  name: string;
  role: UserRole;
  pin: string;
  registrationId?: string; // Fictional registration ID for pharmacists e.g. PHARM-DEMO-0001
}

export type MedicationState = 'DRAFT' | 'ACTIVE';

export type PharmacistVerificationStatus = 'UNVERIFIED' | 'VERIFIED' | 'QUERY';

export interface PharmacistVerification {
  status: PharmacistVerificationStatus;
  verifiedAt?: string; // ISO string
  pharmacistName?: string; // e.g. "Meera"
  pharmacistId?: string;
  note?: string; // Optional note if verified, or required reason if query
}

export interface PharmacistNote {
  id: string;
  patientId: string;
  medicationId?: string; // Specific medicine id or undefined for general note
  medicationName?: string;
  pharmacistId: string;
  pharmacistName: string;
  text: string;
  createdAt: string; // ISO string
  isRead: boolean; // Patient can mark as read
}

export interface Medication {
  id: string;
  patientId: string;
  name: string;
  strength: string;
  amountPerDose: string;
  frequencyWording: string;
  dosesPerDay: number; // 1 - 6
  times: string[]; // ['08:00', '20:00'] unique
  startDate: string; // YYYY-MM-DD
  ongoing: boolean;
  endDate?: string; // YYYY-MM-DD
  instructions?: string;
  route?: string;
  sourceExcerpt?: string;
  state: MedicationState;
  reviewFlags: string[];
  nameTransliterations?: {
    te?: string;
    hi?: string;
  };
  pharmacistVerification?: PharmacistVerification;
}

export type DoseStatus = 'PENDING' | 'TAKEN' | 'MISSED' | 'UNCONFIRMED' | 'CANCELLED';

// Display classification for PENDING doses
export type EffectiveStatus = 'Upcoming' | 'Due' | 'Unconfirmed' | 'Taken' | 'Missed' | 'Cancelled';

export interface DoseOccurrence {
  id: string;
  medicationId: string;
  scheduledAt: string; // ISO string e.g. 2026-10-10T08:00:00+05:30
  status: DoseStatus;
  recordedAt?: string;
  originalStatus?: DoseStatus; // For correction trail
  isSimulated?: boolean;
}

export interface Consent {
  id: string;
  patientId: string;
  caregiverId: string; // 'c_kiran' or 'ph_meera'
  granteeRole?: 'caregiver' | 'pharmacist';
  enabled: boolean;
  updatedAt: string;
}

export interface CaregiverAlert {
  id: string;
  patientId: string;
  occurrenceId: string;
  medicationName: string;
  scheduledAt: string;
  status: 'MISSED' | 'UNCONFIRMED';
  acknowledged: boolean;
  createdAt: string;
}

export interface ActivityLogItem {
  id: string;
  timestamp: string;
  actorId: string;
  action: string;
  details: string;
  medicineName?: string;
  previousValue?: string;
  newValue?: string;
  actionType?: 'TAKEN' | 'MISSED' | 'CORRECTED' | 'OTHER';
}

export type ReminderVoiceMode = 'recorded' | 'machine' | 'off';

export interface VoiceSlotMeta {
  fileName?: string;
  duration?: number;
  hasClip: boolean;
}

export interface ReminderVoiceSettings {
  mode: ReminderVoiceMode;
  useOneForAll: boolean;
  permissionAgreed: boolean;
  playSoundOnDue: boolean;
  sayMedNameAfter: boolean;
  slots: {
    en: VoiceSlotMeta;
    hi: VoiceSlotMeta;
    te: VoiceSlotMeta;
  };
}

export interface StoreData {
  profiles: Profile[];
  medications: Medication[];
  dose_occurrences: DoseOccurrence[];
  consents: Consent[];
  caregiver_alerts: CaregiverAlert[];
  pharmacist_notes?: PharmacistNote[];
  activity_log: ActivityLogItem[];
  reminder_voice_settings?: ReminderVoiceSettings;
}

export type Language = 'en' | 'hi' | 'te';

export type ScreenId =
  | 'signin'
  | 'today'
  | 'prescription-entry'
  | 'medicines'
  | 'review-entries'
  | 'history-report'
  | 'caregiver-sharing'
  | 'settings'
  | 'caregiver-dashboard'
  | 'demo-mode'
  | 'pharmacist-dashboard'
  | 'pharmacist-patient-detail';

export interface ExtractedPrescriptionItem {
  name: string | null;
  strength: string | null;
  amountPerDose: string | null;
  frequencyWording: string | null;
  instructions: string | null;
  route: string | null;
  sourceExcerpt: string | null;
}
