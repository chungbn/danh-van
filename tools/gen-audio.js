#!/usr/bin/env node
/*
 * Sinh các clip giọng đọc thu sẵn bằng giọng “Linh” (vi_VN) của macOS.
 *   node tools/gen-audio.js           # chỉ sinh clip còn thiếu
 *   node tools/gen-audio.js --force   # sinh lại tất cả
 * Kết quả: audio/clips/*.m4a và js/audio-clips.js (bảng tra văn bản → file).
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const os = require('os');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'audio', 'clips');
const MANIFEST = path.join(ROOT, 'js', 'audio-clips.js');
const VOICE = process.env.VOICE || 'Linh';
const RATE = process.env.RATE || '150';
const force = process.argv.includes('--force');

// Nạp dữ liệu của app (biến `const` cấp cao nhất đổi thành `var` để đọc được từ context).
const ctx = { console };
vm.createContext(ctx);
for (const f of ['js/utils.js', 'js/data.js']) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8').replace(/^const (\w+)/gm, 'var $1'), ctx);
}
const { LETTERS, ONSETS, RHYME_GROUPS, VAN_LESSONS, TONES, WORDS, TONE_BASES, PRAISE, TRY_AGAIN, STICKERS, PHRASES, VN } = ctx;

const texts = new Set();
const add = t => { if (t != null && String(t).trim()) texts.add(String(t).normalize('NFC').trim()); };

LETTERS.forEach(l => { add(l.say); add(l.word); });
ONSETS.forEach(o => add(o.say));
RHYME_GROUPS.forEach(g => g.items.forEach(r => add(VN.rhymeSay(r))));
VAN_LESSONS.forEach(l => Object.entries(l.ex).forEach(([r, ws]) => {
  add(VN.rhymeSay(r));
  ws.forEach(w => { const { o, t } = VN.split(w, r); add(w); VN.spellParts(o, r, t).forEach(p => add(p.text)); });
}));
TONES.forEach(t => { add(t.say); add(t.short); add(t.word); });
WORDS.forEach(w => { add(w.w); VN.spellParts(w.o, w.r, w.t).forEach(p => add(p.text)); });
TONE_BASES.forEach(([o, r]) => TONES.forEach(t => add(VN.compose(o, r, t.id))));
// Nguyên âm mang dấu (chữ nhiễu trong trò Ghép từ)
Array.from(VN.VOWELS).forEach(v => TONES.forEach(t => add(VN.applyTone(v, t.id))));
PRAISE.forEach(add);
TRY_AGAIN.forEach(add);
STICKERS.forEach(s => add(s.name));
Object.values(PHRASES).forEach(add);
for (let n = 0; n <= 100; n++) add(n);

fs.mkdirSync(OUT_DIR, { recursive: true });
const tmp = path.join(os.tmpdir(), `bevui-${process.pid}.aiff`);
const manifest = {};
let made = 0;

for (const text of [...texts].sort()) {
  const id = crypto.createHash('md5').update(text).digest('hex').slice(0, 12);
  const rel = `audio/clips/${id}.m4a`;
  const file = path.join(ROOT, rel);
  if (force || !fs.existsSync(file)) {
    execFileSync('say', ['-v', VOICE, '-r', RATE, '-o', tmp, text]);
    execFileSync('afconvert', ['-f', 'm4af', '-d', 'aac', '-b', '48000', tmp, file]);
    made++;
    process.stdout.write(`\r${made} clip mới…`);
  }
  manifest[text] = rel;
}
fs.rmSync(tmp, { force: true });

// Xoá clip không còn dùng
const keep = new Set(Object.values(manifest).map(r => path.basename(r)));
for (const f of fs.readdirSync(OUT_DIR)) if (!keep.has(f)) fs.rmSync(path.join(OUT_DIR, f));

fs.writeFileSync(MANIFEST,
  `'use strict';\n/* Tự sinh bởi tools/gen-audio.js — không sửa tay. */\nconst AUDIO_CLIPS = ${JSON.stringify(manifest, null, 0).replace(/","/g, '",\n"')};\n`);
console.log(`\nXong: ${texts.size} clip (${made} mới) → ${path.relative(ROOT, MANIFEST)}`);
