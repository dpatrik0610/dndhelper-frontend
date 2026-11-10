export function shaderResolution(
  width: number,
  height: number,
  scale: number,
  pixelRatio: number,
  maxWidth: number,
  maxHeight: number,
) {
  const density = Math.max(1, pixelRatio);
  const requestedWidth = Math.max(1, width * scale * density);
  const requestedHeight = Math.max(1, height * scale * density);
  const fit = Math.min(1, maxWidth / requestedWidth, maxHeight / requestedHeight);
  return {
    width: Math.max(1, Math.round(requestedWidth * fit)),
    height: Math.max(1, Math.round(requestedHeight * fit)),
  };
}
