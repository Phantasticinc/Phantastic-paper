import { DeleteLocalData } from "@/components/policy/DeleteLocalData";
import { LegalPage } from "@/components/policy/LegalPage";
import { PRIVACY } from "@/content/legal/privacy";

// Draft, pending review (see src/content/legal/privacy.ts). Text lives there so it can also be
// exported as plain text for legal review (`npm run export:legal`).
export function PrivacyPage() {
  return (
    <LegalPage doc={PRIVACY} extras={{ delete: <DeleteLocalData /> }} />
  );
}
