window.BUYORBYE_APP = (function () {
  "use strict";

  function esc(str) {
    return String(str ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function makeEl(tag, attrs = {}, html = "") {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "class") el.className = v;
      else if (k === "hidden") el.hidden = !!v;
      else el.setAttribute(k, v);
    }
    if (html) el.innerHTML = html;
    return el;
  }

  function readNumber(val) {
    if (val === "" || val == null) return null;
    const n = Number(val);
    return Number.isFinite(n) ? n : null;
  }

  function answerToYesNo(v) {
    if (v === true) return "yes";
    if (v === false) return "no";
    if (v === "yes" || v === "no") return v;
    return null;
  }

  function pctFromIncomePctAnswer(v) {
    if (v === "p10") return 10;
    if (v === "p20") return 20;
    if (v === "p30") return 30;
    if (v === "p40") return 40;
    if (v === "p50") return 50;
    return null; // unk or missing
  }

  function init({ data, rootEl, statusPill }) {
    if (!data?.ui || !data?.questions || !data?.steps) {
      statusPill.textContent = "Data eksik.";
      rootEl.textContent = "Data eksik.";
      return;
    }

    const ALL_QIDS = data.steps.flatMap((s) => s.qids);

    // order: yes/no + single + multi first, then text/number last
    const PRIORITY_TYPES = ["yesno", "single", "multi"];
    const INPUT_TYPES = ["text", "number"];

    const QUESTION_ORDER = [
      ...ALL_QIDS.filter((qid) => PRIORITY_TYPES.includes(data.questions[qid]?.type)),
      ...ALL_QIDS.filter((qid) => INPUT_TYPES.includes(data.questions[qid]?.type))
    ];

    const TOTAL_QUESTIONS = QUESTION_ORDER.length;

    const STEP_BY_QID = {};
    data.steps.forEach((s, idx) => s.qids.forEach((qid) => (STEP_BY_QID[qid] = idx)));

    // rotate 5 palette colors for cards
    const CARD_PALETTE = ["card-blue", "card-green", "card-orange", "card-purple", "card-yellow"];

    const state = { qIndex: 0, answers: {} };

    function setPillReady() {
      statusPill.textContent = data.ui.pillReady || "Hazır.";
    }

    function setPillQuestion() {
      const n = Math.min(state.qIndex + 1, TOTAL_QUESTIONS);
      const fn = data.ui.pillStep;
      statusPill.textContent = typeof fn === "function" ? fn(n, TOTAL_QUESTIONS) : `${n}/${TOTAL_QUESTIONS}`;
    }

    function setPillResult() {
      statusPill.textContent = data.ui.pillResult || "Sonuç hazır.";
    }

    function validateQuestion(qid) {
      const q = data.questions[qid];
      if (!q) return [];

      const errors = [];
      const a = state.answers[qid];

      if (q.required) {
        if (q.type === "multi") {
          if (!Array.isArray(a) || a.length === 0) errors.push({ qid, msg: data.ui.errors.required });
        } else if (a === undefined || a === null || a === "") {
          errors.push({ qid, msg: data.ui.errors.required });
        }
      }

      if (q.type === "number" && a !== undefined && a !== null && a !== "") {
        const n = readNumber(a);
        if (n === null) errors.push({ qid, msg: data.ui.errors.numberInvalid });
        else if (n < 0) {
          if (qid === "budget") errors.push({ qid, msg: data.ui.errors.budgetMustBeGte0 });
          else if (qid === "price") errors.push({ qid, msg: data.ui.errors.priceMustBeGte0 });
          else errors.push({ qid, msg: data.ui.errors.numberInvalid });
        }
      }

      if (q.type === "multi" && q.max && Array.isArray(a) && a.length > q.max) {
        errors.push({ qid, msg: `En fazla ${q.max} seçim.` });
      }

      return errors;
    }

    function hardOutcomeIfAny() {
      const price = readNumber(state.answers.price);
      const budget = readNumber(state.answers.budget);

      if (Number.isFinite(price) && Number.isFinite(budget) && price > budget) {
        return {
          outcome: data.scoring.hard.overBudgetOutcome,
          reasonKey: data.scoring.hard.overBudgetReasonKey
        };
      }
      return null;
    }

    function scoreAnswers() {
      const W = data.scoring.weights;
      let score = 0;
      const appliedKeys = [];

      Object.keys(W).forEach((qid) => {
        const map = W[qid];
        const a = state.answers[qid];
        if (a === undefined || a === null || a === "") return;

        const ynQ = new Set(["alt80", "returnPolicy", "regret2y", "priceDrop15", "socialPressure", "impulse", "canWait72"]);
        if (ynQ.has(qid)) {
          const yn = answerToYesNo(a);
          if (yn && typeof map[yn] === "number") score += map[yn];
          return;
        }

        if (typeof map[a] === "number") score += map[a];
      });

      const pct = pctFromIncomePctAnswer(state.answers.incomePct);
      if (pct != null) {
        const hit = data.scoring.pctBands.find((b) => pct <= b.maxPct) || null;
        if (hit) {
          score += Number(hit.score || 0);
          appliedKeys.push(hit.key);
        }
      }

      return { score, appliedKeys };
    }

    function decideOutcome(score) {
      const t = data.scoring.thresholds;
      if (score >= t.buyMin) return "buy";
      if (score <= t.byeMax) return "bye";
      return "wait";
    }

    function renderQuestion(q) {
      const qWrap = makeEl("div", { class: "q" });

      qWrap.appendChild(makeEl("div", { class: "q-label", id: `lbl_${q.id}` }, esc(q.label)));
      if (q.sub) qWrap.appendChild(makeEl("div", { class: "q-sub" }, esc(q.sub)));

      const controls = makeEl("div", { class: "q-controls" });

      if (q.type === "text") {
        const input = makeEl("input", {
          class: "input",
          type: "text",
          placeholder: q.placeholder || "",
          "aria-labelledby": `lbl_${q.id}`
        });
        input.value = state.answers[q.id] ?? "";
        input.addEventListener("input", () => (state.answers[q.id] = input.value));
        controls.appendChild(input);
      }

      if (q.type === "number") {
        const input = makeEl("input", {
          class: "input",
          type: "number",
          inputmode: "decimal",
          placeholder: q.placeholder || "",
          "aria-labelledby": `lbl_${q.id}`
        });
        input.value = state.answers[q.id] ?? "";
        input.addEventListener("input", () => (state.answers[q.id] = input.value));
        controls.appendChild(input);
      }

      if (q.type === "yesno") {
        const current = answerToYesNo(state.answers[q.id]);
        const choices = makeEl("div", { class: "choices" });

        const yesId = `${q.id}_yes`;
        const noId = `${q.id}_no`;

        const yes = makeEl("label", { class: "choice", for: yesId });
        const no = makeEl("label", { class: "choice", for: noId });

        yes.innerHTML = `<input id="${yesId}" type="radio" name="${q.id}" value="yes" ${current === "yes" ? "checked" : ""} />
                         <div><strong>${esc(data.ui.yes)}</strong></div>`;
        no.innerHTML = `<input id="${noId}" type="radio" name="${q.id}" value="no" ${current === "no" ? "checked" : ""} />
                        <div><strong>${esc(data.ui.no)}</strong></div>`;

        choices.appendChild(yes);
        choices.appendChild(no);

        choices.addEventListener("change", (e) => {
          const v = e.target?.value;
          if (v === "yes" || v === "no") state.answers[q.id] = v;
        });

        controls.appendChild(choices);
      }

      if (q.type === "single") {
        const current = state.answers[q.id] ?? "";
        const choices = makeEl("div", { class: "choices" });

        q.options.forEach((opt, idx) => {
          const rid = `${q.id}_${idx}`;
          const lab = makeEl("label", { class: "choice", for: rid });
          lab.innerHTML = `<input id="${rid}" type="radio" name="${q.id}" value="${esc(opt.v)}" ${
            String(current) === String(opt.v) ? "checked" : ""
          } />
          <div><strong>${esc(opt.t)}</strong></div>`;
          choices.appendChild(lab);
        });

        choices.addEventListener("change", (e) => (state.answers[q.id] = e.target?.value));
        controls.appendChild(choices);
      }

      if (q.type === "multi") {
        const arr = Array.isArray(state.answers[q.id]) ? state.answers[q.id] : [];
        const choices = makeEl("div", { class: "choices" });

        q.options.forEach((opt, idx) => {
          const cid = `${q.id}_${idx}`;
          const checked = arr.includes(opt.v);

          const lab = makeEl("label", { class: "choice", for: cid });
          lab.innerHTML = `<input id="${cid}" type="checkbox" value="${esc(opt.v)}" ${checked ? "checked" : ""} />
          <div><strong>${esc(opt.t)}</strong></div>`;
          choices.appendChild(lab);
        });

        choices.addEventListener("change", (e) => {
          const target = e.target;
          if (!target || target.type !== "checkbox") return;

          const v = target.value;
          let next = Array.isArray(state.answers[q.id]) ? [...state.answers[q.id]] : [];

          if (target.checked) {
            if (!next.includes(v)) next.push(v);
            if (q.max && next.length > q.max) {
              next = next.slice(next.length - q.max);
              [...choices.querySelectorAll("input[type=checkbox]")].forEach((cb) => (cb.checked = next.includes(cb.value)));
            }
          } else {
            next = next.filter((x) => x !== v);
          }
          state.answers[q.id] = next;
        });

        controls.appendChild(choices);
      }

      if (!q.required) controls.appendChild(makeEl("div", { class: "hint" }, esc(data.ui.optional)));

      qWrap.appendChild(controls);
      return qWrap;
    }

    function renderQuestionScreen() {
      rootEl.innerHTML = "";
      setPillQuestion();

      const qid = QUESTION_ORDER[state.qIndex];
      const q = data.questions[qid];

      const stepIdx = STEP_BY_QID[qid] ?? 0;
      const step = data.steps[stepIdx];

      const title = data.ui.stepTitles[step.id];
      const sub = data.ui.stepSubs[step.id];

      const colorClass = CARD_PALETTE[state.qIndex % CARD_PALETTE.length];

      const card = makeEl("section", { class: `card ${colorClass} card-anim` });

      const head = makeEl("div", { class: "card-head" });
      head.appendChild(makeEl("h2", { class: "card-title" }, esc(title)));
      head.appendChild(makeEl("p", { class: "card-sub" }, esc(sub)));
      card.appendChild(head);

      const qgrid = makeEl("div", { class: "qgrid" });
      if (q) qgrid.appendChild(renderQuestion(q));
      card.appendChild(qgrid);

      const errBox = makeEl("div", { class: "err", hidden: true });
      card.appendChild(errBox);

      const nav = makeEl("div", { class: "input-row input-row-bottom" });

      const backBtn = makeEl("button", { class: "btn secondary", type: "button" }, esc(data.ui.buttons.back));

      const isLast = state.qIndex === TOTAL_QUESTIONS - 1;
      const nextLabel = isLast ? (data.ui.buttons.showResult || data.ui.buttons.next) : data.ui.buttons.next;
      const nextBtn = makeEl("button", { class: "btn", type: "button" }, esc(nextLabel));

      backBtn.addEventListener("click", () => {
        if (state.qIndex === 0) return;
        state.qIndex -= 1;
        renderQuestionScreen();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });

      nextBtn.addEventListener("click", () => {
        const errors = validateQuestion(qid);
        if (errors.length) {
          errBox.hidden = false;
          errBox.textContent = errors[0].msg;
          return;
        }
        errBox.hidden = true;

        if (!isLast) {
          state.qIndex += 1;
          renderQuestionScreen();
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
          renderResult();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      });

      if (state.qIndex > 0) nav.appendChild(backBtn);
      nav.appendChild(nextBtn);
      card.appendChild(nav);

      rootEl.appendChild(card);
    }

    function renderResult() {
      rootEl.innerHTML = "";
      setPillResult();

      const hard = hardOutcomeIfAny();
      const scored = scoreAnswers();
      const outcome = hard ? hard.outcome : decideOutcome(scored.score);
      const out = data.outcomes[outcome];

      const container = makeEl("div", { class: "result-grid" });

      const main = makeEl("section", { class: "card card-orange card-anim" });

      const head = makeEl("div", { class: "card-head" });
      head.appendChild(makeEl("h2", { class: "card-title" }, esc(data.ui.stepTitles.result)));
      head.appendChild(makeEl("p", { class: "card-sub" }, esc(out.headline)));
      main.appendChild(head);

      const outcomeWrap = makeEl("div", { class: "outcome-wrap" });

      const wordClass = outcome === "wait" ? "decision-word wait" : "decision-word";
      outcomeWrap.appendChild(makeEl("p", { class: wordClass }, esc(out.label)));

      const imgMap = {
        buy: "/img/buyorbyeclipbuy.jpg",
        wait: "/img/buyorbyeclipwait.jpg",
        bye: "/img/buyorbyeclipbye.jpg"
      };

      outcomeWrap.appendChild(makeEl("img", { class: "clipart-img", src: imgMap[outcome], alt: out.label }));
      outcomeWrap.appendChild(makeEl("div", { class: "outcome-tone" }, esc(out.tone)));
      outcomeWrap.appendChild(makeEl("p", { class: "step-help" }, esc(data.ui.result.nudge)));

      main.appendChild(outcomeWrap);

      const nav = makeEl("div", { class: "input-row input-row-bottom" });

      const backBtn = makeEl("button", { class: "btn secondary", type: "button" }, esc(data.ui.buttons.back));
      backBtn.addEventListener("click", () => {
        state.qIndex = TOTAL_QUESTIONS - 1;
        renderQuestionScreen();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });

      const resetBtn = makeEl("button", { class: "btn", type: "button" }, esc(data.ui.buttons.startOver));
      resetBtn.addEventListener("click", () => {
        state.qIndex = 0;
        state.answers = {};
        setPillReady();
        renderQuestionScreen();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });

      nav.appendChild(backBtn);
      nav.appendChild(resetBtn);
      main.appendChild(nav);

      // reasons
      const keys = [];
      if (hard?.reasonKey) keys.push(hard.reasonKey);
      scored.appliedKeys.forEach((k) => keys.push(k));
      const uniqKeys = [...new Set(keys)];

      const R = data.reasons || {};
      const whys = [];
      const trades = [];
      const nexts = [];

      uniqKeys.forEach((k) => {
        const pack = R[k];
        if (pack?.why) whys.push(...pack.why);
        if (pack?.tradeoffs) trades.push(...pack.tradeoffs);
        if (pack?.next) nexts.push(...pack.next);
      });

      if (whys.length === 0) whys.push(data.ui.fallbackWhy || "Yanıtların dengesi bu sonuca işaret ediyor.");
      if (trades.length === 0) trades.push(data.ui.fallbackTrade || "Emin değilsen 72 saat beklemek ucuz bir sigortadır.");
      if (nexts.length === 0) nexts.push(data.ui.fallbackNext || "Acil değilse kısa bir bekleme genelde kazandırır.");

      const whyCard = makeEl("section", { class: "card card-yellow card-anim" });
      whyCard.appendChild(makeEl("h3", { class: "mini-title" }, esc(data.ui.result.why)));
      whyCard.appendChild(makeEl("ul", { class: "bullets" }, whys.slice(0, 5).map((x) => `<li>${esc(x)}</li>`).join("")));

      const tradeCard = makeEl("section", { class: "card card-green card-anim" });
      tradeCard.appendChild(makeEl("h3", { class: "mini-title" }, esc(data.ui.result.tradeoffs)));
      tradeCard.appendChild(makeEl("ul", { class: "bullets" }, trades.slice(0, 3).map((x) => `<li>${esc(x)}</li>`).join("")));

      const nextCard = makeEl("section", { class: "card card-blue card-anim" });
      nextCard.appendChild(makeEl("h3", { class: "mini-title" }, esc(data.ui.result.nextSteps)));
      nextCard.appendChild(makeEl("ul", { class: "bullets" }, nexts.slice(0, 3).map((x) => `<li>${esc(x)}</li>`).join("")));

      container.appendChild(main);
      container.appendChild(whyCard);
      container.appendChild(tradeCard);
      container.appendChild(nextCard);

      rootEl.appendChild(container);
    }

    setPillReady();
    renderQuestionScreen();
  }

  return { init };
})();
