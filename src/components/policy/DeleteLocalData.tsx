import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LOCAL_KEYS, deleteLocalData } from "@/lib/localData";

/** Privacy page: wipes everything this site stored in this browser. */
export function DeleteLocalData() {
  const [done, setDone] = useState(false);
  return (
    <div className="mt-4">
      <Button
        variant="outline"
        onClick={() => {
          if (
            !window.confirm(
              "Delete your profile, paper book, ladder row, progress and settings from this browser? This cannot be undone.",
            )
          )
            return;
          deleteLocalData();
          setDone(true);
          // Reload so in-memory state (open book, session) is gone too.
          window.setTimeout(() => window.location.reload(), 900);
        }}
        data-testid="delete-local-data"
      >
        Delete my data on this device
      </Button>
      <p className="mt-2 text-xs text-subtle" role="status">
        {done
          ? "Deleted. Reloading…"
          : `Clears ${LOCAL_KEYS.length} items stored by this site in this browser.`}
      </p>
    </div>
  );
}
