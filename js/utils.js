'use strict';

/* Registry for screens; each screen file adds itself here. */
const Screens = {};

const U = {
  $(sel, root = document) { return root.querySelector(sel); },
  $$(sel, root = document) { return Array.from(root.querySelectorAll(sel)); },

  /* Tiny hyperscript helper: h('div', {class: 'x', onclick: fn}, child, ...) */
  h(tag, attrs, ...children) {
    const el = document.createElement(tag);
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        if (v == null || v === false) continue;
        if (k === 'class') el.className = v;
        else if (k === 'html') el.innerHTML = v;
        else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
        else if (k === 'dataset') Object.assign(el.dataset, v);
        else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
        else if (v === true) el.setAttribute(k, '');
        else el.setAttribute(k, v);
      }
    }
    for (const c of children.flat()) {
      if (c == null || c === false) continue;
      el.append(c.nodeType ? c : document.createTextNode(String(c)));
    }
    return el;
  },

  shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  },
  pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; },
  sample(arr, n) { return U.shuffle(arr).slice(0, n); },
  sleep(ms) { return new Promise(r => setTimeout(r, ms)); },

  /* Restart a CSS animation class on an element. */
  replay(el, cls) {
    if (!el) return;
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
  },

  store: {
    get(key, def) {
      try {
        const v = localStorage.getItem('bevui:' + key);
        return v == null ? def : JSON.parse(v);
      } catch { return def; }
    },
    set(key, val) {
      try { localStorage.setItem('bevui:' + key, JSON.stringify(val)); } catch { /* storage unavailable */ }
    },
    clear() {
      try {
        Object.keys(localStorage).filter(k => k.startsWith('bevui:')).forEach(k => localStorage.removeItem(k));
      } catch { /* storage unavailable */ }
    },
  },

  modal(content, { onClose, className = '', dismissable = true } = {}) {
    const root = document.getElementById('modalRoot');
    let closed = false;
    const close = () => {
      if (closed) return;
      closed = true;
      document.removeEventListener('keydown', onKey);
      wrap.classList.add('closing');
      setTimeout(() => wrap.remove(), 200);
      if (onClose) onClose();
    };
    const onKey = e => { if (e.key === 'Escape' && dismissable) close(); };
    const box = U.h('div', { class: 'modal ' + className, role: 'dialog', 'aria-modal': 'true' },
      dismissable && U.h('button', { class: 'modal-x', 'aria-label': 'Đóng', onclick: close }, '✕'),
      content);
    const wrap = U.h('div', {
      class: 'modal-wrap',
      onclick: e => { if (e.target === wrap && dismissable) close(); },
    }, box);
    root.append(wrap);
    document.addEventListener('keydown', onKey);
    return close;
  },

  toast(text) {
    const t = U.h('div', { class: 'toast' }, text);
    document.getElementById('toastRoot').append(t);
    setTimeout(() => t.classList.add('out'), 2200);
    setTimeout(() => t.remove(), 2700);
  },

  screenHead(title, sub, color = 'blue') {
    return U.h('div', { class: 'screen-head c-' + color },
      U.h('h1', null, title),
      sub && U.h('p', null, sub));
  },
};

/* Vietnamese orthography helpers: tone marks, tone placement, syllable composition. */
const VN = {
  MARKS: { ngang: '', sac: '́', huyen: '̀', hoi: '̉', nga: '̃', nang: '̣' },
  VOWELS: 'aăâeêioôơuưy',

  stripTone(s) {
    return s.normalize('NFD').replace(/[̣̀́̃̉]/g, '').normalize('NFC');
  },

  toneOf(s) {
    const d = s.normalize('NFD');
    for (const [k, m] of Object.entries(VN.MARKS)) if (m && d.includes(m)) return k;
    return 'ngang';
  },

  /* Rhymes ending in p, t, c, ch only take the sắc or nặng tone. */
  isStop(rhyme) { return /(p|t|c|ch)$/.test(rhyme); },

  /* Index (within the rhyme) of the vowel that carries the tone mark. */
  toneIndex(rhyme) {
    const chars = Array.from(rhyme);
    let end = 0;
    while (end < chars.length && VN.VOWELS.includes(chars[end])) end++;
    if (!end) return -1;
    const cluster = chars.slice(0, end);
    for (let i = end - 1; i >= 0; i--) if ('ăâêôơư'.includes(cluster[i])) return i;
    if (end < chars.length) return end - 1;          // has a final consonant: last vowel
    if (end === 1) return 0;
    if (end === 2) return ['oa', 'oe', 'uy'].includes(cluster.join('')) ? 1 : 0;
    return 1;                                         // three vowels: middle one
  },

  applyTone(rhyme, tone) {
    const m = VN.MARKS[tone];
    if (!m) return rhyme;
    const chars = Array.from(rhyme);
    const i = VN.toneIndex(rhyme);
    if (i < 0) return rhyme;
    chars[i] = (chars[i] + m).normalize('NFC');
    return chars.join('');
  },

  compose(onset, rhyme, tone) {
    const r = VN.applyTone(rhyme, tone);
    if (onset === 'gi' && rhyme[0] === 'i') return 'g' + r;   // gi + ì → gì
    return (onset || '') + r;
  },

  /* Cách đọc một vần đứng riêng: vần p, t, c, ch vốn mang thanh sắc (at → “át”). */
  rhymeSay(rhyme) { return VN.isStop(rhyme) ? VN.applyTone(rhyme, 'sac') : rhyme; },

  /* Cách đọc một chữ cái (có thể mang dấu) khi đứng riêng. */
  letterSay(ch) {
    const plain = VN.stripTone(ch);
    return plain === ch ? (LETTER_SAY[ch] || ch) : ch;
  },

  /* Các bước đánh vần kiểu sách lớp 1: “bờ – a – ba – huyền – bà”, “bờ – át – bát”. */
  spellParts(onset, rhyme, tone) {
    const stop = VN.isStop(rhyme);
    const base = VN.compose(onset, rhyme, 'ngang');
    const parts = [];
    if (onset) parts.push({ text: ONSET_SAY[onset], label: onset, key: 'onset' });
    parts.push({ text: VN.rhymeSay(rhyme), label: rhyme, key: 'rhyme' });
    if (onset && !stop) parts.push({ text: base, label: base, key: 'base' });
    if (tone !== 'ngang' && !(stop && tone === 'sac')) {
      const name = TONE_BY_ID[tone].short;
      parts.push({ text: name, label: name, key: 'tone' });
    }
    if (tone !== 'ngang' || (stop && onset)) {
      const full = VN.compose(onset, rhyme, tone);
      if (full !== parts[parts.length - 1].text) parts.push({ text: full, label: full, key: 'result' });
    }
    parts[parts.length - 1].key = 'result';
    return parts;
  },

  /* Spelling-rule check for onset/rhyme pairs; returns {ok, msg, fix}. */
  check(onset, rhyme) {
    const front = /^[eêiy]/.test(rhyme);
    const rules = [
      [onset === 'c' && front, 'Trước e, ê, i bé dùng chữ k (ca) nhé!', 'k'],
      [onset === 'k' && !front, 'Chữ k (ca) chỉ đứng trước e, ê, i thôi. Mình dùng c (cờ) nhé!', 'c'],
      [onset === 'g' && front, 'Trước e, ê, i bé dùng gh (gờ ghép) nhé!', 'gh'],
      [onset === 'gh' && !front, 'gh chỉ đứng trước e, ê, i thôi. Mình dùng g nhé!', 'g'],
      [onset === 'ng' && front, 'Trước e, ê, i bé dùng ngh (ngờ ghép) nhé!', 'ngh'],
      [onset === 'ngh' && !front, 'ngh chỉ đứng trước e, ê, i thôi. Mình dùng ng nhé!', 'ng'],
      [onset === 'qu' && /^u/.test(rhyme), 'qu không đi với vần bắt đầu bằng u đâu bé ơi!', null],
    ];
    for (const [bad, msg, fix] of rules) if (bad) return { ok: false, msg, fix };
    return { ok: true };
  },
};
