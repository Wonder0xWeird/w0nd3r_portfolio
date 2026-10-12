"use client"

import dynamic from "next/dynamic"
import { useCallback, useEffect, useRef, useState } from "react"
import { StoneLight, StoneMotes, stoneVars } from "./StoneLight"

const RuneStoneScene = dynamic(() => import("./RuneStoneScene"), { ssr: false, loading: () => null })

type NetNavigator = Navigator & { connection?: { saveData?: boolean } }

/** Canvas crossfade (globals.css .stone__canvas); the SVG leaves and the sway starts after it. */
const FADE_MS = 350

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
 * The hero's stone (DESIGN.md "Hero" and "Performance budget and loading policy").
 *
 * Layers, back to front: torch (lights the page around the hero), halo and
 * ground shadow, the stone body (SVG first paint, WebGL on top once ready, both
 * under one mask), motes. Only the body swaps; the light layers persist.
 *
 * First paint is always the SVG twin (StoneFallback, passed in from the server).
 * The three.js chunk is imported only when motion is welcome, WebGL exists,
 * Save-Data is off and the stone is on screen, and then:
 *   - fine pointers: after load + LCP has settled + an idle period;
 *   - coarse pointers / mobile UAs: only after the first user interaction.
 * Handoff: the scene reports ready after two rendered frames at the SVG's exact
 * pose; the canvas fades in over the still-opaque SVG (350 ms); then the SVG is
 * hidden and the stone starts to sway. It pauses rendering while offscreen.
 */
export function HeroStone({ fallback }: { fallback: React.ReactNode }) {
	const stageRef = useRef<HTMLDivElement>(null)
	const [armed, setArmed] = useState(false)
	const [enabled, setEnabled] = useState(false)
	const [ready, setReady] = useState(false)
	const [live, setLive] = useState(false)
	const [onscreen, setOnscreen] = useState(false)

	// Decide whether (and when) the 3D scene may load.
	useEffect(() => {
		const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
		const onChange = () => {
			if (mq.matches) {
				setArmed(false)
				setEnabled(false)
				setReady(false)
				setLive(false)
			}
		}
		mq.addEventListener("change", onChange)
		const ac = new AbortController()
		const saveData = !!(navigator as NetNavigator).connection?.saveData
		if (!mq.matches && !saveData) {
			const gate = isCoarse()
				? firstInteraction(ac.signal)
				: afterLoad()
						.then(() => afterLcp())
						.then(() => idle())
			// The WebGL probe creates a GL context, which is itself costly: only after the gate.
			gate.then(() => {
				if (!ac.signal.aborted && !mq.matches && webglAvailable()) setArmed(true)
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

	// After the crossfade: retire the SVG and let the stone move.
	useEffect(() => {
		if (!ready) return
		const t = window.setTimeout(() => setLive(true), FADE_MS + 40)
		return () => window.clearTimeout(t)
	}, [ready])

	const onReady = useCallback(() => setReady(true), [])

	return (
		<div
			ref={stageRef}
			className="stone hero-stone"
			style={stoneVars}
			data-ready={ready ? "" : undefined}
			data-live={live ? "" : undefined}
		>
			<StoneLight torch />
			<div className="stone__body">
				{fallback}
				{enabled ? (
					<div className="stone__canvas" aria-hidden="true">
						<RuneStoneScene active={onscreen} live={live} onReady={onReady} />
					</div>
				) : null}
			</div>
			<StoneMotes />
		</div>
	)
}
