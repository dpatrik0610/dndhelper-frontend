import { useMemo, type CSSProperties, type ReactNode } from "react";
import { seededRandom } from "@utils/seededRandom";
import type { BackdropProps } from "./index";

const CX = 800;
const HALO_Y = 285;

const box = (x: number, y: number, w: number, h: number): CSSProperties => ({
  left: `${x / 16}%`,
  top: `${y / 9}%`,
  width: `${w / 16}%`,
  height: `${h / 9}%`,
});

const n = (v: number) => +v.toFixed(2);

const star4 =(cx: number, cy: number, r: number, k = 0.16) => {
  const a = r * k;
  return `M${n(cx)} ${n(cy - r)}Q${n(cx + a)} ${n(cy - a)} ${n(cx + r)} ${n(cy)}Q${n(cx + a)} ${n(cy + a)} ${n(cx)} ${n(cy + r)}Q${n(cx - a)} ${n(cy + a)} ${n(cx - r)} ${n(cy)}Q${n(cx - a)} ${n(cy - a)} ${n(cx)} ${n(cy - r)}Z`;
};

const quad = (y1: number, y2: number, hw: (y: number) => number, cx = CX) =>
  `${n(cx - hw(y1))},${n(y1)} ${n(cx + hw(y1))},${n(y1)} ${n(cx + hw(y2))},${n(y2)} ${n(cx - hw(y2))},${n(y2)}`;

interface Puff {
  x: number;
  y: number;
  r: number;
}

interface Cluster {
  cx: number;
  w: number;
  base: number;
  rMin: number;
  rMax: number;
}

function cloud(r: () => number, { cx, w, base, rMin, rMax }: Cluster): Puff[] {
  const puffs: Puff[] = [];
  for (let x = cx - w / 2; x < cx + w / 2; ) {
    const t = 1 - Math.abs((x - cx) / (w / 2));
    const rad = (rMin + (rMax - rMin) * (0.3 + 0.7 * t)) * (0.78 + r() * 0.22);
    puffs.push({ x, y: base - rad * (0.35 + r() * 0.3), r: rad });
    x += rad * (0.7 + r() * 0.4);
  }
  return puffs;
}

function Puffs({ puffs, fill, shade }: { puffs: Puff[]; fill: string; shade: string }) {
  return (
    <>
      <g fill={shade}>
        {puffs.map((p, i) => (
          <circle key={i} cx={n(p.x + p.r * 0.06)} cy={n(p.y + p.r * 0.17)} r={n(p.r)} />
        ))}
      </g>
      <g fill={fill}>
        {puffs.map((p, i) => (
          <circle key={i} cx={n(p.x)} cy={n(p.y)} r={n(p.r)} />
        ))}
      </g>
    </>
  );
}

function CloudGradient({ id, top, bottom, light, dark }: { id: string; top: number; bottom: number; light: string; dark: string }) {
  return (
    <linearGradient id={id} x1="0" y1={top} x2="0" y2={bottom} gradientUnits="userSpaceOnUse">
      <stop offset="0" stopColor={light} />
      <stop offset="1" stopColor={dark} />
    </linearGradient>
  );
}

interface BankProps {
  id: string;
  className: string;
  x: number;
  y: number;
  w: number;
  h: number;
  puffs: Puff[];
  floor: number;
  dark: string;
  shade: string;
}

function Bank({ id, className, x, y, w, h, puffs, floor, dark, shade }: BankProps) {
  const top = Math.min(...puffs.map((p) => p.y - p.r));
  return (
    <svg className={className} style={box(x, y, w, h)} viewBox={`0 0 ${w} ${h}`} aria-hidden>
      <defs>
        <CloudGradient id={id} top={top} bottom={floor} light="#fffcf3" dark={dark} />
        <linearGradient id={`${id}-haze`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={dark} />
          <stop offset="1" stopColor={dark} stopOpacity="0" />
        </linearGradient>
        <clipPath id={`${id}-clip`}>
          <rect width={w} height={floor} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}-clip)`}>
        <Puffs puffs={puffs} fill={`url(#${id})`} shade={shade} />
      </g>
      {floor < h && <rect y={floor - 0.5} width={w} height={h - floor + 0.5} fill={`url(#${id}-haze)`} />}
    </svg>
  );
}

const STEPS = 16;
const stairHalf = (y: number) => 110 + (270 * (y - 500)) / 400;
const runnerHalf = (y: number) => stairHalf(y) * 0.3;
const depth = (y: number) => stairHalf(y) / 380;

function buildStairs() {
  const rises = Array.from({ length: STEPS }, (_, i) => 0.885 ** i);
  const total = rises.reduce((a, b) => a + b, 0);
  let y = 900;
  return rises.map((h) => {
    const rise = (400 * h) / total;
    const step = { bottom: y, nose: y - rise * 0.62, top: y - rise };
    y -= rise;
    return step;
  });
}

const COLUMNS = [-180, -108, -36, 36, 108, 180];

function palmette(cx: number, cy: number, s: number, key: string): ReactNode {
  return (
    <g key={key} fill="url(#ce-gold)">
      {[-50, -25, 0, 25, 50].map((a) => (
        <ellipse key={a} cx={cx} cy={cy - 7 * s} rx={2.1 * s} ry={7 * s} transform={`rotate(${a} ${cx} ${cy})`} />
      ))}
      <circle cx={cx} cy={cy} r={2.6 * s} />
    </g>
  );
}

function Column({ x }: { x: number }) {
  return (
    <g>
      <rect x={x - 16} y={462} width={32} height={8} fill="url(#ce-marble)" stroke="#a8b7cf" strokeWidth="0.7" />
      <rect x={x - 14} y={457} width={28} height={5} rx={2.5} fill="url(#ce-marble)" stroke="#a8b7cf" strokeWidth="0.7" />
      <path
        d={`M${x - 12} 457Q${x - 13} 400 ${x - 10.5} 346H${x + 10.5}Q${x + 13} 400 ${x + 12} 457Z`}
        fill="url(#ce-col)"
        stroke="#a8b7cf"
        strokeWidth="0.7"
      />
      <g stroke="#aebcd2" strokeOpacity="0.6" strokeWidth="0.8">
        {[-7, -3.5, 0, 3.5, 7].map((o) => (
          <path key={o} d={`M${x + o} 455Q${x + o * 1.08} 400 ${x + o * 0.88} 348`} fill="none" />
        ))}
      </g>
      <rect x={x - 11} y={344} width={22} height={2.5} fill="url(#ce-gold)" />
      <rect x={x - 14} y={337} width={28} height={7} rx={3} fill="url(#ce-marble)" stroke="#a8b7cf" strokeWidth="0.7" />
      {[-1, 1].map((s) => (
        <g key={s}>
          <circle cx={x + s * 15} cy={340.5} r={4.6} fill="#fbfcfe" stroke="#c9a24a" strokeWidth="0.9" />
          <path d={`M${x + s * 15} 337.6a2.9 2.9 0 1 ${s > 0 ? 1 : 0} 2.4 4.4`} fill="none" stroke="#c9a24a" strokeWidth="0.7" />
          <circle cx={x + s * 15} cy={340.5} r={1.3} fill="url(#ce-gold)" />
        </g>
      ))}
      <rect x={x - 18} y={332} width={36} height={5} fill="url(#ce-marble)" stroke="#a8b7cf" strokeWidth="0.7" />
    </g>
  );
}

function Temple() {
  return (
    <g>
      <rect x={598} y={330} width={404} height={140} fill="url(#ce-cella)" />
      <path d="M770 470V364h60v106" fill="url(#ce-door)" />
      <path d="M766 470V360h68v110M776 470V368h48v102" fill="none" stroke="url(#ce-gold)" strokeWidth="2" />
      <path d={star4(CX, 400, 14, 0.2)} fill="#fffaf0" opacity="0.9" />

      {COLUMNS.map((o) => (
        <Column key={o} x={CX + o} />
      ))}

      <rect x={596} y={312} width={408} height={20} fill="url(#ce-marble)" stroke="#a8b7cf" strokeWidth="0.7" />
      <path d="M598 318.5H1002M598 325H1002" stroke="#b9c6d9" strokeWidth="0.8" />
      <rect x={596} y={293} width={408} height={19} fill="#1f3f7a" />
      <rect x={596} y={293} width={408} height={19} fill="url(#ce-meander)" />
      <path d="M596 293.5H1004M596 311.5H1004" stroke="url(#ce-gold)" strokeWidth="1.4" />
      <rect x={590} y={286} width={420} height={7} fill="url(#ce-marble)" stroke="#a8b7cf" strokeWidth="0.7" />
      <rect x={590} y={286} width={420} height={7} fill="url(#ce-dentils)" />
      <rect x={580} y={278} width={440} height={8} fill="url(#ce-marble)" stroke="#a8b7cf" strokeWidth="0.7" />

      <path d="M576 278L800 202L1024 278Z" fill="url(#ce-marble)" stroke="#a8b7cf" strokeWidth="0.8" />
      <path d="M576 278L800 202L1024 278" fill="none" stroke="url(#ce-gold)" strokeWidth="1.6" />
      <path d="M606 276L800 212L994 276Z" fill="#1f3f7a" />
      <path d="M606 276L800 212L994 276Z" fill="url(#ce-tympanum)" />
      <g fill="none" stroke="url(#ce-gold)" strokeWidth="1.5" strokeLinecap="round">
        {[-1, 1].map((s) => (
          <path
            key={s}
            d={`M${CX + s * 24} 262q${s * 34} 8 ${s * 68} -2q${s * 18} -6 ${s * 12} -14q${-s * 6} -6 ${-s * 11} 1q${-s * 2} 5 ${s * 3} 6M${CX + s * 48} 263q${s * 6} -11 ${s * 18} -12`}
          />
        ))}
      </g>
      <circle cx={CX} cy={252} r={19} fill="none" stroke="url(#ce-gold)" strokeWidth="1.2" />
      <circle cx={CX} cy={252} r={15.5} fill="none" stroke="url(#ce-gold)" strokeWidth="0.6" strokeDasharray="1 2.4" />
      <path d={star4(CX, 252, 15, 0.2)} fill="url(#ce-gold)" />
      <path d={star4(CX, 252, 9, 0.2)} fill="url(#ce-gold)" transform={`rotate(45 ${CX} 252)`} />
      <circle cx={CX} cy={252} r={2.2} fill="#fffaf0" />

      {palmette(CX, 200, 1.6, "apex")}
      {palmette(578, 276, 1.1, "left")}
      {palmette(1022, 276, 1.1, "right")}

      {[
        [470, 225],
        [480, 235],
        [490, 245],
      ].map(([y, hw]) => (
        <g key={y}>
          <rect x={CX - hw} y={y} width={hw * 2} height={10} fill="url(#ce-riser)" stroke="#a8b7cf" strokeWidth="0.6" />
          <rect x={CX - hw} y={y} width={hw * 2} height={3} fill="#fdfeff" />
        </g>
      ))}
      <path d="M575 470.5H1025" stroke="url(#ce-gold)" strokeWidth="1.4" />
    </g>
  );
}

function Stairway({ steps }: { steps: ReturnType<typeof buildStairs> }) {
  const posts = [0, 3, 6, 9, 12, 15].map((i) => steps[i].bottom);
  return (
    <g>
      {steps.map((s, i) => (
        <g key={i}>
          <polygon points={quad(s.bottom, s.nose, stairHalf)} fill="url(#ce-riser)" />
          <polygon points={quad(s.nose, s.top, stairHalf)} fill="#fdfeff" />
          <polygon points={quad(s.bottom, s.nose, runnerHalf)} fill="#9fc2e9" />
          <polygon points={quad(s.nose, s.top, runnerHalf)} fill="#d6e8fb" />
          <path
            d={`M${n(CX - stairHalf(s.nose))} ${n(s.nose)}H${n(CX + stairHalf(s.nose))}`}
            stroke="#c9a24a"
            strokeOpacity={0.55}
            strokeWidth={n(0.6 + depth(s.nose))}
          />
        </g>
      ))}
      {[-1, 1].map((side) => (
        <path
          key={side}
          d={`M${n(CX + side * runnerHalf(900))} 900L${n(CX + side * runnerHalf(500))} 500`}
          stroke="url(#ce-gold)"
          strokeWidth="2"
        />
      ))}

      {[-1, 1].map((side) => {
        const edge = (y: number) => CX + side * (stairHalf(y) + 2);
        const rail = (y: number) => y - 30 * depth(y);
        return (
          <g key={side}>
            <polygon
              points={`${n(edge(900))},900 ${n(edge(500))},500 ${n(edge(500))},${n(rail(500))} ${n(edge(900))},${n(rail(900))}`}
              fill="url(#ce-parapet)"
              stroke="#a8b7cf"
              strokeWidth="0.8"
            />
            <polygon
              points={`${n(edge(900))},${n(rail(900))} ${n(edge(500))},${n(rail(500))} ${n(edge(500))},${n(rail(500) - 4 * depth(500))} ${n(edge(900))},${n(rail(900) - 4)}`}
              fill="url(#ce-gold)"
            />
            {posts.map((y) => {
              const k = depth(y);
              const x = edge(y) + side * 3 * k;
              const top = y - 50 * k;
              return (
                <g key={y}>
                  <rect x={n(x - 8 * k)} y={n(top)} width={n(16 * k)} height={n(50 * k)} fill="url(#ce-col)" stroke="#a8b7cf" strokeWidth={n(0.8 * k)} />
                  <rect x={n(x - 10 * k)} y={n(top - 4 * k)} width={n(20 * k)} height={n(4 * k)} fill="url(#ce-gold)" />
                  <circle cx={n(x)} cy={n(top - 10 * k)} r={n(6 * k)} fill="url(#ce-orb)" />
                </g>
              );
            })}
          </g>
        );
      })}
    </g>
  );
}

function Defs() {
  return (
    <defs>
      <linearGradient id="ce-gold" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#fbe7a6" />
        <stop offset="0.5" stopColor="#d9b14f" />
        <stop offset="1" stopColor="#a87d2a" />
      </linearGradient>
      <radialGradient id="ce-orb" cx="0.38" cy="0.35" r="0.7">
        <stop offset="0" stopColor="#fffbe8" />
        <stop offset="0.45" stopColor="#f3d27a" />
        <stop offset="1" stopColor="#b8862c" />
      </radialGradient>
      <linearGradient id="ce-col" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#c6d2e3" />
        <stop offset="0.28" stopColor="#ffffff" />
        <stop offset="0.6" stopColor="#f3f6fb" />
        <stop offset="1" stopColor="#b3c2d8" />
      </linearGradient>
      <linearGradient id="ce-marble" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ffffff" />
        <stop offset="1" stopColor="#e3eaf4" />
      </linearGradient>
      <linearGradient id="ce-riser" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#eef3f9" />
        <stop offset="1" stopColor="#cdd9ea" />
      </linearGradient>
      <linearGradient id="ce-parapet" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#f4f7fb" />
        <stop offset="1" stopColor="#c9d5e7" />
      </linearGradient>
      <radialGradient id="ce-cella" cx="0.5" cy="0.75" r="0.75">
        <stop offset="0" stopColor="#fff1c4" />
        <stop offset="0.35" stopColor="#e9d49a" />
        <stop offset="1" stopColor="#b9c5d8" />
      </radialGradient>
      <linearGradient id="ce-door" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fffdf6" />
        <stop offset="1" stopColor="#ffe8a3" />
      </linearGradient>
      <radialGradient id="ce-tympanum" cx="0.5" cy="0.7" r="0.6">
        <stop offset="0" stopColor="#3d6bb3" stopOpacity="0.9" />
        <stop offset="1" stopColor="#1f3f7a" stopOpacity="0" />
      </radialGradient>
      <pattern id="ce-meander" x="596" y="293" width="19" height="19" patternUnits="userSpaceOnUse">
        <path d="M0 16H19M15 16V3H4V12.5H10.5V7" fill="none" stroke="#e3bd5c" strokeWidth="1.5" strokeLinecap="square" />
      </pattern>
      <pattern id="ce-dentils" x="590" y="286" width="8" height="7" patternUnits="userSpaceOnUse">
        <rect x="1.5" y="1.5" width="5" height="5.5" fill="#d3ddeb" />
      </pattern>
    </defs>
  );
}

function LeftIsle() {
  return (
    <svg className="ce-isle ce-isle--left" style={box(90, 300, 320, 240)} viewBox="0 0 320 240" aria-hidden>
      <defs>
        <linearGradient id="ce-rock-l" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e4ebf5" />
          <stop offset="1" stopColor="#8fa4c4" />
        </linearGradient>
      </defs>
      <path d="M20 150Q160 138 300 150Q290 175 250 190Q210 230 165 238Q130 222 95 200Q45 180 20 150Z" fill="url(#ce-rock-l)" />
      <path d="M60 172Q120 182 180 176M110 200Q150 208 196 198M150 222Q166 226 180 220" stroke="#a6b6cf" strokeWidth="1.2" fill="none" />
      <ellipse cx="160" cy="149" rx="140" ry="9" fill="#f3f6fb" />
      <rect x="94" y="140" width="132" height="8" fill="#eef3f9" stroke="#b4c2d7" strokeWidth="0.6" />
      <rect x="100" y="134" width="120" height="6" fill="#f8fafd" stroke="#b4c2d7" strokeWidth="0.6" />
      {[106, 128, 150, 172, 194, 214].map((x) => (
        <rect key={x} x={x - 3.5} y={86} width={7} height={48} fill="url(#ce-col-far)" />
      ))}
      <defs>
        <linearGradient id="ce-col-far" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ccd7e6" />
          <stop offset="0.35" stopColor="#ffffff" />
          <stop offset="1" stopColor="#bccadd" />
        </linearGradient>
        <linearGradient id="ce-dome" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fbe7a6" />
          <stop offset="0.6" stopColor="#d9b14f" />
          <stop offset="1" stopColor="#b8892f" />
        </linearGradient>
      </defs>
      <rect x="98" y="78" width="124" height="8" fill="#f8fafd" stroke="#b4c2d7" strokeWidth="0.6" />
      <rect x="98" y="82" width="124" height="1.6" fill="#d9b14f" />
      <path d="M104 78Q160 16 216 78Z" fill="url(#ce-dome)" />
      <path d="M118 74Q160 30 202 74M134 72Q160 40 186 72" fill="none" stroke="#fff3cc" strokeOpacity="0.5" strokeWidth="1" />
      <rect x="154" y="40" width="12" height="10" fill="#f8fafd" stroke="#b4c2d7" strokeWidth="0.6" />
      <path d="M152 40h16l-8-6Z" fill="#d9b14f" />
      <path d={star4(160, 26, 8, 0.2)} fill="#f3d27a" />
      <Puffs puffs={[
          [28, 152, 14],
          [52, 147, 19],
          [76, 152, 12],
          [246, 151, 13],
          [272, 147, 18],
          [298, 152, 13],
          [150, 236, 9],
          [168, 234, 11],
        ].map(([x, y, r]) => ({ x, y, r }))} fill="#fffcf3" shade="#c9d7ea" />
    </svg>
  );
}

function RightIsle() {
  return (
    <svg className="ce-isle ce-isle--right" style={box(1230, 250, 300, 280)} viewBox="0 0 300 280" aria-hidden>
      <defs>
        <linearGradient id="ce-rock-r" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e4ebf5" />
          <stop offset="1" stopColor="#8fa4c4" />
        </linearGradient>
        <linearGradient id="ce-col-r" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ccd7e6" />
          <stop offset="0.35" stopColor="#ffffff" />
          <stop offset="1" stopColor="#bccadd" />
        </linearGradient>
      </defs>
      <path d="M30 200Q150 188 270 200Q262 228 228 240Q190 276 150 280Q118 262 86 246Q48 228 30 200Z" fill="url(#ce-rock-r)" />
      <path d="M70 222Q130 232 190 224M118 250Q150 256 182 248" stroke="#a6b6cf" strokeWidth="1.2" fill="none" />
      <ellipse cx="150" cy="199" rx="120" ry="8" fill="#f3f6fb" />
      <rect x="128" y="186" width="44" height="10" fill="#f8fafd" stroke="#b4c2d7" strokeWidth="0.6" />
      <path d="M138 186L139 74H161L162 186Z" fill="url(#ce-col-r)" stroke="#b4c2d7" strokeWidth="0.6" />
      <path d="M144 184V76M150 184V76M156 184V76" stroke="#b9c6d9" strokeWidth="0.7" />
      <rect x="137" y="71" width="26" height="3" fill="#d9b14f" />
      <rect x="132" y="64" width="36" height="7" rx="3" fill="#f8fafd" stroke="#b4c2d7" strokeWidth="0.6" />
      <circle cx="131" cy="67.5" r="4" fill="#f8fafd" stroke="#d9b14f" strokeWidth="0.9" />
      <circle cx="169" cy="67.5" r="4" fill="#f8fafd" stroke="#d9b14f" strokeWidth="0.9" />
      <rect x="128" y="59" width="44" height="5" fill="#f8fafd" stroke="#b4c2d7" strokeWidth="0.6" />
      <path d="M146 59l2-4h4l2 4Z" fill="#d9b14f" />
      <g fill="none" stroke="#d9b14f" strokeWidth="1.8">
        <circle cx="150" cy="32" r="22" />
        <ellipse cx="150" cy="32" rx="22" ry="7" />
        <ellipse cx="150" cy="32" rx="22" ry="7" transform="rotate(62 150 32)" />
        <ellipse cx="150" cy="32" rx="22" ry="7" transform="rotate(-62 150 32)" />
      </g>
      <path d="M126 46L174 18" stroke="#fbe7a6" strokeWidth="1.2" />
      <circle cx="150" cy="32" r="5.5" fill="#6f9bd8" stroke="#fbe7a6" strokeWidth="1" />
      <Puffs puffs={[
          [40, 202, 15],
          [64, 197, 19],
          [90, 203, 12],
          [214, 202, 12],
          [238, 197, 18],
          [262, 202, 14],
          [146, 276, 9],
          [162, 273, 10],
        ].map(([x, y, r]) => ({ x, y, r }))} fill="#fffcf3" shade="#c9d7ea" />
    </svg>
  );
}

function Bird() {
  return (
    <svg viewBox="0 0 40 24" overflow="visible" aria-hidden>
      <g className="ce-bird__wing">
        <path d="M20 12Q24 4 31 1Q28 8 25 12Z" fill="#dbe6f4" />
      </g>
      <path d="M4 13L0 10.5L1 13L0 15.5ZM4 13Q10 10.5 20 11Q28 10.5 33 11.5Q36.5 12 37 13.2Q35 14.2 32 14.4Q24 16 14 15Q8 14.6 4 13Z" fill="#ffffff" />
      <path d="M36.6 12.6l2.4.6-2.4.5Z" fill="#d9b14f" />
      <g className="ce-bird__wing">
        <path d="M17 12.5Q15 4 9 0.5Q19 2 24 12Z" fill="#ffffff" stroke="#c9d6e8" strokeWidth="0.5" />
      </g>
    </svg>
  );
}

export function CelestiaBackdrop({ isStatic = false }: BackdropProps) {
  const scene = useMemo(() => {
    const r = seededRandom(777);
    const far = [120, 330, 610, 880, 1150, 1420, 1650, 1880].flatMap((cx) =>
      cloud(r, { cx: cx + (r() - 0.5) * 60, w: 200 + r() * 200, base: 146 + r() * 10, rMin: 10, rMax: 22 + r() * 22 })
    );
    const mid = [
      [60, 280],
      [400, 300],
      [760, 300],
      [1240, 300],
      [1580, 280],
      [1930, 260],
    ].flatMap(([cx, w]) => cloud(r, { cx, w, base: 120, rMin: 18, rMax: 52 }));
    const front = [
      { cx: 80, w: 440, base: 150, rMin: 30, rMax: 84 },
      { cx: 520, w: 380, base: 160, rMin: 24, rMax: 64 },
      { cx: 1000, w: 300, base: 182, rMin: 16, rMax: 36 },
      { cx: 1480, w: 380, base: 160, rMin: 24, rMax: 64 },
      { cx: 1920, w: 440, base: 150, rMin: 30, rMax: 84 },
    ].flatMap((c) => cloud(r, c));
    const podium = [540, 1060].flatMap((cx) => cloud(r, { cx, w: 280, base: 516, rMin: 12, rMax: 34 }));
    const stars = Array.from({ length: 38 }, () => ({
      left: r() * 100,
      top: r() * 38,
      size: 3 + r() * 7,
      gold: r() < 0.25,
      delay: r() * 6,
      dur: 3 + r() * 4,
    }));
    const birds = Array.from({ length: 5 }, (_, i) => {
      const dur = 70 + r() * 50;
      return { y: 110 + i * 52 + r() * 30, size: 24 + r() * 16, dur, delay: -(i / 5 + r() * 0.15) * dur, flap: 1.4 + r() * 0.6 };
    });
    return { far, mid, front, podium, stars, birds, steps: buildStairs() };
  }, []);

  const lamps = [0, 3, 6, 9, 12, 15].flatMap((i) => {
    const y = scene.steps[i].bottom;
    const k = depth(y);
    return [-1, 1].map((side) => {
      const x = CX + side * (stairHalf(y) + 2 + 3 * k);
      const cy = y - 60 * k;
      return { key: `${i}-${side}`, style: box(x - 34 * k, cy - 34 * k, 68 * k, 68 * k), delay: i * 0.4 + (side > 0 ? 1.1 : 0) };
    });
  });

  return (
    <div className={`theme-scene ce-scene ${isStatic ? "theme-scene--static" : ""}`}>
      <div className="ce-sky" />
      <div className="ce-stars">
        {scene.stars.map((s, i) => (
          <span
            key={i}
            className={`ce-star ${s.gold ? "ce-star--gold" : ""}`}
            style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size, animationDelay: `${s.delay}s`, animationDuration: `${s.dur}s` }}
          />
        ))}
      </div>

      <div className="ce-stage">
        <div className="ce-sun" style={box(CX - 760, HALO_Y - 560, 1520, 1120)} />
        <div className="ce-rays" style={box(CX - 900, HALO_Y - 900, 1800, 1800)} />
        <svg className="ce-halo" style={box(CX - 340, HALO_Y - 340, 680, 680)} viewBox="-340 -340 680 680" aria-hidden>
          <g fill="none" stroke="#c9a24a">
            <circle r="318" strokeOpacity="0.35" strokeWidth="1" />
            <circle r="300" strokeOpacity="0.5" strokeWidth="1.4" />
            <circle r="288" strokeOpacity="0.4" strokeWidth="7" strokeDasharray="1.2 8.8" />
            <circle r="276" strokeOpacity="0.45" strokeWidth="0.8" />
          </g>
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i / 12) * Math.PI * 2;
            const big = i % 3 === 0;
            return (
              <path
                key={i}
                d={star4(Math.cos(a) * (big ? 318 : 300), Math.sin(a) * (big ? 318 : 300), big ? 16 : 8, 0.18)}
                fill="#d9b14f"
                fillOpacity={big ? 0.85 : 0.7}
              />
            );
          })}
        </svg>
        <svg className="ce-halo ce-halo--inner" style={box(CX - 240, HALO_Y - 240, 480, 480)} viewBox="-240 -240 480 480" aria-hidden>
          <g fill="none" stroke="#c9a24a">
            <circle r="226" strokeOpacity="0.4" strokeWidth="1" />
            <circle r="214" strokeOpacity="0.5" strokeWidth="3" strokeDasharray="0.1 22.4" strokeLinecap="round" />
            <circle r="204" strokeOpacity="0.3" strokeWidth="0.8" />
          </g>
        </svg>

        <Bank id="ce-cloud-far" className="ce-cloud ce-cloud--far" x={-200} y={420} w={2000} h={280} puffs={scene.far} floor={164} dark="#dfe9f6" shade="#cbdaee" />

        <LeftIsle />
        <RightIsle />

        <div className="ce-birds">
          {scene.birds.map((b, i) => (
            <span
              key={i}
              className="ce-bird"
              style={{ ...box(0, b.y, b.size, b.size * 0.6), animationDuration: `${b.dur}s`, animationDelay: `${b.delay}s` }}
            >
              <span className="ce-bird__body" style={{ animationDuration: `${b.flap * 4}s`, "--flap": `${b.flap}s` } as CSSProperties}>
                <Bird />
              </span>
            </span>
          ))}
        </div>

        <svg className="ce-world" viewBox="0 0 1600 900" aria-hidden>
          <Defs />
          <CloudGradient id="ce-cloud-podium" top={470} bottom={530} light="#fffcf3" dark="#d9e5f4" />
          <Temple />
          <Puffs puffs={scene.podium} fill="url(#ce-cloud-podium)" shade="#bfd1e8" />
          <Stairway steps={scene.steps} />
        </svg>

        <div className="ce-beam" style={box(560, 470, 480, 430)} />
        {lamps.map((l) => (
          <span key={l.key} className="ce-lamp" style={{ ...l.style, animationDelay: `${l.delay}s` }} />
        ))}

        <Bank id="ce-cloud-mid" className="ce-cloud ce-cloud--mid" x={-200} y={590} w={2000} h={240} puffs={scene.mid} floor={132} dark="#dde8f5" shade="#b3c8e4" />
        <Bank id="ce-cloud-front" className="ce-cloud ce-cloud--front" x={-200} y={740} w={2000} h={220} puffs={scene.front} floor={220} dark="#e1eaf6" shade="#a7bedf" />
      </div>
    </div>
  );
}
