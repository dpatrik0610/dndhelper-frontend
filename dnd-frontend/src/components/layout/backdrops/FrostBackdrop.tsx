import { useMemo, type CSSProperties } from "react";
import { seededRandom as rng } from "@utils/seededRandom";
import type { BackdropProps } from "./index";
import { ShaderCanvas } from "./ShaderCanvas";

/**
 * Frost Glacier: a polar night over a glacier lake, drawn by one fragment shader. The aurora borealis
 * hangs over a star field and a faint milky way; below it three ranges recede into haze: glaciated
 * peaks with snow-filled couloirs, a darker middle range and forested foothills, all moonlit from the
 * upper left and tinted green by the aurora. Mist drifts along the valleys. The frozen lake mirrors
 * the mountains near the shore and fades into snow-dusted, cracked ice that catches the aurora's glow
 * and sparkles. Snow-laden spruces on drifts frame the bottom corners. Snowfall is a CSS layer on top.
 * Styles in styles/themes/frost.css. `isStatic` = one frame, no motion (mobile).
 */

const FRAGMENT = /* glsl */ `
precision highp float;
uniform vec2 uResolution;
uniform float uTime;

float hash(float n) { return fract(sin(n) * 43758.5453); }
float hash2(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(float x) { float i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f); return mix(hash(i), hash(i + 1.0), f); }
float noise2(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash2(i), b = hash2(i + vec2(1.0, 0.0)), c = hash2(i + vec2(0.0, 1.0)), d = hash2(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
float fbm2(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise2(p); p = p * 2.03 + 1.7; a *= 0.5; }
  return v;
}

const float HZ = 0.28;                    // shoreline / lake horizon (uv.y)
const vec3 HAZE = vec3(0.10, 0.25, 0.38); // valley air at the horizon
float gAspect;
float gPx;                                // one drawing-buffer pixel in uv.y units
float gPeak;                              // summit height of the last range() lookup

// ---------- Sky ----------

vec3 sky(vec2 uv) {
  float y = 1.0 - uv.y; // 0 at the top
  vec3 c = mix(vec3(0.008, 0.031, 0.086), vec3(0.020, 0.082, 0.188), smoothstep(0.0, 0.4, y));
  c = mix(c, vec3(0.043, 0.165, 0.302), smoothstep(0.4, 0.68, y));
  c = mix(c, vec3(0.082, 0.275, 0.420), smoothstep(0.68, 0.8, y));
  c = mix(c, vec3(0.039, 0.114, 0.212), smoothstep(0.8, 1.0, y));
  vec2 g = (vec2(uv.x, y) - vec2(0.5, 0.78)) / vec2(0.8, 0.4);
  return c + vec3(0.22, 0.74, 0.97) * 0.18 * (1.0 - smoothstep(0.0, 0.7, length(g)));
}

// One curtain: light above a waving lower edge at height base, decaying upward over height.
vec3 curtain(vec2 uv, float aspect, float base, float seed, float height, vec3 low, vec3 high, float speed) {
  float x = uv.x * aspect;
  float t = uTime * speed;
  float edge = base
    + 0.06 * sin(x * 1.7 + seed + t * 0.5)
    + 0.035 * sin(x * 3.9 - seed * 1.3 - t * 0.8)
    + 0.04 * (noise(x * 2.5 + seed * 7.0 + t * 0.3) - 0.5);
  float d = uv.y - edge;
  float lower = smoothstep(-0.015, 0.01, d);                 // soft lower border
  float fade = exp(-max(d, 0.0) / height);                   // dims as it rises
  float glow = exp(-abs(d) / 0.012) * 0.6;                   // the bright seam along the edge
  float rays = 0.55 + 0.45 * noise(x * 26.0 + seed * 3.0 + t * 1.2) * noise(x * 7.0 - t * 0.6 + seed);
  float patches = smoothstep(0.2, 0.8, noise(x * 1.1 + seed * 5.0 + t * 0.2));
  float a = (lower * fade * rays + glow) * (0.25 + 0.75 * patches);
  return mix(low, high, smoothstep(0.0, height * 2.2, d)) * a;
}

vec3 aurora(vec2 uv) {
  return (curtain(uv, gAspect, 0.58, 0.0, 0.2, vec3(0.25, 1.0, 0.55), vec3(0.5, 0.25, 0.9), 0.25)
        + curtain(uv, gAspect, 0.70, 4.1, 0.15, vec3(0.2, 0.9, 0.75), vec3(0.6, 0.3, 0.95), 0.2) * 0.65
        + curtain(uv, gAspect, 0.82, 9.7, 0.11, vec3(0.35, 0.95, 0.6), vec3(0.4, 0.35, 1.0), 0.3) * 0.4) * 0.65;
}

// Two layers of stars (pixel-sized, so they stay crisp at any resolution), denser in the milky way.
vec3 stars(vec2 p, float band) {
  vec3 c = vec3(0.0);
  for (int l = 0; l < 2; l++) {
    float sc = l == 0 ? 70.0 : 28.0;
    vec2 id = floor(p * sc);
    vec2 f = fract(p * sc) - 0.5;
    float h = hash2(id + float(l) * 31.7);
    float keep = l == 0 ? 0.9 - band * 0.12 : 0.965;
    if (h > keep) {
      vec2 o = vec2(hash2(id + 3.1), hash2(id + 9.7)) - 0.5;
      float d = length(f - o * 0.7) / sc / gPx;            // distance in pixels
      float r = l == 0 ? 0.7 : 1.1;
      float tw = 0.7 + 0.3 * sin(uTime * (0.8 + h * 2.5) + h * 90.0);
      vec3 tint = mix(vec3(0.7, 0.82, 1.0), vec3(1.0, 0.95, 0.85), hash2(id + 5.5));
      c += tint * exp(-d * d / (r * r)) * tw * (l == 0 ? 0.55 : 1.0);
    }
  }
  return c;
}

vec3 skyAt(vec2 uv, vec2 p) {
  // faint milky way: a tilted band of dust with dark lanes
  float v = dot(p - vec2(gAspect * 0.3, 0.9), normalize(vec2(0.45, 1.0)));
  float band = exp(-v * v / 0.012);
  float dust = fbm2(p * vec2(5.0, 9.0) + 4.0);
  vec3 col = sky(uv) + vec3(0.12, 0.16, 0.24) * band * smoothstep(0.35, 0.8, dust) * 0.45;
  float above = smoothstep(HZ, HZ + 0.2, uv.y); // stars fade into the horizon glow
  col += stars(p, band) * above;
  return col + aurora(uv);
}

// ---------- Mountains ----------

// Ridged 1D fBm: the creases of |noise| become sharp little peaks (crest roughness, foothills).
float ridged(float x, float seed) {
  float h = 0.0, a = 0.5;
  for (int i = 0; i < 6; i++) {
    float n = 1.0 - abs(noise(x + seed) * 2.0 - 1.0);
    h += a * n * n;
    x *= 2.13; a *= 0.47; seed += 17.3;
  }
  return h;
}

float ridged2(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 3; i++) {
    float n = 1.0 - abs(noise2(p) * 2.0 - 1.0);
    v += a * n * n;
    p = p * 2.07 + vec2(3.1, 1.7); a *= 0.5;
  }
  return v;
}

// A range of summits: one per cell, each a pyramid with uneven flanks, plus rough detail on the crest.
// Returns (crest height, x offset from the owning summit, summit id, height gap to the runner-up:
// small where two flanks meet in a valley) and sets gPeak to the owning summit's height.
vec4 range(float x, float layer) {
  float cw = layer < 0.5 ? 0.2 : 0.13;
  float lo = layer < 0.5 ? 0.04 : 0.02;
  float hi = layer < 0.5 ? 0.27 : 0.14;
  float slope = layer < 0.5 ? 1.05 : 0.95;
  float seed = layer * 31.0 + 5.0;
  float c = floor(x / cw);
  float best = -1.0, second = -1.0, dxBest = 0.0, idBest = 0.0, peak = 0.0;
  for (int k = -2; k <= 2; k++) {
    float id = c + float(k);
    float px = (id + 0.05 + 0.9 * hash(id * 7.13 + seed)) * cw;
    float ph = mix(lo, hi, pow(hash(id * 3.31 + seed), 1.4));
    if (layer < 0.5) ph += 0.13 * exp(-pow((px - gAspect * 0.64) / 0.25, 2.0)); // hero massif, right of centre
    float dx = x - px;
    float s = slope * (dx < 0.0 ? 0.75 + 0.5 * hash(id * 5.9 + seed) : 0.75 + 0.5 * hash(id * 2.3 + seed));
    float h = ph * exp(-abs(dx) * s / ph);   // concave flanks: steep summit, broad base
    if (h > best) { second = best; best = h; dxBest = dx; idBest = id; peak = ph; }
    else if (h > second) { second = h; }
  }
  float rough = (ridged(x * 6.0 + layer * 40.0, seed) - 0.5) * (layer < 0.5 ? 0.045 : 0.03);
  gPeak = HZ + 0.03 + peak;
  return vec4(HZ + 0.03 + max(best, 0.0) + rough, dxBest, idBest, best - second);
}

// Rock face below a crest. The ridge dropping from each summit splits a moonlit west flank from a
// blue east flank; rock ribs radiate down from the summit between snow-filled couloirs; valleys between
// summits hold deep snow in shadow.
vec3 face(vec2 p, float top, float layer, bool cheap) {
  float d = top - p.y;
  // which summit owns this pixel: decided along valley lines that wander as they descend,
  // so neighbouring faces don't meet in a vertical seam
  vec4 r = range(p.x + (noise(p.y * 9.0 + layer * 3.0) - 0.5) * 0.04 * min(d / 0.06, 1.0), layer);
  float id = r.z;
  // the dividing ridge wanders as it descends
  float ridgeX = r.y + (noise(p.y * 14.0 + id * 9.0) - 0.5) * 0.035 * min(d / 0.08, 1.0);
  float lit = smoothstep(0.006, -0.006, ridgeX);                     // west of the ridge
  // ribs: coordinates fan out from the summit
  vec2 q = vec2(r.y / (gPeak - p.y + 0.03) * 2.4 + id * 5.3, d * 7.0 + id * 2.1 + layer * 7.0);
  float rib = ridged2(q);
  float relief = cheap ? 0.0 : (rib - ridged2(q + vec2(0.06, 0.0))) * 3.0;
  float valley = smoothstep(0.03, 0.0, r.w) * smoothstep(0.0, 0.04, d);
  float rock = smoothstep(0.44, 0.58, rib + 0.12 * noise2(q * 4.0) + 0.06 * (1.0 - lit) - 0.25 * valley) * smoothstep(0.004, 0.02, d);
  float light = clamp(mix(0.22, 1.0, lit) + relief - valley * 0.2, 0.0, 1.1);

  vec3 snowCol = mix(vec3(0.07, 0.13, 0.25), vec3(0.5, 0.62, 0.78), light);
  vec3 rockCol = mix(vec3(0.025, 0.035, 0.065), vec3(0.11, 0.14, 0.2), light * 0.8);
  vec3 col = mix(snowCol, rockCol, rock * (layer < 0.5 ? 0.75 : 0.9));
  // aurora light falls on whatever faces up, most near the crest
  col += vec3(0.06, 0.3, 0.2) * (1.0 - rock * 0.6) * exp(-d / 0.08) * 0.5;
  // moonlit rim on the west side of the crest
  col += vec3(0.6, 0.78, 0.95) * exp(-d / (gPx * 1.5)) * mix(0.12, 0.5, lit);
  // aerial perspective: farther and lower = more haze
  float haze = (layer < 0.5 ? 0.4 : 0.2) + 0.4 * exp(-(p.y - HZ) / 0.035);
  return mix(col, HAZE, clamp(haze, 0.0, 0.85));
}

// Spruce tops along the foothills: overlapping cones, thinned into clearings by noise.
float treeline(float x) {
  float cw = 0.007;
  float c = floor(x / cw);
  float h = 0.0;
  for (int k = -1; k <= 1; k++) {
    float id = c + float(k);
    float cx = (id + 0.5 + (hash(id * 1.37) - 0.5) * 0.7) * cw;
    float th = (0.01 + 0.014 * hash(id * 3.1 + 1.0)) * smoothstep(0.3, 0.55, noise(id * 0.11 + 4.0));
    h = max(h, th * (1.0 - abs(x - cx) / (th * 0.28)));
  }
  return h;
}

float hillsH(float x) { return HZ + 0.006 + 0.05 * ridged(x * 3.0 + 27.0, 77.0); }

vec3 forest(vec2 p, float top, float ground) {
  float d = top - p.y;
  float dens = smoothstep(0.3, 0.55, noise(floor(p.x / 0.007) * 0.11 + 4.0)); // same clearings as treeline()
  float inTree = max(smoothstep(0.0, 0.003, top - ground), smoothstep(0.003, 0.01, d) * dens);
  float snow = smoothstep(0.6, 0.85, noise2(p * vec2(380.0, 140.0))) * exp(-d / 0.015);
  vec3 col = mix(vec3(0.015, 0.03, 0.055), vec3(0.04, 0.075, 0.12), exp(-d / 0.025));
  col = mix(col, vec3(0.28, 0.4, 0.54), snow * 0.55);
  vec3 bare = mix(vec3(0.1, 0.17, 0.28), vec3(0.3, 0.42, 0.56), exp(-d / 0.03)); // snowy clearings
  col = mix(bare, col, inTree);
  col += vec3(0.05, 0.25, 0.17) * exp(-d / 0.02) * 0.3;
  return mix(col, HAZE, 0.1 + 0.3 * exp(-(p.y - HZ) / 0.015));
}

// Valley mist drifting along the foot of a range
vec3 mist(vec3 col, vec2 p, float base, float layer, bool cheap) {
  float h = p.y - base;
  if (h < -0.02 || h > 0.1) return col;
  float n = cheap ? 0.55 : fbm2(vec2(p.x * 2.4 - uTime * (0.006 + layer * 0.004), p.y * 18.0 + layer * 5.0));
  float m = smoothstep(0.1, 0.0, h) * smoothstep(-0.02, 0.01, h) * smoothstep(0.35, 0.75, n);
  return mix(col, vec3(0.28, 0.44, 0.58), m * 0.3);
}

vec3 landscape(vec2 uv, vec2 p, bool cheap) {
  vec3 col = skyAt(uv, p);
  for (int i = 0; i < 2; i++) {
    float layer = float(i);
    vec4 r = range(p.x, layer);
    float a = smoothstep(gPx, -gPx, p.y - r.x);
    if (a > 0.0) col = mix(col, face(p, r.x, layer, cheap), a);
    col = mist(col, p, HZ + (layer < 0.5 ? 0.06 : 0.015), layer, cheap);
  }
  float ground = hillsH(p.x);
  float top = ground + treeline(p.x);
  float a = smoothstep(gPx, -gPx, p.y - top);
  if (a > 0.0) col = mix(col, forest(p, top, ground), a);
  return mist(col, p, HZ - 0.01, 2.0, cheap);
}

// ---------- Frozen lake ----------

float cracks(vec2 s) {
  vec2 i = floor(s), f = fract(s);
  float d1 = 8.0, d2 = 8.0;
  for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
    vec2 g = vec2(float(x), float(y));
    float d = length(g + vec2(hash2(i + g), hash2(i + g + 19.1)) - f);
    if (d < d1) { d2 = d1; d1 = d; } else if (d < d2) { d2 = d; }
  }
  return d2 - d1; // ~0 on the cell borders
}

vec3 lake(vec2 uv, vec2 p) {
  float dy = HZ - p.y;
  float Z = 0.5 / (dy + 0.002);                      // distance along the ice
  vec2 s = vec2((p.x - gAspect * 0.5) * Z, Z);       // ground-plane coordinates
  float pxS = Z / (dy + 0.002) * gPx;                // one pixel, in ice coordinates
  float detail = smoothstep(0.0, 0.06, dy);          // texture fades out toward the horizon

  float frost = fbm2(s * vec2(0.9, 0.7));
  float streak = fbm2(s * vec2(0.35, 2.6) + 7.0);    // wind-blown snow, stretched across
  float snowy = smoothstep(0.55, 0.8, frost * 0.55 + streak * 0.6) * detail;

  // mirror image of the mountains and sky, wobbled slightly by the ice
  vec2 rp = vec2(p.x + 0.003 * (noise2(s * 2.0) - 0.5) * detail, 2.0 * HZ - p.y);
  vec3 refl = landscape(vec2(rp.x / gAspect, rp.y), rp, true);
  float fres = mix(0.22, 0.7, exp(-dy * 10.0)) * (1.0 - 0.35 * frost * detail);

  vec3 col = mix(vec3(0.015, 0.05, 0.1), refl, fres);
  // the aurora's glow smeared over the ice (rough ice spreads the reflection)
  float smear = 0.6 + 0.4 * noise2(vec2(p.x * 40.0, dy * 4.0));
  col += aurora(vec2(uv.x, 0.56 + dy * 1.3)) * 0.4 * smear * (1.0 - snowy * 0.6);

  // snow dust, lit by the moon and a little by the aurora
  vec3 snowCol = mix(vec3(0.2, 0.3, 0.44), vec3(0.5, 0.62, 0.76), noise2(s * 3.0)) + vec3(0.02, 0.08, 0.05);
  col = mix(col, snowCol, snowy * 0.85);

  // cracks: pale lines, never thinner than a pixel (thin ones fade instead)
  float w = max(0.025, pxS * 1.3);
  float line = smoothstep(w, 0.0, cracks(s * 0.5 + 3.0)) * min(1.0, 0.05 / w) * detail;
  col = mix(col, vec3(0.45, 0.65, 0.82), line * 0.55 * (1.0 - snowy * 0.7));

  // glints: ice crystals catching the light, twinkling
  vec2 gs = s * vec2(3.0, 2.5);
  vec2 gid = floor(gs);
  float gh = hash2(gid);
  if (gh > 0.93) {
    vec2 o = vec2(hash2(gid + 1.7), hash2(gid + 8.3)) - 0.5;
    float d = length(fract(gs) - 0.5 - o * 0.6) / max(pxS * 3.0, 0.001);
    float tw = pow(max(sin(uTime * (0.6 + gh * 1.4) + gh * 70.0), 0.0), 12.0);
    col += vec3(0.85, 0.95, 1.0) * exp(-d * d * 4.0) * tw * detail;
  }

  // bright snow seam along the shore
  col += vec3(0.4, 0.55, 0.7) * exp(-dy / (gPx * 2.0)) * 0.35;
  return col;
}

// ---------- Foreground: snowdrifts and spruces ----------

// Drifts rise in the bottom corners; in the middle the ice runs to the bottom edge.
float bankH(float x) {
  float r = smoothstep(gAspect * 0.6, gAspect * 1.02, x);
  float l = smoothstep(0.4, 0.0, x);
  return -0.01 + 0.16 * r * r + 0.09 * l * l + 0.03 * noise(x * 5.0) + 0.006 * noise(x * 27.0);
}

vec3 drift(vec2 p, float top, float slope) {
  float d = top - p.y;
  // wind ripples, and the moon lights slopes that face left
  float ripple = noise2(vec2(p.x * 40.0 + p.y * 30.0, p.y * 160.0));
  float light = clamp(0.5 - slope * 1.4 + (ripple - 0.5) * 0.3, 0.0, 1.0);
  vec3 col = mix(vec3(0.08, 0.14, 0.26), vec3(0.46, 0.58, 0.74), light);
  col = mix(col, vec3(0.04, 0.07, 0.14), smoothstep(0.0, 0.18, d) * 0.65); // falls into shadow lower down
  col += vec3(0.05, 0.22, 0.14) * exp(-d / 0.04) * 0.45;                   // aurora on the crest
  col += vec3(0.7, 0.85, 1.0) * exp(-d / (gPx * 1.5)) * 0.25;
  // sparkles
  vec2 gs = p * 120.0;
  vec2 gid = floor(gs);
  float gh = hash2(gid + 40.0);
  if (gh > 0.94) {
    vec2 o = vec2(hash2(gid + 2.0), hash2(gid + 6.0)) - 0.5;
    float dd = length(fract(gs) - 0.5 - o * 0.6) / 120.0 / gPx;
    float tw = pow(max(sin(uTime * (0.5 + gh) + gh * 50.0), 0.0), 10.0);
    col += vec3(0.9, 0.97, 1.0) * exp(-dd * dd * 0.8) * tw * 0.9;
  }
  return col;
}

// Snow-laden spruce: many ragged tiers whose drooping tips flare out at the bottom, snow piled on the
// sloping top of each tier (thicker on the moonlit west side) and a few clumps inside.
// Returns the tree's colour in rgb and its coverage in a.
vec4 spruce(vec2 p, float bx, float hgt, float seed) {
  float by = bankH(bx) - 0.015;
  vec2 q = (p - vec2(bx, by)) / hgt;
  if (q.y < -0.06 || q.y > 1.03 || abs(q.x) > 0.3) return vec4(0.0);
  float side = q.x < 0.0 ? -1.0 : 1.0;
  float ax = abs(q.x);
  float t = q.y * 11.0 + 0.35 * noise(q.y * 6.0 + seed * 3.0 + side * 2.0);
  float tier = fract(t);
  float idx = floor(t);
  float jit = hash(idx * 7.3 + seed * 13.0 + side * 3.1);
  float cone = (0.26 * (1.0 - q.y) + 0.008) * (0.75 + 0.45 * jit);
  float w = cone * (0.4 + 0.6 * (1.0 - smoothstep(0.08, 1.0, tier)));      // drooping tips: full width for a while
  w += cone * 0.12 * (noise(q.y * 140.0 + side * 50.0 + seed * 7.0) - 0.5); // ragged needles
  float aa = gPx / hgt * 1.3;
  float cov = smoothstep(w + aa, w - aa, ax);
  cov = max(cov, smoothstep(0.02 + aa, 0.02 - aa, ax) * step(q.y, 0.12));   // trunk
  cov *= smoothstep(1.02, 0.98, q.y);

  // snow: a band under the sloping upper edge of each tier, broken into clumps
  float th = cone * mix(0.4, 0.22, side * 0.5 + 0.5);
  float clump = noise2(vec2(q.x * 70.0, q.y * 50.0) + seed * 11.0);
  float snow = smoothstep(w - th, w - th * 0.5, ax) * smoothstep(0.1, 0.3, tier) * smoothstep(0.2, 0.45, clump);
  snow = max(snow, smoothstep(0.66, 0.76, clump) * smoothstep(0.3, 0.6, tier) * 0.6);
  snow = max(snow, smoothstep(0.92, 0.96, q.y));                              // snowcap on the tip
  float lit = side < 0.0 ? 1.0 : 0.35;
  vec3 needles = mix(vec3(0.008, 0.02, 0.035), vec3(0.025, 0.05, 0.07), tier * 0.8);
  vec3 snowCol = mix(vec3(0.14, 0.22, 0.36), vec3(0.58, 0.7, 0.84), lit * (0.6 + 0.4 * tier));
  vec3 col = mix(needles, snowCol, snow);
  col += vec3(0.04, 0.2, 0.13) * snow * 0.35;
  return vec4(col, cov);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  gAspect = uResolution.x / uResolution.y;
  gPx = 1.0 / uResolution.y;
  vec2 p = vec2(uv.x * gAspect, uv.y);

  vec3 col = p.y >= HZ ? landscape(uv, p, false) : lake(uv, p);

  float e = 0.004;
  float bank = bankH(p.x);
  float ba = smoothstep(gPx, -gPx, p.y - bank);
  if (ba > 0.0) col = mix(col, drift(p, bank, (bankH(p.x + e) - bankH(p.x - e)) / (2.0 * e)), ba);

  float k = clamp(gAspect / 1.6, 0.5, 1.0); // smaller on narrow (phone) screens
  vec4 t;
  t = spruce(p, gAspect - 0.06 * k, 0.5 * k, 0.0);  col = mix(col, t.rgb, t.a);
  t = spruce(p, gAspect - 0.17 * k, 0.34 * k, 1.0); col = mix(col, t.rgb, t.a);
  t = spruce(p, gAspect - 0.25 * k, 0.22 * k, 2.0); col = mix(col, t.rgb, t.a);
  t = spruce(p, 0.13 * k, 0.26 * k, 1.0);           col = mix(col, t.rgb, t.a);
  t = spruce(p, 0.04 * k, 0.42 * k, 0.0);           col = mix(col, t.rgb, t.a);

  // vignette
  vec2 v = uv - 0.5;
  col *= 1.0 - 0.45 * dot(v, v);
  gl_FragColor = vec4(col, 1.0);
}
`;

export function FrostBackdrop({ isStatic = false }: BackdropProps) {
  const flakes = useMemo(() => {
    const r = rng(2026);
    return Array.from({ length: 46 }, (_, i) => {
      const depth = i % 3; // 0 far, 1 mid, 2 near
      return {
        left: r() * 100,
        size: [2, 3.5, 6][depth] + r() * [1, 1.5, 3][depth],
        duration: [26, 17, 11][depth] + r() * 8,
        delay: -r() * 30,
        drift: (r() - 0.5) * 120,
        depth,
      };
    });
  }, []);

  return (
    <div className={`theme-scene fr-scene ${isStatic ? "theme-scene--static" : ""}`}>
      <ShaderCanvas fragment={FRAGMENT} scale={0.5} fps={30} isStatic={isStatic} staticTime={30} />

      {!isStatic && (
        <div className="fr-snow">
          {flakes.map((f, i) => (
            <span
              key={i}
              className={`fr-flake fr-flake--d${f.depth}`}
              style={{
                left: `${f.left}%`,
                width: f.size,
                height: f.size,
                animationDuration: `${f.duration}s`,
                animationDelay: `${f.delay}s`,
                "--drift": `${f.drift}px`,
              } as CSSProperties}
            />
          ))}
        </div>
      )}
    </div>
  );
}
