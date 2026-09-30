'use strict';

const CARD_COLORS = ['red', 'orange', 'yellow', 'green', 'teal', 'blue', 'purple', 'pink'];

/* Tô đậm chữ cái trong từ ví dụ (bỏ qua dấu thanh khi so khớp). */
function highlightLetter(word, ch) {
  const plain = Array.from(VN.stripTone(word));
  const chars = Array.from(word);
  const i = plain.indexOf(ch);
  return chars.map((c, k) => k === i ? `<mark>${c}</mark>` : c).join('');
}

Screens.alphabet = (() => {
  let grid;

  function card(l, i) {
    return U.h('button', {
      class: `letter-card c-${CARD_COLORS[i % CARD_COLORS.length]}` + (Rewards.has('letter', l.ch) ? ' seen' : ''),
      style: { animationDelay: `${i * 25}ms` },
      'aria-label': `Chữ ${l.ch}`,
      onclick: () => open(i),
    }, U.h('span', { class: 'lc-upper' }, l.ch.toUpperCase()), U.h('span', { class: 'lc-lower' }, l.ch));
  }

  function open(i) {
    let idx = i;
    const body = U.h('div', { class: 'letter-detail' });
    const close = U.modal(body, { className: 'modal-letter', onClose: () => Voice.stop() });

    const show = () => {
      const l = LETTERS[idx];
      const color = CARD_COLORS[idx % CARD_COLORS.length];
      const sayLetter = () => Voice.speak(l.say);
      const sayWord = () => Voice.speak(l.word);
      body.className = `letter-detail c-${color}`;
      body.innerHTML = '';
      body.append(
        U.h('div', { class: 'ld-top' },
          U.h('button', { class: 'nav-arrow', 'aria-label': 'Chữ trước', onclick: () => go(-1) }, '‹'),
          U.h('button', { class: 'ld-letter pop', onclick: sayLetter, 'aria-label': 'Nghe đọc chữ' },
            U.h('span', null, l.ch.toUpperCase()), U.h('span', null, l.ch)),
          U.h('button', { class: 'nav-arrow', 'aria-label': 'Chữ sau', onclick: () => go(1) }, '›')),
        U.h('p', { class: 'ld-say' }, 'Đọc là: ', U.h('b', null, `“${l.say}”`)),
        U.h('button', { class: 'ld-art wobble-in', onclick: sayWord, html: Art.svg(l.img), 'aria-label': 'Nghe đọc từ' }),
        U.h('div', { class: 'ld-word', html: highlightLetter(l.word, l.ch) }),
        U.h('div', { class: 'row center' },
          U.h('button', { class: 'btn c-blue', onclick: sayLetter }, '🔊 Đọc chữ'),
          U.h('button', { class: 'btn c-green', onclick: sayWord }, '🔊 Đọc từ')),
      );
      Voice.seq([l.say, l.word], { gap: 450 });
      if (Rewards.learn('letter', l.ch)) {
        const cardEl = grid.children[idx];
        if (cardEl) cardEl.classList.add('seen');
        const note = U.$('.progress-note');
        if (note) note.textContent = `Bé đã học ${Rewards.count('letter')}/${LETTERS.length} chữ cái`;
        setTimeout(() => Rewards.add(1, body.querySelector('.ld-letter')), 300);
        U.toast(`Bé học được chữ ${l.ch.toUpperCase()}! +1 ⭐`);
      }
    };
    const go = d => { Sound.play('click'); idx = (idx + d + LETTERS.length) % LETTERS.length; show(); };
    show();
    return close;
  }

  function render(root) {
    grid = U.h('div', { class: 'alpha-grid' }, LETTERS.map(card));
    root.append(
      U.screenHead('Bảng chữ cái', 'Bé chạm vào từng chữ để nghe đọc và xem hình nhé! Mỗi chữ mới học được tặng 1 ⭐', 'red'),
      U.h('p', { class: 'progress-note' }, `Bé đã học ${Rewards.count('letter')}/${LETTERS.length} chữ cái`),
      grid,
    );
  }

  return { render };
})();
