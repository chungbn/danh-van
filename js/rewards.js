'use strict';

/* Hệ thống sao thưởng, tiến độ học và mở khoá sticker. */
const Rewards = (() => {
  let stars, unlocked, learned;
  const pending = [];
  let showing = false;

  function load() {
    stars = U.store.get('stars', 0);
    unlocked = new Set(U.store.get('stickers', []));
    learned = U.store.get('learned', {});   // { letter: [...], tone: [...], syl: [...] }
  }

  function save() {
    U.store.set('stars', stars);
    U.store.set('stickers', [...unlocked]);
    U.store.set('learned', learned);
  }

  function renderBadge(pulse) {
    const el = document.getElementById('starCount');
    if (el) el.textContent = stars;
    if (pulse) U.replay(document.getElementById('starBadge'), 'pulse');
  }

  function flyStar(fromEl) {
    const badge = document.getElementById('starBadge');
    if (!fromEl || !badge || !fromEl.isConnected) return Promise.resolve();
    const a = fromEl.getBoundingClientRect(), b = badge.getBoundingClientRect();
    const s = U.h('div', { class: 'fly-star' }, '⭐');
    document.body.append(s);
    const x0 = a.left + a.width / 2, y0 = a.top + a.height / 2;
    const x1 = b.left + 18, y1 = b.top + b.height / 2;
    const anim = s.animate([
      { transform: `translate(${x0}px, ${y0}px) scale(.6)`, opacity: 0 },
      { transform: `translate(${x0}px, ${y0 - 60}px) scale(1.6)`, opacity: 1, offset: 0.3 },
      { transform: `translate(${x1}px, ${y1}px) scale(.8)`, opacity: 1 },
    ], { duration: 900, easing: 'cubic-bezier(.5,0,.3,1)' });
    return new Promise(res => { anim.onfinish = () => { s.remove(); res(); }; });
  }

  function add(n = 1, fromEl) {
    stars += n;
    const newly = STICKERS.filter(s => stars >= s.need && !unlocked.has(s.id));
    newly.forEach(s => unlocked.add(s.id));
    save();
    flyStar(fromEl).then(() => { renderBadge(true); Sound.play('star'); });
    if (newly.length) {
      pending.push(...newly);
      setTimeout(showNext, 2000);
    }
  }

  function showNext() {
    if (showing || !pending.length) return;
    showing = true;
    const s = pending.shift();
    Sound.play('unlock');
    FX.celebrate({ big: true });
    Voice.say(PHRASES.gotSticker, s.name);
    const content = U.h('div', { class: 'unlock' },
      U.h('div', { class: 'unlock-rays' }),
      U.h('p', { class: 'unlock-kicker' }, '🎉 Sticker mới! 🎉'),
      U.h('div', { class: `badge big c-${s.color} anim-${s.anim}`, html: Art.svg(s.id) }),
      U.h('h2', null, s.name),
      U.h('p', null, 'Bé chăm học quá! Sticker đã được dán vào Góc Bé Ngoan.'),
      U.h('div', { class: 'row center' },
        U.h('a', { class: 'btn c-pink', href: '#/goc-be-ngoan', onclick: () => close() }, '🏆 Xem bộ sưu tập'),
        U.h('button', { class: 'btn c-green', onclick: () => close() }, 'Học tiếp ➜')));
    const close = U.modal(content, {
      className: 'modal-unlock',
      onClose: () => { showing = false; setTimeout(showNext, 400); },
    });
  }

  /* Ghi nhận một mục đã học; trả về true nếu là lần đầu. */
  function learn(kind, key) {
    const list = learned[kind] || (learned[kind] = []);
    if (list.includes(key)) return false;
    list.push(key);
    save();
    return true;
  }

  function count(kind) { return (learned[kind] || []).length; }
  function has(kind, key) { return (learned[kind] || []).includes(key); }

  function nextSticker() { return STICKERS.find(s => !unlocked.has(s.id)) || null; }

  function reset() {
    U.store.set('stars', 0); U.store.set('stickers', []); U.store.set('learned', {});
    load(); renderBadge(true);
  }

  function init() { load(); renderBadge(false); }

  return {
    init, add, learn, count, has, reset, nextSticker,
    isUnlocked: id => unlocked.has(id),
    get stars() { return stars; },
    get unlockedCount() { return unlocked.size; },
  };
})();
