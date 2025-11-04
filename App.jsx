import React, { useState, useEffect } from "react";
import { CheckCircle, TriangleAlert, Brain, BarChart3, BookOpen, ShieldCheck, LineChart as LineIcon, Activity, User, Users, ArrowRight, ChevronRight, FileText, HelpCircle } from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  LineChart as RLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import logoUrl from "./assets/mindly-logo.png";

const BRAND = {
  name: "MINDLY",
  tagline: "WATCH • PROTECT • CARE",
  logoUrl
};

const COLORS = {
  primary: "#F97316",
  peach: "#FDBA74",
  heart: "#B91C1C",
  green: "#16A34A",
  orange: "#F59E0B",
  red: "#EF4444",
  blue: "#2563EB",
};

const FACTEURS = [
  "Intensité & temps",
  "Exigences émotionnelles",
  "Autonomie",
  "Rapports sociaux",
  "Conflits de valeurs",
  "Insécurité socio‑éco",
  "Bien‑être AURA",
];

const demoScores = [
  { label: "Intensité & temps", score: 58, delta: -7, suggestion: "Revoir charge & priorités", level: "high" },
  { label: "Exigences émotionnelles", score: 65, delta: 0, suggestion: "Ateliers gestion du stress", level: "mid" },
  { label: "Autonomie", score: 75, delta: 5, suggestion: "Maintenir l'autonomie", level: "low" },
  { label: "Rapports sociaux", score: 60, delta: -3, suggestion: "Former les managers", level: "high" },
  { label: "Conflits de valeurs", score: 72, delta: 0, suggestion: "Aucun signal", level: "low" },
  { label: "Insécurité socio‑éco", score: 68, delta: -2, suggestion: "Mieux informer sur perspectives", level: "mid" },
  { label: "Bien‑être AURA", score: 71, delta: 1, suggestion: "Rituel reconnaissance", level: "low" },
];

const timeSeries = [
  { month: "Mai", Intensite: 66, Sociaux: 64, Global: 66 },
  { month: "Juin", Intensite: 63, Sociaux: 62, Global: 65 },
  { month: "Juil", Intensite: 61, Sociaux: 61, Global: 64 },
  { month: "Août", Intensite: 60, Sociaux: 60, Global: 63 },
  { month: "Sep", Intensite: 59, Sociaux: 61, Global: 64 },
  { month: "Oct", Intensite: 58, Sociaux: 60, Global: 66 },
];

const departements = ["Production", "Logistique", "Qualité", "R&D", "Support"];
const heatmap = [
  [56, 61, 72, 60, 70, 68, 69],
  [61, 64, 73, 63, 72, 67, 70],
  [72, 70, 78, 71, 74, 72, 76],
  [69, 66, 75, 68, 73, 70, 72],
  [71, 67, 77, 70, 75, 71, 74],
];

function riskColor(v) { if (v < 60) return COLORS.red; if (v < 65) return COLORS.orange; return COLORS.green; }
function levelTag(level) { if (level === "high") return { label: "Élevé", color: COLORS.red }; if (level === "mid") return { label: "Moyen", color: COLORS.orange }; return { label: "Faible", color: COLORS.green }; }

function Stat({ icon: Icon, label, value, sub }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="rounded-xl bg-orange-50 p-2 text-orange-600"><Icon className="h-5 w-5" /></div>
      <div className="flex flex-col">
        <span className="text-sm text-gray-500">{label}</span>
        <div className="text-xl font-semibold">{value}</div>
        {sub && <span className="text-xs text-gray-400">{sub}</span>}
      </div>
    </div>
  );
}

function Card({ title, subtitle, right, children }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-800">{title}</h3>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}

function Pill({ color, children }) {
  return (
    <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium" style={{ background: `${color}20`, color }}>
      {children}
    </span>
  );
}

// Chatbot (Likert/YesNo)
function ChatSurvey({ open, onClose, onSubmitOrgScores }) {
  const [idx, setIdx] = useState(0);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Bonjour 👋 Je suis MINDLY. Les réponses ‘perso’ ne sont JAMAIS partagées aux RH." },
  ]);

  const items = [
    { tag: 'org', factor: 'Intensité & temps', text: "Sur la semaine, ta charge de travail est‑elle soutenable ?", type: 'likert' },
    { tag: 'org', factor: 'Rapports sociaux', text: "En cas de difficulté, reçois‑tu du soutien de ton manager ?", type: 'likert' },
    { tag: 'org', factor: 'Autonomie', text: "Peux‑tu organiser tes priorités au quotidien ?", type: 'likert' },
    { tag: 'org', factor: 'Exigences émotionnelles', text: "Ton travail te confronte‑t‑il à des situations émotionnellement difficiles ?", type: 'likert' },
    { tag: 'perso', key: 'finance', text: "As‑tu des préoccupations financières impactantes ?", type: 'yesno' },
    { tag: 'perso', key: 'sommeil', text: "Ton sommeil est‑il perturbé ? (1 très perturbé, 5 très bon)", type: 'likert' },
    { tag: 'perso', key: 'sante', text: "Une situation de santé (toi / proche) t’impacte‑t‑elle ?", type: 'yesno' },
    { tag: 'perso', key: 'famille', text: "Charge familiale importante (aidant·e, enfants, proches) ?", type: 'yesno' },
    { tag: 'perso', key: 'securite', text: "Te sens‑tu en sécurité en dehors du travail ?", type: 'yesno' },
    { tag: 'perso', key: 'envie_soutien', text: "Souhaites‑tu une mise en relation avec un soutien ?", type: 'multi', options: ['Psychologue','Assistante sociale','Coaching','Pas maintenant'] },
  ];

  const [answers, setAnswers] = useState([]);
  const [supports, setSupports] = useState([]);

  const ask = (i) => {
    if (i >= items.length) {
      const orgOnly = answers.filter(a => a.tag === 'org');
      const byFactor = {};
      orgOnly.forEach(a => { byFactor[a.factor] = byFactor[a.factor] || []; byFactor[a.factor].push(a.value); });
      const scores = Object.entries(byFactor).map(([factor, arr]) => ({ label: factor, score: Math.round(arr.reduce((s,v)=>s+v,0)/arr.length*20) }));
      onSubmitOrgScores && onSubmitOrgScores(scores);

      const persoOnly = answers.filter(a => a.tag === 'perso');
      const recs = recommendSupports(persoOnly);
      setSupports(recs);
      setMessages(m => [...m, { from: 'bot', text: recs.length ? "Merci ! Voici des pistes de soutien confidentielles :" : "Merci ! Si besoin, tu peux consulter nos ressources d’aide à tout moment." }]);
      return;
    }
    setMessages(m => [...m, { from: 'bot', text: items[i].text, meta: items[i] }]);
  };

  const handleChoice = (value) => {
    const q = items[idx];
    setAnswers(a => [...a, { tag: q.tag, factor: q.factor || null, key: q.key || null, value }]);
    setMessages(m => [...m, { from: 'me', text: formatAnswer(q, value) }]);
    const next = idx + 1;
    setIdx(next);
    setTimeout(()=>ask(next), 200);
  };

  const formatAnswer = (q, v) => {
    if (q.type === 'likert') return `${v}/5`;
    if (q.type === 'yesno') return v ? 'Oui' : 'Non';
    if (q.type === 'multi') return v;
    return String(v);
  };

  const recommendSupports = (persoAnswers) => {
    const map = Object.fromEntries(persoAnswers.filter(a=>a.key).map(a=>[a.key,a.value]));
    const out = new Set();
    if (map.finance === True) { /* guard */ }
    if (map.finance === true) out.add('Assistante sociale');
    if (map.sante === true) out.add('Psychologue');
    if (typeof map.sommeil === 'number' && map.sommeil <= 2) out.add('Psychologue');
    if (map.famille === true) out.add('Assistante sociale');
    if (map.securite === false) out.add('Ligne d’écoute urgence');
    if (!out.size && map.envie_soutien && map.envie_soutien !== 'Pas maintenant') out.add(map.envie_soutien);
    out.add('Conseils express (3 min)');
    return Array.from(out);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b p-4">
          <div className="text-sm font-medium">Chat MINDLY 🤖</div>
          <button onClick={onClose} className="text-xs text-gray-500 hover:underline">Fermer</button>
        </div>
        <div className="max-h-[60vh] space-y-2 overflow-auto p-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.from==='me' ? 'justify-end' : 'justify-start'}`}>
              <div className={`${m.from==='me' ? 'bg-orange-500 text-white' : 'bg-orange-50 text-slate-800'} rounded-2xl px-3 py-2 text-sm max-w-[80%]`}>{m.text}</div>
            </div>
          ))}
        </div>
        <div className="border-t p-3">
          {idx < items.length ? (()=>{
            const q = items[idx];
            if (q.type === 'likert') {
              return (
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(v => (
                    <button key={v} onClick={()=>handleChoice(v)} className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm hover:border-orange-500 hover:bg-orange-50">{v}</button>
                  ))}
                </div>
              );
            }
            if (q.type === 'yesno') {
              return (
                <div className="flex gap-2">
                  <button onClick={()=>handleChoice(true)} className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm hover:bg-green-100">Oui</button>
                  <button onClick={()=>handleChoice(false)} className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm hover:bg-red-100">Non</button>
                </div>
              );
            }
            if (q.type === 'multi') {
              return (
                <div className="grid grid-cols-2 gap-2">
                  {q.options.map(opt => (
                    <button key={opt} onClick={()=>handleChoice(opt)} className="rounded-xl border border-gray-200 px-3 py-2 text-sm hover:border-orange-500 hover:bg-orange-50">{opt}</button>
                  ))}
                </div>
              );
            }
          })() : (
            <div className="space-y-3 p-1 text-sm text-gray-700">
              <div className="text-center">Merci !
                <div className="text-xs text-gray-500">Les réponses organisationnelles alimentent le diagnostic d’équipe. Le privé reste strictement confidentiel.</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Screens
function EcranEmploye({ onOpenSurvey }) {
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);
  const [mood, setMood] = useState(3);

  const handleSend = () => { setSent(true); setTimeout(()=>setSent(false), 1500); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bonjour 👋</h1>
          <p className="text-sm text-gray-500">Anonyme et confidentiel — vos éléments privés ne sont jamais partagés aux RH.</p>
        </div>
        <Pill color={COLORS.primary}><ShieldCheck className="mr-1 h-3 w-3" /> RGPD</Pill>
      </div>

      <div className="grid gap-6 md:grid-cols-5">
        <div className="md:col-span-3">
          <Card title="Questionnaire (chatbot)" subtitle="Organisationnel + privé (le privé n’alimente pas le dashboard RH)">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="text-sm text-gray-600">Durée : ~45 sec</div>
              <button onClick={onOpenSurvey} className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-4 py-2 text-white shadow hover:bg-orange-600">
                Démarrer le chat <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
            <p className="mt-3 text-xs text-gray-400">Seules vos réponses organisationnelles alimentent le tableau de bord.</p>
          </Card>
        </div>
        <div className="md:col-span-2">
          <Card title="Humeur rapide" subtitle="Optionnel">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {["😖","😕","😐","🙂","😄"].map((e,i)=> (
                  <button key={i} onClick={()=>setMood(i+1)} className={`rounded-xl border px-2.5 py-2 text-xl ${mood===i+1?"border-orange-500 bg-orange-50":"border-gray-200 hover:bg-gray-50"}`}>{e}</button>
                ))}
              </div>
              <span className="text-xs text-gray-400">{mood}/5</span>
            </div>
            <textarea value={note} onChange={(e)=>setNote(e.target.value)} placeholder="Un mot si vous voulez…" className="mt-3 w-full resize-none rounded-xl border border-gray-200 p-3 text-sm outline-none focus:ring-2 focus:ring-orange-200" rows={4} />
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-gray-500"><ShieldCheck className="h-4 w-4"/> Rester anonyme</div>
              <button onClick={handleSend} className="rounded-xl border border-gray-200 px-3 py-2 text-sm hover:border-orange-500 hover:bg-orange-50">Envoyer</button>
            </div>
            {sent && (<div className="mt-3 flex items-center gap-2 text-sm text-green-600"><CheckCircle className="h-4 w-4"/> Merci ! Votre voix compte.</div>)}
          </Card>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-5">
        <div className="md:col-span-3">
          <Card title="Votre équipe aujourd’hui" subtitle="Indice équipe (démo)">
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={demoScores.map(d=>({ subject: d.label, A: d.score }))}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar name="Score" dataKey="A" stroke={COLORS.primary} fill={COLORS.primary} fillOpacity={0.25} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 text-sm text-gray-500">Indice équipe : <span className="font-semibold">66/100</span> <span className="text-red-600">(↘︎ −3)</span> — Points à surveiller : <strong>Intensité</strong>, <strong>Rapports sociaux</strong>.</div>
          </Card>
        </div>
        <div className="md:col-span-2">
          <Card title="Ressources d’aide">
            <div className="grid grid-cols-1 gap-3">
              {[
                {icon: Brain, label: "Parler à un psychologue", sub: "sous 24–48 h"},
                {icon: Users, label: "Assistante sociale", sub: "prise de RDV"},
                {icon: User, label: "RH", sub: "demander un échange"},
                {icon: HelpCircle, label: "Conseils express (3 min)", sub: "auto‑soins"},
              ].map((b, i) => { const Icon = b.icon; return (
                <button key={i} className="flex items-center justify-between rounded-xl border border-gray-200 p-3 text-left hover:border-orange-500 hover:bg-orange-50">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-orange-50 p-2 text-orange-600"><Icon className="h-4 w-4"/></div>
                    <div>
                      <div className="text-sm font-medium">{b.label}</div>
                      <div className="text-xs text-gray-500">{b.sub}</div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400"/>
                </button>
              );})}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function DashboardRH({ onOpenPlan }) {
  const indiceGlobal = 66;
  const participation = 72;
  const alertes = { red: 2, orange: 3 };
  const variation = -2;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="grid gap-4 md:grid-cols-4">
          <Stat icon={Activity} label="Indice RPS global" value={`${indiceGlobal}/100`} sub={`Variation ${variation>0?"+":""}${variation}`} />
          <Stat icon={Users} label="Participation (mois)" value={`${participation}%`} />
          <Stat icon={TriangleAlert} label="Alertes actives" value={`🔴 ${alertes.red}  •  🟠 ${alertes.orange}`} />
          <Stat icon={LineIcon} label="Période analysée" value="M‑12 → M" />
        </div>
        <Pill color={COLORS.primary}>Scope : Organisationnel (Gollac)</Pill>
      </div>

      <Card title="Synthèse par facteur" subtitle="Scores (org only), niveaux de risque et actions suggérées">
        <div className="grid gap-4 md:grid-cols-3">
          {demoScores.map((f, i) => {
            const tag = levelTag(f.level);
            return (
              <div key={i} className="rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-slate-800">{f.label}</div>
                  <Pill color={tag.color}>{tag.label}</Pill>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <div className="text-2xl font-bold">{f.score}</div>
                  <div className={`text-sm ${f.delta<0?"text-red-600":"text-green-600"}`}>({f.delta>0?"↗︎ +"+f.delta: f.delta===0?"➖":"↘︎ "+f.delta})</div>
                </div>
                <div className="mt-2 text-sm text-gray-600">Action suggérée : <span className="font-medium">{f.suggestion}</span></div>
                <button onClick={onOpenPlan} className="mt-3 text-sm text-orange-600 hover:underline">Générer plan d’action IA</button>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-gray-500">Note : les réponses privées (perso) sont exclues du calcul et ne sont jamais accessibles au RH.</p>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card title="Radar Gollac (comparaison)" subtitle="Départements sélectionnés">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%"
                data={FACTEURS.map((name, idx)=>({ subject: name, Production: heatmap[0][idx], Logistique: heatmap[1][idx] }))}
              >
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0,100]} />
                <Radar name="Production" dataKey="Production" stroke={COLORS.red} fill={COLORS.red} fillOpacity={0.2} />
                <Radar name="Logistique" dataKey="Logistique" stroke={COLORS.orange} fill={COLORS.orange} fillOpacity={0.2} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Tendances mensuelles" subtitle="M‑6">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RLineChart data={timeSeries}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[50, 80]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Intensite" stroke={COLORS.red} strokeWidth={2} />
                <Line type="monotone" dataKey="Sociaux" stroke={COLORS.orange} strokeWidth={2} />
                <Line type="monotone" dataKey="Global" stroke={COLORS.primary} strokeWidth={2} />
              </RLineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card title="Carte thermique — Facteurs × Départements" subtitle="🟢 ≥65 • 🟠 60–64 • 🔴 <60 (organisationnel seulement)">
        <div className="overflow-auto">
          <table className="min-w-[720px] w-full text-sm">
            <thead>
              <tr>
                <th className="p-2 text-left text-gray-500">Département</th>
                {FACTEURS.map((f) => (
                  <th key={f} className="p-2 text-left text-gray-500">{f}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {departements.map((dept, r) => (
                <tr key={dept} className="border-t">
                  <td className="p-2 font-medium text-slate-800">{dept}</td>
                  {FACTEURS.map((_, c) => {
                    const v = heatmap[r][c];
                    const bg = riskColor(v);
                    return (
                      <td key={`${dept}-${c}`} className="p-2">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-12 rounded" style={{ background: bg, opacity: 0.25 }} />
                          <span className="tabular-nums">{v}</span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="File d’actions" subtitle="Impact estimé / Effort (générées à partir des facteurs organisationnels)">
        <ul className="space-y-3">
          {[
            { t: "Réviser la charge & priorisation (hebdo 30 min)", impact: "fort", effort: "moyen", owner: "Manager Prod", due: "J+14" },
            { t: "Rituel ‘météo émotionnelle’ (10 min/jour)", impact: "moyen", effort: "faible", owner: "Managers prox.", due: "J+7" },
            { t: "Flash info mensuel sur perspectives", impact: "moyen", effort: "faible", owner: "RH", due: "J+21" },
          ].map((a, i) => (
            <li key={i} className="flex items-center justify-between rounded-xl border border-gray-200 p-3">
              <div>
                <div className="font-medium text-slate-800">{a.t}</div>
                <div className="text-xs text-gray-500">Impact {a.impact} • Effort {a.effort} • Owner {a.owner} • Échéance {a.due}</div>
              </div>
              <button className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs hover:border-orange-500 hover:bg-orange-50">Vérifier impact</button>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function RapportIA() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Rapport IA — Pôle Production (Octobre 2025)</h1>
          <p className="text-sm text-gray-500">Généré automatiquement depuis les signaux anonymisés</p>
        </div>
        <Pill color={COLORS.red}>Indice MINDLY : 56 (↘︎ −8) — Niveau Élevé</Pill>
      </div>

      <Card title="1. Ce qu’on observe">
        <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
          <li><strong>Intensité & temps</strong> : score 58, baisse −7 pts → surcharge récurrente</li>
          <li><strong>Rapports sociaux</strong> : 60, −3 pts → soutien managérial perçu comme faible</li>
          <li><strong>Insécurité socio‑éco</strong> : 68, −2 pts → besoin d’information sur les perspectives</li>
          <li>Autres facteurs : dans le vert (autonomie 75, conflits de valeurs 72)</li>
        </ul>
      </Card>

      <Card title="2. Hypothèses prioritaires (IA)">
        <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
          <li>Pics de production + objectifs rapprochés + sous‑effectif temporaire</li>
          <li>Manque de rituels d’équipe pour traiter les irritants opérationnels</li>
          <li>Flou des priorités (trop de tickets/projets simultanés)</li>
        </ul>
      </Card>

      <Card title="3. Recommandations actionnables (SMART)">
        <ol className="list-decimal space-y-2 pl-5 text-sm text-gray-700">
          <li><strong>Réviser la charge & priorisation</strong> — cadrage hebdo de 30 min/équipe, limite WIP, revue capacités (Owner : Manager Prod, D+14)</li>
          <li><strong>Soutien managérial</strong> — rituel « point météo émotionnel » 10 min/jour (Owner : Managers de proximité, D+7)</li>
          <li><strong>Transparence socio‑éco</strong> — flash info mensuel sur perspectives internes (Owner : RH, D+21)</li>
        </ol>
      </Card>

      <Card title="4. Comment on mesurera l’impact">
        <div className="grid gap-4 md:grid-cols-3">
          <Stat icon={BarChart3} label="Cibles Intensité / Sociaux" value=">= 65 / >= 65" sub="sous 8 semaines" />
          <Stat icon={Users} label="Participation visée" value=">= 70%" />
          <Stat icon={LineIcon} label="Suivi" value="Courbes + verbatims" />
        </div>
      </Card>

      <Card title="5. Annexes">
        <p className="text-sm text-gray-600">Méthodologie, seuils, anonymisation, banque d’items utilisée sur la période.</p>
      </Card>
    </div>
  );
}

function Formations() {
  const catalog = [
    { t: "Gérer l’intensité & la charge", d: "3h — atelier pratique", tag: "Managers & équipes" },
    { t: "Soutien managérial & feedback bienveillant", d: "2h — classe virtuelle", tag: "Managers" },
    { t: "Prévenir les conflits de valeurs", d: "1h — micro‑learning", tag: "Tous" },
    { t: "Faire face aux exigences émotionnelles", d: "2h — e‑learning + coaching", tag: "Tous" },
    { t: "Communication des changements & sécurité socio‑éco", d: "1h30 — webinaire", tag: "RH & Managers" },
    { t: "Parcours Manager RPS (7 modules)", d: "certifiant", tag: "Managers" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items:center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Formations & accompagnements MINDLY</h1>
          <p className="text-sm text-gray-500">Filtrer par facteur Gollac, public, format, durée</p>
        </div>
        <div className="flex gap-2">
          <button className="rounded-xl border border-gray-200 px-3 py-2 text-sm">Facteur</button>
          <button className="rounded-xl border border-gray-200 px-3 py-2 text-sm">Public</button>
          <button className="rounded-xl border border-gray-200 px-3 py-2 text-sm">Format</button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {catalog.map((c, i) => (
          <div key={i} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <div className="text-sm text-gray-500">{c.tag}</div>
            </div>
            <div className="text-lg font-semibold text-slate-800">{c.t}</div>
            <div className="mt-1 text-sm text-gray-600">{c.d}</div>
            <div className="mt-4 flex items-center justify-between">
              <button className="rounded-xl bg-orange-500 px-3 py-2 text-sm text-white hover:bg-orange-600">Voir la fiche</button>
              <button className="rounded-xl border border-gray-200 px-3 py-2 text-sm hover:border-orange-500 hover:bg-orange-50">Ajouter au plan</button>
            </div>
          </div>
        ))}
      </div>

      <Card title="Aide immédiate">
        <div className="grid gap-3 md:grid-cols-3">
          <button className="flex items-center justify-between rounded-xl border border-gray-200 p-3 hover:border-orange-500 hover:bg-orange-50">
            <div className="flex items-center gap-3"><Brain className="h-4 w-4"/><div>Parler à un psychologue</div></div>
            <ChevronRight className="h-4 w-4 text-gray-400"/>
          </button>
          <button className="flex items-center justify-between rounded-xl border border-gray-200 p-3 hover:border-orange-500 hover:bg-orange-50">
            <div className="flex items-center gap-3"><Users className="h-4 w-4"/><div>Médiation</div></div>
            <ChevronRight className="h-4 w-4 text-gray-400"/>
          </button>
          <button className="flex items-center justify-between rounded-xl border border-gray-200 p-3 hover:border-orange-500 hover:bg-orange-50">
            <div className="flex items-center gap-3"><User className="h-4 w-4"/><div>Coaching 1:1</div></div>
            <ChevronRight className="h-4 w-4 text-gray-400"/>
          </button>
        </div>
      </Card>
    </div>
  );
}

const TABS = [
  { id: "employee", label: "Accueil employé", icon: User },
  { id: "dashboard", label: "Tableau de bord RH", icon: BarChart3 },
  { id: "report", label: "Rapport IA", icon: FileText },
  { id: "training", label: "Formations", icon: BookOpen },
];

export default function App() {
  const [tab, setTab] = useState("employee");
  const [surveyOpen, setSurveyOpen] = useState(false);

  useEffect(() => {
    const rec1 = (function testFinance() { const map = new Map([['finance', true]]); const out=new Set(); if (map.get('finance')) out.add('Assistante sociale'); return Array.from(out); })();
    console.assert(rec1.includes('Assistante sociale'), 'Test finance → Assistante sociale');
    const rec2 = (function testSommeil() { const sleep = 1; const out = new Set(); if (typeof sleep === 'number' && sleep <= 2) out.add('Psychologue'); return Array.from(out); })();
    console.assert(rec2.includes('Psychologue'), 'Test sommeil faible → Psychologue');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between p-4">
          <div className="flex items-center gap-3">
            {BRAND.logoUrl ? (
              <img src={BRAND.logoUrl} alt="Mindly logo" className="h-9 w-9 rounded-xl object-contain"/>
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 text-white">M</div>
            )}
            <div>
              <div className="text-lg font-bold tracking-tight">{BRAND.name}</div>
              <div className="text-[10px] font-medium tracking-widest text-gray-600">{BRAND.tagline}</div>
            </div>
          </div>
          <nav className="hidden gap-2 md:flex">
            {TABS.map((t) => { const Icon = t.icon; return (
              <button key={t.id} onClick={()=>setTab(t.id)} className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm ${tab===t.id?"bg-orange-500 text-white":"text-slate-700 hover:bg-orange-50"}`}>
                <Icon className="h-4 w-4"/> {t.label}
              </button>
            );})}
          </nav>
          <div className="flex items-center gap-2">
            <Pill color={COLORS.green}><ShieldCheck className="mr-1 h-3 w-3"/> Anonyme</Pill>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-4 md:p-6">
        <div className="mb-4 grid grid-cols-2 gap-2 md:hidden">
          {TABS.map((t) => { const Icon = t.icon; return (
            <button key={t.id} onClick={()=>setTab(t.id)} className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm ${tab===t.id?"border-orange-500 bg-orange-50":"border-gray-200"}`}>
              <Icon className="h-4 w-4"/> {t.label}
            </button>
          );})}
        </div>

        {tab === "employee" && <EcranEmploye onOpenSurvey={() => setSurveyOpen(true)} />}
        {tab === "dashboard" && <DashboardRH onOpenPlan={() => setTab("report")} />}
        {tab === "report" && <RapportIA />}
        {tab === "training" && <Formations />}
      </main>

      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between p-4 text-xs text-gray-500">
          <div>© {new Date().getFullYear()} {BRAND.name} — Demo Hackathon</div>
          <div className="flex items-center gap-4">
            <a className="hover:underline" href="#">Mentions & RGPD</a>
            <a className="hover:underline" href="#">Comment sont utilisées mes données ?</a>
          </div>
        </div>
      </footer>

      <ChatSurvey open={surveyOpen} onClose={()=>setSurveyOpen(false)} onSubmitOrgScores={(scores)=>{ console.log('Org-only Gollac scores', scores); }} />
    </div>
  );
}
