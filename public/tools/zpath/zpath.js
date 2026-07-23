/* =========================================================
  FILE: /zpath/zpath.js
  PURPOSE:
  - ZPATH (Yes/No) decision check
  - No free text. Pure yes/no + thresholds.
  - Outputs: logic vs emotion + sanity warnings.
========================================================= */

(function () {
  const $ = (id) => document.getElementById(id);

  const qText = $("qText");
  const qHint = $("qHint");
  const yesBtn = $("yesBtn");
  const noBtn = $("noBtn");
  const backBtn = $("backBtn");
  const restartBtn = $("restartBtn");
  const counter = $("counter");
  const progress = $("progress");
  const resultsEl = $("results");
  const top1 = $("top1");
  const top2 = $("top2");

  // ---------------------------
  // Scoring model
  // ---------------------------
  const score = {
    logic: 0,
    emotion: 0,
    escape: 0,   // “I might be escaping” signals
    risk: 0      // “I can recover if worst-case happens”
  };

  const history = []; // { idx, answer: true/false, delta }

  // ---------------------------
  // Questions (15)
  // Logic: Yes=+2
  // Emotion: Yes=+1
  // Sanity: Q13/Q14 (reverse): Yes=escape+1 (emotion signal)
  // Risk: Q15: Yes=risk+1 (logic safety)
  // ---------------------------
  const QUESTIONS = [
    { key: "L1", text: "Would your salary increase by at least 10%?", hint: "Answer Yes only if it’s clearly ≥10% (offer, numbers, or strong certainty).", yes: { logic: 2 } },
    { key: "L2", text: "Is the role/scope clearly bigger (responsibility, impact, ownership)?", hint: "Not a title change—real scope change.", yes: { logic: 2 } },
    { key: "L3", text: "Would you learn something meaningfully new (domain/tech/skills) vs your current role?", hint: "A real growth step, not just a different project name.", yes: { logic: 2 } },
    { key: "L4", text: "Does this option strengthen your CV noticeably for the next 2–3 years?", hint: "Think: brand, scope, measurable work, transferable skills.", yes: { logic: 2 } },
    { key: "L5", text: "Are the work conditions better (remote/hybrid/location/time)?", hint: "Better = helps your life weekly, not once a month.", yes: { logic: 2 } },
    { key: "L6", text: "Is the new company/track more stable and reliable?", hint: "Based on what you know: contract, industry, signals, not vibes.", yes: { logic: 2 } },
    { key: "L7", text: "Would this choice still look smart 5 years from now?", hint: "Imagine explaining it to your future self.", yes: { logic: 2 } },

    { key: "E8", text: "Have you felt unhappy at work often in the last 3 months?", hint: "Often = it shows up repeatedly, not a single bad week.", yes: { emotion: 1 } },
    { key: "E9", text: "Does thinking about the new option create a sense of relief?", hint: "Relief is a signal—use it, but don’t let it fully decide.", yes: { emotion: 1 } },
    { key: "E10", text: "Does your current environment drain your energy noticeably?", hint: "Energy drain over weeks matters more than one incident.", yes: { emotion: 1 } },
    { key: "E11", text: "Is the change motivating you more than it scares you?", hint: "Motivation > fear is a good sign of forward movement.", yes: { emotion: 1 } },
    { key: "E12", text: "Does staying feel like a psychological weight right now?", hint: "Weight = you carry it mentally outside working hours.", yes: { emotion: 1 } },

    // Reverse / escape signals
    { key: "S13", text: "Is there a chance you’re doing this mainly to escape?", hint: "Be honest: escape decisions can still be valid, but need extra care.", yes: { emotion: 1, escape: 1 } },
    { key: "S14", text: "Would delaying this decision by 3 months bring a real benefit?", hint: "Benefit = concrete (money, info, timing), not just “avoid stress”.", yes: { emotion: 1, escape: 1 } },

    // Risk recovery
    { key: "R15", text: "If the worst-case happens, can you recover or reverse course?", hint: "Recover = savings, marketability, network, fallback plan.", yes: { logic: 1, risk: 1 } }
  ];

  let idx = 0;

  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }

  function applyDelta(delta, sign) {
    const s = sign ?? 1;
    for (const k of Object.keys(delta || {})) {
      score[k] = (score[k] || 0) + (delta[k] * s);
    }
  }

  function render() {
    const q = QUESTIONS[idx];
    qText.textContent = q.text;
    qHint.textContent = q.hint || "";

    counter.textContent = `Question ${idx + 1} / ${QUESTIONS.length}`;
    const pct = Math.round(((idx) / (QUESTIONS.length - 1)) * 100);
    progress.style.width = clamp(pct, 0, 100) + "%";

    backBtn.disabled = idx === 0;
    resultsEl.classList.remove("show");
  }

  function finish() {
    // Calculate percentages from totals
    const logic = score.logic;
    const emotion = score.emotion;

    const total = Math.max(1, logic + emotion);
    const logicPct = Math.round((logic / total) * 100);
    const emoPct = 100 - logicPct;

    // Decision labels
    let label = "Balanced decision";
    const gap = logicPct - emoPct;

    if (gap >= 20) label = "Logic-driven decision";
    else if (gap <= -20) label = "Emotion-driven decision";
    else label = "Balanced decision";

    // Escape warning rule of thumb
    // if escape >=2 AND emotion dominates or close → warning
    let warning = "";
    if (score.escape >= 2 && (emoPct >= logicPct - 10)) {
      warning = "⚠️ Possible escape-driven move: slow down and validate with facts (offer details, timeline, risks).";
    }

    // Risk note
    let riskNote = "";
    if (score.risk <= 0) riskNote = "Risk note: worst-case recovery looks unclear—consider adding a fallback plan.";
    else riskNote = "Risk note: you likely have a recovery path if things go wrong.";

    top1.innerHTML = `
      <h3>Decision Profile</h3>
      <div class="scoreline">
        <span>${label}</span>
        <span>${logicPct}% logic • ${emoPct}% emotion</span>
      </div>
      <p class="why">
        This is not a recommendation—it's a weight check.
        Use it to spot what’s driving you right now.
      </p>
      <div class="tags">
        <span class="tag">15 questions</span>
        <span class="tag">no typing</span>
        <span class="tag">privacy-first</span>
      </div>
    `;

    top2.innerHTML = `
      <h3>Sanity Notes</h3>
      <div class="scoreline">
        <span>Signals</span>
        <span>escape: ${score.escape} • recovery: ${score.risk}</span>
      </div>
      <p class="why">${warning || "No major escape-warning signal detected from your answers."}</p>
      <p class="why" style="margin-top:10px">${riskNote}</p>
      <div class="tags">
        <span class="tag">${score.escape >= 2 ? "escape-signal" : "steady"}</span>
        <span class="tag">${score.risk > 0 ? "recoverable" : "high-risk"}</span>
      </div>
    `;

    resultsEl.classList.add("show");
    progress.style.width = "100%";
    counter.textContent = "Done";
    qText.textContent = "Done.";
    qHint.textContent = "You can go Back to review, or Restart to run it again.";
  }

  function answer(isYes) {
    const q = QUESTIONS[idx];

    // Only apply delta on YES (NO = 0). Keep it simple and consistent.
    const delta = isYes ? (q.yes || {}) : {};
    applyDelta(delta, 1);

    history.push({ idx, answer: isYes, delta });

    // next
    if (idx >= QUESTIONS.length - 1) finish();
    else {
      idx += 1;
      render();
    }
  }

  function goBack() {
    if (idx === 0 || history.length === 0) return;

    // If we are at "done", ensure we go back properly
    if (idx >= QUESTIONS.length - 1 && counter.textContent === "Done") {
      // last answered question is index 14; keep idx at last question for back navigation
      idx = QUESTIONS.length - 1;
    }

    // Remove last answer & rollback delta
    const last = history.pop();
    if (last && last.delta) applyDelta(last.delta, -1);

    idx = Math.max(0, (last ? last.idx : idx - 1));
    render();
  }

  function restart() {
    score.logic = 0;
    score.emotion = 0;
    score.escape = 0;
    score.risk = 0;

    history.length = 0;
    idx = 0;

    resultsEl.classList.remove("show");
    top1.innerHTML = "";
    top2.innerHTML = "";

    progress.style.width = "0%";
    counter.textContent = `Question 1 / ${QUESTIONS.length}`;
    render();
  }

  // Bind
  yesBtn.addEventListener("click", () => answer(true));
  noBtn.addEventListener("click", () => answer(false));
  backBtn.addEventListener("click", goBack);
  restartBtn.addEventListener("click", restart);

  // Init
  render();
})();
