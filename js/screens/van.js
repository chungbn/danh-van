'use strict';

/* Ôn vần theo “Bảng vần” lớp 1: #/on-van là danh sách 19 bài, #/on-van/<n> là một bài. */
Screens.van = (() => {
  const ROUNDS = 8;
  const PASS = 6;   // đúng ngay lần đầu từ 6/8 câu thì được tính là qua trò chơi
  const MODES = [
    { id: 'listen', icon: '👂', label: 'Nghe – Chọn vần' },
    { id: 'word', icon: '🔎', label: 'Tìm vần trong tiếng' },
    { id: 'fill', icon: '✏️', label: 'Điền vần' },
  ];
  let st, els, timers = [];

  const later = (fn, ms) => timers.push(setTimeout(fn, ms));
  const lessonOf = r => VAN_LESSONS.find(l => l.items.includes(r));
  const exOf = r => lessonOf(r).ex[r];
  const best = () => U.store.get('vanBest', {});

  /* Số trò chơi đã qua (0 – 3) của một bài. */
  function passed(lesson) {
    const b = best()[lesson.id] || {};
    return MODES.filter(m => (b[m.id] || 0) >= PASS).length;
  }

  function saveBest(lesson, mode, score) {
    const all = best();
    const b = all[lesson.id] || (all[lesson.id] = {});
    if (score <= (b[mode] || 0)) return;
    b[mode] = score;
    U.store.set('vanBest', all);
  }

  /* Đáp án gây nhiễu: ưu tiên vần cùng bài, rồi bài kề bên. Bỏ vần là đuôi của vần đúng (oang ↔ ang). */
  function options(target, pool, n) {
    const l = lessonOf(target);
    const near = VAN_LESSONS.filter(x => Math.abs(x.n - l.n) === 1).flatMap(x => x.items);
    const ok = r => r !== target && !target.endsWith(r) && !r.endsWith(target);
    const picked = [];
    for (const src of [l.items, pool, near, VAN_LESSONS.flatMap(x => x.items)]) {
      for (const r of U.shuffle(src)) if (picked.length < n - 1 && ok(r) && !picked.includes(r)) picked.push(r);
    }
    return U.shuffle([target, ...picked]);
  }

  /* ---------- Danh sách bài ---------- */

  function renderList(root) {
    const { h } = U;
    const total = VAN_LESSONS.reduce((a, l) => a + l.items.length, 0);
    root.append(
      U.screenHead('Ôn vần', 'Bảng vần lớp 1 có 19 bài. Bé chọn một bài để nghe, đánh vần và chơi nhé!', 'teal'),
      h('p', { class: 'progress-note' }, `Bé đã nghe ${Rewards.count('van')}/${total} vần`),
      h('section', { class: 'card van-list' }, VAN_LESSONS.map((l, i) => {
        const p = passed(l);
        const heard = l.items.filter(r => Rewards.has('van', r)).length;
        return h('a', { class: `van-row c-${l.color}`, href: `#/on-van/${l.n}`, style: { animationDelay: `${i * 30}ms` } },
          h('span', { class: 'van-num' }, l.n),
          h('span', { class: 'van-items' }, l.items.join('  ')),
          h('span', { class: 'van-meta' },
            h('span', { class: 'van-stars', title: `Đã qua ${p}/3 trò chơi` }, '★'.repeat(p) + '☆'.repeat(3 - p)),
            h('small', null, `${heard}/${l.items.length} vần`)));
      })),
    );
  }

  /* ---------- Một bài ---------- */

  function hear(r, card) {
    U.$$('.van-card', els.root).forEach(c => c.classList.toggle('on', c === card));
    if (card) U.replay(card, 'pop');
    if (Rewards.learn('van', r)) {
      const n = st.lesson.items.filter(x => Rewards.has('van', x)).length;
      if (n === st.lesson.items.length) {
        Sound.play('correct');
        Rewards.add(1, card);
        U.toast(`Bé đã nghe hết các vần của Bài ${st.lesson.n}! Thưởng 1 ⭐`);
      }
      if (card) card.classList.add('seen');
    }
    showDetail(r);
    Voice.speak(VN.rhymeSay(r));
  }

  function showDetail(r) {
    const { h } = U;
    els.detail.innerHTML = '';
    const read = h('div', { class: 'read-row', 'aria-live': 'polite' });
    const spell = async w => {
      const { o, t } = VN.split(w, r);
      const parts = VN.spellParts(o, r, t);
      read.innerHTML = '';
      const chips = parts.map((p, i) => {
        if (i) read.append(h('span', { class: 'dash' }, '–'));
        const c = h('span', { class: `read-chip k-${p.key}` }, p.label);
        read.append(c);
        return c;
      });
      await Voice.seq(parts, { gap: 260, onEach: i => chips.forEach((c, k) => c.classList.toggle('speaking', k === i)) });
    };
    els.detail.append(
      h('div', { class: 'van-detail-head' },
        h('button', { class: 'van-big', onclick: () => Voice.speak(VN.rhymeSay(r)) }, r),
        h('div', null,
          h('p', { class: 'muted' }, 'Chạm vào tiếng để đánh vần:'),
          h('div', { class: 'chips' }, exOf(r).map(w => h('button', {
            class: 'chip van-ex', onclick: e => { U.replay(e.currentTarget, 'pop'); spell(w); },
          }, w))))),
      read);
  }

  async function readAll() {
    const cards = U.$$('.van-card', els.root);
    await Voice.seq(st.lesson.items.map(VN.rhymeSay), {
      gap: 450,
      onEach: i => cards.forEach((c, k) => c.classList.toggle('speaking', k === i)),
    });
  }

  function pool() {
    return st.mixed
      ? VAN_LESSONS.filter(l => l.n <= st.lesson.n).flatMap(l => l.items)
      : st.lesson.items;
  }

  function prompt() {
    const g = st.game;
    if (st.mode === 'listen') return Voice.say(PHRASES.findRhyme, VN.rhymeSay(g.target));
    if (st.mode === 'word') return Voice.seq([g.word, PHRASES.whichRhyme], { gap: 300 });
    return Voice.say(PHRASES.fillRhyme, g.word);
  }

  function newRound() {
    const { h } = U;
    const g = st.game;
    g.round++;
    g.tries = 0;
    g.locked = false;
    // Lần lượt qua các vần trong bài (xáo trộn) để bé gặp đủ vần, rồi mới lặp lại.
    if (!g.queue.length) g.queue = U.shuffle(pool().filter(r => r !== g.target));
    g.target = g.queue.shift();
    g.word = U.pick(exOf(g.target));
    const { o } = VN.split(g.word, g.target);
    g.onset = o;

    els.dots.innerHTML = '';
    for (let i = 1; i <= ROUNDS; i++) {
      els.dots.append(h('span', { class: 'dot' + (i < g.round ? (g.results[i - 1] ? ' ok' : ' miss') : i === g.round ? ' now' : '') }));
    }
    els.stage.innerHTML = '';
    els.cards.innerHTML = '';
    const opts = options(g.target, pool(), 4);
    els.cards.dataset.n = opts.length;
    opts.forEach((r, i) => {
      const color = CARD_COLORS[(i + g.round) % CARD_COLORS.length];
      const el = h('button', {
        class: `find-card c-${color}`, style: { animationDelay: `${i * 60}ms` },
        onclick: () => choose(el, r),
      }, h('span', { class: 'fc-word' }, r));
      els.cards.append(el);
    });

    const speaker = h('button', { class: 'speaker', 'aria-label': 'Nghe lại', onclick: e => { U.replay(e.currentTarget, 'pop'); prompt(); } }, '🔊');
    if (st.mode === 'listen') {
      els.stage.append(speaker, h('p', { class: 'stage-hint' }, 'Bé nghe và chạm vào vần đúng nhé!'));
    } else if (st.mode === 'word') {
      g.shown = h('div', { class: 'van-word wobble-in' }, g.word);
      els.stage.append(g.shown, h('div', { class: 'row center' }, speaker),
        h('p', { class: 'stage-hint' }, 'Tiếng này có vần gì? Bé chọn nhé!'));
    } else {
      g.blank = h('span', { class: 'van-blank' }, '?');
      g.shown = h('div', { class: 'van-word' }, o && h('span', { class: 'van-onset' }, o), g.blank);
      els.stage.append(g.shown, h('div', { class: 'row center' }, speaker),
        h('p', { class: 'stage-hint' }, 'Bé nghe tiếng rồi chọn vần còn thiếu nhé!'));
    }
    later(prompt, 350);
  }

  async function choose(el, r) {
    const g = st.game;
    if (g.locked || el.classList.contains('wrong-out')) return;
    if (r !== g.target) {
      g.tries++;
      Sound.play('wrong');
      U.replay(el, 'shake');
      el.classList.add('wrong-out');
      Voice.speak(U.pick(TRY_AGAIN));
      return;
    }
    g.locked = true;
    const first = g.tries === 0;
    g.results[g.round - 1] = first;
    if (first) g.score++;
    el.classList.add('right');
    Sound.play('correct');
    FX.at(el, { count: 70, power: 6 });
    if (first) Rewards.add(1, el);
    U.$$('.find-card', els.cards).forEach(c => { if (c !== el) c.classList.add('fade'); });

    if (st.mode === 'fill') {
      g.blank.textContent = g.word.slice(g.onset.length);
      g.blank.classList.add('filled');
    } else if (st.mode === 'word') {
      g.shown.innerHTML = '';
      g.shown.append(g.onset, U.h('span', { class: 'van-hl' }, g.word.slice(g.onset.length)));
    }
    const { o, t } = VN.split(g.word, g.target);
    const items = st.mode === 'listen' ? [VN.rhymeSay(r)] : VN.spellParts(o, r, t);
    const round = g.round;
    const done = await Voice.seq([...items, U.pick(PRAISE)], { gap: 220 });
    if (!done || !st || st.game !== g || g.round !== round) return;
    later(() => (g.round >= ROUNDS ? finish() : newRound()), 500);
  }

  function finish() {
    const g = st.game;
    const { lesson, mode } = st;
    if (!st.mixed) saveBest(lesson, mode, g.score);
    Sound.play('cheer');
    FX.celebrate({ big: g.score >= PASS });
    const great = g.score >= PASS;
    Voice.say(PHRASES.finished, g.score, PHRASES.outOf8, great ? 'Giỏi quá!' : PHRASES.keepTrying);
    const next = VAN_LESSONS.find(l => l.n === lesson.n + 1);
    const content = U.h('div', { class: 'summary' },
      U.h('div', { class: 'summary-art', html: Art.svg(great ? 'sutu' : 'cu') }),
      U.h('h2', null, great ? 'Xuất sắc! 🎉' : g.score >= 4 ? 'Giỏi lắm! 👏' : 'Cố lên bé nhé! 💪'),
      U.h('p', { class: 'summary-score' }, `Đúng ngay lần đầu: ${g.score}/${ROUNDS}`),
      U.h('p', { class: 'summary-stars' }, '⭐'.repeat(Math.max(1, Math.round(g.score / 2)))),
      !great && U.h('p', { class: 'muted' }, `Đúng từ ${PASS} câu trở lên là bé qua trò này nhé!`),
      U.h('div', { class: 'row center' },
        U.h('button', { class: 'btn c-green', onclick: () => { close(); startGame(mode); } }, '🔁 Chơi lại'),
        great && next && U.h('a', { class: 'btn c-purple', href: `#/on-van/${next.n}`, onclick: () => close() }, `Bài ${next.n} ➜`)));
    const close = U.modal(content, { className: 'modal-summary' });
  }

  function startGame(mode) {
    timers.forEach(clearTimeout); timers = [];
    Voice.stop();
    st.mode = mode;
    st.game = { round: 0, score: 0, results: [], queue: [], target: null };
    U.$$('[data-mode]', els.root).forEach(b => b.classList.toggle('on', b.dataset.mode === mode));
    newRound();
  }

  function renderLesson(root, lesson) {
    const { h } = U;
    st = { lesson, mixed: false, mode: 'listen' };
    els = { root };
    const prev = VAN_LESSONS.find(l => l.n === lesson.n - 1);
    const next = VAN_LESSONS.find(l => l.n === lesson.n + 1);
    els.detail = h('div', { class: 'van-detail' }, h('p', { class: 'muted center' }, 'Chạm vào một vần để nghe và xem tiếng ví dụ.'));
    els.dots = h('div', { class: 'round-dots' });
    els.stage = h('div', { class: 'find-stage' });
    els.cards = h('div', { class: 'find-cards' });

    root.append(
      h('div', { class: 'row van-nav' },
        h('a', { class: 'btn small ghost', href: '#/on-van' }, '← Bảng vần'),
        prev && h('a', { class: 'btn small ghost', href: `#/on-van/${prev.n}` }, `‹ Bài ${prev.n}`),
        next && h('a', { class: 'btn small ghost', href: `#/on-van/${next.n}` }, `Bài ${next.n} ›`)),
      U.screenHead(`Bài ${lesson.n}`, lesson.items.join(' · '), lesson.color),

      h('section', { class: 'card' },
        h('h2', null, '📖 Học vần'),
        h('div', { class: 'van-cards' }, lesson.items.map((r, i) => {
          const card = h('button', {
            class: `van-card c-${CARD_COLORS[i % CARD_COLORS.length]}` + (Rewards.has('van', r) ? ' seen' : ''),
            style: { animationDelay: `${i * 50}ms` },
            onclick: () => hear(r, card),
          }, h('b', null, r), h('small', null, exOf(r)[0]));
          return card;
        })),
        h('div', { class: 'row center' }, h('button', { class: 'btn c-teal', onclick: readAll }, '🔊 Đọc cả bài')),
        els.detail),

      h('section', { class: 'card find-board' },
        h('h2', null, '🎮 Luyện tập'),
        h('div', { class: 'seg big' }, MODES.map(m => h('button', {
          class: 'seg-btn', dataset: { mode: m.id }, onclick: () => { Sound.play('click'); startGame(m.id); },
        }, `${m.icon} ${m.label}`))),
        lesson.n > 1 && h('label', { class: 'van-mix' },
          h('input', { type: 'checkbox', onchange: e => { st.mixed = e.target.checked; startGame(st.mode); } }),
          ` Ôn cả các bài trước (Bài 1 → ${lesson.n})`),
        h('p', { class: 'muted small' }, `Đúng ngay lần đầu được 1 ⭐. Đúng từ ${PASS}/${ROUNDS} câu là qua trò chơi (★ ở Bảng vần).`),
        els.dots, els.stage, els.cards),
    );
    Voice.preload([...lesson.items.map(VN.rhymeSay), ...lesson.items.flatMap(exOf)]);
    startGame('listen');
  }

  function render(root) {
    timers.forEach(clearTimeout); timers = [];
    const n = Number(location.hash.split('/')[2]);
    const lesson = VAN_LESSONS.find(l => l.n === n);
    st = null;
    if (lesson) renderLesson(root, lesson);
    else renderList(root);
  }

  function destroy() { timers.forEach(clearTimeout); timers = []; st = null; }

  return { render, destroy };
})();
