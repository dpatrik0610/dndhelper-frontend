import type { BackdropProps } from "./index";
import { ShaderCanvas } from "./ShaderCanvas";

/**
 * Eldritch Void: a black-hole portal rendered by a fragment shader. Starlight and nebula are bent
 * around the hole (gravitational lensing, with a fixed eldritch twist), a tilted accretion disk
 * of swirling magenta-white streaks passes behind and in front of the event horizon (its far side is
 * lensed into an arc over the top) and a photon ring hugs the horizon. The starfield stays still and
 * only twinkles. Styles in styles/themes/void.css.
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
  for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
  return v;
}
mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }

const float RS = 0.13;            // event horizon radius
const vec2 CENTER = vec2(0.0, 0.05);

vec3 sky(vec2 q) {
  float n = fbm(q * 1.5);
  float n2 = fbm(q * 3.2);
  vec3 col = vec3(0.012, 0.0, 0.03);
  col += vec3(0.38, 0.05, 0.48) * smoothstep(0.45, 0.9, n) * 0.55;
  col += vec3(0.12, 0.10, 0.48) * smoothstep(0.5, 0.95, n2) * 0.35;
  // sparse stars
  vec2 g = q * 55.0;
  vec2 id = floor(g);
  vec2 f = fract(g) - 0.5;
  float h = hash(id);
  if (h > 0.986) {
    vec2 o = vec2(hash(id + 1.3), hash(id + 7.1)) - 0.5;
    float d = length(f - o * 0.6);
    col += vec3(1.0, 0.9, 1.0) * smoothstep(0.09, 0.0, d) * (0.55 + 0.45 * sin(uTime * 1.7 + h * 40.0));
  }
  return col;
}

// Accretion disk light at screen position p (relative to CENTER). front: +1 near half, -1 far half.
vec3 disk(vec2 p, float half_) {
  vec2 d = rot(0.21) * p;
  if (d.y * half_ > 0.0) return vec3(0.0); // keep only the requested half (y up: far half is above)
  vec2 dp = vec2(d.x, d.y / 0.23);         // undo the inclination
  float r = length(dp);
  float inner = RS * 1.65, outer = RS * 5.2;
  float mask = smoothstep(inner, inner * 1.12, r) * (1.0 - smoothstep(outer * 0.6, outer, r));
  if (mask <= 0.0) return vec3(0.0);
  // streaks swirl faster near the centre (no atan seam: rotate the plane instead)
  vec2 sp = rot(uTime * 0.55 * RS / r) * dp;
  float t = fbm(vec2(sp.x, sp.y) * 9.0 + vec2(0.0, r * 26.0));
  float heat = mask * (0.35 + 0.95 * t) * pow(inner / r, 1.35);
  float doppler = 0.55 + 0.8 * smoothstep(-1.0, 1.0, -dp.x / r); // approaching side brighter
  heat *= doppler;
  vec3 col = mix(vec3(0.5, 0.08, 0.72), vec3(1.0, 0.78, 1.0), clamp(heat * 1.1, 0.0, 1.0));
  return col * heat * 1.7;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;
  vec2 p = uv - CENTER;
  float r = length(p);
  vec2 dir = p / max(r, 1e-4);

  // gravitational lensing + a fixed eldritch twist of the background (static: the stars stay put)
  float bend = RS * RS * 1.9 / max(r, RS * 0.6);
  vec2 q = p - dir * bend;
  q = rot(0.5 * RS / (r + 0.04)) * q;
  vec3 col = sky(q + CENTER);

  // faint portal glow
  col += vec3(0.45, 0.08, 0.6) * 0.035 / (r * r * 6.0 + 0.04);

  // far half of the disk
  col += disk(p, -1.0);

  // its lensed image: a bright band wrapped around the shadow, thick over the top, thin underneath.
  // Texture is sampled on the unit circle (no atan seam) and swirls with the disk.
  vec2 dr = rot(0.21) * dir;
  float top = smoothstep(-0.4, 0.6, dr.y);
  float lensR = RS * mix(1.16, 1.34, top);
  float lensW = RS * mix(0.035, 0.2, top);
  float band = exp(-pow((r - lensR) / lensW, 2.0)) * mix(0.35, 1.0, top);
  float streak = fbm(rot(uTime * 0.35) * dr * 4.0 + vec2(r * 30.0, 0.0));
  float lensHeat = band * (0.45 + 0.9 * streak) * (0.55 + 0.6 * smoothstep(1.0, -1.0, dr.x));
  col += mix(vec3(0.55, 0.1, 0.78), vec3(1.0, 0.8, 1.0), clamp(lensHeat, 0.0, 1.0)) * lensHeat * 1.1;

  // event horizon
  col *= smoothstep(RS * 0.93, RS * 1.03, r);
  // photon ring
  col += vec3(1.0, 0.82, 1.0) * exp(-pow((r - RS * 1.07) / (RS * 0.045), 2.0)) * 0.95;

  // near half of the disk passes in front of the horizon (and hides the ring behind it)
  vec3 nearDisk = disk(p, 1.0);
  col = col * (1.0 - clamp(dot(nearDisk, vec3(0.6)), 0.0, 0.85)) + nearDisk;

  // vignette
  float v = smoothstep(1.25, 0.35, length(uv * vec2(0.85, 1.0)));
  col *= mix(0.35, 1.0, v);

  gl_FragColor = vec4(pow(col, vec3(0.92)), 1.0);
}
`;

export function VoidBackdrop({ isStatic = false }: BackdropProps) {
  return (
    <div className={`theme-scene ev-scene ${isStatic ? "theme-scene--static" : ""}`}>
      <ShaderCanvas fragment={FRAGMENT} scale={0.5} fps={24} isStatic={isStatic} staticTime={8} />
    </div>
  );
}
