'use strict';

/* Pháo hoa & hoa giấy vẽ trên một canvas phủ toàn màn hình. */
const FX = (() => {
  const COLORS = ['#ff5252', '#ffd740', '#69f0ae', '#40c4ff', '#e040fb', '#ff6e40', '#fff176', '#ff80ab'];
  const reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  let canvas, ctx, parts = [], raf = null, W = 0, H = 0;

  function init() {
    canvas = document.getElementById('fx');
    ctx = canvas.getContext('2d');
    resize();
    addEventListener('resize', resize);
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function start() { if (!raf) raf = requestAnimationFrame(loop); }

  function burst(x, y, { count = 70, power = 6, colors = COLORS } = {}) {
    if (reduced) count = Math.round(count / 3);
    const base = U.pick(colors);
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = power * (0.35 + Math.random() * 0.75);
      parts.push({
        kind: Math.random() < 0.25 ? 'star' : 'dot',
        x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        life: 1, decay: 0.011 + Math.random() * 0.012,
        size: 2 + Math.random() * 3,
        color: Math.random() < 0.6 ? base : U.pick(colors),
        g: 0.07,
      });
    }
    start();
  }

  function rocket(x, targetY, delay = 0) {
    setTimeout(() => {
      Sound.play('firework');
      parts.push({ kind: 'rocket', x, y: H + 10, vx: (Math.random() - 0.5) * 1.5, vy: -(8 + Math.random() * 3), ty: targetY, life: 1, decay: 0, size: 3, color: '#fff3c4', g: 0.06 });
      start();
    }, delay);
  }

  function confetti(n = 90) {
    if (reduced) n = 30;
    for (let i = 0; i < n; i++) {
      parts.push({
        kind: 'paper', x: Math.random() * W, y: -20 - Math.random() * H * 0.4,
        vx: (Math.random() - 0.5) * 2, vy: 2 + Math.random() * 3,
        rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3,
        life: 1, decay: 0.004, size: 6 + Math.random() * 6, color: U.pick(COLORS), g: 0.02,
      });
    }
    start();
  }

  /* Pháo hoa lớn cho lúc chúc mừng. */
  function celebrate({ big = false } = {}) {
    const n = big ? 6 : 3;
    for (let i = 0; i < n; i++) rocket(W * (0.15 + Math.random() * 0.7), H * (0.15 + Math.random() * 0.3), i * 280);
    if (big) confetti();
  }

  /* Pháo hoa nhỏ bung ra ngay tại một phần tử. */
  function at(el, opts) {
    const r = el.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 2, opts);
  }

  function drawStar(x, y, r) {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const rr = i % 2 ? r * 0.45 : r;
      const a = (i * Math.PI) / 5 - Math.PI / 2;
      ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    }
    ctx.closePath(); ctx.fill();
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    const next = [];
    for (const p of parts) {
      p.vy += p.g; p.x += p.vx; p.y += p.vy;
      if (p.kind === 'rocket') {
        if (p.vy >= -1.5 || p.y <= p.ty) { burst(p.x, p.y, { count: 80, power: 6.5 }); continue; }
        ctx.globalAlpha = 1; ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, 7); ctx.fill();
        ctx.globalAlpha = 0.4; ctx.beginPath(); ctx.arc(p.x - p.vx, p.y - p.vy * 1.5, p.size * 0.8, 0, 7); ctx.fill();
        next.push(p); continue;
      }
      p.vx *= 0.985;
      p.life -= p.decay;
      if (p.life <= 0 || p.y > H + 40) continue;
      ctx.globalAlpha = Math.min(1, p.life * 1.4);
      ctx.fillStyle = p.color;
      if (p.kind === 'star') drawStar(p.x, p.y, p.size * 1.8);
      else if (p.kind === 'paper') {
        p.rot += p.vr;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2 * Math.abs(Math.cos(p.rot * 2)) + 1);
        ctx.restore();
      } else { ctx.beginPath(); ctx.arc(p.x, p.y, p.size * p.life + 0.5, 0, 7); ctx.fill(); }
      next.push(p);
    }
    parts = next;
    ctx.globalAlpha = 1;
    if (parts.length) raf = requestAnimationFrame(loop);
    else { raf = null; ctx.clearRect(0, 0, W, H); }
  }

  return { init, burst, at, celebrate, confetti };
})();
