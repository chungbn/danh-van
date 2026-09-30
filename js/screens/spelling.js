'use strict';

Screens.spelling = (() => {
  let st, els;

  function set(patch) {
    Object.assign(st, patch);
    if (VN.isStop(st.r) && !['sac', 'nang'].includes(st.t)) st.t = 'sac';
    update();
  }

  function update() {
    const { o, r, t } = st;
    const check = VN.check(o, r);
    const word = VN.compose(o, r, t);
    const pic = WORD_BY_TEXT[word];

    els.onset.textContent = o || '–';
    els.onset.classList.toggle('empty', !o);
    els.rhyme.textContent = r;
    els.tone.innerHTML = Art.mark(t) + `<small>${TONE_BY_ID[t].short}</small>`;
    els.result.textContent = word;
    els.result.classList.toggle('invalid', !check.ok);
    U.replay(els.result, 'pop');
    els.pic.innerHTML = pic ? Art.svg(pic.img) : '';
    els.pic.hidden = !pic;

    els.read.innerHTML = '';
    if (check.ok) {
      VN.spellParts(o, r, t).forEach((p, i) => {
        if (i) els.read.append(U.h('span', { class: 'dash' }, '–'));
        els.read.append(U.h('span', { class: `read-chip k-${p.key}` }, p.label));
      });
    }

    els.warn.innerHTML = '';
    els.warn.hidden = check.ok;
    if (!check.ok) {
      els.warn.append(U.h('span', null, '💡 ' + check.msg));
      if (check.fix) els.warn.append(U.h('button', { class: 'btn small c-yellow', onclick: () => set({ o: check.fix }) }, `Đổi sang “${check.fix}”`));
    }
    els.spellBtn.disabled = els.sayBtn.disabled = !check.ok;

    U.$$('[data-onset]', els.root).forEach(b => b.classList.toggle('on', b.dataset.onset === o));
    U.$$('[data-rhyme]', els.root).forEach(b => b.classList.toggle('on', b.dataset.rhyme === r));
    U.$$('[data-tone]', els.root).forEach(b => {
      b.classList.toggle('on', b.dataset.tone === t);
      b.disabled = VN.isStop(r) && !['sac', 'nang'].includes(b.dataset.tone);
    });
    els.stopNote.hidden = !VN.isStop(r);
  }

  async function spell() {
    const { o, r, t } = st;
    const parts = VN.spellParts(o, r, t);
    const chips = U.$$('.read-chip', els.read);
    const pieces = { onset: els.onset, rhyme: els.rhyme, base: els.result, tone: els.tone, result: els.result };
    const done = await Voice.seq(parts, {
      gap: 260,
      onEach: i => {
        chips.forEach((c, k) => c.classList.toggle('speaking', k === i));
        Object.values(pieces).forEach(p => p.classList.remove('speaking'));
        if (i >= 0) pieces[parts[i].key].classList.add('speaking');
      },
    });
    if (!done) return;
    const word = VN.compose(o, r, t);
    if (Rewards.learn('syl', word)) {
      const n = Rewards.count('syl');
      els.counter.textContent = `Bé đã đánh vần ${n} tiếng`;
      if (n % 3 === 0) {
        Sound.play('correct');
        FX.at(els.result, { count: 50 });
        Rewards.add(1, els.result);
        U.toast('Chăm quá! Cứ 3 tiếng mới được thưởng 1 ⭐');
      }
    }
  }

  function randomize() {
    Sound.play('pop');
    for (let tries = 0; tries < 50; tries++) {
      const o = U.pick(ONSETS).o;
      const group = U.pick(RHYME_GROUPS);
      const r = U.pick(group.items);
      const t = VN.isStop(r) ? U.pick(['sac', 'nang']) : U.pick(TONES).id;
      if (VN.check(o, r).ok) {
        showGroup(group.id);
        set({ o, r, t });
        spell();
        return;
      }
    }
  }

  function showGroup(id) {
    st.group = id;
    U.$$('[data-group]', els.root).forEach(b => b.classList.toggle('on', b.dataset.group === id));
    const g = RHYME_GROUPS.find(x => x.id === id);
    els.rhymes.innerHTML = '';
    g.items.forEach(r => els.rhymes.append(U.h('button', {
      class: 'chip rhyme-chip' + (r === st.r ? ' on' : ''), dataset: { rhyme: r },
      onclick: () => { Sound.play('click'); set({ r }); Voice.speak(VN.rhymeSay(r)); },
    }, r)));
  }

  function render(root) {
    st = { o: 'b', r: 'a', t: 'huyen', group: 'don' };
    const { h } = U;
    els = { root };
    els.onset = h('div', { class: 'piece p-onset' });
    els.rhyme = h('div', { class: 'piece p-rhyme' });
    els.tone = h('div', { class: 'piece p-tone' });
    els.result = h('div', { class: 'piece p-result' });
    els.pic = h('div', { class: 'spell-pic' });
    els.read = h('div', { class: 'read-row', 'aria-live': 'polite' });
    els.warn = h('div', { class: 'spell-warn' });
    els.spellBtn = h('button', { class: 'btn big c-green', onclick: spell }, '🔊 Đánh vần');
    els.sayBtn = h('button', { class: 'btn c-blue', onclick: () => Voice.speak(VN.compose(st.o, st.r, st.t)) }, '🔊 Đọc tiếng');
    els.counter = h('p', { class: 'muted center' }, `Bé đã đánh vần ${Rewards.count('syl')} tiếng`);
    els.rhymes = h('div', { class: 'chips' });
    els.stopNote = h('p', { class: 'muted small' }, 'Vần kết thúc bằng p, t, c, ch chỉ đi với dấu sắc hoặc dấu nặng.');

    const label = (txt, cls) => h('span', { class: 'piece-label ' + cls }, txt);

    root.append(
      U.screenHead('Tập đánh vần', 'Bé chọn âm đầu, vần và dấu thanh để ghép thành tiếng nhé!', 'green'),
      h('section', { class: 'card spell-stage' },
        h('div', { class: 'spell-eq' },
          h('div', { class: 'piece-wrap' }, els.onset, label('âm đầu', 'k-onset')),
          h('span', { class: 'op' }, '+'),
          h('div', { class: 'piece-wrap' }, els.rhyme, label('vần', 'k-rhyme')),
          h('span', { class: 'op' }, '+'),
          h('div', { class: 'piece-wrap' }, els.tone, label('dấu', 'k-tone')),
          h('span', { class: 'op' }, '='),
          h('div', { class: 'piece-wrap result-wrap' }, els.result, els.pic)),
        els.read,
        els.warn,
        h('div', { class: 'row center' },
          els.spellBtn, els.sayBtn,
          h('button', { class: 'btn c-purple', onclick: randomize }, '🎲 Ngẫu nhiên')),
        els.counter),

      h('div', { class: 'spell-pickers' },
        h('section', { class: 'card picker' },
          h('h2', null, h('span', { class: 'step k-onset' }, '1'), 'Âm đầu'),
          h('div', { class: 'chips' }, ONSETS.map(x => h('button', {
            class: 'chip onset-chip', dataset: { onset: x.o },
            onclick: () => { Sound.play('click'); set({ o: x.o }); if (x.say) Voice.speak(x.say); },
          }, x.o || 'không có')))),
        h('section', { class: 'card picker' },
          h('h2', null, h('span', { class: 'step k-rhyme' }, '2'), 'Vần'),
          h('div', { class: 'seg' }, RHYME_GROUPS.map(g => h('button', {
            class: 'seg-btn', dataset: { group: g.id }, onclick: () => { Sound.play('click'); showGroup(g.id); },
          }, g.label))),
          els.rhymes),
        h('section', { class: 'card picker' },
          h('h2', null, h('span', { class: 'step k-tone' }, '3'), 'Dấu thanh'),
          h('div', { class: 'tone-picks' }, TONES.map(t => h('button', {
            class: `tone-pick c-${t.color}`, dataset: { tone: t.id },
            onclick: () => { Sound.play('click'); set({ t: t.id }); Voice.speak(VN.compose(st.o, st.r, t.id)); },
          }, h('span', { html: Art.mark(t.id) }), h('small', null, t.short)))),
          els.stopNote)),

      h('section', { class: 'card' },
        h('h2', null, '🖼️ Tiếng có hình – chạm để đánh vần'),
        h('div', { class: 'example-grid' }, WORDS.map(w => h('button', {
          class: 'example',
          onclick: () => {
            const g = RHYME_GROUPS.find(x => x.items.includes(w.r));
            if (g) showGroup(g.id);
            set({ o: w.o, r: w.r, t: w.t });
            els.root.querySelector('.spell-stage').scrollIntoView({ behavior: 'smooth', block: 'center' });
            spell();
          },
        }, h('span', { html: Art.svg(w.img) }), h('b', null, w.w))))),
    );
    showGroup('don');
    update();
  }

  return { render };
})();
