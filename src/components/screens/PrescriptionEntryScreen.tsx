import React, { useState, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { Medication, ExtractedPrescriptionItem } from '../../types';
import { getKolkataDateString } from '../../utils/timezone';
import { evaluateReviewFlags } from '../../utils/doseStatus';
import { extractPrescriptionFromImage, getFictionalSamplePrescriptions } from '../../services/gemini';
import { MedicineTitle } from '../common/MedicineTitle';
import { lookupMedicineTransliteration } from '../../utils/transliteration';
import {
  FileText,
  Upload,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  Info,
  Check,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

export const PrescriptionEntryScreen: React.FC = () => {
  const { data, saveDraftMedication, activateMedication, navigateTo, t } = useStore();

  const [activeTab, setActiveTab] = useState<'manual' | 'upload'>('manual');

  // Manual Form State
  const [medName, setMedName] = useState('');
  const [strength, setStrength] = useState('');
  const [amountPerDose, setAmountPerDose] = useState('');
  const [frequencyWording, setFrequencyWording] = useState('');
  const [dosesPerDay, setDosesPerDay] = useState<number>(1);
  const [times, setTimes] = useState<string[]>(['']);
  const [startDate, setStartDate] = useState(getKolkataDateString());
  const [isOngoing, setIsOngoing] = useState(true);
  const [endDate, setEndDate] = useState('');
  const [instructions, setInstructions] = useState('');
  const [route, setRoute] = useState('');

  // Validation errors & touched states
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string>('');
  const [successToast, setSuccessToast] = useState<string>('');

  // Review & Activate Dialog modal state
  const [reviewModalDraft, setReviewModalDraft] = useState<Medication | null>(null);
  const [verifiedCheckbox, setVerifiedCheckbox] = useState(false);
  const [isActivating, setIsActivating] = useState(false);

  // Upload tab state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [extractedDrafts, setExtractedDrafts] = useState<ExtractedPrescriptionItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Adjust times array when dosesPerDay changes (never auto-fill times, keep user entries)
  const handleDosesPerDayChange = (newCount: number) => {
    setDosesPerDay(newCount);
    setTimes((prev) => {
      const updated = [...prev];
      if (newCount > updated.length) {
        while (updated.length < newCount) {
          updated.push('');
        }
      } else {
        return updated.slice(0, newCount);
      }
      return updated;
    });
  };

  const handleTimeChange = (index: number, value: string) => {
    setTimes((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
    setTouched((prev) => ({ ...prev, [`time_${index}`]: true }));
  };

  // Validate entire form or field
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!medName.trim()) {
      errors.medName = 'Medicine name is required.';
    }
    if (!strength.trim()) {
      errors.strength = 'Strength is required (e.g. 500 mg).';
    }
    if (!amountPerDose.trim()) {
      errors.amountPerDose = 'Amount per dose is required (e.g. 1 tablet).';
    }
    if (!frequencyWording.trim()) {
      errors.frequencyWording = 'Prescribed frequency wording is required.';
    }
    if (!startDate) {
      errors.startDate = 'Start date is required.';
    }
    if (!isOngoing && !endDate) {
      errors.endDate = 'End date is required when not ongoing.';
    }
    if (!isOngoing && endDate && startDate && endDate < startDate) {
      errors.endDate = 'End date cannot be earlier than start date.';
    }

    // Validate times
    times.forEach((timeVal, idx) => {
      if (!timeVal) {
        errors[`time_${idx}`] = `Time ${idx + 1} is required.`;
      }
    });

    // Check unique times
    const filledTimes = times.filter((t) => t.length > 0);
    const uniqueTimes = new Set(filledTimes);
    if (uniqueTimes.size !== filledTimes.length) {
      errors.timesUnique = 'All dose times within a day must be unique.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFieldBlur = (fieldName: string) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
    validateForm();
  };

  // Save as Draft
  const handleSaveDraft = (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');
    setSuccessToast('');

    const transliterations = lookupMedicineTransliteration(medName.trim());
    const draftData: Partial<Medication> = {
      name: medName.trim(),
      strength: strength.trim(),
      amountPerDose: amountPerDose.trim(),
      frequencyWording: frequencyWording.trim(),
      dosesPerDay,
      times: times.filter((t) => t.length > 0),
      startDate,
      ongoing: isOngoing,
      endDate: !isOngoing ? endDate : undefined,
      instructions: instructions.trim() || undefined,
      route: route.trim() || undefined,
      nameTransliterations: transliterations ? { te: transliterations.te, hi: transliterations.hi } : undefined,
    };

    // Calculate review flags
    const flags = evaluateReviewFlags(draftData, data.medications);
    draftData.reviewFlags = flags;

    const res = saveDraftMedication(draftData);
    if (!res.success) {
      setGeneralError(res.error || t.maxDraftsReached);
    } else {
      setSuccessToast('Draft saved successfully. View in "Review Entries" to activate.');
      setTimeout(() => setSuccessToast(''), 4000);
    }
  };

  // Review & Activate Click
  const handleOpenReview = (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = validateForm();
    if (!isValid) {
      setGeneralError('Please correct the highlighted fields before activating.');
      return;
    }

    const transliterations = lookupMedicineTransliteration(medName.trim());
    const draftData: Medication = {
      id: `draft_${Date.now()}`,
      patientId: 'p_lakshmi',
      name: medName.trim(),
      strength: strength.trim(),
      amountPerDose: amountPerDose.trim(),
      frequencyWording: frequencyWording.trim(),
      dosesPerDay,
      times: [...times],
      startDate,
      ongoing: isOngoing,
      endDate: !isOngoing ? endDate : undefined,
      instructions: instructions.trim() || undefined,
      route: route.trim() || undefined,
      state: 'DRAFT',
      reviewFlags: [],
      nameTransliterations: transliterations ? { te: transliterations.te, hi: transliterations.hi } : undefined,
    };

    setReviewModalDraft(draftData);
    setVerifiedCheckbox(false);
  };

  // Perform Final Activation
  const handleConfirmActivation = () => {
    if (!reviewModalDraft || !verifiedCheckbox) return;

    setIsActivating(true);
    // 1. Save draft
    const saveRes = saveDraftMedication(reviewModalDraft);
    if (!saveRes.success) {
      setGeneralError(saveRes.error || 'Failed to save');
      setIsActivating(false);
      setReviewModalDraft(null);
      return;
    }

    // 2. Fetch the newly saved draft id from store data or activate directly
    // Since saveDraftMedication pushes to store, we can activate by draft ID:
    const draftId = reviewModalDraft.id;
    const activateRes = activateMedication(draftId);
    setIsActivating(false);
    setReviewModalDraft(null);

    if (activateRes.success) {
      navigateTo('today');
    } else {
      setGeneralError(activateRes.error || t.maxActiveReached);
    }
  };

  // Handle Image Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate JPEG/PNG
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        setUploadError('Only JPEG or PNG images are supported.');
        return;
      }

      // Validate 5 MiB size
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('Image size exceeds 5 MB limit. Please select a smaller photo.');
        return;
      }

      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  // Process Prescription Image with Gemini
  const handleProcessImage = async () => {
    if (!selectedFile) return;
    setIsExtracting(true);
    setUploadError(null);

    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const res = reader.result as string;
          const base64Clean = res.split(',')[1];
          resolve(base64Clean);
        };
        reader.onerror = reject;
      });
      reader.readAsDataURL(selectedFile);

      const base64Data = await base64Promise;
      const results = await extractPrescriptionFromImage(base64Data, selectedFile.type);

      if (results.length === 0) {
        setUploadError(t.extractionError);
      } else {
        setExtractedDrafts(results);
        // Automatically convert them to editable drafts
        results.forEach((item) => {
          const trans = lookupMedicineTransliteration(item.name || '');
          const draftObj: Partial<Medication> = {
            name: item.name || '',
            strength: item.strength || '',
            amountPerDose: item.amountPerDose || '1 tablet',
            frequencyWording: item.frequencyWording || '',
            dosesPerDay: 1,
            times: ['08:00'],
            startDate: getKolkataDateString(),
            ongoing: true,
            instructions: item.instructions || undefined,
            route: item.route || undefined,
            sourceExcerpt: item.sourceExcerpt || undefined,
            nameTransliterations: trans ? { te: trans.te, hi: trans.hi } : undefined,
          };
          draftObj.reviewFlags = evaluateReviewFlags(draftObj, data.medications);
          saveDraftMedication(draftObj);
        });
        setSuccessToast(`Extracted ${results.length} draft prescriptions. Check "Review Entries" to review and activate.`);
      }
    } catch (err) {
      console.error('Image extraction failed:', err);
      setUploadError(t.extractionError);
    } finally {
      setIsExtracting(false);
    }
  };

  // Load fictional sample prescription (3 fictional drafts)
  const handleLoadSample = () => {
    const samples = getFictionalSamplePrescriptions();
    setExtractedDrafts(samples);
    samples.forEach((item, index) => {
      const timesArr = index === 0 ? ['08:00', '20:00'] : index === 1 ? ['08:00'] : ['21:00'];
      const trans = lookupMedicineTransliteration(item.name || '');
      const draftObj: Partial<Medication> = {
        name: item.name || '',
        strength: item.strength || '',
        amountPerDose: item.amountPerDose || '1 tablet',
        frequencyWording: item.frequencyWording || '',
        dosesPerDay: timesArr.length,
        times: timesArr,
        startDate: getKolkataDateString(),
        ongoing: true,
        instructions: item.instructions || undefined,
        route: item.route || undefined,
        sourceExcerpt: item.sourceExcerpt || undefined,
        nameTransliterations: trans ? { te: trans.te, hi: trans.hi } : undefined,
      };
      draftObj.reviewFlags = evaluateReviewFlags(draftObj, data.medications);
      saveDraftMedication(draftObj);
    });

    setSuccessToast('Loaded 3 fictional sample drafts. You can review them in Review Entries.');
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 space-y-6">
      {/* Title */}
      <div className="border-b border-[#D5DCD5] pb-4">
        <h1 className="text-3xl font-serif font-bold text-[#1F2B25] tracking-tight">
          {t.rxEntryTitle}
        </h1>
        <p className="text-sm text-[#53645A] mt-1">
          {t.rxEntrySubtitle}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#D5DCD5]">
        <button
          type="button"
          onClick={() => setActiveTab('manual')}
          className={`flex items-center gap-2 min-h-[44px] px-6 py-2.5 font-semibold text-base border-b-2 transition-colors focus-visible:outline-2 focus-visible:outline-[#94631A] ${
            activeTab === 'manual'
              ? 'border-[#214F3A] text-[#214F3A] bg-white'
              : 'border-transparent text-[#53645A] hover:text-[#1F2B25]'
          }`}
        >
          <FileText className="w-5 h-5" />
          <span>{t.tabManual}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`flex items-center gap-2 min-h-[44px] px-6 py-2.5 font-semibold text-base border-b-2 transition-colors focus-visible:outline-2 focus-visible:outline-[#94631A] ${
            activeTab === 'upload'
              ? 'border-[#214F3A] text-[#214F3A] bg-white'
              : 'border-transparent text-[#53645A] hover:text-[#1F2B25]'
          }`}
        >
          <Upload className="w-5 h-5" />
          <span>{t.tabUpload}</span>
        </button>
      </div>

      {/* Toast & Error Banners */}
      {successToast && (
        <div className="p-4 bg-[#EAF3ED] border border-[#B8D7C2] text-[#266044] rounded-lg flex items-center justify-between text-sm font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{successToast}</span>
          </div>
          <button
            onClick={() => navigateTo('review-entries')}
            className="text-xs font-bold underline ml-4 hover:text-[#173E2D]"
          >
            Go to Review Entries &rarr;
          </button>
        </div>
      )}

      {generalError && (
        <div className="p-4 bg-[#FBECEA] border border-[#F2BDB9] text-[#A3342A] rounded-lg flex items-center gap-2.5 text-sm font-medium">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{generalError}</span>
        </div>
      )}

      {/* TAB 1: MANUAL ENTRY */}
      {activeTab === 'manual' && (
        <form className="bg-white border border-[#D5DCD5] rounded-xl p-6 sm:p-8 space-y-6 shadow-xs">
          {/* Summary of Errors at Top if any exist */}
          {Object.keys(formErrors).length > 0 && (
            <div className="p-4 bg-[#FBECEA] border border-[#F2BDB9] rounded-lg text-sm text-[#A3342A]">
              <p className="font-bold flex items-center gap-2 mb-1">
                <AlertCircle className="w-4 h-4" />
                {t.formErrorsSummary}
              </p>
              <ul className="list-disc list-inside space-y-0.5 text-xs">
                {Object.values(formErrors).map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Row 1: Name & Strength */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="field-med-name" className="block text-sm font-semibold text-[#1F2B25] mb-1.5">
                {t.fieldMedName} <span className="text-[#A3342A]">*</span>
              </label>
              <input
                id="field-med-name"
                type="text"
                value={medName}
                onChange={(e) => setMedName(e.target.value)}
                onBlur={() => handleFieldBlur('medName')}
                placeholder={t.fieldMedNamePlaceholder}
                className="w-full px-3.5 py-2.5 min-h-[44px] bg-white border border-[#718278] rounded text-[#1F2B25] focus-visible:outline-2 focus-visible:outline-[#94631A]"
                required
              />
              {touched.medName && formErrors.medName && (
                <p className="mt-1 text-xs text-[#A3342A]">{formErrors.medName}</p>
              )}
            </div>

            <div>
              <label htmlFor="field-strength" className="block text-sm font-semibold text-[#1F2B25] mb-1.5">
                {t.fieldStrength} <span className="text-[#A3342A]">*</span>
              </label>
              <input
                id="field-strength"
                type="text"
                value={strength}
                onChange={(e) => setStrength(e.target.value)}
                onBlur={() => handleFieldBlur('strength')}
                placeholder={t.fieldStrengthPlaceholder}
                className="w-full px-3.5 py-2.5 min-h-[44px] bg-white border border-[#718278] rounded text-[#1F2B25] focus-visible:outline-2 focus-visible:outline-[#94631A]"
                required
              />
              {touched.strength && formErrors.strength && (
                <p className="mt-1 text-xs text-[#A3342A]">{formErrors.strength}</p>
              )}
            </div>
          </div>

          {/* Row 2: Amount per dose & Frequency Wording */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="field-amount" className="block text-sm font-semibold text-[#1F2B25] mb-1.5">
                {t.fieldAmountPerDose} <span className="text-[#A3342A]">*</span>
              </label>
              <input
                id="field-amount"
                type="text"
                value={amountPerDose}
                onChange={(e) => setAmountPerDose(e.target.value)}
                onBlur={() => handleFieldBlur('amountPerDose')}
                placeholder={t.fieldAmountPlaceholder}
                className="w-full px-3.5 py-2.5 min-h-[44px] bg-white border border-[#718278] rounded text-[#1F2B25] focus-visible:outline-2 focus-visible:outline-[#94631A]"
                required
              />
              {touched.amountPerDose && formErrors.amountPerDose && (
                <p className="mt-1 text-xs text-[#A3342A]">{formErrors.amountPerDose}</p>
              )}
            </div>

            <div>
              <label htmlFor="field-freq" className="block text-sm font-semibold text-[#1F2B25] mb-1.5">
                {t.fieldFrequencyWording} <span className="text-[#A3342A]">*</span>
              </label>
              <input
                id="field-freq"
                type="text"
                value={frequencyWording}
                onChange={(e) => setFrequencyWording(e.target.value)}
                onBlur={() => handleFieldBlur('frequencyWording')}
                placeholder={t.fieldFrequencyPlaceholder}
                className="w-full px-3.5 py-2.5 min-h-[44px] bg-white border border-[#718278] rounded text-[#1F2B25] focus-visible:outline-2 focus-visible:outline-[#94631A]"
                required
              />
              <p className="mt-1 text-xs text-[#53645A]">
                Copy exact words from prescription. Does not auto-create times.
              </p>
              {touched.frequencyWording && formErrors.frequencyWording && (
                <p className="mt-1 text-xs text-[#A3342A]">{formErrors.frequencyWording}</p>
              )}
            </div>
          </div>

          {/* Row 3: Doses Per Day (1 - 6) and Dynamic Time Inputs */}
          <div className="bg-[#F0F3ED] p-5 rounded-lg border border-[#D5DCD5] space-y-4">
            <div className="max-w-xs">
              <label htmlFor="field-doses-count" className="block text-sm font-semibold text-[#1F2B25] mb-1.5">
                {t.fieldDosesPerDay} <span className="text-[#A3342A]">*</span>
              </label>
              <select
                id="field-doses-count"
                value={dosesPerDay}
                onChange={(e) => handleDosesPerDayChange(parseInt(e.target.value, 10))}
                className="w-full px-3.5 py-2.5 min-h-[44px] bg-white border border-[#718278] rounded text-[#1F2B25] font-semibold focus-visible:outline-2 focus-visible:outline-[#94631A]"
              >
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'dose per day' : 'doses per day'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1F2B25] mb-1.5">
                {t.fieldTimes} ({dosesPerDay} required) <span className="text-[#A3342A]">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {times.map((timeVal, idx) => (
                  <div key={idx}>
                    <label htmlFor={`time-input-${idx}`} className="block text-xs text-[#53645A] mb-1">
                      Dose #{idx + 1}
                    </label>
                    <input
                      id={`time-input-${idx}`}
                      type="time"
                      value={timeVal}
                      onChange={(e) => handleTimeChange(idx, e.target.value)}
                      onBlur={() => handleFieldBlur(`time_${idx}`)}
                      className="w-full px-2.5 py-2 min-h-[44px] bg-white border border-[#718278] rounded text-[#1F2B25] font-mono tabular-nums focus-visible:outline-2 focus-visible:outline-[#94631A]"
                      required
                    />
                    {touched[`time_${idx}`] && formErrors[`time_${idx}`] && (
                      <p className="mt-1 text-[11px] text-[#A3342A]">{formErrors[`time_${idx}`]}</p>
                    )}
                  </div>
                ))}
              </div>
              {formErrors.timesUnique && (
                <p className="mt-2 text-xs text-[#A3342A] font-semibold">{formErrors.timesUnique}</p>
              )}
            </div>
          </div>

          {/* Row 4: Start Date & Duration Condition */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="field-start-date" className="block text-sm font-semibold text-[#1F2B25] mb-1.5">
                {t.fieldStartDate} <span className="text-[#A3342A]">*</span>
              </label>
              <input
                id="field-start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                onBlur={() => handleFieldBlur('startDate')}
                className="w-full px-3.5 py-2.5 min-h-[44px] bg-white border border-[#718278] rounded text-[#1F2B25] focus-visible:outline-2 focus-visible:outline-[#94631A]"
                required
              />
              {touched.startDate && formErrors.startDate && (
                <p className="mt-1 text-xs text-[#A3342A]">{formErrors.startDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1F2B25] mb-1.5">
                {t.fieldEndCondition} <span className="text-[#A3342A]">*</span>
              </label>
              <div className="space-y-2 mt-2">
                <label className="flex items-center gap-2.5 cursor-pointer text-sm">
                  <input
                    type="radio"
                    name="duration"
                    checked={isOngoing}
                    onChange={() => setIsOngoing(true)}
                    className="w-4 h-4 text-[#214F3A] focus:ring-[#94631A]"
                  />
                  <span>{t.fieldOngoing}</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer text-sm">
                  <input
                    type="radio"
                    name="duration"
                    checked={!isOngoing}
                    onChange={() => setIsOngoing(false)}
                    className="w-4 h-4 text-[#214F3A] focus:ring-[#94631A]"
                  />
                  <span>{t.fieldEndDate}</span>
                </label>
              </div>

              {!isOngoing && (
                <div className="mt-3">
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    onBlur={() => handleFieldBlur('endDate')}
                    min={startDate}
                    className="w-full px-3.5 py-2.5 min-h-[44px] bg-white border border-[#718278] rounded text-[#1F2B25] focus-visible:outline-2 focus-visible:outline-[#94631A]"
                    required={!isOngoing}
                  />
                  {touched.endDate && formErrors.endDate && (
                    <p className="mt-1 text-xs text-[#A3342A]">{formErrors.endDate}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Row 5: Instructions & Route (Optional) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="field-instructions" className="block text-sm font-semibold text-[#1F2B25] mb-1.5">
                {t.fieldInstructions}
              </label>
              <input
                id="field-instructions"
                type="text"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder={t.fieldInstructionsPlaceholder}
                className="w-full px-3.5 py-2.5 min-h-[44px] bg-white border border-[#718278] rounded text-[#1F2B25] focus-visible:outline-2 focus-visible:outline-[#94631A]"
              />
            </div>

            <div>
              <label htmlFor="field-route" className="block text-sm font-semibold text-[#1F2B25] mb-1.5">
                {t.fieldRoute}
              </label>
              <input
                id="field-route"
                type="text"
                value={route}
                onChange={(e) => setRoute(e.target.value)}
                placeholder={t.fieldRoutePlaceholder}
                className="w-full px-3.5 py-2.5 min-h-[44px] bg-white border border-[#718278] rounded text-[#1F2B25] focus-visible:outline-2 focus-visible:outline-[#94631A]"
              />
            </div>
          </div>

          {/* Buttons: Save as Draft vs Review & Activate */}
          <div className="pt-6 border-t border-[#D5DCD5] flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="min-h-[44px] px-5 py-2.5 bg-white hover:bg-[#F0F3ED] text-[#1F2B25] border border-[#718278] font-semibold rounded transition-colors focus-visible:outline-2 focus-visible:outline-[#94631A]"
            >
              {t.buttonSaveDraft}
            </button>

            <button
              type="button"
              onClick={handleOpenReview}
              className="min-h-[44px] px-6 py-2.5 bg-[#214F3A] hover:bg-[#173E2D] text-white font-semibold rounded transition-colors flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-[#94631A]"
            >
              <span>{t.buttonReviewActivate}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: UPLOAD IMAGE */}
      {activeTab === 'upload' && (
        <div className="bg-white border border-[#D5DCD5] rounded-xl p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="p-4 bg-[#F0F3ED] rounded-lg border border-[#D5DCD5] flex items-start gap-3">
            <Info className="w-5 h-5 text-[#214F3A] shrink-0 mt-0.5" />
            <div className="text-sm text-[#1F2B25]">
              <p className="font-semibold">{t.uploadHint}</p>
              <p className="text-xs text-[#53645A] mt-0.5">
                AI extraction is strictly used to assist reading. The extracted items are saved as Drafts with review flags and are never activated automatically.
              </p>
            </div>
          </div>

          {/* File Picker */}
          <div>
            <label className="block text-sm font-semibold text-[#1F2B25] mb-2">
              {t.uploadPrompt}
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleFileChange}
              className="hidden"
              id="prescription-file-upload"
            />
            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="min-h-[44px] px-5 py-2.5 bg-[#F0F3ED] hover:bg-[#E5EAE2] border border-[#718278] text-[#1F2B25] font-semibold rounded flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-[#94631A]"
              >
                <Upload className="w-4 h-4 text-[#214F3A]" />
                <span>{selectedFile ? 'Change image' : t.uploadButton}</span>
              </button>

              <button
                type="button"
                onClick={handleLoadSample}
                className="min-h-[44px] px-4 py-2.5 bg-white hover:bg-[#FAFAF7] border border-[#D5DCD5] text-[#875E16] text-sm font-semibold rounded flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-[#94631A]"
              >
                <Sparkles className="w-4 h-4" />
                <span>{t.loadSamplePrescription}</span>
              </button>
            </div>
          </div>

          {/* Thumbnail preview */}
          {previewUrl && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-[#1F2B25]">Selected photo preview:</p>
              <div className="max-w-md border border-[#D5DCD5] rounded-lg p-2 bg-[#FAFAF7]">
                <img
                  src={previewUrl}
                  alt={t.imageThumbnailAlt}
                  className="max-h-64 rounded object-contain mx-auto"
                />
              </div>

              <button
                type="button"
                disabled={isExtracting}
                onClick={handleProcessImage}
                className="min-h-[44px] px-6 py-2.5 bg-[#214F3A] hover:bg-[#173E2D] disabled:opacity-50 text-white font-semibold rounded flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-[#94631A]"
              >
                {isExtracting ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin" />
                    <span>{t.extractingImage}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Extract Prescription Details</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Upload / Extraction Error */}
          {uploadError && (
            <div className="p-4 bg-[#FBECEA] border border-[#F2BDB9] rounded-lg text-sm text-[#A3342A] space-y-2">
              <div className="flex items-center gap-2 font-semibold">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{uploadError}</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('manual')}
                className="text-xs font-bold underline hover:text-[#85251C]"
              >
                {t.enterManuallyLink} &rarr;
              </button>
            </div>
          )}

          {/* Extracted results preview list */}
          {extractedDrafts.length > 0 && (
            <div className="mt-6 pt-6 border-t border-[#D5DCD5] space-y-4">
              <h2 className="text-lg font-serif font-bold text-[#1F2B25]">
                Extracted Draft Items ({extractedDrafts.length})
              </h2>
              <p className="text-xs text-[#53645A]">
                Each item has been saved as an editable DRAFT. Please review and activate them under &ldquo;Review Entries&rdquo;.
              </p>
              <div className="divide-y divide-[#D5DCD5] border border-[#D5DCD5] rounded-lg overflow-hidden">
                {extractedDrafts.map((item, idx) => (
                  <div key={idx} className="p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-base text-[#1F2B25]">{item.name || 'Untitled Draft'}</p>
                      <p className="text-sm text-[#53645A]">
                        <span className={item.strength ? '' : 'italic text-[#718278]'}>
                          {item.strength || 'Strength not specified'}
                        </span>
                        {' '}&bull;{' '}
                        <span className={item.amountPerDose ? '' : 'italic text-[#718278]'}>
                          {item.amountPerDose || 'Amount not specified'}
                        </span>
                        {item.frequencyWording && ` • ${item.frequencyWording}`}
                      </p>
                      {item.sourceExcerpt && (
                        <p className="text-xs text-[#875E16] italic mt-0.5">
                          Source: &ldquo;{item.sourceExcerpt}&rdquo;
                        </p>
                      )}
                    </div>
                    <span className="text-xs px-2.5 py-1 bg-[#FBF2D9] text-[#805A13] font-semibold rounded-full border border-[#E6D4A5] self-start sm:self-auto">
                      Needs review
                    </span>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => navigateTo('review-entries')}
                className="min-h-[44px] px-5 py-2.5 bg-[#214F3A] hover:bg-[#173E2D] text-white font-semibold rounded flex items-center gap-2 text-sm"
              >
                <span>Proceed to Review Entries</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* REVIEW & ACTIVATE CONFIRMATION DIALOG MODAL */}
      {reviewModalDraft && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
        >
          <div className="bg-white border border-[#D5DCD5] rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-lg">
            <div className="flex items-start justify-between border-b border-[#D5DCD5] pb-3">
              <div className="flex items-center gap-2 text-[#214F3A]">
                <ShieldCheck className="w-6 h-6 shrink-0" />
                <h2 className="text-xl font-serif font-bold text-[#1F2B25]">
                  {t.reviewDialogTitle}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setReviewModalDraft(null)}
                className="text-[#53645A] hover:text-[#1F2B25] p-1 rounded min-w-[32px] min-h-[32px]"
                aria-label={t.close}
              >
                &times;
              </button>
            </div>

            <p className="text-sm text-[#53645A] leading-relaxed">
              {t.reviewDialogNotice}
            </p>

            {/* Read-only verification fields */}
            <div className="bg-[#F0F3ED] p-4 rounded-lg border border-[#D5DCD5] space-y-2 text-sm text-[#1F2B25]">
              <div className="flex justify-between border-b border-[#D5DCD5] pb-1.5">
                <span className="text-[#53645A] font-semibold">{t.fieldMedName}:</span>
                <MedicineTitle
                  name={reviewModalDraft.name}
                  transliterations={reviewModalDraft.nameTransliterations}
                  size="sm"
                />
              </div>
              {(reviewModalDraft.nameTransliterations?.te || reviewModalDraft.nameTransliterations?.hi) && (
                <div className="flex justify-between border-b border-[#D5DCD5] pb-1.5 text-xs">
                  <span className="text-[#53645A] font-semibold">తెలుగు / हिन्दी:</span>
                  <span className="font-semibold text-[#214F3A]">
                    {reviewModalDraft.nameTransliterations?.te || '—'} &bull; {reviewModalDraft.nameTransliterations?.hi || '—'}
                  </span>
                </div>
              )}
              <div className="flex justify-between border-b border-[#D5DCD5] pb-1.5">
                <span className="text-[#53645A] font-semibold">{t.fieldStrength}:</span>
                <span className={reviewModalDraft.strength ? 'font-medium' : 'italic text-[#718278]'}>
                  {reviewModalDraft.strength || 'Strength not specified'}
                </span>
              </div>
              <div className="flex justify-between border-b border-[#D5DCD5] pb-1.5">
                <span className="text-[#53645A] font-semibold">{t.fieldAmountPerDose}:</span>
                <span className={reviewModalDraft.amountPerDose ? 'font-medium' : 'italic text-[#718278]'}>
                  {reviewModalDraft.amountPerDose || 'Amount not specified'}
                </span>
              </div>
              <div className="flex justify-between border-b border-[#D5DCD5] pb-1.5">
                <span className="text-[#53645A] font-semibold">{t.fieldFrequencyWording}:</span>
                <span>{reviewModalDraft.frequencyWording}</span>
              </div>
              <div className="flex justify-between border-b border-[#D5DCD5] pb-1.5">
                <span className="text-[#53645A] font-semibold">{t.fieldDosesPerDay}:</span>
                <span className="font-bold">{reviewModalDraft.dosesPerDay}</span>
              </div>
              <div className="flex justify-between border-b border-[#D5DCD5] pb-1.5">
                <span className="text-[#53645A] font-semibold">{t.fieldTimes}:</span>
                <span className="font-mono font-bold text-[#214F3A]">
                  {reviewModalDraft.times.join(', ')}
                </span>
              </div>
              <div className="flex justify-between border-b border-[#D5DCD5] pb-1.5">
                <span className="text-[#53645A] font-semibold">{t.fieldStartDate}:</span>
                <span>{reviewModalDraft.startDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#53645A] font-semibold">Duration:</span>
                <span>
                  {reviewModalDraft.ongoing
                    ? t.fieldOngoing
                    : `Ends ${reviewModalDraft.endDate}`}
                </span>
              </div>
            </div>

            {/* Mandatory confirmation checkbox */}
            <label className="flex items-start gap-3 cursor-pointer p-3 bg-[#FAFAF7] rounded border border-[#718278]">
              <input
                type="checkbox"
                checked={verifiedCheckbox}
                onChange={(e) => setVerifiedCheckbox(e.target.checked)}
                className="w-5 h-5 mt-0.5 text-[#214F3A] rounded border-[#718278] focus:ring-[#94631A]"
              />
              <span className="text-sm font-semibold text-[#1F2B25] select-none">
                {t.checkboxConfirmPrescription} <span className="text-[#A3342A]">*</span>
              </span>
            </label>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#D5DCD5]">
              <button
                type="button"
                onClick={() => setReviewModalDraft(null)}
                className="min-h-[44px] px-4 py-2 border border-[#718278] rounded text-sm font-semibold text-[#1F2B25] hover:bg-[#F0F3ED]"
              >
                {t.cancel}
              </button>

              <button
                type="button"
                disabled={!verifiedCheckbox || isActivating}
                onClick={handleConfirmActivation}
                className="min-h-[44px] px-6 py-2 bg-[#214F3A] hover:bg-[#173E2D] disabled:opacity-50 text-white text-sm font-semibold rounded flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-[#94631A]"
              >
                <Check className="w-4 h-4" />
                <span>{isActivating ? t.saving : t.buttonActivateNow}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
