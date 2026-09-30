'use strict';

Screens.stickers = (() => {
  function badge(s, i) {
    const open = Rewards.isUnlocked(s.id);
    const el = U.h('button', {
      class: `sticker ${open ? 'open' : 'locked'}`,
      style: { animationDelay: `${i * 50}ms` },
      'aria-label': open ? s.name : `Chưa mở khoá, cần ${s.need} sao`,
      onclick: () => {
        if (open) {
          U.replay(el.querySelector('.badge'), 'jump');
          Sound.play('pop');
          FX.at(el, { count: 30, power: 4 });
          Voice.speak(s.name);
        } else {
          Sound.play('wrong');
          U.replay(el, 'shake');
          Voice.say(PHRASES.needStars, s.need, PHRASES.needStars2);
        }
      },
    },
      U.h('div', { class: `badge c-${s.color} ${open ? 'anim-' + s.anim : ''}`, html: Art.svg(s.id) }),
      open ? U.h('div', { class: 'ribbon' }, s.name)
        : U.h('div', { class: 'lock' }, '🔒 ', U.h('b', null, s.need), ' ⭐'));
    return el;
  }

  function render(root) {
    const { h } = U;
    const next = Rewards.nextSticker();
    const prevNeed = next ? ([...STICKERS].reverse().find(s => s.need < next.need)?.need || 0) : 0;
    const pct = next ? Math.round(((Rewards.stars - prevNeed) / (next.need - prevNeed)) * 100) : 100;

    root.append(
      U.screenHead('Góc Bé Ngoan', 'Bé học chăm để nhận sao ⭐ và mở khoá các bạn thú đáng yêu nhé!', 'pink'),
      h('section', { class: 'card star-panel' },
        h('div', { class: 'big-star' }, '⭐', h('span', null, Rewards.stars)),
        h('div', { class: 'star-progress' },
          next
            ? h('p', null, 'Còn ', h('b', null, next.need - Rewards.stars), ' ⭐ nữa để mở ', h('b', null, next.name))
            : h('p', null, '🎉 Bé đã mở khoá tất cả sticker! Siêu quá!'),
          h('div', { class: 'bar' }, h('div', { class: 'bar-fill', style: { width: Math.max(4, Math.min(100, pct)) + '%' } })),
          h('p', { class: 'muted small' }, `Đã có ${Rewards.unlockedCount}/${STICKERS.length} sticker`))),
      h('div', { class: 'sticker-grid' }, STICKERS.map(badge)),
      h('section', { class: 'card stats' },
        h('h2', null, '📒 Bé đã học được'),
        h('div', { class: 'stat-row' },
          stat('🔤', `${Rewards.count('letter')}/${LETTERS.length}`, 'chữ cái'),
          stat('🎶', `${Rewards.count('tone')}/${TONES.length}`, 'dấu thanh'),
          stat('🧩', Rewards.count('syl'), 'tiếng đã đánh vần')),
        h('div', { class: 'how' },
          h('h3', null, 'Cách nhận sao'),
          h('ul', null,
            h('li', null, 'Học một chữ cái hoặc dấu thanh mới: +1 ⭐'),
            h('li', null, 'Đánh vần được 3 tiếng mới: +1 ⭐'),
            h('li', null, 'Tìm chữ đúng ngay lần đầu: +1 ⭐'),
            h('li', null, 'Ghép xong một từ: +1 ⭐ (không sai lần nào: +2 ⭐)'))),
        h('div', { class: 'row center' },
          h('button', { class: 'btn small ghost', onclick: confirmReset }, '↺ Chơi lại từ đầu'))),
    );
  }

  function stat(icon, value, label) {
    return U.h('div', { class: 'stat' }, U.h('span', { class: 'stat-ico' }, icon), U.h('b', null, value), U.h('small', null, label));
  }

  function confirmReset() {
    const content = U.h('div', { class: 'confirm' },
      U.h('h2', null, 'Xoá hết sao và sticker?'),
      U.h('p', null, 'Bố mẹ ơi, thao tác này sẽ đưa mọi tiến độ của bé về 0 và không hoàn tác được.'),
      U.h('div', { class: 'row center' },
        U.h('button', { class: 'btn ghost', onclick: () => close() }, 'Không xoá'),
        U.h('button', {
          class: 'btn c-red',
          onclick: () => { Rewards.reset(); close(); App.refresh(); U.toast('Đã bắt đầu lại từ đầu'); },
        }, 'Xoá tiến độ')));
    const close = U.modal(content, { className: 'modal-confirm' });
  }

  return { render };
})();
