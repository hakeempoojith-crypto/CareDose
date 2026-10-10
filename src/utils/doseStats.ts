import { DoseOccurrence, EffectiveStatus, Medication } from '../types';
import { getEffectiveStatus } from './doseStatus';
import { addDaysToDateString, getKolkataDateString } from './timezone';

export type ReportRange = 'today' | '7days' | '30days';

export interface DayDoseStat {
  dateStr: string;
  isToday: boolean;
  taken: number;
  missed: number;
  unconfirmed: number;
  pendingNotCounted: number;
  totalCounted: number;
  rate: string; // "85.7" or "—"
  rawRate: number;
}

export interface MedicineDoseStat {
  medicationId: string;
  name: string;
  strength: string;
  taken: number;
  missed: number;
  unconfirmed: number;
  totalCounted: number;
  rate: string;
  rawRate: number;
}

export interface TimeSlotDoseStat {
  timeSlot: string; // HH:mm
  taken: number;
  missed: number;
  unconfirmed: number;
  totalCounted: number;
}

export interface DoseStatsResult {
  range: ReportRange;
  taken: number;
  missed: number;
  unconfirmed: number;
  pendingNotCounted: number;
  totalCounted: number;
  rate: string; // "85.7" or "—"
  rawRate: number;
  days: DayDoseStat[];
  byMedicine: MedicineDoseStat[];
  byTimeSlot: TimeSlotDoseStat[];
  hasData: boolean;
}

/**
 * Single source of truth selector function for dose statistics.
 * Derives all metrics dynamically from occurrences and medications.
 * Never stores separate counts.
 */
export function getDoseStats(
  occurrences: DoseOccurrence[],
  range: ReportRange = '7days',
  medications: Medication[] = [],
  referenceTimeMs: number = Date.now()
): DoseStatsResult {
  const refDateObj = new Date(referenceTimeMs);
  const todayStr = getKolkataDateString(refDateObj);

  // Build target date strings list (chronological order)
  const targetDateStrings: string[] = [];
  if (range === 'today') {
    targetDateStrings.push(todayStr);
  } else if (range === '7days') {
    // 7 days ending today (today - 6 days through today)
    for (let i = 6; i >= 0; i--) {
      targetDateStrings.push(addDaysToDateString(todayStr, -i));
    }
  } else if (range === '30days') {
    // 30 days ending today (today - 29 days through today)
    for (let i = 29; i >= 0; i--) {
      targetDateStrings.push(addDaysToDateString(todayStr, -i));
    }
  }

  const dateSet = new Set(targetDateStrings);

  // Filter occurrences that fall into the selected date range
  const scopedOccurrences = occurrences.filter((occ) => {
    const occDate = occ.scheduledAt.split('T')[0];
    return dateSet.has(occDate);
  });

  // Medicine map for quick lookup
  const medMap = new Map<string, Medication>();
  medications.forEach((m) => medMap.set(m.id, m));

  // Overall counters
  let totalTaken = 0;
  let totalMissed = 0;
  let totalUnconfirmed = 0;
  let totalPendingNotCounted = 0;

  // Day map
  const dayStatsMap = new Map<string, DayDoseStat>();
  targetDateStrings.forEach((dStr) => {
    dayStatsMap.set(dStr, {
      dateStr: dStr,
      isToday: dStr === todayStr,
      taken: 0,
      missed: 0,
      unconfirmed: 0,
      pendingNotCounted: 0,
      totalCounted: 0,
      rate: '—',
      rawRate: 0,
    });
  });

  // Medicine stats map
  const medStatsMap = new Map<
    string,
    { taken: number; missed: number; unconfirmed: number }
  >();

  // Time slot stats map
  const timeSlotMap = new Map<
    string,
    { taken: number; missed: number; unconfirmed: number }
  >();

  scopedOccurrences.forEach((occ) => {
    const occDate = occ.scheduledAt.split('T')[0];
    const dayStat = dayStatsMap.get(occDate);
    const effStatus: EffectiveStatus = getEffectiveStatus(occ, referenceTimeMs);

    // Scheduled time slot (HH:mm)
    const timeMatch = occ.scheduledAt.match(/T(\d{2}:\d{2})/);
    const timeSlot = timeMatch ? timeMatch[1] : 'Unknown';

    if (!timeSlotMap.has(timeSlot)) {
      timeSlotMap.set(timeSlot, { taken: 0, missed: 0, unconfirmed: 0 });
    }
    const slotEntry = timeSlotMap.get(timeSlot)!;

    if (!medStatsMap.has(occ.medicationId)) {
      medStatsMap.set(occ.medicationId, { taken: 0, missed: 0, unconfirmed: 0 });
    }
    const medEntry = medStatsMap.get(occ.medicationId)!;

    if (effStatus === 'Taken') {
      totalTaken++;
      if (dayStat) dayStat.taken++;
      medEntry.taken++;
      slotEntry.taken++;
    } else if (effStatus === 'Missed') {
      totalMissed++;
      if (dayStat) dayStat.missed++;
      medEntry.missed++;
      slotEntry.missed++;
    } else if (effStatus === 'Unconfirmed') {
      totalUnconfirmed++;
      if (dayStat) dayStat.unconfirmed++;
      medEntry.unconfirmed++;
      slotEntry.unconfirmed++;
    } else {
      // Upcoming or Due: not counted in adherence rate
      totalPendingNotCounted++;
      if (dayStat) dayStat.pendingNotCounted++;
    }
  });

  // Calculate day rates
  const days: DayDoseStat[] = targetDateStrings.map((dStr) => {
    const stat = dayStatsMap.get(dStr)!;
    stat.totalCounted = stat.taken + stat.missed + stat.unconfirmed;
    if (stat.totalCounted > 0) {
      stat.rawRate = (stat.taken / stat.totalCounted) * 100;
      stat.rate = stat.rawRate.toFixed(1);
    } else {
      stat.rawRate = 0;
      stat.rate = '—';
    }
    return stat;
  });

  // Overall totals
  const totalCounted = totalTaken + totalMissed + totalUnconfirmed;
  let rawRate = 0;
  let rate = '—';
  if (totalCounted > 0) {
    rawRate = (totalTaken / totalCounted) * 100;
    rate = rawRate.toFixed(1);
  }

  // Calculate per medicine stats
  const byMedicine: MedicineDoseStat[] = [];
  medStatsMap.forEach((entry, medId) => {
    const med = medMap.get(medId);
    const counted = entry.taken + entry.missed + entry.unconfirmed;
    const medRaw = counted > 0 ? (entry.taken / counted) * 100 : 0;
    const medRate = counted > 0 ? medRaw.toFixed(1) : '—';

    byMedicine.push({
      medicationId: medId,
      name: med?.name || 'Medication',
      strength: med?.strength || 'Strength not specified',
      taken: entry.taken,
      missed: entry.missed,
      unconfirmed: entry.unconfirmed,
      totalCounted: counted,
      rate: medRate,
      rawRate: medRaw,
    });
  });
  byMedicine.sort((a, b) => b.totalCounted - a.totalCounted);

  // Calculate time of day stats
  const byTimeSlot: TimeSlotDoseStat[] = [];
  timeSlotMap.forEach((entry, slot) => {
    byTimeSlot.push({
      timeSlot: slot,
      taken: entry.taken,
      missed: entry.missed,
      unconfirmed: entry.unconfirmed,
      totalCounted: entry.taken + entry.missed + entry.unconfirmed,
    });
  });
  byTimeSlot.sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));

  return {
    range,
    taken: totalTaken,
    missed: totalMissed,
    unconfirmed: totalUnconfirmed,
    pendingNotCounted: totalPendingNotCounted,
    totalCounted,
    rate,
    rawRate,
    days,
    byMedicine,
    byTimeSlot,
    hasData: totalCounted > 0,
  };
}
