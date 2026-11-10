import type { BackdropProps } from "./index";
import { ShaderCanvas } from "./ShaderCanvas";

const FRAGMENT = /* glsl */ `
precision highp float;
uniform vec2 uResolution;
uniform float uTime;

float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
vec2 hash2(vec2 p) { return vec2(hash(p), hash(p + 19.19)); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i), b = hash(i + vec2(1.0, 0.0)), c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
  return v;
}

const float HORIZON = -0.06;
const vec3 FURNACE = vec3(1.0, 0.36, 0.08);
const vec3 HAZE = vec3(0.78, 0.2, 0.04);
const float MET_CYCLE = 9.0;
const float MET_TIME = 2.4;

vec2 cracks(vec2 g) {
  vec2 i = floor(g), f = fract(g);
  float f1 = 8.0, f2 = 8.0, id = 0.0;
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 o = vec2(float(x), float(y));
      vec2 r = o + hash2(i + o) - f;
      float d = dot(r, r);
      if (d < f1) { f2 = f1; f1 = d; id = hash(i + o + 4.7); }
      else if (d < f2) { f2 = d; }
    }
  }
  return vec2(sqrt(f2) - sqrt(f1), id);
}

vec3 sky(vec2 p) {
  float h = clamp((p.y - HORIZON) / 0.6, 0.0, 1.0);
  vec3 col = mix(HAZE, vec3(0.2, 0.03, 0.02), smoothstep(0.0, 0.35, h));
  col = mix(col, vec3(0.03, 0.01, 0.015), smoothstep(0.25, 1.0, h));
  float s = fbm(vec2(p.x * 1.4 + uTime * 0.012, p.y * 3.2 - uTime * 0.006));
  float s2 = fbm(vec2(p.x * 3.0 - uTime * 0.02, p.y * 6.0) + s * 1.5);
  float smoke = smoothstep(0.3, 0.7, s2) * smoothstep(0.0, 0.2, h);
  vec3 lit = mix(vec3(0.75, 0.17, 0.04), vec3(0.09, 0.03, 0.03), smoothstep(0.0, 0.6, h));
  return mix(col, lit * (0.6 + 0.8 * s), smoke * 0.85);
}

void meteor(inout vec3 col, vec2 p, float t, float aspect, float seed) {
  float slot = floor(t / MET_CYCLE);
  float local = t - slot * MET_CYCLE;
  if (local > MET_TIME + 1.2) return;
  float u = local / MET_TIME;
  vec2 dir = normalize(vec2(-0.35 + 0.3 * (hash(vec2(slot, seed + 2.0)) - 0.5), -1.0));
  vec2 start = vec2((hash(vec2(slot, seed)) - 0.3) * aspect * 0.8, 0.62);
  float reach = (start.y - HORIZON) / -dir.y;
  vec2 impact = start + dir * reach;
  float flash = u < 1.0 ? smoothstep(0.85, 1.0, u) : exp(-(local - MET_TIME) * 3.5);
  vec2 fp = (p - impact) * vec2(2.2, 5.0);
  col += FURNACE * 1.4 * flash * exp(-dot(fp, fp) * 9.0);
  if (u > 1.0) return;
  vec2 pa = p - (start + dir * u * reach);
  float along = clamp(dot(pa, -dir), 0.0, 0.3);
  float fade = 1.0 - along / 0.3;
  col += vec3(1.0, 0.5, 0.15) * exp(-length(pa + dir * along) * 150.0) * fade * fade;
  col += vec3(1.0, 0.9, 0.6) * exp(-length(pa) * 70.0);
}

float spires(float x, float freq, float seed) {
  float q = x * freq + seed;
  float i = floor(q);
  float h = 0.0;
  for (int k = -1; k <= 1; k++) {
    float c = i + float(k);
    float r = hash(vec2(c, seed));
    float cx = c + 0.5 + (hash(vec2(c, seed + 1.0)) - 0.5) * 0.8;
    float w = 0.14 + 0.3 * hash(vec2(c, seed + 2.0));
    h = max(h, (0.2 + 0.8 * r * r) * pow(max(0.0, 1.0 - abs(q - cx) / w), 1.6));
  }
  return h + 0.1 * noise(vec2(q * 0.6, seed + 9.0)) + 0.04 * noise(vec2(q * 7.0, seed + 3.0));
}

vec3 molten(float x) {
  vec3 c = mix(vec3(0.5, 0.03, 0.0), vec3(1.0, 0.3, 0.02), smoothstep(0.0, 0.5, x));
  c = mix(c, vec3(1.0, 0.75, 0.2), smoothstep(0.45, 0.9, x));
  return mix(c, vec3(1.0, 0.97, 0.75), smoothstep(0.9, 1.25, x));
}

vec3 ground(vec2 p, float t) {
  float z = 0.16 / (HORIZON - p.y);
  vec2 g = vec2(p.x * z, z) * 9.0;
  float cx = 1.6 * sin(g.y * 0.22 + 1.0) + 0.5 * sin(g.y * 0.6);
  float dx = abs(g.x - cx);
  float w = 0.9;

  vec2 c = cracks(g + (fbm(g * 2.0) - 0.5) * 0.5);
  vec3 col = vec3(0.05, 0.03, 0.035) * (0.5 + 0.9 * c.y) * (0.8 + 0.4 * noise(g * 14.0));
  float hot = 0.3 + 0.7 * smoothstep(0.3, 0.7, noise(g * 0.35 + vec2(0.0, t * 0.05)));
  hot = max(hot, exp(-max(dx - w, 0.0) * 1.6));
  hot *= 0.8 + 0.35 * sin(t * 1.2 - g.y * 1.5 + c.y * 6.28);
  float heat = smoothstep(0.1, 0.0, c.x) * hot;
  col += mix(vec3(0.9, 0.15, 0.02), vec3(1.0, 0.85, 0.35), heat) * heat;
  col += vec3(0.5, 0.07, 0.01) * smoothstep(0.35, 0.0, c.x) * hot * 0.3;

  float breath = 0.8 + 0.2 * sin(t * 0.9 + g.y * 0.8);
  col += vec3(0.95, 0.24, 0.03) * exp(-max(dx - w, 0.0) * 1.3) * 0.4 * breath;

  vec2 fl = vec2((g.x - cx) * 1.2, g.y + t * 0.5);
  vec2 warp = vec2(fbm(fl * 0.9 + vec2(0.0, t * 0.15)), fbm(fl * 0.9 + vec2(5.2, -t * 0.12))) - 0.5;
  float n = fbm(fl * 1.3 + warp * 1.8);
  float veins = pow(1.0 - abs(2.0 * fbm(fl * 2.4 + warp * 2.5 + vec2(0.0, t * 0.2)) - 1.0), 4.0);
  float temp = (0.35 + 0.6 * n + 0.75 * veins) * (0.85 + 0.15 * sin(t * 1.3 + n * 12.0));
  temp *= mix(0.55, 1.0, smoothstep(w, w * 0.2, dx));
  vec3 lava = molten(temp) * (0.7 + 0.6 * temp);
  float crust = smoothstep(0.56, 0.68, fbm(fl * 2.0 + 3.0 + warp)) * (1.0 - veins);
  lava = mix(lava, vec3(0.1, 0.025, 0.02) + molten(temp) * 0.15, crust * 0.85);

  vec2 bq = fl * 2.5;
  vec2 bid = floor(bq);
  float bh = hash(bid);
  float pop = fract(t * (0.25 + 0.3 * bh) + bh * 7.0);
  float bd = length(fract(bq) - 0.5 - (hash2(bid + 2.0) - 0.5) * 0.5);
  lava += vec3(1.0, 0.85, 0.4) * smoothstep(0.04, 0.0, abs(bd - pop * 0.3)) * (1.0 - pop) * step(0.6, bh);

  float river = smoothstep(w, w - 0.25, dx);
  col = mix(col, lava, river);

  float fog = 1.0 - exp(-max(z - 0.4, 0.0) * 0.5);
  return mix(col, HAZE, fog * (0.9 - 0.35 * river));
}

float embers(vec2 p, float t, float scale, float speed, float seed) {
  vec2 q = vec2(p.x * scale + sin(p.y * 3.0 + t * 0.3 + seed) * 0.3, p.y * scale - t * speed);
  vec2 id = floor(q) + seed;
  float h = hash(id);
  if (h < 0.8) return 0.0;
  vec2 o = (hash2(id + 3.1) - 0.5) * 0.7;
  return smoothstep(0.07, 0.0, length(fract(q) - 0.5 - o)) * (0.5 + 0.5 * sin(t * 3.0 + h * 50.0));
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;
  float t = uTime;
  float aspect = uResolution.x / uResolution.y;

  float hz = exp(-abs(uv.y - HORIZON) * 14.0);
  vec2 p = uv + vec2(noise(vec2(uv.y * 70.0 - t * 1.4, uv.x * 3.0)) - 0.5, 0.0) * 0.01 * hz;

  vec3 col;
  if (p.y > HORIZON) {
    col = sky(p);
    meteor(col, p, t, aspect, 1.7);
    meteor(col, p, t + 4.3, aspect, 5.2);
    float px = 1.5 / uResolution.y;
    float farTop = HORIZON + 0.24 * spires(p.x, 5.0, 2.0);
    col = mix(col, mix(vec3(0.14, 0.03, 0.02), HAZE, 0.3 * exp(-(p.y - HORIZON) * 14.0)), smoothstep(px, -px, p.y - farTop));
    float nearTop = HORIZON + 0.13 * spires(p.x, 8.0, 7.0);
    col = mix(col, mix(vec3(0.03, 0.01, 0.012), vec3(0.4, 0.08, 0.02), exp(-(p.y - HORIZON) * 40.0)), smoothstep(px, -px, p.y - nearTop));
  } else {
    col = ground(p, t);
  }

  col += FURNACE * 0.22 * exp(-abs(uv.y - HORIZON) * 22.0);

  float e = embers(uv, t, 14.0, 0.5, 1.0) + 0.7 * embers(uv, t, 24.0, 0.8, 7.0);
  col += vec3(1.0, 0.55, 0.15) * e * smoothstep(0.55, -0.2, uv.y);

  float v = smoothstep(1.3, 0.3, length(uv * vec2(0.8, 1.0)));
  col *= mix(0.4, 1.0, v) * 0.8;

  gl_FragColor = vec4(col, 1.0);
}
`;

export function NineHellsBackdrop({ isStatic = false }: BackdropProps) {
  return (
    <div className={`theme-scene nh-scene ${isStatic ? "theme-scene--static" : ""}`}>
      <ShaderCanvas fragment={FRAGMENT} scale={1} fps={24} isStatic={isStatic} staticTime={10.6} />
      <svg className="nh-fiend" viewBox="0 0 120 140">
        <defs>
          <linearGradient id="nh-crag" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0.45" stopColor="#050202" />
            <stop offset="1" stopColor="#1f0805" />
          </linearGradient>
        </defs>
        <g fill="#050202" stroke="#ff6a2a" strokeOpacity="0.55" strokeWidth="0.9" strokeLinejoin="round">
          <g className="nh-fiend-wings">
            <path d="M56 46Q36 20 12 22Q22 28 24 38Q30 34 36 42Q42 40 46 50Q52 48 56 54Z" />
            <path d="M64 46Q80 16 108 14Q98 24 98 34Q91 31 87 40Q80 38 77 48Q70 47 66 54Z" />
          </g>
          <g className="nh-fiend-tail">
            <path d="M54 66Q38 68 34 58Q32 52 37 49" fill="none" stroke="#050202" strokeOpacity="1" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M37 43l4 7-8 1Z" />
          </g>
          <path d="M52 70Q47 52 56 44Q64 40 68 48Q73 58 68 70Z" />
          <circle cx="66" cy="38" r="5" />
          <path d="M62 35Q57 26 61 21Q63 29 66 33ZM69 34Q72 26 78 23Q75 30 71 37ZM70 36l7 4-7 2Z" />
        </g>
        <path d="M20 140L44 96L50 100L58 68L66 66L72 92L80 88L100 140Z" fill="url(#nh-crag)" stroke="#ff6a2a" strokeOpacity="0.4" strokeWidth="0.9" strokeLinejoin="round" />
        <circle className="nh-fiend-eye" cx="69" cy="37.4" r="1" fill="#ffb347" />
      </svg>
    </div>
  );
}
