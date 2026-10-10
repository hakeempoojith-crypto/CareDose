export const KOLKATA_TIMEZONE = 'Asia/Kolkata';

export function getIntlLocale(lang?: string): string {
  if (lang === 'hi' || lang === 'hi-IN') return 'hi-IN-u-nu-latn';
  if (lang === 'te' || lang === 'te-IN') return 'te-IN-u-nu-latn';
  return 'en-IN-u-nu-latn';
}

/**
 * Returns YYYY-MM-DD string for Asia/Kolkata timezone
 */
export function getKolkataDateString(date: Date = new Date()): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: KOLKATA_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(date);
}

/**
 * Returns current HH:mm in Asia/Kolkata
 */
export function getKolkataTimeString(date: Date = new Date()): string {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: KOLKATA_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  return formatter.format(date);
}

/**
 * Creates an ISO string for a given YYYY-MM-DD and HH:mm in Asia/Kolkata (+05:30)
 */
export function createKolkataISO(dateStr: string, timeStr: string): string {
  const normalizedTime = timeStr.length === 5 ? `${timeStr}:00` : timeStr;
  return `${dateStr}T${normalizedTime}+05:30`;
}

/**
 * Formats an ISO string to a friendly time display in Asia/Kolkata (e.g., 08:30 AM)
 * Digits stay 0-9 across all languages.
 */
export function formatKolkataTime(isoString: string, lang: string = 'en'): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return new Intl.DateTimeFormat(getIntlLocale(lang), {
      timeZone: KOLKATA_TIMEZONE,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(d);
  } catch {
    return isoString;
  }
}

/**
 * Formats an ISO string or YYYY-MM-DD to friendly date in Asia/Kolkata
 * Digits stay 0-9 across all languages.
 */
export function formatKolkataDate(isoOrDateString: string, lang: string = 'en'): string {
  try {
    let d: Date;
    if (isoOrDateString.includes('T')) {
      d = new Date(isoOrDateString);
    } else {
      d = new Date(`${isoOrDateString}T12:00:00+05:30`);
    }
    if (isNaN(d.getTime())) return isoOrDateString;
    return new Intl.DateTimeFormat(getIntlLocale(lang), {
      timeZone: KOLKATA_TIMEZONE,
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return isoOrDateString;
  }
}

/**
 * Formats an ISO string to both date and time in Asia/Kolkata
 */
export function formatKolkataDateTime(isoString: string, lang: string = 'en'): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return new Intl.DateTimeFormat(getIntlLocale(lang), {
      timeZone: KOLKATA_TIMEZONE,
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(d);
  } catch {
    return isoString;
  }
}

/**
 * Add days to YYYY-MM-DD date in Kolkata calendar
 */
export function addDaysToDateString(dateStr: string, days: number): string {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  
  const d = new Date(Date.UTC(year, month, day + days, 12, 0, 0));
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

/**
 * Returns an array of date strings [today, today+1, ..., today+6] (7 days total)
 */
export function getRollingKolkataDates(startDateStr: string, count: number = 7): string[] {
  const dates: string[] = [];
  for (let i = 0; i < count; i++) {
    dates.push(addDaysToDateString(startDateStr, i));
  }
  return dates;
}
