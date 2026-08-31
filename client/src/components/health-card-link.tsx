import { useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreditCard } from "lucide-react";

interface KrollMatchCandidate {
  patientName: string;
  dob: string;
  medicationCount: number;
  recordIds: string[];
}

function formatDob(dob: string): string {
  const d = new Date(`${dob}T00:00:00`);
  if (Number.isNaN(d.getTime())) return dob;
  return d.toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" });
}

/**
 * Lets a patient manually link their provincial Health Card / Personal
 * Health Number to their account, then checks it against any staged Kroll
 * import (server/kroll.ts) for a match. A Health Card Number is a real
 * unique identifier — unlike name+DOB it can't collide between two
 * different people — so this is the strong, patient-initiated companion to
 * the passive KrollMatchPrompt banner shown elsewhere in the app.
 *
 * The server enforces the audit rule that no two accounts can hold the same
 * Health Card Number (a 409 here means someone already has it), and — same
 * principle as KrollMatchPrompt — nothing is copied into the medication
 * profile until the patient explicitly confirms the match that's found.
 */
export default function HealthCardLink({ savedHealthCardNumber }: { savedHealthCardNumber: string | null }) {
  const qc = useQueryClient();
  const [value, setValue] = useState(savedHealthCardNumber || "");
  const [error, setError] = useState<string | null>(null);
  const [match, setMatch] = useState<KrollMatchCandidate | null>(null);
  const [searched, setSearched] = useState(false);

  const linkMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("PATCH", "/api/profile", { healthCardNumber: value });
      const res = await apiRequest("POST", "/api/kroll-match/by-health-card", { healthCardNumber: value });
      return (await res.json()) as KrollMatchCandidate | null;
    },
    onSuccess: (result) => {
      setError(null);
      setSearched(true);
      setMatch(result);
      qc.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (err: any) => {
      setSearched(false);
      setMatch(null);
      setError(err.message || "Couldn't save that Health Card Number.");
    },
  });

  const claimMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/kroll-match/claim", { recordIds: match!.recordIds });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/prescriptions"] });
      setMatch(null);
      toast({ title: "Medications added", description: "We've added your medications from the pharmacy's records." });
    },
    onError: (err: any) => {
      toast({ title: "Couldn't add your medications", description: err.message, variant: "destructive" });
    },
  });

  const declineMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/kroll-match/decline", { recordIds: match!.recordIds });
    },
    onSuccess: () => setMatch(null),
  });

  return (
    <Card className="rounded-2xl border-0 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CreditCard className="h-4 w-4 text-primary" /> Health Card Number
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">
          Link your provincial Health Card Number to pull your medications in from the pharmacy's records instead of
          typing them in by hand. Each Health Card Number can only be linked to one account.
        </p>
        <div className="flex gap-2">
          <Input
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setSearched(false);
              setMatch(null);
            }}
            placeholder="e.g. 123456789"
            className="rounded-2xl"
            data-testid="input-health-card-number"
          />
          <Button
            className="shrink-0 rounded-2xl"
            onClick={() => linkMutation.mutate()}
            disabled={linkMutation.isPending || !value.trim()}
            data-testid="button-link-health-card"
          >
            {linkMutation.isPending ? "Checking…" : "Link & Find"}
          </Button>
        </div>

        {error && (
          <p className="rounded-xl bg-destructive/10 p-3 text-xs text-destructive" data-testid="text-health-card-error">
            {error}
          </p>
        )}

        {searched && !match && !error && (
          <p className="text-xs text-muted-foreground" data-testid="text-health-card-no-match">
            Saved. We didn't find a matching pharmacy record for this number yet — check back later, or ask the
            pharmacy to confirm it's on file.
          </p>
        )}

        {match && (
          <div className="space-y-3 rounded-2xl border border-primary/20 bg-primary/5 p-4" data-testid="card-health-card-match">
            <p className="text-sm">
              We found a pharmacy record for <span className="font-medium">{match.patientName}</span>, born{" "}
              {formatDob(match.dob)}, with {match.medicationCount} medication{match.medicationCount === 1 ? "" : "s"}{" "}
              on file.
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                className="rounded-2xl"
                onClick={() => claimMutation.mutate()}
                disabled={claimMutation.isPending || declineMutation.isPending}
                data-testid="button-health-card-confirm"
              >
                Yes, add these medications
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-2xl"
                onClick={() => declineMutation.mutate()}
                disabled={claimMutation.isPending || declineMutation.isPending}
                data-testid="button-health-card-decline"
              >
                Not me
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
