export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'te', label: 'తెలుగు' },
] as const;

export type Language = (typeof LANGUAGES)[number]['code'];

export interface TranslationDictionary {
  // App & Common
  appName: string;
  appSubtitle: string;
  bannerDisclaimer: string;
  fictionalDemoBadge: string;
  save: string;
  saving: string;
  saved: string;
  cancel: string;
  delete: string;
  edit: string;
  close: string;
  confirm: string;
  back: string;
  next: string;
  actions: string;
  status: string;
  date: string;
  time: string;
  navigation: string;
  language: string;
  role: string;
  logout: string;
  logoutConfirm: string;
  loading: string;
  empty: string;
  error: string;
  simulatedRecord: string;
  strengthNotSpecified: string;
  amountNotSpecified: string;
  lastUpdatedLabel: string;

  // Status Chips & Dose classifications
  statusUpcoming: string;
  statusDue: string;
  statusTaken: string;
  statusMissed: string;
  statusUnconfirmed: string;
  statusCancelled: string;

  // Navigation Items
  navSignIn: string;
  navToday: string;
  navPrescriptionEntry: string;
  navMedicines: string;
  navReviewEntries: string;
  navHistoryReport: string;
  navCaregiverSharing: string;
  navCaregiverDashboard: string;
  navSettings: string;
  navDemoMode: string;

  // Sign in Screen
  signInTitle: string;
  signInSubtitle: string;
  selectAccount: string;
  patientAccount: string;
  caregiverAccount: string;
  enterPin: string;
  pinPlaceholder: string;
  signInButton: string;
  pinError: string;
  selectProfileFirst: string;
  pinHelp: string;

  // Today Screen
  todayTitle: string;
  todaySubtitle: string;
  nextDoseCardTitle: string;
  noUpcomingDoses: string;
  allDosesRecorded: string;
  takeButton: string;
  notTakenButton: string;
  changeOutcome: string;
  futureDoseExplanation: string;
  dueNowNotification: string;
  listenReminder: string;
  audioMachineNotice: string;
  audioUnavailable: string;
  summaryTakenCount: string;
  summaryPendingCount: string;
  summaryMissedCount: string;
  summaryUnconfirmedCount: string;

  // Prescription Entry Screen
  rxEntryTitle: string;
  rxEntrySubtitle: string;
  tabManual: string;
  tabUpload: string;
  formErrorsSummary: string;
  fieldMedName: string;
  fieldMedNamePlaceholder: string;
  fieldStrength: string;
  fieldStrengthPlaceholder: string;
  fieldAmountPerDose: string;
  fieldAmountPlaceholder: string;
  fieldFrequencyWording: string;
  fieldFrequencyPlaceholder: string;
  fieldDosesPerDay: string;
  fieldTimes: string;
  fieldStartDate: string;
  fieldEndCondition: string;
  fieldOngoing: string;
  fieldEndDate: string;
  fieldInstructions: string;
  fieldInstructionsPlaceholder: string;
  fieldRoute: string;
  fieldRoutePlaceholder: string;
  fieldTeluguTransliteration: string;
  fieldHindiTransliteration: string;
  autoConvertedNotice: string;
  confirmTransliterationNotice: string;
  buttonSaveDraft: string;
  buttonReviewActivate: string;
  uploadPrompt: string;
  uploadButton: string;
  uploadHint: string;
  loadSamplePrescription: string;
  extractingImage: string;
  extractionError: string;
  enterManuallyLink: string;
  imageThumbnailAlt: string;

  // Review & Activate Dialog
  reviewDialogTitle: string;
  reviewDialogNotice: string;
  checkboxConfirmPrescription: string;
  buttonActivateNow: string;
  activatedSuccess: string;
  maxActiveReached: string;
  maxDraftsReached: string;

  // Medicines & Review Entries Screens
  medicinesTitle: string;
  medicinesSubtitle: string;
  reviewEntriesTitle: string;
  reviewEntriesSubtitle: string;
  activeMedicinesHeading: string;
  draftMedicinesHeading: string;
  noActiveMeds: string;
  noDraftMeds: string;
  needsReviewBadge: string;
  readOnlyNotice: string;
  deleteDraftConfirm: string;

  // History & Report Screen
  historyTitle: string;
  historySubtitle: string;
  reportPeriod7Days: string;
  confirmedTakenRate: string;
  confirmedTakenExplanation: string;
  followUpDoctorAdvice: string;
  historyTableHeading: string;
  correctionTrailHeading: string;
  originalStatusLabel: string;
  updatedStatusLabel: string;
  correctedAtLabel: string;
  noHistoryData: string;
  noCorrectionsRecorded: string;
  reportRangeToday: string;
  reportRange7Days: string;
  reportRange30Days: string;
  chartViewAsTable: string;
  chartHideTable: string;
  todayInProgressLabel: string;

  // Caregiver Sharing & Dashboard
  sharingTitle: string;
  sharingSubtitle: string;
  sharingExplanation: string;
  enableSharingButton: string;
  revokeSharingButton: string;
  confirmSharingChange: string;
  sharingActiveBanner: string;
  sharingInactiveBanner: string;
  dashboardTitle: string;
  dashboardSubtitle: string;
  sharingNotEnabledNotice: string;
  caregiverAlertsHeading: string;
  noAlertsInbox: string;
  alertAcknowledgeButton: string;
  alertAcknowledged: string;
  alertAcknowledgeNotice: string;
  patientTodaySummary: string;

  // Settings
  settingsTitle: string;
  settingsSubtitle: string;
  languageSection: string;
  teluguReviewNote: string;
  hindiReviewNote: string;
  notificationsSection: string;
  browserNotificationsToggle: string;
  browserNotificationsActive: string;
  browserNotificationsDenied: string;
  backgroundPushNotice: string;
  writtenScheduleAlwaysAvailable: string;
  accountDetailsSection: string;
  loggedOutNotice: string;

  // Demo Mode
  demoTitle: string;
  demoSubtitle: string;
  demoClockControls: string;
  simulatedTimeLabel: string;
  advance15Min: string;
  advance1Hour: string;
  advanceNextDay: string;
  resetClock: string;
  resetDemoData: string;
  demoSeedSummary: string;
  demoIsolationNote: string;
  demoHistoryTab: string;
  demoCaregiverTab: string;

  // Pharmacist & Sharing & Access additions
  navPharmacistDashboard: string;
  navPatientDetail: string;
  navSharingAccess: string;
  pharmacistAccount: string;
  regIdLabel: string;
  regIdPlaceholder: string;
  regIdHelp: string;
  regIdError: string;
  statusUnverified: string;
  statusVerifiedBy: string;
  statusQuery: string;
  verifiedDisclaimer: string;
  pharmacistNoteDisclaimer: string;
  markVerifiedBtn: string;
  raiseQueryBtn: string;
  verifyCheckboxLabel: string;
  optionalVerificationNote: string;
  queryNoteLabel: string;
  queryNotePlaceholder: string;
  pharmacistCannotEditNotice: string;
  pharmacistNotesHeading: string;
  noPharmacistNotes: string;
  markAsRead: string;
  read: string;
  sendNoteToPatient: string;
  noteForMedicine: string;
  generalNoteAllMedicines: string;
  enterNotePlaceholder: string;
  noteAddedSuccess: string;
  pharmacistDashboardTitle: string;
  pharmacistDashboardSubtitle: string;
  noPatientsShared: string;
  noPatientsSharedDesc: string;
  patientDetailTitle: string;
  patientDetailSubtitle: string;
  activeMedicinesCountLabel: string;
  unverifiedMedicinesCountLabel: string;
  openQueriesCountLabel: string;
  viewPatientDetailsBtn: string;
  backToDashboard: string;
  pharmacistSharingTitle: string;
  pharmacistSharingSubtitle: string;
  pharmacistSharingActive: string;
  pharmacistSharingInactive: string;
  enablePharmacistSharing: string;
  revokePharmacistSharing: string;
  pharmacistCanSee: string;
  pharmacistCannotDo: string;
  confirmPharmacistSharingChange: string;
  confirmPharmacistEnableMsg: string;
  confirmPharmacistRevokeMsg: string;
  accessRestrictedMsg: string;

  // Voice reminder additions
  reminderVoiceCardTitle: string;
  reminderVoiceSubtitle: string;
  voiceModeRecorded: string;
  voiceModeMachine: string;
  voiceModeOff: string;
  useOneForAllLangs: string;
  voicePermissionCheckbox: string;
  permissionRequiredNotice: string;
  chooseFile: string;
  playPreview: string;
  stopPreview: string;
  replaceFile: string;
  removeFile: string;
  durationLabel: string;
  noFileUploaded: string;
  testVoiceButton: string;
  playSoundWhenDueToggle: string;
  sayMedNameAfterToggle: string;
  indexedDbUnavailableNotice: string;
  errorMp3Only: string;
  errorMax3Mb: string;
  errorMax60Sec: string;
  errorAudioRead: string;
  labelRecordedVoice: string;
  labelMachineVoice: string;
  noRecordedVoiceForLang: string;
  tapToPlayReminder: string;
  playingVoice: string;

  // Reset section
  resetSection: string;
  resetDescription: string;
  resetButton: string;
  resetConfirmTitle: string;
  resetConfirmWarning: string;
  resetConfirmAction: string;
}

const en: TranslationDictionary = {
  appName: 'CareDose',
  appSubtitle: 'Prescription Schedule Notebook',
  bannerDisclaimer: 'Fictional demonstration data. Not medical advice.',
  fictionalDemoBadge: 'Fictional demonstration',
  save: 'Save',
  saving: 'Saving...',
  saved: 'Saved',
  cancel: 'Cancel',
  delete: 'Delete',
  edit: 'Edit',
  close: 'Close',
  confirm: 'Confirm',
  back: 'Back',
  next: 'Next',
  actions: 'Actions',
  status: 'Status',
  date: 'Date',
  time: 'Time',
  navigation: 'Navigation',
  language: 'Language',
  role: 'Role',
  logout: 'Sign out',
  logoutConfirm: 'Are you sure you want to sign out?',
  loading: 'Loading...',
  empty: 'No items to display.',
  error: 'An error occurred.',
  simulatedRecord: 'Simulated',
  strengthNotSpecified: 'Strength not specified',
  amountNotSpecified: 'Amount not specified',
  lastUpdatedLabel: 'Last updated',

  statusUpcoming: 'Upcoming',
  statusDue: 'Due',
  statusTaken: 'Taken',
  statusMissed: 'Missed',
  statusUnconfirmed: 'Unconfirmed',
  statusCancelled: 'Cancelled',

  navSignIn: 'Sign in',
  navToday: 'Today',
  navPrescriptionEntry: 'Prescription Entry',
  navMedicines: 'Medicines',
  navReviewEntries: 'Review Entries',
  navHistoryReport: 'History & Report',
  navCaregiverSharing: 'Sharing & Access',
  navCaregiverDashboard: 'Caregiver Dashboard',
  navSettings: 'Settings',
  navDemoMode: 'Demo Mode',

  signInTitle: 'Welcome to CareDose',
  signInSubtitle: 'Please select your profile and enter your 4-digit PIN',
  selectAccount: 'Select Profile',
  patientAccount: 'Lakshmi (Patient)',
  caregiverAccount: 'Kiran (Caregiver)',
  enterPin: 'Enter 4-digit PIN',
  pinPlaceholder: '••••',
  signInButton: 'Sign in',
  pinError: 'Incorrect PIN. Please try again.',
  selectProfileFirst: 'Please select a profile to continue.',
  pinHelp: 'Pre-set demo credentials: Lakshmi (1234), Kiran (5678), Meera (9012 & Reg ID: PHARM-DEMO-0001)',

  todayTitle: 'Today’s Schedule',
  todaySubtitle: 'Times are shown in Asia/Kolkata timezone',
  nextDoseCardTitle: 'Next Scheduled Dose',
  noUpcomingDoses: 'No more upcoming doses scheduled for today.',
  allDosesRecorded: 'All scheduled doses for today have been recorded.',
  takeButton: 'Taken',
  notTakenButton: 'Not taken',
  changeOutcome: 'Change outcome',
  futureDoseExplanation: 'Dose recording unlocks when the scheduled time arrives.',
  dueNowNotification: 'Dose is now due according to your written schedule.',
  listenReminder: 'Listen',
  audioMachineNotice: 'Machine voice, not reviewed.',
  audioUnavailable: 'Audio is unavailable in this browser.',
  summaryTakenCount: 'Taken',
  summaryPendingCount: 'Upcoming / Due',
  summaryMissedCount: 'Not taken',
  summaryUnconfirmedCount: 'Unconfirmed',

  rxEntryTitle: 'Prescription Entry',
  rxEntrySubtitle: 'Accurately record your doctor’s prescription details',
  tabManual: 'Manual entry',
  tabUpload: 'Upload image',
  formErrorsSummary: 'Please address the following items before proceeding:',
  fieldMedName: 'Medicine name',
  fieldMedNamePlaceholder: 'e.g., Metformin',
  fieldStrength: 'Strength',
  fieldStrengthPlaceholder: 'e.g., 500 mg',
  fieldAmountPerDose: 'Amount per dose',
  fieldAmountPlaceholder: 'e.g., 1 tablet',
  fieldFrequencyWording: 'Prescribed frequency wording',
  fieldFrequencyPlaceholder: 'e.g., Twice daily after food',
  fieldDosesPerDay: 'Doses per day (1 to 6)',
  fieldTimes: 'Scheduled dose times',
  fieldStartDate: 'Start date',
  fieldEndCondition: 'Duration condition',
  fieldOngoing: 'Ongoing (regular treatment)',
  fieldEndDate: 'Specific end date',
  fieldInstructions: 'Instructions (optional)',
  fieldInstructionsPlaceholder: 'e.g., Take with a full glass of water',
  fieldRoute: 'Route (optional)',
  fieldRoutePlaceholder: 'e.g., Oral',
  fieldTeluguTransliteration: 'Telugu script spelling (optional)',
  fieldHindiTransliteration: 'Hindi script spelling (optional)',
  autoConvertedNotice: 'Auto-converted script, please check',
  confirmTransliterationNotice: 'I verified the regional language spelling against the prescription',
  buttonSaveDraft: 'Save as Draft',
  buttonReviewActivate: 'Review & Activate',
  uploadPrompt: 'Upload a clear photo of your prescription (JPEG or PNG, up to 5 MB)',
  uploadButton: 'Choose prescription image',
  uploadHint: 'Image extraction creates editable drafts with review flags. AI output never activates automatically.',
  loadSamplePrescription: 'Load fictional sample prescription',
  extractingImage: 'Reading prescription details...',
  extractionError: 'Could not read the image. You can enter the medicine manually.',
  enterManuallyLink: 'Switch to Manual entry',
  imageThumbnailAlt: 'Prescription photo preview',

  reviewDialogTitle: 'Review & Activate Prescription',
  reviewDialogNotice: 'Please verify every field carefully against your printed doctor prescription before activating. Active prescriptions cannot be edited.',
  checkboxConfirmPrescription: 'I checked this against my prescription',
  buttonActivateNow: 'Activate Schedule',
  activatedSuccess: 'Medication schedule activated successfully.',
  maxActiveReached: 'Maximum limit of 10 active medications reached.',
  maxDraftsReached: 'Maximum limit of 20 draft medications reached.',

  medicinesTitle: 'My Medicines',
  medicinesSubtitle: 'Overview of all active treatments and saved drafts',
  reviewEntriesTitle: 'Review Entries',
  reviewEntriesSubtitle: 'Draft prescriptions awaiting your confirmation',
  activeMedicinesHeading: 'Active Medication Schedules',
  draftMedicinesHeading: 'Draft Prescriptions (Needs Review)',
  noActiveMeds: 'No active medications yet. Enter a prescription to get started.',
  noDraftMeds: 'No draft prescriptions pending review.',
  needsReviewBadge: 'Needs review',
  readOnlyNotice: 'Active schedule is read-only. Medical dose details are strictly locked.',
  deleteDraftConfirm: 'Are you sure you want to delete this draft?',

  historyTitle: 'History & Report',
  historySubtitle: 'Self-reported medication intake log for completed days and today',
  reportPeriod7Days: 'Selected Period Summary',
  confirmedTakenRate: 'Confirmed taken percentage',
  confirmedTakenExplanation: 'Calculated as: Taken / (Taken + Not taken + Unconfirmed), excluding pending doses.',
  followUpDoctorAdvice: 'Share this record with your doctor or pharmacist.',
  historyTableHeading: 'Daily Intake Log',
  correctionTrailHeading: 'Outcome Corrections Audit Trail',
  originalStatusLabel: 'Original Record',
  updatedStatusLabel: 'Corrected Record',
  correctedAtLabel: 'Corrected At',
  noHistoryData: 'No completed day records yet.',
  noCorrectionsRecorded: 'No outcome corrections have been made.',
  reportRangeToday: 'Today',
  reportRange7Days: 'Last 7 days',
  reportRange30Days: 'Last 30 days',
  chartViewAsTable: 'View as table',
  chartHideTable: 'Hide table',
  todayInProgressLabel: 'Today (in progress)',

  sharingTitle: 'Caregiver Sharing',
  sharingSubtitle: 'Allow Kiran to view today’s dose status and missed dose alerts',
  sharingExplanation: 'When enabled, caregiver Kiran can see whether scheduled doses were taken, not taken, or unconfirmed. You can revoke this permission at any moment.',
  enableSharingButton: 'Enable Kiran’s Access',
  revokeSharingButton: 'Revoke Kiran’s Access',
  confirmSharingChange: 'Confirm update to caregiver sharing permissions?',
  sharingActiveBanner: 'Sharing is active. Kiran can see today’s dose counts and alerts.',
  sharingInactiveBanner: 'Sharing is disabled. Kiran cannot see your medication data.',
  dashboardTitle: 'Caregiver Dashboard',
  dashboardSubtitle: 'Real-time intake alerts and today’s schedule for Lakshmi',
  sharingNotEnabledNotice: 'Sharing is not enabled by the patient.',
  caregiverAlertsHeading: 'Attention Required: Missed / Unconfirmed Alerts',
  noAlertsInbox: 'No outstanding alerts. All scheduled doses are up to date.',
  alertAcknowledgeButton: 'Acknowledge',
  alertAcknowledged: 'Acknowledged',
  alertAcknowledgeNotice: 'Acknowledging an alert indicates you have seen it; it does not alter the patient’s intake log.',
  patientTodaySummary: 'Patient Today Status',

  settingsTitle: 'Settings',
  settingsSubtitle: 'Application preferences, language and notifications',
  languageSection: 'Language / भाषा / భాష',
  teluguReviewNote: 'Telugu text needs human review.',
  hindiReviewNote: 'Hindi text needs human review.',
  notificationsSection: 'In-App & Browser Reminders',
  browserNotificationsToggle: 'Enable browser notifications while tab is open',
  browserNotificationsActive: 'Browser notifications are permitted.',
  browserNotificationsDenied: 'Browser notifications were denied in your browser settings.',
  backgroundPushNotice: 'Background push is not part of this version. Reminders operate only while the browser window is open.',
  writtenScheduleAlwaysAvailable: 'Your written prescription timetable is always available offline.',
  accountDetailsSection: 'Active Account',
  loggedOutNotice: 'You have signed out.',

  demoTitle: 'Demonstration Mode',
  demoSubtitle: 'Isolated sandbox environment with simulated clock and fixture data',
  demoClockControls: 'Simulated Clock Controls',
  simulatedTimeLabel: 'Simulated Time (Asia/Kolkata)',
  advance15Min: '+15 min',
  advance1Hour: '+1 hour',
  advanceNextDay: 'Next day',
  resetClock: 'Reset clock to current time',
  resetDemoData: 'Reset demo data',
  demoSeedSummary: 'Seed fixture: 6 doses per day for 7 completed days (42 occurrences: exactly 36 Taken, 3 Missed, 3 Unconfirmed = 85.7% Confirmed taken).',
  demoIsolationNote: 'Demo mode uses a completely independent state. Changes and time shifts here never affect your real data or login.',
  demoHistoryTab: 'Demo 7-Day Report',
  demoCaregiverTab: 'Demo Caregiver View',

  // Pharmacist & Sharing & Access additions
  navPharmacistDashboard: 'Pharmacist Dashboard',
  navPatientDetail: 'Patient Detail',
  navSharingAccess: 'Sharing & Access',
  pharmacistAccount: 'Meera (Pharmacist)',
  regIdLabel: 'Registration ID',
  regIdPlaceholder: 'PHARM-DEMO-0001',
  regIdHelp: 'Fictional demo registration ID: PHARM-DEMO-0001',
  regIdError: 'Incorrect PIN or Registration ID. Please check your credentials.',
  statusUnverified: 'Not yet reviewed by a pharmacist',
  statusVerifiedBy: 'Verified by pharmacist Meera on',
  statusQuery: 'Pharmacist query:',
  verifiedDisclaimer: 'Verified means only that a pharmacist confirmed this matches the prescription they were shown.',
  pharmacistNoteDisclaimer: 'Note from pharmacist. This is not a change to your prescription.',
  markVerifiedBtn: 'Mark as verified against prescription',
  raiseQueryBtn: 'Raise a query',
  verifyCheckboxLabel: 'I confirm this entry matches the physical or uploaded prescription shown to me',
  optionalVerificationNote: 'Verification note (optional)',
  queryNoteLabel: 'Clinical query or clarification reason (required)',
  queryNotePlaceholder: 'Describe the query or discrepancy for patient clarification...',
  pharmacistCannotEditNotice: 'Pharmacists cannot edit prescription fields, record or change doses, or activate entries.',
  pharmacistNotesHeading: 'Pharmacist Notes',
  noPharmacistNotes: 'No notes from pharmacist yet.',
  markAsRead: 'Mark as read',
  read: 'Read',
  sendNoteToPatient: 'Send note to patient',
  noteForMedicine: 'Medicine',
  generalNoteAllMedicines: 'General note (all medicines)',
  enterNotePlaceholder: 'Write an advisory note or instruction regarding prescriptions...',
  noteAddedSuccess: 'Pharmacist note has been sent to the patient.',
  pharmacistDashboardTitle: 'Pharmacist Dashboard',
  pharmacistDashboardSubtitle: 'Review prescriptions and adherence for patients who shared access',
  noPatientsShared: 'No patients have shared access with you.',
  noPatientsSharedDesc: 'Patients must grant consent from their Sharing & Access screen before their records appear here.',
  patientDetailTitle: 'Patient Medication Notebook',
  patientDetailSubtitle: 'Clinical review of active schedules, drafts, adherence history, and audit log',
  activeMedicinesCountLabel: 'Active Medicines',
  unverifiedMedicinesCountLabel: 'Unverified Medicines',
  openQueriesCountLabel: 'Open Queries',
  viewPatientDetailsBtn: 'View Patient Details & Medication Review',
  backToDashboard: 'Back to Pharmacist Dashboard',
  pharmacistSharingTitle: 'Pharmacist Meera',
  pharmacistSharingSubtitle: 'Clinical prescription verification and advice',
  pharmacistSharingActive: 'Sharing is active. Pharmacist Meera can review prescriptions, adherence reports, and leave notes.',
  pharmacistSharingInactive: 'Sharing is turned off. Pharmacist Meera cannot view any patient data.',
  enablePharmacistSharing: 'Grant access to Meera',
  revokePharmacistSharing: 'Revoke Meera’s access',
  pharmacistCanSee: 'What Meera CAN see:',
  pharmacistCannotDo: 'What Meera CANNOT do:',
  confirmPharmacistSharingChange: 'Confirm Pharmacist Sharing Permission',
  confirmPharmacistEnableMsg: 'Allow pharmacist Meera to review prescriptions, adherence reports, and leave verification notes?',
  confirmPharmacistRevokeMsg: 'Revoke pharmacist Meera’s access? Meera will instantly lose access to all patient records.',
  accessRestrictedMsg: 'Access restricted: You do not have permission to view that screen and have been returned to your dashboard.',

  // Voice reminder additions
  reminderVoiceCardTitle: 'Reminder Voice',
  reminderVoiceSubtitle: 'Personalize the voice prompt for dose reminders with your own recorded audio or browser speech.',
  voiceModeRecorded: 'My recorded voice (MP3)',
  voiceModeMachine: 'Machine voice (browser)',
  voiceModeOff: 'Off',
  useOneForAllLangs: 'Use one file for all languages',
  voicePermissionCheckbox: 'This is my own voice, or I have the speaker’s permission to use it.',
  permissionRequiredNotice: 'Please confirm speaker permission before uploading audio.',
  chooseFile: 'Choose file',
  playPreview: 'Play preview',
  stopPreview: 'Stop preview',
  replaceFile: 'Replace file',
  removeFile: 'Remove',
  durationLabel: 'Duration',
  noFileUploaded: 'No audio file uploaded yet.',
  testVoiceButton: 'Test my voice',
  playSoundWhenDueToggle: 'Play sound when a dose is due',
  sayMedNameAfterToggle: 'Say the medicine name after the recording',
  indexedDbUnavailableNotice: 'IndexedDB is unavailable. Audio will remain in memory for this session and will not persist across reloads.',
  errorMp3Only: 'Only MP3 files (.mp3) are supported.',
  errorMax3Mb: 'File is too large. Maximum size is 3 MB.',
  errorMax60Sec: 'Recording duration exceeds 60 seconds (max 60 seconds allowed).',
  errorAudioRead: 'Could not read audio file. Please check that it is a valid MP3.',
  labelRecordedVoice: 'Your recorded voice',
  labelMachineVoice: 'Machine voice, not reviewed',
  noRecordedVoiceForLang: 'No recorded voice for this language.',
  tapToPlayReminder: 'Tap to play reminder',
  playingVoice: 'Playing reminder voice...',

  // Reset section
  resetSection: 'Reset Application Data',
  resetDescription: 'Reset all schedules, taken doses, drafts, and consents back to the initial sample state.',
  resetButton: 'Reset to default demo data',
  resetConfirmTitle: 'Are you sure you want to reset all data?',
  resetConfirmWarning: 'This will overwrite all recorded doses and draft changes with the original demonstration schedule.',
  resetConfirmAction: 'Yes, Reset Everything',
};

const hi: TranslationDictionary = {
  appName: 'केयरडोज़ (CareDose)',
  appSubtitle: 'प्रिस्क्रिप्शन शेड्यूल नोटबुक',
  bannerDisclaimer: 'काल्पनिक प्रदर्शन डेटा। यह चिकित्सीय सलाह नहीं है।',
  fictionalDemoBadge: 'काल्पनिक प्रदर्शन',
  save: 'सहेजें',
  saving: 'सहेजा जा रहा है...',
  saved: 'सहेजा गया',
  cancel: 'रद्द करें',
  delete: 'हटाएं',
  edit: 'संपादित करें',
  close: 'बंद करें',
  confirm: 'पुष्टि करें',
  back: 'पीछे',
  next: 'आगे',
  actions: 'कार्रवाई',
  status: 'स्थिति',
  date: 'तारीख',
  time: 'समय',
  navigation: 'नेविगेशन मेनू',
  language: 'भाषा',
  role: 'भूमिका',
  logout: 'साइन आउट करें',
  logoutConfirm: 'क्या आप वास्तव में साइन आउट करना चाहते हैं?',
  loading: 'लोड हो रहा है...',
  empty: 'दिखाने के लिए कोई प्रविष्टि नहीं है।',
  error: 'एक त्रुटि हुई।',
  simulatedRecord: 'सिम्युलेटेड',
  strengthNotSpecified: 'दवा की शक्ति निर्दिष्ट नहीं है',
  amountNotSpecified: 'मात्रा निर्दिष्ट नहीं है',
  lastUpdatedLabel: 'अंतिम अपडेट',

  statusUpcoming: 'आगामी',
  statusDue: 'समय हो गया (ड्यू)',
  statusTaken: 'ली गई',
  statusMissed: 'नहीं ली गई',
  statusUnconfirmed: 'अपुष्ट',
  statusCancelled: 'रद्द',

  navSignIn: 'साइन इन',
  navToday: 'आज का शेड्यूल',
  navPrescriptionEntry: 'प्रिस्क्रिप्शन प्रविष्टि',
  navMedicines: 'मेरी दवाइयां',
  navReviewEntries: 'समीक्षा सूची',
  navHistoryReport: 'इतिहास एवं रिपोर्ट',
  navCaregiverSharing: 'साझाकरण एवं पहुंच',
  navCaregiverDashboard: 'केयरगिवर डैशबोर्ड',
  navSettings: 'सेटिंग्स',
  navDemoMode: 'डेमो मोड',

  signInTitle: 'केयरडोज़ में आपका स्वागत है',
  signInSubtitle: 'कृपया अपनी प्रोफ़ाइल चुनें और 4-अंकीय पिन दर्ज करें',
  selectAccount: 'प्रोफ़ाइल चुनें',
  patientAccount: 'लक्ष्मी (मरीज)',
  caregiverAccount: 'किरण (केयरगिवर)',
  enterPin: '4-अंकीय पिन दर्ज करें',
  pinPlaceholder: '••••',
  signInButton: 'साइन इन करें',
  pinError: 'गलत पिन। कृपया पुन: प्रयास करें।',
  selectProfileFirst: 'आगे बढ़ने के लिए कृपया एक प्रोफ़ाइल चुनें।',
  pinHelp: 'पूर्व-निर्धारित डेमो क्रेडेंशियल: लक्ष्मी (1234), किरण (5678), मीरा (पिन: 9012, पंजी. आईडी: PHARM-DEMO-0001)',

  todayTitle: 'आज की समय-सारणी',
  todaySubtitle: 'समय एशिया/कोलकाता समय क्षेत्र में प्रदर्शित है',
  nextDoseCardTitle: 'अगली निर्धारित खुराक',
  noUpcomingDoses: 'आज के लिए आगे कोई निर्धारित खुराक नहीं बची है।',
  allDosesRecorded: 'आज की सभी निर्धारित खुराकें दर्ज की जा चुकी हैं।',
  takeButton: 'दवा ली',
  notTakenButton: 'दवा नहीं ली',
  changeOutcome: 'परिणाम बदलें',
  futureDoseExplanation: 'निर्धारित समय आने पर ही खुराक दर्ज करने का विकल्प खुलता है।',
  dueNowNotification: 'आपके लिखे हुए शेड्यूल के अनुसार दवा लेने का समय हो गया है।',
  listenReminder: 'सुनें (वॉइस)',
  audioMachineNotice: 'मशीनी आवाज़, मानव समीक्षा नहीं हुई है।',
  audioUnavailable: 'इस ब्राउज़र में ऑडियो उपलब्ध नहीं है।',
  summaryTakenCount: 'ली गई',
  summaryPendingCount: 'आगामी / ड्यू',
  summaryMissedCount: 'नहीं ली गई',
  summaryUnconfirmedCount: 'अपुष्ट',

  rxEntryTitle: 'प्रिस्क्रिप्शन प्रविष्टि',
  rxEntrySubtitle: 'डॉक्टर के प्रिस्क्रिप्शन का विवरण सावधानीपूर्वक दर्ज करें',
  tabManual: 'मैन्युअल प्रविष्टि',
  tabUpload: 'फोटो अपलोड करें',
  formErrorsSummary: 'कृपया आगे बढ़ने से पहले निम्नलिखित बिंदुओं को ठीक करें:',
  fieldMedName: 'दवा का नाम',
  fieldMedNamePlaceholder: 'उदा. मेटफॉर्मिन',
  fieldStrength: 'दवा की शक्ति (स्ट्रेंथ)',
  fieldStrengthPlaceholder: 'उदा. 500 mg',
  fieldAmountPerDose: 'प्रति खुराक मात्रा',
  fieldAmountPlaceholder: 'उदा. 1 गोली',
  fieldFrequencyWording: 'प्रिस्क्रिप्शन के अनुसार आवृत्ति शब्द',
  fieldFrequencyPlaceholder: 'उदा. दिन में दो बार भोजन के बाद',
  fieldDosesPerDay: 'दिन में खुराक की संख्या (1 से 6)',
  fieldTimes: 'निर्धारित समय',
  fieldStartDate: 'प्रारंभ तिथि',
  fieldEndCondition: 'अवधि प्रकार',
  fieldOngoing: 'निरंतर (नियमित उपचार)',
  fieldEndDate: 'समाप्ति तिथि',
  fieldInstructions: 'निर्देश (वैकल्पिक)',
  fieldInstructionsPlaceholder: 'उदा. पूरे गिलास पानी के साथ लें',
  fieldRoute: 'मार्ग (वैकल्पिक)',
  fieldRoutePlaceholder: 'उदा. मौखिक (Oral)',
  fieldTeluguTransliteration: 'तेलुगु लिपि में नाम (वैकल्पिक)',
  fieldHindiTransliteration: 'हिन्दी लिपि में नाम (वैकल्पिक)',
  autoConvertedNotice: 'स्वचालित रूप से परिवर्तित लिपि, कृपया जांच लें',
  confirmTransliterationNotice: 'मैंने प्रिस्क्रिप्शन से क्षेत्रीय भाषा की वर्तनी की पुष्टि कर ली है',
  buttonSaveDraft: 'ड्राफ्ट के रूप में सहेजें',
  buttonReviewActivate: 'समीक्षा करें एवं सक्रिय करें',
  uploadPrompt: 'प्रिस्क्रिप्शन की स्पष्ट फोटो चुनें (JPEG या PNG, अधिकतम 5 MB)',
  uploadButton: 'प्रिस्क्रिप्शन फोटो चुनें',
  uploadHint: 'फोटो विवरण केवल संपादन योग्य ड्राफ्ट बनाते हैं। AI कभी भी अपने आप सक्रिय नहीं करता।',
  loadSamplePrescription: 'काल्पनिक नमूना प्रिस्क्रिप्शन लोड करें',
  extractingImage: 'प्रिस्क्रिप्शन विवरण पढ़ा जा रहा है...',
  extractionError: 'फोटो पढ़ी नहीं जा सकी। आप मैन्युअल रूप से प्रविष्टि कर सकते हैं।',
  enterManuallyLink: 'मैन्युअल प्रविष्टि पर जाएं',
  imageThumbnailAlt: 'प्रिस्क्रिप्शन फोटो पूर्वावलोकन',

  reviewDialogTitle: 'प्रिस्क्रिप्शन समीक्षा एवं सक्रियण',
  reviewDialogNotice: 'सक्रिय करने से पहले प्रत्येक फ़ील्ड की अपने डॉक्टर के प्रिस्क्रिप्शन से सावधानीपूर्वक पुष्टि करें। सक्रिय प्रविष्टियों में फेरबदल नहीं किया जा सकता।',
  checkboxConfirmPrescription: 'मैंने अपने प्रिस्क्रिप्शन से इसका मिलान कर लिया है',
  buttonActivateNow: 'शेड्यूल सक्रिय करें',
  activatedSuccess: 'दवा की समय-सारणी सफलतापूर्वक सक्रिय हो गई।',
  maxActiveReached: 'अधिकतम 10 सक्रिय दवाओं की सीमा पूरी हो चुकी है।',
  maxDraftsReached: 'अधिकतम 20 ड्राफ्ट दवाओं की सीमा पूरी हो चुकी है।',

  medicinesTitle: 'मेरी दवाइयां',
  medicinesSubtitle: 'सभी सक्रिय उपचारों और सहेजे गए ड्राफ्ट का विवरण',
  reviewEntriesTitle: 'समीक्षा सूची',
  reviewEntriesSubtitle: 'आपकी पुष्टि की प्रतीक्षा में ड्राफ्ट प्रिस्क्रिप्शन',
  activeMedicinesHeading: 'सक्रिय दवा समय-सारणी',
  draftMedicinesHeading: 'ड्राफ्ट प्रिस्क्रिप्शन (समीक्षा आवश्यक)',
  noActiveMeds: 'अभी तक कोई सक्रिय दवा नहीं है। शुरू करने के लिए प्रिस्क्रिप्शन दर्ज करें।',
  noDraftMeds: 'समीक्षा के लिए कोई ड्राफ्ट लंबित नहीं है।',
  needsReviewBadge: 'समीक्षा आवश्यक',
  readOnlyNotice: 'सक्रिय शेड्यूल केवल-पढ़ने योग्य है। चिकित्सकीय विवरण सुरक्षित रूप से लॉक हैं।',
  deleteDraftConfirm: 'क्या आप वाकई इस ड्राफ्ट को हटाना चाहते हैं?',

  historyTitle: 'इतिहास एवं रिपोर्ट',
  historySubtitle: 'पूर्ण किए गए दिनों एवं आज के लिए स्वयं-रिपोर्ट किया गया दवा सेवन रिकॉर्ड',
  reportPeriod7Days: 'चयनित अवधि का सारांश',
  confirmedTakenRate: 'पुष्ट दवा सेवन प्रतिशत',
  confirmedTakenExplanation: 'गणना सूत्र: ली गई / (ली गई + नहीं ली गई + अपुष्ट), लंबित खुराकों को छोड़कर।',
  followUpDoctorAdvice: 'यह रिकॉर्ड अपने डॉक्टर या फार्मासिस्ट के साथ साझा करें।',
  historyTableHeading: 'दैनिक खुराक लॉग',
  correctionTrailHeading: 'परिणाम संशोधन ऑडिट ट्रेल',
  originalStatusLabel: 'मूल रिकॉर्ड',
  updatedStatusLabel: 'संशोधित रिकॉर्ड',
  correctedAtLabel: 'संशोधित समय',
  noHistoryData: 'अभी तक कोई पूर्ण दिवस रिकॉर्ड नहीं है।',
  noCorrectionsRecorded: 'कोई परिणाम संशोधन दर्ज नहीं किया गया है।',
  reportRangeToday: 'आज',
  reportRange7Days: 'पिछले 7 दिन',
  reportRange30Days: 'पिछले 30 दिन',
  chartViewAsTable: 'तालिका के रूप में देखें',
  chartHideTable: 'तालिका छुपाएं',
  todayInProgressLabel: 'आज (प्रगति पर)',

  sharingTitle: 'केयरगिवर शेयरिंग',
  sharingSubtitle: 'किरण को आज की दवा स्थिति और छूटी हुई खुराक के अलर्ट देखने की अनुमति दें',
  sharingExplanation: 'सक्षम होने पर, केयरगिवर किरण केवल यह देख सकते हैं कि निर्धारित खुराक ली गई, नहीं ली गई या अपुष्ट रही। आप किसी भी समय अनुमति वापस ले सकते हैं।',
  enableSharingButton: 'किरण को अनुमति दें',
  revokeSharingButton: 'अनुमति वापस लें',
  confirmSharingChange: 'केयरगिवर शेयरिंग अनुमति में बदलाव की पुष्टि करें?',
  sharingActiveBanner: 'शेयरिंग चालू है। किरण आज की खुराक की स्थिति देख सकते हैं।',
  sharingInactiveBanner: 'शेयरिंग बंद है। किरण आपका दवा डेटा नहीं देख सकते।',
  dashboardTitle: 'केयरगिवर डैशबोर्ड',
  dashboardSubtitle: 'लक्ष्मी के लिए वास्तविक समय अलर्ट और आज का शेड्यूल',
  sharingNotEnabledNotice: 'मरीज द्वारा शेयरिंग सक्षम नहीं की गई है।',
  caregiverAlertsHeading: 'ध्यान दें: छूटी हुई अथवा अपुष्ट खुराक अलर्ट',
  noAlertsInbox: 'कोई लंबित अलर्ट नहीं है। सभी निर्धारित खुराकें अद्यतन हैं।',
  alertAcknowledgeButton: 'स्वीकार करें',
  alertAcknowledged: 'स्वीकृत',
  alertAcknowledgeNotice: 'अलर्ट स्वीकार करने से केवल यह दर्ज होता है कि आपने इसे देख लिया है; मरीज के सेवन रिकॉर्ड में कोई बदलाव नहीं होता।',
  patientTodaySummary: 'मरीज की आज की स्थिति',

  settingsTitle: 'सेटिंग्स',
  settingsSubtitle: 'एप्लिकेशन प्राथमिकताएं, भाषा और सूचनाएं',
  languageSection: 'भाषा का चयन (Language)',
  teluguReviewNote: 'Telugu text needs human review.',
  hindiReviewNote: 'Hindi text needs human review.',
  notificationsSection: 'ब्राउज़र सूचनाएं',
  browserNotificationsToggle: 'टैब खुला रहने के दौरान ब्राउज़र सूचनाएं सक्षम करें',
  browserNotificationsActive: 'ब्राउज़र सूचनाओं की अनुमति मिल गई है।',
  browserNotificationsDenied: 'ब्राउज़र सेटिंग्स में सूचनाएं अस्वीकृत कर दी गई हैं।',
  backgroundPushNotice: 'इस संस्करण में बैकग्राउंड पुश नोटिफिकेशन उपलब्ध नहीं हैं। सूचनाएं केवल ब्राउज़र खुला रहने पर काम करती हैं।',
  writtenScheduleAlwaysAvailable: 'आपकी लिखित प्रिस्क्रिप्शन समय-सारणी हमेशा उपलब्ध है।',
  accountDetailsSection: 'वर्तमान खाता',
  loggedOutNotice: 'आप सफलतापूर्वक साइन आउट हो चुके हैं।',

  demoTitle: 'डेमो मोड (नमूना परीक्षण)',
  demoSubtitle: 'सिम्युलेटेड घड़ी और काल्पनिक डेटा के साथ पृथक वातावरण',
  demoClockControls: 'सिम्युलेटेड घड़ी नियंत्रण',
  simulatedTimeLabel: 'सिम्युलेटेड समय (एशिया/कोलकाता)',
  advance15Min: '+15 मिनट',
  advance1Hour: '+1 घंटा',
  advanceNextDay: 'अगला दिन',
  resetClock: 'वर्तमान समय पर रीसेट करें',
  resetDemoData: 'डेमो डेटा रीसेट करें',
  demoSeedSummary: 'नमूना डेटा: प्रतिदिन 6 खुराक x 7 दिन = 42 रिकॉर्ड (ठीक 36 ली गई, 3 नहीं ली गई, 3 अपुष्ट = 85.7% पुष्ट दर)।',
  demoIsolationNote: 'डेमो मोड पूरी तरह से स्वतंत्र है। यहां किए गए बदलाव आपके वास्तविक मरीज डेटा को कभी प्रभावित नहीं करते।',
  demoHistoryTab: 'डेमो 7-दिवसीय रिपोर्ट',
  demoCaregiverTab: 'डेमो केयरगिवर दृश्य',

  // Pharmacist & Sharing & Access additions
  navPharmacistDashboard: 'फार्मासिस्ट डैशबोर्ड',
  navPatientDetail: 'मरीज का विवरण',
  navSharingAccess: 'साझाकरण एवं पहुंच',
  pharmacistAccount: 'मीरा (फार्मासिस्ट)',
  regIdLabel: 'पंजीकरण संख्या (Registration ID)',
  regIdPlaceholder: 'PHARM-DEMO-0001',
  regIdHelp: 'काल्पनिक डेमो पंजीकरण संख्या: PHARM-DEMO-0001',
  regIdError: 'गलत पिन अथवा पंजीकरण संख्या। कृपया पुन: प्रयास करें।',
  statusUnverified: 'फार्मासिस्ट द्वारा अभी समीक्षा नहीं की गई है',
  statusVerifiedBy: 'फार्मासिस्ट मीरा द्वारा सत्यापित दिनांक',
  statusQuery: 'फार्मासिस्ट का प्रश्न:',
  verifiedDisclaimer: 'सत्यापित का अर्थ केवल यह है कि फार्मासिस्ट ने पुष्टि की है कि यह उनके समक्ष प्रस्तुत प्रिस्क्रिप्शन से मेल खाता है।',
  pharmacistNoteDisclaimer: 'फार्मासिस्ट का नोट। यह आपके प्रिस्क्रिप्शन में कोई बदलाव नहीं है।',
  markVerifiedBtn: 'प्रिस्क्रिप्शन के अनुसार सत्यापित करें',
  raiseQueryBtn: 'प्रश्न पूछें / आपत्ति दर्ज करें',
  verifyCheckboxLabel: 'मैं पुष्टि करता/करती हूँ कि यह प्रविष्टि मुझे दिखाए गए प्रिस्क्रिप्शन से मेल खाती है',
  optionalVerificationNote: 'सत्यापन नोट (वैकल्पिक)',
  queryNoteLabel: 'प्रश्न या स्पष्टीकरण का कारण (अनिवार्य)',
  queryNotePlaceholder: 'मरीज के लिए स्पष्टीकरण या विसंगति का विवरण लिखें...',
  pharmacistCannotEditNotice: 'फार्मासिस्ट प्रिस्क्रिप्शन विवरण संपादित नहीं कर सकते, खुराक दर्ज या बदल नहीं सकते, न ही शेड्यूल सक्रिय कर सकते हैं।',
  pharmacistNotesHeading: 'फार्मासिस्ट के नोट्स',
  noPharmacistNotes: 'अभी तक फार्मासिस्ट की कोई टिप्पणी नहीं है।',
  markAsRead: 'पढ़ा हुआ चिह्नित करें',
  read: 'पढ़ा गया',
  sendNoteToPatient: 'मरीज को नोट भेजें',
  noteForMedicine: 'दवा',
  generalNoteAllMedicines: 'सामान्य नोट (सभी दवाइयों के लिए)',
  enterNotePlaceholder: 'दवाओं के संबंध में कोई सलाह या निर्देश लिखें...',
  noteAddedSuccess: 'फार्मासिस्ट का नोट मरीज को भेज दिया गया है।',
  pharmacistDashboardTitle: 'फार्मासिस्ट डैशबोर्ड',
  pharmacistDashboardSubtitle: 'उन मरीजों के प्रिस्क्रिप्शन और सेवन की समीक्षा करें जिन्होंने पहुंच साझा की है',
  noPatientsShared: 'किसी भी मरीज ने आपके साथ पहुंच साझा नहीं की है।',
  noPatientsSharedDesc: 'मरीज के रिकॉर्ड यहाँ दिखने के लिए उन्हें अपनी साझाकरण एवं पहुंच स्क्रीन से अनुमति देनी होगी।',
  patientDetailTitle: 'मरीज की दवा नोटबुक',
  patientDetailSubtitle: 'सक्रिय शेड्यूल, ड्राफ्ट, सेवन इतिहास और ऑडिट लॉग की समीक्षा',
  activeMedicinesCountLabel: 'सक्रिय दवाइयां',
  unverifiedMedicinesCountLabel: 'असत्यापित दवाइयां',
  openQueriesCountLabel: 'लंबित प्रश्न',
  viewPatientDetailsBtn: 'मरीज का विवरण और दवा समीक्षा देखें',
  backToDashboard: 'फार्मासिस्ट डैशबोर्ड पर वापस जाएं',
  pharmacistSharingTitle: 'फार्मासिस्ट मीरा',
  pharmacistSharingSubtitle: 'क्लिनिकल प्रिस्क्रिप्शन सत्यापन और सलाह',
  pharmacistSharingActive: 'साझाकरण चालू है। फार्मासिस्ट मीरा प्रिस्क्रिप्शन, पालन रिपोर्ट देख सकती हैं और नोट्स छोड़ सकती हैं।',
  pharmacistSharingInactive: 'साझाकरण बंद है। फार्मासिस्ट मीरा मरीज का कोई डेटा नहीं देख सकतीं।',
  enablePharmacistSharing: 'मीरा को अनुमति दें',
  revokePharmacistSharing: 'मीरा की अनुमति वापस लें',
  pharmacistCanSee: 'मीरा क्या देख सकती हैं:',
  pharmacistCannotDo: 'मीरा क्या नहीं कर सकती हैं:',
  confirmPharmacistSharingChange: 'फार्मासिस्ट शेयरिंग अनुमति की पुष्टि करें',
  confirmPharmacistEnableMsg: 'क्या आप फार्मासिस्ट मीरा को प्रिस्क्रिप्शन, पालन रिपोर्ट देखने और नोट छोड़ने की अनुमति देना चाहते हैं?',
  confirmPharmacistRevokeMsg: 'मीरा की पहुंच रद्द करें? मीरा तुरंत सभी मरीज रिकॉर्ड से पहुंच खो देंगी।',
  accessRestrictedMsg: 'पहुंच प्रतिबंधित: आपको उस स्क्रीन को देखने की अनुमति नहीं है और आपके डैशबोर्ड पर लौटा दिया गया है।',

  // Voice reminder additions
  reminderVoiceCardTitle: 'रिमाइंडर आवाज़',
  reminderVoiceSubtitle: 'अपनी रिकॉर्ड की गई आवाज़ या ब्राउज़र स्पीच के साथ खुराक अनुस्मारक अनुकूलित करें।',
  voiceModeRecorded: 'मेरी रिकॉर्ड की गई आवाज़ (MP3)',
  voiceModeMachine: 'मशीन आवाज़ (ब्राउज़र)',
  voiceModeOff: 'बंद',
  useOneForAllLangs: 'सभी भाषाओं के लिए एक फ़ाइल का उपयोग करें',
  voicePermissionCheckbox: 'यह मेरी अपनी आवाज़ है, या मेरे पास वक्ता की अनुमति है।',
  permissionRequiredNotice: 'ऑडियो अपलोड करने से पहले कृपया वक्ता की अनुमति की पुष्टि करें।',
  chooseFile: 'फ़ाइल चुनें',
  playPreview: 'पूर्वावलोकन चलाएं',
  stopPreview: 'रोकें',
  replaceFile: 'फ़ाइल बदलें',
  removeFile: 'हटाएं',
  durationLabel: 'अवधि',
  noFileUploaded: 'अभी तक कोई ऑडियो फ़ाइल अपलोड नहीं की गई है।',
  testVoiceButton: 'मेरी आवाज़ का परीक्षण करें',
  playSoundWhenDueToggle: 'खुराक का समय होने पर आवाज़ चलाएं',
  sayMedNameAfterToggle: 'रिकॉर्डिंग के बाद दवा का नाम बोलें',
  indexedDbUnavailableNotice: 'IndexedDB अनुपलब्ध है। ऑडियो इस सत्र के लिए मेमोरी में रहेगा और रीलोड करने पर सहेजा नहीं जाएगा।',
  errorMp3Only: 'केवल MP3 फाइलें (.mp3) समर्थित हैं।',
  errorMax3Mb: 'फ़ाइल बहुत बड़ी है। अधिकतम आकार 3 MB है।',
  errorMax60Sec: 'रिकॉर्डिंग अवधि 60 सेकंड से अधिक है (अधिकतम 60 सेकंड की अनुमति है)।',
  errorAudioRead: 'ऑडियो फ़ाइल पढ़ने में असमर्थ। कृपया जांचें कि यह एक मान्य MP3 फ़ाइल है।',
  labelRecordedVoice: 'आपकी रिकॉर्ड की गई आवाज़',
  labelMachineVoice: 'मशीन आवाज़, समीक्षित नहीं',
  noRecordedVoiceForLang: 'इस भाषा के लिए कोई रिकॉर्ड की गई आवाज़ नहीं है।',
  tapToPlayReminder: 'रिमाइंडर सुनने के लिए टैप करें',
  playingVoice: 'रिमाइंडर आवाज़ चल रही है...',

  // Reset section
  resetSection: 'एप्लिकेशन डेटा रीसेट करें',
  resetDescription: 'सभी शेड्यूल, ली गई खुराक, ड्राफ्ट और सहमतियों को प्रारंभिक स्थिति में रीसेट करें।',
  resetButton: 'डिफ़ॉल्ट डेमो डेटा पर रीसेट करें',
  resetConfirmTitle: 'क्या आप वाकई सारा डेटा रीसेट करना चाहते हैं?',
  resetConfirmWarning: 'यह सभी रिकॉर्ड की गई खुराक और ड्राफ्ट परिवर्तनों को मूल प्रदर्शन शेड्यूल से बदल देगा।',
  resetConfirmAction: 'हाँ, सब कुछ रीसेट करें',
};

const te: TranslationDictionary = {
  appName: 'కేర్ డోస్ (CareDose)',
  appSubtitle: 'మందుల షెడ్యూల్ నోట్‌బుక్',
  bannerDisclaimer: 'ప్రయోగాత్మక నమూనా డేటా మాత్రమే. ఇది వైద్య సలహా కాదు.',
  fictionalDemoBadge: 'ప్రయోగాత్మక నమూనా',
  save: 'భద్రపరచు',
  saving: 'భద్రపరుస్తోంది...',
  saved: 'భద్రపరచబడింది',
  cancel: 'రద్దు చేయి',
  delete: 'తొలగించు',
  edit: 'సవరించు',
  close: 'మూసివేయి',
  confirm: 'నిర్ధారించు',
  back: 'వెనుకకు',
  next: 'తరువాత',
  actions: 'చర్యలు',
  status: 'స్థితి',
  date: 'తేదీ',
  time: 'సమయం',
  navigation: 'మెనూ / నావిగేషన్',
  language: 'భాష',
  role: 'పాత్ర',
  logout: 'లాగౌట్',
  logoutConfirm: 'మీరు నిజంగా నిష్క్రమించాలనుకుంటున్నారా?',
  loading: 'లోడ్ అవుతోంది...',
  empty: 'వివరాలు ఏవీ లేవు.',
  error: 'ఒక లోపం సంభవించింది.',
  simulatedRecord: 'సిమ్యులేట్ చేయబడింది',
  strengthNotSpecified: 'మోతాదు పేర్కొనబడలేదు',
  amountNotSpecified: 'పరిమాణం పేర్కొనబడలేదు',
  lastUpdatedLabel: 'చివరిగా అప్‌డేట్ చేయబడింది',

  statusUpcoming: 'రాబోయేది',
  statusDue: 'సమయం ఆసన్నమైంది (డ్యూ)',
  statusTaken: 'వేసుకున్నారు',
  statusMissed: 'వేసుకోలేదు',
  statusUnconfirmed: 'నిర్ధారణ కాలేదు',
  statusCancelled: 'రద్దు చేయబడింది',

  navSignIn: 'సైన్ ఇన్',
  navToday: 'నేటి షెడ్యూల్',
  navPrescriptionEntry: 'ప్రిస్క్రిప్షన్ నమోదు',
  navMedicines: 'నా మందులు',
  navReviewEntries: 'సమీక్ష జాబితా',
  navHistoryReport: 'చరిత్ర & నివేదిక',
  navCaregiverSharing: 'భాగస్వామ్యం & యాక్సెస్',
  navCaregiverDashboard: 'కేర్‌గివర్ డాష్‌బోర్డ్',
  navSettings: 'సెట్టింగ్‌లు',
  navDemoMode: 'డెమో మోడ్',

  signInTitle: 'కేర్ డోస్‌కి స్వాగతం',
  signInSubtitle: 'దయచేసి మీ ప్రొఫైల్‌ను ఎంచుకుని 4 అంకెల పిన్ నమోదు చేయండి',
  selectAccount: 'ప్రొఫైల్ ఎంచుకోండి',
  patientAccount: 'లక్ష్మి (పేషెంట్)',
  caregiverAccount: 'కిరణ్ (కేర్‌గివర్)',
  enterPin: '4 అంకెల పిన్ నమోదు చేయండి',
  pinPlaceholder: '••••',
  signInButton: 'సైన్ ఇన్ చేయండి',
  pinError: 'తప్పుడు పిన్. దయచేసి మళ్లీ ప్రయత్నించండి.',
  selectProfileFirst: 'కొనసాగడానికి దయచేసి ఒక ప్రొఫైల్ ఎంచుకోండి.',
  pinHelp: 'డెమో ఆధారాలు: లక్ష్మి (1234), కిరణ్ (5678), మీరా (పిన్: 9012, రిజిస్ట్రేషన్: PHARM-DEMO-0001)',

  todayTitle: 'నేటి మందుల సమయ పట్టిక',
  todaySubtitle: 'సమయాలు ఆసియా/కోల్‌కతా కాలమానంలో చూపించబడుతున్నాయి',
  nextDoseCardTitle: 'తదుపరి వేసుకోవలసిన మందు',
  noUpcomingDoses: 'ఈ రోజుకు ఇకపై రాబోయే మందులు ఏవీ లేవు.',
  allDosesRecorded: 'ఈ రోజు షెడ్యూల్ చేయబడిన అన్ని మందులు నమోదు చేయబడ్డాయి.',
  takeButton: 'వేసుకున్నాను',
  notTakenButton: 'వేసుకోలేదు',
  changeOutcome: 'స్థితిని మార్చండి',
  futureDoseExplanation: 'షెడ్యూల్ చేసిన సమయం వచ్చినప్పుడు మాత్రమే నమోదు చేసుకోగలరు.',
  dueNowNotification: 'మీ ప్రిస్క్రిప్షన్ ప్రకారం మందు వేసుకునే సమయం అయింది.',
  listenReminder: 'వినండి (వాయిస్)',
  audioMachineNotice: 'యంత్రం వాయిస్, మానవ సమీక్ష జరగలేదు.',
  audioUnavailable: 'ఈ బ్రౌజర్‌లో ఆడియో అందుబాటులో లేదు.',
  summaryTakenCount: 'వేసుకున్నవి',
  summaryPendingCount: 'రాబోయేవి / డ్యూ',
  summaryMissedCount: 'వేసుకోనివి',
  summaryUnconfirmedCount: 'నిర్ధారణ కానివి',

  rxEntryTitle: 'ప్రిస్క్రిప్షన్ నమోదు',
  rxEntrySubtitle: 'డాక్టర్ ఇచ్చిన ప్రిస్క్రిప్షన్ వివరాలను నమోదు చేయండి',
  tabManual: 'నేరుగా నమోదు చేయండి',
  tabUpload: 'ఫోటో అప్‌లోడ్ చేయండి',
  formErrorsSummary: 'దయచేసి క్రింది అంశాలను సరిచూసుకోండి:',
  fieldMedName: 'మందు పేరు',
  fieldMedNamePlaceholder: 'ఉదా: మెట్‌ఫార్మిన్',
  fieldStrength: 'మోతాదు సామర్థ్యం (స్ట్రెంత్)',
  fieldStrengthPlaceholder: 'ఉదా: 500 mg',
  fieldAmountPerDose: 'ఒక్కోసారి వేసుకునే పరిమాణం',
  fieldAmountPlaceholder: 'ఉదా: 1 మాత్ర',
  fieldFrequencyWording: 'ప్రిస్క్రిప్షన్ ప్రకారం ఫ్రీక్వెన్సీ వాక్యాలు',
  fieldFrequencyPlaceholder: 'ఉదా: రోజుకు రెండుసార్లు భోజనం తర్వాత',
  fieldDosesPerDay: 'రోజుకు ఎన్నిసార్లు (1 నుండి 6)',
  fieldTimes: 'మందులు వేసుకునే సమయాలు',
  fieldStartDate: 'ప్రారంభ తేదీ',
  fieldEndCondition: 'గడువు రకం',
  fieldOngoing: 'నిరంతరం (క్రమబద్ధమైన చికిత్స)',
  fieldEndDate: 'ముగింపు తేదీ',
  fieldInstructions: 'సూచనలు (ఐచ్ఛికం)',
  fieldInstructionsPlaceholder: 'ఉదా: పూర్తి గ్లాసు నీటితో వేసుకోండి',
  fieldRoute: 'రూట్ (ఐచ్ఛికం)',
  fieldRoutePlaceholder: 'ఉదా: నోటి ద్వారా (Oral)',
  fieldTeluguTransliteration: 'తెలుగు లిపిలో పేరు (ఐచ్ఛికం)',
  fieldHindiTransliteration: 'హిందీ లిపిలో పేరు (ఐచ్ఛికం)',
  autoConvertedNotice: 'స్వయంచాలకంగా మార్చబడిన లిపి, దయచేసి సరిచూసుకోండి',
  confirmTransliterationNotice: 'నేను ప్రిస్క్రిప్షన్‌తో ప్రాంతీయ భాష స్పెల్లింగ్‌ను సరిచూసుకున్నాను',
  buttonSaveDraft: 'డ్రాఫ్ట్‌గా భద్రపరచు',
  buttonReviewActivate: 'సమీక్షించి ప్రారంభించు',
  uploadPrompt: 'ప్రిస్క్రిప్షన్ ఫోటోను ఎంచుకోండి (JPEG లేదా PNG, గరిష్టంగా 5 MB)',
  uploadButton: 'ఫోటో ఎంచుకోండి',
  uploadHint: 'ఫోటో వివరాలు డ్రాఫ్ట్‌గా మాత్రమే వస్తాయి. AI స్వయంచాలకంగా షెడ్యూల్‌ను ప్రారంభించదు.',
  loadSamplePrescription: 'నమూనా ప్రిస్క్రిప్షన్ లోడ్ చేయండి',
  extractingImage: 'ప్రిస్క్రిప్షన్ వివరాలు చదువుతోంది...',
  extractionError: 'చిత్రాన్ని చదవలేకపోయాము. మీరు నేరుగా వివరాలు నమోదు చేయవచ్చు.',
  enterManuallyLink: 'నేరుగా నమోదు చేయడానికి మారండి',
  imageThumbnailAlt: 'ప్రిస్క్రిప్షన్ ప్రివ్యూ',

  reviewDialogTitle: 'ప్రిస్క్రిప్షన్ సమీక్ష & ప్రారంభం',
  reviewDialogNotice: 'షెడ్యూల్ ప్రారంభించడానికి ముందు ప్రతి వివరాలను మీ డాక్టర్ ప్రిస్క్రిప్షన్‌తో సరిచూసుకోండి. ప్రారంభించిన తర్వాత మార్చడం వీలుకాదు.',
  checkboxConfirmPrescription: 'నా ప్రిస్క్రిప్షన్‌తో ఈ వివరాలను సరిచూసుకున్నాను',
  buttonActivateNow: 'షెడ్యూల్ ప్రారంభించండి',
  activatedSuccess: 'మందుల షెడ్యూల్ విజయవంతంగా ప్రారంభించబడింది.',
  maxActiveReached: 'గరిష్టంగా 10 యాక్టివ్ మందులు మాత్రమే అనుమతించబడతాయి.',
  maxDraftsReached: 'గరిష్టంగా 20 డ్రాఫ్ట్‌లు మాత్రమే అనుమతించబడతాయి.',

  medicinesTitle: 'నా మందులు',
  medicinesSubtitle: 'యాక్టివ్ మందులు మరియు డ్రాఫ్ట్‌ల సమగ్ర వివరాలు',
  reviewEntriesTitle: 'సమీక్షించవలసిన జాబితా',
  reviewEntriesSubtitle: 'మీ నిర్ధారణ కోసం ఎదురుచూస్తున్న డ్రాఫ్ట్ ప్రిస్క్రిప్షన్‌లు',
  activeMedicinesHeading: 'ప్రస్తుతం అమల్లో ఉన్న మందులు',
  draftMedicinesHeading: 'డ్రాఫ్ట్‌లు (సమీక్ష అవసరం)',
  noActiveMeds: 'ప్రస్తుతం యాక్టివ్ మందులు ఏవీ లేవు.',
  noDraftMeds: 'సమీక్ష పెండింగ్‌లో ఉన్న డ్రాఫ్ట్‌లు ఏవీ లేవు.',
  needsReviewBadge: 'సమీక్ష అవసరం',
  readOnlyNotice: 'యాక్టివ్ షెడ్యూల్ లాక్ చేయబడింది. వైద్య వివరాలు సురక్షితంగా ఉంచబడ్డాయి.',
  deleteDraftConfirm: 'మీరు నిజంగా ఈ డ్రాఫ్ట్‌ను తొలగించాలనుకుంటున్నారా?',

  historyTitle: 'చరిత్ర & నివేదిక',
  historySubtitle: 'పూర్తయిన రోజులు మరియు నేటి కోసం స్వీయ-నివేదిక వివరాలు',
  reportPeriod7Days: 'ఎంచుకున్న కాలవ్యవధి సారాంశం',
  confirmedTakenRate: 'మందులు వేసుకున్న శాతం',
  confirmedTakenExplanation: 'లెక్క: వేసుకున్నవి / (వేసుకున్నవి + వేసుకోనివి + నిర్ధారణ కానివి), పెండింగ్‌లో ఉన్నవి మినహాయించి.',
  followUpDoctorAdvice: 'ఈ రికార్డును మీ వైద్యుడికి లేదా ఫార్మసిస్ట్‌కు చూపించండి.',
  historyTableHeading: 'రోజువారీ మందుల నివేదిక',
  correctionTrailHeading: 'సవరణల ఆడిట్ రికార్డు',
  originalStatusLabel: 'మునుపటి స్థితి',
  updatedStatusLabel: 'సవరించిన స్థితి',
  correctedAtLabel: 'సవరించిన సమయం',
  noHistoryData: 'ఇంకా చరిత్ర రికార్డులు ఏవీ లేవు.',
  noCorrectionsRecorded: 'సవరణలు ఏవీ నమోదు కాలేదు.',
  reportRangeToday: 'ఈ రోజు',
  reportRange7Days: 'గత 7 రోజులు',
  reportRange30Days: 'గత 30 రోజులు',
  chartViewAsTable: 'పట్టికగా చూడండి',
  chartHideTable: 'పట్టికను దాచండి',
  todayInProgressLabel: 'ఈ రోజు (కొనసాగుతోంది)',

  sharingTitle: 'కేర్‌గివర్ షేరింగ్',
  sharingSubtitle: 'లక్ష్మి గారి మందుల స్థితిని కిరణ్ గారితో పంచుకోండి',
  sharingExplanation: 'ఇది ఆన్ చేసినప్పుడు, కిరణ్ గారు మందులు వేసుకున్నారా లేదా అనే స్థితిని మాత్రమే చూడగలరు. మీరు ఎప్పుడైనా దీన్ని రద్దు చేయవచ్చు.',
  enableSharingButton: 'కిరణ్‌కు అనుమతి ఇవ్వండి',
  revokeSharingButton: 'అనుమతి రద్దు చేయండి',
  confirmSharingChange: 'షేరింగ్ అనుమతిని మార్చాలనుకుంటున్నారా?',
  sharingActiveBanner: 'షేరింగ్ ఆన్‌లో ఉంది. కిరణ్ గారు మీ నేటి స్థితిని చూడగలరు.',
  sharingInactiveBanner: 'షేరింగ్ ఆపివేయబడింది. కిరణ్ గారు మీ వివరాలను చూడలేరు.',
  dashboardTitle: 'కేర్‌గివర్ డాష్‌బోర్డ్',
  dashboardSubtitle: 'లక్ష్మి గారి నేటి మందుల స్థితి మరియు అలర్ట్‌లు',
  sharingNotEnabledNotice: 'పేషెంట్ ద్వారా షేరింగ్ ప్రారంభించబడలేదు.',
  caregiverAlertsHeading: 'శ్రద్ధ వహించండి: వేసుకోని లేదా నిర్ధారణ కాని అలర్ట్‌లు',
  noAlertsInbox: 'ఎటువంటి పెండింగ్ అలర్ట్‌లు లేవు. అన్నీ సవ్యంగా ఉన్నాయి.',
  alertAcknowledgeButton: 'గుర్తించాను',
  alertAcknowledged: 'గుర్తించబడింది',
  alertAcknowledgeNotice: 'అలర్ట్‌ను గుర్తించడం ద్వారా పేషెంట్ రికార్డులో ఎటువంటి మార్పు ఉండదు.',
  patientTodaySummary: 'పేషెంట్ నేటి సారాంశం',

  settingsTitle: 'సెట్టింగ్‌లు',
  settingsSubtitle: 'యాప్ ప్రాధాన్యతలు, భాష మరియు నోటిఫికేషన్‌లు',
  languageSection: 'భాష ఎంపిక (Language)',
  teluguReviewNote: 'Telugu text needs human review.',
  hindiReviewNote: 'Hindi text needs human review.',
  notificationsSection: 'బ్రౌజర్ నోటిఫికేషన్‌లు',
  browserNotificationsToggle: 'పేజీ తెరిచి ఉన్నప్పుడు బ్రౌజర్ నోటిఫికేషన్‌లు అనుమతించండి',
  browserNotificationsActive: 'బ్రౌజర్ నోటిఫికేషన్‌లు అనుమతించబడ్డాయి.',
  browserNotificationsDenied: 'బ్రౌజర్ సెట్టింగ్‌లలో నోటిఫికేషన్‌లు నిలిపివేయబడ్డాయి.',
  backgroundPushNotice: 'ఈ వెర్షన్‌లో బ్యాక్‌గ్రౌండ్ పుష్ నోటిఫికేషన్‌లు లేవు. బ్రౌజర్ తెరిచి ఉన్నప్పుడు మాత్రమే పని చేస్తాయి.',
  writtenScheduleAlwaysAvailable: 'మీ ప్రిస్క్రిప్షన్ టైమ్‌టేబుల్ ఎల్లప్పుడూ అందుబాటులో ఉంటుంది.',
  accountDetailsSection: 'ప్రస్తుత ఖాతా',
  loggedOutNotice: 'మీరు విజయవంతంగా నిష్క్రమించారు.',

  demoTitle: 'డెమో మోడ్ (నమూనా పరీక్ష)',
  demoSubtitle: 'నమూనా డేటా మరియు కృత్రిమ గడియారంతో కూడిన ప్రత్యేక వాతావరణం',
  demoClockControls: 'సిమ్యులేటెడ్ గడియార నియంత్రణలు',
  simulatedTimeLabel: 'సిమ్యులేటెడ్ సమయం (ఆసియా/కోల్‌కతా)',
  advance15Min: '+15 నిమిషాలు',
  advance1Hour: '+1 గంట',
  advanceNextDay: 'మరుసటి రోజు',
  resetClock: 'ప్రస్తుత సమయానికి రీసెట్ చేయి',
  resetDemoData: 'డెమో డేటాను రీసెట్ చేయి',
  demoSeedSummary: 'నమూనా డేటా: రోజుకు 6 మోతాదులు x 7 రోజులు = 42 రికార్డులు (సరిగ్గా 36 తీసుకున్నారు, 3 తీసుకోలేదు, 3 నిర్ధారణ కాలేదు = 85.7% నిర్ధారిత రేటు).',
  demoIsolationNote: 'డెమో మోడ్ పూర్తిగా వేరు చేయబడింది. ఇక్కడ చేసిన మార్పులు మీ అసలు డేటాను ప్రభావితం చేయవు.',
  demoHistoryTab: 'డెమో 7-రోజుల నివేదిక',
  demoCaregiverTab: 'డెమో కేర్‌గివర్ వీక్షణ',

  // Pharmacist & Sharing & Access additions
  navPharmacistDashboard: 'ఫార్మసిస్ట్ డ్యాష్‌బోర్డ్',
  navPatientDetail: 'రోగి వివరాలు',
  navSharingAccess: 'భాగస్వామ్యం & యాక్సెస్',
  pharmacistAccount: 'మీరా (ఫార్మసిస్ట్)',
  regIdLabel: 'రిజిస్ట్రేషన్ ఐడి (Registration ID)',
  regIdPlaceholder: 'PHARM-DEMO-0001',
  regIdHelp: 'డెమో రిజిస్ట్రేషన్ ఐడి: PHARM-DEMO-0001',
  regIdError: 'తప్పు పిన్ లేదా రిజిస్ట్రేషన్ ఐడి. దయచేసి వివరాలను సరిచూసుకోండి.',
  statusUnverified: 'ఫార్మసిస్ట్ ఇంకా సమీక్షించలేదు',
  statusVerifiedBy: 'ఫార్మసిస్ట్ మీరా ద్వారా ధృవీకరించబడింది:',
  statusQuery: 'ఫార్మసిస్ట్ ప్రశ్న:',
  verifiedDisclaimer: 'ధృవీకరించబడింది అంటే ఫార్మసిస్ట్‌కు చూపిన ప్రిస్క్రిప్షన్‌తో ఇది సరిపోలుతుందని మాత్రమే నిర్ధారించడం.',
  pharmacistNoteDisclaimer: 'ఫార్మసిస్ట్ నుండి నోట్. ఇది మీ ప్రిస్క్రిప్షన్‌లో మార్పు కాదు.',
  markVerifiedBtn: 'ప్రిస్క్రిప్షన్ ప్రకారం ధృవీకరించండి',
  raiseQueryBtn: 'సందేహం లేదా ప్రశ్న లేవనెత్తండి',
  verifyCheckboxLabel: 'నాకు చూపించిన ప్రిస్క్రిప్షన్‌తో ఈ వివరాలు సరిపోలుతున్నాయని నేను ధృవీకరిస్తున్నాను',
  optionalVerificationNote: 'ధృవీకరణ నోట్ (ఐచ్ఛికం)',
  queryNoteLabel: 'ప్రశ్నకు కారణం లేదా వివరణ (తప్పనిసరి)',
  queryNotePlaceholder: 'రోగికి అవసరమైన వివరణ లేదా సందేహాన్ని ఇక్కడ రాయండి...',
  pharmacistCannotEditNotice: 'ఫార్మసిస్ట్‌లు ప్రిస్క్రిప్షన్ ఫీల్డ్‌లను మార్చలేరు, డోస్ రికార్డ్ చేయలేరు లేదా షెడ్యూల్‌ను సక్రియం చేయలేరు.',
  pharmacistNotesHeading: 'ఫార్మసిస్ట్ నోట్స్',
  noPharmacistNotes: 'ఫార్మసిస్ట్ నుండి ఇంకా ఎటువంటి నోట్స్ లేవు.',
  markAsRead: 'చదివినట్లుగా గుర్తించండి',
  read: 'చదివారు',
  sendNoteToPatient: 'రోగికి నోట్ పంపండి',
  noteForMedicine: 'ఔషధం',
  generalNoteAllMedicines: 'సాధారణ నోట్ (అన్ని ఔషధాల కొరకు)',
  enterNotePlaceholder: 'ఔషధాల వాడకంపై సలహా లేదా సూచనను రాయండి...',
  noteAddedSuccess: 'ఫార్మసిస్ట్ నోట్ రోగికి విజయవంతంగా పంపబడింది.',
  pharmacistDashboardTitle: 'ఫార్మసిస్ట్ డ్యాష్‌బోర్డ్',
  pharmacistDashboardSubtitle: 'యాక్సెస్ ఇచ్చిన రోగుల ప్రిస్క్రిప్షన్‌లు మరియు నివేదికలను సమీక్షించండి',
  noPatientsShared: 'ఏ రోగీ మీతో యాక్సెస్‌ను భాగస్వామ్యం చేయలేదు.',
  noPatientsSharedDesc: 'రోగులు తమ షేరింగ్ & యాక్సెస్ స్క్రీన్ నుండి అనుమతి ఇస్తేనే ఇక్కడ వివరాలు కనిపిస్తాయి.',
  patientDetailTitle: 'రోగి మందుల నోట్‌బుక్',
  patientDetailSubtitle: 'సక్రియ షెడ్యూల్‌లు, డ్రాఫ్ట్‌లు, వాడక చరిత్ర మరియు ఆడిట్ లాగ్ సమీక్ష',
  activeMedicinesCountLabel: 'సక్రియ ఔషధాలు',
  unverifiedMedicinesCountLabel: 'ధృవీకరించని ఔషధాలు',
  openQueriesCountLabel: 'పరిష్కరించని ప్రశ్నలు',
  viewPatientDetailsBtn: 'రోగి వివరాలు & ఔషధ సమీక్ష చూడండి',
  backToDashboard: 'ఫార్మసిస్ట్ డ్యాష్‌బోర్డ్‌కు తిరిగి వెళ్ళండి',
  pharmacistSharingTitle: 'ఫార్మసిస్ట్ మీరా',
  pharmacistSharingSubtitle: 'క్లినికల్ ప్రిస్క్రిప్షన్ ధృవీకరణ మరియు సలహా',
  pharmacistSharingActive: 'భాగస్వామ్యం సక్రియంగా ఉంది. ఫార్మసిస్ట్ మీరా ప్రిస్క్రిప్షన్‌లు, నివేదికలను సమీక్షించి నోట్స్ ఇవ్వగలరు.',
  pharmacistSharingInactive: 'భాగస్వామ్యం ఆపివేయబడింది. ఫార్మసిస్ట్ మీరా రోగి డేటాను చూడలేరు.',
  enablePharmacistSharing: 'మీరాకు అనుమతి ఇవ్వండి',
  revokePharmacistSharing: 'మీరా యాక్సెస్ రద్దు చేయండి',
  pharmacistCanSee: 'మీరా ఏమి చూడగలరు:',
  pharmacistCannotDo: 'మీరా ఏమి చేయలేరు:',
  confirmPharmacistSharingChange: 'ఫార్మసిస్ట్ షేరింగ్ అనుమతిని నిర్ధారించండి',
  confirmPharmacistEnableMsg: 'ఫార్మసిస్ట్ మీరాకు ప్రిస్క్రిప్షన్‌లను, నివేదికలను సమీక్షించే అనుమతి ఇవ్వాలనుకుంటున్నారా?',
  confirmPharmacistRevokeMsg: 'మీరా యాక్సెస్‌ను రద్దు చేయాలా? మీరా వెంటనే అన్ని రోగి రికార్డుల యాక్సెస్‌ను కోల్పోతారు.',
  accessRestrictedMsg: 'యాక్సెస్ పరిమితం చేయబడింది: మీకు ఆ స్క్రీన్ చూసే అనుమతి లేదు, కాబట్టి మీ డ్యాష్‌బోర్డ్‌కు తిరిగి పంపబడ్డారు.',

  // Voice reminder additions
  reminderVoiceCardTitle: 'రిమైండర్ వాయిస్',
  reminderVoiceSubtitle: 'మీ స్వంత రికార్డ్ చేసిన ఆడియో లేదా బ్రౌజర్ వాయిస్‌తో మోతాదు రిమైండర్‌లను వ్యక్తిగతీకరించండి.',
  voiceModeRecorded: 'నా రికార్డ్ చేసిన వాయిస్ (MP3)',
  voiceModeMachine: 'మెషిన్ వాయిస్ (బ్రౌజర్)',
  voiceModeOff: 'ఆఫ్',
  useOneForAllLangs: 'అన్ని భాషలకు ఒకే ఫైల్‌ని ఉపయోగించండి',
  voicePermissionCheckbox: 'ఇది నా స్వంత వాయిస్, లేదా మాట్లాడే వ్యక్తి అనుమతి నాకు ఉంది.',
  permissionRequiredNotice: 'ఆడియో అప్‌లోడ్ చేయడానికి ముందు దయచేసి మాట్లాడే వ్యక్తి అనుమతిని నిర్ధారించండి.',
  chooseFile: 'ఫైల్‌ను ఎంచుకోండి',
  playPreview: 'ప్రివ్యూ ప్లే చేయండి',
  stopPreview: 'ఆపండి',
  replaceFile: 'ఫైల్ మార్చండి',
  removeFile: 'తొలగించండి',
  durationLabel: 'వ్యవధి',
  noFileUploaded: 'ఇంకా ఆడియో ఫైల్ అప్‌లోడ్ చేయలేదు.',
  testVoiceButton: 'నా వాయిస్‌ని పరీక్షించండి',
  playSoundWhenDueToggle: 'మోతాదు సమయం వచ్చినప్పుడు సౌండ్ ప్లే చేయండి',
  sayMedNameAfterToggle: 'రికార్డింగ్ తర్వాత మందు పేరు పలకండి',
  indexedDbUnavailableNotice: 'IndexedDB అందుబాటులో లేదు. ఆడియో ఈ సెషన్ కోసం మాత్రమే మెమరీలో ఉంటుంది మరియు రీలోడ్ చేసినప్పుడు సేవ్ చేయబడదు.',
  errorMp3Only: 'కేవలం MP3 ఫైల్‌లు (.mp3) మాత్రమే అనుమతించబడతాయి.',
  errorMax3Mb: 'ఫైల్ పరిమాణం చాలా పెద్దది. గరిష్ట పరిమాణం 3 MB.',
  errorMax60Sec: 'రికార్డింగ్ వ్యవధి 60 సెకన్ల కంటే ఎక్కువ (గరిష్టంగా 60 సెకన్లు అనుమతించబడుతుంది).',
  errorAudioRead: 'ఆడియో ఫైల్‌ను చదవలేకపోయాము. దయచేసి ఇది సరైన MP3 ఫైల్ అని నిర్ధారించుకోండి.',
  labelRecordedVoice: 'మీ రికార్డ్ చేసిన వాయిస్',
  labelMachineVoice: 'మెషిన్ వాయిస్, సమీక్షించబడలేదు',
  noRecordedVoiceForLang: 'ఈ భాషకు రికార్డ్ చేసిన వాయిస్ లేదు.',
  tapToPlayReminder: 'రిమైండర్ వినడానికి నొక్కండి',
  playingVoice: 'రిమైండర్ వాయిస్ ప్లే అవుతోంది...',

  // Reset section
  resetSection: 'అప్లికేషన్ డేటాను రీసెట్ చేయండి',
  resetDescription: 'అన్ని షెడ్యూల్‌లు, తీసుకున్న మోతాదులు, డ్రాఫ్ట్‌లు మరియు సమ్మతులను ప్రారంభ స్థితికి రీసెట్ చేయండి.',
  resetButton: 'డిఫాల్ట్ డెమో డేటాకు రీసెట్ చేయండి',
  resetConfirmTitle: 'మీరు ఖచ్చితంగా మొత్తం డేటాను రీసెట్ చేయాలనుకుంటున్నారా?',
  resetConfirmWarning: 'ఇది రికార్డ్ చేసిన అన్ని మోతాదులను మరియు డ్రాఫ్ట్ మార్పులను అసలు ప్రదర్శన షెడ్యూల్‌తో భర్తీ చేస్తుంది.',
  resetConfirmAction: 'అవును, ప్రతిదీ రీసెట్ చేయండి',
};

const rawTranslations: Record<Language, TranslationDictionary> = {
  en,
  hi,
  te,
};

/**
 * Safe translation dictionary accessor.
 * If any key is missing from a language dictionary, it silently falls back to English.
 * Never shows a raw key or undefined.
 */
export function getTranslations(lang: Language): TranslationDictionary {
  const target = rawTranslations[lang] || rawTranslations.en;
  return new Proxy(target, {
    get(obj, prop: string) {
      const objRecord = obj as unknown as Record<string, string>;
      if (prop in obj && objRecord[prop] !== undefined) {
        return objRecord[prop];
      }
      const enRecord = rawTranslations.en as unknown as Record<string, string>;
      return enRecord[prop] || '';
    },
  });
}

export const translations = rawTranslations;
