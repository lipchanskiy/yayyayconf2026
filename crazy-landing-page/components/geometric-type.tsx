"use client"

import {
  Children,
  Fragment,
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  type ReactNode,
} from "react"

// Center each glyph's actual ink bounds, retaining its natural advance width.
export default function GeometricType({ text }: { text: string }) {
  const run = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const element = run.current
    const context = document.createElement("canvas").getContext("2d")
    if (!element || !context) return
    let active = true
    const align = () => {
      if (!active) return
      const style = getComputedStyle(element)
      context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`
      context.fontKerning = "none"
      const reference = context.measureText("H")
      const center =
        (reference.actualBoundingBoxAscent -
          reference.actualBoundingBoxDescent) /
        2
      element.querySelectorAll<HTMLElement>(".type-glyph").forEach((glyph) => {
        const character = glyph.textContent || " "
        const metrics = context.measureText(character)
        const shift = character.trim()
          ? (metrics.actualBoundingBoxAscent -
              metrics.actualBoundingBoxDescent) /
              2 -
            center
          : 0
        glyph.style.setProperty("--glyph-shift", `${shift}px`)
      })
    }
    const observer = new ResizeObserver(align)
    observer.observe(element)
    document.fonts.ready.then(align)
    align()
    return () => {
      active = false
      observer.disconnect()
    }
  }, [text])

  return (
    <span className="geometric-type" ref={run}>
      <span className="sr-only">{text}</span>
      <span className="type-run" aria-hidden="true">
        {text.split(/(\s+)/).map((word, wordIndex) => (
          <span className="type-word" key={wordIndex}>
            {Array.from(word).map((character, index) => (
              <span className="type-glyph" key={index}>
                {character === " " ? "\u00a0" : character}
              </span>
            ))}
          </span>
        ))}
      </span>
    </span>
  )
}

// Transform React text children, leaving React in charge of the DOM and updates.
// Source code and native editing controls retain their original text nodes.
export function GeometricCopy({ children }: { children: ReactNode }) {
  function align(nodes: ReactNode): ReactNode {
    return Children.map(nodes, (child) => {
      if (typeof child === "string" || typeof child === "number") {
        const text = String(child)
        return text.trim() ? <GeometricType text={text} /> : child
      }
      if (
        !isValidElement<{
          children?: ReactNode
          "aria-hidden"?: boolean | "true" | "false"
          className?: string
        }>(child)
      )
        return child
      if (child.type !== Fragment && typeof child.type !== "string")
        return child
      if (
        typeof child.type === "string" &&
        [
          "pre",
          "code",
          "textarea",
          "input",
          "select",
          "option",
          "svg",
          "canvas",
        ].includes(child.type)
      )
        return child
      if (
        child.props["aria-hidden"] === true ||
        child.props["aria-hidden"] === "true" ||
        child.props.className?.split(" ").includes("sr-only")
      )
        return child
      if (child.props.children === undefined) return child
      return cloneElement(child, {}, align(child.props.children))
    })
  }
  return <>{align(children)}</>
}
