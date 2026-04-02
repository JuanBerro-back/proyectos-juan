/* ══════════════════════════════════════════
   RetainAI SENA — main.js
   ══════════════════════════════════════════ */

"use strict";

/* ─────────────────────────────────
   1. CUSTOM CURSOR
───────────────────────────────── */
(function initCursor() {
  const cursor   = document.getElementById("cursor");
  const follower = document.getElementById("cursorFollower");
  if (!cursor || !follower) return;

  let mx = -100, my = -100, fx = -100, fy = -100;

  document.addEventListener("mousemove", (e) => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx + "px";
    cursor.style.top  = my + "px";
  });

  (function animateFollower() {
    fx += (mx - fx) * 0.11;
    fy += (my - fy) * 0.11;
    follower.style.left = fx + "px";
    follower.style.top  = fy + "px";
    requestAnimationFrame(animateFollower);
  })();

  document.addEventListener("mouseleave", () => {
    cursor.style.opacity = follower.style.opacity = "0";
  });
  document.addEventListener("mouseenter", () => {
    cursor.style.opacity = "1";
    follower.style.opacity = "0.7";
  });
})();


/* ─────────────────────────────────
   2. NAVBAR SCROLL
───────────────────────────────── */
(function initNavbar() {
  const nav = document.getElementById("navbar");
  if (!nav) return;
  window.addEventListener("scroll", () => {
    nav.classList.toggle("scrolled", window.scrollY > 50);
  }, { passive: true });
})();


/* ─────────────────────────────────
   3. HAMBURGER
───────────────────────────────── */
(function initHamburger() {
  const btn   = document.getElementById("hamburger");
  const links = document.getElementById("navLinks");
  if (!btn || !links) return;
  btn.addEventListener("click", () => links.classList.toggle("open"));
  links.querySelectorAll("a").forEach(a =>
    a.addEventListener("click", () => links.classList.remove("open"))
  );
})();


/* ─────────────────────────────────
   4. REVEAL ON SCROLL
───────────────────────────────── */
(function initReveal() {
  const elements = document.querySelectorAll(".reveal");
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.11, rootMargin: "0px 0px -36px 0px" });
  elements.forEach(el => obs.observe(el));
})();


/* ─────────────────────────────────
   5. ANIMATED COUNTERS
───────────────────────────────── */
(function initCounters() {
  const nums = document.querySelectorAll(".stat-num[data-target]");
  if (!nums.length) return;

  function animateCounter(el) {
    const target   = parseInt(el.dataset.target, 10);
    const duration = 1700;
    const start    = performance.now();
    function step(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(eased * target).toLocaleString("es-CO");
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { animateCounter(e.target); obs.unobserve(e.target); }
    });
  }, { threshold: 0.5 });
  nums.forEach(el => obs.observe(el));
})();


/* ─────────────────────────────────
   6. PARTICLE CANVAS
───────────────────────────────── */
(function initParticles() {
  const canvas = document.getElementById("particleCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let W, H, particles = [];
  const COUNT   = 55;
  const CONNECT = 125;
  const SPEED   = 0.32;
  const COLOR   = "56,189,248";
  const COLOR2  = "129,140,248";

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function mkParticle() {
    return {
      x: Math.random() * W, y: Math.random() * H,
      r: 1 + Math.random() * 2,
      vx: (Math.random() - 0.5) * SPEED,
      vy: (Math.random() - 0.5) * SPEED,
      alt: Math.random() > 0.72,
    };
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    // connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.hypot(dx, dy);
        if (dist < CONNECT) {
          ctx.strokeStyle = `rgba(${COLOR},${(1 - dist / CONNECT) * 0.11})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
    // dots
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.alt ? COLOR2 : COLOR},0.42)`;
      ctx.fill();
    });
  }

  let mouse = { x: -999, y: -999 };
  document.addEventListener("mousemove", e => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  });

  function update() {
    particles.forEach(p => {
      // gentle mouse attract
      const dx = mouse.x - p.x, dy = mouse.y - p.y;
      const d  = Math.hypot(dx, dy);
      if (d < 110) {
        p.vx += (dx / d) * 0.011;
        p.vy += (dy / d) * 0.011;
        const spd = Math.hypot(p.vx, p.vy);
        if (spd > 1.4) { p.vx /= spd / 1.4; p.vy /= spd / 1.4; }
      }
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
    });
  }

  let animId;
  function loop() { update(); draw(); animId = requestAnimationFrame(loop); }

  resize();
  particles = Array.from({ length: COUNT }, mkParticle);
  loop();

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) cancelAnimationFrame(animId); else loop();
  });
  window.addEventListener("resize", () => {
    resize();
    particles = Array.from({ length: COUNT }, mkParticle);
  }, { passive: true });
})();


/* ─────────────────────────────────
   7. ACTIVE NAV LINK
───────────────────────────────── */
(function initActiveNav() {
  const sections = document.querySelectorAll("section[id]");
  const links    = document.querySelectorAll(".nav-links a[href^='#']");
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(l => l.style.color = "");
        const a = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
        if (a) a.style.color = "var(--accent)";
      }
    });
  }, { threshold: 0.42 });
  sections.forEach(s => obs.observe(s));
})();


/* ─────────────────────────────────
   8. CARD GLOW ON MOUSE MOVE
───────────────────────────────── */
(function initCardGlow() {
  const cards = document.querySelectorAll(
    ".causa-card, .mv-card, .ia-feature, .tl-content, .team-card"
  );
  cards.forEach(card => {
    card.addEventListener("mousemove", e => {
      const r = card.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width)  * 100;
      const y = ((e.clientY - r.top)  / r.height) * 100;
      card.style.backgroundImage =
        `radial-gradient(circle at ${x}% ${y}%, rgba(56,189,248,0.05) 0%, transparent 65%)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.backgroundImage = "";
    });
  });
})();


/* ─────────────────────────────────
   9. SCROLL PROGRESS BAR
───────────────────────────────── */
(function initScrollProgress() {
  const bar = document.createElement("div");
  Object.assign(bar.style, {
    position: "fixed", top: "0", left: "0", height: "2.5px",
    width: "0%",
    background: "linear-gradient(90deg, #38bdf8, #818cf8)",
    zIndex: "10000", pointerEvents: "none",
    transition: "width 0.08s linear",
  });
  document.body.appendChild(bar);
  window.addEventListener("scroll", () => {
    const total   = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = ((window.scrollY / total) * 100).toFixed(1) + "%";
  }, { passive: true });
})();


/* ─────────────────────────────────
   10. PAGE FADE IN
───────────────────────────────── */
(function initFadeIn() {
  document.body.style.opacity = "0";
  document.body.style.transition = "opacity 0.45s ease";
  window.addEventListener("load", () => { document.body.style.opacity = "1"; });
})();


/* ─────────────────────────────────
   11. TEAM PHOTO UPLOAD HINT
   (click on placeholder opens file picker)
───────────────────────────────── */
(function initPhotoUpload() {
  document.querySelectorAll(".team-photo-placeholder:not(.team-photo-sena)").forEach(placeholder => {
    placeholder.style.cursor = "pointer";
    placeholder.title = "Haz clic para agregar una foto";

    placeholder.addEventListener("click", () => {
      const input = document.createElement("input");
      input.type  = "file";
      input.accept = "image/*";
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        const wrap = placeholder.parentElement; // .team-photo-wrap

        // Reemplazar placeholder con imagen real
        const img = document.createElement("img");
        img.src   = url;
        img.alt   = "Foto del integrante";
        img.className = "team-photo-img";
        wrap.innerHTML = "";
        wrap.appendChild(img);
      };
      input.click();
    });
  });
})();
