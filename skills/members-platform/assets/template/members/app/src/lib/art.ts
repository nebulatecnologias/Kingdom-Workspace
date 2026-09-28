/**
 * Built-in sample line art, ported from the prototype (members/prototype/src/art.js).
 * Products and pages refer to it as "builtin:<key>" in cover_path / lineart_path; real products use uploaded files.
 * Every fillable region has class="r" and a suggested colour in data-c, which the colouring studio uses.
 */
const INK = "#1d1b18";
function star(cx: number, cy: number, R: number, r: number, n = 5, rot = -90) {
  const pts = [];
  for (let i = 0; i < n * 2; i++) {
    const rad = i % 2 ? r : R;
    const a = (rot + (i * 180) / n) * Math.PI / 180;
    pts.push((cx + rad * Math.cos(a)).toFixed(1) + ',' + (cy + rad * Math.sin(a)).toFixed(1));
  }
  return pts.join(' ');
}
const f = (c: string) => `class="r" data-c="${c}"`;
const line = (d: string, w = 3) => `<path d="${d}" fill="none" stroke-width="${w}"/>`;
const dot = (x: number, y: number, r = 2.6) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${INK}" stroke="none"/>`;
const cloud = (x: number, y: number, s = 1, c = '#eef4fb') =>
  `<path ${f(c)} transform="translate(${x} ${y}) scale(${s})" d="M0 20 a12 12 0 0 1 14-15 a16 16 0 0 1 30 2 a11 11 0 0 1 6 21 h-44 a9 9 0 0 1 -6-8z"/>`;
const flower = (x: number, y: number, c = '#ff8fb1', s = 1) => {
  let p = '';
  for (let i = 0; i < 5; i++) {
    const a = (i * 72 - 90) * Math.PI / 180;
    p += `<circle ${f(c)} cx="${(x + Math.cos(a) * 6 * s).toFixed(1)}" cy="${(y + Math.sin(a) * 6 * s).toFixed(1)}" r="${4.6 * s}"/>`;
  }
  return p + `<circle ${f('#ffd54a')} cx="${x}" cy="${y}" r="${3.6 * s}"/>`;
};
function waves(y: number, c = '#5ab0e6', amp = 9) {
  let d = `M-5 ${y}`;
  for (let x = -5; x < 205; x += 25) d += ` q12.5 ${-amp} 25 0`;
  return `<path ${f(c)} d="${d} V205 H-5Z"/>`;
}
function waveLine(y: number, amp = 7) {
  let d = `M-5 ${y}`;
  for (let x = -5; x < 205; x += 25) d += ` q12.5 ${-amp} 25 0`;
  return line(d, 2.4);
}

const ART: Record<string, () => string> = {
  ark: () => `
    <circle ${f('#ffc94a')} cx="160" cy="42" r="17"/>
    ${line('M160 14v-7M160 77v-7M132 42h-7M195 42h-7M140 22l-5-5M180 22l5-5M140 62l-5 5M180 62l5 5', 2.6)}
    ${cloud(20, 30, 1.1)}
    <path ${f('#d9573b')} d="M52 92 L100 62 L148 92 Z"/>
    <rect ${f('#f0c27a')} x="62" y="90" width="76" height="34" rx="3"/>
    <rect ${f('#8fd3f4')} x="88" y="98" width="24" height="17" rx="4"/>
    ${line('M100 98v17M88 106.5h24', 2.2)}
    <circle ${f('#8fd3f4')} cx="73" cy="106" r="5"/><circle ${f('#8fd3f4')} cx="127" cy="106" r="5"/>
    <path ${f('#b7743f')} d="M22 124 H178 L160 158 H40 Z"/>
    ${line('M31 136 H169 M38 147 H162', 2.4)}
    ${waves(160)}
    ${waveLine(182)}`,
  dove: () => `
    ${cloud(126, 20, .9)}
    <path ${f('#e4e9f2')} d="M62 110 L26 92 L33 113 L24 130 L64 120 Z"/>
    <path ${f('#f5f7fb')} d="M58 112 C58 82 98 70 130 84 C152 94 162 110 152 122 C132 142 80 142 58 112 Z"/>
    <path ${f('#e4e9f2')} d="M86 98 C90 62 120 42 142 46 C134 68 126 90 108 106 Z"/>
    ${line('M100 80 C108 70 118 62 128 58 M96 92 C106 82 118 72 130 66', 2.2)}
    <circle ${f('#f5f7fb')} cx="150" cy="96" r="15"/>
    <path ${f('#ffb23f')} d="M163 92 L182 98 L163 104 Z"/>
    ${dot(152, 92)}
    ${line('M176 104 C184 122 178 146 162 160', 2.8)}
    <ellipse ${f('#7cc36a')} cx="186" cy="122" rx="8" ry="4.5" transform="rotate(-50 186 122)"/>
    <ellipse ${f('#7cc36a')} cx="168" cy="132" rx="8" ry="4.5" transform="rotate(35 168 132)"/>
    <ellipse ${f('#7cc36a')} cx="180" cy="146" rx="8" ry="4.5" transform="rotate(-30 180 146)"/>
    <path ${f('#9fd88f')} d="M0 186 Q60 164 110 180 T200 176 V200 H0Z"/>`,
  rainbow: () => {
    const band = (R: number, r: number, c: string) => `<path ${f(c)} d="M${100 - R} 150 A${R} ${R} 0 0 1 ${100 + R} 150 L${100 + r} 150 A${r} ${r} 0 0 0 ${100 - r} 150 Z"/>`;
    return `
    ${band(84, 71, '#f2594b')}${band(71, 58, '#ff9f43')}${band(58, 45, '#ffd54a')}${band(45, 32, '#6cc56a')}
    ${cloud(0, 130, 1.1)}${cloud(132, 130, 1.1)}
    <circle ${f('#ffc94a')} cx="30" cy="36" r="13"/>
    <path ${f('#8ed081')} d="M0 172 Q50 148 100 168 T200 164 V200 H0Z"/>
    ${flower(40, 186, '#ff8fb1', .8)}${flower(160, 184, '#b69cff', .8)}`;
  },
  sky: () => `
    <circle ${f('#ffc94a')} cx="62" cy="70" r="30"/>
    ${[0, 45, 90, 135, 180, 225, 270, 315].map(a => { const r = a * Math.PI / 180; return line(`M${(62 + Math.cos(r) * 38).toFixed(1)} ${(70 + Math.sin(r) * 38).toFixed(1)} L${(62 + Math.cos(r) * 48).toFixed(1)} ${(70 + Math.sin(r) * 48).toFixed(1)}`, 3); }).join('')}
    <path ${f('#fff1a8')} d="M156 36 A28 28 0 1 0 170 88 A22 22 0 1 1 156 36 Z"/>
    <polygon ${f('#ffe066')} points="${star(122, 128, 13, 6)}"/>
    <polygon ${f('#ffe066')} points="${star(172, 132, 9, 4)}"/>
    <polygon ${f('#ffe066')} points="${star(34, 140, 9, 4)}"/>
    <circle ${f('#9fc6ff')} cx="82" cy="160" r="18"/>
    <ellipse cx="82" cy="160" rx="30" ry="7" fill="none" transform="rotate(-14 82 160)"/>`,
  tree: () => `
    <path ${f('#8ed081')} d="M0 172 Q60 156 110 168 T200 162 V200 H0Z"/>
    <path ${f('#a8743f')} d="M90 172 C94 150 92 124 88 104 H112 C108 124 106 150 110 172 Z"/>
    ${line('M100 116 L84 100 M101 128 L118 110', 3)}
    <circle ${f('#6cc56a')} cx="70" cy="82" r="30"/>
    <circle ${f('#6cc56a')} cx="130" cy="82" r="30"/>
    <circle ${f('#7fd07a')} cx="100" cy="58" r="36"/>
    <circle ${f('#f2594b')} cx="82" cy="54" r="6"/><circle ${f('#f2594b')} cx="118" cy="46" r="6"/>
    <circle ${f('#f2594b')} cx="136" cy="86" r="6"/><circle ${f('#f2594b')} cx="64" cy="90" r="6"/>
    <circle ${f('#f2594b')} cx="104" cy="80" r="6"/>
    ${flower(30, 170, '#ff8fb1')}${flower(170, 166, '#b69cff')}`,
  fish: () => `
    ${waves(26, '#bfe3f7', 6)}
    <path ${f('#ff9f43')} d="M40 96 C60 66 110 66 130 96 C110 126 60 126 40 96 Z"/>
    <path ${f('#ff9f43')} d="M128 96 L160 72 L154 96 L160 120 Z"/>
    ${line('M70 80 C76 90 76 102 70 112', 2.4)}
    ${dot(56, 92, 3.2)}
    <path ${f('#b69cff')} d="M92 150 C104 134 132 134 144 150 C132 166 104 166 92 150 Z"/>
    <path ${f('#b69cff')} d="M143 150 L164 138 L160 150 L164 162 Z"/>
    ${dot(104, 147)}
    <circle ${f('#e8f6ff')} cx="36" cy="56" r="6"/><circle ${f('#e8f6ff')} cx="48" cy="44" r="4"/><circle ${f('#e8f6ff')} cx="172" cy="112" r="5"/>
    <path ${f('#6cc56a')} d="M18 200 C10 176 30 166 20 146 C34 160 30 180 34 200 Z"/>
    <path ${f('#6cc56a')} d="M180 200 C174 180 190 170 184 152 C196 166 194 186 194 200 Z"/>`,
  lamb: () => `
    <path ${f('#8ed081')} d="M0 170 Q60 158 110 166 T200 162 V200 H0Z"/>
    ${line('M72 150 V174 M88 152 V176 M122 152 V176 M138 150 V174', 7)}
    <path ${f('#fbfaf7')} d="M60 120 a14 14 0 0 1 10-22 a16 16 0 0 1 26-10 a16 16 0 0 1 28 0 a16 16 0 0 1 24 12 a14 14 0 0 1 4 26 a14 14 0 0 1 -18 20 a16 16 0 0 1 -28 2 a16 16 0 0 1 -28 -4 a14 14 0 0 1 -18 -24 z"/>
    <ellipse ${f('#f6d7c3')} cx="150" cy="96" rx="18" ry="22" transform="rotate(-18 150 96)"/>
    <ellipse ${f('#f2c1ab')} cx="134" cy="80" rx="10" ry="5" transform="rotate(-30 134 80)"/>
    <ellipse ${f('#f2c1ab')} cx="168" cy="82" rx="10" ry="5" transform="rotate(30 168 82)"/>
    ${dot(145, 94)}${dot(158, 92)}
    ${line('M150 106 q4 4 8 0', 2.4)}
    ${flower(30, 180, '#ffd54a', .8)}`,
  shepherd: () => `
    <circle ${f('#ffc94a')} cx="162" cy="40" r="16"/>
    <path ${f('#9fd88f')} d="M0 130 Q70 96 140 122 T200 118 V200 H0Z"/>
    <path ${f('#7cc36a')} d="M0 168 Q80 140 200 164 V200 H0Z"/>
    ${line('M56 186 V78 C56 56 86 56 86 76', 6)}
    <path ${f('#fbfaf7')} d="M112 140 a9 9 0 0 1 6-14 a10 10 0 0 1 16-6 a10 10 0 0 1 17 2 a9 9 0 0 1 3 16 a10 10 0 0 1 -14 9 a10 10 0 0 1 -18 0 a9 9 0 0 1 -10 -7z"/>
    <ellipse ${f('#f6d7c3')} cx="160" cy="130" rx="9" ry="11"/>
    ${dot(158, 128, 2)}
    ${line('M122 150v10M146 150v10', 4)}
    ${cloud(20, 26, .9)}`,
  whale: () => `
    ${line('M126 48 C122 34 128 22 136 16 M132 48 C134 32 144 24 152 22', 2.6)}
    <circle ${f('#bfe3f7')} cx="137" cy="14" r="5"/><circle ${f('#bfe3f7')} cx="155" cy="20" r="4"/>
    <path ${f('#5e8fd6')} d="M24 104 C24 70 70 52 116 56 C156 60 176 84 168 108 C160 132 120 142 80 138 C44 134 24 124 24 104 Z"/>
    <path ${f('#5e8fd6')} d="M28 102 L4 80 L8 108 L2 134 Z"/>
    <path ${f('#cfe6fb')} d="M60 126 C90 138 140 134 162 112 C150 132 110 144 76 140 Z"/>
    ${line('M132 112 C142 118 154 116 160 108', 2.6)}
    ${dot(138, 88, 3.6)}
    <path ${f('#4a7bc4')} d="M92 116 C96 130 112 132 116 124 C110 122 100 120 92 116 Z"/>
    ${waves(164, '#8fd0f0', 8)}
    ${waveLine(186)}`,
  boat: () => `
    <path ${f('#b6c2d6')} d="M30 44 a14 14 0 0 1 20-14 a20 20 0 0 1 38 0 a16 16 0 0 1 22 16 a12 12 0 0 1 -6 22 h-64 a14 14 0 0 1 -10 -24z"/>
    ${line('M44 78 l-6 14 M64 78 l-6 14 M84 78 l-6 14', 2.4)}
    <polygon ${f('#ffd54a')} points="140,20 124,58 138,58 128,88 156,48 142,48 150,20"/>
    ${line('M100 56 V132', 3.4)}
    <path ${f('#fbfaf7')} d="M104 62 L150 124 H104 Z"/>
    <path ${f('#f2c1ab')} d="M96 70 L60 124 H96 Z"/>
    <path ${f('#b7743f')} d="M40 132 H164 L150 156 H54 Z"/>
    ${waves(160, '#5ab0e6', 10)}
    ${waveLine(184, 9)}`,
  stable: () => `
    <polygon ${f('#ffe066')} points="${star(100, 34, 22, 9)}"/>
    ${line('M100 62 V80 M76 42 L62 50 M124 42 L138 50', 2.6)}
    <path ${f('#8ed081')} d="M0 178 Q100 160 200 178 V200 H0Z"/>
    <path ${f('#c98b4f')} d="M30 108 L100 78 L170 108 Z"/>
    <rect ${f('#e2b27a')} x="42" y="106" width="116" height="66"/>
    <path ${f('#6b4a2e')} d="M78 172 V132 a22 22 0 0 1 44 0 V172 Z"/>
    ${line('M42 128 H66 M134 128 H158 M42 150 H66 M134 150 H158', 2.2)}
    <polygon ${f('#ffe066')} points="${star(28, 60, 7, 3)}"/><polygon ${f('#ffe066')} points="${star(176, 72, 7, 3)}"/>`,
  manger: () => `
    <circle ${f('#fff1a8')} cx="100" cy="74" r="30"/>
    ${line('M60 176 L84 124 M140 176 L116 124 M60 124 L84 176 M140 124 L116 176', 5)}
    <path ${f('#ffd54a')} d="M44 118 L60 100 L74 112 L88 96 L100 110 L114 94 L126 110 L140 98 L156 118 Z"/>
    <path ${f('#c98b4f')} d="M40 116 H160 L148 140 H52 Z"/>
    <ellipse ${f('#fbfaf7')} cx="100" cy="104" rx="30" ry="14"/>
    ${line('M84 98 q8 8 16 0 M100 98 q8 8 16 0', 2.2)}
    <circle ${f('#f6d7c3')} cx="126" cy="96" r="12"/>
    ${line('M121 96 q2 2 4 0 M129 96 q2 2 4 0', 2)}
    <path ${f('#8ed081')} d="M0 184 Q100 168 200 184 V200 H0Z"/>`,
  gifts: () => `
    <path ${f('#ffd54a')} d="M44 86 L50 44 L72 66 L100 34 L128 66 L150 44 L156 86 Z"/>
    <rect ${f('#f2a93b')} x="44" y="86" width="112" height="16" rx="3"/>
    <circle ${f('#f2594b')} cx="100" cy="94" r="5"/><circle ${f('#5e8fd6')} cx="72" cy="94" r="4"/><circle ${f('#6cc56a')} cx="128" cy="94" r="4"/>
    <circle ${f('#ffe066')} cx="50" cy="44" r="5"/><circle ${f('#ffe066')} cx="100" cy="34" r="5"/><circle ${f('#ffe066')} cx="150" cy="44" r="5"/>
    <rect ${f('#b69cff')} x="28" y="130" width="62" height="52" rx="4"/>
    <rect ${f('#9d7ff5')} x="24" y="120" width="70" height="14" rx="3"/>
    ${line('M59 120 V182', 5)}
    <rect ${f('#ff8fb1')} x="110" y="138" width="60" height="44" rx="4"/>
    <rect ${f('#f7729b')} x="106" y="128" width="68" height="13" rx="3"/>
    ${line('M140 128 V182', 5)}
    ${line('M52 120 q-10-16 7-8 q17-8 7 8 M133 128 q-10-14 7-7 q17-7 7 7', 2.6)}`,
  lion: () => {
    let mane = '';
    for (let i = 0; i < 12; i++) mane += `<ellipse ${f('#f2a93b')} cx="100" cy="46" rx="15" ry="24" transform="rotate(${i * 30} 100 104)"/>`;
    return `${mane}
    <circle ${f('#ffd08a')} cx="100" cy="104" r="46"/>
    <circle ${f('#ffd08a')} cx="68" cy="68" r="11"/><circle ${f('#ffd08a')} cx="132" cy="68" r="11"/>
    <ellipse ${f('#fff1dc')} cx="100" cy="124" rx="24" ry="17"/>
    ${dot(84, 98, 3.6)}${dot(116, 98, 3.6)}
    <path ${f('#8a4a2b')} d="M92 112 H108 L100 122 Z"/>
    ${line('M100 122 V128 M100 128 q-8 8 -14 2 M100 128 q8 8 14 2', 2.6)}
    ${line('M70 122 H50 M72 130 L52 136 M130 122 H150 M128 130 L148 136', 2)}`;
  },
  heart: () => `
    <path ${f('#f2594b')} d="M100 176 C40 132 22 102 30 72 C38 44 76 38 100 66 C124 38 162 44 170 72 C178 102 160 132 100 176 Z"/>
    <path ${f('#fbfaf7')} d="M92 72 H108 V94 H126 V110 H108 V148 H92 V110 H74 V94 H92 Z"/>
    <path ${f('#ff8fb1')} d="M28 28 c-6-6 -14 2 -6 9 l6 6 l6 -6 c8-7 0-15 -6-9z"/>
    <path ${f('#ff8fb1')} d="M170 22 c-6-6 -14 2 -6 9 l6 6 l6 -6 c8-7 0-15 -6-9z"/>
    <polygon ${f('#ffe066')} points="${star(176, 150, 9, 4)}"/><polygon ${f('#ffe066')} points="${star(24, 150, 7, 3)}"/>`,
  bible: () => `
    <path ${f('#8a4a2b')} d="M18 150 L20 60 Q60 50 100 66 Q140 50 180 60 L182 150 Q140 140 100 156 Q60 140 18 150 Z"/>
    <path ${f('#fbfaf7')} d="M28 142 L30 58 Q66 46 98 62 V148 Q64 132 28 142 Z"/>
    <path ${f('#fbfaf7')} d="M172 142 L170 58 Q134 46 102 62 V148 Q136 132 172 142 Z"/>
    ${line('M42 80 Q64 74 86 82 M42 94 Q64 88 86 96 M42 108 Q64 102 86 110 M42 122 Q64 116 86 124', 2)}
    <path ${f('#f2594b')} d="M130 70 H138 V82 H150 V90 H138 V120 H130 V90 H118 V82 H130 Z"/>
    <path ${f('#f2594b')} d="M100 150 V184 L108 176 L116 184 V152 Z"/>
    <polygon ${f('#ffe066')} points="${star(100, 26, 11, 5)}"/>`,
  coins: () => `
    ${line('M100 58 V30', 3)}
    <ellipse ${f('#7cc36a')} cx="86" cy="32" rx="14" ry="7" transform="rotate(-25 86 32)"/>
    <ellipse ${f('#7cc36a')} cx="114" cy="26" rx="14" ry="7" transform="rotate(25 114 26)"/>
    <path ${f('#dff1f7')} d="M58 72 H142 V80 C156 88 160 102 160 118 V166 C160 178 152 186 140 186 H60 C48 186 40 178 40 166 V118 C40 102 44 88 58 80 Z"/>
    <rect ${f('#b7743f')} x="52" y="56" width="96" height="18" rx="6"/>
    <circle ${f('#ffc94a')} cx="80" cy="160" r="15"/><circle ${f('#ffc94a')} cx="114" cy="164" r="15"/>
    <circle ${f('#ffd54a')} cx="97" cy="134" r="15"/><circle ${f('#ffd54a')} cx="130" cy="136" r="13"/>
    ${line('M74 160 h12 M108 164 h12 M91 134 h12', 2.4)}
    ${line('M52 108 C54 98 58 92 64 88', 2.4)}
    <circle ${f('#ffd54a')} cx="166" cy="40" r="11"/>
    ${line('M166 58 v8 M176 56 l4 7 M156 56 l-4 7', 2.4)}`,
  pulpit: () => `
    ${line('M20 186 H180', 3)}
    <rect ${f('#8a5a33')} x="58" y="176" width="84" height="10" rx="3"/>
    <path ${f('#b7743f')} d="M64 98 H136 L126 176 H74 Z"/>
    <path ${f('#ffd54a')} d="M95 116 H105 V126 H115 V136 H105 V160 H95 V136 H85 V126 H95 Z"/>
    <path ${f('#c98b4f')} d="M46 98 L154 98 L146 82 L54 82 Z"/>
    <path ${f('#fbfaf7')} d="M62 82 Q80 62 99 72 V82 Z"/>
    <path ${f('#fbfaf7')} d="M138 82 Q120 62 101 72 V82 Z"/>
    ${line('M70 76 Q82 68 94 74 M130 76 Q118 68 106 74', 2)}
    ${line('M148 84 C152 66 156 54 162 44', 3)}
    <ellipse ${f('#8a8f98')} cx="165" cy="36" rx="8" ry="11" transform="rotate(20 165 36)"/>
    ${line('M22 30 L34 40 M26 58 L40 60 M40 16 L46 30', 2.6)}`,
  notebook: () => `
    <rect ${f('#8fd3f4')} x="44" y="24" width="112" height="156" rx="10"/>
    <rect ${f('#fbfaf7')} x="56" y="34" width="92" height="136" rx="6"/>
    ${[44, 64, 84, 104, 124, 144, 164].map(y => `<circle cx="56" cy="${y}" r="4" fill="#fff"/>`).join('')}
    <rect ${f('#ffd54a')} x="72" y="46" width="56" height="10" rx="3"/>
    <rect ${f('#6cc56a')} x="72" y="72" width="12" height="12" rx="3"/><rect ${f('#6cc56a')} x="72" y="96" width="12" height="12" rx="3"/>
    <rect ${f('#fbfaf7')} x="72" y="120" width="12" height="12" rx="3"/>
    ${line('M74 78 l3 3 l6 -6 M74 102 l3 3 l6 -6', 2.2)}
    ${line('M92 78 H132 M92 102 H128 M92 126 H124 M72 150 H132', 2.4)}
    <g transform="rotate(38 160 132)"><rect ${f('#ffc94a')} x="152" y="92" width="16" height="64" rx="2"/>
    <rect ${f('#ff8fb1')} x="152" y="84" width="16" height="10" rx="3"/>
    <path ${f('#f6d7c3')} d="M152 156 L168 156 L160 172 Z"/></g>`,
};


export const ART_KEYS = Object.keys(ART);

export function isBuiltinArt(path: string | null | undefined): path is string {
  return !!path && path.startsWith("builtin:") && path.slice(8) in ART;
}

/** SVG markup for a built-in drawing: coloured (covers) or line only (to colour in). Trusted, static markup. */
export function artSvg(key: string, mode: "color" | "line" = "color", id?: string) {
  const body = (ART[key] ?? ART.heart)();
  const svg = `<svg${id ? ` id="${id}"` : ""} class="art" viewBox="0 0 200 200" fill="#fff" stroke="${INK}" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">${body}</svg>`;
  if (mode === "line") return svg;
  return svg.replace(/class="r" data-c="(#[0-9a-fA-F]{3,6})"/g, 'class="r" data-c="$1" fill="$1"');
}

/** Stand-alone SVG document for printing or downloading a built-in page. */
export function artSvgDocument(key: string, title: string) {
  const esc = title.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="210mm" height="297mm" viewBox="0 0 210 297"><title>${esc}</title><rect width="210" height="297" fill="#fff"/><g transform="translate(10 48) scale(0.95)">${artSvg(key, "line").replace('class="art" ', "")}</g></svg>`;
}
