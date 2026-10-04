import type { BackdropProps } from "./index";
import { ShaderCanvas } from "./ShaderCanvas";

/**
 * Darkvision: a raymarched stone corridor seen in 1-bit (two-tone ordered dithering, rendered at low
 * resolution and upscaled with crisp pixels — in the spirit of "Return of the Obra Dinn"). There is no
 * light: only your own sight, bright near you and fading to black at ~60 ft. The view creeps forward
 * with a slight sway; every so often a figure stands at the far end for a few seconds, then is gone.
 * Styles in styles/themes/darkvision.css.
 */

const FRAGMENT = /* glsl */ `
precision highp float;
uniform vec2 uResolution;
uniform float uTime;

float sdBox(vec3 p, vec3 b) { vec3 q = abs(p) - b; return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0); }
float sdCapsule(vec3 p, vec3 a, vec3 b, float r) { vec3 pa = p - a, ba = b - a; float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0); return length(pa - ba * h) - r; }

// stone blocks: shallow grooves along mortar lines of a staggered block pattern
float grooves(vec2 c) {
  c.x += floor(c.y) * 0.5;
  vec2 f = abs(fract(c) - 0.5);
  float m = 0.5 - max(f.x, f.y * 1.0);
  return 1.0 - smoothstep(0.0, 0.06, m);
}

float figureVisible() {
  float ph = fract(uTime / 26.0);
  return step(0.58, ph) * step(ph, 0.74);
}

float camZ() { return uTime * 0.35; }

float map(vec3 p) {
  // inside of a long box: walls at |x| = 1.3, floor y = -1, ceiling y = 1.7
  float wx = 1.3 - abs(p.x);
  float fl = p.y + 1.0;
  float ce = 1.7 - p.y;
  wx -= grooves(vec2(p.z * 1.6, p.y * 3.0)) * 0.025;
  fl -= grooves(vec2(p.x * 1.6, p.z * 1.6)) * 0.02;
  float d = min(wx, min(fl, ce));

  // pillars + lintel every 3 units
  float zz = mod(p.z, 3.0) - 1.5;
  d = min(d, sdBox(vec3(abs(p.x) - 1.12, p.y - 0.35, zz), vec3(0.2, 1.4, 0.2)));
  d = min(d, sdBox(vec3(p.x, p.y - 1.5, zz), vec3(1.3, 0.16, 0.2)));

  // the figure at the far end
  if (figureVisible() > 0.5) {
    vec3 fp = p - vec3(0.0, 0.0, camZ() + 8.5);
    float body = sdCapsule(fp, vec3(0.0, -1.0, 0.0), vec3(0.0, 0.25, 0.0), 0.2);
    float head = length(fp - vec3(0.0, 0.55, 0.0)) - 0.16;
    float arms = sdCapsule(vec3(abs(fp.x), fp.y, fp.z), vec3(0.18, 0.15, 0.0), vec3(0.24, -0.5, 0.05), 0.06);
    d = min(d, min(body, min(head, arms)));
  }
  return d;
}

vec3 calcNormal(vec3 p) {
  vec2 e = vec2(0.002, 0.0);
  return normalize(vec3(map(p + e.xyy) - map(p - e.xyy), map(p + e.yxy) - map(p - e.yxy), map(p + e.yyx) - map(p - e.yyx)));
}

float bayer2(vec2 a) { a = floor(a); return fract(a.x / 2.0 + a.y * a.y * 0.75); }
float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }
float bayer8(vec2 a) { return bayer4(0.5 * a) * 0.25 + bayer2(a); }

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;
  float t = uTime;
  vec3 ro = vec3(sin(t * 0.21) * 0.18, 0.05 + sin(t * 0.63) * 0.025, camZ());
  vec3 rd = normalize(vec3(uv, 1.35));
  float yaw = sin(t * 0.17) * 0.08;
  rd.xz = mat2(cos(yaw), -sin(yaw), sin(yaw), cos(yaw)) * rd.xz;

  float dist = 0.0;
  float hit = 0.0;
  for (int i = 0; i < 90; i++) {
    float d = map(ro + rd * dist);
    if (d < 0.0015) { hit = 1.0; break; }
    dist += d * 0.9;
    if (dist > 22.0) break;
  }

  float lum = 0.0;
  if (hit > 0.5) {
    vec3 p = ro + rd * dist;
    vec3 n = calcNormal(p);
    float diff = max(dot(n, -rd), 0.0);
    float ao = clamp(map(p + n * 0.12) / 0.12, 0.0, 1.0);
    float sight = 1.0 - smoothstep(2.0, 14.0, dist); // darkvision range
    lum = diff * (0.35 + 0.65 * ao) * sight * 0.6;
  }
  // tunnel-vision vignette
  lum *= smoothstep(1.05, 0.25, length(uv * vec2(0.8, 1.0)));
  lum = pow(clamp(lum, 0.0, 1.0), 0.85);

  float bit = step(bayer8(gl_FragCoord.xy), lum);
  vec3 ink = vec3(0.035, 0.035, 0.03);
  vec3 bone = vec3(0.4, 0.385, 0.35); // dim, so text over the dither stays readable
  gl_FragColor = vec4(mix(ink, bone, bit), 1.0);
}
`;

export function DarkvisionBackdrop({ isStatic = false }: BackdropProps) {
  return (
    <div className={`theme-scene dv-scene ${isStatic ? "theme-scene--static" : ""}`}>
      <ShaderCanvas fragment={FRAGMENT} scale={0.34} fps={24} isStatic={isStatic} staticTime={4} pixelated />
    </div>
  );
}
