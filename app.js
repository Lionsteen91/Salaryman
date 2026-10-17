'use strict';
/* Salaryman — sparen als spel.
   Alle data blijft in de opslag van dit apparaat (localStorage). Er wordt niets verstuurd. */

const STORE_KEY = 'mijngeld.v1';

/* =========================================================
   Categorieën en trefwoorden
   ========================================================= */
const CATS = [
  { id: 'inkomen', name: 'Inkomen', kind: 'in', icon: '💶' },
  { id: 'wonen', name: 'Wonen', kind: 'out', fixed: true, icon: '🏠' },
  { id: 'boodschappen', name: 'Boodschappen', kind: 'out', icon: '🛒' },
  { id: 'auto', name: 'Auto', kind: 'out', fixed: true, icon: '🚗' },
  { id: 'verzekeringen', name: 'Verzekeringen', kind: 'out', fixed: true, icon: '🛡️' },
  { id: 'abonnementen', name: 'Abonnementen', kind: 'out', fixed: true, icon: '📺' },
  { id: 'uiteten', name: 'Uit eten en afhaal', kind: 'out', icon: '🍔' },
  { id: 'vrijetijd', name: 'Vrije tijd en hobby', kind: 'out', icon: '🎮' },
  { id: 'kleding', name: 'Kleding en verzorging', kind: 'out', icon: '👕' },
  { id: 'overig', name: 'Overig', kind: 'out', icon: '📦' },
  { id: 'doel', name: 'Doel-aankoop (uit pot)', kind: 'skip', icon: '🎯' },
  { id: 'overboeking', name: 'Eigen overboeking / sparen', kind: 'skip', icon: '🔁' },
];
const CAT = Object.fromEntries(CATS.map(c => [c.id, c]));
const OUT_CATS = CATS.filter(c => c.kind === 'out');
const FREE_CATS = OUT_CATS.filter(c => !c.fixed);

const KEYWORDS = {
  laden: ['laadpas', 'laadpaal', 'opladen', 'shell recharge', 'newmotion', 'vattenfall incharge', 'incharge', 'allego', 'fastned', 'ionity', 'eneco emobility', 'chargepoint', 'plugsurfing', 'evbox', 'greenflux', 'e-flux', 'tesla supercharger', 'equans', 'pitpoint', 'blue current', 'jedlix', 'chargemap', 'electra'],
  overboeking: ['spaarrekening', 'eigen rekening', 'bitvavo', 'degiro', 'trade republic', 'meesman', 'brand new day', 'peaks', 'sparen'],
  wonen: ['hypotheek', 'huur', 'woningcorporatie', 'eneco', 'vattenfall', 'essent', 'greenchoice', 'energiedirect', 'budget energie', 'vandebron', 'oxxio', 'frank energie', 'tibber', 'vitens', 'evides', 'pwn', 'brabant water', 'waternet', 'dunea', 'oasen', 'wml', 'waterschap', 'gemeente', 'belastingsamenwerking', 'bghu', 'gblt', 'vve', 'ikea', 'praxis', 'gamma', 'karwei', 'hornbach'],
  boodschappen: ['albert heijn', 'ah', 'jumbo', 'lidl', 'aldi', 'plus', 'dirk', 'vomar', 'hoogvliet', 'nettorama', 'dekamarkt', 'coop', 'spar', 'picnic', 'poiesz', 'ekoplaza', 'crisp', 'flink', 'jan linders', 'boni', 'mcd supermarkt', 'slagerij', 'bakkerij', 'bakker', 'markt'],
  auto: ['lease', 'autolease', 'private lease', 'leaseplan', 'ayvens', 'athlon', 'directlease', 'shell', 'bp', 'esso', 'tango', 'tinq', 'tamoil', 'totalenergies', 'total', 'gulf', 'texaco', 'argos', 'avia', 'q-park', 'parkmobile', 'easypark', 'yellowbrick', 'parkeren', 'anwb', 'kwik-fit', 'euromaster', 'apk', 'rdw', 'motorrijtuigenbelasting', 'carwash'],
  verzekeringen: ['verzekering', 'verzekeringen', 'zilveren kruis', 'cz', 'vgz', 'menzis', 'dsw', 'zorg en zekerheid', 'ditzo', 'ohra', 'centraal beheer', 'fbto', 'interpolis', 'univé', 'unive', 'nationale-nederlanden', 'allianz', 'asr', 'a.s.r.', 'inshared', 'aegon', 'promovendum', 'anderzorg', 'zekur', 'hema verzekeringen'],
  abonnementen: ['netflix', 'spotify', 'disney', 'videoland', 'hbo', 'max', 'youtube', 'apple.com', 'icloud', 'google', 'kpn', 'ziggo', 'odido', 't-mobile', 'vodafone', 'tele2', 'simyo', 'lebara', 'youfone', 'delta fiber', 'caiway', 'budget mobiel', 'hollandsnieuwe', 'chatgpt', 'openai', 'anthropic', 'claude', 'amazon prime', 'basic-fit', 'fit for free', 'sportcity', 'anytime fitness', 'viaplay', 'dazn', 'nlziet', 'microsoft', 'adobe', 'storytel', 'kobo', 'nrc', 'volkskrant', 'telegraaf', 'dpg media'],
  uiteten: ['thuisbezorgd', 'just eat', 'uber eats', 'deliveroo', 'mcdonald', 'mcdonalds', 'burger king', 'kfc', 'domino', 'dominos', 'new york pizza', 'restaurant', 'cafe', 'café', 'eetcafe', 'starbucks', 'febo', 'subway', 'lunchroom', 'pizzeria', 'snackbar', 'cafetaria', 'brasserie', 'sushi', 'wok', 'kebab', 'shoarma', 'bagels', 'la place', 'smullers'],
  vrijetijd: ['action', 'zeeman', 'wibra', 'xenos', 'blokker', 'pathe', 'pathé', 'vue', 'kinepolis', 'efteling', 'walibi', 'steam', 'playstation', 'nintendo', 'xbox', 'ticketmaster', 'eventim', 'booking.com', 'airbnb', 'ns', 'ov-chipkaart', 'translink', 'transavia', 'klm', 'ryanair', 'easyjet', 'corendon', 'tui', 'sunweb', 'decathlon', 'intersport', 'coolblue', 'mediamarkt', 'bol.com', 'bol', 'amazon', 'kamera express', 'cameranu', 'foto konijnenberg', 'museum', 'bioscoop', 'scorito', 'boekhandel', 'bruna', 'hema'],
  kleding: ['zalando', 'h&m', 'primark', 'zara', 'c&a', 'we fashion', 'jack & jones', 'jack and jones', 'nike', 'adidas', 'vero moda', 'scotch & soda', 'the sting', 'about you', 'shoeby', 'sacha', 'van haren', 'manfield', 'kruidvat', 'etos', 'trekpleister', 'douglas', 'ici paris', 'rituals', 'kapper', 'barber', 'kapsalon', 'apotheek'],
};
const kwRegex = {};
for (const [cat, list] of Object.entries(KEYWORDS)) {
  kwRegex[cat] = new RegExp('(^|[^a-z0-9à-ÿ])(' + list.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')(?=$|[^a-z0-9à-ÿ])', 'i');
}

// Prijsniveau t.o.v. gemiddelde (Consumentenbond-meting 6 mei 2026, 131 budgetproducten).
const SUPER_INDEX = [
  { re: 'dirk', name: 'Dirk', idx: -9 }, { re: 'nettorama', name: 'Nettorama', idx: -9 },
  { re: 'vomar', name: 'Vomar', idx: -8 }, { re: 'hoogvliet', name: 'Hoogvliet', idx: -7 },
  { re: 'lidl', name: 'Lidl', idx: -6 }, { re: 'aldi', name: 'Aldi', idx: -5 },
  { re: 'dekamarkt', name: 'DekaMarkt', idx: -4 }, { re: 'albert heijn|\\bah\\b', name: 'Albert Heijn', idx: 0 },
  { re: 'jumbo', name: 'Jumbo', idx: 1 }, { re: '\\bplus\\b', name: 'PLUS', idx: 1 },
  { re: 'picnic', name: 'Picnic', idx: 5 }, { re: '\\bspar\\b', name: 'SPAR', idx: 18 }, { re: 'poiesz', name: 'Poiesz', idx: 24 },
];

const BANKS = ['Knab', 'ING', 'Rabobank', 'ABN AMRO', 'bunq', 'ASN Bank', 'SNS', 'RegioBank', 'Triodos'];

/* =========================================================
   Spelregels
   ========================================================= */
const LEVELS = ['Beginner', 'Spaarder', 'Budgetbaas', 'Geldmeester', 'Spaar-pro', 'Vermogensjager', 'Salaryman-legende'];
const DEBT_LEVELS = ['Starter', 'Doorzetter', 'Rondkomer', 'Planner', 'Volhouder', 'Krachtpatser', 'Salaryman-held'];
const xpForLevel = (n) => 150 * n * (n - 1);              // level 1: 0, 2: 300, 3: 900, 4: 1800, 5: 3000 …
const DEFAULT_REWARDS = [
  { id: 'r1', name: 'Uit eten', cost: 400, icon: '🍝' },
  { id: 'r2', name: 'Nieuwe game', cost: 600, icon: '🎮' },
  { id: 'r3', name: 'Dagje uit', cost: 900, icon: '🎢' },
  { id: 'r4', name: 'Weekendje weg', cost: 2500, icon: '🏝️' },
];

const DEFAULT_REWARDS_DEBT = [
  { id: 'd1', name: 'Filmavond thuis', cost: 150, icon: '🍿' },
  { id: 'd2', name: 'Lekker uitslapen', cost: 100, icon: '😴' },
  { id: 'd3', name: 'Wandeling of fietstocht naar je favoriete plek', cost: 120, icon: '🚲' },
  { id: 'd4', name: 'Iets lekkers bakken met wat je in huis hebt', cost: 200, icon: '🧁' },
];

const DEFAULT_SETTINGS = {
  mode: '',
  debt: { leefgeld: 75, leefDay: 1, traject: '', fixedPaid: '', toeslagen: '', newBills: '' },
  name: '',
  payday: 25,
  together: false,
  partnerName: '',
  myShare: 50,
  potStart: 39567,
  planStart: '2026-11',
  planEnd: '2027-09',
  goals: [
    { id: 'g1', name: 'Auto', amount: 13000, month: '2026-12', source: 'pot' },
    { id: 'g2', name: 'Nieuwe bank', amount: 3000, month: '2026-12', source: 'pot' },
    { id: 'g3', name: 'Vliegtickets', amount: 1500, month: '2027-02', source: 'sparen' },
    { id: 'g4', name: 'Vakantie (8 weken)', amount: 5500, month: '2027-08', source: 'sparen' },
  ],
  budgets: {},
  bigPct: 4,
  bigMin: 100,
  chargeFull: false,
  onboarded: false,
};

let state = load();
let ui = { tab: 'spel', month: null, q: '', resultMonth: null, resultWeek: null, resultKind: 'week', pending: null };

/* =========================================================
   Opslag
   ========================================================= */
function load() {
  let s = null;
  try { s = JSON.parse(localStorage.getItem(STORE_KEY) || 'null'); } catch (e) { s = null; }
  s = s || {};
  const accounts = s.accounts || {};
  for (const a of Object.values(accounts)) {          // oude versie: {joint: true/false}
    if (!a.type) a.type = a.joint ? 'samen' : 'eigen';
    if (a.share == null) a.share = 50;
  }
  const settings = Object.assign({}, DEFAULT_SETTINGS, s.settings || {});
  settings.debt = Object.assign({}, DEFAULT_SETTINGS.debt, settings.debt || {});
  // Oude demodata (van voor de keuze sparen/rondkomen): opruimen, zodat je weer op het startscherm begint.
  if (s.demo && !settings.mode) { s = Object.assign({}, s, { tx: [], accounts: {}, overrides: {}, rules: {}, seen: {}, demo: false }); }
  if (!settings.mode && Array.isArray(s.tx) && s.tx.length) settings.mode = 'sparen';   // bestaande spelers met echte data
  return {
    tx: Array.isArray(s.tx) ? s.tx : [],
    rules: s.rules || {},
    overrides: s.overrides || {},
    accounts,
    mappings: s.mappings || {},
    rewards: Array.isArray(s.rewards) ? s.rewards : DEFAULT_REWARDS.slice(),
    rewardsDebt: Array.isArray(s.rewardsDebt) ? s.rewardsDebt : DEFAULT_REWARDS_DEBT.slice(),
    seenWeeks: s.seenWeeks || {},
    uploads: Array.isArray(s.uploads) ? s.uploads : [],
    lastBackup: s.lastBackup || '',
    calendarAdded: !!s.calendarAdded,
    dismissed: s.dismissed || {},
    lastClimb: typeof s.lastClimb === 'number' ? s.lastClimb : null,
    redeemed: Array.isArray(s.redeemed) ? s.redeemed : [],
    seen: s.seen || {},
    lastBank: s.lastBank || 'Knab',
    settings,
    demo: !!s.demo,
  };
}
function save() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); }
  catch (e) { toast('Opslaan lukte niet: de opslag van je browser is vol.'); }
}

/* =========================================================
   Hulpfuncties
   ========================================================= */
const eur0 = new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
const eur2 = new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 });
const fmt = (n) => eur0.format(Math.round(n)).replace(/\s/g, ' ');
const fmt2 = (n) => eur2.format(n).replace(/\s/g, ' ');
const num = (n) => Math.round(n).toLocaleString('nl-NL');
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const MONTHS = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
const MONTHS_SHORT = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
const monthLabel = (k) => { const [y, m] = k.split('-').map(Number); return MONTHS[m - 1] + ' ' + y; };
const monthName = (k) => MONTHS[Number(k.split('-')[1]) - 1];
const monthShort = (k) => { const [y, m] = k.split('-').map(Number); return MONTHS_SHORT[m - 1] + (m === 1 ? " '" + String(y).slice(2) : ''); };
const addMonths = (k, n) => { let [y, m] = k.split('-').map(Number); m += n; while (m > 12) { m -= 12; y++; } while (m < 1) { m += 12; y--; } return y + '-' + String(m).padStart(2, '0'); };
const monthsBetween = (a, b) => { const [ya, ma] = a.split('-').map(Number); const [yb, mb] = b.split('-').map(Number); return (yb - ya) * 12 + (mb - ma); };
const todayKey = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); };
const isoDay = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const median = (arr) => { if (!arr.length) return 0; const s = [...arr].sort((a, b) => a - b); const h = Math.floor(s.length / 2); return s.length % 2 ? s[h] : (s[h - 1] + s[h]) / 2; };
const quantile = (arr, q) => { if (!arr.length) return 0; const s = [...arr].sort((a, b) => a - b); const i = (s.length - 1) * q, lo = Math.floor(i); return s[lo] + (s[Math.ceil(i)] - s[lo]) * (i - lo); };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 3200);
}

/* =========================================================
   CSV inlezen (automatisch herkennen of met kolomkoppeling)
   ========================================================= */
function clean(s) { return String(s || '').replace(/\s+/g, ' ').trim(); }
function iban(s) { return String(s || '').replace(/[\s"]/g, '').toUpperCase(); }
function hash(str) { let h = 5381; for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0; return (h >>> 0).toString(36) + str.length.toString(36); }
function splitCSV(text, d) {
  const rows = []; let row = []; let f = ''; let q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
    else if (c === '"') q = true;
    else if (c === d) { row.push(f); f = ''; }
    else if (c === '\n') { row.push(f); rows.push(row); row = []; f = ''; }
    else f += c;
  }
  if (f || row.length) { row.push(f); rows.push(row); }
  return rows.filter(r => r.some(c => c.trim()));
}
function detectDelim(line) {
  const counts = { ';': (line.match(/;/g) || []).length, ',': (line.match(/,/g) || []).length, '\t': (line.match(/\t/g) || []).length };
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}
function parseDate(s) {
  s = String(s || '').trim(); let m;
  if ((m = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/))) return m[3] + '-' + m[2].padStart(2, '0') + '-' + m[1].padStart(2, '0');
  if ((m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/))) return m[1] + '-' + m[2].padStart(2, '0') + '-' + m[3].padStart(2, '0');
  if ((m = s.match(/^(\d{4})(\d{2})(\d{2})$/))) return m[1] + '-' + m[2] + '-' + m[3];
  return null;
}
function parseAmount(s) {
  s = String(s || '').replace(/[€\s ]/g, '').replace(/^\+/, '');
  if (!s) return NaN;
  const lc = s.lastIndexOf(','), ld = s.lastIndexOf('.');
  if (lc > ld) s = s.replace(/\./g, '').replace(',', '.');
  else if (ld > lc && lc >= 0) s = s.replace(/,/g, '');
  return parseFloat(s);
}
async function readFile(file) {
  const buf = await file.arrayBuffer();
  let text = new TextDecoder('utf-8').decode(buf);
  if (text.includes('�')) text = new TextDecoder('windows-1252').decode(buf);
  return text.replace(/^﻿/, '');
}

// Herkent de kolommen aan de kopregel. Lukt dat niet, dan null (dan vraagt de app het je).
function autoColumns(header) {
  const h = header.map(x => x.trim().toLowerCase().replace(/^"|"$/g, ''));
  const exact = (names) => { for (const n of names) { const i = h.indexOf(n); if (i >= 0) return i; } return -1; };
  const loose = (names) => { const e = exact(names); if (e >= 0) return e; for (const n of names) { const i = h.findIndex(x => x.includes(n)); if (i >= 0) return i; } return -1; };
  const descExact = exact(['omschrijving', 'mededelingen', 'description', 'omschrijving-1', 'omschrijving 1']);
  const col = {
    date: loose(['transactiedatum', 'boekdatum', 'boekingsdatum', 'datum', 'date', 'transactiondate']),
    amount: loose(['bedrag', 'bedrag (eur)', 'transactiebedrag', 'amount']),
    cd: loose(['creditdebet', 'credit/debet', 'debet/credit', 'af bij', 'af/bij']),
    name: loose(['tegenrekeninghouder', 'naam tegenpartij', 'naam / omschrijving', 'naam tegenrekening', 'tegenpartij', 'name', 'naam']),
    desc: descExact >= 0 ? descExact : loose(['omschrijving', 'description']),
    method: loose(['betaalwijze', 'type betaling', 'mutatiesoort', 'code']),
    own: exact(['rekeningnummer', 'rekening', 'iban/bban', 'account', 'eigen rekening', 'iban']),
    cp: loose(['tegenrekeningnummer', 'tegenrekening', 'iban tegenpartij', 'counterparty', 'tegenrekening iban/bban']),
  };
  if (col.date < 0 || col.amount < 0) return null;
  return col;
}

// ABN AMRO levert een tab-bestand zonder kopregel: rekening, munt, datum, beginsaldo, eindsaldo, rentedatum, bedrag, omschrijving.
const PRESETS = {
  'ABN AMRO': { delim: '\t', header: false, cols: { own: 0, date: 2, amount: 6, desc: 7, name: -1, cd: -1, cp: -1, method: -1 }, nameFromDesc: true },
};
function nameFromDescription(desc) {
  let m;
  if ((m = desc.match(/\/NAME\/([^/]+)/i))) return clean(m[1]);
  if ((m = desc.match(/Naam:\s*(.+?)(?:\s{2,}|Omschrijving:|IBAN:|Kenmerk:|$)/i))) return clean(m[1]);
  if ((m = desc.match(/^(?:BEA|GEA|eCom)[^,]*?(?:NR:\S+\s+)?\d{2}\.\d{2}\.\d{2}\/\d{2}[.:]\d{2}\s+(.+?)(?:,PAS|\s{2,}|$)/i))) return clean(m[1]);
  return clean(desc.split(/\s{2,}|,/)[0]).slice(0, 40);
}

function parseBankFile(text, bank) {
  const lines = text.split(/\r\n|\n|\r/);
  const mapping = state.mappings[bank] || PRESETS[bank];
  let rows, col, delim, hi = -1;
  if (mapping && !mapping.header) {
    delim = mapping.delim || detectDelim(lines.find(l => l.trim()) || '');
    rows = splitCSV(lines.join('\n'), delim);
    col = mapping.cols;
  } else {
    hi = lines.findIndex(l => /bedrag|amount/i.test(l));
    if (hi >= 0) {
      delim = detectDelim(lines[hi]);
      rows = splitCSV(lines.slice(hi).join('\n'), delim);
      col = (mapping && mapping.header && mapping.cols) || autoColumns(rows[0]);
      rows.shift();
    }
    if (!col) {
      delim = detectDelim(lines.find(l => l.trim()) || '');
      return { needsMapping: true, sample: splitCSV(lines.join('\n'), delim).slice(0, 6), delim, header: hi >= 0 };
    }
  }
  const out = [], seen = {}, accts = {};
  const nameFromDesc = mapping && mapping.nameFromDesc;
  for (const r of rows) {
    if (!r || r.length < 2) continue;
    const date = parseDate(r[col.date]);
    let amount = parseAmount(r[col.amount]);
    if (!date || !isFinite(amount) || amount === 0) continue;
    if (col.cd >= 0) {
      const cd = (r[col.cd] || '').trim().toLowerCase();
      if (/^(d|debet|af)$/.test(cd)) amount = -Math.abs(amount);
      else if (/^(c|credit|bij)$/.test(cd)) amount = Math.abs(amount);
    }
    const desc = clean(col.desc >= 0 ? r[col.desc] : '');
    let name = clean(col.name >= 0 ? r[col.name] : '');
    if (!name && nameFromDesc) name = nameFromDescription(desc);
    const method = clean(col.method >= 0 ? r[col.method] : '');
    // Rekeningnummers worden niet opgeslagen: alleen een onomkeerbare code plus de laatste 4 tekens.
    const ownIban = iban(col.own >= 0 ? r[col.own] : '');
    const cpIban = iban(col.cp >= 0 ? r[col.cp] : '');
    const acc = ownIban ? hash('acct:' + ownIban) : hash('bank:' + bank);
    accts[acc] = ownIban ? ownIban.slice(-4) : bank;
    const base = [acc, date, amount.toFixed(2), name.toLowerCase(), desc.toLowerCase().slice(0, 80)].join('|');
    seen[base] = (seen[base] || 0) + 1;
    const t = { id: hash(base + '#' + seen[base]), date, amount: Math.round(amount * 100) / 100, name, desc, method, acct: acc };
    if (cpIban) t.cp = hash('acct:' + cpIban);
    out.push(t);
  }
  if (!out.length) return { needsMapping: true, sample: splitCSV(lines.join('\n'), delim).slice(0, 6), delim, header: hi >= 0 };
  return { rows: out, accounts: accts };
}

async function importFiles(files) {
  const bank = state.lastBank;
  let added = 0, total = 0, newAcc = 0;
  for (const f of files) {
    const text = await readFile(f);
    let res;
    try { res = parseBankFile(text, bank); } catch (e) { toast('Dit bestand kon niet worden gelezen.'); return; }
    if (res.needsMapping) { ui.pending = { text, bank, res }; render(); toast('Help me even: welke kolom is wat?'); return; }
    ({ added, total, newAcc } = mergeRows(res, bank, added, total, newAcc));
  }
  finishImport(added, total, newAcc);
}
function mergeRows(res, bank, added, total, newAcc) {
  total += res.rows.length;
  if (state.demo) { state.tx = []; state.demo = false; state.accounts = {}; state.overrides = {}; state.rules = {}; state.seen = {}; state.seenWeeks = {}; state.uploads = []; state.redeemed = []; }
  for (const [key, last4] of Object.entries(res.accounts)) {
    if (!state.accounts[key]) { state.accounts[key] = { last4, bank, type: 'nieuw', share: 50 }; newAcc++; }
  }
  const ids = new Set(state.tx.map(t => t.id));
  for (const r of res.rows) if (!ids.has(r.id)) { state.tx.push(r); ids.add(r.id); added++; }
  return { added, total, newAcc };
}
function finishImport(added, total, newAcc) {
  state.tx.sort((a, b) => a.date.localeCompare(b.date));
  state.settings.onboarded = true;
  if (!state.settings.mode) state.settings.mode = 'sparen';
  { const d = todayIso(); if (!state.uploads.includes(d)) state.uploads.push(d); }
  if (!state.settings.gameStart) state.settings.gameStart = addMonths(todayKey(), -1);   // vorige maand is je eerste echte ronde
  save();
  ui.month = null; ui.tab = 'spel';
  toast(added ? `${added} nieuwe transacties` + (total > added ? `, ${total - added} al bekend` : '') + (newAcc ? ' · vertel me wat voor rekening het is' : '') : 'Geen nieuwe transacties, alles was al bekend');
  render(); window.scrollTo(0, 0);
}

/* =========================================================
   Rekeningen en indelen
   ========================================================= */
function acct(t) { return state.accounts[t.acct]; }
function acctType(t) { const a = acct(t); return a ? a.type : 'eigen'; }
function isJoint(t) { return acctType(t) === 'samen'; }
function isSavings(t) { return acctType(t) === 'spaar'; }
function weight(t) {
  const a = acct(t);
  if (!a || a.type !== 'samen') return 1;
  if (state.settings.chargeFull && category(t) === 'auto') return 1;
  return (Number(a.share) || 50) / 100;
}
function acctLabel(a) {
  const t = { eigen: 'eigen', samen: 'samen', spaar: 'spaar', nieuw: 'nieuw' }[a.type] || '';
  return `${a.bank || 'Bank'} – ${t}${a.last4 && a.last4 !== a.bank ? ' (…' + a.last4 + ')' : ''}`;
}

function nameKey(t) { return (t.name || '').toLowerCase(); }
function category(t) { return categorize(t)[0]; }
function categorize(t) {
  if (!categorize.cache) categorize.cache = new Map();
  let c = categorize.cache.get(t.id);
  if (!c) { c = categorizeRaw(t); if (!Array.isArray(c)) c = [c, 'zeker']; categorize.cache.set(t.id, c); }
  return c;
}
function categorizeRaw(t) {
  if (isSavings(t)) return 'overboeking';
  if (state.overrides[t.id]) return state.overrides[t.id];
  const k = nameKey(t);
  if (k && state.rules[k]) return state.rules[k];
  if (t.cp && state.accounts[t.cp]) return 'overboeking';
  const hay = (t.name + ' ' + t.desc).toLowerCase();
  if (kwRegex.overboeking.test(hay)) return 'overboeking';
  if (kwRegex.laden.test(hay)) return 'auto';
  if (isJoint(t) && t.amount > 0) {
    for (const cat of ['wonen', 'verzekeringen', 'auto', 'abonnementen', 'boodschappen', 'uiteten', 'kleding', 'vrijetijd']) if (kwRegex[cat].test(hay)) return cat;
    return 'overboeking';
  }
  if (t.amount >= 500) return 'inkomen';
  for (const cat of ['wonen', 'verzekeringen', 'auto', 'abonnementen', 'boodschappen', 'uiteten', 'kleding', 'vrijetijd']) {
    if (kwRegex[cat].test(hay)) return cat;
  }
  return [t.amount > 0 ? 'inkomen' : 'overig', 'gok'];
}
function setCategory(t, cat) {
  const k = nameKey(t);
  if (k) { state.rules[k] = cat; for (const x of state.tx) if (nameKey(x) === k) delete state.overrides[x.id]; }
  else state.overrides[t.id] = cat;
  save();
}
function unknownParties() {
  const from = addMonths(todayKey(), -12), g = {};
  for (const t of state.tx) {
    if (t.amount >= 0 || t.date.slice(0, 7) < from || isSavings(t)) continue;
    if (categorize(t)[1] !== 'gok') continue;
    const key = nameKey(t) || ('#' + t.id);
    const x = g[key] = g[key] || { t, n: 0, total: 0, joint: isJoint(t) };
    x.n++; x.total -= t.amount;
  }
  return Object.values(g).filter(x => x.total >= 15).sort((a, b) => b.total - a.total);
}
function recurring(t) {
  const k = nameKey(t); if (!k) return false;
  if (!recurring.cache) {
    recurring.cache = {};
    for (const x of state.tx) if (x.amount < 0) (recurring.cache[nameKey(x)] = recurring.cache[nameKey(x)] || new Set()).add(x.date.slice(0, 7));
  }
  return (recurring.cache[k] || new Set()).size >= 3;
}

/* =========================================================
   Berekeningen
   ========================================================= */
const memo = new Map();
function cached(key, fn) { if (!memo.has(key)) memo.set(key, fn()); return memo.get(key); }
function invalidate() { memo.clear(); categorize.cache = null; recurring.cache = null; }

function monthsWithData() { return cached('months', () => [...new Set(state.tx.map(t => t.date.slice(0, 7)))].sort()); }
function currentMonth() { const m = monthsWithData(); const now = todayKey(); return m.includes(now) ? now : (m.length ? m[m.length - 1] : now); }
function txOfMonth(k) { return cached('tx' + k, () => state.tx.filter(t => t.date.startsWith(k))); }
function lastTxDate() { return state.tx.length ? state.tx[state.tx.length - 1].date : null; }

function stats(k) {
  return cached('st' + k, () => {
    const s = { income: 0, spend: 0, byCat: {} };
    for (const c of OUT_CATS) s.byCat[c.id] = 0;
    for (const t of txOfMonth(k)) {
      const c = CAT[category(t)], a = t.amount * weight(t);
      if (c.kind === 'in') s.income += a;
      else if (c.kind === 'out') { s.byCat[c.id] -= a; s.spend -= a; }
    }
    s.net = s.income - s.spend;
    return s;
  });
}
// Een maand is "af" als hij voorbij is.
function completeMonths() { return cached('complete', () => { const now = todayKey(); return monthsWithData().filter(k => k < now); }); }
function recentComplete() { return completeMonths().slice(-12); }
function budgets() {
  return cached('budgets', () => {
    const months = recentComplete(), b = {};
    for (const c of OUT_CATS) {
      const manual = state.settings.budgets[c.id];
      if (manual != null && manual !== '') { b[c.id] = Number(manual); continue; }
      // Mediaan: één dure maand trekt je budget niet omhoog.
      b[c.id] = months.length ? Math.round(median(months.map(k => stats(k).byCat[c.id])) / 5) * 5 : 0;
    }
    return b;
  });
}
function avgIncome() { return cached('avgInc', () => { const m = recentComplete(); return m.length ? median(m.map(k => stats(k).income)) : 0; }); }
function incomeFor(k) {
  const st = stats(k), avg = avgIncome();
  if (!completeMonths().includes(k) && avg > 0 && st.income < avg * 0.5) return { value: st.income + avg, expected: true };
  return { value: st.income, expected: false };
}
function netFor(k) { return incomeFor(k).value - stats(k).spend; }

function plan() {
  const s = state.settings;
  const total = s.goals.reduce((a, g) => a + Number(g.amount || 0), 0);
  const months = Math.max(1, monthsBetween(s.planStart, s.planEnd) + 1);
  const perMonth = total / months;
  const mine = s.together ? perMonth * (Number(s.myShare) || 50) / 100 : perMonth;
  return { total, months, perMonth, mine, partner: perMonth - mine };
}
function goalsDueBy(k) { return state.settings.goals.filter(g => g.month <= k).reduce((a, g) => a + Number(g.amount || 0), 0); }
function savingsAccounts() { return Object.entries(state.accounts).filter(([, a]) => a.type === 'spaar').map(([k]) => k); }
// Wat er écht op de spaarrekening bij kwam (stortingen min opnames), van alle spaarders samen.
function savingsFlow(k) {
  return cached('sf' + k, () => {
    const set = new Set(savingsAccounts()); let f = 0;
    for (const t of txOfMonth(k)) if (set.has(t.acct)) f += t.amount;
    return f;
  });
}
function potGain(k) {
  if (savingsAccounts().length && txOfMonth(k).some(isSavings)) return savingsFlow(k);
  const s = state.settings, share = s.together ? (Number(s.myShare) || 50) / 100 : 1;
  return netFor(k) / share - state.settings.goals.filter(g => g.month === k).reduce((a, g) => a + Number(g.amount || 0), 0);
}

/* ---------- modus ---------- */
function isDebt() { return state.settings.mode === 'schulden'; }

/* ---------- weken (maandag t/m zondag) ---------- */
const DAY = 86400000;
function dateOf(s) { return new Date(s + 'T00:00:00'); }
function addDays(s, n) { const d = dateOf(s); d.setDate(d.getDate() + n); return isoDay(d); }
function todayIso() { return isoDay(new Date()); }
function weekStartOf(s) { const d = dateOf(s); d.setDate(d.getDate() - (d.getDay() + 6) % 7); return isoDay(d); }
function weekNo(s) { const d = dateOf(s); d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7); const y = new Date(d.getFullYear(), 0, 4); return 1 + Math.round(((d - y) / DAY - 3 + (y.getDay() + 6) % 7) / 7); }
function weekRange(ws) { const e = addDays(ws, 6), a = ws.split('-').map(Number), b = e.split('-').map(Number); return `${a[2]} ${MONTHS_SHORT[a[1] - 1]} – ${b[2]} ${MONTHS_SHORT[b[1] - 1]}`; }
function allWeeks() {
  return cached('weeks', () => {
    if (!state.tx.length) return [];
    const out = [], end = weekStartOf(todayIso());
    for (let w = weekStartOf(state.tx[0].date); w <= end; w = addDays(w, 7)) out.push(w);
    return out;
  });
}
function txOfWeek(ws) { return cached('tw' + ws, () => { const we = addDays(ws, 6); return state.tx.filter(t => t.date >= ws && t.date <= we); }); }
function lastUpload() { return state.uploads.length ? state.uploads.slice().sort().pop() : ''; }
// Een week telt mee als hij voorbij is en je export tot het eind van die week reikt (of je daarna nog iets hebt geladen).
function weekComplete(ws) {
  const we = addDays(ws, 6);
  if (we >= todayIso()) return false;
  return (lastTxDate() || '') >= addDays(we, -1) || lastUpload() > we;
}
function completeWeeks() { return cached('cw', () => allWeeks().filter(weekComplete)); }
function currentWeek() { const all = allWeeks(); return all.length ? all[all.length - 1] : weekStartOf(todayIso()); }
// Weekbudget: alleen vrije uitgaven. Vaste lasten horen bij de maand.
function weeklyBudget() {
  return cached('wb', () => {
    if (isDebt()) return Number(state.settings.debt.leefgeld) || 0;
    const b = budgets();
    return Math.round(FREE_CATS.reduce((a, c) => a + (b[c.id] || 0), 0) * 12 / 52 / 5) * 5;
  });
}
function weekStats(ws) {
  return cached('wst' + ws, () => {
    const r = { spend: 0, byCat: {} };
    for (const c of OUT_CATS) r.byCat[c.id] = 0;
    for (const t of txOfWeek(ws)) {
      const c = CAT[category(t)]; if (c.kind !== 'out') continue;
      const a = -t.amount * weight(t);
      r.byCat[c.id] += a; if (!c.fixed) r.spend += a;
    }
    return r;
  });
}
function impulseThreshold() {
  if (isDebt()) return Math.max(20, (Number(state.settings.debt.leefgeld) || 75) * 0.4);
  return Math.max(state.settings.bigMin, avgIncome() * state.settings.bigPct / 100);
}
function weekImpulses(ws) {
  const thr = impulseThreshold();
  return txOfWeek(ws).filter(t => { const c = CAT[category(t)]; return t.amount < 0 && c.kind === 'out' && !c.fixed && -t.amount * weight(t) >= thr && !recurring(t); });
}
function weekMissions(ws) {
  const st = weekStats(ws), wb = weeklyBudget(), b = budgets(), imp = weekImpulses(ws).length, debt = isDebt(), m = [];
  m.push({ id: 'week', icon: debt ? '💚' : '🎯', name: debt ? `Rondkomen van ${fmt(wb)} leefgeld` : `Vrije uitgaven onder ${fmt(wb)}`, xp: 30, fail: -15, cur: st.spend, max: wb, done: st.spend <= wb, invert: true });
  const gb = debt ? Math.round(wb * 0.55 / 5) * 5 : Math.round((b.boodschappen || 0) * 12 / 52 / 5) * 5;
  if (gb > 0) m.push({ id: 'groc', icon: '🛒', name: `Boodschappen onder ${fmt(gb)}`, xp: 15, fail: -5, cur: st.byCat.boodschappen, max: gb, done: st.byCat.boodschappen <= gb, invert: true });
  m.push({ id: 'imp', icon: '🧘', name: 'Geen impulsaankopen', xp: 10, fail: -5, cur: imp, max: 0, done: imp === 0, invert: true, count: true });
  return m;
}
function weekResult(ws) {
  return cached('wr' + ws, () => {
    const st = weekStats(ws), wb = weeklyBudget(), missions = weekMissions(ws), debt = isDebt(), lines = [];
    const diff = wb - st.spend;
    lines.push({ label: diff >= 0 ? `${fmt(diff)} onder je weekbudget (1 punt per € 5)` : `${fmt(-diff)} boven je weekbudget`, pts: debt ? Math.max(0, Math.round(diff / 5)) : Math.round(diff / 5) });
    for (const m of missions) {
      if (m.done) lines.push({ label: `Missie: ${m.name}`, pts: m.xp, ok: true });
      else if (debt) lines.push({ label: `Volgende week nieuwe kans: ${m.name}`, pts: 0 });
      else lines.push({ label: `Missie mislukt: ${m.name}`, pts: m.fail, bad: true });
    }
    if (debt) lines.push({ label: 'Week bijgehouden', pts: 10, ok: true });
    const pts = lines.reduce((a, l) => a + l.pts, 0);
    const outcome = st.spend <= wb ? 'win' : st.spend <= wb * 1.1 ? 'draw' : 'lose';
    return { ws, pts, lines, missions, outcome, spend: st.spend, budget: wb, st };
  });
}
// Je streak breekt als er een hele kalendermaand voorbijgaat zonder dat je iets hebt geladen.
function streakFrom() {
  return cached('sfrom', () => {
    if (state.demo || !state.uploads.length) return '';
    const months = new Set(state.uploads.map(d => d.slice(0, 7)));
    const first = state.uploads.slice().sort()[0].slice(0, 7), now = todayKey();
    let gap = '';
    for (let m = first; m < now; m = addMonths(m, 1)) if (!months.has(m)) gap = m;
    return gap ? addMonths(gap, 1) + '-01' : '';
  });
}
function streakWarning() {
  if (state.demo || !state.uploads.length) return null;
  const now = todayKey();
  if (state.uploads.some(d => d.startsWith(now))) return null;
  const t = new Date(), last = new Date(t.getFullYear(), t.getMonth() + 1, 0).getDate();
  const left = last - t.getDate() + 1;
  return left <= 7 ? left : null;
}
function climb() {
  const ws = completeWeeks().slice(-10).map(weekResult);
  let s = 0;
  for (const w of ws) { if (w.outcome === 'win') s++; else if (w.outcome === 'lose' && !isDebt()) s--; s = clamp(s, 0, 6); }
  return { step: s, last: ws.length ? ws[ws.length - 1].outcome : null };
}

/* ---------- salarisdag / leefgelddag ---------- */
function paydayInfo() {
  const s = state.settings, d = clamp(Number(s.payday) || 25, 1, 31);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const at = (y, m) => new Date(y, m, Math.min(d, new Date(y, m + 1, 0).getDate()));
  let next = at(today.getFullYear(), today.getMonth());
  if (next <= today) next = at(today.getFullYear(), today.getMonth() + 1);
  const prev = at(next.getFullYear(), next.getMonth() - 1);
  const daysLeft = Math.round((next - today) / DAY);
  const cycleDays = Math.round((next - prev) / DAY);
  const from = isoDay(prev);
  let income = 0, spend = 0;
  for (const t of state.tx) {
    if (t.date < from) continue;
    const c = CAT[category(t)], a = t.amount * weight(t);
    if (c.kind === 'in') income += a; else if (c.kind === 'out') spend -= a;
  }
  if (income < avgIncome() * 0.5) income += avgIncome();
  const reserve = plan().mine;
  const left = income - spend - reserve;
  const last = lastTxDate();
  const stale = last ? Math.round((today - dateOf(last)) / DAY) : null;
  return { daysLeft, cycleDays, left, perDay: daysLeft > 0 ? left / daysLeft : left, reserve, stale, progress: 1 - daysLeft / cycleDays };
}
function leefgeldInfo() {
  const s = state.settings.debt, dow = clamp(Number(s.leefDay) || 1, 0, 6), amount = Number(s.leefgeld) || 0;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const back = (today.getDay() - dow + 7) % 7;
  const start = new Date(today); start.setDate(today.getDate() - back);
  const next = new Date(start); next.setDate(start.getDate() + 7);
  const daysLeft = Math.round((next - today) / DAY);
  const from = isoDay(start);
  let spend = 0;
  for (const t of state.tx) { if (t.date < from) continue; const c = CAT[category(t)]; if (c.kind === 'out' && !c.fixed) spend -= t.amount * weight(t); }
  const left = amount - spend;
  const last = lastTxDate();
  const stale = last ? Math.round((today - dateOf(last)) / DAY) : null;
  return { daysLeft, left, perDay: left / Math.max(1, daysLeft), spend, amount, stale, progress: 1 - daysLeft / 7 };
}

/* =========================================================
   Het spel: punten, missies, levels, badges
   ========================================================= */
function impulsesOf(k) {
  const thr = impulseThreshold();
  return txOfMonth(k).filter(t => { const c = CAT[category(t)]; return t.amount < 0 && c.kind === 'out' && !c.fixed && -t.amount * weight(t) >= thr && !recurring(t); });
}
function missionsFor(k) {
  const p = plan(), net = netFor(k);
  return [{ id: 'save', icon: '💰', name: `Zet ${fmt(p.mine)} opzij`, xp: 100, fail: -50, cur: Math.max(0, net), max: p.mine, done: net >= p.mine, hard: net < 0 }];
}
function weeksOfMonth(k) { return completeWeeks().filter(ws => ws.slice(0, 7) === k); }
function monthResult(k) {
  return cached('res' + k, () => {
    const st = stats(k), b = budgets(), p = plan(), net = netFor(k);
    const lines = [];
    lines.push({ label: net >= 0 ? `Overgehouden ${fmt(net)} (1 punt per € 10)` : `Tekort ${fmt(-net)} (1 punt per € 10)`, pts: Math.round(net / 10) });
    const missions = missionsFor(k);
    for (const m of missions) {
      if (m.done) lines.push({ label: `Missie: ${m.name}`, pts: m.xp, ok: true });
      else if (!m.hard) lines.push({ label: `Missie: ${m.name} (net niet)`, pts: 0 });
      else lines.push({ label: `Missie mislukt: ${m.name}`, pts: m.fail, bad: true });
    }
    const fixedCats = OUT_CATS.filter(c => c.fixed);
    const fSpent = fixedCats.reduce((a, c) => a + st.byCat[c.id], 0), fBud = fixedCats.reduce((a, c) => a + (b[c.id] || 0), 0);
    if (fBud > 0) {
      if (fSpent > fBud * 1.05) lines.push({ label: `Vaste lasten ${fmt(fSpent - fBud)} hoger dan normaal`, pts: -15, bad: true });
      else lines.push({ label: 'Vaste lasten binnen budget', pts: 10, ok: true });
    }
    const pts = lines.reduce((a, l) => a + l.pts, 0);
    const outcome = net >= p.mine ? 'win' : net >= 0 ? 'draw' : 'lose';
    const weeks = weeksOfMonth(k).map(weekResult);
    return { k, net, pts, lines, missions, outcome, target: p.mine, st, weeks };
  });
}
function game() {
  return cached('game', () => {
    const debt = isDebt();
    const months = debt ? [] : completeMonths().map(monthResult);
    const weeks = completeWeeks().map(weekResult);
    // XP telt je hele geschiedenis (je level); punten om uit te geven pas vanaf je eerste echte ronde.
    const start = state.demo ? '' : (state.settings.gameStart || '');
    let xp = 0, earned = 0;
    for (const r of months) { if (r.k >= start) earned += r.pts; if (r.pts > 0) xp += r.pts; }
    for (const r of weeks) { if (r.ws.slice(0, 7) >= start) earned += r.pts; if (r.pts > 0) xp += r.pts; }
    const spent = state.redeemed.reduce((a, r) => a + r.cost, 0);
    let level = 1; while (xp >= xpForLevel(level + 1)) level++;
    const from = streakFrom();
    let streak = 0;
    for (let i = weeks.length - 1; i >= 0 && weeks[i].ws >= from && weeks[i].outcome === 'win'; i--) streak++;
    let best = 0, run = 0; for (const r of weeks) { run = r.outcome === 'win' ? run + 1 : 0; best = Math.max(best, run); }
    const titles = debt ? DEBT_LEVELS : LEVELS;
    return { months, weeks, results: months, xp, coins: Math.max(0, earned - spent), earned, spent, level, title: titles[Math.min(level - 1, titles.length - 1)], cur: xpForLevel(level), next: xpForLevel(level + 1), streak, best };
  });
}
function badges() {
  const g = game(), w = g.weeks, b = budgets();
  if (isDebt()) return [
    { icon: '🌟', name: 'Eerste topweek', got: w.some(x => x.outcome === 'win'), how: 'Een week rondgekomen van je leefgeld' },
    { icon: '🔥', name: '3 weken op rij', got: g.best >= 3, how: '3 topweken achter elkaar' },
    { icon: '🌋', name: '8 weken op rij', got: g.best >= 8, how: '8 topweken achter elkaar' },
    { icon: '📒', name: 'Maand bijgehouden', got: w.length >= 4, how: '4 weken bijgehouden' },
    { icon: '🛒', name: 'Slimme shopper', got: w.filter(x => x.missions.find(m => m.id === 'groc' && m.done)).length >= 3, how: '3 keer de boodschappenmissie gehaald' },
    { icon: '⭐', name: 'Level 5', got: g.level >= 5, how: 'Bereik level 5' },
    { icon: '🎁', name: 'Eerste beloning', got: state.redeemed.length > 0, how: 'Gun jezelf je eerste beloning' },
    { icon: '💪', name: 'Doorzetter', got: w.length >= 12, how: '12 weken meegespeeld' },
  ];
  const pot = potNow(), m = g.months;
  return [
    { icon: '🥇', name: 'Eerste weekwinst', got: w.some(x => x.outcome === 'win'), how: 'Een week onder je weekbudget' },
    { icon: '🔥', name: '4 weken op rij', got: g.best >= 4, how: '4 weken op rij gewonnen' },
    { icon: '🌋', name: '12 weken op rij', got: g.best >= 12, how: '12 weken op rij gewonnen' },
    { icon: '💰', name: 'Spaardoel gehaald', got: m.some(x => x.outcome === 'win'), how: 'Een maand je spaardoel gehaald' },
    { icon: '🛒', name: 'Slimme shopper', got: w.filter(x => x.missions.find(mm => mm.id === 'groc' && mm.done)).length >= 6, how: '6 keer de boodschappenmissie gehaald' },
    { icon: '🏦', name: 'Pot weer vol', got: pot.value >= state.settings.potStart && completeMonths().some(k => k > state.settings.planStart), how: `Pot terug op ${fmt(state.settings.potStart)}` },
    { icon: '⭐', name: 'Level 5', got: g.level >= 5, how: 'Bereik level 5' },
    { icon: '🎁', name: 'Eerste beloning', got: state.redeemed.length > 0, how: 'Wissel je eerste beloning in' },
  ];
}
// Wat ging er goed? Voor de uitslag en de deelkaart.
function highlights(k) {
  const st = stats(k), b = budgets(), out = [];
  const under = FREE_CATS.filter(c => b[c.id] > 0 && st.byCat[c.id] < b[c.id]).map(c => ({ c, pct: Math.round((1 - st.byCat[c.id] / b[c.id]) * 100) })).sort((x, y) => y.pct - x.pct);
  if (under[0] && under[0].pct >= 5) out.push(`${under[0].c.name.toLowerCase()} ${under[0].pct}% onder budget`);
  const wk = weeksOfMonth(k).map(weekResult), won = wk.filter(w => w.outcome === 'win').length;
  if (wk.length) out.push(`${won} van ${wk.length} weken binnen budget`);
  if (!impulsesOf(k).length) out.push('geen impulsaankopen');
  return out;
}
function weekHighlights(ws) {
  const r = weekResult(ws), out = [];
  if (r.spend <= r.budget) out.push(`${fmt(r.budget - r.spend)} onder je weekbudget`);
  for (const m of r.missions) if (m.done && m.id !== 'week') out.push(m.name.charAt(0).toLowerCase() + m.name.slice(1));
  if (!out.length) out.push(isDebt() ? 'je hebt je week bijgehouden, dat is al winst' : 'je weet nu precies waar je geld heen ging');
  return out;
}

/* ---------- schuldenmodus: plan en hulp ---------- */
function debtPlan() {
  const d = state.settings.debt, li = Number(d.leefgeld) || 0, steps = [];
  steps.push(`Je weekbudget is <b>${fmt(li)}</b>, dat is zo'n <b>${fmt(li / 7)}</b> per dag. Salaryman houdt bij hoe het gaat; elke week die lukt is winst.`);
  if (d.traject === 'wsnp') steps.push('Je zit in de schuldsanering. Houd je aan de afspraken met je bewindvoerder; die weet ook wat wel en niet mag. Salaryman helpt je je leefgeld slim te verdelen.');
  else if (d.traject === 'bewind' || d.traject === 'budgetbeheer' || d.traject === 'schuldhulp') steps.push('Je krijgt al hulp, top dat je die stap hebt gezet. Vragen over je traject? Je hulpverlener is je eerste aanspreekpunt.');
  else steps.push('Nog geen hulp? De schuldhulp van je gemeente is gratis. Twijfel je waar je moet beginnen, bel of chat dan anoniem met Geldfit: <b>0800-8115</b> (gratis, op werkdagen).');
  if (d.fixedPaid === 'nee' || d.fixedPaid === 'weet niet') steps.push('Betaal eerst je vaste lasten: huur, energie en zorgverzekering. Zo voorkom je nieuwe achterstanden.');
  if (d.toeslagen !== 'ja') steps.push('Check of je alle toeslagen en regelingen krijgt waar je recht op hebt. Je gemeente of het Nibud helpt je op weg; dat levert vaak echt geld op.');
  if (d.newBills === 'ja') steps.push('Komt er een rekening die je niet kunt betalen? Leg hem niet weg, maar bespreek hem met je hulpverlener of bel Geldfit. Samen vind je een oplossing.');
  steps.push('Boodschappen: Dirk, Nettorama en Lidl waren in de prijsmeting van de Consumentenbond (mei 2026) het voordeligst.');
  return steps;
}
const HELP = [
  { icon: '🏛️', name: 'Je gemeente', what: 'Gratis schuldhulp, ook als je alleen even wilt praten.', url: '' },
  { icon: '📞', name: 'Geldfit · 0800-8115', what: 'Gratis en anoniem advies over welke hulp bij je past. Bellen of chatten op werkdagen.', url: 'https://www.geldfit.nl' },
  { icon: '📘', name: 'Nibud', what: 'Tips om rond te komen en uitleg over toeslagen.', url: 'https://www.nibud.nl' },
  { icon: '⚖️', name: 'Het Juridisch Loket', what: 'Hulp bij brieven van incassobureaus of deurwaarders.', url: 'https://www.juridischloket.nl' },
  { icon: '🤝', name: 'SchuldHulpMaatje', what: 'Vrijwilligers die met je meekijken naar post en geldzaken.', url: 'https://www.schuldhulpmaatje.nl' },
];

/* ---------- agenda-herinnering (.ics, blijft op je eigen apparaat) ---------- */
function downloadCalendar() {
  const d = new Date(); d.setDate(d.getDate() + (6 - d.getDay() + 7) % 7);   // eerstvolgende zaterdag
  const ymd = isoDay(d).replace(/-/g, '');
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  const url = location.origin + location.pathname;
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Salaryman//NL', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT',
    'UID:weekronde-' + stamp + '@salaryman', 'DTSTAMP:' + stamp, 'DTSTART:' + ymd + 'T190000', 'DTEND:' + ymd + 'T191500',
    'RRULE:FREQ=WEEKLY;BYDAY=SA,SU', 'SUMMARY:Salaryman: laad je CSV voor je weekronde',
    'DESCRIPTION:Download je transacties bij je bank en laad ze in Salaryman. ' + url, 'URL:' + url,
    'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:Tijd voor je weekronde', 'TRIGGER:PT0M', 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
  a.download = 'salaryman-herinnering.ics'; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  state.calendarAdded = true; save();
  toast('Open het bestand om de herinnering aan je agenda toe te voegen');
}

/* ---------- deelbare uitslagkaart (wordt op je apparaat getekend) ---------- */
function shareCard(o) {
  const W = 1080, H = 1920, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const c = cv.getContext('2d'), F = 'ui-rounded, "SF Pro Rounded", -apple-system, "Segoe UI", Roboto, sans-serif';
  c.fillStyle = '#0b0a1a'; c.fillRect(0, 0, W, H);
  const g = c.createRadialGradient(W / 2, -200, 50, W / 2, -200, 1300); g.addColorStop(0, 'rgba(157,107,255,.35)'); g.addColorStop(1, 'rgba(11,10,26,0)');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  const lg = c.createLinearGradient(90, 0, 520, 0); lg.addColorStop(0, '#ffc93c'); lg.addColorStop(.55, '#ff5fd2'); lg.addColorStop(1, '#9d6bff');
  c.textBaseline = 'alphabetic';
  c.font = `800 60px ${F}`; c.fillStyle = lg; c.fillText('Salaryman', 90, 190);
  c.font = `500 42px ${F}`; c.fillStyle = '#a9a4cc'; c.fillText(o.kicker, 90, 330);
  c.font = `800 92px ${F}`; c.fillStyle = o.color; c.fillText(o.headline, 90, 440);
  // grafiek
  const cx = 90, cy = 560, cw = W - 180, ch = 560;
  c.fillStyle = '#16142b'; roundRect(c, cx, cy, cw, ch, 36); c.fill();
  const bars = o.bars, n = Math.max(1, bars.length), maxV = Math.max(1, ...bars.map(b => Math.max(b.val, b.budget))) * 1.15;
  const px = cx + 60, pw = cw - 120, py = cy + 60, ph = ch - 160, bw = Math.min(140, pw / n * 0.55);
  const yOf = (v) => py + ph - v / maxV * ph;
  bars.forEach((b, i) => {
    const x = px + (i + 0.5) * pw / n - bw / 2, y = yOf(b.val);
    c.fillStyle = b.val <= b.budget ? '#58e06f' : (o.soft ? '#ffc93c' : '#ff5a5f');
    c.globalAlpha = b.val <= b.budget ? 1 : 0.8; roundRect(c, x, y, bw, py + ph - y, 14); c.fill(); c.globalAlpha = 1;
    c.font = `600 30px ${F}`; c.fillStyle = '#a9a4cc'; c.textAlign = 'center'; c.fillText(b.label, x + bw / 2, py + ph + 52); c.textAlign = 'left';
  });
  const by = yOf(bars.length ? bars[0].budget : 0);
  c.setLineDash([14, 12]); c.strokeStyle = 'rgba(244,242,255,.55)'; c.lineWidth = 3;
  c.beginPath(); c.moveTo(px - 20, by); c.lineTo(px + pw + 20, by); c.stroke(); c.setLineDash([]);
  c.font = `500 26px ${F}`; c.fillStyle = 'rgba(244,242,255,.7)'; c.textAlign = 'right'; c.fillText('budget', px + pw + 20, by - 12); c.textAlign = 'left';
  // tegels
  const ty = cy + ch + 60, tw = (W - 180 - 40) / 3;
  o.tiles.forEach((t, i) => {
    const x = 90 + i * (tw + 20);
    c.fillStyle = '#16142b'; roundRect(c, x, ty, tw, 220, 30); c.fill();
    c.font = `500 30px ${F}`; c.fillStyle = '#a9a4cc'; c.fillText(t[0], x + 32, ty + 66);
    c.font = `800 64px ${F}`; c.fillStyle = t[2] || '#f4f2ff'; c.fillText(t[1], x + 32, ty + 160);
  });
  // wat ging goed
  c.font = `700 40px ${F}`; c.fillStyle = '#f4f2ff'; c.fillText(o.noteTitle, 90, ty + 340);
  c.font = `400 38px ${F}`; c.fillStyle = '#c9c4e6'; wrapText(c, o.note, 90, ty + 410, W - 180, 56);
  c.font = `500 30px ${F}`; c.fillStyle = '#a9a4cc'; c.textAlign = 'center';
  c.fillText('Maak van sparen een spel · lionsteen91.github.io/salaryman', W / 2, H - 110); c.textAlign = 'left';
  cv.toBlob(async (blob) => {
    const file = new File([blob], 'salaryman-uitslag.png', { type: 'image/png' });
    try {
      if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: 'Mijn Salaryman-uitslag' }); return; }
    } catch (e) { if (e && e.name === 'AbortError') return; }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'salaryman-uitslag.png'; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000); toast('Afbeelding opgeslagen. Deel hem via WhatsApp.');
  }, 'image/png');
}
function roundRect(c, x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
function wrapText(c, text, x, y, maxW, lh) {
  let line = '';
  for (const word of text.split(' ')) { const t = line ? line + ' ' + word : word; if (c.measureText(t).width > maxW && line) { c.fillText(line, x, y); y += lh; line = word; } else line = t; }
  if (line) c.fillText(line, x, y);
}
function shareMonth(k) {
  const r = monthResult(k), g = game();
  const pct = r.target > 0 ? Math.round(Math.max(0, r.net) / r.target * 100) : 0;
  const head = { win: ['Doel gehaald', '#58e06f'], draw: ['Bijna gehaald', '#ffc93c'], lose: ['Volgende maand beter', '#ff9a1f'] }[r.outcome];
  const hl = highlights(k);
  shareCard({
    kicker: monthLabel(k).replace(/^./, m => m.toUpperCase()), headline: head[0], color: head[1],
    bars: r.weeks.map(w => ({ label: 'Wk ' + weekNo(w.ws), val: w.spend, budget: w.budget })),
    tiles: [['Spaardoel', pct + '%', pct >= 100 ? '#58e06f' : '#f4f2ff'], ['Punten', (r.pts >= 0 ? '+' : '−') + num(Math.abs(r.pts)), '#ffc93c'], ['Streak', g.streak + ' wk', '#ff9a1f']],
    noteTitle: 'Wat ging goed', note: hl.length ? hl.join(', ').replace(/^./, m => m.toUpperCase()) + '.' : 'Elke maand bijhouden is al winst.',
  });
}
function shareWeek(ws) {
  const r = weekResult(ws), g = game(), debt = isDebt();
  const head = debt ? { win: ['Topweek!', '#58e06f'], draw: ['Bijna!', '#ffc93c'], lose: ['Nieuwe week, nieuwe kans', '#9d6bff'] }[r.outcome] : { win: ['Week gewonnen', '#58e06f'], draw: ['Gelijkspel', '#ffc93c'], lose: ['Volgende week beter', '#ff9a1f'] }[r.outcome];
  const days = []; const daily = r.budget / 7;
  for (let i = 0; i < 7; i++) { const d = addDays(ws, i); let v = 0; for (const t of txOfWeek(ws)) if (t.date === d) { const c = CAT[category(t)]; if (c.kind === 'out' && !c.fixed) v -= t.amount * weight(t); } days.push({ label: ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo'][i], val: v, budget: daily }); }
  const pct = r.budget > 0 ? Math.round(r.spend / r.budget * 100) : 0;
  shareCard({
    kicker: `Week ${weekNo(ws)} · ${weekRange(ws)}`, headline: head[0], color: head[1], bars: days, soft: debt,
    tiles: [['Budget gebruikt', pct + '%', pct <= 100 ? '#58e06f' : '#f4f2ff'], ['Punten', (r.pts >= 0 ? '+' : '−') + num(Math.abs(r.pts)), '#ffc93c'], ['Streak', g.streak + ' wk', '#ff9a1f']],
    noteTitle: 'Wat ging goed', note: weekHighlights(ws).join(', ').replace(/^./, m => m.toUpperCase()) + '.',
  });
}

/* ---------- de coach: rekent altijd een herstelplan uit ---------- */
function coach(k) {
  const res = monthResult(k), b = budgets(), st = res.st;
  const gap = Math.max(0, res.target - res.net);
  const findings = [], actions = [];
  // 1. Waar ging het mis?
  const over = FREE_CATS.map(c => ({ c, over: st.byCat[c.id] - b[c.id] })).filter(x => b[x.c.id] > 0 && x.over > 5).sort((a, b) => b.over - a.over);
  for (const o of over.slice(0, 3)) {
    const top = topMerchants(k, o.c.id, 2).map(m => `${esc(m.name)} ${fmt(m.amt)}`).join(', ');
    findings.push(`${o.c.icon} <b>${esc(o.c.name)}</b>: ${fmt(o.over)} boven budget${top ? ` <span class="muted">(${top})</span>` : ''}`);
  }
  const big = impulsesOf(k).sort((a, b) => a.amount * weight(a) - b.amount * weight(b))[0];
  if (big) findings.push(`🧨 Grootste losse aankoop: <b>${esc(big.name || big.desc)}</b> ${fmt(-big.amount * weight(big))}`);
  if (res.st.income < avgIncome() * 0.8 && avgIncome() > 0) findings.push(`💶 Je inkomen was ${fmt(avgIncome() - res.st.income)} lager dan normaal`);
  // 2. Kandidaat-acties met hun opbrengst per maand; de grootste eerst tot het tekort gedekt is.
  const cand = [];
  for (const o of over) cand.push({ save: o.over, text: `Houd <b>${esc(o.c.name)}</b> op je budget van ${fmt(b[o.c.id])}. Dat is ${fmt(o.over / 4.3)} per week minder dan deze maand.` });
  const sup = superSaving(k);
  if (sup.saving >= 15) cand.push({ save: sup.saving, text: `Doe je boodschappen bij Lidl of Dirk in plaats van ${sup.names.join(' en ')}. Scheelt ongeveer ${fmt(sup.saving)} per maand <span class="muted">(Consumentenbond, mei 2026)</span>.` });
  for (const c of FREE_CATS) {
    if (over.find(o => o.c.id === c.id)) continue;
    const spent = st.byCat[c.id]; if (spent < 40) continue;
    cand.push({ save: spent * 0.2, text: `Snoei 20% op <b>${esc(c.name)}</b>: ${fmt(spent * 0.2)} per maand, ${fmt(spent * 0.2 / 4.3)} per week.` });
  }
  const subs = subscriptions().filter(s => s.amt >= 5);
  if (subs.length) cand.push({ save: subs[0].amt, text: `Kijk je abonnementen na. Zeg je <b>${esc(subs[0].name)}</b> (${fmt(subs[0].amt)}/mnd) op, dan scheelt dat elke maand.` });
  if (big && -big.amount * weight(big) >= 100) cand.push({ save: -big.amount * weight(big) * 0.5, text: `Spreek een 48-uursregel met jezelf af voor aankopen boven ${fmt(state.settings.bigMin)}: eerst twee dagen wachten, dan pas kopen.` });
  cand.sort((a, b) => b.save - a.save);
  let covered = 0;
  for (const c of cand) { if (gap > 0 && covered >= gap) break; actions.push(c.text); covered += c.save; if (actions.length >= 4) break; }
  // 3. Altijd een oplossing: blijft er een gat over, verdeel het of schuif een doel.
  const rest = Math.max(0, gap - covered);
  const left = Math.max(1, monthsBetween(addMonths(k, 1), state.settings.planEnd) + 1);
  if (gap > 0 && rest > 0) {
    actions.push(`Verdeel de resterende ${fmt(rest)} over de ${left} ${left === 1 ? 'maand' : 'maanden'} die nog over ${left === 1 ? 'is' : 'zijn'}: ${fmt(rest / left)} per maand extra, dan haal je je plan alsnog.`);
    const flex = state.settings.goals.filter(g => g.source === 'sparen' && g.month > k).sort((a, b) => b.amount - a.amount)[0];
    if (flex) actions.push(`Of maak <b>${esc(flex.name)}</b> ${fmt(rest)} goedkoper, of schuif het een maand op.`);
    else actions.push(`Of schuif de einddatum van je plan een maand op; dat kun je bij Instellingen aanpassen.`);
  }
  if (!actions.length) actions.push(gap > 0 ? `Zet volgende maand ${fmt(gap)} extra opzij, dan sta je weer op schema.` : 'Ga zo door. Alles wat je extra overhoudt, gaat naar je pot.');
  return { findings, actions, gap };
}
function topMerchants(k, cat, n) {
  const g = {};
  for (const t of txOfMonth(k)) if (category(t) === cat && t.amount < 0) { const key = t.name || t.desc || '?'; g[key] = (g[key] || 0) - t.amount * weight(t); }
  return Object.entries(g).map(([name, amt]) => ({ name, amt })).sort((a, b) => b.amt - a.amt).slice(0, n);
}
function subscriptions() {
  const g = {};
  for (const t of state.tx) if (category(t) === 'abonnementen' && t.amount < 0 && recurring(t)) { (g[t.name] = g[t.name] || []).push(-t.amount * weight(t)); }
  return Object.entries(g).map(([name, a]) => ({ name, amt: median(a) })).sort((a, b) => b.amt - a.amt);
}
function superSaving(k) {
  const per = {};
  for (const t of txOfMonth(k)) {
    if (category(t) !== 'boodschappen' || t.amount >= 0) continue;
    const hay = (t.name + ' ' + t.desc).toLowerCase();
    const s = SUPER_INDEX.find(x => new RegExp(x.re, 'i').test(hay)); if (!s) continue;
    per[s.name] = per[s.name] || { s, amt: 0 }; per[s.name].amt -= t.amount * weight(t);
  }
  let saving = 0; const names = [];
  for (const { s, amt } of Object.values(per)) if (s.idx >= 0 && amt > 40) { saving += amt * (1 - 94 / (100 + s.idx)); names.push(s.name); }
  return { saving, names };
}

/* ---------- pot ---------- */
function potSeries() {
  const s = state.settings, p = plan();
  const start = addMonths(s.planStart, -1);
  const months = []; for (let m = start; m <= s.planEnd; m = addMonths(m, 1)) months.push(m);
  const have = new Set(monthsWithData()), now = todayKey();
  const proj = months.map((m, i) => s.potStart + p.perMonth * i - goalsDueBy(m));
  const actual = []; let v = s.potStart;
  months.forEach((m, i) => { if (i > 0) v += potGain(m); if (i === 0 || (have.has(m) && m <= now)) actual.push({ i, v }); });
  return { months, proj, actual };
}
function potNow() { const ps = potSeries(); const a = ps.actual[ps.actual.length - 1]; return { value: a ? a.v : state.settings.potStart, ps }; }

/* ---------- gezamenlijke boodschappen ---------- */
function jointAnalysis() {
  if (!Object.values(state.accounts).some(a => a.type === 'samen')) return null;
  const rows = recentComplete().filter(k => txOfMonth(k).some(isJoint)).map(k => {
    const r = { groc: 0, out: 0, deposits: 0 };
    for (const t of txOfMonth(k)) {
      if (!isJoint(t)) continue;
      const c = category(t);
      if (c === 'overboeking') { if (t.amount > 0) r.deposits += t.amount; continue; }
      if (c === 'boodschappen') r.groc -= t.amount;
      r.out -= t.amount;
    }
    return r;
  });
  const g = rows.map(r => r.groc);
  return { months: rows.length, median: median(g), high: Math.max(0, ...g), low: g.length ? Math.min(...g) : 0, advicePP: Math.ceil(quantile(g, 0.75) / 2 / 10) * 10, avgDeposits: median(rows.map(r => r.deposits)), avgOut: median(rows.map(r => r.out)) };
}

/* ---------- waarschuwingen ---------- */
function alertsFor(k) {
  const out = [], st = stats(k), b = budgets();
  const income = incomeFor(k).value || avgIncome();
  for (const t of impulsesOf(k).sort((a, b) => a.amount * weight(a) - b.amount * weight(b)).slice(0, 3)) {
    const pct = income > 0 ? Math.round(-t.amount * weight(t) / income * 100) : null;
    out.push({ lvl: 'warn', html: `${fmt(-t.amount * weight(t))}${isJoint(t) ? ' (jouw deel)' : ''} bij <b>${esc(t.name || t.desc || 'onbekend')}</b>${pct ? ` · ${pct}% van je inkomen in één keer` : ''}. Had je het nodig?` });
  }
  for (const c of OUT_CATS) {
    const spent = st.byCat[c.id], bud = b[c.id];
    if (bud > 0 && spent > bud * 1.05) out.push({ lvl: 'bad', html: `${c.icon} ${esc(c.name)}: ${fmt(spent - bud)} boven je budget van ${fmt(bud)}.` });
  }
  const sup = superSaving(k);
  if (sup.saving >= 20) out.push({ lvl: 'warn', html: `🛒 Je haalde veel bij ${sup.names.join(' en ')}. Bij Lidl had dat zo'n <b>${fmt(sup.saving)}</b> goedkoper gekund.` });
  return out;
}

/* =========================================================
   Weergave
   ========================================================= */
function render() {
  invalidate();
  document.querySelectorAll('#tabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === ui.tab));
  document.body.classList.toggle('debt', isDebt());
  const v = document.getElementById('view');
  document.body.classList.toggle('no-tabs', !state.tx.length || !!ui.pending);
  if (ui.pending) { v.innerHTML = mappingView(); bindMapping(); return; }
  if (!state.tx.length) { v.innerHTML = onboardingView(); bindOnboarding(); return; }
  if (!ui.month || !monthsWithData().includes(ui.month)) ui.month = currentMonth();
  const fn = { spel: playView, uitslag: resultView, transacties: txView, beloningen: rewardsView, instellingen: settingsView }[ui.tab] || playView;
  v.innerHTML = fn();
  bind();
}
function goHome() {
  ui.tab = 'spel'; ui.pending = null; ui.resultMonth = null; ui.resultWeek = null;
  render(); window.scrollTo(0, 0);
}
function stopDemo() {
  state.tx = []; state.accounts = {}; state.overrides = {}; state.rules = {}; state.seen = {}; state.seenWeeks = {};
  state.uploads = []; state.redeemed = []; state.demo = false; state.settings.mode = '';
  save(); ui = { tab: 'spel', month: null, q: '', resultMonth: null, resultWeek: null, resultKind: 'week', pending: null };
  render(); window.scrollTo(0, 0);
}

/* ---------- illustratie: klimmen naar meer geld ---------- */
// step 0..6: hoe hoog het poppetje staat. Gaat omhoog bij elke gewonnen week, omlaag na een slechte week.
function heroArt(step, last, from) {
  const steps = 7, sx = 30, sy = 24, x0 = 62;
  step = clamp(Math.round(step || 0), 0, steps - 1);
  from = from == null ? step : clamp(Math.round(from), 0, steps - 1);
  const px = (n) => x0 + n * sx + sx / 2 - 2, py = (n) => 214 - (26 + n * sy);
  let stairs = '';
  for (let i = 0; i < steps; i++) {
    const x = x0 + i * sx, h = 26 + i * sy, y = 214 - h;
    stairs += `<rect x="${x}" y="${y}" width="${sx - 4}" height="${h}" rx="5" fill="url(#coin)" opacity="${(0.55 + i * 0.06).toFixed(2)}"/>`;
    for (let j = 0; j < Math.floor(h / 10); j++) stairs += `<line x1="${x + 3}" x2="${x + sx - 7}" y1="${y + 8 + j * 10}" y2="${y + 8 + j * 10}" stroke="#b8860b" stroke-opacity=".35" stroke-width="1.4"/>`;
  }
  const cx = x0 + step * sx + sx / 2 - 2, cy = 214 - (26 + step * sy);
  const sparkle = (x, y, s, d) => `<path d="M${x} ${y - s}L${x + s * .3} ${y - s * .3}L${x + s} ${y}L${x + s * .3} ${y + s * .3}L${x} ${y + s}L${x - s * .3} ${y + s * .3}L${x - s} ${y}L${x - s * .3} ${y - s * .3}Z" fill="#fff6c9" class="tw" style="animation-delay:${d}s"/>`;
  const arrow = last === 'win' ? `<path d="M0 -50 l-6 8 h4 v8 h4 v-8 h4 z" fill="#58e06f"/>` : (last === 'lose' && !isDebt()) ? `<path d="M0 -34 l-6 -8 h4 v-8 h4 v8 h4 z" fill="#ff5a5f"/>` : '';
  return `<svg class="hero-art" viewBox="0 0 340 230" role="img" aria-label="Een poppetje klimt een trap van munten op, van de rode min naar de groene plus">
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1b5e"/><stop offset="1" stop-color="#120f2b"/></linearGradient>
      <linearGradient id="coin" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffd85a"/><stop offset=".55" stop-color="#ffc93c"/><stop offset="1" stop-color="#e0a21a"/></linearGradient>
      <radialGradient id="glowG"><stop offset="0" stop-color="#58e06f" stop-opacity=".75"/><stop offset="1" stop-color="#58e06f" stop-opacity="0"/></radialGradient>
      <radialGradient id="glowR"><stop offset="0" stop-color="#ff5a5f" stop-opacity=".55"/><stop offset="1" stop-color="#ff5a5f" stop-opacity="0"/></radialGradient>
    </defs>
    <rect width="340" height="230" rx="18" fill="url(#sky)"/>
    ${sparkle(40, 40, 5, 0)}${sparkle(120, 26, 4, .8)}${sparkle(200, 50, 3, 1.6)}${sparkle(90, 80, 3, .4)}${sparkle(230, 100, 3, 1.1)}
    <circle cx="304" cy="44" r="50" fill="url(#glowG)"/>
    <g class="bob"><circle cx="304" cy="44" r="23" fill="#58e06f" stroke="#c8ffd2" stroke-width="2"/>
      <path d="M304 32 v24 M292 44 h24" stroke="#0b2a10" stroke-width="6" stroke-linecap="round"/></g>
    <circle cx="30" cy="192" r="34" fill="url(#glowR)"/>
    <circle cx="30" cy="192" r="16" fill="#ff5a5f" stroke="#ffc9cb" stroke-width="2"/>
    <path d="M22 192 h16" stroke="#3a0d0f" stroke-width="5" stroke-linecap="round"/>
    ${stairs}
    <rect x="0" y="214" width="340" height="16" fill="#0d0b20"/>
    <g class="climber-pos" style="transform:translate(${px(from)}px,${py(from)}px)" data-tx="${cx}" data-ty="${cy}" data-step="${step}"><g class="climber">
      ${arrow}
      <circle cx="0" cy="-30" r="7" fill="#ffd9b8"/><path d="M-7 -33 q7 -9 14 0" fill="#3b2a1a"/>
      <rect x="-7" y="-23" width="14" height="15" rx="5" fill="#ff5fd2"/>
      <path d="M-5 -9 l-4 9 M5 -9 l5 7" stroke="#2ec5ff" stroke-width="4" stroke-linecap="round"/>
      <path d="M-7 -19 l-7 6 M7 -19 l8 -8" stroke="#ffd9b8" stroke-width="3.5" stroke-linecap="round"/>
    </g></g>
  </svg>`;
}

/* ---------- onboarding ---------- */
function bankSelect(id) {
  return `<select id="${id}">${BANKS.concat(['Andere bank']).map(b => `<option ${b === state.lastBank || (b === 'Andere bank' && !BANKS.includes(state.lastBank)) ? 'selected' : ''}>${b}</option>`).join('')}</select>`;
}
const WEEKDAYS = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];
function opt(list, sel) { return list.map(([v, l]) => `<option value="${v}" ${String(v) === String(sel) ? 'selected' : ''}>${l}</option>`).join(''); }
function onboardingView() {
  const s = state.settings, d = s.debt;
  if (!s.mode) return `<div class="hero">${heroArt(1, null)}</div>
    <h1 class="big-title">Maak van geld een spel</h1>
    <p class="lead">Elke week een nieuwe ronde. Kies wat bij jou past, je kunt het later altijd nog wisselen.</p>
    <button class="card mode-pick" data-mode="sparen"><span class="mp-icon">📈</span><span><b>Ik wil sparen</b><br><span class="small muted">Haal je spaardoelen en win elke week van je uitgaven.</span></span><span class="t-go">›</span></button>
    <button class="card mode-pick debt" data-mode="schulden"><span class="mp-icon">🌱</span><span><b>Ik wil rondkomen</b><br><span class="small muted">Grip op je leefgeld en stap voor stap uit de schulden. Alleen maar positief.</span></span><span class="t-go">›</span></button>
    <p class="small muted center">🔒 Alles blijft op dit apparaat. Rekeningnummers worden niet bewaard.</p>`;
  const debt = isDebt();
  const who = debt ? `<div class="card"><h2>1. Even kennismaken</h2>
      <p class="small muted" style="margin-top:0">Een paar korte vragen, zodat ik een plan voor je kan maken. Er zijn geen foute antwoorden.</p>
      <div class="field"><span>Je naam</span><input id="ob-name" value="${esc(s.name)}" placeholder="Bijv. Sam" autocomplete="given-name"></div>
      <div class="field"><span>Leefgeld per week</span><span class="inline">€<input id="ob-leefgeld" type="number" inputmode="decimal" min="0" step="5" value="${d.leefgeld}" style="width:84px"></span></div>
      <div class="field"><span>Je leefgeld komt op</span><select id="ob-leefday">${opt(WEEKDAYS.map((n, i) => [i, n]), d.leefDay)}</select></div>
      <div class="field"><span>Krijg je al hulp?</span><select id="ob-traject">${opt([['', 'Nog niet'], ['schuldhulp', 'Schuldhulp gemeente'], ['wsnp', 'Schuldsanering (Wsnp)'], ['budgetbeheer', 'Budgetbeheer'], ['bewind', 'Beschermingsbewind'], ['anders', 'Iets anders']], d.traject)}</select></div>
      <div class="field"><span>Worden je vaste lasten al voor je betaald?</span><select id="ob-fixed">${opt([['', '—'], ['ja', 'Ja'], ['nee', 'Nee'], ['weet niet', 'Weet ik niet']], d.fixedPaid)}</select></div>
      <div class="field"><span>Krijg je alle toeslagen waar je recht op hebt?</span><select id="ob-toeslag">${opt([['', '—'], ['ja', 'Ja'], ['nee', 'Nee'], ['weet niet', 'Weet ik niet']], d.toeslagen)}</select></div>
      <div class="field"><span>Komen er rekeningen die je niet kunt betalen?</span><select id="ob-bills">${opt([['', '—'], ['nee', 'Nee'], ['ja', 'Ja']], d.newBills)}</select></div>
    </div>` : `<div class="card"><h2>1. Wie speelt er?</h2>
      <div class="field"><span>Je naam</span><input id="ob-name" value="${esc(s.name)}" placeholder="Bijv. Tim" autocomplete="given-name"></div>
      <div class="field"><span>Salaris komt binnen op de</span><span class="inline"><input id="ob-payday" type="number" min="1" max="31" value="${s.payday}" style="width:64px">e</span></div>
      <div class="field"><span>Ik spaar samen met iemand</span><label class="switch"><input type="checkbox" id="ob-together" ${s.together ? 'checked' : ''}><i></i></label></div>
      <div id="ob-partner" ${s.together ? '' : 'hidden'}>
        <div class="field"><span>Naam van de ander</span><input id="ob-pname" value="${esc(s.partnerName)}" placeholder="Bijv. Lisa"></div>
        <div class="field"><span>Mijn deel van het sparen</span><span class="inline"><input id="ob-share" type="number" min="1" max="99" value="${s.myShare}" style="width:64px">%</span></div>
      </div>
    </div>`;
  return `<button class="back-link" id="ob-back">‹ Andere keuze</button>
  <div class="hero">${heroArt(debt ? 2 : 1, null)}</div>
  <h1 class="big-title">${debt ? 'Stap voor stap vooruit' : 'Maak van sparen een spel'}</h1>
  <p class="lead">${debt ? 'Elke week dat je rondkomt van je leefgeld is een overwinning. Salaryman helpt je het overzicht te houden.' : 'Elke euro die je niet uitgeeft, is gratis geld voor later. Laad elke week je bankexport en zie of je gewonnen hebt.'}</p>
  ${who}
  <div class="card"><h2>2. Laad je bankexport</h2>
    <div class="field"><span>Bank</span>${bankSelect('ob-bank')}</div>
    <div class="field" id="ob-other" ${BANKS.includes(state.lastBank) ? 'hidden' : ''}><span>Naam bank</span><input id="ob-bankname" value="${BANKS.includes(state.lastBank) ? '' : esc(state.lastBank)}" placeholder="Naam van je bank"></div>
    <p class="small muted">Exporteer je transacties als CSV via de website of app van je bank, liefst 12 maanden. Open het bestand niet eerst in Excel. Meer rekeningen? Laad ze één voor één.</p>
    <label class="btn primary block" for="csvInput">CSV kiezen</label>
    <button class="btn ghost block" id="demoBtn">Eerst proberen met demodata</button>
  </div>
  <p class="small muted center">🔒 Alles blijft op dit apparaat. Rekeningnummers worden niet bewaard.</p>`;
}
function saveOnboarding() {
  const s = state.settings, $ = (id) => document.getElementById(id);
  if (!$('ob-name')) return;
  s.name = $('ob-name').value.trim();
  if (isDebt()) {
    const d = s.debt;
    d.leefgeld = Math.max(0, Number($('ob-leefgeld').value) || 0);
    d.leefDay = Number($('ob-leefday').value);
    d.traject = $('ob-traject').value; d.fixedPaid = $('ob-fixed').value; d.toeslagen = $('ob-toeslag').value; d.newBills = $('ob-bills').value;
  } else {
    s.payday = clamp(Number($('ob-payday').value) || 25, 1, 31);
    s.together = $('ob-together').checked;
    s.partnerName = $('ob-pname').value.trim();
    s.myShare = clamp(Number($('ob-share').value) || 50, 1, 99);
  }
  const b = $('ob-bank').value;
  state.lastBank = b === 'Andere bank' ? ($('ob-bankname').value.trim() || 'Andere bank') : b;
  save();
}
function bindOnboarding() {
  const $ = (id) => document.getElementById(id);
  document.querySelectorAll('[data-mode]').forEach(b => b.onclick = () => { state.settings.mode = b.dataset.mode; save(); render(); window.scrollTo(0, 0); });
  if (!$('ob-name')) return;
  $('ob-back').onclick = () => { saveOnboarding(); state.settings.mode = ''; save(); render(); };
  if ($('ob-together')) $('ob-together').onchange = () => { $('ob-partner').hidden = !$('ob-together').checked; saveOnboarding(); };
  $('ob-bank').onchange = () => { $('ob-other').hidden = $('ob-bank').value !== 'Andere bank'; saveOnboarding(); };
  document.querySelectorAll('#view input, #view select').forEach(el => { if (!el.onchange) el.onchange = saveOnboarding; });
  $('demoBtn').onclick = () => { saveOnboarding(); loadDemo(); };
}

/* ---------- kolomkoppeling voor onbekende bestanden ---------- */
function mappingView() {
  const { res, bank } = ui.pending;
  const sample = res.sample || [];
  const body = sample.slice(res.header ? 1 : 0);
  const n = Math.max(0, ...sample.map(r => r.length));
  const ex = body[0] || sample[0] || [];
  const guess = guessColumns(body);
  const colOpts = (sel) => `<option value="-1">— geen —</option>` + Array.from({ length: n }, (_, i) => `<option value="${i}" ${i === sel ? 'selected' : ''}>Kolom ${i + 1}: ${esc(String(ex[i] || '').slice(0, 22))}</option>`).join('');
  const roles = [['date', 'Datum'], ['amount', 'Bedrag'], ['name', 'Naam winkel / persoon'], ['desc', 'Omschrijving'], ['cd', 'Af/Bij (alleen als het bedrag geen min heeft)'], ['own', 'Je eigen rekeningnummer']];
  return `<div class="card"><h2>🧩 Help me dit bestand te lezen</h2>
    <p class="small muted" style="margin-top:0">${esc(bank)} gebruikt een indeling die ik nog niet ken. Kies welke kolom wat is; ik onthoud het voor de volgende keer.</p>
    <div class="sample">${sample.slice(0, 4).map(r => `<div>${r.map(c => `<span>${esc(String(c).slice(0, 16))}</span>`).join('')}</div>`).join('')}</div>
    ${roles.map(([k, l]) => `<div class="field"><span>${l}</span><select data-map="${k}">${colOpts(guess[k])}</select></div>`).join('')}
    <div class="row-btns"><button class="btn ghost" id="mapCancel">Annuleren</button><button class="btn primary" id="mapOk">Inlezen</button></div>
  </div>`;
}
function guessColumns(rows) {
  const n = Math.max(0, ...rows.map(r => r.length)), g = { date: -1, amount: -1, name: -1, desc: -1, cd: -1, own: -1 };
  const score = (test) => { let best = -1, bs = 0; for (let i = 0; i < n; i++) { const s = rows.filter(r => test(String(r[i] || ''))).length; if (s > bs) { bs = s; best = i; } } return bs >= Math.max(1, rows.length / 2) ? best : -1; };
  g.date = score(v => !!parseDate(v));
  // Bedrag: kolom met geldbedragen die het meest verschillen (een saldo- of limietkolom is vaak overal gelijk).
  { let best = -1, bs = -1; for (let i = 0; i < n; i++) { const vals = rows.map(r => String(r[i] || '').trim()); const ok = vals.filter(v => /^[+-]?\d{1,3}([.,]?\d{3})*[.,]\d{2}$/.test(v)); if (ok.length < Math.max(1, rows.length / 2)) continue; const sc = new Set(ok).size + (ok.some(v => v.startsWith('-')) ? rows.length : 0); if (sc > bs) { bs = sc; best = i; } } g.amount = best; }
  g.own = score(v => /^[A-Z]{2}\d{2}[A-Z0-9]{8,}$/.test(iban(v)));
  g.cd = score(v => /^(af|bij|d|c|debet|credit)$/i.test(v.trim()));
  // Tekstkolommen (geen rekeningnummers): de kortste wordt de naam, de langste de omschrijving.
  const text = [];
  for (let i = 0; i < n; i++) {
    if ([g.date, g.amount, g.own, g.cd].includes(i)) continue;
    const vals = rows.map(r => String(r[i] || '').trim()).filter(Boolean);
    if (vals.length < rows.length / 2 || vals.every(v => /^[A-Z]{2}\d{2}[A-Z0-9]{8,}$/.test(iban(v)))) continue;
    const letters = vals.join('').replace(/[^a-zà-ÿ]/gi, '').length;
    if (letters / Math.max(1, vals.join('').length) < 0.5) continue;
    text.push({ i, len: vals.join('').length / vals.length, uniq: new Set(vals).size });
  }
  text.sort((a, b) => b.len - a.len);
  g.desc = text.length ? text[0].i : -1;
  // Een naamkolom alleen als er een tweede tekstkolom met wisselende waarden is; anders haal ik de naam uit de omschrijving.
  const alt = text.slice(1).find(t => t.uniq > 1);
  g.name = alt ? alt.i : -1;
  return g;
}
function bindMapping() {
  document.getElementById('mapCancel').onclick = () => { ui.pending = null; render(); };
  document.getElementById('mapOk').onclick = () => {
    const cols = { method: -1, cp: -1 };
    document.querySelectorAll('[data-map]').forEach(s => { cols[s.dataset.map] = Number(s.value); });
    if (cols.date < 0 || cols.amount < 0) { toast('Kies in elk geval de datum en het bedrag.'); return; }
    const { text, bank, res } = ui.pending;
    state.mappings[bank] = { delim: res.delim, header: false, cols, nameFromDesc: cols.name < 0 };
    let out = parseBankFile(text, bank);
    if (!out.needsMapping && res.header) out.rows = out.rows.filter(r => r.date);
    if (out.needsMapping) { delete state.mappings[bank]; toast('Daar kon ik nog geen transacties uit halen. Check de kolommen.'); return; }
    ui.pending = null;
    const r = mergeRows(out, bank, 0, 0, 0);
    finishImport(r.added, r.total, r.newAcc);
  };
}

/* ---------- vaste kaartjes ---------- */
function isStandalone() { return window.navigator.standalone === true || (window.matchMedia && matchMedia('(display-mode: standalone)').matches); }
function daysSince(iso) { return iso ? Math.round((dateOf(todayIso()) - dateOf(iso)) / DAY) : Infinity; }
function topCards() {
  let html = '';
  if (state.demo) html += `<div class="banner">🎮 Je speelt met demodata. <button class="link-btn" id="stopDemo">Stoppen en terug naar start</button></div>`;
  const sw = streakWarning();
  if (sw) html += `<div class="card quest"><h2>⏳ Nog ${sw} ${sw === 1 ? 'dag' : 'dagen'} om je 🔥 streak te redden</h2><p class="small muted" style="margin:0">Je hebt deze maand nog niets geladen. Eén CSV deze maand is genoeg.</p><label class="btn primary block" for="csvInput">CSV laden</label></div>`;
  return html;
}
function infoCards() {
  let html = '';
  const dis = state.dismissed;
  if (!state.demo && !isStandalone() && !dis.homescreen) html += `<div class="card tip"><h2>📲 Zet Salaryman op je beginscherm</h2><p class="small muted" style="margin:0">Alleen dan blijven je gegevens bewaard; Safari kan websitegegevens na een tijdje wissen. Tik op de deelknop en kies <b>Zet op beginscherm</b>.</p><button class="link-btn" data-dismiss="homescreen">Begrepen</button></div>`;
  if (!state.demo && !state.calendarAdded && !dis.calendar) html += `<div class="card tip"><h2>📅 Herinnering in je agenda</h2><p class="small muted" style="margin:0">Elke zaterdag en zondag een seintje voor je weekronde. Zo blijft alles 100% op je eigen telefoon.</p><div class="row-btns"><button class="btn small" id="calBtn">Toevoegen</button><button class="btn small ghost" data-dismiss="calendar">Later</button></div></div>`;
  const firstUp = state.uploads.slice().sort()[0];
  if (!state.demo && state.tx.length && daysSince(state.lastBackup) > 30 && (state.uploads.length >= 2 || daysSince(firstUp) >= 7)) html += `<div class="card tip"><h2>💾 Tijd voor een back-up</h2><p class="small muted" style="margin:0">${state.lastBackup ? `Je laatste back-up is van ${daysSince(state.lastBackup)} dagen geleden.` : 'Je hebt nog geen back-up.'} Bewaar hem ergens veilig, dan raak je niets kwijt als je telefoon stukgaat.</p><button class="btn small" data-backup="1" style="margin-top:10px">Back-up maken</button></div>`;
  return html;
}
function heroBlock() {
  const g = game(), s = state.settings, cl = climb();
  const lvlPct = clamp((g.xp - g.cur) / Math.max(1, g.next - g.cur), 0, 1);
  const from = state.demo ? Math.max(0, cl.step - 3) : (state.lastClimb == null ? Math.max(0, cl.step - 2) : state.lastClimb);
  return `<div class="hero">${heroArt(cl.step, cl.last, from)}
    <div class="hero-hud">
      <div class="lvl"><span class="lvl-n">${g.level}</span><div><b>${esc(g.title)}</b><span>${s.name ? esc(s.name) + ' · ' : ''}${num(g.xp)} XP</span></div></div>
      <div class="chips"><span class="chip streak" title="Weken op rij gewonnen">🔥 ${g.streak}</span><span class="chip coins" title="Punten">🪙 ${num(g.coins)}</span></div>
    </div>
    <div class="xpbar"><div style="width:${Math.round(lvlPct * 100)}%"></div><span>${num(g.next - g.xp)} XP tot level ${g.level + 1}</span></div>
  </div>`;
}
function newAccountCards() {
  let html = '';
  for (const [key, a] of Object.entries(state.accounts).filter(([, a]) => a.type === 'nieuw')) {
    html += `<div class="card quest"><h2>🏦 Nieuwe rekening gevonden</h2><p class="small muted" style="margin-top:0">${esc(a.bank || 'Bank')}${a.last4 && a.last4 !== a.bank ? ', eindigt op ' + esc(a.last4) : ''}. Wat voor rekening is dit?</p>
      <div class="row-btns three"><button class="btn" data-acctset="${key}" data-type="eigen">Eigen</button><button class="btn" data-acctset="${key}" data-type="samen">Samen</button><button class="btn" data-acctset="${key}" data-type="spaar">Spaar</button></div>
      <p class="small muted" style="margin-bottom:0">Samen = gezamenlijke rekening; jouw deel stel je in bij Instellen (standaard 50%). Spaar = de rekening waar je spaargeld op staat.</p></div>`;
  }
  return html;
}
function teaserCards() {
  let html = '';
  const debt = isDebt();
  const lastM = debt ? null : completeMonths().slice(-1)[0];
  if (lastM && !state.seen[lastM]) {
    const r = monthResult(lastM);
    html += `<button class="card result-teaser ${r.outcome}" data-goto="uitslag" data-kind="month" data-month="${lastM}"><span class="t-icon">📊</span><span><b>De maanduitslag van ${monthName(lastM)} is binnen</b><br><span class="small">Tik en bekijk hoe je ervoor staat</span></span><span class="t-go">›</span></button>`;
  }
  const lastW = completeWeeks().slice(-1)[0];
  if (lastW && !state.seenWeeks[lastW]) {
    const r = weekResult(lastW);
    html += `<button class="card result-teaser ${debt ? 'win' : r.outcome}" data-goto="uitslag" data-kind="week" data-week="${lastW}"><span class="t-icon">${r.outcome === 'win' ? '🏁' : debt ? '🌱' : '🏁'}</span><span><b>Je weekuitslag van week ${weekNo(lastW)} is binnen</b><br><span class="small">Tik en kijk of je gewonnen hebt</span></span><span class="t-go">›</span></button>`;
  }
  return html;
}
function unknownCard() {
  const unknown = unknownParties();
  if (!unknown.length) return '';
  const opts = CATS.filter(c => c.id !== 'inkomen').map(c => `<option value="${c.id}">${c.icon} ${esc(c.name)}</option>`).join('');
  return `<div class="card quest"><h2>❓ Wat is dit?<span class="sub">${unknown.length} onbekend</span></h2>
    <p class="small muted" style="margin-top:0">Kies een categorie, dan onthoud ik het.</p>
    ${unknown.slice(0, 4).map(u => `<div class="tx"><div class="n">${esc(u.t.name || u.t.desc || 'Onbekend')}</div><div class="a">−${fmt(u.total / u.n)}</div>
      <div class="m">${u.joint ? '<span class="pill">samen</span> ' : ''}${u.n > 1 ? u.n + '× · ' : ''}${esc(u.t.desc || u.t.method || '')}</div>
      <select data-tx="${u.t.id}" aria-label="Categorie"><option value="" selected>Kies…</option>${opts}</select></div>`).join('')}
  </div>`;
}
function weekCard() {
  const ws = currentWeek(), r = weekStats(ws), wb = weeklyBudget(), debt = isDebt();
  const left = wb - r.spend, d = new Date(), daysLeft = 7 - ((d.getDay() + 6) % 7);
  const pct = wb > 0 ? clamp(r.spend / wb, 0, 1) : 0;
  const cls = left >= 0 ? (pct > 0.85 ? 'warn' : 'good') : (debt ? 'warn' : 'bad');
  return `<div class="card"><h2>${debt ? '💚' : '🗓️'} Week ${weekNo(ws)}<span class="sub">${weekRange(ws)} · loopt nog</span></h2>
    <div class="week-big"><span class="${left >= 0 ? 'good-t' : debt ? 'warn-t' : 'bad-t'}">${left >= 0 ? fmt(left) : '−' + fmt(-left)}</span><small>${left >= 0 ? 'nog te besteden deze week' : debt ? 'over je weekbudget, morgen weer een nieuwe dag' : 'boven je weekbudget'}</small></div>
    <div class="bar"><div class="${cls}" style="width:${Math.round(pct * 100)}%"></div></div>
    <p class="small muted" style="margin:6px 0 0">${fmt(r.spend)} van ${fmt(wb)} ${debt ? 'leefgeld' : 'vrije uitgaven'} · nog ${daysLeft} ${daysLeft === 1 ? 'dag' : 'dagen'}${left > 0 ? ` · ${fmt(left / daysLeft)} per dag` : ''}</p>
    <h3 class="sub-h">Weekmissies</h3>${weekMissions(ws).map(missionRow).join('')}
  </div>`;
}

/* ---------- Spel (beginscherm) ---------- */
function playView() {
  if (isDebt()) return debtPlayView();
  const k = currentMonth();
  let html = topCards() + heroBlock() + newAccountCards() + teaserCards() + unknownCard() + infoCards();
  const pd = paydayInfo();
  html += `<div class="card payday">
    <div class="pd-count"><span class="pd-n">${pd.daysLeft}</span><span>${pd.daysLeft === 1 ? 'dag' : 'dagen'} tot salaris</span></div>
    <div class="pd-body"><div class="pd-big ${pd.perDay >= 0 ? 'good-t' : 'bad-t'}">${pd.perDay >= 0 ? fmt(pd.perDay) : '−' + fmt(-pd.perDay)}<small> per dag</small></div>
      <div class="small muted">${pd.left >= 0 ? `nog ${fmt(pd.left)} vrij te besteden` : `${fmt(-pd.left)} te veel uitgegeven`}, na ${fmt(pd.reserve)} sparen</div></div>
    <div class="pd-bar"><div style="width:${Math.round(pd.progress * 100)}%"></div></div>
    ${pd.stale > 3 ? `<p class="small muted" style="margin:8px 0 0">Je export loopt tot ${pd.stale} dagen geleden. Laad een nieuwe CSV voor de actuele stand.</p>` : ''}
  </div>`;
  html += weekCard();
  html += `<div class="card"><h2>🏆 Maandmissie ${monthName(k)}<span class="sub">${completeMonths().includes(k) ? 'afgelopen' : 'loopt nog'}</span></h2>${missionsFor(k).map(missionRow).join('')}<p class="small muted" style="margin:8px 0 0">Vaste lasten tellen mee in de maanduitslag; de weekrondes kijken alleen naar je vrije uitgaven.</p></div>`;
  html += ringCard(k) + goalsCard();
  const alerts = alertsFor(k);
  if (alerts.length) html += `<div class="card"><h2>⚠️ Let op</h2>${alerts.map(a => `<div class="alert ${a.lvl}"><span class="dot"></span><div>${a.html}</div></div>`).join('')}</div>`;
  html += budgetCard(k) + jointCard(k);
  return html;
}
function debtPlayView() {
  let html = topCards() + heroBlock() + newAccountCards() + teaserCards() + infoCards();
  const li = leefgeldInfo();
  html += `<div class="card payday">
    <div class="pd-count"><span class="pd-n">${li.daysLeft}</span><span>${li.daysLeft === 1 ? 'dag' : 'dagen'} tot je leefgeld</span></div>
    <div class="pd-body"><div class="pd-big ${li.left >= 0 ? 'good-t' : 'warn-t'}">${li.left >= 0 ? fmt(li.perDay) : fmt(0)}<small> per dag</small></div>
      <div class="small muted">${li.left >= 0 ? `nog ${fmt(li.left)} van je ${fmt(li.amount)} leefgeld` : `${fmt(-li.left)} meer uitgegeven dan je leefgeld; geeft niks, volgende week weer kansen`}</div></div>
    <div class="pd-bar"><div style="width:${Math.round(li.progress * 100)}%"></div></div>
    ${li.stale > 3 ? `<p class="small muted" style="margin:8px 0 0">Je export loopt tot ${li.stale} dagen geleden. Laad een nieuwe CSV voor de actuele stand.</p>` : ''}
  </div>`;
  html += weekCard() + unknownCard();
  const g = game(), good = g.weeks.filter(w => w.outcome === 'win').length;
  if (g.weeks.length) html += `<div class="card cheer"><h2>🌟 Dit heb je al bereikt</h2><div class="cheer-grid"><div><b>${good}</b><span>${good === 1 ? 'week' : 'weken'} rondgekomen</span></div><div><b>${g.weeks.length}</b><span>weken bijgehouden</span></div><div><b>${g.best}</b><span>beste reeks</span></div></div></div>`;
  html += `<div class="card"><h2>🧭 Jouw plan</h2><ol class="plan">${debtPlan().map(p => `<li>${p}</li>`).join('')}</ol><p class="small muted" style="margin:6px 0 0">Antwoorden aanpassen kan bij Instellen.</p></div>`;
  html += helpCard();
  return html;
}
function helpCard() {
  return `<div class="card help"><h2>🤝 Hulp die gratis is</h2><p class="small muted" style="margin-top:0">Je hoeft het niet alleen te doen. Deze organisaties helpen je kosteloos verder.</p>
    ${HELP.map(h => `<div class="help-row"><span class="h-icon">${h.icon}</span><span><b>${h.url ? `<a href="${h.url}" target="_blank" rel="noopener">${esc(h.name)}</a>` : esc(h.name)}</b><br><span class="small muted">${esc(h.what)}</span></span></div>`).join('')}
  </div>`;
}
function missionRow(m) {
  let pct, sub, cls = '';
  const debt = isDebt();
  if (m.count) { pct = m.done ? 1 : 0; sub = m.done ? 'nog niks impulsiefs gekocht' : `${m.cur} ${m.cur === 1 ? 'grote losse aankoop' : 'grote losse aankopen'}`; cls = m.done ? 'good' : debt ? 'warn' : 'bad'; }
  else if (m.invert) { const overBy = m.cur - m.max; pct = overBy > 0 ? 1 : clamp(m.cur / Math.max(1, m.max), 0, 1); sub = overBy > 0 ? `${fmt(overBy)} over de grens` : `nog ${fmt(m.max - m.cur)} ruimte`; cls = overBy > 0 ? (debt ? 'warn' : 'bad') : pct > 0.85 ? 'warn' : 'good'; }
  else { pct = m.max > 0 ? clamp(m.cur / m.max, 0, 1) : 0; sub = `${fmt(m.cur)} van ${fmt(m.max)}`; cls = m.done ? 'good' : 'gold'; }
  return `<div class="mission ${m.done ? 'done' : ''}"><span class="m-icon">${m.done ? '✅' : m.icon}</span>
    <div class="m-body"><div class="top-line"><span>${esc(m.name)}</span><span class="xp">+${m.xp} XP</span></div>
    <div class="bar"><div class="${cls}" style="width:${Math.round(pct * 100)}%"></div></div><div class="small muted">${sub}</div></div></div>`;
}

function ringCard(k) {
  const st = stats(k), inc = incomeFor(k), net = inc.value - st.spend, p = plan();
  const spentPct = inc.value > 0 ? Math.min(1, st.spend / inc.value) : (st.spend > 0 ? 1 : 0);
  const savePct = p.mine > 0 ? clamp(net / p.mine, 0, 1) : 0;
  const R1 = 74, R2 = 56, C1 = 2 * Math.PI * R1, C2 = 2 * Math.PI * R2, good = net >= p.mine;
  const ring = (r, c, pct, color) => `<circle cx="85" cy="85" r="${r}" fill="none" stroke="var(--soft)" stroke-width="13"/><circle cx="85" cy="85" r="${r}" fill="none" stroke="${color}" stroke-width="13" stroke-linecap="round" stroke-dasharray="${(c * pct).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 85 85)"/>`;
  return `<div class="card ringcard">
    <svg viewBox="0 0 170 170" role="img" aria-label="Uitgaven en sparen deze maand">${ring(R1, C1, spentPct, 'var(--pink)')}${ring(R2, C2, savePct, good ? 'var(--green)' : 'var(--gold)')}
      <text x="85" y="84" text-anchor="middle" class="c1" fill="${net >= 0 ? 'var(--green)' : 'var(--red)'}">${(net >= 0 ? '+' : '−') + fmt(Math.abs(net)).replace(/ /g, '')}</text>
      <text x="85" y="103" text-anchor="middle" class="c2">over in ${monthName(k)}</text></svg>
    <div class="ringleg">
      <div><i style="background:var(--pink)"></i>Uitgegeven<b>${fmt(st.spend)} <span class="muted small">van ${fmt(inc.value)}${inc.expected ? '*' : ''}</span></b></div>
      <div><i style="background:${good ? 'var(--green)' : 'var(--gold)'}"></i>Spaardoel${state.settings.together ? ' (jouw deel)' : ''}<b>${fmt(Math.max(0, net))} <span class="muted small">van ${fmt(p.mine)}</span></b></div>
      ${inc.expected ? '<div class="muted small">* salaris nog niet in je export; ik reken met je gewone salaris</div>' : ''}
    </div></div>`;
}
function goalsCard() {
  const s = state.settings, p = plan(), pot = potNow(), ps = pot.ps, now = todayKey();
  const vals = ps.proj.concat(ps.actual.map(a => a.v));
  const hi = Math.max(...vals, s.potStart), lo = Math.min(...vals), span = Math.max(1, hi - lo);
  const max = hi + span * 0.15, min = Math.max(0, lo - span * 0.25), W = 340, H = 120;
  const x = (i) => 10 + i * (W - 20) / Math.max(1, ps.months.length - 1);
  const y = (v) => H - (v - min) / (max - min) * (H - 10);
  let svg = `<svg class="chart" viewBox="0 0 ${W} ${H + 18}" role="img" aria-label="Verloop van de pot">`;
  svg += `<line x1="10" x2="${W - 10}" y1="${y(s.potStart)}" y2="${y(s.potStart)}" stroke="var(--gold)" stroke-opacity=".35" stroke-dasharray="2 5"/>`;
  svg += `<polyline fill="none" stroke="var(--purple)" stroke-width="2" stroke-dasharray="5 5" points="${ps.proj.map((v, i) => x(i) + ',' + y(v)).join(' ')}"/>`;
  if (ps.actual.length > 1) svg += `<polyline fill="none" stroke="var(--gold)" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round" points="${ps.actual.map(a => x(a.i) + ',' + y(a.v)).join(' ')}"/>`;
  const la = ps.actual[ps.actual.length - 1];
  if (la) svg += `<circle cx="${x(la.i)}" cy="${y(la.v)}" r="6" fill="var(--gold)" stroke="#fff6c9" stroke-width="2"/>`;
  ps.months.forEach((m, i) => { if (i % 2 === 0 || i === ps.months.length - 1) svg += `<text x="${x(i)}" y="${H + 14}" text-anchor="middle">${monthShort(m)}</text>`; });
  svg += '</svg>';
  const goals = s.goals.slice().sort((a, b) => a.month.localeCompare(b.month)).map((g, i) => {
    const done = g.month < now;
    return `<div class="goal-lvl ${done ? 'done' : ''}"><span class="gl-n">${done ? '✓' : i + 1}</span><span class="gl-name">${esc(g.name)}<small>${monthLabel(g.month)} · ${g.source === 'pot' ? 'uit de pot' : 'uit sparen'}</small></span><b>${fmt(g.amount)}</b></div>`;
  }).join('');
  const who = s.together ? `jij ${fmt(p.mine)} + ${esc(s.partnerName || 'partner')} ${fmt(p.partner)}` : fmt(p.mine);
  return `<div class="card"><h2>🏆 De pot<span class="sub">doel ${fmt(s.potStart)} in ${monthLabel(s.planEnd)}</span></h2>
    <div class="pot-now"><span class="pot-v">${fmt(pot.value)}</span><span class="small muted">per maand nodig: ${who}</span></div>
    ${svg}<div class="legend"><span><i style="background:var(--gold)"></i>Werkelijk</span><span><i style="background:var(--purple)"></i>Plan</span></div>
    <h3 class="sub-h">Levels om vrij te spelen</h3><div class="goal-levels">${goals}</div></div>`;
}
function budgetCard(k) {
  const st = stats(k), b = budgets();
  const rows = OUT_CATS.map(c => ({ c, spent: st.byCat[c.id], bud: b[c.id] })).filter(r => r.spent > 0.5 || r.bud > 0).sort((a, b) => b.spent - a.spent);
  return `<div class="card"><h2>📊 Budget<span class="sub">gewone maand uit je laatste ${recentComplete().length} mnd</span></h2>` + (rows.map(({ c, spent, bud }) => {
    const r = bud > 0 ? spent / bud : (spent > 0 ? 2 : 0);
    const cls = bud <= 0 ? 'warn' : r > 1.05 ? 'bad' : (r > 0.9 && !c.fixed) ? 'warn' : '';
    return `<div class="brow"><div class="top-line"><span>${c.icon} ${esc(c.name)}</span><span class="amt ${cls}">${fmt(spent)} / ${bud > 0 ? fmt(bud) : '–'}</span></div><div class="bar"><div class="${cls}" style="width:${Math.min(100, Math.round(r * 100))}%"></div></div></div>`;
  }).join('') || '<p class="muted small">Nog geen uitgaven deze maand.</p>') + `</div>`;
}
function jointCard(k) {
  const j = jointAnalysis(); if (!j || !j.months) return '';
  let now = 0; for (const t of txOfMonth(k)) if (isJoint(t) && category(t) === 'boodschappen') now -= t.amount;
  const target = j.advicePP * 2, r = target > 0 ? now / target : 0, cls = r > 1 ? 'bad' : r > 0.85 ? 'warn' : 'good', bal = j.avgDeposits - j.avgOut;
  const pn = esc(state.settings.partnerName || 'je partner');
  return `<div class="card"><h2>👫 Samen: boodschappen<span class="sub">${j.months} mnd</span></h2>
    <div class="brow"><div class="top-line"><span>Deze maand samen</span><span class="amt ${cls === 'good' ? '' : cls}">${fmt(now)} / ${fmt(target)}</span></div><div class="bar"><div class="${cls}" style="width:${Math.min(100, Math.round(r * 100))}%"></div></div></div>
    <div class="field" style="margin-top:10px"><span>Gewone maand</span><b>${fmt(j.median)}</b></div>
    <div class="field"><span>Duurste / goedkoopste</span><b>${fmt(j.high)} / ${fmt(j.low)}</b></div>
    <div class="field"><span>Advies storten (jij en ${pn})</span><b class="good-t">${fmt(j.advicePP)} p.p.</b></div>
    <p class="small muted" style="margin:8px 0 0">Dekt 3 van de 4 maanden zonder bijstorten. Gemiddeld komt er ${fmt(j.avgDeposits)} per maand binnen en gaat er ${fmt(j.avgOut)} uit: ${bal >= 0 ? `${fmt(bal)} over` : `${fmt(-bal)} tekort`}.</p></div>`;
}

/* ---------- Transacties ---------- */
function monthNav() {
  const all = monthsWithData(), i = all.indexOf(ui.month);
  return `<div class="month"><button data-nav="-1" aria-label="Vorige maand" ${i <= 0 ? 'disabled' : ''}>‹</button>
    <div class="label"><span class="cap">${monthLabel(ui.month)}</span>${!completeMonths().includes(ui.month) ? ' <span class="pill">loopt nog</span>' : ''}</div>
    <button data-nav="1" aria-label="Volgende maand" ${i >= all.length - 1 ? 'disabled' : ''}>›</button></div>`;
}
function txView() {
  const q = ui.q.toLowerCase();
  const list = txOfMonth(ui.month).filter(t => !q || (t.name + ' ' + t.desc).toLowerCase().includes(q)).sort((a, b) => b.date.localeCompare(a.date) || a.amount - b.amount);
  const opts = (sel) => CATS.map(c => `<option value="${c.id}" ${c.id === sel ? 'selected' : ''}>${c.icon} ${esc(c.name)}</option>`).join('');
  let html = monthNav();
  html += `<input class="search" type="search" placeholder="Zoek op naam of omschrijving" value="${esc(ui.q)}" id="search">`;
  html += `<p class="small muted" style="margin:0 0 10px">Categorie fout? Kies de juiste; dat geldt dan voor alle betalingen aan dezelfde partij.</p>`;
  html += `<div class="card">` + (list.map(t => {
    const c = category(t), d = t.date.split('-'), a = acct(t);
    const tag = isSavings(t) ? '<span class="pill">spaar</span> ' : isJoint(t) ? '<span class="pill">samen</span> ' : '';
    return `<div class="tx"><div class="n">${esc(t.name || t.desc || 'Onbekend')}</div>
      <div class="a ${t.amount > 0 ? 'in' : ''}">${t.amount > 0 ? '+' : '−'}${fmt2(Math.abs(t.amount))}</div>
      <div class="m">${tag}${Number(d[2])} ${MONTHS_SHORT[Number(d[1]) - 1]} · ${esc(t.desc || t.method || (a ? a.bank : ''))}</div>
      ${isSavings(t) ? '<span class="pill gold">telt voor de pot</span>' : `<select data-tx="${t.id}" aria-label="Categorie">${opts(c)}</select>`}</div>`;
  }).join('') || '<p class="muted small">Geen transacties gevonden.</p>') + `</div>`;
  return html;
}

/* ---------- Uitslag ---------- */
function resultView() {
  const debt = isDebt(), kind = debt ? 'week' : (ui.resultKind || 'week');
  const seg = debt ? '' : `<div class="seg"><button data-rkind="week" class="${kind === 'week' ? 'on' : ''}">Weken</button><button data-rkind="month" class="${kind === 'month' ? 'on' : ''}">Maanden</button></div>`;
  return seg + (kind === 'week' ? weekResultView() : monthResultView());
}
function confettiHtml() { return '<div class="confetti">' + Array.from({ length: 26 }, (_, n) => `<i style="left:${(n * 37) % 100}%;animation-delay:${((n % 9) * 0.13).toFixed(2)}s;background:${['var(--gold)', 'var(--pink)', 'var(--cyan)', 'var(--green)', 'var(--purple)'][n % 5]}"></i>`).join('') + '</div>'; }
function weekResultView() {
  const done = completeWeeks(), debt = isDebt();
  if (!done.length) return `<div class="card center"><h2>Nog geen weekuitslag</h2><p class="muted">Zodra er een hele week in je export zit, verschijnt hier je eerste uitslag.</p></div>`;
  const ws = ui.resultWeek && done.includes(ui.resultWeek) ? ui.resultWeek : done[done.length - 1];
  if (!state.seenWeeks[ws]) { state.seenWeeks[ws] = true; save(); }
  const r = weekResult(ws), i = done.indexOf(ws), b = budgets();
  const head = debt
    ? { win: ['🌟', 'TOPWEEK', 'Je bent rondgekomen van je leefgeld!'], draw: ['💪', 'BIJNA', 'Net iets meer dan je leefgeld. Je zit er heel dicht bij!'], lose: ['🌱', 'NIEUWE KANS', 'Deze week was lastig. Volgende week begin je gewoon opnieuw.'] }[r.outcome]
    : { win: ['🏁', 'GEWONNEN', 'Je bleef onder je weekbudget!'], draw: ['🤝', 'GELIJKSPEL', `Net ${fmt(r.spend - r.budget)} boven je weekbudget`], lose: ['💥', 'VERLOREN', `${fmt(r.spend - r.budget)} boven je weekbudget`] }[r.outcome];
  const heroCls = debt && r.outcome !== 'win' ? 'calm' : r.outcome;
  let html = `<div class="month"><button data-wnav="${done[i - 1] || ''}" ${i <= 0 ? 'disabled' : ''} aria-label="Vorige week">‹</button><div class="label">Week ${weekNo(ws)}<br><span class="small muted">${weekRange(ws)}</span></div><button data-wnav="${done[i + 1] || ''}" ${i >= done.length - 1 ? 'disabled' : ''} aria-label="Volgende week">›</button></div>`;
  html += `<div class="result-hero ${heroCls}">${r.outcome === 'win' ? confettiHtml() : ''}<div class="rh-icon">${head[0]}</div><div class="rh-title">${head[1]}</div>
    <div class="rh-pts">${r.pts >= 0 ? '+' : '−'}${num(Math.abs(r.pts))} punten</div><div class="rh-sub">${head[2]}</div></div>`;
  html += `<div class="card"><h2>✨ Wat ging goed</h2><ul class="good-list">${weekHighlights(ws).map(h => `<li>${esc(h.charAt(0).toUpperCase() + h.slice(1))}</li>`).join('')}</ul></div>`;
  const cats = FREE_CATS.map(c => ({ c, spent: r.st.byCat[c.id], share: debt ? 0 : (b[c.id] || 0) * 12 / 52 })).filter(x => x.spent > 0.5).sort((a, b) => b.spent - a.spent);
  html += `<div class="card"><h2>🧾 Waar ging je geld heen</h2><p class="small muted" style="margin-top:0">${fmt(r.spend)} van ${fmt(r.budget)} ${debt ? 'leefgeld' : 'weekbudget'}</p>${cats.map(x => {
    const ratio = x.share > 0 ? x.spent / x.share : 0, cls = !debt && ratio > 1.1 ? 'bad' : '';
    return `<div class="brow"><div class="top-line"><span>${x.c.icon} ${esc(x.c.name)}</span><span class="amt ${cls}">${fmt(x.spent)}${x.share > 0 ? ' / ' + fmt(x.share) : ''}</span></div><div class="bar"><div class="${cls}" style="width:${Math.round(clamp(x.share > 0 ? ratio : x.spent / Math.max(1, r.budget), 0, 1) * 100)}%"></div></div></div>`;
  }).join('') || '<p class="muted small">Geen vrije uitgaven deze week.</p>'}</div>`;
  html += `<div class="card"><h2>🧮 Zo kwam je aan je punten</h2>${r.lines.map(l => `<div class="pline ${l.ok ? 'ok' : l.bad ? 'bad' : ''}"><span>${esc(l.label)}</span><b>${l.pts >= 0 ? '+' : '−'}${num(Math.abs(l.pts))}</b></div>`).join('')}
    <div class="pline total"><span>Totaal</span><b>${r.pts >= 0 ? '+' : '−'}${num(Math.abs(r.pts))}</b></div></div>`;
  html += `<div class="card coach"><h2>🧠 Volgende week</h2><p style="margin:0;line-height:1.5">${weekTip(ws)}</p></div>`;
  html += `<button class="btn primary block" data-share-week="${ws}">📤 Deel je weekuitslag</button>`;
  html += `<div class="card" style="margin-top:14px"><h2>📅 Vorige weken</h2><div class="history">${done.slice(-16).reverse().map(w => { const x = weekResult(w); const ic = debt ? (x.outcome === 'win' ? '🌟' : '🌱') : (x.outcome === 'win' ? '🏁' : x.outcome === 'draw' ? '🤝' : '💥'); return `<button class="hist ${debt && x.outcome !== 'win' ? 'calm' : x.outcome} ${w === ws ? 'on' : ''}" data-wnav="${w}"><span>${ic}</span><b>wk ${weekNo(w)}</b><small>${x.pts >= 0 ? '+' : '−'}${num(Math.abs(x.pts))}</small></button>`; }).join('')}</div></div>`;
  return html;
}
function weekTip(ws) {
  const r = weekResult(ws), b = budgets(), debt = isDebt(), g = game();
  if (r.outcome === 'win') return debt ? `Wat goed! Je streak staat op ${g.streak} ${g.streak === 1 ? 'week' : 'weken'}. Houd dit ritme vast: elke week een beetje vooruit.` : `Ga zo door. Je streak staat op ${g.streak} ${g.streak === 1 ? 'week' : 'weken'}; alles wat je onder je budget blijft, gaat naar je pot.`;
  if (debt) {
    const sup = superSaving(ws.slice(0, 7));
    return 'Maak aan het begin van de week een boodschappenlijstje en kijk eerst wat er nog in huis is. ' + (sup.names.length ? `Doe je boodschappen bij Lidl of Dirk in plaats van ${sup.names.join(' en ')}, ` : 'Dirk, Nettorama en Lidl zijn het voordeligst, ') + 'dat scheelt elke week.';
  }
  const worst = FREE_CATS.map(c => ({ c, over: r.st.byCat[c.id] - (b[c.id] || 0) * 12 / 52 })).sort((a, b) => b.over - a.over)[0];
  if (worst && worst.over > 5) return `Houd <b>${esc(worst.c.name)}</b> volgende week onder ${fmt((b[worst.c.id] || 0) * 12 / 52)}; deze week ging je er ${fmt(worst.over)} overheen. Dan win je de volgende ronde.`;
  return `Je zat ${fmt(r.spend - r.budget)} boven je weekbudget. Plan een paar dagen zonder losse aankopen, dan maak je het volgende week goed.`;
}
function monthResultView() {
  const done = completeMonths();
  if (!done.length) return `<div class="card center"><h2>Nog geen maanduitslag</h2><p class="muted">Zodra er een hele maand in je export zit, verschijnt hier je eerste uitslag.</p></div>`;
  const k = ui.resultMonth && done.includes(ui.resultMonth) ? ui.resultMonth : done[done.length - 1];
  if (!state.seen[k]) { state.seen[k] = true; save(); }
  const r = monthResult(k), c = coach(k), i = done.indexOf(k);
  const head = { win: ['📈', 'DOEL GEHAALD', 'Je spaardoel voor deze maand is binnen!'], draw: ['🤝', 'BIJNA', `Je hield geld over, maar ${fmt(r.target - r.net)} te weinig voor je doel`], lose: ['📉', 'VOLGENDE MAAND BETER', `Je gaf ${fmt(-r.net)} meer uit dan er binnenkwam`] }[r.outcome];
  let html = `<div class="month"><button data-rnav="${done[i - 1] || ''}" ${i <= 0 ? 'disabled' : ''} aria-label="Vorige maand">‹</button><div class="label"><span class="cap">${monthLabel(k)}</span></div><button data-rnav="${done[i + 1] || ''}" ${i >= done.length - 1 ? 'disabled' : ''} aria-label="Volgende maand">›</button></div>`;
  html += `<div class="result-hero ${r.outcome}"><div class="rh-icon">${head[0]}</div><div class="rh-title">${head[1]}</div>
    <div class="rh-pts">${r.pts >= 0 ? '+' : '−'}${num(Math.abs(r.pts))} punten</div><div class="rh-sub">${head[2]}</div></div>`;
  if (r.weeks.length) {
    const max = Math.max(1, ...r.weeks.map(w => Math.max(w.spend, w.budget))) * 1.15, W = 320, H = 130, n = r.weeks.length, bw = Math.min(46, W / n * 0.55);
    const y = (v) => H - v / max * H;
    let svg = `<svg class="chart" viewBox="0 0 ${W} ${H + 22}" role="img" aria-label="Vrije uitgaven per week tegenover het weekbudget">`;
    r.weeks.forEach((w, j) => { const x = (j + 0.5) * W / n - bw / 2; svg += `<rect x="${x}" y="${y(w.spend)}" width="${bw}" height="${H - y(w.spend)}" rx="6" fill="${w.spend <= w.budget ? 'var(--green)' : 'var(--red)'}" opacity="${w.spend <= w.budget ? 1 : .8}"/><text x="${x + bw / 2}" y="${H + 16}" text-anchor="middle">wk ${weekNo(w.ws)}</text>`; });
    svg += `<line x1="0" x2="${W}" y1="${y(r.weeks[0].budget)}" y2="${y(r.weeks[0].budget)}" stroke="var(--text)" stroke-opacity=".5" stroke-dasharray="6 6"/></svg>`;
    html += `<div class="card"><h2>📊 Je weken</h2>${svg}<p class="small muted" style="margin:6px 0 0">Vrije uitgaven per week; de stippellijn is je weekbudget.</p></div>`;
  }
  const hl = highlights(k);
  if (hl.length) html += `<div class="card"><h2>✨ Wat ging goed</h2><ul class="good-list">${hl.map(h => `<li>${esc(h.charAt(0).toUpperCase() + h.slice(1))}</li>`).join('')}</ul></div>`;
  html += `<div class="card"><h2>🧮 Zo kwam je aan je punten</h2>${r.lines.map(l => `<div class="pline ${l.ok ? 'ok' : l.bad ? 'bad' : ''}"><span>${esc(l.label)}</span><b>${l.pts >= 0 ? '+' : '−'}${num(Math.abs(l.pts))}</b></div>`).join('')}
    <div class="pline total"><span>Totaal</span><b>${r.pts >= 0 ? '+' : '−'}${num(Math.abs(r.pts))}</b></div><p class="small muted" style="margin:8px 0 0">De punten van je weekrondes komen hier nog bovenop.</p></div>`;
  html += `<div class="card coach"><h2>🧠 Coach</h2>
    ${c.findings.length ? `<p class="small muted" style="margin:0 0 4px">Waar ging het geld heen?</p>${c.findings.map(f => `<div class="alert warn"><span class="dot"></span><div>${f}</div></div>`).join('')}` : ''}
    <p class="small muted" style="margin:12px 0 6px">${c.gap > 0 ? `Zo haal je de ${fmt(c.gap)} weer in:` : 'Zo scoor je volgende maand nog hoger:'}</p>
    <ol class="plan">${c.actions.map(a => `<li>${a}</li>`).join('')}</ol></div>`;
  html += `<button class="btn primary block" data-share-month="${k}">📤 Deel je maanduitslag</button>`;
  html += `<div class="card" style="margin-top:14px"><h2>📅 Alle maanden</h2><div class="history">${done.slice().reverse().map(m => { const x = monthResult(m); return `<button class="hist ${x.outcome} ${m === k ? 'on' : ''}" data-rnav="${m}"><span>${x.outcome === 'win' ? '📈' : x.outcome === 'draw' ? '🤝' : '📉'}</span><b>${monthShort(m)}</b><small>${x.pts >= 0 ? '+' : '−'}${num(Math.abs(x.pts))}</small></button>`; }).join('')}</div></div>`;
  return html;
}

/* ---------- Beloningen ---------- */
function rewardList() { return isDebt() ? state.rewardsDebt : state.rewards; }
function rewardsView() {
  const g = game(), bs = badges(), debt = isDebt();
  let html = `<div class="coins-hero"><span class="ch-icon">🪙</span><div><div class="ch-n">${num(g.coins)}</div><div class="small">punten om uit te geven</div></div></div>`;
  const gs = state.settings.gameStart;
  html += `<div class="card"><h2>🎁 ${debt ? 'Gratis beloningen' : 'Beloningswinkel'}</h2><p class="small muted" style="margin-top:0">${debt ? 'Beloningen die niets kosten, maar wel goed voelen. Je verdient ze met elke week die je bijhoudt.' : 'Win punten en wissel ze in voor een beloning die je jezelf geeft. Je kiest ze zelf.'}${gs && !state.demo ? ` Punten tellen vanaf ${monthLabel(gs)}; eerdere weken tellen alleen voor je level.` : ''}</p>
    ${rewardList().map(r => `<div class="reward"><span class="rw-icon">${esc(r.icon || '🎁')}</span><span class="rw-name">${esc(r.name)}<small>${num(r.cost)} punten</small></span>
      <button class="btn small ${g.coins >= r.cost ? 'primary' : 'locked'}" data-redeem="${r.id}">${g.coins >= r.cost ? 'Inwisselen' : `nog ${num(r.cost - g.coins)}`}</button>
      <button class="del" data-rdel="${r.id}" aria-label="Verwijder beloning">×</button></div>`).join('')}
    <div class="add-reward"><input id="rw-name" placeholder="${debt ? 'Bijv. avondje film thuis' : 'Eigen beloning, bijv. sneakers'}"><input id="rw-cost" type="number" min="50" step="50" placeholder="Punten"><button class="btn small" id="rw-add" aria-label="Beloning toevoegen">+</button></div></div>`;
  html += `<div class="card"><h2>🏅 Badges<span class="sub">${bs.filter(b => b.got).length} van ${bs.length}</span></h2><div class="badges">${bs.map(b => `<div class="badge ${b.got ? 'got' : ''}"><span>${b.icon}</span><b>${esc(b.name)}</b><small>${esc(b.how)}</small></div>`).join('')}</div></div>`;
  if (state.redeemed.length) html += `<div class="card"><h2>🧾 Ingewisseld</h2>${state.redeemed.slice().reverse().map(r => `<div class="pline"><span>${esc(r.name)} <span class="muted small">${esc(r.date)}</span></span><b>−${num(r.cost)}</b></div>`).join('')}</div>`;
  html += debt ? `<div class="card"><h2>📜 Spelregels</h2><ul class="rules small">
    <li>Elke week is een nieuwe ronde. Rondgekomen van je leefgeld = topweek (+30).</li>
    <li>Elke € 5 die je overhoudt = 1 extra punt. Je verliest nooit punten.</li>
    <li>Week bijgehouden = +10, ook als het een lastige week was.</li>
    <li>Je streak telt topweken op rij. Laad elke maand minstens één keer een CSV, anders begint je streak opnieuw.</li></ul></div>`
    : `<div class="card"><h2>📜 Spelregels</h2><ul class="rules small">
    <li>Elke week is een ronde over je vrije uitgaven. Onder je weekbudget = gewonnen (+30), elke € 5 eronder +1.</li>
    <li>Boven je weekbudget kost punten; weekmissies leveren extra op.</li>
    <li>Elke maand: spaardoel gehaald = +100, € 10 overgehouden = 1 punt. Vaste lasten tellen in de maand.</li>
    <li>Je 🔥 streak telt gewonnen weken op rij. Laad je een hele kalendermaand niets, dan begint hij opnieuw.</li>
    <li>Te laat geladen? Gemiste weken tellen alsnog mee voor je punten.</li></ul></div>`;
  return html;
}

/* ---------- Instellingen ---------- */
function settingsView() {
  const s = state.settings, b = budgets(), p = plan(), d = s.debt, debt = isDebt();
  const accs = Object.entries(state.accounts).map(([key, a]) => `<div class="field acc"><span>${esc(acctLabel(a))}</span>
      <span class="inline"><select data-acct="${key}" data-f="type">${a.type === 'nieuw' ? '<option value="nieuw" selected>Kies…</option>' : ''}<option value="eigen" ${a.type === 'eigen' ? 'selected' : ''}>Eigen</option><option value="samen" ${a.type === 'samen' ? 'selected' : ''}>Samen</option><option value="spaar" ${a.type === 'spaar' ? 'selected' : ''}>Spaar</option></select>
      ${a.type === 'samen' ? `<input data-acct="${key}" data-f="share" type="number" min="1" max="100" value="${a.share}" style="width:58px" aria-label="Jouw deel in procent">%` : ''}</span></div>`).join('');
  const goals = s.goals.map(g => `<div class="goal" data-goal="${g.id}"><input data-f="name" value="${esc(g.name)}" aria-label="Naam doel"><input data-f="amount" type="number" inputmode="decimal" min="0" step="50" value="${Number(g.amount)}" aria-label="Bedrag">
      <div class="row2"><input data-f="month" type="month" value="${esc(g.month)}" aria-label="Maand"><select data-f="source" aria-label="Betalen uit"><option value="pot" ${g.source === 'pot' ? 'selected' : ''}>uit de pot</option><option value="sparen" ${g.source === 'sparen' ? 'selected' : ''}>uit sparen</option></select><button class="del" data-del="${g.id}" aria-label="Verwijder doel">×</button></div></div>`).join('');
  const player = debt ? `<div class="card"><h2>👤 Jij</h2>
    <div class="field"><span>Naam</span><input data-s="name" value="${esc(s.name)}"></div>
    <div class="field"><span>Leefgeld per week</span><span class="inline">€<input data-d="leefgeld" type="number" inputmode="decimal" min="0" step="5" value="${d.leefgeld}" style="width:84px"></span></div>
    <div class="field"><span>Leefgeld komt op</span><select data-d="leefDay">${opt(WEEKDAYS.map((n, i) => [i, n]), d.leefDay)}</select></div>
    <div class="field"><span>Hulp</span><select data-d="traject">${opt([['', 'Nog niet'], ['schuldhulp', 'Schuldhulp gemeente'], ['wsnp', 'Schuldsanering (Wsnp)'], ['budgetbeheer', 'Budgetbeheer'], ['bewind', 'Beschermingsbewind'], ['anders', 'Iets anders']], d.traject)}</select></div>
    <div class="field"><span>Vaste lasten al voor je betaald</span><select data-d="fixedPaid">${opt([['', '—'], ['ja', 'Ja'], ['nee', 'Nee'], ['weet niet', 'Weet ik niet']], d.fixedPaid)}</select></div>
    <div class="field"><span>Alle toeslagen</span><select data-d="toeslagen">${opt([['', '—'], ['ja', 'Ja'], ['nee', 'Nee'], ['weet niet', 'Weet ik niet']], d.toeslagen)}</select></div>
    <div class="field"><span>Rekeningen die je niet kunt betalen</span><select data-d="newBills">${opt([['', '—'], ['nee', 'Nee'], ['ja', 'Ja']], d.newBills)}</select></div></div>`
    : `<div class="card"><h2>👤 Speler</h2>
    <div class="field"><span>Naam</span><input data-s="name" value="${esc(s.name)}"></div>
    <div class="field"><span>Salaris op de</span><span class="inline"><input data-s="payday" type="number" min="1" max="31" value="${s.payday}" style="width:64px">e</span></div>
    <div class="field"><span>Samen sparen</span><label class="switch"><input type="checkbox" data-s="together" ${s.together ? 'checked' : ''}><i></i></label></div>
    ${s.together ? `<div class="field"><span>Met</span><input data-s="partnerName" value="${esc(s.partnerName)}"></div>
    <div class="field"><span>Mijn deel van het sparen</span><span class="inline"><input data-s="myShare" type="number" min="1" max="99" value="${s.myShare}" style="width:64px">%</span></div>` : ''}</div>`;
  return `<div class="card"><h2>🎮 Spelmodus</h2><div class="field"><span>Ik speel om</span><select id="modeSel">${opt([['sparen', 'te sparen'], ['schulden', 'rond te komen']], s.mode || 'sparen')}</select></div></div>
  ${player}
  <div class="card"><h2>🏦 Rekeningen</h2><p class="small muted" style="margin-top:0">Eigen telt helemaal mee. Van Samen telt jouw deel. Spaar telt niet als uitgave.</p>${accs || '<p class="small muted">Nog geen rekeningen.</p>'}
    ${accs ? `<div class="field"><span>Laadkosten auto helemaal voor mij</span><label class="switch"><input type="checkbox" id="chargeFull" ${s.chargeFull ? 'checked' : ''}><i></i></label></div>` : ''}
    <div class="field"><span>Bank van de volgende CSV</span>${bankSelect('set-bank')}</div>
    <div class="field" id="set-other" ${BANKS.includes(state.lastBank) ? 'hidden' : ''}><span>Naam bank</span><input id="set-bankname" value="${BANKS.includes(state.lastBank) ? '' : esc(state.lastBank)}"></div>
    <label class="btn block" for="csvInput" style="margin-top:10px">CSV laden</label></div>
  ${debt ? '' : `<div class="card"><h2>🎯 Spaarplan</h2>
    <div class="field"><span>Startbedrag pot</span><input data-s="potStart" type="number" inputmode="decimal" value="${s.potStart}"></div>
    <div class="field"><span>Plan start</span><input data-s="planStart" type="month" value="${s.planStart}"></div>
    <div class="field"><span>Pot weer vol in</span><input data-s="planEnd" type="month" value="${s.planEnd}"></div>
    <p class="small muted">Nodig per maand: <b>${fmt(p.perMonth)}</b>${s.together ? ` (jij ${fmt(p.mine)}, ${esc(s.partnerName || 'partner')} ${fmt(p.partner)})` : ''}.</p>
    <h3 class="sub-h">Doelen · totaal ${fmt(p.total)}</h3>${goals}<button class="btn small" id="addGoal" style="margin-top:10px">+ Doel</button></div>
  <div class="card"><h2>📊 Budgetten<span class="sub">leeg = automatisch</span></h2><p class="small muted" style="margin-top:0">Weekbudget voor je vrije uitgaven: <b>${fmt(weeklyBudget())}</b>.</p>${OUT_CATS.map(c => `<div class="field"><span>${c.icon} ${esc(c.name)}</span><input type="number" inputmode="decimal" data-budget="${c.id}" placeholder="${b[c.id]}" value="${s.budgets[c.id] != null ? s.budgets[c.id] : ''}"></div>`).join('')}</div>
  <div class="card"><h2>⚠️ Waarschuwingen</h2>
    <div class="field"><span>Grote uitgave vanaf % inkomen</span><input data-s="bigPct" type="number" min="1" max="50" value="${s.bigPct}"></div>
    <div class="field"><span>en minimaal</span><input data-s="bigMin" type="number" min="0" step="10" value="${s.bigMin}"></div></div>`}
  <div class="card"><h2>📅 Herinnering in je agenda</h2><p class="small muted" style="margin-top:0">Elke zaterdag en zondag om 19:00 een seintje voor je weekronde. Zo blijft alles 100% op je eigen telefoon.</p><button class="btn small" id="calBtn">${state.calendarAdded ? 'Opnieuw toevoegen' : 'Toevoegen aan agenda'}</button></div>
  <div class="card"><h2>💾 Gegevens</h2><p class="small muted" style="margin-top:0">${state.tx.length} transacties op dit apparaat${state.demo ? ' (demo)' : ''}. Laatste back-up: ${state.lastBackup ? esc(state.lastBackup) : 'nog nooit'}. Niets gaat het internet op.</p>
    <div class="row-btns wrap"><button class="btn small" id="exportBtn">Back-up maken</button><label class="btn small" for="restoreInput">Back-up terugzetten</label><input type="file" id="restoreInput" accept=".json,application/json" hidden>${state.demo ? '<button class="btn small" id="stopDemo">Demo stoppen</button>' : ''}<button class="btn small danger" id="wipeBtn">Alles wissen</button></div></div>
  <p class="small muted center">Salaryman · supermarkttips: Consumentenbond-prijsmeting mei 2026</p>`;
}

/* ---------- events ---------- */
function bind() {
  const $ = (id) => document.getElementById(id);
  document.querySelectorAll('[data-nav]').forEach(b => b.onclick = () => { const all = monthsWithData(); const i = all.indexOf(ui.month) + Number(b.dataset.nav); if (all[i]) { ui.month = all[i]; render(); } });
  document.querySelectorAll('[data-rnav]').forEach(b => b.onclick = () => { if (b.dataset.rnav) { ui.resultMonth = b.dataset.rnav; render(); window.scrollTo(0, 0); } });
  document.querySelectorAll('[data-goto]').forEach(b => b.onclick = () => { ui.tab = b.dataset.goto; ui.resultMonth = b.dataset.month || null; render(); window.scrollTo(0, 0); });
  document.querySelectorAll('[data-acctset]').forEach(b => b.onclick = () => { state.accounts[b.dataset.acctset].type = b.dataset.type; save(); toast('Rekening ingesteld'); render(); });
  const search = $('search');
  if (search) search.oninput = () => { ui.q = search.value; const pos = search.selectionStart; render(); const s2 = $('search'); s2.focus(); s2.setSelectionRange(pos, pos); };
  document.querySelectorAll('select[data-tx]').forEach(sel => sel.onchange = () => {
    if (!sel.value) return;
    const t = state.tx.find(x => x.id === sel.dataset.tx);
    setCategory(t, sel.value);
    toast(`${t.name || 'Deze betaling'} → ${CAT[sel.value].name}`);
    render();
  });
  document.querySelectorAll('[data-s]').forEach(el => el.onchange = () => {
    const k = el.dataset.s, s = state.settings;
    if (el.type === 'checkbox') s[k] = el.checked;
    else if (el.type === 'number') { if (el.value === '') return; s[k] = Number(el.value); }
    else { if (el.type === 'month' && !el.value) return; s[k] = el.value; }
    if (k === 'payday') s.payday = clamp(s.payday, 1, 31);
    if (k === 'myShare') s.myShare = clamp(s.myShare, 1, 99);
    save(); render();
  });
  document.querySelectorAll('[data-acct]').forEach(el => el.onchange = () => {
    const a = state.accounts[el.dataset.acct];
    if (el.dataset.f === 'type') a.type = el.value; else a.share = clamp(Number(el.value) || 50, 1, 100);
    save(); render();
  });
  const cf = $('chargeFull'); if (cf) cf.onchange = () => { state.settings.chargeFull = cf.checked; save(); render(); };
  const sb = $('set-bank'); if (sb) sb.onchange = () => { $('set-other').hidden = sb.value !== 'Andere bank'; state.lastBank = sb.value === 'Andere bank' ? ($('set-bankname').value.trim() || 'Andere bank') : sb.value; save(); };
  const sbn = $('set-bankname'); if (sbn) sbn.onchange = () => { state.lastBank = sbn.value.trim() || 'Andere bank'; save(); };
  document.querySelectorAll('.goal [data-f]').forEach(el => el.onchange = () => {
    const g = state.settings.goals.find(x => x.id === el.closest('.goal').dataset.goal);
    const f = el.dataset.f; g[f] = f === 'amount' ? Number(el.value || 0) : el.value; save(); render();
  });
  document.querySelectorAll('[data-del]').forEach(b => b.onclick = () => { state.settings.goals = state.settings.goals.filter(g => g.id !== b.dataset.del); save(); render(); });
  const add = $('addGoal'); if (add) add.onclick = () => { state.settings.goals.push({ id: 'g' + Date.now(), name: 'Nieuw doel', amount: 1000, month: addMonths(todayKey(), 3), source: 'sparen' }); save(); render(); };
  document.querySelectorAll('[data-budget]').forEach(el => el.onchange = () => { if (el.value === '') delete state.settings.budgets[el.dataset.budget]; else state.settings.budgets[el.dataset.budget] = Number(el.value); save(); render(); });
  document.querySelectorAll('[data-redeem]').forEach(b => b.onclick = () => {
    const r = state.rewards.find(x => x.id === b.dataset.redeem), g = game();
    if (g.coins < r.cost) { toast(`Nog ${num(r.cost - g.coins)} punten sparen voor ${r.name}`); return; }
    if (!confirm(`${r.name} inwisselen voor ${num(r.cost)} punten?`)) return;
    state.redeemed.push({ name: r.name, cost: r.cost, date: isoDay(new Date()) }); save(); toast(`🎉 ${r.name} verdiend! Geniet ervan.`); render();
  });
  document.querySelectorAll('[data-rdel]').forEach(b => b.onclick = () => { state.rewards = state.rewards.filter(r => r.id !== b.dataset.rdel); save(); render(); });
  const rwa = $('rw-add'); if (rwa) rwa.onclick = () => {
    const name = $('rw-name').value.trim(), cost = Number($('rw-cost').value);
    if (!name || !(cost > 0)) { toast('Vul een naam en het aantal punten in.'); return; }
    state.rewards.push({ id: 'r' + Date.now(), name, cost: Math.round(cost), icon: '🎁' }); save(); render();
  };
  const ex = $('exportBtn'); if (ex) ex.onclick = () => {
    const blob = new Blob([JSON.stringify(state)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'salaryman-backup-' + new Date().toISOString().slice(0, 10) + '.json'; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };
  const ri = $('restoreInput'); if (ri) ri.onchange = async () => {
    try { const data = JSON.parse(await ri.files[0].text()); if (!Array.isArray(data.tx)) throw new Error(); localStorage.setItem(STORE_KEY, JSON.stringify(data)); state = load(); ui.month = null; toast('Back-up teruggezet'); render(); }
    catch (e) { toast('Dit is geen geldige back-up.'); }
  };
  bindExtra();
  const wipe = null; if (wipe) wipe.onclick = () => { if (!confirm('Alle transacties, punten en instellingen van dit apparaat wissen?')) return; localStorage.removeItem(STORE_KEY); state = load(); ui = { tab: 'spel', month: null, q: '', resultMonth: null, pending: null }; render(); };
}

/* ---------- extra events ---------- */
function exportBackup() {
  state.lastBackup = todayIso(); save();
  const blob = new Blob([JSON.stringify(state)], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'salaryman-backup-' + todayIso() + '.json'; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  toast('Back-up gemaakt. Bewaar hem ergens veilig.');
}
function bindExtra() {
  const $ = (id) => document.getElementById(id);
  // Poppetje loopt van zijn vorige plek naar de nieuwe: omhoog na winst, omlaag na een slechte week.
  const cp = document.querySelector('.climber-pos[data-tx]');
  if (cp) requestAnimationFrame(() => requestAnimationFrame(() => {
    cp.style.transform = `translate(${cp.dataset.tx}px,${cp.dataset.ty}px)`;
    if (!state.demo && state.lastClimb !== Number(cp.dataset.step)) { state.lastClimb = Number(cp.dataset.step); save(); }
  }));
  document.querySelectorAll('[data-goto]').forEach(b => b.onclick = () => {
    ui.tab = b.dataset.goto; ui.resultKind = b.dataset.kind || ui.resultKind;
    ui.resultMonth = b.dataset.month || null; ui.resultWeek = b.dataset.week || null;
    render(); window.scrollTo(0, 0);
  });
  document.querySelectorAll('[data-rkind]').forEach(b => b.onclick = () => { ui.resultKind = b.dataset.rkind; render(); });
  document.querySelectorAll('[data-wnav]').forEach(b => b.onclick = () => { if (b.dataset.wnav) { ui.resultWeek = b.dataset.wnav; render(); window.scrollTo(0, 0); } });
  document.querySelectorAll('[data-share-week]').forEach(b => b.onclick = () => shareWeek(b.dataset.shareWeek));
  document.querySelectorAll('[data-share-month]').forEach(b => b.onclick = () => shareMonth(b.dataset.shareMonth));
  document.querySelectorAll('[data-dismiss]').forEach(b => b.onclick = () => { state.dismissed[b.dataset.dismiss] = true; save(); render(); });
  document.querySelectorAll('[data-backup]').forEach(b => b.onclick = () => { exportBackup(); render(); });
  document.querySelectorAll('#stopDemo').forEach(b => b.onclick = stopDemo);
  const cal = $('calBtn'); if (cal) cal.onclick = () => { downloadCalendar(); render(); };
  const ex = $('exportBtn'); if (ex) ex.onclick = () => { exportBackup(); render(); };
  const ms = $('modeSel'); if (ms) ms.onchange = () => { state.settings.mode = ms.value; save(); toast(ms.value === 'schulden' ? 'Modus: rondkomen 🌱' : 'Modus: sparen 📈'); render(); };
  document.querySelectorAll('[data-d]').forEach(el => el.onchange = () => {
    const k = el.dataset.d, d = state.settings.debt;
    d[k] = el.type === 'number' ? Math.max(0, Number(el.value) || 0) : (k === 'leefDay' ? Number(el.value) : el.value);
    save(); render();
  });
  document.querySelectorAll('[data-redeem]').forEach(b => b.onclick = () => {
    const r = rewardList().find(x => x.id === b.dataset.redeem), g = game();
    if (g.coins < r.cost) { toast(`Nog ${num(r.cost - g.coins)} punten voor ${r.name}`); return; }
    if (!confirm(`${r.name} inwisselen voor ${num(r.cost)} punten?`)) return;
    state.redeemed.push({ name: r.name, cost: r.cost, date: todayIso() }); save(); toast(`🎉 ${r.name} verdiend! Geniet ervan.`); render();
  });
  document.querySelectorAll('[data-rdel]').forEach(b => b.onclick = () => {
    if (isDebt()) state.rewardsDebt = state.rewardsDebt.filter(r => r.id !== b.dataset.rdel); else state.rewards = state.rewards.filter(r => r.id !== b.dataset.rdel);
    save(); render();
  });
  const rwa = $('rw-add'); if (rwa) rwa.onclick = () => {
    const name = $('rw-name').value.trim(), cost = Number($('rw-cost').value);
    if (!name || !(cost > 0)) { toast('Vul een naam en het aantal punten in.'); return; }
    rewardList().push({ id: 'r' + Date.now(), name, cost: Math.round(cost), icon: '🎁' }); save(); render();
  };
  const wipe = $('wipeBtn'); if (wipe) wipe.onclick = () => {
    if (!confirm('Alle transacties, punten en instellingen van dit apparaat wissen?')) return;
    localStorage.removeItem(STORE_KEY); state = load(); ui = { tab: 'spel', month: null, q: '', resultMonth: null, resultWeek: null, resultKind: 'week', pending: null }; render();
  };
}

/* =========================================================
   Demodata
   ========================================================= */
function loadDemo() {
  const tx = []; let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const end = todayKey(), own = 'demo-own', joint = 'demo-joint', sav = 'demo-sav', debt = isDebt();
  const push = (acc, date, amount, name, desc, cp) => { const t = { id: hash('demo' + tx.length), date, amount: Math.round(amount * 100) / 100, name, desc, method: '', acct: acc }; if (cp) t.cp = cp; tx.push(t); };
  const todayD = todayIso();
  if (debt) {
    const leef = Number(state.settings.debt.leefgeld) || 75, dow = Number(state.settings.debt.leefDay) || 1;
    for (let dt = addDays(todayD, -120); dt <= todayD; dt = addDays(dt, 1)) {
      const day = dateOf(dt).getDay();
      if (day === dow) push(own, dt, leef, 'Bewindvoerder Demo', 'Leefgeld');
      if (day === 1 || day === 4) push(own, dt, -(leef * 0.22 + rnd() * leef * 0.12), rnd() < .6 ? 'Lidl Demo' : 'Dirk Demo', 'Betaalautomaat');
      if (day === 6) push(own, dt, -(leef * 0.15 + rnd() * leef * 0.2), rnd() < .5 ? 'Albert Heijn 1234' : 'Jumbo Demo', 'Betaalautomaat');
      if (day === 3 && rnd() < .5) push(own, dt, -(4 + rnd() * 8), 'Snackbar De Demo', 'Betaalautomaat');
      if (day === 5 && rnd() < .3) push(own, dt, -(10 + rnd() * 25), 'Action', 'Betaalautomaat');
    }
    state.accounts = { [own]: { last4: 'Demo', bank: 'Knab', type: 'eigen', share: 50 } };
  } else {
    const today = new Date().getDate();
    for (let i = 12; i >= 0; i--) {
      const k = addMonths(end, -i), day = (d) => k + '-' + String(d).padStart(2, '0'), last = i === 0 ? Math.min(28, today) : 28;
      const on = (d, f) => { if (last >= d) f(day(d)); };
      on(1, d => push(joint, d, -1420, 'Hypotheekbank Demo', 'Hypotheek'));
      on(2, d => push(joint, d, -185, 'Eneco', 'Termijnbedrag energie'));
      on(3, d => push(joint, d, -876, 'Demo Autolease', 'Auto incasso'));
      on(4, d => push(own, d, -138, 'Zilveren Kruis', 'Zorgverzekering'));
      on(7, d => push(joint, d, -17.99, 'Netflix', 'Abonnement'));
      on(8, d => push(own, d, -45, 'Odido', 'Mobiel'));
      on(25, d => push(own, d, 3250 + Math.round(rnd() * 400), 'Werkgever Demo BV', 'Salaris'));
      on(26, d => { push(own, d, -1600, 'Gezamenlijke rekening', 'Vaste lasten en boodschappen', joint); push(joint, d, 1600, 'Jij', 'Storting', own); push(joint, d, 1600, 'Partner', 'Storting'); });
      on(27, d => { push(own, d, -900, 'Spaarrekening', 'Sparen', sav); push(sav, d, 900, 'Jij', 'Storting', own); push(sav, d, 900, 'Partner', 'Storting'); });
      for (let d = 2; d <= last; d += 2) { const s = rnd(); push(joint, day(d), -(15 + rnd() * 40), s < 0.5 ? 'Albert Heijn 1234' : s < 0.8 ? 'Jumbo Demo' : 'Lidl Demo', 'Betaalautomaat'); }
      on(9, d => push(joint, d, -(25 + rnd() * 20), 'Shell Recharge', 'Laadsessie'));
      on(15, d => push(own, d, -(30 + rnd() * 50), 'Thuisbezorgd.nl', 'Bestelling'));
      on(19, d => push(own, d, -(20 + rnd() * 50), 'Restaurant De Demo', 'Betaalautomaat'));
      on(21, d => push(own, d, -(15 + rnd() * 60), 'Bol.com', 'Bestelling'));
      if (i % 3 === 1) on(11, d => push(own, d, -(150 + rnd() * 120), 'MediaMarkt Demo', 'Elektronica'));
      if (i === 5) on(14, d => push(own, d, -640, 'Kamera Express', 'Objectief'));
    }
    state.accounts = { [own]: { last4: 'Demo', bank: 'Knab', type: 'eigen', share: 50 }, [joint]: { last4: 'Demo', bank: 'Knab', type: 'samen', share: 50 }, [sav]: { last4: 'Demo', bank: 'Knab', type: 'spaar', share: 50 } };
  }
  state.tx = tx.filter(t => t.date <= todayD).sort((a, b) => a.date.localeCompare(b.date));
  state.uploads = [todayD];
  state.demo = true; state.settings.onboarded = true; state.settings.gameStart = ''; state.seen = {}; state.seenWeeks = {};
  save(); ui.month = null; ui.tab = 'spel'; toast('Demodata geladen. Veel speelplezier!'); render(); window.scrollTo(0, 0);
}

/* =========================================================
   Start
   ========================================================= */
document.getElementById('csvInput').onchange = (e) => { if (document.getElementById('ob-name')) saveOnboarding(); if (e.target.files.length) importFiles([...e.target.files]); e.target.value = ''; };
document.getElementById('tabs').onclick = (e) => { const b = e.target.closest('button[data-tab]'); if (b) { ui.tab = b.dataset.tab; ui.resultMonth = null; ui.resultWeek = null; render(); window.scrollTo(0, 0); } };
document.getElementById('brand').onclick = (e) => { e.preventDefault(); goHome(); };
// "Over Salaryman", privacy en voorwaarden: openen via de links onderaan of direct via #over, #privacybeleid of #voorwaarden.
(function aboutDialog() {
  const dlg = document.getElementById('about');
  const HASHES = { '#over': null, '#privacybeleid': 'privacybeleid', '#voorwaarden': 'voorwaarden', '#privacy': 'privacy' };
  const open = (focus) => {
    if (!dlg.open) { dlg.showModal ? dlg.showModal() : dlg.setAttribute('open', ''); }
    dlg.scrollTop = 0;
    const target = focus && document.getElementById(focus);
    if (target) setTimeout(() => target.scrollIntoView({ block: 'start' }), 30);
    const h = '#' + (focus === 'privacybeleid' || focus === 'voorwaarden' ? focus : 'over');
    if (location.hash !== h) history.replaceState(null, '', h);
  };
  const close = () => { if (dlg.open) dlg.close ? dlg.close() : dlg.removeAttribute('open'); };
  dlg.addEventListener('close', () => { if (location.hash in HASHES) history.replaceState(null, '', location.pathname + location.search); });
  document.querySelectorAll('[data-about]').forEach(a => a.onclick = (e) => { e.preventDefault(); open(a.dataset.about || null); });
  document.getElementById('aboutClose').onclick = close;
  document.getElementById('aboutStart').onclick = () => { close(); goHome(); };
  dlg.addEventListener('click', (e) => { if (e.target === dlg) close(); });
  const fromHash = () => { if (location.hash in HASHES) open(HASHES[location.hash]); };
  fromHash(); window.addEventListener('hashchange', fromHash);
})();

render();
if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
