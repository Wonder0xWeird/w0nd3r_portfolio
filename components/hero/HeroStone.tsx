"use client"

import dynamic from "next/dynamic"
import { useEffect, useRef, useState } from "react"
import { StoneFallback } from "./StoneFallback"

const RuneStoneScene = dynamic(() => import("./RuneStoneScene"), { ssr: false, loading: () => null })

function webglAvailable(): boolean {
	try {
		const c = document.createElement("canvas")
		return !!(c.getContext("webgl2") || c.getContext("webgl"))
	} catch {
		return false
	}
}

/**
 * The hero's one 3D element. First paint is always the static SVG stone; the
 * WebGL scene is fetched only after the page is idle, and only when motion is
 * welcome and WebGL exists. It pauses rendering while scrolled offscreen.
 */
export function HeroStone() {
	const stageRef = useRef<HTMLDivElement>(null)
	const [enabled, setEnabled] = useState(false)
	const [ready, setReady] = useState(false)
	const [onscreen, setOnscreen] = useState(true)

	useEffect(() => {
		const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
		const onChange = () => {
			if (mq.matches) {
				setEnabled(false)
				setReady(false)
			}
		}
		mq.addEventListener("change", onChange)
		if (mq.matches || !webglAvailable()) return () => mq.removeEventListener("change", onChange)

		const start = () => setEnabled(true)
		let cancel: () => void
		if ("requestIdleCallback" in window) {
			const id = window.requestIdleCallback(start, { timeout: 2500 })
			cancel = () => window.cancelIdleCallback(id)
		} else {
			const id = setTimeout(start, 800)
			cancel = () => clearTimeout(id)
		}
		return () => {
			cancel()
			mq.removeEventListener("change", onChange)
		}
	}, [])

	useEffect(() => {
		const el = stageRef.current
		if (!el || !("IntersectionObserver" in window)) return
		const io = new IntersectionObserver(([entry]) => setOnscreen(entry.isIntersecting), { rootMargin: "80px" })
		io.observe(el)
		return () => io.disconnect()
	}, [])

	return (
		<div ref={stageRef} className="hero-stone" data-ready={ready ? "" : undefined}>
			<StoneFallback className="hero-stone__fallback" />
			{enabled ? (
				<div className="hero-stone__canvas" aria-hidden="true">
					<RuneStoneScene active={onscreen} onReady={() => setReady(true)} />
				</div>
			) : null}
		</div>
	)
}
