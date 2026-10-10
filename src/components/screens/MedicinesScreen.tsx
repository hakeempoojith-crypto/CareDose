import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Pill, Lock, Plus, Clock, Calendar, CheckCircle, MessageSquare, Check, AlertCircle } from 'lucide-react';
import { MedicineTitle } from '../common/MedicineTitle';
import { PharmacistStatusChip } from '../common/PharmacistStatusChip';
import { formatKolkataDateTime } from '../../utils/timezone';

export const MedicinesScreen: React.FC = () => {
  const { data, navigateTo, markPharmacistNoteAsRead, t } = useStore();

  const activeMeds = data.medications.filter((m) => m.state === 'ACTIVE');
  const draftMeds = data.medications.filter((m) => m.state === 'DRAFT');
  const pharmacistNotes = data.pharmacist_notes || [];

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 space-y-6">
      {/* Screen Title */}
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4 border-b border-[#D5DCD5] pb-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#1F2B25] tracking-tight">
            {t.medicinesTitle}
          </h1>
          <p className="text-sm text-[#53645A] mt-1">
            {t.medicinesSubtitle}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigateTo('prescription-entry')}
          className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2.5 bg-[#214F3A] hover:bg-[#173E2D] text-white font-semibold rounded text-sm transition-colors focus-visible:outline-2 focus-visible:outline-[#94631A] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Prescription</span>
        </button>
      </div>

      {/* Pharmacist Notes Section */}
      <section className="bg-white border border-[#D5DCD5] rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#D5DCD5] pb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#214F3A]" />
            <h2 className="text-lg font-serif font-bold text-[#1F2B25]">
              {t.pharmacistNotesHeading}
            </h2>
            <span className="text-xs bg-[#E5EEF9] text-[#1E4E8C] font-bold px-2.5 py-0.5 rounded-full border border-[#BFD5ED]">
              {pharmacistNotes.length}
            </span>
          </div>
          <span className="text-xs text-[#875E16] italic hidden sm:inline">
            {t.fictionalDemoBadge}
          </span>
        </div>

        {/* Mandatory pharmacist advisory disclaimer */}
        <div className="p-3 bg-[#FBF2D9] rounded-lg border border-[#E6D4A5] text-xs text-[#805A13] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-[#875E16]" />
          <span className="font-semibold">{t.pharmacistNoteDisclaimer}</span>
        </div>

        {pharmacistNotes.length === 0 ? (
          <p className="text-sm text-[#53645A] py-2">
            {t.noPharmacistNotes}
          </p>
        ) : (
          <div className="divide-y divide-[#D5DCD5] space-y-3">
            {pharmacistNotes.map((note) => (
              <div key={note.id} className="pt-3 first:pt-0 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-[#1F2B25]">{note.pharmacistName} (Pharmacist)</span>
                    <span className="text-[#53645A]">&bull;</span>
                    <span className="text-[#53645A]">{formatKolkataDateTime(note.createdAt)}</span>
                    {note.medicationName && (
                      <span className="bg-[#F0F3ED] text-[#214F3A] font-semibold px-2 py-0.5 rounded">
                        {note.medicationName}
                      </span>
                    )}
                  </div>

                  <div>
                    {note.isRead ? (
                      <span className="inline-flex items-center gap-1 text-xs text-[#266044] font-semibold bg-[#EAF3ED] px-2 py-0.5 rounded border border-[#B8D7C2]">
                        <Check className="w-3 h-3" />
                        <span>{t.read}</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => markPharmacistNoteAsRead(note.id)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#214F3A] bg-[#F0F3ED] hover:bg-[#E5EAE2] px-2.5 py-1 rounded border border-[#718278] min-h-[32px]"
                      >
                        <Check className="w-3 h-3" />
                        <span>{t.markAsRead}</span>
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-sm text-[#1F2B25] bg-[#FAFAF7] p-3 rounded-lg border border-[#D5DCD5]">
                  {note.text}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Active Schedules Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-[#214F3A]" />
            <h2 className="text-xl font-serif font-bold text-[#1F2B25]">
              {t.activeMedicinesHeading}
            </h2>
            <span className="text-xs bg-[#EAF3ED] text-[#266044] font-bold px-2.5 py-0.5 rounded-full border border-[#B8D7C2]">
              {activeMeds.length} / 10 active
            </span>
          </div>
          <span className="text-xs text-[#53645A] flex items-center gap-1">
            <Lock className="w-3.5 h-3.5" />
            {t.readOnlyNotice}
          </span>
        </div>

        {activeMeds.length === 0 ? (
          <div className="bg-white border border-[#D5DCD5] rounded-xl p-8 text-center text-[#53645A]">
            <Pill className="w-8 h-8 mx-auto text-[#718278] mb-2" />
            <p className="text-base">{t.noActiveMeds}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeMeds.map((med) => (
              <div
                key={med.id}
                className="bg-white border border-[#D5DCD5] rounded-xl p-5 space-y-3 shadow-xs hover:border-[#718278] transition-colors"
              >
                <div className="flex items-start justify-between gap-2 border-b border-[#D5DCD5] pb-2.5">
                  <div>
                    <MedicineTitle
                      name={med.name}
                      transliterations={med.nameTransliterations}
                      size="md"
                    />
                    <p className="text-sm font-semibold text-[#53645A]">
                      <span className={med.strength ? '' : 'italic text-[#718278]'}>
                        {med.strength || 'Strength not specified'}
                      </span>
                      {' '}&bull;{' '}
                      <span className={med.amountPerDose ? '' : 'italic text-[#718278]'}>
                        {med.amountPerDose || 'Amount not specified'}
                      </span>
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EAF3ED] text-[#266044] border border-[#B8D7C2]">
                    <Lock className="w-3 h-3" />
                    Active
                  </span>
                </div>

                {/* Pharmacist Verification Status Chip */}
                <div>
                  <PharmacistStatusChip verification={med.pharmacistVerification} size="sm" />
                </div>

                <div className="text-sm space-y-1.5 text-[#1F2B25]">
                  <p className="text-xs text-[#53645A] uppercase font-bold tracking-wider">
                    Prescribed Frequency
                  </p>
                  <p className="font-medium">{med.frequencyWording}</p>
                </div>

                <div className="bg-[#F0F3ED] p-3 rounded-lg border border-[#D5DCD5] space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#53645A]">
                    <Clock className="w-3.5 h-3.5 text-[#214F3A]" />
                    <span>Daily Schedule ({med.dosesPerDay} {med.dosesPerDay === 1 ? 'dose' : 'doses'}):</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {med.times.map((tVal, idx) => (
                      <span
                        key={idx}
                        className="font-mono text-xs font-bold px-2 py-0.5 bg-white text-[#214F3A] rounded border border-[#D5DCD5] tabular-nums"
                      >
                        {tVal}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-[#53645A] pt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Started: {med.startDate}
                  </span>
                  <span>
                    {med.ongoing ? 'Ongoing treatment' : `Ends: ${med.endDate}`}
                  </span>
                </div>

                {med.instructions && (
                  <p className="text-xs italic text-[#53645A] pt-1 border-t border-[#D5DCD5]">
                    Note: &ldquo;{med.instructions}&rdquo;
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Drafts Section */}
      {draftMeds.length > 0 && (
        <section className="mt-8 pt-6 border-t border-[#D5DCD5] space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-serif font-bold text-[#1F2B25]">
              {t.draftMedicinesHeading} ({draftMeds.length})
            </h2>
            <button
              onClick={() => navigateTo('review-entries')}
              className="text-sm font-semibold text-[#214F3A] hover:underline"
            >
              Go to Review Entries &rarr;
            </button>
          </div>

          <div className="bg-[#FBF2D9]/40 border border-[#E6D4A5] rounded-xl p-4 divide-y divide-[#E6D4A5]">
            {draftMeds.map((draft) => (
              <div key={draft.id} className="py-2.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <MedicineTitle
                    name={draft.name || 'Untitled Draft'}
                    transliterations={draft.nameTransliterations}
                    size="sm"
                  />
                  <p className="text-xs text-[#53645A]">
                    <span className={draft.strength ? '' : 'italic text-[#718278]'}>
                      {draft.strength || 'Strength not specified'}
                    </span>
                    {' '}&bull;{' '}
                    <span className={draft.frequencyWording ? '' : 'italic text-[#718278]'}>
                      {draft.frequencyWording || 'Frequency not specified'}
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <PharmacistStatusChip verification={draft.pharmacistVerification} size="sm" />
                  <span className="text-xs bg-[#FBF2D9] text-[#805A13] font-semibold px-2 py-0.5 rounded border border-[#E6D4A5]">
                    Needs review
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
