/* =========================================================
  FILE: /zats/zats.js
  PURPOSE:
  - ZATS: ATS Okunabilirlik (ATS-Readiness) Tool
  - UI render -> #cards-root
  - PDF text extraction (PDF.js, text-based PDFs)
  - ATS readability scoring (0–100) + subscores
  - Risks + actionable fixes
  ARCHITECTURE:
  - Global init: window.ubtInitZats()
  - 100% client-side, no upload
========================================================= */

(function () {
  "use strict";

  /* =========================================================
     CONFIG
  ========================================================= */
  const PDFJS_VERSION = "4.7.76";

  const FALLBACK_KEYWORDS = [
    "experience","skills","education","certification","summary","profile",
    "test","testing","qa","quality","automation","selenium","playwright","cypress",
    "jira","xray","testrail","postman","api","rest","ci","cd","cicd","jenkins",
    "docker","kubernetes","sql","python","java","c#",".net","istqb","agile","scrum"
  ];

  const SECTION_DETECTORS = [
    { name: "Summary/Profile", rx: /(summary|profile|özet|profil|hakkımda)/i },
    { name: "Experience", rx: /(experience|work experience|employment|deneyim|iş deneyimi)/i },
    { name: "Skills", rx: /(skills|tech stack|technologies|tools|beceri|yetenek)/i },
    { name: "Education", rx: /(education|eğitim|üniversite|school)/i },
    { name: "Certifications", rx: /(certification|certifications|sertifika)/i }
  ];

  /* =========================================================
     PUBLIC INIT
  ========================================================= */
  window.ubtInitZats = function () {
    const root = document.getElementById("cards-root");
    if (!root) return;

    // PDF.js worker
    if (window.pdfjsLib?.GlobalWorkerOptions) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.js`;
    }

    root.innerHTML = buildUI();
    bindEvents();
  };

  /* =========================================================
     UI
  ========================================================= */
  function buildUI() {
    return `
      <div class="card card-color-2">
        <h2>Girdiler</h2>

        <div style="margin-top:10px;">
          <b>CV PDF (text-based)</b><br/>
          <input id="zatsPdf" type="file" accept="application/pdf" />
          <div style="margin-top:10px;">
            <button id="zatsExtract">PDF’den Metni Çıkar</button>
            <button id="zatsRun">ATS Skorunu Hesapla</button>
            <button id="zatsClear">Temizle</button>
          </div>
          <div id="zatsStatus" style="margin-top:10px; opacity:.85;"></div>
        </div>

        <div style="margin-top:14px;">
          <b>CV Metni</b>
          <textarea id="zatsCv" rows="10" style="width:100%; margin-top:6px;"></textarea>
        </div>

        <div style="margin-top:14px;">
          <b>Job Description (opsiyonel)</b>
          <textarea id="zatsJd" rows="6" style="width:100%; margin-top:6px;"></textarea>
        </div>
      </div>

      <div class="card card-color-3" id="zatsResult">
        <h2>Sonuç</h2>
        <p style="opacity:.8;">Henüz analiz yapılmadı.</p>
      </div>
    `;
  }

  function bindEvents() {
    const pdf = el("zatsPdf");
    const cv = el("zatsCv");
    const jd = el("zatsJd");
    const status = el("zatsStatus");
    const result = el("zatsResult");

    el("zatsExtract").onclick = async () => {
      if (!pdf.files?.[0]) {
        status.textContent = "Lütfen bir PDF seç.";
        return;
      }
      status.textContent = "PDF okunuyor…";
      try {
        const text = await extractPdfText(pdf.files[0]);
        if (text.length < 80) {
          status.textContent = "Metin çıkarılamadı. PDF taranmış olabilir.";
          return;
        }
        cv.value = normalize(text);
        status.textContent = "Metin çıkarıldı.";
      } catch (e) {
        status.textContent = "PDF okuma hatası.";
      }
    };

    el("zatsRun").onclick = () => {
      if (cv.value.trim().length < 100) {
        status.textContent = "CV metni çok kısa.";
        return;
      }
      const r = score(cv.value, jd.value);
      result.innerHTML = renderResult(r);
      status.textContent = "";
    };

    el("zatsClear").onclick = () => {
      pdf.value = "";
      cv.value = "";
      jd.value = "";
      result.innerHTML = `<h2>Sonuç</h2><p style="opacity:.8;">Henüz analiz yapılmadı.</p>`;
      status.textContent = "";
    };
  }

  /* =========================================================
     PDF
  ========================================================= */
  async function extractPdfText(file) {
    const buf = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
    let out = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const p = await pdf.getPage(i);
      const c = await p.getTextContent();
      out += " " + c.items.map(it => it.str || "").join(" ");
    }
    return out;
  }

  /* =========================================================
     SCORING
  ========================================================= */
  function score(cvRaw, jdRaw) {
    const cv = normalize(cvRaw);
    const jd = normalize(jdRaw);

    const parse = parseScore(cv);
    const structure = structureScore(cv);
    const keywords = keywordScore(cv, jd);
    const evidence = evidenceScore(cv);

    const total = clamp(
      parse.score + structure.score + keywords.score + evidence.score,
      0, 100
    );

    return { total, parse, structure, keywords, evidence };
  }

  function parseScore(text) {
    let score = 30;
    const issues = [];

    if (!/@/.test(text)) { score -= 6; issues.push("Email bulunamadı."); }
    if (!/\d{4}/.test(text)) { score -= 6; issues.push("Tarih bilgisi zayıf."); }
    if ((text.match(/[•►✓★]/g) || []).length > 15) {
      score -= 4; issues.push("Aşırı ikon/bullet kullanımı.");
    }

    return { score, issues };
  }

  function structureScore(text) {
    let score = 0;
    const found = [];
    const missing = [];

    SECTION_DETECTORS.forEach(s => {
      if (s.rx.test(text)) { found.push(s.name); }
      else { missing.push(s.name); }
    });

    if (found.includes("Experience")) score += 8;
    if (found.includes("Skills")) score += 6;
    if (found.includes("Education")) score += 4;
    if (found.includes("Certifications")) score += 2;

    return { score, found, missing };
  }

  function keywordScore(cv, jd) {
    const cvSet = tokenSet(cv);
    const kws = jd.length > 80 ? extractJdKeywords(jd) : FALLBACK_KEYWORDS;

    let matched = 0;
    kws.forEach(k => { if (cvSet.has(k)) matched++; });

    const ratio = matched / Math.max(kws.length, 1);
    const score = Math.round(ratio * 30);

    return { score, matched, total: kws.length };
  }

  function evidenceScore(text) {
    let score = 20;
    if (!/\d+/.test(text)) score -= 8;
    if (!/(led|implemented|improved|geliştird|kurdu)/i.test(text)) score -= 4;
    if (/(responsible for|worked on|destek oldum)/i.test(text)) score -= 4;
    return { score };
  }

  /* =========================================================
     RENDER
  ========================================================= */
  function renderResult(r) {
    return `
      <h2>Sonuç</h2>
      <h1>${r.total}/100</h1>

      <ul style="line-height:1.6;">
        <li>Parse edilebilirlik: ${r.parse.score}/30</li>
        <li>Yapı: ${r.structure.score}/20</li>
        <li>Keyword: ${r.keywords.score}/30</li>
        <li>Kanıt: ${r.evidence.score}/20</li>
      </ul>

      <p style="opacity:.75;">
        Not: Bu skor gerçek bir ATS değildir. Yaygın ATS davranışlarına göre tahmini okunabilirlik skorudur.
      </p>
    `;
  }

  /* =========================================================
     HELPERS
  ========================================================= */
  function el(id) { return document.getElementById(id); }

  function normalize(s) {
    return (s || "")
      .replace(/\s+/g, " ")
      .replace(/\r/g, "\n")
      .trim()
      .toLowerCase();
  }

  function tokenSet(text) {
    const set = new Set();
    text.split(" ").forEach(t => { if (t.length > 2) set.add(t); });
    return set;
  }

  function extractJdKeywords(jd) {
    return jd.split(/\W+/).filter(w => w.length > 3).slice(0, 60);
  }

  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }

})();
