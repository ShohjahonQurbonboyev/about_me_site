// Year
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Burger menu
const burger = document.getElementById("burger");
const nav = document.getElementById("nav");

if (burger && nav) {
  burger.addEventListener("click", () => nav.classList.toggle("open"));
  nav.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => nav.classList.remove("open"));
  });
}

// Theme toggle (dark/light) + save
const themeBtn = document.getElementById("themeBtn");
const saved = localStorage.getItem("theme");

if (saved === "light") {
  document.body.classList.add("light");
  if (themeBtn) themeBtn.textContent = "☀️";
}

if (themeBtn) {
  themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("light");
    const isLight = document.body.classList.contains("light");
    localStorage.setItem("theme", isLight ? "light" : "dark");
    themeBtn.textContent = isLight ? "☀️" : "🌙";

    // Canvas mode ham yangilansin
    window.dispatchEvent(new Event("themechange"));
  });
}

// Copy template
const copyBtn = document.getElementById("copyBtn");
const msgTpl = document.getElementById("msgTpl");
const copyHint = document.getElementById("copyHint");

if (copyBtn && msgTpl && copyHint) {
  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(msgTpl.textContent);
      copyHint.textContent = "✅ Nusxa olindi!";
      setTimeout(() => (copyHint.textContent = ""), 1800);
    } catch {
      copyHint.textContent = "❗ Clipboard ishlamadi. Qo‘lda nusxa oling.";
    }
  });
}

// =====================
// CANVAS: NIGHT (moon+stars) / DAY (sun+clouds)
// =====================
(() => {
  const canvas = document.getElementById("space");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  let w = 0, h = 0, dpr = 1;

  const state = {
    mode: document.body.classList.contains("light") ? "day" : "night",
    stars: [],
    meteors: [],
    clouds: []
  };

  function rand(min, max) { return Math.random() * (max - min) + min; }

  function resize() {
    dpr = Math.max(1, window.devicePixelRatio || 1);
    w = window.innerWidth;
    h = window.innerHeight;

    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    initStars();
    initClouds();
  }

  window.addEventListener("resize", resize, { passive: true });
  resize();

  // ---------- STARS ----------
  function initStars() {
    state.stars.length = 0;
    const STAR_COUNT = Math.floor((w * h) / 12000);
    const count = Math.max(90, STAR_COUNT);

    for (let i = 0; i < count; i++) {
      state.stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: rand(0.6, 1.8),
        a: rand(0.25, 0.95),
        s: rand(0.15, 0.8),
        tw: rand(0.004, 0.02),
      });
    }
  }

  // ---------- METEORS ----------
  function spawnMeteor() {
    state.meteors.push({
      x: rand(w * 0.2, w * 1.2),
      y: rand(-80, h * 0.4),
      vx: rand(-10, -6),
      vy: rand(6, 10),
      life: rand(20, 40),
      max: 0
    });
  }

  setInterval(() => {
    if (state.mode === "night" && Math.random() < 0.55) spawnMeteor();
  }, 2200);

  // ---------- CLOUDS ----------
  function initClouds() {
    state.clouds.length = 0;
    const count = Math.max(6, Math.floor(w / 220));

    for (let i = 0; i < count; i++) {
      state.clouds.push({
        x: rand(-240, w + 240),
        y: rand(h * 0.08, h * 0.45),
        s: rand(0.25, 0.9),
        scale: rand(0.7, 1.6),
        a: rand(0.18, 0.35)
      });
    }
  }

  // ---------- DRAW: NIGHT ----------
  function drawNightBackground() {
    ctx.fillStyle = "rgba(0,0,0,0.12)";
    ctx.fillRect(0, 0, w, h);

    const g = ctx.createRadialGradient(
      w * 0.2, h * 0.15, 10,
      w * 0.3, h * 0.2, Math.max(w, h)
    );
    g.addColorStop(0, "rgba(124,92,255,0.18)");
    g.addColorStop(0.5, "rgba(35,213,171,0.08)");
    g.addColorStop(1, "rgba(0,0,0,0)");

    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  function drawMoon() {
    const moonX = w * 0.82;
    const moonY = h * 0.18;
    const moonR = Math.min(w, h) * 0.045;

    const moonGrad = ctx.createRadialGradient(
      moonX - moonR * 0.3, moonY - moonR * 0.3, moonR * 0.1,
      moonX, moonY, moonR
    );

    moonGrad.addColorStop(0, "rgba(255,255,255,0.95)");
    moonGrad.addColorStop(0.5, "rgba(240,240,240,0.9)");
    moonGrad.addColorStop(1, "rgba(200,200,210,0.7)");

    ctx.shadowColor = "rgba(255,255,255,0.35)";
    ctx.shadowBlur = moonR * 0.9;

    ctx.beginPath();
    ctx.fillStyle = moonGrad;
    ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;

    const craters = [
      { x: -0.2, y: -0.1, r: 0.18 },
      { x: 0.15, y: 0.1, r: 0.12 },
      { x: -0.05, y: 0.22, r: 0.09 }
    ];

    ctx.fillStyle = "rgba(180,180,190,0.6)";
    for (const c of craters) {
      ctx.beginPath();
      ctx.arc(moonX + c.x * moonR, moonY + c.y * moonR, moonR * c.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawStars() {
    for (const s of state.stars) {
      s.y += s.s;
      if (s.y > h + 5) { s.y = -5; s.x = Math.random() * w; }

      s.a += (Math.random() - 0.5) * s.tw;
      s.a = Math.max(0.15, Math.min(1, s.a));

      ctx.beginPath();
      ctx.fillStyle = `rgba(255,255,255,${s.a})`;
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawMeteors() {
    for (let i = state.meteors.length - 1; i >= 0; i--) {
      const m = state.meteors[i];
      m.x += m.vx;
      m.y += m.vy;
      m.life -= 1;
      m.max += 1;

      ctx.beginPath();
      ctx.strokeStyle = `rgba(255,255,255,${Math.max(0, 0.35 - m.max * 0.01)})`;
      ctx.lineWidth = 2;
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(m.x - m.vx * 4.5, m.y - m.vy * 4.5);
      ctx.stroke();

      if (m.life <= 0 || m.x < -200 || m.y > h + 200) state.meteors.splice(i, 1);
    }
  }

  // ---------- DRAW: DAY ----------
  function drawDayBackground() {
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, "rgba(135,206,235,0.65)");
    sky.addColorStop(1, "rgba(245,245,255,0.55)");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);
  }

  function drawSun() {
    const sunX = w * 0.82;
    const sunY = h * 0.18;
    const sunR = Math.min(w, h) * 0.06;

    ctx.beginPath();
    ctx.fillStyle = "rgba(255, 210, 70, 0.20)";
    ctx.arc(sunX, sunY, sunR * 2.2, 0, Math.PI * 2);
    ctx.fill();

    const g = ctx.createRadialGradient(
      sunX - sunR * 0.2, sunY - sunR * 0.2, sunR * 0.2,
      sunX, sunY, sunR
    );
    g.addColorStop(0, "rgba(255,245,200,0.98)");
    g.addColorStop(1, "rgba(255,180,50,0.92)");

    ctx.beginPath();
    ctx.fillStyle = g;
    ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawCloudShape(x, y, scale, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = "rgba(255,255,255,0.95)";

    ctx.beginPath();
    ctx.ellipse(x, y, 42 * scale, 22 * scale, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 32 * scale, y + 4 * scale, 36 * scale, 20 * scale, 0, 0, Math.PI * 2);
    ctx.ellipse(x - 30 * scale, y + 6 * scale, 34 * scale, 18 * scale, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 6 * scale, y - 14 * scale, 30 * scale, 18 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = alpha * 0.45;
    ctx.fillStyle = "rgba(180,200,220,0.65)";
    ctx.beginPath();
    ctx.ellipse(x + 10 * scale, y + 18 * scale, 48 * scale, 12 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function drawClouds() {
    for (const c of state.clouds) {
      c.x += c.s;
      if (c.x > w + 260) {
        c.x = -260;
        c.y = rand(h * 0.08, h * 0.45);
        c.s = rand(0.25, 0.9);
        c.scale = rand(0.7, 1.6);
        c.a = rand(0.18, 0.35);
      }
      drawCloudShape(c.x, c.y, c.scale, c.a);
    }
  }

  // ---------- THEME CHANGE ----------
  function setModeFromBody() {
    state.mode = document.body.classList.contains("light") ? "day" : "night";
    if (state.mode === "day") state.meteors.length = 0; // kunduzda meteoritlar yo‘q
  }

  window.addEventListener("themechange", setModeFromBody);
  setModeFromBody();

  // ---------- LOOP ----------
  function tick() {
    ctx.clearRect(0, 0, w, h);

    if (state.mode === "night") {
      drawNightBackground();
      drawMoon();
      drawStars();
      drawMeteors();
    } else {
      drawDayBackground();
      drawSun();
      drawClouds();
    }

    requestAnimationFrame(tick);
  }

  tick();
})();
