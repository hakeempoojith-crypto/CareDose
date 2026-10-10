import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { CaregiverAlert, DoseOccurrence, Medication } from '../types';
import {
  addDaysToDateString,
  createKolkataISO,
  getKolkataDateString,
} from '../utils/timezone';

export interface DemoContextType {
  simulatedTimeMs: number;
  medications: Medication[];
  occurrences: DoseOccurrence[];
  alerts: CaregiverAlert[];
  advanceTime: (minutes: number) => void;
  advanceDay: () => void;
  resetClock: () => void;
  resetDemoData: () => void;
  recordDemoDose: (occurrenceId: string, status: 'TAKEN' | 'MISSED') => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

const DEMO_MEDICATIONS: Medication[] = [
  {
    id: 'demo_med_1',
    patientId: 'demo_patient',
    name: 'Metformin Hydrochloride',
    strength: '500 mg',
    amountPerDose: '1 tablet',
    frequencyWording: 'Twice daily after food',
    dosesPerDay: 2,
    times: ['08:00', '20:00'],
    startDate: '2026-10-01',
    ongoing: true,
    instructions: 'Take with food',
    route: 'Oral',
    state: 'ACTIVE',
    reviewFlags: [],
    nameTransliterations: {
      te: 'మెట్‌ఫార్మిన్ హైడ్రోక్లోరైడ్',
      hi: 'मेटफॉर्मिन हाइड्रोक्लोराइड',
    },
  },
  {
    id: 'demo_med_2',
    patientId: 'demo_patient',
    name: 'Amlodipine Besylate',
    strength: '5 mg',
    amountPerDose: '1 tablet',
    frequencyWording: 'Once daily morning',
    dosesPerDay: 1,
    times: ['09:00'],
    startDate: '2026-10-01',
    ongoing: true,
    instructions: 'Take in the morning',
    route: 'Oral',
    state: 'ACTIVE',
    reviewFlags: [],
    nameTransliterations: {
      te: 'అమ్లోడిపైన్ బెసిలేట్',
      hi: 'एम्लोडिपाइन बेसिलेट',
    },
  },
  {
    id: 'demo_med_3',
    patientId: 'demo_patient',
    name: 'Atorvastatin Calcium',
    strength: '10 mg',
    amountPerDose: '1 tablet',
    frequencyWording: 'Once daily bedtime',
    dosesPerDay: 1,
    times: ['21:00'],
    startDate: '2026-10-01',
    ongoing: true,
    instructions: 'Take before sleep',
    route: 'Oral',
    state: 'ACTIVE',
    reviewFlags: [],
    nameTransliterations: {
      te: 'అటోర్వాస్టాటిన్ కాల్షియం',
      hi: 'एटोरवास्टेटिन कैल्शियम',
    },
  },
  {
    id: 'demo_med_4',
    patientId: 'demo_patient',
    name: 'Pantoprazole Sodium',
    strength: '40 mg',
    amountPerDose: '1 tablet',
    frequencyWording: 'Once daily empty stomach',
    dosesPerDay: 1,
    times: ['07:00'],
    startDate: '2026-10-01',
    ongoing: true,
    instructions: 'Take 30 minutes before breakfast',
    route: 'Oral',
    state: 'ACTIVE',
    reviewFlags: [],
    nameTransliterations: {
      te: 'పాంటోప్రజోల్ సోడియం',
      hi: 'पैंटोप्राजोल सोडियम',
    },
  },
  {
    id: 'demo_med_5',
    patientId: 'demo_patient',
    name: 'Calcium & Vitamin D3',
    strength: '500 mg / 250 IU',
    amountPerDose: '1 tablet',
    frequencyWording: 'Once daily afternoon',
    dosesPerDay: 1,
    times: ['14:00'],
    startDate: '2026-10-01',
    ongoing: true,
    instructions: 'Take after lunch',
    route: 'Oral',
    state: 'ACTIVE',
    reviewFlags: [],
    nameTransliterations: {
      te: 'కాల్షియం & విటమిన్ D3',
      hi: 'कैल्शियम और विटामिन डी3',
    },
  },
];

// Generates the strict seed fixture:
// 6 doses per day for 7 completed days = 42 occurrences
// Exactly 36 TAKEN, 3 MISSED, 3 UNCONFIRMED => 36 / 42 = 85.7% Confirmed taken.
function generateSeedOccurrences(): DoseOccurrence[] {
  const baseToday = getKolkataDateString();
  const occurrences: DoseOccurrence[] = [];
  const scheduledSlotMeds = [
    { medId: 'demo_med_4', time: '07:00' }, // Pantoprazole
    { medId: 'demo_med_1', time: '08:00' }, // Metformin dose 1
    { medId: 'demo_med_2', time: '09:00' }, // Amlodipine
    { medId: 'demo_med_5', time: '14:00' }, // Calcium
    { medId: 'demo_med_1', time: '20:00' }, // Metformin dose 2
    { medId: 'demo_med_3', time: '21:00' }, // Atorvastatin
  ];

  // 7 completed days preceding today: day -7 to day -1
  let index = 0;
  // We want exactly 36 Taken, 3 Missed, 3 Unconfirmed across the 42 occurrences.
  // We can distribute the 3 missed and 3 unconfirmed across days 3, 5, 6
  const missedIndices = new Set([11, 23, 35]); // exactly 3
  const unconfirmedIndices = new Set([17, 29, 41]); // exactly 3

  for (let dayOffset = -7; dayOffset <= -1; dayOffset++) {
    const dayDate = addDaysToDateString(baseToday, dayOffset);
    for (const slot of scheduledSlotMeds) {
      const scheduledAt = createKolkataISO(dayDate, slot.time);
      let status: 'TAKEN' | 'MISSED' | 'UNCONFIRMED' = 'TAKEN';
      let recordedAt: string | undefined = `${scheduledAt.replace('+05:30', '')}+05:30`;

      if (missedIndices.has(index)) {
        status = 'MISSED';
        recordedAt = `${scheduledAt.replace('+05:30', '')}+05:30`;
      } else if (unconfirmedIndices.has(index)) {
        status = 'UNCONFIRMED';
        recordedAt = undefined;
      }

      occurrences.push({
        id: `demo_occ_${index}`,
        medicationId: slot.medId,
        scheduledAt,
        status,
        recordedAt,
        isSimulated: true,
      });

      index++;
    }
  }

  // Also add today's 6 doses for live interaction
  scheduledSlotMeds.forEach((slot, i) => {
    occurrences.push({
      id: `demo_today_${i}`,
      medicationId: slot.medId,
      scheduledAt: createKolkataISO(baseToday, slot.time),
      status: i < 2 ? 'TAKEN' : 'PENDING',
      recordedAt: i < 2 ? createKolkataISO(baseToday, slot.time) : undefined,
      isSimulated: true,
    });
  });

  return occurrences;
}

function generateSeedAlerts(occurrences: DoseOccurrence[]): CaregiverAlert[] {
  const alerts: CaregiverAlert[] = [];
  occurrences.forEach((occ) => {
    if (occ.status === 'MISSED' || occ.status === 'UNCONFIRMED') {
      const med = DEMO_MEDICATIONS.find((m) => m.id === occ.medicationId);
      alerts.push({
        id: `demo_alert_${occ.id}`,
        patientId: 'demo_patient',
        occurrenceId: occ.id,
        medicationName: med ? med.name : 'Medication',
        scheduledAt: occ.scheduledAt,
        status: occ.status,
        acknowledged: false,
        createdAt: occ.scheduledAt,
      });
    }
  });
  return alerts;
}

export const DemoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [simulatedTimeMs, setSimulatedTimeMs] = useState<number>(() => Date.now());
  const [occurrences, setOccurrences] = useState<DoseOccurrence[]>(generateSeedOccurrences);
  const [alerts, setAlerts] = useState<CaregiverAlert[]>(() => generateSeedAlerts(occurrences));

  const advanceTime = useCallback((minutes: number) => {
    setSimulatedTimeMs((prev) => prev + minutes * 60 * 1000);
  }, []);

  const advanceDay = useCallback(() => {
    setSimulatedTimeMs((prev) => prev + 24 * 60 * 60 * 1000);
  }, []);

  const resetClock = useCallback(() => {
    setSimulatedTimeMs(Date.now());
  }, []);

  const resetDemoData = useCallback(() => {
    const freshOcc = generateSeedOccurrences();
    setOccurrences(freshOcc);
    setAlerts(generateSeedAlerts(freshOcc));
    setSimulatedTimeMs(Date.now());
  }, []);

  const recordDemoDose = useCallback((occurrenceId: string, status: 'TAKEN' | 'MISSED') => {
    setOccurrences((prev) =>
      prev.map((occ) => {
        if (occ.id === occurrenceId) {
          return {
            ...occ,
            status,
            recordedAt: new Date(simulatedTimeMs).toISOString(),
          };
        }
        return occ;
      })
    );
  }, [simulatedTimeMs]);

  const value = useMemo(
    () => ({
      simulatedTimeMs,
      medications: DEMO_MEDICATIONS,
      occurrences,
      alerts,
      advanceTime,
      advanceDay,
      resetClock,
      resetDemoData,
      recordDemoDose,
    }),
    [
      simulatedTimeMs,
      occurrences,
      alerts,
      advanceTime,
      advanceDay,
      resetClock,
      resetDemoData,
      recordDemoDose,
    ]
  );

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
};

export const useDemo = (): DemoContextType => {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
};
