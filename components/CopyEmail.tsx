"use client"

import { useEffect, useRef, useState } from "react"

/**
 * The address as visible text (a recruiter can read or paste it without a mail
 * client) plus a copy button. The status is announced politely; if the
 * Clipboard API is unavailable the address is selected instead.
 */
export function CopyEmail({ email, className }: { email: string; className?: string }) {
	const addr = useRef<HTMLAnchorElement>(null)
	const [state, setState] = useState<"idle" | "copied" | "selected">("idle")

	useEffect(() => {
		if (state === "idle") return
		const t = window.setTimeout(() => setState("idle"), 2400)
		return () => window.clearTimeout(t)
	}, [state])

	async function copy() {
		try {
			await navigator.clipboard.writeText(email)
			setState("copied")
		} catch {
			const el = addr.current
			const sel = window.getSelection()
			if (el && sel) {
				const range = document.createRange()
				range.selectNodeContents(el)
				sel.removeAllRanges()
				sel.addRange(range)
			}
			setState("selected")
		}
	}

	return (
		<p className={`copy-email ${className ?? ""}`}>
			<a ref={addr} className="copy-email__addr" href={`mailto:${email}`}>
				{email}
			</a>
			<button type="button" className="copy-email__btn" onClick={copy}>
				<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
					<rect x="5.5" y="5.5" width="8" height="8" rx="1" />
					<path d="M3.5 10.5h-1v-8h8v1" />
				</svg>
				{state === "copied" ? "Copied" : "Copy"}
				<span className="visually-hidden"> email address</span>
			</button>
			<span id="copy-email-status" className="visually-hidden" aria-live="polite">
				{state === "copied" ? "Email address copied" : state === "selected" ? "Email address selected; press Control C to copy" : ""}
			</span>
		</p>
	)
}
