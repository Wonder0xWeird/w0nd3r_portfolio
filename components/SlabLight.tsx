"use client"

import { useEffect } from "react"

/**
 * Pointer torchlight on slate slabs (fine pointers only). One shared,
 * rAF-coalesced pointermove listener writes --mx/--my on the hovered slab;
 * the gradient itself lives in CSS (.slab::before).
 */
export function SlabLight() {
	useEffect(() => {
		if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return
		let frame = 0
		let last: PointerEvent | null = null
		const paint = () => {
			frame = 0
			const e = last
			if (!e || !(e.target instanceof Element)) return
			const slab = e.target.closest<HTMLElement>(".slab")
			if (!slab) return
			const r = slab.getBoundingClientRect()
			slab.style.setProperty("--mx", `${Math.round(e.clientX - r.left)}px`)
			slab.style.setProperty("--my", `${Math.round(e.clientY - r.top)}px`)
		}
		const onMove = (e: PointerEvent) => {
			last = e
			if (!frame) frame = requestAnimationFrame(paint)
		}
		document.addEventListener("pointermove", onMove, { passive: true })
		return () => {
			document.removeEventListener("pointermove", onMove)
			if (frame) cancelAnimationFrame(frame)
		}
	}, [])
	return null
}
