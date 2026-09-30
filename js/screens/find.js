'use strict';

Screens.find = (() => {
  const ROUNDS = 10;
  const MODES = [
    { id: 'letter', icon: '👂', label: 'Nghe – Tìm chữ' },
    { id: 'picture', icon: '👂', label: 'Nghe – Tìm hình' },
    { id: 'word', icon: '👀', label: 'Nhìn hình – Chọn từ' },
  ];
  let st, els, timers = [];

  const later = (fn, ms) => timers.push(setTimeout(fn, ms));
  const optionCount = round => (round < 3 ? 3 : round < 7 ? 4 : 6);

  function letterOptions(target, n) {
    const group = LOOKALIKE.find(g => g.includes(target.ch));
    const similar = group ? U.shuffle(group.filter(c => c !== target.ch)).slice(0, 1) : [];
    const rest = U.shuffle(LETTERS.map(l => l.ch).filter(c => c !== target.ch && !similar.includes(c)));
    return U.shuffle([target.ch, ...similar, ...rest].slice(0, n));
  }

  function prompt() {
    const t = st.target;
    if (st.mode === 'letter') return Voice.say(PHRASES.findLetter, t.say);
    if (st.mode === 'picture') return Voice.say(PHRASES.findPicture, t.w);
    return Voice.speak(PHRASES.findWord);
  }

  function newRound() {
    st.round++;
    st.tries = 0;
    st.locked = false;
    const n = optionCount(st.round);
    els.dots.innerHTML = '';
    for (let i = 1; i <= ROUNDS; i++) {
      els.dots.append(U.h('span', { class: 'dot' + (i < st.round ? (st.results[i - 1] ? ' ok' : ' miss') : i === st.round ? ' now' : '') }));
    }
    els.cards.innerHTML = '';
    els.cards.dataset.n = n;
    els.stage.innerHTML = '';

    if (st.mode === 'letter') {
      st.target = U.pick(LETTERS.filter(l => l.ch !== st.last));
      st.last = st.target.ch;
      letterOptions(st.target, n).forEach((ch, i) => addCard(ch === st.target.ch,
        U.h('span', { class: 'fc-letter' }, ch), ch, i));
      els.stage.append(speakerBtn(), U.h('p', { class: 'stage-hint' }, 'Bé nghe và chạm vào chữ đúng nhé!'));
    } else {
      st.target = U.pick(WORDS.filter(w => w.w !== st.last));
      st.last = st.target.w;
      const others = U.sample(WORDS.filter(w => w.w !== st.target.w && w.img !== st.target.img), n - 1);
      U.shuffle([st.target, ...others]).forEach((w, i) => {
        const content = st.mode === 'picture'
          ? U.h('span', { class: 'fc-art', html: Art.svg(w.img) })
          : U.h('span', { class: 'fc-word' }, w.w);
        addCard(w === st.target, content, w.w, i);
      });
      if (st.mode === 'picture') {
        els.stage.append(speakerBtn(), U.h('p', { class: 'stage-hint' }, 'Bé nghe và chạm vào hình đúng nhé!'));
      } else {
        els.stage.append(
          U.h('div', { class: 'stage-art wobble-in', html: Art.svg(st.target.img) }),
          U.h('p', { class: 'stage-hint' }, 'Bé chọn chữ đúng với hình nhé!'));
      }
    }
    later(prompt, 350);
  }

  function speakerBtn() {
    return U.h('button', { class: 'speaker', 'aria-label': 'Nghe lại', onclick: e => { U.replay(e.currentTarget, 'pop'); prompt(); } }, '🔊');
  }

  function addCard(correct, content, speakText, i) {
    const color = CARD_COLORS[(i + st.round) % CARD_COLORS.length];
    const el = U.h('button', {
      class: `find-card c-${color}`, style: { animationDelay: `${i * 60}ms` },
      onclick: () => choose(el, correct, speakText),
    }, content);
    els.cards.append(el);
  }

  function choose(el, correct, text) {
    if (st.locked || el.classList.contains('wrong-out')) return;
    if (correct) {
      st.locked = true;
      const first = st.tries === 0;
      st.results[st.round - 1] = first;
      if (first) st.score++;
      el.classList.add('right');
      Sound.play('correct');
      FX.at(el, { count: 90, power: 7 });
      later(() => Sound.play('firework'), 150);
      const praise = U.pick(PRAISE);
      Voice.seq(st.mode === 'letter' ? [praise] : [text, praise]);
      if (first) Rewards.add(1, el);
      U.$$('.find-card', els.cards).forEach(c => { if (c !== el) c.classList.add('fade'); });
      later(() => (st.round >= ROUNDS ? finish() : newRound()), 2200);
    } else {
      st.tries++;
      Sound.play('wrong');
      U.replay(el, 'shake');
      el.classList.add('wrong-out');
      Voice.speak(U.pick(TRY_AGAIN));
    }
  }

  function finish() {
    Sound.play('cheer');
    FX.celebrate({ big: true });
    const bonus = st.score >= 8 ? 2 : 0;
    Voice.say(PHRASES.finished, st.score, PHRASES.outOf, st.score >= 8 ? 'Giỏi quá!' : PHRASES.keepTrying);
    const content = U.h('div', { class: 'summary' },
      U.h('div', { class: 'summary-art', html: Art.svg(st.score >= 8 ? 'sutu' : 'cu') }),
      U.h('h2', null, st.score >= 8 ? 'Xuất sắc! 🎉' : st.score >= 5 ? 'Giỏi lắm! 👏' : 'Cố lên bé nhé! 💪'),
      U.h('p', { class: 'summary-score' }, `Đúng ngay lần đầu: ${st.score}/${ROUNDS}`),
      U.h('p', { class: 'summary-stars' }, '⭐'.repeat(Math.max(1, Math.round(st.score / 2)))),
      bonus ? U.h('p', null, `Thưởng thêm ${bonus} ⭐ vì bé làm rất tốt!`) : null,
      U.h('div', { class: 'row center' },
        U.h('button', { class: 'btn c-green', onclick: () => { close(); start(st.mode); } }, '🔁 Chơi lại'),
        U.h('a', { class: 'btn c-purple', href: '#/ghep-tu', onclick: () => close() }, '✋ Chơi Ghép từ')));
    const close = U.modal(content, { className: 'modal-summary' });
    if (bonus) later(() => Rewards.add(bonus, content.querySelector('.summary-stars')), 600);
  }

  function start(mode) {
    timers.forEach(clearTimeout); timers = [];
    st = { mode, round: 0, score: 0, results: [], last: null };
    U.$$('[data-mode]', els.root).forEach(b => b.classList.toggle('on', b.dataset.mode === mode));
    newRound();
  }

  function render(root) {
    const { h } = U;
    els = { root };
    els.dots = h('div', { class: 'round-dots' });
    els.stage = h('div', { class: 'find-stage' });
    els.cards = h('div', { class: 'find-cards' });
    root.append(
      U.screenHead('Trò chơi Tìm chữ', 'Luyện nghe và nhìn thật nhanh. Chọn đúng ngay lần đầu được 1 ⭐!', 'blue'),
      h('div', { class: 'seg big' }, MODES.map(m => h('button', {
        class: 'seg-btn', dataset: { mode: m.id }, onclick: () => { Sound.play('click'); start(m.id); },
      }, `${m.icon} ${m.label}`))),
      h('section', { class: 'card find-board' }, els.dots, els.stage, els.cards),
    );
    start('letter');
  }

  function destroy() { timers.forEach(clearTimeout); timers = []; }

  return { render, destroy };
})();
