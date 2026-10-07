/* =====================================================================
   RSVP CONFIGURATION
   ---------------------------------------------------------------------
   formBase: your Google Form's base URL (ends with "/").
   fields:   the "entry.NNNN" ID of each question in your form.
             Leave name/attending empty and the site embeds your Google
             Form in the popup instead of showing the custom form.
             See README.md → "Connect the custom RSVP form".
   answers:  the exact option text of your "attending" question.
   ===================================================================== */
const RSVP_CONFIG = {
  formBase: "https://docs.google.com/forms/d/1I1H00tBmDb4M9JOXM1fsXmf5YRjnr3xZjHULZT5BkdY/",
  fields: {
    name: "",      // e.g. "entry.123456789"
    phone: "",
    attending: "",
    guests: "",
    message: "",
  },
  answers: { yes: "Yes", no: "No" },
};

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const SVG_NS = "http://www.w3.org/2000/svg";

function svgEl(tag, attrs, parent) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const k in attrs) el.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(el);
  return el;
}

/* ------------------------------------------------------------ Toran */
function buildToran(host, strands) {
  const W = 500, H = 70;
  const svg = svgEl("svg", { viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: "none" }, host);
  const colors = ["#f28c28", "#fbf6e8", "#f5a623", "#fbf6e8"];
  // top rope of leaves + marigolds
  for (let i = 0; i <= 50; i++) {
    const x = (i / 50) * W, y = 6 + Math.sin((i / 50) * Math.PI) * 6;
    svgEl("ellipse", { cx: x, cy: y + 4, rx: 7, ry: 3, fill: i % 2 ? "#3e6b34" : "#4f8241", transform: `rotate(${i % 2 ? 35 : -35} ${x} ${y + 4})` }, svg);
    svgEl("circle", { cx: x, cy: y, r: 4.2, fill: colors[i % 4], stroke: "rgba(0,0,0,.12)", "stroke-width": .6 }, svg);
  }
  // hanging strands
  for (let s = 0; s < strands; s++) {
    const x = ((s + 0.5) / strands) * W;
    const g = svgEl("g", { class: "strand", style: `animation-delay:${-s * 0.37}s;transform-origin:${x}px 10px` }, svg);
    const len = s % 2 ? 4 : 6;
    for (let k = 0; k < len; k++) {
      svgEl("circle", { cx: x, cy: 18 + k * 8, r: 3.6, fill: k % 2 ? "#fbf6e8" : "#f28c28" }, g);
    }
    const ly = 18 + len * 8;
    svgEl("path", { d: `M${x} ${ly - 3} q5 7 0 14 q-5 -7 0 -14z`, fill: "#4f8241" }, g);
  }
}

/* ------------------------------------------------------------ Vines */
function buildVine(host) {
  const H = 1400;
  const svg = svgEl("svg", { viewBox: `0 0 120 ${H}`, preserveAspectRatio: "xMinYMin slice" }, host);
  let d = "M30 0";
  for (let y = 0; y < H; y += 120) d += ` C${55} ${y + 30}, ${8} ${y + 90}, 30 ${y + 120}`;
  svgEl("path", { d, fill: "none", stroke: "#5b7a46", "stroke-width": 2 }, svg);
  for (let y = 20; y < H; y += 34) {
    const side = (y / 34) % 2 < 1 ? 1 : -1;
    const x = 30 + Math.sin(y / 38) * 12;
    const leaf = svgEl("path", {
      d: `M${x} ${y} q${14 * side} -10 ${30 * side} 0 q${-14 * side} 10 ${-30 * side} 0z`,
      fill: side > 0 ? "#6f9a52" : "#4f7d3c", class: "leaf",
      style: `animation-delay:${-(y % 7)}s`,
    }, svg);
    if (side < 0) leaf.style.transformOrigin = "100% 50%";
    if (y % 136 < 34) flower(svg, x + 22 * side, y + 12, 9 + (y % 5));
  }
}
function flower(svg, cx, cy, r) {
  const g = svgEl("g", { transform: `translate(${cx} ${cy})` }, svg);
  for (let i = 0; i < 5; i++) {
    svgEl("ellipse", { cx: 0, cy: -r * 0.55, rx: r * 0.38, ry: r * 0.6, fill: i % 2 ? "#ec6f9c" : "#e0568a", transform: `rotate(${i * 72})`, opacity: .92 }, g);
  }
  svgEl("circle", { cx: 0, cy: 0, r: r * 0.2, fill: "#f7d36b" }, g);
}

/* ------------------------------------------------------------ Petals */
const Petals = (() => {
  const canvas = document.getElementById("petals");
  const ctx = canvas.getContext("2d");
  const palette = ["#e0568a", "#ec7aa3", "#f28c28", "#f5b041", "#fbf6e8", "#d94672"];
  let petals = [], w, h, dpr;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function make(x, y, burst) {
    return {
      x: x ?? Math.random() * w,
      y: y ?? -20 - Math.random() * h,
      size: 5 + Math.random() * 7,
      vy: burst ? -2 - Math.random() * 4 : 0.5 + Math.random() * 0.9,
      vx: burst ? (Math.random() - 0.5) * 6 : 0,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.05,
      phase: Math.random() * Math.PI * 2,
      color: palette[(Math.random() * palette.length) | 0],
      burst,
    };
  }
  function tick(t) {
    ctx.clearRect(0, 0, w, h);
    for (const p of petals) {
      if (p.burst) { p.vy += 0.08; p.vx *= 0.985; }
      p.x += p.vx + Math.sin(t / 1400 + p.phase) * 0.5;
      p.y += p.vy;
      p.rot += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.scale(1, Math.abs(Math.sin(t / 700 + p.phase)) * 0.6 + 0.4);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      if (p.y > h + 20 && !p.burst) Object.assign(p, make(), { y: -20 });
    }
    petals = petals.filter(p => !(p.burst && p.y > h + 20));
    requestAnimationFrame(tick);
  }
  return {
    start(count) {
      resize();
      window.addEventListener("resize", resize);
      for (let i = 0; i < count; i++) petals.push(make());
      requestAnimationFrame(tick);
    },
    burst(x, y, n = 70) {
      for (let i = 0; i < n; i++) petals.push(make(x, y, true));
    },
  };
})();

/* ------------------------------------------------------------ Intro */
function setupIntro() {
  const intro = document.getElementById("intro");
  let opened = false;
  function open() {
    if (opened) return;
    opened = true;
    intro.classList.add("open");
    Chant.autoplay();
    setTimeout(() => {
      document.body.classList.remove("locked");
      startReveals();
    }, reduceMotion ? 0 : 2000);
    setTimeout(() => intro.remove(), reduceMotion ? 0 : 3000);
  }
  intro.addEventListener("click", open);
  intro.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
  intro.focus({ preventScroll: true });
  if (reduceMotion) open();
  else setTimeout(open, 3500);
}

function startReveals() {
  const items = document.querySelectorAll(".reveal");
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    });
  }, { threshold: 0.15 });
  items.forEach((el, i) => {
    el.style.transitionDelay = `${Math.min(i, 8) * 0.12}s`;
    io.observe(el);
  });
}

/* ------------------------------------------------------------ RSVP */
function setupRsvp() {
  const cfg = RSVP_CONFIG;
  const modal = document.getElementById("modal");
  const form = document.getElementById("rsvpForm");
  const embed = document.getElementById("rsvpEmbed");
  const frame = document.getElementById("formFrame");
  const thanks = document.getElementById("rsvpThanks");
  const errorEl = document.getElementById("formError");
  const guestsField = form.querySelector(".guests-field");
  const formLink = document.getElementById("formLink");
  const custom = Boolean(cfg.fields.name && cfg.fields.attending);
  let lastFocus = null;

  formLink.href = cfg.formBase + "viewform";

  function openModal() {
    lastFocus = document.activeElement;
    if (custom) {
      form.hidden = false;
    } else {
      embed.hidden = false;
      if (!frame.src) frame.src = cfg.formBase + "viewform?embedded=true";
    }
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    setTimeout(() => (custom ? form.querySelector("input") : modal.querySelector(".modal-close")).focus(), 300);
  }
  function closeModal() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }

  document.getElementById("rsvpBtn").addEventListener("click", openModal);
  modal.querySelectorAll("[data-close]").forEach(el => el.addEventListener("click", closeModal));
  document.addEventListener("keydown", e => { if (e.key === "Escape" && modal.classList.contains("open")) closeModal(); });

  form.addEventListener("change", e => {
    if (e.target.name === "attending") guestsField.classList.toggle("hidden", e.target.value === "no");
  });

  form.addEventListener("submit", async e => {
    e.preventDefault();
    errorEl.textContent = "";
    const data = new FormData(form);
    const name = (data.get("name") || "").trim();
    const attending = data.get("attending");
    if (!name) { errorEl.textContent = "Please tell us your name."; form.name.focus(); return; }
    if (!attending) { errorEl.textContent = "Please let us know if you can join."; return; }

    const body = new URLSearchParams();
    const put = (key, value) => { if (cfg.fields[key] && value !== "") body.append(cfg.fields[key], value); };
    put("name", name);
    put("phone", (data.get("phone") || "").trim());
    put("attending", cfg.answers[attending]);
    if (attending === "yes") put("guests", data.get("guests") || "1");
    put("message", (data.get("message") || "").trim());

    const btn = form.querySelector(".submit-btn");
    btn.disabled = true;
    btn.textContent = "Sending…";
    try {
      // Google Forms doesn't send CORS headers, so the response is opaque;
      // a resolved request means it reached Google.
      await fetch(cfg.formBase + "formResponse", { method: "POST", mode: "no-cors", body });
      form.hidden = true;
      thanks.hidden = false;
      if (attending === "no") {
        document.getElementById("thanksTitle").textContent = "We’ll miss you!";
        document.getElementById("thanksText").textContent = "Thank you for letting us know. Your blessings mean the world to us.";
      } else {
        document.getElementById("thanksTitle").textContent = `Thank you, ${name.split(" ")[0]}!`;
        const r = btn.getBoundingClientRect();
        if (!reduceMotion) Petals.burst(r.left + r.width / 2, r.top);
      }
    } catch {
      errorEl.innerHTML = 'Couldn’t send your RSVP. Please try again, or use the Google Form link below.';
    } finally {
      btn.disabled = false;
      btn.textContent = "Send RSVP";
    }
  });
}

/* ------------------------------------------------------------ Countdown */
const EVENT_START = new Date("2026-12-20T09:00:00+05:30");
const EVENT_END = new Date("2026-12-20T14:30:00+05:30");

function setupCountdown() {
  const root = document.getElementById("countdown");
  const units = root.querySelector(".countdown-units");
  const done = root.querySelector(".countdown-done");
  const els = {};
  root.querySelectorAll("[data-unit]").forEach(el => (els[el.dataset.unit] = el));

  function set(unit, value) {
    const text = String(value).padStart(2, "0");
    const el = els[unit];
    if (el.textContent === text) return;
    el.textContent = text;
    if (!reduceMotion) { el.classList.remove("tick"); void el.offsetWidth; el.classList.add("tick"); }
  }
  function update() {
    const now = Date.now();
    const ms = EVENT_START - now;
    if (ms <= 0) {
      units.hidden = true;
      done.hidden = false;
      done.textContent = now < EVENT_END ? "The celebration is today!" : "Thank you for celebrating with us";
      root.querySelector(".countdown-label").hidden = true;
      if (now >= EVENT_END) root.querySelector(".calendar-link").hidden = true;
      return false;
    }
    const s = Math.floor(ms / 1000);
    set("days", Math.floor(s / 86400));
    set("hours", Math.floor(s / 3600) % 24);
    set("minutes", Math.floor(s / 60) % 60);
    set("seconds", s % 60);
    return true;
  }
  if (update()) {
    const timer = setInterval(() => { if (!update()) clearInterval(timer); }, 1000);
  }
}

/* ------------------------------------------------------------ Ganesha stuti
   Plays assets/ganesha-stuti.mp3 if you add one (see README). Without it, a
   calm chant is synthesised in the browser: a sung "Om", tanpura drone,
   temple bells and reverb. Browsers only allow sound after the visitor
   interacts, so it starts with the tap that opens the doors. */
const CHANT = { file: "assets/ganesha-stuti.mp3", volume: 0.45 };

const Chant = (() => {
  const btn = document.getElementById("soundToggle");
  let audio = null, useFile = true, ctx = null, master = null, loopTimer = null;
  let playing = false, wanted = true;
  try { wanted = localStorage.getItem("chantMuted") !== "1"; } catch {}

  // Try the recording first; fall back to synthesis if it's missing.
  audio = new Audio();
  audio.loop = true;
  audio.preload = "auto";
  audio.volume = 0;
  audio.addEventListener("error", () => {
    useFile = false;
    if (playing) { playing = false; start(); }
  });
  audio.src = CHANT.file;

  function fadeAudio(to, ms, then) {
    const from = audio.volume, t0 = performance.now();
    (function step(t) {
      const k = Math.min(1, (t - t0) / ms);
      audio.volume = from + (to - from) * k;
      if (k < 1) requestAnimationFrame(step); else if (then) then();
    })(t0);
  }

  /* ---- synthesis ---- */
  const SA = 138.59; // C#3, a comfortable chanting pitch

  function initCtx() {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0;
    const comp = ctx.createDynamicsCompressor();
    const reverb = ctx.createConvolver();
    const len = ctx.sampleRate * 4;
    const ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = ir.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
    }
    reverb.buffer = ir;
    const wet = ctx.createGain(); wet.gain.value = 0.55;
    const dry = ctx.createGain(); dry.gain.value = 0.7;
    master.connect(dry).connect(comp);
    master.connect(reverb).connect(wet).connect(comp);
    comp.connect(ctx.destination);
  }

  function pluck(freq, t, gain) {
    const out = ctx.createGain();
    out.gain.setValueAtTime(0.0001, t);
    out.gain.exponentialRampToValueAtTime(gain, t + 0.03);
    out.gain.exponentialRampToValueAtTime(0.0001, t + 5);
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(2400, t);
    lp.frequency.exponentialRampToValueAtTime(500, t + 4);
    lp.connect(out).connect(master);
    [0, 3, -4].forEach(detune => {
      const o = ctx.createOscillator();
      o.type = "sawtooth";
      o.frequency.value = freq;
      o.detune.value = detune;
      o.connect(lp);
      o.start(t); o.stop(t + 5.1);
    });
  }

  function om(t, dur, freq, gain) {
    const src = ctx.createOscillator();
    src.type = "sawtooth";
    src.frequency.value = freq;
    const vib = ctx.createOscillator(), vibAmt = ctx.createGain();
    vib.frequency.value = 4.8; vibAmt.gain.value = freq * 0.006;
    vib.connect(vibAmt).connect(src.frequency);

    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(gain, t + 1.4);
    env.gain.setValueAtTime(gain, t + dur - 1.8);
    env.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    env.connect(master);

    // "O": vowel formants, crossfading into "M": a closed-mouth hum
    const vowel = ctx.createGain(), hum = ctx.createGain();
    const mid = t + dur * 0.45;
    vowel.gain.setValueAtTime(1, t); vowel.gain.setValueAtTime(1, mid); vowel.gain.linearRampToValueAtTime(0.02, mid + 1.2);
    hum.gain.setValueAtTime(0.02, t); hum.gain.setValueAtTime(0.02, mid); hum.gain.linearRampToValueAtTime(1, mid + 1.2);
    vowel.connect(env); hum.connect(env);
    [[450, 9, 1], [800, 10, 0.45], [2830, 14, 0.08]].forEach(([f, q, g]) => {
      const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = f; bp.Q.value = q;
      const fg = ctx.createGain(); fg.gain.value = g * 4;
      src.connect(bp).connect(fg).connect(vowel);
    });
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 320; lp.Q.value = 2;
    const lg = ctx.createGain(); lg.gain.value = 1.4;
    src.connect(lp).connect(lg).connect(hum);

    src.start(t); vib.start(t);
    src.stop(t + dur + 0.1); vib.stop(t + dur + 0.1);
  }

  function bell(t, base, gain) {
    [[1, 1], [2.76, 0.5], [5.4, 0.25], [8.93, 0.12]].forEach(([r, g]) => {
      const o = ctx.createOscillator(), e = ctx.createGain();
      o.type = "sine"; o.frequency.value = base * r;
      e.gain.setValueAtTime(0.0001, t);
      e.gain.exponentialRampToValueAtTime(gain * g, t + 0.01);
      e.gain.exponentialRampToValueAtTime(0.0001, t + 7 / Math.sqrt(r));
      o.connect(e).connect(master);
      o.start(t); o.stop(t + 7.5);
    });
  }

  // One 12-second cycle: tanpura Pa–Sa–Sa–Sa twice, an Om on each half.
  let cycle = 0;
  function scheduleCycle() {
    const t = ctx.currentTime + 0.1;
    const notes = [SA * 0.75, SA, SA, SA / 2];
    for (let i = 0; i < 8; i++) pluck(notes[i % 4], t + i * 1.5, 0.05);
    om(t + 0.3, 5.6, SA, 0.16);
    om(t + 0.3, 5.6, SA / 2, 0.07);
    om(t + 6.3, 5.4, SA, 0.15);
    om(t + 6.3, 5.4, SA / 2, 0.07);
    if (cycle % 2 === 0) bell(t + 0.05, 698, 0.05);
    cycle++;
  }

  /* ---- controls ---- */
  function render() {
    btn.setAttribute("aria-pressed", String(playing));
    btn.setAttribute("aria-label", playing ? "Pause Ganesha stuti" : "Play Ganesha stuti");
  }

  function start() {
    if (playing) return;
    playing = true;
    render();
    if (useFile) {
      audio.play().then(() => fadeAudio(CHANT.volume, 2500)).catch(err => {
        if (err && err.name === "NotAllowedError") { playing = false; render(); }
      });
      return;
    }
    initCtx();
    ctx.resume().then(() => {
      if (ctx.state !== "running") { playing = false; render(); return; }
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(CHANT.volume, ctx.currentTime, 1);
      if (!loopTimer) { scheduleCycle(); loopTimer = setInterval(scheduleCycle, 12000); }
    });
  }

  function stop() {
    if (!playing) return;
    playing = false;
    render();
    if (useFile) { fadeAudio(0, 600, () => audio.pause()); return; }
    if (!ctx) return;
    master.gain.setTargetAtTime(0, ctx.currentTime, 0.25);
    clearInterval(loopTimer); loopTimer = null;
    setTimeout(() => { if (!playing) ctx.suspend(); }, 1500);
  }

  btn.addEventListener("click", () => {
    wanted = !playing;
    try { localStorage.setItem("chantMuted", wanted ? "0" : "1"); } catch {}
    wanted ? start() : stop();
  });

  // Pause while the tab is hidden; resume on return.
  let pausedByHide = false;
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { pausedByHide = playing; stop(); }
    else if (pausedByHide) { pausedByHide = false; start(); }
  });

  // If the doors opened by themselves (no tap), start on the first interaction.
  function unlock() {
    ["pointerdown", "keydown", "touchend"].forEach(e => document.removeEventListener(e, unlock, true));
    if (wanted) start();
  }
  ["pointerdown", "keydown", "touchend"].forEach(e => document.addEventListener(e, unlock, true));

  render();
  return { autoplay() { if (wanted) start(); } };
})();

/* ------------------------------------------------------------ Init */
buildToran(document.getElementById("introToran"), 9);
buildToran(document.getElementById("cardToran"), 11);
document.querySelectorAll(".vine").forEach(buildVine);
setupRsvp();
setupCountdown();
setupIntro();
if (!reduceMotion) Petals.start(window.innerWidth < 640 ? 18 : 32);
