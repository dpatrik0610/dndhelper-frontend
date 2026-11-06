import { useRef, useState, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react'
type Drag = { id: string; from: number; to: number; dx: number; dy: number; step: number; mids: number[]; startX: number; startY: number; scroll: number }
type Moved = { id: string; from: number; to: number }

const EDGE_PX = 36
const EDGE_SPEED = 6

export function useReorder<T>(items: T[], idOf: (item: T) => string, save: (ids: string[], moved: Moved) => Promise<unknown>, dropOn?: (id: string, target: string) => void) {
  const [drag, setDrag] = useState<Drag | null>(null)
  const dragRef = useRef<Drag | null>(null)
  const [sent, setSent] = useState<string[] | null>(null)
  const listRef = useRef<HTMLOListElement | null>(null)
  const pointer = useRef({ x: 0, y: 0 })
  const edgeTimer = useRef<ReturnType<typeof setInterval> | null>(null)
  const dropTarget = useRef<HTMLElement | null>(null)

  const update = (d: Drag | null) => {
    dragRef.current = d
    setDrag(d)
  }

  const byId = new Map(items.map((item) => [idOf(item), item]))
  const ordered = sent ? [...sent.flatMap((id) => (byId.has(id) ? [byId.get(id)!] : [])), ...items.filter((item) => !sent.includes(idOf(item)))] : items

  const send = (id: string, from: number, to: number) => {
    if (to === from || to < 0 || to >= ordered.length) return
    const order = ordered.map(idOf).filter((x) => x !== id)
    order.splice(to, 0, id)
    setSent(order)
    save(order, { id, from, to }).finally(() => setSent(null))
  }

  const follow = () => {
    const d = dragRef.current
    if (!d) return
    const { x, y } = pointer.current
    const dy = y - d.startY + (listRef.current?.scrollTop ?? 0) - d.scroll
    const dx = dropOn ? x - d.startX : 0
    const mid = d.mids[d.from] + dy
    const target = dropOn ? (document.elementsFromPoint(x, y).find((el) => el instanceof HTMLElement && el.dataset.drop) as HTMLElement | undefined) : undefined
    if (dropTarget.current !== (target ?? null)) {
      dropTarget.current?.classList.remove('is-drop-target')
      target?.classList.add('is-drop-target')
      dropTarget.current = target ?? null
    }
    const to = target ? d.from : d.mids.filter((m, i) => i !== d.from && m < mid).length
    if (dy !== d.dy || dx !== d.dx || to !== d.to) update({ ...d, dx, dy, to })
  }

  const stopEdge = () => {
    if (edgeTimer.current) clearInterval(edgeTimer.current)
    edgeTimer.current = null
  }

  const edgeScroll = () => {
    stopEdge()
    const list = listRef.current
    if (!list || list.scrollHeight <= list.clientHeight) return
    const box = list.getBoundingClientRect()
    const dir = pointer.current.y < box.top + EDGE_PX ? -1 : pointer.current.y > box.bottom - EDGE_PX ? 1 : 0
    if (!dir) return
    edgeTimer.current = setInterval(() => {
      list.scrollTop += dir * EDGE_SPEED
      follow()
    }, 16)
  }

  const letGo = () => {
    stopEdge()
    dropTarget.current?.classList.remove('is-drop-target')
    dropTarget.current = null
    update(null)
  }

  const handle = (id: string) => ({
    onPointerDown: (e: ReactPointerEvent<HTMLElement>) => {
      if (e.button !== 0 || !listRef.current) return
      const rows = [...listRef.current.querySelectorAll<HTMLElement>(':scope > [data-reorder]')]
      const from = rows.findIndex((r) => r.dataset.reorder === id)
      if (from < 0 || (rows.length < 2 && !dropOn)) return
      e.preventDefault()
      e.currentTarget.setPointerCapture(e.pointerId)
      pointer.current = { x: e.clientX, y: e.clientY }
      const rects = rows.map((r) => r.getBoundingClientRect())
      const gap = rects.length > 1 ? rects[1].top - rects[0].bottom : 0
      update({ id, from, to: from, dx: 0, dy: 0, step: rects[from].height + gap, mids: rects.map((r) => r.top + r.height / 2), startX: e.clientX, startY: e.clientY, scroll: listRef.current.scrollTop })
    },
    onPointerMove: (e: ReactPointerEvent<HTMLElement>) => {
      if (dragRef.current?.id !== id) return
      pointer.current = { x: e.clientX, y: e.clientY }
      follow()
      edgeScroll()
    },
    onPointerUp: () => {
      const d = dragRef.current
      const target = dropTarget.current?.dataset.drop
      letGo()
      if (!d) return
      if (target) dropOn?.(d.id, target)
      else send(d.id, d.from, d.to)
    },
    onPointerCancel: letGo,
    onKeyDown: (e: ReactKeyboardEvent<HTMLElement>) => {
      if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return
      e.preventDefault()
      const from = ordered.findIndex((item) => idOf(item) === id)
      send(id, from, from + (e.key === 'ArrowUp' ? -1 : 1))
    },
  })
  const row = (id: string, index: number): { 'data-reorder': string; className: string; style?: CSSProperties } => {
    if (!drag) return { 'data-reorder': id, className: '' }
    if (id === drag.id) return { 'data-reorder': id, className: 'is-dragging', style: { transform: `translate(${drag.dx}px, ${drag.dy}px)` } }
    const shift = drag.from < drag.to && index > drag.from && index <= drag.to ? -drag.step : drag.to < drag.from && index >= drag.to && index < drag.from ? drag.step : 0
    return { 'data-reorder': id, className: 'is-making-way', style: shift ? { transform: `translateY(${shift}px)` } : undefined }
  }

  return { ordered, listRef, handle, row, dragging: !!drag }
}
