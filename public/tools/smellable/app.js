/***********************
 * Smellable - Frontend
 * Backend (Vercel):
 *   GET  /api/smell?id=smell_001
 *   POST /api/vote    { id, direction: "up"|"down" }
 *   POST /api/comment { id, text }
 *
 * If backend fails, fallback uses localStorage (device-only).
 ***********************/

let currentIndex = 0;
let touchStartX = null;

const smellImage = document.getElementById("smell-image");
const smellName = document.getElementById("smell-name");
const smellCategory = document.getElementById("smell-category");
const nextBtn = document.getElementById("next-btn");

const voteUpBtn = document.getElementById("vote-up");
const voteDownBtn = document.getElementById("vote-down");
const countUp = document.getElementById("count-up");
const countDown = document.getElementById("count-down");

const shareWhatsapp = document.getElementById("share-whatsapp");

const commentsList = document.getElementById("comments-list");
const commentsMeta = document.getElementById("comments-meta");
const commentForm = document.getElementById("comment-form");
const commentInput = document.getElementById("comment-input");

const suggestSmellId = document.getElementById("suggest-smell-id");
const suggestSmellName = document.getElementById("suggest-smell-name");
const suggestPageUrl = document.getElementById("suggest-page-url");

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function fmtTime(ts) {
  try { return new Date(ts).toLocaleString(); } catch { return ""; }
}

function sanitizeComment(text) {
  const t = text.trim();
  if (!t) return null;
  if (/https?:\/\//i.test(t) || /www\./i.test(t)) return null;
  return t.length > 160 ? t.slice(0, 160) : t;
}

function getCurrentSmell() {
  return smells[currentIndex];
}

// local fallback
function lsKey(smellId) { return `smellable:${smellId}`; }

function fallbackGet(smellId) {
  const raw = localStorage.getItem(lsKey(smellId));
  if (!raw) return { up: 0, down: 0, comments: [] };
  try {
    const p = JSON.parse(raw);
    return { up: Number(p.up || 0), down: Number(p.down || 0), comments: Array.isArray(p.comments) ? p.comments : [] };
  } catch {
    return { up: 0, down: 0, comments: [] };
  }
}

function fallbackSet(smellId, data) {
  localStorage.setItem(lsKey(smellId), JSON.stringify(data));
}

// API
async function apiGetStats(smellId) {
  const res = await fetch(`/api/smell?id=${encodeURIComponent(smellId)}`, { headers: { "Accept": "application/json" } });
  if (!res.ok) throw new Error("GET stats failed");
  return await res.json();
}

async function apiVote(smellId, direction) {
  const res = await fetch(`/api/vote`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify({ id: smellId, direction })
  });
  if (!res.ok) throw new Error("POST vote failed");
  return await res.json();
}

async function apiPostComment(smellId, text) {
  const res = await fetch(`/api/comment`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify({ id: smellId, text })
  });
  if (!res.ok) throw new Error("POST comment failed");
  return await res.json();
}

// UI
function setActiveVote(direction) {
  voteUpBtn.classList.toggle("active", direction === "up");
  voteDownBtn.classList.toggle("active", direction === "down");
}

function renderCounts(stats) {
  countUp.textContent = String(stats.up ?? 0);
  countDown.textContent = String(stats.down ?? 0);
}

function renderComments(stats, label) {
  const comments = Array.isArray(stats.comments) ? stats.comments : [];
  commentsMeta.textContent = `${comments.length} comment(s) • ${label}`;

  commentsList.innerHTML = comments.slice(0, 30).map(c => {
    const safe = escapeHtml(c.text ?? "");
    const ts = c.ts ? fmtTime(c.ts) : "";
    return `
      <div class="comment">
        <div class="meta">
          <span>Anonymous</span>
          <span>${escapeHtml(ts)}</span>
        </div>
        <div class="text">${safe}</div>
      </div>`;
  }).join("");
}

async function refreshStats() {
  const smell = getCurrentSmell();
  try {
    const stats = await apiGetStats(smell.id);
    renderCounts(stats);
    renderComments(stats, "global");
  } catch {
    const stats = fallbackGet(smell.id);
    renderCounts(stats);
    renderComments(stats, "local fallback");
  }
}

function updateShareLink() {
  const smell = getCurrentSmell();
  const url = window.location.href;
  const text = `Did you smell it too? 👃\n${smell.name}\n${url}`;
  shareWhatsapp.href = `https://wa.me/?text=${encodeURIComponent(text)}`;
}

function updateSuggestHiddenFields() {
  const smell = getCurrentSmell();
  suggestSmellId.value = smell.id;
  suggestSmellName.value = smell.name;
  suggestPageUrl.value = window.location.href;
}

function loadSmell(index) {
  const smell = smells[index];
  smellImage.style.opacity = "0";
  smellName.style.opacity = "0";

  setTimeout(() => {
    smellImage.src = smell.image;
    smellImage.alt = smell.name;
    smellName.textContent = smell.name;
    smellCategory.textContent = smell.category;

    smellImage.style.opacity = "1";
    smellName.style.opacity = "1";

    setActiveVote(null);
    updateShareLink();
    updateSuggestHiddenFields();
    refreshStats();
  }, 160);
}

function nextSmell() {
  currentIndex = (currentIndex + 1) % smells.length;
  loadSmell(currentIndex);
}

// Events
nextBtn.addEventListener("click", nextSmell);

voteUpBtn.addEventListener("click", async () => {
  const smell = getCurrentSmell();
  setActiveVote("up");
  try {
    const stats = await apiVote(smell.id, "up");
    renderCounts(stats);
  } catch {
    const data = fallbackGet(smell.id);
    data.up += 1;
    fallbackSet(smell.id, data);
    renderCounts(data);
  }
});

voteDownBtn.addEventListener("click", async () => {
  const smell = getCurrentSmell();
  setActiveVote("down");
  try {
    const stats = await apiVote(smell.id, "down");
    renderCounts(stats);
  } catch {
    const data = fallbackGet(smell.id);
    data.down += 1;
    fallbackSet(smell.id, data);
    renderCounts(data);
  }
});

commentForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const smell = getCurrentSmell();
  const cleaned = sanitizeComment(commentInput.value);

  if (!cleaned) {
    commentInput.value = "";
    commentInput.placeholder = "No links. Max 160. Try again 🙂";
    return;
  }

  commentInput.value = "";
  try {
    await apiPostComment(smell.id, cleaned);
  } catch {
    const data = fallbackGet(smell.id);
    const c = { id: `c_${Math.random().toString(16).slice(2)}`, text: cleaned, ts: Date.now() };
    data.comments = [c, ...data.comments].slice(0, 50);
    fallbackSet(smell.id, data);
  }
  await refreshStats();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight" || e.key === " ") {
    e.preventDefault();
    nextSmell();
  }
});

document.addEventListener("touchstart", (e) => {
  touchStartX = e.touches?.[0]?.clientX ?? null;
}, { passive: true });

document.addEventListener("touchend", (e) => {
  if (touchStartX == null) return;
  const endX = e.changedTouches?.[0]?.clientX ?? null;
  if (endX == null) return;
  const dx = endX - touchStartX;
  touchStartX = null;
  if (Math.abs(dx) > 60 && dx < 0) nextSmell();
}, { passive: true });

// Start
loadSmell(currentIndex);
