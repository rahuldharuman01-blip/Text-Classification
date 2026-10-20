/* TextClassify AI – frontend logic
 * Talks to Flask (/health, /predict). If the backend or model is unreachable,
 * it falls back to a clearly labeled DEMO mode (simple keyword rules, NOT a real model). */

const CONFIG = {
  apiBase: "",            // "" = same origin. Use "http://127.0.0.1:5000" if serving the HTML separately.
  maxLength: 5000,
};

// Colors/icons per category. Unknown categories (spam, sports, ...) get a neutral style automatically.
const STYLES = {
  positive: { c: "var(--pos)", icon: '<path d="M8 14s1.5 2 4 2 4-2 4-2"/><circle cx="12" cy="12" r="9"/><path d="M9 9.5h.01M15 9.5h.01"/>' },
  negative: { c: "var(--neg)", icon: '<path d="M8 16s1.5-2 4-2 4 2 4 2"/><circle cx="12" cy="12" r="9"/><path d="M9 9.5h.01M15 9.5h.01"/>' },
  neutral:  { c: "var(--neu)", icon: '<circle cx="12" cy="12" r="9"/><path d="M8.5 15h7M9 9.5h.01M15 9.5h.01"/>' },
  fallback: { c: "var(--accent)", icon: '<path d="M4 6h10M4 12h16M4 18h7"/><circle cx="19" cy="6" r="2"/>' },
};
const styleFor = (label) => STYLES[String(label).toLowerCase()] || STYLES.fallback;

const EXAMPLES = [
  "The new update is fantastic. The interface feels smooth and everything loads much faster than before.",
  "I waited two hours for support and nobody could fix the problem. Very disappointing experience.",
  "The package arrived on Tuesday and contained the items listed on the invoice.",
];

const $ = (id) => document.getElementById(id);
const els = {
  input: $("textInput"), counter: $("counter"), error: $("error"),
  classify: $("classifyBtn"), clear: $("clearBtn"), example: $("exampleBtn"),
  result: $("result"), cat: $("resCat"), conf: $("resConf"), fill: $("fill"), bar: $("bar"),
  icon: $("resIcon"), probs: $("probs"), note: $("resNote"), copy: $("copyBtn"), copyLabel: $("copyLabel"),
  badge: $("modeBadge"),
};
let backendLive = false, exampleIdx = 0, lastResult = null;

/* ---------- Backend status ---------- */
/* ---------- Backend status ---------- */
async function checkBackend() {
  try {
    const r = await fetch(`${CONFIG.apiBase}/health`, {
      cache: "no-store"
    });

    const j = await r.json();

    backendLive = r.ok && j.model_loaded === true;

  } catch {
    backendLive = false;
  }

  els.badge.textContent = backendLive
    ? "Live model connected"
    : "Model not connected";

  els.badge.className =
    "mode neu-inset " + (backendLive ? "live" : "demo");
}


/* ---------- Classify using REAL MODEL ---------- */
async function classify() {
  const text = els.input.value.trim();

  if (!text)
    return showError("Enter some text before classifying.");

  if (text.length < 3)
    return showError("Text is too short. Enter at least a few words.");

  if (text.length > CONFIG.maxLength)
    return showError(`Text must be ${CONFIG.maxLength} characters or less.`);

  showError("");
  setLoading(true);

  try {
    if (!backendLive) {
      throw new Error(
        "AI model is not connected. Start the Flask backend and try again."
      );
    }

    const r = await fetch(`${CONFIG.apiBase}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text })
    });

    const j = await r.json();

    if (!r.ok) {
      throw new Error(
        j.error || "The server could not classify this text."
      );
    }

    // REAL MODEL RESULT
    const data = {
      ...j,
      demo: false
    };

    render(data);

  } catch (e) {
    showError(
      e.message || "Could not connect to the AI model."
    );
  } finally {
    setLoading(false);
  }
}

/* ---------- UI helpers ---------- */
function setLoading(on) {
  els.classify.classList.toggle("loading", on);
  els.classify.disabled = on;
  els.classify.querySelector(".label").textContent = on ? "Classifying…" : "Classify Text";
}
function showError(msg) { els.error.textContent = msg; if (msg) els.input.focus(); }
function updateCounter() {
  const n = els.input.value.length;
  els.counter.textContent = `${n} / ${CONFIG.maxLength} characters`;
  els.counter.classList.toggle("warn", n > CONFIG.maxLength * 0.95);
  if (n) showError("");
}

els.input.addEventListener("input", updateCounter);
els.input.addEventListener("keydown", (e) => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") classify(); });
els.classify.addEventListener("click", classify);
els.clear.addEventListener("click", () => { els.input.value = ""; els.result.hidden = true; updateCounter(); showError(""); els.input.focus(); });
els.example.addEventListener("click", () => { els.input.value = EXAMPLES[exampleIdx++ % EXAMPLES.length]; updateCounter(); showError(""); els.input.focus(); });
els.copy.addEventListener("click", async () => {
  if (!lastResult) return;
  const txt = `Category: ${lastResult.prediction} | Confidence: ${(lastResult.confidence * 100).toFixed(1)}%`;
  try { await navigator.clipboard.writeText(txt); els.copyLabel.textContent = "Copied"; }
  catch { els.copyLabel.textContent = "Copy failed"; }
  setTimeout(() => (els.copyLabel.textContent = "Copy result"), 1800);
});
function render({ prediction, confidence, probabilities, demo }) {
    lastResult = { prediction, confidence };

    const st = styleFor(prediction);

    els.result.hidden = false;
    els.result.style.setProperty("--c", st.c);

    els.icon.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none"
             stroke="currentColor"
             stroke-width="2"
             stroke-linecap="round"
             stroke-linejoin="round">
            ${st.icon}
        </svg>
    `;

    els.cat.textContent = prediction;

    const pct = Math.round(confidence * 1000) / 10;
    els.conf.textContent = pct + "%";

    els.fill.style.width = pct + "%";
    els.bar.setAttribute("aria-valuenow", pct);

    els.probs.replaceChildren();

    Object.entries(probabilities || {})
        .sort((a, b) => b[1] - a[1])
        .forEach(([label, value]) => {
            const row = document.createElement("div");
            row.className = "prob-row";

            const percentage = Math.round(value * 1000) / 10;

            row.innerHTML = `
                <div class="prob-label">
                    <span>${label}</span>
                    <span>${percentage}%</span>
                </div>
                <div class="prob-track">
                    <div class="prob-fill" style="width:${percentage}%"></div>
                </div>
            `;

            els.probs.appendChild(row);
        });

    els.note.textContent = "Prediction from the Hugging Face model.";
}

/* ---------- Theme, menu, nav highlight ---------- */
const root = document.documentElement, themeBtn = $("themeBtn");
function setTheme(t) {
  root.dataset.theme = t;
  themeBtn.setAttribute("aria-pressed", t === "dark");
  themeBtn.setAttribute("aria-label", t === "dark" ? "Switch to light theme" : "Switch to dark theme");
  try { localStorage.setItem("tc-theme", t); } catch {}
}
let saved = null; try { saved = localStorage.getItem("tc-theme"); } catch {}
setTheme(saved || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
themeBtn.addEventListener("click", () => setTheme(root.dataset.theme === "dark" ? "light" : "dark"));

const menuBtn = $("menuBtn"), navLinks = $("navLinks");
menuBtn.addEventListener("click", () => menuBtn.setAttribute("aria-expanded", navLinks.classList.toggle("open")));
navLinks.addEventListener("click", (e) => { if (e.target.tagName === "A") { navLinks.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false"); } });

const linkFor = {}; navLinks.querySelectorAll("a").forEach((a) => (linkFor[a.getAttribute("href").slice(1)] = a));
const io = new IntersectionObserver((entries) => entries.forEach((en) => {
  if (en.isIntersecting && linkFor[en.target.id]) {
    Object.values(linkFor).forEach((a) => a.classList.remove("active"));
    linkFor[en.target.id].classList.add("active");
  }
}), { rootMargin: "-40% 0px -55% 0px" });
Object.keys(linkFor).forEach((id) => io.observe($(id)));

$("year").textContent = new Date().getFullYear();
updateCounter();
checkBackend();
