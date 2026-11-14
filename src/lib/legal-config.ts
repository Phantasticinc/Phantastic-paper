/**
 * Facts used by the legal pages. ONE place to fill in the unknowns.
 * Anything in [square brackets] is a placeholder that must be replaced before the legal pages
 * go live on phantastic.net. `npm run check:legal` lists what is still open (warning only).
 */
export const LEGAL = {
  /** Given by Eli (Huy's legal assistant). */
  entity: "Phantastic.Vanguard LLC",
  product: "Phantastic Paper",
  contactEmail: "[contact email]",
  mailingAddress: "[mailing address]",
  governingState: "[state whose law governs]",
  disputeVenue: "[venue for disputes, set by counsel]",
  liabilityCap: "[liability cap amount, e.g. fifty U.S. dollars]",
  effectiveDate: "[effective date]",
  minAge: 18,
  /** Bump when the Terms or Privacy text changes in a way users should re-accept. */
  termsVersion: "draft-1",
} as const;
