import { GoogleGenAI, Type } from '@google/genai';
import { ExtractedPrescriptionItem } from '../types';

export const MODEL = 'gemini-3.8-flash';

// Retrieve API key safely from environment injection
const getApiKey = (): string => {
  return (
    process.env.GEMINI_API_KEY ||
    (typeof window !== 'undefined' && (window as unknown as { GEMINI_API_KEY?: string }).GEMINI_API_KEY) ||
    ''
  );
};

/**
 * Extracts prescription details from a base64 encoded image using Gemini.
 * Times out after 25 seconds as required.
 */
export async function extractPrescriptionFromImage(
  base64Data: string,
  mimeType: string = 'image/jpeg'
): Promise<ExtractedPrescriptionItem[]> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('No API key configured for Gemini');
  }

  // 25-second timeout constraint
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error('Extraction timed out after 25 seconds'));
    }, 25000);
  });

  const extractionPromise = (async (): Promise<ExtractedPrescriptionItem[]> => {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const promptText = `
You are a medical prescription text extractor for a personal notebook.
Your task is to transcribe printed or handwritten medications from this prescription photo.

IMPORTANT RULES:
- Extract up to 10 distinct medications shown in the image.
- Copy ONLY what is explicitly printed or written on the prescription.
- Do NOT guess, do NOT invent missing details, and do NOT extrapolate.
- If any field is unclear, ambiguous, or not mentioned, return null for that field.
- Copy verbatim the exact text for sourceExcerpt showing where you extracted the info.
- Return the results conforming strictly to the JSON schema.
`;

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType,
              },
            },
            {
              text: promptText,
            },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: {
                type: Type.STRING,
                description: 'Exact medication name as printed, or null if unclear',
              },
              strength: {
                type: Type.STRING,
                description: 'Strength e.g. 500 mg, 10 mg, or null if unclear',
              },
              amountPerDose: {
                type: Type.STRING,
                description: 'Amount per dose e.g. 1 tablet, 5 ml, or null if unclear',
              },
              frequencyWording: {
                type: Type.STRING,
                description: 'Verbatim frequency wording e.g. Twice daily after meals, or null if unclear',
              },
              instructions: {
                type: Type.STRING,
                description: 'Any printed instructions e.g. After food, or null if none',
              },
              route: {
                type: Type.STRING,
                description: 'Route of administration e.g. Oral, Topical, or null if not mentioned',
              },
              sourceExcerpt: {
                type: Type.STRING,
                description: 'Verbatim snippet from the image that this item was transcribed from',
              },
            },
            required: ['name'],
          },
        },
      },
    });

    const responseText = response.text?.trim() || '';
    if (!responseText) {
      throw new Error('Empty response from model');
    }

    const cleanExtractValue = (val: unknown): string | null => {
      if (typeof val !== 'string') return null;
      const s = val.trim();
      if (!s) return null;
      const lower = s.toLowerCase();
      if (lower === 'null' || lower === 'undefined' || lower === 'unspecified' || lower === 'n/a' || lower === 'none') {
        return null;
      }
      return s;
    };

    try {
      const parsed = JSON.parse(responseText);
      if (Array.isArray(parsed)) {
        return parsed.slice(0, 10).map((item) => ({
          name: cleanExtractValue(item.name),
          strength: cleanExtractValue(item.strength),
          amountPerDose: cleanExtractValue(item.amountPerDose),
          frequencyWording: cleanExtractValue(item.frequencyWording),
          instructions: cleanExtractValue(item.instructions),
          route: cleanExtractValue(item.route),
          sourceExcerpt: cleanExtractValue(item.sourceExcerpt),
        }));
      }
      return [];
    } catch (parseError) {
      throw new Error(`Failed to parse extracted JSON: ${parseError}`);
    }
  })();

  return Promise.race([extractionPromise, timeoutPromise]);
}

/**
 * Returns 3 fictional sample prescription items for demonstration and testing without an image.
 */
export function getFictionalSamplePrescriptions(): ExtractedPrescriptionItem[] {
  return [
    {
      name: 'Metformin Hydrochloride',
      strength: '500 mg',
      amountPerDose: '1 tablet',
      frequencyWording: 'Twice daily with breakfast and dinner',
      instructions: 'Take after food with water',
      route: 'Oral',
      sourceExcerpt: 'Tab Metformin 500mg 1 tab BD pc',
    },
    {
      name: 'Amlodipine Besylate',
      strength: '5 mg',
      amountPerDose: '1 tablet',
      frequencyWording: 'Once daily in the morning',
      instructions: 'Take at consistent time daily',
      route: 'Oral',
      sourceExcerpt: 'Tab Amlodipine 5mg 1 tab OD morning',
    },
    {
      name: 'Atorvastatin Calcium',
      strength: '10 mg',
      amountPerDose: '1 tablet',
      frequencyWording: 'Once daily at bedtime',
      instructions: 'Take at night after dinner',
      route: 'Oral',
      sourceExcerpt: 'Tab Atorvastatin 10mg 1 tab HS',
    },
  ];
}
