"use client"

import { useEffect, useRef } from "react"

/**
 * A <figure> whose line drawing plays once, the first time 40 % of it is in view (the Proof harness
 * diagram, v2.4). The server renders it fully drawn, which is also the reduced-motion and no-JS
 * state. After hydration, if it is still below the fold, it is armed (`data-draw="armed"`, edges
 * hidden by CSS) and set to "go" when it scrolls in; the timings live in CSS. A figure already in
 * view at hydration stays drawn, so it never blinks out and back.
 */
export function DrawOnView({ className, children }: { className?: string; children: React.ReactNode }) {
	const ref = useRef<HTMLElement>(null)
	useEffect(() => {
		const el = ref.current
		if (!el || typeof IntersectionObserver === "undefined" || matchMedia("(prefers-reduced-motion: reduce)").matches) return
		if (el.getBoundingClientRect().top < innerHeight) return
		el.dataset.draw = "armed"
		const io = new IntersectionObserver(
			(entries) => {
				if (!entries.some((e) => e.isIntersecting)) return
				el.dataset.draw = "go"
				io.disconnect()
			},
			{ threshold: 0.4 }
		)
		io.observe(el)
		return () => io.disconnect()
	}, [])
	return (
		<figure ref={ref} className={className}>
			{children}
		</figure>
	)
}
