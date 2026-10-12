import type { BackdropProps } from "./index";
import { ShaderCanvas } from "./ShaderCanvas";

/**
 * Scorching Desert: a fragment shader. A white-hot sun over red sandstone mesas, the air above the
 * ground rippling with heat haze and a mirage pool reflecting the sky at the horizon. Three rows of
 * sharp-crested dunes (sunlit and slip faces) shed streams of sand off their crests, gusts sweep sand
 * across the foreground and a dust devil wanders through every minute and a half.
 * Styles in styles/themes/desert.css.
 */

const FRAGMENT = /* glsl */ `
precision highp float;
uniform vec2 uResolution;
uniform float uTime;

float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
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

const float HORIZON = -0.03;
const vec3 HAZE = vec3(0.98, 0.66, 0.36);
vec2 gSun;
float gOasisX; // the mesas and far dunes leave a gap here for the oasis

vec3 sky(vec2 p) {
  float h = clamp((p.y - HORIZON) / 0.55, 0.0, 1.0);
  vec3 col = mix(HAZE, vec3(0.70, 0.27, 0.11), smoothstep(0.0, 0.55, h));
  col = mix(col, vec3(0.26, 0.08, 0.06), smoothstep(0.45, 1.0, h));
  vec2 s = p - gSun;
  float d = length(s);
  col += vec3(1.0, 0.62, 0.28) * 0.05 / (d * d * 14.0 + 0.06);
  col += vec3(1.0, 0.85, 0.6) * 0.5 * exp(-d * 9.0);
  // slowly turning heat rays (14 is whole, so the atan seam doesn't show)
  col += vec3(1.0, 0.7, 0.35) * 0.12 * pow(0.5 + 0.5 * sin(atan(s.y, s.x) * 14.0 + uTime * 0.15), 6.0) * exp(-d * 4.0);
  col = mix(col, vec3(1.0, 0.98, 0.9), smoothstep(0.072, 0.064, d));
  // high dust veils
  col += vec3(0.3, 0.13, 0.05) * smoothstep(0.45, 0.85, fbm(vec2(p.x * 1.6 - uTime * 0.015, p.y * 7.0))) * 0.35;
  return col;
}

// Flat-topped buttes: a thresholded noise gives plateaus with steep sides and a talus apron
float mesaTop(float x) {
  float n = noise(vec2(x * 2.6 + 3.0, 0.5));
  float plateau = smoothstep(0.56, 0.6, n);
  float gap = smoothstep(0.1, 0.22, abs(x - gOasisX));
  return HORIZON + gap * (plateau * (0.06 + 0.03 * noise(vec2(x * 0.9, 7.0)) + 0.003 * noise(vec2(x * 40.0, 2.0)))
    + smoothstep(0.38, 0.6, n) * 0.018);
}

vec3 mesa(vec2 p) {
  return mix(vec3(0.58, 0.24, 0.16), HAZE, 0.42);
}

vec3 farView(vec2 p) {
  return p.y > mesaTop(p.x) ? sky(p) : mesa(p);
}

// A palm silhouette (0..1 coverage) rooted at base: curved trunk + six drooping fronds
float palm(vec2 p, vec2 base, float h, float lean) {
  vec2 q = p - base;
  if (q.y < 0.0 || q.y > h + 0.012 || abs(q.x - lean) > 0.035) return 0.0;
  float ty = clamp(q.y / h, 0.0, 1.0);
  float cover = smoothstep(0.0026, 0.0012, abs(q.x - lean * ty * ty)) * step(q.y, h);
  vec2 c = q - vec2(lean, h);
  for (int i = 0; i < 6; i++) {
    float d = (i < 3 ? -1.0 : 1.0) * (0.45 + 0.4 * float(i - (i < 3 ? 0 : 3)));
    float s = c.x / (d * 0.02);
    if (s > 0.0 && s < 1.0) {
      float y = 0.007 * s - (0.012 + 0.004 * abs(d)) * s * s;
      cover = max(cover, smoothstep(0.0024 * (1.0 - 0.5 * s), 0.0, abs(c.y - y)));
    }
  }
  return cover;
}

float palms(vec2 p, vec2 o) {
  float c = palm(p, o + vec2(-0.062, 0.0), 0.040, 0.006);
  c = max(c, palm(p, o + vec2(-0.036, 0.0), 0.029, -0.005));
  c = max(c, palm(p, o + vec2(0.018, 0.0), 0.046, 0.008));
  return max(c, palm(p, o + vec2(0.052, 0.0), 0.027, -0.006));
}

// Dune profile in 0..1: rounded crests and broad troughs, skewed so the windward (left) side rises
// gently and the lee side falls steeper. Spacing and height wander so rows don't look regular.
float ridge(float x, float freq, float seed) {
  float w = x * freq + seed + 0.5 * sin(x * freq * 0.31 + seed * 2.0);
  w -= 0.5 * cos(w);
  float h = pow(0.5 + 0.5 * cos(w), 1.3);
  return h * (0.55 + 0.45 * noise(vec2(x * freq * 0.22, seed)));
}

// One row of dunes over col: sunlit faces point right (towards the sun), slip faces are in shade,
// and sand streams off the crests downwind (leftwards).
void dunes(inout vec3 col, vec2 p, float base, float amp, float freq, float seed, vec3 lit, vec3 shade, float rip, float haze, float speed, float clearX) {
  float r = ridge(p.x, freq, seed) * mix(0.35, 1.0, smoothstep(0.06, 0.2, abs(p.x - clearX)));
  float h = base + amp * r;
  if (p.y <= h) {
    // soft light by slope: faces tilted towards the sun (right) brighten gradually
    float slope = amp * (ridge(p.x + 0.004, freq, seed) - ridge(p.x - 0.004, freq, seed)) / 0.008;
    float light = smoothstep(0.35, -0.45, slope);
    vec3 c = mix(shade, lit, light);
    c *= mix(1.0, 0.72, clamp((h - p.y) / (amp + 0.08), 0.0, 1.0));
    c += lit * 0.15 * light * smoothstep(0.01, 0.0, h - p.y);
    // wind ripples running along the dune's contours
    c *= 1.0 - rip * 0.07 * smoothstep(0.3, 1.0, sin((h - p.y) * 320.0 + p.x * 40.0 + noise(p * 18.0) * 4.0));
    col = mix(c, HAZE * 0.9, haze);
  } else {
    float above = p.y - h;
    if (above < 0.06) {
      float n = fbm(vec2(p.x * 8.0 + uTime * speed, above * 60.0 + p.x * 2.0));
      col = mix(col, vec3(1.0, 0.82, 0.58), smoothstep(0.4, 0.85, n) * exp(-above * 55.0) * r * r * 0.55);
    }
  }
}

// Sandworm: a rare event (WORM_CHANCE of each WORM_CYCLE-second slot). It bursts out of the middle
// dune row, its ringed body runs along an arc and it dives back in, spraying sand where it surfaces
// and where it goes under. Drawn between the middle and near dune rows.
const float WORM_CHANCE = 0.05;
const float WORM_CYCLE = 30.0;
const float WORM_TIME = 9.0;   // seconds from first breach until the tail is under again
const float WORM_LEN = 0.7;    // body length, as a fraction of the arc
const float WORM_W = 0.36;     // arc span
const float WORM_H = 0.17;     // arc height
const float WORM_R = 0.019;    // body radius
const float WORM_Y = -0.27;    // arc ends, below the middle dunes' lowest troughs

vec2 wormArc(float s, float wx, float dir) {
  return vec2(wx + dir * (s - 0.5) * WORM_W, WORM_Y + WORM_H * sin(3.14159 * s));
}

const float WORM_PX = 0.004;   // pixel-art cell size: every worm pixel is one flat cell

// The worm's 5-tone palette: 0 outline, 1 shadow, 2 base, 3 lit, 4 highlight
vec3 wormTone(float i) {
  if (i < 0.5) return vec3(0.16, 0.10, 0.07);
  if (i < 1.5) return vec3(0.36, 0.24, 0.17);
  if (i < 2.5) return vec3(0.54, 0.39, 0.28);
  if (i < 3.5) return vec3(0.72, 0.55, 0.39);
  return vec3(0.85, 0.70, 0.50);
}

void sandworm(inout vec3 col, vec2 p, float t, float aspect) {
  float slot = floor(t / WORM_CYCLE);
  float local = t - slot * WORM_CYCLE;
  if (local > WORM_TIME || hash(vec2(slot, 7.1)) >= WORM_CHANCE) return;
  float wx = (hash(vec2(slot, 3.3)) - 0.5) * 2.0 * max(0.0, 0.5 * aspect - 0.25);
  float dir = hash(vec2(slot, 5.9)) < 0.5 ? -1.0 : 1.0;
  if (abs(p.x - wx) > WORM_W * 0.5 + 0.08 || p.y > WORM_Y + WORM_H + 0.06) return;

  vec2 cell = floor(p / WORM_PX);
  vec2 q = (cell + 0.5) * WORM_PX;
  float u = local / WORM_TIME;
  float sH = u * (1.0 + WORM_LEN);                      // head and tail along the arc
  float sT = sH - WORM_LEN;
  float surface = -0.22 + 0.11 * ridge(q.x, 1.4, 4.1);  // the middle dune row it swims through
  bool above = q.y > surface;                           // under the sand it's hidden

  // Body: nearest point on the visible part of the arc
  float a = max(sT, 0.0);
  float b = min(sH, 1.0);
  if (b > a && above) {
    float best = 1.0;
    float bs = 0.0;
    for (int i = 0; i < 36; i++) {
      float s = mix(a, b, float(i) / 35.0);
      float d = length(q - wormArc(s, wx, dir));
      if (d < best) { best = d; bs = s; }
    }
    // tapers to the tail, flares at the head
    float r = WORM_R * mix(0.55, 1.0, clamp((bs - sT) / 0.18, 0.0, 1.0)) * mix(1.0, 1.25, smoothstep(sH - 0.08, sH, bs));
    if (best < r) {
      vec2 tg = normalize(wormArc(bs + 0.005, wx, dir) - wormArc(bs - 0.005, wx, dir));
      vec2 nrm = vec2(-tg.y, tg.x);
      if (nrm.y < 0.0) nrm = -nrm;
      float v = dot(q - wormArc(bs, wx, dir), nrm) / r;  // -1 underside .. 1 back (sunlit)
      float tone = clamp(floor(2.5 + v * 1.4), 1.0, 4.0);
      float ring = fract(bs * 46.0 + v * v * 0.3);        // armour plates, bowed to look round
      if (ring < 0.2) tone -= 1.0;
      else if (ring < 0.32 && v > 0.0) tone += 1.0;
      if (hash(cell) > 0.9) tone -= 1.0;                   // crusty skin
      if (best / r > 0.84) tone = 0.0;                     // outline
      col = mix(wormTone(clamp(tone, 0.0, 4.0)), HAZE * 0.9, 0.08);
    }
  }

  // Maw: a round mouth facing the way it's moving, two rings of teeth pointing inward
  if (sH <= 1.0 && above) {
    vec2 tg = normalize(wormArc(sH + 0.005, wx, dir) - wormArc(sH - 0.005, wx, dir));
    vec2 rel = q - wormArc(sH, wx, dir);
    float rr = WORM_R * 1.3;
    vec2 m = vec2(dot(rel, vec2(-tg.y, tg.x)) / rr, dot(rel, tg) / (rr * 0.5)); // foreshortened
    float e = length(m);
    if (e < 1.0) {
      vec3 c;
      if (e > 0.82) c = wormTone(e > 0.93 ? 0.0 : 3.0);   // lip
      else {
        c = e < 0.3 ? vec3(0.07, 0.02, 0.02) : vec3(0.38, 0.10, 0.08); // throat
        float ang = atan(m.y, m.x) * 14.0 / 6.28318;       // 14 teeth: whole, so no seam
        float outer = (e - 0.42) / 0.4;                     // 0 at tooth tip .. 1 at the gum
        float inner = (e - 0.2) / 0.2;
        float w1 = abs(fract(ang) - 0.5) * 2.0;
        float w2 = abs(fract(ang + 0.5) - 0.5) * 2.0;
        if (outer > 0.0 && w1 < outer * 0.9) c = w1 < outer * 0.5 ? vec3(0.93, 0.88, 0.74) : vec3(0.68, 0.60, 0.48);
        else if (inner > 0.0 && inner < 1.0 && w2 < inner * 0.8) c = vec3(0.80, 0.74, 0.60);
      }
      col = c;
    }
  }

  // Sand thrown up where it breaches and where it dives (in chunky pixels too)
  vec2 e0 = (q - vec2(wormArc(0.0, wx, dir).x, surface + 0.02)) / vec2(0.05, 0.07);
  vec2 e1 = (q - vec2(wormArc(1.0, wx, dir).x, surface + 0.02)) / vec2(0.05, 0.07);
  float spray0 = smoothstep(0.0, 0.03, u) * smoothstep(0.08, -0.02, sT);
  float spray1 = smoothstep(0.98, 1.03, sH) * smoothstep(1.02, 0.92, sT);
  float grit = smoothstep(0.35, 0.8, fbm(vec2(q.x * 55.0, q.y * 35.0 - t * 3.0)));
  float amt = floor(clamp((exp(-dot(e0, e0)) * spray0 + exp(-dot(e1, e1)) * spray1) * grit, 0.0, 0.85) * 4.0) / 4.0;
  col = mix(col, vec3(0.95, 0.70, 0.45), amt);
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;
  vec2 p = uv;
  float t = uTime;
  float aspect = uResolution.x / uResolution.y;
  gSun = vec2(min(0.42, 0.5 * aspect - 0.13), 0.26); // stays on screen on narrow phones
  gOasisX = -min(0.32, 0.5 * aspect - 0.12);

  // Heat haze: the air rippling just above the ground
  float hz = exp(-abs(p.y - HORIZON) * 16.0);
  vec2 hp = p + vec2(noise(vec2(p.y * 70.0 - t * 1.3, p.x * 3.0)) - 0.5, noise(vec2(p.x * 9.0, p.y * 50.0 - t * 1.0)) - 0.5) * 0.012 * hz;

  vec3 col;
  if (hp.y > HORIZON) col = farView(hp);
  else {
    // Mirage: the ground near the horizon becomes a wavering pool reflecting the sky and mesas
    vec2 mp = vec2(hp.x + (noise(vec2(p.y * 120.0 - t * 1.6, p.x * 4.0)) - 0.5) * 0.02, 2.0 * HORIZON - hp.y);
    col = mix(vec3(0.80, 0.50, 0.28), farView(mp) * 0.95, exp((p.y - HORIZON) * 28.0) * 0.75);
  }

  // Fake oasis: a mirage of palms around a blue pool resting on the horizon, wavering in the heat and
  // fading in and out (opposite the sun, pulled in on narrow screens)
  vec2 oc = vec2(gOasisX, HORIZON + 0.003);
  vec2 op = hp + vec2((noise(vec2(p.y * 90.0 - t * 1.2, 3.0)) - 0.5) * 0.008, 0.0);
  float fade = 0.25 + 0.6 * smoothstep(-0.4, 0.6, sin(t * 0.09));
  vec2 oq = op - oc;
  float pool = smoothstep(1.0, 0.75, length(oq / vec2(0.11, 0.0065)));
  float bush = step(oq.y, 0.003 + 0.004 * noise(vec2(op.x * 140.0, 1.0))) * step(-0.001, oq.y) * step(abs(oq.x), 0.085 - 0.3 * abs(oq.y));
  vec3 green = mix(vec3(0.16, 0.26, 0.15), HAZE, 0.38);
  vec3 water = mix(vec3(0.36, 0.68, 0.74), HAZE, 0.3) * (0.92 + 0.12 * sin(op.y * 1400.0 + noise(vec2(op.x * 60.0, t * 0.4)) * 6.0));
  water = mix(water, green * 0.8, palms(vec2(op.x, 2.0 * oc.y - op.y), oc) * 0.6); // palms reflected in the pool
  float land = max(bush, palms(op, oc + vec2(0.0, 0.002)));
  col = mix(col, mix(water, green, land), max(pool, land) * fade);

  // far dunes shimmer with the haze too
  dunes(col, hp, -0.085, 0.06, 2.2, 1.3, vec3(0.95, 0.62, 0.36), vec3(0.70, 0.38, 0.24), 0.0, 0.35, 0.25, gOasisX);

  // Dust devil: a leaning, swirling column crossing the middle distance, fading in and out at the ends
  float ph = fract(t * 0.011 + 0.3);
  float hgt = p.y + 0.11;
  if (hgt > -0.01 && hgt < 0.3) {
    float cx = mix(-1.1, 1.1, ph) + hgt * 0.08 + sin(hgt * 14.0 - t * 1.3) * 0.015;
    float xn = (p.x - cx) / (0.01 + hgt * 0.16);
    if (abs(xn) < 1.0) {
      float swirl = fbm(vec2(xn * 2.5 + t * 3.5, hgt * 18.0 - t * 1.6));
      float dens = (1.0 - xn * xn) * smoothstep(0.3, 0.05, hgt) * smoothstep(-0.01, 0.02, hgt) * (0.35 + 0.65 * swirl);
      col = mix(col, vec3(0.86, 0.58, 0.34), dens * 0.6 * smoothstep(0.0, 0.15, ph) * smoothstep(1.0, 0.85, ph));
    }
  }

  dunes(col, p, -0.22, 0.11, 1.4, 4.1, vec3(0.93, 0.52, 0.24), vec3(0.55, 0.25, 0.14), 0.5, 0.12, 0.4, 99.0);
  sandworm(col, p, t, aspect);
  dunes(col, p, -0.46, 0.15, 0.9, 8.7, vec3(0.78, 0.38, 0.16), vec3(0.32, 0.13, 0.07), 1.0, 0.0, 0.6, 99.0);

  // Blowing sand: faint streams always, thick sheets when a gust comes through
  float gust = pow(0.5 + 0.5 * sin(t * 0.16), 3.0);
  float sheet = fbm(vec2(p.x * 2.2 + t * 0.9, p.y * 9.0 + sin(p.x * 3.0 + t * 0.4)));
  col = mix(col, vec3(0.92, 0.64, 0.38), smoothstep(0.5, 0.9, sheet) * smoothstep(0.15, -0.3, p.y) * (0.08 + 0.32 * gust));

  // vignette + overall dimming so panels stay readable
  float v = smoothstep(1.3, 0.3, length(uv * vec2(0.8, 1.0)));
  col *= mix(0.45, 1.0, v) * 0.78;

  gl_FragColor = vec4(col, 1.0);
}
`;

export function DesertBackdrop({ isStatic = false }: BackdropProps) {
  return (
    <div className={`theme-scene sd-scene ${isStatic ? "theme-scene--static" : ""}`}>
      <ShaderCanvas fragment={FRAGMENT} scale={0.5} fps={24} isStatic={isStatic} staticTime={32} />
    </div>
  );
}
