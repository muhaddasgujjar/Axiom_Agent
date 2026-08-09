import { type FormEvent, type ReactNode, useEffect, useRef, useState } from 'react';
import { keepPreviousData, QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, ArrowUpRight, BookOpen, BrainCircuit, Check, ChevronRight, CircleHelp,
  Clock3, FileCheck2, FileSearch, Filter, FlaskConical, Focus, GitBranch, Globe2,
  Layers3, Library, Link2, LockKeyhole, Menu, MoreVertical, PanelLeft, Pencil, Plus,
  Search, ShieldCheck, Sparkles, Target, Trash2, X, Pause, Play, RefreshCw, AlertCircle, Download, LogOut,
} from 'lucide-react';
import { Link, Route, Switch, useLocation, useParams, useSearch, Router as WouterRouter } from 'wouter';
import {
  getGetResearchQueryKey, getGetWorkspaceSummaryQueryKey, getGetWorkspaceUsageQueryKey, getListResearchQueryKey, getListSourcesQueryKey,
  useDeleteResearch, useGetResearch, useGetWorkspaceSummary, useGetWorkspaceUsage, useListResearch, useListSources, usePauseResearch, useStartResearch, useUpdateResearch,
} from '@workspace/api-client-react';
import type { Agent, Research, Source } from '@workspace/api-client-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { AuthProvider, RequireAuth, useAuth } from '@/components/auth-provider';
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
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient();
const ink = '#214e4a';
const icons = [Globe2, BookOpen, CircleHelp, BrainCircuit, ShieldCheck, FileCheck2];
const agentTones = ['bg-[#d5e6e1] text-[#23665d]', 'bg-[#e6ddf0] text-[#654a78]', 'bg-[#f3dfc5] text-[#8a5427]', 'bg-[#d9e1ef] text-[#38577f]', 'bg-[#d5e8d9] text-[#3d7348]', 'bg-[#e8e5dc] text-[#716d61]'];

function Shell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { data: usage } = useGetWorkspaceUsage({ query: { queryKey: getGetWorkspaceUsageQueryKey(), staleTime: 15_000 } });
  const { user, signOut } = useAuth();
  const [location, navigate] = useLocation();
  const active = location.startsWith('/history') ? 'Research library' : location.startsWith('/sources') ? 'Source collections' : 'Workspace';
  const submitSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    navigate(`/history${q ? `?q=${encodeURIComponent(q)}` : ''}`);
    setSearchQuery('');
  };
  const handleLogout = () => {
    signOut();
    navigate('/login');
  };
  const initials = (user?.email?.split('@')[0] ?? 'U').slice(0, 2).toUpperCase();
  return (
    <main className="min-h-[100dvh] bg-[#f4f2ed] text-[#1d2d2c] selection:bg-[#c8ded8]">
      <div className="flex min-h-[100dvh]">
        <aside className={`${open ? 'fixed inset-y-0 left-0 z-40 flex w-[264px]' : 'hidden'} ${collapsed ? 'lg:w-[264px]' : 'lg:w-0 lg:overflow-hidden'} shrink-0 flex-col border-r border-[#d8d8ce] bg-[#eeeee8] transition-all duration-300 lg:relative lg:flex`}>
          <div className="flex h-[76px] items-center gap-3 border-b border-[#d8d8ce] px-6">
            <div className="grid size-8 place-items-center rounded-[10px] bg-[#214e4a] text-[#f5f3eb]"><FlaskConical size={17} strokeWidth={1.7} /></div>
            <div><p className="font-serif text-[17px] leading-none tracking-[-.02em] text-[#214e4a]">Axiom</p><p className="mt-1 font-mono text-[8px] uppercase tracking-[.2em] text-[#78807b]">Research instrument</p></div>
            <button aria-label="Close navigation" data-testid="button-close-navigation" className="ml-auto lg:hidden" onClick={() => setOpen(false)}><X size={16} /></button>
          </div>
          <div className="px-4 py-5"><Link href="/?new=1" data-testid="link-new-research" className="flex w-full items-center justify-between rounded-xl bg-[#214e4a] px-3.5 py-3 text-left text-[#f5f3eb] shadow-[0_5px_15px_rgba(33,78,74,.14)] transition hover:bg-[#173d3a]"><span className="flex items-center gap-2.5 text-[12px] font-medium"><Plus size={15} /> New research</span><span className="font-mono text-[9px] text-[#b8d0ca]">⌘ K</span></Link></div>
          <nav className="space-y-1 px-3 text-[12px]">
            <NavItem href="/" active={active === 'Workspace'} icon={Focus} label="Workspace" />
            <NavItem href="/history" active={active === 'Research library'} icon={Library} label="Research library" />
            <NavItem href="/sources" active={active === 'Source collections'} icon={Layers3} label="Source collections" />
          </nav>
          <div className="mt-auto border-t border-[#d8d8ce] p-4">
            <button data-testid="button-workspace-privacy" onClick={() => setPrivacyOpen(true)} className="w-full cursor-pointer rounded-xl border border-[#d4d8d0] bg-[#f5f4ee] p-3.5 text-left transition hover:border-[#9db9b0]"><div className="mb-2 flex items-center justify-between"><span className="font-mono text-[9px] uppercase tracking-[.16em] text-[#7a847f]">Workspace privacy</span><LockKeyhole size={13} className="text-[#47756d]" /></div><p className="text-[11px] leading-[1.5] text-[#52605b]">Your sources and reports stay private to your workspace.</p><div className="mt-3 h-1 rounded-full bg-[#dfe5df]"><div className="h-full rounded-full bg-[#6e9b90]" style={{ width: `${Math.min(usage?.usedContextPct ?? 0, 100)}%` }} /></div><p className="mt-2 font-mono text-[9px] text-[#89908a]">{usage?.usedContextPct ?? 0}% of research context used</p></button>
            <button data-testid="button-how-axiom-works" className="mt-4 flex items-center gap-2 px-2 text-[11px] text-[#65706c] hover:text-[#214e4a]"><CircleHelp size={14} /> How Axiom works</button>
            <button data-testid="button-sign-out" onClick={signOut} className="mt-3 flex items-center gap-2 px-2 text-[11px] text-[#65706c] hover:text-[#9b544b]"><LogOut size={14} /> Sign out</button>
          </div>
        </aside>
        {open && <button aria-label="Close menu" data-testid="button-menu-overlay" className="fixed inset-0 z-30 bg-[#214e4a]/15 lg:hidden" onClick={() => setOpen(false)} />}
        <section className="min-w-0 flex-1">
          <header className="flex h-[76px] items-center justify-between border-b border-[#d8d8ce] bg-[#f7f6f1]/85 px-5 backdrop-blur sm:px-8">
            <div className="flex min-w-0 items-center gap-3"><button data-testid="button-toggle-sidebar" className="rounded-lg p-2 text-[#66716c] hover:bg-[#e8eae3]" onClick={() => { setOpen(true); setCollapsed(!collapsed); }}><Menu size={19} className="lg:hidden" /><PanelLeft size={17} className="hidden lg:block" /></button><span className="hidden text-[11px] text-[#89908a] sm:block">My workspace</span><span className="hidden text-[#b0b4ae] sm:block">/</span><span className="truncate text-[12px] font-medium text-[#364541]">{location.startsWith('/research/') ? 'Research workspace' : active}</span></div>
            <div className="flex items-center gap-2.5">
              <form onSubmit={submitSearch} className="hidden sm:flex"><div className="flex items-center gap-2 rounded-lg border border-[#d3d5cc] bg-[#faf9f4] px-3 py-2 transition hover:border-[#9db9b0] focus-within:border-[#83a99e]"><Search size={14} className="text-[#7a847f]" /><input data-testid="input-search-workspace" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search workspace" className="w-40 bg-transparent text-[11px] text-[#344b46] outline-none placeholder:text-[#a0a8a1] lg:w-52" /></div></form>
              <DropdownMenu>
                <DropdownMenuTrigger data-testid="avatar-user" aria-label="Account menu" className="grid size-8 place-items-center rounded-full bg-[#c5d8d0] text-[11px] font-semibold text-[#28564f] outline-none transition hover:ring-2 hover:ring-[#9db9b0]">{initials}</DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal"><span className="block font-mono text-[9px] uppercase tracking-[.16em] text-[#89918a]">Signed in as</span><span className="mt-1 block truncate text-[12px] font-medium text-[#344b46]">{user?.email ?? '…'}</span></DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem data-testid="button-manage-profile" onClick={() => setProfileOpen(true)}>Manage Profile</DropdownMenuItem>
                  <DropdownMenuItem data-testid="button-logout" onClick={handleLogout} className="text-[#9b544b]"><LogOut size={13} /> Log out</DropdownMenuItem>
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
  return <Link href={href} data-testid={`link-${label.toLowerCase().replaceAll(' ', '-')}`} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition ${active ? 'bg-[#dce8e4] font-semibold text-[#214e4a]' : 'text-[#69736f] hover:bg-[#e4e6df]'}`}><Icon size={16} strokeWidth={1.7} />{label}</Link>;
}

function PageFrame({ children, className = '' }: { children: ReactNode; className?: string }) { return <div className={`mx-auto max-w-[1280px] px-5 py-7 sm:px-8 lg:px-10 lg:py-9 ${className}`}>{children}</div>; }
function Eyebrow({ children }: { children: ReactNode }) { return <p className="font-mono text-[9px] uppercase tracking-[.18em] text-[#7a847f]">{children}</p>; }
function Button({ children, primary = false, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { primary?: boolean }) { return <button {...props} className={`${primary ? 'bg-[#214e4a] text-[#f5f3eb] hover:bg-[#173d3a]' : 'border border-[#cfd4cc] bg-[#faf9f4] text-[#55635e] hover:border-[#91aea5]'} rounded-lg px-3.5 py-2.5 text-[11px] font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${props.className ?? ''}`}>{children}</button>; }

function Home() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [query, setQuery] = useState('');
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState(false);
  const { data: researchList, isLoading, isError, refetch } = useListResearch({ query: { queryKey: getListResearchQueryKey(), staleTime: 30_000 } });
  const { data: summary } = useGetWorkspaceSummary({ query: { queryKey: getGetWorkspaceSummaryQueryKey(), staleTime: 30_000 } });
  const start = useStartResearch();
  useEffect(() => {
    if (search === 'new=1') {
      window.history.replaceState(null, '', window.location.pathname);
      textareaRef.current?.focus();
    }
  }, [search]);
  const submit = async () => {
    if (query.trim().length < 10 || starting) return;
    setStarting(true);
    setStartError(false);
    start.mutate({ data: { query: query.trim() } }, {
      onSuccess: (data) => setLocation(`/research/${data.research_id ?? data.id}`),
      onError: () => setStartError(true),
      onSettled: () => setStarting(false),
    });
  };
  const recent = researchList?.slice(0, 3) ?? [];
  return <PageFrame>
    <div className="mx-auto max-w-[900px] pt-7 text-center sm:pt-12"><div className="mx-auto mb-5 grid size-11 place-items-center rounded-2xl bg-[#dceae5] text-[#315e58]"><Sparkles size={20} strokeWidth={1.6} /></div><Eyebrow>Private research instrument</Eyebrow><h1 className="mt-4 font-serif text-[clamp(42px,7vw,76px)] leading-[.94] tracking-[-.055em] text-[#24413d]">Find the answer<br /><em>behind</em> the answer.</h1><p className="mx-auto mt-6 max-w-[590px] text-[13px] leading-[1.7] text-[#65706b]">Axiom turns complex questions into a defensible research trail — with sources, claims, and the reasoning to connect them.</p>
      <div className="mx-auto mt-9 max-w-[760px] rounded-2xl border border-[#cfd8d1] bg-[#faf9f4] p-2 text-left shadow-[0_14px_40px_rgba(38,58,53,.06)] focus-within:border-[#83a99e]"><textarea data-testid="input-research-query" ref={textareaRef} value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit(); }} placeholder="What would you like to understand?" rows={3} className="w-full resize-none bg-transparent px-4 py-3 text-[15px] leading-[1.5] text-[#344b46] outline-none placeholder:text-[#a0a8a1]" /><div className="flex items-center justify-between border-t border-[#e7e8e1] px-3 pt-2"><span className="font-mono text-[9px] text-[#9aa39c]">Be specific. Axiom will map the evidence.</span><Button data-testid="button-start-research" primary onClick={submit} disabled={query.trim().length < 10 || starting}>{starting ? 'Starting…' : <span className="flex items-center gap-2">Start research <ArrowUpRight size={14} /></span>}</Button></div></div>
      {startError && <p role="alert" data-testid="status-create-error" className="mt-3 text-[11px] text-[#9b544b]">Could not start research. Please try again.</p>}
      <div className="mt-5 flex flex-wrap justify-center gap-2"><span className="rounded-full bg-[#e8f0eb] px-3 py-1.5 font-mono text-[9px] text-[#5a7a70]">Policy & markets</span><span className="rounded-full bg-[#eee5f3] px-3 py-1.5 font-mono text-[9px] text-[#6d5d7b]">Technology shifts</span><span className="rounded-full bg-[#f1e8d8] px-3 py-1.5 font-mono text-[9px] text-[#8a6a4a]">Evidence reviews</span></div>
    </div>
    <section className="mx-auto mt-16 max-w-[1040px] border-t border-[#d8d8ce] pt-6"><div className="mb-4 flex items-end justify-between"><div><Eyebrow>Recent context</Eyebrow><h2 className="mt-1.5 text-[13px] font-medium text-[#344b46]">Your research trail</h2></div><Link href="/history" data-testid="link-view-history" className="flex items-center gap-1 text-[11px] font-medium text-[#47766e]">View history <ChevronRight size={14} /></Link></div>
      {isLoading ? <SkeletonRows /> : isError ? <ErrorState onRetry={() => refetch()} /> : recent.length === 0 ? <EmptyState /> : <div className="grid gap-3 md:grid-cols-3">{recent.map(item => <ResearchCard key={item.id} item={item} />)}</div>}
    </section>
    <div className="mx-auto mt-12 grid max-w-[1040px] gap-3 sm:grid-cols-3"><Stat label="Active research" value={summary?.activeResearch ?? 0} /><Stat label="Completed reports" value={summary?.completedReports ?? 0} /><Stat label="Sources read" value={summary?.sourcesRead ?? 0} /></div>
  </PageFrame>;
}

function Stat({ label, value }: { label: string; value: number }) { return <div className="rounded-xl border border-[#d7dbd3] bg-[#f8f7f2] p-4"><p className="font-mono text-[9px] uppercase tracking-[.15em] text-[#87918a]">{label}</p><p className="mt-2 font-serif text-3xl text-[#315e58]">{value}</p></div>; }
function SkeletonRows() { return <div className="grid gap-3 md:grid-cols-3">{[1, 2, 3].map(i => <div key={i} className="h-28 animate-pulse rounded-xl border border-[#e3e4dd] bg-[#ecece5]" />)}</div>; }
function ErrorState({ onRetry }: { onRetry: () => void }) { return <div className="flex items-center justify-between rounded-xl border border-[#e2c6c1] bg-[#fbf2ef] p-4 text-[12px] text-[#84534c]"><span className="flex items-center gap-2"><AlertCircle size={15} /> Context could not be loaded.</span><button data-testid="button-retry" onClick={onRetry} className="flex items-center gap-1 font-medium"><RefreshCw size={13} /> Retry</button></div>; }
function EmptyState() { return <div className="rounded-xl border border-dashed border-[#cbd4cc] bg-[#f8f7f2] p-8 text-center"><FileSearch className="mx-auto text-[#7d9b92]" size={23} /><p className="mt-3 text-[12px] font-medium text-[#52615b]">Your trail starts here.</p><p className="mt-1 text-[11px] text-[#89918a]">Start a research question to build a private evidence record.</p></div>; }
function ResearchCard({ item, onRename, onDelete }: { item: Research; onRename?: (item: Research) => void; onDelete?: (item: Research) => void }) {
  const manage = !!onRename && !!onDelete;
  return <div data-testid={`card-research-${item.id}`} className={`group relative rounded-xl border border-[#d7dbd3] bg-[#faf9f4] p-4 transition ${manage ? '' : 'hover:-translate-y-0.5 '}hover:border-[#9db9b0]`}><Link href={`/research/${item.id}`} className="block"><div className="flex items-start justify-between gap-3"><div className="grid size-7 shrink-0 place-items-center rounded-lg bg-[#e3eee9] text-[#50726a]"><FileCheck2 size={14} /></div><div className="flex items-center gap-3"><span className="font-mono text-[9px] uppercase tracking-[.1em] text-[#7b8a83]">{item.status === 'done' ? 'Completed' : item.status}</span>{manage && <DropdownMenu><DropdownMenuTrigger data-testid={`button-card-menu-${item.id}`} aria-label={`Actions for ${item.query}`} onClick={e => { e.preventDefault(); e.stopPropagation(); }} className="grid size-7 place-items-center rounded-lg border border-transparent text-[#8b958f] transition hover:border-[#cfd4cc] hover:bg-[#f0f1eb]"><MoreVertical size={15} /></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem data-testid={`button-card-rename-${item.id}`} onClick={e => { e.stopPropagation(); onRename(item); }}><Pencil size={13} /> Rename research</DropdownMenuItem><DropdownMenuItem data-testid={`button-card-delete-${item.id}`} onClick={e => { e.stopPropagation(); onDelete(item); }} className="text-[#9b544b]"><Trash2 size={13} /> Delete research</DropdownMenuItem></DropdownMenuContent></DropdownMenu>}</div></div><p className="mt-3 line-clamp-2 text-[12px] font-medium leading-[1.4] text-[#40534d]">{item.query}</p><p className="mt-2 font-mono text-[9px] text-[#89918a]">{item.sourcesCount} sources · {item.elapsedMinutes} min</p></Link></div>;
}

function ResearchPage() {
  const { id = '' } = useParams<{ id: string }>();
  const { data: item, isLoading, isError, refetch } = useGetResearch(id, { query: { queryKey: getGetResearchQueryKey(id), refetchInterval: (query) => query.state.data?.status === 'done' || query.state.data?.status === 'failed' ? false : 3000 } });
  if (isLoading) return <PageFrame><div className="space-y-5"><div className="h-8 w-72 animate-pulse rounded bg-[#e4e7df]" /><div className="h-80 animate-pulse rounded-2xl bg-[#e4e7df]" /></div></PageFrame>;
  if (isError || !item) return <PageFrame><ErrorState onRetry={() => refetch()} /></PageFrame>;
  return <PageFrame><ResearchHeader item={item} /><div className="grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,.8fr)]"><div className="space-y-5"><Pipeline item={item} />{item.status === 'done' ? <Report item={item} /> : <SourceReading sources={item.sources} count={item.sourcesCount} />}</div><div className="space-y-5"><Confidence item={item} /><RecentContext items={item.recent} /></div></div>{item.status !== 'done' && <div className="mt-5 rounded-2xl border border-[#d7dbd3] bg-[#faf9f4] p-5 sm:p-6"><div className="flex items-center gap-3"><div className="grid size-9 place-items-center rounded-xl bg-[#e8e1f0] text-[#6b5480]"><BrainCircuit size={18} /></div><div><Eyebrow>Research note</Eyebrow><p className="mt-1 text-[12px] text-[#52615b]">Axiom is separating durable evidence from speculative promise.</p></div></div></div>}<footer className="flex flex-col justify-between gap-2 py-6 text-[10px] text-[#8a918c] sm:flex-row"><span className="flex items-center gap-1.5"><ShieldCheck size={12} /> Every claim will carry its source trail</span><span className="font-mono">Last autosaved moments ago</span></footer></PageFrame>;
}

function ResearchHeader({ item }: { item: Research }) {
  const [copied, setCopied] = useState(false);
  const pause = usePauseResearch();
  const queryClient = useQueryClient();
  const paused = item.status === 'paused';
  const toggle = () => pause.mutate({ id: item.id }, { onSuccess: data => queryClient.setQueryData(getGetResearchQueryKey(item.id), data) });
  const share = () => { navigator.clipboard?.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 1600); };
  const downloadPDF = () => window.print();
  return <div className="mb-8 flex flex-col justify-between gap-5 xl:flex-row xl:items-end"><div><div className="mb-3 flex flex-wrap items-center gap-2"><span data-testid="status-research" className={`rounded-full px-2.5 py-1 font-mono text-[9px] uppercase tracking-[.15em] ${item.status === 'done' ? 'bg-[#dce8e4] text-[#3f756b]' : paused ? 'bg-[#f1e8d8] text-[#8a6a4a]' : 'bg-[#dceae5] text-[#3f756b]'}`}>{item.status === 'done' ? 'Research complete' : paused ? 'Research paused' : `Research ${item.status}`}</span><span className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-[.12em] text-[#8a918c]"><Clock3 size={12} /> {item.elapsedMinutes} min elapsed</span></div><h1 data-testid="text-research-title" className="max-w-[760px] font-serif text-[clamp(32px,4vw,52px)] leading-[1.03] tracking-[-.045em] text-[#24413d]">{item.query}</h1><p className="mt-4 max-w-[700px] text-[13px] leading-[1.65] text-[#65706b]">{item.summary || 'Axiom is mapping the evidence, testing claims, and building a source-backed answer.'}</p></div><div className="flex shrink-0 items-center gap-2">{item.status === 'done' && <Button data-testid="button-download-pdf" onClick={downloadPDF}><span className="flex items-center gap-2"><Download size={14} /> Download PDF</span></Button>}<Button data-testid="button-pause-research" onClick={toggle} disabled={pause.isPending || item.status === 'done'}>{paused ? <span className="flex items-center gap-2"><Play size={14} /> Resume research</span> : <span className="flex items-center gap-2"><Pause size={14} /> Pause research</span>}</Button><Button data-testid="button-share-research" primary onClick={share}>{copied ? <span className="flex items-center gap-2"><Check size={14} /> Link copied</span> : <span className="flex items-center gap-2"><ArrowUpRight size={14} /> Share workspace</span>}</Button></div></div>;
}

function Pipeline({ item }: { item: Research }) { return <section className="rounded-2xl border border-[#d7dbd3] bg-[#faf9f4] p-5 shadow-[0_8px_30px_rgba(38,58,53,.035)] sm:p-6"><div className="mb-5 flex items-center justify-between"><div><Eyebrow>Agent pipeline</Eyebrow><p className="mt-1.5 text-[13px] font-medium text-[#344b46]">Six specialists, one defensible answer</p></div><span className="font-mono text-[9px] text-[#87918a]">{item.progress}% complete</span></div><div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">{item.agents.map((agent, index) => <AgentCard key={agent.name} agent={agent} index={index} />)}</div><div className="mt-5 flex items-center gap-3 border-t border-[#e4e5de] pt-4"><div className="h-1.5 flex-1 rounded-full bg-[#e3e8e2]"><div className="h-full rounded-full bg-[#4f8379] transition-all duration-700" style={{ width: `${item.progress}%` }} /></div><span className="font-mono text-[10px] text-[#55716b]">{item.progress}% complete</span></div></section>; }
function AgentCard({ agent, index }: { agent: Agent; index: number }) { const Icon = icons[index % icons.length]; const done = agent.status === 'done'; return <div data-testid={`card-agent-${agent.name.toLowerCase()}`} className="rounded-xl border border-[#e1e3db] bg-[#f5f5ef] p-3.5 transition hover:border-[#a9c0b7]"><div className="mb-4 flex items-start justify-between"><div className={`grid size-8 place-items-center rounded-lg ${agentTones[index % agentTones.length]}`}><Icon size={16} strokeWidth={1.7} /></div>{done ? <span className="grid size-5 place-items-center rounded-full bg-[#d6e8d8] text-[#4d7d51]"><Check size={12} /></span> : <span className="mt-1 size-1.5 animate-pulse rounded-full bg-[#c78b4b]" />}</div><p className="text-[12px] font-semibold text-[#334841]">{index + 1}. {agent.name}</p><p className="mt-1 text-[11px] text-[#78837d]">{agent.detail}</p><div className="mt-3 flex items-center justify-between font-mono text-[9px] text-[#87918a]"><span>{agent.count}</span><span className={done ? 'text-[#55716b]' : 'text-[#b07c43]'}>{done ? 'done' : agent.progress > 0 ? `${agent.progress}%` : 'queued'}</span></div></div>; }
function SourceReading({ sources, count }: { sources: Source[]; count: number }) { return <section className="rounded-2xl border border-[#d7dbd3] bg-[#faf9f4] p-5 sm:p-6"><div className="mb-5 flex items-center justify-between"><div><Eyebrow>Source reading</Eyebrow><p className="mt-1.5 text-[13px] font-medium text-[#344b46]">Full documents, not snippets</p></div><button data-testid="button-filter-sources" className="flex items-center gap-1.5 rounded-lg border border-[#d6d9d1] px-2.5 py-1.5 text-[10px] text-[#67736d] hover:bg-[#f0f1eb]"><Filter size={12} /> Filter</button></div><div className="space-y-1">{sources.map((source, i) => <SourceRow key={`${source.title}-${i}`} source={source} index={i} />)}</div><button data-testid="button-view-all-sources" className="mt-3 flex items-center gap-2 px-2 text-[11px] font-medium text-[#47766e] hover:text-[#214e4a]"><FileSearch size={14} /> View all {count} sources</button></section>; }
function SourceRow({ source, index }: { source: Source; index: number }) { return <button data-testid={`button-source-${index}`} className="group flex w-full items-center gap-3 rounded-xl px-2 py-3 text-left transition hover:bg-[#f0f1eb] sm:gap-4"><div className={`hidden h-10 w-1 shrink-0 rounded-full sm:block ${['bg-[#315e58]', 'bg-[#78618d]', 'bg-[#a16938]'][index % 3]}`} /><div className="min-w-0 flex-1"><div className="mb-1 flex items-center gap-2"><span className="font-mono text-[8px] tracking-[.13em] text-[#8a918c]">{source.type}</span><span className="truncate text-[12px] font-medium text-[#3c514b]">{source.title}</span></div><p className="text-[10px] text-[#89918a]">{source.source}</p><div className="mt-2 h-1 rounded-full bg-[#e4e8e2]"><div className="h-full rounded-full bg-[#78a69b]" style={{ width: `${source.progress}%` }} /></div></div><span className="font-mono text-[10px] text-[#77837c]">{source.progress}%</span><Link href={`/sources?source=${encodeURIComponent(source.title)}`} aria-label={`Open ${source.title}`} data-testid={`link-source-${index}`} className="hidden rounded-md p-1 text-[#8b958f] hover:bg-[#e4e7df] sm:block"><ArrowUpRight size={14} /></Link></button>; }
function Confidence({ item }: { item: Research }) { return <section data-testid="panel-claim-confidence" className="overflow-hidden rounded-2xl border border-[#cbdcd2] bg-[#e8f0eb] p-5 sm:p-6"><div className="flex items-start justify-between"><div><Eyebrow>Claim confidence</Eyebrow><h2 className="mt-2 font-serif text-[30px] tracking-[-.04em] text-[#29534a]">{item.verificationScore}<span className="text-[18px]">%</span></h2></div><div className="grid size-10 place-items-center rounded-xl bg-[#d0e3d8] text-[#3c7562]"><ShieldCheck size={21} strokeWidth={1.5} /></div></div><p className="mt-1 max-w-[240px] text-[11px] leading-[1.5] text-[#61746d]">of synthesized claims have direct, independently verified support.</p><div className="relative mt-6 h-2 rounded-full bg-[#d1dfd8]"><div className="h-full rounded-full bg-[#4d8375]" style={{ width: `${item.verificationScore}%` }} /><div className="absolute left-[72%] top-[-4px] h-4 w-px bg-[#8faea2]" /></div><div className="mt-2 flex justify-between font-mono text-[9px] text-[#769087]"><span>Needs evidence</span><span>Strong support</span></div><div className="mt-5 border-t border-[#cedfd5] pt-4"><div className="flex items-center gap-2 text-[11px] font-medium text-[#38675c]"><Target size={14} /> {item.status === 'done' ? 'Verification complete' : 'Verification pass underway'}</div><p className="mt-2 text-[10px] leading-[1.5] text-[#6d837b]">{item.claimsChecked} claims checked against primary sources.</p></div></section>; }
function RecentContext({ items }: { items: Research['recent'] }) { return <section className="rounded-2xl border border-[#d7dbd3] bg-[#faf9f4] p-5 sm:p-6"><div className="mb-4 flex items-center justify-between"><div><Eyebrow>Recent context</Eyebrow><p className="mt-1.5 text-[13px] font-medium text-[#344b46]">Your research trail</p></div><GitBranch size={16} className="text-[#7d8982]" /></div><div className="space-y-2">{items.slice(0, 4).map(item => <Link key={item.id} href={`/research/${item.id}`} data-testid={`link-recent-${item.id}`} className="flex items-start gap-3 rounded-xl p-2 text-left transition hover:bg-[#f0f1eb]"><div className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-[#e3eee9] text-[#50726a]"><FileCheck2 size={14} /></div><div className="min-w-0"><p className="line-clamp-2 text-[11px] font-medium leading-[1.4] text-[#40534d]">{item.title}</p><p className="mt-1 font-mono text-[8px] text-[#89918a]">{item.meta}</p></div></Link>)}</div><Link href="/history" data-testid="link-open-research-history" className="mt-4 flex items-center gap-2 px-2 text-[11px] font-medium text-[#47766e]">Open research history <ArrowUpRight size={14} /></Link></section>; }
function CitationLink({ n }: { n: string }) { return <a href={`#citation-${n}`} data-testid={`citation-link-${n}`} className="mx-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded bg-[#dceae5] px-1 font-mono text-[10px] leading-none text-[#3f756b] no-underline transition hover:bg-[#c2ddd3]">[{n}]</a>; }
function renderInline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|\[\d+\])/g).map((part, i) => {
    if (/^\[\d+\]$/.test(part)) return <CitationLink key={i} n={part.slice(1, -1)} />;
    if (/^\*\*[^*]+\*\*$/.test(part)) return <strong key={i} className="font-semibold text-[#334841]">{part.slice(2, -2)}</strong>;
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
      <div key={`t${key++}`} className="my-4 overflow-x-auto rounded-xl border border-[#e1e3db]">
        <table className="w-full border-collapse text-[12.5px] leading-snug">
          <thead>
            <tr>{head.map((c, j) => <th key={j} className="border-b-2 border-[#cdd4cc] bg-[#f0f1eb] px-3 py-2 text-left font-semibold text-[#214e4a]">{renderInline(c)}</th>)}</tr>
          </thead>
          <tbody>
            {body.map((r, ri) => <tr key={ri} className="odd:bg-[#f7f6f1]">{r.map((c, j) => <td key={j} className="border-b border-[#e4e5de] px-3 py-2 text-[#52615b]">{renderInline(c)}</td>)}</tr>)}
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
      blocks.push(<hr key={`r${key++}`} className="my-6 border-t border-[#d8d8ce]" />);
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
  return <section data-testid="panel-completed-report" className="rounded-2xl border border-[#d7dbd3] bg-[#faf9f4] p-5 sm:p-8"><div className="flex items-start justify-between gap-3"><div><Eyebrow>Defensible report</Eyebrow><h2 className="mt-2 font-serif text-[28px] text-[#29534a]">The evidence, assembled</h2></div><span className="flex items-center gap-1 rounded-full bg-[#dceae5] px-2.5 py-1 font-mono text-[9px] uppercase text-[#3f756b]"><Check size={12} /> Verified</span></div>{body ? <div id="report-container" className="prose prose-lg prose-indigo max-w-none text-slate-800 mt-6"><MarkdownReport text={body} /></div> : <p className="mt-6 text-[13px] leading-[1.75] text-[#52615b]">The completed report is ready for review.</p>}<div className="mt-7 flex flex-wrap gap-3 border-t border-[#e4e5de] pt-5 text-[10px] text-[#7a847f]"><span>{item.sourcesCount} sources</span><span>{item.claimsChecked} claims checked</span><span>{item.verificationScore}% confidence</span></div></section>; }

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

  return <PageFrame><div className="border-b border-[#d8d8ce] pb-7"><Eyebrow>Research library</Eyebrow><h1 className="mt-2 font-serif text-[clamp(38px,5vw,58px)] leading-none tracking-[-.05em] text-[#24413d]">Your research trail</h1><p className="mt-3 max-w-[540px] text-[13px] text-[#65706b]">Every question, source, and checked claim in one private record.</p><div className="mt-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div className="flex max-w-md items-center gap-2 rounded-xl border border-[#d3d5cc] bg-[#faf9f4] px-3 py-2.5"><Search size={14} className="text-[#7a847f]" /><input data-testid="input-research-search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by question or summary…" className="w-full bg-transparent text-[12px] text-[#344b46] outline-none placeholder:text-[#a0a8a1]" />{search && <button data-testid="button-clear-search" onClick={() => setSearch('')}><X size={13} className="text-[#9aa39c] hover:text-[#214e4a]" /></button>}</div><Link href="/?new=1" data-testid="link-start-new-from-history" className="flex items-center justify-center gap-2 rounded-lg bg-[#214e4a] px-3.5 py-2.5 text-[11px] font-medium text-[#f5f3eb]"><Plus size={14} /> New research</Link></div><div className="mt-4 flex flex-wrap gap-2">{statuses.map(s => <button key={s.key} data-testid={`filter-status-${s.key}`} onClick={() => setStatusFilter(s.key)} className={`rounded-full px-3 py-1.5 font-mono text-[9px] uppercase tracking-[.1em] transition ${statusFilter === s.key ? 'bg-[#214e4a] text-[#f5f3eb]' : 'bg-[#eef0e9] text-[#6b7872] hover:bg-[#e3e6de]'}`}>{s.label}</button>)}</div></div>
    {isLoading ? <div className="mt-7"><SkeletonRows /></div> : isError ? <div className="mt-7"><ErrorState onRetry={() => refetch()} /></div> : !data?.length ? <div className="mt-7"><EmptyState /></div> : filtered.length === 0 ? <div className="mt-7 rounded-xl border border-dashed border-[#cbd4cc] bg-[#f8f7f2] p-8 text-center"><FileSearch className="mx-auto text-[#7d9b92]" size={23} /><p className="mt-3 text-[12px] font-medium text-[#52615b]">No research matches your search.</p><p className="mt-1 text-[11px] text-[#89918a]">Try a different term or clear the status filter.</p></div> : <div className="mt-7 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{filtered.map(item => <ResearchCard key={item.id} item={item} onRename={setRenameTarget} onDelete={setDeleteTarget} />)}</div>}
    <Dialog open={!!renameTarget} onOpenChange={open => { if (!open) setRenameTarget(null); }}><DialogContent className="max-w-[420px] border-[#d7dbd3] bg-[#faf9f4] sm:max-w-[440px]"><DialogHeader><DialogTitle className="font-serif text-xl tracking-[-.02em] text-[#24413d]">Rename research</DialogTitle><DialogDescription className="text-[11px] text-[#65706b]">Give this question a clearer label for your trail.</DialogDescription></DialogHeader><textarea data-testid="input-rename-title" value={renameValue} onChange={e => setRenameValue(e.target.value)} rows={3} className="w-full resize-none rounded-xl border border-[#d3d5cc] bg-[#fffefb] px-3.5 py-3 text-[13px] leading-[1.5] text-[#344b46] outline-none focus:border-[#83a99e]" />{rename.isError && <p className="text-[10px] text-[#9b544b]">Could not rename research. Please try again.</p>}<DialogFooter><Button data-testid="button-cancel-rename" onClick={() => setRenameTarget(null)}>Cancel</Button><Button data-testid="button-confirm-rename" primary onClick={confirmRename} disabled={rename.isPending || renameValue.trim().length === 0}>{rename.isPending ? 'Saving…' : 'Save'}</Button></DialogFooter></DialogContent></Dialog>
    <AlertDialog open={!!deleteTarget} onOpenChange={open => { if (!open) setDeleteTarget(null); }}><AlertDialogContent className="max-w-[420px] border-[#e2c6c1] bg-[#faf9f4]"><AlertDialogHeader><AlertDialogTitle className="font-serif text-xl tracking-[-.02em] text-[#24413d]">Delete research?</AlertDialogTitle><AlertDialogDescription className="text-[11px] leading-[1.6] text-[#65706b]">This permanently removes the research trail{deleteTarget ? <span> for <span className="font-medium text-[#40534d]">"{deleteTarget.query}"</span></span> : null}. Your source records and this report cannot be restored.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel><AlertDialogAction data-testid="button-confirm-delete" onClick={e => { e.preventDefault(); confirmDelete(); }} className="bg-[#9b544b] text-white hover:bg-[#84443c]">{remove.isPending ? 'Deleting…' : 'Delete research'}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </PageFrame>;
}

function Sources() { const [page, setPage] = useState(1); const limit = 12; const { data, isLoading, isError, refetch } = useListSources({ page, limit }, { query: { queryKey: getListSourcesQueryKey({ page, limit }), staleTime: 30_000, placeholderData: keepPreviousData } }); const sources = data?.data ?? []; const totalPages = data?.pagination.totalPages ?? 1; const total = data?.pagination.total ?? 0; return <PageFrame><div className="border-b border-[#d8d8ce] pb-7"><Eyebrow>Source collections</Eyebrow><h1 className="mt-2 font-serif text-[clamp(38px,5vw,58px)] leading-none tracking-[-.05em] text-[#24413d]">The evidence shelf</h1><p className="mt-3 max-w-[540px] text-[13px] text-[#65706b]">Documents Axiom has read across your private research context.</p></div>{isLoading ? <div className="mt-7"><SkeletonRows /></div> : isError ? <div className="mt-7"><ErrorState onRetry={() => refetch()} /></div> : !sources.length ? <div className="mt-7"><EmptyState /></div> : <><div className="mt-7 grid gap-3 md:grid-cols-2">{sources.map((source, i) => <Link href={`/research/${source.researchId}`} data-testid={`card-source-${i}`} key={`${source.researchId}-${source.title}-${i}`} className="group rounded-xl border border-[#d7dbd3] bg-[#faf9f4] p-5 transition hover:border-[#9db9b0]"><div className="flex items-center justify-between"><span className="font-mono text-[9px] uppercase tracking-[.14em] text-[#7a847f]">{source.type}</span><span className="font-mono text-[10px] text-[#77837c]">{source.progress}% read</span></div><h2 className="mt-3 text-[14px] font-medium leading-[1.4] text-[#3c514b]">{source.title}</h2><p className="mt-1 text-[11px] text-[#89918a]">{source.source}</p><div className="mt-4 h-1 rounded-full bg-[#e4e8e2]"><div className="h-full rounded-full bg-[#78a69b]" style={{ width: `${source.progress}%` }} /></div><p className="mt-3 line-clamp-1 text-[10px] text-[#9aa39c]">From: {source.researchQuery}</p></Link>)}</div><div className="mt-6 flex items-center justify-between border-t border-[#d8d8ce] pt-4"><Button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Previous</Button><span className="font-mono text-[10px] text-[#77837c]">Page {page} of {totalPages} · {total} sources</span><Button disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next</Button></div></>}</PageFrame>; }

function WorkspaceRouter() { return <Switch><Route path="/" component={Home} /><Route path="/research/:id" component={ResearchPage} /><Route path="/history" component={History} /><Route path="/sources" component={Sources} /><Route component={NotFound} /></Switch>; }
function AuthRouter() { return <Switch><Route path="/login" component={LoginPage} /><Route path="/register" component={RegisterPage} /><Route>{() => <RequireAuth><Shell><WorkspaceRouter /></Shell></RequireAuth>}</Route></Switch>; }
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