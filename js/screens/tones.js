'use strict';

Screens.tones = (() => {
  const BASES = TONE_BASES;
  let row, base = BASES[0];

  function toneCard(t, i) {
    const el = U.h('button', {
      class: `tone-card c-${t.color}` + (Rewards.has('tone', t.id) ? ' seen' : ''),
      style: { animationDelay: `${i * 60}ms` },
      onclick: () => {
        U.replay(el, 'pop');
        Voice.seq([t.say, t.word], { gap: 400 });
        if (Rewards.learn('tone', t.id)) {
          el.classList.add('seen');
          Rewards.add(1, el);
          U.toast(`Bé học được ${t.name.toLowerCase()}! +1 ⭐`);
        }
      },
    },
      U.h('div', { class: 'tc-mark', html: Art.mark(t.id) }),
      U.h('h3', null, t.name),
      U.h('div', { class: 'tc-art', html: Art.svg(t.img) }),
      U.h('div', { class: 'tc-word' }, t.word));
    return el;
  }

  function renderRow() {
    row.innerHTML = '';
    TONES.forEach(t => {
      const s = VN.compose(base[0], base[1], t.id);
      row.append(U.h('button', {
        class: `syll c-${t.color}`,
        onclick: e => { U.replay(e.currentTarget, 'pop'); Voice.speak(s); },
      }, U.h('span', { class: 'syll-text' }, s), U.h('small', null, t.short)));
    });
  }

  function readAll() {
    const items = TONES.map(t => VN.compose(base[0], base[1], t.id));
    const btns = Array.from(row.children);
    Voice.seq(items, {
      gap: 350,
      onEach: i => btns.forEach((b, k) => b.classList.toggle('speaking', k === i)),
    });
  }

  function render(root) {
    row = U.h('div', { class: 'syll-row' });
    const baseChips = U.h('div', { class: 'chips' }, BASES.map(b => U.h('button', {
      class: 'chip' + (b === base ? ' on' : ''),
      onclick: e => {
        base = b;
        U.$$('.chip', baseChips).forEach(c => c.classList.toggle('on', c === e.currentTarget));
        renderRow();
        readAll();
      },
    }, b[0] + b[1])));

    root.append(
      U.screenHead('Dấu thanh', 'Tiếng Việt có 6 thanh. Bé chạm vào từng thẻ để nghe nhé!', 'orange'),
      U.h('div', { class: 'tone-grid' }, TONES.map(toneCard)),
      U.h('section', { class: 'card practice' },
        U.h('h2', null, '🎶 Nghe và đọc theo'),
        U.h('p', { class: 'muted' }, 'Chọn một tiếng, rồi chạm vào từng ô để nghe tiếng đó đổi dấu.'),
        baseChips,
        row,
        U.h('div', { class: 'row center' }, U.h('button', { class: 'btn c-orange', onclick: readAll }, '🔊 Đọc cả dãy'))),
    );
    renderRow();
  }

  return { render };
})();
