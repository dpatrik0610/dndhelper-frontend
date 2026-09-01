import { useEffect, useRef } from "react";
import styles from "./TopographicBackground.module.css";

interface TerrainPeak {
  x: number;
  y: number;
  radius: number;
  intensity: number;
  speedX: number;
  speedY: number;
  offsetX: number;
  offsetY: number;
}

interface ShaderUniforms {
  uResolution: WebGLUniformLocation | null;
  uTime: WebGLUniformLocation | null;
  uMouse: WebGLUniformLocation | null;
  uColorPrimary: WebGLUniformLocation | null;
  uColorSecondary: WebGLUniformLocation | null;
  uPeaks: WebGLUniformLocation | null;
}

/**
 * TopographicBackground
 * 
 * An advanced, mathematically rigorous WebGL-based Shaded-Relief Topographic Map.
 * Computes a multi-frequency Fractal Brownian Motion (fBm) elevation field
 * and draws anti-aliased contour isolines. Reacts dynamically to mouse/touch.
 */
export function TopographicBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl");
    if (!gl) {
      console.warn("WebGL not supported.");
      return;
    }

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    gl.viewport(0, 0, width, height);

    const mouse = { x: -10.0, y: -10.0, targetX: -10.0, targetY: -10.0 };

    const peaks: TerrainPeak[] = [
      { x: 0.25, y: 0.35, radius: 0.48, intensity: 0.28, speedX: 0.04, speedY: 0.03, offsetX: 0.0, offsetY: 0.0 },
      { x: 0.75, y: 0.65, radius: 0.52, intensity: 0.22, speedX: 0.02, speedY: 0.05, offsetX: 3.1, offsetY: 1.4 },
      { x: 0.35, y: 0.75, radius: 0.42, intensity: 0.32, speedX: 0.03, speedY: 0.02, offsetX: 1.5, offsetY: 4.2 },
      { x: 0.65, y: 0.25, radius: 0.46, intensity: 0.20, speedX: 0.01, speedY: 0.04, offsetX: 5.4, offsetY: 2.1 },
    ];

    const vsSource = `
      attribute vec2 aPosition;
      varying vec2 vUv;
      void main() {
        vUv = aPosition * 0.5 + 0.5;
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `;

    const fsSource = `
      precision highp float;

      varying vec2 vUv;

      uniform vec2 uResolution;
      uniform float uTime;
      uniform vec2 uMouse;
      uniform vec3 uColorPrimary;
      uniform vec3 uColorSecondary;

      uniform vec4 uPeaks[4];

      float getOrganicRipple(vec2 uv, vec2 center, float freq, float speed) {
        float d = distance(uv, center);
        return sin(d * freq - uTime * speed) * 0.018 * exp(-d * 2.2);
      }

      float getTerrainHeight(vec2 aspectUv, float aspect) {
        float h = 0.0;

        h += sin(aspectUv.x * 1.6 + uTime * 0.02) * cos(aspectUv.y * 1.4 - uTime * 0.015) * 0.32;
        h += sin(aspectUv.x * 3.8 - uTime * 0.01) * cos(aspectUv.y * 4.2 + uTime * 0.008) * 0.14;
        h += sin(aspectUv.x * 8.8 + uTime * 0.005) * cos(aspectUv.y * 9.5) * 0.055;
        h += sin(aspectUv.x * 20.0) * cos(aspectUv.y * 18.5) * 0.02;

        if (uMouse.x > 0.0 && uMouse.y > 0.0) {
          vec2 mouseAspect = vec2(uMouse.x * aspect, uMouse.y);
          float distToMouse = distance(aspectUv, mouseAspect);
          
          float mouseFactor = exp(-pow(distToMouse / 0.28, 2.0));
          h += mouseFactor * 0.42;
          h += getOrganicRipple(aspectUv, mouseAspect, 32.0, 2.5) * mouseFactor;
        }

        for (int i = 0; i < 4; i++) {
          vec2 peakPos = vec2(uPeaks[i].x * aspect, uPeaks[i].y);
          float dist = distance(aspectUv, peakPos);
          float basePeak = uPeaks[i].w * exp(-pow(dist / uPeaks[i].z, 2.2));
          h += basePeak;
        }

        return max(0.0, h);
      }

      void main() {
        vec2 uv = vUv;
        float aspect = uResolution.x / uResolution.y;
        vec2 aspectUv = vec2(uv.x * aspect, uv.y);

        vec2 eps = vec2(0.005, 0.0);
        float hCenter = getTerrainHeight(aspectUv, aspect);
        float hRight  = getTerrainHeight(aspectUv + eps.xy, aspect);
        float hUp     = getTerrainHeight(aspectUv + eps.yx, aspect);

        float dHdx = (hRight - hCenter) / eps.x;
        float dHdy = (hUp - hCenter) / eps.x;

        vec3 normal = normalize(vec3(-dHdx * 0.12, -dHdy * 0.12, 1.0));

        vec3 lightDir = normalize(vec3(-1.0, 1.2, 0.5));
        float diffuse = dot(normal, lightDir) * 0.5 + 0.5;

        float numBands = 18.0;
        float scaledHeight = hCenter * numBands;

        float lineVal = abs(sin(scaledHeight * 3.14159265));

        float indexVal = abs(sin((scaledHeight / 5.0) * 3.14159265));
        bool isIndex = indexVal > 0.95;

        float maxThresh = isIndex ? 0.095 : 0.05;
        float lineMask = smoothstep(maxThresh, 0.0, lineVal);

        float lineOpacity = isIndex ? 0.22 : 0.11;

        vec3 baseBg = vec3(0.025, 0.020, 0.055);
        vec3 reliefBg = mix(baseBg, baseBg * 2.8 + vec3(0.04, 0.045, 0.095), diffuse * 0.48);

        vec3 strokeColor = mix(uColorSecondary, uColorPrimary, clamp(hCenter * 1.4, 0.0, 1.0));

        vec3 finalColor = reliefBg + strokeColor * (lineMask * lineOpacity + pow(max(0.0, 1.0 - lineVal), 8.0) * lineOpacity * 0.38);

        float vignette = uv.x * uv.y * (1.0 - uv.x) * (1.0 - uv.y);
        vignette = clamp(pow(16.0 * vignette, 0.25), 0.0, 1.0);

        gl_FragColor = vec4(finalColor * vignette, 0.60);
      }
    `;

    const createShader = (glContext: WebGLRenderingContext, type: number, source: string): WebGLShader | null => {
      const shader = glContext.createShader(type);
      if (!shader) return null;
      glContext.shaderSource(shader, source);
      glContext.compileShader(shader);
      if (!glContext.getShaderParameter(shader, glContext.COMPILE_STATUS)) {
        console.error("Shader compilation failed: " + glContext.getShaderInfoLog(shader));
        glContext.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);

    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program linking failed: " + gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    const vertices = new Float32Array([
      -1.0, -1.0,
       1.0, -1.0,
      -1.0,  1.0,
      -1.0,  1.0,
       1.0, -1.0,
       1.0,  1.0,
    ]);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const aPosition = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    const uniforms: ShaderUniforms = {
      uResolution: gl.getUniformLocation(program, "uResolution"),
      uTime: gl.getUniformLocation(program, "uTime"),
      uMouse: gl.getUniformLocation(program, "uMouse"),
      uColorPrimary: gl.getUniformLocation(program, "uColorPrimary"),
      uColorSecondary: gl.getUniformLocation(program, "uColorSecondary"),
      uPeaks: gl.getUniformLocation(program, "uPeaks"),
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX / window.innerWidth;
      mouse.targetY = 1.0 - e.clientY / window.innerHeight;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouse.targetX = e.touches[0].clientX / window.innerWidth;
        mouse.targetY = 1.0 - e.touches[0].clientY / window.innerHeight;
      }
    };

    const handleMouseLeave = () => {
      mouse.targetX = -10.0;
      mouse.targetY = -10.0;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      gl.viewport(0, 0, width, height);
    };
    window.addEventListener("resize", handleResize);

    let time = 0.0;

    const hexToRgb = (hexStr: string, defaultColor: number[]): number[] => {
      const cleanHex = hexStr.trim().replace("#", "");
      if (cleanHex.length === 6) {
        return [
          parseInt(cleanHex.substring(0, 2), 16) / 255.0,
          parseInt(cleanHex.substring(2, 4), 16) / 255.0,
          parseInt(cleanHex.substring(4, 6), 16) / 255.0,
        ];
      }
      return defaultColor;
    };

    const render = () => {
      time += 0.0035;

      mouse.x += (mouse.targetX - mouse.x) * 0.07;
      mouse.y += (mouse.targetY - mouse.y) * 0.07;

      peaks.forEach((peak) => {
        peak.x = 0.5 + Math.sin(time * peak.speedX + peak.offsetX) * 0.32;
        peak.y = 0.5 + Math.cos(time * peak.speedY + peak.offsetY) * 0.32;
      });

      gl.clearColor(0.0, 0.0, 0.0, 0.0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      const rootStyle = getComputedStyle(document.body);
      const hexPrimary = rootStyle.getPropertyValue("--theme-color-accent-primary").trim() || "#7c3aed";
      const hexSecondary = rootStyle.getPropertyValue("--theme-color-accent-secondary").trim() || "#06b6d4";

      const rgbPrimary = hexToRgb(hexPrimary, [0.48, 0.22, 0.96]);
      const rgbSecondary = hexToRgb(hexSecondary, [0.02, 0.71, 0.83]);

      gl.uniform2f(uniforms.uResolution, width, height);
      gl.uniform1f(uniforms.uTime, time);
      gl.uniform2f(uniforms.uMouse, mouse.x, mouse.y);
      gl.uniform3f(uniforms.uColorPrimary, rgbPrimary[0], rgbPrimary[1], rgbPrimary[2]);
      gl.uniform3f(uniforms.uColorSecondary, rgbSecondary[0], rgbSecondary[1], rgbSecondary[2]);

      const flatPeaks = new Float32Array(16);
      peaks.forEach((p, idx) => {
        flatPeaks[idx * 4 + 0] = p.x;
        flatPeaks[idx * 4 + 1] = p.y;
        flatPeaks[idx * 4 + 2] = p.radius;
        flatPeaks[idx * 4 + 3] = p.intensity;
      });
      gl.uniform4fv(uniforms.uPeaks, flatPeaks);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", handleResize);

      gl.bindBuffer(gl.ARRAY_BUFFER, null);
      gl.deleteBuffer(positionBuffer);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      gl.deleteProgram(program);
    };
  }, []);

  return (
    <>
      <div className={styles.background} />
      <canvas ref={canvasRef} className={styles.interactiveCanvas} />
      <div className={styles.overlay} />
    </>
  );
}
