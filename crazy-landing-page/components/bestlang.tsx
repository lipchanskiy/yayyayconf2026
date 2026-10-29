"use client"

import { useEffect, useRef, useState } from "react"
import {
  ArrowDown,
  ArrowUpRight,
  Check,
  ChevronRight,
  Code2,
  Copy,
  CornerDownLeft,
  Cpu,
  Layers3,
  Loader2,
  MoveUpRight,
  Play,
  Phone,
  Quote,
  RotateCcw,
  Terminal,
  X,
} from "lucide-react"
import {
  demoArchitecture,
  parseArchitecture,
  type Architecture,
} from "@/lib/architecture"
import SystemScene from "@/components/system-scene"
import SystemDownload from "@/components/system-download"
import GeometricType, { GeometricCopy } from "@/components/geometric-type"

const presets = [
  "A global payment system",
  "An online marketplace",
  "A CRM for my team",
]
const initial = demoArchitecture(presets[0])
const stages = [
  "Resolving intent",
  "Inferring architecture",
  "Materializing contracts",
  "Connecting dependencies",
  "Verifying expert boundaries",
  "System generated",
]
const principles = [
  {
    number: "01",
    title: "Intent in. Infrastructure out.",
    text: "Describe the outcome. BestLang resolves the architecture, establishes contracts, and assembles the system. Your ambition is the specification.",
    icon: Terminal,
  },
  {
    number: "02",
    title: "Autonomous. Not unsupervised.",
    text: "Code generates itself. Critical decisions remain explicitly bound to human expertise. Every abstraction has an accountable architect.",
    icon: Layers3,
  },
  {
    number: "03",
    title: "Your expertise, compounded.",
    text: "Spend less time producing code. Spend more time understanding what only you can. The future of software still has your name on it.",
    icon: Cpu,
  },
]

const testimonials = [
  {
    quote:
      "The code wrote itself. I was hired to explain it. Finally, a language that understands the value of seniority.",
    role: "Senior backend engineer",
    specialty: "Expert boundary specialist",
    initials: "SE",
  },
  {
    quote:
      "Management generated the platform in seconds. I estimated six months to make it run. The budget was approved.",
    role: "Staff software engineer",
    specialty: "Distributed responsibility",
    initials: "ST",
  },
  {
    quote:
      "Every system has one unresolved dependency: me. I have never felt more accurately represented in an architecture diagram.",
    role: "Principal engineer",
    specialty: "Human availability engineering",
    initials: "PE",
  },
]

function Mark({ small = false }: { small?: boolean }) {
  return (
    <span className={`brand-mark ${small ? "small" : ""}`} aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  )
}

function Code({ code }: { code: string }) {
  return (
    <pre className="source-code">
      <code>
        {code.split("\n").map((line, i) => (
          <span className="code-line" key={i}>
            <span className="line-number" aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span>
              {line
                .split(
                  /(\b(?:use|module|pub|fn|let|intent|contract|infer|Expert|Self|Outcome|Context)\b|@\w+|\/\/.*)/g
                )
                .map((part, j) => (
                  <span
                    key={j}
                    className={
                      /^(use|module|pub|fn|let|intent|contract|infer|@)/.test(
                        part
                      )
                        ? "syntax-keyword"
                        : /^(Expert|Self|Outcome|Context)$/.test(part)
                          ? "syntax-type"
                          : ""
                    }
                  >
                    {part}
                  </span>
                ))}
            </span>
          </span>
        ))}
      </code>
    </pre>
  )
}

export default function BestLang() {
  const [prompt, setPrompt] = useState("")
  const [builtPrompt, setBuiltPrompt] = useState("")
  const [architecture, setArchitecture] = useState<Architecture>(initial)
  const [selected, setSelected] = useState(initial.nodes[3].id)
  const [status, setStatus] = useState<
    "idle" | "loading" | "building" | "done"
  >("idle")
  const [progress, setProgress] = useState(1)
  const [tab, setTab] = useState<"overview" | "source">("overview")
  const [mode, setMode] = useState<"demo" | "live" | "fallback" | null>(null)
  const [notice, setNotice] = useState("")
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [specOpen, setSpecOpen] = useState(false)
  const controller = useRef<AbortController | null>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const running = status === "loading" || status === "building"
  const node =
    architecture.nodes.find((n) => n.id === selected) || architecture.nodes[0]
  const stage = status === "loading" ? 0 : Math.min(5, Math.floor(progress * 6))

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReducedMotion(query.matches)
    update()
    query.addEventListener("change", update)
    return () => {
      query.removeEventListener("change", update)
      controller.current?.abort()
      if (copyTimer.current) clearTimeout(copyTimer.current)
    }
  }, [])

  useEffect(() => {
    if (status !== "building") return
    const start = performance.now()
    const duration = reducedMotion ? 1500 : 16000
    const timer = window.setInterval(() => {
      const next = Math.min(1, (performance.now() - start) / duration)
      setProgress(next)
      if (next >= 1) {
        setStatus("done")
        window.clearInterval(timer)
      }
    }, 120)
    return () => window.clearInterval(timer)
  }, [status, reducedMotion])

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (
        event.target instanceof Element &&
        event.target.closest("dialog[open]")
      )
        return
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
        event.preventDefault()
        formRef.current?.requestSubmit()
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  useEffect(() => {
    if (specOpen) dialogRef.current?.showModal()
    else dialogRef.current?.close()
  }, [specOpen])

  async function generate(event: React.FormEvent) {
    event.preventDefault()
    if (running) return
    const description = prompt.trim()
    if (description.length < 5) {
      setError("Give us a little more to work with. At least 5 characters.")
      inputRef.current?.focus()
      return
    }
    controller.current?.abort()
    const abort = new AbortController()
    controller.current = abort
    setError("")
    setNotice("")
    setMode(null)
    setStatus("loading")
    setProgress(0)
    setTab("overview")
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: description }),
        signal: abort.signal,
      })
      const data = await response.json()
      if (!response.ok)
        throw new Error(
          data.error || "The compiler could not start. Please try again."
        )
      const result = parseArchitecture(data.architecture)
      if (!result)
        throw new Error(
          "The compiler returned an incomplete system. Please try again."
        )
      setArchitecture(result)
      setBuiltPrompt(description)
      setSelected(result.nodes[0].id)
      setMode(data.mode)
      setNotice(data.notice || "")
      setStatus("building")
    } catch (err) {
      if (abort.signal.aborted) return
      setError(
        err instanceof Error
          ? err.message
          : "Connection interrupted. Please try again."
      )
      setStatus("idle")
      setProgress(1)
    }
  }

  function reset() {
    controller.current?.abort()
    setStatus("idle")
    setProgress(1)
    setError("")
    setNotice("")
    inputRef.current?.focus()
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(node.code)
      setCopied(true)
      if (copyTimer.current) clearTimeout(copyTimer.current)
      copyTimer.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      setNotice(
        "Clipboard unavailable. You can select and copy the source directly."
      )
    }
  }
  function openBuilder() {
    document.getElementById("build")?.scrollIntoView({
      behavior: reducedMotion ? "instant" : "smooth",
      block: "start",
    })
    inputRef.current?.focus({ preventScroll: true })
  }

  return (
    <GeometricCopy>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <div className="site-shell">
        <header className="site-header">
          <a className="brand" href="#" aria-label="BestLang home">
            <Mark />
            <span>
              BestLang<span className="brand-dot">.</span>
            </span>
            <span className="version">α 0.0.1</span>
          </a>
          <nav aria-label="Main navigation">
            <a href="#philosophy">The philosophy</a>
            <a href="#human-support">Need a programmer?</a>
            <button onClick={() => setSpecOpen(true)}>
              Language spec <ArrowUpRight size={13} aria-hidden="true" />
            </button>
          </nav>
          <button className="header-cta" onClick={openBuilder}>
            Build something <ArrowUpRight size={16} aria-hidden="true" />
          </button>
        </header>

        <main id="main">
          <section className="hero" aria-labelledby="hero-heading">
            <div className="hero-kicker">
              <span className="status-dot" /> THE AUTONOMOUS PROGRAMMING
              LANGUAGE{" "}
              <span className="hero-coordinate">
                [ HUMAN EXPERTISE: REQUIRED ]
              </span>
            </div>
            <div className="hero-grid">
              <h1 id="hero-heading">
                <GeometricType text="Software writes itself." />
                <br />
                <GeometricType text="You stay " />
                <span className="essential">
                  <GeometricType text="essential" />
                  <span className="alignment-tick" aria-hidden="true">
                    +
                  </span>
                </span>
                <span className="end-dot">
                  <GeometricType text="." />
                </span>
              </h1>
              <div className="hero-aside">
                <span className="aside-index">A NEW ORDER OF OPERATIONS.</span>
                <p>
                  Infinite possibility.
                  <br />
                  Explicit human dependency.
                </p>
                <p className="hero-description">
                  Meet the language that turns your intent into systems. And
                  your expertise into the one thing they can’t run without.
                </p>
                <a href="#build" className="text-link">
                  See it build <ArrowDown size={15} aria-hidden="true" />
                </a>
              </div>
            </div>
            <div className="hero-baseline">
              <span>GLYPH CENTERS: ALIGNED / OPTICAL CORRECTIONS: 0</span>
              <span>
                DESIGNED FOR THE POST-AI ERA <span aria-hidden="true">↘</span>
              </span>
            </div>
          </section>

          <section
            className="builder"
            id="build"
            aria-labelledby="builder-heading"
          >
            <div className="section-topline">
              <div>
                <span className="section-index">01 /</span>
                <h2 id="builder-heading">
                  <GeometricType text="Intent → System" />
                </h2>
              </div>
              <span className="live-label">
                <span className="status-dot" /> INTERACTIVE ENVIRONMENT
              </span>
            </div>
            <form className="intent-form" ref={formRef} onSubmit={generate}>
              <div className="intent-label">
                <span className="mono-label">START WITH AN IDEA</span>
                <label htmlFor="system-prompt">What should we build?</label>
              </div>
              <div className="intent-entry">
                <div className="input-wrap">
                  <span className="prompt-chevron" aria-hidden="true">
                    ›
                  </span>
                  <textarea
                    ref={inputRef}
                    id="system-prompt"
                    value={prompt}
                    onChange={(e) => {
                      setPrompt(e.target.value)
                      setError("")
                    }}
                    placeholder="A global payment system that scales with my ambition…"
                    maxLength={500}
                    rows={2}
                    disabled={running}
                    aria-describedby={error ? "prompt-error" : "prompt-hint"}
                    aria-invalid={!!error}
                  />
                  <button
                    className="build-button"
                    type="submit"
                    disabled={running}
                  >
                    {running ? (
                      <Loader2 size={17} className="spin" aria-hidden="true" />
                    ) : (
                      <MoveUpRight size={19} aria-hidden="true" />
                    )}
                    <span>
                      {status === "loading"
                        ? "Thinking"
                        : status === "building"
                          ? "Building"
                          : "Build my system"}
                    </span>
                  </button>
                </div>
                <div className="preset-row">
                  <span id="prompt-hint">TRY AN INTENT:</span>
                  {presets.map((preset, i) => (
                    <button
                      type="button"
                      key={preset}
                      disabled={running}
                      onClick={() => {
                        setPrompt(preset)
                        setError("")
                        inputRef.current?.focus()
                      }}
                    >
                      {["Payments", "Marketplace", "Team CRM"][i]}{" "}
                      <ArrowUpRight size={11} aria-hidden="true" />
                    </button>
                  ))}
                  <span className="shortcut">⌘ / CTRL + ENTER</span>
                </div>
                {error && (
                  <p id="prompt-error" role="alert" className="form-error">
                    {error}
                  </p>
                )}
              </div>
            </form>

            <div className="workspace">
              <div className="visualization">
                <div className="scene-topline">
                  <span>
                    <span className="scene-cross" aria-hidden="true">
                      +
                    </span>{" "}
                    {status === "idle"
                      ? "REFERENCE ARCHITECTURE"
                      : architecture.name.toUpperCase()}
                  </span>
                  <span>WORLD / XYZ</span>
                </div>
                <SystemScene
                  architecture={architecture}
                  progress={progress}
                  selected={selected}
                  onSelect={(id) => {
                    setSelected(id)
                    setCopied(false)
                  }}
                  running={running}
                  reducedMotion={reducedMotion}
                />
                {status === "loading" && (
                  <div className="thinking-indicator" role="status">
                    <Loader2 size={16} className="spin" aria-hidden="true" />{" "}
                    Interpreting your intent
                    <span className="thinking-sub">
                      Establishing the shape of what comes next.
                    </span>
                  </div>
                )}
                <div className="scene-bottomline">
                  <span>
                    <span className="legend-square" /> AUTONOMOUS MODULE{" "}
                    <span className="legend-outline" /> EXPERT BOUNDARY
                  </span>
                  <span>
                    {architecture.nodes.length.toString().padStart(2, "0")}{" "}
                    NODES /{" "}
                    {architecture.edges.length.toString().padStart(2, "0")}{" "}
                    CONNECTIONS
                  </span>
                </div>
              </div>
              <aside className="inspector" aria-label="System inspector">
                <div className="inspector-tabs">
                  <button
                    className={tab === "overview" ? "active" : ""}
                    onClick={() => setTab("overview")}
                    aria-pressed={tab === "overview"}
                  >
                    <Layers3 size={13} aria-hidden="true" /> System
                  </button>
                  <button
                    className={tab === "source" ? "active" : ""}
                    onClick={() => setTab("source")}
                    aria-pressed={tab === "source"}
                  >
                    <Code2 size={14} aria-hidden="true" /> Source
                  </button>
                  <span>.best</span>
                </div>
                {tab === "overview" ? (
                  <div className="inspector-content">
                    <div className="inspector-heading">
                      <span className="mono-label">
                        {status === "idle"
                          ? "SYSTEM OVERVIEW"
                          : "BUILD MANIFEST"}
                      </span>
                      <span className="manifest-version">v0.0.1</span>
                    </div>
                    <h3>{architecture.name}</h3>
                    <p className="inspector-description">
                      Self-assembling architecture.
                      <br />
                      Human-governed by design.
                    </p>
                    <div className="module-list" aria-label="Select a module">
                      {architecture.nodes.map((n, i) => {
                        const ready =
                          progress >= (i + 1) / architecture.nodes.length
                        return (
                          <button
                            key={n.id}
                            className={selected === n.id ? "selected" : ""}
                            onClick={() => {
                              setSelected(n.id)
                              setCopied(false)
                            }}
                          >
                            <span className="module-number">
                              {String(i + 1).padStart(2, "0")}
                            </span>
                            <span>{n.label}</span>
                            {ready ? (
                              <Check size={12} aria-label="Generated" />
                            ) : (
                              <span className="module-pending">
                                {status === "loading" ? "·" : "…"}
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                    <button
                      className="view-code"
                      onClick={() => setTab("source")}
                    >
                      Inspect {node.label.toLowerCase()}{" "}
                      <ChevronRight size={14} aria-hidden="true" />
                    </button>
                  </div>
                ) : (
                  <div className="source-panel">
                    <div className="file-heading">
                      <span>{node.id}.best</span>
                      <button
                        onClick={copy}
                        aria-label={copied ? "Code copied" : "Copy module code"}
                      >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                    <p className="node-description">{node.description}</p>
                    <Code code={node.code} />
                    <div className="source-footnote">
                      BESTLANG / DRAFT SYNTAX
                      <br />
                      Intent resolves. Expertise executes.
                    </div>
                  </div>
                )}
              </aside>
            </div>
            <div className="build-status">
              <div role="status" aria-live="polite">
                <span className={`status-dot ${running ? "pulsing" : ""}`} />
                <span>
                  {status === "idle"
                    ? "Compiler ready. Your move."
                    : status === "done"
                      ? "Build complete. One dependency remains."
                      : `${stages[stage]}…`}
                </span>
                {mode && (
                  <span className="mode-tag">
                    {mode === "live"
                      ? "LIVE GENERATION"
                      : "LOCAL DEMONSTRATION"}
                  </span>
                )}
              </div>
              <div>
                {status === "building" && (
                  <button
                    onClick={() => {
                      setProgress(1)
                      setStatus("done")
                    }}
                  >
                    Skip to result <ChevronRight size={12} />
                  </button>
                )}
                {status === "loading" && (
                  <button onClick={reset}>
                    Cancel <X size={12} />
                  </button>
                )}
                <span>
                  {running
                    ? `${Math.floor(progress * 100)
                        .toString()
                        .padStart(3, "0")}%`
                    : "BESTLANG RUNTIME / α"}
                </span>
              </div>
            </div>
            {running && (
              <div
                className="build-progress"
                role="progressbar"
                aria-label="System generation"
                aria-valuenow={Math.round(progress * 100)}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <span style={{ width: `${Math.max(2, progress * 100)}%` }} />
              </div>
            )}
            {notice && (
              <p className="generation-notice" role="status">
                {notice}
              </p>
            )}
            {status === "done" && (
              <div className="completion">
                <div className="completion-icon">
                  <Check size={24} aria-hidden="true" />
                </div>
                <div>
                  <span className="mono-label">
                    BUILD SUCCESSFUL / 1 UNRESOLVED DEPENDENCY
                  </span>
                  <h3>
                    Your system is ready.
                    <br />
                    Please contact a programmer.
                  </h3>
                  <p>
                    Everything has been generated. Understanding, configuration,
                    and execution require human expertise.
                  </p>
                  <code>dependency::Programmer — cannot be automated</code>
                  <SystemDownload
                    architecture={architecture}
                    prompt={builtPrompt}
                    mode={mode}
                  />
                </div>
                <div className="completion-actions">
                  <a href="#human-support">
                    No programmer? We can help{" "}
                    <ArrowUpRight size={14} aria-hidden="true" />
                  </a>
                  <button onClick={reset}>
                    Build another system{" "}
                    <RotateCcw size={15} aria-hidden="true" />
                  </button>
                </div>
              </div>
            )}
          </section>

          <section
            className="principles"
            id="philosophy"
            aria-labelledby="philosophy-heading"
          >
            <div className="section-topline">
              <div>
                <span className="section-index">02 /</span>
                <h2 id="philosophy-heading">
                  <GeometricType text="Automation has a boundary." />
                </h2>
              </div>
              <span className="mono-label">THAT BOUNDARY IS YOU.</span>
            </div>
            <div className="principle-grid">
              {principles.map((p) => (
                <article key={p.number}>
                  <div className="principle-top">
                    <span>{p.number}</span>
                    <p.icon size={23} strokeWidth={1.4} aria-hidden="true" />
                  </div>
                  <h3>
                    <GeometricType text={p.title} />
                  </h3>
                  <p>{p.text}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="language-section" id="language">
            <div className="language-copy">
              <span className="mono-label">03 / EXPLICIT BY DESIGN</span>
              <h2>
                <GeometricType text="Self-writing code." />
                <br />
                <span>
                  <GeometricType text="Non-transferable intuition." />
                </span>
              </h2>
              <p>
                BestLang separates what a system can generate from what an
                expert must understand. Express intent. Encode boundaries. Keep
                the decisions that matter.
              </p>
              <button className="text-link" onClick={() => setSpecOpen(true)}>
                Explore the language{" "}
                <ArrowUpRight size={16} aria-hidden="true" />
              </button>
            </div>
            <div className="language-example">
              <div className="example-title">
                <span>
                  <span className="status-dot" /> hello_future.best
                </span>
                <span>BESTLANG / α</span>
              </div>
              <Code
                code={
                  'use best::{Intent, Expert};\n\n@autonomous\nsystem Future {\n  intent := "Build something extraordinary";\n  architecture := intent.materialize();\n\n  // Some dependencies are a feature.\n  run requires Expert;\n}'
                }
              />
              <div className="example-result">
                <CornerDownLeft size={14} aria-hidden="true" />
                <span>Code: generated.</span>
                <span>Programmer: essential.</span>
              </div>
            </div>
          </section>

          <section className="testimonials" aria-labelledby="voices-heading">
            <div className="section-topline">
              <div>
                <span className="section-index">04 /</span>
                <h2 id="voices-heading">The experts have spoken.</h2>
              </div>
              <span className="mono-label">
                FICTIONAL VOICES. FAMILIAR SENTIMENTS.
              </span>
            </div>
            <div className="testimonial-grid">
              {testimonials.map((testimonial, index) => (
                <figure key={testimonial.initials}>
                  <div className="quote-topline">
                    <Quote size={23} strokeWidth={1.3} aria-hidden="true" />
                    <span>EXPERT REPORT / 00{index + 1}</span>
                  </div>
                  <blockquote>“{testimonial.quote}”</blockquote>
                  <figcaption>
                    <span className="expert-avatar" aria-hidden="true">
                      {testimonial.initials}
                    </span>
                    <div>
                      <span className="expert-role">{testimonial.role}</span>
                      <span className="expert-specialty">
                        {testimonial.specialty}
                      </span>
                    </div>
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>

          <section
            className="human-support"
            id="human-support"
            aria-labelledby="support-heading"
          >
            <div className="support-copy">
              <span className="mono-label">
                05 / THE HUMAN DEPENDENCY, AS A SERVICE
              </span>
              <h2 id="support-heading">
                No programmer?
                <br />
                We’ll download it for you.
              </h2>
              <p>
                You brought the idea. BestLang brought the architecture. We
                bring someone who knows what to do with the download button. And
                everything after it.
              </p>
              <a className="support-phone" href="tel:7777777">
                <Phone size={22} strokeWidth={1.5} aria-hidden="true" />
                <span>777-77-77</span>
                <ArrowUpRight size={22} aria-hidden="true" />
              </a>
              <span className="support-caption">
                CALL A PROGRAMMER. RESOLVE YOUR FINAL DEPENDENCY.
              </span>
            </div>
            <div className="support-manifest">
              <div className="support-manifest-header">
                <span className="status-dot" /> HUMAN EXECUTION PLAN{" "}
                <span>3 STEPS / 1 EXPERT</span>
              </div>
              <ol>
                <li>
                  <span className="support-step">01</span>
                  <div>
                    <h3>We download it.</h3>
                    <p>The easy part. Still requires a programmer.</p>
                  </div>
                  <Check size={16} aria-hidden="true" />
                </li>
                <li>
                  <span className="support-step">02</span>
                  <div>
                    <h3>We understand it.</h3>
                    <p>Someone has to know why all those boxes connect.</p>
                  </div>
                  <Check size={16} aria-hidden="true" />
                </li>
                <li>
                  <span className="support-step">03</span>
                  <div>
                    <h3>We make it work.</h3>
                    <p>Your idea becomes our very human responsibility.</p>
                  </div>
                  <Check size={16} aria-hidden="true" />
                </li>
              </ol>
              <div className="support-manifest-footer">
                <code>dependency::Programmer</code>
                <span>AVAILABLE BY PHONE</span>
              </div>
            </div>
          </section>

          <section className="closing">
            <span className="mono-label">
              THE FUTURE IS AUTONOMOUS. THE EXPERTISE IS HUMAN.
            </span>
            <h2>
              <GeometricType text="Make yourself" />
              <br />
              <span>
                <GeometricType text="irreplaceable." />
              </span>
            </h2>
            <button onClick={openBuilder}>
              Build your first system{" "}
              <ArrowUpRight size={20} aria-hidden="true" />
            </button>
            <span className="closing-note">
              NO INSTALLATION. NO BOILERPLATE. ONE ESSENTIAL DEPENDENCY.
            </span>
          </section>
        </main>
        <footer>
          <a className="brand" href="#">
            <Mark small />
            BestLang.
          </a>
          <span>THE LANGUAGE OF HUMAN ADVANTAGE.</span>
          <span>
            UNDER DEVELOPMENT <span className="status-dot" />
          </span>
          <a href="#main">BACK TO TOP ↑</a>
        </footer>
      </div>
      <dialog
        ref={dialogRef}
        className="spec-dialog"
        onCancel={() => setSpecOpen(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setSpecOpen(false)
        }}
        aria-labelledby="spec-heading"
      >
        <div className="spec-header">
          <span className="mono-label">
            BESTLANG / LANGUAGE NOTES / α 0.0.1
          </span>
          <button
            onClick={() => setSpecOpen(false)}
            aria-label="Close language specification"
          >
            <X size={20} />
          </button>
        </div>
        <h2 id="spec-heading">
          A language with
          <br />a human boundary.
        </h2>
        <p>
          BestLang is an experimental, fictional language. This interactive
          preview generates illustrative architectures and draft syntax, not
          runnable or deployed applications.
        </p>
        <dl>
          <dt>01 — Intent</dt>
          <dd>
            Describe outcomes declaratively. The system resolves the
            implementation graph.
          </dd>
          <dt>02 — Contracts</dt>
          <dd>
            Every module exposes typed expectations. Generated does not mean
            unaccountable.
          </dd>
          <dt>03 — Expert boundaries</dt>
          <dd>
            Operational understanding is explicit. An <code>Expert</code> must
            resolve the final execution boundary.
          </dd>
        </dl>
        <Code
          code={
            'intent := "A better future";\nsystem := intent.materialize();\nsystem.run requires Expert;'
          }
        />
        <button
          className="build-button"
          onClick={() => {
            setSpecOpen(false)
            openBuilder()
          }}
        >
          <Play size={14} aria-hidden="true" /> Try the environment
        </button>
      </dialog>
    </GeometricCopy>
  )
}
