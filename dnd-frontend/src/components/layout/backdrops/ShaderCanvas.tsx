import { useEffect, useRef } from "react";

/**
 * Minimal WebGL host for full-screen fragment-shader backdrops (no dependencies).
 *
 * The shader gets `uniform vec2 uResolution` (pixels of the drawing buffer) and `uniform float uTime`
 * (seconds). It renders at `scale` × the CSS size (e.g. 0.5 for performance, or small for deliberate
 * pixel art with `pixelated`), draws a single frame when `isStatic`, pauses while the tab is hidden,
 * and frees its GPU resources on unmount. If WebGL is unavailable or lost it renders nothing.
 */

interface ShaderCanvasProps {
  fragment: string;
  scale?: number;
  /** Max frames per second (shader cost control). */
  fps?: number;
  isStatic?: boolean;
  /** Time (s) used for the single static frame. */
  staticTime?: number;
  pixelated?: boolean;
  className?: string;
}

const VERTEX = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type);
  if (!sh) return null; // context lost
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.error("[ShaderCanvas] compile error:", gl.getShaderInfoLog(sh));
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

export function ShaderCanvas({ fragment, scale = 0.5, fps = 30, isStatic = false, staticTime = 6, pixelated = false, className }: ShaderCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false, premultipliedAlpha: false, powerPreference: "low-power" });
    if (!gl || gl.isContextLost()) return;

    const vs = compile(gl, gl.VERTEX_SHADER, VERTEX);
    const fs = compile(gl, gl.FRAGMENT_SHADER, fragment);
    if (!vs || !fs) return;
    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error("[ShaderCanvas] link error:", gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);

    // one triangle covering the screen
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    const uRes = gl.getUniformLocation(prog, "uResolution");
    const uTime = gl.getUniformLocation(prog, "uTime");

    const resize = () => {
      const w = Math.max(1, Math.round(canvas.clientWidth * scale));
      const h = Math.max(1, Math.round(canvas.clientHeight * scale));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };

    const draw = (t: number) => {
      resize();
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, t);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    let raf = 0;
    let last = 0;
    const start = performance.now();
    const frameGap = 1000 / fps;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (document.hidden || now - last < frameGap) return;
      last = now;
      draw((now - start) / 1000);
    };

    const onResize = () => isStatic && draw(staticTime);
    window.addEventListener("resize", onResize);
    if (isStatic) draw(staticTime);
    else raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      // no WEBGL_lose_context here: the effect re-runs on the same canvas (StrictMode, prop changes)
      // and a lost context can't be reused; the browser frees it when the canvas is removed.
    };
  }, [fragment, scale, fps, isStatic, staticTime]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", imageRendering: pixelated ? "pixelated" : "auto" }}
      aria-hidden
    />
  );
}
