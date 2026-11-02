import { useState, type ReactNode } from "react";
import { cn } from "./lib/cn";
import {
  ACTIVITIES,
  CONTACTS,
  DEALS,
  OWNERS,
  STAGES,
  TODAY,
  companyOf,
  contactOf,
  daysBetween,
  formatDate,
  formatSek,
  type Activity,
  type ActivityKind,
  type Deal,
} from "./data";

// kontakta: a fictional CRM, the demo product feedhack is shown on. Three
// views (the deals board, contacts, one contact's record) in in-memory state:
// no routing, no backend, nothing persists past a reload.

type View = { page: "deals" } | { page: "contacts" } | { page: "contact"; id: string };

export function App() {
  const [view, setView] = useState<View>({ page: "deals" });
  const [activities, setActivities] = useState(ACTIVITIES);
  const addActivity = (activity: Activity) => setActivities((list) => [activity, ...list]);

  return (
    <div className="flex h-full bg-slate-50 text-[13px] text-slate-800">
      <Sidebar view={view} go={setView} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="min-h-0 flex-1 overflow-auto">
          {view.page === "deals" && <DealsBoard open={(id) => setView({ page: "contact", id })} />}
          {view.page === "contacts" && <ContactsPage open={(id) => setView({ page: "contact", id })} />}
          {view.page === "contact" && (
            <ContactRecord id={view.id} activities={activities} add={addActivity} back={() => setView({ page: "contacts" })} />
          )}
        </main>
      </div>
    </div>
  );
}

const NAV: { page: "deals" | "contacts"; label: string; icon: string }[] = [
  { page: "deals", label: "Deals", icon: "M4 5h4v14H4zM10 5h4v9h-4zM16 5h4v6h-4z" },
  { page: "contacts", label: "Contacts", icon: "M12 12a4 4 0 100-8 4 4 0 000 8zm-7 8a7 7 0 0114 0" },
];

const DISABLED_NAV = [
  { label: "Companies", icon: "M4 20V6l8-3 8 3v14M9 20v-5h6v5" },
  { label: "Tasks", icon: "M5 12l4 4 10-10" },
  { label: "Reports", icon: "M5 19V9m7 10V5m7 14v-7" },
];

function Icon({ d, className }: { d: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={cn("h-4 w-4", className)}>
      <path d={d} />
    </svg>
  );
}

function Sidebar({ view, go }: { view: View; go: (view: View) => void }) {
  const active = view.page === "contact" ? "contacts" : view.page;
  return (
    <aside id="sidebar" className="flex w-52 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-14 items-center gap-2 px-4">
        <img src={`${import.meta.env.BASE_URL}icon.svg`} alt="" className="h-7 w-7" />
        <span className="text-[17px] font-semibold tracking-tight text-slate-900">kontakta</span>
      </div>
      <nav className="flex flex-col gap-0.5 px-2 pt-2">
        {NAV.map((item) => (
          <button
            key={item.page}
            type="button"
            onClick={() => go({ page: item.page })}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-left font-medium",
              active === item.page ? "bg-teal-50 text-teal-800" : "text-slate-600 hover:bg-slate-100",
            )}
          >
            <Icon d={item.icon} />
            {item.label}
          </button>
        ))}
        {DISABLED_NAV.map((item) => (
          <span key={item.label} className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-slate-400">
            <Icon d={item.icon} />
            {item.label}
          </span>
        ))}
      </nav>
      <div className="mt-auto border-t border-slate-200 px-4 py-3 text-[12px] text-slate-500">Halvarsson Säljpartner AB</div>
    </aside>
  );
}

function Topbar() {
  return (
    <header id="topbar" className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div className="flex h-8 w-80 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-2.5 text-slate-400">
        <Icon d="M11 18a7 7 0 100-14 7 7 0 000 14zm9 2l-4-4" />
        Search deals, contacts, companies
      </div>
      <div className="flex items-center gap-3">
        <span className="text-slate-500">Elin Ström</span>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-700 text-[12px] font-semibold text-white">ES</span>
      </div>
    </header>
  );
}

function PageHeader({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="flex items-center justify-between px-6 pt-5 pb-4">
      <h1 className="text-[20px] font-semibold tracking-tight text-slate-900">{title}</h1>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}

function Button({ children, primary, onClick }: { children: ReactNode; primary?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-8 rounded-md px-3 font-medium",
        primary ? "bg-teal-700 text-white hover:bg-teal-800" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
      )}
    >
      {children}
    </button>
  );
}

function DealsBoard({ open }: { open: (contactId: string) => void }) {
  const [owner, setOwner] = useState<string>("All owners");
  const deals = DEALS.filter((d) => owner === "All owners" || d.owner === owner);
  const openTotal = deals.filter((d) => d.stage !== "won").reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Deals">
        <select
          value={owner}
          onChange={(e) => setOwner(e.target.value)}
          className="h-8 rounded-md border border-slate-200 bg-white px-2 text-slate-700"
        >
          <option>All owners</option>
          {OWNERS.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
        <Button primary>Create deal</Button>
      </PageHeader>
      <div className="px-6 pb-3 text-slate-500">
        {deals.length} deals · {formatSek(openTotal)} open
      </div>
      <div id="deals-board" className="flex min-h-0 flex-1 gap-3 overflow-x-auto px-6 pb-6">
        {STAGES.map((stage) => {
          const inStage = deals.filter((d) => d.stage === stage.id);
          const total = inStage.reduce((sum, d) => sum + d.amount, 0);
          return (
            <section
              key={stage.id}
              id={`stage-${stage.id}`}
              data-stage={stage.id}
              data-probability={stage.probability}
              className="flex min-w-[190px] flex-1 flex-col rounded-lg bg-slate-100"
            >
              <header className="px-3 pt-3 pb-2">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-slate-800">{stage.name}</h2>
                  <span className="rounded-full bg-white px-2 text-[12px] font-medium text-slate-600">{inStage.length}</span>
                </div>
                <div className="mt-0.5 text-[12px] text-slate-500">
                  {formatSek(total)} · {stage.probability}%
                </div>
              </header>
              <div className="flex flex-col gap-2 overflow-y-auto px-2 pb-2">
                {inStage.map((deal) => (
                  <DealCard key={deal.id} deal={deal} probability={stage.probability} open={open} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function DealCard({ deal, probability, open }: { deal: Deal; probability: number; open: (contactId: string) => void }) {
  const company = companyOf(deal.companyId);
  return (
    <button
      type="button"
      onClick={() => open(deal.contactId)}
      data-deal={deal.id}
      data-amount={deal.amount}
      data-probability={probability}
      data-stage={deal.stage}
      data-owner={deal.owner}
      data-close-date={deal.closeDate}
      data-last-activity={deal.lastActivity}
      className="deal-card flex flex-col gap-1.5 rounded-md border border-slate-200 bg-white p-3 text-left shadow-[0_1px_1px_rgba(0,0,0,.03)] hover:border-teal-300"
    >
      <span className="font-medium text-slate-900">{deal.name}</span>
      <span className="text-[12px] text-slate-500">{company.name}</span>
      <div className="mt-1 flex items-center justify-between">
        <span className="font-semibold text-slate-800 tabular-nums">{formatSek(deal.amount)}</span>
        <span className="text-[12px] text-slate-500">Close {formatDate(deal.closeDate)}</span>
      </div>
      <div className="flex items-center justify-between text-[12px] text-slate-500">
        <span>{deal.owner}</span>
        <span>Last activity {formatDate(deal.lastActivity)}</span>
      </div>
    </button>
  );
}

function ContactsPage({ open }: { open: (id: string) => void }) {
  return (
    <div>
      <PageHeader title="Contacts">
        <Button>Import</Button>
        <Button primary>Create contact</Button>
      </PageHeader>
      <div className="px-6 pb-6">
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table id="contacts-table" className="w-full text-left">
            <thead className="border-b border-slate-200 bg-slate-50 text-[12px] font-medium text-slate-500">
              <tr>
                <th className="px-4 py-2.5 font-medium">Name</th>
                <th className="px-4 py-2.5 font-medium">Company</th>
                <th className="px-4 py-2.5 font-medium">Email</th>
                <th className="px-4 py-2.5 font-medium">Phone</th>
                <th className="px-4 py-2.5 font-medium">Owner</th>
                <th className="px-4 py-2.5 font-medium">Last contacted</th>
              </tr>
            </thead>
            <tbody>
              {CONTACTS.map((c) => (
                <tr
                  key={c.id}
                  data-contact={c.id}
                  data-company={companyOf(c.companyId).name}
                  data-last-contact={c.lastContact}
                  onClick={() => open(c.id)}
                  className="cursor-pointer border-b border-slate-100 last:border-0 hover:bg-slate-50"
                >
                  <td className="px-4 py-2.5">
                    <div className="font-medium text-slate-900">{c.name}</div>
                    <div className="text-[12px] text-slate-500">{c.title}</div>
                  </td>
                  <td className="px-4 py-2.5">{companyOf(c.companyId).name}</td>
                  <td className="px-4 py-2.5 text-teal-700">{c.email}</td>
                  <td className="px-4 py-2.5 tabular-nums">{c.phone}</td>
                  <td className="px-4 py-2.5">{c.owner}</td>
                  <td className="px-4 py-2.5 text-slate-500">{formatDate(c.lastContact)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const KIND_LABEL: Record<ActivityKind, string> = { call: "Call", email: "Email", meeting: "Meeting", note: "Note" };

function ContactRecord({ id, activities, add, back }: { id: string; activities: Activity[]; add: (a: Activity) => void; back: () => void }) {
  const contact = contactOf(id);
  const company = companyOf(contact.companyId);
  const deals = DEALS.filter((d) => d.companyId === company.id);
  const timeline = activities.filter((a) => a.contactId === id).sort((a, b) => b.date.localeCompare(a.date));
  const [note, setNote] = useState("");

  return (
    <div className="px-6 py-5">
      <button type="button" onClick={back} className="mb-4 text-teal-700 hover:underline">
        ← Contacts
      </button>
      <div className="grid grid-cols-[280px_1fr] gap-5">
        <section id="contact-card" className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-teal-100 font-semibold text-teal-800">
              {contact.name
                .split(" ")
                .map((p) => p[0])
                .join("")}
            </span>
            <div>
              <div className="text-[16px] font-semibold text-slate-900">{contact.name}</div>
              <div className="text-slate-500">
                {contact.title}, {company.name}
              </div>
            </div>
          </div>
          <dl className="grid grid-cols-[90px_1fr] gap-y-2">
            <dt className="text-slate-500">Email</dt>
            <dd className="text-teal-700">{contact.email}</dd>
            <dt className="text-slate-500">Phone</dt>
            <dd className="tabular-nums">{contact.phone}</dd>
            <dt className="text-slate-500">City</dt>
            <dd>{company.city}</dd>
            <dt className="text-slate-500">Industry</dt>
            <dd>{company.industry}</dd>
            <dt className="text-slate-500">Owner</dt>
            <dd>{contact.owner}</dd>
          </dl>
          <div>
            <h3 className="mb-2 font-semibold text-slate-800">Deals</h3>
            <div className="flex flex-col gap-2">
              {deals.map((d) => (
                <div key={d.id} className="rounded-md border border-slate-200 p-2.5">
                  <div className="font-medium">{d.name}</div>
                  <div className="text-[12px] text-slate-500">
                    {formatSek(d.amount)} · {STAGES.find((s) => s.id === d.stage)!.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section id="activity" className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-[15px] font-semibold text-slate-900">Activity</h2>
          <div className="flex gap-2">
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note"
              className="h-9 flex-1 rounded-md border border-slate-200 px-3 outline-none focus:border-teal-500"
            />
            <Button
              primary
              onClick={() => {
                if (!note.trim()) return;
                add({ id: `ac${Date.now()}`, contactId: id, kind: "note", date: TODAY, text: note.trim() });
                setNote("");
              }}
            >
              Save note
            </Button>
          </div>
          <ol className="flex flex-col">
            {timeline.map((a) => (
              <li key={a.id} data-activity={a.kind} data-date={a.date} className="flex gap-3 border-b border-slate-100 py-3 last:border-0">
                <span className="w-16 shrink-0 font-medium text-slate-700">{KIND_LABEL[a.kind]}</span>
                <span className="flex-1">
                  {a.text}
                  {a.outcome && <span className="ml-2 text-slate-500">· {a.outcome}</span>}
                </span>
                <span className="shrink-0 text-slate-500">
                  {formatDate(a.date)} · {daysBetween(a.date, TODAY)}d ago
                </span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}
