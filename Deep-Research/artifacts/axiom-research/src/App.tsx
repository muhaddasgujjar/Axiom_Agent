import { type FormEvent, type ReactNode, useEffect, useRef, useState } from 'react';
import { keepPreviousData, QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, ArrowUpRight, BookOpen, BrainCircuit, Check, ChevronRight, CircleHelp,
  Clock3, FileCheck2, FileSearch, Filter, FlaskConical, Focus, GitBranch, Globe2,
  Layers3, Library, Link2, LockKeyhole, Menu, MoreVertical, PanelLeft, Pencil, Plus,
  Search, ShieldCheck, Sparkles, Target, Trash2, X, Pause, Play, RefreshCw, AlertCircle, Download, LogOut, Gauge,
} from 'lucide-react';
import { Link, Redirect, Route, Switch, useLocation, useParams, useSearch, Router as WouterRouter } from 'wouter';
import {
  getGetResearchQueryKey, getGetUsageQueryKey, getGetWorkspaceSummaryQueryKey, getGetWorkspaceUsageQueryKey, getListResearchQueryKey, getListSourcesQueryKey,
  useDeleteResearch, useGetResearch, useGetUsage, useGetWorkspaceSummary, useGetWorkspaceUsage, useListResearch, useListSources, usePauseResearch, useStartResearch, useUpdateResearch,
} from '@workspace/api-client-react';
import type { Agent, Research, Source } from '@workspace/api-client-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { AuthProvider, RequireAuth, useAuth } from '@/components/auth-provider';
import ThemeToggle from '@/components/theme-toggle';
import LoginPage from '@/pages/login';
import RegisterPage from '@/pages/register';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { WorkspacePrivacyModal } from '@/components/workspace-privacy-modal';
import { ProfileModal } from '@/components/profile-modal';
import { useToast } from '@/hooks/use-toast';
import NotFound from '@/pages/not-found';
import Landing from '@/pages/landing';
import ContactPage from '@/pages/contact';

const queryClient = new QueryClient();
const icons = [Globe2, BookOpen, CircleHelp, BrainCircuit, ShieldCheck, FileCheck2];
const agentTones = ['bg-[var(--tint-green)] text-[var(--tint-green-text)]', 'bg-[var(--tint-purple)] text-[var(--tint-purple-text)]', 'bg-[var(--tint-amber)] text-[var(--tint-amber-text)]', 'bg-[var(--tint-blue)] text-[var(--tint-blue-text)]', 'bg-[var(--tint-green)] text-[var(--tint-green-text)]', 'bg-[var(--tint-stone)] text-[var(--tint-stone-text)]'];

function Shell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { data: usage } = useGetWorkspaceUsage({ query: { queryKey: getGetWorkspaceUsageQueryKey(), staleTime: 15_000 } });
  const { data: dailyUsage } = useGetUsage({ query: { queryKey: getGetUsageQueryKey(), staleTime: 15_000 } });
  const { user, signOut } = useAuth();
  const [location, navigate] = useLocation();
  const active = location.startsWith('/workspace/library') ? 'Research library' : location.startsWith('/workspace/sources') ? 'Source collections' : 'Workspace';
  const submitSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    navigate(`/workspace/library${q ? `?q=${encodeURIComponent(q)}` : ''}`);
    setSearchQuery('');
  };
  const handleLogout = () => {
    signOut();
    navigate('/login');
  };
  const initials = (user?.email?.split('@')[0] ?? 'U').slice(0, 2).toUpperCase();
  return (
    <main className="min-h-[100dvh] bg-[var(--bg-surface)] text-[var(--ink)] selection:bg-[var(--tint-green)]">
      <div className="flex min-h-[100dvh]">
        <aside className={`${open ? 'fixed inset-y-0 left-0 z-40 flex w-[264px]' : 'hidden'} ${collapsed ? 'lg:w-[264px]' : 'lg:w-0 lg:overflow-hidden'} shrink-0 flex-col border-r border-[var(--line)] bg-[var(--bg-surface-soft)] transition-all duration-300 lg:relative lg:flex`}>
          <div className="flex h-[76px] items-center gap-3 border-b border-[var(--line)] px-6">
            <div className="grid size-8 place-items-center rounded-[10px] bg-[var(--accent)] text-[var(--on-accent)]"><FlaskConical size={17} strokeWidth={1.7} /></div>
            <div><p className="font-serif text-[17px] leading-none tracking-[-.02em] text-[var(--accent)]">Axiom</p><p className="mt-1 font-mono text-[8px] uppercase tracking-[.2em] text-[var(--muted)]">Research instrument</p></div>
            <button aria-label="Close navigation" data-testid="button-close-navigation" className="ml-auto lg:hidden" onClick={() => setOpen(false)}><X size={16} /></button>
          </div>
          <div className="px-4 pt-4"><Link href="/" data-testid="link-back-home" className="flex w-full items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--bg-chip)] px-3 py-2.5 text-[12px] font-medium text-[var(--body)] transition hover:border-[var(--accent-mid)] hover:text-[var(--accent)]"><ArrowLeft size={15} strokeWidth={1.8} /> Home</Link></div>
          <div className="px-4 py-4"><Link href="/workspace?new=1" data-testid="link-new-research" className="flex w-full items-center justify-between rounded-xl bg-[var(--accent)] px-3.5 py-3 text-left text-[var(--on-accent)] shadow-[0_5px_15px_rgba(33,78,74,.14)] transition hover:bg-[var(--accent-deep)]"><span className="flex items-center gap-2.5 text-[12px] font-medium"><Plus size={15} /> New research</span><span className="font-mono text-[9px] text-[var(--on-accent-muted)]">⌘ K</span></Link></div>
          <nav className="space-y-1 px-3 text-[12px]">
            <NavItem href="/workspace" active={active === 'Workspace'} icon={Focus} label="Workspace" />
            <NavItem href="/workspace/library" active={active === 'Research library'} icon={Library} label="Research library" />
            <NavItem href="/workspace/sources" active={active === 'Source collections'} icon={Layers3} label="Source collections" />
          </nav>
          <div className="mt-auto border-t border-[var(--line)] p-4">
            <button data-testid="button-workspace-privacy" onClick={() => setPrivacyOpen(true)} className="w-full cursor-pointer rounded-xl border border-[var(--line)] bg-[var(--bg-chip)] p-3.5 text-left transition hover:border-[var(--accent-mid)]"><div className="mb-2 flex items-center justify-between"><span className="font-mono text-[9px] uppercase tracking-[.16em] text-[var(--muted)]">Workspace privacy</span><LockKeyhole size={13} className="text-[var(--accent-mid)]" /></div><p className="text-[11px] leading-[1.5] text-[var(--body)]">Your sources and reports stay private to your workspace.</p><div className="mt-3 h-1 rounded-full bg-[var(--progress-track)]"><div className="h-full rounded-full bg-[var(--progress-fill)]" style={{ width: `${Math.min(usage?.usedContextPct ?? 0, 100)}%` }} /></div><p className="mt-2 font-mono text-[9px] text-[var(--muted)]">{usage?.usedContextPct ?? 0}% of research context used</p></button>
            <button data-testid="button-how-axiom-works" className="mt-4 flex items-center gap-2 px-2 text-[11px] text-[var(--body)] hover:text-[var(--accent)]"><CircleHelp size={14} /> How Axiom works</button>
            <button data-testid="button-sign-out" onClick={signOut} className="mt-3 flex items-center gap-2 px-2 text-[11px] text-[var(--body)] hover:text-[var(--danger)]"><LogOut size={14} /> Sign out</button>
          </div>
        </aside>
        {open && <button aria-label="Close menu" data-testid="button-menu-overlay" className="fixed inset-0 z-30 bg-[var(--scrim)] lg:hidden" onClick={() => setOpen(false)} />}
        <section className="min-w-0 flex-1">
          <header className="flex h-[76px] items-center justify-between border-b border-[var(--line)] bg-[var(--header-bg)] px-5 backdrop-blur sm:px-8">
            <div className="flex min-w-0 items-center gap-3"><button data-testid="button-toggle-sidebar" className="rounded-lg p-2 text-[var(--body)] hover:bg-[var(--bg-chip)]" onClick={() => { setOpen(true); setCollapsed(!collapsed); }}><Menu size={19} className="lg:hidden" /><PanelLeft size={17} className="hidden lg:block" /></button><span className="hidden text-[11px] text-[var(--muted)] sm:block">My workspace</span><span className="hidden text-[var(--muted-2)] sm:block">/</span><span className="truncate text-[12px] font-medium text-[var(--ink)]">{location.startsWith('/workspace/research/') ? 'Research workspace' : active}</span></div>
            <div className="flex items-center gap-2.5">
              <span data-testid="badge-daily-usage" title="Daily research reports used today. Resets at midnight UTC." className={`hidden items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[9px] md:flex ${(dailyUsage?.reportsToday ?? 0) >= (dailyUsage?.dailyLimit ?? 5) ? 'border-[var(--line-error)] bg-[var(--tint-error)] text-[var(--danger)]' : 'border-[var(--line)] bg-[var(--bg-elevated)] text-[var(--body)]'}`}><Gauge size={12} />Reports today: {dailyUsage?.reportsToday ?? 0} / {dailyUsage?.dailyLimit ?? 5}</span>
              <form onSubmit={submitSearch} className="hidden sm:flex"><div className="flex items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--bg-elevated)] px-3 py-2 transition hover:border-[var(--accent-mid)] focus-within:border-[var(--accent-mid)]"><Search size={14} className="text-[var(--muted)]" /><input data-testid="input-search-workspace" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search workspace" className="w-40 bg-transparent text-[11px] text-[var(--ink)] outline-none placeholder:text-[var(--muted-2)] lg:w-52" /></div></form>
              <ThemeToggle className="text-[var(--body)] hover:bg-[var(--bg-chip)] hover:text-[var(--accent)]" />
              <DropdownMenu>
                <DropdownMenuTrigger data-testid="avatar-user" aria-label="Account menu" className="grid size-8 place-items-center rounded-full bg-[var(--tint-green)] text-[11px] font-semibold text-[var(--tint-green-text)] outline-none transition hover:ring-2 hover:ring-[var(--accent-mid)]">{initials}</DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal"><span className="block font-mono text-[9px] uppercase tracking-[.16em] text-[var(--muted)]">Signed in as</span><span className="mt-1 block truncate text-[12px] font-medium text-[var(--ink)]">{user?.email ?? '…'}</span></DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem data-testid="button-manage-profile" onClick={() => setProfileOpen(true)}>Manage Profile</DropdownMenuItem>
                  <DropdownMenuItem data-testid="button-logout" onClick={handleLogout} className="text-[var(--danger)]"><LogOut size={13} /> Log out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          {children}
        </section>
      </div>
      <WorkspacePrivacyModal open={privacyOpen} onOpenChange={setPrivacyOpen} />
      <ProfileModal open={profileOpen} onOpenChange={setProfileOpen} />
    </main>
  );
}

function NavItem({ href, icon: Icon, label, active }: { href: string; icon: typeof Focus; label: string; active: boolean }) {
  return <Link href={href} data-testid={`link-${label.toLowerCase().replaceAll(' ', '-')}`} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition ${active ? 'bg-[var(--tint-green)] font-semibold text-[var(--accent)]' : 'text-[var(--body)] hover:bg-[var(--bg-chip)]'}`}><Icon size={16} strokeWidth={1.7} />{label}</Link>;
}

function PageFrame({ children, className = '' }: { children: ReactNode; className?: string }) { return <div className={`mx-auto max-w-[1280px] px-5 py-7 sm:px-8 lg:px-10 lg:py-9 ${className}`}>{children}</div>; }
function Eyebrow({ children }: { children: ReactNode }) { return <p className="font-mono text-[9px] uppercase tracking-[.18em] text-[var(--muted)]">{children}</p>; }
function Button({ children, primary = false, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { primary?: boolean }) { return <button {...props} className={`${primary ? 'bg-[var(--accent)] text-[var(--on-accent)] hover:bg-[var(--accent-deep)]' : 'border border-[var(--line)] bg-[var(--bg-elevated)] text-[var(--body)] hover:border-[var(--accent-mid)]'} rounded-lg px-3.5 py-2.5 text-[11px] font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${props.className ?? ''}`}>{children}</button>; }

function Home() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [query, setQuery] = useState('');
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: researchList, isLoading, isError, refetch } = useListResearch({ query: { queryKey: getListResearchQueryKey(), staleTime: 30_000 } });
  const { data: summary } = useGetWorkspaceSummary({ query: { queryKey: getGetWorkspaceSummaryQueryKey(), staleTime: 30_000 } });
  const { data: dailyUsage } = useGetUsage({ query: { queryKey: getGetUsageQueryKey(), staleTime: 15_000 } });
  const limitReached = (dailyUsage?.reportsToday ?? 0) >= (dailyUsage?.dailyLimit ?? 5);
  const start = useStartResearch({ mutation: { retry: false } });
  useEffect(() => {
    if (search === 'new=1') {
      window.history.replaceState(null, '', window.location.pathname);
      textareaRef.current?.focus();
    }
  }, [search]);
  const submit = async () => {
    if (query.trim().length < 10 || starting || limitReached) return;
    setStarting(true);
    setStartError(false);
    start.mutate({ data: { query: query.trim() } }, {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: getGetUsageQueryKey() });
        setLocation(`/workspace/research/${data.research_id ?? data.id}`);
      },
      onError: (err) => {
        if ((err as { status?: number } | undefined)?.status === 429) {
          toast({ title: 'Daily limit reached', description: 'Daily research limit reached. Check back tomorrow.', variant: 'destructive' });
          queryClient.invalidateQueries({ queryKey: getGetUsageQueryKey() });
        } else {
          setStartError(true);
        }
      },
      onSettled: () => setStarting(false),
    });
  };
  const recent = researchList?.slice(0, 3) ?? [];
  return <PageFrame>
    <div className="mx-auto max-w-[900px] pt-7 text-center sm:pt-12"><div className="mx-auto mb-5 grid size-11 place-items-center rounded-2xl bg-[var(--tint-green)] text-[var(--ink)]"><Sparkles size={20} strokeWidth={1.6} /></div><Eyebrow>Private research instrument</Eyebrow><h1 className="mt-4 font-serif text-[clamp(42px,7vw,76px)] leading-[.94] tracking-[-.055em] text-[var(--ink)]">Find the answer<br /><em>behind</em> the answer.</h1><p className="mx-auto mt-6 max-w-[590px] text-[13px] leading-[1.7] text-[var(--body)]">Axiom turns complex questions into a defensible research trail — with sources, claims, and the reasoning to connect them.</p>
      <div className="mx-auto mt-9 max-w-[760px] rounded-2xl border border-[var(--line)] bg-[var(--bg-elevated)] p-2 text-left shadow-[0_14px_40px_rgba(38,58,53,.06)] focus-within:border-[var(--accent-mid)]"><textarea data-testid="input-research-query" ref={textareaRef} value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit(); }} placeholder={limitReached ? 'Daily research limit reached. Check back tomorrow.' : 'What would you like to understand?'} rows={3} className="w-full resize-none bg-transparent px-4 py-3 text-[15px] leading-[1.5] text-[var(--ink)] outline-none placeholder:text-[var(--muted-2)]" /><div className="flex items-center justify-between border-t border-[var(--line-soft)] px-3 pt-2"><span className="font-mono text-[9px] text-[var(--muted-2)]">{limitReached ? `${dailyUsage?.reportsToday ?? 0} of ${dailyUsage?.dailyLimit ?? 5} daily reports used` : 'Be specific. Axiom will map the evidence.'}</span><Button data-testid="button-start-research" primary onClick={submit} disabled={query.trim().length < 10 || starting || limitReached}>{starting ? 'Starting…' : <span className="flex items-center gap-2">Start research <ArrowUpRight size={14} /></span>}</Button></div></div>
      {startError && <p role="alert" data-testid="status-create-error" className="mt-3 text-[11px] text-[var(--danger)]">Could not start research. Please try again.</p>}
      <div className="mt-5 flex flex-wrap justify-center gap-2"><span className="rounded-full bg-[var(--tint-green)] px-3 py-1.5 font-mono text-[9px] text-[var(--tint-green-text)]">Policy & markets</span><span className="rounded-full bg-[var(--tint-purple)] px-3 py-1.5 font-mono text-[9px] text-[var(--tint-purple-text)]">Technology shifts</span><span className="rounded-full bg-[var(--tint-amber)] px-3 py-1.5 font-mono text-[9px] text-[var(--tint-amber-text)]">Evidence reviews</span></div>
    </div>
    <section className="mx-auto mt-16 max-w-[1040px] border-t border-[var(--line)] pt-6"><div className="mb-4 flex items-end justify-between"><div><Eyebrow>Recent context</Eyebrow><h2 className="mt-1.5 text-[13px] font-medium text-[var(--ink)]">Your research trail</h2></div><Link href="/workspace/library" data-testid="link-view-history" className="flex items-center gap-1 text-[11px] font-medium text-[var(--accent-mid)]">View history <ChevronRight size={14} /></Link></div>
      {isLoading ? <SkeletonRows /> : isError ? <ErrorState onRetry={() => refetch()} /> : recent.length === 0 ? <EmptyState /> : <div className="grid gap-3 md:grid-cols-3">{recent.map(item => <ResearchCard key={item.id} item={item} />)}</div>}
    </section>
    <div className="mx-auto mt-12 grid max-w-[1040px] gap-3 sm:grid-cols-3"><Stat label="Active research" value={summary?.activeResearch ?? 0} /><Stat label="Completed reports" value={summary?.completedReports ?? 0} /><Stat label="Sources read" value={summary?.sourcesRead ?? 0} /></div>
  </PageFrame>;
}

function Stat({ label, value }: { label: string; value: number }) { return <div className="rounded-xl border border-[var(--line)] bg-[var(--bg-surface)] p-4"><p className="font-mono text-[9px] uppercase tracking-[.15em] text-[var(--muted)]">{label}</p><p className="mt-2 font-serif text-3xl text-[var(--ink)]">{value}</p></div>; }
function SkeletonRows() { return <div className="grid gap-3 md:grid-cols-3">{[1, 2, 3].map(i => <div key={i} className="h-28 animate-pulse rounded-xl border border-[var(--line-soft)] bg-[var(--bg-chip)]" />)}</div>; }
function ErrorState({ onRetry }: { onRetry: () => void }) { return <div className="flex items-center justify-between rounded-xl border border-[var(--line-error)] bg-[var(--tint-error)] p-4 text-[12px] text-[var(--danger)]"><span className="flex items-center gap-2"><AlertCircle size={15} /> Context could not be loaded.</span><button data-testid="button-retry" onClick={onRetry} className="flex items-center gap-1 font-medium"><RefreshCw size={13} /> Retry</button></div>; }
function EmptyState() { return <div className="rounded-xl border border-dashed border-[var(--line)] bg-[var(--bg-surface)] p-8 text-center"><FileSearch className="mx-auto text-[var(--accent-mid)]" size={23} /><p className="mt-3 text-[12px] font-medium text-[var(--body)]">Your trail starts here.</p><p className="mt-1 text-[11px] text-[var(--muted)]">Start a research question to build a private evidence record.</p></div>; }
function ResearchCard({ item, onRename, onDelete }: { item: Research; onRename?: (item: Research) => void; onDelete?: (item: Research) => void }) {
  const manage = !!onRename && !!onDelete;
  return <div data-testid={`card-research-${item.id}`} className={`group relative rounded-xl border border-[var(--line)] bg-[var(--bg-elevated)] p-4 transition ${manage ? '' : 'hover:-translate-y-0.5 '}hover:border-[var(--accent-mid)]`}><Link href={`/workspace/research/${item.id}`} className="block"><div className="flex items-start justify-between gap-3"><div className="grid size-7 shrink-0 place-items-center rounded-lg bg-[var(--tint-green)] text-[var(--tint-green-text)]"><FileCheck2 size={14} /></div><div className="flex items-center gap-3"><span className="font-mono text-[9px] uppercase tracking-[.1em] text-[var(--muted)]">{item.status === 'done' ? 'Completed' : item.status}</span>{manage && <DropdownMenu><DropdownMenuTrigger data-testid={`button-card-menu-${item.id}`} aria-label={`Actions for ${item.query}`} onClick={e => { e.preventDefault(); e.stopPropagation(); }} className="grid size-7 place-items-center rounded-lg border border-transparent text-[var(--muted)] transition hover:border-[var(--line)] hover:bg-[var(--bg-chip)]"><MoreVertical size={15} /></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem data-testid={`button-card-rename-${item.id}`} onClick={e => { e.stopPropagation(); onRename(item); }}><Pencil size={13} /> Rename research</DropdownMenuItem><DropdownMenuItem data-testid={`button-card-delete-${item.id}`} onClick={e => { e.stopPropagation(); onDelete(item); }} className="text-[var(--danger)]"><Trash2 size={13} /> Delete research</DropdownMenuItem></DropdownMenuContent></DropdownMenu>}</div></div><p className="mt-3 line-clamp-2 text-[12px] font-medium leading-[1.4] text-[var(--ink)]">{item.query}</p><p className="mt-2 font-mono text-[9px] text-[var(--muted)]">{item.sourcesCount} sources · {item.elapsedMinutes} min</p></Link></div>;
}

function ResearchPage() {
  const { id = '' } = useParams<{ id: string }>();
  const { data: item, isLoading, isError, refetch } = useGetResearch(id, { query: { queryKey: getGetResearchQueryKey(id), refetchInterval: (query) => query.state.data?.status === 'done' || query.state.data?.status === 'failed' ? false : 3000 } });
  if (isLoading) return <PageFrame><div className="space-y-5"><div className="h-8 w-72 animate-pulse rounded bg-[var(--bg-chip)]" /><div className="h-80 animate-pulse rounded-2xl bg-[var(--bg-chip)]" /></div></PageFrame>;
  if (isError || !item) return <PageFrame><ErrorState onRetry={() => refetch()} /></PageFrame>;
  return <PageFrame><ResearchHeader item={item} /><div className="grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,.8fr)]"><div className="space-y-5"><Pipeline item={item} />{item.status === 'done' ? <Report item={item} /> : <SourceReading sources={item.sources} count={item.sourcesCount} />}</div><div className="space-y-5"><Confidence item={item} /><RecentContext items={item.recent} /></div></div>{item.status !== 'done' && <div className="mt-5 rounded-2xl border border-[var(--line)] bg-[var(--bg-elevated)] p-5 sm:p-6"><div className="flex items-center gap-3"><div className="grid size-9 place-items-center rounded-xl bg-[var(--tint-purple)] text-[var(--tint-purple-text)]"><BrainCircuit size={18} /></div><div><Eyebrow>Research note</Eyebrow><p className="mt-1 text-[12px] text-[var(--body)]">Axiom is separating durable evidence from speculative promise.</p></div></div></div>}<footer className="flex flex-col justify-between gap-2 py-6 text-[10px] text-[var(--muted)] sm:flex-row"><span className="flex items-center gap-1.5"><ShieldCheck size={12} /> Every claim will carry its source trail</span><span className="font-mono">Last autosaved moments ago</span></footer></PageFrame>;
}

function ResearchHeader({ item }: { item: Research }) {
  const [copied, setCopied] = useState(false);
  const pause = usePauseResearch();
  const queryClient = useQueryClient();
  const paused = item.status === 'paused';
  const toggle = () => pause.mutate({ id: item.id }, { onSuccess: data => queryClient.setQueryData(getGetResearchQueryKey(item.id), data) });
  const share = () => { navigator.clipboard?.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 1600); };
  const downloadPDF = () => window.print();
  return <div className="mb-8 flex flex-col justify-between gap-5 xl:flex-row xl:items-end"><div><div className="mb-3 flex flex-wrap items-center gap-2"><span data-testid="status-research" className={`rounded-full px-2.5 py-1 font-mono text-[9px] uppercase tracking-[.15em] ${item.status === 'done' ? 'bg-[var(--tint-green)] text-[var(--tint-green-text)]' : paused ? 'bg-[var(--tint-amber)] text-[var(--tint-amber-text)]' : 'bg-[var(--tint-green)] text-[var(--tint-green-text)]'}`}>{item.status === 'done' ? 'Research complete' : paused ? 'Research paused' : `Research ${item.status}`}</span><span className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-[.12em] text-[var(--muted)]"><Clock3 size={12} /> {item.elapsedMinutes} min elapsed</span></div><h1 data-testid="text-research-title" className="max-w-[760px] font-serif text-[clamp(32px,4vw,52px)] leading-[1.03] tracking-[-.045em] text-[var(--ink)]">{item.query}</h1><p className="mt-4 max-w-[700px] text-[13px] leading-[1.65] text-[var(--body)]">{item.summary || 'Axiom is mapping the evidence, testing claims, and building a source-backed answer.'}</p></div><div className="flex shrink-0 items-center gap-2">{item.status === 'done' && <Button data-testid="button-download-pdf" onClick={downloadPDF}><span className="flex items-center gap-2"><Download size={14} /> Download PDF</span></Button>}<Button data-testid="button-pause-research" onClick={toggle} disabled={pause.isPending || item.status === 'done'}>{paused ? <span className="flex items-center gap-2"><Play size={14} /> Resume research</span> : <span className="flex items-center gap-2"><Pause size={14} /> Pause research</span>}</Button><Button data-testid="button-share-research" primary onClick={share}>{copied ? <span className="flex items-center gap-2"><Check size={14} /> Link copied</span> : <span className="flex items-center gap-2"><ArrowUpRight size={14} /> Share workspace</span>}</Button></div></div>;
}

function Pipeline({ item }: { item: Research }) { return <section className="rounded-2xl border border-[var(--line)] bg-[var(--bg-elevated)] p-5 shadow-[0_8px_30px_rgba(38,58,53,.035)] sm:p-6"><div className="mb-5 flex items-center justify-between"><div><Eyebrow>Agent pipeline</Eyebrow><p className="mt-1.5 text-[13px] font-medium text-[var(--ink)]">Six specialists, one defensible answer</p></div><span className="font-mono text-[9px] text-[var(--muted)]">{item.progress}% complete</span></div><div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">{item.agents.map((agent, index) => <AgentCard key={agent.name} agent={agent} index={index} />)}</div><div className="mt-5 flex items-center gap-3 border-t border-[var(--line-soft)] pt-4"><div className="h-1.5 flex-1 rounded-full bg-[var(--progress-track)]"><div className="h-full rounded-full bg-[var(--progress-fill)] transition-all duration-700" style={{ width: `${item.progress}%` }} /></div><span className="font-mono text-[10px] text-[var(--tint-green-text)]">{item.progress}% complete</span></div></section>; }
function AgentCard({ agent, index }: { agent: Agent; index: number }) { const Icon = icons[index % icons.length]; const done = agent.status === 'done'; return <div data-testid={`card-agent-${agent.name.toLowerCase()}`} className="rounded-xl border border-[var(--line-soft)] bg-[var(--bg-chip)] p-3.5 transition hover:border-[var(--accent-mid)]"><div className="mb-4 flex items-start justify-between"><div className={`grid size-8 place-items-center rounded-lg ${agentTones[index % agentTones.length]}`}><Icon size={16} strokeWidth={1.7} /></div>{done ? <span className="grid size-5 place-items-center rounded-full bg-[var(--tint-green)] text-[var(--tint-green-text)]"><Check size={12} /></span> : <span className="mt-1 size-1.5 animate-pulse rounded-full bg-[var(--gold)]" />}</div><p className="text-[12px] font-semibold text-[var(--ink)]">{index + 1}. {agent.name}</p><p className="mt-1 text-[11px] text-[var(--body)]">{agent.detail}</p><div className="mt-3 flex items-center justify-between font-mono text-[9px] text-[var(--muted)]"><span>{agent.count}</span><span className={done ? 'text-[var(--tint-green-text)]' : 'text-[var(--tint-amber-text)]'}>{done ? 'done' : agent.progress > 0 ? `${agent.progress}%` : 'queued'}</span></div></div>; }
function SourceReading({ sources, count }: { sources: Source[]; count: number }) { return <section className="rounded-2xl border border-[var(--line)] bg-[var(--bg-elevated)] p-5 sm:p-6"><div className="mb-5 flex items-center justify-between"><div><Eyebrow>Source reading</Eyebrow><p className="mt-1.5 text-[13px] font-medium text-[var(--ink)]">Full documents, not snippets</p></div><button data-testid="button-filter-sources" className="flex items-center gap-1.5 rounded-lg border border-[var(--line)] px-2.5 py-1.5 text-[10px] text-[var(--body)] hover:bg-[var(--bg-chip)]"><Filter size={12} /> Filter</button></div><div className="space-y-1">{sources.map((source, i) => <SourceRow key={`${source.title}-${i}`} source={source} index={i} />)}</div><button data-testid="button-view-all-sources" className="mt-3 flex items-center gap-2 px-2 text-[11px] font-medium text-[var(--accent-mid)] hover:text-[var(--accent)]"><FileSearch size={14} /> View all {count} sources</button></section>; }
function SourceRow({ source, index }: { source: Source; index: number }) { return <button data-testid={`button-source-${index}`} className="group flex w-full items-center gap-3 rounded-xl px-2 py-3 text-left transition hover:bg-[var(--bg-chip)] sm:gap-4"><div className={`hidden h-10 w-1 shrink-0 rounded-full sm:block ${['bg-[var(--accent)]', 'bg-[var(--tint-purple-text)]', 'bg-[var(--tint-amber-text)]'][index % 3]}`} /><div className="min-w-0 flex-1"><div className="mb-1 flex items-center gap-2"><span className="font-mono text-[8px] tracking-[.13em] text-[var(--muted)]">{source.type}</span><span className="truncate text-[12px] font-medium text-[var(--ink)]">{source.title}</span></div><p className="text-[10px] text-[var(--muted)]">{source.source}</p><div className="mt-2 h-1 rounded-full bg-[var(--progress-track)]"><div className="h-full rounded-full bg-[var(--progress-fill)]" style={{ width: `${source.progress}%` }} /></div></div><span className="font-mono text-[10px] text-[var(--body)]">{source.progress}%</span><Link href={`/workspace/sources?source=${encodeURIComponent(source.title)}`} aria-label={`Open ${source.title}`} data-testid={`link-source-${index}`} className="hidden rounded-md p-1 text-[var(--muted)] hover:bg-[var(--bg-chip)] sm:block"><ArrowUpRight size={14} /></Link></button>; }
function Confidence({ item }: { item: Research }) { return <section data-testid="panel-claim-confidence" className="overflow-hidden rounded-2xl border border-[var(--tint-green)] bg-[var(--tint-green)] p-5 sm:p-6"><div className="flex items-start justify-between"><div><Eyebrow>Claim confidence</Eyebrow><h2 className="mt-2 font-serif text-[30px] tracking-[-.04em] text-[var(--ink)]">{item.verificationScore}<span className="text-[18px]">%</span></h2></div><div className="grid size-10 place-items-center rounded-xl bg-[var(--tint-green)] text-[var(--tint-green-text)]"><ShieldCheck size={21} strokeWidth={1.5} /></div></div><p className="mt-1 max-w-[240px] text-[11px] leading-[1.5] text-[var(--body)]">of synthesized claims have direct, independently verified support.</p><div className="relative mt-6 h-2 rounded-full bg-[var(--progress-track)]"><div className="h-full rounded-full bg-[var(--progress-fill)]" style={{ width: `${item.verificationScore}%` }} /><div className="absolute left-[72%] top-[-4px] h-4 w-px bg-[var(--accent-mid)]" /></div><div className="mt-2 flex justify-between font-mono text-[9px] text-[var(--muted)]"><span>Needs evidence</span><span>Strong support</span></div><div className="mt-5 border-t border-[var(--tint-green)] pt-4"><div className="flex items-center gap-2 text-[11px] font-medium text-[var(--tint-green-text)]"><Target size={14} /> {item.status === 'done' ? 'Verification complete' : 'Verification pass underway'}</div><p className="mt-2 text-[10px] leading-[1.5] text-[var(--body)]">{item.claimsChecked} claims checked against primary sources.</p></div></section>; }
function RecentContext({ items }: { items: Research['recent'] }) { return <section className="rounded-2xl border border-[var(--line)] bg-[var(--bg-elevated)] p-5 sm:p-6"><div className="mb-4 flex items-center justify-between"><div><Eyebrow>Recent context</Eyebrow><p className="mt-1.5 text-[13px] font-medium text-[var(--ink)]">Your research trail</p></div><GitBranch size={16} className="text-[var(--muted)]" /></div><div className="space-y-2">{items.slice(0, 4).map(item => <Link key={item.id} href={`/workspace/research/${item.id}`} data-testid={`link-recent-${item.id}`} className="flex items-start gap-3 rounded-xl p-2 text-left transition hover:bg-[var(--bg-chip)]"><div className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-[var(--tint-green)] text-[var(--tint-green-text)]"><FileCheck2 size={14} /></div><div className="min-w-0"><p className="line-clamp-2 text-[11px] font-medium leading-[1.4] text-[var(--ink)]">{item.title}</p><p className="mt-1 font-mono text-[8px] text-[var(--muted)]">{item.meta}</p></div></Link>)}</div><Link href="/workspace/library" data-testid="link-open-research-history" className="mt-4 flex items-center gap-2 px-2 text-[11px] font-medium text-[var(--accent-mid)]">Open research history <ArrowUpRight size={14} /></Link></section>; }
function CitationLink({ n }: { n: string }) { return <a href={`#citation-${n}`} data-testid={`citation-link-${n}`} className="mx-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded bg-[var(--tint-green)] px-1 font-mono text-[10px] leading-none text-[var(--tint-green-text)] no-underline transition hover:bg-[var(--tint-green)]">[{n}]</a>; }
function renderInline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|\[\d+\])/g).map((part, i) => {
    if (/^\[\d+\]$/.test(part)) return <CitationLink key={i} n={part.slice(1, -1)} />;
    if (/^\*\*[^*]+\*\*$/.test(part)) return <strong key={i} className="font-semibold text-[var(--ink)]">{part.slice(2, -2)}</strong>;
    return <span key={i}>{part}</span>;
  });
}
function normalizeLegacyArrays(text: string): string {
  return text.replace(/(?:^|\n)[ \t]*\[[^\]]*\][ \t]*(?=\n|$)/g, match => {
    const items = match.trim().match(/(?:'[^']*'|"[^"]*")/g) ?? [];
    if (items.length < 1) return match;
    const bullets = items
      .map(s => s.slice(1, -1).replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\\\/g, '\\'))
      .map(s => s.trim())
      .filter(Boolean)
      .map(s => `- ${s}`)
      .join('\n');
    return `\n${bullets}\n`;
  });
}
function MarkdownReport({ text }: { text: string }) {
  const lines = normalizeLegacyArrays(text).split(/\r?\n/);
  const blocks: ReactNode[] = [];
  let para: string[] = [];
  let list: ReactNode[] = [];
  let listIds: Array<string | undefined> = [];
  let key = 0;
  const flushPara = () => { if (para.length) { blocks.push(<p key={`p${key++}`}>{renderInline(para.join(' '))}</p>); para = []; } };
  const flushList = () => { if (list.length) { blocks.push(<ul key={`l${key++}`}>{list.map((li, i) => <li key={i} id={listIds[i]}>{li}</li>)}</ul>); list = []; listIds = []; } };
  const splitRow = (row: string): string[] => {
    let r = row.trim();
    if (r.startsWith('|')) r = r.slice(1);
    if (r.endsWith('|')) r = r.slice(0, -1);
    return r.split('|').map(c => c.trim());
  };
  const padCells = (row: string[], count: number): string[] => {
    const out = row.slice(0, count);
    while (out.length < count) out.push('');
    return out;
  };
  const isSeparator = (line: string): boolean => {
    const t = line.trim();
    if (!t.includes('|')) return false;
    const core = t.replace(/^\|/, '').replace(/\|$/, '');
    return core.split('|').every(seg => /^:?-{3,}:?$/.test(seg.trim()));
  };
  const renderTable = (start: number): number => {
    const head = splitRow(lines[start]);
    const colCount = head.length;
    let i = start + 1;
    if (i < lines.length && isSeparator(lines[i])) i++;
    const body: string[][] = [];
    let current: string[] | null = null;
    let blankPending = false;
    while (i < lines.length) {
      const t = lines[i].trim();
      if (!t) { blankPending = true; i++; continue; }
      if (t.startsWith('|')) {
        if (current) { body.push(padCells(current, colCount)); current = null; }
        current = splitRow(t);
        blankPending = false;
        i++;
        continue;
      }
      if (current && !blankPending) {
        const segs = t.split('|').map(s => s.trim());
        current[current.length - 1] += ' ' + segs[0];
        for (let k = 1; k < segs.length; k++) current.push(segs[k]);
        i++;
        continue;
      }
      break;
    }
    if (current) body.push(padCells(current, colCount));
    flushPara(); flushList();
    blocks.push(
      <div key={`t${key++}`} className="my-4 overflow-x-auto rounded-xl border border-[var(--line-soft)]">
        <table className="w-full border-collapse text-[12.5px] leading-snug">
          <thead>
            <tr>{head.map((c, j) => <th key={j} className="border-b-2 border-[var(--line)] bg-[var(--bg-chip)] px-3 py-2 text-left font-semibold text-[var(--accent)]">{renderInline(c)}</th>)}</tr>
          </thead>
          <tbody>
            {body.map((r, ri) => <tr key={ri} className="odd:bg-[var(--bg-elevated)]">{r.map((c, j) => <td key={j} className="border-b border-[var(--line-soft)] px-3 py-2 text-[var(--body)]">{renderInline(c)}</td>)}</tr>)}
          </tbody>
        </table>
      </div>
    );
    return i;
  };
  let i = 0;
  while (i < lines.length) {
    const trimmed = lines[i].trim();
    if (!trimmed) { flushPara(); flushList(); i++; continue; }
    if (trimmed.includes('|') && i + 1 < lines.length && lines[i + 1].includes('|')) {
      i = renderTable(i);
      continue;
    }
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      flushPara(); flushList();
      blocks.push(<hr key={`r${key++}`} className="my-6 border-t border-[var(--line)]" />);
      i++;
      continue;
    }
    const heading = /^(#{1,3}) /.exec(trimmed);
    if (heading) {
      flushPara(); flushList();
      const content = trimmed.slice(heading[0].length);
      const Tag: 'h1' | 'h2' | 'h3' = heading[1].length === 1 ? 'h1' : heading[1].length === 2 ? 'h2' : 'h3';
      blocks.push(<Tag key={`h${key++}`} className="font-serif tracking-[-.02em]">{renderInline(content)}</Tag>);
      i++;
      continue;
    }
    if (/^[-*] /.test(trimmed)) {
      flushPara();
      const content = trimmed.replace(/^[-*]\s*/, '');
      const cite = /^\[(\d+)\]/.exec(content);
      listIds.push(cite ? `citation-${cite[1]}` : undefined);
      list.push(renderInline(content));
      i++;
      continue;
    }
    if (/^\d+\. /.test(trimmed)) {
      flushPara(); flushList();
      blocks.push(<p key={`n${key++}`}>{renderInline(trimmed)}</p>);
      i++;
      continue;
    }
    para.push(trimmed);
    i++;
  }
  flushPara(); flushList();
  return <>{blocks}</>;
}
function Report({ item }: { item: Research }) {
  const body = item.report || item.summary;
  return <section data-testid="panel-completed-report" className="rounded-2xl border border-[var(--line)] bg-[var(--bg-elevated)] p-5 sm:p-8"><div className="flex items-start justify-between gap-3"><div><Eyebrow>Defensible report</Eyebrow><h2 className="mt-2 font-serif text-[28px] text-[var(--ink)]">The evidence, assembled</h2></div><span className="flex items-center gap-1 rounded-full bg-[var(--tint-green)] px-2.5 py-1 font-mono text-[9px] uppercase text-[var(--tint-green-text)]"><Check size={12} /> Verified</span></div>{body ? <div id="report-container" className="prose prose-lg prose-indigo max-w-none text-slate-800 mt-6"><MarkdownReport text={body} /></div> : <p className="mt-6 text-[13px] leading-[1.75] text-[var(--body)]">The completed report is ready for review.</p>}<div className="mt-7 flex flex-wrap gap-3 border-t border-[var(--line-soft)] pt-5 text-[10px] text-[var(--muted)]"><span>{item.sourcesCount} sources</span><span>{item.claimsChecked} claims checked</span><span>{item.verificationScore}% confidence</span></div></section>; }

function History() {
  const { data, isLoading, isError, refetch } = useListResearch({ query: { queryKey: getListResearchQueryKey(), refetchInterval: 5000 } });
  const queryClient = useQueryClient();
  const urlSearch = useSearch();
  const urlTerm = new URLSearchParams(urlSearch).get('q') ?? '';
  const [search, setSearch] = useState(() => urlTerm);
  const [statusFilter, setStatusFilter] = useState<'all' | 'done' | 'running' | 'paused' | 'failed'>('all');
  const [renameTarget, setRenameTarget] = useState<Research | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Research | null>(null);
  const rename = useUpdateResearch();
  const remove = useDeleteResearch();

  useEffect(() => {
    if (urlTerm) setSearch(urlTerm);
  }, [urlTerm]);

  const confirmRename = () => {
    if (!renameTarget) return;
    const next = renameValue.trim();
    rename.mutate({ id: renameTarget.id, data: { query: next } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListResearchQueryKey() });
        queryClient.setQueryData(getGetResearchQueryKey(renameTarget.id), prev => prev ? { ...prev, query: next } : prev);
        setRenameTarget(null);
      },
    });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    remove.mutate({ id: deleteTarget.id }, {
      onSuccess: () => {
        queryClient.setQueryData<Research[]>(getListResearchQueryKey(), prev => prev?.filter(item => item.id !== deleteTarget.id) ?? prev);
        queryClient.removeQueries({ queryKey: getGetResearchQueryKey(deleteTarget.id) });
        queryClient.invalidateQueries({ queryKey: getListResearchQueryKey() });
        setDeleteTarget(null);
      },
    });
  };

  const term = search.trim().toLowerCase();
  const filtered = (data ?? []).filter(item => {
    const statusMatch = statusFilter === 'all' || item.status === statusFilter;
    const queryMatch = !term || item.query.toLowerCase().includes(term) || (item.summary ?? '').toLowerCase().includes(term);
    return statusMatch && queryMatch;
  });
  const statuses: Array<{ key: 'all' | 'done' | 'running' | 'paused' | 'failed'; label: string }> = [
    { key: 'all', label: 'All' }, { key: 'done', label: 'Completed' }, { key: 'running', label: 'In progress' }, { key: 'paused', label: 'Paused' }, { key: 'failed', label: 'Failed' },
  ];

  return <PageFrame><div className="border-b border-[var(--line)] pb-7"><Eyebrow>Research library</Eyebrow><h1 className="mt-2 font-serif text-[clamp(38px,5vw,58px)] leading-none tracking-[-.05em] text-[var(--ink)]">Your research trail</h1><p className="mt-3 max-w-[540px] text-[13px] text-[var(--body)]">Every question, source, and checked claim in one private record.</p><div className="mt-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div className="flex max-w-md items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--bg-elevated)] px-3 py-2.5"><Search size={14} className="text-[var(--muted)]" /><input data-testid="input-research-search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by question or summary…" className="w-full bg-transparent text-[12px] text-[var(--ink)] outline-none placeholder:text-[var(--muted-2)]" />{search && <button data-testid="button-clear-search" onClick={() => setSearch('')}><X size={13} className="text-[var(--muted-2)] hover:text-[var(--accent)]" /></button>}</div><Link href="/workspace?new=1" data-testid="link-start-new-from-history" className="flex items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-3.5 py-2.5 text-[11px] font-medium text-[var(--on-accent)]"><Plus size={14} /> New research</Link></div><div className="mt-4 flex flex-wrap gap-2">{statuses.map(s => <button key={s.key} data-testid={`filter-status-${s.key}`} onClick={() => setStatusFilter(s.key)} className={`rounded-full px-3 py-1.5 font-mono text-[9px] uppercase tracking-[.1em] transition ${statusFilter === s.key ? 'bg-[var(--accent)] text-[var(--on-accent)]' : 'bg-[var(--bg-chip)] text-[var(--body)] hover:bg-[var(--bg-chip)]'}`}>{s.label}</button>)}</div></div>
    {isLoading ? <div className="mt-7"><SkeletonRows /></div> : isError ? <div className="mt-7"><ErrorState onRetry={() => refetch()} /></div> : !data?.length ? <div className="mt-7"><EmptyState /></div> : filtered.length === 0 ? <div className="mt-7 rounded-xl border border-dashed border-[var(--line)] bg-[var(--bg-surface)] p-8 text-center"><FileSearch className="mx-auto text-[var(--accent-mid)]" size={23} /><p className="mt-3 text-[12px] font-medium text-[var(--body)]">No research matches your search.</p><p className="mt-1 text-[11px] text-[var(--muted)]">Try a different term or clear the status filter.</p></div> : <div className="mt-7 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{filtered.map(item => <ResearchCard key={item.id} item={item} onRename={setRenameTarget} onDelete={setDeleteTarget} />)}</div>}
    <Dialog open={!!renameTarget} onOpenChange={open => { if (!open) setRenameTarget(null); }}><DialogContent className="max-w-[420px] border-[var(--line)] bg-[var(--bg-elevated)] sm:max-w-[440px]"><DialogHeader><DialogTitle className="font-serif text-xl tracking-[-.02em] text-[var(--ink)]">Rename research</DialogTitle><DialogDescription className="text-[11px] text-[var(--body)]">Give this question a clearer label for your trail.</DialogDescription></DialogHeader><textarea data-testid="input-rename-title" value={renameValue} onChange={e => setRenameValue(e.target.value)} rows={3} className="w-full resize-none rounded-xl border border-[var(--line)] bg-[var(--bg-elevated)] px-3.5 py-3 text-[13px] leading-[1.5] text-[var(--ink)] outline-none focus:border-[var(--accent-mid)]" />{rename.isError && <p className="text-[10px] text-[var(--danger)]">Could not rename research. Please try again.</p>}<DialogFooter><Button data-testid="button-cancel-rename" onClick={() => setRenameTarget(null)}>Cancel</Button><Button data-testid="button-confirm-rename" primary onClick={confirmRename} disabled={rename.isPending || renameValue.trim().length === 0}>{rename.isPending ? 'Saving…' : 'Save'}</Button></DialogFooter></DialogContent></Dialog>
    <AlertDialog open={!!deleteTarget} onOpenChange={open => { if (!open) setDeleteTarget(null); }}><AlertDialogContent className="max-w-[420px] border-[var(--line-error)] bg-[var(--bg-elevated)]"><AlertDialogHeader><AlertDialogTitle className="font-serif text-xl tracking-[-.02em] text-[var(--ink)]">Delete research?</AlertDialogTitle><AlertDialogDescription className="text-[11px] leading-[1.6] text-[var(--body)]">This permanently removes the research trail{deleteTarget ? <span> for <span className="font-medium text-[var(--ink)]">"{deleteTarget.query}"</span></span> : null}. Your source records and this report cannot be restored.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel><AlertDialogAction data-testid="button-confirm-delete" onClick={e => { e.preventDefault(); confirmDelete(); }} className="bg-[var(--danger)] text-white hover:bg-[var(--danger-strong)]">{remove.isPending ? 'Deleting…' : 'Delete research'}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </PageFrame>;
}

function Sources() { const [page, setPage] = useState(1); const limit = 12; const { data, isLoading, isError, refetch } = useListSources({ page, limit }, { query: { queryKey: getListSourcesQueryKey({ page, limit }), staleTime: 30_000, placeholderData: keepPreviousData } }); const sources = data?.data ?? []; const totalPages = data?.pagination.totalPages ?? 1; const total = data?.pagination.total ?? 0; return <PageFrame><div className="border-b border-[var(--line)] pb-7"><Eyebrow>Source collections</Eyebrow><h1 className="mt-2 font-serif text-[clamp(38px,5vw,58px)] leading-none tracking-[-.05em] text-[var(--ink)]">The evidence shelf</h1><p className="mt-3 max-w-[540px] text-[13px] text-[var(--body)]">Documents Axiom has read across your private research context.</p></div>{isLoading ? <div className="mt-7"><SkeletonRows /></div> : isError ? <div className="mt-7"><ErrorState onRetry={() => refetch()} /></div> : !sources.length ? <div className="mt-7"><EmptyState /></div> : <><div className="mt-7 grid gap-3 md:grid-cols-2">{sources.map((source, i) => <Link href={`/workspace/research/${source.researchId}`} data-testid={`card-source-${i}`} key={`${source.researchId}-${source.title}-${i}`} className="group rounded-xl border border-[var(--line)] bg-[var(--bg-elevated)] p-5 transition hover:border-[var(--accent-mid)]"><div className="flex items-center justify-between"><span className="font-mono text-[9px] uppercase tracking-[.14em] text-[var(--muted)]">{source.type}</span><span className="font-mono text-[10px] text-[var(--body)]">{source.progress}% read</span></div><h2 className="mt-3 text-[14px] font-medium leading-[1.4] text-[var(--ink)]">{source.title}</h2><p className="mt-1 text-[11px] text-[var(--muted)]">{source.source}</p><div className="mt-4 h-1 rounded-full bg-[var(--progress-track)]"><div className="h-full rounded-full bg-[var(--progress-fill)]" style={{ width: `${source.progress}%` }} /></div><p className="mt-3 line-clamp-1 text-[10px] text-[var(--muted-2)]">From: {source.researchQuery}</p></Link>)}</div><div className="mt-6 flex items-center justify-between border-t border-[var(--line)] pt-4"><Button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Previous</Button><span className="font-mono text-[10px] text-[var(--body)]">Page {page} of {totalPages} · {total} sources</span><Button disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next</Button></div></>}</PageFrame>; }

function WorkspaceRouter() { return <Switch><Route path="/workspace" component={Home} /><Route path="/workspace/research/:id" component={ResearchPage} /><Route path="/workspace/library" component={History} /><Route path="/workspace/sources" component={Sources} /><Route path="/history">{() => <Redirect to="/workspace/library" />}</Route><Route path="/sources">{() => <Redirect to="/workspace/sources" />}</Route><Route path="/research/:id">{({ id }) => <Redirect to={`/workspace/research/${id}`} />}</Route><Route component={NotFound} /></Switch>; }
function AuthRouter() { return <Switch><Route path="/" component={Landing} /><Route path="/login" component={LoginPage} /><Route path="/register" component={RegisterPage} /><Route path="/contact" component={ContactPage} /><Route>{() => <RequireAuth><Shell><WorkspaceRouter /></Shell></RequireAuth>}</Route></Switch>; }
function RoutedErrorBoundary({ children }: { children: ReactNode }) { const [location] = useLocation(); return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>; }
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <RoutedErrorBoundary>
              <AuthRouter />
            </RoutedErrorBoundary>
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
export default App;