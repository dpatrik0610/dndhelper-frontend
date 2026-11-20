const CHEAP_KEYS = new Set(["offset", "computedOffset", "easing", "composite", "transform", "translate", "scale", "rotate", "opacity"]);

function describe(el: Element) {
  const cls = typeof el.className === "string" ? el.className.trim().split(/\s+/).slice(0, 3).join(".") : "";
  return `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ""}${cls ? `.${cls}` : ""}`;
}

function visible(el: Element) {
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0 && r.bottom > 0 && r.right > 0 && r.top < innerHeight && r.left < innerWidth;
}

function area(el: Element) {
  const r = el.getBoundingClientRect();
  return Math.round(r.width * r.height);
}

function backdropOf(el: Element) {
  const s = getComputedStyle(el);
  const value = s.backdropFilter || s.getPropertyValue("-webkit-backdrop-filter");
  return value && value !== "none" ? value : null;
}

export function gpuAudit() {
  const elements = Array.from(document.body.querySelectorAll("*")).filter(visible);

  const blurred = elements.filter(backdropOf);
  const blurredSet = new Set(blurred);
  const nestedBlur = blurred.filter((el) => {
    for (let p = el.parentElement; p; p = p.parentElement) if (blurredSet.has(p)) return true;
    return false;
  });

  const paintAnimations = document
    .getAnimations()
    .filter((a) => a.playState === "running" && a.effect instanceof KeyframeEffect && a.effect.target)
    .map((a) => {
      const effect = a.effect as KeyframeEffect;
      const props = new Set(effect.getKeyframes().flatMap((k) => Object.keys(k)).filter((k) => !CHEAP_KEYS.has(k)));
      return { animation: a, effect, props };
    })
    .filter(({ props, effect }) => props.size && effect.getComputedTiming().iterations === Infinity);

  const canvases = Array.from(document.querySelectorAll("canvas")).filter(visible);
  const promoted = elements.filter((el) => getComputedStyle(el).willChange !== "auto");

  console.group("%cGPU audit", "font-weight:bold");
  console.log(
    `${blurred.length} backdrop-filter elements on screen (${(blurred.reduce((n, el) => n + area(el), 0) / 1e6).toFixed(2)} Mpx re-blurred whenever anything behind them moves)`,
  );
  if (nestedBlur.length) {
    console.warn(`${nestedBlur.length} nested backdrop-filters: they blur an already-blurred surface, drop their blur`);
    console.table(nestedBlur.map((el) => ({ element: describe(el), filter: backdropOf(el), px: area(el) })));
  }
  if (paintAnimations.length) {
    console.warn(`${paintAnimations.length} endless animations repaint every frame`);
    console.table(
      paintAnimations.map(({ animation, effect, props }) => ({
        element: describe(effect.target as Element),
        animation: animation instanceof CSSAnimation ? animation.animationName : "(script)",
        properties: [...props].join(", "),
        px: area(effect.target as Element),
      })),
    );
  }
  if (canvases.length) {
    console.table(
      canvases.map((c) => ({ element: describe(c), buffer: `${c.width}×${c.height}`, megapixels: +((c.width * c.height) / 1e6).toFixed(2) })),
    );
  }
  console.log(`${promoted.length} elements with will-change (each is its own GPU layer)`);
  console.groupEnd();

  return { blurred, nestedBlur, paintAnimations, canvases, promoted };
}
