'use strict';

/* Hình minh hoạ SVG vẽ tay (viewBox 100×100). */
const Art = (() => {
  const O = '#3d2c29';
  const dot = (x, y, r, fill) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="none"/>`;
  const eyes = (x1, x2, y, r = 3.5) =>
    dot(x1, y, r, O) + dot(x2, y, r, O) + dot(x1 + 1.2, y - 1.3, r * 0.35, '#fff') + dot(x2 + 1.2, y - 1.3, r * 0.35, '#fff');
  const cheeks = (x1, x2, y, r = 4.5) =>
    `<g opacity=".5">${dot(x1, y, r, '#ff6b6b')}${dot(x2, y, r, '#ff6b6b')}</g>`;
  const smile = (x, y, w = 6) => `<path d="M${x - w} ${y} Q${x} ${y + w} ${x + w} ${y}" fill="none"/>`;

  const D = {
    ao: `
      <path d="M34 18 L44 14 Q50 22 56 14 L66 18 L88 36 L77 49 L68 42 L68 86 L32 86 L32 42 L23 49 L12 36 Z" fill="#4fc3f7"/>
      <path d="M44 14 Q50 26 56 14" fill="#81d4fa"/>
      ${dot(50, 42, 3, '#fff')}${dot(50, 55, 3, '#fff')}${dot(50, 68, 3, '#fff')}
      <path d="M58 60 h6 v8 h-6z" fill="#ffd54f"/>`,

    an: `
      <path d="M16 50 Q18 28 50 26 Q82 28 84 50 Z" fill="#fff"/>
      <g fill="#eceff1" stroke="none"><ellipse cx="36" cy="38" rx="3" ry="1.8"/><ellipse cx="52" cy="33" rx="3" ry="1.8"/><ellipse cx="64" cy="42" rx="3" ry="1.8"/><ellipse cx="44" cy="45" rx="3" ry="1.8"/></g>
      <path d="M58 40 L90 10 M63 43 L94 16" stroke="#a1887f" stroke-width="4"/>
      <path d="M12 50 H88 Q86 82 50 86 Q14 82 12 50 Z" fill="#ff8a65"/>
      <path d="M20 62 Q50 72 80 62" fill="none" stroke="#fff" stroke-width="3"/>
      <path d="M40 86 L42 93 H58 L60 86" fill="#ff7043"/>`,

    am: `
      <path d="M24 50 Q6 52 14 70 Q18 78 28 74" fill="none" stroke-width="5"/>
      <path d="M74 62 Q88 58 92 40 L97 42 Q95 66 76 72 Z" fill="#66bb6a"/>
      <ellipse cx="50" cy="62" rx="30" ry="24" fill="#81c784"/>
      <ellipse cx="50" cy="40" rx="16" ry="5" fill="#66bb6a"/>
      ${dot(50, 33, 4.5, '#ffca28')}
      <path d="M26 62 Q50 72 74 62" fill="none" stroke="#fff" stroke-width="3"/>
      <path d="M42 22 Q38 16 42 10 M56 22 Q52 16 56 10" fill="none" stroke="#b0bec5" stroke-width="3"/>`,

    bong: `
      <circle cx="50" cy="52" r="34" fill="#ef5350"/>
      <path d="M18 42 Q50 30 82 42" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="butt"/>
      <path d="M18 62 Q50 74 82 62" fill="none" stroke="#ffeb3b" stroke-width="7" stroke-linecap="butt"/>
      <circle cx="50" cy="52" r="34" fill="none"/>
      <ellipse cx="36" cy="32" rx="7" ry="4" fill="#fff" opacity=".6" stroke="none" transform="rotate(-35 36 32)"/>`,

    ca: `
      ${dot(12, 28, 3, '#b3e5fc')}${dot(7, 18, 2, '#b3e5fc')}
      <path d="M70 50 L93 32 Q88 50 93 68 Z" fill="#ff9800"/>
      <path d="M36 32 Q48 16 62 32" fill="#ff9800"/>
      <ellipse cx="44" cy="50" rx="30" ry="21" fill="#ffb74d"/>
      <path d="M48 40 Q54 50 48 60 M58 40 Q64 50 58 60" fill="none" stroke="#f57c00"/>
      ${dot(28, 45, 5.5, '#fff')}${dot(27, 45.5, 3, O)}
      <path d="M17 56 Q22 61 28 57" fill="none"/>`,

    de: `
      <path d="M36 28 Q24 8 40 6 Q34 18 44 26Z" fill="#bcaaa4"/>
      <path d="M64 28 Q76 8 60 6 Q66 18 56 26Z" fill="#bcaaa4"/>
      <ellipse cx="22" cy="42" rx="13" ry="6" fill="#eeeeee" transform="rotate(20 22 42)"/>
      <ellipse cx="78" cy="42" rx="13" ry="6" fill="#eeeeee" transform="rotate(-20 78 42)"/>
      <path d="M43 74 L50 95 L57 74Z" fill="#e0e0e0"/>
      <path d="M30 34 Q50 18 70 34 L64 70 Q50 82 36 70 Z" fill="#fafafa"/>
      ${eyes(41, 59, 46)}
      <ellipse cx="50" cy="65" rx="7" ry="4" fill="#f8bbd0"/>
      ${cheeks(36, 64, 56, 3.5)}`,

    den: `
      <path d="M50 2 V15" fill="none"/>
      <rect x="37" y="13" width="26" height="8" rx="3" fill="#ffca28"/>
      <ellipse cx="50" cy="48" rx="33" ry="28" fill="#e53935"/>
      <path d="M50 20 Q32 48 50 76 M50 20 Q68 48 50 76 M50 20 Q20 48 50 76 M50 20 Q80 48 50 76" fill="none" stroke="#b71c1c" stroke-width="2"/>
      <ellipse cx="38" cy="40" rx="5" ry="10" fill="#ff8a80" opacity=".8" stroke="none"/>
      <rect x="37" y="74" width="26" height="8" rx="3" fill="#ffca28"/>
      <path d="M44 82 L41 97 M50 82 V99 M56 82 L59 97" fill="none" stroke="#ffb300" stroke-width="3"/>`,

    embe: `
      <circle cx="18" cy="56" r="7" fill="#ffd199"/><circle cx="82" cy="56" r="7" fill="#ffd199"/>
      <circle cx="50" cy="54" r="32" fill="#ffe0b2"/>
      <path d="M50 23 Q42 12 52 9 Q60 11 55 18" fill="none" stroke-width="3"/>
      <path d="M35 50 Q40 44 45 50 M55 50 Q60 44 65 50" fill="none" stroke-width="3"/>
      ${cheeks(33, 67, 61, 5)}
      <path d="M42 66 Q50 75 58 66 Z" fill="#ff8a80"/>`,

    ech: `
      <circle cx="32" cy="36" r="14" fill="#66bb6a"/><circle cx="68" cy="36" r="14" fill="#66bb6a"/>
      <ellipse cx="50" cy="62" rx="37" ry="27" fill="#66bb6a"/>
      <ellipse cx="50" cy="75" rx="19" ry="10" fill="#c5e1a5" stroke="none"/>
      <circle cx="32" cy="36" r="8" fill="#fff"/><circle cx="68" cy="36" r="8" fill="#fff"/>
      ${dot(33, 37, 4, O)}${dot(69, 37, 4, O)}
      <path d="M30 60 Q50 74 70 60" fill="none" stroke-width="3"/>
      ${cheeks(24, 76, 56)}`,

    ga: `
      <path d="M77 52 Q97 34 92 60 Q88 72 76 67Z" fill="#8d6e63"/>
      <path d="M38 24 Q40 10 47 18 Q52 6 57 18 Q64 10 63 26Z" fill="#e53935"/>
      <ellipse cx="50" cy="56" rx="30" ry="28" fill="#ffcc80"/>
      <path d="M48 58 Q60 48 72 60 Q63 74 48 67Z" fill="#ffb74d"/>
      <path d="M21 43 L10 48 L21 53Z" fill="#ffa000"/>
      <path d="M24 55 Q19 64 26 64 Q29 59 27 55Z" fill="#e53935"/>
      ${eyes(32, 32, 42, 3)}
      <path d="M42 84 V94 M58 84 V94 M37 94 H47 M53 94 H63" fill="none" stroke="#ffa000" stroke-width="3"/>`,

    hoa: `
      <path d="M50 56 Q47 76 50 97" fill="none" stroke="#43a047" stroke-width="5"/>
      <path d="M50 82 Q30 66 22 77 Q36 88 50 82Z" fill="#66bb6a"/>
      <path d="M50 75 Q70 60 78 71 Q64 81 50 75Z" fill="#66bb6a"/>
      <g fill="#f48fb1">
        <circle cx="50" cy="20" r="13"/><circle cx="65" cy="31" r="13"/><circle cx="59" cy="49" r="13"/>
        <circle cx="41" cy="49" r="13"/><circle cx="35" cy="31" r="13"/>
      </g>
      <circle cx="50" cy="36" r="11" fill="#ffeb3b"/>
      ${eyes(46, 54, 34, 1.8)}${smile(50, 39, 3)}`,

    bi: `
      <circle cx="70" cy="28" r="13" fill="#ffca28"/>
      <path d="M62 26 Q70 20 78 28" fill="none" stroke="#fff8e1" stroke-width="3"/>
      <circle cx="75" cy="72" r="16" fill="#ef5350"/>
      <path d="M64 70 Q74 60 86 72" fill="none" stroke="#ffcdd2" stroke-width="3"/>
      <circle cx="38" cy="56" r="27" fill="#42a5f5"/>
      <path d="M20 52 Q38 36 56 52 Q44 68 28 60" fill="none" stroke="#e3f2fd" stroke-width="4"/>
      ${dot(29, 44, 5, 'rgba(255,255,255,.85)')}${dot(68, 64, 3, 'rgba(255,255,255,.85)')}${dot(66, 22, 2.5, 'rgba(255,255,255,.85)')}`,

    kem: `
      <path d="M31 52 L50 97 L69 52Z" fill="#ffcc80"/>
      <path d="M38 62 L60 56 M42 74 L64 60 M36 56 L54 88 M46 54 L62 74" fill="none" stroke="#e0a15a" stroke-width="2"/>
      <circle cx="39" cy="46" r="14" fill="#f48fb1"/>
      <circle cx="61" cy="46" r="14" fill="#a5d6a7"/>
      <circle cx="50" cy="29" r="14" fill="#fff59d"/>
      <path d="M44 24 l3 -2 M54 30 l3 2 M48 34 l-2 3 M36 44 l3 -2 M62 42 l2 3" stroke="#e91e63" stroke-width="2.4"/>
      <path d="M54 9 Q56 3 61 2" fill="none"/>
      <circle cx="53" cy="13" r="5" fill="#e53935"/>`,

    la: `
      <path d="M20 80 L9 93" fill="none" stroke="#2e7d32" stroke-width="4"/>
      <path d="M20 80 Q14 28 82 16 Q88 72 20 80Z" fill="#66bb6a"/>
      <path d="M20 80 Q50 50 80 19" fill="none" stroke="#2e7d32"/>
      <path d="M34 64 L31 50 M44 54 L57 57 M50 47 L47 34 M60 38 L71 41" fill="none" stroke="#2e7d32" stroke-width="2"/>`,

    meo: `
      <path d="M22 42 L25 10 L47 28Z" fill="#ffb74d"/><path d="M78 42 L75 10 L53 28Z" fill="#ffb74d"/>
      <path d="M28 34 L29 19 L40 28Z" fill="#f8bbd0" stroke="none"/><path d="M72 34 L71 19 L60 28Z" fill="#f8bbd0" stroke="none"/>
      <ellipse cx="50" cy="56" rx="35" ry="30" fill="#ffb74d"/>
      <path d="M44 27 L46 35 M50 26 V35 M56 27 L54 35" fill="none" stroke="#f57c00" stroke-width="3"/>
      <ellipse cx="37" cy="53" rx="4.5" ry="6.5" fill="${O}" stroke="none"/><ellipse cx="63" cy="53" rx="4.5" ry="6.5" fill="${O}" stroke="none"/>
      ${dot(38.5, 50.5, 1.6, '#fff')}${dot(64.5, 50.5, 1.6, '#fff')}
      <path d="M45 63 H55 L50 68Z" fill="#f06292"/>
      <path d="M50 68 Q46 74 41 71 M50 68 Q54 74 59 71" fill="none"/>
      <path d="M26 62 H9 M27 69 L12 75 M74 62 H91 M73 69 L88 75" fill="none" stroke-width="2"/>
      ${cheeks(29, 71, 64)}`,

    nam: `
      <path d="M37 54 Q34 86 42 91 H58 Q66 86 63 54Z" fill="#fff3e0"/>
      <path d="M9 58 Q11 14 50 12 Q89 14 91 58 Q50 67 9 58Z" fill="#e53935"/>
      <g fill="#fff" stroke="none"><circle cx="30" cy="36" r="6"/><circle cx="53" cy="26" r="7"/><circle cx="73" cy="40" r="6"/><circle cx="47" cy="48" r="4"/><circle cx="18" cy="52" r="3"/></g>
      ${eyes(45, 55, 71, 2.5)}${smile(50, 77, 4)}`,

    ong: `
      <ellipse cx="42" cy="26" rx="12" ry="17" fill="#e1f5fe" transform="rotate(-25 42 26)"/>
      <ellipse cx="62" cy="26" rx="12" ry="17" fill="#e1f5fe" transform="rotate(25 62 26)"/>
      <path d="M82 58 L95 58 L82 65Z" fill="${O}"/>
      <ellipse cx="50" cy="58" rx="33" ry="24" fill="#ffd54f"/>
      <path d="M52 35 V81 M67 38 V78" fill="none" stroke="${O}" stroke-width="7" stroke-linecap="butt"/>
      <ellipse cx="50" cy="58" rx="33" ry="24" fill="none"/>
      <path d="M28 38 Q22 24 15 22 M35 36 Q35 22 31 15" fill="none"/>
      ${dot(15, 22, 3, O)}${dot(31, 15, 3, O)}
      ${eyes(30, 30, 53, 4)}
      <path d="M24 65 Q30 70 36 65" fill="none"/>
      ${cheeks(38, 38, 63, 3.5)}`,

    o: `
      <path d="M50 50 V84 Q50 94 40 92 Q34 90 34 84" fill="none" stroke="#6d4c41" stroke-width="5"/>
      <path d="M8 54 Q10 14 50 12 Q90 14 92 54 Q85 46 78 54 Q71 46 64 54 Q57 46 50 54 Q43 46 36 54 Q29 46 22 54 Q15 46 8 54Z" fill="#ab47bc"/>
      <path d="M50 12 Q36 30 36 54 L22 54 Q20 30 50 12Z" fill="#ffca28" stroke="none"/>
      <path d="M50 12 Q64 30 64 54 L78 54 Q80 30 50 12Z" fill="#ffca28" stroke="none"/>
      <path d="M8 54 Q10 14 50 12 Q90 14 92 54 Q85 46 78 54 Q71 46 64 54 Q57 46 50 54 Q43 46 36 54 Q29 46 22 54 Q15 46 8 54Z" fill="none"/>
      <path d="M50 12 V5" fill="none" stroke-width="4"/>`,

    no: `
      <path d="M46 54 L33 89 L42 85 L46 93 L53 56Z" fill="#ec407a"/>
      <path d="M54 54 L67 89 L58 85 L54 93 L47 56Z" fill="#ec407a"/>
      <path d="M50 48 Q20 16 11 40 Q7 64 50 53Z" fill="#f48fb1"/>
      <path d="M50 48 Q80 16 89 40 Q93 64 50 53Z" fill="#f48fb1"/>
      <g fill="#fff" stroke="none" opacity=".8"><circle cx="24" cy="38" r="3"/><circle cx="32" cy="48" r="2.5"/><circle cx="76" cy="38" r="3"/><circle cx="68" cy="48" r="2.5"/></g>
      <rect x="41" y="40" width="18" height="19" rx="7" fill="#ec407a"/>`,

    pin: `
      <rect x="80" y="41" width="9" height="18" rx="3" fill="#bdbdbd"/>
      <rect x="12" y="28" width="68" height="44" rx="10" fill="#66bb6a"/>
      <path d="M12 38 Q12 28 22 28 H34 V72 H22 Q12 72 12 62Z" fill="#37474f"/>
      <path d="M58 32 L44 52 H55 L48 68 L66 46 H55 L62 32Z" fill="#ffeb3b"/>`,

    qua: `
      <circle cx="50" cy="57" r="33" fill="#ffa726"/>
      <g fill="#fb8c00" stroke="none"><circle cx="36" cy="50" r="1.6"/><circle cx="62" cy="46" r="1.6"/><circle cx="56" cy="70" r="1.6"/><circle cx="40" cy="70" r="1.6"/><circle cx="70" cy="62" r="1.6"/><circle cx="48" cy="60" r="1.6"/></g>
      <ellipse cx="36" cy="42" rx="6" ry="9" fill="#fff" opacity=".45" stroke="none" transform="rotate(30 36 42)"/>
      <path d="M50 25 Q51 16 56 11" fill="none" stroke="#6d4c41" stroke-width="4"/>
      <path d="M54 19 Q72 4 81 17 Q66 28 54 19Z" fill="#66bb6a"/>`,

    rua: `
      <ellipse cx="30" cy="72" rx="8" ry="11" fill="#9ccc65"/><ellipse cx="72" cy="72" rx="8" ry="11" fill="#9ccc65"/>
      <path d="M84 62 L95 66 L84 70Z" fill="#9ccc65"/>
      <circle cx="16" cy="54" r="12" fill="#9ccc65"/>
      ${eyes(13, 13, 51, 2.8)}
      <path d="M8 59 Q12 62 16 60" fill="none"/>
      <path d="M22 66 Q24 24 55 24 Q86 24 88 66Z" fill="#43a047"/>
      <path d="M55 31 L66 42 L62 57 H48 L44 42Z" fill="#66bb6a" stroke-width="2"/>
      <path d="M44 42 L30 44 M66 42 L80 44 M48 57 L40 66 M62 57 L70 66 M55 31 V24" fill="none" stroke-width="2"/>
      <path d="M20 66 H90" stroke-width="4"/>`,

    sao: `
      <path d="M50 7 L61 36 L93 38 L68 58 L77 91 L50 72 L23 91 L32 58 L7 38 L39 36Z" fill="#ffd54f"/>
      ${eyes(43, 57, 51, 3)}${smile(50, 60, 6)}${cheeks(37, 63, 59, 3.5)}
      <path d="M86 12 v10 M81 17 h10 M12 70 v8 M8 74 h8" stroke="#ffb300" stroke-width="2.5"/>`,

    tao: `
      <path d="M50 30 Q30 18 18 34 Q8 56 24 78 Q36 94 50 86 Q64 94 76 78 Q92 56 82 34 Q70 18 50 30Z" fill="#ef5350"/>
      <path d="M50 30 Q50 18 56 9" fill="none" stroke="#6d4c41" stroke-width="4"/>
      <path d="M55 18 Q70 5 79 15 Q66 26 55 18Z" fill="#66bb6a"/>
      <ellipse cx="31" cy="46" rx="5" ry="10" fill="#fff" opacity=".5" stroke="none" transform="rotate(15 31 46)"/>`,

    cu: `
      <path d="M24 32 L20 10 L40 24Z" fill="#8d6e63"/><path d="M76 32 L80 10 L60 24Z" fill="#8d6e63"/>
      <path d="M22 30 Q50 14 78 30 Q92 60 76 85 Q50 97 24 85 Q8 60 22 30Z" fill="#a1887f"/>
      <ellipse cx="50" cy="70" rx="19" ry="17" fill="#efebe9"/>
      <path d="M42 64 l3 3 l3 -3 M52 64 l3 3 l3 -3 M47 74 l3 3 l3 -3" fill="none" stroke="#bcaaa4" stroke-width="2"/>
      <circle cx="36" cy="43" r="13" fill="#fff"/><circle cx="64" cy="43" r="13" fill="#fff"/>
      ${eyes(37, 63, 44, 6)}
      <path d="M45 52 L55 52 L50 60Z" fill="#ffa000"/>
      <path d="M40 92 V96 M46 92 V96 M54 92 V96 M60 92 V96" stroke="#ffa000" stroke-width="3"/>`,

    sutu: () => {
      let mane = '';
      for (let k = 0; k < 12; k++) {
        const a = (k * Math.PI) / 6;
        mane += `<circle cx="${(50 + 33 * Math.cos(a)).toFixed(1)}" cy="${(52 + 33 * Math.sin(a)).toFixed(1)}" r="12" fill="#ef6c00"/>`;
      }
      return `${mane}
        <circle cx="50" cy="52" r="33" fill="#ef6c00" stroke="none"/>
        <circle cx="32" cy="30" r="7" fill="#ffca28"/><circle cx="68" cy="30" r="7" fill="#ffca28"/>
        <circle cx="50" cy="54" r="26" fill="#ffca28"/>
        ${eyes(41, 59, 49, 3.5)}
        <path d="M45 58 H55 L50 64Z" fill="#6d4c41"/>
        <path d="M50 64 Q46 70 42 67 M50 64 Q54 70 58 67" fill="none"/>
        ${cheeks(35, 65, 60)}
        <g fill="#6d4c41" stroke="none"><circle cx="40" cy="63" r="1"/><circle cx="37" cy="66" r="1"/><circle cx="60" cy="63" r="1"/><circle cx="63" cy="66" r="1"/></g>`;
    },

    voi: `
      <ellipse cx="20" cy="46" rx="18" ry="24" fill="#90a4ae"/><ellipse cx="80" cy="46" rx="18" ry="24" fill="#90a4ae"/>
      <ellipse cx="22" cy="46" rx="10" ry="15" fill="#f8bbd0" stroke="none"/><ellipse cx="78" cy="46" rx="10" ry="15" fill="#f8bbd0" stroke="none"/>
      <ellipse cx="50" cy="44" rx="26" ry="26" fill="#b0bec5"/>
      <path d="M41 58 Q39 80 47 90 Q56 97 63 88 L58 84 Q54 89 52 82 Q50 72 59 58" fill="#b0bec5"/>
      ${eyes(40, 60, 40, 3.5)}${cheeks(35, 65, 50, 4)}`,

    xe: `
      <path d="M8 62 Q8 50 18 48 L30 46 L40 30 Q44 26 50 26 H66 Q72 26 76 32 L84 46 Q94 48 94 60 V68 H8Z" fill="#ef5350"/>
      <path d="M43 32 H56 V46 H35Z" fill="#b3e5fc"/>
      <path d="M60 32 H68 Q70 32 72 36 L78 46 H60Z" fill="#b3e5fc"/>
      <path d="M58 52 h6" stroke-width="3"/>
      <circle cx="28" cy="69" r="10" fill="#37474f"/>${dot(28, 69, 4, '#cfd8dc')}
      <circle cx="74" cy="69" r="10" fill="#37474f"/>${dot(74, 69, 4, '#cfd8dc')}
      ${dot(90, 55, 3.5, '#ffeb3b')}`,

    maybay: `
      <path d="M8 90 Q14 82 24 86 Q30 78 40 84 Q46 90 40 94 H10 Q4 94 8 90Z" fill="#fff"/>
      <path d="M44 54 L30 86 H40 L62 56Z" fill="#1e88e5"/>
      <path d="M17 46 L9 22 H19 L32 44Z" fill="#1e88e5"/>
      <path d="M12 44 Q12 38 22 38 H78 Q95 40 95 49 Q95 58 80 58 H22 Q12 58 12 50Z" fill="#e3f2fd"/>
      <path d="M46 46 L34 14 H44 L64 46Z" fill="#42a5f5"/>
      <path d="M80 41 Q89 42 91 48 H80Z" fill="#90caf9"/>
      <g fill="#64b5f6" stroke="none"><circle cx="30" cy="50" r="2.6"/><circle cx="40" cy="50" r="2.6"/><circle cx="66" cy="50" r="2.6"/><circle cx="74" cy="50" r="2.6"/></g>`,

    tho: `
      <ellipse cx="37" cy="24" rx="9" ry="21" fill="#fff"/><ellipse cx="63" cy="24" rx="9" ry="21" fill="#fff"/>
      <ellipse cx="37" cy="25" rx="4" ry="14" fill="#f8bbd0" stroke="none"/><ellipse cx="63" cy="25" rx="4" ry="14" fill="#f8bbd0" stroke="none"/>
      <ellipse cx="50" cy="63" rx="29" ry="27" fill="#fff"/>
      ${eyes(39, 61, 58, 3.5)}
      <ellipse cx="50" cy="68" rx="4.5" ry="3.2" fill="#f06292"/>
      <path d="M50 71 V75 M50 75 Q45 79 42 76 M50 75 Q55 79 58 76" fill="none"/>
      <rect x="46" y="76" width="8" height="7" rx="1.5" fill="#fff"/>
      ${cheeks(32, 68, 68)}`,

    mu: `
      <ellipse cx="50" cy="66" rx="45" ry="15" fill="#ffe082"/>
      <path d="M26 65 Q25 25 50 25 Q75 25 74 65Z" fill="#ffd54f"/>
      <path d="M26 52 Q50 58 74 52 L74 61 Q50 67 26 61Z" fill="#e91e63"/>
      <circle cx="68" cy="56" r="6" fill="#fff59d"/>${dot(68, 56, 2.5, '#ff9800')}`,

    vit: `
      <path d="M2 84 Q12 78 22 84 T42 84 T62 84 T82 84 T102 84" fill="none" stroke="#4fc3f7" stroke-width="4"/>
      <path d="M80 58 L95 46 L89 66Z" fill="#ffee58"/>
      <ellipse cx="55" cy="66" rx="32" ry="18" fill="#ffee58"/>
      <circle cx="33" cy="40" r="17" fill="#ffee58"/>
      <path d="M18 40 Q5 42 7 50 Q16 53 22 48Z" fill="#ff9800"/>
      ${eyes(31, 31, 36, 3)}${cheeks(40, 40, 44, 3.5)}
      <path d="M50 62 Q64 53 77 64 Q66 77 52 70Z" fill="#fdd835"/>`,

    cho: `
      <ellipse cx="23" cy="47" rx="10" ry="21" fill="#8d6e63" transform="rotate(15 23 47)"/>
      <ellipse cx="77" cy="47" rx="10" ry="21" fill="#8d6e63" transform="rotate(-15 77 47)"/>
      <ellipse cx="50" cy="52" rx="28" ry="29" fill="#d7ccc8"/>
      <ellipse cx="62" cy="43" rx="10" ry="9" fill="#bcaaa4" stroke="none"/>
      ${eyes(40, 61, 46, 3.5)}
      <ellipse cx="50" cy="65" rx="14" ry="11" fill="#fff"/>
      <ellipse cx="50" cy="59" rx="5.5" ry="4" fill="${O}"/>
      <path d="M47 70 Q50 80 53 70Z" fill="#f06292"/>
      <path d="M50 63 V68 M50 68 Q45 72 42 69 M50 68 Q55 72 58 69" fill="none"/>`,

    gau: `
      <circle cx="27" cy="27" r="12" fill="#a1887f"/><circle cx="73" cy="27" r="12" fill="#a1887f"/>
      ${dot(27, 27, 5.5, '#d7ccc8')}${dot(73, 27, 5.5, '#d7ccc8')}
      <circle cx="50" cy="55" r="33" fill="#a1887f"/>
      <ellipse cx="50" cy="66" rx="15" ry="11" fill="#d7ccc8"/>
      <ellipse cx="50" cy="60" rx="6" ry="4.2" fill="${O}"/>
      <path d="M50 64 V69 M50 69 Q46 73 43 70 M50 69 Q54 73 57 70" fill="none"/>
      ${eyes(38, 62, 48, 3.5)}${cheeks(31, 69, 62)}`,

    heo: `
      <path d="M24 38 L20 13 L42 27Z" fill="#f48fb1"/><path d="M76 38 L80 13 L58 27Z" fill="#f48fb1"/>
      <circle cx="50" cy="55" r="33" fill="#f8bbd0"/>
      <ellipse cx="50" cy="64" rx="15" ry="11" fill="#f48fb1"/>
      <ellipse cx="45" cy="64" rx="2.6" ry="4" fill="${O}" stroke="none"/><ellipse cx="55" cy="64" rx="2.6" ry="4" fill="${O}" stroke="none"/>
      ${eyes(37, 63, 46, 3.5)}${cheeks(29, 71, 60)}`,
  };

  /* Hình vẽ các dấu thanh (viewBox 40×40, dùng currentColor). */
  const MARK = {
    ngang: '<path d="M8 20 H32" stroke-dasharray="1 7"/>',
    sac: '<path d="M14 31 L27 9"/>',
    huyen: '<path d="M13 9 L26 31"/>',
    hoi: '<path d="M12 13 Q13 5 21 5 Q29 6 28 14 Q27 20 20 21 V29"/>',
    nga: '<path d="M6 23 Q12 11 20 20 Q28 29 34 17"/>',
    nang: '<circle cx="20" cy="21" r="6" fill="currentColor"/>',
  };

  function svg(id, cls = '') {
    const body = D[id];
    if (!body) return '';
    return `<svg class="art ${cls}" viewBox="0 0 100 100" aria-hidden="true"><g stroke="${O}" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round">${typeof body === 'function' ? body() : body}</g></svg>`;
  }

  function mark(tone, cls = '') {
    return `<svg class="tone-mark ${cls}" viewBox="0 0 40 40" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">${MARK[tone] || ''}</g></svg>`;
  }

  return { svg, mark, has: id => id in D };
})();
