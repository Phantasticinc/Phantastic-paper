/** A legal page as data, so the same text renders on the site and exports to plain text. */
export interface LegalSection {
  /** Anchor id, e.g. "simulated-results" (linked as /terms#simulated-results). */
  id: string;
  title: string;
  /** Plain strings. Inline links use [text](/path). */
  paragraphs: string[];
  /** Optional bullet list rendered after the paragraphs. */
  bullets?: string[];
}

export interface LegalDoc {
  title: string;
  /** Intro line under the title. */
  intro: string;
  effective: string;
  sections: LegalSection[];
}
