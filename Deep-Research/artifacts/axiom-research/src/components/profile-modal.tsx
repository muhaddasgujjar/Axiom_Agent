import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Mail, ShieldCheck } from 'lucide-react';
import { getAuthMeQueryKey, useAuthUpdateProfile } from '@workspace/api-client-react';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiErrorText } from '@/lib/auth';

export function ProfileModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const update = useAuthUpdateProfile();

  useEffect(() => {
    if (open) {
      setEmail(user?.email ?? '');
      setPassword('');
    }
  }, [open, user?.email]);

  const emailChanged = email.trim().toLowerCase() !== (user?.email ?? '').toLowerCase();
  const passwordChanged = password.length > 0;
  const canSave = !update.isPending && (emailChanged || passwordChanged) && email.trim().length > 0;

  const onSave = () => {
    if (!canSave) return;
    update.mutate(
      {
        data: {
          ...(emailChanged ? { email: email.trim().toLowerCase() } : {}),
          ...(passwordChanged ? { password } : {}),
        },
      },
      {
        onSuccess: (updated) => {
          toast({ title: 'Profile updated', description: `Signed in as ${updated.email}.` });
          queryClient.invalidateQueries({ queryKey: getAuthMeQueryKey() });
          onOpenChange(false);
        },
        onError: (err) =>
          toast({ title: 'Could not update profile', description: apiErrorText(err, 'Please try again.'), variant: 'destructive' }),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[440px] border-[var(--line)] bg-[var(--bg-elevated)] sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl tracking-[-.03em] text-[var(--ink)]">Manage profile</DialogTitle>
          <DialogDescription className="text-[12px] leading-[1.6] text-[var(--body)]">
            Update the email and password used to sign in to your workspace.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl border border-[var(--line)] bg-[var(--bg-surface)] p-3.5">
            <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-[var(--tint-green)] text-[var(--tint-green-text)]"><ShieldCheck size={16} /></div>
            <div>
              <p className="text-[12px] font-medium text-[var(--ink)]">Private by default</p>
              <p className="mt-0.5 text-[11px] leading-[1.5] text-[var(--muted)]">Your research trail stays scoped to your account.</p>
            </div>
          </div>

          <div>
            <label htmlFor="profile-email" className="mb-1.5 block font-mono text-[9px] uppercase tracking-[.16em] text-[var(--muted)]">Email</label>
            <div className="flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--bg-elevated)] px-3.5 py-3 focus-within:border-[var(--accent-mid)]">
              <Mail size={14} className="shrink-0 text-[var(--muted)]" />
              <input id="profile-email" data-testid="input-profile-email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-transparent text-[13px] text-[var(--ink)] outline-none placeholder:text-[var(--muted-2)]" />
            </div>
          </div>

          <div>
            <label htmlFor="profile-password" className="mb-1.5 block font-mono text-[9px] uppercase tracking-[.16em] text-[var(--muted)]">New password</label>
            <input id="profile-password" data-testid="input-profile-password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Leave blank to keep current" className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg-elevated)] px-3.5 py-3 text-[13px] text-[var(--ink)] outline-none placeholder:text-[var(--muted-2)] focus:border-[var(--accent-mid)]" />
            {passwordChanged && password.length < 8 && <p className="mt-1.5 text-[10px] text-[var(--danger)]">Password must be at least 8 characters.</p>}
          </div>

          {update.isError && <p className="text-[10px] text-[var(--danger)]">Could not update profile. Please try again.</p>}
        </div>

        <DialogFooter>
          <Button data-testid="button-cancel-profile" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button data-testid="button-save-profile" onClick={onSave} disabled={!canSave}>
            {update.isPending ? 'Saving…' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
