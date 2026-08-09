import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Database, LockKeyhole, ShieldCheck, Trash2 } from 'lucide-react';
import {
  getGetWorkspaceSummaryQueryKey,
  getGetWorkspaceUsageQueryKey,
  useGetWorkspaceUsage,
  usePurgeWorkspaceCache,
} from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

function Metric({ label, value, tone = '' }: { label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-xl border border-[#d7dbd3] bg-[#f8f7f2] p-4">
      <p className="font-mono text-[9px] uppercase tracking-[.15em] text-[#87918a]">{label}</p>
      <p className={`mt-2 font-serif text-2xl text-[#315e58] ${tone}`}>{value}</p>
    </div>
  );
}

export function WorkspacePrivacyModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const queryClient = useQueryClient();
  const { data: usage } = useGetWorkspaceUsage({ query: { queryKey: getGetWorkspaceUsageQueryKey(), staleTime: 0 } });
  const purge = usePurgeWorkspaceCache();
  const [purged, setPurged] = useState<number | null>(null);
  const [purgeError, setPurgeError] = useState(false);

  const onPurge = () => {
    setPurgeError(false);
    purge.mutate(undefined, {
      onSuccess: (data) => {
        setPurged(data?.purgedThreads ?? 0);
        queryClient.invalidateQueries({ queryKey: getGetWorkspaceUsageQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetWorkspaceSummaryQueryKey() });
      },
      onError: () => setPurgeError(true),
    });
  };

  const pct = usage?.usedContextPct ?? 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px] border-[#d7dbd3] bg-[#faf9f4] sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl tracking-[-.03em] text-[#24413d]">Workspace privacy</DialogTitle>
          <DialogDescription className="text-[12px] leading-[1.6] text-[#65706b]">
            Your sources, reports, and research trail stay private to this workspace.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex items-start gap-3 rounded-xl border border-[#d7dbd3] bg-[#f8f7f2] p-3.5">
            <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#e3eee9] text-[#50726a]"><ShieldCheck size={16} /></div>
            <div>
              <p className="text-[12px] font-medium text-[#344b46]">Zero training data</p>
              <p className="mt-0.5 text-[11px] leading-[1.5] text-[#7a847f]">None of your research, sources, or reports are used to train AI models.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-xl border border-[#d7dbd3] bg-[#f8f7f2] p-3.5">
            <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#e3eee9] text-[#50726a]"><LockKeyhole size={16} /></div>
            <div>
              <p className="text-[12px] font-medium text-[#344b46]">Private by default</p>
              <p className="mt-0.5 text-[11px] leading-[1.5] text-[#7a847f]">Everything is stored locally in your workspace and never shared.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-xl border border-[#d7dbd3] bg-[#f8f7f2] p-3.5">
            <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#e3eee9] text-[#50726a]"><Database size={16} /></div>
            <div>
              <p className="text-[12px] font-medium text-[#344b46]">You own your trail</p>
              <p className="mt-0.5 text-[11px] leading-[1.5] text-[#7a847f]">Reports and source trails belong to you and can be deleted anytime.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Metric label="Sources indexed" value={(usage?.totalSourcesIndexed ?? 0).toLocaleString()} />
          <Metric label="Total reports" value={(usage?.totalReports ?? 0).toLocaleString()} />
          <Metric label="Context tokens used" value={(usage?.totalTokensUsed ?? 0).toLocaleString()} />
          <Metric label="Max context limit" value={(usage?.maxContextLimit ?? 0).toLocaleString()} />
        </div>

        <div className="rounded-xl border border-[#d4d8d0] bg-[#f5f4ee] p-3.5">
          <div className="mb-2 flex items-center justify-between"><span className="font-mono text-[9px] uppercase tracking-[.16em] text-[#7a847f]">Context used</span><span className="font-mono text-[9px] text-[#55716b]">{pct}%</span></div>
          <div className="h-1.5 rounded-full bg-[#dfe5df]"><div className="h-full rounded-full bg-[#6e9b90]" style={{ width: `${Math.min(pct, 100)}%` }} /></div>
        </div>

        <div className="rounded-xl border border-[#e2c6c1] bg-[#fbf2ef] p-3.5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-medium text-[#84534c]">Purge inactive workspace cache</p>
              <p className="mt-0.5 text-[10px] leading-[1.5] text-[#9c6a63]">Clears temporary scraped HTML buffers from completed and failed runs to free up context.</p>
            </div>
            <Button data-testid="button-purge-workspace-cache" variant="destructive" className="shrink-0" onClick={onPurge} disabled={purge.isPending}>
              {purge.isPending ? 'Purging…' : <span className="flex items-center gap-1.5"><Trash2 size={13} /> Purge</span>}
            </Button>
          </div>
          {purged !== null && <p className="mt-2 text-[10px] text-[#6d837b]">Purged {purged} inactive run{purged === 1 ? '' : 's'}. Context freed.</p>}
          {purgeError && <p className="mt-2 text-[10px] text-[#9b544b]">Could not purge the cache. Please try again.</p>}
        </div>

        <DialogFooter>
          <Button data-testid="button-close-privacy-modal" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
