import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
 * Shown above the tab content when the pharmacy has a staged Kroll import
 * (see server/kroll.ts) matching this patient's name and date of birth.
 * Never auto-populates: the patient has to explicitly confirm it's them
 * before any medication data is copied into their profile. "Not me" logs a
 * decline (for HIA accountability) and hides the card for this session;
 * it isn't remembered permanently, since a later, better-matching import
 * should still be offered.
 */
export default function KrollMatchPrompt() {
  const qc = useQueryClient();
  const [dismissed, setDismissed] = useState(false);

  const { data: match } = useQuery<KrollMatchCandidate | null>({
    queryKey: ["/api/kroll-match"],
    staleTime: 60_000,
  });

  const claimMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/kroll-match/claim", { recordIds: match!.recordIds });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/prescriptions"] });
      qc.invalidateQueries({ queryKey: ["/api/kroll-match"] });
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
    onSuccess: () => setDismissed(true),
  });

  if (!match || dismissed) return null;

  return (
    <div className="px-4 pt-4">
      <Card className="rounded-3xl border-card-border bg-card/70 shadow-sm backdrop-blur-xl" data-testid="card-kroll-match">
        <CardHeader>
          <CardTitle className="text-base">Is this you?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            We found a pharmacy record that looks like it might be yours:{" "}
            <span className="font-medium text-foreground">{match.patientName}</span>, born {formatDob(match.dob)}, with{" "}
            {match.medicationCount} medication{match.medicationCount === 1 ? "" : "s"} on file.
          </p>
          <p className="text-xs text-muted-foreground">
            If this is you, we'll add these medications to your profile so you don't have to type them in. If it isn't, just
            dismiss this — nothing will be added.
          </p>
          <div className="flex gap-2">
            <Button
              className="rounded-2xl"
              size="sm"
              onClick={() => claimMutation.mutate()}
              disabled={claimMutation.isPending || declineMutation.isPending}
              data-testid="button-kroll-match-confirm"
            >
              Yes, that's me
            </Button>
            <Button
              variant="outline"
              className="rounded-2xl"
              size="sm"
              onClick={() => declineMutation.mutate()}
              disabled={claimMutation.isPending || declineMutation.isPending}
              data-testid="button-kroll-match-decline"
            >
              Not me
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
