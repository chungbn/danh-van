'use strict';

Screens.home = {
  render(root) {
    const { h } = U;
    const greet = () => {
      Sound.play('pop');
      U.replay(mascot, 'jump');
      Voice.speak(PHRASES.greet);
    };
    const mascot = h('button', { class: 'mascot', 'aria-label': 'Bạn Cú chào bé', onclick: greet, html: Art.svg('cu') });

    const tiles = [
      { href: '#/chu-cai', color: 'red', art: Art.svg('tao'), title: 'Bảng chữ cái', desc: `Đã học ${Rewards.count('letter')}/${LETTERS.length} chữ` },
      { href: '#/dau-thanh', color: 'orange', art: `<span class="tile-mark">${Art.mark('hoi')}</span>`, title: 'Dấu thanh', desc: `Đã học ${Rewards.count('tone')}/${TONES.length} dấu` },
      { href: '#/danh-van', color: 'green', art: Art.svg('ong'), title: 'Tập đánh vần', desc: 'Ghép âm đầu + vần + dấu' },
      { href: '#/on-van', color: 'teal', art: Art.svg('ech'), title: 'Ôn vần', desc: `19 bài · đã nghe ${Rewards.count('van')} vần` },
      { href: '#/tim-chu', color: 'blue', art: Art.svg('sao'), title: 'Tìm chữ cái', desc: 'Nghe, nhìn và chọn thật nhanh' },
      { href: '#/ghep-tu', color: 'purple', art: Art.svg('xe'), title: 'Kéo thả ghép từ', desc: 'Kéo chữ vào đúng ô trống' },
      { href: '#/goc-be-ngoan', color: 'pink', art: Art.svg('meo'), title: 'Góc Bé Ngoan', desc: `${Rewards.unlockedCount}/${STICKERS.length} sticker · ${Rewards.stars} ⭐` },
    ];

    root.append(
      h('section', { class: 'hero' },
        mascot,
        h('div', { class: 'bubble' },
          h('h1', null, 'Chào bé yêu! 👋'),
          h('p', null, 'Cùng bạn Cú học chữ cái, tập đánh vần và chơi thật vui nào!'),
          h('button', { class: 'btn c-orange', onclick: greet }, '🔊 Nghe bạn Cú nói'))),
      h('div', { class: 'home-grid' },
        tiles.map((t, i) => h('a', { class: `tile c-${t.color}`, href: t.href, style: { animationDelay: `${i * 70}ms` } },
          h('div', { class: 'tile-art', html: t.art }),
          h('div', { class: 'tile-text' }, h('h2', null, t.title), h('p', null, t.desc))))),
    );
  },
};
