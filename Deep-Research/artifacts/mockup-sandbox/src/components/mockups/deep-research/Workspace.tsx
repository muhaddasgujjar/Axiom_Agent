import {
  ArrowUpRight,
  BookOpen,
  BrainCircuit,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  FileCheck2,
  FileSearch,
  Filter,
  FlaskConical,
  Focus,
  GitBranch,
  Globe2,
  Layers3,
  Library,
  LockKeyhole,
  Menu,
  MoreHorizontal,
  Network,
  PanelLeft,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

const agents = [
  { name: "Scout", detail: "Mapping the field", count: "18 sources", tone: "bg-[#d5e6e1] text-[#23665d]", icon: Globe2, done: true },
  { name: "Reader", detail: "Reading full documents", count: "11 / 16", tone: "bg-[#e6ddf0] text-[#654a78]", icon: BookOpen, done: false },
  { name: "Skeptic", detail: "Testing weak claims", count: "7 flagged", tone: "bg-[#f3dfc5] text-[#8a5427]", icon: CircleHelp, done: false },
  { name: "Synthesizer", detail: "Connecting findings", count: "In progress", tone: "bg-[#d9e1ef] text-[#38577f]", icon: Network, done: false },
  { name: "Verifier", detail: "Checking citations", count: "86% verified", tone: "bg-[#d5e8d9] text-[#3d7348]", icon: ShieldCheck, done: false },
  { name: "Editor", detail: "Preparing your brief", count: "Queued", tone: "bg-[#e8e5dc] text-[#716d61]", icon: FileCheck2, done: false },
];

const sources = [
  { type: "PAPER", title: "The Geography of Generative AI Innovation", source: "Stanford HAI · 2024", progress: 100, accent: "bg-[#315e58]" },
  { type: "REPORT", title: "AI Index Report 2024 · Chapter 3", source: "Stanford University", progress: 78, accent: "bg-[#78618d]" },
  { type: "PAPER", title: "The Economic Potential of Generative AI", source: "McKinsey Global Institute", progress: 64, accent: "bg-[#a16938]" },
];

const recent = [
  { title: "What changes when AI agents become the default interface for work?", meta: "Completed · 42 sources · 18 min", color: "bg-[#e3eee9]" },
  { title: "The state of open-weight foundation models", meta: "Completed · 67 sources · 31 min", color: "bg-[#eee5f3]" },
  { title: "Industrial policy for compute infrastructure", meta: "Draft · 29 sources · 12 min", color: "bg-[#f1e8d8]" },
];

export function Workspace() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("Workspace");
  const [copied, setCopied] = useState(false);

  return (
    <main className="min-h-screen bg-[#f4f2ed] text-[#1d2d2c] selection:bg-[#c8ded8] selection:text-[#1d2d2c]">
      <div className="flex min-h-screen">
        <aside className={`${sidebarOpen ? "w-[264px]" : "w-0 overflow-hidden"} hidden shrink-0 flex-col border-r border-[#d8d8ce] bg-[#eeeee8] transition-all duration-300 lg:flex`}>
          <div className="flex h-[76px] items-center gap-3 border-b border-[#d8d8ce] px-6">
            <div className="grid size-8 place-items-center rounded-[10px] bg-[#214e4a] text-[#f5f3eb]"><FlaskConical size={17} strokeWidth={1.7} /></div>
            <div>
              <p className="font-serif text-[17px] leading-none tracking-[-0.02em] text-[#214e4a]">Axiom</p>
              <p className="mt-1 font-mono text-[8px] uppercase tracking-[0.2em] text-[#78807b]">Research instrument</p>
            </div>
          </div>
          <div className="px-4 py-5">
            <button className="flex w-full items-center justify-between rounded-xl bg-[#214e4a] px-3.5 py-3 text-left text-[#f5f3eb] shadow-[0_5px_15px_rgba(33,78,74,.14)] transition hover:bg-[#173d3a]">
              <span className="flex items-center gap-2.5 text-[12px] font-medium"><Plus size={15} /> New research</span><span className="font-mono text-[9px] text-[#b8d0ca]">⌘ K</span>
            </button>
          </div>
          <nav className="space-y-1 px-3 text-[12px]">
            {[["Workspace", Focus], ["Research library", Library], ["Source collections", Layers3]].map(([label, Icon]) => (
              <button key={label as string} onClick={() => setActiveTab(label as string)} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition ${activeTab === label ? "bg-[#dce8e4] font-semibold text-[#214e4a]" : "text-[#69736f] hover:bg-[#e4e6df]"}`}>
                <Icon size={16} strokeWidth={1.7} />{label as string}
              </button>
            ))}
          </nav>
          <div className="mt-auto border-t border-[#d8d8ce] p-4">
            <div className="rounded-xl border border-[#d4d8d0] bg-[#f5f4ee] p-3.5">
              <div className="mb-2 flex items-center justify-between"><span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#7a847f]">Workspace privacy</span><LockKeyhole size={13} className="text-[#47756d]" /></div>
              <p className="text-[11px] leading-[1.5] text-[#52605b]">Your sources and reports stay private to your workspace.</p>
              <div className="mt-3 h-1 rounded-full bg-[#dfe5df]"><div className="h-full w-[38%] rounded-full bg-[#6e9b90]" /></div>
              <p className="mt-2 font-mono text-[9px] text-[#89908a]">38% of research context used</p>
            </div>
            <button className="mt-4 flex items-center gap-2 px-2 text-[11px] text-[#65706c] hover:text-[#214e4a]"><CircleHelp size={14} /> How Axiom works</button>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="flex h-[76px] items-center justify-between border-b border-[#d8d8ce] bg-[#f7f6f1]/80 px-5 backdrop-blur sm:px-8">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="rounded-lg p-2 text-[#66716c] hover:bg-[#e8eae3] lg:hidden"><Menu size={19} /></button>
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="hidden rounded-lg p-2 text-[#66716c] hover:bg-[#e8eae3] lg:block"><PanelLeft size={17} /></button>
              <span className="hidden text-[11px] text-[#89908a] sm:block">My workspace</span><span className="hidden text-[#b0b4ae] sm:block">/</span>
              <span className="max-w-[210px] truncate text-[12px] font-medium text-[#364541]">AI agents and the future of knowledge work</span>
            </div>
            <div className="flex items-center gap-2.5">
              <button className="hidden items-center gap-2 rounded-lg border border-[#d3d5cc] bg-[#faf9f4] px-3 py-2 text-[11px] text-[#5f6b66] hover:border-[#9db9b0] sm:flex"><Search size={14} /> Search workspace</button>
              <button className="grid size-8 place-items-center rounded-full bg-[#c5d8d0] text-[11px] font-semibold text-[#28564f]">LM</button>
            </div>
          </header>

          <div className="mx-auto max-w-[1280px] px-5 py-7 sm:px-8 lg:px-10 lg:py-9">
            <div className="mb-8 flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
              <div>
                <div className="mb-3 flex items-center gap-2"><span className="rounded-full bg-[#dceae5] px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.15em] text-[#3f756b]">Research in progress</span><span className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.12em] text-[#8a918c]"><Clock3 size={12} /> 18 min elapsed</span></div>
                <h1 className="max-w-[720px] font-serif text-[clamp(30px,4vw,48px)] leading-[1.03] tracking-[-0.045em] text-[#24413d]">AI agents and the<br className="hidden sm:block" /> future of knowledge work</h1>
                <p className="mt-4 max-w-[700px] text-[13px] leading-[1.65] text-[#65706b]">Which tasks will autonomous AI agents actually transform in the next 3 years, and what evidence separates durable productivity gains from speculative promise?</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button className="rounded-lg border border-[#cfd4cc] bg-[#faf9f4] px-3.5 py-2.5 text-[11px] font-medium text-[#55635e] hover:border-[#91aea5]">Pause research</button>
                <button onClick={() => { setCopied(true); setTimeout(() => setCopied(false), 1600); }} className="flex items-center gap-2 rounded-lg bg-[#214e4a] px-3.5 py-2.5 text-[11px] font-medium text-[#f5f3eb] hover:bg-[#173d3a]">{copied ? <Check size={14} /> : <ArrowUpRight size={14} />}{copied ? "Link copied" : "Share workspace"}</button>
              </div>
            </div>

            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,.8fr)]">
              <div className="space-y-5">
                <section className="rounded-2xl border border-[#d7dbd3] bg-[#faf9f4] p-5 shadow-[0_8px_30px_rgba(38,58,53,.035)] sm:p-6">
                  <div className="mb-5 flex items-center justify-between"><div><p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#7a847f]">Agent pipeline</p><p className="mt-1.5 text-[13px] font-medium text-[#344b46]">Six specialists, one defensible answer</p></div><button className="rounded-md p-1.5 text-[#84908a] hover:bg-[#e8ece6]"><MoreHorizontal size={17} /></button></div>
                  <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                    {agents.map(({ name, detail, count, tone, icon: Icon, done }, index) => (
                      <div key={name} className="group relative rounded-xl border border-[#e1e3db] bg-[#f5f5ef] p-3.5 transition hover:-translate-y-0.5 hover:border-[#a9c0b7]">
                        <div className="mb-4 flex items-start justify-between"><div className={`grid size-8 place-items-center rounded-lg ${tone}`}><Icon size={16} strokeWidth={1.7} /></div>{done ? <span className="grid size-5 place-items-center rounded-full bg-[#d6e8d8] text-[#4d7d51]"><Check size={12} strokeWidth={2.5} /></span> : <span className="mt-1 size-1.5 animate-pulse rounded-full bg-[#c78b4b]" />}</div>
                        <p className="text-[12px] font-semibold text-[#334841]">{index + 1}. {name}</p><p className="mt-1 text-[11px] text-[#78837d]">{detail}</p><div className="mt-3 flex items-center justify-between font-mono text-[9px] text-[#87918a]"><span>{count}</span>{!done && <span className="text-[#b07c43]">active</span>}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 flex items-center gap-3 border-t border-[#e4e5de] pt-4"><div className="h-1.5 flex-1 rounded-full bg-[#e3e8e2]"><div className="h-full w-[57%] rounded-full bg-[#4f8379] transition-all duration-700" /></div><span className="font-mono text-[10px] text-[#55716b]">57% complete</span></div>
                </section>

                <section className="rounded-2xl border border-[#d7dbd3] bg-[#faf9f4] p-5 sm:p-6">
                  <div className="mb-5 flex items-center justify-between"><div><p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#7a847f]">Source reading</p><p className="mt-1.5 text-[13px] font-medium text-[#344b46]">Full documents, not snippets</p></div><button className="flex items-center gap-1.5 rounded-lg border border-[#d6d9d1] px-2.5 py-1.5 text-[10px] text-[#67736d] hover:bg-[#f0f1eb]"><Filter size={12} /> Filter</button></div>
                  <div className="space-y-1">{sources.map((source) => <div key={source.title} className="group flex items-center gap-3 rounded-xl px-2 py-3 transition hover:bg-[#f0f1eb] sm:gap-4"><div className={`hidden h-10 w-1 shrink-0 rounded-full sm:block ${source.accent}`} /><div className="min-w-0 flex-1"><div className="mb-1 flex items-center gap-2"><span className="font-mono text-[8px] tracking-[0.13em] text-[#8a918c]">{source.type}</span><span className="truncate text-[12px] font-medium text-[#3c514b]">{source.title}</span></div><p className="text-[10px] text-[#89918a]">{source.source}</p><div className="mt-2 h-1 rounded-full bg-[#e4e8e2]"><div className="h-full rounded-full bg-[#78a69b]" style={{ width: `${source.progress}%` }} /></div></div><span className="font-mono text-[10px] text-[#77837c]">{source.progress}%</span><button className="hidden rounded-md p-1 text-[#8b958f] hover:bg-[#e4e7df] sm:block"><ArrowUpRight size={14} /></button></div>)}</div>
                  <button className="mt-3 flex items-center gap-2 px-2 text-[11px] font-medium text-[#47766e] hover:text-[#214e4a]"><FileSearch size={14} /> View all 34 sources</button>
                </section>
              </div>

              <div className="space-y-5">
                <section className="overflow-hidden rounded-2xl border border-[#cbdcd2] bg-[#e8f0eb] p-5 sm:p-6">
                  <div className="flex items-start justify-between"><div><p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#648078]">Claim confidence</p><h2 className="mt-2 font-serif text-[30px] tracking-[-0.04em] text-[#29534a]">86<span className="text-[18px]">%</span></h2></div><div className="grid size-10 place-items-center rounded-xl bg-[#d0e3d8] text-[#3c7562]"><ShieldCheck size={21} strokeWidth={1.5} /></div></div>
                  <p className="mt-1 max-w-[240px] text-[11px] leading-[1.5] text-[#61746d]">of synthesized claims have direct, independently verified support.</p>
                  <div className="relative mt-6 h-2 rounded-full bg-[#d1dfd8]"><div className="h-full w-[86%] rounded-full bg-[#4d8375]" /><div className="absolute left-[72%] top-[-4px] h-4 w-px bg-[#8faea2]" /></div>
                  <div className="mt-2 flex justify-between font-mono text-[9px] text-[#769087]"><span>Needs evidence</span><span>Strong support</span></div>
                  <div className="mt-5 border-t border-[#cedfd5] pt-4"><div className="flex items-center gap-2 text-[11px] font-medium text-[#38675c]"><Target size={14} /> Verification pass underway</div><p className="mt-2 text-[10px] leading-[1.5] text-[#6d837b]">12 claims are being checked against primary sources before inclusion.</p></div>
                </section>

                <section className="rounded-2xl border border-[#d7dbd3] bg-[#faf9f4] p-5 sm:p-6">
                  <div className="mb-4 flex items-center justify-between"><div><p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#7a847f]">Recent context</p><p className="mt-1.5 text-[13px] font-medium text-[#344b46]">Your research trail</p></div><button className="text-[#7d8982] hover:text-[#315e58]"><MoreHorizontal size={17} /></button></div>
                  <div className="space-y-2">{recent.map((item) => <button key={item.title} className="flex w-full items-start gap-3 rounded-xl p-2 text-left transition hover:bg-[#f0f1eb]"><div className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg ${item.color} text-[#50726a]`}><FileCheck2 size={14} strokeWidth={1.6} /></div><div className="min-w-0"><p className="line-clamp-2 text-[11px] font-medium leading-[1.4] text-[#40534d]">{item.title}</p><p className="mt-1 font-mono text-[8px] tracking-[0.02em] text-[#89918a]">{item.meta}</p></div></button>)}</div>
                  <button className="mt-4 flex items-center gap-2 px-2 text-[11px] font-medium text-[#47766e] hover:text-[#214e4a]"><GitBranch size={14} /> Open research history</button>
                </section>
              </div>
            </div>

            <section className="mt-5 rounded-2xl border border-[#d7dbd3] bg-[#faf9f4] p-5 sm:p-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div className="flex items-center gap-3"><div className="grid size-9 place-items-center rounded-xl bg-[#e8e1f0] text-[#6b5480]"><BrainCircuit size={18} strokeWidth={1.6} /></div><div><p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#7a847f]">Research note</p><p className="mt-1 text-[12px] text-[#52615b]">The synthesis is finding a meaningful split between augmentation and substitution.</p></div></div><button className="flex shrink-0 items-center gap-2 text-[11px] font-medium text-[#47766e] hover:text-[#214e4a]">Read working notes <ArrowUpRight size={14} /></button></div>
            </section>
            <footer className="flex flex-col justify-between gap-2 py-6 text-[10px] text-[#8a918c] sm:flex-row"><span className="flex items-center gap-1.5"><ShieldCheck size={12} /> Every claim will carry its source trail</span><span className="font-mono">Last autosaved 42 seconds ago</span></footer>
          </div>
        </section>
      </div>
    </main>
  );
}