import { useEffect, useRef, useState } from "react";
import { shaderResolution } from "./shaderResolution";

/**
 * Minimal WebGL host for full-screen fragment-shader backdrops (no dependencies).
 *
 * The shader gets `uniform vec2 uResolution` (pixels of the drawing buffer) and `uniform float uTime`
 * (seconds). It renders at `scale` × the device-pixel size (or CSS size for deliberate
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

export function ShaderCanvas({ fragment, scale = 1, fps = 30, isStatic = false, staticTime = 6, pixelated = false, className }: ShaderCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [contextVersion, setContextVersion] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false, premultipliedAlpha: false, powerPreference: "low-power" });
    if (!gl || gl.isContextLost()) return;

    const vs = compile(gl, gl.VERTEX_SHADER, VERTEX);
    const fs = compile(gl, gl.FRAGMENT_SHADER, fragment);
    if (!vs || !fs) {
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      return;
    }
    const prog = gl.createProgram();
    if (!prog) {
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      return;
    }
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error("[ShaderCanvas] link error:", gl.getProgramInfoLog(prog));
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      return;
    }
    // biome-ignore lint/correctness/useHookAtTopLevel: WebGL method, not a React hook
    gl.useProgram(prog);

    // one triangle covering the screen
    const buf = gl.createBuffer();
    if (!buf) {
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      return;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    const uRes = gl.getUniformLocation(prog, "uResolution");
    const uCssRes = gl.getUniformLocation(prog, "uCssResolution");
    const uTime = gl.getUniformLocation(prog, "uTime");
    const maxViewport = gl.getParameter(gl.MAX_VIEWPORT_DIMS) as Int32Array;
    const maxBuffer = gl.getParameter(gl.MAX_RENDERBUFFER_SIZE) as number;
    let cssWidth = canvas.clientWidth;
    let cssHeight = canvas.clientHeight;

    const resize = () => {
      cssWidth = canvas.clientWidth;
      cssHeight = canvas.clientHeight;
      const { width: w, height: h } = shaderResolution(
        cssWidth, cssHeight, scale, pixelated ? 1 : window.devicePixelRatio,
        Math.min(maxViewport[0], maxBuffer), Math.min(maxViewport[1], maxBuffer),
      );
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    };

    const draw = (t: number) => {
      gl.uniform2f(uRes, gl.drawingBufferWidth, gl.drawingBufferHeight);
      gl.uniform2f(uCssRes, cssWidth, cssHeight);
      gl.uniform1f(uTime, t);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    let raf = 0;
    let last = 0;
    let contextLost = false;
    const start = performance.now();
    const frameGap = 1000 / fps;
    const loop = (now: number) => {
      raf = 0;
      if (document.hidden || contextLost) return;
      raf = requestAnimationFrame(loop);
      if (now - last < frameGap) return;
      last = now - ((now - last) % frameGap);
      draw((now - start) / 1000);
    };

    const onResize = () => {
      if (contextLost || document.hidden) return;
      resize();
      if (isStatic) draw(staticTime);
    };
    const onVisibilityChange = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      if (document.hidden || contextLost) return;
      onResize();
      if (!isStatic) raf = requestAnimationFrame(loop);
    };
    const onContextLost = (event: Event) => {
      event.preventDefault();
      contextLost = true;
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const onContextRestored = () => setContextVersion((version) => version + 1);
    const observer = new ResizeObserver(onResize);
    observer.observe(canvas);
    let densityQuery: MediaQueryList;
    const onDensityChange = () => {
      densityQuery?.removeEventListener("change", onDensityChange);
      densityQuery = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
      densityQuery.addEventListener("change", onDensityChange);
      onResize();
    };
    onDensityChange();
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibilityChange);
    canvas.addEventListener("webglcontextlost", onContextLost);
    canvas.addEventListener("webglcontextrestored", onContextRestored);
    if (!isStatic && !document.hidden) raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      canvas.removeEventListener("webglcontextrestored", onContextRestored);
      observer.disconnect();
      densityQuery.removeEventListener("change", onDensityChange);
      if (!contextLost) {
        gl.deleteBuffer(buf);
        gl.deleteProgram(prog);
        gl.deleteShader(vs);
        gl.deleteShader(fs);
      }
      // no WEBGL_lose_context here: the effect re-runs on the same canvas (StrictMode, prop changes)
      // and a lost context can't be reused; the browser frees it when the canvas is removed.
    };
  }, [fragment, scale, fps, isStatic, staticTime, pixelated, contextVersion]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", imageRendering: pixelated ? "pixelated" : "auto" }}
      aria-hidden
    />
  );
}
