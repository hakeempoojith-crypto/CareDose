import { DoseOccurrence, EffectiveStatus, Medication } from '../types';
import { createKolkataISO, getRollingKolkataDates } from './timezone';

/**
 * Calculates effective status for a dose given reference time (defaults to Date.now())
 */
export function getEffectiveStatus(
  dose: DoseOccurrence,
  nowMs: number = Date.now()
): EffectiveStatus {
  if (dose.status === 'TAKEN') return 'Taken';
  if (dose.status === 'MISSED') return 'Missed';
  if (dose.status === 'UNCONFIRMED') return 'Unconfirmed';
  if (dose.status === 'CANCELLED') return 'Cancelled';

  // Dose is PENDING
  const scheduledMs = new Date(dose.scheduledAt).getTime();
  const windowEndMs = scheduledMs + 60 * 60 * 1000; // scheduledAt + 60 min

  if (nowMs < scheduledMs) {
    return 'Upcoming';
  } else if (nowMs <= windowEndMs) {
    return 'Due';
  } else {
    return 'Unconfirmed';
  }
}

/**
 * Determines whether user can take action (mark Taken / Not taken) on a dose
 */
export function isDoseActionAllowed(
  dose: DoseOccurrence,
  nowMs: number = Date.now()
): { allowed: boolean; reason?: string } {
  const scheduledMs = new Date(dose.scheduledAt).getTime();

  if (dose.status === 'CANCELLED') {
    return { allowed: false, reason: 'This scheduled dose was cancelled.' };
  }

  // If pending and before scheduled time
  if (dose.status === 'PENDING' && nowMs < scheduledMs) {
    return {
      allowed: false,
      reason: 'Dose cannot be recorded before scheduled dose time.',
    };
  }

  // Already past or in window or correcting an existing outcome
  return { allowed: true };
}

/**
 * Generates rolling occurrences for a medication for today + next 6 days (7 days total)
 * Never duplicates existing medicationId + scheduledAt
 */
export function generateRollingOccurrences(
  med: Medication,
  todayDateStr: string,
  existingOccurrences: DoseOccurrence[]
): DoseOccurrence[] {
  if (med.state !== 'ACTIVE') return [];

  const targetDates = getRollingKolkataDates(todayDateStr, 7);
  const existingSet = new Set(
    existingOccurrences
      .filter((o) => o.medicationId === med.id)
      .map((o) => o.scheduledAt)
  );

  const newOccurrences: DoseOccurrence[] = [];

  for (const dateStr of targetDates) {
    // Check start date (cannot generate before start date)
    if (dateStr < med.startDate) {
      continue;
    }

    // Check end date (if not ongoing, cannot generate after end date)
    if (!med.ongoing && med.endDate && dateStr > med.endDate) {
      continue;
    }

    for (const timeStr of med.times) {
      const scheduledAt = createKolkataISO(dateStr, timeStr);
      if (!existingSet.has(scheduledAt)) {
        existingSet.add(scheduledAt);
        newOccurrences.push({
          id: `occ_${med.id}_${dateStr}_${timeStr.replace(':', '')}`,
          medicationId: med.id,
          scheduledAt,
          status: 'PENDING',
        });
      }
    }
  }

  return newOccurrences;
}

/**
 * Analyzes medication data to generate review flags for drafts
 */
export function evaluateReviewFlags(
  draft: Partial<Medication>,
  otherMeds: Medication[] = []
): string[] {
  const flags: string[] = [];

  // 1. Missing required fields
  if (!draft.name?.trim()) {
    flags.push('Missing medicine name');
  }
  if (!draft.strength?.trim() || draft.strength.toLowerCase().includes('not specified')) {
    flags.push('Strength not specified (Needs review)');
  }
  if (!draft.amountPerDose?.trim() || draft.amountPerDose.toLowerCase().includes('not specified')) {
    flags.push('Amount not specified (Needs review)');
  }
  if (!draft.frequencyWording?.trim()) {
    flags.push('Missing prescribed frequency wording');
  }
  if (!draft.startDate) {
    flags.push('Missing start date');
  }
  if (!draft.ongoing && !draft.endDate) {
    flags.push('Missing end date or ongoing duration');
  }
  if (draft.endDate && draft.startDate && draft.endDate < draft.startDate) {
    flags.push('End date is earlier than start date');
  }

  // 2. Times checks
  const times = draft.times || [];
  const dosesPerDay = draft.dosesPerDay || 0;

  if (dosesPerDay < 1 || dosesPerDay > 6) {
    flags.push('Doses per day must be between 1 and 6');
  }

  if (times.length !== dosesPerDay) {
    flags.push(`Scheduled times count (${times.length}) does not match doses per day (${dosesPerDay})`);
  }

  const uniqueTimes = new Set(times);
  if (uniqueTimes.size !== times.length) {
    flags.push('Dose times must be unique within a day');
  }

  // 3. Frequency wording vs doses per day mismatch
  const wording = (draft.frequencyWording || '').toLowerCase();
  if (
    (wording.includes('once') || wording.includes('1 time') || wording.includes('1x') || wording.includes('od')) &&
    dosesPerDay !== 1
  ) {
    flags.push('Frequency wording mentions once daily, but doses per day is not 1');
  } else if (
    (wording.includes('twice') || wording.includes('2 times') || wording.includes('2x') || wording.includes('bid') || wording.includes('bd')) &&
    dosesPerDay !== 2
  ) {
    flags.push('Frequency wording mentions twice daily, but doses per day is not 2');
  } else if (
    (wording.includes('thrice') || wording.includes('3 times') || wording.includes('3x') || wording.includes('tid')) &&
    dosesPerDay !== 3
  ) {
    flags.push('Frequency wording mentions thrice daily, but doses per day is not 3');
  } else if (
    (wording.includes('four times') || wording.includes('4 times') || wording.includes('4x') || wording.includes('qid')) &&
    dosesPerDay !== 4
  ) {
    flags.push('Frequency wording mentions 4 times daily, but doses per day is not 4');
  }

  // 4. Unsupported schedule wording
  const unsupportedPatterns = [
    'as needed',
    'prn',
    'sos',
    'weekly',
    'alternate day',
    'every other day',
    'monthly',
    'if required',
  ];
  for (const pattern of unsupportedPatterns) {
    if (wording.includes(pattern)) {
      flags.push(`Prescription specifies "${pattern}", which requires fixed daily hours in this version`);
    }
  }

  // 5. Possible duplicate (same name + strength)
  if (draft.name && draft.strength) {
    const normName = draft.name.trim().toLowerCase();
    const normStrength = draft.strength.trim().toLowerCase();
    const duplicate = otherMeds.find(
      (m) =>
        m.id !== draft.id &&
        m.name.trim().toLowerCase() === normName &&
        m.strength.trim().toLowerCase() === normStrength
    );
    if (duplicate) {
      flags.push(`Possible duplicate: "${duplicate.name} ${duplicate.strength}" is already recorded`);
    }
  }

  return flags;
}
