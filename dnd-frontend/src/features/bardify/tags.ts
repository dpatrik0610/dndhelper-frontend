export type Tags = { title?: string; artist?: string; cover?: Blob }

export async function readTags(file: Blob): Promise<Tags> {
  try {
    const { parseBlob, selectCover } = await import('music-metadata')
    const { common } = await parseBlob(file, { duration: false })
    const picture = selectCover(common.picture)
    return {
      title: common.title?.trim() || undefined,
      artist: (common.artist ?? common.albumartist)?.trim() || undefined,
      cover: picture ? await shrink(new Blob([picture.data as Uint8Array<ArrayBuffer>], { type: picture.format })) : undefined,
    }
  } catch {
    return {}
  }
}
export async function shrink(image: Blob, size = 320): Promise<Blob | undefined> {
  try {
    const bmp = await createImageBitmap(image)
    const scale = Math.min(1, size / Math.max(bmp.width, bmp.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(bmp.width * scale))
    canvas.height = Math.max(1, Math.round(bmp.height * scale))
    canvas.getContext('2d')!.drawImage(bmp, 0, 0, canvas.width, canvas.height)
    bmp.close()
    return await new Promise<Blob | undefined>((resolve) => canvas.toBlob((b) => resolve(b ?? undefined), 'image/jpeg', 0.86))
  } catch {
    return undefined
  }
}
export async function withoutTags(file: File): Promise<Blob> {
  const isMp3 = file.type === 'audio/mpeg' || /\.mp3$/i.test(file.name)
  if (!isMp3) return file
  let start = 0
  for (;;) {
    const h = new Uint8Array(await file.slice(start, start + 10).arrayBuffer())
    if (h.length < 10 || h[0] !== 0x49 || h[1] !== 0x44 || h[2] !== 0x33) break
    const size = ((h[6] & 0x7f) << 21) | ((h[7] & 0x7f) << 14) | ((h[8] & 0x7f) << 7) | (h[9] & 0x7f)
    start += 10 + size + (h[5] & 0x10 ? 10 : 0)
  }
  return start ? new Blob([file.slice(start)], { type: 'audio/mpeg' }) : file
}
