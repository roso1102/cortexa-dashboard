import { getProfile } from "@/lib/cortexaApi";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { ScaleIn } from "@/components/ui/motion";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  let snapshot = "";
  let error: string | null = null;

  try {
    const res = await getProfile();
    snapshot = res.snapshot;
  } catch (e) {
    error = e instanceof Error ? e.message : "Unknown error";
  }

  return (
    <>
      <PageHeader
        label="Profile"
        title="Your monthly profile snapshot"
        description="Auto-generated monthly summary capturing your key themes, interests, and activities."
      />

      <ScaleIn delay={0.1}>
        <Card>
          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              Unable to load profile snapshot: {error}
            </div>
          ) : snapshot ? (
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
              <pre className="overflow-auto font-mono text-sm leading-6 text-zinc-800">
                {snapshot}
              </pre>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-zinc-600">
                No profile snapshot generated yet.
              </p>
              <p className="text-xs text-zinc-500">
                Snapshots are created automatically monthly, or you can request one via the
                <code>/profile</code> command in Telegram.
              </p>
            </div>
          )}
        </Card>
      </ScaleIn>
    </>
  );
}

