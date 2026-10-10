import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Medication } from '../../types';
import { evaluateReviewFlags } from '../../utils/doseStatus';
import { MedicineTitle } from '../common/MedicineTitle';
import { PharmacistStatusChip } from '../common/PharmacistStatusChip';
import {
  lookupMedicineTransliteration,
  transliterateMedicineWithGemini,
} from '../../utils/transliteration';
import {
  ClipboardCheck,
  AlertTriangle,
  Edit2,
  Trash2,
  Check,
  ShieldCheck,
  Plus,
  Languages,
  Sparkles,
  Loader2,
} from 'lucide-react';

export const ReviewEntriesScreen: React.FC = () => {
  const { data, saveDraftMedication, deleteDraftMedication, activateMedication, navigateTo, t } =
    useStore();

  const draftMeds = data.medications.filter((m) => m.state === 'DRAFT');

  // Currently editing draft in an expandable sub-form
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Medication>>({});
  const [isTransliterating, setIsTransliterating] = useState<boolean>(false);
  const [isAutoConverted, setIsAutoConverted] = useState<boolean>(false);
  const [transliterationConfirmed, setTransliterationConfirmed] = useState<boolean>(false);

  // Review & Activate modal state
  const [modalDraft, setModalDraft] = useState<Medication | null>(null);
  const [verifiedCheckbox, setVerifiedCheckbox] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isActivating, setIsActivating] = useState<boolean>(false);

  // Delete confirmation modal state
  const [deleteConfirmDraft, setDeleteConfirmDraft] = useState<Medication | null>(null);

  const startEdit = (draft: Medication) => {
    setEditingDraftId(draft.id);
    const existingTrans = draft.nameTransliterations || lookupMedicineTransliteration(draft.name) || undefined;
    setEditForm({
      ...draft,
      nameTransliterations: existingTrans ? { ...existingTrans } : undefined,
    });
    setIsAutoConverted(Boolean(existingTrans));
    setTransliterationConfirmed(Boolean(draft.nameTransliterations));
  };

  const handleTransliterate = async (name: string) => {
    if (!name || !name.trim()) return;
    setIsTransliterating(true);
    try {
      const local = lookupMedicineTransliteration(name);
      if (local) {
        setEditForm((prev) => ({
          ...prev,
          nameTransliterations: { te: local.te, hi: local.hi },
        }));
        setIsAutoConverted(true);
        setTransliterationConfirmed(false);
        return;
      }
      const res = await transliterateMedicineWithGemini(name);
      if (res) {
        setEditForm((prev) => ({
          ...prev,
          nameTransliterations: { te: res.te, hi: res.hi },
        }));
        setIsAutoConverted(true);
        setTransliterationConfirmed(false);
      }
    } catch (err) {
      console.warn('Transliteration failed:', err);
    } finally {
      setIsTransliterating(false);
    }
  };

  const cancelEdit = () => {
    setEditingDraftId(null);
    setEditForm({});
  };

  const saveEdit = (draftId: string) => {
    const updatedDraft: Partial<Medication> = {
      ...editForm,
      id: draftId,
      pharmacistVerification: {
        status: 'UNVERIFIED',
      },
    };
    updatedDraft.reviewFlags = evaluateReviewFlags(updatedDraft, data.medications);
    saveDraftMedication(updatedDraft);
    setEditingDraftId(null);
    setEditForm({});
  };

  const openActivationModal = (draft: Medication) => {
    // Re-verify flags
    const flags = evaluateReviewFlags(draft, data.medications);
    if (flags.length > 0) {
      setErrorMessage(`Please resolve the items under Needs Review before activating.`);
    } else {
      setErrorMessage('');
    }
    setModalDraft(draft);
    setVerifiedCheckbox(false);
  };

  const confirmActivation = () => {
    if (!modalDraft || !verifiedCheckbox) return;
    setIsActivating(true);

    const res = activateMedication(modalDraft.id);
    setIsActivating(false);
    if (res.success) {
      setModalDraft(null);
      navigateTo('today');
    } else {
      setErrorMessage(res.error || t.maxActiveReached);
    }
  };

  const handleDeleteDraft = () => {
    if (!deleteConfirmDraft) return;
    deleteDraftMedication(deleteConfirmDraft.id);
    setDeleteConfirmDraft(null);
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4 border-b border-[#D5DCD5] pb-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#1F2B25] tracking-tight">
            {t.reviewEntriesTitle}
          </h1>
          <p className="text-sm text-[#53645A] mt-1">
            {t.reviewEntriesSubtitle}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigateTo('prescription-entry')}
          className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 bg-[#214F3A] hover:bg-[#173E2D] text-white font-semibold rounded text-sm transition-colors focus-visible:outline-2 focus-visible:outline-[#94631A] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Prescription</span>
        </button>
      </div>

      {draftMeds.length === 0 ? (
        <div className="bg-white border border-[#D5DCD5] rounded-xl p-12 text-center text-[#53645A] space-y-3">
          <ClipboardCheck className="w-12 h-12 mx-auto text-[#214F3A] opacity-60" />
          <h2 className="text-xl font-serif font-bold text-[#1F2B25]">{t.noDraftMeds}</h2>
          <p className="text-sm max-w-md mx-auto">
            All entered prescriptions have been activated or none are pending review. You can enter or scan a new prescription anytime.
          </p>
          <button
            type="button"
            onClick={() => navigateTo('prescription-entry')}
            className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 bg-[#214F3A] hover:bg-[#173E2D] text-white font-semibold rounded text-sm mt-2"
          >
            <span>Enter Prescription</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {draftMeds.map((draft) => {
            const isEditing = editingDraftId === draft.id;
            const flags = draft.reviewFlags && draft.reviewFlags.length > 0 ? draft.reviewFlags : evaluateReviewFlags(draft, data.medications);

            return (
              <div
                key={draft.id}
                className="bg-white border border-[#D5DCD5] rounded-xl p-6 shadow-xs space-y-4 hover:border-[#718278] transition-colors"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-[#D5DCD5] pb-3">
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <MedicineTitle
                        name={draft.name || 'Untitled Draft'}
                        transliterations={draft.nameTransliterations}
                        size="lg"
                      />
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#FBF2D9] text-[#805A13] border border-[#E6D4A5]">
                        {t.needsReviewBadge}
                      </span>
                    </div>
                    <p className="text-sm font-semibold mt-0.5">
                      <span className={draft.strength ? 'text-[#53645A]' : 'italic text-[#718278]'}>
                        {draft.strength || 'Strength not specified'}
                      </span>
                      {' '}&bull;{' '}
                      <span className={draft.amountPerDose ? 'text-[#53645A]' : 'italic text-[#718278]'}>
                        {draft.amountPerDose || 'Amount not specified'}
                      </span>
                    </p>
                    <div className="pt-2">
                      <PharmacistStatusChip verification={draft.pharmacistVerification} size="sm" />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!isEditing && (
                      <button
                        type="button"
                        onClick={() => startEdit(draft)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[44px] text-xs font-semibold text-[#1F2B25] bg-[#F0F3ED] hover:bg-[#E5EAE2] rounded border border-[#718278]"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>{t.edit}</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setDeleteConfirmDraft(draft)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[44px] text-xs font-semibold text-[#A3342A] hover:bg-[#FBECEA] rounded border border-[#F2BDB9]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{t.delete}</span>
                    </button>
                  </div>
                </div>

                {/* Review Flags Box */}
                {flags.length > 0 && (
                  <div className="p-3.5 bg-[#FBF2D9] border border-[#E6D4A5] rounded-lg text-xs text-[#805A13] space-y-1">
                    <p className="font-bold flex items-center gap-1.5 text-sm">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-[#875E16]" />
                      Items requiring your attention:
                    </p>
                    <ul className="list-disc list-inside space-y-0.5 pl-1">
                      {flags.map((flag, idx) => (
                        <li key={idx}>{flag}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* View Mode vs Edit Mode */}
                {!isEditing ? (
                  <div className="space-y-3 text-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 bg-[#F0F3ED] p-3.5 rounded-lg border border-[#D5DCD5]">
                      <div>
                        <span className="text-xs text-[#53645A] uppercase font-bold block">
                          Frequency Wording
                        </span>
                        <span className="font-semibold">{draft.frequencyWording || '—'}</span>
                      </div>
                      <div>
                        <span className="text-xs text-[#53645A] uppercase font-bold block">
                          Doses & Times
                        </span>
                        <span className="font-mono font-bold text-[#214F3A]">
                          {draft.times.length > 0 ? draft.times.join(', ') : 'None scheduled'}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-[#53645A] uppercase font-bold block">
                          Duration
                        </span>
                        <span>
                          {draft.startDate} &rarr;{' '}
                          {draft.ongoing ? 'Ongoing' : draft.endDate || '—'}
                        </span>
                      </div>
                    </div>

                    {draft.sourceExcerpt && (
                      <p className="text-xs text-[#875E16] italic">
                        Prescription excerpt: &ldquo;{draft.sourceExcerpt}&rdquo;
                      </p>
                    )}

                    {/* Review and Activate button */}
                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => openActivationModal(draft)}
                        className="min-h-[44px] px-5 py-2.5 bg-[#214F3A] hover:bg-[#173E2D] text-white font-semibold rounded text-sm transition-colors flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-[#94631A]"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>{t.buttonReviewActivate}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Inline Edit Form */
                  <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#1F2B25] mb-1">
                          Medicine name
                        </label>
                        <input
                          type="text"
                          value={editForm.name || ''}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="w-full px-3 py-2 min-h-[44px] bg-white border border-[#718278] rounded text-sm text-[#1F2B25]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#1F2B25] mb-1">
                          Strength
                        </label>
                        <input
                          type="text"
                          value={editForm.strength || ''}
                          onChange={(e) => setEditForm({ ...editForm, strength: e.target.value })}
                          className="w-full px-3 py-2 min-h-[44px] bg-white border border-[#718278] rounded text-sm text-[#1F2B25]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#1F2B25] mb-1">
                          Amount per dose
                        </label>
                        <input
                          type="text"
                          value={editForm.amountPerDose || ''}
                          onChange={(e) => setEditForm({ ...editForm, amountPerDose: e.target.value })}
                          className="w-full px-3 py-2 min-h-[44px] bg-white border border-[#718278] rounded text-sm text-[#1F2B25]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#1F2B25] mb-1">
                          Frequency wording
                        </label>
                        <input
                          type="text"
                          value={editForm.frequencyWording || ''}
                          onChange={(e) => setEditForm({ ...editForm, frequencyWording: e.target.value })}
                          className="w-full px-3 py-2 min-h-[44px] bg-white border border-[#718278] rounded text-sm text-[#1F2B25]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#1F2B25] mb-1">
                        Scheduled Times (comma separated HH:mm)
                      </label>
                      <input
                        type="text"
                        value={(editForm.times || []).join(', ')}
                        onChange={(e) => {
                          const parsed = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                          setEditForm({
                            ...editForm,
                            times: parsed,
                            dosesPerDay: parsed.length || 1,
                          });
                        }}
                        placeholder="08:00, 20:00"
                        className="w-full px-3 py-2 min-h-[44px] bg-white border border-[#718278] rounded text-sm text-[#1F2B25] font-mono"
                      />
                    </div>

                    {/* Phonetic Transliteration Section for Telugu & Hindi */}
                    <div className="bg-[#FAFAF7] p-3.5 rounded-lg border border-[#D5DCD5] space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Languages className="w-4 h-4 text-[#214F3A]" />
                          <span className="text-xs font-bold text-[#1F2B25] uppercase tracking-wider">
                            Telugu & Hindi Spellings (Phonetic)
                          </span>
                          {isAutoConverted && (
                            <span className="text-[11px] bg-[#FBF2D9] text-[#805A13] px-2 py-0.5 rounded border border-[#E6D4A5] font-semibold">
                              Auto-converted, please check
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          disabled={isTransliterating || !editForm.name}
                          onClick={() => handleTransliterate(editForm.name || '')}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-[#214F3A] bg-white border border-[#718278] hover:bg-[#F0F3ED] rounded disabled:opacity-50 min-h-[36px]"
                        >
                          {isTransliterating ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Converting...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5 text-[#875E16]" />
                              <span>Auto-convert script</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-[#53645A] mb-1">
                            Telugu spelling (తెలుగు లిపి)
                          </label>
                          <input
                            type="text"
                            value={editForm.nameTransliterations?.te || ''}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                nameTransliterations: {
                                  ...(editForm.nameTransliterations || {}),
                                  te: e.target.value,
                                },
                              })
                            }
                            placeholder="e.g. డోలో 500"
                            className="w-full px-3 py-2 min-h-[44px] bg-white border border-[#718278] rounded text-sm text-[#1F2B25]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-[#53645A] mb-1">
                            Hindi spelling (हिन्दी लिपि)
                          </label>
                          <input
                            type="text"
                            value={editForm.nameTransliterations?.hi || ''}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                nameTransliterations: {
                                  ...(editForm.nameTransliterations || {}),
                                  hi: e.target.value,
                                },
                              })
                            }
                            placeholder="e.g. डोलो 500"
                            className="w-full px-3 py-2 min-h-[44px] bg-white border border-[#718278] rounded text-sm text-[#1F2B25]"
                          />
                        </div>
                      </div>

                      {/* Transliteration confirmation checkbox */}
                      <label className="flex items-center gap-2 cursor-pointer pt-1">
                        <input
                          type="checkbox"
                          checked={transliterationConfirmed}
                          onChange={(e) => setTransliterationConfirmed(e.target.checked)}
                          className="w-4 h-4 text-[#214F3A] rounded border-[#718278]"
                        />
                        <span className="text-xs font-medium text-[#1F2B25] select-none">
                          Confirm Telugu & Hindi phonetic script spellings
                        </span>
                      </label>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="min-h-[44px] px-4 py-2 border border-[#718278] rounded text-sm font-semibold text-[#1F2B25]"
                      >
                        {t.cancel}
                      </button>
                      <button
                        type="button"
                        onClick={() => saveEdit(draft.id)}
                        className="min-h-[44px] px-5 py-2 bg-[#214F3A] hover:bg-[#173E2D] text-white rounded text-sm font-semibold"
                      >
                        {t.save}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ACTIVATION CONFIRMATION MODAL */}
      {modalDraft && (
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
                onClick={() => setModalDraft(null)}
                className="text-[#53645A] hover:text-[#1F2B25] p-1 rounded min-w-[32px] min-h-[32px]"
                aria-label={t.close}
              >
                &times;
              </button>
            </div>

            <p className="text-sm text-[#53645A] leading-relaxed">
              {t.reviewDialogNotice}
            </p>

            {errorMessage && (
              <div className="p-3 bg-[#FBECEA] border border-[#F2BDB9] rounded text-xs text-[#A3342A] font-medium">
                {errorMessage}
              </div>
            )}

            {/* Read-only verification fields */}
            <div className="bg-[#F0F3ED] p-4 rounded-lg border border-[#D5DCD5] space-y-2 text-sm text-[#1F2B25]">
              <div className="flex justify-between border-b border-[#D5DCD5] pb-1.5">
                <span className="text-[#53645A] font-semibold">{t.fieldMedName}:</span>
                <MedicineTitle
                  name={modalDraft.name}
                  transliterations={modalDraft.nameTransliterations}
                  size="sm"
                />
              </div>
              {(modalDraft.nameTransliterations?.te || modalDraft.nameTransliterations?.hi) && (
                <div className="flex justify-between border-b border-[#D5DCD5] pb-1.5 text-xs">
                  <span className="text-[#53645A] font-semibold">తెలుగు / हिन्दी:</span>
                  <span className="font-semibold text-[#214F3A]">
                    {modalDraft.nameTransliterations?.te || '—'} &bull; {modalDraft.nameTransliterations?.hi || '—'}
                  </span>
                </div>
              )}
              <div className="flex justify-between border-b border-[#D5DCD5] pb-1.5">
                <span className="text-[#53645A] font-semibold">{t.fieldStrength}:</span>
                <span className={modalDraft.strength ? 'font-medium' : 'italic text-[#718278]'}>
                  {modalDraft.strength || 'Strength not specified'}
                </span>
              </div>
              <div className="flex justify-between border-b border-[#D5DCD5] pb-1.5">
                <span className="text-[#53645A] font-semibold">{t.fieldAmountPerDose}:</span>
                <span className={modalDraft.amountPerDose ? 'font-medium' : 'italic text-[#718278]'}>
                  {modalDraft.amountPerDose || 'Amount not specified'}
                </span>
              </div>
              <div className="flex justify-between border-b border-[#D5DCD5] pb-1.5">
                <span className="text-[#53645A] font-semibold">{t.fieldFrequencyWording}:</span>
                <span>{modalDraft.frequencyWording}</span>
              </div>
              <div className="flex justify-between border-b border-[#D5DCD5] pb-1.5">
                <span className="text-[#53645A] font-semibold">{t.fieldDosesPerDay}:</span>
                <span className="font-bold">{modalDraft.dosesPerDay}</span>
              </div>
              <div className="flex justify-between border-b border-[#D5DCD5] pb-1.5">
                <span className="text-[#53645A] font-semibold">{t.fieldTimes}:</span>
                <span className="font-mono font-bold text-[#214F3A]">
                  {modalDraft.times.join(', ')}
                </span>
              </div>
              <div className="flex justify-between border-b border-[#D5DCD5] pb-1.5">
                <span className="text-[#53645A] font-semibold">{t.fieldStartDate}:</span>
                <span>{modalDraft.startDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#53645A] font-semibold">Duration:</span>
                <span>
                  {modalDraft.ongoing ? t.fieldOngoing : `Ends ${modalDraft.endDate}`}
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

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#D5DCD5]">
              <button
                type="button"
                onClick={() => setModalDraft(null)}
                className="min-h-[44px] px-4 py-2 border border-[#718278] rounded text-sm font-semibold text-[#1F2B25] hover:bg-[#F0F3ED]"
              >
                {t.cancel}
              </button>

              <button
                type="button"
                disabled={!verifiedCheckbox || isActivating}
                onClick={confirmActivation}
                className="min-h-[44px] px-6 py-2 bg-[#214F3A] hover:bg-[#173E2D] disabled:opacity-50 text-white text-sm font-semibold rounded flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-[#94631A]"
              >
                <Check className="w-4 h-4" />
                <span>{isActivating ? t.saving : t.buttonActivateNow}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {deleteConfirmDraft && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
        >
          <div className="bg-white border border-[#D5DCD5] rounded-xl max-w-sm w-full p-6 space-y-4 shadow-lg text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#FBECEA] text-[#A3342A] flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-serif font-bold text-[#1F2B25]">
              {t.deleteDraftConfirm}
            </h3>
            <p className="text-sm text-[#53645A]">
              Draft for &ldquo;{deleteConfirmDraft.name || 'Untitled'}&rdquo; will be deleted.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmDraft(null)}
                className="min-h-[44px] px-4 py-2 border border-[#718278] rounded text-sm font-semibold text-[#1F2B25]"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={handleDeleteDraft}
                className="min-h-[44px] px-5 py-2 bg-[#A3342A] hover:bg-[#85251C] text-white rounded text-sm font-semibold"
              >
                {t.delete}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
