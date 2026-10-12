"use client"

import dynamic from "next/dynamic"
import { useEffect, useRef, useState } from "react"
import { StoneFallback } from "./StoneFallback"

const RuneStoneScene = dynamic(() => import("./RuneStoneScene"), { ssr: false, loading: () => null })

type NetNavigator = Navigator & { connection?: { saveData?: boolean } }

function webglAvailable(): boolean {
	try {
		const c = document.createElement("canvas")
		return !!(c.getContext("webgl2") || c.getContext("webgl"))
	} catch {
		return false
	}
}

/** Touch-first devices and mobile UAs (incl. Lighthouse's mobile emulation). */
function isCoarse(): boolean {
	return window.matchMedia("(pointer: coarse), (hover: none)").matches || /Mobi|Android/i.test(navigator.userAgent)
}

function afterLoad(): Promise<void> {
	if (document.readyState === "complete") return Promise.resolve()
	return new Promise((resolve) => window.addEventListener("load", () => resolve(), { once: true }))
}

/** Resolves once no new LCP candidate has appeared for `quiet` ms (capped). */
function afterLcp(quiet = 700, cap = 5000): Promise<void> {
	return new Promise((resolve) => {
		let settled = false
		let timer = 0
		let po: PerformanceObserver | undefined
		const finish = () => {
			if (settled) return
			settled = true
			window.clearTimeout(timer)
			window.clearTimeout(capTimer)
			po?.disconnect()
			resolve()
		}
		const capTimer = window.setTimeout(finish, cap)
		const rearm = () => {
			window.clearTimeout(timer)
			timer = window.setTimeout(finish, quiet)
		}
		try {
			po = new PerformanceObserver(rearm)
			po.observe({ type: "largest-contentful-paint", buffered: true })
		} catch {
			/* no LCP support: fall back to the quiet timer */
		}
		rearm()
	})
}

function idle(timeout = 3000): Promise<void> {
	return new Promise((resolve) => {
		if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(() => resolve(), { timeout })
		else setTimeout(resolve, 300)
	})
}

const INTERACTIONS = ["pointerdown", "touchstart", "keydown", "wheel", "scroll"] as const

function firstInteraction(signal: AbortSignal): Promise<void> {
	return new Promise((resolve) => {
		const go = () => resolve()
		for (const type of INTERACTIONS) window.addEventListener(type, go, { once: true, passive: true, signal })
	})
}

/**
 * The hero's one 3D element (DESIGN.md "Performance budget and loading policy").
 * First paint is always the designed SVG stone. The three.js chunk is imported
 * only when motion is welcome, WebGL exists, Save-Data is off and the stone is
 * on screen, and then:
 *   - fine pointers: after load + LCP has settled + an idle period;
 *   - coarse pointers / mobile UAs: only after the first user interaction.
 * It pauses rendering while scrolled offscreen. The stone's box also anchors
 * the page torchlight (--torch-x/--torch-y on <html>).
 */
export function HeroStone() {
	const stageRef = useRef<HTMLDivElement>(null)
	const [armed, setArmed] = useState(false)
	const [enabled, setEnabled] = useState(false)
	const [ready, setReady] = useState(false)
	const [onscreen, setOnscreen] = useState(false)

	// Torchlight origin follows the stone.
	useEffect(() => {
		const el = stageRef.current
		if (!el) return
		const root = document.documentElement
		const place = () => {
			const r = el.getBoundingClientRect()
			root.style.setProperty("--torch-x", `${Math.round(r.left + r.width / 2)}px`)
			root.style.setProperty("--torch-y", `${Math.round(r.top + window.scrollY + r.height * 0.45)}px`)
		}
		place()
		const ro = new ResizeObserver(place)
		ro.observe(el)
		window.addEventListener("resize", place)
		return () => {
			ro.disconnect()
			window.removeEventListener("resize", place)
			root.style.removeProperty("--torch-x")
			root.style.removeProperty("--torch-y")
		}
	}, [])

	// Decide whether (and when) the 3D scene may load.
	useEffect(() => {
		const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
		const onChange = () => {
			if (mq.matches) {
				setArmed(false)
				setEnabled(false)
				setReady(false)
			}
		}
		mq.addEventListener("change", onChange)
		const ac = new AbortController()
		const saveData = !!(navigator as NetNavigator).connection?.saveData
		if (!mq.matches && !saveData && webglAvailable()) {
			const gate = isCoarse()
				? firstInteraction(ac.signal)
				: afterLoad()
						.then(() => afterLcp())
						.then(() => idle())
			gate.then(() => {
				if (!ac.signal.aborted && !mq.matches) setArmed(true)
			})
		}
		return () => {
			ac.abort()
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

	// Once armed, load the first time the stone is visible; keep it afterwards.
	useEffect(() => {
		if (armed && onscreen) setEnabled(true)
	}, [armed, onscreen])

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
