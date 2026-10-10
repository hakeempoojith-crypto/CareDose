import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { Medication } from '../../types';
import { PharmacistStatusChip } from '../common/PharmacistStatusChip';
import { MedicineTitle } from '../common/MedicineTitle';
import { getDoseStats, ReportRange } from '../../utils/doseStats';
import { formatKolkataDate, formatKolkataDateTime, formatKolkataTime } from '../../utils/timezone';
import {
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Send,
  MessageSquare,
  Lock,
  Clock,
  Calendar,
  Layers,
  BarChart3,
  History,
  FileText,
  Info,
  Check,
  X,
  Plus,
} from 'lucide-react';

export const PharmacistPatientDetailScreen: React.FC = () => {
  const {
    data,
    navigateTo,
    verifyMedication,
    addPharmacistNote,
    isPharmacistConsentActive,
    t,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'medicines' | 'report' | 'notes' | 'activity'>('medicines');
  const [selectedRange, setSelectedRange] = useState<ReportRange>('7days');

  // Verification modal state
  const [verifyingMed, setVerifyingMed] = useState<Medication | null>(null);
  const [verifyMode, setVerifyMode] = useState<'VERIFY' | 'QUERY'>('VERIFY');
  const [confirmCheckbox, setConfirmCheckbox] = useState<boolean>(false);
  const [verificationNote, setVerificationNote] = useState<string>('');

  // Add Note state
  const [newNoteText, setNewNoteText] = useState<string>('');
  const [newNoteMedId, setNewNoteMedId] = useState<string>('all');
  const [noteSentSuccess, setNoteSentSuccess] = useState<boolean>(false);

  // If consent is inactive, block access immediately
  if (!isPharmacistConsentActive) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <div className="bg-white border border-[#D5DCD5] rounded-xl p-8 max-w-md mx-auto space-y-4 shadow-xs">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#FBECEA] text-[#A3342A] flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-[#1F2B25]">
            Access Revoked
          </h1>
          <p className="text-sm text-[#53645A]">
            Patient Lakshmi has not enabled pharmacist sharing, or permissions were revoked.
          </p>
          <button
            type="button"
            onClick={() => navigateTo('pharmacist-dashboard')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#214F3A] text-white text-sm font-semibold rounded"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.backToDashboard}</span>
          </button>
        </div>
      </div>
    );
  }

  const activeMeds = data.medications.filter((m) => m.state === 'ACTIVE');
  const draftMeds = data.medications.filter((m) => m.state === 'DRAFT');

  // Adherence stats calculation for report tab
  const nowMs = Date.now();
  const stats = useMemo(() => {
    return getDoseStats(data.dose_occurrences, selectedRange, data.medications, nowMs);
  }, [data.dose_occurrences, selectedRange, data.medications, nowMs]);

  // Open verification modal
  const openVerificationModal = (med: Medication, mode: 'VERIFY' | 'QUERY') => {
    setVerifyingMed(med);
    setVerifyMode(mode);
    setConfirmCheckbox(false);
    setVerificationNote(mode === 'QUERY' && med.pharmacistVerification?.note ? med.pharmacistVerification.note : '');
  };

  const handleConfirmVerification = () => {
    if (!verifyingMed) return;

    if (verifyMode === 'VERIFY') {
      if (!confirmCheckbox) return;
      verifyMedication(verifyingMed.id, 'VERIFIED', verificationNote);
    } else {
      if (!verificationNote.trim()) return;
      verifyMedication(verifyingMed.id, 'QUERY', verificationNote);
    }

    setVerifyingMed(null);
  };

  const handleSendNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    const medId = newNoteMedId === 'all' ? undefined : newNoteMedId;
    addPharmacistNote('p_lakshmi', newNoteText, medId);
    setNewNoteText('');
    setNoteSentSuccess(true);
    setTimeout(() => setNoteSentSuccess(false), 3500);
  };

  const patientNotes = (data.pharmacist_notes || []).filter((n) => n.patientId === 'p_lakshmi');

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 space-y-6">
      {/* Top Header & Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D5DCD5] pb-4">
        <div>
          <button
            type="button"
            onClick={() => navigateTo('pharmacist-dashboard')}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#214F3A] hover:underline mb-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.backToDashboard}</span>
          </button>
          <h1 className="text-3xl font-serif font-bold text-[#1F2B25] tracking-tight">
            Lakshmi &bull; {t.patientDetailTitle}
          </h1>
          <p className="text-xs sm:text-sm text-[#53645A]">
            {t.patientDetailSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#E5EEF9] border border-[#BFD5ED] text-[#1E4E8C] px-3 py-1.5 rounded-lg text-xs font-semibold self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-[#1E4E8C]" />
          <span>Read-Only Clinical Audit Mode</span>
        </div>
      </div>

      {/* Mandatory Notice */}
      <div className="p-3.5 bg-[#FBF2D9] border border-[#E6D4A5] rounded-xl text-xs text-[#805A13] flex items-start gap-2">
        <Info className="w-4 h-4 shrink-0 text-[#875E16] mt-0.5" />
        <div>
          <span className="font-bold">{t.verifiedDisclaimer}</span>{' '}
          <span>{t.pharmacistCannotEditNotice}</span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#D5DCD5] pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('medicines')}
          className={`min-h-[40px] px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-[#94631A] ${
            activeTab === 'medicines'
              ? 'bg-[#214F3A] text-white shadow-xs'
              : 'bg-white text-[#53645A] border border-[#D5DCD5] hover:bg-[#F0F3ED]'
          }`}
        >
          Prescriptions &amp; Verification ({activeMeds.length + draftMeds.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('report')}
          className={`min-h-[40px] px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-[#94631A] ${
            activeTab === 'report'
              ? 'bg-[#214F3A] text-white shadow-xs'
              : 'bg-white text-[#53645A] border border-[#D5DCD5] hover:bg-[#F0F3ED]'
          }`}
        >
          Full History &amp; Adherence Report
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('notes')}
          className={`min-h-[40px] px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-[#94631A] ${
            activeTab === 'notes'
              ? 'bg-[#214F3A] text-white shadow-xs'
              : 'bg-white text-[#53645A] border border-[#D5DCD5] hover:bg-[#F0F3ED]'
          }`}
        >
          Notes to Patient ({patientNotes.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('activity')}
          className={`min-h-[40px] px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-[#94631A] ${
            activeTab === 'activity'
              ? 'bg-[#214F3A] text-white shadow-xs'
              : 'bg-white text-[#53645A] border border-[#D5DCD5] hover:bg-[#F0F3ED]'
          }`}
        >
          Activity Audit Log ({data.activity_log.length})
        </button>
      </div>

      {/* TAB 1: MEDICINES & VERIFICATION */}
      {activeTab === 'medicines' && (
        <div className="space-y-6">
          {/* Active Medicines Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-serif font-bold text-[#1F2B25] flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#266044]"></span>
              <span>Active Prescribed Medications ({activeMeds.length})</span>
            </h2>

            {activeMeds.length === 0 ? (
              <p className="text-sm text-[#53645A] bg-white p-6 rounded-xl border border-[#D5DCD5]">
                No active medications currently in schedule.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {activeMeds.map((med) => (
                  <div
                    key={med.id}
                    className="bg-white border border-[#D5DCD5] rounded-xl p-5 shadow-xs space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-[#D5DCD5] pb-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <MedicineTitle
                            name={med.name}
                            transliterations={med.nameTransliterations}
                            size="lg"
                          />
                          <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#EAF3ED] text-[#266044] border border-[#B8D7C2]">
                            Active
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-[#53645A] mt-1">
                          {med.strength || 'Strength not specified'} &bull; {med.amountPerDose || 'Amount not specified'}
                        </p>
                      </div>

                      <div className="flex flex-col sm:items-end gap-2">
                        <PharmacistStatusChip verification={med.pharmacistVerification} size="md" />

                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => openVerificationModal(med, 'VERIFY')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#214F3A] hover:bg-[#173E2D] text-white text-xs font-semibold rounded min-h-[36px]"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Mark verified</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => openVerificationModal(med, 'QUERY')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FBF2D9] hover:bg-[#E6D4A5] text-[#805A13] border border-[#E6D4A5] text-xs font-semibold rounded min-h-[36px]"
                          >
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Raise query</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* All Fields Display */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-[#F0F3ED] p-3.5 rounded-lg border border-[#D5DCD5] text-xs">
                      <div>
                        <span className="font-bold text-[#53645A] uppercase block">Prescribed Frequency</span>
                        <span className="font-semibold text-sm text-[#1F2B25]">{med.frequencyWording}</span>
                      </div>
                      <div>
                        <span className="font-bold text-[#53645A] uppercase block">Daily Times ({med.dosesPerDay}/day)</span>
                        <span className="font-mono font-bold text-sm text-[#214F3A]">
                          {med.times.join(', ')}
                        </span>
                      </div>
                      <div>
                        <span className="font-bold text-[#53645A] uppercase block">Start &amp; Duration</span>
                        <span className="font-semibold text-[#1F2B25]">
                          {med.startDate} ({med.ongoing ? 'Ongoing' : `Ends ${med.endDate}`})
                        </span>
                      </div>
                      <div>
                        <span className="font-bold text-[#53645A] uppercase block">Route of Intake</span>
                        <span className="font-semibold text-[#1F2B25]">{med.route || 'Oral'}</span>
                      </div>
                    </div>

                    {med.instructions && (
                      <p className="text-xs text-[#53645A] bg-[#FAFAF7] p-2.5 rounded border border-[#D5DCD5]">
                        <strong>Special instructions:</strong> &ldquo;{med.instructions}&rdquo;
                      </p>
                    )}

                    {med.sourceExcerpt && (
                      <p className="text-xs italic text-[#875E16]">
                        Prescription excerpt: &ldquo;{med.sourceExcerpt}&rdquo;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Draft Prescriptions Section */}
          <div className="space-y-4 pt-4 border-t border-[#D5DCD5]">
            <h2 className="text-xl font-serif font-bold text-[#1F2B25] flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#875E16]"></span>
              <span>Draft Prescriptions Awaiting Patient Activation ({draftMeds.length})</span>
            </h2>

            {draftMeds.length === 0 ? (
              <p className="text-sm text-[#53645A] bg-white p-6 rounded-xl border border-[#D5DCD5]">
                No draft prescriptions currently pending review.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {draftMeds.map((draft) => (
                  <div
                    key={draft.id}
                    className="bg-white border border-[#D5DCD5] rounded-xl p-5 shadow-xs space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-[#D5DCD5] pb-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <MedicineTitle
                            name={draft.name || 'Untitled Draft'}
                            transliterations={draft.nameTransliterations}
                            size="lg"
                          />
                          <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#FBF2D9] text-[#805A13] border border-[#E6D4A5]">
                            Draft
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-[#53645A] mt-1">
                          {draft.strength || 'Strength not specified'} &bull; {draft.amountPerDose || 'Amount not specified'}
                        </p>
                      </div>

                      <div className="flex flex-col sm:items-end gap-2">
                        <PharmacistStatusChip verification={draft.pharmacistVerification} size="md" />

                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => openVerificationModal(draft, 'VERIFY')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#214F3A] hover:bg-[#173E2D] text-white text-xs font-semibold rounded min-h-[36px]"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Mark verified</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => openVerificationModal(draft, 'QUERY')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FBF2D9] hover:bg-[#E6D4A5] text-[#805A13] border border-[#E6D4A5] text-xs font-semibold rounded min-h-[36px]"
                          >
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Raise query</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* All Fields Display */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-[#F0F3ED] p-3.5 rounded-lg border border-[#D5DCD5] text-xs">
                      <div>
                        <span className="font-bold text-[#53645A] uppercase block">Prescribed Frequency</span>
                        <span className="font-semibold text-sm text-[#1F2B25]">{draft.frequencyWording || '—'}</span>
                      </div>
                      <div>
                        <span className="font-bold text-[#53645A] uppercase block">Daily Times ({draft.dosesPerDay}/day)</span>
                        <span className="font-mono font-bold text-sm text-[#214F3A]">
                          {draft.times.length > 0 ? draft.times.join(', ') : 'None scheduled'}
                        </span>
                      </div>
                      <div>
                        <span className="font-bold text-[#53645A] uppercase block">Start &amp; Duration</span>
                        <span className="font-semibold text-[#1F2B25]">
                          {draft.startDate} ({draft.ongoing ? 'Ongoing' : `Ends ${draft.endDate || '—'}`})
                        </span>
                      </div>
                      <div>
                        <span className="font-bold text-[#53645A] uppercase block">Route of Intake</span>
                        <span className="font-semibold text-[#1F2B25]">{draft.route || 'Oral'}</span>
                      </div>
                    </div>

                    {draft.sourceExcerpt && (
                      <p className="text-xs italic text-[#875E16]">
                        Prescription excerpt: &ldquo;{draft.sourceExcerpt}&rdquo;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: FULL HISTORY & ADHERENCE REPORT (With all graphs) */}
      {activeTab === 'report' && (
        <div className="space-y-6">
          {/* Reporting Range Selector */}
          <div className="bg-white border border-[#D5DCD5] rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span className="text-sm font-semibold text-[#1F2B25] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#214F3A]" />
              <span>Reporting Range:</span>
            </span>

            <div className="flex items-center gap-2 bg-[#F0F3ED] p-1 rounded-lg border border-[#D5DCD5]">
              {(['today', '7days', '30days'] as ReportRange[]).map((range) => (
                <button
                  key={range}
                  type="button"
                  onClick={() => setSelectedRange(range)}
                  className={`min-h-[40px] px-4 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition-colors ${
                    selectedRange === range
                      ? 'bg-[#214F3A] text-white shadow-xs'
                      : 'text-[#53645A] hover:text-[#1F2B25]'
                  }`}
                >
                  {range === 'today' ? 'Today' : range === '7days' ? 'Past 7 Days' : 'Past 30 Days'}
                </button>
              ))}
            </div>
          </div>

          {/* Adherence Rate Banner */}
          <div className="bg-white border border-[#D5DCD5] rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#53645A]">
                Confirmed Taken Adherence Rate ({selectedRange})
              </span>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl sm:text-5xl font-serif font-bold text-[#214F3A] tabular-nums">
                  {stats.rate}%
                </span>
                <span className="text-xs text-[#53645A]">
                  ({stats.taken} of {stats.taken + stats.missed + stats.unconfirmed} evaluated doses)
                </span>
              </div>
              <p className="text-xs text-[#53645A] pt-1">
                Formula: Taken / (Taken + Not taken + Unconfirmed), excluding upcoming pending doses.
              </p>
            </div>

            {/* Breakdown counts */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-[#EAF3ED] border border-[#B8D7C2] p-2.5 rounded-lg">
                <span className="text-[11px] font-bold text-[#266044] block">Taken</span>
                <span className="text-xl font-bold text-[#266044] tabular-nums">{stats.taken}</span>
              </div>
              <div className="bg-[#FBECEA] border border-[#F2BDB9] p-2.5 rounded-lg">
                <span className="text-[11px] font-bold text-[#A3342A] block">Missed</span>
                <span className="text-xl font-bold text-[#A3342A] tabular-nums">{stats.missed}</span>
              </div>
              <div className="bg-[#FBF2D9] border border-[#E6D4A5] p-2.5 rounded-lg">
                <span className="text-[11px] font-bold text-[#805A13] block">Unconfirmed</span>
                <span className="text-xl font-bold text-[#805A13] tabular-nums">{stats.unconfirmed}</span>
              </div>
              <div className="bg-[#F0F3ED] border border-[#D5DCD5] p-2.5 rounded-lg">
                <span className="text-[11px] font-bold text-[#53645A] block">Upcoming</span>
                <span className="text-xl font-bold text-[#53645A] tabular-nums">{stats.pendingNotCounted}</span>
              </div>
            </div>
          </div>

          {/* Graph 1: Daily Dose Status Breakdown */}
          <div className="bg-white border border-[#D5DCD5] rounded-xl p-6 shadow-xs space-y-4">
            <h3 className="text-lg font-serif font-bold text-[#1F2B25] flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#214F3A]" />
              <span>Daily Dose Adherence Timeline</span>
            </h3>

            <div className="space-y-3">
              {stats.days.map((d) => {
                const total = d.taken + d.missed + d.unconfirmed + d.pendingNotCounted;
                const takenPct = total > 0 ? (d.taken / total) * 100 : 0;
                const missedPct = total > 0 ? (d.missed / total) * 100 : 0;
                const unconfPct = total > 0 ? (d.unconfirmed / total) * 100 : 0;
                const pendingPct = total > 0 ? (d.pendingNotCounted / total) * 100 : 0;

                return (
                  <div key={d.dateStr} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-[#1F2B25]">
                      <span>{formatKolkataDate(d.dateStr)}</span>
                      <span>
                        {d.taken} taken &bull; {d.missed} missed &bull; {d.unconfirmed} unconfirmed
                      </span>
                    </div>
                    <div className="h-6 w-full bg-[#E5EAE2] rounded-md overflow-hidden flex">
                      {takenPct > 0 && (
                        <div
                          style={{ width: `${takenPct}%` }}
                          className="bg-[#266044] h-full"
                          title={`Taken: ${d.taken}`}
                        />
                      )}
                      {missedPct > 0 && (
                        <div
                          style={{ width: `${missedPct}%` }}
                          className="bg-[#A3342A] h-full"
                          title={`Missed: ${d.missed}`}
                        />
                      )}
                      {unconfPct > 0 && (
                        <div
                          style={{ width: `${unconfPct}%` }}
                          className="bg-[#875E16] h-full"
                          title={`Unconfirmed: ${d.unconfirmed}`}
                        />
                      )}
                      {pendingPct > 0 && (
                        <div
                          style={{ width: `${pendingPct}%` }}
                          className="bg-[#D5DCD5] h-full"
                          title={`Pending: ${d.pendingNotCounted}`}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Graph 2: Medicine-wise Adherence Breakdown */}
          <div className="bg-white border border-[#D5DCD5] rounded-xl p-6 shadow-xs space-y-4">
            <h3 className="text-lg font-serif font-bold text-[#1F2B25] flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#214F3A]" />
              <span>Medicine-Wise Adherence</span>
            </h3>

            <div className="space-y-3">
              {stats.byMedicine.map((m) => (
                <div key={m.medicationId} className="p-3.5 bg-[#F0F3ED] rounded-lg border border-[#D5DCD5] space-y-1.5">
                  <div className="flex justify-between text-sm font-bold text-[#1F2B25]">
                    <span>{m.name}</span>
                    <span className="font-mono text-[#214F3A]">{m.rate}% adherence</span>
                  </div>
                  <div className="h-2.5 w-full bg-[#D5DCD5] rounded-full overflow-hidden">
                    <div
                      style={{ width: `${m.rawRate}%` }}
                      className="bg-[#214F3A] h-full rounded-full"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-[#53645A]">
                    <span>Taken: {m.taken}</span>
                    <span>Missed: {m.missed}</span>
                    <span>Unconfirmed: {m.unconfirmed}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: NOTES TO PATIENT */}
      {activeTab === 'notes' && (
        <div className="space-y-6">
          {/* Add Note Form */}
          <div className="bg-white border border-[#D5DCD5] rounded-xl p-6 shadow-xs space-y-4">
            <h2 className="text-lg font-serif font-bold text-[#1F2B25] flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#214F3A]" />
              <span>Send Advisory Note to Patient</span>
            </h2>

            {/* MANDATORY DISCLAIMER LABEL */}
            <div className="p-3.5 bg-[#FBF2D9] border border-[#E6D4A5] rounded-lg text-xs text-[#805A13] flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0 text-[#875E16]" />
              <span className="font-bold">{t.pharmacistNoteDisclaimer}</span>
            </div>

            <form onSubmit={handleSendNote} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1F2B25] mb-1">
                  Applicable Medication:
                </label>
                <select
                  value={newNoteMedId}
                  onChange={(e) => setNewNoteMedId(e.target.value)}
                  className="w-full px-3 py-2 min-h-[44px] bg-white border border-[#718278] rounded text-sm text-[#1F2B25]"
                >
                  <option value="all">General note (all medicines)</option>
                  {data.medications.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.state === 'ACTIVE' ? 'Active' : 'Draft'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F2B25] mb-1">
                  Note Message: <span className="text-[#A3342A]">*</span>
                </label>
                <textarea
                  rows={3}
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder={t.enterNotePlaceholder}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#718278] rounded text-sm text-[#1F2B25] placeholder-[#718278]"
                  required
                />
              </div>

              {noteSentSuccess && (
                <div className="p-3 bg-[#EAF3ED] border border-[#B8D7C2] text-[#266044] rounded text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t.noteAddedSuccess}</span>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!newNoteText.trim()}
                  className="min-h-[44px] px-5 py-2 bg-[#214F3A] hover:bg-[#173E2D] disabled:opacity-50 text-white font-semibold text-sm rounded flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{t.sendNoteToPatient}</span>
                </button>
              </div>
            </form>
          </div>

          {/* List of Sent Notes */}
          <div className="space-y-3">
            <h3 className="text-lg font-serif font-bold text-[#1F2B25]">
              Notes Recorded for Lakshmi ({patientNotes.length})
            </h3>

            {patientNotes.length === 0 ? (
              <p className="text-sm text-[#53645A] bg-white p-6 rounded-xl border border-[#D5DCD5]">
                {t.noPharmacistNotes}
              </p>
            ) : (
              <div className="space-y-3">
                {patientNotes.map((note) => (
                  <div
                    key={note.id}
                    className="bg-white border border-[#D5DCD5] rounded-xl p-4 shadow-xs space-y-2"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-[#53645A] border-b border-[#D5DCD5] pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#1F2B25]">Pharmacist Meera</span>
                        <span>&bull;</span>
                        <span>{formatKolkataDateTime(note.createdAt)}</span>
                        {note.medicationName && (
                          <>
                            <span>&bull;</span>
                            <span className="bg-[#F0F3ED] text-[#214F3A] px-2 py-0.5 rounded font-semibold">
                              {note.medicationName}
                            </span>
                          </>
                        )}
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded font-semibold text-[11px] ${
                          note.isRead
                            ? 'bg-[#EAF3ED] text-[#266044]'
                            : 'bg-[#FBF2D9] text-[#805A13]'
                        }`}
                      >
                        {note.isRead ? 'Read by patient' : 'Unread by patient'}
                      </span>
                    </div>

                    <p className="text-sm text-[#1F2B25] whitespace-pre-wrap">
                      {note.text}
                    </p>

                    <p className="text-[11px] text-[#875E16] italic pt-1">
                      {t.pharmacistNoteDisclaimer}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: ACTIVITY AUDIT LOG */}
      {activeTab === 'activity' && (
        <div className="bg-white border border-[#D5DCD5] rounded-xl p-6 shadow-xs space-y-4">
          <h2 className="text-lg font-serif font-bold text-[#1F2B25] flex items-center gap-2">
            <History className="w-5 h-5 text-[#214F3A]" />
            <span>Patient Chronological Activity Log</span>
          </h2>
          <p className="text-xs text-[#53645A]">
            Complete tamper-evident audit trail of dose outcomes, prescription entries, verifications, and permissions.
          </p>

          <div className="divide-y divide-[#D5DCD5] overflow-x-auto">
            {data.activity_log.map((item) => (
              <div key={item.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#1F2B25] uppercase tracking-wider text-[11px] bg-[#F0F3ED] px-2 py-0.5 rounded">
                      {item.action}
                    </span>
                    <span className="text-[#53645A] font-semibold">
                      Actor: {item.actorId === 'ph_meera' ? 'Pharmacist Meera' : item.actorId === 'c_kiran' ? 'Caregiver Kiran' : 'Patient Lakshmi'}
                    </span>
                  </div>
                  <p className="text-sm text-[#1F2B25] pt-0.5">{item.details}</p>
                </div>
                <div className="text-right text-[#53645A] shrink-0 font-mono text-[11px]">
                  {formatKolkataDateTime(item.timestamp)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VERIFICATION / QUERY MODAL */}
      {verifyingMed && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
        >
          <div className="bg-white border border-[#D5DCD5] rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-lg">
            <div className="flex items-start justify-between border-b border-[#D5DCD5] pb-3">
              <div className="flex items-center gap-2 text-[#214F3A]">
                {verifyMode === 'VERIFY' ? (
                  <CheckCircle2 className="w-6 h-6 text-[#266044]" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-[#A3342A]" />
                )}
                <h3 className="text-xl font-serif font-bold text-[#1F2B25]">
                  {verifyMode === 'VERIFY' ? t.markVerifiedBtn : t.raiseQueryBtn}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setVerifyingMed(null)}
                className="text-[#53645A] hover:text-[#1F2B25] p-1 rounded min-w-[32px] min-h-[32px]"
                aria-label={t.close}
              >
                &times;
              </button>
            </div>

            {/* Target Medication Overview */}
            <div className="bg-[#F0F3ED] p-3.5 rounded-lg border border-[#D5DCD5] text-xs space-y-1">
              <p className="font-bold text-sm text-[#1F2B25]">{verifyingMed.name}</p>
              <p className="text-[#53645A]">
                {verifyingMed.strength} &bull; {verifyingMed.amountPerDose} &bull; {verifyingMed.frequencyWording}
              </p>
              <p className="font-mono text-[#214F3A]">
                Times: {verifyingMed.times.join(', ')}
              </p>
            </div>

            {verifyMode === 'VERIFY' ? (
              <div className="space-y-4">
                <div className="p-3 bg-[#EAF3ED] border border-[#B8D7C2] text-xs text-[#266044] rounded">
                  {t.verifiedDisclaimer}
                </div>

                {/* Mandatory confirmation checkbox */}
                <label className="flex items-start gap-3 cursor-pointer p-3 bg-[#FAFAF7] rounded border border-[#718278]">
                  <input
                    type="checkbox"
                    checked={confirmCheckbox}
                    onChange={(e) => setConfirmCheckbox(e.target.checked)}
                    className="w-5 h-5 mt-0.5 text-[#214F3A] rounded border-[#718278]"
                  />
                  <span className="text-sm font-semibold text-[#1F2B25] select-none">
                    {t.verifyCheckboxLabel} <span className="text-[#A3342A]">*</span>
                  </span>
                </label>

                {/* Optional note */}
                <div>
                  <label className="block text-xs font-semibold text-[#1F2B25] mb-1">
                    {t.optionalVerificationNote}
                  </label>
                  <input
                    type="text"
                    value={verificationNote}
                    onChange={(e) => setVerificationNote(e.target.value)}
                    placeholder="e.g. Verified against Dr. Rao prescription dated 10-Oct"
                    className="w-full px-3 py-2 min-h-[44px] bg-white border border-[#718278] rounded text-sm text-[#1F2B25]"
                  />
                </div>
              </div>
            ) : (
              /* RAISE QUERY MODE */
              <div className="space-y-4">
                <div className="p-3 bg-[#FBF2D9] border border-[#E6D4A5] text-xs text-[#805A13] rounded">
                  {t.pharmacistNoteDisclaimer} This query will appear prominently on the patient’s Medicines and Review screens.
                </div>

                {/* Required note */}
                <div>
                  <label className="block text-xs font-semibold text-[#1F2B25] mb-1">
                    {t.queryNoteLabel} <span className="text-[#A3342A]">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={verificationNote}
                    onChange={(e) => setVerificationNote(e.target.value)}
                    placeholder={t.queryNotePlaceholder}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#718278] rounded text-sm text-[#1F2B25]"
                    required
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#D5DCD5]">
              <button
                type="button"
                onClick={() => setVerifyingMed(null)}
                className="min-h-[44px] px-4 py-2 border border-[#718278] rounded text-sm font-semibold text-[#1F2B25]"
              >
                {t.cancel}
              </button>

              <button
                type="button"
                disabled={verifyMode === 'VERIFY' ? !confirmCheckbox : !verificationNote.trim()}
                onClick={handleConfirmVerification}
                className="min-h-[44px] px-5 py-2 bg-[#214F3A] hover:bg-[#173E2D] disabled:opacity-50 text-white rounded text-sm font-semibold flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{verifyMode === 'VERIFY' ? 'Confirm Verification' : 'Submit Query'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
