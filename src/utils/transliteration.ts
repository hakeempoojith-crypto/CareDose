import { GoogleGenAI, Type } from '@google/genai';
import { MODEL } from '../services/gemini';

export interface TransliterationEntry {
  te: string;
  hi: string;
}

// Local dictionary of 45+ common Indian medicines, prefixes, and units
export const MEDICINE_DICTIONARY: Record<string, TransliterationEntry> = {
  // Brand & Common Names
  dolo: { te: 'డోలో', hi: 'डोलो' },
  'dolo 500': { te: 'డోలో 500', hi: 'डोलो 500' },
  'dolo 650': { te: 'డోలో 650', hi: 'डोलो 650' },
  paracetamol: { te: 'పారాసిటమాల్', hi: 'पैरासिटामोल' },
  crocin: { te: 'క్రోసిన్', hi: 'क्रोसिन' },
  calpol: { te: 'కాల్పాల్', hi: 'कालपोल' },
  metformin: { te: 'మెట్‌ఫార్మిన్', hi: 'मेटफॉर्मिन' },
  'metformin hydrochloride': { te: 'మెట్‌ఫార్మిన్ హైడ్రోక్లోరైడ్', hi: 'मेटफॉर्मिन हाइड्रोक्लोराइड' },
  amoxicillin: { te: 'అమోక్సిసిలిన్', hi: 'अमोक्सिसिलिन' },
  azithromycin: { te: 'అజిత్రోమైసిన్', hi: 'एज़िथ्रोमाइसिन' },
  pantoprazole: { te: 'పాంటోప్రజోల్', hi: 'पैंटोप्राजोल' },
  'pantoprazole sodium': { te: 'పాంటోప్రజోల్ సోడియం', hi: 'पैंटोप्राजोल सोडियम' },
  cetirizine: { te: 'సెటిరిజిన్', hi: 'सेटिरिज़िन' },
  atorvastatin: { te: 'అటోర్వాస్టాటిన్', hi: 'एटोरवास्टेटिन' },
  'atorvastatin calcium': { te: 'అటోర్వాస్టాటిన్ కాల్షియం', hi: 'एटोरवास्टेटिन कैल्शियम' },
  amlodipine: { te: 'అమ్లోడిపైన్', hi: 'एम्लोडिपाइन' },
  'amlodipine besylate': { te: 'అమ్లోడిపైన్ బెసిలేట్', hi: 'एम्लोडिपाइन बेसिलेट' },
  telmisartan: { te: 'టెల్మిసార్టన్', hi: 'टेल्मीसार्टन' },
  ecosprin: { te: 'ఎకోస్ప్రిన్', hi: 'इकोस्प्रिन' },
  augmentin: { te: 'ఆగ్మెంటిన్', hi: 'ऑग्मेंटिन' },
  omeprazole: { te: 'ఒమెప్రజోల్', hi: 'ओमेप्राजोल' },
  ranitidine: { te: 'రానిటిడిన్', hi: 'रैनिटिडिन' },
  ibuprofen: { te: 'ఐబుప్రోఫెన్', hi: 'इबुप्रोफेन' },
  aspirin: { te: 'ఆస్పిరిన్', hi: 'एस्पिरिन' },
  ciprofloxacin: { te: 'సిప్రోఫ్లోక్సాసిన్', hi: 'सिप्रोफ्लोक्सासिन' },
  losartan: { te: 'లోసార్టన్', hi: 'लोसार्टन' },
  glimepiride: { te: 'గ్లిమెపిరైడ్', hi: 'ग्लिमेपिराइड' },
  rosuvastatin: { te: 'రోసువాస్టాటిన్', hi: 'रोसुवास्टेटिन' },
  montelukast: { te: 'మాంటెల్యూకాస్ట్', hi: 'मोंटेलुकास्ट' },
  levocetirizine: { te: 'లెవోసెటిరిజిన్', hi: 'लेवोसेटिरिज़िन' },
  ofloxacin: { te: 'ఒఫ్లోక్సాసిన్', hi: 'ओफ़्लोक्सासिन' },
  domperidone: { te: 'డోంపెరిడోన్', hi: 'डोमपेरिडोन' },
  diclofenac: { te: 'డైక్లోఫెనాక్', hi: 'डिक्लोफेनाक' },
  aceclofenac: { te: 'ఎసిక్లోఫెనాక్', hi: 'एसेक्लोफेनाक' },
  rabeprazole: { te: 'రాబెప్రజోల్', hi: 'रैबेप्राजोल' },
  esomeprazole: { te: 'ఎసోమెప్రజోల్', hi: 'एसोमेप्राजोल' },
  clopidogrel: { te: 'క్లోపిడోగ్రెల్', hi: 'क्लोपिडोग्रेल' },
  doxycycline: { te: 'డాక్సిసైక్లిన్', hi: 'डॉक्सीसाइक्लिन' },
  cefixime: { te: 'సెఫిక్సిమ్', hi: 'सेफिक्सिम' },
  'calcium & vitamin d3': { te: 'కాల్షియం & విటమిన్ D3', hi: 'कैल्शियम और विटामिन डी3' },
  'vitamin d3': { te: 'విటమిన్ D3', hi: 'विटामिन डी3' },
  'b-complex': { te: 'బి-కాంప్లెక్స్', hi: 'बी-कॉम्प्लेक्स' },
  multivitamin: { te: 'మల్టీవిటమిన్', hi: 'मल्टीविटामिन' },
  hydrochlorothiazide: { te: 'హైడ్రోక్లోరోథియాజైడ్', hi: 'हाइड्रोक्लोरोथियाजाइड' },
  metoprolol: { te: 'మెటోప్రొలోల్', hi: 'मेटोप्रोलोल' },
  glibenclamide: { te: 'గ్లిబెన్క్లామైడ్', hi: 'ग्लिबेन्क्लामाइड' },
  thyroxine: { te: 'థైరాక్సిన్', hi: 'थायरोक्सिन' },
  insulin: { te: 'ఇన్సులిన్', hi: 'इंसुलिन' },
};

// Prefixes and units mapping
export const PREFIX_UNIT_MAP: Record<string, TransliterationEntry> = {
  tab: { te: 'ట్యాబ్.', hi: 'टैब.' },
  'tab.': { te: 'ట్యాబ్.', hi: 'टैब.' },
  tablet: { te: 'టాబ్లెట్', hi: 'टैबलेट' },
  cap: { te: 'క్యాప్.', hi: 'कैप.' },
  'cap.': { te: 'క్యాప్.', hi: 'कैप.' },
  capsule: { te: 'క్యాప్సూల్', hi: 'कैप्सूल' },
  syp: { te: 'సిరప్', hi: 'सिरप' },
  'syp.': { te: 'సిరప్', hi: 'सिरप' },
  syrup: { te: 'సిరప్', hi: 'सिरप' },
  inj: { te: 'ఇంజెక్షన్', hi: 'इंजेक्शन' },
  'inj.': { te: 'ఇంజెక్షన్', hi: 'इंजेक्शन' },
  injection: { te: 'ఇంజెక్షన్', hi: 'इंजेक्शन' },
  mg: { te: 'మి.గ్రా.', hi: 'मि.ग्रा.' },
  ml: { te: 'మి.లీ.', hi: 'मि.ली.' },
};

/**
 * Searches the local dictionary for a medicine name.
 * Handles exact matches, stripped prefixes, and multi-word matches.
 */
export function lookupMedicineTransliteration(name: string): TransliterationEntry | null {
  if (!name || !name.trim()) return null;
  const clean = name.trim().toLowerCase();

  // 1. Direct match
  if (MEDICINE_DICTIONARY[clean]) {
    return MEDICINE_DICTIONARY[clean];
  }

  // 2. Remove common prefixes like "tab.", "cap.", "tab", etc.
  const withoutPrefix = clean.replace(/^(tab\.|cap\.|syp\.|inj\.|tab|cap|syp|inj)\s+/i, '').trim();
  if (MEDICINE_DICTIONARY[withoutPrefix]) {
    return MEDICINE_DICTIONARY[withoutPrefix];
  }

  // 3. Partial check: if whole known medicine name is contained within the string
  for (const [key, val] of Object.entries(MEDICINE_DICTIONARY)) {
    if (clean === key || clean.startsWith(key + ' ') || clean.endsWith(' ' + key)) {
      return val;
    }
  }

  return null;
}

/**
 * Calls Gemini ONLY to convert the SCRIPT (phonetic transliteration into Telugu and Hindi).
 * Uses a strict 15-second timeout and strict JSON response schema.
 * Strictly phonetic transliteration only, no medical information or translations.
 */
export async function transliterateMedicineWithGemini(
  name: string
): Promise<TransliterationEntry | null> {
  if (!name || !name.trim()) return null;

  const apiKey =
    process.env.GEMINI_API_KEY ||
    (typeof window !== 'undefined' &&
      (window as unknown as { GEMINI_API_KEY?: string }).GEMINI_API_KEY) ||
    '';

  if (!apiKey) {
    return null;
  }

  // 15-second timeout constraint
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error('Transliteration timed out after 15 seconds'));
    }, 15000);
  });

  const apiPromise = (async (): Promise<TransliterationEntry | null> => {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const promptText = `
You are a phonetic transliteration engine.
Your ONLY task is to convert the English script of this medication name into Telugu script and Hindi (Devanagari) script phonetically.

STRICT INSTRUCTIONS:
- Do NOT provide medical information, dosage instructions, or translations.
- Perform ONLY phonetic script conversion (how the English word sounds in Telugu letters and Hindi letters).
- Example: "Dolo 650" -> te: "డోలో 650", hi: "डोलो 650"
- Example: "Metformin" -> te: "మెట్‌ఫార్మిన్", hi: "मेटफॉर्मिन"
- Keep numbers as standard digits 0-9.

Input medication name: "${name}"
`;

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: promptText,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            te: {
              type: Type.STRING,
              description: 'Phonetic transliteration in Telugu script',
            },
            hi: {
              type: Type.STRING,
              description: 'Phonetic transliteration in Hindi Devanagari script',
            },
          },
          required: ['te', 'hi'],
        },
      },
    });

    const text = response.text?.trim() || '';
    if (!text) return null;

    try {
      const parsed = JSON.parse(text);
      if (parsed && typeof parsed.te === 'string' && typeof parsed.hi === 'string') {
        return {
          te: parsed.te.trim(),
          hi: parsed.hi.trim(),
        };
      }
    } catch {
      return null;
    }
    return null;
  })();

  try {
    return await Promise.race([apiPromise, timeoutPromise]);
  } catch (err) {
    console.warn('Gemini transliteration failed or timed out:', err);
    return null;
  }
}

/**
 * Returns the primary display name and optional secondary (original English) subtitle
 * for a medicine given the active language.
 */
export function getMedicineDisplay(
  originalName: string,
  transliterations?: { te?: string; hi?: string },
  lang: string = 'en'
): { primary: string; secondary: string | null } {
  if (!originalName) {
    return { primary: 'Medication', secondary: null };
  }

  if (lang === 'en') {
    return { primary: originalName, secondary: null };
  }

  // Local dictionary fallback if not pre-cached
  const localMatch = lookupMedicineTransliteration(originalName);

  if (lang === 'te') {
    const teName = transliterations?.te || localMatch?.te;
    if (teName && teName !== originalName) {
      return { primary: teName, secondary: originalName };
    }
    return { primary: originalName, secondary: null };
  }

  if (lang === 'hi') {
    const hiName = transliterations?.hi || localMatch?.hi;
    if (hiName && hiName !== originalName) {
      return { primary: hiName, secondary: originalName };
    }
    return { primary: originalName, secondary: null };
  }

  return { primary: originalName, secondary: null };
}

/**
 * Gets the text to be spoken by speech synthesis in the current language
 */
export function getSpokenMedicineName(
  originalName: string,
  transliterations?: { te?: string; hi?: string },
  lang: string = 'en'
): string {
  const display = getMedicineDisplay(originalName, transliterations, lang);
  return display.primary;
}
