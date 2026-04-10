/* ZELIFS v1 — multi-trip + always-visible summary + TR 2026 holidays in info card */

const STORAGE_KEY = "zelifs_v1_state";

/* --------- HOLIDAYS (TR 2026) --------- */
const TR_2026_HOLIDAYS = [
  { date: "2026-01-01", name_tr: "Yılbaşı", weight: 1 },
  { date: "2026-03-19", name_tr: "Ramazan Bayramı Arifesi", weight: 0.5 },
  { date: "2026-03-20", name_tr: "Ramazan Bayramı (1. Gün)", weight: 1 },
  { date: "2026-03-21", name_tr: "Ramazan Bayramı (2. Gün)", weight: 1 },
  { date: "2026-03-22", name_tr: "Ramazan Bayramı (3. Gün)", weight: 1 },
  { date: "2026-04-23", name_tr: "Ulusal Egemenlik ve Çocuk Bayramı", weight: 1 },
  { date: "2026-05-01", name_tr: "Emek ve Dayanışma Günü", weight: 1 },
  { date: "2026-05-19", name_tr: "Atatürk'ü Anma, Gençlik ve Spor Bayramı", weight: 1 },
  { date: "2026-05-26", name_tr: "Kurban Bayramı Arifesi", weight: 0.5 },
  { date: "2026-05-27", name_tr: "Kurban Bayramı (1. Gün)", weight: 1 },
  { date: "2026-05-28", name_tr: "Kurban Bayramı (2. Gün)", weight: 1 },
  { date: "2026-05-29", name_tr: "Kurban Bayramı (3. Gün)", weight: 1 },
  { date: "2026-05-30", name_tr: "Kurban Bayramı (4. Gün)", weight: 1 },
  { date: "2026-07-15", name_tr: "Demokrasi ve Millî Birlik Günü", weight: 1 },
  { date: "2026-08-30", name_tr: "Zafer Bayramı", weight: 1 },
  { date: "2026-10-28", name_tr: "Cumhuriyet Bayramı Arifesi", weight: 0.5 },
  { date: "2026-10-29", name_tr: "Cumhuriyet Bayramı", weight: 1 }
];

/* --------- HOLIDAY SHORT NAMES (for tighter table) --------- */
const HOLIDAY_SHORT = {
  "Yılbaşı": "Yılbaşı",
  "Ramazan Bayramı Arifesi": "Ramazan B. Arife",
  "Ramazan Bayramı (1. Gün)": "Ramazan B. (1)",
  "Ramazan Bayramı (2. Gün)": "Ramazan B. (2)",
  "Ramazan Bayramı (3. Gün)": "Ramazan B. (3)",
  "Ulusal Egemenlik ve Çocuk Bayramı": "23 Nisan",
  "Emek ve Dayanışma Günü": "1 Mayıs",
  "Atatürk'ü Anma, Gençlik ve Spor Bayramı": "19 Mayıs",
  "Kurban Bayramı Arifesi": "Kurban B. Arife",
  "Kurban Bayramı (1. Gün)": "Kurban B. (1)",
  "Kurban Bayramı (2. Gün)": "Kurban B. (2)",
  "Kurban Bayramı (3. Gün)": "Kurban B. (3)",
  "Kurban Bayramı (4. Gün)": "Kurban B. (4)",
  "Demokrasi ve Millî Birlik Günü": "15 Temmuz",
  "Zafer Bayramı": "30 Ağustos",
  "Cumhuriyet Bayramı Arifesi": "29 Ekim Arife",
  "Cumhuriyet Bayramı": "29 Ekim"
};

/* --------- ELEMENTS --------- */
const els = {
  // inputs
  dateOut: document.getElementById("dateOut"),
  dateIn: document.getElementById("dateIn"),
  outPretty: document.getElementById("outPretty"),
  inPretty: document.getElementById("inPretty"),

  // buttons
  btnTodayIn: document.getElementById("btnTodayIn"),
  btnAddTrip: document.getElementById("btnAddTrip"),
  btnClearInputs: document.getElementById("btnClearInputs"),
  btnClearAll: document.getElementById("btnClearAll"),

  // main calc
  daysValue: document.getElementById("daysValue"),
  statusBadge: document.getElementById("statusBadge"),
  errors: document.getElementById("errors"),

  // trips table
  tripCount: document.getElementById("tripCount"),
  tripsTbody: document.getElementById("tripsTbody"),
  emptyTrips: document.getElementById("emptyTrips"),

  // notes
  plusInput: document.getElementById("plusInput"),
  minusInput: document.getElementById("minusInput"),
  btnAddPlus: document.getElementById("btnAddPlus"),
  btnAddMinus: document.getElementById("btnAddMinus"),
  plusList: document.getElementById("plusList"),
  minusList: document.getElementById("minusList"),
  plusCount: document.getElementById("plusCount"),
  minusCount: document.getElementById("minusCount"),

  // summary
  summaryBadge: document.getElementById("summaryBadge"),
  sumTotalDays: document.getElementById("sumTotalDays"),
  sumLimit: document.getElementById("sumLimit"),
  sumLimitNote: document.getElementById("sumLimitNote"),
  sumTripCount: document.getElementById("sumTripCount"),
  sumRange: document.getElementById("sumRange"),
  sumRangeNote: document.getElementById("sumRangeNote"),
  sumTripsMeta: document.getElementById("sumTripsMeta"),
  sumTripsTbody: document.getElementById("sumTripsTbody"),
  sumTripsEmpty: document.getElementById("sumTripsEmpty"),
  sumPlusMeta: document.getElementById("sumPlusMeta"),
  sumMinusMeta: document.getElementById("sumMinusMeta"),
  sumPlusList: document.getElementById("sumPlusList"),
  sumMinusList: document.getElementById("sumMinusList"),

  // holidays
  holidayCount: document.getElementById("holidayCount"),
  holidaysTbody: document.getElementById("holidaysTbody"),
};

const state = {
  inputOut: "",
  inputIn: "",
  trips: [],   // { id, out, in }
  plus: [],    // { text, ts }
  minus: [],   // { text, ts }
};

init();

/* ---------------- INIT ---------------- */

function init() {
  loadState();

  els.dateOut.value = state.inputOut || "";
  els.dateIn.value = state.inputIn || "";

  renderHolidays();  // info card
  wire();
  renderAll();

  // UI: keep buttons readable on narrow screens (labels become shorter)
  setupResponsiveButtons();
  applyResponsiveButtons();
  window.addEventListener("resize", applyResponsiveButtons);
}

function setupResponsiveButtons() {
  // Store full labels + define short labels (for narrow widths)
  const mapping = {
    btnTodayIn: "Bugün",
    btnAddTrip: "Ekle",
    btnClearInputs: "Temizle",
    btnClearAll: "Sıfırla",
    btnAddPlus: "Ekle",
    btnAddMinus: "Ekle",
  };

  for (const [id, shortLabel] of Object.entries(mapping)) {
    const el = document.getElementById(id);
    if (!el) continue;
    if (!el.dataset.fullLabel) el.dataset.fullLabel = (el.textContent || "").trim();
    el.dataset.shortLabel = shortLabel;
  }
}

function applyResponsiveButtons() {
  const compact = window.innerWidth < 720;
  document.documentElement.classList.toggle("ui-compact", compact);

  const all = document.querySelectorAll("[data-full-label][data-short-label]");
  all.forEach((el) => {
    const full = el.dataset.fullLabel || "";
    const shortL = el.dataset.shortLabel || full;
    el.textContent = compact ? shortL : full;
  });
}

/* ---------------- WIRING ---------------- */

function wire() {
  els.dateOut.addEventListener("change", () => {
    state.inputOut = els.dateOut.value || "";
    saveState();
    renderInputsPretty();
    recalcTotal();
    renderSummary();
  });

  els.dateIn.addEventListener("change", () => {
    state.inputIn = els.dateIn.value || "";
    saveState();
    renderInputsPretty();
    recalcTotal();
    renderSummary();
  });

  els.btnTodayIn.addEventListener("click", () => {
    const iso = toISO(new Date());
    state.inputIn = iso;
    els.dateIn.value = iso;
    saveState();
    renderInputsPretty();
    recalcTotal();
    renderSummary();
  });

  els.btnAddTrip.addEventListener("click", () => {
    addTripFromInputs();
    renderSummary();
  });

  els.btnClearInputs.addEventListener("click", () => {
    state.inputOut = "";
    state.inputIn = "";
    els.dateOut.value = "";
    els.dateIn.value = "";
    saveState();
    renderInputsPretty();
    recalcTotal();
    renderSummary();
  });

  els.btnClearAll.addEventListener("click", () => {
    state.inputOut = "";
    state.inputIn = "";
    state.trips = [];
    state.plus = [];
    state.minus = [];

    els.dateOut.value = "";
    els.dateIn.value = "";
    els.plusInput.value = "";
    els.minusInput.value = "";

    saveState();
    renderAll();
  });

  els.btnAddPlus.addEventListener("click", () => {
    addNote("plus");
    renderSummary();
  });

  els.btnAddMinus.addEventListener("click", () => {
    addNote("minus");
    renderSummary();
  });

  els.plusInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      addNote("plus");
      renderSummary();
    }
  });

  els.minusInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      addNote("minus");
      renderSummary();
    }
  });

  // delete trip (delegation)
  els.tripsTbody.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-del]");
    if (!btn) return;

    const id = btn.getAttribute("data-del");
    state.trips = state.trips.filter(t => t.id !== id);
    saveState();

    renderTrips();
    recalcTotal();
    renderSummary();
  });
}

/* ---------------- RENDER ALL ---------------- */

function renderAll() {
  renderInputsPretty();
  renderTrips();
  recalcTotal();
  renderNotes();
  renderSummary();
}

/* ---------------- HOLIDAYS ---------------- */

function renderHolidays() {
  if (!els.holidaysTbody) return;

  const list = TR_2026_HOLIDAYS.slice().sort((a, b) => a.date.localeCompare(b.date));
  els.holidaysTbody.innerHTML = "";

  let totalWeight = 0;
  for (const h of list) {
    totalWeight += Number(h.weight || 0);

    const tr = document.createElement("tr");

    const tdDate = document.createElement("td");
    tdDate.textContent = prettyDateTR(h.date);

    const tdDay = document.createElement("td");
    tdDay.textContent = weekdayTR(h.date);

    const tdName = document.createElement("td");
    tdName.textContent = HOLIDAY_SHORT[h.name_tr] || h.name_tr;

    const tdW = document.createElement("td");
    tdW.textContent = String(h.weight);

    tr.appendChild(tdDate);
    tr.appendChild(tdDay);
    tr.appendChild(tdName);
    tr.appendChild(tdW);

    els.holidaysTbody.appendChild(tr);
  }

  if (els.holidayCount) {
    els.holidayCount.textContent = `${list.length} gün • toplam weight: ${totalWeight}`;
  }
}

/* ---------------- TRIPS ---------------- */

function addTripFromInputs() {
  clearErrors();

  const out = (state.inputOut || "").trim();
  const inn = (state.inputIn || "").trim();

  if (!out || !inn) {
    addInfo("Seyahat eklemek için hem çıkış hem dönüş tarihini seç.");
    return;
  }

  const outD = parseISO(out);
  const inD = parseISO(inn);

  if (!outD.ok) addWarn("Çıkış tarihi geçersiz.");
  if (!inD.ok) addWarn("Dönüş tarihi geçersiz.");
  if (!outD.ok || !inD.ok) return;

  const diff = daysBetweenUTC(out, inn);
  if (diff < 0) {
    addWarn("Dönüş tarihi, çıkış tarihinden önce olamaz.");
    return;
  }

  state.trips.push({ id: cryptoId(), out, in: inn });

  // clear inputs after add
  state.inputOut = "";
  state.inputIn = "";
  els.dateOut.value = "";
  els.dateIn.value = "";

  saveState();
  renderInputsPretty();
  renderTrips();
  recalcTotal();
  addOk("Seyahat eklendi.");
}

function renderTrips() {
  els.tripsTbody.innerHTML = "";

  const count = state.trips.length;
  els.tripCount.textContent = `${count} kayıt`;
  els.emptyTrips.style.display = count === 0 ? "block" : "none";

  for (const t of state.trips) {
    const days = safeDays(t.out, t.in);

    const tr = document.createElement("tr");

    const tdOut = document.createElement("td");
    tdOut.innerHTML = `${prettyDateTR(t.out)} <span class="mutedSmall">${weekdayTR(t.out)}</span>`;

    const tdIn = document.createElement("td");
    tdIn.innerHTML = `${prettyDateTR(t.in)} <span class="mutedSmall">${weekdayTR(t.in)}</span>`;

    const tdDays = document.createElement("td");
    tdDays.textContent = String(days);

    const tdAct = document.createElement("td");
    tdAct.style.textAlign = "right";
    tdAct.innerHTML = `<button class="iconBtn" type="button" data-del="${t.id}" title="Sil">Sil</button>`;

    tr.appendChild(tdOut);
    tr.appendChild(tdIn);
    tr.appendChild(tdDays);
    tr.appendChild(tdAct);

    els.tripsTbody.appendChild(tr);
  }
}

function recalcTotal() {
  clearErrors();

  const total = computeTotalDays(state.trips);
  els.daysValue.textContent = state.trips.length ? String(total) : "—";

  if (state.trips.length === 0) {
    setStatus("unknown", "Durum: —");
    return;
  }

  if (total <= 180) {
    setStatus("safe", "Durum: Güvende (≤ 180)");
    addOk("180 gün sınırı aşılmadı.");
  } else {
    setStatus("risk", "Durum: Riskli (> 180)");
    addWarn("180 gün sınırı aşıldı.");
  }
}

/* ---------------- INPUT PRETTY ---------------- */

function renderInputsPretty() {
  els.outPretty.textContent = state.inputOut
    ? `Seçim: ${prettyDateTR(state.inputOut)} • ${weekdayTR(state.inputOut)}`
    : "Seçim: —";

  els.inPretty.textContent = state.inputIn
    ? `Seçim: ${prettyDateTR(state.inputIn)} • ${weekdayTR(state.inputIn)}`
    : "Seçim: —";
}

/* ---------------- NOTES ---------------- */

function addNote(kind) {
  const input = kind === "plus" ? els.plusInput : els.minusInput;
  const text = (input.value || "").trim();
  if (!text) return;

  const entry = { text, ts: Date.now() };
  if (kind === "plus") state.plus.push(entry);
  else state.minus.push(entry);

  input.value = "";
  saveState();
  renderNotes();
}

function renderNotes() {
  renderNoteList("plus", state.plus, els.plusList, els.plusCount);
  renderNoteList("minus", state.minus, els.minusList, els.minusCount);
}

function renderNoteList(kind, arr, ul, countEl) {
  ul.innerHTML = "";
  countEl.textContent = `${arr.length} kayıt`;

  if (arr.length === 0) {
    ul.appendChild(makeEmptyNote(kind));
    return;
  }

  for (const n of arr) {
    ul.appendChild(makeNoteItem(kind, n.text, formatTS(n.ts)));
  }
}

function makeEmptyNote(kind) {
  const li = document.createElement("li");
  li.className = "noteItem";
  li.innerHTML = `
    <span class="noteTag ${kind}">${kind === "plus" ? "+ Artı" : "− Eksi"}</span>
    <div class="noteText" style="color:rgba(11,18,32,.62)">Henüz not yok.</div>
    <div class="noteMeta">—</div>
  `;
  return li;
}

function makeNoteItem(kind, text, meta) {
  const li = document.createElement("li");
  li.className = "noteItem";

  const tag = document.createElement("span");
  tag.className = `noteTag ${kind}`;
  tag.textContent = kind === "plus" ? "+ Artı" : "− Eksi";

  const t = document.createElement("div");
  t.className = "noteText";
  t.textContent = text;

  const m = document.createElement("div");
  m.className = "noteMeta";
  m.textContent = meta;

  li.appendChild(tag);
  li.appendChild(t);
  li.appendChild(m);
  return li;
}

/* ---------------- SUMMARY (ALWAYS VISIBLE) ---------------- */

function renderSummary() {
  const trips = state.trips.slice();
  const total = computeTotalDays(trips);

  // total days
  els.sumTotalDays.textContent = trips.length ? String(total) : "—";

  // limit
  if (!trips.length) {
    els.sumLimit.textContent = "—";
    els.sumLimitNote.textContent = "Henüz seyahat yok.";
  } else if (total <= 180) {
    els.sumLimit.textContent = "Güvende";
    els.sumLimitNote.textContent = `Kalan: ${180 - total} gün`;
  } else {
    els.sumLimit.textContent = "Riskli";
    els.sumLimitNote.textContent = `Aşılan: ${total - 180} gün`;
  }

  // trip count
  els.sumTripCount.textContent = String(trips.length);

  // range
  const range = computeRange(trips);
  els.sumRange.textContent = range.label;
  els.sumRangeNote.textContent = range.note;

  // badge
  els.summaryBadge.textContent = trips.length ? "Güncel" : "Boş";

  // trips table
  renderSummaryTrips(trips);

  // plus/minus in summary
  renderSummaryNotes();
}

function renderSummaryTrips(trips) {
  els.sumTripsTbody.innerHTML = "";

  if (trips.length === 0) {
    els.sumTripsEmpty.style.display = "block";
    els.sumTripsMeta.textContent = "0 seyahat";
    return;
  }

  els.sumTripsEmpty.style.display = "none";

  const sorted = trips.slice().sort((a, b) => a.out.localeCompare(b.out));
  els.sumTripsMeta.textContent = `${sorted.length} seyahat • Toplam ${computeTotalDays(sorted)} gün`;

  let idx = 1;
  for (const t of sorted) {
    const tr = document.createElement("tr");

    const tdIdx = document.createElement("td");
    tdIdx.textContent = String(idx++);

    const tdOut = document.createElement("td");
    tdOut.innerHTML = `${prettyDateTR(t.out)} <span class="mutedSmall">${weekdayTR(t.out)}</span>`;

    const tdIn = document.createElement("td");
    tdIn.innerHTML = `${prettyDateTR(t.in)} <span class="mutedSmall">${weekdayTR(t.in)}</span>`;

    const tdDays = document.createElement("td");
    tdDays.textContent = String(safeDays(t.out, t.in));

    tr.appendChild(tdIdx);
    tr.appendChild(tdOut);
    tr.appendChild(tdIn);
    tr.appendChild(tdDays);

    els.sumTripsTbody.appendChild(tr);
  }
}

function renderSummaryNotes() {
  els.sumPlusMeta.textContent = `${state.plus.length} kayıt`;
  els.sumMinusMeta.textContent = `${state.minus.length} kayıt`;

  renderSummaryNoteList(state.plus, els.sumPlusList, "plus");
  renderSummaryNoteList(state.minus, els.sumMinusList, "minus");
}

function renderSummaryNoteList(arr, ul, kind) {
  ul.innerHTML = "";

  if (!arr.length) {
    ul.appendChild(makeEmptyNote(kind));
    return;
  }

  // newest first for screenshot, max 6
  const max = 6;
  const sorted = arr.slice().sort((a, b) => b.ts - a.ts);
  const slice = sorted.slice(0, max);

  for (const n of slice) {
    ul.appendChild(makeNoteItem(kind, n.text, formatTS(n.ts)));
  }

  if (arr.length > max) {
    const li = document.createElement("li");
    li.className = "noteItem";
    li.innerHTML = `
      <span class="noteTag ${kind}">…</span>
      <div class="noteText" style="color:rgba(11,18,32,.70)">
        +${arr.length - max} kayıt daha var (özet kartı sadece ilk ${max} tanesini gösterir).
      </div>
      <div class="noteMeta">—</div>
    `;
    ul.appendChild(li);
  }
}

/* ---------------- STATUS ---------------- */

function setStatus(kind, text) {
  els.statusBadge.classList.remove("status-unknown", "status-safe", "status-risk");
  if (kind === "safe") els.statusBadge.classList.add("status-safe");
  else if (kind === "risk") els.statusBadge.classList.add("status-risk");
  else els.statusBadge.classList.add("status-unknown");
  els.statusBadge.textContent = text;
}

/* ---------------- COMPUTATIONS ---------------- */

function computeTotalDays(trips) {
  return trips.reduce((sum, t) => sum + Math.max(0, safeDays(t.out, t.in)), 0);
}

function computeRange(trips) {
  if (!trips.length) return { label: "—", note: "Seyahat aralığı yok." };

  const byOut = trips.slice().sort((a, b) => a.out.localeCompare(b.out));
  const byIn = trips.slice().sort((a, b) => a.in.localeCompare(b.in));

  const firstOut = byOut[0].out;
  const lastIn = byIn[byIn.length - 1].in;

  return {
    label: `${prettyDateTR(firstOut)} → ${prettyDateTR(lastIn)}`,
    note: `${weekdayTR(firstOut)} → ${weekdayTR(lastIn)}`
  };
}

function safeDays(outISO, inISO) {
  const a = parseISO(outISO);
  const b = parseISO(inISO);
  if (!a.ok || !b.ok) return 0;
  const t1 = Date.UTC(a.y, a.m - 1, a.d);
  const t2 = Date.UTC(b.y, b.m - 1, b.d);
  return Math.floor((t2 - t1) / 86400000);
}

/* ---------------- DATE HELPERS ---------------- */

function parseISO(iso) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return { ok:false };
  const [y, m, d] = iso.split("-").map(Number);
  if (y < 1900 || y > 2100) return { ok:false };
  if (m < 1 || m > 12) return { ok:false };
  const maxD = new Date(y, m, 0).getDate();
  if (d < 1 || d > maxD) return { ok:false };
  return { ok:true, y, m, d };
}

function daysBetweenUTC(outISO, inISO) {
  const a = parseISO(outISO);
  const b = parseISO(inISO);
  if (!a.ok || !b.ok) return NaN;
  return Math.floor((Date.UTC(b.y, b.m - 1, b.d) - Date.UTC(a.y, a.m - 1, a.d)) / 86400000);
}

function prettyDateTR(iso) {
  const p = parseISO(iso);
  if (!p.ok) return "—";
  const dd = String(p.d).padStart(2, "0");
  const mm = String(p.m).padStart(2, "0");
  return `${dd}-${mm}-${p.y}`;
}

function weekdayTR(iso) {
  const p = parseISO(iso);
  if (!p.ok) return "—";
  const d = new Date(Date.UTC(p.y, p.m - 1, p.d));
  const day = d.getUTCDay();
  const names = ["Pazar","Pazartesi","Salı","Çarşamba","Perşembe","Cuma","Cumartesi"];
  return names[day] || "—";
}

function toISO(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, "0");
  const d = String(dateObj.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function cryptoId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `id_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

/* ---------------- TIME ---------------- */

function formatTS(ts) {
  try {
    const d = new Date(ts);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, "0");
    const mi = String(d.getMinutes()).padStart(2, "0");
    return `${dd}.${mm}.${yyyy} ${hh}:${mi}`;
  } catch {
    return "";
  }
}

/* ---------------- STORAGE ---------------- */

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const p = JSON.parse(raw);

    state.inputOut = typeof p.inputOut === "string" ? p.inputOut : "";
    state.inputIn = typeof p.inputIn === "string" ? p.inputIn : "";

    state.trips = Array.isArray(p.trips) ? p.trips.filter(isValidTrip) : [];
    state.plus = Array.isArray(p.plus) ? p.plus.filter(isValidNote) : [];
    state.minus = Array.isArray(p.minus) ? p.minus.filter(isValidNote) : [];
  } catch {
    // ignore
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

function isValidTrip(t) {
  return t && typeof t.id === "string" && typeof t.out === "string" && typeof t.in === "string";
}

function isValidNote(n) {
  return n && typeof n.text === "string" && typeof n.ts === "number";
}

/* ---------------- ERRORS UI ---------------- */

function clearErrors() {
  els.errors.innerHTML = "";
}

function addOk(msg) {
  const div = document.createElement("div");
  div.className = "err ok";
  div.textContent = msg;
  els.errors.appendChild(div);
}

function addWarn(msg) {
  const div = document.createElement("div");
  div.className = "err warn";
  div.textContent = msg;
  els.errors.appendChild(div);
}

function addInfo(msg) {
  const div = document.createElement("div");
  div.className = "err info";
  div.textContent = msg;
  els.errors.appendChild(div);
}
