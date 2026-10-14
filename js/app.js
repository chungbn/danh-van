'use strict';

const App = (() => {
  const ROUTES = {
    '': 'home', 'chu-cai': 'alphabet', 'dau-thanh': 'tones', 'danh-van': 'spelling', 'on-van': 'van',
    'tim-chu': 'find', 'ghep-tu': 'drag', 'goc-be-ngoan': 'stickers',
  };
  let current = null;

  function route() {
    const key = location.hash.replace(/^#\/?/, '').split(/[?/]/)[0];
    const name = ROUTES[key] || 'home';
    if (current && current.destroy) current.destroy();
    Voice.stop();
    U.$$('#modalRoot .modal-wrap').forEach(m => m.remove());
    const view = U.$('#view');
    view.innerHTML = '';
    view.className = 'view screen-' + name;
    current = Screens[name];
    current.render(view);
    U.$$('#tabs a').forEach(a => {
      const on = a.dataset.route === name;
      a.classList.toggle('active', on);
      if (on) a.scrollIntoView({ block: 'nearest', inline: 'center' });
    });
    window.scrollTo(0, 0);
  }

  function syncToggles() {
    const s = Sound.state;
    const m = U.$('#btnMusic'), f = U.$('#btnSfx');
    m.classList.toggle('off', !s.music); m.setAttribute('aria-pressed', s.music);
    f.classList.toggle('off', !s.sfx); f.setAttribute('aria-pressed', s.sfx);
    f.textContent = s.sfx ? '🔊' : '🔇';
  }

  function openVoiceSettings() {
    const { h } = U;
    const body = h('div', { class: 'voice-settings' });
    const draw = () => {
      const cfg = Voice.settings;
      const voices = Voice.voices();
      body.innerHTML = '';
      body.append(
        h('h2', null, '⚙️ Giọng đọc'),
        h('h3', null, 'Tốc độ đọc'),
        h('div', { class: 'seg' }, Object.entries(Voice.SPEEDS).map(([id, sp]) => h('button', {
          class: 'seg-btn' + (cfg.speed === id ? ' on' : ''),
          onclick: () => { Voice.set({ speed: id }); draw(); test(); },
        }, sp.label))),
        Voice.hasClips && h('h3', null, 'Nguồn giọng'),
        Voice.hasClips && h('div', { class: 'seg' },
          h('button', { class: 'seg-btn' + (cfg.useClips ? ' on' : ''), onclick: () => { Voice.set({ useClips: true }); draw(); test(); } }, '🎙️ Giọng thu sẵn'),
          h('button', { class: 'seg-btn' + (!cfg.useClips ? ' on' : ''), onclick: () => { Voice.set({ useClips: false }); draw(); test(); } }, '💻 Giọng của máy')),
        Voice.hasClips && h('p', { class: 'muted small' }, 'Giọng thu sẵn đọc rõ và giống nhau trên mọi máy. Các tiếng bé tự ghép ở mục Đánh vần vẫn dùng giọng của máy.'),
        h('h3', null, 'Giọng của máy'),
        voices.length
          ? h('select', {
            class: 'voice-select',
            onchange: e => { Voice.set({ voiceName: e.target.value }); test(); },
          }, voices.map(v => h('option', { value: v.name, selected: v.name === (cfg.voiceName || voices[0].name) }, `${v.name} (${v.lang})`)))
          : h('p', { class: 'muted small' }, '⚠️ Máy chưa có giọng Tiếng Việt, tiếng tự ghép có thể đọc chưa chuẩn.'),
        h('div', { class: 'row center' }, h('button', { class: 'btn c-green', onclick: test }, '🔊 Nghe thử')),
      );
    };
    const test = () => Voice.seq([PHRASES.test, ...VN.spellParts('b', 'a', 'huyen')], { gap: 200 });
    draw();
    U.modal(body, { className: 'modal-voice', onClose: () => Voice.stop() });
  }

  function checkVoice() {
    const warn = U.$('#voiceWarn');
    if (U.store.get('voiceWarnClosed', false)) return;
    setTimeout(() => {
      if (!Voice.supported || !Voice.hasVietnamese()) warn.hidden = false;
      if (Voice.hasClips) U.$('#voiceWarnText').textContent = 'Phần lớn lời đọc đã được thu sẵn. Riêng các tiếng bé tự ghép ở mục Đánh vần cần giọng Tiếng Việt của máy.';
    }, 1800);
    U.$('#voiceWarnClose').addEventListener('click', () => {
      warn.hidden = true;
      U.store.set('voiceWarnClosed', true);
    });
  }

  function init() {
    Voice.init();
    FX.init();
    Rewards.init();
    U.$('#brandLogo').innerHTML = Art.svg('cu');

    U.$('#btnVoice').addEventListener('click', openVoiceSettings);
    U.$('#btnMusic').addEventListener('click', () => { Sound.setMusic(!Sound.state.music); syncToggles(); });
    U.$('#btnSfx').addEventListener('click', () => { Sound.setSfx(!Sound.state.sfx); syncToggles(); Sound.play('click'); });
    syncToggles();

    // Trình duyệt chỉ cho phát âm thanh sau lần chạm đầu tiên.
    const unlock = () => { Sound.unlock(); window.removeEventListener('pointerdown', unlock); window.removeEventListener('keydown', unlock); };
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);

    // Tiếng “tách” nhẹ cho các nút điều hướng và chip.
    document.addEventListener('click', e => {
      if (e.target.closest('#tabs a, .tile')) Sound.play('click');
    });

    window.addEventListener('hashchange', route);
    checkVoice();
    route();
  }

  document.addEventListener('DOMContentLoaded', init);
  return { refresh: route };
})();
