"use client"

import { useEffect, useId, useRef, useState } from "react"
import { Check, Download, LockKeyhole, X } from "lucide-react"
import type { Architecture } from "@/lib/architecture"
import { createSystemArchive } from "@/lib/system-archive"
import { GeometricCopy } from "@/components/geometric-type"

const questions = [
  {
    title:
      "A request times out after charging a customer. What makes retrying safe?",
    options: [
      "Increase the timeout and hope",
      "Reuse an idempotency key for the same operation",
      "Send the charge twice to be certain",
    ],
    answer: 1,
  },
  {
    title:
      "Two workers read the same counter, increment it, and write it back. How do you prevent a lost update?",
    options: [
      "Use an atomic increment or a transaction with appropriate locking",
      "Add a longer comment explaining the counter",
      "Make both workers run faster",
    ],
    answer: 0,
  },
  {
    title: "In JavaScript, what does this expression evaluate to?",
    code: "[0, 1, 2].map(n => n * 2).filter(n => n > 1)",
    options: ["[0, 2, 4]", "[2]", "[2, 4]"],
    answer: 2,
  },
]

export default function SystemDownload({
  architecture,
  prompt,
  mode,
}: {
  architecture: Architecture
  prompt: string
  mode: string | null
}) {
  const [open, setOpen] = useState(false)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [attempted, setAttempted] = useState(false)
  const [verified, setVerified] = useState(false)
  const [error, setError] = useState("")
  const dialog = useRef<HTMLDialogElement>(null)
  const feedback = useRef<HTMLParagraphElement>(null)
  const id = useId()

  useEffect(() => {
    if (open) dialog.current?.showModal()
    else dialog.current?.close()
  }, [open])

  function download() {
    try {
      const blob = createSystemArchive(architecture, prompt, mode)
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = "bestlang-system.tar"
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 30_000)
      setError("")
    } catch {
      setError(
        "The archive could not be prepared. Please try downloading again."
      )
    }
  }

  function verify(event: React.FormEvent) {
    event.preventDefault()
    setAttempted(true)
    if (questions.every((q, i) => answers[i] === q.answer)) {
      setVerified(true)
      setError("")
    } else {
      setError(
        "Expert boundary unresolved. Review the highlighted questions and try again."
      )
      requestAnimationFrame(() => feedback.current?.focus())
    }
  }

  return (
    <GeometricCopy>
      <div className="download-access">
        <button className="download-trigger" onClick={() => setOpen(true)}>
          <LockKeyhole size={15} aria-hidden="true" /> Download system{" "}
          <Download size={15} aria-hidden="true" />
        </button>
        <span>Only a programmer can download and run this system.</span>
      </div>
      <dialog
        ref={dialog}
        className="spec-dialog programmer-dialog"
        aria-labelledby={`${id}-title`}
        onCancel={() => setOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) setOpen(false)
        }}
      >
        <div className="spec-header">
          <span className="mono-label">
            ACCESS CONTROL / HUMAN DEPENDENCY CHECK
          </span>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close programmer verification"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        {verified ? (
          <div className="verification-success">
            <span className="verification-badge">
              <Check size={20} aria-hidden="true" /> EXPERT BOUNDARY RESOLVED
            </span>
            <h2 id={`${id}-title`}>
              Programmer detected.
              <br />
              Responsibility transferred.
            </h2>
            <p>
              Your system is ready for someone who knows what to do with it.
            </p>
            <div className="archive-contents">
              <span>{architecture.nodes.length} × .best modules</span>
              <span>architecture.json</span>
              <span>README + human-required runbook</span>
            </div>
            <button className="build-button" onClick={download}>
              <Download size={16} aria-hidden="true" /> Download
              bestlang-system.tar
            </button>
            <p className="archive-disclosure">
              An architecture and source bundle. BestLang is fictional; the
              included modules require human implementation in a real runtime.
            </p>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
          </div>
        ) : (
          <>
            <h2 id={`${id}-title`}>
              Prove you’re the
              <br />
              missing dependency.
            </h2>
            <p>
              Only a programmer can download and run this system. Resolve these
              three expert boundaries to unlock your source bundle.
            </p>
            <form onSubmit={verify} className="programmer-test">
              {questions.map((question, index) => {
                const wrong = attempted && answers[index] !== question.answer
                return (
                  <fieldset
                    key={index}
                    className={wrong ? "question-unresolved" : ""}
                    aria-describedby={
                      wrong ? `${id}-unresolved-${index}` : undefined
                    }
                  >
                    <legend>
                      <span>{String(index + 1).padStart(2, "0")} / </span>
                      {question.title}
                    </legend>
                    {question.code && (
                      <pre className="question-code">
                        <code>{question.code}</code>
                      </pre>
                    )}
                    {question.options.map((option, optionIndex) => (
                      <label key={optionIndex}>
                        <input
                          type="radio"
                          name={`${id}-question-${index}`}
                          value={optionIndex}
                          checked={answers[index] === optionIndex}
                          onChange={() =>
                            setAnswers((previous) => ({
                              ...previous,
                              [index]: optionIndex,
                            }))
                          }
                          required
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                    {wrong && (
                      <span
                        className="question-error"
                        id={`${id}-unresolved-${index}`}
                      >
                        Unresolved — check your answer.
                      </span>
                    )}
                  </fieldset>
                )
              })}
              {error && (
                <p
                  className="form-error"
                  ref={feedback}
                  tabIndex={-1}
                  role="alert"
                >
                  {error}
                </p>
              )}
              <button className="build-button" type="submit">
                <LockKeyhole size={15} aria-hidden="true" /> Verify programmer
                access
              </button>
              <p className="test-footnote">
                Automated code. Manual accountability.
              </p>
            </form>
          </>
        )}
      </dialog>
    </GeometricCopy>
  )
}
