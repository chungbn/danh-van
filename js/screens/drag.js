'use strict';

Screens.drag = (() => {
  const LEVELS = [
    { id: 'de', label: '🐣 Dễ', blanks: () => 1, extra: 1 },
    { id: 'vua', label: '🐥 Vừa', blanks: n => Math.max(1, Math.ceil(n / 2)), extra: 2 },
    { id: 'kho', label: '🦅 Khó', blanks: n => n, extra: 3 },
  ];
  let st, els, timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));

  function distractors(blanks, count) {
    const out = [];
    for (const ch of blanks) {
      const plain = VN.stripTone(ch);
      if (plain !== ch && Math.random() < 0.6) {
        const other = VN.applyTone(plain, U.pick(TONES.filter(t => t.id !== VN.toneOf(ch))).id);
        if (!blanks.includes(other)) out.push(other);
      }
    }
    const pool = U.shuffle(LETTERS.map(l => l.ch).filter(c => !blanks.includes(c)));
    while (out.length < count && pool.length) out.push(pool.pop());
    return out.slice(0, count);
  }

  function newRound() {
    st.locked = false;
    st.mistakes = 0;
    st.word = U.pick(WORDS.filter(w => w.w !== st.last && Array.from(w.w).length >= 2));
    st.last = st.word.w;
    const letters = Array.from(st.word.w);
    const level = LEVELS.find(l => l.id === st.level);
    const blankIdx = U.sample(letters.map((_, i) => i), level.blanks(letters.length)).sort((a, b) => a - b);
    const blanks = blankIdx.map(i => letters[i]);

    els.art.innerHTML = Art.svg(st.word.img);
    U.replay(els.art, 'wobble-in');
    els.slots.innerHTML = '';
    letters.forEach((ch, i) => {
      const blank = blankIdx.includes(i);
      els.slots.append(U.h('div', {
        class: 'slot' + (blank ? '' : ' fixed'), dataset: { expect: ch, idx: i },
      }, blank ? '' : ch));
    });

    els.tray.innerHTML = '';
    U.shuffle([...blanks, ...distractors(blanks, level.extra)]).forEach((ch, i) => {
      const tile = U.h('div', {
        class: `tile-letter c-${CARD_COLORS[i % CARD_COLORS.length]}`, dataset: { ch },
        role: 'button', tabindex: '0', 'aria-label': `Chữ ${ch}`,
        style: { animationDelay: `${i * 50}ms` },
      }, ch);
      tile.addEventListener('pointerdown', e => startDrag(e, tile));
      tile.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tapPlace(tile); } });
      els.tray.append(tile);
    });
    els.next.hidden = true;
    els.round.textContent = `Từ thứ ${++st.count}`;
    later(() => Voice.say(PHRASES.dragPrompt, st.word.w), 300);
  }

  function startDrag(e, tile) {
    if (st.locked || tile.classList.contains('used') || e.button > 0) return;
    e.preventDefault();
    Sound.play('pick');
    const rect = tile.getBoundingClientRect();
    const ghost = tile.cloneNode(true);
    ghost.classList.add('ghost');
    Object.assign(ghost.style, { left: rect.left + 'px', top: rect.top + 'px', width: rect.width + 'px', height: rect.height + 'px', animation: 'none' });
    document.body.append(ghost);
    tile.classList.add('dragging');
    const sx = e.clientX, sy = e.clientY;
    let moved = false, over = null;

    const move = ev => {
      const dx = ev.clientX - sx, dy = ev.clientY - sy;
      if (Math.hypot(dx, dy) > 6) moved = true;
      ghost.style.transform = `translate(${dx}px, ${dy}px) scale(1.12) rotate(${Math.max(-12, Math.min(12, dx / 12))}deg)`;
      const slot = document.elementFromPoint(ev.clientX, ev.clientY)?.closest('.slot:not(.fixed):not(.filled)');
      if (slot !== over) { over?.classList.remove('over'); over = slot; over?.classList.add('over'); }
    };
    const up = ev => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      over?.classList.remove('over');
      tile.classList.remove('dragging');
      if (!moved) { ghost.remove(); tapPlace(tile); return; }
      const slot = ev.type === 'pointerup' ? document.elementFromPoint(ev.clientX, ev.clientY)?.closest('.slot') : null;
      const ok = slot && tryPlace(tile, slot);
      if (ok) { ghost.remove(); return; }
      // Bay về khay
      const back = ghost.animate([{ transform: ghost.style.transform }, { transform: 'translate(0,0) scale(1)' }], { duration: 260, easing: 'ease-out' });
      back.onfinish = () => ghost.remove();
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  }

  /* Chạm (không kéo): đặt chữ vào ô trống đầu tiên. */
  function tapPlace(tile) {
    if (st.locked || tile.classList.contains('used')) return;
    const slot = U.$('.slot:not(.fixed):not(.filled)', els.slots);
    if (slot) tryPlace(tile, slot);
  }

  function tryPlace(tile, slot) {
    if (slot.classList.contains('fixed') || slot.classList.contains('filled')) return false;
    const ch = tile.dataset.ch;
    if (ch !== slot.dataset.expect) {
      st.mistakes++;
      Sound.play('wrong');
      U.replay(slot, 'shake');
      U.replay(tile, 'shake');
      Voice.say(PHRASES.dragWrong, VN.letterSay(ch));
      return false;
    }
    slot.textContent = ch;
    slot.classList.add('filled');
    U.replay(slot, 'pop');
    tile.classList.add('used');
    Sound.play('drop');
    FX.at(slot, { count: 20, power: 3 });
    if (U.$('.slot:not(.fixed):not(.filled)', els.slots)) Voice.speak(VN.letterSay(ch));
    else complete();
    return true;
  }

  async function complete() {
    st.locked = true;
    const earned = st.mistakes === 0 ? 2 : 1;
    U.$$('.slot', els.slots).forEach((s, i) => setTimeout(() => U.replay(s, 'jump'), i * 90));
    Sound.play('cheer');
    FX.celebrate();
    Rewards.add(earned, els.slots);
    els.next.hidden = false;
    const w = st.word;
    await Voice.seq([...VN.spellParts(w.o, w.r, w.t), U.pick(PRAISE)], { gap: 240 });
  }

  function start(level) {
    timers.forEach(clearTimeout); timers = [];
    st = { level, count: 0, last: null };
    U.$$('[data-level]', els.root).forEach(b => b.classList.toggle('on', b.dataset.level === level));
    newRound();
  }

  function render(root) {
    const { h } = U;
    els = { root };
    els.art = h('button', { class: 'drag-art', 'aria-label': 'Nghe đọc từ', onclick: () => Voice.speak(st.word.w) });
    els.slots = h('div', { class: 'slots' });
    els.tray = h('div', { class: 'tray' });
    els.round = h('span', { class: 'round-label' });
    els.next = h('button', { class: 'btn big c-green next-btn', onclick: () => { Sound.play('click'); newRound(); } }, 'Từ tiếp theo ➜');
    root.append(
      U.screenHead('Kéo thả ghép từ', 'Bé kéo chữ cái vào đúng ô trống để ghép thành từ nhé! (Chạm vào chữ cũng được)', 'purple'),
      h('div', { class: 'seg' }, LEVELS.map(l => h('button', {
        class: 'seg-btn', dataset: { level: l.id }, onclick: () => { Sound.play('click'); start(l.id); },
      }, l.label))),
      h('section', { class: 'card drag-board' },
        h('div', { class: 'drag-top' }, els.round,
          h('button', { class: 'btn small c-blue', onclick: () => Voice.speak(st.word.w) }, '🔊 Nghe từ')),
        els.art,
        els.slots,
        h('p', { class: 'muted center' }, '👇 Kéo chữ từ đây lên ô trống'),
        els.tray,
        h('div', { class: 'row center' }, els.next)),
    );
    start('de');
  }

  function destroy() { timers.forEach(clearTimeout); timers = []; U.$$('.tile-letter.ghost').forEach(g => g.remove()); }

  return { render, destroy };
})();
