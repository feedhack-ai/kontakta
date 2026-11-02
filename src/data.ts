// kontakta's seed data: companies, contacts, deals and activities. All of it
// is fictional. Dates are counted back from today, so the same deals look
// quiet whenever the app runs.

const now = new Date();
export const TODAY = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("-");

export function addDays(iso: string, days: number) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function daysBetween(from: string, to: string) {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);
}

export function formatSek(n: number) {
  return `${n.toLocaleString("sv-SE")} kr`;
}

export function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
}

export type StageId = "lead" | "qualified" | "proposal" | "negotiation" | "won";

// Probability per stage, used for a weighted pipeline.
export const STAGES: { id: StageId; name: string; probability: number }[] = [
  { id: "lead", name: "New lead", probability: 10 },
  { id: "qualified", name: "Qualified", probability: 30 },
  { id: "proposal", name: "Proposal sent", probability: 50 },
  { id: "negotiation", name: "Negotiation", probability: 75 },
  { id: "won", name: "Closed won", probability: 100 },
];

export const OWNERS = ["Elin Ström", "Oskar Wallin", "Maja Ek"] as const;
export type Owner = (typeof OWNERS)[number];

export type Company = { id: string; name: string; city: string; industry: string; employees: number };

export type Contact = {
  id: string;
  name: string;
  title: string;
  companyId: string;
  email: string;
  phone: string;
  owner: Owner;
  lastContact: string;
};

export type Deal = {
  id: string;
  name: string;
  companyId: string;
  contactId: string;
  stage: StageId;
  amount: number;
  owner: Owner;
  closeDate: string;
  lastActivity: string;
};

export type ActivityKind = "call" | "email" | "meeting" | "note";

export type Activity = { id: string; contactId: string; kind: ActivityKind; date: string; text: string; outcome?: string };

const COMPANIES_RAW: [string, string, string, number][] = [
  ["Bergström Bygg AB", "Uppsala", "Construction", 140],
  ["Kvarnholmen Fastigheter", "Nacka", "Real estate", 35],
  ["Solvik Energi AB", "Västerås", "Energy", 220],
  ["Ljungdahl Revision", "Malmö", "Accounting", 18],
  ["Nordström Transport AB", "Jönköping", "Logistics", 310],
  ["Hagberg Tandvård", "Lund", "Healthcare", 24],
  ["Ekdal Möbler AB", "Borås", "Retail", 65],
  ["Vinterviken Hotell", "Stockholm", "Hospitality", 80],
  ["Rosendal Juridik", "Göteborg", "Legal", 42],
  ["Åkerlund Livs AB", "Örebro", "Food", 150],
  ["Fyrtornet IT-konsult", "Linköping", "IT services", 55],
  ["Brännström Måleri", "Umeå", "Construction", 12],
];

export const COMPANIES: Company[] = COMPANIES_RAW.map(([name, city, industry, employees], i) => ({
  id: `co${i + 1}`,
  name,
  city,
  industry,
  employees,
}));

const PEOPLE: [string, string][] = [
  ["Johanna Bergström", "CEO"],
  ["Henrik Lagerqvist", "Property manager"],
  ["Sofia Axelsson", "Head of procurement"],
  ["Mats Ljungdahl", "Partner"],
  ["Linnea Nordström", "Operations manager"],
  ["Ali Haddad", "Clinic owner"],
  ["Petra Ekdal", "CFO"],
  ["Gustav Lind", "General manager"],
  ["Amira Kovač", "Office manager"],
  ["Fredrik Åkerlund", "COO"],
  ["Nina Persson", "IT manager"],
  ["Tobias Brännström", "Owner"],
  ["Karin Sjöberg", "Finance manager"],
  ["David Olsson", "Project manager"],
  ["Emma Lindahl", "HR manager"],
  ["Viktor Sandberg", "Purchasing"],
  ["Lina Forsberg", "Marketing lead"],
  ["Erik Holmgren", "Site manager"],
  ["Sara Nyberg", "Controller"],
  ["Ahmed Yousef", "Head of IT"],
  ["Ida Wikström", "Office manager"],
  ["Jonas Berg", "CEO"],
  ["Malin Dahl", "Accountant"],
  ["Per Sundqvist", "Logistics lead"],
];

function email(name: string, company: string) {
  const [first, last] = name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").split(" ");
  const domain = company.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").split(" ")[0].replace(/[^a-z]/g, "");
  return `${first}.${last}@${domain}.se`;
}

export const CONTACTS: Contact[] = PEOPLE.map(([name, title], i) => {
  const company = COMPANIES[i % COMPANIES.length];
  return {
    id: `ct${i + 1}`,
    name,
    title,
    companyId: company.id,
    email: email(name, company.name),
    phone: `07${(i * 7) % 10}-${String(310 + i * 37).slice(0, 3)} ${String(10 + i * 3).padStart(2, "0")} ${String(40 + i * 2).slice(0, 2)}`,
    owner: OWNERS[i % OWNERS.length],
    lastContact: addDays(TODAY, -((i * 5) % 41) - 1),
  };
});

// [name, company index, stage, amount, days since last activity, days to close]
const DEALS_RAW: [string, number, StageId, number, number, number][] = [
  ["Office renovation, phase 2", 0, "negotiation", 480_000, 3, 12],
  ["Property management system", 1, "proposal", 96_000, 19, 25],
  ["Solar park maintenance", 2, "qualified", 640_000, 6, 60],
  ["Year-end advisory", 3, "lead", 45_000, 2, 45],
  ["Fleet tracking rollout", 4, "negotiation", 312_000, 22, 9],
  ["New clinic booking setup", 5, "proposal", 38_000, 4, 20],
  ["Showroom lighting", 6, "qualified", 120_000, 27, 40],
  ["Conference package 2027", 7, "proposal", 210_000, 15, 30],
  ["Contract review retainer", 8, "lead", 60_000, 9, 50],
  ["Cold-chain warehouse", 9, "qualified", 890_000, 1, 75],
  ["Managed IT, 50 seats", 10, "negotiation", 270_000, 11, 14],
  ["Facade repainting", 11, "lead", 85_000, 33, 35],
  ["Second office fit-out", 0, "won", 350_000, 5, -4],
  ["Tenant portal", 1, "lead", 52_000, 17, 55],
  ["Battery storage pilot", 2, "proposal", 410_000, 8, 28],
  ["Payroll outsourcing", 3, "won", 72_000, 12, -10],
  ["Route planning licences", 4, "qualified", 145_000, 24, 42],
  ["Staff training days", 7, "won", 64_000, 2, -2],
];

export const DEALS: Deal[] = DEALS_RAW.map(([name, ci, stage, amount, quiet, close], i) => {
  const companyId = COMPANIES[ci].id;
  const contact = CONTACTS.find((c) => c.companyId === companyId)!;
  return {
    id: `dl${i + 1}`,
    name,
    companyId,
    contactId: contact.id,
    stage,
    amount,
    owner: OWNERS[(ci + i) % OWNERS.length],
    closeDate: addDays(TODAY, close),
    lastActivity: addDays(TODAY, -quiet),
  };
});

const KINDS: ActivityKind[] = ["call", "email", "meeting", "note"];
const TEXTS: Record<ActivityKind, string[]> = {
  call: ["Talked through the timeline and budget.", "Left a voicemail, will try again Thursday.", "Quick check-in on the proposal."],
  email: ["Sent the updated quote.", "Shared two customer references.", "Followed up on the contract draft."],
  meeting: ["Site visit with the project team.", "Demo for the management group.", "Kick-off meeting, notes in the deal."],
  note: ["Decision expected after their board meeting.", "Prefers email over phone.", "Budget approved for Q1."],
};

export const ACTIVITIES: Activity[] = CONTACTS.flatMap((contact, i) =>
  [0, 1, 2].map((k) => {
    const kind = KINDS[(i + k) % KINDS.length];
    return {
      id: `ac${i}-${k}`,
      contactId: contact.id,
      kind,
      date: addDays(contact.lastContact, -k * 9),
      text: TEXTS[kind][(i + k) % 3],
      outcome: kind === "call" ? (k === 1 ? "No answer" : "Connected") : undefined,
    };
  }),
);

export const companyOf = (id: string) => COMPANIES.find((c) => c.id === id)!;
export const contactOf = (id: string) => CONTACTS.find((c) => c.id === id)!;
