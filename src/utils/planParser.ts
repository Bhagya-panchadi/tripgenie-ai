import { ParsedTravelPlanSections } from '../types/travel';

/**
 * Intelligently separates a monolithic markdown or text travel plan
 * into structured sections:
 * - overview
 * - flights
 * - accommodation
 * - itinerary
 * - food
 * - transportation
 * - budget
 */
export function extractPlanSections(text: string): ParsedTravelPlanSections {
  if (!text) {
    return {};
  }

  const sections: ParsedTravelPlanSections = {};

  // Normalize line endings
  const content = text.replace(/\r\n/g, '\n');

  // Regex patterns to match headings or section starters
  // e.g. # Overview, ## Flights, **Accommodation**, 2. Flight Options, ### Daily Itinerary
  const sectionHeaders = [
    { key: 'overview' as const, patterns: [/overview|summary|trip summary|introduction|about this trip/i] },
    { key: 'flights' as const, patterns: [/flight|airfare|airline|flying/i] },
    { key: 'accommodation' as const, patterns: [/accommodation|hotel|resort|stay|lodging/i] },
    { key: 'itinerary' as const, patterns: [/itinerary|day-by-day|daily itinerary|day \d|schedule|activities|sightseeing/i] },
    { key: 'food' as const, patterns: [/food|dining|cuisine|restaurant|eatery|culinary|meals/i] },
    { key: 'transportation' as const, patterns: [/transport|local commute|metro|transit|cab|taxi|getting around/i] },
    { key: 'budget' as const, patterns: [/budget|cost breakdown|estimated cost|expense|pricing|total budget|financial/i] },
  ];

  // Split by markdown headings: #, ##, ###, or **Heading** on separate lines
  const lines = content.split('\n');
  let currentKey: keyof ParsedTravelPlanSections = 'general';
  let accumulated: Record<string, string[]> = {
    overview: [],
    flights: [],
    accommodation: [],
    itinerary: [],
    food: [],
    transportation: [],
    budget: [],
    general: [],
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check if line looks like a header (Markdown heading or bold line)
    const isHeading =
      /^#{1,4}\s+/.test(trimmed) ||
      (/^\*\*[^*]+\*\*:?$/.test(trimmed) && trimmed.length < 60) ||
      (/^(\d+\.|\b(Section|Part)\b)\s+/.test(trimmed) && trimmed.length < 50);

    if (isHeading) {
      const cleanHeader = trimmed.replace(/^#{1,4}\s+/, '').replace(/\*\*/g, '').replace(/:$/, '').trim();

      // Find matching key
      let matched = false;
      for (const headerDef of sectionHeaders) {
        if (headerDef.patterns.some((p) => p.test(cleanHeader))) {
          currentKey = headerDef.key;
          matched = true;
          break;
        }
      }

      if (!matched && !accumulated[currentKey]?.length && currentKey === 'general') {
        currentKey = 'overview';
      }
    }

    if (currentKey) {
      accumulated[currentKey].push(line);
    }
  }

  // Populate sections object if content exists
  for (const [key, linesArr] of Object.entries(accumulated)) {
    const val = linesArr.join('\n').trim();
    if (val) {
      sections[key as keyof ParsedTravelPlanSections] = val;
    }
  }

  // If parsing resulted in everything in general or overview, provide whole text under overview
  if (!sections.flights && !sections.accommodation && !sections.itinerary && !sections.budget) {
    sections.overview = content;
  }

  return sections;
}
