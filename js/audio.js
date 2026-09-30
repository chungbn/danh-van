'use strict';

/* Hiệu ứng âm thanh và nhạc nền, tổng hợp bằng Web Audio API (không cần file âm thanh). */
const Sound = (() => {
  let ctx = null, master, sfxBus, musicBus, noiseBuf = null;
  const state = { sfx: U.store.get('sfx', true), music: U.store.get('music', false) };
  const MUSIC_VOL = 0.11;

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);
      sfxBus = ctx.createGain(); sfxBus.gain.value = 0.7; sfxBus.connect(master);
      musicBus = ctx.createGain(); musicBus.gain.value = MUSIC_VOL; musicBus.connect(master);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, start, dur, { type = 'sine', vol = 0.4, dest = sfxBus, slideTo } = {}) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, start);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, start + dur);
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(vol, start + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    o.connect(g); g.connect(dest);
    o.start(start); o.stop(start + dur + 0.05);
  }

  function noise(start, dur, { vol = 0.4, freq = 1200, q = 0.8, type = 'bandpass' } = {}) {
    if (!noiseBuf) {
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    const src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = noiseBuf; src.loop = true;
    f.type = type; f.frequency.value = freq; f.Q.value = q;
    g.gain.setValueAtTime(vol, start);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    src.connect(f); f.connect(g); g.connect(sfxBus);
    src.start(start); src.stop(start + dur + 0.05);
  }

  const N = n => 440 * Math.pow(2, (n - 69) / 12);   // MIDI → Hz

  const SFX = {
    click(t) { tone(700, t, 0.07, { type: 'triangle', vol: 0.18 }); },
    pick(t) { tone(520, t, 0.08, { type: 'triangle', vol: 0.22, slideTo: 780 }); },
    drop(t) { tone(330, t, 0.12, { type: 'sine', vol: 0.4, slideTo: 660 }); tone(990, t + 0.06, 0.1, { type: 'triangle', vol: 0.15 }); },
    correct(t) { [72, 76, 79, 84].forEach((n, i) => tone(N(n), t + i * 0.08, 0.28, { type: 'triangle', vol: 0.35 })); },
    wrong(t) {
      tone(240, t, 0.18, { type: 'square', vol: 0.09, slideTo: 170 });
      tone(190, t + 0.2, 0.26, { type: 'square', vol: 0.09, slideTo: 120 });
    },
    pop(t) { tone(500 + Math.random() * 500, t, 0.09, { type: 'sine', vol: 0.3, slideTo: 200 }); },
    star(t) { [88, 91, 96].forEach((n, i) => tone(N(n), t + i * 0.06, 0.2, { type: 'sine', vol: 0.18 })); },
    firework(t) {
      tone(300 + Math.random() * 200, t, 0.55, { type: 'sine', vol: 0.05, slideTo: 1400 + Math.random() * 600 });
      noise(t + 0.55, 0.7, { vol: 0.55, freq: 500, type: 'lowpass', q: 0.5 });
      for (let i = 0; i < 7; i++) noise(t + 0.7 + Math.random() * 0.6, 0.05, { vol: 0.25, freq: 4000 + Math.random() * 3000, q: 2 });
    },
    cheer(t) {
      const seq = [[67, 0], [72, 0.12], [76, 0.24], [79, 0.36], [84, 0.52]];
      seq.forEach(([n, d]) => tone(N(n), t + d, 0.3, { type: 'square', vol: 0.08 }));
      [72, 76, 79, 84].forEach(n => tone(N(n), t + 0.52, 0.9, { type: 'triangle', vol: 0.12 }));
      for (let i = 0; i < 8; i++) tone(N(96 + (i % 4) * 2), t + 0.6 + i * 0.07, 0.12, { type: 'sine', vol: 0.08 });
      noise(t + 0.5, 0.9, { vol: 0.08, freq: 2500, q: 0.4 });
    },
    unlock(t) {
      const pent = [72, 74, 76, 79, 81, 84, 86, 88, 91, 93, 96];
      pent.forEach((n, i) => tone(N(n), t + i * 0.055, 0.35, { type: 'sine', vol: 0.16 }));
      [60, 64, 67, 72].forEach(n => tone(N(n), t + 0.6, 1.2, { type: 'triangle', vol: 0.12 }));
    },
  };

  function play(name) {
    if (!state.sfx || !ensure() || !SFX[name]) return;
    SFX[name](ctx.currentTime + 0.01);
  }

  /* Nhạc nền: giai điệu “Kìa con bướm vàng” (dân ca Pháp Frère Jacques). */
  const MELODY = [
    [60, 1], [62, 1], [64, 1], [60, 1], [60, 1], [62, 1], [64, 1], [60, 1],
    [64, 1], [65, 1], [67, 2], [64, 1], [65, 1], [67, 2],
    [67, .5], [69, .5], [67, .5], [65, .5], [64, 1], [60, 1],
    [67, .5], [69, .5], [67, .5], [65, .5], [64, 1], [60, 1],
    [60, 1], [55, 1], [60, 2], [60, 1], [55, 1], [60, 2], [null, 4],
  ];
  const BEAT = 60 / 112;
  let musicTimer = null, nextTime = 0, idx = 0, beatCount = 0;

  function schedule() {
    while (nextTime < ctx.currentTime + 0.25) {
      const [n, len] = MELODY[idx];
      if (n) tone(N(n + 12), nextTime, len * BEAT * 0.9, { type: 'triangle', vol: 0.5, dest: musicBus });
      if (beatCount % 2 === 0) tone(N(beatCount % 4 === 0 ? 48 : 43), nextTime, BEAT * 1.6, { type: 'sine', vol: 0.35, dest: musicBus });
      beatCount += len;
      nextTime += len * BEAT;
      idx = (idx + 1) % MELODY.length;
    }
  }

  function startMusic() {
    if (musicTimer || !ensure()) return;
    nextTime = ctx.currentTime + 0.1; idx = 0; beatCount = 0;
    musicTimer = setInterval(schedule, 60);
  }
  function stopMusic() { clearInterval(musicTimer); musicTimer = null; }

  function setMusic(on) {
    state.music = on; U.store.set('music', on);
    on ? startMusic() : stopMusic();
  }
  function setSfx(on) { state.sfx = on; U.store.set('sfx', on); }

  /* Nhỏ nhạc nền khi giọng đọc đang nói. */
  function duck(on) {
    if (!ctx) return;
    musicBus.gain.cancelScheduledValues(ctx.currentTime);
    musicBus.gain.setTargetAtTime(on ? MUSIC_VOL * 0.25 : MUSIC_VOL, ctx.currentTime, 0.15);
  }

  /* Gọi trong lần chạm đầu tiên để trình duyệt cho phép phát âm thanh. */
  function unlock() {
    ensure();
    if (state.music) startMusic();
  }

  return { play, setMusic, setSfx, duck, unlock, get state() { return { ...state }; } };
})();

/* Giọng đọc: ưu tiên âm thanh thu sẵn (audio/clips, sinh bởi tools/gen-audio.js),
   không có clip thì dùng Web Speech Synthesis của máy. */
const Voice = (() => {
  const synth = window.speechSynthesis;
  const CLIPS = typeof AUDIO_CLIPS === 'object' ? AUDIO_CLIPS : {};
  const SPEEDS = {
    slow: { label: '🐢 Chậm', clip: 0.8, tts: 0.65 },
    normal: { label: '🐇 Vừa', clip: 1, tts: 0.8 },
    fast: { label: '🚀 Nhanh', clip: 1.15, tts: 0.95 },
  };
  const settings = {
    speed: U.store.get('voiceSpeed', 'normal'),
    useClips: U.store.get('voiceClips', true),
    voiceName: U.store.get('voiceName', ''),
  };
  let viVoices = [], voice = null, token = 0, current = null;
  const cache = new Map();

  function pickVoice() {
    if (!synth) return;
    viVoices = synth.getVoices().filter(v => /^vi([-_]|$)/i.test(v.lang));
    voice = viVoices.find(v => v.name === settings.voiceName)
      || viVoices.find(v => /natural|neural|online/i.test(v.name))
      || viVoices.find(v => /google/i.test(v.name))
      || viVoices[0] || null;
  }

  function init() {
    if (!synth) return;
    pickVoice();
    synth.onvoiceschanged = pickVoice;
  }

  const key = text => text.normalize('NFC').trim();
  const clipFor = text => {
    if (!settings.useClips) return null;
    const k = key(text);
    return CLIPS[k] || CLIPS[k.toLowerCase()] || null;
  };

  function audioEl(src) {
    let a = cache.get(src);
    if (!a) { a = new Audio(src); a.preload = 'auto'; cache.set(src, a); }
    return a;
  }

  /* Tải trước các clip sắp dùng để bé bấm là nghe ngay. */
  function preload(texts) {
    texts.forEach(t => { const src = clipFor(t); if (src) audioEl(src); });
  }

  function playClip(src) {
    return new Promise(resolve => {
      const a = audioEl(src);
      let done = false;
      const finish = ok => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        a.onended = a.onerror = null;
        if (current && current.finish === finish) current = null;
        resolve(ok);
      };
      const timer = setTimeout(() => finish(true), 10000);
      current = { finish, stop: () => { a.pause(); finish(true); } };
      a.onended = () => finish(true);
      a.onerror = () => finish(false);
      a.currentTime = 0;
      a.playbackRate = SPEEDS[settings.speed].clip;
      a.play().catch(() => finish(false));
    });
  }

  function playTTS(text) {
    return new Promise(resolve => {
      if (!synth || !text) return resolve();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'vi-VN';
      if (voice) u.voice = voice;
      u.rate = SPEEDS[settings.speed].tts;
      u.pitch = 1.05;
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        if (current && current.finish === finish) current = null;
        resolve();
      };
      const timer = setTimeout(finish, 2000 + text.length * 300);
      current = { finish, stop: finish };
      u.onend = finish;
      u.onerror = finish;
      if (synth.paused) synth.resume();   // Chrome đôi khi kẹt ở trạng thái paused
      synth.speak(u);
    });
  }

  async function sayOne(text) {
    const src = clipFor(text);
    if (src && await playClip(src)) return;
    await playTTS(text);
  }

  function stop() {
    token++;
    if (current) current.stop();
    current = null;
    if (synth && (synth.speaking || synth.pending)) synth.cancel();
    Sound.duck(false);
  }

  /* Đọc lần lượt nhiều mục; onEach(i) được gọi khi bắt đầu mục i, onEach(-1) khi xong. */
  async function seq(items, opts = {}) {
    stop();
    const my = token;
    Sound.duck(true);
    await U.sleep(60);
    for (let i = 0; i < items.length; i++) {
      if (my !== token) return false;
      const it = typeof items[i] === 'string' ? { text: items[i] } : items[i];
      if (opts.onEach) opts.onEach(i, it);
      await sayOne(String(it.text));
      if (my !== token) return false;
      if (i < items.length - 1) await U.sleep(opts.gap ?? 220);
    }
    if (opts.onEach) opts.onEach(-1);
    Sound.duck(false);
    return true;
  }

  /* Một câu ghép từ nhiều đoạn (đọc liền, nghỉ rất ngắn). */
  const say = (...pieces) => seq(pieces.flat().filter(p => p !== '' && p != null), { gap: 40 });
  const speak = text => seq([text]);

  function set(patch) {
    Object.assign(settings, patch);
    U.store.set('voiceSpeed', settings.speed);
    U.store.set('voiceClips', settings.useClips);
    U.store.set('voiceName', settings.voiceName);
    pickVoice();
  }

  return {
    init, speak, say, seq, stop, preload, set, SPEEDS,
    get settings() { return { ...settings }; },
    voices: () => viVoices.slice(),
    supported: !!synth,
    hasClips: Object.keys(CLIPS).length > 0,
    hasClip: text => !!clipFor(text),
    hasVietnamese: () => !!voice,
  };
})();
