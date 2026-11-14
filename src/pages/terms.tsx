import { LegalPage } from "@/components/policy/LegalPage";
import { TERMS } from "@/content/legal/terms";

// Draft, pending review (see src/content/legal/terms.ts).
export function TermsPage() {
  return <LegalPage doc={TERMS} />;
}
