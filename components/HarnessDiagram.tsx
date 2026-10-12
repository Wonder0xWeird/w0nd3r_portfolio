import { DrawOnView } from "./DrawOnView"
import s from "./HarnessDiagram.module.css"

/**
 * Immortal Kinematics' agent harness, drawn in the Proof feature slab (v2.4; DESIGN.md "Proof"):
 * a scheduled lead that starts cold writes briefs for up to three Opus subagents, each in its own git
 * worktree; their diffs go through a one-command verify gate before anything ships. Every label is a
 * fact from content/projects.ts; no numbers. Thin gold-700 lines on carved slate nodes, Mona Sans 13 px
 * labels (the SVG is drawn at 1:1, 480 px wide); the verify gate is the one lit node. The edges draw
 * once in sequence when it scrolls in (< 900 ms, HarnessDiagram.module.css); the default and
 * reduced-motion state is fully drawn with the gate lit.
 */

const head = (x: number, y: number) => `M${x - 4.5} ${y - 3.5}L${x} ${y}L${x - 4.5} ${y + 3.5}`

// Edges in drawing order: stage 1 the lead's stem, 2 the briefs branching out, 3 the diffs merging,
// 4 into the gate, 5 out to ship.
const EDGES: [stage: number, d: string][] = [
	[1, "M78.5 78H126.5"],
	[2, `M126.5 78V32Q126.5 26 132.5 26H140${head(140, 26)}`],
	[2, `M126.5 78H140${head(140, 78)}`],
	[2, `M126.5 78V124Q126.5 130 132.5 130H140${head(140, 130)}`],
	[3, "M256 26H264Q270 26 270 32V78"],
	[3, "M256 78H270"],
	[3, "M256 130H264Q270 130 270 124V78"],
	[4, `M270 78H310${head(310, 78)}`],
	[5, `M421 78H445${head(445, 78)}`],
]

// Node centres (y): the three subagents; the lead, the gate and Ship sit on the middle one. Two-line
// labels: baselines at centre - 3.3 and + 12.7 (13 px Mona Sans, 16 px apart, optically centred).
const SUBAGENTS = [26, 78, 130]

export function HarnessDiagram({ className }: { className?: string }) {
	return (
		<DrawOnView className={`${s.harness} ${className ?? ""}`}>
			<svg viewBox="0 0 480 156" width="480" height="156" role="img" aria-labelledby="harness-caption" focusable="false">
				{EDGES.map(([stage, d]) => (
					<path key={d} className={`${s.edge} ${s[`stage${stage}`]}`} d={d} pathLength={1} />
				))}
				<rect className={s.node} x="0.75" y="56.75" width="77" height="42.5" rx="2" />
				<text className={s.name} x="39.25" y="74.7">
					Lead
				</text>
				<text className={s.note} x="39.25" y="90.7">
					cold start
				</text>
				<text className={s.note} x="102.5" y="70">
					briefs
				</text>
				{SUBAGENTS.map((cy) => (
					<g key={cy}>
						<rect className={s.node} x="140.75" y={cy - 21.25} width="114.5" height="42.5" rx="2" />
						<text className={s.name} x="198" y={cy - 3.3}>
							Opus subagent
						</text>
						<text className={s.note} x="198" y={cy + 12.7}>
							own worktree
						</text>
					</g>
				))}
				<text className={s.note} x="290" y="70">
					diffs
				</text>
				<rect className={s.halo} x="310.75" y="56.75" width="109.5" height="42.5" rx="2" />
				<rect className={`${s.node} ${s.gate}`} x="310.75" y="56.75" width="109.5" height="42.5" rx="2" />
				<text className={`${s.name} ${s.gateName}`} x="365.5" y="74.7">
					Verify gate
				</text>
				<text className={s.note} x="365.5" y="90.7">
					one command
				</text>
				<text className={`${s.name} ${s.ship}`} x="450" y="82.6">
					Ship
				</text>
			</svg>
			<figcaption id="harness-caption" className="visually-hidden">
				Diagram of the harness: a scheduled Claude lead starts cold each run and writes briefs for up to three Opus
				subagents, each working in its own git worktree. Their diffs come back for review, and nothing ships except
				through a one-command verify gate.
			</figcaption>
		</DrawOnView>
	)
}
