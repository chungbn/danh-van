'use strict';

/* 29 chữ cái Tiếng Việt. `say` là cách đọc âm theo sách Tiếng Việt 1. */
const LETTERS = [
  { ch: 'a', say: 'a', word: 'áo', img: 'ao' },
  { ch: 'ă', say: 'á', word: 'ăn cơm', img: 'an' },
  { ch: 'â', say: 'ớ', word: 'ấm trà', img: 'am' },
  { ch: 'b', say: 'bờ', word: 'bóng', img: 'bong' },
  { ch: 'c', say: 'cờ', word: 'cá', img: 'ca' },
  { ch: 'd', say: 'dờ', word: 'dê', img: 'de' },
  { ch: 'đ', say: 'đờ', word: 'đèn lồng', img: 'den' },
  { ch: 'e', say: 'e', word: 'em bé', img: 'embe' },
  { ch: 'ê', say: 'ê', word: 'ếch', img: 'ech' },
  { ch: 'g', say: 'gờ', word: 'gà', img: 'ga' },
  { ch: 'h', say: 'hờ', word: 'hoa', img: 'hoa' },
  { ch: 'i', say: 'i', word: 'hòn bi', img: 'bi' },
  { ch: 'k', say: 'ca', word: 'kem', img: 'kem' },
  { ch: 'l', say: 'lờ', word: 'lá', img: 'la' },
  { ch: 'm', say: 'mờ', word: 'mèo', img: 'meo' },
  { ch: 'n', say: 'nờ', word: 'nấm', img: 'nam' },
  { ch: 'o', say: 'o', word: 'ong', img: 'ong' },
  { ch: 'ô', say: 'ô', word: 'cái ô', img: 'o' },
  { ch: 'ơ', say: 'ơ', word: 'nơ', img: 'no' },
  { ch: 'p', say: 'pờ', word: 'pin', img: 'pin' },
  { ch: 'q', say: 'cu', word: 'quả cam', img: 'qua' },
  { ch: 'r', say: 'rờ', word: 'rùa', img: 'rua' },
  { ch: 's', say: 'sờ', word: 'sao', img: 'sao' },
  { ch: 't', say: 'tờ', word: 'táo', img: 'tao' },
  { ch: 'u', say: 'u', word: 'cú mèo', img: 'cu' },
  { ch: 'ư', say: 'ư', word: 'sư tử', img: 'sutu' },
  { ch: 'v', say: 'vờ', word: 'voi', img: 'voi' },
  { ch: 'x', say: 'xờ', word: 'xe', img: 'xe' },
  { ch: 'y', say: 'i dài', word: 'máy bay', img: 'maybay' },
];

const LETTER_SAY = Object.fromEntries(LETTERS.map(l => [l.ch, l.say]));

/* Chữ dễ nhầm, dùng làm đáp án gây nhiễu trong trò chơi. */
const LOOKALIKE = [
  ['a', 'ă', 'â'], ['o', 'ô', 'ơ'], ['u', 'ư'], ['e', 'ê'], ['d', 'đ', 'b'],
  ['i', 'y', 'l'], ['c', 'k', 'q'], ['m', 'n'], ['p', 'q', 'b'], ['g', 'q', 'y'], ['s', 'x'],
];

const TONES = [
  { id: 'ngang', name: 'Thanh ngang', say: 'thanh ngang', short: 'không dấu', word: 'xe', img: 'xe', color: 'teal' },
  { id: 'sac', name: 'Dấu sắc', say: 'dấu sắc', short: 'sắc', word: 'cá', img: 'ca', color: 'red' },
  { id: 'huyen', name: 'Dấu huyền', say: 'dấu huyền', short: 'huyền', word: 'gà', img: 'ga', color: 'orange' },
  { id: 'hoi', name: 'Dấu hỏi', say: 'dấu hỏi', short: 'hỏi', word: 'thỏ', img: 'tho', color: 'green' },
  { id: 'nga', name: 'Dấu ngã', say: 'dấu ngã', short: 'ngã', word: 'mũ', img: 'mu', color: 'blue' },
  { id: 'nang', name: 'Dấu nặng', say: 'dấu nặng', short: 'nặng', word: 'vịt', img: 'vit', color: 'purple' },
];
const TONE_BY_ID = Object.fromEntries(TONES.map(t => [t.id, t]));

/* Âm đầu dùng trong Tập Đánh Vần. */
const ONSETS = [
  { o: '', say: '' },
  { o: 'b', say: 'bờ' }, { o: 'c', say: 'cờ' }, { o: 'ch', say: 'chờ' }, { o: 'd', say: 'dờ' },
  { o: 'đ', say: 'đờ' }, { o: 'g', say: 'gờ' }, { o: 'gh', say: 'gờ' }, { o: 'gi', say: 'di' },
  { o: 'h', say: 'hờ' }, { o: 'k', say: 'ca' }, { o: 'kh', say: 'khờ' }, { o: 'l', say: 'lờ' },
  { o: 'm', say: 'mờ' }, { o: 'n', say: 'nờ' }, { o: 'ng', say: 'ngờ' }, { o: 'ngh', say: 'ngờ' },
  { o: 'nh', say: 'nhờ' }, { o: 'p', say: 'pờ' }, { o: 'ph', say: 'phờ' }, { o: 'qu', say: 'quờ' },
  { o: 'r', say: 'rờ' }, { o: 's', say: 'sờ' }, { o: 't', say: 'tờ' }, { o: 'th', say: 'thờ' },
  { o: 'tr', say: 'trờ' }, { o: 'v', say: 'vờ' }, { o: 'x', say: 'xờ' },
];
const ONSET_SAY = Object.fromEntries(ONSETS.map(o => [o.o, o.say]));

const RHYME_GROUPS = [
  { id: 'don', label: 'Vần 1 chữ', items: ['a', 'e', 'ê', 'i', 'o', 'ô', 'ơ', 'u', 'ư', 'y'] },
  {
    id: 'ghep', label: 'Vần 2 – 3 chữ',
    items: ['ai', 'ao', 'au', 'âu', 'ay', 'ây', 'eo', 'êu', 'ia', 'iu', 'oa', 'oe', 'oi', 'ôi', 'ơi',
      'ua', 'ưa', 'ui', 'ưi', 'uy', 'ưu', 'iêu', 'uôi', 'ươi', 'oai', 'oay'],
  },
  {
    id: 'cuoi', label: 'Vần có âm cuối',
    items: ['an', 'ăn', 'ân', 'am', 'ăm', 'âm', 'em', 'êm', 'en', 'ên', 'im', 'in', 'om', 'ôm', 'ơm',
      'on', 'ôn', 'ơn', 'um', 'un', 'ang', 'ăng', 'âng', 'anh', 'ênh', 'inh', 'ong', 'ông', 'ung',
      'ưng', 'iên', 'iêng', 'uôn', 'uông', 'ương', 'oan', 'oang'],
  },
  {
    id: 'chan', label: 'Vần p – t – c – ch',
    items: ['ap', 'ăp', 'âp', 'ep', 'êp', 'ip', 'op', 'ôp', 'ơp', 'up', 'at', 'ăt', 'ât', 'et', 'êt',
      'it', 'ot', 'ôt', 'ơt', 'ut', 'ưt', 'ac', 'ăc', 'âc', 'oc', 'ôc', 'uc', 'ưc', 'ach', 'êch', 'ich',
      'iêt', 'uôc', 'ươc'],
  },
];

/* Tiếng một âm tiết có hình minh hoạ: dùng cho đánh vần, tìm hình, ghép từ. */
const WORDS = [
  { w: 'cá', img: 'ca', o: 'c', r: 'a', t: 'sac' },
  { w: 'gà', img: 'ga', o: 'g', r: 'a', t: 'huyen' },
  { w: 'xe', img: 'xe', o: 'x', r: 'e', t: 'ngang' },
  { w: 'lá', img: 'la', o: 'l', r: 'a', t: 'sac' },
  { w: 'ô', img: 'o', o: '', r: 'ô', t: 'ngang' },
  { w: 'nơ', img: 'no', o: 'n', r: 'ơ', t: 'ngang' },
  { w: 'dê', img: 'de', o: 'd', r: 'ê', t: 'ngang' },
  { w: 'bi', img: 'bi', o: 'b', r: 'i', t: 'ngang' },
  { w: 'kem', img: 'kem', o: 'k', r: 'em', t: 'ngang' },
  { w: 'mèo', img: 'meo', o: 'm', r: 'eo', t: 'huyen' },
  { w: 'voi', img: 'voi', o: 'v', r: 'oi', t: 'ngang' },
  { w: 'rùa', img: 'rua', o: 'r', r: 'ua', t: 'huyen' },
  { w: 'sao', img: 'sao', o: 's', r: 'ao', t: 'ngang' },
  { w: 'táo', img: 'tao', o: 't', r: 'ao', t: 'sac' },
  { w: 'ong', img: 'ong', o: '', r: 'ong', t: 'ngang' },
  { w: 'hoa', img: 'hoa', o: 'h', r: 'oa', t: 'ngang' },
  { w: 'ếch', img: 'ech', o: '', r: 'êch', t: 'sac' },
  { w: 'đèn', img: 'den', o: 'đ', r: 'en', t: 'huyen' },
  { w: 'nấm', img: 'nam', o: 'n', r: 'âm', t: 'sac' },
  { w: 'thỏ', img: 'tho', o: 'th', r: 'o', t: 'hoi' },
  { w: 'mũ', img: 'mu', o: 'm', r: 'u', t: 'nga' },
  { w: 'vịt', img: 'vit', o: 'v', r: 'it', t: 'nang' },
  { w: 'áo', img: 'ao', o: '', r: 'ao', t: 'sac' },
  { w: 'cú', img: 'cu', o: 'c', r: 'u', t: 'sac' },
  { w: 'bóng', img: 'bong', o: 'b', r: 'ong', t: 'sac' },
  { w: 'pin', img: 'pin', o: 'p', r: 'in', t: 'ngang' },
  { w: 'gấu', img: 'gau', o: 'g', r: 'âu', t: 'sac' },
  { w: 'heo', img: 'heo', o: 'h', r: 'eo', t: 'ngang' },
  { w: 'chó', img: 'cho', o: 'ch', r: 'o', t: 'sac' },
  { w: 'ấm', img: 'am', o: '', r: 'âm', t: 'sac' },
  { w: 'cam', img: 'qua', o: 'c', r: 'am', t: 'ngang' },
];
const WORD_BY_TEXT = Object.fromEntries(WORDS.map(w => [w.w, w]));

/* Huy hiệu động vật mở khoá theo tổng số sao. */
const STICKERS = [
  { id: 'meo', name: 'Mèo Mướp', need: 1, anim: 'wiggle', color: 'orange' },
  { id: 'ga', name: 'Gà Trống', need: 3, anim: 'bounce', color: 'red' },
  { id: 'ca', name: 'Cá Vàng', need: 6, anim: 'swim', color: 'blue' },
  { id: 'ech', name: 'Ếch Xanh', need: 10, anim: 'hop', color: 'green' },
  { id: 'ong', name: 'Ong Chăm Chỉ', need: 14, anim: 'float', color: 'yellow' },
  { id: 'tho', name: 'Thỏ Trắng', need: 19, anim: 'hop', color: 'pink' },
  { id: 'vit', name: 'Vịt Con', need: 24, anim: 'swing', color: 'yellow' },
  { id: 'cho', name: 'Cún Con', need: 30, anim: 'wiggle', color: 'orange' },
  { id: 'rua', name: 'Rùa Kiên Nhẫn', need: 36, anim: 'float', color: 'green' },
  { id: 'heo', name: 'Heo Hồng', need: 43, anim: 'bounce', color: 'pink' },
  { id: 'cu', name: 'Cú Thông Thái', need: 50, anim: 'swing', color: 'purple' },
  { id: 'de', name: 'Dê Con', need: 58, anim: 'hop', color: 'teal' },
  { id: 'gau', name: 'Gấu Nâu', need: 67, anim: 'wiggle', color: 'orange' },
  { id: 'voi', name: 'Voi Con', need: 77, anim: 'float', color: 'blue' },
  { id: 'sutu', name: 'Sư Tử Dũng Cảm', need: 90, anim: 'pulse', color: 'red' },
];

const PRAISE = ['Giỏi quá!', 'Đúng rồi!', 'Tuyệt vời!', 'Bé giỏi lắm!', 'Hoan hô!', 'Xuất sắc!', 'Siêu quá!'];
const TRY_AGAIN = ['Chưa đúng rồi, bé thử lại nhé!', 'Cố lên nào!', 'Bé nghe lại và chọn nhé!'];

/* Tiếng gốc cho dãy luyện dấu thanh (ma – má – mà …). */
const TONE_BASES = [['m', 'a'], ['b', 'a'], ['c', 'a'], ['l', 'a'], ['b', 'o'], ['m', 'e'], ['c', 'ô'], ['v', 'ơ']];

/* Các câu nói cố định; câu có phần thay đổi được ghép từ nhiều đoạn để dùng âm thanh thu sẵn. */
const PHRASES = {
  greet: 'Chào bé yêu! Hôm nay mình cùng học chữ và tập đánh vần nhé!',
  findLetter: 'Bé tìm chữ',
  findPicture: 'Bé tìm hình',
  findWord: 'Hình này là gì nhỉ?',
  dragPrompt: 'Bé ghép chữ',
  dragWrong: 'Chưa đúng. Chữ này là',
  finished: 'Hoàn thành! Bé đúng',
  outOf: 'trên mười câu.',
  keepTrying: 'Cố lên nhé!',
  gotSticker: 'Hoan hô! Bé nhận được sticker',
  needStars: 'Bé cần',
  needStars2: 'ngôi sao để mở sticker này!',
  test: 'Xin chào bé! Bé có nghe rõ không nào?',
};
